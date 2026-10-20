# Plan de Implementación — Paso 2: Construcción de la Base de Datos Definitiva en Supabase (PostgreSQL)

Una vez aprobada la Especificación Funcional (Paso 1), en este segundo paso diseñaremos y crearemos **de una sola vez** toda la base de datos en **Supabase Cloud (PostgreSQL)** incluyendo desde el inicio tanto las tablas base como las columnas y tablas de las nuevas funcionalidades, evitando tener que modificar o parchar la estructura más adelante.

> [!IMPORTANT]
> La base de datos MySQL actual en tu servidor TrueNAS **no se tocará ni se apagará todavía**, de modo que tu PWA actual seguirá funcionando normalmente como referencia mientras construimos la nueva app en Flutter.

---

## Fase 2.1: Creación del Esquema Maestro Unificado en PostgreSQL (`public`)

Se creará un único esquema limpio y definitivo en Supabase con las siguientes **18 tablas** diseñadas para cubrir el 100% de las funcionalidades de Levare `v1.0`:

### 1. Usuarios, Bandas y Roles
1. **`public.profiles`** *(Vinculada 1:1 con `auth.users` de Supabase)*:
   * `id (UUID PK)`, `name`, `lastname`, `email`, `username (UNIQUE)`, `avatar_url`
   * `account_type ('superadmin' | 'leader' | 'member')`, `status ('pending' | 'active' | 'rejected' | 'blocked')`, `must_change_password (BOOLEAN)`
   * `accent_color (VARCHAR DEFAULT 'purple')`, `preferred_notation ('english' | 'latin' | 'nashville' DEFAULT 'english')`
   * `vocal_range_low (VARCHAR NULL)`, `vocal_range_high (VARCHAR NULL)` *(Para la función "¿Quién puede cantarla?")*
   * `community_points (NUMERIC(8,2) DEFAULT 0)`, `created_at`, `updated_at`.
2. **`public.groups`** *(Bandas / Ministerios)*:
   * `id (BIGSERIAL PK)`, `name`, `description`, `invite_code (VARCHAR UNIQUE)`, `created_by (UUID -> profiles.id)`, `created_at`, `updated_at`.
3. **`public.group_roles`** *(Puestos / Instrumentos de la banda)*:
   * `id (BIGSERIAL PK)`, `group_id (BIGINT -> groups.id)`, `name`, `sort_order (INT DEFAULT 0)`, `created_at`.
4. **`public.group_user`** *(Membresía y permisos en cada banda)*:
   * `user_id (UUID -> profiles.id)`, `group_id (BIGINT -> groups.id)`, `role (VARCHAR NULL)`, `permission_level ('admin' | 'editor' | 'member' DEFAULT 'member')`, `created_at`.
5. **`public.group_custom_cues`** *(Señas personalizadas del director por banda)*:
   * `id (BIGSERIAL PK)`, `group_id (BIGINT -> groups.id)`, `label (VARCHAR)`, `icon (VARCHAR NULL)`, `created_by (UUID)`.

### 2. Canciones, Catálogo Comunitario y Notas por Sección
6. **`public.songs`**:
   * `id (BIGSERIAL PK)`, `group_id (BIGINT NULL -> groups.id)`, `title`, `artist`, `album`
   * `key (VARCHAR NOT NULL)` *(Tono original)*, `final_key (VARCHAR NULL)` *(Tono final si modula)*
   * `bpm (INT NULL)`, `time_signature (VARCHAR DEFAULT '4/4')`, `duration_seconds (INT NULL)`
   * `is_public (BOOLEAN DEFAULT true)`, `is_deleted (BOOLEAN DEFAULT false)`, `is_medley (BOOLEAN DEFAULT false)`
   * `content (TEXT NOT NULL)` *(Letra, secciones, acordes y dinámicas `[[ ]]`)*
   * `url (TEXT NULL)`, `youtube_url (TEXT NULL)`, `spotify_url (TEXT NULL)`
   * `created_by (UUID -> profiles.id)`, `created_at`, `updated_at`.
7. **`public.group_songs`** *(Vínculo de canciones en el catálogo de cada banda + configuración grupal)*:
   * `id (BIGSERIAL PK)`, `group_id (BIGINT)`, `song_id (BIGINT)`, `default_group_key (VARCHAR NULL)` *(Tono habitual en que la toca esa banda)*, `added_by (UUID)`, `created_at`.
8. **`public.song_likes`** *(Likes del Catálogo Comunitario)*:
   * `song_id (BIGINT)`, `user_id (UUID)`, `created_at` *(PK compuesta)*.
9. **`public.song_section_notes`** *(Notas en 3 Capas: Banda, Evento y Personal)*:
   * `id (BIGSERIAL PK)`, `song_id (BIGINT -> songs.id)`, `section_key (VARCHAR)` *(ej. `INTRO`, `VERSO_1`, `CORO`)*
   * `scope ('band' | 'event' | 'personal')`
   * `group_id (BIGINT NULL)`, `event_id (BIGINT NULL)`, `user_id (UUID -> profiles.id)`
   * `note_text (TEXT NOT NULL)`, `updated_at`.

### 3. Repertorios (Setlists), Eventos, Asistencia, Programa y Ensayo
10. **`public.setlists`**:
    * `id (BIGSERIAL PK)`, `group_id (BIGINT -> groups.id)`, `name`, `description`, `date (DATE)`, `created_by (UUID)`, `created_at`, `updated_at`.
11. **`public.setlist_song`**:
    * `id (BIGSERIAL PK)`, `setlist_id (BIGINT -> setlists.id)`, `song_id (BIGINT -> songs.id)`, `sort_order (INT)`
    * `custom_key (VARCHAR NULL)` *(Tono elegido para esa fecha)*
    * `singer_user_id (UUID NULL -> profiles.id)` *(Vocalista que la guía en ese evento)*
    * `transition_chords (TEXT NULL)` *(Acordes puente hacia la siguiente canción)*.
12. **`public.events`**:
    * `id (BIGSERIAL PK)`, `group_id (BIGINT -> groups.id)`, `name`, `type ('ensayo' | 'culto' | 'concierto' | 'especial' | 'otro')`
    * `date (DATE)`, `time (TIME)`, `description (TEXT NULL)`, `setlist_id (BIGINT NULL -> setlists.id)`
    * `dress_code_style (VARCHAR NULL)` *(Formal, Casual, Todo negro, Personalizado)*
    * `dress_code_colors (JSONB NULL)` *(Paleta de colores del código de vestimenta)*
    * `dress_code_notes (TEXT NULL)`
    * `created_by (UUID)`, `created_at`, `updated_at`.
13. **`public.event_musicians`** *(Alineación / Roster y Confirmación de Asistencia)*:
    * `event_id (BIGINT -> events.id)`, `user_id (UUID -> profiles.id)`, `role (VARCHAR)`
    * `attendance_status ('pending' | 'confirmed' | 'declined' DEFAULT 'pending')`
    * `decline_reason (TEXT NULL)`, `responded_at (TIMESTAMPTZ NULL)`, `last_reminded_at (TIMESTAMPTZ NULL)`.
14. **`public.event_song_readiness`** *(Termómetro de Ensayo Individual)*:
    * `event_id (BIGINT -> events.id)`, `song_id (BIGINT -> songs.id)`, `user_id (UUID -> profiles.id)`
    * `status ('to_learn' | 'rehearsing' | 'ready' DEFAULT 'to_learn')`, `updated_at`.
15. **`public.event_program_items`** *(Programa del Evento / Orden del Culto)*:
    * `id (BIGSERIAL PK)`, `event_id (BIGINT -> events.id)`, `sort_order (INT)`
    * `item_type ('welcome' | 'song_block' | 'bible_reading' | 'announcements' | 'offering' | 'sermon' | 'prayer' | 'custom')`
    * `title (VARCHAR)`, `details (TEXT NULL)`, `assigned_to_name (VARCHAR NULL)`, `duration_minutes (INT NULL)`.

### 4. Sugerencias, Avisos, Notificaciones y Soporte
16. **`public.suggestions`** y **`public.suggestion_votes`**: Propuestas de nuevas canciones y votos de los integrantes.
17. **`public.announcements`**: Comunicados globales o internos de la banda (`is_urgent BOOLEAN DEFAULT false`, `meta JSONB`).
18. **`public.feedback_reports`** y **`public.user_devices`** *(Tokens FCM / Push para alertas móviles)*.

---

## Fase 2.2: Seguridad Multi-Tenant (RLS) y Funciones RPC en PostgreSQL

1. **Row Level Security (RLS) en todas las tablas:**
   * Crear la función SQL `public.is_group_member(target_group_id BIGINT)` y `public.can_edit_group(target_group_id BIGINT)`.
   * Aplicar políticas estrictas para que ningún usuario pueda leer ni modificar eventos, setlists, notas de banda o alineaciones de un grupo al que no pertenece.
   * Permitir lectura global en `public.songs` únicamente cuando `is_public = true AND is_deleted = false`.
2. **Funciones RPC y Vistas Analíticas en PostgreSQL:**
   * **Vista/RPC `get_group_song_rotation(target_group_id BIGINT)`**: Calcula directamente en PostgreSQL la fecha de la última vez que se tocó cada canción en `events` + `setlist_song`, cuántas veces se ha tocado en el año y la clasifica en `recent`, `forgotten` o `never_played`.
   * **RPC `create_monthly_schedule_events(...)`**: Recibe la matriz del "Rol del Mes" y crea en una sola transacción atómica los eventos del mes con sus músicos asignados.
   * **RPC `join_group_by_code(invite_code TEXT)`** e **`import_community_song(song_id BIGINT, group_id BIGINT)`**.

---

## Fase 2.3: Configuración de Supabase Auth, Realtime y Storage

1. **Supabase Auth:**
   * Activar inicio de sesión con **Email/Password**.
   * Configurar proveedor **Google OAuth** (para login con un toque en Android y Web).
   * Crear el Trigger `handle_new_user()` que inserta automáticamente el perfil en `public.profiles` al registrarse.
2. **Supabase Realtime:**
   * Habilitar canales de **Broadcast y Presence** para el **Modo Concierto (Live Sync)** y las **Señas del Director en Vivo**, además de escucha en tiempo real de cambios en confirmaciones de asistencia y votos.
3. **Supabase Storage:**
   * Crear el bucket público `avatars` (fotos de perfil de usuarios y logos de bandas) con políticas de acceso por propietario.

---

## Fase 2.4: Carga del Catálogo Oficial de la Comunidad (Semillas Iniciales)

1. **Migración de las 59 Canciones Verificadas:**
   * Convertir los 15 archivos de semillas actuales ([`database/migrations/20260824_seed_*`](file:///mnt/DATOS/Projects/Web/levareapp-dev/database/migrations)) a un script único de PostgreSQL (`supabase/seed_community_songs.sql`) y poblar el catálogo comunitario inicial en Supabase.

---

## Fase 2.5: Preparación del Script de Migración Transparente (Bcrypt Nativo)

**Objetivo:** Desarrollar y dejar listo el script automatizado (`scripts/migrate_mysql_to_supabase.py` o `.php`) que se ejecutará al momento de pasar a la fase Beta con tu equipo para transferir todo sin fricción.

1. **Extracción y Mapeo de Cuentas (`users` ➔ `auth.users` + `public.profiles`):**
   * Lee los ~22 usuarios de MySQL (músicos, coristas y líderes).
   * Inserta cada cuenta en `auth.users` inyectando directamente su hash existente de contraseña (`$2y$12$...`) en el campo `encrypted_password`.
   * **Garantía:** Como PHP y Supabase usan el estándar **bcrypt**, las contraseñas se transfieren 100% funcionales sin necesidad de restablecimiento.
2. **Transferencia de Banda y Membresías (`groups`, `group_user`, `group_roles`):**
   * Traslada la banda activa, sus puestos/instrumentos y los permisos de cada integrante asignándole su nuevo `UUID` correspondiente.
3. **Transferencia del Catálogo Privado (`songs` y `group_songs`):**
   * Extrae todas las canciones, tonos y arreglos cargados por los 2 líderes durante las pruebas de la PWA y los asocia a la banda en Supabase.
4. **Descarte de Eventos Pasados:**
   * El script filtra y omite los eventos ya ocurridos, asegurando que la nueva base de datos arranque limpia de datos obsoletos.
