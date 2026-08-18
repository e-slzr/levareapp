<!-- Songs Screen (Minimalist UI - Dual Light & Dark Mode) -->
<div id="subpanel-songs-list" class="space-y-5 screen-fade">
    <header class="flex items-center justify-between pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Canciones</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Biblioteca del repertorio general</p>
        </div>
        <button type="button" id="btn-add-song" onclick="openAddSongModal()" class="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition cursor-pointer">
            +
        </button>
    </header>

    <!-- Search Input -->
    <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </div>
        <input type="text" id="songs-search-input" placeholder="Buscar por título, artista o tono..." style="padding-left: 40px !important;" class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
    </div>

    <!-- Song List Container (Grid / List) -->
    <div id="songs-catalog-list" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Rendered dynamically by JS -->
    </div>
</div>

<!-- Subpanel 2: Visor de Letra y Acordes -->
<div id="subpanel-song-detail" class="space-y-4 screen-fade hidden">
    <!-- Header Controls Bar -->
    <div class="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <!-- Row 1: Back + Title/Artist (Left) + Media Links (Right) -->
        <div class="flex items-center justify-between gap-3 w-full md:w-auto min-w-0 flex-1">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <button type="button" id="back-to-songs" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition flex-shrink-0">
                    <i class="fa-solid fa-arrow-left text-xs"></i>
                    <span>Volver</span>
                </button>
                <div class="min-w-0 flex-1">
                    <h2 id="song-detail-title" class="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate">...</h2>
                    <p id="song-detail-artist" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">...</p>
                </div>
            </div>

            <div id="song-media-links" class="flex items-center gap-2 flex-shrink-0">
                <!-- Dynamic Youtube/Spotify links -->
            </div>
        </div>

        <!-- Row 2: TONO (Left) + SCROLL (Right) -->
        <div class="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto flex-shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-800/60">
            <!-- Tonality control widget -->
            <div class="flex items-center gap-1.5">
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Tono:</span>
                <div class="flex items-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-0.5">
                    <button type="button" id="btn-transpose-down" class="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 text-sm">-</button>
                    <span id="song-current-key" class="px-1.5 font-bold text-zinc-900 dark:text-zinc-100 min-w-[24px] text-center text-sm">-</span>
                    <button type="button" id="btn-transpose-up" class="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 text-sm">+</button>
                </div>
                <button type="button" id="btn-transpose-reset" class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                    Rest.
                </button>
            </div>

            <!-- Autoscroll widget -->
            <div class="flex items-center gap-1.5">
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Scroll:</span>
                <button type="button" id="btn-scroll-toggle" class="w-8 h-8 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 transition" style="width: 100px;">
                    <i class="fa-solid fa-play text-[10px]"></i>
                </button>
                <select id="scroll-speed-select" class="px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none">
                    <option value="1">x1</option>
                    <option value="2" selected>x2</option>
                    <option value="3">x3</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Visor de Letra y Acordes -->
    <div id="lyrics-container" class="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 font-mono text-sm leading-relaxed overflow-x-auto shadow-sm">
        <pre id="chords-lyrics-content" class="whitespace-pre-wrap font-mono text-zinc-800 dark:text-zinc-200">
            <!-- Dynamic Lyrics -->
        </pre>
    </div>
</div>

<!-- Subpanel 3: Wizard de Creación / Edición de Canción (Pantalla Completa) -->
<div id="subpanel-song-wizard" class="space-y-5 screen-fade hidden pb-36 md:pb-24">
    <!-- Header Controls Bar -->
    <div class="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0 flex-1">
            <button type="button" id="btn-wizard-back-to-list" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition flex-shrink-0">
                <i class="fa-solid fa-arrow-left text-xs"></i>
                <span>Volver</span>
            </button>
            <div class="min-w-0 flex-1">
                <h2 id="wizard-view-title" class="font-serif font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate">Agregar Canción</h2>
                <p id="wizard-view-subtitle" class="text-xs text-zinc-500 dark:text-zinc-400">Paso 1 de 2: Información general</p>
            </div>
        </div>

        <!-- Progress Steps Indicator -->
        <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-800/60">
            <span id="step-indicator-1" class="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span class="w-4 h-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 inline-flex items-center justify-center text-[9px] font-bold">1</span>
                Identidad
            </span>
            <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
            <span id="step-indicator-2" class="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent">
                <span class="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 inline-flex items-center justify-center text-[9px] font-bold">2</span>
                Letra y Acordes
            </span>
        </div>
    </div>

    <!-- Formulario en Tarjeta Principal -->
    <div class="p-5 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form id="song-wizard-form" class="space-y-5 max-w-2xl mx-auto">
            <input type="hidden" id="song-form-id">
            <input type="hidden" id="song-form-suggestion-id">
            <input type="hidden" id="song-form-content">
            <input type="hidden" id="song-form-key" value="C">

            <!-- ================= PASO 1: IDENTIDAD ================= -->
            <div id="wizard-step-1" class="space-y-4">
                <!-- Título -->
                <div class="space-y-1.5">
                    <label for="song-form-title" class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Título de la Canción / Obra <span class="text-red-500">*</span></label>
                    <input type="text" id="song-form-title" placeholder="Ej. Claro de Luna, Sinfonía No. 5, Canon en Re..." required class="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                </div>

                <!-- Artista y Álbum -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label for="song-form-artist" class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Artista / Compositor / Banda <span class="text-xs text-zinc-400 font-normal normal-case">(Opcional)</span></label>
                        <input type="text" id="song-form-artist" placeholder="Ej. Ludwig van Beethoven, W. A. Mozart, J. S. Bach..." class="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                    </div>
                    <div class="space-y-1.5">
                        <label for="song-form-album" class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Álbum / Obra <span class="text-xs text-zinc-400 font-normal normal-case">(Opcional)</span></label>
                        <input type="text" id="song-form-album" placeholder="Ej. Opus 27 No. 2, Concierto para Piano No. 21..." class="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                    </div>
                </div>

                <!-- Tono Base y Switch Medley -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-1">
                    <!-- Columna 1: Tono Base -->
                    <div class="space-y-1.5" id="column-base-key">
                        <label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Tono Base Original</label>
                        <div id="container-base-key">
                            <button type="button" id="btn-select-base-key" class="w-full p-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between transition cursor-pointer h-[54px]">
                                <div class="flex items-center gap-2.5">
                                    <span id="selected-base-key-badge" class="w-8 h-8 rounded-lg font-bold font-mono text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">C</span>
                                    <div class="text-left">
                                        <span id="selected-base-key-name" class="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Do Mayor (C)</span>
                                        <span class="text-[10px] text-zinc-400">Toca para cambiar</span>
                                    </div>
                                </div>
                                <span class="text-xs font-semibold text-zinc-400 flex items-center gap-1">Cambiar <i class="fa-solid fa-chevron-right text-[10px]"></i></span>
                            </button>
                        </div>

                        <!-- Banner de Medley Informativo (Visible cuando medley es ON) -->
                        <div id="container-medley-info" class="p-2.5 px-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 hidden h-[54px] flex items-center">
                            <div>
                                <span class="font-bold block text-[11px]"><i class="fa-solid fa-layer-group mr-1"></i> Modo Popurrí / Medley</span>
                                <span class="text-[10px] opacity-80">Modulaciones y escalas múltiples</span>
                            </div>
                        </div>
                    </div>

                    <!-- Columna 2: Switch Medley -->
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Arreglo Musical</label>
                        <div class="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-[54px]">
                            <div>
                                <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Es un Popurrí / Medley</span>
                                <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Varias canciones en una sola</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="song-form-is-medley" class="sr-only peer">
                                <div class="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-zinc-950"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Enlace Multimedia -->
                <div class="space-y-1.5 pt-1">
                    <label for="song-form-url" class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Enlace a Video o Audio <span class="text-xs text-zinc-400 font-normal normal-case">(Opcional)</span></label>
                    <input type="url" id="song-form-url" placeholder="https://youtube.com/watch?v=..." class="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                </div>

                <!-- Botones Paso 1 -->
                <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="button" id="btn-wizard-cancel-1" class="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
                    <button type="button" id="btn-wizard-next" class="px-6 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-2">
                        <span>Siguiente</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                </div>
            </div>

            <!-- ================= PASO 2: CONSTRUCTOR Y VISTA PREVIA ================= -->
            <div id="wizard-step-2" class="space-y-5 hidden">
                <!-- Botones de Acción del Paso 2 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" id="btn-open-chord-builder" class="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                        <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
                        <span>Editor de Letra y Acordes</span>
                    </button>
                    <button type="button" id="btn-open-import-chords" class="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-paste text-xs"></i>
                        <span>Pegar desde Internet</span>
                    </button>
                </div>

                <!-- Vista Previa de Letra con Acordes Arriba -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Vista Previa de Letra y Acordes</label>
                        <span id="preview-sections-count" class="text-[10px] text-zinc-400 font-semibold">0 secciones</span>
                    </div>

                    <div id="wizard-live-preview-box" class="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 min-h-[220px] max-h-[380px] overflow-y-auto font-mono text-xs leading-relaxed">
                        <div id="wizard-preview-content" class="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                            <div class="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs font-sans">
                                Aún no has agregado la letra con acordes.<br>
                                Haz clic en <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Editor de Letra y Acordes"</strong> o <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Pegar desde Internet"</strong> para comenzar.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de Navegación Paso 2 -->
                <div class="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="button" id="btn-delete-song" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline hidden">Eliminar Canción</button>
                    <div class="flex items-center gap-2.5 ml-auto">
                        <button type="button" id="btn-wizard-prev" class="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5">
                            <i class="fa-solid fa-arrow-left text-[10px]"></i>
                            <span>Atrás</span>
                        </button>
                        <button type="submit" id="btn-save-song-wizard" class="px-6 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition">
                            Guardar Canción
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- ================= MODALS SECTION ================= -->

<!-- 1. MODAL SELECTOR INICIAL: AGREGAR CANCIÓN (CREAR NUEVA / CATÁLOGO) -->
<div id="modal-song-choose-type" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
                <h3 class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Nueva Canción</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Selecciona cómo deseas registrar la canción</p>
            </div>
            <button type="button" class="btn-close-choose-type text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-1 gap-3">
            <!-- Opción 1: Crear Nueva -->
            <button type="button" id="btn-choose-create-new" class="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-left flex items-start gap-3.5 group cursor-pointer">
                <div class="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-105 transition">
                    <i class="fa-solid fa-pen-nib"></i>
                </div>
                <div class="space-y-0.5">
                    <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white">Crear Nueva Canción</h4>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Ingresa los datos, letra y ubica los acordes de forma interactiva.</p>
                </div>
            </button>

            <!-- Opción 2: Desde Catálogo (Próximamente) -->
            <div class="w-full p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/30 opacity-75 flex items-start gap-3.5 cursor-not-allowed">
                <div class="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                </div>
                <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h4 class="font-bold text-sm text-zinc-700 dark:text-zinc-300">Desde Catálogo</h4>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Próximamente</span>
                    </div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Explora canciones de la biblioteca compartida para importarlas directamente.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 3. MODAL DEL CONSTRUCTOR VISUAL DE LETRA Y ACORDES -->
<div id="modal-chord-builder" class="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-3xl h-[92vh] flex flex-col p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-3.5">
        
        <!-- Header del Constructor -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 flex-shrink-0">
            <div>
                <h3 class="font-serif text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Editor de Letra y Acordes</h3>
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Ubica el cursor de escritura e inserta acordes o secciones interactivas.</p>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" id="btn-apply-chord-builder" class="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition">
                    Listo
                </button>
                <button type="button" id="btn-close-chord-builder-x" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold p-1">&times;</button>
            </div>
        </div>

        <!-- Barra de Herramientas Flotante del Constructor -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex-shrink-0 text-xs">
            <div class="flex items-center gap-2">
                <button type="button" id="btn-toolbar-add-chord" class="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-bold hover:border-zinc-400 transition flex items-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-circle-plus text-amber-500 text-xs"></i>
                    <span>Agregar Acorde</span>
                </button>
                <button type="button" id="btn-toolbar-add-section" class="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-bold hover:border-zinc-400 transition flex items-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-bookmark text-zinc-400 text-xs"></i>
                    <span>Agregar Sección</span>
                </button>
            </div>

            <div class="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Tono Base: <strong id="builder-current-key-badge" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">C</strong></span>
            </div>
        </div>

        <!-- Lienzo de Edición Enriquecido -->
        <div class="flex-1 min-h-0 relative border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden flex flex-col">
            <div id="visual-chord-editor" contenteditable="true" spellcheck="false" class="flex-1 p-4 overflow-y-auto font-mono text-sm leading-loose text-zinc-900 dark:text-zinc-100 focus:outline-none select-text whitespace-pre-wrap">
                <!-- Se inyectan las líneas estructuradas con Badges -->
            </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-zinc-400 flex-shrink-0 pt-1">
            <span>Tip: Puedes arrastrar cualquier acorde para ajustar su posición, o hacer clic sobre él para cambiarlo o eliminarlo.</span>
        </div>
    </div>
</div>

<!-- 4. MODAL SELECTOR DE ACORDES (MATRIZ CON BÚSQUEDA Y FILTROS) -->
<div id="modal-chord-picker" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-3 z-[60] hidden screen-fade">
    <div class="w-full max-w-md p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <div>
                <h4 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Seleccionar Acorde</h4>
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Elige o busca el acorde a insertar</p>
            </div>
            <button type="button" class="btn-close-chord-picker text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold">&times;</button>
        </div>

        <!-- Buscador de Acordes -->
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <input type="text" id="chord-picker-search" placeholder="Buscar acorde (ej. F#m, Bm7, G/B)..." style="padding-left: 36px !important;" class="w-full pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>

        <!-- Fila de Filtros: Alteraciones (Normal / # / b) y Tipo (Mayores / Menores / 7mas) -->
        <div class="space-y-2 text-xs">
            <!-- Alteraciones (Toggle Exclusivo) -->
            <div class="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[10px] font-semibold text-zinc-500 uppercase px-1.5">Alteración:</span>
                <div class="flex items-center gap-1">
                    <button type="button" id="btn-alt-sharp" class="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                        # Sostenido
                    </button>
                    <button type="button" id="btn-alt-flat" class="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                        b Bemol
                    </button>
                </div>
            </div>

            <!-- Familia / Tipo de Acorde -->
            <div class="flex items-center justify-between gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <button type="button" id="btn-type-maj" class="flex-1 py-1 text-center rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition">
                    Mayores
                </button>
                <button type="button" id="btn-type-min" class="flex-1 py-1 text-center rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                    Menores (m)
                </button>
                <button type="button" id="btn-type-7th" class="flex-1 py-1 text-center rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                    7mas
                </button>
            </div>
        </div>

        <!-- Sugerencias según Tono Base -->
        <div id="chord-picker-suggestions-wrap" class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Acordes en Tonalidad (<span id="picker-key-label">C</span>):</span>
            <div id="chord-picker-suggestions" class="flex flex-wrap gap-1.5">
                <!-- Sugerencias dinámicas -->
            </div>
        </div>

        <!-- Matriz de Acordes -->
        <div class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Todos los Acordes:</span>
            <div id="chord-picker-grid" class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                <!-- Botones de acordes generados por JS -->
            </div>
        </div>
    </div>
</div>

<!-- 5. MODAL SELECTOR DE SECCIONES ([INTRO], [VERSO], [CORO]...) -->
<div id="modal-section-picker" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] hidden screen-fade">
    <div class="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <div>
                <h4 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Agregar Sección</h4>
                <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Elige la sección a insertar en mayúsculas</p>
            </div>
            <button type="button" class="btn-close-section-picker text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="INTRO">
                [INTRO]
            </button>
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="VERSO">
                [VERSO] <span class="text-[10px] text-zinc-400 block font-normal">(Autocorrelativo)</span>
            </button>
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="PRE-CORO">
                [PRE-CORO]
            </button>
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="CORO">
                [CORO]
            </button>
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="PUENTE">
                [PUENTE]
            </button>
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="SOLO">
                [SOLO]
            </button>
            <button type="button" class="btn-insert-section col-span-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition text-center" data-section="OUTRO">
                [OUTRO]
            </button>
        </div>
    </div>
</div>

<!-- 6. MODAL IMPORTAR DESDE INTERNET (CONVERSOR INTELIGENTE) -->
<div id="modal-import-chords" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-xl p-5 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
                <h3 class="font-serif text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Pegar Letra desde Internet</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Pega texto con acordes sobre la letra (formato LaCuerda / Ultimate Guitar)</p>
            </div>
            <button type="button" class="btn-close-import-modal text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-2">
            <textarea id="import-chords-raw-input" rows="10" placeholder="Pega aquí la letra y acordes copiados de internet, por ejemplo:&#10;&#10;INTRO D A Bm F#m G D G A&#10;&#10;D         A         Bm        F#m&#10;Escucha hermano la canción de la alegría&#10;G         D         G         A&#10;el canto alegre del que espera un nuevo día&#10;&#10;CORO&#10;D     A       Bm        F#m&#10;Ven, canta, sueña cantando&#10;G     D       A         D&#10;vive libre soñando un nuevo sol" class="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 leading-relaxed"></textarea>
            <p class="text-[11px] text-zinc-400">El conversor detectará automáticamente las secciones en [MAYÚSCULAS], las líneas instrumentales y fusionará los acordes en su posición exacta sobre la letra.</p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" class="btn-close-import-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancelar</button>
            <button type="button" id="btn-convert-imported-chords" class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5">
                <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
                <span>Convertir e Insertar</span>
            </button>
        </div>
    </div>
</div>

<!-- 7. POPOVER FLOTANTE PARA ACCIONES DE BADGE DE ACORDE (CAMBIAR / ELIMINAR) -->
<div id="popover-chord-action" class="fixed z-[70] hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1.5 flex items-center gap-1 text-xs screen-fade">
    <button type="button" id="btn-popover-change-chord" class="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
        <i class="fa-solid fa-pen text-[10px] text-zinc-400"></i>
        <span>Cambiar</span>
    </button>
    <button type="button" id="btn-popover-delete-chord" class="px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
        <i class="fa-solid fa-trash text-[10px]"></i>
        <span>Eliminar</span>
    </button>
</div>

<!-- 8. MODAL CONFIRMAR ELIMINAR CANCIÓN -->
<div id="modal-delete-song-confirm" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Eliminar Canción</h3>
            <button type="button" id="btn-close-delete-song-modal-x" class="btn-close-modal text-zinc-400 hover:text-zinc-600 text-lg font-bold">&times;</button>
        </div>
        <p class="text-xs text-zinc-600 dark:text-zinc-400">
            ¿Estás seguro de que deseas eliminar la canción "<strong id="delete-song-modal-name" class="text-zinc-900 dark:text-zinc-100">---</strong>"? Esta acción la removerá de la biblioteca y de los repertorios.
        </p>
        <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" id="btn-cancel-delete-song" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cancelar</button>
            <button type="button" id="btn-confirm-delete-song" class="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700">Eliminar</button>
        </div>
    </div>
</div>

