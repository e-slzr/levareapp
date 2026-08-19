<?php
/**
 * Songs & Setlists Controller (Native PDO)
 */
class SongController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $stmt = $pdo->prepare("
            SELECT 
                s.id,
                s.title,
                s.artist,
                s.album,
                s.`key`,
                s.is_medley,
                s.is_public,
                s.is_deleted,
                s.content,
                s.url,
                s.created_by,
                s.created_at,
                s.updated_at,
                gs.added_by,
                gs.created_at as group_added_at,
                u.name as creator_name,
                u.lastname as creator_lastname,
                CASE WHEN s.created_by = ? THEN 1 ELSE 0 END as is_author
            FROM group_songs gs
            JOIN songs s ON gs.song_id = s.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE gs.group_id = ?
            ORDER BY s.title ASC
        ");
        $stmt->execute([$user['id'], $groupId]);
        $songs = $stmt->fetchAll();

        jsonResponse($songs);
    }

    public static function show(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("
            SELECT s.*, u.name as creator_name, u.lastname as creator_lastname
            FROM songs s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ? LIMIT 1
        ");
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
        $isPublic = isset($input['is_public']) ? ($input['is_public'] ? 1 : 0) : 1;
        $url = trim($input['url'] ?? '');
        $content = trim($input['content'] ?? '');

        if (empty($title)) {
            jsonResponse(['message' => 'El título de la canción es obligatorio.'], 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO songs (group_id, title, artist, album, `key`, is_public, is_deleted, is_medley, content, url, created_by, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$groupId, $title, $artist, $album, $key, $isPublic, $isMedley, $content, $url, $user['id']]);

        $id = (int)$pdo->lastInsertId();

        // Insert into group_songs pivot
        $stmtGS = $pdo->prepare("
            INSERT IGNORE INTO group_songs (group_id, song_id, added_by, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmtGS->execute([$groupId, $id, $user['id']]);

        // Recalculate community points for author if public
        if ($isPublic) {
            self::recalculateUserPoints((int)$user['id'], $pdo);
        }

        // Create announcement
        $userName = $user['name'];
        $stmtAnn = $pdo->prepare("INSERT INTO announcements (group_id, text, type, created_at, updated_at) VALUES (?, ?, 'blue', NOW(), NOW())");
        $stmtAnn->execute([$groupId, "{$userName} añadió una nueva canción: \"{$title}\" de {$artist}."]);

        jsonResponse([
            'message' => 'Canción registrada correctamente.',
            'id' => $id,
            'song' => [
                'id' => $id,
                'group_id' => (int)$groupId,
                'title' => $title,
                'artist' => $artist,
                'album' => $album,
                'key' => $key,
                'is_public' => $isPublic,
                'is_medley' => $isMedley,
                'content' => $content,
                'url' => $url,
                'created_by' => (int)$user['id']
            ]
        ], 201);
    }

    public static function update(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        // Verify author or permissions
        $stmtCheck = $pdo->prepare("SELECT * FROM songs WHERE id = ? LIMIT 1");
        $stmtCheck->execute([$id]);
        $song = $stmtCheck->fetch();

        if (!$song) {
            jsonResponse(['message' => 'Canción no encontrada.'], 404);
        }

        // Only creator can edit song details/content
        if ((int)$song['created_by'] !== (int)$user['id']) {
            jsonResponse(['message' => 'Solo el autor que registró la canción en la comunidad puede editarla.'], 403);
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
        $isPublic = isset($input['is_public']) ? ($input['is_public'] ? 1 : 0) : (int)$song['is_public'];
        $url = trim($input['url'] ?? '');
        $content = trim($input['content'] ?? '');

        if (empty($title)) {
            jsonResponse(['message' => 'El título de la canción es obligatorio.'], 422);
        }

        $stmt = $pdo->prepare("
            UPDATE songs 
            SET title = ?, artist = ?, album = ?, `key` = ?, is_public = ?, is_medley = ?, content = ?, url = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$title, $artist, $album, $key, $isPublic, $isMedley, $content, $url, $id]);

        // Recalculate points if visibility changed
        self::recalculateUserPoints((int)$song['created_by'], $pdo);

        jsonResponse(['message' => 'Canción actualizada correctamente.']);
    }

    public static function destroy(int $id): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $stmtCheck = $pdo->prepare("SELECT * FROM songs WHERE id = ? LIMIT 1");
        $stmtCheck->execute([$id]);
        $song = $stmtCheck->fetch();

        if (!$song) {
            // If already deleted from songs, just ensure removed from group_songs
            $pdo->prepare("DELETE FROM group_songs WHERE group_id = ? AND song_id = ?")->execute([$groupId, $id]);
            jsonResponse(['message' => 'Canción eliminada del catálogo de la banda.']);
        }

        $isAuthor = ((int)$song['created_by'] === (int)$user['id']);

        // Remove from setlists of this group
        $pdo->prepare("
            DELETE ss FROM setlist_song ss
            JOIN setlists st ON ss.setlist_id = st.id
            WHERE ss.song_id = ? AND st.group_id = ?
        ")->execute([$id, $groupId]);

        // Always remove from this group's catalog
        $pdo->prepare("DELETE FROM group_songs WHERE group_id = ? AND song_id = ?")->execute([$groupId, $id]);

        if ($isAuthor) {
            // Author deletes it -> mark is_deleted = 1 (soft delete)
            $pdo->prepare("UPDATE songs SET is_deleted = 1, updated_at = NOW() WHERE id = ?")->execute([$id]);
            
            // Recalculate author's community points (-1 point)
            self::recalculateUserPoints((int)$song['created_by'], $pdo);

            jsonResponse(['message' => 'Canción eliminada de tu catálogo y de la comunidad.']);
        } else {
            // Not author -> only removed from this group
            jsonResponse(['message' => 'Canción removida del catálogo de la banda.']);
        }
    }

    public static function communityIndex(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $q = trim($_GET['q'] ?? '');
        $sort = trim($_GET['sort'] ?? 'popular'); // 'popular', 'recent', 'alpha'

        $where = ["s.is_public = 1", "s.is_deleted = 0"];
        $params = [$user['id'], $groupId];

        if (!empty($q)) {
            $where[] = "(s.title LIKE ? OR s.artist LIKE ? OR s.album LIKE ?)";
            $params[] = "%{$q}%";
            $params[] = "%{$q}%";
            $params[] = "%{$q}%";
        }

        $whereClause = implode(' AND ', $where);

        $orderBy = "likes_count DESC, s.title ASC";
        if ($sort === 'recent') {
            $orderBy = "s.created_at DESC";
        } else if ($sort === 'alpha') {
            $orderBy = "s.title ASC";
        }

        $sql = "
            SELECT 
                s.id,
                s.title,
                s.artist,
                s.album,
                s.`key`,
                s.is_medley,
                s.content,
                s.url,
                s.created_by,
                s.created_at,
                u.name as creator_name,
                u.lastname as creator_lastname,
                (SELECT COUNT(*) FROM song_likes sl WHERE sl.song_id = s.id) as likes_count,
                (SELECT COUNT(*) FROM song_likes sl WHERE sl.song_id = s.id AND sl.user_id = ?) as user_has_liked,
                (SELECT COUNT(*) FROM group_songs gs WHERE gs.song_id = s.id AND gs.group_id = ?) as already_in_group
            FROM songs s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE {$whereClause}
            ORDER BY {$orderBy}
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $songs = $stmt->fetchAll();

        // Convert numeric fields
        foreach ($songs as &$song) {
            $song['likes_count'] = (int)$song['likes_count'];
            $song['user_has_liked'] = (int)$song['user_has_liked'] > 0;
            $song['already_in_group'] = (int)$song['already_in_group'] > 0;
            $song['is_medley'] = (int)$song['is_medley'] > 0;
        }

        jsonResponse($songs);
    }

    public static function toggleLike(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        // Check if song exists and is not deleted
        $stmtCheck = $pdo->prepare("SELECT id, created_by FROM songs WHERE id = ? AND is_deleted = 0 LIMIT 1");
        $stmtCheck->execute([$id]);
        $song = $stmtCheck->fetch();

        if (!$song) {
            jsonResponse(['message' => 'Canción no disponible.'], 404);
        }

        // Check current like status
        $stmtLike = $pdo->prepare("SELECT id FROM song_likes WHERE song_id = ? AND user_id = ? LIMIT 1");
        $stmtLike->execute([$id, $user['id']]);
        $existing = $stmtLike->fetch();

        if ($existing) {
            $stmtDel = $pdo->prepare("DELETE FROM song_likes WHERE song_id = ? AND user_id = ?");
            $stmtDel->execute([$id, $user['id']]);
            $liked = false;
        } else {
            $stmtIns = $pdo->prepare("INSERT INTO song_likes (song_id, user_id, created_at) VALUES (?, ?, NOW())");
            $stmtIns->execute([$id, $user['id']]);
            $liked = true;
        }

        // Count new total
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as total FROM song_likes WHERE song_id = ?");
        $stmtCount->execute([$id]);
        $totalLikes = (int)$stmtCount->fetch()['total'];

        // Recalculate points for both the voter (likes given) and song author (likes received)
        $authorId = (int)$song['created_by'];
        $voterId = (int)$user['id'];

        self::recalculateUserPoints($voterId, $pdo);
        if ($authorId !== $voterId) {
            self::recalculateUserPoints($authorId, $pdo);
        }

        jsonResponse([
            'liked' => $liked,
            'likes_count' => $totalLikes,
            'message' => $liked ? 'Te gusta esta canción.' : 'Like removido.'
        ]);
    }

    public static function importToGroup(int $id): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if (!$groupId) {
            $stmtG = $pdo->prepare("SELECT group_id FROM group_user WHERE user_id = ? LIMIT 1");
            $stmtG->execute([$user['id']]);
            $rowG = $stmtG->fetch();
            $groupId = $rowG ? (int)$rowG['group_id'] : 3;
        }

        $stmtCheck = $pdo->prepare("SELECT * FROM songs WHERE id = ? AND is_deleted = 0 LIMIT 1");
        $stmtCheck->execute([$id]);
        $song = $stmtCheck->fetch();

        if (!$song) {
            jsonResponse(['message' => 'La canción no está disponible para importar.'], 404);
        }

        // Insert into group_songs
        $stmtIns = $pdo->prepare("
            INSERT IGNORE INTO group_songs (group_id, song_id, added_by, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmtIns->execute([$groupId, $id, $user['id']]);

        // Announcement
        $userName = $user['name'];
        $title = $song['title'];
        $artist = $song['artist'];
        $stmtAnn = $pdo->prepare("INSERT INTO announcements (group_id, text, type, created_at, updated_at) VALUES (?, ?, 'blue', NOW(), NOW())");
        $stmtAnn->execute([$groupId, "{$userName} añadió al catálogo de la banda: \"{$title}\" de {$artist} (desde la comunidad)."]);

        jsonResponse([
            'message' => 'Canción agregada al catálogo de tu banda con éxito.',
            'song_id' => $id
        ]);
    }

    /**
     * Recalcula y persiste los puntos comunitarios del usuario en users.community_points
     * Reglas:
     * - +1.0 punto por canción pública activa
     * - +0.1 puntos por like recibido en canciones públicas propias
     * - +0.1 puntos por like dado a canciones públicas de otros usuarios
     */
    public static function recalculateUserPoints(int $userId, ?PDO $pdo = null): float {
        $pdo = $pdo ?: DB::getConnection();

        // 1. Canciones públicas activas (1.0 punto c/u)
        $stmtSongs = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM songs 
            WHERE created_by = ? AND is_public = 1 AND is_deleted = 0
        ");
        $stmtSongs->execute([$userId]);
        $songsCount = (int)$stmtSongs->fetch()['total'];

        // 2. Likes recibidos en canciones públicas activas (0.1 puntos c/u)
        $stmtLikesReceived = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM song_likes sl 
            JOIN songs s ON sl.song_id = s.id 
            WHERE s.created_by = ? AND s.is_public = 1 AND s.is_deleted = 0
        ");
        $stmtLikesReceived->execute([$userId]);
        $likesReceivedCount = (int)$stmtLikesReceived->fetch()['total'];

        // 3. Likes dados a canciones públicas de otros usuarios (0.1 puntos c/u)
        $stmtLikesGiven = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM song_likes sl 
            JOIN songs s ON sl.song_id = s.id 
            WHERE sl.user_id = ? AND s.created_by != ? AND s.is_public = 1 AND s.is_deleted = 0
        ");
        $stmtLikesGiven->execute([$userId, $userId]);
        $likesGivenCount = (int)$stmtLikesGiven->fetch()['total'];

        $totalPoints = round(($songsCount * 1.0) + ($likesReceivedCount * 0.1) + ($likesGivenCount * 0.1), 2);

        // Guardar directamente en la columna de la tabla users
        $stmtUpd = $pdo->prepare("UPDATE users SET community_points = ? WHERE id = ?");
        $stmtUpd->execute([$totalPoints, $userId]);

        return $totalPoints;
    }

    public static function userCommunityStats(?int $targetUserId = null): void {
        $user = requireAuth();
        $userId = $targetUserId ?: (int)$user['id'];
        $pdo = DB::getConnection();

        // Recalcular y obtener puntaje exacto
        $totalPoints = self::recalculateUserPoints($userId, $pdo);

        $stmtSongs = $pdo->prepare("SELECT COUNT(*) as total FROM songs WHERE created_by = ? AND is_public = 1 AND is_deleted = 0");
        $stmtSongs->execute([$userId]);
        $communitySongsCount = (int)$stmtSongs->fetch()['total'];

        $stmtLikesRec = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM song_likes sl 
            JOIN songs s ON sl.song_id = s.id 
            WHERE s.created_by = ? AND s.is_public = 1 AND s.is_deleted = 0
        ");
        $stmtLikesRec->execute([$userId]);
        $likesReceived = (int)$stmtLikesRec->fetch()['total'];

        $stmtLikesGiv = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM song_likes sl 
            JOIN songs s ON sl.song_id = s.id 
            WHERE sl.user_id = ? AND s.created_by != ? AND s.is_public = 1 AND s.is_deleted = 0
        ");
        $stmtLikesGiv->execute([$userId, $userId]);
        $likesGiven = (int)$stmtLikesGiv->fetch()['total'];

        jsonResponse([
            'user_id' => $userId,
            'community_songs_count' => $communitySongsCount,
            'community_likes_received' => $likesReceived,
            'community_likes_given' => $likesGiven,
            'community_points' => $totalPoints
        ]);
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
