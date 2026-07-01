<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminController extends Controller
{
    /**
     * Helper to ensure the request is from a Super Admin
     */
    private function checkSuperAdmin(Request $request)
    {
        if ($request->user()->account_type !== 'superadmin') {
            abort(response()->json(['message' => 'No autorizado. Se requieren privilegios de Super Admin.'], 403));
        }
    }

    /**
     * List all users (except superadmin)
     */
    public function indexPendingLeaders(Request $request)
    {
        $this->checkSuperAdmin($request);

        $users = User::with('groups')
            ->where('account_type', '!=', 'superadmin')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Approve user registration (Legacy fallback)
     */
    public function approveLeader(Request $request, $id)
    {
        $this->checkSuperAdmin($request);

        $user = User::where('account_type', '!=', 'superadmin')
            ->findOrFail($id);

        $user->status = 'active';
        $user->save();

        return response()->json([
            'message' => "El usuario \"{$user->name} {$user->lastname}\" está activo."
        ]);
    }

    /**
     * Reject user registration (Legacy fallback)
     */
    public function rejectLeader(Request $request, $id)
    {
        $this->checkSuperAdmin($request);

        $user = User::where('account_type', '!=', 'superadmin')
            ->findOrFail($id);

        $user->status = 'rejected';
        $user->save();

        return response()->json([
            'message' => "El registro del usuario \"{$user->name} {$user->lastname}\" ha sido rechazado."
        ]);
    }

    /**
     * Block user access globally
     */
    public function blockLeader(Request $request, $id)
    {
        $this->checkSuperAdmin($request);

        $user = User::where('account_type', '!=', 'superadmin')
            ->findOrFail($id);

        $user->status = 'blocked';
        $user->save();

        return response()->json([
            'message' => "El usuario \"{$user->name} {$user->lastname}\" ha sido bloqueado."
        ]);
    }

    /**
     * Unblock/Re-activate user access globally
     */
    public function unblockLeader(Request $request, $id)
    {
        $this->checkSuperAdmin($request);

        $user = User::where('account_type', '!=', 'superadmin')
            ->findOrFail($id);

        $user->status = 'active';
        $user->save();

        return response()->json([
            'message' => "El usuario \"{$user->name} {$user->lastname}\" ha sido desbloqueado."
        ]);
    }

    /**
     * Reset user password globally with random temporary key
     */
    public function resetLeaderPassword(Request $request, $id)
    {
        $this->checkSuperAdmin($request);

        $user = User::where('account_type', '!=', 'superadmin')
            ->findOrFail($id);

        // Generate 8 character alphanumeric random password
        $temporaryPassword = Str::random(8);

        $user->password = Hash::make($temporaryPassword);
        $user->must_change_password = true;
        $user->save();

        return response()->json([
            'message' => "La contraseña del usuario \"{$user->name} {$user->lastname}\" ha sido restablecida.",
            'temporary_password' => $temporaryPassword
        ]);
    }
}
