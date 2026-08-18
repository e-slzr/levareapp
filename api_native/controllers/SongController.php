<?php
/**
 * Songs & Setlists Controller (Native PDO)
 */
class SongController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT * FROM songs WHERE group_id = ? ORDER BY title ASC");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM songs ORDER BY title ASC");
        }

        $songs = $stmt->fetchAll();
        jsonResponse($songs);
    }

    public static function show(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM songs WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $song = $stmt->fetch();

        if (!$song) {
            jsonResponse(['message' => 'Canción no encontrada.'], 404);
        }
        jsonResponse($song);
    }

    public static function store(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();

        $pdo = DB::getConnection();
        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $title = trim($input['title'] ?? '');
        $artist = trim($input['artist'] ?? '');
        if (empty($artist)) {
            $artist = 'Desconocido';
        }
        $album = !empty(trim($input['album'] ?? '')) ? trim($input['album']) : null;
        $key = trim($input['key'] ?? 'C');
        $isMedley = !empty($input['is_medley']) ? 1 : 0;
        $url = trim($input['url'] ?? '');
        $content = trim($input['content'] ?? '');

        if (empty($title)) {
            jsonResponse(['message' => 'El título de la canción es obligatorio.'], 422);
        }

        $stmt = $pdo->prepare("INSERT INTO songs (group_id, title, artist, album, `key`, is_medley, content, url, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$groupId, $title, $artist, $album, $key, $isMedley, $content, $url, $user['id']]);

        $id = $pdo->lastInsertId();

        // Create announcement
        $userName = $user['name'];
        $stmtAnn = $pdo->prepare("INSERT INTO announcements (group_id, text, type, created_at, updated_at) VALUES (?, ?, 'blue', NOW(), NOW())");
        $stmtAnn->execute([$groupId, "{$userName} añadió una nueva canción: \"{$title}\" de {$artist}."]);

        jsonResponse([
            'message' => 'Canción registrada correctamente.',
            'id' => (int)$id,
            'song' => [
                'id' => (int)$id,
                'group_id' => (int)$groupId,
                'title' => $title,
                'artist' => $artist,
                'album' => $album,
                'key' => $key,
                'is_medley' => $isMedley,
                'content' => $content,
                'url' => $url,
                'created_by' => (int)$user['id']
            ]
        ], 201);
    }

    public static function update(int $id): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $title = trim($input['title'] ?? '');
        $artist = trim($input['artist'] ?? '');
        if (empty($artist)) {
            $artist = 'Desconocido';
        }
        $album = !empty(trim($input['album'] ?? '')) ? trim($input['album']) : null;
        $key = trim($input['key'] ?? 'C');
        $isMedley = !empty($input['is_medley']) ? 1 : 0;
        $url = trim($input['url'] ?? '');
        $content = trim($input['content'] ?? '');

        if (empty($title)) {
            jsonResponse(['message' => 'El título de la canción es obligatorio.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("UPDATE songs SET title = ?, artist = ?, album = ?, `key` = ?, is_medley = ?, content = ?, url = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $artist, $album, $key, $isMedley, $content, $url, $id]);

        jsonResponse(['message' => 'Canción actualizada correctamente.']);
    }

    public static function destroy(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmtS = $pdo->prepare("DELETE FROM setlist_song WHERE song_id = ?");
        $stmtS->execute([$id]);

        $stmt = $pdo->prepare("DELETE FROM songs WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['message' => 'Canción eliminada del catálogo.']);
    }
}

class SetlistController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT * FROM setlists WHERE group_id = ? ORDER BY date DESC");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM setlists ORDER BY date DESC");
        }

        $setlists = $stmt->fetchAll();

        foreach ($setlists as &$setlist) {
            $stmtSongs = $pdo->prepare("
                SELECT s.*, ss.sort_order 
                FROM setlist_song ss 
                JOIN songs s ON s.id = ss.song_id 
                WHERE ss.setlist_id = ? 
                ORDER BY ss.sort_order ASC
            ");
            $stmtSongs->execute([$setlist['id']]);
            $setlist['songs'] = $stmtSongs->fetchAll();
        }

        jsonResponse($setlists);
    }

    public static function store(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();

        $pdo = DB::getConnection();
        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $date = trim($input['date'] ?? date('Y-m-d'));
        $description = trim($input['description'] ?? '');
        $songIds = $input['songs'] ?? [];

        if (empty($name)) {
            jsonResponse(['message' => 'El nombre del repertorio es obligatorio.'], 422);
        }

        $stmt = $pdo->prepare("INSERT INTO setlists (group_id, name, date, description, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$groupId, $name, $date, $description, $user['id']]);
        $setlistId = $pdo->lastInsertId();

        // Associate songs with sort order
        foreach ($songIds as $index => $songId) {
            $stmtSong = $pdo->prepare("INSERT INTO setlist_song (setlist_id, song_id, sort_order) VALUES (?, ?, ?)");
            $stmtSong->execute([$setlistId, (int)$songId, $index]);
        }

        // Post announcement
        $userName = $user['name'];
        $stmtAnn = $pdo->prepare("INSERT INTO announcements (group_id, text, type, created_at, updated_at) VALUES (?, ?, 'green', NOW(), NOW())");
        $stmtAnn->execute([$groupId, "{$userName} creó el repertorio: \"{$name}\"."]);

        jsonResponse(['message' => 'Repertorio creado con éxito.', 'id' => (int)$setlistId], 201);
    }

    public static function update(int $id): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $date = trim($input['date'] ?? date('Y-m-d'));
        $description = trim($input['description'] ?? '');
        $songIds = $input['songs'] ?? [];

        if (empty($name)) {
            jsonResponse(['message' => 'El nombre del repertorio es obligatorio.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("UPDATE setlists SET name = ?, date = ?, description = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $date, $description, $id]);

        // Replace songs
        $pdo->prepare("DELETE FROM setlist_song WHERE setlist_id = ?")->execute([$id]);

        foreach ($songIds as $index => $songId) {
            $stmtSong = $pdo->prepare("INSERT INTO setlist_song (setlist_id, song_id, sort_order) VALUES (?, ?, ?)");
            $stmtSong->execute([$id, (int)$songId, $index]);
        }

        jsonResponse(['message' => 'Repertorio actualizado con éxito.']);
    }

    public static function destroy(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $pdo->prepare("DELETE FROM setlist_song WHERE setlist_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM setlists WHERE id = ?")->execute([$id]);

        jsonResponse(['message' => 'Repertorio eliminado con éxito.']);
    }
}
