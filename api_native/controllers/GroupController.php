<?php
/**
 * Group Controller (Native PDO)
 */
class GroupController {

    public static function index(): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        if ($user['account_type'] === 'superadmin') {
            $stmt = $pdo->query("SELECT * FROM groups ORDER BY name ASC");
            jsonResponse($stmt->fetchAll());
        }

        $stmt = $pdo->prepare("
            SELECT g.*, gu.role 
            FROM groups g
            JOIN group_user gu ON gu.group_id = g.id
            WHERE gu.user_id = ?
            ORDER BY g.name ASC
        ");
        $stmt->execute([$user['id']]);
        jsonResponse($stmt->fetchAll());
    }

    public static function store(): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');

        if (empty($name)) {
            jsonResponse(['message' => 'El nombre de la banda o grupo es obligatorio.'], 422);
        }

        $pdo = DB::getConnection();

        // Generate unique 6-digit numeric invite code
        $inviteCode = self::generateUniqueInviteCode($pdo);

        $stmtInsert = $pdo->prepare("
            INSERT INTO groups (name, description, invite_code, created_by, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        $stmtInsert->execute([$name, $description, $inviteCode, $user['id']]);
        $groupId = $pdo->lastInsertId();

        // Add creator as Leader in group_user and ensure account_type is 'leader'
        $stmtGU = $pdo->prepare("INSERT INTO group_user (user_id, group_id, role, created_at) VALUES (?, ?, 'Líder', NOW())");
        $stmtGU->execute([$user['id'], $groupId]);

        if ($user['account_type'] !== 'superadmin') {
            $stmtUser = $pdo->prepare("UPDATE users SET account_type = 'leader' WHERE id = ?");
            $stmtUser->execute([$user['id']]);
        }

        jsonResponse([
            'message' => 'Grupo creado exitosamente.',
            'group' => [
                'id' => (int)$groupId,
                'name' => $name,
                'description' => $description,
                'invite_code' => $inviteCode,
                'role' => 'Líder'
            ]
        ], 201);
    }

    public static function join(): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $inviteCode = trim($input['invite_code'] ?? $input['code'] ?? '');

        if (empty($inviteCode)) {
            jsonResponse(['message' => 'Por favor, ingresa un código de invitación válido.'], 422);
        }

        $pdo = DB::getConnection();

        $stmtGrp = $pdo->prepare("SELECT * FROM groups WHERE invite_code = ? LIMIT 1");
        $stmtGrp->execute([$inviteCode]);
        $group = $stmtGrp->fetch();

        if (!$group) {
            jsonResponse(['message' => 'El código de invitación ingresado no existe.'], 422);
        }

        // Check if already a member
        $stmtCheck = $pdo->prepare("SELECT * FROM group_user WHERE user_id = ? AND group_id = ? LIMIT 1");
        $stmtCheck->execute([$user['id'], $group['id']]);
        $existing = $stmtCheck->fetch();

        if ($existing) {
            jsonResponse([
                'message' => 'Ya perteneces a este grupo.',
                'group' => [
                    'id' => (int)$group['id'],
                    'name' => $group['name'],
                    'invite_code' => $group['invite_code'],
                    'role' => $existing['role']
                ]
            ]);
        }

        // Add member with NULL musical role (no musical role assigned yet)
        $stmtGU = $pdo->prepare("INSERT INTO group_user (user_id, group_id, role, created_at) VALUES (?, ?, NULL, NOW())");
        $stmtGU->execute([$user['id'], $group['id']]);

        // Ensure user account_type is 'member' if not superadmin
        if ($user['account_type'] !== 'superadmin') {
            $stmtUser = $pdo->prepare("UPDATE users SET account_type = 'member' WHERE id = ?");
            $stmtUser->execute([$user['id']]);
        }

        jsonResponse([
            'message' => 'Te has unido al grupo exitosamente.',
            'group' => [
                'id' => (int)$group['id'],
                'name' => $group['name'],
                'invite_code' => $group['invite_code'],
                'role' => null
            ]
        ]);
    }

    public static function resetInviteCode(int $groupId): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        // Check system role permissions
        if ($user['account_type'] !== 'superadmin' && $user['account_type'] !== 'leader') {
            jsonResponse(['message' => 'No tienes permisos para regenerar el código de invitación.'], 403);
        }

        $newCode = self::generateUniqueInviteCode($pdo);
        $stmt = $pdo->prepare("UPDATE groups SET invite_code = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newCode, $groupId]);

        jsonResponse([
            'message' => 'Código de invitación regenerado exitosamente.',
            'invite_code' => $newCode
        ]);
    }

    private static function generateUniqueInviteCode(PDO $pdo): string {
        while (true) {
            $code = sprintf('%06d', rand(100000, 999999));
            $stmt = $pdo->prepare("SELECT id FROM groups WHERE invite_code = ? LIMIT 1");
            $stmt->execute([$code]);
            if (!$stmt->fetch()) {
                return $code;
            }
        }
    }
}


