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

<!-- ================= MODALS SECTION ================= -->
<!-- MODAL AGREGAR / EDITAR CANCIÓN -->
<div id="modal-song" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden">
    <div class="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 id="song-modal-title" class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Agregar Nueva Canción</h3>
            <button type="button" id="btn-close-song-modal-x" class="btn-close-modal text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold">&times;</button>
        </div>
        <form id="song-form" class="space-y-3.5">
            <input type="hidden" id="song-form-id">
            <input type="hidden" id="song-form-suggestion-id">
            
            <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2 space-y-1">
                    <label for="song-form-title" class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Nombre de Canción</label>
                    <input type="text" id="song-form-title" placeholder="Ej. Yellow" required class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                </div>
                <div class="space-y-1">
                    <label for="song-form-key" class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Tono Base</label>
                    <input type="text" id="song-form-key" placeholder="Ej. G o C" required class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                </div>
            </div>

            <div class="space-y-1">
                <label for="song-form-artist" class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Artista / Banda</label>
                <input type="text" id="song-form-artist" placeholder="Ej. Coldplay" required class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
            </div>

            <div class="space-y-1">
                <label for="song-form-url" class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Enlace a Video o Audio</label>
                <input type="url" id="song-form-url" placeholder="https://youtube.com/watch?v=..." class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
            </div>

            <div class="space-y-1">
                <label for="song-form-content" class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Letra con Acordes entre Corchetes [ ]</label>
                <textarea id="song-form-content" rows="8" placeholder="Ejemplo:&#10;[G] Te amo, [C] tu amor no [G] me falla...&#10;[D/F#] En tus [Em] manos..." class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"></textarea>
                <p class="text-[10px] text-zinc-400">Encierra los acordes entre corchetes, ej: [C], [Am], [F], [G] para permitir la transposición automática.</p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" id="btn-delete-song" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline hidden">Eliminar Canción</button>
                <div class="flex items-center gap-2 ml-auto">
                    <button type="button" id="btn-close-song-modal" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancelar</button>
                    <button type="submit" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90">Guardar</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- MODAL CONFIRMAR ELIMINAR CANCIÓN -->
<div id="modal-delete-song-confirm" class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden">
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
