<?php

namespace App\Http\Controllers;

use App\Models\Setlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SetlistController extends Controller
{
    private function hasSetlistPermissions(Request $request)
    {
        $user = $request->user();
        if ($user->account_type === 'superadmin') return true;

        $groupId = config('tenant.group_id');
        $role = DB::table('group_user')
            ->where('user_id', $user->id)
            ->where('group_id', $groupId)
            ->value('role');

        return $role === 'Líder';
    }

    /**
     * Get setlists list with related songs included
     */
    public function index(Request $request)
    {
        $setlists = Setlist::with('songs')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($setlists);
    }

    /**
     * Store new setlist
     */
    public function store(Request $request)
    {
        if (!$this->hasSetlistPermissions($request)) {
            return response()->json(['message' => 'No autorizado para crear repertorios.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'songs' => 'required|array',
            'songs.*' => 'exists:songs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');
        $user = $request->user();

        DB::beginTransaction();
        try {
            $setlist = Setlist::create([
                'group_id' => $groupId,
                'name' => $request->input('name'),
                'date' => $request->input('date'),
                'description' => $request->input('description'),
                'created_by' => $user->id,
            ]);

            // Sync songs with order
            $syncData = [];
            foreach ($request->input('songs') as $index => $songId) {
                $syncData[$songId] = ['sort_order' => $index];
            }
            $setlist->songs()->sync($syncData);

            // Post announcement
            DB::table('announcements')->insert([
                'group_id' => $groupId,
                'text' => "Se ha creado el repertorio \"{$setlist->name}\" para el día {$setlist->date}.",
                'type' => 'blue',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Repertorio creado exitosamente.',
                'setlist' => $setlist->load('songs')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar repertorio.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update existing setlist
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasSetlistPermissions($request)) {
            return response()->json(['message' => 'No autorizado para editar repertorios.'], 403);
        }

        $setlist = Setlist::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'songs' => 'required|array',
            'songs.*' => 'exists:songs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $setlist->update([
                'name' => $request->input('name'),
                'date' => $request->input('date'),
                'description' => $request->input('description'),
            ]);

            // Sync songs with sort order
            $syncData = [];
            foreach ($request->input('songs') as $index => $songId) {
                $syncData[$songId] = ['sort_order' => $index];
            }
            $setlist->songs()->sync($syncData);

            DB::commit();

            return response()->json([
                'message' => 'Repertorio actualizado correctamente.',
                'setlist' => $setlist->load('songs')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar repertorio.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete setlist
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->hasSetlistPermissions($request)) {
            return response()->json(['message' => 'No autorizado para eliminar repertorios.'], 403);
        }

        $setlist = Setlist::findOrFail($id);
        $setlist->delete();

        return response()->json(['message' => 'Repertorio eliminado con éxito.']);
    }
}
