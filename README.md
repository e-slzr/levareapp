# WorshipApp — Ministerio de Alabanza 🎵

WorshipApp es una aplicación web (SPA) diseñada para gestionar ministerios de alabanza, programar eventos (cultos y ensayos), organizar repertorios musicales (setlists) con transposición interactiva de tonos y autoscroll, proponer nuevas canciones mediante votación y administrar la asignación de músicos (roster).

Este archivo sirve como referencia del análisis de la estructura del proyecto y enumera los detalles pendientes por corregir y mejorar.

---

## 📂 Estructura del Proyecto

El proyecto está dividido en dos partes principales:
1. **Frontend (Raíz del proyecto):** Una SPA (Single Page Application) estática construida con HTML5 semántico, CSS Vanilla y módulos JavaScript puros sin frameworks externos.
2. **Backend (`/api`):** Una API robusta desarrollada en **Laravel 13**, que expone endpoints REST, utiliza **Laravel Sanctum** para autenticación basada en tokens y maneja el aislamiento de grupos de alabanza (Multi-tenant).

### Distribución de Archivos Clave

```text
├── index.html                  # Punto de entrada de la SPA
├── app.js                      # [LEGACY] Mock antiguo con localStorage (64KB - ¡Para eliminar!)
├── assets/
│   ├── css/
│   │   └── main.css            # Estilos principales de la interfaz (soporta temas e iluminación por acentos)
│   └── js/
│   │   ├── app.js              # Controlador principal del enrutador SPA y autenticación
│   │   ├── db.js               # Cliente HTTP (apiFetch) que añade tokens y X-Group-Id
│   │   ├── transposer.js       # Motor de transposición de acordes mediante Regex
│   │   ├── utils.js            # Utilidades generales (toasts, formateo de fechas, canEdit)
│   │   └── views/              # Controladores dinámicos para cada vista del frontend
│   │       ├── admin.js        # Gestión de registros de líderes
│   │       ├── dashboard.js    # Novedades y próximo evento
│   │       ├── events.js       # Lista de eventos, calendario y asignación de músicos
│   │       ├── members.js      # Directorio de integrantes y gestión de roles
│   │       ├── profile.js      # Edición de perfil, color de acento y subida de avatar
│   │       ├── setlists.js     # Creación y consulta de repertorios de canciones
│   │       └── suggestions.js  # Propuestas musicales y votación de integrantes
├── views/                      # Archivos HTML parciales de la SPA (cargados perezosamente)
│   ├── admin.html
│   ├── dashboard.html
│   ├── events.html
│   ├── group-selector.html
│   ├── members.html
│   ├── onboarding.html
│   ├── profile.html
│   ├── setlists.html
│   ├── songs.html
│   └── suggestions.html
└── api/                        # Backend API en Laravel 13
    ├── app/Http/Controllers/   # Controladores REST del backend
    ├── app/Http/Middleware/    # Middleware de multi-tenancy (TenantMiddleware)
    ├── app/Models/             # Modelos Eloquent y Scopes Globales (TenantScope)
    ├── database/migrations/    # Definiciones de esquema de bases de datos
    ├── database/seeders/       # Semillero con usuarios, canciones y eventos de prueba
    └── routes/api.php          # Definición de todas las rutas de la API
```

---

## ⚙️ Arquitectura Multi-Tenant

WorshipApp utiliza un aislamiento a nivel de base de datos para separar los datos de diferentes ministerios de alabanza:
* **TenantMiddleware (`api/app/Http/Middleware/TenantMiddleware.php`):** Captura el ID del grupo activo de la cabecera HTTP `X-Group-Id` y lo almacena temporalmente en la configuración global de Laravel (`config('tenant.group_id')`).
* **TenantScope (`api/app/Models/Scopes/TenantScope.php`):** Un scope global de Eloquent que se aplica automáticamente en los modelos de base de datos (`Song`, `Event`, `Setlist`, `Announcement`, `Suggestion`, `GroupRole`) para asegurar que cualquier consulta SQL filtre automáticamente los registros usando `where group_id = X`.

---

## 🛠️ Detalles y Bugs Identificados por Terminar

Durante el análisis del código actual, se han detectado los siguientes puntos que requieren intervención:

### 1. Incompatibilidad de Versión de PHP (Urgente)
* **Problema:** El backend en Laravel 13 y herramientas como PHPUnit 12 especificadas en `api/composer.json` requieren una versión de **PHP >= 8.4.1**. Sin embargo, la versión por defecto del sistema apunta a la instalación de XAMPP (**PHP 8.2.4**), lo que provoca un error fatal al intentar ejecutar comandos Artisan.
* **Solución:** Instalar PHP 8.5 mediante Homebrew (`brew install php`) y enlazarlo en el PATH de la terminal para utilizarlo en lugar del PHP de XAMPP.

### 2. Bug de Elementos Inexistentes en Frontend (Redirección y Cierre de Sesión)
* **Problema:** En `assets/js/db.js` (al expirar el token) y en `assets/js/app.js` (en la función `logout`), el script intenta ocultar y mostrar los contenedores de inicio usando los IDs `auth-shell` y `app-shell`. Estos elementos **no existen** en `index.html`, donde se llaman realmente `auth-container` y `main-container`. Esto provoca un error silencioso de JavaScript y rompe la experiencia de usuario.
* **Solución:** Reemplazar las referencias a `auth-shell` y `app-shell` con `auth-container` y `main-container` respectivamente.

### 3. Código Huérfano en la Raíz
* **Problema:** Existe un archivo `app.js` de 64KB directamente en la raíz del proyecto. Este archivo contiene la versión mock anterior basada puramente en `localStorage`. Su presencia causa confusión ya que el código actual que ejecuta la SPA se encuentra en `assets/js/app.js` y `assets/js/views/*.js`.
* **Solución:** Moverlo a un directorio temporal de backup o eliminarlo permanentemente.

### 4. Configuración del Almacenamiento de Archivos (Enlace Simbólico)
* **Problema:** La carga de imágenes de avatar guarda los archivos en `api/storage/app/public/avatars/`. Dado que el frontend realiza peticiones externas a la API, los avatares devuelven URLs públicas bajo `/storage/avatars/xxxx.webp`. Si no se crea el enlace simbólico en el servidor web de Laravel, las imágenes darán error 404.
* **Solución:** Ejecutar `php artisan storage:link` dentro de la carpeta `api/`.

### 5. Ausencia de Pruebas Unitarias o de Integración
* **Problema:** El directorio `api/tests/Feature/` solo tiene el test por defecto de Laravel (`ExampleTest.php`). No existen pruebas que validen la robustez del motor de transposición, el middleware multi-tenant, ni el control de acceso del Roster de Músicos.
* **Solución:** Crear tests para verificar los flujos de autenticación, restricciones de tenant y asignación de eventos.

### 6. Configuración de CORS para Servidores Locales
* **Problema:** Si el frontend se sirve localmente en un puerto diferente al backend (ej. Frontend en `:8000` y Backend en `:9080`), las peticiones pueden ser bloqueadas por el navegador.
* **Solución:** Asegurar que `api/config/cors.php` tenga permitido el origen de desarrollo y exponga las cabeceras `X-Group-Id` y `Authorization`.

---

## 🚀 Guía de Puesta en Marcha (Entorno de Desarrollo)

Una vez que se resuelva la versión de PHP en el sistema local, los pasos para ejecutar el proyecto son:

### 1. Configurar la Base de Datos
Asegúrate de tener un servidor MySQL local corriendo con las siguientes credenciales (definidas en `api/.env`):
* **Host:** `192.168.1.100` (o cambiar a `127.0.0.1` según el entorno)
* **Database:** `levareapp_dev`
* **Username:** `root`
* **Password:** `9050`

### 2. Inicializar el Backend Laravel
Desde la terminal, dirígete a la carpeta `/api` y ejecuta el comando de inicialización automatizada:
```bash
cd api
composer run setup
```
*(Este script de composer instalará dependencias, creará la clave de la aplicación, ejecutará las migraciones y compilará los assets de vite).*

Si deseas poblar la base de datos con usuarios y datos de demostración, ejecuta:
```bash
php artisan db:seed
```

### 3. Ejecutar los Servidores de Desarrollo
Dentro de la carpeta `api`, inicia todos los servicios requeridos en paralelo (Vite, Laravel Server, Cola de base de datos):
```bash
composer run dev
```
*Esto iniciará el servidor de Laravel en el puerto `9080` (accesible en `http://localhost:9080`).*

### 4. Servir el Frontend
Sirve el archivo `index.html` de la raíz del proyecto usando cualquier servidor estático local. Por ejemplo:
```bash
# Usando python3 en la raíz del proyecto:
python3 -m http.server 8000
```
Y abre en tu navegador: `http://localhost:8000`.

---

## 🔑 Credenciales de Prueba (Semillas de Base de Datos)

Si corriste el seeder (`php artisan db:seed`), puedes iniciar sesión con las siguientes cuentas de prueba:

1. **Superadministrador (Aprobación de líderes):**
   * **Usuario:** `@admin` o `admin@worshipapp.com`
   * **Contraseña:** `adminpassword`
2. **Líder de Alabanza (Gestión total de grupo):**
   * **Usuario:** `@carlos` o `lider@worshipapp.com`
   * **Contraseña:** `password123`
3. **Miembro de Alabanza (Voz Principal - Lectura):**
   * **Usuario:** `@sofia` o `sofia@worshipapp.com`
   * **Contraseña:** `password123`
4. **Miembro Nuevo (Debe cambiar contraseña al iniciar):**
   * **Usuario:** `@mateosilva` o `mateo@worshipapp.com`
   * **Contraseña:** `password123`
