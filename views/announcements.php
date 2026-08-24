<!-- Announcements Screen (Novedades y Anuncios) -->
<div class="space-y-5 screen-fade max-w-4xl mx-auto pb-24">
    <header class="flex items-center justify-between pt-2">
        <div>
            <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <button type="button" onclick="navigateTo('dashboard')" class="hover:underline flex items-center gap-1">
                    <i class="fa-solid fa-arrow-left text-[10px]"></i> Inicio
                </button>
                <span>/</span>
                <span>Novedades</span>
            </div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Novedades y Anuncios</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Historial completo de actividades del equipo</p>
        </div>
    </header>

    <!-- Filters Bar -->
    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm">
        <!-- Search Keyword -->
        <div class="relative w-full sm:flex-1 min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </div>
            <input type="text" id="announcements-search-input" placeholder="Buscar en el historial..."
                style="padding-left: 40px !important;"
                class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
        </div>

        <!-- Filter Date -->
        <div class="relative w-full sm:w-52 min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <i class="fa-regular fa-calendar text-sm"></i>
            </div>
            <input type="date" id="announcements-date-input" onclick="try{this.showPicker()}catch(e){}"
                style="padding-left: 40px !important;"
                class="w-full max-w-full box-border pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer" />
        </div>

        <!-- Reset Button -->
        <button type="button" id="btn-clear-announcements-filters" title="Limpiar filtros"
            class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-rotate-left text-xs"></i>
            <span class="inline">Limpiar</span>
        </button>
    </div>

    <!-- Active Filter Info -->
    <div id="announcements-filter-summary" class="text-xs text-zinc-500 dark:text-zinc-400 hidden flex items-center justify-between px-1">
        <span id="announcements-filter-count">Mostrando registros</span>
        <button type="button" onclick="resetAnnouncementsFilters()" class="text-zinc-700 dark:text-zinc-300 font-semibold hover:underline">Ver todos</button>
    </div>

    <!-- Announcements Full List -->
    <div id="announcements-full-list" class="space-y-3">
        <!-- Rendered dynamically by JS -->
    </div>

    <!-- Load More Container -->
    <div id="announcements-load-more-container" class="pt-2 text-center hidden">
        <button type="button" id="btn-announcements-load-more" class="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
            Cargar más
        </button>
    </div>
</div>
