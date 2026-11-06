/**
 * @fileoverview Submódulo de Gestión de Banda para Líderes (Band Management).
 * Centraliza la administración del grupo activo:
 * - Edición de nombre y descripción de la agrupación.
 * - Código de invitación activo (visualización, copia, compartir y regeneración).
 * - Directorio integral de miembros, asignación de roles e instrumentos.
 * - Gestor de mensajes rápidos y atajos personales para el Modo Director (Live Cues).
 * - Zona de peligro (abandonar banda o eliminar definitivamente con confirmación).
 * 
 * Reglas:
 * - Estrictamente sin emojis en UI, logs y alertas.
 * - Soporte dual (Modo Oscuro / Claro).
 * - Aislamiento multi-tenancy mediante X-Group-Id y Bearer token.
 */

let currentBandData = null;
let currentBandMembers = [];

/**
 * Resuelve de forma robusta el ID del grupo activo consultando almacenamiento y variables globales.
 * @returns {number|null}
 */
function getResolvedGroupId() {
    let gid = typeof getData === 'function' ? getData('currentGroupId') : null;
    if (!gid && typeof window.currentGroupId !== 'undefined') gid = window.currentGroupId;
    if (!gid && typeof currentGroupId !== 'undefined') gid = currentGroupId;
    return gid ? parseInt(gid, 10) : null;
}

/**
 * Valida si el usuario actual posee rol de líder o administrador.
 * @returns {boolean}
 */
function isUserLeaderOrAdmin() {
    if (typeof canEdit === 'function') return canEdit();
    if (typeof window.canEdit === 'function') return window.canEdit();
    const user = typeof getData === 'function' ? getData('currentUser') : null;
    if (!user) return false;
    return user.account_type === 'superadmin' || user.account_type === 'leader';
}

/**
 * Punto de entrada SPA para la vista de Gestión de Banda.
 * @param {boolean} [forceRefresh=true]
 */
async function initBandView(forceRefresh = true) {
    // 1. Validar que el usuario tenga permisos de líder o superadmin
    if (!isUserLeaderOrAdmin()) {
        if (typeof showToast === 'function') {
            showToast('Solo los líderes tienen acceso a la sección de Banda.', 'warning');
        }
        if (typeof navigateTo === 'function') {
            navigateTo('members');
        }
        return;
    }

    const currentGroupId = getResolvedGroupId();
    if (!currentGroupId) {
        if (typeof showToast === 'function') {
            showToast('Selecciona o crea una banda para gestionar.', 'warning');
        }
        if (typeof navigateTo === 'function') {
            navigateTo('profile');
        }
        return;
    }

    // 2. Cargar información de la banda, miembros y atajos en paralelo y desacoplados
    await Promise.allSettled([
        loadBandDetails(),
        loadBandMembers(forceRefresh),
        loadBandQuickCues()
    ]);
}

/**
 * Consulta y despliega la información central de la banda activa.
 */
async function loadBandDetails() {
    const currentGroupId = getResolvedGroupId();
    if (!currentGroupId) return;

    try {
        const data = await apiFetch(`/groups/${currentGroupId}`, { method: 'GET' });
        if (!data || !data.id) return;

        currentBandData = data;

        // Renderizar textos principales
        const nameEl = document.getElementById('band-view-name');
        const descEl = document.getElementById('band-view-desc');
        const codeEl = document.getElementById('band-invite-code-val');
        const deleteTargetEl = document.getElementById('band-delete-target-name');

        if (nameEl) nameEl.textContent = data.name || 'Sin nombre';
        if (descEl) descEl.textContent = data.description || 'Sin descripción configurada.';
        if (codeEl) codeEl.textContent = data.invite_code || '------';
        if (deleteTargetEl) deleteTargetEl.textContent = data.name || '';

        // Visibilidad de eliminar banda en Zona de Peligro (solo creador o superadmin)
        const deleteCard = document.getElementById('card-delete-band-danger');
        if (deleteCard) {
            if (data.is_creator) {
                deleteCard.classList.remove('hidden');
            } else {
                deleteCard.classList.add('hidden');
            }
        }

    } catch (err) {
        console.warn('Error al cargar datos de la banda:', err);
    }
}

// ==============================================================================
// EDICIÓN DE INFORMACIÓN DE BANDA
// ==============================================================================

function openEditBandInfoModal() {
    if (!currentBandData) return;
    const modal = document.getElementById('modal-edit-band-info');
    const inputName = document.getElementById('input-edit-band-name');
    const inputDesc = document.getElementById('input-edit-band-desc');

    if (inputName) inputName.value = currentBandData.name || '';
    if (inputDesc) inputDesc.value = currentBandData.description || '';
    if (modal) modal.classList.remove('hidden');
}

function closeEditBandInfoModal() {
    const modal = document.getElementById('modal-edit-band-info');
    if (modal) modal.classList.add('hidden');
}

async function handleUpdateBandInfoSubmit(e) {
    if (e) e.preventDefault();
    const currentGroupId = typeof getData === 'function' ? getData('currentGroupId') : null;
    const inputName = document.getElementById('input-edit-band-name');
    const inputDesc = document.getElementById('input-edit-band-desc');

    if (!currentGroupId || !inputName || !inputName.value.trim()) return;

    const newName = inputName.value.trim();
    const newDesc = inputDesc ? inputDesc.value.trim() : '';

    try {
        const res = await apiFetch(`/groups/${currentGroupId}`, {
            method: 'PUT',
            body: { name: newName, description: newDesc }
        });

        if (res && res.group) {
            closeEditBandInfoModal();
            if (typeof showToast === 'function') {
                showToast('Información de la banda actualizada correctamente.', 'success');
            }

            // Actualizar caché de grupos del usuario
            const userGroups = getData('userGroups') || [];
            const idx = userGroups.findIndex(g => g.id == currentGroupId);
            if (idx !== -1) {
                userGroups[idx].name = newName;
                userGroups[idx].description = newDesc;
                setData('userGroups', userGroups);
            }

            // Refrescar selector si existe
            if (typeof renderWorkspaceGroupSelector === 'function') {
                renderWorkspaceGroupSelector(userGroups);
            }

            loadBandDetails();
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast(err.message || 'Error al actualizar información.', 'error');
        }
    }
}

// ==============================================================================
// CÓDIGO DE INVITACIÓN (MODAL POPUP, COPIAR, COMPARTIR, REGENERAR)
// ==============================================================================

function openBandInviteModal() {
    const modal = document.getElementById('modal-band-invite-code');
    if (modal) modal.classList.remove('hidden');
}

function closeBandInviteModal() {
    const modal = document.getElementById('modal-band-invite-code');
    if (modal) modal.classList.add('hidden');
}

async function copyBandInviteCode() {
    if (!currentBandData || !currentBandData.invite_code) return;
    const code = currentBandData.invite_code;

    try {
        await navigator.clipboard.writeText(code);
        if (typeof showToast === 'function') {
            showToast('Código de invitación copiado al portapapeles.', 'success');
        }
    } catch {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (typeof showToast === 'function') {
            showToast('Código copiado.', 'success');
        }
    }
}

async function shareBandInviteCode() {
    if (!currentBandData || !currentBandData.invite_code) return;
    const code = currentBandData.invite_code;
    const bandName = currentBandData.name || 'nuestra banda';

    const shareData = {
        title: `Únete a ${bandName} en Levare`,
        text: `Hola, únete a nuestra banda "${bandName}" en Levare utilizando el código de invitación: ${code}`
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (e) {
            // Usuario canceló compartir
        }
    } else {
        copyBandInviteCode();
    }
}

function openResetInviteCodeModal() {
    const modal = document.getElementById('modal-confirm-reset-band-code');
    if (modal) modal.classList.remove('hidden');
}

function closeResetBandCodeModal() {
    const modal = document.getElementById('modal-confirm-reset-band-code');
    if (modal) modal.classList.add('hidden');
}

async function executeResetBandInviteCode() {
    const currentGroupId = typeof getData === 'function' ? getData('currentGroupId') : null;
    if (!currentGroupId) return;

    try {
        const res = await apiFetch(`/groups/${currentGroupId}/reset-invite-code`, {
            method: 'POST'
        });

        closeResetBandCodeModal();
        if (res && res.invite_code) {
            const codeEl = document.getElementById('band-invite-code-val');
            if (codeEl) codeEl.textContent = res.invite_code;
            if (currentBandData) currentBandData.invite_code = res.invite_code;

            if (typeof showToast === 'function') {
                showToast('Código de invitación regenerado exitosamente.', 'success');
            }
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast(err.message || 'Error al regenerar código.', 'error');
        }
    }
}

// ==============================================================================
// PESTAÑAS SEGMENTADAS
// ==============================================================================

function switchBandTab(tabName) {
    ['members', 'cues', 'danger'].forEach(t => {
        const content = document.getElementById(`tab-content-band-${t}`);
        const btn = document.getElementById(`tab-btn-band-${t}`);
        if (content) content.classList.add('hidden');
        if (btn) {
            btn.className = 'py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer';
        }
    });

    const activeContent = document.getElementById(`tab-content-band-${tabName}`);
    const activeBtn = document.getElementById(`tab-btn-band-${tabName}`);

    if (activeContent) activeContent.classList.remove('hidden');
    if (activeBtn) {
        if (tabName === 'danger') {
            activeBtn.className = 'py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm transition flex items-center justify-center gap-1.5 font-bold cursor-pointer';
        } else {
            activeBtn.className = 'py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm transition flex items-center justify-center gap-1.5 font-bold cursor-pointer';
        }
    }
}

// ==============================================================================
// GESTIÓN DE INTEGRANTES Y ROLES
// ==============================================================================

async function loadBandMembers(forceRefresh = false) {
    const container = document.getElementById('band-members-list-container');
    if (!container) return;

    if (forceRefresh || currentBandMembers.length === 0) {
        container.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-zinc-400">Cargando integrantes...</div>';
        try {
            currentBandMembers = await apiFetch('/members') || [];
            window.currentBandMembers = currentBandMembers;
        } catch (err) {
            container.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-red-400">Error al cargar integrantes.</div>';
            return;
        }
    }
    window.currentBandMembers = currentBandMembers;

    container.innerHTML = '';
    if (currentBandMembers.length === 0) {
        container.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-zinc-400">No hay integrantes registrados en esta banda.</div>';
        return;
    }

    currentBandMembers.forEach(u => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between gap-3 transition hover:border-zinc-300 dark:hover:border-zinc-700';

        const nameStr = `${u.name} ${u.lastname || ''}`.trim();
        const initials = typeof getInitials === 'function' ? getInitials(nameStr) : nameStr.substring(0, 2).toUpperCase();
        const avatarBg = typeof getAvatarBgColor === 'function' ? getAvatarBgColor(nameStr) : '#6366f1';
        const isLeaderUser = u.account_type === 'leader' || u.account_type === 'superadmin';

        let avatarHtml = `<div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background:${avatarBg};">${initials}</div>`;
        if (u.avatar && typeof getAvatarUrl === 'function') {
            avatarHtml = `<div class="w-11 h-11 rounded-2xl bg-cover bg-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800" style="background-image:url('${getAvatarUrl(u.avatar)}');"></div>`;
        }

        const primaryRole = u.role || (Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : '');
        const secondaryRoles = (Array.isArray(u.roles) ? u.roles : []).filter(r => r !== primaryRole);

        let rolesBadge = '<span class="text-[11px] text-zinc-400 font-medium">Sin rol musical</span>';
        if (primaryRole) {
            const extraCount = secondaryRoles.length;
            const extraBadge = extraCount > 0 
                ? `<span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-help" title="Roles adicionales: ${secondaryRoles.join(', ')}">+${extraCount}</span>`
                : '';
            rolesBadge = `
                <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <i class="fa-solid fa-star text-[9px]"></i>
                        <span>${primaryRole}</span>
                    </span>
                    ${extraBadge}
                </div>
            `;
        }

        const handleStr = u.email || `@${u.username || 'usuario'}`;

        card.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-1">
                ${avatarHtml}
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                        <h4 class="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">${nameStr}</h4>
                        ${isLeaderUser ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">Líder</span>' : ''}
                    </div>
                    <p class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">${handleStr}</p>
                    ${rolesBadge}
                </div>
            </div>

            <!-- Acciones Administrativas del Miembro -->
            <div class="flex items-center gap-1 flex-shrink-0">
                <button type="button" class="btn-band-reset-pw w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer" title="Restablecer Contraseña">
                    <i class="fa-solid fa-key text-xs pointer-events-none"></i>
                </button>
                <button type="button" class="btn-band-edit-member w-8 h-8 rounded-xl text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer" title="Editar Integrante">
                    <i class="fa-solid fa-user-pen text-xs pointer-events-none"></i>
                </button>
                ${!isLeaderUser ? `
                <button type="button" class="btn-band-delete-member w-8 h-8 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer" title="Retirar de la banda">
                    <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                </button>` : ''}
            </div>
        `;

        // Listeners de acción
        const resetPwBtn = card.querySelector('.btn-band-reset-pw');
        if (resetPwBtn) {
            resetPwBtn.onclick = () => {
                if (typeof window.openResetPasswordModal === 'function') {
                    window.openResetPasswordModal(u.id);
                }
            };
        }

        const editMemberBtn = card.querySelector('.btn-band-edit-member');
        if (editMemberBtn) {
            editMemberBtn.onclick = () => {
                if (typeof window.openEditMemberModal === 'function') {
                    window.openEditMemberModal(u.id);
                }
            };
        }

        const delBtn = card.querySelector('.btn-band-delete-member');
        if (delBtn) {
            delBtn.onclick = () => {
                if (typeof window.removeMemberFromGroup === 'function') {
                    window.removeMemberFromGroup(u.id, nameStr);
                }
            };
        }

        container.appendChild(card);
    });
}

function openAddBandMemberModal() {
    if (typeof window.openAddMemberModal === 'function') {
        window.openAddMemberModal();
    }
}

function openBandRolesModal() {
    if (typeof window.openManageRolesModal === 'function') {
        window.openManageRolesModal();
    }
}

// ==============================================================================
// GESTIÓN DE ATANJOS Y CUES EN VIVO
// ==============================================================================

async function loadBandQuickCues() {
    const container = document.getElementById('band-cues-list-container');
    if (!container) return;

    try {
        const cues = await apiFetch('/quick-cues', { method: 'GET' }) || [];

        container.innerHTML = '';
        if (cues.length === 0) {
            container.innerHTML = '<div class="text-xs text-zinc-400 text-center py-6">No has registrado atajos personales para esta banda aún.</div>';
            return;
        }

        cues.forEach(cue => {
            const row = document.createElement('div');
            row.className = 'p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 transition hover:border-amber-500/40';

            row.innerHTML = `
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">${cue.title}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">${cue.category || 'General'}</span>
                    </div>
                    <p class="text-[10px] text-zinc-400 mt-0.5">Disponible en visor táctil en vivo</p>
                </div>
                <button type="button" class="btn-del-band-cue w-8 h-8 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer" title="Eliminar atajo">
                    <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                </button>
            `;

            const delCueBtn = row.querySelector('.btn-del-band-cue');
            if (delCueBtn) {
                delCueBtn.onclick = () => {
                    deleteBandQuickCue(cue.id);
                };
            }

            container.appendChild(row);
        });

    } catch (err) {
        container.innerHTML = '<div class="text-xs text-red-400 text-center py-4">Error al cargar atajos.</div>';
    }
}

async function handleCreateBandQuickCue(e) {
    if (e) e.preventDefault();
    const titleInput = document.getElementById('band-new-cue-title');
    const categorySelect = document.getElementById('band-new-cue-category');

    if (!titleInput || !titleInput.value.trim()) return;

    const title = titleInput.value.trim();
    const category = categorySelect ? categorySelect.value : 'General';

    try {
        await apiFetch('/quick-cues', {
            method: 'POST',
            body: { title, category }
        });

        titleInput.value = '';
        if (typeof showToast === 'function') {
            showToast('Atajo personal guardado correctamente.', 'success');
        }

        loadBandQuickCues();

        // Si el modal táctil de repertorios existe, recargar también
        if (typeof window.loadPersonalQuickCues === 'function') {
            window.loadPersonalQuickCues();
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast(err.message || 'Error al guardar atajo.', 'error');
        }
    }
}

async function deleteBandQuickCue(cueId) {
    if (!cueId) return;

    try {
        await apiFetch(`/quick-cues/${cueId}`, { method: 'DELETE' });
        if (typeof showToast === 'function') {
            showToast('Atajo eliminado correctamente.', 'info');
        }

        loadBandQuickCues();

        if (typeof window.loadPersonalQuickCues === 'function') {
            window.loadPersonalQuickCues();
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al eliminar atajo.', 'error');
        }
    }
}

// ==============================================================================
// ZONA DE PELIGRO: ABANDONAR BANDA & ELIMINAR BANDA
// ==============================================================================

function openLeaveBandModal() {
    const modal = document.getElementById('modal-confirm-leave-band');
    if (modal) modal.classList.remove('hidden');
}

function closeLeaveBandModal() {
    const modal = document.getElementById('modal-confirm-leave-band');
    if (modal) modal.classList.add('hidden');
}

async function executeLeaveBandSubmit() {
    const currentGroupId = typeof getData === 'function' ? getData('currentGroupId') : null;
    if (!currentGroupId) return;

    try {
        await apiFetch(`/groups/${currentGroupId}/leave`, { method: 'POST' });
        closeLeaveBandModal();

        if (typeof showToast === 'function') {
            showToast('Has salido de la banda exitosamente.', 'info');
        }

        // Actualizar bandas del usuario y redirigir
        await handlePostGroupRemoval();

    } catch (err) {
        if (typeof showToast === 'function') {
            showToast(err.message || 'Error al salir de la banda.', 'error');
        }
    }
}

function openDeleteBandModal() {
    const modal = document.getElementById('modal-confirm-delete-band');
    const input = document.getElementById('input-confirm-delete-band-name');
    if (input) input.value = '';
    if (modal) modal.classList.remove('hidden');
}

function closeDeleteBandModal() {
    const modal = document.getElementById('modal-confirm-delete-band');
    if (modal) modal.classList.add('hidden');
}

async function executeDeleteBandSubmit() {
    const currentGroupId = typeof getData === 'function' ? getData('currentGroupId') : null;
    const input = document.getElementById('input-confirm-delete-band-name');

    if (!currentGroupId || !input || !input.value.trim()) {
        if (typeof showToast === 'function') {
            showToast('Escribe el nombre de la banda para confirmar.', 'warning');
        }
        return;
    }

    const typedName = input.value.trim();

    try {
        const res = await apiFetch(`/groups/${currentGroupId}`, {
            method: 'DELETE',
            body: { confirmation_name: typedName }
        });

        closeDeleteBandModal();
        if (typeof showToast === 'function') {
            showToast(res.message || 'Banda eliminada correctamente.', 'info');
        }

        await handlePostGroupRemoval();

    } catch (err) {
        if (typeof showToast === 'function') {
            showToast(err.message || 'Error al eliminar la banda.', 'error');
        }
    }
}

/**
 * Limpia y reorganiza el estado del usuario tras salir o eliminar una banda.
 */
async function handlePostGroupRemoval() {
    try {
        const groups = await apiFetch('/groups') || [];
        setData('userGroups', groups);

        if (groups.length > 0) {
            setData('currentGroupId', groups[0].id);
        } else {
            setData('currentGroupId', null);
        }

        if (typeof renderWorkspaceGroupSelector === 'function') {
            renderWorkspaceGroupSelector(groups);
        }

        if (typeof navigateTo === 'function') {
            navigateTo('dashboard');
        }
    } catch (e) {
        window.location.hash = '#dashboard';
    }
}

// Exportar globalmente para eventos inline HTML
window.initBandView = initBandView;
window.loadBandDetails = loadBandDetails;
window.openEditBandInfoModal = openEditBandInfoModal;
window.closeEditBandInfoModal = closeEditBandInfoModal;
window.handleUpdateBandInfoSubmit = handleUpdateBandInfoSubmit;
window.openBandInviteModal = openBandInviteModal;
window.closeBandInviteModal = closeBandInviteModal;
window.copyBandInviteCode = copyBandInviteCode;
window.shareBandInviteCode = shareBandInviteCode;
window.openResetInviteCodeModal = openResetInviteCodeModal;
window.closeResetBandCodeModal = closeResetBandCodeModal;
window.executeResetBandInviteCode = executeResetBandInviteCode;
window.switchBandTab = switchBandTab;
window.loadBandMembers = loadBandMembers;
window.openAddBandMemberModal = openAddBandMemberModal;
window.openBandRolesModal = openBandRolesModal;
window.loadBandQuickCues = loadBandQuickCues;
window.handleCreateBandQuickCue = handleCreateBandQuickCue;
window.deleteBandQuickCue = deleteBandQuickCue;
window.openLeaveBandModal = openLeaveBandModal;
window.closeLeaveBandModal = closeLeaveBandModal;
window.executeLeaveBandSubmit = executeLeaveBandSubmit;
window.openDeleteBandModal = openDeleteBandModal;
window.closeDeleteBandModal = closeDeleteBandModal;
window.executeDeleteBandSubmit = executeDeleteBandSubmit;

// Si la ruta activa en URL ya es #band al momento de cargar el script, inicializar de inmediato
if (typeof window !== 'undefined' && window.location && window.location.hash === '#band') {
    initBandView(true);
}
