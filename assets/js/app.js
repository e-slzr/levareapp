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

    // Auth screens helper
    function switchAuthTab(tab) {
        const views = {
            'login': 'view-login',
            'register': 'view-leader-register',
            'invite': 'view-member-invite',
            'member-register': 'view-member-register',
            'force-password': 'view-force-password'
        };
        Object.values(views).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const targetId = views[tab] || tab;
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.remove('hidden');
    }
    window.switchAuthTab = switchAuthTab;

    // Validate password rules (min 8 chars, letters and numbers)
    function validatePasswordRules(pwd) {
        if (!pwd || pwd.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
            return "La contraseña debe combinar letras y números.";
        }
        return null;
    }
    window.validatePasswordRules = validatePasswordRules;

    // Toggle password visibility helper
    function togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = btn ? btn.querySelector('i') : null;
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }
    window.togglePasswordVisibility = togglePasswordVisibility;

    // Login page switches
    const goRegisterLink = document.getElementById('go-to-leader-register');
    if (goRegisterLink) {
        goRegisterLink.onclick = (e) => {
            e.preventDefault();
            switchAuthTab('register');
        };
    }
    
    const goLoginLink = document.getElementById('go-to-login');
    if (goLoginLink) {
        goLoginLink.onclick = (e) => {
            e.preventDefault();
            switchAuthTab('login');
        };
    }

    const goMemberInviteLink = document.getElementById('go-to-member-invite');
    if (goMemberInviteLink) {
        goMemberInviteLink.onclick = (e) => {
            e.preventDefault();
            switchAuthTab('invite');
        };
    }

    document.querySelectorAll('.go-back-to-login').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            switchAuthTab('login');
        };
    });

    const goBackToInviteLink = document.getElementById('go-back-to-invite');
    if (goBackToInviteLink) {
        goBackToInviteLink.onclick = (e) => {
            e.preventDefault();
            switchAuthTab('invite');
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

    const modalNoGroup = document.getElementById('modal-no-group-alert');
    if (modalNoGroup) {
        modalNoGroup.onclick = (e) => {
            if (e.target === modalNoGroup) {
                modalNoGroup.classList.add('hidden');
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
            navigateTo(viewId);
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden'); // Close menu on click mobile
        };
    });

    // Hash listener router
    window.onhashchange = handleHashRouting;

    // Auto-sync when returning to the PWA / tab focus (safely throttled and guarded)
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
 * Check if the active view can safely be auto-refreshed without losing user drafts or open modals
 */
function canSafelyAutoRefreshView(viewId) {
    // 1. Creation and report forms should never be re-initialized on background return
    if (viewId === 'feedback') return false;

    // 2. Setlist presentation mode must never be interrupted
    if (document.body.classList.contains('setlist-presentation-mode')) return false;

    // 3. Prevent auto-refresh if any interactive action modal is currently open
    const openModals = document.querySelectorAll('[id^="modal-"]:not(.hidden), .modal-backdrop:not(.hidden)');
    for (let i = 0; i < openModals.length; i++) {
        const m = openModals[i];
        if (m.id === 'modal-more-menu') continue;
        const style = window.getComputedStyle(m);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return false;
        }
    }

    // 4. Prevent auto-refresh if user is actively focused on an input/textarea
    const activeEl = document.activeElement;
    if (activeEl) {
        const tag = activeEl.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || activeEl.isContentEditable) {
            return false;
        }
    }

    return true;
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

    // Update Dashboard theme toggle icon (Sun for Dark mode -> click to light, Moon for Light mode -> click to dark)
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

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(newTheme === 'light' ? "Modo claro activado" : "Modo oscuro activado");
}

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

    // Hide everything first
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

    // Check force password reset flag
    if (currentUser.must_change_password) {
        if (authContainer) authContainer.classList.remove('hidden');
        if (authFormsWrapper) authFormsWrapper.classList.remove('hidden');
        if (viewForcePassword) viewForcePassword.classList.remove('hidden');
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
            currentGroupId = null;
            setData('currentGroupId', null);
        } else {
            // Ensure currentGroupId exists and belongs to user
            if (!currentGroupId || !userGroups.some(g => g.id == currentGroupId)) {
                currentGroupId = userGroups[0].id;
                setData('currentGroupId', currentGroupId);
            }
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
    if (!Array.isArray(userGroups)) {
        userGroups = getData('userGroups') || [];
    }
    const selects = document.querySelectorAll('#group-active-select, #group-active-select-mobile, #group-active-select-profile');
    const container = document.getElementById('group-selector-sidebar-container');
    const isSuperAdmin = currentUser && currentUser.account_type === 'superadmin';
    const hasNoGroups = !Array.isArray(userGroups) || userGroups.length === 0;

    if (container) {
        if (isSuperAdmin || hasNoGroups) {
            container.classList.add('hidden');
        } else {
            container.classList.remove('hidden');
        }
    }

    selects.forEach(select => {
        if (isSuperAdmin || hasNoGroups) {
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
    if (activeGroupDisplay) {
        if (hasNoGroups) {
            activeGroupDisplay.textContent = 'Sin Banda';
        } else {
            const activeGroup = userGroups.find(g => g.id == currentGroupId);
            if (activeGroup) activeGroupDisplay.textContent = activeGroup.name;
        }
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

function openNoGroupAlertModal() {
    const modal = document.getElementById('modal-no-group-alert');
    if (modal) modal.classList.remove('hidden');
}

function closeNoGroupAlertModal() {
    const modal = document.getElementById('modal-no-group-alert');
    if (modal) modal.classList.add('hidden');
}

function goToProfileFromNoGroupModal() {
    closeNoGroupAlertModal();
    navigateTo('profile');
}

function navigateTo(viewId) {
    if (!viewId) return;

    // Check if user has no groups and tries to access restricted modules
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

async function syncUserGroupsAndValidateMembership() {
    if (!currentUser || currentUser.account_type === 'superadmin') {
        return { hasNoGroups: false, userGroups: [] };
    }

    try {
        const res = await apiFetch('/groups');
        const userGroups = Array.isArray(res) ? res : [];
        setData('userGroups', userGroups);

        const isCurrentGroupValid = currentGroupId && userGroups.some(g => g.id == currentGroupId);

        if (!isCurrentGroupValid) {
            if (userGroups.length > 0) {
                const prevGroupId = currentGroupId;
                currentGroupId = userGroups[0].id;
                setData('currentGroupId', currentGroupId);
                renderWorkspaceGroupSelector(userGroups);
                if (prevGroupId) {
                    showToast(`Tu banda activa ha cambiado a: ${userGroups[0].name}`);
                }
            } else {
                currentGroupId = null;
                setData('currentGroupId', null);
                renderWorkspaceGroupSelector([]);
            }
        } else {
            renderWorkspaceGroupSelector(userGroups);
        }

        return {
            hasNoGroups: userGroups.length === 0,
            userGroups
        };
    } catch (e) {
        console.error("Error sincronizando grupos del usuario:", e);
        const userGroups = getData('userGroups') || [];
        return {
            hasNoGroups: !Array.isArray(userGroups) || userGroups.length === 0,
            userGroups
        };
    }
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
    const pages = ['dashboard', 'songs', 'setlists', 'events', 'suggestions', 'members', 'profile', 'feedback', 'announcements', 'admin'];
    if (!pages.includes(viewId)) {
        viewId = currentUser?.account_type === 'superadmin' ? 'admin' : 'dashboard';
        window.location.hash = `#${viewId}`;
        return;
    }

    // Role-based view guards
    if (currentUser?.account_type === 'superadmin') {
        // Super Admin can access dashboard, admin, announcements, profile and feedback
        if (!['dashboard', 'admin', 'profile', 'feedback', 'announcements'].includes(viewId)) {
            viewId = 'dashboard';
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

        // Background synchronization of groups and real-time membership guard
        const syncResult = await syncUserGroupsAndValidateMembership();
        const restrictedViews = ['songs', 'setlists', 'events', 'suggestions', 'members'];

        if (syncResult.hasNoGroups && restrictedViews.includes(viewId)) {
            viewId = 'dashboard';
            window.location.hash = '#dashboard';
            openNoGroupAlertModal();
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
        
        // Trigger specific view controllers with fresh data sync
        triggerViewInitializer(viewId, true);
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
        'feedback': 'Feedback & Soporte',
        'announcements': 'Novedades y Anuncios',
        'admin': 'Panel de Administración'
    };

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = titles[viewId] || 'Levare';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function triggerViewInitializer(viewId, forceRefresh = true) {
    if (viewId === 'dashboard' && typeof initDashboardView === 'function') initDashboardView(forceRefresh);
    if (viewId === 'songs' && typeof initSongsView === 'function') initSongsView(forceRefresh);
    if (viewId === 'setlists' && typeof initSetlistsView === 'function') initSetlistsView(forceRefresh);
    if (viewId === 'events' && typeof initEventsView === 'function') initEventsView(forceRefresh);
    if (viewId === 'suggestions' && typeof initSuggestionsView === 'function') initSuggestionsView(forceRefresh);
    if (viewId === 'members' && typeof initMembersView === 'function') initMembersView(forceRefresh);
    if (viewId === 'profile' && typeof initProfileView === 'function') initProfileView(forceRefresh);
    if (viewId === 'feedback' && typeof initFeedbackView === 'function') initFeedbackView(forceRefresh);
    if (viewId === 'announcements' && typeof initAnnouncementsView === 'function') initAnnouncementsView(forceRefresh);
    if (viewId === 'admin' && typeof initAdminView === 'function') initAdminView(forceRefresh);
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
    const passwordConfirm = document.getElementById('register-password-confirm')?.value || '';

    const pwdError = validatePasswordRules(password);
    if (pwdError) {
        showToast(pwdError, "warning");
        return;
    }

    if (password !== passwordConfirm) {
        showToast("Las contraseñas no coinciden.", "warning");
        return;
    }

    try {
        const data = await apiFetch('/auth/register/leader', {
            method: 'POST',
            body: { 
                name, 
                lastname, 
                email, 
                password,
                password_confirmation: passwordConfirm
            }
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

    const pwdError = validatePasswordRules(password);
    if (pwdError) {
        showToast(pwdError, "warning");
        return;
    }

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
    const passwordConfirm = document.getElementById('member-register-password-confirm')?.value || '';
    const inviteCode = document.getElementById('register-member-invite-code').value;

    const pwdError = validatePasswordRules(password);
    if (pwdError) {
        showToast(pwdError, "warning");
        return;
    }

    if (password !== passwordConfirm) {
        showToast("Las contraseñas no coinciden.", "warning");
        return;
    }

    try {
        const data = await apiFetch('/auth/register/member', {
            method: 'POST',
            body: { 
                name, 
                lastname, 
                email, 
                password, 
                password_confirmation: passwordConfirm,
                invite_code: inviteCode 
            }
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
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const originalText = submitBtn ? submitBtn.textContent : 'Validar Código';

    // Support both onboarding input and global modal input
    const codeInput = (form ? form.querySelector('input') : null) || 
                      document.getElementById('invite-code-input') || 
                      document.getElementById('join-group-invite-code');
    const inviteCode = codeInput ? codeInput.value.trim() : '';

    if (!inviteCode) {
        showToast('Por favor, ingresa el código de invitación.', 'danger');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Validando...';
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
        
        showToast(data.message || 'Te has unido a la banda con éxito.', 'success');

        // Refetch active user groups list
        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        // Switch to the newly joined group
        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        // Switch view to dashboard and reload UI
        await updateShellVisibility();
        window.location.hash = '#dashboard';
        navigateTo('dashboard');
    } catch (err) {
        showToast(err.message || 'Error al validar el código.', 'danger');
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
    const form = e.target;
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const originalText = submitBtn ? submitBtn.textContent : 'Crear Banda';

    // Support both onboarding input ('new-group-name') and modal input ('create-group-name')
    const nameInput = (form ? form.querySelector('input[type="text"]') : null) || 
                      document.getElementById('new-group-name') || 
                      document.getElementById('create-group-name');
    const descInput = (form ? form.querySelector('textarea') : null) || 
                      document.getElementById('new-group-desc') || 
                      document.getElementById('create-group-description');

    const name = nameInput ? nameInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';

    if (!name) {
        showToast('El nombre de la banda o grupo es obligatorio.', 'danger');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
    }

    try {
        const data = await apiFetch('/groups', {
            method: 'POST',
            body: { name, description }
        });

        // Hide modal if open
        const globalModal = document.getElementById('modal-create-group-global');
        if (globalModal) globalModal.classList.add('hidden');

        showToast(data.message || 'Banda creada correctamente.', 'success');

        // Refetch active user groups list
        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        // Switch to the newly created group
        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        // Update user state to leader if applicable
        if (currentUser && currentUser.account_type !== 'superadmin') {
            currentUser.account_type = 'leader';
            setData('currentUser', currentUser);
        }

        // Switch view to dashboard and update UI
        await updateShellVisibility();
        window.location.hash = '#dashboard';
        navigateTo('dashboard');
    } catch (err) {
        showToast(err.message || 'Error al intentar crear la banda.', 'danger');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
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

/* ==========================================================================
   PWA SERVICE WORKER & INSTALL PROMPT LOGIC
   ========================================================================== */
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) {
        installBtn.classList.remove('hidden');
    }
});

async function installAppPWA() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('¡Gracias por instalar Levare!', 'success');
        }
        deferredInstallPrompt = null;
    } else {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            showToast('Levare ya está instalada y ejecutándose como App.', 'info');
        } else {
            showToast('Para instalar: abre el menú del navegador y selecciona "Agregar a la pantalla de inicio" o "Instalar".', 'info');
        }
    }
}

// Register Service Worker with Web Push Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=2.0.4')
            .then(reg => {
                console.log('PWA ServiceWorker activo:', reg.scope);
                // Force update check
                if (typeof reg.update === 'function') {
                    reg.update();
                }
            })
            .catch(err => {
                console.warn('PWA ServiceWorker no registrado:', err);
            });
    });
}




