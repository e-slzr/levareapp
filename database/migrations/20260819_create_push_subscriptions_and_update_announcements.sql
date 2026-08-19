-- Migration: Create push_subscriptions table and update announcements for community/personal notifications and metadata
-- Database: levareapp_dev

-- 1. Create push_subscriptions table for Web Push / VAPID
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `endpoint` TEXT NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `user_agent` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_push_user` (`user_id`),
    CONSTRAINT `fk_push_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Update announcements table to support personal/community notifications and rich metadata
ALTER TABLE `announcements` 
DROP FOREIGN KEY `announcements_group_id_foreign`;

ALTER TABLE `announcements` 
MODIFY `group_id` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
ADD CONSTRAINT `announcements_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE;

ALTER TABLE `announcements` 
ADD COLUMN `user_id` BIGINT(20) UNSIGNED NULL DEFAULT NULL AFTER `group_id`,
ADD COLUMN `meta` JSON NULL DEFAULT NULL AFTER `type`,
ADD INDEX `idx_announcements_user` (`user_id`),
ADD CONSTRAINT `fk_announcements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
