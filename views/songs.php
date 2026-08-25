<!-- Songs Screen (Minimalist UI - Dual Light & Dark Mode) -->
<div id="subpanel-songs-list" class="space-y-5 screen-fade">
    <header class="flex items-center justify-between pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Canciones</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Biblioteca del repertorio general</p>
        </div>
        <div class="flex items-center gap-2">
            <button type="button" id="btn-open-community-catalog" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition flex items-center gap-2 shadow-sm cursor-pointer" title="Explorar canciones de la Comunidad">
                <i class="fa-solid fa-earth-americas text-blue-600 dark:text-blue-400 text-xs"></i>
                <span>Comunidad</span>
            </button>
            <button type="button" id="btn-add-song" onclick="openAddSongModal()" class="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition cursor-pointer" title="Nueva Canción">
                +
            </button>
        </div>
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

    <!-- Load More Container -->
    <div id="songs-load-more-container" class="pt-2 text-center hidden">
        <button type="button" id="btn-songs-load-more" class="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
            Cargar más
        </button>
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
                Información
            </span>
            <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
            <span id="step-indicator-2" class="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent">
                <span class="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 inline-flex items-center justify-center text-[9px] font-bold">2</span>
                Letra y Acordes
            </span>
        </div>
    </div>

    <!-- Formulario en Tarjeta Principal -->
    <div class="p-3.5 sm:p-5 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form id="song-wizard-form" class="space-y-4 w-full max-w-3xl md:max-w-4xl mx-auto">
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
                                <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Popurrí / Medley</span>
                                <span class="text-[10px] text-zinc-500 dark:text-zinc-400">Ensamble de canciones</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="song-form-is-medley" class="sr-only peer">
                                <div class="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-zinc-950"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Switch Compartir en la Comunidad -->
                <div class="space-y-1.5 pt-1">
                    <label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Comunidad Levare</label>
                    <div class="flex items-center justify-between p-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <div class="space-y-0.5 pr-2">
                            <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <i class="fa-solid fa-earth-americas text-blue-500 text-xs"></i>
                                Compartir en la Comunidad
                            </span>
                            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 block">Permite que otras bandas descubran y agreguen esta canción a su catálogo.</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" id="song-form-is-public" class="sr-only peer" checked>
                            <div class="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-zinc-950"></div>
                        </label>
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
                        <span>Editor Interactivo</span>
                    </button>
                    <button type="button" id="btn-open-import-chords" class="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-paste text-xs"></i>
                        <span>Pegar desde Internet</span>
                    </button>
                </div>

                <!-- Pestañas de Modo: Vista Previa vs Editor de Texto Plano -->
                <div class="space-y-2.5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <button type="button" id="tab-step2-preview" class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-eye text-[11px]"></i>
                                <span>Vista Previa</span>
                            </button>
                            <button type="button" id="tab-step2-raw" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-font text-[11px]"></i>
                                <span>Texto Plano</span>
                            </button>
                        </div>
                        <span id="preview-sections-count" class="text-[10px] text-zinc-400 font-semibold">0 secciones</span>
                    </div>

                    <!-- Contenedor 1: Vista Previa Renderizada -->
                    <div id="wizard-live-preview-box" class="p-4 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 h-[42vh] sm:h-[48vh] md:h-[52vh] min-h-[300px] md:min-h-[380px] max-h-[58vh] overflow-y-auto font-mono text-xs leading-relaxed">
                        <div id="wizard-preview-content" class="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                            <div class="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs font-sans">
                                Aún no has agregado la letra con acordes.<br>
                                Haz clic en <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Editor Interactivo"</strong> o <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Pegar desde Internet"</strong> para comenzar.
                            </div>
                        </div>
                    </div>

                    <!-- Contenedor 2: Editor en Texto Plano (ChordPro) -->
                    <div id="wizard-raw-editor-box" class="hidden space-y-1.5">
                        <textarea id="song-form-raw-editor" rows="15" placeholder="[INTRO]&#10;#[G] [D] [Em] [C]&#10;&#10;[VERSO 1]&#10;[G]Espíritu [D]Santo bienvenido a [Em]este lugar&#10;[C]Jesucristo..." class="w-full p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 leading-relaxed h-[42vh] sm:h-[48vh] md:h-[52vh] min-h-[300px] md:min-h-[380px] max-h-[58vh] resize-y"></textarea>
                        <p class="text-[11px] text-zinc-400 dark:text-zinc-500">Edita directamente la letra con acordes entre corchetes <code>[G]</code> o secciones como <code>[VERSO 1]</code>, <code>[CORO]</code>, <code>[INTRO]</code>.</p>
                    </div>
                </div>

                <!-- Botones de Navegación Paso 2 -->
                <div class="flex items-center justify-between pt-3 pb-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="button" id="btn-delete-song" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline hidden">Eliminar Canción</button>
                    <div class="flex items-center gap-2.5 ml-auto">
                        <button type="button" id="btn-wizard-prev" class="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-arrow-left text-[10px]"></i>
                            <span>Atrás</span>
                        </button>
                        <button type="submit" id="btn-save-song-wizard" class="px-6 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-sm">
                            Guardar Canción
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Subpanel 4: Catálogo de Canciones de la Comunidad -->
<div id="subpanel-community-catalog" class="space-y-5 screen-fade hidden pb-24 md:pb-16">
    <header class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-3 min-w-0 flex-1">
            <button type="button" id="btn-community-back-to-list" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer">
                <i class="fa-solid fa-arrow-left text-xs"></i>
                <span>Mi Repertorio</span>
            </button>
            <div class="min-w-0 flex-1">
                <h1 class="font-serif text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">Comunidad</h1>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">Canciones compartidas por bandas y usuarios de Levare</p>
            </div>
        </div>
    </header>

    <!-- Search and Filters Bar -->
    <div class="space-y-3">
        <!-- Search Input -->
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </div>
            <input type="text" id="community-songs-search-input" placeholder="Buscar en la comunidad por título, artista o álbum..." style="padding-left: 40px !important;" class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
        </div>

        <!-- Filter / Order Tabs -->
        <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div class="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button type="button" id="filter-comm-popular" class="btn-community-sort active px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition flex items-center gap-1.5 cursor-pointer" data-sort="popular">
                    <i class="fa-solid fa-fire text-amber-500 text-xs"></i>
                    <span>Más Populares</span>
                </button>
                <button type="button" id="filter-comm-recent" class="btn-community-sort px-3 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 cursor-pointer" data-sort="recent">
                    <i class="fa-solid fa-clock text-xs"></i>
                    <span>Más Recientes</span>
                </button>
                <button type="button" id="filter-comm-alpha" class="btn-community-sort px-3 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 cursor-pointer" data-sort="alpha">
                    <i class="fa-solid fa-arrow-down-a-z text-xs"></i>
                    <span>A - Z</span>
                </button>
            </div>
            <div id="community-songs-count" class="text-[11px] font-semibold text-zinc-400 px-2 flex-shrink-0">
                0 canciones
            </div>
        </div>
    </div>

    <!-- Community Songs Grid -->
    <div id="community-songs-grid" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Rendered dynamically by JS -->
    </div>

    <!-- Community Load More Container -->
    <div id="community-load-more-container" class="pt-2 text-center hidden">
        <button type="button" id="btn-community-load-more" class="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
            Cargar más
        </button>
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
            <button type="button" class="btn-close-choose-type text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold cursor-pointer">&times;</button>
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

            <!-- Opción 2: Desde Catálogo de la Comunidad -->
            <button type="button" id="btn-choose-from-catalog" class="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-left flex items-start gap-3.5 group cursor-pointer">
                <div class="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-105 transition">
                    <i class="fa-solid fa-earth-americas text-base"></i>
                </div>
                <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white">Desde Catálogo de la Comunidad</h4>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Levare</span>
                    </div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Explora canciones de la biblioteca compartida para importarlas directamente.</p>
                </div>
            </button>
        </div>
    </div>
</div>

<!-- 2. MODAL VISTA PREVIA CANCIÓN DE LA COMUNIDAD -->
<div id="modal-community-song-preview" class="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-2xl max-h-[90vh] flex flex-col p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        
        <!-- Header del Modal -->
        <div class="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5 flex-shrink-0 gap-3">
            <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                    <h3 id="comm-preview-title" class="font-serif text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">Título</h3>
                    <span id="comm-preview-key-badge" class="px-2 py-0.5 rounded-lg text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">C</span>
                    <span id="comm-preview-medley-badge" class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hidden">Medley</span>
                </div>
                <p id="comm-preview-artist-album" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">Artista • Álbum</p>
                <p id="comm-preview-creator" class="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <i class="fa-solid fa-user-pen text-[10px]"></i>
                    <span>Agregada por:</span>
                    <strong class="text-zinc-700 dark:text-zinc-300 font-semibold" id="comm-preview-creator-name">---</strong>
                </p>
            </div>
            <button type="button" id="btn-close-comm-preview-x" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold p-1 flex-shrink-0 cursor-pointer">&times;</button>
        </div>

        <!-- Action Bar: Like Button, Superadmin Actions & Add to Band Button -->
        <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <!-- Like Button -->
            <button type="button" id="btn-comm-preview-like" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold transition flex items-center gap-2 hover:scale-105 cursor-pointer">
                <i id="comm-preview-like-icon" class="fa-regular fa-heart text-zinc-400 text-sm"></i>
                <span id="comm-preview-likes-count" class="text-zinc-700 dark:text-zinc-300 font-mono">0</span>
                <span class="text-[11px] text-zinc-400 font-normal">Likes</span>
            </button>

            <!-- Acciones de Administración e Importar -->
            <div class="flex items-center gap-2">
                <div id="comm-preview-admin-actions" class="flex items-center gap-2 hidden">
                    <button type="button" id="btn-comm-preview-edit" class="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer" title="Editar canción comunitaria">
                        <i class="fa-solid fa-pen text-xs"></i>
                        <span>Editar</span>
                    </button>
                    <button type="button" id="btn-comm-preview-delete" class="px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-1.5 cursor-pointer" title="Eliminar de la comunidad">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                        <span>Eliminar</span>
                    </button>
                </div>

                <!-- Import / Add Button -->
                <div id="comm-preview-import-container">
                    <button type="button" id="btn-comm-preview-import" class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                        <i class="fa-solid fa-plus text-xs"></i>
                        <span>Agregar a mi Repertorio</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Chords and Lyrics View -->
        <div class="flex-1 min-h-[220px] max-h-[50vh] overflow-y-auto p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 font-mono text-xs leading-relaxed">
            <div id="comm-preview-chords-content" class="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                <!-- Chords rendered via parseChordsToHTML -->
            </div>
        </div>

        <!-- Audio/Video url link if exists -->
        <div id="comm-preview-url-wrapper" class="text-xs hidden flex-shrink-0">
            <a id="comm-preview-url-link" href="#" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                <span id="comm-preview-url-text">Ver enlace de video o audio</span>
            </a>
        </div>
    </div>
</div>

<!-- 3. MODAL DEL CONSTRUCTOR VISUAL DE LETRA Y ACORDES -->
<div id="modal-chord-builder" class="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-1 sm:p-2 md:p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-3xl h-[96vh] md:h-[92vh] flex flex-col p-2.5 sm:p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-2.5 md:space-y-3.5">
        
        <!-- Header del Constructor -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5 md:pb-3 flex-shrink-0">
            <div>
                <h3 class="font-serif text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Editor Interactivo</h3>
                <p class="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">Ubica el cursor e inserta acordes en la posición exacta.</p>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" id="btn-apply-chord-builder" class="px-3.5 sm:px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition cursor-pointer">
                    Listo
                </button>
                <button type="button" id="btn-close-chord-builder-x" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>
        </div>

        <!-- Barra de Herramientas del Constructor -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex-shrink-0 text-xs">
            <div class="flex items-center gap-2">
                <button type="button" id="btn-toolbar-add-section" class="px-3 sm:px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm cursor-pointer text-xs">
                    <i class="fa-solid fa-plus text-xs"></i>
                    <span>Agregar Sección</span>
                </button>
                <button type="button" id="btn-toggle-reorder-mode" class="px-3 sm:px-3.5 py-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer text-xs" title="Colapsar secciones para reordenar rápidamente">
                    <i class="fa-solid fa-arrows-up-down text-xs"></i>
                    <span id="reorder-mode-btn-label">Modo Ordenar</span>
                </button>
            </div>

            <div class="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Tono Base: <strong id="builder-current-key-badge" class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold font-mono">C</strong></span>
            </div>
        </div>

        <!-- Contenedor Dinámico de Bloques / Tarjetas de Sección (Drag & Drop) -->
        <div class="flex-1 min-h-0 relative border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden flex flex-col">
            <div id="section-cards-container" class="flex-1 p-1.5 sm:p-3 md:p-4 overflow-y-auto space-y-2.5 sm:space-y-3.5 select-text">
                <!-- Se inyectan las tarjetas modulares dinámicamente (.section-card-block) -->
            </div>
        </div>

        <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 flex-shrink-0 pt-0.5">
            <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-circle-info text-[10px] text-zinc-500"></i>
                <span>Arrastra el icono <i class="fa-solid fa-grip-vertical text-[10px] px-0.5"></i> para reordenar. El botón <strong class="text-rose-500 font-bold">+</strong> agrega acordes en el cursor.</span>
            </span>
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

        <div class="grid grid-cols-2 gap-2.5">
            <!-- INTRO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 text-xs font-bold text-purple-600 dark:text-purple-400 transition flex items-center justify-between group cursor-pointer" data-section="INTRO">
                <span>[INTRO]</span>
                <span class="text-[10px] opacity-70 font-normal">Instrumental</span>
            </button>
            <!-- VERSO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 text-xs font-bold text-blue-600 dark:text-blue-400 transition flex items-center justify-between group cursor-pointer" data-section="VERSO">
                <span>[VERSO]</span>
                <span class="text-[10px] opacity-70 font-normal">Auto #</span>
            </button>
            <!-- PRE-CORO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-xs font-bold text-amber-600 dark:text-amber-400 transition flex items-center justify-between group cursor-pointer" data-section="PRE-CORO">
                <span>[PRE-CORO]</span>
                <span class="text-[10px] opacity-70 font-normal">Letra</span>
            </button>
            <!-- CORO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-xs font-bold text-rose-600 dark:text-rose-400 transition flex items-center justify-between group cursor-pointer" data-section="CORO">
                <span>[CORO]</span>
                <span class="text-[10px] opacity-70 font-normal">Principal</span>
            </button>
            <!-- PUENTE -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-xs font-bold text-amber-600 dark:text-amber-400 transition flex items-center justify-between group cursor-pointer" data-section="PUENTE">
                <span>[PUENTE]</span>
                <span class="text-[10px] opacity-70 font-normal">Bridge</span>
            </button>
            <!-- SOLO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition flex items-center justify-between group cursor-pointer" data-section="SOLO">
                <span>[SOLO]</span>
                <span class="text-[10px] opacity-70 font-normal">Instrumental</span>
            </button>
            <!-- INTERLUDIO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition flex items-center justify-between group cursor-pointer" data-section="INTERLUDIO">
                <span>[INTERLUDIO]</span>
                <span class="text-[10px] opacity-70 font-normal">Instrumental</span>
            </button>
            <!-- OUTRO -->
            <button type="button" class="btn-insert-section p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 text-xs font-bold text-purple-600 dark:text-purple-400 transition flex items-center justify-between group cursor-pointer" data-section="OUTRO">
                <span>[OUTRO]</span>
                <span class="text-[10px] opacity-70 font-normal">Final</span>
            </button>
        </div>
    </div>
</div>

<!-- 6. MODAL IMPORTAR DESDE INTERNET (CONVERSOR INTELIGENTE Y URL) -->
<div id="modal-import-chords" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50 hidden screen-fade">
    <div class="w-full max-w-xl p-5 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
                <h3 class="font-serif text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Importar Letra y Acordes</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Importa desde un enlace web o pega el texto con acordes sobre la letra</p>
            </div>
            <button type="button" class="btn-close-import-modal text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold">&times;</button>
        </div>

        <!-- Opción 1: Extraer desde Enlace Web (LaCuerda.net / Cifra Club) -->
        <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 space-y-2.5">
            <div class="flex items-center justify-between">
                <label for="import-chords-url-input" class="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <i class="fa-solid fa-link text-xs text-zinc-500"></i>
                    <span>Pegar Enlace Web (LaCuerda.net / Cifra Club)</span>
                </label>
                <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Automático</span>
            </div>
            <div class="flex items-center gap-2">
                <input type="url" id="import-chords-url-input" placeholder="https://www.cifraclub.com/... o https://acordes.lacuerda.net/..." class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                <button type="button" id="btn-fetch-url-chords" class="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-cloud-arrow-down text-xs"></i>
                    <span>Obtener</span>
                </button>
            </div>
            <p class="text-[10px] text-zinc-400">Pega el link de la canción en <strong>LaCuerda.net</strong> o <strong>Cifra Club</strong> para extraer título, artista, tono y acordes al instante.</p>
        </div>

        <!-- Divisor -->
        <div class="relative flex py-0.5 items-center">
            <div class="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span class="flex-shrink mx-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">O pega el texto con acordes</span>
            <div class="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        <div class="space-y-2">
            <textarea id="import-chords-raw-input" rows="8" placeholder="Pega aquí la letra y acordes copiados de internet, por ejemplo:&#10;&#10;INTRO D A Bm F#m G D G A&#10;&#10;D         A         Bm        F#m&#10;Escucha hermano la canción de la alegría&#10;G         D         G         A&#10;el canto alegre del que espera un nuevo día&#10;&#10;CORO&#10;D     A       Bm        F#m&#10;Ven, canta, sueña cantando&#10;G     D       A         D&#10;vive libre soñando un nuevo sol" class="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 leading-relaxed"></textarea>
            <p class="text-[11px] text-zinc-400">El conversor detectará automáticamente las secciones en [MAYÚSCULAS], las líneas instrumentales y fusionará los acordes en su posición exacta sobre la letra.</p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
                <input type="checkbox" id="import-chords-auto-fill-meta" checked class="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-400">
                <span>Rellenar Título, Artista y Tono</span>
            </label>
            <div class="flex items-center gap-2">
                <button type="button" class="btn-close-import-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer">Cancelar</button>
                <button type="button" id="btn-convert-imported-chords" class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    <span>Convertir e Insertar</span>
                </button>
            </div>
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
            ¿Estás seguro de que deseas eliminar la canción "<strong id="delete-song-modal-name" class="text-zinc-900 dark:text-zinc-100">---</strong>"? Esta acción la removerá de la biblioteca de tu banda.
        </p>
        <div id="container-delete-from-community" class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 hidden">
            <label class="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" id="checkbox-delete-from-community" class="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600" />
                <div class="space-y-0.5">
                    <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Eliminar también de la Comunidad Levare</span>
                    <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Si dejas esta opción desmarcada, la canción se quitará de tu banda pero seguirá estando disponible en el catálogo general de la comunidad.</p>
                </div>
            </label>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" id="btn-cancel-delete-song" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cancelar</button>
            <button type="button" id="btn-confirm-delete-song" class="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700">Eliminar</button>
        </div>
    </div>
</div>

