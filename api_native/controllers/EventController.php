<?php
/**
 * Event & Announcement Native Controllers
 */
require_once __DIR__ . '/../services/NotificationService.php';

class EventController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if (!$groupId) {
            jsonResponse([]);
        }

        $stmt = $pdo->prepare("SELECT * FROM events WHERE group_id = ? ORDER BY date DESC, time DESC");
        $stmt->execute([$groupId]);

        $events = $stmt->fetchAll();

        foreach ($events as &$ev) {
            if ($ev['setlist_id']) {
                $stmtS = $pdo->prepare("SELECT id, name FROM setlists WHERE id = ?");
                $stmtS->execute([$ev['setlist_id']]);
                $ev['setlist'] = $stmtS->fetch() ?: null;
            } else {
                $ev['setlist'] = null;
            }
            $ev['setlist_name'] = $ev['setlist'] ? $ev['setlist']['name'] : null;
            $ev['repertoire'] = $ev['setlist_name'];

            $stmtM = $pdo->prepare("
                SELECT u.id, u.name, u.lastname, em.role 
                FROM event_musicians em 
                JOIN users u ON u.id = em.user_id 
                WHERE em.event_id = ?
            ");
            $stmtM->execute([$ev['id']]);
            $musRows = $stmtM->fetchAll();

            $ev['musicians'] = [];
            foreach ($musRows as $m) {
                $ev['musicians'][] = [
                    'id' => (int)$m['id'],
                    'name' => $m['name'],
                    'lastname' => $m['lastname'],
                    'pivot' => ['role' => $m['role']]
                ];
            }
        }

        jsonResponse($events);
    }

    public static function store(): void {
        $groupId = getGroupIdHeader();
        $user = requireLeaderOrAdmin($groupId);

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
        $date = trim($input['date'] ?? '');
        $time = trim($input['time'] ?? '18:00');
        $type = trim($input['type'] ?? 'Ensayo');
        $description = trim($input['description'] ?? '');
        $setlistId = !empty($input['setlist_id']) ? (int)$input['setlist_id'] : null;
        $musicians = $input['musicians'] ?? [];

        if (empty($name) || empty($date)) {
            jsonResponse(['message' => 'Nombre y Fecha del evento son obligatorios.'], 422);
        }

        $stmt = $pdo->prepare("INSERT INTO events (group_id, name, type, date, time, description, setlist_id, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$groupId, $name, $type, $date, $time, $description, $setlistId, $user['id']]);
        $eventId = $pdo->lastInsertId();

        // Save musicians & notify roster assignments individually
        $assignedUserIds = [];
        foreach ($musicians as $m) {
            if (!empty($m['user_id']) && !empty($m['role'])) {
                $muid = (int)$m['user_id'];
                $mrole = trim($m['role']);
                $stmtM = $pdo->prepare("INSERT IGNORE INTO event_musicians (event_id, user_id, role) VALUES (?, ?, ?)");
                $stmtM->execute([$eventId, $muid, $mrole]);

                if ($muid !== (int)$user['id']) {
                    $assignedUserIds[] = $muid;
                }
            }
        }

        // Fetch band name
        $stmtG = $pdo->prepare("SELECT name FROM groups WHERE id = ? LIMIT 1");
        $stmtG->execute([$groupId]);
        $bandName = $stmtG->fetchColumn() ?: 'Banda';

        // 1. Notificar individualmente a cada músico convocado (push personalizada de convocatoria)
        foreach ($musicians as $m) {
            if (!empty($m['user_id']) && !empty($m['role'])) {
                $muid = (int)$m['user_id'];
                $mrole = trim($m['role']);
                if ($muid !== (int)$user['id']) {
                    NotificationService::notifyUser($muid, (int)$user['id'], [
                        'type'     => 'green',
                        'title'    => "Convocatoria en {$bandName}",
                        'body'     => "Fuiste asignado(a) como {$mrole} en el evento \"{$name}\" ({$date} - {$time} hs).",
                        'text'     => "Fuiste asignado(a) como {$mrole} en el evento: \"{$name}\" ({$date} - {$time} hs).",
                        'category' => 'events',
                        'url'      => './#events',
                        'tag'      => "levare-event-roster-{$eventId}-{$muid}",
                        'meta'     => [
                            'event_id'   => (int)$eventId,
                            'event_name' => $name,
                            'event_date' => $date,
                            'event_time' => $time,
                            'role'       => $mrole,
                            'band_name'  => $bandName,
                            'actor_name' => $user['name'],
                            'source'     => 'band'
                        ]
                    ]);
                }
            }
        }

        // 2. Dispatch Notification & Announcement a la banda (excluyendo a los músicos convocados de la push repetida)
        NotificationService::notifyGroup((int)$groupId, (int)$user['id'], [
            'type'     => 'green',
            'title'    => "Nuevo evento en {$bandName}",
            'body'     => "{$user['name']} programó \"{$name}\" para el {$date} ({$time} hs).",
            'text'     => "{$user['name']} programó el evento: \"{$name}\" para el {$date} ({$time} hs).",
            'category' => 'events',
            'url'      => './#events',
            'meta'     => [
                'event_id'   => (int)$eventId,
                'event_name' => $name,
                'event_date' => $date,
                'event_time' => $time,
                'band_name'  => $bandName,
                'actor_name' => $user['name'],
                'source'     => 'band'
            ]
        ], $assignedUserIds);

        jsonResponse(['message' => 'Evento programado correctamente.', 'id' => (int)$eventId], 201);
    }

    public static function update(int $id): void {
        $pdo = DB::getConnection();
        $stmtCheck = $pdo->prepare("SELECT * FROM events WHERE id = ? LIMIT 1");
        $stmtCheck->execute([$id]);
        $ev = $stmtCheck->fetch();
        if (!$ev) {
            jsonResponse(['message' => 'Evento no encontrado.'], 404);
        }

        $groupId = (int)$ev['group_id'];
        $user = requireLeaderOrAdmin($groupId);

        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $date = trim($input['date'] ?? '');
        $time = trim($input['time'] ?? '18:00');
        $type = trim($input['type'] ?? 'Ensayo');
        $description = trim($input['description'] ?? '');
        $setlistId = !empty($input['setlist_id']) ? (int)$input['setlist_id'] : null;
        $musicians = $input['musicians'] ?? [];

        if (empty($name) || empty($date)) {
            jsonResponse(['message' => 'Nombre y Fecha del evento son obligatorios.'], 422);
        }

        $stmt = $pdo->prepare("
            UPDATE events 
            SET name = ?, type = ?, date = ?, time = ?, description = ?, setlist_id = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$name, $type, $date, $time, $description, $setlistId, $id]);

        // Sincronizar músicos / roster
        $pdo->prepare("DELETE FROM event_musicians WHERE event_id = ?")->execute([$id]);

        $assignedUserIds = [];
        foreach ($musicians as $m) {
            if (!empty($m['user_id']) && !empty($m['role'])) {
                $muid = (int)$m['user_id'];
                $mrole = trim($m['role']);
                $stmtM = $pdo->prepare("INSERT IGNORE INTO event_musicians (event_id, user_id, role) VALUES (?, ?, ?)");
                $stmtM->execute([$id, $muid, $mrole]);

                if ($muid !== (int)$user['id']) {
                    $assignedUserIds[] = $muid;
                }
            }
        }

        // Obtener nombre de la banda
        $stmtG = $pdo->prepare("SELECT name FROM groups WHERE id = ? LIMIT 1");
        $stmtG->execute([$groupId]);
        $bandName = $stmtG->fetchColumn() ?: 'Banda';

        // 1. Notificar individualmente a cada músico convocado
        foreach ($musicians as $m) {
            if (!empty($m['user_id']) && !empty($m['role'])) {
                $muid = (int)$m['user_id'];
                $mrole = trim($m['role']);
                if ($muid !== (int)$user['id']) {
                    NotificationService::notifyUser($muid, (int)$user['id'], [
                        'type'     => 'blue',
                        'title'    => "Convocatoria en {$bandName}",
                        'body'     => "Fuiste asignado(a) como {$mrole} en el evento \"{$name}\" ({$date} - {$time} hs).",
                        'text'     => "Fuiste asignado(a) como {$mrole} en el evento: \"{$name}\" ({$date} - {$time} hs).",
                        'category' => 'events',
                        'url'      => './#events',
                        'tag'      => "levare-event-roster-{$id}-{$muid}",
                        'meta'     => [
                            'event_id'   => (int)$id,
                            'event_name' => $name,
                            'event_date' => $date,
                            'event_time' => $time,
                            'role'       => $mrole,
                            'band_name'  => $bandName,
                            'actor_name' => $user['name'],
                            'source'     => 'band'
                        ]
                    ]);
                }
            }
        }

        // 2. Notificar actualización al grupo (excluyendo convocados de push repetida)
        NotificationService::notifyGroup((int)$groupId, (int)$user['id'], [
            'type'     => 'blue',
            'title'    => "Evento actualizado en {$bandName}",
            'body'     => "{$user['name']} actualizó el evento \"{$name}\" programado para el {$date} ({$time} hs).",
            'text'     => "{$user['name']} actualizó el evento: \"{$name}\" para el {$date} ({$time} hs).",
            'category' => 'events',
            'url'      => './#events',
            'meta'     => [
                'event_id'   => (int)$id,
                'event_name' => $name,
                'event_date' => $date,
                'event_time' => $time,
                'band_name'  => $bandName,
                'actor_name' => $user['name'],
                'source'     => 'band'
            ]
        ], $assignedUserIds);

        jsonResponse(['message' => 'Evento actualizado correctamente.', 'id' => (int)$id]);
    }

    public static function destroy(int $id): void {
        $pdo = DB::getConnection();
        $stmtCheck = $pdo->prepare("SELECT * FROM events WHERE id = ? LIMIT 1");
        $stmtCheck->execute([$id]);
        $ev = $stmtCheck->fetch();
        if (!$ev) {
            jsonResponse(['message' => 'Evento no encontrado.'], 404);
        }
        $user = requireLeaderOrAdmin((int)$ev['group_id']);

        $groupId = (int)$ev['group_id'];
        $name = $ev['name'];
        $date = $ev['date'];
        $time = substr($ev['time'] ?? '00:00', 0, 5);

        $pdo->prepare("DELETE FROM event_musicians WHERE event_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM events WHERE id = ?")->execute([$id]);

        // Obtener nombre de la banda
        $stmtG = $pdo->prepare("SELECT name FROM groups WHERE id = ? LIMIT 1");
        $stmtG->execute([$groupId]);
        $bandName = $stmtG->fetchColumn() ?: 'Banda';

        // Notificar cancelación al grupo
        NotificationService::notifyGroup($groupId, (int)$user['id'], [
            'type'     => 'amber',
            'title'    => "Evento cancelado en {$bandName}",
            'body'     => "{$user['name']} canceló el evento \"{$name}\" programado para el {$date}.",
            'text'     => "{$user['name']} canceló el evento: \"{$name}\" programado para el {$date}.",
            'category' => 'events',
            'url'      => './#events',
            'meta'     => [
                'event_id'   => $id,
                'event_name' => $name,
                'event_date' => $date,
                'event_time' => $time,
                'band_name'  => $bandName,
                'actor_name' => $user['name'],
                'source'     => 'band',
                'action'     => 'cancelled'
            ]
        ]);

        jsonResponse(['message' => 'Evento cancelado y eliminado correctamente.']);
    }
}


