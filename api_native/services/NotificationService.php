<?php
/**
 * Unified Notification Service for Levare OS
 * Handles In-App Dashboard Announcements & Real-Time Web Push Notifications
 */

require_once __DIR__ . '/PushService.php';

class NotificationService {

    /**
     * Notify all members of a group/band (excluding the sender)
     *
     * @param int $groupId Active Group ID
     * @param int|null $senderUserId User who triggered the action (excluded from push)
     * @param array $data Notification details:
     *   - 'type': 'blue' | 'green' | 'purple' | 'amber'
     *   - 'text': string (text to show in Dashboard announcements)
     *   - 'title': string (Push notification title)
     *   - 'body': string (Push notification body text)
     *   - 'url': string (Target SPA route/view, e.g. '#songs', '#setlists', '#events', '#suggestions')
     *   - 'meta': array (Structured metadata: song_id, event_id, group_name, author_name, etc.)
     */
    public static function notifyGroup(int $groupId, ?int $senderUserId, array $data): void {
        $pdo = DB::getConnection();

        $type = $data['type'] ?? 'blue';
        $text = $data['text'] ?? '';
        $meta = isset($data['meta']) ? json_encode($data['meta'], JSON_UNESCAPED_UNICODE) : null;

        // 1. Insert announcement into database for the band feed
        try {
            $stmtAnn = $pdo->prepare("
                INSERT INTO announcements (group_id, user_id, text, type, meta, created_at, updated_at) 
                VALUES (?, NULL, ?, ?, ?, NOW(), NOW())
            ");
            $stmtAnn->execute([$groupId, $text, $type, $meta]);
        } catch (\Throwable $e) {
            error_log("Error saving group announcement: " . $e->getMessage());
        }

        // 2. Fetch push subscriptions of group members (excluding sender)
        try {
            if ($senderUserId) {
                $stmtSubs = $pdo->prepare("
                    SELECT ps.endpoint, ps.p256dh, ps.auth 
                    FROM push_subscriptions ps
                    JOIN group_user gu ON gu.user_id = ps.user_id
                    WHERE gu.group_id = ? AND ps.user_id != ?
                ");
                $stmtSubs->execute([$groupId, $senderUserId]);
            } else {
                $stmtSubs = $pdo->prepare("
                    SELECT ps.endpoint, ps.p256dh, ps.auth 
                    FROM push_subscriptions ps
                    JOIN group_user gu ON gu.user_id = ps.user_id
                    WHERE gu.group_id = ?
                ");
                $stmtSubs->execute([$groupId]);
            }

            $subscriptions = $stmtSubs->fetchAll();

            if (!empty($subscriptions)) {
                $pushPayload = [
                    'title' => $data['title'] ?? 'Levare OS',
                    'body'  => $data['body'] ?? $text,
                    'icon'  => './icon-levareapp.svg?v=2.0.1',
                    'badge' => './icon-levareapp.svg?v=2.0.1',
                    'data'  => [
                        'url'      => $data['url'] ?? './',
                        'groupId'  => $groupId,
                        'category' => $data['category'] ?? 'group',
                        'meta'     => $data['meta'] ?? []
                    ]
                ];

                PushService::sendMultiple($subscriptions, $pushPayload);
            }
        } catch (\Throwable $e) {
            error_log("Error sending group push notifications: " . $e->getMessage());
        }
    }

    /**
     * Notify a specific user (e.g. Community Likes, Direct mentions)
     *
     * @param int $targetUserId User recipient
     * @param int|null $senderUserId User who triggered the action
     * @param array $data Notification details:
     *   - 'type': 'purple' | 'amber' | 'blue'
     *   - 'text': string
     *   - 'title': string
     *   - 'body': string
     *   - 'url': string
     *   - 'meta': array
     */
    public static function notifyUser(int $targetUserId, ?int $senderUserId, array $data): void {
        // Do not notify self
        if ($senderUserId && $targetUserId === $senderUserId) {
            return;
        }

        $pdo = DB::getConnection();

        $type = $data['type'] ?? 'purple';
        $text = $data['text'] ?? '';
        $meta = isset($data['meta']) ? json_encode($data['meta'], JSON_UNESCAPED_UNICODE) : null;

        // 1. Insert personal announcement into database
        try {
            $stmtAnn = $pdo->prepare("
                INSERT INTO announcements (group_id, user_id, text, type, meta, created_at, updated_at) 
                VALUES (NULL, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmtAnn->execute([$targetUserId, $text, $type, $meta]);
        } catch (\Throwable $e) {
            error_log("Error saving personal announcement: " . $e->getMessage());
        }

        // 2. Fetch target user's push subscriptions
        try {
            $stmtSubs = $pdo->prepare("
                SELECT endpoint, p256dh, auth 
                FROM push_subscriptions 
                WHERE user_id = ?
            ");
            $stmtSubs->execute([$targetUserId]);
            $subscriptions = $stmtSubs->fetchAll();

            if (!empty($subscriptions)) {
                $pushPayload = [
                    'title' => $data['title'] ?? 'Levare OS • Comunidad',
                    'body'  => $data['body'] ?? $text,
                    'icon'  => './icon-levareapp.svg?v=2.0.1',
                    'badge' => './icon-levareapp.svg?v=2.0.1',
                    'data'  => [
                        'url'      => $data['url'] ?? './',
                        'category' => 'community',
                        'meta'     => $data['meta'] ?? []
                    ]
                ];

                PushService::sendMultiple($subscriptions, $pushPayload);
            }
        } catch (\Throwable $e) {
            error_log("Error sending user push notifications: " . $e->getMessage());
        }
    }
}
