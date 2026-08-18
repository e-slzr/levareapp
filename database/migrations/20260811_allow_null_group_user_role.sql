-- Migración: Permitir NULL en la columna role de group_user para miembros sin rol musical asignado
ALTER TABLE `group_user` MODIFY `role` VARCHAR(255) NULL DEFAULT NULL;
