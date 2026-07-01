/* ==========================================================================
   WorshipApp — SUPER ADMIN PANEL CONTROLLER
   ========================================================================== */

let adminCurrentTab = 'all';
let allLeaderRequests = []; // Stores all users (leaders & members)
let pendingActionId = null;

function initAdminView() {
    const currentUser = getData('currentUser');
    if (!currentUser || currentUser.account_type !== 'superadmin') {
        document.getElementById('admin-requests-list').innerHTML = `
            <div style="text-align:center; padding: 60px; color: var(--danger);">
                Acceso restringido. Se requieren privilegios de Super Admin.
            </div>`;
        return;
    }

    // Tab switching
    const tabAll = document.getElementById('tab-all-users');
    const tabBlocked = document.getElementById('tab-blocked-users');

    if (tabAll) {
        tabAll.onclick = () => switchAdminTab('all');
    }
    if (tabBlocked) {
        tabBlocked.onclick = () => switchAdminTab('blocked');
    }

    // Refresh button
    document.getElementById('btn-refresh-requests').onclick = () => loadAdminRequests(true);

    // Block modal controls
    document.getElementById('btn-close-block-modal-x').onclick = closeBlockModal;
    document.getElementById('btn-cancel-block').onclick = closeBlockModal;
    document.getElementById('btn-confirm-block').onclick = confirmBlock;

    // Unblock modal controls
    document.getElementById('btn-close-unblock-modal-x').onclick = closeUnblockModal;
    document.getElementById('btn-cancel-unblock').onclick = closeUnblockModal;
    document.getElementById('btn-confirm-unblock').onclick = confirmUnblock;

    // Reset password modal controls
    document.getElementById('btn-close-reset-leader-modal-x').onclick = closeResetLeaderPasswordModal;
    document.getElementById('btn-cancel-reset-leader').onclick = closeResetLeaderPasswordModal;
    document.getElementById('btn-confirm-reset-leader-password').onclick = confirmResetLeaderPassword;
    document.getElementById('btn-copy-generated-password').onclick = copyGeneratedPassword;
    document.querySelectorAll('#modal-confirm-reset-leader-password .btn-close-modal').forEach(btn => {
        btn.onclick = closeResetLeaderPasswordModal;
    });

    // Close modals on backdrop click
    document.getElementById('modal-confirm-block').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-block')) closeBlockModal();
    };
    document.getElementById('modal-confirm-unblock').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-unblock')) closeUnblockModal();
    };
    document.getElementById('modal-confirm-reset-leader-password').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-reset-leader-password')) closeResetLeaderPasswordModal();
    };

    loadAdminRequests();
}

function switchAdminTab(tab) {
    adminCurrentTab = tab;
    
    const tabAll = document.getElementById('tab-all-users');
    const tabBlocked = document.getElementById('tab-blocked-users');

    if (tabAll) {
        const isActive = tab === 'all';
        tabAll.style.borderBottomColor = isActive ? 'var(--accent-color, #7c3aed)' : 'transparent';
        tabAll.style.color = isActive ? 'var(--accent-color, #7c3aed)' : 'var(--text-muted)';
        tabAll.classList.toggle('active', isActive);
    }
    if (tabBlocked) {
        const isActive = tab === 'blocked';
        tabBlocked.style.borderBottomColor = isActive ? 'var(--accent-color, #7c3aed)' : 'transparent';
        tabBlocked.style.color = isActive ? 'var(--accent-color, #7c3aed)' : 'var(--text-muted)';
        tabBlocked.classList.toggle('active', isActive);
    }
    renderAdminRequests();
}

async function loadAdminRequests(forceRefresh = false) {
    const list = document.getElementById('admin-requests-list');
    list.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">Cargando usuarios...</div>`;

    try {
        allLeaderRequests = await apiFetch('/superadmin/requests') || [];
        renderAdminRequests();
    } catch (e) {
        list.innerHTML = `<div style="text-align:center; padding: 60px; color:var(--danger);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;opacity:0.5;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Fallo al cargar usuarios. Revisa la conexión con la API.
        </div>`;
    }
}

function renderAdminRequests() {
    const list = document.getElementById('admin-requests-list');

    // Filter by tab
    const filtered = adminCurrentTab === 'blocked'
        ? allLeaderRequests.filter(r => r.status === 'blocked')
        : allLeaderRequests;

    // Update stats
    const totalUsers = allLeaderRequests.length;
    const blockedUsers = allLeaderRequests.filter(r => r.status === 'blocked').length;
    
    document.getElementById('admin-stat-total').textContent = totalUsers;
    document.getElementById('admin-stat-blocked').textContent = blockedUsers;

    if (filtered.length === 0) {
        const emptyMsg = adminCurrentTab === 'blocked'
            ? 'No hay usuarios bloqueados actualmente.'
            : 'No hay usuarios registrados en la plataforma.';
        list.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; color:var(--text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px;display:block;opacity:0.3;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="font-size:1rem; font-weight:600;">${emptyMsg}</p>
            </div>`;
        return;
    }

    list.innerHTML = '';
    filtered.forEach(user => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 18px 20px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            transition: border-color 0.2s;
        `;

        const nameStr = `${user.name} ${user.lastname || ''}`.trim();
        const initials = getInitials(nameStr);
        const avatarBg = getAvatarBgColor(nameStr);
        const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) : '—';

        const statusBadge = getStatusBadge(user.status);
        const roleLabel = user.account_type === 'leader' 
            ? `<span style="font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:12px; background:rgba(124,58,237,0.12); color:var(--accent-color, #7c3aed); border:1px solid rgba(124,58,237,0.22); margin-left: 6px;">Líder</span>`
            : `<span style="font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:12px; background:rgba(59,130,246,0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.22); margin-left: 6px;">Miembro</span>`;

        card.innerHTML = `
            <div style="width:48px; height:48px; border-radius:50%; background:${avatarBg};
                display:flex; align-items:center; justify-content:center;
                font-size:1.1rem; font-weight:700; color:#fff; flex-shrink:0;">
                ${initials}
            </div>
            <div style="flex:1; min-width:200px;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <p style="font-size:1rem; font-weight:700; color:var(--text-primary);">${nameStr}</p>
                    ${roleLabel}
                    ${statusBadge}
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
                    Username: @${user.username || '—'} | Correo: ${user.email || '—'}
                </p>
                ${user.groups && user.groups.length > 0 ? `
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; align-items:center;">
                        <span style="font-size:0.75rem; color:var(--text-muted);">Grupos:</span>
                        ${user.groups.map(g => `
                            <span style="font-size:0.7rem; font-weight:500; padding:1px 6px; border-radius:4px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-secondary);">
                                ${g.name} (${g.pivot.role || 'Miembro'})
                            </span>
                        `).join('')}
                    </div>
                ` : `
                    <p style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-top:6px;">Sin grupos musicales asociados</p>
                `}
                <p style="font-size:0.78rem; color:var(--text-muted); margin-top:6px;">
                    Registrado el ${createdAt}
                </p>
            </div>
            <div style="display:flex; gap:8px; flex-shrink:0; align-items:center; flex-wrap:wrap;" id="actions-${user.id}">
                <button class="btn btn-outline" data-id="${user.id}" data-name="${nameStr}" data-email="${user.email || user.username}" onclick="openResetLeaderPasswordModal(this)" style="font-size:0.82rem; padding: 8px 14px; color:var(--text-primary); border-color:var(--border-color);">
                    Resetear Contraseña
                </button>
                ${user.status === 'blocked' ? `
                    <button class="btn btn-primary" data-id="${user.id}" data-name="${nameStr}" data-email="${user.email || user.username}" onclick="openUnblockModal(this)" style="font-size:0.82rem; padding: 8px 14px; background:#10b981; border-color:#10b981;">
                        Activar
                    </button>
                ` : `
                    <button class="btn btn-danger" data-id="${user.id}" data-name="${nameStr}" data-email="${user.email || user.username}" onclick="openBlockModal(this)" style="font-size:0.82rem; padding: 8px 14px; background:#ef4444; border-color:#ef4444;">
                        Bloquear
                    </button>
                `}
            </div>
        `;
        list.appendChild(card);
    });
}

function getStatusBadge(status) {
    const badges = {
        'active':   `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:3px 10px; border-radius:20px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">Activo</span>`,
        'blocked':  `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:3px 10px; border-radius:20px; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);">Bloqueado</span>`,
        'pending':  `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:3px 10px; border-radius:20px; background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3);">Pendiente</span>`,
        'rejected': `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:3px 10px; border-radius:20px; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);">Rechazado</span>`,
    };
    return badges[status] || badges['active'];
}

// --- Block Flow ---
function openBlockModal(btn) {
    pendingActionId = btn.dataset.id;
    document.getElementById('block-leader-name').textContent = btn.dataset.name;
    document.getElementById('block-leader-email').textContent = btn.dataset.email;
    document.getElementById('modal-confirm-block').classList.remove('hidden');
}

function closeBlockModal() {
    document.getElementById('modal-confirm-block').classList.add('hidden');
    pendingActionId = null;
}

async function confirmBlock() {
    if (!pendingActionId) return;
    const btn = document.getElementById('btn-confirm-block');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
        const res = await apiFetch(`/superadmin/requests/${pendingActionId}/block`, { method: 'POST' });
        showToast(res.message || 'Usuario bloqueado.', 'warning');
        closeBlockModal();
        await loadAdminRequests();
    } catch (e) {
        showToast(e.message || 'Error al bloquear al usuario.', 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirmar Bloqueo';
    }
}

// --- Unblock Flow ---
function openUnblockModal(btn) {
    pendingActionId = btn.dataset.id;
    document.getElementById('unblock-leader-name').textContent = btn.dataset.name;
    document.getElementById('unblock-leader-email').textContent = btn.dataset.email;
    document.getElementById('modal-confirm-unblock').classList.remove('hidden');
}

function closeUnblockModal() {
    document.getElementById('modal-confirm-unblock').classList.add('hidden');
    pendingActionId = null;
}

async function confirmUnblock() {
    if (!pendingActionId) return;
    const btn = document.getElementById('btn-confirm-unblock');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
        const res = await apiFetch(`/superadmin/requests/${pendingActionId}/unblock`, { method: 'POST' });
        showToast(res.message || 'Usuario desbloqueado.', 'success');
        closeUnblockModal();
        await loadAdminRequests();
    } catch (e) {
        showToast(e.message || 'Error al desbloquear al usuario.', 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirmar Desbloqueo';
    }
}

// --- Password Reset Flow ---
function openResetLeaderPasswordModal(btn) {
    pendingActionId = btn.dataset.id;
    document.getElementById('reset-leader-name').textContent = btn.dataset.name;
    document.getElementById('reset-leader-email').textContent = btn.dataset.email;
    
    // Set view to step 1 (confirmation) and hide step 2
    document.getElementById('reset-leader-password-confirm-step').classList.remove('hidden');
    document.getElementById('reset-leader-password-success-step').classList.add('hidden');
    document.getElementById('generated-temporary-password').value = '';
    
    document.getElementById('modal-confirm-reset-leader-password').classList.remove('hidden');
}

function closeResetLeaderPasswordModal() {
    document.getElementById('modal-confirm-reset-leader-password').classList.add('hidden');
    pendingActionId = null;
}

async function confirmResetLeaderPassword() {
    if (!pendingActionId) return;
    const btn = document.getElementById('btn-confirm-reset-leader-password');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
        const res = await apiFetch(`/superadmin/requests/${pendingActionId}/reset-password`, { method: 'POST' });
        
        // Populate the success step with the generated password
        document.getElementById('generated-temporary-password').value = res.temporary_password;
        
        // Hide step 1 (confirmation), Show step 2 (success key display)
        document.getElementById('reset-leader-password-confirm-step').classList.add('hidden');
        document.getElementById('reset-leader-password-success-step').classList.remove('hidden');
        
        showToast(res.message || 'Contraseña restablecida con éxito.', 'success');
    } catch (e) {
        showToast(e.message || 'Error al restablecer contraseña.', 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirmar Restablecimiento';
    }
}

async function copyGeneratedPassword() {
    const input = document.getElementById('generated-temporary-password');
    if (!input || !input.value) return;

    try {
        await navigator.clipboard.writeText(input.value);
        showToast('¡Contraseña temporal copiada al portapapeles!', 'success');
    } catch {
        // Fallback
        input.select();
        document.execCommand('copy');
        showToast('¡Contraseña copiada!', 'success');
    }
}
