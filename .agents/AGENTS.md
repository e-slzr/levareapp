# Normas y Directrices de Desarrollo — Levare OS v2.0

Este archivo establece las reglas, arquitectura y estándares de diseño y desarrollo que cualquier asistente de desarrollo de IA (como Antigravity) debe seguir obligatoriamente para el proyecto **Levare**.

---

## 🎨 Normas de Diseño, Estética Visual y UI

1. **Diseño Minimalista Dual (Modo Oscuro & Modo Claro):**
   * **Tipografía**: Fuentes oficiales Google Fonts: `Playfair Display` (encabezados principales y títulos de la marca) e `Inter` (cuerpo de texto, botones e insumos de datos).
   * **Paleta de Colores**:
     * **Modo Oscuro (Default)**: Fondo `bg-zinc-950` (`#09090b`), tarjetas `bg-zinc-900` (`#18181b`), bordes `border-zinc-800` (`#27272a`), texto principal `text-zinc-100` (`#f4f4f5`) y texto secundario `text-zinc-400`.
     * **Modo Claro**: Fondo `bg-zinc-100` (`#f4f4f5`), tarjetas `bg-white` (`#ffffff`), bordes `border-zinc-200` (`#e4e4e7`), texto principal `text-zinc-900` (`#18181b`) y texto secundario `text-zinc-500`.
   * Toda vista nueva o modificada debe incluir obligatoriamente las variantes de clase Tailwind `dark:` (ej. `bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800`) para garantizar la adaptación instantánea al conmutar entre Modo Claro y Oscuro.

2. **Sin Emojis en la Interfaz de Usuario (UI):**
   * Queda estrictamente prohibido utilizar emojis en etiquetas, botones, modales, alertas o badges de la interfaz. En su lugar, se deben usar únicamente íconos vectoriales sobrios de FontAwesome 6 (`fa-solid`, `fa-regular`).

3. **Transiciones y Micro-animaciones:**
   * Todas las vistas y cambios de pantalla deben incorporar la clase `.screen-fade` (animación de entrada `fadeIn 0.25s ease-in-out`).

4. **Modales y Diálogos de Confirmación Personalizados:**
   * Prohibido el uso de diálogos nativos del navegador (`alert()` o `confirm()`). Toda confirmación (como cerrar sesión, eliminar elementos o regenerar códigos) debe usar modales HTML interactivos con estética minimalista.

---

## 🛠️ Arquitectura Técnica y Backend

1. **Backend PHP Nativo con PDO (`api_native/`):**
   * El backend de la aplicación está construido en **PHP Nativo puro con PDO** ubicado en la carpeta `api_native/`, sin frameworks externos ni dependencias pesadas.
   * La base de datos oficial es MySQL / MariaDB (`levareapp_dev` en desarrollo y `levareapp` en testing/producción).
   * El enrutador central `api_native/index.php` gestiona los endpoints RESTful (`/auth`, `/songs`, `/events`, `/setlists`, `/members`, `/groups`, `/announcements`, `/suggestions`, `/push`).

2. **Autenticación y Sesiones:**
   * La tabla `personal_access_tokens` administra los tokens de sesión Bearer generados de forma segura con `random_bytes(32)`.
   * Para asegurar compatibilidad con proxies web y servidores (Apache / TrueNAS / Cloudflare), el frontend envía el token mediante las cabeceras `Authorization: Bearer <token>` y `X-Token: <token>`.
   * El ayudante `getBearerToken()` en `api_native/helpers/response.php` procesa ambas cabeceras y parámetros fallback.

3. **Multi-tenancy y Aislamiento por Banda/Grupo:**
   * Toda solicitud del frontend que consulte o modifique recursos privados (canciones, repertorios, eventos, sugerencias, miembros) debe enviar la cabecera `X-Group-Id` con el ID del grupo activo.
   * Si no se envía un grupo o el usuario no pertenece a dicho grupo, los endpoints retornan inmediatamente colecciones vacías (`[]`) o código de estado `403`.

4. **Frontend SPA Modular (`views/` y `assets/js/`):**
   * Las vistas están estructuradas en componentes modulares PHP en la carpeta `views/` (`dashboard.php`, `songs.php`, `setlists.php`, `events.php`, `profile.php`, `members.php`, `suggestions.php`, `announcements.php`, `onboarding.php`).
   * El router central `index.php` ensambla el header, las vistas modulares hidratadas y el menú inferior de navegación (`views/includes/navbar.php`).
   * La navegación entre pestañas se realiza mediante la función global `navigateTo(viewId)` en `assets/js/app.js`, manteniendo sincronización de datos y validación de membresía en tiempo real.

---

## 🐙 Estándares y Flujo de Trabajo en Git

1. **Flujo Directo en `main` (Trunk-Based para Desarrollador Único):**
   * Todo el desarrollo activo y despliegue del proyecto se realiza de forma centralizada directamente sobre la rama **`main`**.
   * Esto garantiza que al alternar entre estaciones de trabajo (MacBook, Linux, Windows) no existan desfases de versión ni ramas huérfanas.
   * Al iniciar sesión en cualquier equipo, siempre sincronizar con `git pull origin main` (o `git pull`).
   * No se requiere la creación de ramas temporales ni la apertura de Pull Requests en GitHub para el trabajo habitual.

2. **Formato de Mensajes de Commit (Conventional Commits en Español):**
   * Los commits deben ser atómicos, concisos y redactados en **español**.
   * **Estructura**: `<tipo>(<alcance/módulo>): <descripción directa en presente/imperativo>`
   * **Tipos permitidos**:
     * `feat`: Nuevas funcionalidades o módulos (ej. `feat(songs): constructor modular de acordes con soporte táctil`).
     * `fix`: Corrección de errores o bugs (ej. `fix(setlists): sincronización de tono en vista de presentación`).
     * `refactor`: Mejoras o reestructuración de código sin alterar funcionalidad (ej. `refactor(db): optimizar consultas PDO con índices`).
     * `style`: Ajustes puramente visuales, CSS o alineaciones (ej. `style(dashboard): ajustar padding y bordes`).
     * `docs`: Actualización de documentación, guías o reglas (ej. `docs(agents): actualizar flujo git a main directo`).
     * `chore`: Mantenimiento, migraciones, semillas o dependencias (ej. `chore(db): actualizar master_schema con seeder superadmin`).

3. **Buenas Prácticas de Versionado:**
   * **Commits Atómicos**: No agrupar cambios de múltiples módulos no relacionados en un solo commit.
   * **Seguridad**: Prohibido commitear archivos de entorno (`.env`), claves secretas o volcados temporales de base de datos.
   * **Sincronización Continua**: Al concluir una tarea o fase aprobada, verificar que el árbol de trabajo esté limpio (`git status`) y subir los cambios a `origin main`.

4. **Formato de Respuesta tras Publicar Cambios (`git push`):**
   * Tras subir exitosamente los cambios a GitHub, el asistente debe responder obligatoriamente con la siguiente estructura limpia y directa:
     * **Rama utilizada**: `main`
     * **Mensaje de Commit**: `<mensaje-del-commit>`
     * **Estado del árbol local**: Confirmar que quedó limpio (`git status`).

---

## 🗣️ Idioma y Comunicación

* Toda la interacción en chat, documentación, comentarios de código y mensajes de confirmación o tostadas (`showToast`) deben estar estrictamente redactados en **español**.

---

## 🔄 Protocolo de Sincronización de Testing (`sync test`)

Cuando el usuario solicite explícitamente **`sync test`**, el asistente debe ejecutar automáticamente el siguiente flujo de sincronización sin realizar preguntas previas si la ruta del sistema operativo actual está identificada:

1. **Identificación Automática de Entorno y Rutas:**
   * **Linux (Manjaro / Arch)**: `/mnt/myhome/WebProjects/levareapp/`
   * **macOS**: `/Volumes/myhome/WebProjects/levareapp/` (Montado vía SMB desde `smb://truenas._smb._tcp.local/myhome/WebProjects/levareapp/`)
   * **Windows**: *(Ruta pendiente por definir)*
   * Si el sistema operativo detectado tiene su ruta configurada y la carpeta existe, operar directamente en esa ubicación. Solo en caso de que la ruta no esté configurada o no sea accesible, solicitar la confirmación de la ruta al usuario.

2. **Flujo de Ejecución:**
   * **Paso 1: Descarga de Cambios (Git)**:
     * Ir a la ubicación del entorno de testing y ejecutar `git pull origin main` (o `git pull`) para traer la versión más reciente fusionada en `main`.
   * **Paso 2: Detección y Ejecución de Migraciones BD (Tabularis MCP)**:
     * Inspeccionar los archivos en `database/migrations/`.
     * Validar en la base de datos de testing (`levareapp`) mediante Tabularis MCP consultando la tabla `migrations` (o la existencia de las columnas/tablas correspondientes) para identificar migraciones pendientes.
     * Si existen migraciones pendientes:
       * Ejecutar las sentencias SQL de la migración en `levareapp`.
       * Registrar obligatoriamente la migración en la tabla `migrations`:
         ```sql
         INSERT INTO migrations (migration, batch) VALUES ('<nombre_archivo_sin_extension>', <siguiente_batch>);
         ```
   * **Paso 3: Formato de Respuesta Estructurada**:
     * Responder obligatoriamente con la siguiente estructura limpia y directa:
       ```markdown
       **¡Entorno de TESTING sincronizado!**

       * **Ubicación:** `<ruta-del-entorno>` (<OS>)
       * **Descarga Git:** `<resumen-del-commit-o-cambios-descargados>`
       * **Migraciones de BD:** `<migraciones-aplicadas-o-confirmacion-al-dia>`
       ```
