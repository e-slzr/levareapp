<!-- App Reusable Navbar / Navigation Bar (Always Dark Bar with Identical Active Pill) -->
<nav id="app-bottom-nav" class="backdrop-blur px-3 py-2 flex justify-around items-center z-30 fixed bottom-0 left-0 right-0 max-w-4xl mx-auto md:rounded-t-2xl md:border-x shadow-2xl">

    <!-- Inicio -->
    <button type="button" data-view="dashboard" onclick="navigateTo('dashboard')" class="app-nav-btn active cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-solid fa-house text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Inicio</span>
    </button>

    <!-- Canciones -->
    <button type="button" data-view="songs" onclick="navigateTo('songs')" class="app-nav-btn cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-solid fa-music text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Canciones</span>
    </button>

    <!-- Repertorios -->
    <button type="button" data-view="setlists" onclick="navigateTo('setlists')" class="app-nav-btn cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-solid fa-list-check text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Repertorios</span>
    </button>

    <!-- Eventos -->
    <button type="button" data-view="events" onclick="navigateTo('events')" class="app-nav-btn cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-regular fa-calendar-days text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Eventos</span>
    </button>

    <!-- Sugerencias — Desktop / Tablet -->
    <button type="button" data-view="suggestions" onclick="navigateTo('suggestions')" class="app-nav-btn desktop-only-nav cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-regular fa-lightbulb text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Sugerencias</span>
    </button>

    <!-- Perfil — Desktop / Tablet -->
    <button type="button" data-view="profile" onclick="navigateTo('profile')" class="app-nav-btn desktop-only-nav cursor-pointer flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-xs min-w-0">
        <i class="fa-solid fa-sliders text-base pointer-events-none"></i>
        <span class="pointer-events-none truncate">Perfil</span>
    </button>

    <!-- Botón "Más" — Mobile only -->
    <button type="button" id="btn-nav-more" onclick="openMoreMenu()" class="app-nav-btn mobile-only-nav cursor-pointer flex flex-col items-center gap-1 text-xs min-w-0">
        <i class="fa-solid fa-ellipsis text-base pointer-events-none"></i>
        <span class="pointer-events-none">Más</span>
    </button>

</nav>

<!-- ===================== "MÁS" BOTTOM SHEET (Mobile) ===================== -->
<div id="modal-more-menu" class="fixed inset-0 z-[100] flex flex-col justify-end hidden" onclick="closeMoreMenu(event)">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"></div>

    <!-- Sheet card -->
    <div class="relative w-full max-w-4xl mx-auto bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 space-y-5 pb-8 animate-slide-up">

        <!-- Drag handle -->
        <div class="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto -mt-1 mb-1"></div>

        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Menú Principal</h3>

        <!-- Banda Activa Selector -->
        <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Banda Activa</label>
            <select id="more-menu-group-select" onchange="handleMoreMenuGroupChange(this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition">
                <!-- Options populated by JS -->
            </select>
        </div>

        <!-- Grid of quick action items -->
        <div class="grid grid-cols-3 gap-3">
            <!-- Sugerencias -->
            <button type="button" onclick="closeMoreMenu(); navigateTo('suggestions');"
                class="more-menu-item flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition active:scale-95">
                <i class="fa-regular fa-lightbulb text-xl"></i>
                <span class="text-xs font-semibold">Sugerencias</span>
            </button>

            <!-- Miembros -->
            <button type="button" onclick="closeMoreMenu(); navigateTo('members');"
                class="more-menu-item flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition active:scale-95">
                <i class="fa-solid fa-users text-xl"></i>
                <span class="text-xs font-semibold">Miembros</span>
            </button>

            <!-- Perfil -->
            <button type="button" onclick="closeMoreMenu(); navigateTo('profile');"
                class="more-menu-item flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition active:scale-95">
                <i class="fa-solid fa-sliders text-xl"></i>
                <span class="text-xs font-semibold">Perfil</span>
            </button>
        </div>

        <!-- Close -->
        <button type="button" onclick="closeMoreMenu()" class="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            Cerrar
        </button>
    </div>
</div>
