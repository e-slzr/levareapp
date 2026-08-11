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
}
