<?php

class SuggestionController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        $userId = (int)$user['id'];

        if ($groupId) {
            $stmt = $pdo->prepare("
                SELECT s.*, 
                       u.name as suggested_by_name, 
                       u.lastname as suggested_by_lastname,
                       (SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = s.id) as votes_count,
                       (SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = s.id AND user_id = :user_id) as has_voted
                FROM suggestions s
                JOIN users u ON u.id = s.suggested_by
                WHERE s.group_id = :group_id
                ORDER BY votes_count DESC, s.created_at DESC
            ");
            $stmt->execute(['user_id' => $userId, 'group_id' => $groupId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT s.*, 
                       u.name as suggested_by_name, 
                       u.lastname as suggested_by_lastname,
                       (SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = s.id) as votes_count,
                       (SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = s.id AND user_id = :user_id) as has_voted
                FROM suggestions s
                JOIN users u ON u.id = s.suggested_by
                ORDER BY votes_count DESC, s.created_at DESC
            ");
            $stmt->execute(['user_id' => $userId]);
        }

        $raw = $stmt->fetchAll();
        $suggestions = array_map(function($r) {
            $r['id'] = (int)$r['id'];
            $r['suggested_by'] = (int)$r['suggested_by'];
            $r['votes_count'] = (int)$r['votes_count'];
            $r['has_voted'] = (bool)$r['has_voted'];
            $r['suggested_by_user'] = [
                'id' => $r['suggested_by'],
                'name' => $r['suggested_by_name'],
                'lastname' => $r['suggested_by_lastname']
            ];
            return $r;
        }, $raw);

        jsonResponse($suggestions);
    }

    public static function store(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        if (!$groupId) {
            jsonResponse(['message' => 'Debes seleccionar un grupo activo.'], 400);
        }

        $data = getJsonInput();
        $title = trim($data['title'] ?? '');
        $artist = trim($data['artist'] ?? '');
        $notes = trim($data['notes'] ?? '');
        $url = trim($data['url'] ?? '');

        if (!$title || !$artist) {
            jsonResponse(['message' => 'El título y el artista son requeridos.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO suggestions (group_id, title, artist, notes, url, suggested_by, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW())
        ");
        $stmt->execute([$groupId, $title, $artist, $notes ?: null, $url ?: null, $user['id']]);

        $id = (int)$pdo->lastInsertId();
        jsonResponse(['message' => 'Sugerencia agregada con éxito.', 'id' => $id], 201);
    }

    public static function vote(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmtCheck = $pdo->prepare("SELECT 1 FROM suggestion_votes WHERE suggestion_id = ? AND user_id = ?");
        $stmtCheck->execute([$id, $user['id']]);
        $exists = $stmtCheck->fetchColumn();

        if ($exists) {
            $stmtDel = $pdo->prepare("DELETE FROM suggestion_votes WHERE suggestion_id = ? AND user_id = ?");
            $stmtDel->execute([$id, $user['id']]);
            $hasVoted = false;
        } else {
            $stmtIns = $pdo->prepare("INSERT INTO suggestion_votes (suggestion_id, user_id) VALUES (?, ?)");
            $stmtIns->execute([$id, $user['id']]);
            $hasVoted = true;
        }

        $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM suggestion_votes WHERE suggestion_id = ?");
        $stmtCount->execute([$id]);
        $votesCount = (int)$stmtCount->fetchColumn();

        jsonResponse([
            'has_voted' => $hasVoted,
            'votes_count' => $votesCount
        ]);
    }

    public static function updateStatus(int $id): void {
        $user = requireAuth();
        $data = getJsonInput();
        $status = $data['status'] ?? 'pendiente';

        if (!in_array($status, ['pendiente', 'ensayo', 'agregada'])) {
            jsonResponse(['message' => 'Estado inválido.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("UPDATE suggestions SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $id]);

        jsonResponse(['message' => 'Estado actualizado.']);
    }

    public static function destroy(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM suggestions WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $suggestion = $stmt->fetch();

        if (!$suggestion) {
            jsonResponse(['message' => 'Sugerencia no encontrada.'], 404);
        }

        // Permiso: solo la persona que la sugirió (o superadmin) puede eliminarla
        if ((int)$suggestion['suggested_by'] !== (int)$user['id'] && ($user['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Solo la persona que sugirió esta canción puede eliminarla.'], 403);
        }

        $stmtVotes = $pdo->prepare("DELETE FROM suggestion_votes WHERE suggestion_id = ?");
        $stmtVotes->execute([$id]);

        $stmtDel = $pdo->prepare("DELETE FROM suggestions WHERE id = ?");
        $stmtDel->execute([$id]);

        jsonResponse(['message' => 'Sugerencia eliminada correctamente.']);
    }
}
