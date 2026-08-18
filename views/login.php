<!-- LOGIN VIEW (Minimalist UI - Fixed Dark Theme) -->
<div class="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 screen-fade">
    <div id="view-login" class="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 text-center">
        <div class="flex flex-col items-center gap-2">
            <img src="icon-levareapp.svg" alt="Levare Logo" class="w-12 h-12 rounded-2xl shadow-sm object-cover border border-zinc-800" />
            <h1 class="font-serif text-3xl font-bold tracking-tight text-zinc-100">Levare</h1>
            <p class="text-xs text-zinc-400">Gestiona tu banda musical, repertorios, eventos e integrantes</p>
        </div>

        <form id="login-form" class="space-y-4 text-left pt-2">
            <div class="space-y-1">
                <label for="login-email" class="text-xs text-zinc-400">Correo Electrónico o Usuario</label>
                <input type="text" id="login-email" placeholder="ejemplo@levare.com o @usuario" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1">
                <label for="login-password" class="text-xs text-zinc-400">Contraseña</label>
                <input type="password" id="login-password" placeholder="••••••••" required class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition shadow-sm">
                Iniciar Sesión
            </button>
        </form>

        <div class="pt-2 border-t border-zinc-800/80 text-xs space-y-1 text-zinc-400">
            <p>¿Nuevo usuario? <a href="#" id="go-to-leader-register" class="text-zinc-100 font-semibold hover:underline">Regístrate aquí</a></p>
            <p><a href="#" id="go-to-member-invite" class="text-zinc-500 hover:text-zinc-300">Tengo un código de invitación</a></p>
        </div>
    </div>

    <!-- LIDER REGISTER VIEW -->
    <div id="view-leader-register" class="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 text-center hidden">
        <div class="flex flex-col items-center gap-2">
            <h2 class="font-serif text-2xl font-bold text-zinc-100">Crear una cuenta</h2>
            <p class="text-xs text-zinc-400">Comienza a gestionar tu banda</p>
        </div>
        <form id="leader-register-form" class="space-y-3.5 text-left">
            <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label for="register-name" class="text-xs text-zinc-400">Nombre</label>
                    <input type="text" id="register-name" placeholder="Ej. Carlos" required class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
                <div class="space-y-1">
                    <label for="register-lastname" class="text-xs text-zinc-400">Apellido</label>
                    <input type="text" id="register-lastname" placeholder="Ej. Mendoza" required class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
                </div>
            </div>
            <div class="space-y-1">
                <label for="register-email" class="text-xs text-zinc-400">Correo Electrónico</label>
                <input type="email" id="register-email" placeholder="lider@levare.com" required class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1">
                <label for="register-password" class="text-xs text-zinc-400">Contraseña</label>
                <input type="password" id="register-password" placeholder="Mínimo 6 caracteres" required minlength="6" class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition">
                Crear Cuenta
            </button>
        </form>
        <div class="text-xs text-zinc-400">
            <p>¿Ya tienes cuenta? <a href="#" id="go-to-login" class="text-zinc-100 font-semibold hover:underline">Inicia sesión</a></p>
        </div>
    </div>

    <!-- MANDATORY PASSWORD RESET VIEW -->
    <div id="view-force-password" class="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 text-center hidden">
        <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg mb-1">
                <i class="fa-solid fa-key"></i>
            </div>
            <h2 class="font-serif text-2xl font-bold text-zinc-100">Actualizar Contraseña</h2>
            <p class="text-xs text-zinc-400">Por razones de seguridad debes establecer una nueva contraseña personalizada antes de continuar.</p>
        </div>
        <form id="force-password-form" class="space-y-3.5 text-left">
            <div class="space-y-1">
                <label for="force-password-new" class="text-xs text-zinc-400">Nueva Contraseña</label>
                <input type="password" id="force-password-new" placeholder="••••••••" required minlength="6" class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <div class="space-y-1">
                <label for="force-password-confirm" class="text-xs text-zinc-400">Confirmar Nueva Contraseña</label>
                <input type="password" id="force-password-confirm" placeholder="••••••••" required minlength="6" class="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition" />
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition shadow-sm">
                Guardar Nueva Contraseña
            </button>
        </form>
    </div>
</div>

