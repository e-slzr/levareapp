/* ==========================================================================
   Levare — SUPER ADMIN PANEL CONTROLLER (API Connected & Role-Aware)
   ========================================================================== */

let adminCurrentTab = 'all';
let allAdminUsers = [];
let adminSearchQuery = '';
let pendingActionUser = null;

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

    // Tab switching
    const tabAll = document.getElementById('tab-all-users');
    const tabActive = document.getElementById('tab-active-users');
    const tabBlocked = document.getElementById('tab-blocked-users');

    if (tabAll) tabAll.onclick = () => switchAdminTab('all');
    if (tabActive) tabActive.onclick = () => switchAdminTab('active');
    if (tabBlocked) tabBlocked.onclick = () => switchAdminTab('blocked');

    // Search Input
    const searchInput = document.getElementById('admin-users-search-input');
    if (searchInput) {
        searchInput.value = adminSearchQuery;
        searchInput.oninput = (e) => {
            adminSearchQuery = e.target.value;
            renderAdminRequests();
        };
    }

    // Refresh button
    const refreshBtn = document.getElementById('btn-refresh-requests');
    if (refreshBtn) {
        refreshBtn.onclick = () => loadAdminRequests(true);
    }

    // Modal Confirmation Handlers
    const confirmBlockBtn = document.getElementById('btn-confirm-block');
    if (confirmBlockBtn) confirmBlockBtn.onclick = handleBlockConfirm;

    const confirmUnblockBtn = document.getElementById('btn-confirm-unblock');
    if (confirmUnblockBtn) confirmUnblockBtn.onclick = handleUnblockConfirm;

    const confirmResetBtn = document.getElementById('btn-confirm-reset-leader-password');
    if (confirmResetBtn) confirmResetBtn.onclick = handleResetPasswordConfirm;

    const copyPassBtn = document.getElementById('btn-copy-generated-password');
    if (copyPassBtn) copyPassBtn.onclick = copyGeneratedAdminPassword;

    loadAdminRequests(forceRefresh);
}

function switchAdminTab(tab) {
    adminCurrentTab = tab;

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
    if (!list) return;

    if (forceRefresh || allAdminUsers.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
                <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
                Cargando directorio de usuarios...
            </div>`;

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
        return;
    }

    filtered.forEach(u => {
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

        // Avatar with status indicator dot in corner
        let avatarInner = '';
        if (u.avatar) {
            avatarInner = `<div class="w-11 h-11 rounded-2xl bg-cover bg-center border border-zinc-200 dark:border-zinc-800 shadow-sm" style="background-image: url('${getAvatarUrl(u.avatar)}')"></div>`;
        } else {
            avatarInner = `<div class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm" style="background-color: ${avatarBg}">${initials}</div>`;
        }

        const statusDot = isBlocked
            ? '<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-rose-500 shadow-sm" title="Usuario Bloqueado"></span>'
            : '<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500 shadow-sm" title="Usuario Activo"></span>';

        const avatarHtml = `
            <div class="relative flex-shrink-0">
                ${avatarInner}
                ${statusDot}
            </div>
        `;

        // Bands list
        const groups = u.groups || [];
        let groupsHtml = '';
        if (groups.length > 0) {
            groupsHtml = groups.map(g => `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                    <i class="fa-solid fa-people-group text-[9px] mr-1 text-zinc-400"></i>${g.group_name} (${g.role || 'Miembro'})
                </span>
            `).join('');
        } else {
            groupsHtml = '<span class="text-[11px] text-zinc-400 dark:text-zinc-500 italic">Sin bandas asociadas</span>';
        }

        // Action buttons (Circular icon-only matching members.php style)
        let actionsHtml = '';
        if (!isSelf) {
            const blockActionBtn = isBlocked
                ? `<button type="button" class="btn-unblock-user w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-500 transition flex items-center justify-center cursor-pointer shadow-sm" title="Desbloquear usuario">
                    <i class="fa-solid fa-lock-open text-xs"></i>
                   </button>`
                : `<button type="button" class="btn-block-user w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-500 transition flex items-center justify-center cursor-pointer shadow-sm" title="Bloquear usuario">
                    <i class="fa-solid fa-lock text-xs"></i>
                   </button>`;

            const resetPwBtn = `
                <button type="button" class="btn-reset-user-pw w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center justify-center cursor-pointer shadow-sm" title="Restablecer contraseña">
                    <i class="fa-solid fa-key text-xs"></i>
                </button>
            `;


            actionsHtml = `
                <div class="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                    ${resetPwBtn}
                    ${blockActionBtn}
                </div>
            `;
        } else {
            actionsHtml = `
                <span class="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase self-end sm:self-center">Tú</span>
            `;
        }


        card.innerHTML = `
            <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                ${avatarHtml}
                <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">${fullName}</h3>
                        ${roleBadge}
                    </div>
                    <p class="text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate">@${u.username} • ${u.email}</p>
                    <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                        ${groupsHtml}
                    </div>
                </div>
            </div>
            ${actionsHtml}
        `;

        // Event listeners for actions

        const blockBtn = card.querySelector('.btn-block-user');
        if (blockBtn) {
            blockBtn.onclick = () => openBlockModal(u);
        }

        const unblockBtn = card.querySelector('.btn-unblock-user');
        if (unblockBtn) {
            unblockBtn.onclick = () => openUnblockModal(u);
        }

        const resetBtn = card.querySelector('.btn-reset-user-pw');
        if (resetBtn) {
            resetBtn.onclick = () => openResetLeaderPasswordModal(u);
        }

        list.appendChild(card);
    });
}

/* ==========================================================================
   MODAL CONTROLS & API ACTIONS
   ========================================================================== */

function openBlockModal(user) {
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
        const res = await apiFetch(`/admin/users/${userId}/block`, { method: 'POST' });
        showToast(res.message || "Usuario bloqueado exitosamente.", "success");
        closeBlockModal();
        loadAdminRequests(true);
    } catch (e) {
        showToast(e.message || "Fallo al bloquear usuario.", "danger");
    }
}

function openUnblockModal(user) {
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
        const res = await apiFetch(`/admin/users/${userId}/unblock`, { method: 'POST' });
        showToast(res.message || "Usuario desbloqueado exitosamente.", "success");
        closeUnblockModal();
        loadAdminRequests(true);
    } catch (e) {
        showToast(e.message || "Fallo al desbloquear usuario.", "danger");
    }
}

function openResetLeaderPasswordModal(user) {
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
