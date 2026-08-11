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
                SELECT u.id, u.name, u.lastname, u.email, u.username, u.avatar, u.status, gu.role 
                FROM users u
                JOIN group_user gu ON gu.user_id = u.id
                WHERE gu.group_id = ?
            ");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT id, name, lastname, email, username, avatar, status FROM users");
        }

        jsonResponse($stmt->fetchAll());
    }

    public static function roles(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT name FROM group_roles WHERE group_id = ?");
            $stmt->execute([$groupId]);
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            $roles = ['Líder', 'Voz Principal', 'Guitarra Acústica', 'Batería', 'Teclado', 'Bajo', 'Coros'];
        }

        jsonResponse($roles);
    }
}

