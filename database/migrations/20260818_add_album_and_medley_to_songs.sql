-- Migración: Agregar album e is_medley a la tabla songs
ALTER TABLE `songs` 
ADD COLUMN `album` VARCHAR(255) NULL AFTER `artist`,
ADD COLUMN `is_medley` TINYINT(1) NOT NULL DEFAULT 0 AFTER `key`;
