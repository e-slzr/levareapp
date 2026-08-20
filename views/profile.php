<!-- Profile & Settings Screen (Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-6 screen-fade max-w-2xl mx-auto">
    <header class="pt-2">
        <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Perfil & Ajustes</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">Preferencias de cuenta y bandas musicales</p>
    </header>

    <!-- Profile Info Card (Always Dark for Rich Contrast) -->
    <div class="p-5 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-4">
            <div class="relative group">
                <div id="profile-avatar-container" class="w-16 h-16 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center font-bold text-2xl uppercase shadow-md border border-zinc-700 overflow-hidden">
                    E
                </div>
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <h2 id="profile-full-name" class="font-bold text-lg text-zinc-100">Eliu Salazar</h2>
                    <span id="profile-system-role-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                        LÍDER
                    </span>
                </div>
                <p id="profile-user-details" class="text-xs text-zinc-400 mt-0.5">@eliu.asalazar</p>
            </div>
        </div>

        <!-- Photo Action Buttons -->
        <div class="flex items-center gap-2">
            <label id="btn-upload-avatar" for="profile-avatar-upload" class="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm" title="Cambiar foto">
                <i class="fa-solid fa-camera text-xs"></i>
                <span class="hidden sm:inline">Foto</span>
                <input type="file" id="profile-avatar-upload" class="hidden" accept="image/*" />
            </label>

            <button type="button" id="btn-remove-avatar" class="px-3 py-1.5 rounded-xl border border-red-900/50 bg-red-950/20 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition" title="Eliminar foto">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        </div>
    </div>

    <!-- Active Band / Group Management Section -->
    <div id="profile-band-management-section" class="space-y-3">
        <h3 class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">GESTIÓN DE BANDAS</h3>
        
        <div class="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3.5 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Banda Activa</h4>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Selecciona con cuál banda trabajar</p>
                </div>
                <div class="relative">
                    <select id="group-active-select-profile" onchange="handleActiveGroupChangeSelect(event)" class="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition cursor-pointer pr-8">
                        <!-- Populated dynamically via JS -->
                    </select>
                </div>
            </div>

            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2">
                <button type="button" onclick="openCreateGroupModal()" class="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-plus text-xs"></i>
                    <span>Crear Banda</span>
                </button>
                <button type="button" onclick="openJoinGroupModal()" class="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-user-plus text-xs"></i>
                    <span>Unirme a Banda</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Preferences & Account Section -->
    <div class="space-y-3">
        <h3 class="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">AJUSTES & PREFERENCIAS</h3>
        
        <div class="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <!-- Edit Profile Trigger -->
            <button type="button" onclick="openEditProfileModal()" class="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition text-left cursor-pointer">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-user-pen text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <div>
                        <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Editar Información de Perfil</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">Modifica tu nombre, apellido, correo y @username</p>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-zinc-400 dark:text-zinc-500 text-xs"></i>
            </button>

            <!-- Change Password Trigger -->
            <button type="button" onclick="openChangePasswordModal()" class="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition text-left cursor-pointer">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-lock text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <div>
                        <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Cambiar Contraseña</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">Actualiza tus credenciales de acceso</p>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-zinc-400 dark:text-zinc-500 text-xs"></i>
            </button>

            <!-- Theme Switcher -->
            <div class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-moon text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <div>
                        <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Apariencia Visual</h4>
                        <p id="profile-theme-status-text" class="text-xs text-zinc-500 dark:text-zinc-400">Modo actual: Oscuro</p>
                    </div>
                </div>
                <button type="button" id="theme-switch-btn" onclick="toggleTheme()" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-zinc-700">
                    <span id="theme-switch-knob" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
                </button>
            </div>

            <!-- Accent Color Selector -->
            <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-palette text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <div>
                        <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Color de Énfasis</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">Personaliza acordes y elementos destacados</p>
                    </div>
                </div>
                <div class="flex items-center gap-2.5 self-end sm:self-auto" id="accent-colors-selector">
                    <button type="button" data-accent="purple" class="accent-dot-btn w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white transition hover:scale-110 cursor-pointer shadow-sm" title="Violeta"></button>
                    <button type="button" data-accent="green" class="accent-dot-btn w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white transition hover:scale-110 cursor-pointer shadow-sm" title="Esmeralda"></button>
                    <button type="button" data-accent="yellow" class="accent-dot-btn w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white transition hover:scale-110 cursor-pointer shadow-sm" title="Ámbar"></button>
                    <button type="button" data-accent="aqua" class="accent-dot-btn w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white transition hover:scale-110 cursor-pointer shadow-sm" title="Cyan"></button>
                    <button type="button" data-accent="red" class="accent-dot-btn w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white transition hover:scale-110 cursor-pointer shadow-sm" title="Coral"></button>
                    <button type="button" data-accent="white" class="accent-dot-btn w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-100 border border-zinc-400 dark:border-zinc-300 flex items-center justify-center text-zinc-900 transition hover:scale-110 cursor-pointer shadow-sm" title="Neutral"></button>
                </div>
            </div>

            <!-- Push Notifications Switcher -->
            <div class="p-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-bell text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <div>
                        <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Notificaciones Push</h4>
                        <p id="profile-push-status-text" class="text-xs text-zinc-500 dark:text-zinc-400">Recibe alertas en este dispositivo</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" id="btn-test-push-notif" onclick="triggerTestPushNotification()" class="hidden px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer" title="Enviar notificación de prueba">
                        <i class="fa-solid fa-paper-plane text-[10px]"></i>
                        <span class="hidden sm:inline ml-1">Probar</span>
                    </button>
                    <button type="button" id="push-switch-btn" onclick="togglePushNotifications()" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-zinc-300 dark:bg-zinc-700">
                        <span id="push-switch-knob" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                    </button>
                </div>
            </div>

            <!-- Band Members Link -->
            <button type="button" id="profile-band-members-row" onclick="navigateTo('members')" class="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition text-left border-t border-zinc-100 dark:border-zinc-800/60 cursor-pointer">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-users text-zinc-500 dark:text-zinc-400 text-sm"></i>
                    <span class="text-sm font-medium text-zinc-900 dark:text-zinc-200">Miembros de la Banda</span>
                </div>
                <i class="fa-solid fa-chevron-right text-zinc-400 dark:text-zinc-500 text-xs"></i>
            </button>

            <!-- Logout -->
            <button type="button" onclick="confirmLogout()" class="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left text-red-600 dark:text-red-400 cursor-pointer">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                    <span class="text-sm font-semibold">Cerrar Sesión</span>
                </div>
            </button>
        </div>
    </div>

</div>

<!-- MODAL 1: Editar Perfil -->
<div id="modal-edit-profile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Editar Perfil</h3>
            <button type="button" onclick="closeEditProfileModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <form id="profile-info-form" onsubmit="handleProfileInfoSubmit(event)" class="p-5 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1.5">
                    <label for="profile-input-name" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre</label>
                    <input type="text" id="profile-input-name" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
                <div class="space-y-1.5">
                    <label for="profile-input-lastname" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Apellido</label>
                    <input type="text" id="profile-input-lastname" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
            </div>

            <div id="profile-email-container" class="space-y-1.5">
                <label for="profile-input-email" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Correo Electrónico</label>
                <input type="email" id="profile-input-email" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-1.5">
                <label for="profile-input-username" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nombre de Usuario (@username)</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-semibold text-zinc-400 dark:text-zinc-500">@</div>
                    <input type="text" id="profile-input-username" required style="padding-left: 32px !important;" class="w-full pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
                <div id="profile-username-feedback" class="text-[11px] font-medium hidden"></div>
            </div>

            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeEditProfileModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" id="btn-profile-save" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL 2: Cambiar Contraseña -->
<div id="modal-change-password" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Cambiar Contraseña</h3>
            <button type="button" onclick="closeChangePasswordModal()" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <form id="profile-password-form" onsubmit="handleProfilePasswordSubmit(event)" class="p-5 space-y-4">
            <div class="space-y-1.5">
                <label for="profile-input-current-password" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Contraseña Actual</label>
                <input type="password" id="profile-input-current-password" placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-1.5">
                <label for="profile-pw-new" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nueva Contraseña</label>
                <input type="password" id="profile-pw-new" placeholder="Mínimo 6 caracteres" required minlength="6" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="space-y-1.5">
                <label for="profile-pw-confirm" class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Confirmar Nueva Contraseña</label>
                <input type="password" id="profile-pw-confirm" placeholder="••••••••" required minlength="6" class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>

            <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" id="toggle-show-passwords" onchange="togglePasswordVisibility(this.checked)" class="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 cursor-pointer accent-zinc-900 dark:accent-white" />
                <label for="toggle-show-passwords" class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    Mostrar contraseñas
                </label>
            </div>

            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" onclick="closeChangePasswordModal()" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="submit" id="btn-submit-password" class="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition">Actualizar Contraseña</button>
            </div>
        </form>

    </div>
</div>

<!-- MODAL 3: Confirmar Eliminar Avatar -->
<div id="modal-confirm-remove-avatar" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden px-4">
    <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden screen-fade">
        <div class="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">Eliminar Foto de Perfil</h3>
            <button type="button" id="btn-close-remove-avatar-modal-x" class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition">&times;</button>
        </div>
        <div class="p-5 space-y-4">
            <p class="text-xs text-zinc-600 dark:text-zinc-400">¿Estás seguro de que deseas eliminar tu foto de perfil actual? Se volverán a mostrar tus iniciales.</p>
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                <button type="button" id="btn-cancel-remove-avatar" class="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancelar</button>
                <button type="button" id="btn-confirm-remove-avatar" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition">Eliminar Foto</button>
            </div>
        </div>
    </div>
</div>
