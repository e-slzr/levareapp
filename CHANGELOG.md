# 📝 Historial de Cambios (CHANGELOG)

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] - Próximamente

- **Corrección de estructura DOM y eliminación de espacio vacío en vistas secundarias**: En `views/setlists.php`, se eliminaron dos etiquetas de cierre `</div>` huérfanas tras el modal de repertorios que cerraban prematuramente `<main id="main-content">` y `<div id="main-container">`. Esto provocaba que las vistas ubicadas a continuación (`events`, `profile`, `members`, `suggestions`, `announcements`) quedaran por fuera del contenedor principal y directamente bajo `#app` (`flex justify-between`), empujando todo el contenido hacia abajo y dejando un área vacía de pantalla completa en la parte superior.
- **Depuración de ruido visual en el buscador de canciones para repertorios**: Al limpiar el término en el buscador (< 3 caracteres), se eliminó el bloque y listado redundante de «Canciones Seleccionadas:» que duplicaba los elementos ya organizados en la sección inferior de ordenación.
- **Corrección de zona horaria UTC y formateo legible de fecha/hora en Novedades y Anuncios**: En el dashboard y módulo de anuncios (`views/dashboard.php`, `dashboard.js`, `announcements.js`, `utils.js`), se implementó el parseo explícito de marcas de tiempo UTC (`parseUtcDate`) para convertir correctamente la hora a la zona horaria local del cliente (corrigiendo el desfase de 6 horas donde las 01:44 AM se interpretaban sin indicador UTC y se mostraban erróneamente como 07:44 hs). Se implementó el formateador `formatShortDateTime` para presentar un formato compacto y elegante con día de la semana, fecha y hora en formato de 12 horas con am/pm (ej. "vie 23 de oct - 1:44 am").
- **Ocultamiento de badge redundante de tono en canciones Medley**: En el catálogo de canciones (`assets/js/views/songs.js` y `songs-community.js`), se suprimió el badge de acorde situado junto a las acciones de edición/eliminación cuando la canción es de tipo Medley, preservando únicamente la etiqueta identificadora de Medley junto al artista/álbum y evitando la asignación errónea de un acorde fijo cuando la tonalidad varía dinámicamente.
- **Sincronización bidireccional continua entre Editor de Texto Plano y Constructor Visual**: Se resolvió la pérdida de modificaciones manuales en canciones al guardar desde la pestaña de texto plano o tras haber interactuado con el constructor interactivo. Ambos editores sincronizan su estado en tiempo real al conmutar pestañas, abrir/cerrar el modal de tarjetas o enviar el formulario (`handleSongWizardSubmit`), evitando que tarjetas obsoletas en memoria sobrescriban el texto corregido.
- **Despacho paralelo no bloqueante de notificaciones push (`curl_multi`)**: En `PushService::sendMultiple`, se sustituyó el bucle secuencial bloqueante por ejecución concurrente paralela mediante `curl_multi_exec` con timeout reducido a 3 segundos. Esto elimina el bloqueo del hilo de ejecución en el backend y evita que el botón de guardado en frontend quede congelado en «Guardando...» ante múltiples dispositivos suscritos (reduciendo el tiempo de despacho de más de 60 segundos a menos de 2 segundos).
- **Nacimiento estricto como Miembro y saneamiento de instrumento**: Corrección en `AuthController` para que los nuevos usuarios registrados nazcan siempre con rol `member` e instrumento musical `NULL` en `group_user`, evitando que se les otorguen facultades de líder indebidamente al registrarse sin banda o unirse mediante código.
- **Sincronización automática de perfil y permisos (`syncCurrentUserProfile`)**: Implementada sincronización en tiempo real del perfil (`/user/profile`) en `app.js` al iniciar la app y en eventos `visibilitychange`, actualizando `currentUser` en `localStorage` sin requerir cierre de sesión manual cuando un líder promueve o degrada integrantes.
- **Desbloqueo de edición de roles en modal de integrantes**: En `members.js`, se eliminó el bloqueo que impedía a los líderes degradar usuarios con permisos de líder a miembros de lectura, protegiendo únicamente la auto-degradación accidental y al creador original de la banda.
- **Blindaje y autorización en backend (`requireLeaderOrAdmin`)**: Implementado ayudante de seguridad estricto en `response.php` que bloquea con `403 Forbidden` cualquier intento de usuarios no líderes de crear, modificar o eliminar repertorios (`SetlistController`), eventos (`EventController`), integrantes y roles musicales (`MemberController`), y regeneración de códigos de invitación (`GroupController`).

- **Inversión y Agilización del Asistente de Canciones (Wizard en 2 Pasos)**:
  - Se reestructuró el flujo de registro y edición de canciones (`views/songs.php`, `assets/js/views/songs-wizard.js`, `assets/js/views/songs.js`): ahora inicia directamente en el **Paso 1: Letra y Acordes**, permitiendo escribir o pegar desde internet (LaCuerda.net / CifraClub) de inmediato y sin bloqueos previos.
  - Al avanzar al **Paso 2: Información General**, los campos de título, artista, álbum, tono y enlace multimedia se encuentran ya precargados si se importó de la web, o listos para ingresarse de forma manual.
  - Indicadores superiores interactivos (`#step-indicator-1` y `#step-indicator-2`) que permiten alternar entre pasos con un solo toque (clave para editar canciones existentes rápidamente).
  - Validación de título obligatoria al guardar: si el título está vacío, el asistente traslada automáticamente el foco al Paso 2 y enfoca el campo correspondiente.
- **Soporte de Títulos y Separadores Visuales de Canciones en Medleys**:
  - En el visor de canciones y modo presentación (`assets/js/transposer.js`, `assets/css/songs.css`), renderizado elegante y destacado de títulos individuales para cada tema en Medleys (`.lyrics-song-title-wrap`), empleando tipografía serif `Playfair Display` pura y una línea divisoria inferior que separa visualmente cada tema con distinción tipográfica sin desfasar acordes ni ocultarse en el modo «Solo Letra».
  - Sintaxis flexible y natural en el editor de canciones (`assets/js/chordParser.js`): soporte para encerrar entre llaves `{Tú Harás}` (estándar ChordPro), prefijo o envoltura con igual `= Tú Harás =` o `= Tú Harás`, encabezados Markdown `## Tú Harás`, guiones `-- Tú Harás --`, asteriscos `* Tú Harás *` o etiquetas `[TÍTULO: Tú Harás]`.
  - Integración en el **Editor Interactivo** (`views/songs.php`, `assets/js/views/songs-wizard.js`): nuevo botón `[TÍTULO DE CANCIÓN]` en el modal selector de secciones que genera una tarjeta de banner dedicada con campo de texto directo, compatible con el sistema de reordenamiento Drag & Drop, modo ordenar colapsado y sincronización bidireccional continua con el editor de texto plano.
- **Flujo en 2 Pasos (Wizard) para Crear y Editar Repertorios**: Se rediseñó el modal de repertorios (`views/setlists.php`, `assets/js/views/setlists.js`) en un proceso guiado de dos etapas: *Paso 1: Información General* (nombre del repertorio y un campo `<textarea>` amplio y cómodo para notas/descripción) y *Paso 2: Búsqueda y Selección de Canciones*, con resumen en cabecera, conteo dinámico de temas y navegación clara con botones «Continuar», «Atrás» y «Guardar Repertorio».
- **Modo «Solo Letra» en Visor de Repertorios para Vocalistas**: Se implementó un interruptor en la barra superior de la vista de presentación de repertorios (`btn-pres-toggle-lyrics-mode`, `assets/css/songs.css`, `assets/js/views/setlists.js`) que oculta acordes (`.chord-el`) y líneas instrumentales (`.instrumental-line`), mostrando la lírica limpia y sin ruido visual para cantantes, al tiempo que atenúa los controles de transposición.
- **Asignación de Múltiples Roles Musicales / Instrumentos por Integrante con Rol Principal**:
  - En base de datos (`group_user.roles`), migración DDL (`database/migrations/20261023_add_multiple_roles_to_group_user.sql`) y actualización de `master_schema.sql` para almacenar colecciones de roles en formato JSON preservando compatibilidad retroactiva total con `group_user.role` como el Instrumento Principal.
  - En backend (`MemberController.php`, `GroupController.php`), deserialización y gestión de persistencia de múltiples roles e instrumento principal.
  - En la interfaz de integrantes (`views/members.php`, `assets/js/views/members.js`), reemplazo del selector simple por un constructor visual de chips interactivos: permite asociar múltiples instrumentos a un miembro, promover dinámicamente cualquier rol a Instrumento Principal mediante clic en la estrella (`fa-star`).
  - **Armonía visual en tarjetas de miembros**: Se simplificó la visualización de roles secundarios reemplazando la lista expandida por un badge sutil `+N` junto al rol principal (con tooltip descriptivo), garantizando una altura uniforme en el grid del directorio.
  - En el perfil del usuario (`assets/js/views/profile.js`), presentación de la lista completa de roles musicales asignados al usuario en la banda activa.
- **Constructor Dinámico de Roster en 2 Pasos y Puestos Múltiples al Programar Eventos**:
  - **Flujo Guiado en Dos Pasos (Wizard)**: El modal de programación de eventos (`views/events.php`, `assets/js/views/events.js`) se dividió en dos pasos con indicador dinámico en el encabezado: *Paso 1: Información General* (nombre, fecha, hora, tipo, repertorio y notas) y *Paso 2: Roster y Músicos*, despejando la interfaz y maximizando el espacio para el armado del equipo.
  - **Barra de Roles Rápidos Estilizada y Ordenada**: Píldoras con estética ámbar translúcida (`border-amber-500/30 bg-amber-500/10`) ordenadas alfabéticamente para una separación visual nítida y acceso inmediato.
  - **Puestos múltiples y duplicación rápida**: Cada puesto cuenta con duplicación con un clic (`+`) y eliminación (`×`).
  - **Filtrado estricto por aptitud**: Cada puesto despliega exclusivamente a los integrantes capacitados para ese instrumento.
  - **Tarjetas de eventos con fila única de convocados**: En el listado general de eventos, los músicos asignados se condensan en una sola línea no desbordante mostrando los dos primeros convocados y un badge compacto `+N` con tooltip para el resto.
  - En backend (`EventController.php`), inserción con `INSERT IGNORE` en `event_musicians` para soportar de manera robusta asignaciones múltiples del mismo rol con distintos integrantes.
- **Overlay global de retroalimentación de guardado (`showLoadingOverlay`)**: Implementado un componente modal minimalista y dual-mode con spinner vectorial (`fa-circle-notch`) y texto descriptivo dinámico sobre un fondo translúcido (`z-[100]`). Se integró automáticamente con estado de deshabilitación y etiqueta «Guardando...» en los botones de acción al guardar canciones (`views/songs.php`), repertorios (`views/setlists.php`), eventos (`views/events.php`) e importaciones comunitarias, evitando reenvíos accidentales y dando retroalimentación visual inmediata mientras se procesan las peticiones y el despacho de notificaciones push.
- **Migración de normalización de roles (`20261020_normalize_member_roles_and_permissions.sql`)**: Establece por defecto a nivel DDL `account_type = 'member'` y limpia roles residuales con valor `'Líder'` en la columna de instrumentos `group_user.role`.

### Planned
- Metrónomo interactivo con BPM asociado por canción.
- Afinador cromático en tiempo real (Web Audio API).
- Configuración de Capo y Tono individual por músico.
- Modo Director / Live Sync en tiempo real (roles dinámicos, cambio de canción y transposición sincronizada).
- Live Sync Offline vía red local / P2P con emparejamiento por código QR.

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
- **Eliminación del refresco involuntario al recuperar el foco de la ventana (`visibilitychange`)**: Se ajustó la sincronización en segundo plano en `app.js` y `groups.js` para que solo valide el estado de membresía o bloqueo sin forzar la re-inicialización destructiva de la vista activa. Esto protege de forma definitiva el trabajo no guardado en el editor de canciones (`subpanel-song-wizard`), evita el cierre del visor de acordes (`subpanel-song-detail`) y preserva la paginación acumulada ("Cargar más") tanto en el catálogo comunitario como en el repertorio propio al alternar entre aplicaciones.
- Corregido error de superposición visual donde el Wizard de edición de canciones no ocultaba el subpanel del catálogo comunitario al abrirse.
- Corregido error en el editor de canciones donde tarjetas obsoletas en segundo plano sobrescribían letras y acordes pegados desde internet al guardar.
- Corregido el problema de renderizado y desborde horizontal del selector de fecha (`input[type="date"]`) en iOS Safari / WebKit mediante normalización CSS `appearance-none` y `box-sizing: border-box !important`.
- Corregido solapamiento de íconos sobre el texto del *placeholder* en campos de entrada asegurando padding izquierdo prioritario (`!pl-10`).
- Corregido parpadeo inicial del Dashboard al recargar en rutas secundarias (`#profile`, `#songs`, etc.) haciendo la conmutación de paneles síncrona en el enrutador JS.
- Corregido reemplazo de contenido del botón de cambiar foto de perfil al subir o eliminar avatares.

### Changed
- **Refactorización y Modularización de la SPA Frontend**: Desacoplamiento de archivos monolíticos en submódulos especializados con documentación JSDoc:
  - `theme.js`: Gestión de modo oscuro/claro y colores de acento.
  - `auth.js`: Formularios de autenticación, onboarding, validación de contraseñas y sesiones.
  - `groups.js`: Multi-tenancy, sincronización de bandas, selectores de espacio de trabajo y creación/unión a grupos.
  - `pwa.js`: Registro de Service Worker, control de eventos `beforeinstallprompt` e instalación guiada.
  - `app.js`: Reducción del tamaño del enrutador central de 52 KB a 20 KB enfocado exclusivamente en ciclo de vida y navegación hash.
  - `views/songs-wizard.js`: Wizard de 2 pasos, Constructor Visual de Acordes interactivo por tarjetas, drag & drop de secciones/acordes, modales de selección e importador inteligente.
  - `views/songs-community.js`: Exploración paginada del catálogo comunitario, búsqueda con debounce, sistema de likes, vista previa e importación a la banda.
  - `views/songs.js`: Reducción del controlador de canciones de 118 KB a 26 KB enfocado en el catálogo local de la banda, eliminación y visor de letra con transposición/autoscroll.
- Depuración y eliminación de artistas y medleys no deseados del catálogo comunitario oficial (Jesús Adrián Romero, Josué del Cid, Coalo Zamorano, Danny Berríos, Jaime Murrell, Gateway Worship Español) y ajuste de archivos de migración.
- Actualización de **Normas y Directrices de Desarrollo (`.agents/AGENTS.md`)**: Incorporación de la regla obligatoria de modularidad frontend, prohibición de archivos monolíticos y estándar JSDoc.
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
