<?php
/**
 * Event & Announcement Native Controllers
 */
class EventController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT * FROM events WHERE group_id = ? ORDER BY date ASC, time ASC");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM events ORDER BY date ASC, time ASC");
        }

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

        // Save musicians
        foreach ($musicians as $m) {
            if (!empty($m['user_id']) && !empty($m['role'])) {
                $stmtM = $pdo->prepare("INSERT INTO event_musicians (event_id, user_id, role) VALUES (?, ?, ?)");
                $stmtM->execute([$eventId, (int)$m['user_id'], $m['role']]);
            }
        }

        // Announcement
        $userName = $user['name'];
        $stmtAnn = $pdo->prepare("INSERT INTO announcements (group_id, text, type, created_at, updated_at) VALUES (?, ?, 'green', NOW(), NOW())");
        $stmtAnn->execute([$groupId, "{$userName} programó el evento: \"{$name}\" para el {$date}."]);

        jsonResponse(['message' => 'Evento programado correctamente.', 'id' => (int)$eventId], 201);
    }

    public static function destroy(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $pdo->prepare("DELETE FROM event_musicians WHERE event_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM events WHERE id = ?")->execute([$id]);

        jsonResponse(['message' => 'Evento cancelado y eliminado correctamente.']);
    }
}

class AnnouncementController {

    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();

        if ($groupId) {
            $stmt = $pdo->prepare("SELECT * FROM announcements WHERE group_id = ? ORDER BY created_at DESC LIMIT 15");
            $stmt->execute([$groupId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 15");
        }

        jsonResponse($stmt->fetchAll());
    }
}
