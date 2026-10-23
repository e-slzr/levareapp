-- ==============================================================================
-- Migración: Soporte para múltiples roles musicales por integrante en banda
-- Fecha: 2026-10-23
-- ==============================================================================

-- 1. Agregar columna `roles` (JSON / TEXT) en `group_user` para almacenar todos los instrumentos del miembro
ALTER TABLE `group_user` ADD COLUMN `roles` TEXT NULL DEFAULT NULL AFTER `role`;

-- 2. Sincronizar los registros existentes que ya tenían un rol único en la columna `role`
UPDATE `group_user` SET `roles` = JSON_ARRAY(`role`) WHERE `role` IS NOT NULL AND `role` != '';
