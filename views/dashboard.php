<!-- Dashboard Screen (Minimalist UI - Responsive Desktop & Mobile Grid) -->
<div class="space-y-6 screen-fade max-w-4xl mx-auto pb-8">
    <!-- Top Header Bar with Active Group Selector & User Profile -->
    <header class="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
            <img src="icon-levareapp.svg" alt="Levare Logo" class="w-10 h-10 rounded-2xl shadow-sm object-cover border border-zinc-200 dark:border-zinc-800" />
            <div>
                <div class="flex items-center gap-2">
                    <h1 class="font-serif text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Levare</h1>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wide">v1.0 Beta</span>
                </div>
                <p class="hidden md:block text-xs text-zinc-500 dark:text-zinc-400">Plataforma de Organización Musical</p>
            </div>
        </div>

        <!-- Group Selector Dropdown & Actions -->
        <div class="flex items-center gap-2">
            <!-- Active Group Dropdown (Desktop Only - Hidden for Superadmin) -->
            <div id="group-selector-sidebar-container" class="relative desktop-only-nav">
                <select id="group-active-select" onchange="handleActiveGroupChangeSelect(event)" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer pr-7">
                    <!-- Loaded dynamically -->
                </select>
            </div>

            <!-- Theme & Logout -->
            <button type="button" id="dashboard-theme-toggle-btn" onclick="toggleTheme()" class="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs hover:bg-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer" title="Cambiar tema">
                <i id="dashboard-theme-toggle-icon" class="fa-solid fa-sun text-sm dark:text-amber-400"></i>
            </button>
            <button type="button" onclick="confirmLogout()" class="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer" title="Cerrar sesión">
                <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
        </div>
    </header>

    <!-- Welcome Hero Card (Always Dark for Rich Contrast) -->
    <div class="p-6 rounded-2xl bg-zinc-900 text-zinc-100 border border-zinc-800 space-y-4 shadow-md">
        <div class="flex items-center justify-between">
            <span id="dashboard-date" class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">--</span>
            <span id="dashboard-user-role-badge" class="px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60 uppercase">
                MIEMBRO
            </span>
        </div>
        <div class="flex items-center gap-4">
            <div id="dashboard-user-avatar" class="w-14 h-14 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center font-bold text-xl uppercase shadow-md border border-zinc-700 cursor-pointer" onclick="navigateTo('profile')" title="Ver mi perfil">
                
            </div>
            <div>
                <h2 id="welcome-message" class="font-serif text-2xl md:text-3xl font-bold text-zinc-100">¡Hola!</h2>
                <p id="dashboard-user-subtitle" class="text-xs text-zinc-400">Te damos la bienvenida a tu panel musical</p>
            </div>
        </div>
    </div>

    <!-- ==================== SUPER ADMIN EXCLUSIVE PANEL ==================== -->
    <div id="dashboard-superadmin-section" class="space-y-6 hidden">
        <!-- Platform Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <div class="flex items-center justify-between text-zinc-400">
                    <span class="text-[11px] font-bold uppercase tracking-wider">Usuarios</span>
                    <i class="fa-solid fa-users text-xs"></i>
                </div>
                <p id="sa-stat-users" class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</p>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Plataforma activa</p>
            </div>

            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <div class="flex items-center justify-between text-zinc-400">
                    <span class="text-[11px] font-bold uppercase tracking-wider">Bandas</span>
                    <i class="fa-solid fa-people-group text-xs"></i>
                </div>
                <p id="sa-stat-groups" class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</p>
                <p class="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Grupos creados</p>
            </div>

            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <div class="flex items-center justify-between text-zinc-400">
                    <span class="text-[11px] font-bold uppercase tracking-wider">Canciones</span>
                    <i class="fa-solid fa-music text-xs"></i>
                </div>
                <p id="sa-stat-songs" class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</p>
                <p class="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">En catálogo</p>
            </div>

            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <div class="flex items-center justify-between text-zinc-400">
                    <span class="text-[11px] font-bold uppercase tracking-wider">Web Push</span>
                    <i class="fa-solid fa-bell text-xs text-amber-500"></i>
                </div>
                <p id="sa-stat-push" class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">--</p>
                <p class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Dispositivos suscritos</p>
            </div>
        </div>

        <!-- Global Broadcast Action Card -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-md space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                            DIFUSIÓN GLOBAL
                        </span>
                        <span class="text-xs text-zinc-400">• Toda la plataforma</span>
                    </div>
                    <h3 class="font-serif text-xl font-bold text-zinc-100">Emitir Anuncio o Novedad</h3>
                    <p class="text-xs text-zinc-400 max-w-lg">
                        Publica comunicados, novedades de versión o invitaciones. Los usuarios verán el anuncio en su inicio y recibirán notificación Web Push al instante.
                    </p>
                </div>
                <button type="button" onclick="openCreateGlobalAnnouncementModal()" class="px-5 py-3 rounded-xl bg-white text-zinc-950 text-xs font-bold shadow-md hover:bg-zinc-100 transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                    <i class="fa-solid fa-bullhorn text-xs"></i>
                    <span>Nuevo Anuncio Global</span>
                </button>
            </div>
        </div>

        <!-- System Announcements History (Superadmin View) -->
        <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">ANUNCIOS GLOBALES DEL SISTEMA</h3>
                <button type="button" onclick="loadSuperadminDashboardData(true)" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-rotate text-[10px]"></i> Actualizar
                </button>
            </div>

            <div id="sa-announcements-list" class="space-y-2.5">
                <!-- Loaded dynamically by JS -->
            </div>

            <!-- Load More Container: SA Announcements -->
            <div id="sa-announcements-load-more-container" class="pt-2 text-center hidden">
                <button type="button" id="btn-sa-announcements-load-more" class="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm cursor-pointer">
                    Cargar más
                </button>
            </div>
        </div>
    </div>

    <!-- ==================== REGULAR USER SECTION (Next Event) ==================== -->
    <div id="dashboard-regular-user-section" class="space-y-6">
        <!-- Next Event Section (Full Width Card) -->
        <div id="dashboard-next-event-card" class="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">PRÓXIMO EVENTO</span>
                <span id="next-event-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">--</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 id="next-event-name" class="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">No hay eventos programados</h3>
                    <div class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        <i class="fa-regular fa-calendar text-xs"></i>
                        <span id="next-event-date">Sin fecha</span>
                        <span>•</span>
                        <span id="next-event-time">--:--</span>
                    </div>
                </div>
            </div>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                <span class="text-zinc-600 dark:text-zinc-400">Repertorio: <strong id="next-event-setlist-name" class="text-zinc-900 dark:text-zinc-200 font-semibold">Sin repertorio asignado</strong></span>
                <button type="button" onclick="navigateTo('events')" class="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline flex items-center gap-1 cursor-pointer">Ir a eventos <i class="fa-solid fa-chevron-right text-[10px]"></i></button>
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
</div>
