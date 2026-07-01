<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    /**
     * Check if authenticated user is the leader of the active group
     */
    private function isLeader(Request $request)
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
     * List members of the active group
     */
    public function index(Request $request)
    {
        $groupId = config('tenant.group_id');
        if (!$groupId) {
            return response()->json(['message' => 'Grupo activo no especificado.'], 400);
        }

        $relations = DB::table('group_user')
            ->where('group_id', $groupId)
            ->get();

        $userIds = $relations->pluck('user_id');
        
        $users = User::whereIn('id', $userIds)
            ->where('account_type', '!=', 'superadmin')
            ->get()
            ->map(function ($u) use ($relations) {
                $rel = $relations->firstWhere('user_id', $u->id);
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'lastname' => $u->lastname,
                    'email' => $u->email,
                    'username' => $u->username,
                    'avatar' => ($u->avatar && $u->avatar !== '0' && $u->avatar !== 'null') ? asset('storage/' . $u->avatar) : null,
                    'role' => $rel ? $rel->role : '',
                ];
            });

        return response()->json($users);
    }

    /**
     * Add new member to the active group (Líder only)
     */
    public function store(Request $request)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'role' => 'required|string',
            'system_role' => 'required|string|in:leader,member',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'name' => $request->input('name'),
                'lastname' => $request->input('lastname'),
                'email' => $request->input('email'),
                'username' => ltrim($request->input('username'), '@'),
                'password' => Hash::make($request->input('password')),
                'account_type' => $request->input('system_role'),
                'status' => 'active',
                'must_change_password' => true, // force reset on first login
            ]);

            // Associate with group
            $finalRole = $request->input('system_role') === 'leader' ? 'Líder' : $request->input('role');
            DB::table('group_user')->insert([
                'user_id' => $user->id,
                'group_id' => $groupId,
                'role' => $finalRole,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Integrante agregado con éxito.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $finalRole
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al agregar integrante.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Edit existing group member details (Líder only)
     */
    public function update(Request $request, $id)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        $user = User::findOrFail($id);
        $groupId = config('tenant.group_id');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'role' => 'required|string',
            'system_role' => 'required|string|in:leader,member',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate protected Líder
        $currentRole = DB::table('group_user')
            ->where('user_id', $user->id)
            ->where('group_id', $groupId)
            ->value('role');

        if ($currentRole === 'Líder' && $request->input('system_role') !== 'leader') {
            return response()->json(['message' => 'No se puede remover el rol de Líder protegido.'], 400);
        }

        DB::beginTransaction();
        try {
            $user->update([
                'name' => $request->input('name'),
                'lastname' => $request->input('lastname'),
                'username' => ltrim($request->input('username'), '@'),
                'email' => $request->input('email'),
                'account_type' => $request->input('system_role'),
            ]);

            $finalRole = $request->input('system_role') === 'leader' ? 'Líder' : $request->input('role');
            
            DB::table('group_user')
                ->where('user_id', $user->id)
                ->where('group_id', $groupId)
                ->update(['role' => $finalRole]);

            DB::commit();

            return response()->json(['message' => 'Datos del integrante actualizados.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al editar miembro.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove member from the active group (Líder only)
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        $groupId = config('tenant.group_id');

        $role = DB::table('group_user')
            ->where('user_id', $id)
            ->where('group_id', $groupId)
            ->value('role');

        if ($role === 'Líder') {
            return response()->json(['message' => 'No se puede eliminar a un Líder protegido del grupo.'], 400);
        }

        DB::table('group_user')
            ->where('user_id', $id)
            ->where('group_id', $groupId)
            ->delete();

        return response()->json(['message' => 'Miembro removido del grupo musical.']);
    }

    /**
     * Force reset member password to a temporary one (Líder only)
     */
    public function resetPassword(Request $request, $id)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        $user = User::findOrFail($id);

        // Generate random 8-character temporary password
        $temporaryPassword = \Illuminate\Support\Str::random(8);

        $user->password = Hash::make($temporaryPassword);
        $user->must_change_password = true; // force reset
        $user->save();

        return response()->json([
            'message' => "La contraseña del integrante \"{$user->name} {$user->lastname}\" ha sido restablecida con éxito.",
            'temporary_password' => $temporaryPassword
        ]);
    }

    /**
     * Get musical roles of the active group
     */
    public function roles(Request $request)
    {
        $groupId = config('tenant.group_id');
        $roles = GroupRole::where('group_id', $groupId)->pluck('name');
        return response()->json($roles);
    }

    /**
     * Add customizable musical role to group (Líder only)
     */
    public function addRole(Request $request)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $groupId = config('tenant.group_id');
        $name = trim($request->input('name'));

        $exists = GroupRole::where('group_id', $groupId)->where('name', $name)->exists();
        if ($exists) {
            return response()->json(['message' => 'Este rol ya existe en la banda.'], 400);
        }

        GroupRole::create([
            'group_id' => $groupId,
            'name' => $name,
        ]);

        return response()->json(['message' => 'Rol musical agregado.'], 201);
    }

    /**
     * Delete customized role from group (Líder only)
     */
    public function deleteRole(Request $request, $name)
    {
        if (!$this->isLeader($request)) {
            return response()->json(['message' => 'No autorizado para realizar esta acción.'], 403);
        }

        if ($name === 'Líder') {
            return response()->json(['message' => 'El rol de Líder es protegido y no se puede eliminar.'], 400);
        }

        $groupId = config('tenant.group_id');
        
        GroupRole::where('group_id', $groupId)
            ->where('name', $name)
            ->delete();

        return response()->json(['message' => 'Rol musical eliminado.']);
    }
}
