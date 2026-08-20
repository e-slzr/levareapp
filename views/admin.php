<!-- Admin Panel: Directorio Global de Usuarios (Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-6 screen-fade max-w-4xl mx-auto pb-12">

    <!-- Header & Actions -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Directorio de Usuarios</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Control global de accesos, credenciales y membresías de bandas</p>
        </div>
        <div class="flex items-center gap-2">
            <button type="button" id="btn-refresh-requests" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-2 shadow-sm cursor-pointer">
                <i class="fa-solid fa-arrows-rotate text-xs text-zinc-400"></i>
                <span>Actualizar</span>
            </button>
        </div>
    </header>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
        <!-- Total Users -->
        <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Usuarios</p>
            <p id="admin-stat-total" class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">—</p>
        </div>

        <!-- Active Users -->
        <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Activos</p>
            <p id="admin-stat-active" class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">—</p>
        </div>

        <!-- Blocked Users -->
        <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-500">Bloqueados</p>
            <p id="admin-stat-blocked" class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">—</p>
        </div>
    </div>

    <!-- Search Bar & Filters -->
    <div class="space-y-3">
        <!-- Search Input -->
        <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none"></i>
            <input type="text" id="admin-users-search-input" placeholder="Buscar por nombre, username o correo..."
                style="padding-left: 38px !important;"
                class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
        </div>


        <!-- Tabs Switcher -->
        <div class="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-px">
            <button type="button" id="tab-all-users" data-tab="all"
                class="admin-tab-btn active px-4 py-2 text-xs font-bold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white transition cursor-pointer">
                Todos
            </button>
            <button type="button" id="tab-active-users" data-tab="active"
                class="admin-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer">
                Activos
            </button>
            <button type="button" id="tab-blocked-users" data-tab="blocked"
                class="admin-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer">
                Bloqueados
            </button>
        </div>
    </div>

    <!-- Users List Container -->
    <div id="admin-requests-list" class="space-y-3">
        <div class="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
            <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
            Cargando directorio de usuarios...
        </div>
    </div>

</div>

<!-- ===================== MODALES DE ACCIÓN ===================== -->

<!-- Modal 1: Confirmar Bloqueo de Usuario -->
<div id="modal-confirm-block" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeBlockModal()">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <i class="fa-solid fa-user-slash text-xs"></i>
                <span>Bloquear Acceso</span>
            </div>
            <button type="button" id="btn-close-block-modal-x" onclick="closeBlockModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>
        <div class="p-6 space-y-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">¿Confirmas el bloqueo del siguiente usuario?</p>
            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                <p id="block-leader-name" class="text-sm font-bold text-zinc-900 dark:text-zinc-100">—</p>
                <p id="block-leader-email" class="text-xs text-zinc-400">—</p>
            </div>
            <p class="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                El usuario no podrá iniciar sesión en la aplicación ni acceder a sus bandas musicales mientras permanezca bloqueado.
            </p>
        </div>
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-2.5">
            <button type="button" onclick="closeBlockModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                Cancelar
            </button>
            <button type="button" id="btn-confirm-block" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700 transition cursor-pointer">
                Confirmar Bloqueo
            </button>
        </div>
    </div>
</div>

<!-- Modal 2: Confirmar Desbloqueo de Usuario -->
<div id="modal-confirm-unblock" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeUnblockModal()">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <i class="fa-solid fa-user-check text-xs"></i>
                <span>Desbloquear Usuario</span>
            </div>
            <button type="button" id="btn-close-unblock-modal-x" onclick="closeUnblockModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>
        <div class="p-6 space-y-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">¿Confirmas el desbloqueo del siguiente usuario?</p>
            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                <p id="unblock-leader-name" class="text-sm font-bold text-zinc-900 dark:text-zinc-100">—</p>
                <p id="unblock-leader-email" class="text-xs text-zinc-400">—</p>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Se restaurará de inmediato el acceso del usuario para iniciar sesión y sincronizar sus canciones y repertorios.
            </p>
        </div>
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-2.5">
            <button type="button" onclick="closeUnblockModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                Cancelar
            </button>
            <button type="button" id="btn-confirm-unblock" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition cursor-pointer">
                Confirmar Desbloqueo
            </button>
        </div>
    </div>
</div>

<!-- Modal 3: Restablecer Contraseña -->
<div id="modal-confirm-reset-leader-password" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeResetLeaderPasswordModal()">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <i class="fa-solid fa-key text-xs text-amber-500"></i>
                <span>Restablecer Contraseña</span>
            </div>
            <button type="button" id="btn-close-reset-leader-modal-x" onclick="closeResetLeaderPasswordModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>

        <!-- Step 1: Confirmation -->
        <div id="reset-leader-password-confirm-step" class="p-6 space-y-4">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Estás a punto de generar una clave temporal para:</p>
            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                <p id="reset-leader-name" class="text-sm font-bold text-zinc-900 dark:text-zinc-100">—</p>
                <p id="reset-leader-email" class="text-xs text-zinc-400">—</p>
            </div>
            <p class="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                Se generará una contraseña temporal y se exigirá al usuario actualizarla en su siguiente inicio de sesión.
            </p>
            <div class="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onclick="closeResetLeaderPasswordModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                    Cancelar
                </button>
                <button type="button" id="btn-confirm-reset-leader-password" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition cursor-pointer">
                    Generar Contraseña Temporal
                </button>
            </div>
        </div>

        <!-- Step 2: Show Password -->
        <div id="reset-leader-password-success-step" class="p-6 space-y-4 hidden">
            <div class="text-center space-y-2">
                <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-lg shadow-sm">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">¡Contraseña Restablecida!</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Comparte esta clave temporal con el usuario:</p>
            </div>

            <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                    <input type="text" id="generated-temporary-password" readonly
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-base font-mono font-bold text-center tracking-widest text-zinc-900 dark:text-zinc-100 select-all focus:outline-none" />
                    <button type="button" id="btn-copy-generated-password" class="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                        <i class="fa-regular fa-copy text-xs"></i>
                        <span>Copiar</span>
                    </button>
                </div>
                <p class="text-[11px] text-zinc-400 text-center">Se exigirá cambiar la contraseña en el primer ingreso.</p>
            </div>

            <div class="pt-2">
                <button type="button" onclick="closeResetLeaderPasswordModal()" class="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer">
                    Listo, Cerrar
                </button>
            </div>
        </div>
    </div>
</div>
