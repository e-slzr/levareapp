<!-- Suggestions Screen -->
<div class="space-y-5 screen-fade">
    <header class="flex items-center justify-between pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Sugerencias</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Propón canciones para ensayar y vota por las del equipo</p>
        </div>
        <button type="button" id="btn-add-suggestion" class="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition cursor-pointer">
            +
        </button>
    </header>

    <!-- Filters Bar (Responsive Grid layout for Desktop & Mobile) -->
    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-sm">
        <div class="relative sm:col-span-5 min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </div>
            <input type="text" id="suggestions-filter-song" placeholder="Buscar por canción o artista..."
                style="padding-left: 40px !important;"
                class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
        </div>
        <div class="relative sm:col-span-4 min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-user text-sm"></i>
            </div>
            <input type="text" id="suggestions-filter-author" placeholder="Sugerido por..."
                style="padding-left: 40px !important;"
                class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
        </div>
        <div class="sm:col-span-3 min-w-0">
            <select id="suggestions-filter-status"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer">
                <option value="all">Todos los estados</option>
                <option value="pendiente">Sugeridas</option>
                <option value="agregada">Agregadas</option>
            </select>
        </div>
    </div>

    <!-- Suggestions List -->
    <div id="suggestions-container-list" class="space-y-3">
        <!-- Rendered dynamically by JS -->
    </div>
</div>

<!-- ================= MODALS ================= -->

<!-- MODAL: Sugerir Canción -->
<div id="modal-suggestion" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <h3 class="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">Sugerir Nueva Canción</h3>
            <button type="button" id="btn-close-suggestion-modal-x" class="btn-close-modal w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <form id="suggestion-form" class="overflow-y-auto flex-1 p-5 space-y-4">
            <div class="space-y-1.5">
                <label for="suggestion-form-title" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Título de la Canción</label>
                <input type="text" id="suggestion-form-title" placeholder="Ej. Yellow" required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1.5">
                <label for="suggestion-form-artist" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Artista / Banda</label>
                <input type="text" id="suggestion-form-artist" placeholder="Ej. Coldplay" required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1.5">
                <label for="suggestion-form-url" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Enlace a Video / Audio <span class="font-normal text-zinc-400">(opcional)</span></label>
                <input type="url" id="suggestion-form-url" placeholder="https://youtube.com/..."
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1.5">
                <label for="suggestion-form-notes" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Notas o Justificación <span class="font-normal text-zinc-400">(opcional)</span></label>
                <textarea id="suggestion-form-notes" rows="3" placeholder="¿Por qué deberíamos ensayar esta canción?"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition resize-none"></textarea>
            </div>
        </form>
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2 flex-shrink-0">
            <button type="button" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
            <button type="submit" form="suggestion-form" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Sugerir</button>
        </div>
    </div>
</div>

<!-- MODAL: Confirmar Eliminar Sugerencia -->
<div id="modal-delete-suggestion-confirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Eliminar Sugerencia</h3>
            <button type="button" id="btn-close-delete-suggestion-modal-x" class="btn-close-modal w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Estás seguro de que deseas eliminar esta sugerencia? Esta acción no se puede deshacer.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" id="btn-close-delete-suggestion-modal" class="btn-close-modal px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" id="btn-confirm-delete-suggestion" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Eliminar</button>
            </div>
        </div>
    </div>
</div>
