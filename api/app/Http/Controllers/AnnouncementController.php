<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    /**
     * Get recent announcements
     */
    public function index(Request $request)
    {
        $announcements = Announcement::orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        return response()->json($announcements);
    }

    /**
     * Post new manual announcement (Líder only)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $groupId = config('tenant.group_id');

        $role = DB::table('group_user')
            ->where('user_id', $user->id)
            ->where('group_id', $groupId)
            ->value('role');

        if ($user->account_type !== 'superadmin' && $role !== 'Líder') {
            return response()->json(['message' => 'No autorizado para publicar anuncios.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
            'type' => 'required|string|in:blue,green,purple',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $announcement = Announcement::create([
            'group_id' => $groupId,
            'text' => $request->input('text'),
            'type' => $request->input('type'),
        ]);

        return response()->json($announcement, 201);
    }
}
