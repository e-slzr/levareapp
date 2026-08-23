-- ==============================================================================
-- Migration: Create feedback_reports Table (Levare v1.0 Beta)
-- Date: 2026-08-22
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `feedback_reports` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `type` ENUM('bug', 'suggestion', 'visual', 'other') NOT NULL DEFAULT 'bug',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `attachments` JSON NULL DEFAULT NULL,
    `device_info` JSON NULL DEFAULT NULL,
    `status` ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
    `admin_notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `feedback_reports_user_id_foreign` (`user_id`),
    INDEX `feedback_reports_group_id_foreign` (`group_id`),
    INDEX `feedback_reports_status_index` (`status`),
    CONSTRAINT `feedback_reports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `feedback_reports_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
