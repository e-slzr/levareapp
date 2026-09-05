/**
 * ==============================================================================
 * Levare — Workspace & Multi-tenancy Groups Module (groups.js)
 * ==============================================================================
 * @fileoverview Administra la lógica de aislamiento por bandas / grupos de alabanza:
 * - Sincronización en tiempo real de bandas del usuario (`/groups`).
 * - Renderizado dinámico de selectores de espacio de trabajo (Desktop & Móvil).
 * - Cambio activo de banda y refresco de estado.
 * - Modales y flujos para unirse a bandas (código) o crear nuevas bandas.
 * - Guardias para usuarios sin banda asignada.
 * ==============================================================================
 */

/**
 * Renderiza las opciones de bandas en todos los selectores de la aplicación (Sidebar, Móvil y Perfil).
 * @param {Array<Object>} [userGroups] - Lista opcional de grupos. Si no se pasa, la recupera de localStorage.
 */
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

    // Actualizar nombre de banda activa en el pie del dashboard si existe
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
window.renderWorkspaceGroupSelector = renderWorkspaceGroupSelector;

/**
 * Maneja el cambio de banda activa desde el selector dropdown.
 * @param {Event} e
 */
function handleActiveGroupChangeSelect(e) {
    const newGroupId = parseInt(e.target.value);
    currentGroupId = newGroupId;
    setData('currentGroupId', currentGroupId);
    
    const userGroups = getData('userGroups') || [];
    const groupName = userGroups.find(g => g.id == newGroupId)?.name || 'Banda';
    
    showToast(`Cambiado a la banda: ${groupName}`);

    // Redireccionar al dashboard y recargar para refrescar cachés de vistas
    window.location.hash = '#dashboard';
    setTimeout(() => window.location.reload(), 100);
}
window.handleActiveGroupChangeSelect = handleActiveGroupChangeSelect;

/**
 * Abre el modal de alerta cuando un usuario sin banda intenta entrar a un módulo privado.
 */
function openNoGroupAlertModal() {
    const modal = document.getElementById('modal-no-group-alert');
    if (modal) modal.classList.remove('hidden');
}
window.openNoGroupAlertModal = openNoGroupAlertModal;

/**
 * Cierra el modal de alerta de sin banda.
 */
function closeNoGroupAlertModal() {
    const modal = document.getElementById('modal-no-group-alert');
    if (modal) modal.classList.add('hidden');
}
window.closeNoGroupAlertModal = closeNoGroupAlertModal;

/**
 * Redirige al perfil desde el modal de sin banda para permitir unirse o crear una banda.
 */
function goToProfileFromNoGroupModal() {
    closeNoGroupAlertModal();
    navigateTo('profile');
}
window.goToProfileFromNoGroupModal = goToProfileFromNoGroupModal;

/**
 * Consulta la API para sincronizar las bandas activas del usuario y valida si el grupo seleccionado sigue siendo válido.
 * @returns {Promise<{hasNoGroups: boolean, userGroups: Array}>}
 */
async function syncUserGroupsAndValidateMembership() {
    if (!currentUser || currentUser.account_type === 'superadmin') {
        return { hasNoGroups: false, userGroups: [], groupChanged: false };
    }

    try {
        const res = await apiFetch('/groups');
        const userGroups = Array.isArray(res) ? res : [];
        setData('userGroups', userGroups);

        const isCurrentGroupValid = currentGroupId && userGroups.some(g => g.id == currentGroupId);
        let groupChanged = false;

        if (!isCurrentGroupValid) {
            groupChanged = true;
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
            userGroups,
            groupChanged
        };
    } catch (e) {
        console.error("Error sincronizando grupos del usuario:", e);
        const userGroups = getData('userGroups') || [];
        return {
            hasNoGroups: !Array.isArray(userGroups) || userGroups.length === 0,
            userGroups,
            groupChanged: false
        };
    }
}
window.syncUserGroupsAndValidateMembership = syncUserGroupsAndValidateMembership;

/**
 * Abre el modal global para unirse a una banda mediante código de invitación.
 */
function openJoinGroupModal() {
    const input = document.getElementById('join-group-invite-code');
    if (input) input.value = '';
    const modal = document.getElementById('modal-join-group-global');
    if (modal) modal.classList.remove('hidden');
}
window.openJoinGroupModal = openJoinGroupModal;

/**
 * Procesa la solicitud para unirse a una banda mediante código de invitación.
 * @param {Event} e
 */
async function handleJoinGroupSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const originalText = submitBtn ? submitBtn.textContent : 'Validar Código';

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

        const globalModal = document.getElementById('modal-join-group-global');
        if (globalModal) {
            globalModal.classList.add('hidden');
        }
        
        showToast(data.message || 'Te has unido a la banda con éxito.', 'success');

        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

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
window.handleJoinGroupSubmit = handleJoinGroupSubmit;

/**
 * Abre el modal global para crear una nueva banda.
 */
function openCreateGroupModal() {
    const nameInput = document.getElementById('create-group-name');
    if (nameInput) nameInput.value = '';
    const descInput = document.getElementById('create-group-description');
    if (descInput) descInput.value = '';
    const modal = document.getElementById('modal-create-group-global');
    if (modal) modal.classList.remove('hidden');
}
window.openCreateGroupModal = openCreateGroupModal;

/**
 * Procesa la creación de una nueva banda y asignación de rol líder al creador.
 * @param {Event} e
 */
async function handleCreateGroupSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const originalText = submitBtn ? submitBtn.textContent : 'Crear Banda';

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

        const globalModal = document.getElementById('modal-create-group-global');
        if (globalModal) globalModal.classList.add('hidden');

        showToast(data.message || 'Banda creada correctamente.', 'success');

        const updatedGroups = await apiFetch('/groups');
        setData('userGroups', updatedGroups);

        currentGroupId = data.group.id;
        setData('currentGroupId', currentGroupId);

        if (currentUser && currentUser.account_type !== 'superadmin') {
            currentUser.account_type = 'leader';
            setData('currentUser', currentUser);
        }

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
window.handleCreateGroupSubmit = handleCreateGroupSubmit;

/**
 * Cambia la banda activa desde el menú de la hoja inferior ("Más").
 * @param {string|number} groupId - ID de la banda seleccionada.
 */
function handleMoreMenuGroupChange(groupId) {
    setData('currentGroupId', parseInt(groupId));
    document.querySelectorAll('.content-view').forEach(p => { p.dataset.loaded = ''; });
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const panel = document.getElementById(`panel-${hash}`);
    if (panel) panel.dataset.loaded = '';
    window.location.reload();
}
window.handleMoreMenuGroupChange = handleMoreMenuGroupChange;

/**
 * Enlaza los selectores y modales de gestión de grupos.
 */
function bindGroupEvents() {
    const groupActiveSelect = document.getElementById('group-active-select');
    if (groupActiveSelect) groupActiveSelect.onchange = handleActiveGroupChangeSelect;

    const groupActiveSelectMobile = document.getElementById('group-active-select-mobile');
    if (groupActiveSelectMobile) {
        groupActiveSelectMobile.onchange = handleActiveGroupChangeSelect;
    }

    const sidebarJoinBtn = document.getElementById('sidebar-btn-join-group');
    if (sidebarJoinBtn) {
        sidebarJoinBtn.onclick = (e) => {
            e.preventDefault();
            openJoinGroupModal();
        };
    }

    const mobileMoreMenu = document.getElementById('mobile-more-menu');
    const mobileJoinBtn = document.getElementById('mobile-menu-item-join-group');
    if (mobileJoinBtn) {
        mobileJoinBtn.onclick = (e) => {
            e.preventDefault();
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden');
            openJoinGroupModal();
        };
    }

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
            if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden');
            openCreateGroupModal();
        };
    }

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
}
window.bindGroupEvents = bindGroupEvents;
