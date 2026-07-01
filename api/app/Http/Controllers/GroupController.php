<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    /**
     * Get all groups for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->account_type === 'superadmin') {
            // Superadmin has access to view all groups on the platform
            $groups = Group::all();
            return response()->json($groups);
        }

        $groups = $user->groups()->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'invite_code' => $group->invite_code,
                'role' => $group->pivot->role,
            ];
        });

        return response()->json($groups);
    }

    /**
     * Create a new Group
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Generate unique 6-digit numeric invite code
        do {
            $inviteCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (Group::where('invite_code', $inviteCode)->exists());

        DB::beginTransaction();
        try {
            $group = Group::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'invite_code' => $inviteCode,
                'created_by' => $user->id,
            ]);

            // Associate current user as group Leader
            $group->users()->attach($user->id, ['role' => 'Líder']);

            // Insert default musical roles for this group
            $defaultRoles = ["Líder", "Voz Principal", "Coros", "Guitarra Acústica", "Guitarra Eléctrica", "Teclado", "Bajo", "Batería", "Sonido / Multimedia"];
            foreach ($defaultRoles as $r) {
                GroupRole::create([
                    'group_id' => $group->id,
                    'name' => $r
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Grupo musical creado correctamente.',
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'invite_code' => $group->invite_code,
                    'role' => 'Líder'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el grupo.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Join an existing Group via invite code
     */
    public function join(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invite_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $code = $request->input('invite_code');

        $group = Group::where('invite_code', $code)->first();

        if (!$group) {
            return response()->json(['message' => 'El código de invitación ingresado es incorrecto.'], 404);
        }

        // Check if user is already a member of this group
        $alreadyMember = $group->users()->where('user_id', $user->id)->exists();
        if ($alreadyMember) {
            return response()->json(['message' => 'Ya eres miembro de este grupo musical.'], 400);
        }

        // Join as basic member initially (empty role till leader assigns one)
        $group->users()->attach($user->id, ['role' => '']);

        return response()->json([
            'message' => 'Te has unido al grupo con éxito.',
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'invite_code' => $group->invite_code,
                'role' => ''
            ]
        ]);
    }

    /**
     * Regenerate group invite code (Líder only)
     */
    public function resetInviteCode(Request $request, $id)
    {
        $user = $request->user();
        $group = Group::findOrFail($id);

        // Verify leader role or superadmin account type
        $role = DB::table('group_user')
            ->where('user_id', $user->id)
            ->where('group_id', $group->id)
            ->value('role');

        if ($user->account_type !== 'superadmin' && $role !== 'Líder') {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        // Generate unique 6-digit numeric invite code
        do {
            $inviteCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (Group::where('invite_code', $inviteCode)->exists());

        $group->invite_code = $inviteCode;
        $group->save();

        return response()->json([
            'message' => 'Código de invitación regenerado correctamente.',
            'invite_code' => $inviteCode
        ]);
    }
}
