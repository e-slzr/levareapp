# 🗺️ Levare — Hoja de Ruta (Roadmap de Desarrollo)

Este documento define la visión, planificación de versiones futuras y el estándar de versionado para la plataforma **Levare**.

---

## 📌 Estándar de Versionado Semántico (SemVer)

Levare utiliza el estándar **Versionado Semántico (MAJOR.MINOR.PATCH)**:

* **MAJOR (`X.0.0`)**: Cambios de gran escala, rediseños arquitectónicos o características transformadoras de la plataforma (ej. Sincronización en Tiempo Real).
* **MINOR (`1.X.0`)**: Nuevas funcionalidades o módulos de valor agregado que mantienen retrocompatibilidad (ej. Metrónomo, Afinador, Notas individuales).
* **PATCH (`1.0.X`)**: Corrección de errores (bugs), ajustes estéticos, optimizaciones de rendimiento y parches de seguridad.
* **Prefijos de Fase**: `-beta` (versión en pruebas de campo), `-rc` (Release Candidate / candidata a estable).

---

## 🚀 Fases del Roadmap

### 🟢 Fase 1: v1.0.0 Beta ➔ v1.0.0 Estable (Consolidación y Pruebas de Campo)
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

### 🟡 Fase 2: v1.1.0 — Herramientas de Ensayo del Músico
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

### 🔵 Fase 3: v2.0.0 — Modo Concierto & Live Sync (Tiempo Real)
**Estado: Planificada (Próxima Versión Mayor)**

El gran salto tecnológico para dirigir las presentaciones en vivo de forma automatizada.

* [ ] **Sincronización de Pantallas en Vivo (Live Sync)**:
  * Comunicación bidireccional en tiempo real entre el Líder y los Músicos (vía WebSockets / SSE).
  * Cuando el director avanza a la siguiente canción o cambia de sección en su dispositivo, las pantallas de todos los integrantes conectados se desplazan en tiempo real.
* [ ] **Gestión de Disponibilidad del Equipo (Roster & Unavailability)**:
  * Bloqueo de fechas de inasistencia por músico.
  * Alertas automáticas al programar eventos sobre disponibilidad de integrantes.
