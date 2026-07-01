<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    private function hasEventPermissions(Request $request)
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
     * Get events list
     */
    public function index(Request $request)
    {
        $events = Event::with(['setlist.songs', 'musicians'])
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return response()->json($events);
    }

    /**
     * Store a new scheduled event (Líder only)
     */
    public function store(Request $request)
    {
        if (!$this->hasEventPermissions($request)) {
            return response()->json(['message' => 'No autorizado para programar eventos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:ensayo,culto,concierto,especial,otro',
            'date' => 'required|date',
            'time' => 'required|string', // HH:MM
            'description' => 'nullable|string',
            'setlist_id' => 'nullable|exists:setlists,id',
            'musicians' => 'nullable|array',
            'musicians.*.user_id' => 'required|exists:users,id',
            'musicians.*.role' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');
        $user = $request->user();

        DB::beginTransaction();
        try {
            $event = Event::create([
                'group_id' => $groupId,
                'name' => $request->input('name'),
                'type' => $request->input('type'),
                'date' => $request->input('date'),
                'time' => $request->input('time'),
                'description' => $request->input('description'),
                'setlist_id' => $request->input('setlist_id'),
                'created_by' => $user->id,
            ]);

            // Sync musicians roster
            if ($request->has('musicians')) {
                $musiciansData = [];
                foreach ($request->input('musicians') as $m) {
                    $musiciansData[$m['user_id']] = ['role' => $m['role']];
                }
                $event->musicians()->sync($musiciansData);
            }

            // Post announcement
            $types = ['ensayo' => 'un ensayo', 'concierto' => 'un concierto/show', 'culto' => 'un culto/servicio', 'especial' => 'un evento especial', 'otro' => 'un evento'];
            $eventDesc = $types[$event->type] ?? 'un evento';
            DB::table('announcements')->insert([
                'group_id' => $groupId,
                'text' => "Se programó {$eventDesc}: \"{$event->name}\" para el día {$event->date} a las {$event->time}.",
                'type' => 'green',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Evento programado correctamente.',
                'event' => $event->load(['setlist', 'musicians'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al programar evento.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update existing event
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasEventPermissions($request)) {
            return response()->json(['message' => 'No autorizado para editar eventos.'], 403);
        }

        $event = Event::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:ensayo,culto,concierto,especial,otro',
            'date' => 'required|date',
            'time' => 'required|string',
            'description' => 'nullable|string',
            'setlist_id' => 'nullable|exists:setlists,id',
            'musicians' => 'nullable|array',
            'musicians.*.user_id' => 'required|exists:users,id',
            'musicians.*.role' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $event->update([
                'name' => $request->input('name'),
                'type' => $request->input('type'),
                'date' => $request->input('date'),
                'time' => $request->input('time'),
                'description' => $request->input('description'),
                'setlist_id' => $request->input('setlist_id'),
            ]);

            // Sync musicians roster
            if ($request->has('musicians')) {
                $musiciansData = [];
                foreach ($request->input('musicians') as $m) {
                    $musiciansData[$m['user_id']] = ['role' => $m['role']];
                }
                $event->musicians()->sync($musiciansData);
            } else {
                $event->musicians()->detach();
            }

            DB::commit();

            return response()->json([
                'message' => 'Evento actualizado correctamente.',
                'event' => $event->load(['setlist', 'musicians'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar evento.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete scheduled event
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->hasEventPermissions($request)) {
            return response()->json(['message' => 'No autorizado para eliminar eventos.'], 403);
        }

        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Evento cancelado y eliminado.']);
    }
}
