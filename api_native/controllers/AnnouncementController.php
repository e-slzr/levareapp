<?php
/**
 * Announcement & System Broadcast Controller for Levare API
 */

require_once __DIR__ . '/../services/NotificationService.php';

class AnnouncementController {

    /**
     * Get announcements feed for current user (Band + Personal + Global System)
     * Endpoint: GET /announcements
     */
    public static function index(): void {
        $user = requireAuth();
        $groupId = getGroupIdHeader();
        $pdo = DB::getConnection();
        $limit = isset($_GET['limit']) ? max(1, min((int)$_GET['limit'], 100)) : 15;
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : (($page - 1) * $limit);

        if ($groupId) {
            $stmt = $pdo->prepare("
                SELECT * FROM announcements 
                WHERE group_id = :group_id 
                   OR (user_id = :user_id AND group_id IS NULL)
                   OR (group_id IS NULL AND user_id IS NULL)
                ORDER BY created_at DESC 
                LIMIT {$limit} OFFSET {$offset}
            ");
            $stmt->execute(['group_id' => $groupId, 'user_id' => $user['id']]);
        } else {
            $stmt = $pdo->prepare("
                SELECT * FROM announcements 
                WHERE (user_id = :user_id AND group_id IS NULL)
                   OR (group_id IS NULL AND user_id IS NULL)
                ORDER BY created_at DESC 
                LIMIT {$limit} OFFSET {$offset}
            ");
            $stmt->execute(['user_id' => $user['id']]);
        }

        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            if (!empty($r['meta']) && is_string($r['meta'])) {
                $r['meta'] = json_decode($r['meta'], true);
            }
        }

        jsonResponse($rows);
    }

    /**
     * Create and broadcast a global system announcement (Superadmin only)
     * Endpoint: POST /admin/announcements
     */
    public static function storeGlobal(): void {
        $user = requireAuth();

        if ($user['account_type'] !== 'superadmin') {
            jsonResponse(['message' => 'Acceso no autorizado. Se requieren privilegios de Super Administrador.'], 403);
        }

        // Support both multipart/form-data and json
        $title = trim($_POST['title'] ?? '');
        $type = trim($_POST['type'] ?? 'system_announcement');
        $content = trim($_POST['content'] ?? '');
        $sendPush = isset($_POST['send_push']) ? filter_var($_POST['send_push'], FILTER_VALIDATE_BOOLEAN) : true;
        $imageUrl = null;

        // If JSON input fallback
        if (empty($title) && empty($content)) {
            $data = getJsonInput();
            $title = trim($data['title'] ?? '');
            $type = trim($data['type'] ?? 'system_announcement');
            $content = trim($data['content'] ?? '');
            $sendPush = isset($data['send_push']) ? (bool)$data['send_push'] : true;
            $imageUrl = trim($data['image_url'] ?? '') ?: null;
        }

        if (empty($title)) {
            jsonResponse(['message' => 'El título del anuncio es obligatorio.'], 422);
        }

        // Validate allowed types
        $validTypes = ['system_update', 'system_announcement', 'system_event'];
        if (!in_array($type, $validTypes)) {
            $type = 'system_announcement';
        }

        // Handle Image Upload if present
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['image'];
            $tmpPath = $file['tmp_name'];
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            if (!in_array($extension, $allowedExts)) {
                jsonResponse(['message' => 'Formato de imagen no válido. Usa JPG, PNG, WEBP o GIF.'], 422);
            }

            if ($file['size'] > 5 * 1024 * 1024) {
                jsonResponse(['message' => 'La imagen adjunta excede el tamaño máximo permitido (5MB).'], 422);
            }

            $storageDir = __DIR__ . '/../../storage/announcements';
            if (!is_dir($storageDir)) {
                mkdir($storageDir, 0755, true);
            }

            $filename = 'announcement_' . bin2hex(random_bytes(8)) . '_' . time() . '.' . $extension;
            $destPath = $storageDir . '/' . $filename;

            if (move_uploaded_file($tmpPath, $destPath)) {
                $imageUrl = 'announcements/' . $filename;
            } else {
                jsonResponse(['message' => 'Fallo al guardar la imagen adjunta en el servidor.'], 500);
            }
        }

        // Meta structure
        $authorName = 'Eliú Salazar | Desarrollador';
        if (!empty($_POST['author_name'])) {
            $authorName = trim($_POST['author_name']);
        }

        $meta = [
            'title'       => $title,
            'content'     => $content,
            'category'    => $type,
            'image_url'   => $imageUrl,
            'author_name' => $authorName,
            'source'      => 'system'
        ];


        // Format short text for summary listings
        $shortText = $title;
        if (!empty($content)) {
            $cleanContent = preg_replace('/\s+/', ' ', strip_tags($content));
            $shortText = $title . ' — ' . (mb_strlen($cleanContent) > 80 ? mb_substr($cleanContent, 0, 77) . '...' : $cleanContent);
        }

        $announcementId = NotificationService::notifyAll([
            'type'      => $type,
            'title'     => $title,
            'text'      => $shortText,
            'body'      => !empty($content) ? (mb_strlen($content) > 120 ? mb_substr($content, 0, 117) . '...' : $content) : $title,
            'url'       => '#announcements',
            'meta'      => $meta,
            'send_push' => $sendPush
        ]);

        jsonResponse([
            'message' => 'Anuncio global emitido y notificaciones enviadas exitosamente.',
            'announcement_id' => $announcementId,
            'announcement' => [
                'id'         => $announcementId,
                'text'       => $shortText,
                'type'       => $type,
                'meta'       => $meta,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], 201);
    }

    /**
     * Delete an announcement (Superadmin or Author)
     * Endpoint: DELETE /admin/announcements/{id} or /announcements/{id}
     */
    public static function destroy(int $id): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $announcement = $stmt->fetch();

        if (!$announcement) {
            jsonResponse(['message' => 'Anuncio no encontrado.'], 404);
        }

        // Permission check: Superadmin can delete any, users can delete their own
        if ($user['account_type'] !== 'superadmin' && (int)$announcement['user_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'No tienes permisos para eliminar este anuncio.'], 403);
        }

        // Delete attached image if exists
        if (!empty($announcement['meta'])) {
            $meta = is_string($announcement['meta']) ? json_decode($announcement['meta'], true) : $announcement['meta'];
            if (!empty($meta['image_url'])) {
                $imgPath = __DIR__ . '/../../storage/' . ltrim($meta['image_url'], '/');
                if (file_exists($imgPath) && is_file($imgPath)) {
                    @unlink($imgPath);
                }
            }
        }

        $stmtDel = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmtDel->execute([$id]);

        jsonResponse(['message' => 'Anuncio eliminado correctamente.']);
    }

    /**
     * Get platform statistics for Superadmin Dashboard
     * Endpoint: GET /admin/stats
     */
    public static function stats(): void {
        $user = requireAuth();

        if ($user['account_type'] !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado.'], 403);
        }

        $pdo = DB::getConnection();

        // 1. Users count
        $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $activeUsers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'")->fetchColumn();
        $blockedUsers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status = 'blocked'")->fetchColumn();

        // 2. Groups count
        $totalGroups = (int)$pdo->query("SELECT COUNT(*) FROM groups")->fetchColumn();

        // 3. Songs count
        $totalSongs = (int)$pdo->query("SELECT COUNT(*) FROM songs")->fetchColumn();

        // 4. Push Subscriptions count
        $totalPush = (int)$pdo->query("SELECT COUNT(*) FROM push_subscriptions")->fetchColumn();

        // 5. Global announcements count
        $totalGlobalAnnouncements = (int)$pdo->query("SELECT COUNT(*) FROM announcements WHERE group_id IS NULL AND user_id IS NULL")->fetchColumn();

        jsonResponse([
            'users' => [
                'total'   => $totalUsers,
                'active'  => $activeUsers,
                'blocked' => $blockedUsers
            ],
            'groups' => [
                'total'   => $totalGroups
            ],
            'songs' => [
                'total'   => $totalSongs
            ],
            'push' => [
                'total_devices' => $totalPush
            ],
            'announcements' => [
                'total_global' => $totalGlobalAnnouncements
            ]
        ]);
    }
}
