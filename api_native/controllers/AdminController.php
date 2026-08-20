<?php
/**
 * Superadmin Management Controller for Levare API
 * Native PHP with PDO
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

class AdminController {

    /**
     * Get all platform users with group details
     * GET /admin/users or GET /superadmin/requests
     */
    public static function users(): void {
        $currentUser = requireAuth();

        if (($currentUser['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado. Se requieren privilegios de Super Administrador.'], 403);
        }

        $pdo = DB::getConnection();

        try {
            // Fetch all users
            $stmtUsers = $pdo->query("
                SELECT 
                    u.id,
                    u.name,
                    u.lastname,
                    u.username,
                    u.email,
                    u.account_type,
                    u.status,
                    u.must_change_password,
                    u.accent_color,
                    u.avatar,
                    u.created_at,
                    u.updated_at
                FROM users u
                ORDER BY u.id DESC
            ");
            $users = $stmtUsers->fetchAll();

            // Fetch group memberships for all users
            $stmtGroups = $pdo->query("
                SELECT 
                    gu.user_id,
                    g.id AS group_id,
                    g.name AS group_name,
                    gu.role AS musical_role
                FROM group_user gu
                INNER JOIN `groups` g ON gu.group_id = g.id
            ");
            $groupRows = $stmtGroups->fetchAll();

            // Index groups by user_id
            $userGroupsMap = [];
            foreach ($groupRows as $row) {
                $uid = (int)$row['user_id'];
                if (!isset($userGroupsMap[$uid])) {
                    $userGroupsMap[$uid] = [];
                }
                $userGroupsMap[$uid][] = [
                    'group_id'     => (int)$row['group_id'],
                    'group_name'   => $row['group_name'],
                    'role'         => $row['musical_role'] ?? 'Miembro'
                ];
            }


            // Assemble final collection
            $result = array_map(function ($u) use ($userGroupsMap) {
                $uid = (int)$u['id'];
                $u['id'] = $uid;
                $u['groups'] = $userGroupsMap[$uid] ?? [];
                $u['accentColor'] = $u['accent_color'] ?? 'purple';
                return $u;
            }, $users);

            jsonResponse($result);

        } catch (\Throwable $e) {
            error_log("Error in AdminController::users: " . $e->getMessage());
            jsonResponse(['message' => 'Fallo al consultar el directorio de usuarios.'], 500);
        }
    }

    /**
     * Block a user from accessing the platform
     * POST /superadmin/users/{id}/block
     */
    public static function block(int $id): void {
        $currentUser = requireAuth();

        if (($currentUser['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado.'], 403);
        }

        if ((int)$currentUser['id'] === $id) {
            jsonResponse(['message' => 'No puedes bloquear tu propia cuenta de Super Administrador.'], 400);
        }

        $pdo = DB::getConnection();

        try {
            $stmt = $pdo->prepare("UPDATE users SET status = 'blocked', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                // Check if user exists
                $check = $pdo->prepare("SELECT id FROM users WHERE id = ?");
                $check->execute([$id]);
                if (!$check->fetch()) {
                    jsonResponse(['message' => 'Usuario no encontrado.'], 404);
                }
            }

            // Revoke all active session tokens for this user
            try {
                $stmtTokens = $pdo->prepare("DELETE FROM personal_access_tokens WHERE tokenable_id = ?");
                $stmtTokens->execute([$id]);
            } catch (\Throwable $te) {
                // Non-fatal if table not present
            }

            jsonResponse(['message' => 'Usuario bloqueado correctamente. Sus sesiones han sido cerradas.']);

        } catch (\Throwable $e) {
            error_log("Error in AdminController::block: " . $e->getMessage());
            jsonResponse(['message' => 'Fallo al bloquear el usuario.'], 500);
        }
    }

    /**
     * Unblock a user
     * POST /superadmin/users/{id}/unblock
     */
    public static function unblock(int $id): void {
        $currentUser = requireAuth();

        if (($currentUser['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado.'], 403);
        }

        $pdo = DB::getConnection();

        try {
            $stmt = $pdo->prepare("UPDATE users SET status = 'active', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                $check = $pdo->prepare("SELECT id FROM users WHERE id = ?");
                $check->execute([$id]);
                if (!$check->fetch()) {
                    jsonResponse(['message' => 'Usuario no encontrado.'], 404);
                }
            }

            jsonResponse(['message' => 'Usuario desbloqueado correctamente. Ya puede iniciar sesión.']);

        } catch (\Throwable $e) {
            error_log("Error in AdminController::unblock: " . $e->getMessage());
            jsonResponse(['message' => 'Fallo al desbloquear el usuario.'], 500);
        }
    }

    /**
     * Reset user password and return temporary plaintext password
     * POST /superadmin/users/{id}/reset-password
     */
    public static function resetPassword(int $id): void {
        $currentUser = requireAuth();

        if (($currentUser['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado.'], 403);
        }

        $pdo = DB::getConnection();

        try {
            $stmt = $pdo->prepare("SELECT id, name, lastname, username, email FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch();

            if (!$user) {
                jsonResponse(['message' => 'Usuario no encontrado.'], 404);
            }

            // Generate secure random temporary password (e.g. Lev-89241 or 8 chars)
            $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            $randomPart = '';
            for ($i = 0; $i < 6; $i++) {
                $randomPart .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $tempPassword = 'Lev-' . $randomPart;
            $hashedPassword = password_hash($tempPassword, PASSWORD_BCRYPT);

            // Update user password and set must_change_password = 1
            $updateStmt = $pdo->prepare("
                UPDATE users 
                SET password = ?, must_change_password = 1, updated_at = NOW() 
                WHERE id = ?
            ");
            $updateStmt->execute([$hashedPassword, $id]);

            // Invalidate existing sessions
            try {
                $stmtTokens = $pdo->prepare("DELETE FROM personal_access_tokens WHERE tokenable_id = ?");
                $stmtTokens->execute([$id]);
            } catch (\Throwable $te) {}

            jsonResponse([
                'message'          => 'Contraseña restablecida exitosamente.',
                'temporaryPassword'=> $tempPassword,
                'user'             => [
                    'id'       => (int)$user['id'],
                    'name'     => $user['name'],
                    'lastname' => $user['lastname'],
                    'username' => $user['username'],
                    'email'    => $user['email']
                ]
            ]);

        } catch (\Throwable $e) {
            error_log("Error in AdminController::resetPassword: " . $e->getMessage());
            jsonResponse(['message' => 'Fallo al restablecer la contraseña.'], 500);
        }
    }
}
