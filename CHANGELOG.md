# Historial de Cambios (CHANGELOG)

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased] - Próximamente

- **Ajuste Ergonómico y Alineación en Modal de Restablecer Contraseña**:
  - En `views/includes/modals.php`, se simplificó el texto del botón principal de acción a solo «Restablecer» (removiendo «Confirmar»), evitando que su extensión desalinee o comprima el botón «Cancelar» en pantallas móviles.
  - Se homogeneizó el alineamiento vertical (`align-items: center`) y el espaciado flexible en el pie del modal (`#reset-password-confirm-step`).
  - En `assets/js/views/members.js`, se sincronizó el texto del botón en `openResetPasswordModal` y en el estado final de `handleResetPasswordSubmit` para mantener «Restablecer».

- **Transformación de Código de Invitación en Modal Popup y Botones Compactos de Cabecera**:
  - En `views/band.php`, se eliminó la tarjeta fija del código de invitación de la vista principal tanto en móvil como en escritorio, dejando un diseño mucho más limpio, fluido y directo hacia las pestañas de gestión.
  - Se implementó un nuevo botón compacto de compartir (solo icono `fa-share-nodes`, sin texto) en la cabecera de la banda junto a «Editar Información», que abre el popup interactivo `#modal-band-invite-code`.
  - El botón de «Editar Información» se optimizó para vista móvil colapsando su texto a solo icono (`fa-pen`) mediante `hidden sm:inline`, unificando la estética de iconos táctiles cuadrados minimalistas (`w-9 h-9`).
  - Se incorporó el modal popup `#modal-band-invite-code` con el código numérico destacado en tipografía mono, acciones de copiado al portapapeles, compartir vía Web Share API y regeneración con confirmación.
  - En `assets/js/views/band.js`, se añadieron y expusieron globalmente los controladores `openBandInviteModal()` y `closeBandInviteModal()`.

- **Eliminación de Tarjetas de Estadísticas y Corrección de Interactividad en Modales de Integrantes en Banda**:
  - En `views/band.php`, se eliminó la sección superior de tarjetas de estadísticas cuantitativas (integrantes, canciones, repertorios) a petición del usuario para brindar una cabecera más sobria y directa enfocada en la administración musical.
  - En `views/includes/modals.php` y `views/members.php`, se reubicaron los 6 modales de administración de integrantes (`#modal-member`, `#modal-reset-password`, `#modal-manage-roles`, `#modal-confirm-reset-invite-code`, `#modal-confirm-delete-member`, `#modal-confirm-delete-role`) sacándolos del contenedor local `#panel-members` (el cual permanecía oculto con `.hidden` en `#band`) y situándolos en el contenedor global de modales de la aplicación, garantizando que sean visibles en cualquier pantalla.
  - En `assets/js/views/members.js`, se implementó la función desacoplada `bindMemberModalsEvents()` vinculada en la carga del DOM y en la apertura de modales, asegurando el funcionamiento inmediato de botones de cierre, cancelación y formularios aún si el usuario navega directamente a la vista `#band`.
  - En `assets/js/views/members.js` y `assets/js/views/band.js`, se actualizó la resolución de datos en `openEditMemberModal` y `openResetPasswordModal` para consultar concurrentemente `cachedMembers`, `currentBandMembers` y la API REST `/members`, evitando retornos silenciosos por listas locales vacías, y se enlazó la recarga reactiva bidireccional (`loadBandMembers` y `renderMembers`) tras registrar, editar o eliminar miembros y roles.

- **Corrección de Conflicto de Declaración Global y Soporte de Navegación en Tablet y PC**:
  - En `assets/js/views/band.js`, se corrigió el error sintáctico bloqueante `Uncaught SyntaxError: Identifier 'pendingDeleteCueId' has already been declared` eliminando la variable residual duplicada con `assets/js/views/setlists-live.js`, lo cual impedía que el navegador ejecutara el script y expusiera `initBandView`.
  - En `views/includes/navbar.php` y `assets/js/app.js`, se incorporaron en la barra fija de navegación para Tablet y PC (`desktop-only-nav`) los botones específicos de acceso: «Banda» (`#desktop-nav-btn-band`, visible para líderes y superadmins con icono `fa-users-gear`) y «Miembros» (`#desktop-nav-btn-members`, visible para músicos regulares con icono `fa-users`), manteniendo simetría total con el selector dinámico del menú móvil.
  - Se implementó la función centralizada `updateBandNavVisibility()` en `app.js` ejecutada en el arranque, al navegar y al abrir el menú móvil para mantener coordinada la visibilidad en todos los dispositivos.

- **Optimización y Carga Reactiva de la Vista Banda y Ajuste Ergonómico del Menú**:
  - En `views/includes/navbar.php` y `views/members.php`, se renombró la etiqueta del botón administrativo de «Gestionar Banda» a simplemente «Banda», preservando una cuadrícula simétrica, limpia y de una sola línea junto a «Sugerencias» y «Perfil» sin deformar la altura de las tarjetas táctiles en el menú inferior «Más».
  - En `assets/js/views/band.js`, se robusteció la inicialización de la vista (`initBandView`) desacoplando las consultas a la API mediante `Promise.allSettled` para cargar en paralelo detalles del grupo (`/groups/{id}`), integrantes (`/members`) y atajos personales (`/quick-cues`) sin bloqueos en cascada.
  - Se añadieron resolutores tolerantes a fallos (`getResolvedGroupId` e `isUserLeaderOrAdmin`) consultando tanto almacenamiento local (`localStorage`) como variables globales de sesión, defensas en los manejadores de eventos sobre el listado de miembros y atajos, y un activador reactivo automático al montarse el módulo si la URL ya se encuentra en `#band`.
  - En `assets/js/app.js`, se sincronizó la lista de vistas protegidas (`restrictedViews` y `permissionSensitiveViews`) incluyendo `'band'`, se actualizó el título de la página en la cabecera a «Banda» y se mejoró `navigateTo` para despachar `handleHashRouting()` directamente si el usuario pulsa el botón mientras ya se encuentra en la misma vista hash.

- **Módulo Centralizado de Gestión de Banda y Ajustes de Roles y Seguridad**:
  - En `views/band.php` y `assets/js/views/band.js`, se implementó la nueva vista centralizada «Gestionar Banda» exclusiva para usuarios con rol de Líder o Administrador (`canEdit()`), que consolida en un único espacio: edición de nombre y descripción de la banda, tarjeta del código de invitación (con copia, compartir y regeneración asistida), directorio de integrantes con asignación de roles e instrumentos, gestor dedicado de atajos de indicaciones en vivo (Live Cues) y zona de peligro para abandonar la banda o eliminarla definitivamente requiriendo escribir el nombre exacto del grupo para confirmar.
  - En `api_native/controllers/GroupController.php` y `api_native/index.php`, se implementaron los endpoints REST `GET /groups/{id}`, `PUT /groups/{id}`, `DELETE /groups/{id}` (con verificación estricta de nombre de confirmación y eliminación en cascada) y `POST /groups/{id}/leave`.
  - En `views/includes/navbar.php` y `assets/js/app.js`, se integró la adaptación reactiva del menú «Más»: para líderes se despliega el acceso directo a «Gestionar Banda» (`fa-users-gear`), mientras que para músicos comunes se despliega «Miembros» (`fa-users`) en modo directorio de solo lectura, con guardias de enrutamiento que redirigen automáticamente a los miembros comunes si intentan acceder a la ruta administrativa `#band`.
  - En `views/profile.php`, se simplificó la sección de agrupaciones reduciendo su prominencia a una subsección sobria y secundaria para crear una nueva banda o unirse mediante código de invitación, y se retiró el acceso duplicado de miembros para mantener el perfil estrictamente personal.

- **Blindaje de navegación y bloqueo de salida de pantalla durante el Modo Emisión (Live Sync)**:
  - En `assets/js/views/setlists.js` y `assets/js/app.js`, se blindó el Modo Presentación cuando una Emisión en Vivo está en curso: si el Director intenta salir mediante el botón de regreso, el menú de navegación inferior o cambiando la URL/hash, la salida queda bloqueada, emitiendo una advertencia y abriendo automáticamente el modal de confirmación para finalizar la emisión.
  - Del mismo modo, si un integrante conectado como seguidor intenta navegar fuera de la presentación, la navegación se intercepta hasta que pulse el botón de desconexión, evitando sesiones abandonadas y pérdidas accidentales de sincronización en el escenario.

- **Refinamiento de botones de Emisión y reemplazo de confirmaciones nativas por modales HTML**:
  - El botón superior de emisión en presentación (`#btn-pres-live-sync-toggle` y sus variantes en Tablet/PC) inicia la transmisión inmediatamente sin abrir el panel de mensajes y adopta un color rojo vibrante con animación de pulso (`bg-red-600 text-white animate-pulse border-red-500`) indicando «En Emisión», y al pulsarse nuevamente abre el modal interactivo de confirmación.
  - El botón flotante FAB (`#btn-pres-cue-pad-trigger`) fue desacoplado para abrir exclusivamente el panel de indicaciones rápidas sin arrancar la emisión de forma automática, incorporando un indicador de estado y un botón directo «Iniciar Emisión» dentro del panel.
  - Se eliminaron todos los diálogos nativos del navegador (`confirm()`) sustituyéndolos por modales minimalistas con estética dual para finalizar la emisión y eliminar atajos personales.

- **Corrección de visibilidad de controles de Emisión / Live Sync en Móvil, Tablet y PC**:
  - En `assets/js/views/setlists-live.js`, se corrigió la validación de rol de líder reemplazando la referencia inexistente `getCurrentUser()` por la función central estándar `canEdit()` con fallback a `getData('currentUser')`, resolviendo el problema donde los botones de emisión permanecían ocultos para líderes de banda en el visor.
  - En `views/setlists.php`, se integraron los botones de Emisión específicos para la experiencia en Tablet y PC: botón visible en la cabecera del panel lateral expandido (`#btn-sidebar-pres-live-sync`) y botón circular en el riel colapsado (`#btn-rail-pres-live-sync`), además del botón en la cabecera principal (`#btn-pres-live-sync-toggle`) y el botón flotante Speed Dial FAB (`#btn-pres-cue-pad-trigger`).
  - Se unificó la lógica en `updateDirectorButtonsUI()` para actualizar sincronizadamente todos los botones de emisión según el estado (listo para emitir vs. transmitiendo en vivo).

- **Modo Director, Live Sync y Despacho de Indicaciones en Vivo (Live Cues)**:
  - En `database/migrations/20261106_create_setlist_live_sessions_and_cues.sql` y `database/master_schema.sql`, se incorporaron las tablas `setlist_live_sessions` (para el control de sesión en vivo, director activo, canción, transposición y avisos) y `user_quick_cues` (para el banco de atajos privados individuales de cada líder).
  - En `api_native/controllers/LiveSyncController.php` y `api_native/index.php`, se implementaron los endpoints REST de ciclo de vida Live Sync (`/setlists/{id}/live-session/*` y `/quick-cues`), con control dinámico de dirección ("el primer líder en iniciar dirige, los demás actúan como seguidores"), sincronización de canción y tonalidad, emisión y borrado de indicaciones, y gestión privada de atajos con validación de roles y multi-tenancy.
  - En `views/setlists.php`, se añadieron los controles de escenario en el modo presentación: botón superior del Director para iniciar/finalizar sesión, barra de invitación y enlace para integrantes, franja integrada de indicación en vivo (con icono, tipo, texto y barra de progreso temporal de 8s o fija para tonalidades), botón flotante FAB de emisión rápida y modal Bottom Sheet táctil para despacho instantáneo de tonos (matriz 12 notas + alteración `#` + cualidad), dinámicas, atajos personales y texto libre.
  - En `assets/css/setlists.css`, se incorporaron los estilos del marco perimetral Tally Light (`.tally-frame-active` con resplandor suave) y las micro-animaciones de feedback háptico.
  - En `assets/js/views/setlists-live.js`, se implementó el nuevo submódulo desacoplado de sincronización mediante sondeo inteligente (polling ligero cada 2.5s con suspensión en pestañas ocultas), bloqueo pasivo de controles en integrantes enlazados, sincronización automática de canción y acordes al cambiar de tema el director, y vibración háptica en móviles al recibir indicaciones.
  - En `assets/js/views/setlists.js` y `views/includes/footer.php`, se integraron los hooks de ciclo de vida al abrir/cerrar la presentación y la notificación automática de cambios de canción y transposición.

- **Unificación de controles flotantes (FAB) ergonómicos, riel horizontal móvil y cabecera minimalista en Modo Presentación de Repertorios**:
  - En `views/setlists.php`, se despejó la cabecera superior del visor de presentación conservando el título de la canción y el artista, e incorporando justo debajo un riel horizontal de badges circulares numéricos compactos (`#presentation-horizontal-songs-container`), centrado por defecto en pantalla y con desplazamiento horizontal automático en caso de repertorios extensos, visible exclusivamente en dispositivos móviles (`md:hidden`).
  - En `assets/css/main.css`, se definió `.presentation-rail-badge-sm` (`26px x 26px`) y la regla de estado activo sólido (`.active` con `--primary` y texto blanco puro), manteniendo los badges inactivos con estilo translúcido adaptativo (`--primary-soft`), junto con la utilidad `.no-scrollbar` para preservar la estética táctil limpia.
  - En `assets/js/views/setlists.js`, se validó y garantizó la ordenación posicional estricta por `sort_order` de todas las canciones tanto en la presentación (sidebar, riel vertical de badges, riel horizontal móvil y modal) como en las tarjetas generales de repertorios, asegurando que los badges numéricos coincidan con el orden definido por el usuario al crear o editar el repertorio.
  - Se configuró la columna vertical de 5 botones FAB principales a la derecha centrados en pantalla (`top-1/2 -translate-y-1/2`): «Ver Canciones» (`fa-list-ul`), «Modo Solo Letra» (`fa-align-left`), desplegador de ajustes (`fa-chevron-left`), selector circular de velocidad 1x/2x/3x y botón circular de reproducción de autoscroll.
  - Al pulsar el botón de ajustes, se despliega a la izquierda con animación fluida (`.animate-slide-in-left`) la columna vertical exclusiva de afinación y zoom: subir tono (`+`), restablecer tono original (`fa-rotate-left`), bajar tono (`-`), aumentar tamaño de letra (`A+`) y disminuir tamaño de letra (`A-` con indicador en `pt`).
  - En `assets/js/views/setlists.js`, se integraron las funciones `togglePresAdjustments`, `cyclePresScrollSpeed`, alternancia de chevrons y cierre automático al hacer clic fuera del grupo.

- **Rediseño minimalista de cabecera y controles flotantes (FAB) Speed Dial en Visor de Canciones**:
  - En `views/songs.php`, se despejó la cabecera superior del visor de canciones dejándola en una única fila compacta con el botón de regreso, título y artista, y el botón de enlace de audio/video simplificado exclusivamente a un ícono sin texto.
  - Se sustituyó el menú emergente popover por botones flotantes circulares individuales (Speed Dial FAB) organizados estrictamente en columna vertical a la derecha en el orden solicitado: subir tono (`+`), restablecer tono (`fa-rotate-left`), bajar tono (`-`), aumentar tipo (`A+`), y disminuir tipo (`A-` con indicador en puntos `pt`).
  - Se despojó al botón de restablecer tono de la nota y la etiqueta «Medley» para una visualización sobria, limpia y simétrica.
  - Se implementó estilo badge circular traslúcido (`.viewer-fab-badge`) en los botones flotantes e indicador tipográfico, adaptándose dinámicamente al color de énfasis activo del perfil del usuario (`--primary` y `--primary-soft`) con desenfoque de fondo y borde satinado, evitando que los controles se mimeticen con el fondo oscuro.
  - Se reubicaron los 3 botones FAB principales (ajustes, velocidad y play) al centro vertical de la pantalla (`top-1/2 -translate-y-1/2`) para un alcance ergonómico óptimo con el pulgar.
  - Se configuró la columna vertical de los 5 botones de ajuste (tono y letra) para desplegarse hacia la izquierda de los controles principales con animación fluida de derecha a izquierda (`.animate-slide-in-left`), actualizando los íconos de alternancia a flecha izquierda (`fa-chevron-left`) para expandir y flecha derecha (`fa-chevron-right`) para colapsar.
- **Ajuste de tipografía a puntos (pt), medida mínima de 8pt y herencia tipográfica en acordes y letras**:
  - En `assets/css/songs.css`, se sustituyeron los tamaños fijos en `rem` de `.chord-el`, `.lyric-el`, `.instrumental-viewer-badge` y `.lyrics-only-mode .lyric-el` por valores relativos en `em` (`1em` y `0.9em`), resolviendo el problema donde cambiar el número de tamaño solo alteraba el interlineado del contenedor pero dejaba la tipografía inalterada.
  - En `assets/js/views/songs.js` y `assets/js/views/setlists.js`, se adoptó la escala en puntos tipográficos (`pt`) con rango expandido desde 8 pt como medida mínima hasta 24 pt, logrando que cada incremento o decremento numérico genere un cambio de tamaño de fuente notoriamente más visible y cómodo para el músico.


- **Zoom tipográfico interactivo en Visor de Canciones y Modo Presentación de Repertorios**:
  - En `views/songs.php`, `views/setlists.php`, `assets/js/views/songs.js` y `assets/js/views/setlists.js`, se incorporó un widget minimalista de control de tamaño de letra (`[ A- 15 A+ ]`) con rango ajustable de 11px a 24px.
  - La preferencia tipográfica se sincroniza y almacena de forma persistente en `localStorage` (`worship_lyrics_font_size`), permitiendo a cada músico reducir el tamaño en versos y párrafos extensos para erradicar el scroll horizontal en ensayos o toques en vivo, o aumentarlo según su distancia física frente al dispositivo.
  - Se ajustó el padding móvil de `#lyrics-container` a `p-3.5 sm:p-5` para optimizar al máximo el ancho de lectura útil en pantallas compactas.

- **Corrección de desborde horizontal del selector de autoscroll en móviles**:
  - En `views/songs.php` y `views/setlists.php`, se eliminó el estilo en línea `style="width: 100px;"` hardcodeado en `#btn-scroll-toggle` y `#btn-pres-scroll-toggle`, el cual forzaba al selector `<select>` a extenderse más allá del ancho de pantalla en smartphones, provocando un corte visual antiestético a la derecha.

- **Riel vertical colapsable con badges numerados en Modo Presentación de Repertorio (Tablet y PC)**:
  - En `views/setlists.php`, `assets/css/main.css` y `assets/js/views/setlists.js`, se implementó la capacidad de colapsar la barra lateral de canciones a un ancho compacto de 64px (`.presentation-sidebar.collapsed`) mediante un botón de alternancia interactivo (`<i class="fa-solid fa-chevron-left"></i>` / `<i class="fa-solid fa-chevron-right"></i>`).
  - Al colapsar la lista, se activa un riel vertical (`#presentation-sidebar-rail`) con badges circulares numerados (`1`, `2`, `3`...) de estilo translúcido adaptativo basados en las variables `--primary` y `--primary-soft` del tema de acento del usuario (`yellow`, `purple`, etc.).
  - Los badges permiten cambiar directamente de canción con un solo clic sin necesidad de reabrir el menú lateral completo, resaltando activamente la canción en reproducción y recordando el estado de colapso en `localStorage` (`worship_pres_sidebar_collapsed`).

- **Centralización del margen seguro inferior frente al menú de navegación móvil**:
  - En `index.php`, se trasladó el padding de seguridad directamente al contenedor maestro `<main id="main-content">` (`pb-28 md:pb-20`), asegurando que cualquier vista pre-renderizada o navegada en la SPA mantenga una separación despejada y limpia de más de 35px por encima del menú inferior (`#app-bottom-nav`) al llegar al fondo del scroll.
  - En `views/members.php`, se normalizó la vista envolviéndola en el contenedor estándar (`space-y-5 screen-fade`) y se eliminó el estilo en línea `margin-bottom: 30px;` en la cuadrícula de miembros, resolviendo el problema donde el último integrante («Oscar Torres») quedaba parcialmente cubierto por la barra de navegación en pantallas móviles.
  - Se depuraron paddings inferiores redundantes en `views/dashboard.php`, `views/profile.php`, `views/announcements.php`, `views/songs.php`, `views/feedback.php` y `views/admin.php` para unificar el espaciado vertical sin acumulación de áreas vacías dobles.

- **Corrección de resolución canónica de URLs en notificaciones Web Push**:
  - En `sw.js` (evento `notificationclick`), se corrigió la resolución de la URL objetivo para que siempre se resuelva contra el ámbito raíz registrado de la aplicación (`self.registration.scope`) mediante `new URL(rawUrl, self.registration.scope).href` en lugar de resolver de forma relativa contra el script (`self.location.href`). Esto erradica el problema en navegadores móviles (iOS PWA) donde hacer clic en una notificación con destino `#suggestions`, `#events` o `#songs` resolvía a `https://dominio/sw.js#...` y abría el código fuente plano del Service Worker en pantalla completa.
  - En `api_native/services/NotificationService.php` y controladores de eventos, canciones, sugerencias y anuncios, se normalizaron todas las URLs de retorno al formato canónico relativo `./#vista`.
  - En `assets/js/push.js`, el receptor de mensajes `PUSH_NOTIFICATION_CLICKED` extrae de inmediato el hash destino para invocar `navigateTo(routeHash)` sin demoras.
  - Se incrementó la versión del contenedor de caché PWA en `sw.js` a `levare-cache-v2.1.1` para forzar la actualización transparente e inmediata en todos los clientes.
- **Protección contra fallo de carga modular («Fallo al cargar la vista modular»)**:
  - En `index.php`, se marcó explícitamente cada contenedor de vista (`panel-dashboard`, `panel-songs`, etc.) con el atributo `data-loaded="true"` indicando que su contenido HTML ya fue pre-renderizado e inyectado por el servidor.
  - En `assets/js/app.js` (`handleHashRouting`), se añadió una guardia que detecta si el contenedor ya cuenta con elementos hijos en el DOM (`container.children.length > 0`), suprimiendo cualquier intento de `fetch('views/...php')` redundante. Esto evita que ante micro-cortes de red o reanudaciones de la app desde segundo plano, una petición fetch fallida borre el contenido HTML de la pantalla y muestre el mensaje de error de carga local.
- **Blindaje integral de Cache-Busting y entrega HTTP de la SPA**:
  - En `views/includes/header.php` y `.htaccess`, se agregaron cabeceras HTTP anti-caché estrictas (`Cache-Control: no-cache, no-store, must-revalidate, max-age=0`, `Pragma: no-cache`, `Expires: 0`) para asegurar que Cloudflare, proxies y navegadores jamás almacenen en caché el documento HTML principal (`index.php`), garantizando que siempre se entregue el HTML fresco con las referencias actualizadas de assets.
  - En el ayudante `asset_v()`, se implementó detección recursiva del `filemtime` para `assets/css/main.css` inspeccionando todos los submódulos importados (`songs.css`, `events.css`, etc.), invalidando la caché de estilos en Cloudflare y navegadores de inmediato cada vez que se modifique cualquier módulo secundario.
  - En `views/includes/footer.php`, `assets/js/pwa.js` y `sw.js`, se implementó el versionamiento dinámico automático del Service Worker (`asset_v('sw.js')`) e incremento de la versión del contenedor de caché PWA a `v2.1.0`, asegurando la actualización instantánea y purga de cachés locales sin requerir intervención manual en Cloudflare.
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

### Added
- **Selector Segmentado de Eventos (Próximos vs Pasados) y Ordenamiento Cronológico**:
  - En la vista de eventos (`views/events.php`, `assets/js/views/events.js`), se incorporó un selector segmentado sobrio y dual-mode con badges de conteo dinámico: `[ Próximos (N) ]` (eventos vigentes de hoy en adelante, activo por defecto) y `[ Pasados (N) ]` (historial de eventos concluidos).
  - **Orden cronológico inverso del más nuevo hacia atrás**: En base de datos (`EventController.php`) y en frontend, los eventos se ordenan estrictamente por fecha y hora descendente (`date DESC, time DESC`), mostrando arriba el evento más nuevo en la línea de tiempo del calendario y descendiendo progresivamente.
  - **Tratamiento estético de eventos pasados**: Las tarjetas de eventos concluidos se presentan con una atenuación sutil (`opacity-75 hover:opacity-100`) y badge neutral de estado `Finalizado`.
  - **Protección de acciones en el pasado**: En la ficha de detalle del evento (`#modal-event-detail`), se suprimen automáticamente los botones de cancelación o edición cuando el evento ya pertenece al historial.
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
