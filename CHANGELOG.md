# 📝 Historial de Cambios (CHANGELOG)

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] - Próximamente

### Planned
- Metrónomo interactivo con BPM asociado por canción.
- Afinador cromático en tiempo real (Web Audio API).
- Configuración de Capo y Tono individual por músico.
- Sincronización de pantallas en tiempo real (Live Sync) para líderes y músicos.

---

## [1.0.0-beta] - 2026-08-24

### Added
- Depuración, estructuración y actualización integral del **Catálogo Oficial de la Comunidad**: 59 canciones verificadas con acordes precisos, estructura Levare (`[INTRO]`, `[VERSO]`, `[CORO]`, etc.) y tonos correspondientes para 15 artistas.
- Tarjetas de estadísticas interactivas en el **Dashboard de Superadministrador**: acceso directo al Directorio de Usuarios y al Catálogo de Canciones de la Comunidad.
- Sistema de **gestión y moderación comunitaria para Superadministradores**: capacidad de editar y eliminar cualquier canción del catálogo comunitario desde las tarjetas y el modal de vista previa.
- Sistema de **versionado automático de assets (`asset_v`)** utilizando marcas de tiempo de modificación de archivos (`filemtime`).
- Estrategia **Network-First con fallback a Caché** en el Service Worker PWA (`sw.js?v=2.0.7`) para garantizar actualización transparente de código en dispositivos iOS/Android.
- Botón de acceso directo al **Catálogo de la Comunidad** en la cabecera de canciones disponible para todos los miembros, con control de permisos para que la importación a la banda sea exclusiva de líderes/editores.
- Persistencia de navegación para el catálogo comunitario mediante ruta hash (`#community`) al recargar la página.
- Opción condicional al eliminar canciones: permitiendo al autor desvincular una canción de su banda activa mientras **conserva su disponibilidad pública en la Comunidad Levare**.
- Modal interactivo para reportar feedback y fallos desde el perfil del usuario.
- Soporte para notificaciones push web comunitarias y pruebas de envío en dispositivos.

### Fixed
- Corregido error de superposición visual donde el Wizard de edición de canciones no ocultaba el subpanel del catálogo comunitario al abrirse.
- Corregido error en el editor de canciones donde tarjetas obsoletas en segundo plano sobrescribían letras y acordes pegados desde internet al guardar.
- Corregido el problema de renderizado y desborde horizontal del selector de fecha (`input[type="date"]`) en iOS Safari / WebKit mediante normalización CSS `appearance-none` y `box-sizing: border-box !important`.
- Corregido solapamiento de íconos sobre el texto del *placeholder* en campos de entrada asegurando padding izquierdo prioritario (`!pl-10`).
- Corregido parpadeo inicial del Dashboard al recargar en rutas secundarias (`#profile`, `#songs`, etc.) haciendo la conmutación de paneles síncrona en el enrutador JS.
- Corregido reemplazo de contenido del botón de cambiar foto de perfil al subir o eliminar avatares.

### Changed
- Depuración y eliminación de artistas y medleys no deseados del catálogo comunitario oficial (Jesús Adrián Romero, Josué del Cid, Coalo Zamorano, Danny Berríos, Jaime Murrell, Gateway Worship Español) y ajuste de archivos de migración.
- Migración completa de vistas HTML secundarias a componentes modulares PHP.
- Eliminación de archivos `.html` obsoletos e ícono `favicon.ico` en favor de `icon-levareapp.svg`.

---

## [0.9.0-beta] - 2026-08-19

### Added
- Implementación del módulo de Catálogo Comunitario Levare y sistema de votación de sugerencias musicales.
- Puntos de comunidad por contribución de canciones.
- Módulo de Anuncios y Novedades globales.

---

## [0.8.0-alpha] - 2026-08-11

### Added
- Lanzamiento inicial de la arquitectura SPA modular con Backend PHP Nativo (PDO).
- Módulos de Canciones, Repertorios (Setlists), Eventos, Miembros y Autenticación Multi-tenant.
