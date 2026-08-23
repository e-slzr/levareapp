/* ==========================================================================
   Levare — SUPER ADMIN PANEL CONTROLLER (API Connected & Role-Aware)
   ========================================================================== */

let adminActiveSection = 'users'; // 'users' | 'feedback'

// Users Management State
let adminCurrentTab = 'all';
let allAdminUsers = [];
let adminSearchQuery = '';
let pendingActionUser = null;
let adminUsersVisibleLimit = 15;
const ADMIN_USERS_PAGE_SIZE = 15;

// Feedback Management State
let allAdminFeedback = [];
let adminFeedbackStats = { total: 0, pending: 0, in_progress: 0, resolved: 0 };
let adminFeedbackStatusFilter = 'all';
let adminFeedbackTypeFilter = '';
let adminFeedbackSearch = '';
let pendingFeedbackAction = null;
let adminFeedbackVisibleLimit = 15;
const ADMIN_FB_PAGE_SIZE = 15;

/**
 * Initialize Superadmin View
 */
function initAdminView(forceRefresh = false) {
    const currentUser = getData('currentUser');
    const container = document.getElementById('admin-requests-list');

    if (!currentUser || currentUser.account_type !== 'superadmin') {
        if (container) {
            container.innerHTML = `
                <div class="p-8 text-center text-xs text-rose-500 font-semibold">
                    Acceso restringido. Se requieren privilegios de Super Administrador.
                </div>`;
        }
        return;
    }

    adminUsersVisibleLimit = ADMIN_USERS_PAGE_SIZE;
    adminFeedbackVisibleLimit = ADMIN_FB_PAGE_SIZE;

    // Tab switching for Users
    const tabAll = document.getElementById('tab-all-users');
    const tabActive = document.getElementById('tab-active-users');
    const tabBlocked = document.getElementById('tab-blocked-users');

    if (tabAll) tabAll.onclick = () => switchAdminTab('all');
    if (tabActive) tabActive.onclick = () => switchAdminTab('active');
    if (tabBlocked) tabBlocked.onclick = () => switchAdminTab('blocked');

    // Search Input for Users
    const searchInput = document.getElementById('admin-users-search-input');
    if (searchInput) {
        searchInput.value = adminSearchQuery;
        searchInput.oninput = (e) => {
            adminSearchQuery = e.target.value;
            adminUsersVisibleLimit = ADMIN_USERS_PAGE_SIZE;
            renderAdminRequests();
        };
    }

    // Search Input for Feedback
    const fbSearchInput = document.getElementById('admin-feedback-search-input');
    if (fbSearchInput) {
        fbSearchInput.value = adminFeedbackSearch;
        fbSearchInput.oninput = (e) => {
            adminFeedbackSearch = e.target.value;
            adminFeedbackVisibleLimit = ADMIN_FB_PAGE_SIZE;
            renderAdminFeedback();
        };
    }

    // Modal Confirmation Handlers for Users
    const confirmBlockBtn = document.getElementById('btn-confirm-block');
    if (confirmBlockBtn) confirmBlockBtn.onclick = handleBlockConfirm;

    const confirmUnblockBtn = document.getElementById('btn-confirm-unblock');
    if (confirmUnblockBtn) confirmUnblockBtn.onclick = handleUnblockConfirm;

    const confirmResetBtn = document.getElementById('btn-confirm-reset-leader-password');
    if (confirmResetBtn) confirmResetBtn.onclick = handleResetPasswordConfirm;

    const copyPassBtn = document.getElementById('btn-copy-generated-password');
    if (copyPassBtn) copyPassBtn.onclick = copyGeneratedAdminPassword;

    // Load initial data
    loadAdminRequests(forceRefresh);
    loadAdminFeedback(forceRefresh);
}

/**
 * Top section switcher: Users vs Feedback
 */
function switchAdminSection(section) {
    adminActiveSection = section;

    const secUsers = document.getElementById('admin-section-users');
    const secFeedback = document.getElementById('admin-section-feedback');
    const btnUsers = document.getElementById('admin-nav-users');
    const btnFeedback = document.getElementById('admin-nav-feedback');

    if (section === 'users') {
        if (secUsers) secUsers.classList.remove('hidden');
        if (secFeedback) secFeedback.classList.add('hidden');

        if (btnUsers) {
            btnUsers.className = 'admin-section-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm';
        }
        if (btnFeedback) {
            btnFeedback.className = 'admin-section-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white';
        }
    } else {
        if (secUsers) secUsers.classList.add('hidden');
        if (secFeedback) secFeedback.classList.remove('hidden');

        if (btnUsers) {
            btnUsers.className = 'admin-section-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white';
        }
        if (btnFeedback) {
            btnFeedback.className = 'admin-section-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm';
        }
        
        loadAdminFeedback(true);
    }
}

/**
 * Common Refresh Handler
 */
function handleActiveAdminRefresh() {
    if (adminActiveSection === 'users') {
        loadAdminRequests(true);
    } else {
        loadAdminFeedback(true);
    }
}


/* ==========================================================================
   SECTION 1: USER MANAGEMENT LOGIC
   ========================================================================== */

function switchAdminTab(tab) {
    adminCurrentTab = tab;
    adminUsersVisibleLimit = ADMIN_USERS_PAGE_SIZE;

    const tabs = {
        'all': document.getElementById('tab-all-users'),
        'active': document.getElementById('tab-active-users'),
        'blocked': document.getElementById('tab-blocked-users')
    };

    Object.keys(tabs).forEach(k => {
        const btn = tabs[k];
        if (!btn) return;
        const isActive = (k === tab);
        if (isActive) {
            btn.className = 'admin-tab-btn active px-4 py-2 text-xs font-bold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white transition cursor-pointer';
        } else {
            btn.className = 'admin-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer';
        }
    });

    renderAdminRequests();
}

async function loadAdminRequests(forceRefresh = false) {
    const list = document.getElementById('admin-requests-list');
    const loadMoreContainer = document.getElementById('admin-users-load-more-container');
    if (!list) return;

    if (forceRefresh || allAdminUsers.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
                Cargando directorio de usuarios...
            </div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');

        try {
            allAdminUsers = await apiFetch('/admin/users') || [];
        } catch (e) {
            console.error("Error loading admin users:", e);
            list.innerHTML = `
                <div class="p-8 text-center text-xs text-rose-500 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-base block"></i>
                    <p>Fallo al cargar usuarios. Revisa la conexión con el servidor.</p>
                </div>`;
            return;
        }
    }

    renderAdminRequests();
}

function renderAdminRequests() {
    const list = document.getElementById('admin-requests-list');
    const loadMoreContainer = document.getElementById('admin-users-load-more-container');
    const btnLoadMore = document.getElementById('btn-admin-users-load-more');
    if (!list) return;

    const currentUser = getData('currentUser');
    const q = (adminSearchQuery || '').toLowerCase().trim();

    // 1. Filter by search query
    let filtered = allAdminUsers.filter(u => {
        if (!q) return true;
        const nameMatch = `${u.name} ${u.lastname || ''}`.toLowerCase().includes(q);
        const userMatch = (u.username || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        return nameMatch || userMatch || emailMatch;
    });

    // 2. Filter by tab
    if (adminCurrentTab === 'active') {
        filtered = filtered.filter(u => (u.status || 'active') === 'active');
    } else if (adminCurrentTab === 'blocked') {
        filtered = filtered.filter(u => u.status === 'blocked');
    }

    // 3. Update stats counters
    const totalCount = allAdminUsers.length;
    const activeCount = allAdminUsers.filter(u => (u.status || 'active') === 'active').length;
    const blockedCount = allAdminUsers.filter(u => u.status === 'blocked').length;

    const statTotal = document.getElementById('admin-stat-total');
    const statActive = document.getElementById('admin-stat-active');
    const statBlocked = document.getElementById('admin-stat-blocked');

    if (statTotal) statTotal.textContent = totalCount;
    if (statActive) statActive.textContent = activeCount;
    if (statBlocked) statBlocked.textContent = blockedCount;

    // 4. Render list
    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                No se encontraron usuarios en este filtro.
            </div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const visibleUsers = filtered.slice(0, adminUsersVisibleLimit);

    visibleUsers.forEach(u => {
        const card = document.createElement('div');
        card.className = 'p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-zinc-300 dark:hover:border-zinc-700';

        const isSelf = currentUser && (currentUser.id === u.id);
        const isBlocked = u.status === 'blocked';
        const fullName = `${u.name} ${u.lastname || ''}`.trim();
        const initials = getInitials(fullName);
        const avatarBg = getAvatarBgColor(fullName);

        // System role badge
        let roleBadge = '';
        if (u.account_type === 'superadmin') {
            roleBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800/60 uppercase">Superadmin</span>';
        } else if (u.account_type === 'leader') {
            roleBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 uppercase">Líder</span>';
        } else {
            roleBadge = '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase">Miembro</span>';
        }

        // Status badge
        const statusBadge = isBlocked
            ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60 uppercase">Bloqueado</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 uppercase">Activo</span>';

        // Groups summary
        const userGroups = u.groups || [];
        let groupsHtml = '';
        if (userGroups.length > 0) {
            groupsHtml = userGroups.map(g => `
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60">
                    <i class="fa-solid fa-users text-[9px] text-zinc-400"></i> ${g.group_name} (${g.musical_role || 'Miembro'})
                </span>
            `).join(' ');
        } else {
            groupsHtml = '<span class="text-[11px] text-zinc-400 italic">Sin bandas asignadas</span>';
        }

        // Avatar
        let avatarElement = '';
        if (u.avatar) {
            avatarElement = `<div class="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-700"><img src="${getAvatarUrl(u.avatar)}" class="w-full h-full object-cover" /></div>`;
        } else {
            avatarElement = `<div class="w-11 h-11 rounded-full flex-shrink-0 text-white font-bold text-sm flex items-center justify-center shadow-sm uppercase" style="background: ${avatarBg}">${initials}</div>`;
        }

        // Action buttons
        let actionsHtml = '';
        if (!isSelf) {
            actionsHtml = `
                <div class="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                    ${isBlocked ? `
                        <button type="button" onclick="openUnblockModal(${u.id})" class="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition flex items-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-user-check text-xs"></i>
                            <span>Desbloquear</span>
                        </button>
                    ` : `
                        <button type="button" onclick="openBlockModal(${u.id})" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-user-slash text-xs"></i>
                            <span>Bloquear</span>
                        </button>
                    `}

                    <button type="button" onclick="openResetLeaderPasswordModal(${u.id})" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer" title="Restablecer contraseña">
                        <i class="fa-solid fa-key text-xs text-amber-500"></i>
                        <span class="hidden md:inline">Clave</span>
                    </button>
                </div>
            `;
        } else {
            actionsHtml = `
                <span class="px-3 py-1 text-[11px] font-semibold text-zinc-400 italic">
                    (Tu cuenta)
                </span>
            `;
        }

        card.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                ${avatarElement}
                <div class="min-w-0 space-y-0.5">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">${fullName}</h4>
                        ${roleBadge}
                        ${statusBadge}
                    </div>
                    <p class="text-xs text-zinc-400">@${u.username} • ${u.email || 'Sin correo'}</p>
                    <div class="pt-1 flex items-center gap-1.5 flex-wrap">${groupsHtml}</div>
                </div>
            </div>
            ${actionsHtml}
        `;

        list.appendChild(card);
    });

    // Controlar botón Cargar más de usuarios
    if (loadMoreContainer && btnLoadMore) {
        if (filtered.length > adminUsersVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                adminUsersVisibleLimit += ADMIN_USERS_PAGE_SIZE;
                renderAdminRequests();
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}

// User Block / Unblock Modal Actions
function openBlockModal(userId) {
    const user = allAdminUsers.find(u => u.id === userId);
    if (!user) return;
    pendingActionUser = user;

    const nameEl = document.getElementById('block-leader-name');
    const emailEl = document.getElementById('block-leader-email');
    if (nameEl) nameEl.textContent = `${user.name} ${user.lastname || ''}`.trim();
    if (emailEl) emailEl.textContent = `@${user.username} • ${user.email}`;

    const modal = document.getElementById('modal-confirm-block');
    if (modal) modal.classList.remove('hidden');
}

function closeBlockModal() {
    pendingActionUser = null;
    const modal = document.getElementById('modal-confirm-block');
    if (modal) modal.classList.add('hidden');
}

async function handleBlockConfirm() {
    if (!pendingActionUser) return;
    const userId = pendingActionUser.id;
    try {
        await apiFetch(`/admin/users/${userId}/block`, { method: 'POST' });
        showToast("Usuario bloqueado correctamente.", "success");
        closeBlockModal();
        loadAdminRequests(true);
    } catch (e) {
        showToast(e.message || "Fallo al bloquear usuario.", "danger");
    }
}

function openUnblockModal(userId) {
    const user = allAdminUsers.find(u => u.id === userId);
    if (!user) return;
    pendingActionUser = user;

    const nameEl = document.getElementById('unblock-leader-name');
    const emailEl = document.getElementById('unblock-leader-email');
    if (nameEl) nameEl.textContent = `${user.name} ${user.lastname || ''}`.trim();
    if (emailEl) emailEl.textContent = `@${user.username} • ${user.email}`;

    const modal = document.getElementById('modal-confirm-unblock');
    if (modal) modal.classList.remove('hidden');
}

function closeUnblockModal() {
    pendingActionUser = null;
    const modal = document.getElementById('modal-confirm-unblock');
    if (modal) modal.classList.add('hidden');
}

async function handleUnblockConfirm() {
    if (!pendingActionUser) return;
    const userId = pendingActionUser.id;
    try {
        await apiFetch(`/admin/users/${userId}/unblock`, { method: 'POST' });
        showToast("Usuario desbloqueado correctamente.", "success");
        closeUnblockModal();
        loadAdminRequests(true);
    } catch (e) {
        showToast(e.message || "Fallo al desbloquear usuario.", "danger");
    }
}

// User Password Reset Modal Actions
function openResetLeaderPasswordModal(userId) {
    const user = allAdminUsers.find(u => u.id === userId);
    if (!user) return;
    pendingActionUser = user;

    const step1 = document.getElementById('reset-leader-password-confirm-step');
    const step2 = document.getElementById('reset-leader-password-success-step');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');

    const nameEl = document.getElementById('reset-leader-name');
    const emailEl = document.getElementById('reset-leader-email');
    if (nameEl) nameEl.textContent = `${user.name} ${user.lastname || ''}`.trim();
    if (emailEl) emailEl.textContent = `@${user.username} • ${user.email}`;

    const passInput = document.getElementById('generated-temporary-password');
    if (passInput) passInput.value = '';

    const modal = document.getElementById('modal-confirm-reset-leader-password');
    if (modal) modal.classList.remove('hidden');
}

function closeResetLeaderPasswordModal() {
    pendingActionUser = null;
    const modal = document.getElementById('modal-confirm-reset-leader-password');
    if (modal) modal.classList.add('hidden');
}

async function handleResetPasswordConfirm() {
    if (!pendingActionUser) return;
    const userId = pendingActionUser.id;
    const confirmBtn = document.getElementById('btn-confirm-reset-leader-password');

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Generando...';
    }

    try {
        const res = await apiFetch(`/admin/users/${userId}/reset-password`, { method: 'POST' });

        const step1 = document.getElementById('reset-leader-password-confirm-step');
        const step2 = document.getElementById('reset-leader-password-success-step');
        if (step1) step1.classList.add('hidden');
        if (step2) step2.classList.remove('hidden');

        const passInput = document.getElementById('generated-temporary-password');
        if (passInput && res.temporaryPassword) {
            passInput.value = res.temporaryPassword;
        }

        showToast("Contraseña restablecida correctamente.", "success");
    } catch (e) {
        showToast(e.message || "Fallo al restablecer contraseña.", "danger");
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Generar Contraseña Temporal';
        }
    }
}

function copyGeneratedAdminPassword() {
    const passInput = document.getElementById('generated-temporary-password');
    if (!passInput || !passInput.value) return;

    navigator.clipboard.writeText(passInput.value).then(() => {
        showToast("Contraseña copiada al portapapeles.", "success");
    }).catch(() => {
        passInput.select();
        document.execCommand('copy');
        showToast("Contraseña copiada.", "success");
    });
}


/* ==========================================================================
   SECTION 2: FEEDBACK BETA MANAGEMENT LOGIC
   ========================================================================== */

/**
 * Load Feedback reports from API
 */
async function loadAdminFeedback(forceRefresh = false) {
    const list = document.getElementById('admin-feedback-list');
    if (!list) return;

    if (forceRefresh || allAdminFeedback.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
                Cargando reportes de feedback...
            </div>`;

        try {
            const res = await apiFetch('/admin/feedback');
            if (res && res.reports) {
                allAdminFeedback = res.reports || [];
                adminFeedbackStats = res.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0 };
            } else {
                allAdminFeedback = Array.isArray(res) ? res : [];
            }
        } catch (e) {
            console.error("Error loading admin feedback:", e);
            list.innerHTML = `
                <div class="p-8 text-center text-xs text-rose-500 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-base block"></i>
                    <p>Fallo al cargar reportes de feedback.</p>
                </div>`;
            return;
        }
    }

    renderAdminFeedback();
}

/**
 * Filter change event handler
 */
function handleFeedbackFilterChange() {
    const select = document.getElementById('admin-feedback-type-filter');
    adminFeedbackTypeFilter = select ? select.value : '';
    adminFeedbackVisibleLimit = ADMIN_FB_PAGE_SIZE;
    renderAdminFeedback();
}

/**
 * Switch status filter tab
 */
function switchFeedbackStatusTab(status) {
    adminFeedbackStatusFilter = status;
    adminFeedbackVisibleLimit = ADMIN_FB_PAGE_SIZE;

    const tabs = {
        'all': document.getElementById('fb-tab-all'),
        'pending': document.getElementById('fb-tab-pending'),
        'in_progress': document.getElementById('fb-tab-in_progress'),
        'resolved': document.getElementById('fb-tab-resolved')
    };

    Object.keys(tabs).forEach(k => {
        const btn = tabs[k];
        if (!btn) return;
        const isActive = (k === status);
        if (isActive) {
            btn.className = 'admin-fb-tab-btn active px-4 py-2 text-xs font-bold border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white transition cursor-pointer whitespace-nowrap';
        } else {
            btn.className = 'admin-fb-tab-btn px-4 py-2 text-xs font-bold border-b-2 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer whitespace-nowrap';
        }
    });

    renderAdminFeedback();
}

/**
 * Render feedback report cards
 */
function renderAdminFeedback() {
    const list = document.getElementById('admin-feedback-list');
    const loadMoreContainer = document.getElementById('admin-feedback-load-more-container');
    const btnLoadMore = document.getElementById('btn-admin-feedback-load-more');
    if (!list) return;

    // Update Stats counters
    const statTotal = document.getElementById('admin-fb-stat-total');
    const statPending = document.getElementById('admin-fb-stat-pending');
    const statProgress = document.getElementById('admin-fb-stat-progress');
    const statResolved = document.getElementById('admin-fb-stat-resolved');
    const badgePending = document.getElementById('admin-badge-pending-feedback');

    const totalCount = allAdminFeedback.length;
    const pendingCount = allAdminFeedback.filter(f => f.status === 'pending').length;
    const progressCount = allAdminFeedback.filter(f => f.status === 'in_progress').length;
    const resolvedCount = allAdminFeedback.filter(f => f.status === 'resolved').length;

    if (statTotal) statTotal.textContent = totalCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statProgress) statProgress.textContent = progressCount;
    if (statResolved) statResolved.textContent = resolvedCount;

    if (badgePending) {
        badgePending.textContent = pendingCount;
        if (pendingCount > 0) {
            badgePending.classList.remove('hidden');
        } else {
            badgePending.classList.add('hidden');
        }
    }

    // Filter feedback
    const q = (adminFeedbackSearch || '').toLowerCase().trim();
    let filtered = allAdminFeedback.filter(f => {
        // Status filter
        if (adminFeedbackStatusFilter !== 'all' && f.status !== adminFeedbackStatusFilter) {
            return false;
        }
        // Type filter
        if (adminFeedbackTypeFilter && f.type !== adminFeedbackTypeFilter) {
            return false;
        }
        // Search query
        if (q) {
            const titleMatch = (f.title || '').toLowerCase().includes(q);
            const descMatch = (f.description || '').toLowerCase().includes(q);
            const userMatch = f.user ? `${f.user.name} ${f.user.lastname || ''} ${f.user.username || ''}`.toLowerCase().includes(q) : false;
            return titleMatch || descMatch || userMatch;
        }
        return true;
    });

    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                No se encontraron reportes de feedback con los filtros seleccionados.
            </div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const visibleFeedback = filtered.slice(0, adminFeedbackVisibleLimit);

    visibleFeedback.forEach(report => {
        const card = document.createElement('div');
        card.className = 'p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition group screen-fade';
        card.onclick = () => openFeedbackDetailModal(report.id);

        const user = report.user || { name: 'Usuario', lastname: '', username: 'anon' };
        const fullName = `${user.name} ${user.lastname || ''}`.trim();

        // 1. Report Type Icon
        let typeIconHtml = '';
        if (report.type === 'bug') {
            typeIconHtml = '<div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs shadow-sm"><i class="fa-solid fa-bug"></i></div>';
        } else if (report.type === 'suggestion') {
            typeIconHtml = '<div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs shadow-sm"><i class="fa-solid fa-lightbulb"></i></div>';
        } else if (report.type === 'visual') {
            typeIconHtml = '<div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs shadow-sm"><i class="fa-solid fa-display"></i></div>';
        } else {
            typeIconHtml = '<div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500/10 text-purple-500 border border-purple-500/20 text-xs shadow-sm"><i class="fa-solid fa-circle-question"></i></div>';
        }

        // 2. Status Badge
        let statusBadge = '';
        if (report.status === 'pending') {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase whitespace-nowrap">Pendiente</span>';
        } else if (report.status === 'in_progress') {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase whitespace-nowrap">En Revisión</span>';
        } else {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase whitespace-nowrap">Resuelto</span>';
        }

        // 3. Attachments indicator badge (clip/image icon with count)
        const attachments = Array.isArray(report.attachments) ? report.attachments : [];
        let attachmentBadge = '';
        if (attachments.length > 0) {
            attachmentBadge = `
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60" title="${attachments.length} captura(s) adjunta(s)">
                    <i class="fa-solid fa-paperclip text-[10px]"></i>
                    <span>${attachments.length}</span>
                </span>
            `;
        }

        // 4. Formatted Date
        const dateFormatted = report.created_at ? new Date(report.created_at).toLocaleString('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }) : '';

        card.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-1">
                ${typeIconHtml}
                <div class="min-w-0 space-y-0.5 flex-1">
                    <div class="flex items-center gap-2">
                        <h4 class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">${report.title}</h4>
                        ${attachmentBadge}
                    </div>
                    <p class="text-[11px] text-zinc-400 truncate">${fullName} • ${dateFormatted}</p>
                </div>
            </div>
            <div class="flex items-center gap-2.5 flex-shrink-0">
                ${statusBadge}
                <i class="fa-solid fa-chevron-right text-xs text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition"></i>
            </div>
        `;

        list.appendChild(card);
    });

    // Controlar botón Cargar más de feedback
    if (loadMoreContainer && btnLoadMore) {
        if (filtered.length > adminFeedbackVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                adminFeedbackVisibleLimit += ADMIN_FB_PAGE_SIZE;
                renderAdminFeedback();
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}

// Global active detailed feedback
let activeDetailedFeedback = null;

// Detailed Feedback Modal Handlers
function openFeedbackDetailModal(reportId) {
    const report = allAdminFeedback.find(f => f.id === reportId);
    if (!report) return;

    activeDetailedFeedback = report;
    pendingFeedbackAction = report.id;

    const user = report.user || { name: 'Usuario', lastname: '', username: 'anon', email: '' };
    const fullName = `${user.name} ${user.lastname || ''}`.trim();
    const dateFormatted = report.created_at ? new Date(report.created_at).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }) : '';

    // Header type icon
    const iconEl = document.getElementById('feedback-detail-type-icon');
    if (iconEl) {
        if (report.type === 'bug') {
            iconEl.className = 'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20';
            iconEl.innerHTML = '<i class="fa-solid fa-bug"></i>';
        } else if (report.type === 'suggestion') {
            iconEl.className = 'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20';
            iconEl.innerHTML = '<i class="fa-solid fa-lightbulb"></i>';
        } else if (report.type === 'visual') {
            iconEl.className = 'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20';
            iconEl.innerHTML = '<i class="fa-solid fa-display"></i>';
        } else {
            iconEl.className = 'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20';
            iconEl.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
        }
    }

    const subtitleEl = document.getElementById('feedback-detail-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `${fullName} (@${user.username}) • ${dateFormatted}`;
    }

    // Type Badge
    const typeBadgeEl = document.getElementById('feedback-detail-type-badge');
    if (typeBadgeEl) {
        if (report.type === 'bug') {
            typeBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60 uppercase flex items-center gap-1"><i class="fa-solid fa-bug text-[9px]"></i> Error / Bug</span>';
        } else if (report.type === 'suggestion') {
            typeBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 uppercase flex items-center gap-1"><i class="fa-solid fa-lightbulb text-[9px]"></i> Sugerencia</span>';
        } else if (report.type === 'visual') {
            typeBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/60 uppercase flex items-center gap-1"><i class="fa-solid fa-display text-[9px]"></i> Visual</span>';
        } else {
            typeBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800/60 uppercase flex items-center gap-1"><i class="fa-solid fa-circle-question text-[9px]"></i> Otro</span>';
        }
    }

    // Status Badge
    const statusBadgeEl = document.getElementById('feedback-detail-status-badge');
    if (statusBadgeEl) {
        if (report.status === 'pending') {
            statusBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">Pendiente</span>';
        } else if (report.status === 'in_progress') {
            statusBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase">En Revisión</span>';
        } else {
            statusBadgeEl.innerHTML = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">Resuelto</span>';
        }
    }

    const titleEl = document.getElementById('feedback-detail-title');
    if (titleEl) titleEl.textContent = report.title;

    const descEl = document.getElementById('feedback-detail-description');
    if (descEl) descEl.textContent = report.description;

    // Attachments
    const attachContainer = document.getElementById('feedback-detail-attachments-container');
    const attachGrid = document.getElementById('feedback-detail-attachments-grid');
    const attachCount = document.getElementById('feedback-detail-attachments-count');
    const attachments = Array.isArray(report.attachments) ? report.attachments : [];

    if (attachments.length > 0 && attachContainer && attachGrid) {
        attachContainer.classList.remove('hidden');
        if (attachCount) attachCount.textContent = `(${attachments.length})`;

        attachGrid.innerHTML = attachments.map(path => {
            const fullUrl = `storage/${path.replace(/^storage\//, '')}`;
            return `
                <div onclick="openFeedbackLightbox('${fullUrl}', '${report.title.replace(/'/g, "\\'")}')" 
                    class="relative w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer group shadow-sm hover:scale-105 transition flex-shrink-0">
                    <img src="${fullUrl}" alt="Captura adjunta" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </div>
                </div>
            `;
        }).join('');
    } else if (attachContainer) {
        attachContainer.classList.add('hidden');
    }

    // Telemetry
    const telemetryGrid = document.getElementById('feedback-detail-telemetry-grid');
    const telemetry = report.device_info || {};
    if (telemetryGrid) {
        telemetryGrid.innerHTML = `
            <div><span class="font-bold text-zinc-500 dark:text-zinc-400">SO:</span> ${telemetry.os || 'N/A'}</div>
            <div><span class="font-bold text-zinc-500 dark:text-zinc-400">Navegador:</span> ${telemetry.browser || 'N/A'}</div>
            <div><span class="font-bold text-zinc-500 dark:text-zinc-400">Pantalla:</span> ${telemetry.screen_resolution || 'N/A'}</div>
            <div><span class="font-bold text-zinc-500 dark:text-zinc-400">Banda:</span> ${report.group ? report.group.name : (telemetry.active_group || 'N/A')}</div>
        `;
    }

    // Form inputs
    const idInput = document.getElementById('edit-feedback-id');
    const statusSelect = document.getElementById('edit-feedback-status-select');
    const notesInput = document.getElementById('edit-feedback-admin-notes');

    if (idInput) idInput.value = report.id;
    if (statusSelect) statusSelect.value = report.status || 'pending';
    if (notesInput) notesInput.value = report.admin_notes || '';

    const modal = document.getElementById('modal-feedback-detail');
    if (modal) modal.classList.remove('hidden');
}

function closeFeedbackDetailModal() {
    activeDetailedFeedback = null;
    const modal = document.getElementById('modal-feedback-detail');
    if (modal) modal.classList.add('hidden');
}

function triggerDeleteFromDetailModal() {
    if (!activeDetailedFeedback) return;
    const report = activeDetailedFeedback;
    const user = report.user || { name: 'Usuario', lastname: '' };
    const fullName = `${user.name} ${user.lastname || ''}`.trim();

    closeFeedbackDetailModal();
    openDeleteFeedbackModal(report.id, report.title, fullName);
}

// Lightbox Modal Handlers
function openFeedbackLightbox(src, caption) {
    const modal = document.getElementById('modal-feedback-lightbox');
    const img = document.getElementById('feedback-lightbox-img');
    const captionEl = document.getElementById('feedback-lightbox-caption');

    if (img) img.src = src;
    if (captionEl) captionEl.textContent = caption || '';
    if (modal) modal.classList.remove('hidden');
}

function closeFeedbackLightbox() {
    const modal = document.getElementById('modal-feedback-lightbox');
    if (modal) modal.classList.add('hidden');
}

async function handleFeedbackStatusSubmit(event) {
    event.preventDefault();

    const idInput = document.getElementById('edit-feedback-id');
    const statusSelect = document.getElementById('edit-feedback-status-select');
    const notesInput = document.getElementById('edit-feedback-admin-notes');
    const saveBtn = document.getElementById('btn-save-feedback-status');

    const id = idInput ? parseInt(idInput.value) : 0;
    const status = statusSelect ? statusSelect.value : 'pending';
    const adminNotes = notesInput ? notesInput.value.trim() : '';

    if (!id) return;

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';
    }

    try {
        const res = await apiFetch('/admin/feedback/status', {
            method: 'POST',
            body: {
                id: id,
                status: status,
                admin_notes: adminNotes
            }
        });

        if (res && res.message) {
            showToast("Estado de reporte actualizado.", "success");
            closeFeedbackDetailModal();
            loadAdminFeedback(true);
        } else {
            showToast(res?.message || "No se pudo actualizar el estado.", "danger");
        }
    } catch (e) {
        showToast(e.message || "Error al actualizar estado.", "danger");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Cambios';
        }
    }
}

// Delete Feedback Modal Handlers
function openDeleteFeedbackModal(id, title, author) {
    pendingFeedbackAction = id;

    const titleEl = document.getElementById('delete-feedback-title');
    const authorEl = document.getElementById('delete-feedback-author');
    const modal = document.getElementById('modal-confirm-delete-feedback');

    if (titleEl) titleEl.textContent = title;
    if (authorEl) authorEl.textContent = `Reportado por: ${author}`;
    if (modal) modal.classList.remove('hidden');
}

function closeDeleteFeedbackModal() {
    pendingFeedbackAction = null;
    const modal = document.getElementById('modal-confirm-delete-feedback');
    if (modal) modal.classList.add('hidden');
}

async function executeDeleteFeedback() {
    if (!pendingFeedbackAction) return;

    const id = pendingFeedbackAction;
    const btn = document.getElementById('btn-confirm-delete-feedback');

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
    }

    try {
        const res = await apiFetch(`/admin/feedback/${id}`, { method: 'DELETE' });
        if (res) {
            showToast("Reporte de feedback eliminado correctamente.", "success");
            closeDeleteFeedbackModal();
            loadAdminFeedback(true);
        }
    } catch (e) {
        showToast(e.message || "Fallo al eliminar reporte.", "danger");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Eliminar Permanentemente';
        }
    }
}

// Global Window Exports
window.initAdminView = initAdminView;
window.switchAdminSection = switchAdminSection;
window.handleActiveAdminRefresh = handleActiveAdminRefresh;
window.switchAdminTab = switchAdminTab;
window.openBlockModal = openBlockModal;
window.closeBlockModal = closeBlockModal;
window.openUnblockModal = openUnblockModal;
window.closeUnblockModal = closeUnblockModal;
window.openResetLeaderPasswordModal = openResetLeaderPasswordModal;
window.closeResetLeaderPasswordModal = closeResetLeaderPasswordModal;
window.copyGeneratedAdminPassword = copyGeneratedAdminPassword;
window.switchFeedbackStatusTab = switchFeedbackStatusTab;
window.handleFeedbackFilterChange = handleFeedbackFilterChange;
window.openFeedbackLightbox = openFeedbackLightbox;
window.closeFeedbackLightbox = closeFeedbackLightbox;
window.openFeedbackDetailModal = openFeedbackDetailModal;
window.closeFeedbackDetailModal = closeFeedbackDetailModal;
window.triggerDeleteFromDetailModal = triggerDeleteFromDetailModal;
window.handleFeedbackStatusSubmit = handleFeedbackStatusSubmit;
window.openDeleteFeedbackModal = openDeleteFeedbackModal;
window.closeDeleteFeedbackModal = closeDeleteFeedbackModal;
window.executeDeleteFeedback = executeDeleteFeedback;
