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
   * El backend de la aplicación utiliza **PHP Nativo (PDO)** ubicado en la carpeta `api_native/`. Se eliminó completamente la dependencia de Laravel y ejecuciones en background con Artisan.
   * La base de datos es MySQL / MariaDB (`levareapp_dev`).
   * El enrutador central `api_native/index.php` gestiona los endpoints RESTful (`/auth`, `/songs`, `/events`, `/setlists`, `/members`, `/groups`).

2. **Autenticación y Tokens de Acceso:**
   * La tabla `personal_access_tokens` administra las sesiones con tokens Bearer generados.
   * Para asegurar compatibilidad con proxies web (Apache / TrueNAS), el frontend envía el token mediante las cabeceras `Authorization: Bearer <token>` y `X-Token: <token>`.
   * El ayudante `getBearerToken()` en `api_native/helpers/response.php` procesa ambas cabeceras y parámetros fallback.

3. **Multi-tenancy y Aislamiento por Banda/Grupo:**
   * Cada solicitud del frontend que consulta o modifica canciones, repertorios o eventos debe enviar la cabecera `X-Group-Id` con el ID del grupo activo.

4. **Frontend SPA Modular (`views/`):**
   * Las vistas de la interfaz están estructuradas en componentes modulares PHP en la carpeta `views/` (`dashboard.php`, `songs.php`, `setlists.php`, `events.php`, `profile.php`, `members.php`, `suggestions.php`, `onboarding.php`).
   * El router central `index.php` ensambla el header, las vistas modulares hidratadas y el menú inferior de navegación (`views/includes/navbar.php`).
   * La navegación entre pestañas se realiza mediante la función global `navigateTo(viewId)` en `assets/js/app.js`.

---

## 🗣️ Idioma y Comunicación

* Toda la interacción en chat, documentación, comentarios de código y mensajes de confirmación o tostadas (`showToast`) deben estar estrictamente redactados en **español**.
