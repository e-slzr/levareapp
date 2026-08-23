<?php
/**
 * Feedback & Bug Reports Controller for Levare (v1.0 Beta)
 * Native PHP with PDO
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

class FeedbackController {

    /**
     * Submit a new feedback or bug report
     * Endpoint: POST /feedback
     */
    public static function store(): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        // Support both multipart/form-data and json
        $jsonInput = getJsonInput();
        $title = trim($_POST['title'] ?? ($jsonInput['title'] ?? ''));
        $description = trim($_POST['description'] ?? ($jsonInput['description'] ?? ''));
        $type = trim($_POST['type'] ?? ($jsonInput['type'] ?? 'bug'));
        
        $validTypes = ['bug', 'suggestion', 'visual', 'other'];
        if (!in_array($type, $validTypes)) {
            $type = 'bug';
        }

        if (empty($title) || empty($description)) {
            jsonResponse(['message' => 'El título y la descripción del problema son obligatorios.'], 422);
        }

        // Active Group Context
        $groupId = getGroupIdHeader() ?: (!empty($_POST['group_id']) ? (int)$_POST['group_id'] : (!empty($jsonInput['group_id']) ? (int)$jsonInput['group_id'] : null));

        // Telemetry / Device info
        $rawDeviceInfo = $_POST['device_info'] ?? ($jsonInput['device_info'] ?? null);
        $deviceInfo = null;
        if (!empty($rawDeviceInfo)) {
            $deviceInfo = is_array($rawDeviceInfo) ? $rawDeviceInfo : json_decode($rawDeviceInfo, true);
        }

        // Process attachments (Up to 5 images)
        $attachments = [];
        $storageDir = __DIR__ . '/../../storage/feedback';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
        $maxFileSize = 4 * 1024 * 1024; // 4MB

        // Helper to process a single uploaded file
        $saveFile = function($tmpPath, $origName, $size, $error) use ($storageDir, $allowedExts, $maxFileSize, &$attachments) {
            if ($error !== UPLOAD_ERR_OK || count($attachments) >= 5) return;
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExts) || $size > $maxFileSize) return;

            $filename = bin2hex(random_bytes(16)) . '.' . $ext;
            $destPath = $storageDir . '/' . $filename;

            if (move_uploaded_file($tmpPath, $destPath)) {
                $attachments[] = 'feedback/' . $filename;
            }
        };

        if (!empty($_FILES)) {
            foreach ($_FILES as $key => $fileData) {
                if (is_array($fileData['name'])) {
                    $count = count($fileData['name']);
                    for ($i = 0; $i < $count; $i++) {
                        $saveFile(
                            $fileData['tmp_name'][$i],
                            $fileData['name'][$i],
                            $fileData['size'][$i],
                            $fileData['error'][$i]
                        );
                    }
                } else if (isset($fileData['name'])) {
                    $saveFile(
                        $fileData['tmp_name'],
                        $fileData['name'],
                        $fileData['size'],
                        $fileData['error']
                    );
                }
            }
        }

        // Insert into database
        $stmt = $pdo->prepare("
            INSERT INTO feedback_reports (
                user_id, 
                group_id, 
                type, 
                title, 
                description, 
                attachments, 
                device_info, 
                status, 
                created_at, 
                updated_at
            ) VALUES (
                :user_id, 
                :group_id, 
                :type, 
                :title, 
                :description, 
                :attachments, 
                :device_info, 
                'pending', 
                NOW(), 
                NOW()
            )
        ");

        $stmt->execute([
            'user_id' => $user['id'],
            'group_id' => $groupId,
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'attachments' => !empty($attachments) ? json_encode($attachments, JSON_UNESCAPED_UNICODE) : null,
            'device_info' => !empty($deviceInfo) ? json_encode($deviceInfo, JSON_UNESCAPED_UNICODE) : null,
        ]);

        $feedbackId = (int)$pdo->lastInsertId();

        jsonResponse([
            'message' => '¡Reporte enviado exitosamente! Muchas gracias por ayudarnos a mejorar Levare.',
            'feedback' => [
                'id' => $feedbackId,
                'type' => $type,
                'title' => $title,
                'status' => 'pending',
                'attachments_count' => count($attachments),
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], 201);
    }

    /**
     * Get all feedback reports (Superadmin only)
     * Endpoint: GET /admin/feedback
     */
    public static function adminIndex(): void {
        $user = requireAuth();

        if (($user['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado. Se requieren privilegios de Super Administrador.'], 403);
        }

        $pdo = DB::getConnection();

        $statusFilter = $_GET['status'] ?? null;
        $typeFilter = $_GET['type'] ?? null;
        $search = trim($_GET['search'] ?? '');

        $sql = "
            SELECT 
                f.id,
                f.user_id,
                f.group_id,
                f.type,
                f.title,
                f.description,
                f.attachments,
                f.device_info,
                f.status,
                f.admin_notes,
                f.created_at,
                f.updated_at,
                u.name AS user_name,
                u.lastname AS user_lastname,
                u.username AS user_username,
                u.email AS user_email,
                u.avatar AS user_avatar,
                u.account_type AS user_account_type,
                g.name AS group_name
            FROM feedback_reports f
            INNER JOIN users u ON f.user_id = u.id
            LEFT JOIN `groups` g ON f.group_id = g.id
            WHERE 1=1
        ";

        $params = [];

        if (!empty($statusFilter) && in_array($statusFilter, ['pending', 'in_progress', 'resolved'])) {
            $sql .= " AND f.status = :status";
            $params['status'] = $statusFilter;
        }

        if (!empty($typeFilter) && in_array($typeFilter, ['bug', 'suggestion', 'visual', 'other'])) {
            $sql .= " AND f.type = :type";
            $params['type'] = $typeFilter;
        }

        if (!empty($search)) {
            $sql .= " AND (f.title LIKE :search_title OR f.description LIKE :search_desc OR u.name LIKE :search_name OR u.username LIKE :search_user)";
            $params['search_title'] = "%{$search}%";
            $params['search_desc'] = "%{$search}%";
            $params['search_name'] = "%{$search}%";
            $params['search_user'] = "%{$search}%";
        }

        $sql .= " ORDER BY f.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Calculate statistics
        $statsStmt = $pdo->query("
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
            FROM feedback_reports
        ");
        $stats = $statsStmt->fetch() ?: ['total' => 0, 'pending' => 0, 'in_progress' => 0, 'resolved' => 0];

        $reports = array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'user_id' => (int)$r['user_id'],
                'group_id' => $r['group_id'] ? (int)$r['group_id'] : null,
                'type' => $r['type'],
                'title' => $r['title'],
                'description' => $r['description'],
                'attachments' => !empty($r['attachments']) ? json_decode($r['attachments'], true) : [],
                'device_info' => !empty($r['device_info']) ? json_decode($r['device_info'], true) : null,
                'status' => $r['status'],
                'admin_notes' => $r['admin_notes'],
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at'],
                'user' => [
                    'id' => (int)$r['user_id'],
                    'name' => $r['user_name'],
                    'lastname' => $r['user_lastname'],
                    'username' => $r['user_username'],
                    'email' => $r['user_email'],
                    'avatar' => $r['user_avatar'],
                    'account_type' => $r['user_account_type']
                ],
                'group' => $r['group_name'] ? [
                    'id' => (int)$r['group_id'],
                    'name' => $r['group_name']
                ] : null
            ];
        }, $rows);

        jsonResponse([
            'stats' => [
                'total' => (int)($stats['total'] ?? 0),
                'pending' => (int)($stats['pending'] ?? 0),
                'in_progress' => (int)($stats['in_progress'] ?? 0),
                'resolved' => (int)($stats['resolved'] ?? 0),
            ],
            'reports' => $reports
        ]);
    }

    /**
     * Update report status and admin notes (Superadmin only)
     * Endpoint: POST /admin/feedback/status
     */
    public static function updateStatus(?int $paramId = null): void {
        $user = requireAuth();

        if (($user['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado. Se requieren privilegios de Super Administrador.'], 403);
        }

        $input = getJsonInput();
        $id = $paramId ?: (int)($input['id'] ?? ($_POST['id'] ?? 0));
        $status = trim($input['status'] ?? ($_POST['status'] ?? ''));
        $adminNotes = isset($input['admin_notes']) ? trim($input['admin_notes']) : (isset($_POST['admin_notes']) ? trim($_POST['admin_notes']) : null);

        if (!$id) {
            jsonResponse(['message' => 'El ID del reporte es obligatorio.'], 422);
        }

        $validStatuses = ['pending', 'in_progress', 'resolved'];
        if (!in_array($status, $validStatuses)) {
            jsonResponse(['message' => 'El estado proporcionado no es válido.'], 422);
        }

        $pdo = DB::getConnection();
        
        $sql = "UPDATE feedback_reports SET status = :status";
        $params = ['status' => $status, 'id' => $id];

        if ($adminNotes !== null) {
            $sql .= ", admin_notes = :admin_notes";
            $params['admin_notes'] = $adminNotes;
        }

        $sql .= ", updated_at = NOW() WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        jsonResponse([
            'message' => 'Estado del reporte actualizado correctamente.',
            'id' => $id,
            'status' => $status,
            'admin_notes' => $adminNotes
        ]);
    }

    /**
     * Delete a feedback report and clean up attachments (Superadmin only)
     * Endpoint: DELETE /admin/feedback/{id}
     */
    public static function destroy(int $id): void {
        $user = requireAuth();

        if (($user['account_type'] ?? '') !== 'superadmin') {
            jsonResponse(['message' => 'Acceso denegado. Se requieren privilegios de Super Administrador.'], 403);
        }

        if (!$id) {
            jsonResponse(['message' => 'ID de reporte inválido.'], 422);
        }

        $pdo = DB::getConnection();

        // Find report to delete files
        $stmtFind = $pdo->prepare("SELECT attachments FROM feedback_reports WHERE id = ? LIMIT 1");
        $stmtFind->execute([$id]);
        $report = $stmtFind->fetch();

        if (!$report) {
            jsonResponse(['message' => 'El reporte no fue encontrado.'], 404);
        }

        // Delete physical files
        if (!empty($report['attachments'])) {
            $files = json_decode($report['attachments'], true);
            if (is_array($files)) {
                foreach ($files as $file) {
                    $fullPath = __DIR__ . '/../../storage/' . ltrim($file, '/');
                    if (file_exists($fullPath) && is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
            }
        }

        $stmtDel = $pdo->prepare("DELETE FROM feedback_reports WHERE id = ?");
        $stmtDel->execute([$id]);

        jsonResponse(['message' => 'Reporte y sus adjuntos eliminados correctamente.']);
    }
}
