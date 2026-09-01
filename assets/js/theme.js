/**
 * ==============================================================================
 * Levare — Theme & Aesthetics Module (theme.js)
 * ==============================================================================
 * @fileoverview Gestiona la tematización dual (Modo Oscuro / Modo Claro), 
 * persistencia de preferencias de usuario y los colores de acento dinámicos.
 * ==============================================================================
 */

/**
 * Aplica el tema visual (oscuro o claro) a todo el documento HTML y actualiza los indicadores UI.
 * @param {string} themeName - Nombre del tema: 'dark' o 'light'.
 */
function applyTheme(themeName) {
    const isDark = themeName !== 'light';
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light-theme', 'bg-zinc-100', 'text-zinc-900');
        document.body.classList.add('dark-theme', 'bg-zinc-950', 'text-zinc-100');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-theme', 'bg-zinc-950', 'text-zinc-100');
        document.body.classList.add('light-theme', 'bg-zinc-100', 'text-zinc-900');
    }
    
    // Actualizar texto de estado y switch en la vista de perfil si está presente
    const statusText = document.getElementById('profile-theme-status-text');
    if (statusText) statusText.textContent = isDark ? 'Modo actual: Oscuro' : 'Modo actual: Claro';
    
    const switchBtn = document.getElementById('theme-switch-btn');
    const switchKnob = document.getElementById('theme-switch-knob');
    if (switchBtn && switchKnob) {
        if (isDark) {
            switchBtn.classList.remove('bg-zinc-300', 'dark:bg-zinc-700', 'bg-zinc-700');
            switchBtn.classList.add('bg-emerald-500');
            switchKnob.classList.remove('translate-x-0');
            switchKnob.classList.add('translate-x-5');
        } else {
            switchBtn.classList.remove('bg-emerald-500', 'bg-zinc-700');
            switchBtn.classList.add('bg-zinc-300', 'dark:bg-zinc-700');
            switchKnob.classList.remove('translate-x-5');
            switchKnob.classList.add('translate-x-0');
        }
    }

    // Actualizar icono en el Dashboard (Sol para modo oscuro -> pasar a claro, Luna para modo claro -> pasar a oscuro)
    const dashboardThemeIcon = document.getElementById('dashboard-theme-toggle-icon');
    const dashboardThemeBtn = document.getElementById('dashboard-theme-toggle-btn');
    if (dashboardThemeIcon) {
        if (isDark) {
            dashboardThemeIcon.className = 'fa-solid fa-sun text-sm text-amber-400';
            if (dashboardThemeBtn) dashboardThemeBtn.title = 'Cambiar a modo claro';
        } else {
            dashboardThemeIcon.className = 'fa-solid fa-moon text-sm text-zinc-700';
            if (dashboardThemeBtn) dashboardThemeBtn.title = 'Cambiar a modo oscuro';
        }
    }

    localStorage.setItem('worship_theme', themeName);
}

/**
 * Alterna entre el tema claro y oscuro mostrando una notificación toast informativa.
 */
function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(newTheme === 'light' ? "Modo claro activado" : "Modo oscuro activado");
}

window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
