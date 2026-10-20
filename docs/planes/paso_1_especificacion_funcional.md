# Plan de Implementación — Paso 1: Especificación Funcional Completa de Levare (`v1.0`)

Antes de crear las tablas en **Supabase** o escribir código en **Flutter**, este primer documento define exactamente **todas las funcionalidades** que conformarán la primera versión oficial de **Levare (`v1.0`)**, uniendo lo que ya construiste en el prototipo actual con las mejores funciones extraídas del análisis de **Setlio**.

---

## Fase 1.1: Módulos Base Conservados del Prototipo Actual

1. **Multi-Tenancy de Bandas y Roles Personalizados:**
   * Un usuario puede crear una banda (Líder) o pertenecer a múltiples bandas/ministerios simultáneamente.
   * Unión rápida mediante **Código de Invitación** (o escaneo de QR).
   * Gestión de puestos/instrumentos personalizados por banda (`Batería`, `Piano`, `Voz Principal`, `Guitarra Acústica`, etc.).
2. **Autenticación Moderna y Perfiles:**
   * Inicio de sesión con **Correo y Contraseña** y botón nativo **"Continuar con Google"** (OAuth).
   * Flujo de cambio obligatorio de contraseña temporal cuando un líder registra manualmente a un miembro.
3. **Biblioteca Privada de la Banda y Catálogo Comunitario Levare:**
   * Catálogo privado por banda con buscador instantáneo y filtros.
   * **Catálogo Oficial de la Comunidad Levare** (iniciando con las 59 canciones verificadas de los 15 artistas actuales), sistema de *Likes*, puntos de contribución para usuarios e importación en un clic al repertorio privado de la banda.
4. **Constructor Visual y Editor de Cifra:**
   * Asistente para crear/editar canciones por secciones estructuradas (`[INTRO]`, `[VERSO]`, `[CORO]`, `[PUENTE]`, `[INSTRUMENTAL]`, `[FINAL]`), posicionamiento interactivo de acordes e importación desde texto o URL.
5. **Sistema de Sugerencias y Votación Musical:**
   * Buzón colaborativo donde cualquier integrante propone canciones para aprender (con enlaces a YouTube/Spotify), la banda vota a favor y los líderes cambian su estado (*Pendiente ➔ En ensayo ➔ Agregada*).
6. **Identidad Visual Minimalista Dual (Modo Oscuro / Modo Claro):**
   * Paleta oficial `zinc-950` / `zinc-900` en Modo Oscuro (ideal para escenarios con poca luz) y `zinc-100` / `white` en Modo Claro, con colores de acento personalizables y tipografías `Playfair Display` + `Inter`.

---

## Fase 1.2: Nuevas Funcionalidades Incorporadas (Inspiradas en Setlio + Roadmap)

### Bloque A: Escenario y "Modo Concierto"
7. **Modo Búnker (Offline Total para el Escenario):**
   * Sincronización automática en una base de datos **SQLite local** dentro del teléfono.
   * Interruptor **"Modo Búnker"** que corta cualquier espera de red en el escenario y lee canciones, tonos y setlists instantáneamente desde la memoria del dispositivo.
8. **Visor de Atril Avanzado:**
   * **3 Sistemas de Notación con un toque:** Inglés (`C, D, E`), Latino (`Do, Re, Mi`) y **Sistema Nashville (`1, 4, 5, 6m`)**.
   * **4 Modos de Lectura:**
     * *Estándar:* Letra + Acordes por tarjetas de sección.
     * *Hoja Compacta:* Toda la estructura de la canción y sus progresiones de acordes en **una sola pantalla sin letra** (`INTRO: [C - G - Am - F] x2`), pensada para instrumentistas.
     * *Vista a 2 Columnas:* Para tablets o teléfonos en horizontal, reduciendo o eliminando el scroll.
     * *Modo Cantante (Solo Letra):* Oculta acordes y diagramas, mostrando la letra grande y limpia.
   * **Sugeridor Inteligente de Capo (Cejilla) y Tono Individual:** Calcula en qué traste colocar el Capo para tocar acordes abiertos fáciles y permite que cada músico configure su Capo en pantalla sin alterar el tono maestro de la banda.
   * **Pantalla Siempre Activa (`WakeLock`), Autoscroll con velocidad por canción y soporte para Pedales Bluetooth pasa-páginas.**
9. **3 Capas de Notas y Etiquetas de Dinámica por Sección:**
   * Soporte para etiquetas de dinámica dentro de la canción (`[[Suave]]`, `[[Crece]]`, `[[Solo voces]]`, `[[Corte]]`).
   * En cada sección de la canción (`Intro`, `Verso`, `Coro`), posibilidad de guardar notas en 3 pestañas:
     * **Nota de la Banda:** Permanente para todo el grupo.
     * **Nota del Evento:** Específica para la fecha/evento actual.
     * **Nota Mía:** Privada, solo visible para ese músico en su propio dispositivo.
10. **Live Sync (Tiempo Real), Señas del Director e "Improvisar Canción":**
    * Sincronización en tiempo real donde el Director controla la canción activa, el tono y el **salto de sección** (`Verso` ➔ `Coro`), funcionando tanto por internet (**Supabase Realtime**) como sin internet vía **Red Local Wi-Fi con emparejamiento por Código QR**.
    * **Panel de Señas Rápidas en Vivo (*Live Cues*):** Botones para que el Director envíe un banner flotante a la pantalla de toda la banda sin hablar (*"🔁 Repetir esta sección"*, *"🔉 Bajar intensidad (Suave)"*, *"🔥 Subir intensidad (Build)"*, *"🎤 Solo voces / Acapella"*, *"🛑 Corte seco en el 1"*, *"⏳ Mantener acorde"* o textos propios de la banda).
    * **Botón "Improvisar Canción":** Permite al Director buscar cualquier canción fuera del setlist en pleno evento y abrirla instantáneamente en las pantallas de toda la banda.

### Bloque B: Organización de Banda, Eventos y Ensayos
11. **Confirmación de Asistencia (`Asistiré / No puedo`) y Recordatorios:**
    * Cuando un músico es asignado a un evento, puede confirmar o declinar su asistencia desde la app. El líder ve el conteo (`Confirmados: 5 de 7`) y cuenta con un botón **"Recordar a pendientes"** para enviar notificación push solo a quienes no han respondido.
12. **Matriz del "Rol del Mes" (Programación Mensual Equitativa):**
    * Tabla mensual donde las filas son los puestos/instrumentos y las columnas son las fechas del mes, mostrando un indicador en vivo de **"Cuántas veces toca cada quien en el mes"** para repartir la carga de forma justa y crear todos los eventos del mes con un clic.
13. **Rotación del Repertorio (Detector de Canciones Quemadas vs. Olvidadas):**
    * Clasificación automática de las canciones de la banda según el historial de eventos pasados:
      * *Tocadas hace poco:* Alerta para evitar repetirlas demasiado seguido.
      * *Olvidadas:* Canciones que llevan meses sin tocarse, ideales para rescatar.
      * *Sin estrenar:* Canciones del catálogo que nunca se han incluido en un evento.
14. **Termómetro de Ensayo por Canción:**
    * Dentro del próximo evento, cada músico convocado marca cada canción del repertorio como *"Por aprender"*, *"En ensayo"* o *"Lista"*, calculando una barra de preparación general de la banda.
15. **Programa del Evento (Orden del Culto) y Código de Vestimenta:**
    * Permite armar la escaleta completa del evento intercalando bloques no musicales (*Bienvenida, Lectura Bíblica, Avisos, Ofrenda, Prédica*) con su encargado y duración, además de una tarjeta visual de **Código de Vestimenta** y paleta de colores.

### Bloque C: Herramientas Sonoras y Utilidades del Músico
16. **Pads Ambientales Continuos + Acordes Puente de Transición:**
    * Reproductor integrado de **Pads Ambientales** (*Cálido, Brillante, Sub*) en los 12 tonos con transición *crossfade*, más sugerencia automática de **acordes de puente** para pasar musicalmente del tono de una canción al tono de la siguiente en el setlist.
17. **Metrónomo Interactivo (con BPM guardado por canción) y Afinador Cromático.**
18. **Verificador Automático de Tono y Rango Vocal (`¿Quién puede cantarla?`):**
    * Al guardar una canción, analiza los acordes y avisa si el tono detectado no coincide con el escrito. Además, cruza el tono de la canción con el rango vocal registrado en el perfil de los cantantes de la banda.
19. **Exportación Avanzada a PDF:**
    * Generación de PDF listo para imprimir o enviar por WhatsApp eligiendo formato: **Estándar**, **Compacto**, **2 Columnas** o **Solo Letra**.

---

## Fase 1.3: Arquitectura Modular del Proyecto en Flutter

El nuevo proyecto en Flutter tendrá una estructura limpia por módulos (*Feature-First*) preparada para compilar hacia **Android (`.apk`/`.aab`)**, **Web (PWA)** e **iOS**:

```text
lib/
├── core/
│   ├── theme/          # Tema Dual Oscuro/Claro (Zinc palette), tipografías Playfair & Inter
│   ├── router/         # Navegación declarativa (GoRouter) para App y Web
│   ├── database/       # Base de datos SQLite local (Drift) y controlador de Modo Búnker
│   └── music_engine/   # Transpositor, Parser de Acordes, Nashville, Sugeridor de Capo y Detector de Tono
├── features/
│   ├── auth/           # Login (Email + Google), Registro, Onboarding y Selector de Banda
│   ├── dashboard/      # Inicio, Próximo Evento, Confirmación rápida y Avisos
│   ├── songs/          # Catálogo de Banda, Comunidad, Rotación y Constructor Visual
│   ├── concert_mode/   # Visor de Atril, Hoja Compacta, 2 Columnas, Live Sync y Señas del Director
│   ├── events/         # Eventos, Setlists, Programa del Culto, Vestimenta, Termómetro y Rol del Mes
│   ├── tools/          # Pads Ambientales, Metrónomo, Afinador y Exportador PDF
│   ├── members/        # Directorio de Miembros, Roles y Sugerencias/Votación
│   └── profile_admin/  # Perfil, Rango Vocal, Configuración y Panel Superadmin
└── shared/
    └── widgets/        # Modales personalizados, tarjetas, badges y controles reutilizables
```
