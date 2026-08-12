/* ==========================================================================
   WorshipApp — SPA ROUTER & API SHELL INITIALIZATION
   ========================================================================== */

let currentUser = null;
let currentGroupId = null;

// Initialize app shell states
function initApp() {
    currentUser = getData('currentUser');
    currentGroupId = getData('currentGroupId');

    // Apply active user accent color theme
    if (currentUser) {
        applyAccentColor(currentUser.accentColor || 'purple');
    }

    // Setup Theme Mode Preference
    const storedTheme = localStorage.getItem('worship_theme') || 'dark';
    applyTheme(storedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.onclick = toggleTheme;

    // Login page switches
    const goRegisterLink = document.getElementById('go-to-leader-register');
    if (goRegisterLink) goRegisterLink.onclick = () => switchAuthTab('register');
    const goLoginLink = document.getElementById('go-to-login');
    if (goLoginLink) goLoginLink.onclick = () => switchAuthTab('login');
    const goMemberInviteLink = document.getElementById('go-to-member-invite');
    if (goMemberInviteLink) goMemberInviteLink.onclick = () => switchAuthTab('invite');
    const goBackToInviteLink = document.getElementById('go-back-to-invite');
    if (goBackToInviteLink) goBackToInviteLink.onclick = () => switchAuthTab('invite');
    
    if (goRegisterLink) {
        goRegisterLink.onclick = (e) => {
            e.preventDefault();
            document.getElementById('view-login').classList.add('hidden');
            document.getElementById('view-leader-register').classList.remove('hidden');
        };
    }
    
    if (goLoginLink) {
        goLoginLink.onclick = (e) => {
            e.preventDefault();
            document.getElementById('view-leader-register').classList.add('hidden');
            document.getElementById('view-login').classList.remove('hidden');
        };
    }

    if (goMemberInviteLink) {
        goMemberInviteLink.onclick = (e) => {
            e.preventDefault();
            document.getElementById('view-login').classList.add('hidden');
            document.getElementById('view-member-invite').classList.remove('hidden');
        };
    }

    document.querySelectorAll('.go-back-to-login').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            document.getElementById('view-member-invite').classList.add('hidden');
            document.getElementById('view-login').classList.remove('hidden');
        };
    });

    if (goBackToInviteLink) {
        goBackToInviteLink.onclick = (e) => {
            e.preventDefault();
            document.getElementById('view-member-register').classList.add('hidden');
            document.getElementById('view-member-invite').classList.remove('hidden');
        };
    }

    // Bind core forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.onsubmit = handleLoginFormSubmit;
    const leaderRegisterForm = document.getElementById('leader-register-form');
    if (leaderRegisterForm) leaderRegisterForm.onsubmit = handleLeaderRegisterSubmit;
    const memberInviteForm = document.getElementById('member-invite-form');
    if (memberInviteForm) memberInviteForm.onsubmit = handleMemberInviteSubmit;
    const memberRegisterForm = document.getElementById('member-register-form');
    if (memberRegisterForm) memberRegisterForm.onsubmit = handleMemberRegisterSubmit;
    const forcePasswordForm = document.getElementById('force-password-form');
    if (forcePasswordForm) forcePasswordForm.onsubmit = handleForcePasswordChangeSubmit;

    // Logouts
    const openLogoutModal = (e) => {
        if (e) e.preventDefault();
        const modal = document.getElementById('modal-confirm-logout');
        if (modal) modal.classList.remove('hidden');
    };
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');
    if (logoutBtnSidebar) logoutBtnSidebar.onclick = openLogoutModal;
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.onclick = openLogoutModal;

    // Close buttons for logout modal
    document.querySelectorAll('#modal-confirm-logout .btn-close-modal').forEach(btn => {
        btn.onclick = () => {
            const modal = document.getElementById('modal-confirm-logout');
            if (modal) modal.classList.add('hidden');
        };
    });
    const btnCloseLogoutX = document.getElementById('btn-close-logout-modal-x');
    if (btnCloseLogoutX) {
        btnCloseLogoutX.onclick = () => {
            const modal = document.getElementById('modal-confirm-logout');
            if (modal) modal.classList.add('hidden');
        };
    }
    const modalLogout = document.getElementById('modal-confirm-logout');
    if (modalLogout) {
        modalLogout.onclick = (e) => {
            if (e.target === modalLogout) {
                modalLogout.classList.add('hidden');
            }
        };
    }
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');
    if (btnConfirmLogout) btnConfirmLogout.onclick = confirmLogout;

    // Trigger profile triggers (Avatar click goes to profile)
    const profileTrigger = document.getElementById('user-profile-sidebar-trigger');
    if (profileTrigger) {
        profileTrigger.onclick = () => {
            showView('profile');
            window.location.hash = '#profile';
        };
    }

    // Mobile More Menu Actions
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

    // Setup active group workspace selectors
    const groupActiveSelect = document.getElementById('group-active-select');
    if (groupActiveSelect) groupActiveSelect.onchange = handleActiveGroupChangeSelect;

    const groupActiveSelectMobile = document.getElementById('group-active-select-mobile');
    if (groupActiveSelectMobile) {
        groupActiveSelectMobile.onchange = handleActiveGroupChangeSelect;
    }

    // Join group modal triggers
    const sidebarJoinBtn = document.getElementById('sidebar-btn-join-group');
    if (sidebarJoinBtn) {
        sidebarJoinBtn.onclick = (e) => {
            e.preventDefault();
            openJoinGroupModal();
        };
    }

    const mobileJoinBtn = document.getElementById('mobile-menu-item-join-group');
    if (mobileJoinBtn) {
        mobileJoinBtn.onclick = (e) => {
            e.preventDefault();
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden'); // Close more menu
            openJoinGroupModal();
        };
    }

    // Close buttons for join group modal
    document.querySelectorAll('#modal-join-group-global .btn-close-modal').forEach(btn => {
        btn.onclick = () => {
            const modal = document.getElementById('modal-join-group-global');
            if (modal) modal.classList.add('hidden');
        };
    });
    const btnCloseJoinX = document.getElementById('btn-close-join-group-modal-x');
    if (btnCloseJoinX) {
        btnCloseJoinX.onclick = () => {
            const modal = document.getElementById('modal-join-group-global');
            if (modal) modal.classList.add('hidden');
        };
    }

    const modalJoinGroup = document.getElementById('modal-join-group-global');
    if (modalJoinGroup) {
        modalJoinGroup.onclick = (e) => {
            if (e.target === modalJoinGroup) {
                modalJoinGroup.classList.add('hidden');
            }
        };
    }

    const joinGroupForm = document.getElementById('join-group-form');
    if (joinGroupForm) joinGroupForm.onsubmit = handleJoinGroupSubmit;

    // Create group modal triggers
    const sidebarCreateBtn = document.getElementById('sidebar-btn-create-group');
    if (sidebarCreateBtn) {
        sidebarCreateBtn.onclick = (e) => {
            e.preventDefault();
            openCreateGroupModal();
        };
    }

    const mobileCreateBtn = document.getElementById('mobile-menu-item-create-group');
    if (mobileCreateBtn) {
        mobileCreateBtn.onclick = (e) => {
            e.preventDefault();
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden'); // Close more menu
            openCreateGroupModal();
        };
    }

    // Close buttons for create group modal
    document.querySelectorAll('#modal-create-group-global .btn-close-modal').forEach(btn => {
        btn.onclick = () => {
            const modal = document.getElementById('modal-create-group-global');
            if (modal) modal.classList.add('hidden');
        };
    });
    const btnCloseCreateX = document.getElementById('btn-close-create-group-modal-x');
    if (btnCloseCreateX) {
        btnCloseCreateX.onclick = () => {
            const modal = document.getElementById('modal-create-group-global');
            if (modal) modal.classList.add('hidden');
        };
    }
    const modalCreateGroup = document.getElementById('modal-create-group-global');
    if (modalCreateGroup) {
        modalCreateGroup.onclick = (e) => {
            if (e.target === modalCreateGroup) {
                modalCreateGroup.classList.add('hidden');
            }
        };
    }

    const createGroupForm = document.getElementById('create-group-form');
    if (createGroupForm) createGroupForm.onsubmit = handleCreateGroupSubmit;

    // Wire view routing triggers for navigation links
    document.querySelectorAll('[data-view]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            window.location.hash = `#${viewId}`;
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden'); // Close menu on click mobile
        };
    });

    // Hash listener router
    window.onhashchange = handleHashRouting;

    updateShellVisibility();
}

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
    
    // Update profile theme text and switch knob animation if present
    const statusText = document.getElementById('profile-theme-status-text');
    if (statusText) statusText.textContent = isDark ? 'Modo actual: Oscuro' : 'Modo actual: Claro';
    
    const switchBtn = document.getElementById('theme-switch-btn');
    const switchKnob = document.getElementById('theme-switch-knob');
    if (switchBtn && switchKnob) {
        if (isDark) {
            switchBtn.classList.remove('bg-zinc-300');
            switchBtn.classList.add('bg-zinc-700');
            switchKnob.classList.remove('translate-x-0');
            switchKnob.classList.add('translate-x-5');
        } else {
            switchBtn.classList.remove('bg-zinc-700');
            switchBtn.classList.add('bg-zinc-300');
            switchKnob.classList.remove('translate-x-5');
            switchKnob.classList.add('translate-x-0');
        }
    }

    localStorage.setItem('worship_theme', themeName);
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(newTheme === 'light' ? "Modo claro activado" : "Modo oscuro activado");
}

async function updateShellVisibility() {
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const authOnboardingPanel = document.getElementById('auth-onboarding-panel');
    const viewLogin = document.getElementById('view-login');
    const viewRegister = document.getElementById('view-leader-register');
    const viewForcePassword = document.getElementById('view-force-password');

    // Hide everything first
    if (authContainer) authContainer.classList.add('hidden');
    if (mainContainer) mainContainer.classList.add('hidden');
    if (authOnboardingPanel) authOnboardingPanel.classList.add('hidden');
    if (viewLogin) viewLogin.classList.add('hidden');
    if (viewRegister) viewRegister.classList.add('hidden');
    if (viewForcePassword) viewForcePassword.classList.add('hidden');

    if (!currentUser) {
        if (authContainer) authContainer.classList.remove('hidden');
        if (viewLogin) viewLogin.classList.remove('hidden');
        return;
    }

    // Check force password reset flag
    if (currentUser.must_change_password) {
        authContainer.classList.remove('hidden');
        viewForcePassword.classList.remove('hidden');
        return;
    }

    // Verify active groups on database
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
            // Authenticated user with no active groups. Open Onboarding Setup.
            if (authContainer) authContainer.classList.remove('hidden');
            if (authOnboardingPanel) authOnboardingPanel.classList.remove('hidden');
            loadOnboardingLayout();
            return;
        }

        // Ensure currentGroupId exists and belongs to user
        if (!currentGroupId || !userGroups.some(g => g.id == currentGroupId)) {
            currentGroupId = userGroups[0].id;
            setData('currentGroupId', currentGroupId);
        }
    }

    // Active screen dashboard
    if (authContainer) authContainer.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    mainContainer.classList.remove('hidden');
    
    // Show/hide nav items based on account_type
    const isSuperAdmin = currentUser.account_type === 'superadmin';
    
    // Handle nav items visibility in #app-bottom-nav based on role
    document.querySelectorAll('#app-bottom-nav button').forEach(item => {
        const view = item.getAttribute('data-view');
        if (isSuperAdmin && view) {
            if (view !== 'dashboard' && view !== 'admin' && view !== 'profile') {
                item.classList.add('hidden');
                item.classList.remove('md:flex');
            }
        }
    });

    // Load pending badge count for superadmin
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
    
    // Update sidebar profiles
    const sidebarUserName = document.getElementById('sidebar-user-name');
    if (sidebarUserName) sidebarUserName.textContent = `${currentUser.name} ${currentUser.lastname || ''}`.trim();
    
    // Get user active role in selected group
    let roleText = 'Miembro';
    if (currentUser.account_type === 'superadmin') {
        roleText = 'Super Admin';
    } else {
        const activeGroup = userGroups.find(g => g.id == currentGroupId);
        roleText = activeGroup ? (activeGroup.role || 'Miembro') : 'Miembro';
    }
    
    const sidebarUserRole = document.getElementById('sidebar-user-role');
    if (sidebarUserRole) sidebarUserRole.textContent = roleText;

    // Load initials
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

    // Render workspace group selector dropdown options
    renderWorkspaceGroupSelector(userGroups);

    // Trigger hash load
    handleHashRouting();
}

function renderWorkspaceGroupSelector(userGroups) {
    if (!Array.isArray(userGroups) || userGroups.length === 0) {
        userGroups = getData('userGroups') || [];
    }
    const selects = document.querySelectorAll('#group-active-select, #group-active-select-mobile, #group-active-select-profile');
    const isSuperAdmin = currentUser && currentUser.account_type === 'superadmin';


    selects.forEach(select => {
        if (isSuperAdmin) {
            select.style.display = 'none';
            return;
        }

        select.style.display = 'inline-block';
        select.innerHTML = '';
        
        userGroups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            if (g.id == currentGroupId) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    });

    // Update active group name text on dashboard footer
    const activeGroupDisplay = document.getElementById('active-group-display-name');
    if (activeGroupDisplay && Array.isArray(userGroups)) {
        const activeGroup = userGroups.find(g => g.id == currentGroupId);
        if (activeGroup) activeGroupDisplay.textContent = activeGroup.name;
    }
}



function handleActiveGroupChangeSelect(e) {
    const newGroupId = parseInt(e.target.value);
    currentGroupId = newGroupId;
    setData('currentGroupId', currentGroupId);
    
    const userGroups = getData('userGroups') || [];
    const groupName = userGroups.find(g => g.id == newGroupId)?.name || 'Banda';
    
    showToast(`Cambiado a la banda: ${groupName}`);

    // Hard reload router dashboard to trigger fresh view state renders
    window.location.hash = '#dashboard';
    setTimeout(() => window.location.reload(), 100);
}

function navigateTo(viewId) {
    if (!viewId) return;
    window.location.hash = `#${viewId}`;
}

async function handleHashRouting() {
    if (!currentUser) return;
    
    // If setlist presentation mode is active, close it on routing
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

    // Validate page lists
    const pages = ['dashboard', 'songs', 'setlists', 'events', 'suggestions', 'members', 'profile', 'announcements', 'admin'];
    if (!pages.includes(viewId)) {
        viewId = currentUser?.account_type === 'superadmin' ? 'admin' : 'dashboard';
        window.location.hash = `#${viewId}`;
        return;
    }

    // Role-based view guards
    if (currentUser?.account_type === 'superadmin') {
        // Super Admin can only access dashboard, admin and profile
        if (!['dashboard', 'admin', 'profile'].includes(viewId)) {
            viewId = 'admin';
            window.location.hash = `#${viewId}`;
            return;
        }
    } else {
        // Normal users cannot access admin
        if (viewId === 'admin') {
            viewId = 'dashboard';
            window.location.hash = `#${viewId}`;
            return;
        }
    }

    // Hide all views
    document.querySelectorAll('.content-view').forEach(p => p.classList.add('hidden'));

    const container = document.getElementById(`panel-${viewId}`);
    if (container) {
        if (container.dataset.loaded !== 'true') {
            try {
                const response = await fetch(`views/${viewId}.php?t=${Date.now()}`);
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
        
        // Trigger specific view controllers
        triggerViewInitializer(viewId);
    }

    // Update active nav links lists classes
    const mainMobileViews = ['dashboard', 'songs', 'setlists', 'events'];
    const isSecondaryView = !mainMobileViews.includes(viewId);

    document.querySelectorAll('#app-bottom-nav button').forEach(link => {
        const linkView = link.getAttribute('data-view');
        const isActive = linkView === viewId || (link.id === 'btn-nav-more' && isSecondaryView);
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Header title
    const titles = {
        'dashboard': 'Panel Inicial',
        'songs': 'Catálogo de Canciones',
        'setlists': 'Listas de Repertorios',
        'events': 'Calendario de Eventos',
        'suggestions': 'Caja de Sugerencias',
        'members': 'Directorio de Miembros',
        'profile': 'Editar Mi Perfil',
        'announcements': 'Novedades y Anuncios',
        'admin': '🛡️ Panel de Administración'
    };
    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = titles[viewId] || 'Levare';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function triggerViewInitializer(viewId) {
    if (viewId === 'dashboard' && typeof initDashboardView === 'function') initDashboardView();
    if (viewId === 'songs' && typeof initSongsView === 'function') initSongsView();
    if (viewId === 'setlists' && typeof initSetlistsView === 'function') initSetlistsView();
    if (viewId === 'events' && typeof initEventsView === 'function') initEventsView();
    if (viewId === 'suggestions' && typeof initSuggestionsView === 'function') initSuggestionsView();
    if (viewId === 'members' && typeof initMembersView === 'function') initMembersView();
    if (viewId === 'profile' && typeof initProfileView === 'function') initProfileView();
    if (viewId === 'announcements' && typeof initAnnouncementsView === 'function') initAnnouncementsView();
    if (viewId === 'admin' && typeof initAdminView === 'function') initAdminView();
}

// DYNAMIC ONBOARDING FETCHER AND LOADERS
async function loadOnboardingLayout() {
    const wrapper = document.getElementById('auth-onboarding-panel');
    try {
        const response = await fetch(`views/onboarding.php?t=${Date.now()}`);
        wrapper.innerHTML = await response.text();
        
        const onboardingChoices = document.querySelector('.onboarding-choices');
        const fCreate = document.getElementById('form-create-group');
        const fJoin = document.getElementById('form-join-group');

        // Unified flow: any user can create a group or join one
        const cCreate = document.getElementById('btn-choice-create');
        const cJoin = document.getElementById('btn-choice-join');
        
        if (cCreate) {
            cCreate.onclick = () => {
                onboardingChoices.classList.add('hidden');
                fCreate.classList.remove('hidden');
            };
        }
        if (cJoin) {
            cJoin.onclick = () => {
                onboardingChoices.classList.add('hidden');
                fJoin.classList.remove('hidden');
            };
        }

        const btnBackCreate = document.getElementById('btn-back-to-choices-create');
        if (btnBackCreate) {
            btnBackCreate.onclick = () => {
                fCreate.classList.add('hidden');
                onboardingChoices.classList.remove('hidden');
            };
        }
        const btnBackJoin = document.getElementById('btn-back-to-choices-join');
        if (btnBackJoin) {
            btnBackJoin.onclick = () => {
                fJoin.classList.add('hidden');
                onboardingChoices.classList.remove('hidden');
            };
        }

        // Submits
        if (fCreate) fCreate.onsubmit = handleCreateGroupSubmit;
        if (fJoin) fJoin.onsubmit = handleJoinGroupSubmit;
    } catch (e) {
        wrapper.innerHTML = `<div style="color:#fff; text-align:center;">Fallo cargando onboarding.</div>`;
    }
}

// LOGIN SUBMIT
async function handleLoginFormSubmit(e) {
    e.preventDefault();
    const handle = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: { login: handle, password: password }
        });

        if (data && data.token) {
            // Save active session state
            setData('token', data.token);
            currentUser = data.user;
            setData('currentUser', currentUser);
            
            applyAccentColor(currentUser.accentColor || 'purple');
            await updateShellVisibility();
            showToast(`¡Bienvenido de nuevo, ${currentUser.name}!`, "success");
        }
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// REGISTER LEADER SUBMIT
async function handleLeaderRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const lastname = document.getElementById('register-lastname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    try {
        const data = await apiFetch('/auth/register/leader', {
            method: 'POST',
            body: { name, lastname, email, password }
        });

        // Save active session state (Auto Login)
        setData('token', data.token);
        currentUser = data.user;
        setData('currentUser', currentUser);

        applyAccentColor('purple');
        await updateShellVisibility();

        showToast(`Registro completado. ¡Bienvenido a Levare!`, "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// MANDATORY PASSWORD RESET SUBMIT
async function handleForcePasswordChangeSubmit(e) {
    e.preventDefault();
    const password = document.getElementById('force-password-new').value;
    const confirmPw = document.getElementById('force-password-confirm').value;

    if (password !== confirmPw) {
        showToast("Las contraseñas no coinciden.", "warning");
        return;
    }

    try {
        await apiFetch('/auth/change-password', {
            method: 'POST',
            body: { 
                password: password,
                password_confirmation: confirmPw
            }
        });

        // Clear mustChangePassword locally
        currentUser.must_change_password = false;
        setData('currentUser', currentUser);
        
        showToast("Contraseña actualizada exitosamente.");
        await updateShellVisibility();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// ONBOARDING HANDLERS
async function handleCreateGroupSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-group-name').value.trim();
    const desc = document.getElementById('new-group-desc').value.trim();

    try {
        const data = await apiFetch('/groups', {
            method: 'POST',
            body: { name, description: desc }
        });

        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        showToast(`Grupo "${name}" creado. Código: ${data.group.invite_code}`, "success");
        await updateShellVisibility();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleJoinGroupSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('invite-code-input').value.trim();

    try {
        const data = await apiFetch('/groups/join', {
            method: 'POST',
            body: { invite_code: code }
        });

        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        showToast(data.message, "success");
        await updateShellVisibility();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// LOGOUTS
async function confirmLogout() {
    const btn = document.getElementById('btn-confirm-logout');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Cerrando...";
    }

    try {
        await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
        console.warn("Logout request failed on server side", e);
    }

    currentUser = null;
    currentGroupId = null;
    setData('currentUser', null);
    setData('currentGroupId', null);
    setData('token', null);
    setData('userGroups', null);
    
    // Reset theme accent color to default
    applyAccentColor('purple');
    
    window.location.hash = '';
    
    // Hide confirmation modal
    const logoutModal = document.getElementById('modal-confirm-logout');
    if (logoutModal) {
        logoutModal.classList.add('hidden');
    }

    if (btn) {
        btn.disabled = false;
        btn.textContent = "Cerrar Sesión";
    }
    
    document.documentElement.classList.remove('user-is-authenticated');
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    if (authContainer && mainContainer) {
        authContainer.classList.remove('hidden');
        mainContainer.classList.add('hidden');
    }
    
    updateShellVisibility();
    showToast("Sesión cerrada");
}

function canEdit() {
    const user = currentUser || getData('currentUser');
    if (!user) return false;
    return user.account_type === 'superadmin' || user.account_type === 'leader';
}

// --- Member Invite Flow ---
async function handleMemberInviteSubmit(e) {
    e.preventDefault();
    const inviteCode = document.getElementById('invite-code-entry').value.trim();

    try {
        const data = await apiFetch('/auth/validate-invite-code', {
            method: 'POST',
            body: { invite_code: inviteCode }
        });

        // Set group info in member register card
        document.getElementById('register-member-group-name').textContent = data.group_name;
        document.getElementById('register-member-invite-code').value = data.invite_code;

        // Clean fields in member register form
        document.getElementById('member-register-name').value = '';
        document.getElementById('member-register-lastname').value = '';
        document.getElementById('member-register-email').value = '';
        document.getElementById('member-register-password').value = '';

        // Transition
        document.getElementById('view-member-invite').classList.add('hidden');
        document.getElementById('view-member-register').classList.remove('hidden');

        showToast(data.message, "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// --- Member Register Flow ---
async function handleMemberRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('member-register-name').value.trim();
    const lastname = document.getElementById('member-register-lastname').value.trim();
    const email = document.getElementById('member-register-email').value.trim();
    const password = document.getElementById('member-register-password').value;
    const inviteCode = document.getElementById('register-member-invite-code').value;

    try {
        const data = await apiFetch('/auth/register/member', {
            method: 'POST',
            body: { name, lastname, email, password, invite_code: inviteCode }
        });

        // Save active session state
        setData('token', data.token);
        currentUser = data.user;
        setData('currentUser', currentUser);

        applyAccentColor(currentUser.accentColor || 'purple');
        await updateShellVisibility();

        showToast(`Registro completado. ¡Bienvenido a Levare!`, "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// --- Join Group Flows ---
function openJoinGroupModal() {
    const input = document.getElementById('join-group-invite-code');
    if (input) input.value = '';
    const modal = document.getElementById('modal-join-group-global');
    if (modal) modal.classList.remove('hidden');
}
window.openJoinGroupModal = openJoinGroupModal;

async function handleJoinGroupSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Unirme';

    // Support both onboarding input and global modal input
    const inviteCode = (document.getElementById('invite-code-input')?.value || 
                        document.getElementById('join-group-invite-code')?.value || '').trim();

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
    }

    try {
        const data = await apiFetch('/groups/join', {
            method: 'POST',
            body: { invite_code: inviteCode }
        });

        // Hide modal if open
        const globalModal = document.getElementById('modal-join-group-global');
        if (globalModal) {
            globalModal.classList.add('hidden');
        }
        
        showToast(data.message || 'Te has unido al grupo con éxito.', 'success');

        // Refetch active user groups list
        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        // Switch to the newly joined group
        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        // Switch view to dashboard and reload
        window.location.hash = '#dashboard';
        setTimeout(() => {
            window.location.reload();
        }, 300);

    } catch (err) {
        showToast(err.message || 'Error al intentar unirse al grupo.', 'danger');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// --- Create Group Flows ---
function openCreateGroupModal() {
    const nameInput = document.getElementById('create-group-name');
    if (nameInput) nameInput.value = '';
    const descInput = document.getElementById('create-group-description');
    if (descInput) descInput.value = '';
    const modal = document.getElementById('modal-create-group-global');
    if (modal) modal.classList.remove('hidden');
}
window.openCreateGroupModal = openCreateGroupModal;



async function handleCreateGroupSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('create-group-name').value.trim();
    const description = document.getElementById('create-group-description').value.trim();
    const submitBtn = document.getElementById('btn-submit-create-group');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    try {
        const data = await apiFetch('/groups', {
            method: 'POST',
            body: { name, description }
        });

        // Hide modal
        document.getElementById('modal-create-group-global').classList.add('hidden');
        showToast(data.message || 'Banda creada correctamente.', 'success');

        // Refetch active user groups list
        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        // Switch to the newly created group
        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        // Switch view to dashboard and reload
        window.location.hash = '#dashboard';
        setTimeout(() => {
            window.location.reload();
        }, 300);

    } catch (err) {
        showToast(err.message || 'Error al intentar crear la banda.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Banda';
    }
}


// Initialize app on load
window.onload = initApp;

/* ==========================================================================
   "MÁS" BOTTOM SHEET — Nav More Menu helpers
   ========================================================================== */

function openMoreMenu() {
    const modal = document.getElementById('modal-more-menu');
    if (!modal) return;

    // Populate the group selector
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

function closeMoreMenu(event) {
    // Close only when clicking the backdrop (not the sheet itself)
    if (event && event.target !== document.getElementById('modal-more-menu')) return;
    const modal = document.getElementById('modal-more-menu');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function handleMoreMenuGroupChange(groupId) {
    setData('currentGroupId', parseInt(groupId));
    // Force all views to reload data
    document.querySelectorAll('.content-view').forEach(p => { p.dataset.loaded = ''; });
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const panel = document.getElementById(`panel-${hash}`);
    if (panel) panel.dataset.loaded = '';
    window.location.reload();
}

