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
        <aside class="presentation-sidebar w-72 md:w-80 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
            <div class="presentation-sidebar-header p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5 flex-shrink-0">
                <button type="button" id="btn-presentation-back" class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                    <i class="fa-solid fa-arrow-left text-xs"></i>
                    <span>Cerrar Repertorio</span>
                </button>
                <div>
                    <h3 id="presentation-setlist-title" class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">Repertorio</h3>
                    <p id="presentation-setlist-desc" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Sin descripción</p>
                </div>
            </div>
            <div id="presentation-songs-list-container" class="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 space-y-1">
                <!-- Populated dynamically -->
            </div>
        </aside>

        <!-- Right Side: Song Viewer (Main Content Panel) -->
        <section class="presentation-song-viewer flex-1 min-w-0 flex flex-col overflow-hidden h-full">
            <!-- Controls bar -->
            <div class="presentation-viewer-header p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-zinc-50 dark:bg-zinc-900/90 flex-shrink-0">
                <!-- Row 1: Title & Artist (Left) + Ver Canciones Button (Right) -->
                <div class="flex items-center justify-between gap-3 w-full md:w-auto min-w-0 flex-1">
                    <div class="min-w-0 flex-1">
                        <h2 id="pres-song-title" class="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate">Cargando canción...</h2>
                        <p id="pres-song-artist" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">...</p>
                    </div>
                    <!-- Toggle list button (mobile only) -->
                    <button type="button" id="btn-toggle-presentation-songs" onclick="openMobileSongsModal()" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition flex-shrink-0">
                        <i class="fa-solid fa-list-ul text-xs"></i>
                        <span id="btn-toggle-songs-text">Ver Canciones</span>
                    </button>
                </div>

                <!-- Row 2: Tonality (Left) + Autoscroll (Right) -->
                <div class="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto flex-shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-800/60">
                    <!-- Tonality control widget -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Tono:</span>
                        <div class="flex items-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-0.5">
                            <button type="button" id="btn-pres-transpose-down" class="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 text-sm">-</button>
                            <span id="pres-song-current-key" class="px-1.5 font-bold text-zinc-900 dark:text-zinc-100 min-w-[24px] text-center text-sm">C</span>
                            <button type="button" id="btn-pres-transpose-up" class="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 text-sm">+</button>
                        </div>
                        <button type="button" id="btn-pres-transpose-reset" class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                            Rest.
                        </button>
                    </div>

                    <!-- Autoscroll widget -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Scroll:</span>
                        <button type="button" id="btn-pres-scroll-toggle" class="w-8 h-8 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 transition" style="width: 100px;">
                            <i class="fa-solid fa-play text-[10px]"></i>
                        </button>
                        <select id="pres-scroll-speed-select" class="px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none">
                            <option value="1">x1</option>
                            <option value="2" selected>x2</option>
                            <option value="3">x3</option>
                        </select>
                    </div>
                </div>
            </div>


            <!-- Scrollable lyrics area -->
            <div id="pres-lyrics-container" class="flex-1 overflow-y-auto overflow-x-auto p-6">
                <pre id="pres-chords-lyrics-content" class="whitespace-pre-wrap font-mono text-sm md:text-base leading-loose text-zinc-800 dark:text-zinc-200">
                    <!-- Populated dynamically -->
                </pre>
            </div>
        </section>
    </div>
</div>


<!-- ================= MODALS SECTION ================= -->

<!-- MODAL: Crear / Editar Repertorio -->
<div id="modal-setlist" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <h3 id="setlist-modal-title" class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Crear Nuevo Repertorio</h3>
            <button type="button" id="btn-close-setlist-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition btn-close-modal">&times;</button>
        </div>

        <form id="setlist-form" class="overflow-y-auto flex-1 p-5 space-y-4">
            <input type="hidden" id="setlist-form-id" />

            <div class="space-y-1.5">
                <label for="setlist-form-name" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre del Repertorio</label>
                <input type="text" id="setlist-form-name" placeholder="Ej. Repertorio de Concierto" required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-1.5">
                <label for="setlist-form-desc" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notas o Descripción</label>
                <input type="text" id="setlist-form-desc" placeholder="Ej. Ensayo general el sábado previo a las 6 PM"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-2">
                <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Buscar Canciones en el Catálogo</label>
                <input type="text" id="setlist-song-search" placeholder="Escribe al menos 3 letras del título o artista..."
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Seleccionar Canciones (Marca las que deseas incluir)</label>
                <div id="setlist-form-songs-selection" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto max-h-44 divide-y divide-zinc-100 dark:divide-zinc-800">
                    <!-- Populated dynamically with songs -->
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Orden del Repertorio (Arrastra o usa las flechas)</label>
                <div id="setlist-form-songs-order" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 min-h-[52px] p-2 flex flex-col gap-1">
                    <div class="no-songs-msg text-xs text-zinc-400 italic p-2">No has seleccionado ninguna canción todavía.</div>
                </div>
            </div>
        </form>

        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-shrink-0">
            <button type="button" id="btn-delete-setlist" class="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition" style="display: none;">
                <i class="fa-solid fa-trash-can mr-1"></i>Eliminar
            </button>
            <div class="flex items-center gap-2 ml-auto">
                <button type="button" id="btn-close-setlist-modal" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" form="setlist-form" id="btn-submit-setlist" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Guardar</button>
            </div>
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