<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SuggestionController extends Controller
{
    /**
     * Get suggestions list with vote state mapped
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $suggestions = Suggestion::with(['suggestedBy', 'voters'])
            ->withCount('voters')
            ->orderBy('voters_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($s) use ($user) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'artist' => $s->artist,
                    'notes' => $s->notes,
                    'url' => $s->url,
                    'suggested_by' => [
                        'id' => $s->suggestedBy->id,
                        'name' => $s->suggestedBy->name,
                        'lastname' => $s->suggestedBy->lastname,
                    ],
                    'status' => $s->status,
                    'votes_count' => $s->voters_count,
                    'has_voted' => $s->voters->contains($user->id),
                ];
            });

        return response()->json($suggestions);
    }

    /**
     * Store new suggestion
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');
        $user = $request->user();

        $suggestion = Suggestion::create([
            'group_id' => $groupId,
            'title' => $request->input('title'),
            'artist' => $request->input('artist'),
            'notes' => $request->input('notes'),
            'url' => $request->input('url'),
            'suggested_by' => $user->id,
            'status' => 'pendiente',
        ]);

        // Auto-vote for your own suggestion
        $suggestion->voters()->attach($user->id);

        // Post announcement
        DB::table('announcements')->insert([
            'group_id' => $groupId,
            'text' => "{$user->name} sugirió la canción: \"{$suggestion->title}\" de {$suggestion->artist}.",
            'type' => 'purple',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Sugerencia propuesta correctamente.',
            'suggestion' => $suggestion
        ], 201);
    }

    /**
     * Toggle Vote unique state (heart)
     */
    public function vote(Request $request, $id)
    {
        $suggestion = Suggestion::findOrFail($id);
        $userId = $request->user()->id;

        $hasVoted = $suggestion->voters()->where('user_id', $userId)->exists();

        if ($hasVoted) {
            $suggestion->voters()->detach($userId);
            $voted = false;
        } else {
            $suggestion->voters()->attach($userId);
            $voted = true;
        }

        $votesCount = $suggestion->voters()->count();

        return response()->json([
            'has_voted' => $voted,
            'votes_count' => $votesCount,
            'message' => $voted ? 'Voto registrado.' : 'Voto eliminado.'
        ]);
    }

    /**
     * Change status (ensayo, agregada, etc.) (Líder only)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $groupId = config('tenant.group_id');
        
        $role = DB::table('group_user')
            ->where('user_id', $user->id)
            ->where('group_id', $groupId)
            ->value('role');

        if ($user->account_type !== 'superadmin' && $role !== 'Líder') {
            return response()->json(['message' => 'No autorizado para cambiar el estado de las sugerencias.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pendiente,ensayo,agregada',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $suggestion = Suggestion::findOrFail($id);
        $suggestion->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'message' => 'Estado de la propuesta actualizado.',
            'suggestion' => $suggestion
        ]);
    }
}
