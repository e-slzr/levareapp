-- ==============================================================================
-- Migración: Normalización de permisos de usuario y roles en grupo
-- Fecha: 2026-10-20
-- ==============================================================================

-- 1. Garantizar que la columna account_type tenga valor por defecto 'member'
ALTER TABLE `users` MODIFY `account_type` ENUM('superadmin', 'leader', 'member') NOT NULL DEFAULT 'member';

-- 2. Limpiar registros donde se haya guardado 'Líder' como rol musical en group_user
-- (La columna role en group_user representa el instrumento musical, no el permiso de sistema)
UPDATE `group_user` SET `role` = NULL WHERE `role` = 'Líder';
