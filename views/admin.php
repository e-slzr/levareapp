<!-- Admin Panel: Gestión de Usuarios & Feedback Beta (Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-6 screen-fade max-w-4xl mx-auto pb-12">

    <!-- Top Section Nav Switcher -->
    <div class="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div class="inline-flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button type="button" id="admin-nav-users" onclick="switchAdminSection('users')"
                class="admin-section-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm">
                <i class="fa-solid fa-users text-xs"></i>
                <span>Directorio de Usuarios</span>
            </button>
            <button type="button" id="admin-nav-feedback" onclick="switchAdminSection('feedback')"
                class="admin-section-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <i class="fa-solid fa-bug text-xs text-amber-500"></i>
                <span>Feedback</span>
                <span id="admin-badge-pending-feedback" class="hidden px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950">0</span>
            </button>
        </div>

        <div class="flex items-center gap-2">
            <button type="button" id="btn-refresh-admin-active" onclick="handleActiveAdminRefresh()" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-2 shadow-sm cursor-pointer">
                <i class="fa-solid fa-arrows-rotate text-xs text-zinc-400"></i>
                <span>Actualizar</span>
            </button>
        </div>
    </div>


    <!-- ========================================================================= -->
    <!-- SECTION 1: DIRECTORIO DE USUARIOS -->
    <!-- ========================================================================= -->
    <div id="admin-section-users" class="space-y-6">
        
        <!-- Header -->
        <header>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Directorio de Usuarios</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Control global de accesos, credenciales y membresías de bandas</p>
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


    <!-- ========================================================================= -->
    <!-- SECTION 2: REPORTES DE FEEDBACK & BUGS (Levare v1.0 Beta) -->
    <!-- ========================================================================= -->
    <div id="admin-section-feedback" class="space-y-6 hidden">

        <!-- Header -->
        <header>
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Reportes de Feedback</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gestiona sugerencias, errores y comentarios enviados por los usuarios</p>
        </header>

        <!-- Feedback Metrics Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <!-- Total Reports -->
            <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total</p>
                <p id="admin-fb-stat-total" class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">0</p>
            </div>

            <!-- Pending -->
            <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">Pendientes</p>
                <p id="admin-fb-stat-pending" class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">0</p>
            </div>

            <!-- In Progress -->
            <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">En Revisión</p>
                <p id="admin-fb-stat-progress" class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">0</p>
            </div>

            <!-- Resolved -->
            <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Resueltos</p>
                <p id="admin-fb-stat-resolved" class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">0</p>
            </div>
        </div>

        <!-- Search Bar & Status/Type Filters -->
        <div class="space-y-3">
            <div class="flex flex-col sm:flex-row gap-2">
                <div class="relative flex-1">
                    <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none"></i>
                    <input type="text" id="admin-feedback-search-input" placeholder="Buscar por título, descripción o usuario..."
                        style="padding-left: 38px !important;"
                        class="w-full pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
                <div class="relative">
                    <select id="admin-feedback-type-filter" onchange="handleFeedbackFilterChange()"
                        class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer pr-8">
                        <option value="">Todos los Tipos</option>
                        <option value="bug">Error / Bug</option>
                        <option value="suggestion">Sugerencia</option>
                        <option value="visual">Visual / UI</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
            </div>

            <!-- Status Switcher Tabs -->
            <div class="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-px overflow-x-auto">
                <button type="button" id="fb-tab-all" onclick="switchFeedbackStatusTab('all')"
                    class="admin-fb-tab-btn active px-4 py-2 text-xs font-bold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white transition cursor-pointer whitespace-nowrap">
                    Todos
                </button>
                <button type="button" id="fb-tab-pending" onclick="switchFeedbackStatusTab('pending')"
                    class="admin-fb-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer whitespace-nowrap">
                    Pendientes
                </button>
                <button type="button" id="fb-tab-in_progress" onclick="switchFeedbackStatusTab('in_progress')"
                    class="admin-fb-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer whitespace-nowrap">
                    En Revisión
                </button>
                <button type="button" id="fb-tab-resolved" onclick="switchFeedbackStatusTab('resolved')"
                    class="admin-fb-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer whitespace-nowrap">
                    Resueltos
                </button>
            </div>
        </div>

        <!-- Feedback Reports List Container -->
        <div id="admin-feedback-list" class="space-y-4">
            <div class="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
                Cargando reportes de feedback...
            </div>
        </div>

    </div>

</div>


<!-- ========================================================================= -->
<!-- MODALES DE ACCIÓN: USUARIOS -->
<!-- ========================================================================= -->

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


<!-- ========================================================================= -->
<!-- MODALES DE ACCIÓN: FEEDBACK -->
<!-- ========================================================================= -->

<!-- Modal 4: Lightbox de Capturas de Pantalla -->
<div id="modal-feedback-lightbox" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md hidden p-4" onclick="if(event.target === this) closeFeedbackLightbox()">
    <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center screen-fade">
        <button type="button" onclick="closeFeedbackLightbox()" 
            class="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-base transition cursor-pointer" title="Cerrar visor">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <img id="feedback-lightbox-img" src="" alt="Captura ampliada" class="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-zinc-700/50" />
        <p id="feedback-lightbox-caption" class="text-xs text-zinc-300 mt-3 text-center truncate max-w-xl"></p>
    </div>
</div>

<!-- Modal 5: Detalle Completo de Reporte de Feedback -->
<div id="modal-feedback-detail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-3 sm:px-4" onclick="if(event.target === this) closeFeedbackDetailModal()">
    <div class="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2.5">
                <div id="feedback-detail-type-icon" class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <i class="fa-solid fa-bug"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Detalle del Reporte</h3>
                    <p id="feedback-detail-subtitle" class="text-xs text-zinc-400">—</p>
                </div>
            </div>
            <button type="button" onclick="closeFeedbackDetailModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            
            <!-- Title & Status row -->
            <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <span id="feedback-detail-type-badge"></span>
                    <span id="feedback-detail-status-badge"></span>
                </div>
                <h2 id="feedback-detail-title" class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug"></h2>
            </div>

            <!-- Description Box -->
            <div class="space-y-1.5">
                <p class="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Descripción</p>
                <div id="feedback-detail-description" class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line select-text">
                </div>
            </div>

            <!-- Attachments Gallery (if any) -->
            <div id="feedback-detail-attachments-container" class="space-y-2 hidden">
                <p class="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Capturas Adjuntas <span id="feedback-detail-attachments-count" class="text-zinc-500 font-normal"></span>
                </p>
                <div id="feedback-detail-attachments-grid" class="flex items-center gap-2.5 flex-wrap"></div>
            </div>

            <!-- Device Telemetry -->
            <div id="feedback-detail-telemetry-container" class="space-y-2">
                <p class="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Ficha Técnica del Dispositivo</p>
                <div id="feedback-detail-telemetry-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs">
                </div>
            </div>

            <!-- Manage Status & Notes Form -->
            <form id="form-feedback-detail-manage" onsubmit="handleFeedbackStatusSubmit(event)" class="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <input type="hidden" id="edit-feedback-id" />

                <div class="space-y-1.5">
                    <label for="edit-feedback-status-select" class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Estado del Reporte
                    </label>
                    <select id="edit-feedback-status-select" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer">
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Revisión / Trabajando</option>
                        <option value="resolved">Resuelto / Solucionado</option>
                    </select>
                </div>

                <div class="space-y-1.5">
                    <label for="edit-feedback-admin-notes" class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Notas Internas del Administrador
                    </label>
                    <textarea id="edit-feedback-admin-notes" rows="2" placeholder="Ej. Solucionado en el commit fix(songs): corrección de transposición..."
                        class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition resize-none"></textarea>
                </div>
            </form>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between gap-2.5 flex-shrink-0">
            <button type="button" id="btn-detail-delete-feedback" onclick="triggerDeleteFromDetailModal()" class="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-trash-can text-xs"></i>
                <span class="hidden sm:inline">Eliminar Reporte</span>
            </button>
            <div class="flex items-center gap-2">
                <button type="button" onclick="closeFeedbackDetailModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                    Cerrar
                </button>
                <button type="button" onclick="document.getElementById('form-feedback-detail-manage').requestSubmit()" id="btn-save-feedback-status" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition cursor-pointer">
                    Guardar Cambios
                </button>
            </div>
        </div>

    </div>
</div>

<!-- Modal 6: Confirmar Eliminación de Reporte -->
<div id="modal-confirm-delete-feedback" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4" onclick="if(event.target === this) closeDeleteFeedbackModal()">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <i class="fa-solid fa-trash-can text-xs"></i>
                <span>Eliminar Reporte de Feedback</span>
            </div>
            <button type="button" onclick="closeDeleteFeedbackModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">&times;</button>
        </div>
        <div class="p-6 space-y-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">¿Estás seguro de que deseas eliminar este reporte de feedback?</p>
            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                <p id="delete-feedback-title" class="text-sm font-bold text-zinc-900 dark:text-zinc-100">—</p>
                <p id="delete-feedback-author" class="text-xs text-zinc-400">—</p>
            </div>
            <p class="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                Esta acción eliminará permanentemente el reporte y todas sus capturas de pantalla adjuntas del servidor.
            </p>
        </div>
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-2.5">
            <button type="button" onclick="closeDeleteFeedbackModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                Cancelar
            </button>
            <button type="button" id="btn-confirm-delete-feedback" onclick="executeDeleteFeedback()" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700 transition cursor-pointer">
                Eliminar Permanentemente
            </button>
        </div>
    </div>
</div>
