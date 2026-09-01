/**
 * ==============================================================================
 * Levare — SPA Core Router & Application Shell (app.js)
 * ==============================================================================
 * @fileoverview Orquestador central de la Single Page Application (SPA):
 * - Inicialización del ciclo de vida y estado global (`currentUser`, `currentGroupId`).
 * - Enrutamiento basado en Hash (`handleHashRouting`, `navigateTo`).
 * - Transiciones de visibilidad entre autenticación y contenedor principal.
 * - Despachador de controladores de vistas modulares (`triggerViewInitializer`).
 * - Guardias de sincronización en segundo plano (`visibilitychange`).
 * - Menú inferior "Más" (Bottom Sheet).
 * ==============================================================================
 */

let currentUser = null;
let currentGroupId = null;

/**
 * Inicializa el cascarón de la aplicación y enlaza los eventos globales del router.
 */
function initApp() {
    currentUser = getData('currentUser');
    currentGroupId = getData('currentGroupId');

    // Aplicar color de acento del usuario activo
    if (currentUser) {
        applyAccentColor(currentUser.accentColor || 'purple');
    }

    // Configurar preferencia de tema (Oscuro por defecto)
    const storedTheme = localStorage.getItem('worship_theme') || 'dark';
    applyTheme(storedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.onclick = toggleTheme;

    // Enlazar eventos de autenticación y gestión de bandas desde sus módulos
    if (typeof bindAuthEvents === 'function') bindAuthEvents();
    if (typeof bindGroupEvents === 'function') bindGroupEvents();

    // Redirección al hacer clic en el avatar/perfil del sidebar
    const profileTrigger = document.getElementById('user-profile-sidebar-trigger');
    if (profileTrigger) {
        profileTrigger.onclick = () => {
            showView('profile');
            window.location.hash = '#profile';
        };
    }

    // Menú "Más" en dispositivos móviles
    const btnMobileMore = document.getElementById('btn-mobile-more');
    const mobileMoreMenu = document.getElementById('mobile-more-menu');
    const btnCloseMoreMenu = document.getElementById('btn-close-more-menu');

    if (btnMobileMore) {
        btnMobileMore.onclick = () => {
            if (mobileMoreMenu) mobileMoreMenu.classList.remove('hidden');
        };
    }
    if (btnCloseMoreMenu) {
        btnCloseMoreMenu.onclick = () => {
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden');
        };
    }
    if (mobileMoreMenu) {
        mobileMoreMenu.onclick = (e) => {
            if (e.target === mobileMoreMenu) {
                mobileMoreMenu.classList.add('hidden');
            }
        };
    }

    // Enlaces de navegación con atributo data-view
    document.querySelectorAll('[data-view]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            navigateTo(viewId);
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden');
        };
    });

    // Escuchador de cambios de hash en la URL
    window.onhashchange = handleHashRouting;

    // Auto-sincronización protegida al regresar a la pestaña/PWA
    let lastVisibilitySyncTime = 0;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && currentUser) {
            const now = Date.now();
            if (now - lastVisibilitySyncTime < 2500) return;
            lastVisibilitySyncTime = now;

            syncUserGroupsAndValidateMembership().then(() => {
                const currentView = window.location.hash.replace('#', '') || 'dashboard';
                if (canSafelyAutoRefreshView(currentView)) {
                    triggerViewInitializer(currentView, true);
                }
            });
        }
    });

    updateShellVisibility();
}

/**
 * Valida si la vista activa puede auto-refrescarse de forma segura sin perder borradores o interrumpir modales/presentación.
 * @param {string} viewId
 * @returns {boolean}
 */
function canSafelyAutoRefreshView(viewId) {
    // 1. Formularios de creación o reporte
    if (viewId === 'feedback') return false;

    // 2. Modo presentación de repertorios nunca debe interrumpirse
    if (document.body.classList.contains('setlist-presentation-mode')) return false;

    // 3. Modales interactivos abiertos
    const openModals = document.querySelectorAll('[id^="modal-"]:not(.hidden), .modal-backdrop:not(.hidden)');
    for (let i = 0; i < openModals.length; i++) {
        const m = openModals[i];
        if (m.id === 'modal-more-menu') continue;
        const style = window.getComputedStyle(m);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return false;
        }
    }

    // 4. Usuario enfocado activamente en un campo de texto
    const activeEl = document.activeElement;
    if (activeEl) {
        const tag = activeEl.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || activeEl.isContentEditable) {
            return false;
        }
    }

    return true;
}

/**
 * Alterna la visibilidad entre el cascarón de autenticación (Login/Registro) y el cascarón de la aplicación.
 */
async function updateShellVisibility() {
    const authContainer = document.getElementById('auth-container');
    const authFormsWrapper = document.getElementById('auth-forms-wrapper');
    const authOnboardingPanel = document.getElementById('auth-onboarding-panel');
    const mainContainer = document.getElementById('main-container');
    const viewLogin = document.getElementById('view-login');
    const viewRegister = document.getElementById('view-leader-register');
    const viewMemberInvite = document.getElementById('view-member-invite');
    const viewMemberRegister = document.getElementById('view-member-register');
    const viewForcePassword = document.getElementById('view-force-password');

    // Ocultar todas las capas inicialmente
    if (authContainer) authContainer.classList.add('hidden');
    if (authFormsWrapper) authFormsWrapper.classList.add('hidden');
    if (authOnboardingPanel) authOnboardingPanel.classList.add('hidden');
    if (mainContainer) mainContainer.classList.add('hidden');
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewRegister) viewRegister.classList.add('hidden');
    if (viewMemberInvite) viewMemberInvite.classList.add('hidden');
    if (viewMemberRegister) viewMemberRegister.classList.add('hidden');
    if (viewForcePassword) viewForcePassword.classList.add('hidden');

    if (!currentUser) {
        if (authContainer) authContainer.classList.remove('hidden');
        if (authFormsWrapper) authFormsWrapper.classList.remove('hidden');
        if (viewLogin) viewLogin.classList.remove('hidden');
        return;
    }

    // Bandera de cambio obligatorio de contraseña
    if (currentUser.must_change_password) {
        if (authContainer) authContainer.classList.remove('hidden');
        if (authFormsWrapper) authFormsWrapper.classList.remove('hidden');
        if (viewForcePassword) viewForcePassword.classList.remove('hidden');
        return;
    }

    // Verificar bandas activas en base de datos
    let userGroups = [];
    if (currentUser.account_type !== 'superadmin') {
        try {
            const res = await apiFetch('/groups');
            userGroups = Array.isArray(res) ? res : [];
            setData('userGroups', userGroups);
        } catch (e) {
            console.error("Fallo al obtener grupos del usuario", e);
            userGroups = getData('userGroups') || [];
        }

        if (!Array.isArray(userGroups) || userGroups.length === 0) {
            currentGroupId = null;
            setData('currentGroupId', null);
        } else {
            if (!currentGroupId || !userGroups.some(g => g.id == currentGroupId)) {
                currentGroupId = userGroups[0].id;
                setData('currentGroupId', currentGroupId);
            }
        }
    }

    // Activar contenedor principal de la app
    if (authContainer) authContainer.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    
    // Visibilidad de items de navegación según rol
    const isSuperAdmin = currentUser.account_type === 'superadmin';
    
    document.querySelectorAll('#app-bottom-nav button').forEach(item => {
        const isSuperadminBtn = item.classList.contains('superadmin-only-nav');
        const isUserBtn = item.classList.contains('user-only-nav');

        if (isSuperAdmin) {
            if (isUserBtn) {
                item.classList.add('hidden');
                item.classList.remove('md:flex');
            }
            if (isSuperadminBtn) {
                item.classList.remove('hidden');
            }
        } else {
            if (isSuperadminBtn) {
                item.classList.add('hidden');
            }
            if (isUserBtn) {
                item.classList.remove('hidden');
            }
        }
    });

    // Contador de solicitudes pendientes para Superadmin
    if (isSuperAdmin) {
        apiFetch('/superadmin/requests').then(reqs => {
            const pending = (reqs || []).filter(r => r.status === 'pending').length;
            const badge = document.getElementById('admin-pending-badge');
            if (badge && pending > 0) {
                badge.textContent = pending;
                badge.classList.remove('hidden');
            }
        }).catch(() => {});
    }
    
    // Actualizar perfil del sidebar
    const sidebarUserName = document.getElementById('sidebar-user-name');
    if (sidebarUserName) sidebarUserName.textContent = `${currentUser.name} ${currentUser.lastname || ''}`.trim();
    
    let roleText = 'Miembro';
    if (currentUser.account_type === 'superadmin') {
        roleText = 'Super Admin';
    } else {
        const activeGroup = userGroups.find(g => g.id == currentGroupId);
        roleText = activeGroup ? (activeGroup.role || 'Miembro') : 'Miembro';
    }
    
    const sidebarUserRole = document.getElementById('sidebar-user-role');
    if (sidebarUserRole) sidebarUserRole.textContent = roleText;

    // Avatar / Iniciales
    const initials = getInitials(`${currentUser.name} ${currentUser.lastname || ''}`);
    const avatarElement = document.getElementById('sidebar-avatar');
    
    if (avatarElement) {
        if (currentUser.avatar) {
            avatarElement.style.backgroundImage = `url('${getAvatarUrl(currentUser.avatar)}')`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
            avatarElement.style.backgroundColor = 'transparent';
            avatarElement.textContent = '';
        } else {
            avatarElement.style.backgroundImage = 'none';
            avatarElement.style.backgroundColor = getAvatarBgColor(`${currentUser.name} ${currentUser.lastname || ''}`);
            avatarElement.textContent = initials;
        }
    }

    renderWorkspaceGroupSelector(userGroups);
    handleHashRouting();
}

/**
 * Navega programáticamente a una vista específica validando permisos de membresía.
 * @param {string} viewId
 */
function navigateTo(viewId) {
    if (!viewId) return;

    const isSuperAdmin = currentUser && currentUser.account_type === 'superadmin';
    const userGroups = getData('userGroups') || [];
    const hasNoGroups = !isSuperAdmin && (!Array.isArray(userGroups) || userGroups.length === 0);
    const restrictedViews = ['songs', 'setlists', 'events', 'suggestions', 'members', 'announcements'];

    if (hasNoGroups && restrictedViews.includes(viewId)) {
        openNoGroupAlertModal();
        return;
    }

    window.location.hash = `#${viewId}`;
}

/**
 * Manejador principal de navegación SPA activado por el evento `hashchange`.
 */
async function handleHashRouting() {
    if (!currentUser) return;
    
    // Cerrar modo presentación si estaba activo
    if (document.body.classList.contains('setlist-presentation-mode')) {
        if (typeof closeSetlistPresentation === 'function') {
            closeSetlistPresentation();
        } else {
            document.body.classList.remove('setlist-presentation-mode');
            const pres = document.getElementById('subpanel-setlist-presentation');
            if (pres) pres.classList.add('hidden');
            const grid = document.getElementById('subpanel-setlists-list');
            if (grid) grid.classList.remove('hidden');
        }
    }
    
    let viewId = window.location.hash.replace('#', '');
    if (!viewId) viewId = 'dashboard';

    // Lista de rutas válidas
    const pages = ['dashboard', 'songs', 'community', 'songs-community', 'setlists', 'events', 'suggestions', 'members', 'profile', 'feedback', 'announcements', 'admin'];
    if (!pages.includes(viewId)) {
        viewId = currentUser?.account_type === 'superadmin' ? 'admin' : 'dashboard';
        window.location.hash = `#${viewId}`;
        return;
    }

    const isCommunityView = viewId === 'community' || viewId === 'songs-community';
    const panelViewId = isCommunityView ? 'songs' : viewId;

    // Ocultar todas las vistas y mostrar el contenedor destino sincrónicamente
    document.querySelectorAll('.content-view').forEach(p => p.classList.add('hidden'));
    const initialContainer = document.getElementById(`panel-${panelViewId}`);
    if (initialContainer) initialContainer.classList.remove('hidden');

    // Guardias según el rol del usuario
    if (currentUser?.account_type === 'superadmin') {
        if (!['dashboard', 'admin', 'profile', 'feedback', 'announcements', 'songs'].includes(panelViewId)) {
            viewId = 'dashboard';
            window.location.hash = `#${viewId}`;
            return;
        }
    } else {
        if (panelViewId === 'admin') {
            viewId = 'dashboard';
            window.location.hash = `#${viewId}`;
            return;
        }

        const syncResult = await syncUserGroupsAndValidateMembership();
        const restrictedViews = ['songs', 'setlists', 'events', 'suggestions', 'members'];

        if (syncResult.hasNoGroups && restrictedViews.includes(panelViewId)) {
            viewId = 'dashboard';
            window.location.hash = '#dashboard';
            openNoGroupAlertModal();
            return;
        }
    }

    const container = document.getElementById(`panel-${panelViewId}`);
    if (container) {
        if (container.dataset.loaded !== 'true') {
            try {
                const response = await fetch(`views/${panelViewId}.php?t=${Date.now()}`);
                if (!response.ok) throw new Error("Fallo la carga de la vista");
                container.innerHTML = await response.text();
                container.dataset.loaded = 'true';
            } catch (err) {
                container.innerHTML = `<div style="padding: 40px; text-align:center; color:var(--text-muted)">Fallo al cargar la vista modular. Asegúrate de correr la app desde un servidor local.</div>`;
                container.classList.remove('hidden');
                return;
            }
        }
        
        container.classList.remove('hidden');
        triggerViewInitializer(viewId, true);
    }

    // Actualizar clases activas en la barra de navegación inferior
    const mainMobileViews = ['dashboard', 'songs', 'community', 'songs-community', 'setlists', 'events'];
    const isSecondaryView = !mainMobileViews.includes(viewId);
    const activeNavView = isCommunityView ? 'songs' : viewId;

    document.querySelectorAll('#app-bottom-nav button').forEach(link => {
        const linkView = link.getAttribute('data-view');
        const isActive = linkView === activeNavView || (link.id === 'btn-nav-more' && isSecondaryView);
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Actualizar título en el encabezado
    const titles = {
        'dashboard': 'Panel Inicial',
        'songs': 'Catálogo de Canciones',
        'community': 'Comunidad',
        'songs-community': 'Comunidad',
        'setlists': 'Listas de Repertorios',
        'events': 'Calendario de Eventos',
        'suggestions': 'Caja de Sugerencias',
        'members': 'Directorio de Miembros',
        'profile': 'Editar Mi Perfil',
        'feedback': 'Feedback & Soporte',
        'announcements': 'Novedades y Anuncios',
        'admin': 'Panel de Administración'
    };

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = titles[viewId] || 'Levare';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Despacha la llamada al inicializador correspondiente de cada vista modular.
 * @param {string} viewId
 * @param {boolean} [forceRefresh=true]
 */
function triggerViewInitializer(viewId, forceRefresh = true) {
    if (viewId === 'dashboard' && typeof initDashboardView === 'function') initDashboardView(forceRefresh);
    if ((viewId === 'songs' || viewId === 'community' || viewId === 'songs-community') && typeof initSongsView === 'function') {
        initSongsView(forceRefresh, (viewId === 'community' || viewId === 'songs-community'));
    }
    if (viewId === 'setlists' && typeof initSetlistsView === 'function') initSetlistsView(forceRefresh);
    if (viewId === 'events' && typeof initEventsView === 'function') initEventsView(forceRefresh);
    if (viewId === 'suggestions' && typeof initSuggestionsView === 'function') initSuggestionsView(forceRefresh);
    if (viewId === 'members' && typeof initMembersView === 'function') initMembersView(forceRefresh);
    if (viewId === 'profile' && typeof initProfileView === 'function') initProfileView(forceRefresh);
    if (viewId === 'feedback' && typeof initFeedbackView === 'function') initFeedbackView(forceRefresh);
    if (viewId === 'announcements' && typeof initAnnouncementsView === 'function') initAnnouncementsView(forceRefresh);
    if (viewId === 'admin' && typeof initAdminView === 'function') initAdminView(forceRefresh);
}

/**
 * Comprueba si el usuario autenticado tiene permisos de edición (Líder o Super Admin).
 * @returns {boolean}
 */
function canEdit() {
    const user = currentUser || getData('currentUser');
    if (!user) return false;
    return user.account_type === 'superadmin' || user.account_type === 'leader';
}

/* ==========================================================================
   "MÁS" BOTTOM SHEET — Nav More Menu helpers
   ========================================================================== */

/**
 * Abre el menú modal inferior "Más" y carga el selector de bandas activas.
 */
function openMoreMenu() {
    const modal = document.getElementById('modal-more-menu');
    if (!modal) return;

    const groupSelect = document.getElementById('more-menu-group-select');
    if (groupSelect) {
        const groups = getData('userGroups') || [];
        const activeId = getData('currentGroupId');
        groupSelect.innerHTML = '';
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            if (g.id == activeId) opt.selected = true;
            groupSelect.appendChild(opt);
        });
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
window.openMoreMenu = openMoreMenu;

/**
 * Cierra el menú modal inferior "Más".
 * @param {Event} [event]
 */
function closeMoreMenu(event) {
    if (event && event.target !== document.getElementById('modal-more-menu')) return;
    const modal = document.getElementById('modal-more-menu');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}
window.closeMoreMenu = closeMoreMenu;

// Exponer funciones necesarias globalmente
window.initApp = initApp;
window.updateShellVisibility = updateShellVisibility;
window.navigateTo = navigateTo;
window.handleHashRouting = handleHashRouting;
window.triggerViewInitializer = triggerViewInitializer;
window.canEdit = canEdit;

// Inicialización de la aplicación al cargar la ventana
window.onload = initApp;
