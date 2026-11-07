<?php
/**
 * Controlador de Sincronización en Vivo y Cues para Repertorios (Live Sync)
 * Gestiona el Modo Director ("Uno Dirige, el Resto Sigue"), cambio sincronizado de canciones
 * e indicaciones en vivo silenciosas.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

class LiveSyncController {

    /**
     * Inicia una sesión Live Sync en el repertorio especificado.
     * Solo disponible para usuarios con rol de Líder o Superadmin.
     * Si ya existe un director activo, bloquea a otros líderes y retorna 409.
     */
    public static function startSession(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireLeaderOrAdmin($groupId);
        $pdo = DB::getConnection();
        $input = getJsonInput();

        // 1. Validar existencia del repertorio en el grupo activo
        $stmtSetlist = $pdo->prepare("SELECT id, name FROM setlists WHERE id = ? AND group_id = ? LIMIT 1");
        $stmtSetlist->execute([$setlistId, $groupId]);
        $setlist = $stmtSetlist->fetch();
        if (!$setlist) {
            jsonResponse(['message' => 'Repertorio no encontrado en este grupo.'], 404);
        }

        // 2. Verificar si ya existe una sesión activa para este repertorio
        $stmtActive = $pdo->prepare("
            SELECT s.*, CONCAT(u.name, ' ', u.lastname) AS director_name 
            FROM setlist_live_sessions s
            JOIN users u ON u.id = s.director_id
            WHERE s.setlist_id = ? AND s.group_id = ? AND s.is_active = 1
            LIMIT 1
        ");
        $stmtActive->execute([$setlistId, $groupId]);
        $activeSession = $stmtActive->fetch();

        if ($activeSession) {
            // Si el mismo usuario ya es el director, confirmar sesión existente
            if ((int)$activeSession['director_id'] === (int)$user['id']) {
                jsonResponse([
                    'message' => 'Sesión en vivo reanudada.',
                    'session' => [
                        'id' => (int)$activeSession['id'],
                        'setlist_id' => (int)$activeSession['setlist_id'],
                        'director_id' => (int)$activeSession['director_id'],
                        'director_name' => $activeSession['director_name'],
                        'is_director' => true,
                        'current_song_id' => $activeSession['current_song_id'] ? (int)$activeSession['current_song_id'] : null,
                        'current_transpose' => (int)$activeSession['current_transpose'],
                        'active_cue' => $activeSession['active_cue'],
                        'active_cue_type' => $activeSession['active_cue_type'],
                        'is_active' => true
                    ]
                ], 200);
            }

            // Si otro usuario es el director activo, rechazar con conflicto 409
            jsonResponse([
                'message' => 'Ya existe un Director dirigiendo esta sesión en vivo.',
                'director_id' => (int)$activeSession['director_id'],
                'director_name' => $activeSession['director_name'],
                'is_director' => false
            ], 409);
        }

        $currentSongId = isset($input['current_song_id']) && $input['current_song_id'] > 0 ? (int)$input['current_song_id'] : null;
        $currentTranspose = isset($input['current_transpose']) ? (int)$input['current_transpose'] : 0;

        // 3. Crear o reactivar la sesión
        $stmtCheck = $pdo->prepare("SELECT id FROM setlist_live_sessions WHERE setlist_id = ? AND group_id = ? LIMIT 1");
        $stmtCheck->execute([$setlistId, $groupId]);
        $existing = $stmtCheck->fetch();

        if ($existing) {
            $stmtUpdate = $pdo->prepare("
                UPDATE setlist_live_sessions 
                SET director_id = ?, current_song_id = ?, current_transpose = ?, 
                    active_cue = NULL, active_cue_type = NULL, cue_timestamp = NULL, 
                    is_active = 1, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmtUpdate->execute([$user['id'], $currentSongId, $currentTranspose, $existing['id']]);
            $sessionId = (int)$existing['id'];
        } else {
            $stmtInsert = $pdo->prepare("
                INSERT INTO setlist_live_sessions 
                (group_id, setlist_id, director_id, current_song_id, current_transpose, is_active, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
            ");
            $stmtInsert->execute([$groupId, $setlistId, $user['id'], $currentSongId, $currentTranspose]);
            $sessionId = (int)$pdo->lastInsertId();
        }

        $directorName = trim(($user['name'] ?? '') . ' ' . ($user['lastname'] ?? ''));

        jsonResponse([
            'message' => 'Sesión Live Sync iniciada con éxito.',
            'session' => [
                'id' => $sessionId,
                'setlist_id' => $setlistId,
                'director_id' => (int)$user['id'],
                'director_name' => $directorName,
                'is_director' => true,
                'current_song_id' => $currentSongId,
                'current_transpose' => $currentTranspose,
                'active_cue' => null,
                'active_cue_type' => null,
                'is_active' => true
            ]
        ], 201);
    }

    /**
     * Finaliza la sesión Live Sync activa.
     * Solo permitido para el Director que inició la sesión (o superadmin).
     */
    public static function stopSession(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM setlist_live_sessions WHERE setlist_id = ? AND group_id = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$setlistId, $groupId]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['message' => 'No hay una sesión activa para este repertorio.'], 200);
        }

        $isSuperadmin = ($user['account_type'] ?? '') === 'superadmin';
        if ((int)$session['director_id'] !== (int)$user['id'] && !$isSuperadmin) {
            jsonResponse(['message' => 'Solo el Director que inició la sesión puede finalizarla.'], 403);
        }

        $stmtStop = $pdo->prepare("
            UPDATE setlist_live_sessions 
            SET is_active = 0, active_cue = NULL, active_cue_type = NULL, cue_timestamp = NULL, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmtStop->execute([$session['id']]);

        jsonResponse(['message' => 'Sesión Live Sync finalizada correctamente.'], 200);
    }

    /**
     * Retorna el estado en tiempo real de la sesión (Polling ultraligero).
     * Consumido tanto por directores como por músicos seguidores.
     */
    public static function getSessionState(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("
            SELECT s.*, CONCAT(u.name, ' ', u.lastname) AS director_name 
            FROM setlist_live_sessions s
            JOIN users u ON u.id = s.director_id
            WHERE s.setlist_id = ? AND s.group_id = ? AND s.is_active = 1
            LIMIT 1
        ");
        $stmt->execute([$setlistId, $groupId]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse([
                'is_active' => false,
                'session' => null,
                'server_time' => time()
            ], 200);
        }

        $isDirector = ((int)$session['director_id'] === (int)$user['id']);

        // Calcular si el cue activo ha expirado (más de 8 segundos para cualquier tipo de indicación)
        $cueExpired = false;
        if (!empty($session['active_cue']) && !empty($session['cue_timestamp'])) {
            $cueTime = strtotime($session['cue_timestamp']);
            if ((time() - $cueTime) >= 8) {
                $cueExpired = true;
            }
        }

        jsonResponse([
            'is_active' => true,
            'session' => [
                'id' => (int)$session['id'],
                'setlist_id' => (int)$session['setlist_id'],
                'director_id' => (int)$session['director_id'],
                'director_name' => $session['director_name'],
                'is_director' => $isDirector,
                'current_song_id' => $session['current_song_id'] ? (int)$session['current_song_id'] : null,
                'current_transpose' => (int)$session['current_transpose'],
                'active_cue' => $cueExpired ? null : $session['active_cue'],
                'active_cue_type' => $cueExpired ? null : $session['active_cue_type'],
                'cue_timestamp' => $session['cue_timestamp'],
                'updated_at' => $session['updated_at']
            ],
            'server_time' => time()
        ], 200);
    }

    /**
     * Sincroniza la canción y transposición del Director en tiempo real.
     */
    public static function syncState(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();
        $input = getJsonInput();

        $stmt = $pdo->prepare("SELECT * FROM setlist_live_sessions WHERE setlist_id = ? AND group_id = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$setlistId, $groupId]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['message' => 'No hay una sesión activa para este repertorio.'], 404);
        }

        if ((int)$session['director_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'Solo el Director activo puede sincronizar la lista.'], 403);
        }

        $songId = isset($input['song_id']) && $input['song_id'] > 0 ? (int)$input['song_id'] : $session['current_song_id'];
        $transpose = isset($input['transpose']) ? (int)$input['transpose'] : (int)$session['current_transpose'];

        // Si cambió de canción, limpiar los avisos de dinámica temporales previos
        $stmtUpdate = $pdo->prepare("
            UPDATE setlist_live_sessions 
            SET current_song_id = ?, current_transpose = ?, active_cue = NULL, active_cue_type = NULL, cue_timestamp = NULL, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmtUpdate->execute([$songId, $transpose, $session['id']]);

        jsonResponse([
            'message' => 'Estado sincronizado.',
            'current_song_id' => $songId,
            'current_transpose' => $transpose
        ], 200);
    }

    /**
     * Emite una indicación en vivo (cue) a todos los integrantes enlazados.
     */
    public static function sendCue(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();
        $input = getJsonInput();

        $cueText = trim($input['cue'] ?? '');
        $cueType = trim($input['cue_type'] ?? 'General');

        if (empty($cueText)) {
            jsonResponse(['message' => 'El texto de la indicación no puede estar vacío.'], 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM setlist_live_sessions WHERE setlist_id = ? AND group_id = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$setlistId, $groupId]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['message' => 'No hay una sesión activa para este repertorio.'], 404);
        }

        if ((int)$session['director_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'Solo el Director activo puede emitir indicaciones en vivo.'], 403);
        }

        $stmtUpdate = $pdo->prepare("
            UPDATE setlist_live_sessions 
            SET active_cue = ?, active_cue_type = ?, cue_timestamp = NOW(), updated_at = NOW() 
            WHERE id = ?
        ");
        $stmtUpdate->execute([$cueText, $cueType, $session['id']]);

        jsonResponse([
            'message' => 'Indicación enviada a la banda.',
            'cue' => $cueText,
            'cue_type' => $cueType,
            'cue_timestamp' => date('Y-m-d H:i:s')
        ], 200);
    }

    /**
     * Limpia la indicación en vivo activa en las pantallas del equipo.
     */
    public static function clearCue(int $setlistId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM setlist_live_sessions WHERE setlist_id = ? AND group_id = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$setlistId, $groupId]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['message' => 'No hay una sesión activa para este repertorio.'], 404);
        }

        if ((int)$session['director_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'Solo el Director activo puede despejar las indicaciones.'], 403);
        }

        $stmtUpdate = $pdo->prepare("
            UPDATE setlist_live_sessions 
            SET active_cue = NULL, active_cue_type = NULL, cue_timestamp = NULL, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmtUpdate->execute([$session['id']]);

        jsonResponse(['message' => 'Pantalla despejada para todos los integrantes.'], 200);
    }

    /**
     * Consulta los atajos personalizados privados del líder actual en el grupo activo.
     */
    public static function getPersonalQuickCues(): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("
            SELECT id, title, category, sort_order 
            FROM user_quick_cues 
            WHERE user_id = ? AND group_id = ? 
            ORDER BY sort_order ASC, id ASC
        ");
        $stmt->execute([$user['id'], $groupId]);
        $cues = $stmt->fetchAll();

        jsonResponse($cues, 200);
    }

    /**
     * Guarda un nuevo atajo personalizado privado para el líder actual.
     */
    public static function savePersonalQuickCue(): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();
        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? 'Personalizado');

        if (empty($title)) {
            jsonResponse(['message' => 'El título del atajo no puede estar vacío.'], 422);
        }

        // Obtener el siguiente sort_order
        $stmtOrder = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM user_quick_cues WHERE user_id = ? AND group_id = ?");
        $stmtOrder->execute([$user['id'], $groupId]);
        $nextOrder = (int)$stmtOrder->fetch()['next_order'];

        $stmtInsert = $pdo->prepare("
            INSERT INTO user_quick_cues (user_id, group_id, title, category, sort_order, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmtInsert->execute([$user['id'], $groupId, $title, $category, $nextOrder]);

        jsonResponse([
            'id' => (int)$pdo->lastInsertId(),
            'title' => $title,
            'category' => $category,
            'sort_order' => $nextOrder
        ], 201);
    }

    /**
     * Elimina un atajo personalizado privado del líder actual.
     */
    public static function deletePersonalQuickCue(int $cueId): void {
        $groupId = getGroupIdHeader();
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("DELETE FROM user_quick_cues WHERE id = ? AND user_id = ? AND group_id = ?");
        $stmt->execute([$cueId, $user['id'], $groupId]);

        jsonResponse(['message' => 'Atajo eliminado correctamente.'], 200);
    }
}
