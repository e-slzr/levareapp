<?php
/**
 * Member Controller (Native PDO)
 */
class MemberController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("
                SELECT u.id, u.name, u.lastname, u.email, u.username, u.avatar, u.status, u.account_type, gu.role 
                FROM users u
                JOIN group_user gu ON gu.user_id = u.id
                WHERE gu.group_id = ?
                ORDER BY u.name ASC
            ");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT id, name, lastname, email, username, avatar, status, account_type FROM users ORDER BY name ASC");
        }

        jsonResponse($stmt->fetchAll());
    }

    public static function roles(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT name FROM group_roles WHERE group_id = ? ORDER BY name ASC");
            $stmt->execute([$groupId]);
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            $roles = [];
        }

        jsonResponse($roles);
    }

    public static function addRole(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Grupo no especificado.'], 400);
        }

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;
        $name = trim($input['name'] ?? '');

        if (empty($name)) {
            jsonResponse(['message' => 'El nombre del rol es obligatorio.'], 422);
        }

        $pdo = DB::getConnection();

        $stmtCheck = $pdo->prepare("SELECT id FROM group_roles WHERE group_id = ? AND name = ? LIMIT 1");
        $stmtCheck->execute([$groupId, $name]);
        if ($stmtCheck->fetch()) {
            jsonResponse(['message' => 'Este rol musical ya existe en el grupo.'], 422);
        }

        $stmt = $pdo->prepare("INSERT INTO group_roles (group_id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
        $stmt->execute([$groupId, $name]);

        jsonResponse(['message' => 'Rol musical agregado correctamente.'], 201);
    }

    public static function deleteRole(string $roleName): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Grupo no especificado.'], 400);
        }

        $roleName = urldecode($roleName);

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("DELETE FROM group_roles WHERE group_id = ? AND name = ?");
        $stmt->execute([$groupId, $roleName]);

        jsonResponse(['message' => 'Rol musical eliminado correctamente.']);
    }

    public static function update(int $userId): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Grupo no especificado.'], 400);
        }

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $role = isset($input['role']) && trim($input['role']) !== '' ? trim($input['role']) : null;
        $systemRole = trim($input['system_role'] ?? 'member');

        $pdo = DB::getConnection();

        $stmtCheck = $pdo->prepare("SELECT * FROM group_user WHERE user_id = ? AND group_id = ? LIMIT 1");
        $stmtCheck->execute([$userId, $groupId]);
        $gu = $stmtCheck->fetch();

        if (!$gu) {
            jsonResponse(['message' => 'El integrante no pertenece a este grupo.'], 404);
        }

        // Update musical role in group_user
        $stmtGU = $pdo->prepare("UPDATE group_user SET role = ? WHERE user_id = ? AND group_id = ?");
        $stmtGU->execute([$role, $userId, $groupId]);

        // Update system role in users table if valid
        if (in_array($systemRole, ['leader', 'member', 'superadmin'])) {
            $stmtUser = $pdo->prepare("UPDATE users SET account_type = ?, updated_at = NOW() WHERE id = ?");
            $stmtUser->execute([$systemRole, $userId]);
        }

        jsonResponse(['message' => 'Integrante actualizado correctamente.']);
    }

    public static function store(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Grupo no especificado.'], 400);
        }

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $lastname = trim($input['lastname'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $role = isset($input['role']) && trim($input['role']) !== '' ? trim($input['role']) : null;
        $systemRole = trim($input['system_role'] ?? 'member');

        if (empty($name) || empty($password)) {
            jsonResponse(['message' => 'Nombre y contraseña son obligatorios.'], 422);
        }

        $pdo = DB::getConnection();

        if (!empty($email)) {
            $stmtE = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmtE->execute([$email]);
            if ($stmtE->fetch()) {
                jsonResponse(['message' => 'El correo electrónico ya se encuentra registrado.'], 422);
            }
        }

        if (empty($username)) {
            $baseEmail = !empty($email) ? $email : $name . rand(100, 999) . '@levare.com';
            $username = strtolower(preg_replace('/[^a-z0-9_]/', '', explode('@', $baseEmail)[0]));
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmtInsert = $pdo->prepare("
            INSERT INTO users (name, lastname, email, username, password, account_type, status, must_change_password, accent_color, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'active', 0, 'purple', NOW(), NOW())
        ");
        $stmtInsert->execute([$name, $lastname, $email ?: null, $username, $hashedPassword, $systemRole]);
        $newUserId = $pdo->lastInsertId();

        $stmtGU = $pdo->prepare("INSERT INTO group_user (user_id, group_id, role, created_at) VALUES (?, ?, ?, NOW())");
        $stmtGU->execute([$newUserId, $groupId, $role]);

        jsonResponse(['message' => 'Integrante sumado con éxito.'], 201);
    }

    public static function destroy(int $userId): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Grupo no especificado.'], 400);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("DELETE FROM group_user WHERE user_id = ? AND group_id = ?");
        $stmt->execute([$userId, $groupId]);

        jsonResponse(['message' => 'Integrante eliminado del grupo correctamente.']);
    }

    public static function resetPassword(int $userId): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $tempPassword = substr(bin2hex(random_bytes(6)), 0, 8);
        $hashedPassword = password_hash($tempPassword, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("UPDATE users SET password = ?, must_change_password = 1, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$hashedPassword, $userId]);

        jsonResponse([
            'message' => 'Contraseña restablecida con éxito.',
            'temporary_password' => $tempPassword
        ]);
    }
}


