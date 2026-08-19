-- Migration: Add Community Catalog, Group Songs pivot table, and Song Likes
-- Database: levareapp_dev

-- 1. Modify songs table to add is_public and is_deleted
ALTER TABLE songs 
ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 1 AFTER `key`,
ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 AFTER is_public;

-- 2. Create group_songs pivot table
CREATE TABLE IF NOT EXISTS group_songs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT UNSIGNED NOT NULL,
    song_id BIGINT UNSIGNED NOT NULL,
    added_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_group_song (group_id, song_id),
    INDEX idx_group_songs_group (group_id),
    INDEX idx_group_songs_song (song_id),
    INDEX idx_group_songs_added_by (added_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create song_likes table
CREATE TABLE IF NOT EXISTS song_likes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    song_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_song_user_like (song_id, user_id),
    INDEX idx_song_likes_song (song_id),
    INDEX idx_song_likes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Migrate existing songs into group_songs
INSERT IGNORE INTO group_songs (group_id, song_id, added_by, created_at)
SELECT group_id, id, created_by, COALESCE(created_at, NOW())
FROM songs;
