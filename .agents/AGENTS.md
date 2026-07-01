# Normas y Directrices de Desarrollo — WorshipApp

Este archivo establece las reglas y estándares de diseño y desarrollo que cualquier asistente de desarrollo de IA (como Antigravity) debe seguir obligatoriamente para este proyecto.

---

## 🎨 Normas de Diseño y Estética Visual

1. **Sin Emojis en la Interfaz de Usuario (UI):**
   * Queda estrictamente prohibido utilizar emojis en etiquetas, botones, modales, alertas, insignias (badges) o cualquier elemento visual de la interfaz. Esto asegura mantener un diseño limpio, profesional y elegante.
2. **Estilo Premium y Temas de Color:**
   * Utilizar paletas de colores coherentes con la configuración del tema (claro/oscuro).
   * Mantener los estilos centralizados en el archivo CSS principal (`assets/css/main.css`). Evitar el uso excesivo de estilos inline inyectados dinámicamente mediante JavaScript.
3. **Micro-animaciones y Tipografía:**
   * Respetar las fuentes de Google Fonts configuradas (`Outfit` y `Plus Jakarta Sans`).
   * Utilizar transiciones suaves y estados interactivos consistentes (efectos `:hover` y `:focus`).
4. **Modales de Confirmación Personalizados:**
   * Queda estrictamente prohibido utilizar diálogos nativos del navegador como `alert()` o `confirm()` para advertencias o confirmaciones de acciones críticas (por ejemplo, eliminar registros, restaurar contraseñas, regenerar códigos). En su lugar, se deben estructurar modales interactivos en el HTML utilizando las clases y estilos premium definidos de la aplicación.
5. **Ocultamiento del Título del Header en Móviles:**
   * El título del header (`.page-title`) debe estar oculto en la vista móvil y pantallas pequeñas (menos de 960px) para maximizar el espacio útil. Debe configurarse para mostrarse únicamente a partir de 960px de ancho (tablets y pantallas de escritorio).

---


## 🛠️ Estándares Técnicos y Arquitectura

1. **Multi-tenancy (Aislamiento de Datos):**
   * Toda llamada a la API que interactúe con recursos de un grupo (canciones, eventos, setlists, miembros) debe incluir obligatoriamente la cabecera `X-Group-Id` con el ID del grupo activo.
   * En el backend de Laravel, las consultas sobre modelos multitenant deben delegar el filtrado de forma automática al Scope global `TenantScope`.
2. **Compatibilidad de Entorno:**
   * El código del backend se desarrolla para **Laravel 13** y requiere **PHP >= 8.4.1**.
   * Cualquier comando Artisan ejecutado en la terminal local del desarrollo debe ser invocado explícitamente mediante el ejecutable de Homebrew (ej. `/opt/homebrew/bin/php artisan ...`) para evitar conflictos de versiones con el intérprete por defecto de XAMPP (8.2.4).
3. **Estructura de la SPA:**
   * El frontend es modular e inyecta dinámicamente vistas estáticas desde la carpeta `views/`. El enrutador por Hash (`assets/js/app.js`) y `apiFetch` ([db.js](file:///Volumes/myhome/WebProjects/worshiptapp/assets/js/db.js)) manejan la lógica de render y token.

---

## 🗣️ Idioma y Comunicación

* Todas las interacciones de chat, explicaciones, planes de implementación y documentación generada deben realizarse estrictamente en **español**.
