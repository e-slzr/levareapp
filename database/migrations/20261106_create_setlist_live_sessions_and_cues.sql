-- ==============================================================================
-- Migración: Sesiones de Live Sync y Cues en Vivo para Repertorios
-- Fecha: 2026-11-06
-- ==============================================================================

-- 1. Tabla de sesiones activas de Live Sync por repertorio
CREATE TABLE IF NOT EXISTS `setlist_live_sessions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `setlist_id` BIGINT UNSIGNED NOT NULL,
    `director_id` BIGINT UNSIGNED NOT NULL,
    `current_song_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `current_transpose` INT NOT NULL DEFAULT 0,
    `active_cue` VARCHAR(255) NULL DEFAULT NULL,
    `active_cue_type` VARCHAR(50) NULL DEFAULT NULL,
    `cue_timestamp` TIMESTAMP NULL DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `live_sessions_group_id_idx` (`group_id`),
    INDEX `live_sessions_setlist_id_idx` (`setlist_id`),
    INDEX `live_sessions_director_id_idx` (`director_id`),
    CONSTRAINT `live_sessions_group_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
    CONSTRAINT `live_sessions_setlist_fk` FOREIGN KEY (`setlist_id`) REFERENCES `setlists` (`id`) ON DELETE CASCADE,
    CONSTRAINT `live_sessions_director_fk` FOREIGN KEY (`director_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de indicaciones rápidas personalizadas individuales por líder
CREATE TABLE IF NOT EXISTS `user_quick_cues` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'general',
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `user_quick_cues_user_group_idx` (`user_id`, `group_id`),
    CONSTRAINT `user_quick_cues_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `user_quick_cues_group_fk` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
