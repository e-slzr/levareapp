# Levare — Hoja de Ruta (Roadmap de Desarrollo)

Este documento define la visión, planificación de versiones futuras y el estándar de versionado para la plataforma Levare.

---

## Estándar de Versionado Semántico (SemVer)

Levare utiliza el estándar Versionado Semántico (MAJOR.MINOR.PATCH):

* **MAJOR (`X.0.0`)**: Cambios de gran escala, rediseños arquitectónicos o características transformadoras de la plataforma (ej. Sincronización en Tiempo Real).
* **MINOR (`1.X.0`)**: Nuevas funcionalidades o módulos de valor agregado que mantienen retrocompatibilidad (ej. Metrónomo, Afinador, Notas individuales).
* **PATCH (`1.0.X`)**: Corrección de errores (bugs), ajustes estéticos, optimizaciones de rendimiento y parches de seguridad.
* **Prefijos de Fase**: `-beta` (versión en pruebas de campo), `-rc` (Release Candidate / candidata a estable).

---

## Fases del Roadmap

### Fase 1: v1.0.0 Beta ➔ v1.0.0 Estable (Consolidación y Pruebas de Campo)
**Estado Actual: En Producción (Beta)**

* [x] Arquitectura SPA Modular PHP + CSS Vanilla Dual Mode (Oscuro/Claro).
* [x] Multi-tenancy con aislamiento estricto por Banda/Grupo (`group_user` / `group_roles`).
* [x] Biblioteca de Canciones con transposición dinámica de tonos, acordes interactivos y autoscroll.
* [x] Gestión de Repertorios (Setlists) con Modo Presentación en Vivo.
* [x] Planificación de Eventos (Cultos y Ensayos) y asignación de integrantes por instrumento.
* [x] Catálogo Comunitario Levare y sistema de sugerencias/votación.
* [x] Notificaciones Push Web nativas para alertas de banda y avisos globales.
* [x] Soporte PWA instalable con actualización transparente de caché (*Cache-Busting* automático por `filemtime`).
* [ ] **Meta v1.0.0 Estable**: Validar la estabilidad completa con usuarios y bandas reales en producción sin incidencias durante el uso continuo.

---

### Fase 2: v1.1.0 — Herramientas de Ensayo del Músico
**Estado: Planificada (Próxima Versión Menor)**

Enfoque en convertir Levare en la herramienta indispensable durante el ensayo individual y grupal.

* [ ] **Metrónomo Interactivo Integrado**:
  * Control de BPM visual (flash de compás) y sonoro (Web Audio API).
  * Soporte de compases (4/4, 3/4, 6/8) y función *Tap Tempo*.
  * **Asociación de BPM por Canción**: Guardado del tempo predeterminado en cada canción para auto-configurar el metrónomo al abrirla en la vista de presentación.
* [ ] **Afinador Cromático en Tiempo Real**:
  * Detección de frecuencias vía micrófono (Web Audio API) con indicador de aguja de afinación.
  * Optimizado para guitarra, bajo e instrumentos acústicos.
* [ ] **Tono Individual y Capo por Músico**:
  * Configuración de Capo/Tono personalizado por integrante (ej. Capo 2 para guitarra) sin alterar el tono maestro de la banda.
* [ ] **Notas Estructurales por Canción**:
  * Sección de anotaciones específicas del ensayo (ej. *"Entrada de bajo en Verso 2"*).

---

### Fase 3: v2.0.0 — Modo Concierto, Live Sync & Cues en Vivo (Tiempo Real)
**Estado: En Desarrollo Activo**

El gran salto tecnológico para dirigir las presentaciones y ensayos en vivo de forma automatizada y sin fricción.

* [x] **Modo Director / Live Sync (Sincronización en Tiempo Real)**:
  * **Roles Dinámicos ("Uno Dirige, el Otro Sigue")**: El primer líder/director en iniciar la sesión toma el control exclusivo; los demás integrantes y líderes se enlazan como Seguidores en modo pasivo.
  * **Sincronización de Repertorio y Transposición**: Al pasar de canción o cambiar tono en el dispositivo del Director, las pantallas de todos los músicos conectados se sincronizan en tiempo real.
  * **Control de Sesión y Salida Segura**: Botón de inicio y cierre de sesión exclusivo para el Director activo, desconectando y retornando a los integrantes a su modo autónomo al finalizar.
  * **Gestión de Enlace de Miembros**: Barra de conexión visible para integrantes únicamente cuando existe una sesión Live activa. Bloqueo pasivo de controles locales durante el enlace.
  * **Blindaje de Navegación de Escenario**: Bloqueo estricto de navegación e interceptación de salida de pantalla mientras la sesión de emisión esté activa.
* [x] **Indicaciones Rápidas en Vivo (Live Cues / Talkback Visual)**:
  * **Matriz Rápida de Tonos**: Selector instantáneo táctil para acordes y tonalidades ante improvisaciones y canciones fuera de repertorio.
  * **Dinámicas y Estructura**: Botones de un solo toque para cambios de intensidad (Suave, Fuerte), secciones (Coro, Puente, A Capella) y cortes.
  * **Atajos Rápidos Personalizados**: Banco de mensajes privados configurables individualmente por cada líder.
  * **Banner en Visor con Temporizador y Haptics**: Notificación no intrusiva entre la barra de canciones y la letra con barra de progreso de tiempo decreciente y vibración háptica en dispositivos móviles.
  * **Marco Tally Light**: Resplandor perimetral sutil que confirma el estado enlazado sin invadir la lectura de los acordes.
* [x] **Gestión Centralizada de Banda (Módulo Exclusivo para Líderes)**:
  * Centro de control administrativo integral (`views/band.php`, `assets/js/views/band.js`) con edición de datos de banda, código de invitación, administración de integrantes/roles, configuración de atajos de Live Cues y zona de peligro (abandonar o eliminar banda con confirmación por escrito).
  * Menú «Más» y enrutador adaptativos según rol (acceso a Gestión de Banda para líderes vs. Directorio de Miembros en modo solo lectura para músicos).
* [ ] **Live Sync Offline vía Red Local / P2P (Fase Avanzada sin Internet)**:
  * Sincronización directa entre dispositivos sobre Hotspot Wi-Fi local sin requerir conexión activa a internet ni consumo de datos móviles.
  * Canal de datos WebRTC punto a punto (P2P) con emparejamiento rápido mediante escaneo de Código QR entre la pantalla del Director y los músicos.
* [ ] **Gestión de Disponibilidad del Equipo (Roster & Unavailability)**:
  * Bloqueo de fechas de inasistencia por músico.
  * Alertas automáticas al programar eventos sobre disponibilidad de integrantes.
