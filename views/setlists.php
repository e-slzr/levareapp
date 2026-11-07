<!-- Setlists Screen (Minimalist UI - Dual Light & Dark Mode) -->

<!-- Subpanel 1: Setlists Grid List View -->
<div id="subpanel-setlists-list" class="space-y-5 screen-fade">
    <header class="flex items-center justify-between pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Repertorios</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Listas de canciones para servicios y ensayos</p>
        </div>
        <button type="button" id="btn-create-setlist" class="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition" style="display: none;">
            +
        </button>
    </header>

    <!-- Search Filter -->
    <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </div>
        <input type="text" id="setlists-search-input" placeholder="Buscar por título de repertorio..." style="padding-left: 40px !important;" class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
    </div>

    <!-- Setlists Grid Container -->
    <div id="setlists-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Rendered dynamically by JS -->
    </div>
</div>

<!-- Subpanel 2: Setlist Presentation (Split-Screen View) -->
<div id="subpanel-setlist-presentation" class="fixed top-0 left-0 right-0 bottom-[58px] md:bottom-[64px] z-20 bg-white dark:bg-zinc-950 hidden">

    <div class="setlist-presentation-layout flex h-full w-full overflow-hidden">
        <!-- Sidebar: Setlist info & songs (Left Panel) -->
        <aside id="presentation-sidebar" class="presentation-sidebar w-72 md:w-80 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden transition-[width] duration-200">
            <!-- 1. Expanded view (Default) -->
            <div id="presentation-sidebar-expanded" class="flex flex-col h-full w-full">
                <div class="presentation-sidebar-header p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5 flex-shrink-0">
                    <div class="flex items-center justify-between">
                        <button type="button" id="btn-presentation-back" class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer">
                            <i class="fa-solid fa-arrow-left text-xs"></i>
                            <span>Cerrar Repertorio</span>
                        </button>
                        <button type="button" id="btn-collapse-pres-sidebar" onclick="togglePresentationSidebar(true)" class="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition cursor-pointer" title="Colapsar panel a riel de canciones">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                    </div>
                    <div>
                        <h3 id="presentation-setlist-title" class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">Repertorio</h3>
                        <p id="presentation-setlist-desc" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Sin descripción</p>
                    </div>
                    <!-- Botón de Emisión para Tablet/PC (Sidebar Expandido) -->
                    <div class="pt-1">
                        <button type="button" id="btn-sidebar-pres-live-sync" onclick="toggleDirectorLiveSync()" class="hidden w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 transition cursor-pointer" title="Iniciar o gestionar Emisión en Vivo">
                            <i class="fa-solid fa-tower-broadcast text-xs pointer-events-none"></i>
                            <span id="pres-sidebar-live-sync-text" class="pointer-events-none">Emisión en Vivo</span>
                        </button>
                    </div>
                </div>
                <div id="presentation-songs-list-container" class="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 space-y-1">
                    <!-- Populated dynamically -->
                </div>
            </div>

            <!-- 2. Compact Rail view (Numbered circular badges) -->
            <div id="presentation-sidebar-rail" class="hidden flex-col items-center h-full w-full py-3 space-y-3">
                <div class="flex flex-col items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 w-full px-2">
                    <button type="button" id="btn-expand-pres-sidebar" onclick="togglePresentationSidebar(false)" class="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition cursor-pointer" title="Expandir lista completa">
                        <i class="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                    <button type="button" id="btn-rail-pres-back" onclick="closeSetlistPresentation()" class="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition cursor-pointer" title="Cerrar Repertorio">
                        <i class="fa-solid fa-arrow-left text-xs"></i>
                    </button>
                    <!-- Botón de Emisión para Tablet/PC (Riel Colapsado) -->
                    <button type="button" id="btn-rail-pres-live-sync" onclick="toggleDirectorLiveSync()" class="hidden w-9 h-9 rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-zinc-950 flex items-center justify-center transition cursor-pointer" title="Emisión en Vivo">
                        <i class="fa-solid fa-tower-broadcast text-xs pointer-events-none"></i>
                    </button>
                </div>
                <div id="presentation-rail-songs-container" class="flex-1 overflow-y-auto flex flex-col items-center gap-2.5 w-full py-1 px-1">
                    <!-- Populated dynamically with numbered badges 1, 2, 3... -->
                </div>
            </div>
        </aside>

        <!-- Right Side: Song Viewer (Main Content Panel) -->
        <section class="presentation-song-viewer flex-1 min-w-0 flex flex-col overflow-hidden h-full relative">
            <!-- Controls bar (Cabecera minimalista: Título, Artista, Botón Live Sync y Riel horizontal) -->
            <div class="presentation-viewer-header px-3.5 py-2.5 sm:p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-900/90 flex-shrink-0">
                <div class="min-w-0 w-full flex items-center justify-between gap-3">
                    <div class="min-w-0 flex-1">
                        <h2 id="pres-song-title" class="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate">Cargando canción...</h2>
                        <p id="pres-song-artist" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">...</p>
                    </div>

                    <!-- Indicadores y Controles Live Sync en Cabecera -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <!-- Badge indicador LIVE en esquina para seguidores enlazados -->
                        <span id="pres-corner-live-badge" class="hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/30">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span>LIVE</span>
                        </span>

                        <!-- Botón para Iniciar o Gestionar Live Sync (Solo visible para Líderes de la banda) -->
                        <button type="button" id="btn-pres-live-sync-toggle" onclick="toggleDirectorLiveSync()" class="hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition cursor-pointer" title="Gestionar modo Live Sync">
                            <i class="fa-solid fa-tower-broadcast text-xs pointer-events-none"></i>
                            <span id="pres-live-sync-btn-text" class="pointer-events-none">Live Sync</span>
                        </button>
                    </div>
                </div>

                <!-- Barra de Notificación de Sesión Activa para Integrantes (Seguidores) -->
                <div id="pres-follower-live-bar" class="hidden w-full mt-2.5 py-1.5 px-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 screen-fade">
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fa-solid fa-tower-broadcast text-amber-500"></i>
                        <span class="truncate"><strong id="pres-follower-director-name">El Director</strong> inició Live Sync</span>
                    </div>
                    <button type="button" id="btn-pres-join-live" onclick="joinLiveSync()" class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition cursor-pointer flex-shrink-0 ml-2 inline-flex items-center justify-center">
                        Conectarme
                    </button>
                </div>

                <!-- Barra de Integrante Conectado con Botón Desconectar -->
                <div id="pres-follower-connected-bar" class="hidden w-full mt-2.5 py-1.5 px-3 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 flex items-center justify-between text-xs text-red-700 dark:text-red-300 screen-fade">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span class="truncate">Enlazado al Director (<strong id="pres-connected-director-label">Director</strong>)</span>
                    </div>
                    <button type="button" id="btn-pres-leave-live" onclick="leaveLiveSync()" class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500 hover:text-white border border-red-500/40 transition cursor-pointer flex-shrink-0 ml-2 inline-flex items-center justify-center">
                        Desconectar
                    </button>
                </div>

                <!-- Riel horizontal de badges numéricos de canciones (Móvil / Pantallas compactas) -->
                <div class="flex md:hidden w-full overflow-x-auto no-scrollbar pt-2">
                    <div id="presentation-horizontal-songs-container" class="flex items-center gap-1.5 min-w-full w-max justify-center px-2">
                        <!-- Populated dynamically with numbered badges 1, 2, 3... -->
                    </div>
                </div>
            </div>

            <!-- Franja de Indicación en Vivo (Live Cue Slot en la posición exacta del recuadro rojo) -->
            <div id="pres-live-cue-slot" class="w-full px-3.5 pt-2 pb-1 hidden cue-slot-transition">
                <div id="pres-live-cue-card" class="w-full rounded-xl bg-zinc-900 border border-amber-500/70 text-amber-300 p-2.5 sm:p-3 shadow-xl shadow-amber-500/10 relative overflow-hidden screen-fade">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                                <i id="pres-live-cue-icon" class="fa-solid fa-music text-xs"></i>
                            </div>
                            <div class="min-w-0">
                                <span id="pres-live-cue-type" class="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block">Indicación en Vivo</span>
                                <span id="pres-live-cue-text" class="text-xs sm:text-sm font-bold text-amber-200 truncate block">Tono: Fa#m</span>
                            </div>
                        </div>
                    </div>
                    <!-- Barra de progreso decreciente -->
                    <div id="pres-live-cue-progress-box" class="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div id="pres-live-cue-progress-bar" class="bg-amber-400 h-full w-full transition-all duration-100 ease-linear"></div>
                    </div>
                </div>
            </div>

            <!-- Scrollable lyrics area -->
            <div id="pres-lyrics-container" class="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 pb-32 sm:pb-28">
                <pre id="pres-chords-lyrics-content" class="whitespace-pre-wrap font-mono text-sm md:text-base leading-loose text-zinc-800 dark:text-zinc-200 pb-20">
                    <!-- Populated dynamically -->
                </pre>
            </div>

            <!-- Contenedor Flotante de Acciones Rápidas (Centrado Verticalmente a la Derecha) -->
            <div id="pres-viewer-floating-container" class="fixed top-1/2 -translate-y-1/2 right-3 sm:right-5 z-40 flex items-center gap-3 pointer-events-none">
                
                <!-- Columna Izquierda: Ajustes de Tono y Letra (Ordenados Verticalmente, animación de derecha a izquierda) -->
                <div id="pres-viewer-fab-adjustments" class="hidden flex flex-col items-center gap-2 pointer-events-auto animate-slide-in-left">
                    <!-- 1. Botón Subir Tono -->
                    <button type="button" id="btn-pres-transpose-up" class="viewer-fab-badge w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" title="Subir medio tono (+)">
                        <div class="inline-flex items-center justify-center gap-0.5 pointer-events-none">
                            <svg class="w-3 h-3 fill-current inline-block" viewBox="0 0 16 16">
                                <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
                                <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
                                <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
                            </svg>
                            <i class="fa-solid fa-plus text-[8px] -mt-0.5"></i>
                        </div>
                    </button>

                    <!-- 2. Botón Restablecer Tono (Sin nota ni texto medley) -->
                    <button type="button" id="btn-pres-transpose-reset" class="viewer-fab-badge w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" title="Restablecer tono original">
                        <i class="fa-solid fa-rotate-left text-xs pointer-events-none"></i>
                        <span id="pres-song-current-key" class="hidden"></span>
                    </button>

                    <!-- 3. Botón Bajar Tono -->
                    <button type="button" id="btn-pres-transpose-down" class="viewer-fab-badge w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" title="Bajar medio tono (-)">
                        <div class="inline-flex items-center justify-center gap-0.5 pointer-events-none">
                            <svg class="w-3 h-3 fill-current inline-block" viewBox="0 0 16 16">
                                <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
                                <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
                                <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
                            </svg>
                            <i class="fa-solid fa-minus text-[8px] -mt-0.5"></i>
                        </div>
                    </button>

                    <!-- 4. Botón Aumentar Tipo (Letra) -->
                    <button type="button" id="btn-pres-font-increase" onclick="adjustPresViewerFontSize(1)" class="viewer-fab-badge w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" title="Aumentar tamaño de letra">
                        <span class="font-bold text-xs font-mono pointer-events-none">A+</span>
                    </button>

                    <!-- 5. Botón Disminuir Tipo (Letra) con indicador de medida -->
                    <div class="relative flex items-center justify-center">
                        <button type="button" id="btn-pres-font-decrease" onclick="adjustPresViewerFontSize(-1)" class="viewer-fab-badge w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" title="Disminuir tamaño de letra">
                            <span class="font-bold text-xs font-mono pointer-events-none">A-</span>
                        </button>
                        <span id="pres-font-size-val" class="viewer-fab-badge absolute right-12 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none">15 pt</span>
                    </div>
                </div>

                <!-- Columna Derecha: Botones FAB Principales (Centrados Verticalmente) -->
                <div class="flex flex-col items-center gap-2.5 pointer-events-auto">
                    <!-- 0. Botón Flotante de Emisión / Cues (Líder en Móvil y Tablet) -->
                    <button type="button" id="btn-pres-cue-pad-trigger" onclick="openDirectorCuePad()" class="viewer-fab-badge w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hidden bg-zinc-800 text-amber-400 border border-zinc-700 hover:bg-zinc-700 shadow-xl transition-transform active:scale-90" title="Indicaciones en Vivo (Abrir pad de mensajes)">
                        <i class="fa-solid fa-tower-broadcast text-sm pointer-events-none"></i>
                    </button>

                    <!-- 1. Botón Ver Canciones (Abre lista de canciones del repertorio) -->
                    <button type="button" id="btn-toggle-presentation-songs" onclick="openMobileSongsModal()" class="viewer-fab-badge w-12 h-12 rounded-full flex items-center justify-center cursor-pointer" title="Ver lista de canciones del repertorio">
                        <i class="fa-solid fa-list-ul text-sm pointer-events-none"></i>
                    </button>

                    <!-- 2. Botón Modo Solo Letra (Vocalistas) -->
                    <button type="button" id="btn-pres-toggle-lyrics-mode" onclick="togglePresLyricsMode()" class="viewer-fab-badge w-12 h-12 rounded-full flex items-center justify-center cursor-pointer" title="Modo Solo Letra: oculta o muestra acordes">
                        <i class="fa-solid fa-align-left text-sm pointer-events-none"></i>
                    </button>

                    <!-- 3. Botón Desplegador de Ajustes (Flecha izquierda para desplegar, flecha derecha para ocultar) -->
                    <button type="button" id="btn-pres-fab-tuning" onclick="togglePresAdjustments()" class="viewer-fab-badge w-12 h-12 rounded-full flex items-center justify-center cursor-pointer" title="Desplegar ajustes de tono y letra">
                        <i id="pres-fab-tuning-icon" class="fa-solid fa-chevron-left text-sm pointer-events-none"></i>
                    </button>

                    <!-- 4. Selector de Velocidad de Scroll (Circular 1x / 2x / 3x) -->
                    <button type="button" id="btn-pres-fab-speed" onclick="cyclePresScrollSpeed()" class="viewer-fab-badge w-12 h-12 rounded-full font-bold text-xs flex items-center justify-center cursor-pointer" title="Velocidad de scroll">
                        <span id="pres-scroll-speed-val" class="pointer-events-none font-mono">2x</span>
                    </button>

                    <!-- 5. Play / Pause Auto Scroll (Circular Principal) -->
                    <button type="button" id="btn-pres-scroll-toggle" onclick="togglePresScroll()" class="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all duration-200 cursor-pointer" title="Iniciar / Detener Scroll">
                        <i id="pres-scroll-play-icon" class="fa-solid fa-play text-sm pointer-events-none"></i>
                    </button>
                </div>
            </div>
        </section>
    </div>
</div>


<!-- ================= MODALS SECTION ================= -->

<!-- MODAL: Crear / Editar Repertorio (Wizard 2 Pasos) -->
<div id="modal-setlist" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <!-- Header con indicador dinámico de pasos -->
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <div>
                <h3 id="setlist-modal-title" class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Crear Nuevo Repertorio</h3>
                <div class="flex items-center gap-2 mt-1">
                    <span id="setlist-step-badge-1" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition">1. Información</span>
                    <i class="fa-solid fa-chevron-right text-[8px] text-zinc-400"></i>
                    <span id="setlist-step-badge-2" class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition">2. Canciones</span>
                </div>
            </div>
            <button type="button" id="btn-close-setlist-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition btn-close-modal">&times;</button>
        </div>

        <form id="setlist-form" class="overflow-y-auto flex-1 p-5">
            <input type="hidden" id="setlist-form-id" />

            <!-- PASO 1: INFORMACIÓN GENERAL -->
            <div id="setlist-modal-step-1" class="space-y-4">
                <div class="space-y-1.5">
                    <label for="setlist-form-name" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre del Repertorio</label>
                    <input type="text" id="setlist-form-name" placeholder="Ej. Repertorio de Concierto / Culto Dominical" required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>

                <div class="space-y-1.5">
                    <label for="setlist-form-desc" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notas o Descripción</label>
                    <textarea id="setlist-form-desc" rows="4" placeholder="Notas sobre el repertorio, indicaciones de orden, dinámicas, etc..."
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition"></textarea>
                </div>
            </div>

            <!-- PASO 2: SELECCIÓN Y ORDEN DE CANCIONES -->
            <div id="setlist-modal-step-2" class="space-y-4 hidden screen-fade">
                <!-- Resumen breve del paso 1 -->
                <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div class="min-w-0 pr-2">
                        <h4 id="setlist-step-summary-title" class="font-bold text-zinc-900 dark:text-zinc-100 truncate">Repertorio</h4>
                        <p id="setlist-step-summary-desc" class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">Sin notas</p>
                    </div>
                    <span id="setlist-songs-count-badge" class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase flex-shrink-0">0 canciones</span>
                </div>

                <!-- Buscador de canciones -->
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Buscar Canciones en el Catálogo</label>
                    <input type="text" id="setlist-song-search" placeholder="Escribe al menos 3 letras del título o artista..."
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>

                <!-- Resultados de búsqueda -->
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Resultados de Búsqueda</label>
                    <div id="setlist-form-songs-selection" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto max-h-40 divide-y divide-zinc-100 dark:divide-zinc-800 p-1">
                        <!-- Populated dynamically with songs -->
                    </div>
                </div>

                <!-- Orden del repertorio -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Orden del Repertorio</label>
                        <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">Arrastra o usa las flechas</span>
                    </div>
                    <div id="setlist-form-songs-order" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 min-h-[56px] max-h-56 overflow-y-auto p-2 flex flex-col gap-1">
                        <div class="no-songs-msg text-xs text-zinc-400 italic p-2">No has seleccionado ninguna canción todavía.</div>
                    </div>
                </div>
            </div>
        </form>

        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-shrink-0">
            <button type="button" id="btn-delete-setlist" class="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer" style="display: none;">
                <i class="fa-solid fa-trash-can mr-1"></i>Eliminar
            </button>

            <button type="button" id="btn-setlist-step-back" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition hidden cursor-pointer">
                <i class="fa-solid fa-arrow-left mr-1.5"></i>Atrás
            </button>
            <button type="button" id="btn-close-setlist-modal" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">Cancelar</button>

            <button type="button" id="btn-setlist-step-next" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition ml-auto cursor-pointer">
                Continuar a Canciones<i class="fa-solid fa-arrow-right ml-1.5"></i>
            </button>
            <button type="submit" form="setlist-form" id="btn-submit-setlist" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition hidden ml-auto cursor-pointer">Guardar Repertorio</button>
        </div>
    </div>
</div>

<!-- MODAL: Confirmar Eliminar Repertorio -->
<div id="modal-delete-setlist-confirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Eliminar Repertorio</h3>
            <button type="button" id="btn-close-delete-setlist-modal-x" class="btn-close-modal w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Estás seguro de que deseas eliminar permanentemente el repertorio <strong id="delete-setlist-modal-name" class="text-zinc-900 dark:text-zinc-100"></strong>? Esta acción no se puede deshacer.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" id="btn-close-delete-setlist-modal" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" id="btn-confirm-delete-setlist" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Eliminar</button>
            </div>
        </div>
    </div>
</div>

<!-- MODAL: Lista de Canciones en Móvil -->
<div id="modal-presentation-songs-mobile" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-0 sm:px-4">
    <div class="w-full sm:max-w-md bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[80vh]">
        <div class="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <div>
                <h3 id="mobile-pres-setlist-title" class="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">Canciones del Repertorio</h3>
                <p id="mobile-pres-setlist-desc" class="text-xs text-zinc-500 dark:text-zinc-400">Selecciona una canción para ver su letra</p>
            </div>
            <button type="button" onclick="closeMobileSongsModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div id="mobile-presentation-songs-container" class="overflow-y-auto flex-1 p-3 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            <!-- Populated dynamically -->
        </div>
    </div>
</div>

<!-- MODAL / BOTTOM SHEET: Despacho de Indicaciones en Vivo (Solo Director) -->
<div id="modal-director-cue-pad" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-0 sm:px-4">
    <div class="w-full sm:max-w-lg bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden screen-fade flex flex-col max-h-[85vh]">
        
        <!-- Cabecera del Panel Táctil -->
        <div class="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
                <span id="modal-cue-status-dot" class="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                <div>
                    <h3 class="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">Indicador en Vivo a la Banda</h3>
                    <p id="modal-cue-status-desc" class="text-[11px] text-zinc-500 dark:text-zinc-400">Emisión inactiva • Abre mensajes o inicia para transmitir</p>
                </div>
            </div>
            <button type="button" onclick="closeDirectorCuePad()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">
                <i class="fa-solid fa-xmark text-sm pointer-events-none"></i>
            </button>
        </div>

        <!-- Pestañas de Navegación -->
        <div class="grid grid-cols-4 gap-1 p-1.5 mx-4 mt-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl text-xs font-semibold flex-shrink-0">
            <button type="button" onclick="switchDirectorCueTab('keys')" id="tab-cue-btn-keys" class="py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm transition">Tonos</button>
            <button type="button" onclick="switchDirectorCueTab('dynamics')" id="tab-cue-btn-dynamics" class="py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition">Dinámica</button>
            <button type="button" onclick="switchDirectorCueTab('custom')" id="tab-cue-btn-custom" class="py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition">Mis Atajos</button>
            <button type="button" onclick="switchDirectorCueTab('text')" id="tab-cue-btn-text" class="py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition">Libre</button>
        </div>

        <!-- Contenedor de Pestañas Scrollable -->
        <div class="overflow-y-auto flex-1 p-4 space-y-3">
            
            <!-- Pestaña 1: Selector Rápido de Tonalidades -->
            <div id="tab-cue-content-keys" class="space-y-2.5">
                <div class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Nota Base para Improvisación
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <button type="button" onclick="dispatchKeyCue('Do', 'C')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">C</button>
                    <button type="button" onclick="dispatchKeyCue('Re', 'D')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">D</button>
                    <button type="button" onclick="dispatchKeyCue('Mi', 'E')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">E</button>
                    <button type="button" onclick="dispatchKeyCue('Fa', 'F')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">F</button>
                    <button type="button" onclick="dispatchKeyCue('Sol', 'G')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">G</button>
                    <button type="button" onclick="dispatchKeyCue('La', 'A')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">A</button>
                    <button type="button" onclick="dispatchKeyCue('Si', 'B')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 active:scale-95 transition">B</button>
                    <button type="button" onclick="toggleDirectorCueSharp()" id="btn-cue-sharp-toggle" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-bold text-sm transition">#</button>
                </div>
                
                <div class="grid grid-cols-2 gap-2 pt-1">
                    <button type="button" onclick="setDirectorCueQuality('Mayor')" id="btn-cue-quality-maj" class="py-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition">Mayor</button>
                    <button type="button" onclick="setDirectorCueQuality('Menor')" id="btn-cue-quality-min" class="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:text-zinc-900 dark:hover:text-zinc-200 transition">Menor (m)</button>
                </div>
            </div>

            <!-- Pestaña 2: Dinámicas & Estructura -->
            <div id="tab-cue-content-dynamics" class="hidden grid grid-cols-2 gap-2.5">
                <button type="button" onclick="dispatchDirectCue('Ir a Coro', 'Estructura')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-blue-600 dark:text-blue-400">Ir a Coro</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Transición</div>
                </button>
                <button type="button" onclick="dispatchDirectCue('Ir a Puente', 'Estructura')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-purple-600 dark:text-purple-400">Ir a Puente</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Subida</div>
                </button>
                <button type="button" onclick="dispatchDirectCue('Bajar a Suave', 'Dinámica')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-emerald-600 dark:text-emerald-400">Bajar Intensidad</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Piano / Acústico</div>
                </button>
                <button type="button" onclick="dispatchDirectCue('Subir con Fuerza', 'Dinámica')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-red-600 dark:text-red-400">Fuerza / Toda la banda</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Fortissimo</div>
                </button>
                <button type="button" onclick="dispatchDirectCue('A Capella / Solo Voces', 'Dinámica')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-amber-600 dark:text-amber-400">A Capella</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Solo voces</div>
                </button>
                <button type="button" onclick="dispatchDirectCue('Corte / Final', 'Estructura')" class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-left transition active:scale-95">
                    <div class="font-bold text-xs text-zinc-700 dark:text-zinc-300">Corte / Final</div>
                    <div class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Terminar compás</div>
                </button>
            </div>

            <!-- Pestaña 3: Mis Atajos Privados -->
            <div id="tab-cue-content-custom" class="hidden space-y-3">
                <div id="director-personal-cues-list" class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <div class="text-xs text-zinc-400 text-center py-4">Cargando tus atajos...</div>
                </div>

                <!-- Formulario para agregar atajo privado -->
                <div class="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <input type="text" id="input-new-personal-cue" placeholder="Nuevo atajo personal (ej. Salida a batería)" class="flex-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500">
                    <button type="button" onclick="addPersonalQuickCue()" class="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold transition hover:opacity-90 flex-shrink-0 cursor-pointer">
                        Guardar
                    </button>
                </div>
            </div>

            <!-- Pestaña 4: Mensaje Libre de Texto -->
            <div id="tab-cue-content-text" class="hidden space-y-2.5">
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Escribe un aviso puntual no previsto para que aparezca en las pantallas de la banda:</p>
                <div class="flex items-center gap-2">
                    <input type="text" id="input-free-text-cue" placeholder="Ej. Repetir coro 2 veces..." class="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500">
                    <button type="button" onclick="dispatchFreeTextCue()" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer flex-shrink-0">
                        Transmitir
                    </button>
                </div>
            </div>

        </div>

        <!-- Acciones Inferiores del Director -->
        <div class="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-2 flex-shrink-0">
            <button type="button" onclick="clearLiveCueBroadcast()" class="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer flex items-center gap-1.5">
                <i class="fa-solid fa-eraser text-xs"></i>
                <span>Despejar Pantalla</span>
            </button>
            <div class="flex items-center gap-2">
                <button type="button" id="btn-modal-stop-live" onclick="confirmStopLiveSync()" class="hidden px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-power-off text-xs"></i>
                    <span>Finalizar Emisión</span>
                </button>
                <button type="button" id="btn-modal-start-live" onclick="startDirectorFromPad()" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-tower-broadcast text-xs"></i>
                    <span>Iniciar Emisión</span>
                </button>
            </div>
        </div>

    </div>
</div>

<!-- Modal Personalizado: Confirmar Finalizar Emisión en Vivo -->
<div id="modal-confirm-stop-live" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Finalizar Emisión</h3>
            <button type="button" onclick="closeStopLiveSyncModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Deseas finalizar la Emisión en Vivo? Todos los integrantes se desconectarán y volverán a su navegación libre.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeStopLiveSyncModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" onclick="executeStopLiveSync()" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Finalizar Emisión</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal Personalizado: Confirmar Eliminar Atajo Personal -->
<div id="modal-confirm-delete-cue" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Eliminar Atajo</h3>
            <button type="button" onclick="closeDeleteCueModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Deseas eliminar este atajo personal? Podrás volver a crearlo cuando lo necesites.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeDeleteCueModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" id="btn-confirm-delete-cue-action" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Eliminar</button>
            </div>
        </div>
    </div>
</div>
