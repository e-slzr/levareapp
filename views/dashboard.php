<!-- Dashboard Screen (Minimalist UI - Responsive Desktop & Mobile Grid) -->
<div class="space-y-6 screen-fade max-w-4xl mx-auto pb-8">
    <!-- Top Header Bar with Active Group Selector & User Profile -->
    <header class="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
            <img src="icon-levareapp.svg" alt="Levare Logo" class="w-10 h-10 rounded-2xl shadow-sm object-cover border border-zinc-200 dark:border-zinc-800" />
            <div>
                <h1 class="font-serif text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Levare</h1>
                <p class="hidden md:block text-xs text-zinc-500 dark:text-zinc-400">Plataforma de Organización Musical</p>
            </div>
        </div>

        <!-- Group Selector Dropdown & Actions -->
        <div class="flex items-center gap-2">
            <!-- Active Group Dropdown (Desktop Only) -->
            <div id="group-selector-sidebar-container" class="relative desktop-only-nav">
                <select id="group-active-select" onchange="handleActiveGroupChangeSelect(event)" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer pr-7">
                    <!-- Loaded dynamically -->
                </select>
            </div>

            <!-- Theme & Logout -->
            <button type="button" onclick="toggleTheme()" class="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs hover:bg-zinc-300 dark:hover:bg-zinc-800 transition" title="Cambiar tema">
                <i class="fa-solid fa-sun text-sm dark:text-amber-400"></i>
            </button>
            <button type="button" onclick="confirmLogout()" class="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition" title="Cerrar sesión">
                <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
        </div>
    </header>

    <!-- Welcome Hero Card -->
    <div class="p-6 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
            <span id="dashboard-date" class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">MARTES, 11 DE AGOSTO</span>
            <span id="dashboard-user-role-badge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 uppercase">
                LÍDER DE BANDA
            </span>
        </div>
        <div class="flex items-center gap-4">
            <div id="dashboard-user-avatar" class="w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 flex items-center justify-center font-bold text-xl uppercase shadow-md border border-zinc-200 dark:border-zinc-700 cursor-pointer" onclick="navigateTo('profile')" title="Ver mi perfil">
                E
            </div>
            <div>
                <h2 id="welcome-message" class="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">¡Hola, Eliu!</h2>
                <p id="dashboard-user-subtitle" class="text-xs text-zinc-500 dark:text-zinc-400">Te damos la bienvenida a tu panel musical</p>
            </div>
        </div>
    </div>

    <!-- Next Event Section (Full Width Card) -->
    <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">PRÓXIMO EVENTO</span>
            <span id="next-event-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">ENSAYO</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <h3 id="next-event-name" class="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">Ensayo Dominical</h3>
                <div class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    <i class="fa-regular fa-calendar text-xs"></i>
                    <span id="next-event-date">Sábado, 15 de agosto</span>
                    <span>•</span>
                    <span id="next-event-time">18:00 hs</span>
                </div>
            </div>
        </div>
        <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
            <span class="text-zinc-600 dark:text-zinc-400">Repertorio: <strong id="next-event-setlist-name" class="text-zinc-900 dark:text-zinc-200 font-semibold">Sin repertorio asignado</strong></span>
            <button type="button" onclick="navigateTo('events')" class="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline flex items-center gap-1">Ver detalles <i class="fa-solid fa-chevron-right text-[10px]"></i></button>
        </div>
    </div>

    <!-- News & Announcements (Limited to 5 items in dashboard) -->
    <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">NOVEDADES Y ANUNCIOS</h3>
            <span class="text-[11px] text-zinc-400 dark:text-zinc-500">Últimos registros</span>
        </div>
        
        <div id="announcements-list" class="space-y-2.5">
            <!-- Dynamic notifications loaded by JS -->
        </div>

        <!-- View All Announcements Button -->
        <div id="announcements-view-all-container" class="pt-3 pb-24 text-center">
            <button type="button" onclick="navigateTo('announcements')" class="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                <i class="fa-regular fa-newspaper text-sm"></i>
                <span>Ver todas las novedades y anuncios</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
        </div>
    </div>
</div>
