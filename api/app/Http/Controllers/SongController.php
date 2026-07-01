<?php

namespace App\Http\Controllers;

use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SongController extends Controller
{
    /**
     * Check if user has permission to edit catalog (Líder only)
     */
    private function hasCatalogPermissions(Request $request)
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
     * Get group songs catalog list
     */
    public function index(Request $request)
    {
        $songs = Song::orderBy('title', 'asc')->get();
        return response()->json($songs);
    }

    /**
     * Store new song in catalog
     */
    public function store(Request $request)
    {
        if (!$this->hasCatalogPermissions($request)) {
            return response()->json(['message' => 'No autorizado para editar el catálogo de canciones.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'key' => 'required|string|max:10',
            'content' => 'required|string',
            'url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');
        $user = $request->user();

        $song = Song::create([
            'group_id' => $groupId,
            'title' => $request->input('title'),
            'artist' => $request->input('artist'),
            'key' => $request->input('key'),
            'content' => $request->input('content'),
            'url' => $request->input('url'),
            'created_by' => $user->id,
        ]);

        // Post announcement
        DB::table('announcements')->insert([
            'group_id' => $groupId,
            'text' => "{$user->name} añadió una nueva canción: \"{$song->title}\" de {$song->artist}.",
            'type' => 'blue',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Canción agregada con éxito.',
            'song' => $song
        ], 201);
    }

    /**
     * Update existing catalog song
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasCatalogPermissions($request)) {
            return response()->json(['message' => 'No autorizado para editar el catálogo de canciones.'], 403);
        }

        $song = Song::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'key' => 'required|string|max:10',
            'content' => 'required|string',
            'url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $song->update([
            'title' => $request->input('title'),
            'artist' => $request->input('artist'),
            'key' => $request->input('key'),
            'content' => $request->input('content'),
            'url' => $request->input('url'),
        ]);

        return response()->json([
            'message' => 'Canción actualizada correctamente.',
            'song' => $song
        ]);
    }

    /**
     * Delete catalog song
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->hasCatalogPermissions($request)) {
            return response()->json(['message' => 'No autorizado para borrar del catálogo.'], 403);
        }

        $song = Song::findOrFail($id);
        $song->delete();

        return response()->json(['message' => 'Canción eliminada del catálogo.']);
    }
}
