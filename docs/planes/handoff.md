# Context Handoff Checkpoint
- **Fecha y Rama:** 2026-10-20 01:25 | main
- **Objetivo Principal:** Desarrollo de la nueva aplicación oficial Levare en Flutter + Supabase (Rumbo a v1.0.0), manteniendo el prototipo PHP/MySQL en TrueNAS activo para pruebas de la banda hasta el lanzamiento de la Beta.
- **Rutas de los Proyectos:**
  - **Repositorio Nuevo (Flutter + Supabase):** `/Users/macbook/Documents/Proyectos/levare` (Git: `git@github.com:e-slzr/levare.git`, rama `main`).
  - **Repositorio Prototipo PWA (Referencia):** `/Users/macbook/Documents/Proyectos/levareapp` (Git: `git@github.com:e-slzr/levareapp.git`, activo y en uso por la banda en TrueNAS).
    * *Uso de Referencia:* Consultar aquí la lógica de acordes, letras y cifrados comunitarios (`database/migrations/20260824_seed_*`), estilos visuales y paleta Tailwind Zinc, estructura de base de datos MySQL original (`database/master_schema.sql`), y lógica del visor de atril SPA.
- **Decisiones Técnicas:**
  - Se analizó la APK de Setlio 2.5.4 mediante ingeniería inversa (REA), descubriendo su stack Flutter + Google ML Kit OCR/QR + Firebase + banco de sonidos locales (Pads MP3, metrónomo, notas).
  - Se eligió Flutter + Supabase Cloud (PostgreSQL + RLS) como la arquitectura definitiva para compilar Android (.apk), Web (PWA) y futuro iOS desde una sola base de código.
  - La PWA actual (PHP/MySQL en TrueNAS en `/Users/macbook/Documents/Proyectos/levareapp`) se mantendrá activa e intacta para que la banda del usuario (~22 músicos/coristas) la use en sus próximos cultos/ensayos sin interrupciones.
  - La base de datos en Supabase se construirá con las 18 tablas definitivas, incorporando desde el día 1 las 19 funcionalidades clave (Modo Búnker offline en SQLite, visor de atril con notación Nashville, hoja compacta, capo sugerido, notas de 3 capas, live sync con señas del director, rol del mes, rotación del repertorio, confirmación de asistencia, orden del culto, vestimenta y pads ambientales).
  - Protocolo de migración transparente: Las contraseñas encriptadas con bcrypt de los ~22 usuarios se migrarán directamente a `auth.users` de Supabase sin requerir cambio de clave ni re-registro. Las canciones y banda se migrarán al entregar la Beta v1.0.0-beta.1, momento en el cual se apagará TrueNAS.
- **Archivos de Planificación Disponibles en `docs/planes/`:**
  - `docs/planes/hoja_de_ruta_levare.md` (Hoja de ruta maestra y ciclo SemVer v0.1.0 a v1.0.0).
  - `docs/planes/paso_1_especificacion_funcional.md` (Paso 1: Especificación funcional completa de las 19 features).
  - `docs/planes/paso_2_base_de_datos_supabase.md` (Paso 2: Diseño de las 18 tablas de PostgreSQL, RLS, Auth y Fase 2.5 de migración bcrypt).
  - `docs/planes/paso_3_desarrollo_flutter.md` (Paso 3: Plan de desarrollo en Flutter en 10 fases pantalla por pantalla).
  - `docs/planes/handoff.md` (Checkpoint detallado de contexto).
- **Estado Actual:**
  - Repositorio nuevo inicializado y enlazado a `git@github.com:e-slzr/levare.git` en rama `main`.
  - Archivos de planificación copiados a `docs/planes/`.
  - Repositorio PWA intacto y operativo para la banda en `/Users/macbook/Documents/Proyectos/levareapp`.
- **Siguiente Paso Inmediato:**
  - Al abrir la nueva sesión de chat en `/Users/macbook/Documents/Proyectos/levare`:
    1. Iniciar con el **Paso 2**: Preparar el esquema maestro SQL para Supabase (`supabase/supabase_schema.sql`) con las 18 tablas, RLS, Auth y las 59 canciones de la comunidad (migradas desde `/Users/macbook/Documents/Proyectos/levareapp/database/migrations/`).
    2. O iniciar la inicialización del proyecto en Flutter (`flutter create .` con configuración para Android, Web e iOS).
