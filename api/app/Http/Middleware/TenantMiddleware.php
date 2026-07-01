<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $groupId = $request->header('X-Group-Id');

        if ($groupId) {
            $user = $request->user();
            
            if ($user) {
                // Superadmin bypasses group membership checks
                if ($user->account_type === 'superadmin') {
                    config(['tenant.group_id' => (int)$groupId]);
                    return $next($request);
                }

                // Verify user belongs to the requested group
                $isMember = DB::table('group_user')
                    ->where('user_id', $user->id)
                    ->where('group_id', $groupId)
                    ->exists();

                if (!$isMember) {
                    return response()->json([
                        'message' => 'No tienes acceso a este grupo musical.'
                    ], 403);
                }

                config(['tenant.group_id' => (int)$groupId]);
            }
        }

        return $next($request);
    }
}
