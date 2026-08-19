<?php
/**
 * Push Notifications Controller for Levare OS API
 */

require_once __DIR__ . '/../services/PushService.php';
require_once __DIR__ . '/../services/NotificationService.php';

class PushController {

    /**
     * Get VAPID Public Key for client browser subscription
     * Endpoint: GET /push/vapid-public-key
     */
    public static function getVapidPublicKey(): void {
        $publicKey = PushService::getPublicKey();
        jsonResponse(['publicKey' => $publicKey]);
    }

    /**
     * Save/Update a WebPush subscription for the authenticated user
     * Endpoint: POST /push/subscribe
     */
    public static function subscribe(): void {
        $user = requireAuth();
        $data = getJsonInput();

        $endpoint = trim($data['endpoint'] ?? '');
        $keys = $data['keys'] ?? [];
        $p256dh = trim($keys['p256dh'] ?? ($data['p256dh'] ?? ''));
        $auth = trim($keys['auth'] ?? ($data['auth'] ?? ''));
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? ($data['user_agent'] ?? null);

        if (empty($endpoint) || empty($p256dh) || empty($auth)) {
            jsonResponse(['message' => 'Parámetros de suscripción inválidos.'], 422);
        }

        $pdo = DB::getConnection();

        // Check if endpoint already exists
        $stmtCheck = $pdo->prepare("SELECT id FROM push_subscriptions WHERE endpoint = ? LIMIT 1");
        $stmtCheck->execute([$endpoint]);
        $existing = $stmtCheck->fetch();

        if ($existing) {
            $stmtUpd = $pdo->prepare("
                UPDATE push_subscriptions 
                SET user_id = ?, p256dh = ?, auth = ?, user_agent = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmtUpd->execute([$user['id'], $p256dh, $auth, $userAgent, $existing['id']]);
        } else {
            $stmtIns = $pdo->prepare("
                INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmtIns->execute([$user['id'], $endpoint, $p256dh, $auth, $userAgent]);
        }

        jsonResponse([
            'message' => 'Dispositivo suscrito a notificaciones push exitosamente.',
            'subscribed' => true
        ], 201);
    }

    /**
     * Remove a WebPush subscription
     * Endpoint: POST /push/unsubscribe
     */
    public static function unsubscribe(): void {
        $user = requireAuth();
        $data = getJsonInput();

        $endpoint = trim($data['endpoint'] ?? '');
        if (empty($endpoint)) {
            jsonResponse(['message' => 'Endpoint requerido.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?");
        $stmt->execute([$endpoint, $user['id']]);

        jsonResponse([
            'message' => 'Dispositivo desuscrito correctamente.',
            'subscribed' => false
        ]);
    }

    /**
     * Check subscription status for current user
     * Endpoint: GET /push/status
     */
    public static function status(): void {
        $user = requireAuth();
        $pdo = DB::getConnection();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM push_subscriptions WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $count = (int)$stmt->fetch()['total'];

        jsonResponse([
            'has_subscriptions' => $count > 0,
            'active_devices' => $count
        ]);
    }

    /**
     * Send a test push notification to the current user
     * Endpoint: POST /push/test
     */
    public static function test(): void {
        $user = requireAuth();
        
        NotificationService::notifyUser((int)$user['id'], null, [
            'type'     => 'purple',
            'title'    => 'Levare OS • Notificaciones Activas',
            'body'     => "¡Hola, {$user['name']}! Las notificaciones en tu dispositivo están configuradas correctamente.",
            'text'     => "Prueba de notificación push ejecutada con éxito.",
            'category' => 'system',
            'url'      => './'
        ]);

        jsonResponse([
            'message' => 'Notificación de prueba enviada a tus dispositivos registrados.'
        ]);
    }
}
