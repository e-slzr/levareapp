/* ==========================================================================
   WorshipApp — MEMBERS & ROLES CONTROLLER (API Connected)
   ========================================================================== */

let cachedMembers = [];

function initMembersView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    const editAllowed = canEdit();

    // Toggle actions buttons visibility
    const addMemberBtn = document.getElementById('btn-add-member');
    const manageRolesBtn = document.getElementById('btn-manage-roles');
    
    if (editAllowed) {
        addMemberBtn.style.display = 'inline-flex';
        addMemberBtn.onclick = () => openAddMemberModal();

        manageRolesBtn.style.display = 'inline-flex';
        manageRolesBtn.onclick = openManageRolesModal;
    } else {
        addMemberBtn.style.display = 'none';
        manageRolesBtn.style.display = 'none';
    }

    // Close buttons for modals
    document.querySelectorAll('#modal-member .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-member').classList.add('hidden');
    });
    document.getElementById('btn-close-member-modal-x').onclick = () => {
        document.getElementById('modal-member').classList.add('hidden');
    };

    document.querySelectorAll('#modal-reset-password .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-reset-password').classList.add('hidden');
    });
    document.getElementById('btn-close-reset-password-modal-x').onclick = () => {
        document.getElementById('modal-reset-password').classList.add('hidden');
    };
    document.getElementById('btn-close-reset-password-success-modal').onclick = () => {
        document.getElementById('modal-reset-password').classList.add('hidden');
    };
    document.getElementById('btn-confirm-reset-password').onclick = handleResetPasswordSubmit;
    document.getElementById('btn-copy-member-generated-password').onclick = copyGeneratedMemberPassword;

    document.querySelectorAll('#modal-manage-roles .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-manage-roles').classList.add('hidden');
    });
    document.getElementById('btn-close-manage-roles-modal-x').onclick = () => {
        document.getElementById('modal-manage-roles').classList.add('hidden');
    };

    // Close buttons for reset invite code confirmation modal
    document.querySelectorAll('#modal-confirm-reset-invite-code .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-confirm-reset-invite-code').classList.add('hidden');
    });
    document.getElementById('btn-close-reset-invite-code-modal-x').onclick = () => {
        document.getElementById('modal-confirm-reset-invite-code').classList.add('hidden');
    };

    // Close buttons for confirm delete member modal
    document.querySelectorAll('#modal-confirm-delete-member .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-confirm-delete-member').classList.add('hidden');
    });
    document.getElementById('btn-close-delete-member-modal-x').onclick = () => {
        document.getElementById('modal-confirm-delete-member').classList.add('hidden');
    };
    document.getElementById('btn-confirm-delete-member').onclick = confirmDeleteMember;

    // Close buttons for confirm delete role modal
    document.querySelectorAll('#modal-confirm-delete-role .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-confirm-delete-role').classList.add('hidden');
    });
    document.getElementById('btn-close-delete-role-modal-x').onclick = () => {
        document.getElementById('modal-confirm-delete-role').classList.add('hidden');
    };
    document.getElementById('btn-confirm-delete-role').onclick = confirmDeleteRole;

    // Close on backdrop clicks
    document.getElementById('modal-confirm-delete-member').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-delete-member')) {
            document.getElementById('modal-confirm-delete-member').classList.add('hidden');
        }
    };
    document.getElementById('modal-confirm-delete-role').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-delete-role')) {
            document.getElementById('modal-confirm-delete-role').classList.add('hidden');
        }
    };

    // --- Invite Code Card (visible only for Líderes) ---
    const userGroups = getData('userGroups') || [];
    const activeGroup = userGroups.find(g => g.id == currentGroupId);
    const inviteCodeCard = document.getElementById('invite-code-card');
    const inviteCodeDisplay = document.getElementById('invite-code-display');

    if (editAllowed && activeGroup && activeGroup.invite_code) {
        const code = activeGroup.invite_code;
        inviteCodeDisplay.textContent = code;
        inviteCodeCard.classList.remove('hidden');

        // Copy to clipboard
        document.getElementById('btn-copy-invite-code').onclick = async () => {
            try {
                await navigator.clipboard.writeText(code);
                showToast('¡Código copiado al portapapeles!', 'success');
            } catch {
                // Fallback for older browsers / non-HTTPS
                const el = document.createElement('textarea');
                el.value = code;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                showToast('¡Código copiado!', 'success');
            }
        };

        // Web Share API (mobile) or fallback to copy
        document.getElementById('btn-share-invite-code').onclick = async () => {
            const shareText = `Únete a mi grupo "${activeGroup.name}" en WorshipApp con el código: ${activeGroup.invite_code}`;
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'Invitación WorshipApp', text: shareText });
                } catch (err) {
                    if (err.name !== 'AbortError') showToast('No se pudo compartir.', 'danger');
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareText);
                    showToast('¡Mensaje de invitación copiado!', 'success');
                } catch {
                    showToast('Tu navegador no soporta compartir. Copia el código manualmente.', 'warning');
                }
            }
        };

        // Reset invite code
        const btnResetCode = document.getElementById('btn-reset-invite-code');
        if (btnResetCode) {
            btnResetCode.onclick = () => {
                document.getElementById('modal-confirm-reset-invite-code').classList.remove('hidden');
            };
        }

        // Confirm reset invite code action
        const btnConfirmReset = document.getElementById('btn-confirm-reset-invite-code');
        if (btnConfirmReset) {
            btnConfirmReset.onclick = async () => {
                try {
                    btnConfirmReset.disabled = true;
                    btnConfirmReset.textContent = "Procesando...";
                    
                    const res = await apiFetch(`/groups/${currentGroupId}/reset-invite-code`, {
                        method: 'POST'
                    });
                    
                    // Update layout display
                    inviteCodeDisplay.textContent = res.invite_code;
                    
                    // Update cached userGroups array
                    activeGroup.invite_code = res.invite_code;
                    setData('userGroups', userGroups);
                    
                    document.getElementById('modal-confirm-reset-invite-code').classList.add('hidden');
                    showToast(res.message || 'Código de invitación regenerado.', 'success');
                } catch (e) {
                    showToast(e.message || 'Error al regenerar código de invitación.', 'danger');
                } finally {
                    btnConfirmReset.disabled = false;
                    btnConfirmReset.textContent = "Confirmar Regeneración";
                }
            };
        }
    } else {
        inviteCodeCard.classList.add('hidden');
    }

    // Form Submissions
    document.getElementById('member-form').onsubmit = handleMemberFormSubmit;
    document.getElementById('add-role-form').onsubmit = handleAddRoleSubmit;

    renderMembers(true); // force first reload
}


async function renderMembers(forceRefresh = false) {
    const listContainer = document.getElementById('team-members-list');
    listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">Cargando directorio de miembros...</div>`;

    if (forceRefresh || cachedMembers.length === 0) {
        try {
            cachedMembers = await apiFetch('/members') || [];
        } catch (e) {
            console.error("Error loading members list:", e);
            listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--danger);">Fallo al conectar con la base de datos de integrantes.</div>`;
            return;
        }
    }

    listContainer.innerHTML = '';
    const editAllowed = canEdit();

    cachedMembers.forEach(u => {
        const card = document.createElement('div');
        card.className = 'member-card';

        const nameStr = `${u.name} ${u.lastname || ''}`.trim();
        const initials = getInitials(nameStr);
        const avatarBg = getAvatarBgColor(nameStr);

        let avatarStyle = `background: ${avatarBg};`;
        if (u.avatar) {
            avatarStyle = `background-image: url('${u.avatar}');`;
        }

        let adminActions = '';
        if (editAllowed) {
            // Cannot edit/delete protected Leader role
            const isLider = u.role === 'Líder';
            adminActions = `
                <div class="member-actions-row">
                    <button class="member-action-btn btn-reset-pw" data-id="${u.id}" title="Restablecer Contraseña">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                    <button class="member-action-btn btn-edit-member" data-id="${u.id}" title="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    ${!isLider ? `
                    <button class="member-action-btn danger btn-delete-member" data-id="${u.id}" title="Eliminar del Grupo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>` : ''}
                </div>
            `;
        }

        const loginHandle = u.email ? u.email : `@${u.username}`;

        card.innerHTML = `
            <div class="member-info-wrapper">
                <div class="avatar" style="${avatarStyle}">${u.avatar ? '' : initials}</div>
                <div class="member-details">
                    <h4>${nameStr}</h4>
                    <p style="color: var(--primary); font-weight:700; font-size:0.75rem; text-transform:uppercase;">${u.role || 'Miembro'}</p>
                    <p style="font-size:0.7rem; color:var(--text-muted); opacity: 0.8; margin-top:2px;">${loginHandle}</p>
                </div>
            </div>
            ${adminActions}
        `;

        if (editAllowed) {
            card.querySelector('.btn-reset-pw').onclick = () => openResetPasswordModal(u.id);
            card.querySelector('.btn-edit-member').onclick = () => openEditMemberModal(u.id);
            const delBtn = card.querySelector('.btn-delete-member');
            if (delBtn) {
                delBtn.onclick = () => removeMemberFromGroup(u.id, nameStr);
            }
        }

        listContainer.appendChild(card);
    });
}

async function populateRolesDropdown(selectId, selectedValue = '') {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="" disabled selected>Cargando roles...</option>';

    try {
        const roles = await apiFetch('/members/roles') || [];
        select.innerHTML = '';

        roles.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            if (selectedValue === r) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    } catch (e) {
        console.error("Error loading dropdown roles:", e);
        select.innerHTML = '<option value="">Fallo al cargar roles</option>';
    }
}

async function openAddMemberModal() {
    document.getElementById('member-modal-title').textContent = "Agregar Integrante";
    document.getElementById('member-form-id').value = "";
    document.getElementById('member-form').reset();
    document.getElementById('member-form-password-group').style.display = 'block';
    document.getElementById('member-form-password').required = true;
    
    // Enable system role dropdown select controls
    document.getElementById('member-form-system-role').disabled = false;

    // Enable basic info fields for creation
    document.getElementById('member-form-name').disabled = false;
    document.getElementById('member-form-lastname').disabled = false;
    document.getElementById('member-form-email').disabled = false;
    document.getElementById('member-form-username').disabled = false;

    await populateRolesDropdown('member-form-role');
    document.getElementById('modal-member').classList.remove('hidden');
}

async function openEditMemberModal(userId) {
    const u = cachedMembers.find(x => x.id === userId);
    if (!u) return;

    document.getElementById('member-modal-title').textContent = "Editar Integrante";
    document.getElementById('member-form-id').value = u.id;
    document.getElementById('member-form-name').value = u.name;
    document.getElementById('member-form-lastname').value = u.lastname || '';
    document.getElementById('member-form-email').value = u.email || '';
    document.getElementById('member-form-username').value = u.username || '';
    
    // Disable basic info fields to restrict leader edits
    document.getElementById('member-form-name').disabled = true;
    document.getElementById('member-form-lastname').disabled = true;
    document.getElementById('member-form-email').disabled = true;
    document.getElementById('member-form-username').disabled = true;

    // Select role inside group
    await populateRolesDropdown('member-form-role', u.role);

    // Select system permission role
    const systemRoleSelect = document.getElementById('member-form-system-role');
    systemRoleSelect.value = u.role === 'Líder' ? 'leader' : 'member';
    
    // Don't allow changing Líder permissions to member
    if (u.role === 'Líder') {
        systemRoleSelect.disabled = true;
    } else {
        systemRoleSelect.disabled = false;
    }

    // Hide password fields when editing existing members
    document.getElementById('member-form-password-group').style.display = 'none';
    document.getElementById('member-form-password').required = false;

    document.getElementById('modal-member').classList.remove('hidden');
}

async function handleMemberFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('member-form-id').value;
    const name = document.getElementById('member-form-name').value.trim();
    const lastname = document.getElementById('member-form-lastname').value.trim();
    const emailInput = document.getElementById('member-form-email').value.trim();
    const email = emailInput || null;
    const username = document.getElementById('member-form-username').value.trim().toLowerCase().replace('@', '');
    const role = document.getElementById('member-form-role').value;
    const system_role = document.getElementById('member-form-system-role').value;

    try {
        if (id) {
            // Update member
            await apiFetch(`/members/${id}`, {
                method: 'PUT',
                body: { name, lastname, email, username, role, system_role }
            });
            showToast("Integrante actualizado correctamente");
        } else {
            // Add new member
            const password = document.getElementById('member-form-password').value;
            await apiFetch('/members', {
                method: 'POST',
                body: { name, lastname, email, username, role, system_role, password }
            });
            showToast("Integrante sumado con éxito");
        }

        document.getElementById('modal-member').classList.add('hidden');
        await renderMembers(true); // force refresh list
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function removeMemberFromGroup(userId, memberName) {
    document.getElementById('delete-member-user-id').value = userId;
    document.getElementById('delete-member-user-name').textContent = memberName;
    document.getElementById('modal-confirm-delete-member').classList.remove('hidden');
}

// RESTORE PASSWORD FLOWS
function openResetPasswordModal(userId) {
    const u = cachedMembers.find(x => x.id === userId);
    if (!u) return;

    document.getElementById('reset-password-user-id').value = u.id;
    document.getElementById('reset-password-user-name').textContent = `${u.name} ${u.lastname || ''}`;
    
    // Switch steps
    document.getElementById('reset-password-confirm-step').classList.remove('hidden');
    document.getElementById('reset-password-success-step').classList.add('hidden');

    document.getElementById('modal-reset-password').classList.remove('hidden');
}

async function handleResetPasswordSubmit() {
    const userId = document.getElementById('reset-password-user-id').value;
    const btn = document.getElementById('btn-confirm-reset-password');

    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
        const res = await apiFetch(`/members/${userId}/reset-password`, {
            method: 'POST'
        });

        // Populate generated password
        document.getElementById('generated-member-temporary-password').value = res.temporary_password;

        // Switch view step
        document.getElementById('reset-password-confirm-step').classList.add('hidden');
        document.getElementById('reset-password-success-step').classList.remove('hidden');

        showToast("Contraseña restablecida con éxito.", "success");
    } catch (err) {
        showToast(err.message || "Error al restablecer contraseña.", "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = "Confirmar Restablecimiento";
    }
}

async function copyGeneratedMemberPassword() {
    const pwdInput = document.getElementById('generated-member-temporary-password');
    const pwd = pwdInput.value;
    try {
        await navigator.clipboard.writeText(pwd);
        showToast("¡Contraseña copiada al portapapeles!", "success");
    } catch {
        pwdInput.select();
        document.execCommand('copy');
        showToast("¡Contraseña copiada!", "success");
    }
}

// CUSTOM ROLES MANAGEMENT
function openManageRolesModal() {
    renderGroupRolesList();
    document.getElementById('new-role-input').value = '';
    document.getElementById('modal-manage-roles').classList.remove('hidden');
}

async function renderGroupRolesList() {
    const listContainer = document.getElementById('roles-list-container');
    listContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px;">Cargando roles...</div>';

    try {
        const roles = await apiFetch('/members/roles') || [];
        listContainer.innerHTML = '';

        roles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'role-badge-item';
            const isLider = role === 'Líder';

            div.innerHTML = `
                <span>${role}</span>
                ${!isLider ? `<button type="button" class="btn-delete-role-link" data-role="${role}">&times;</button>` : '<span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Protegido</span>'}
            `;

            if (!isLider) {
                div.querySelector('.btn-delete-role-link').onclick = () => deleteRoleFromGroup(role);
            }

            listContainer.appendChild(div);
        });
    } catch (e) {
        console.error("Error loading group roles list:", e);
        listContainer.innerHTML = '<div style="color:var(--danger); font-size:0.85rem; padding: 10px;">Fallo al cargar roles.</div>';
    }
}

async function handleAddRoleSubmit(e) {
    e.preventDefault();
    const newRole = document.getElementById('new-role-input').value.trim();
    if (!newRole) return;

    try {
        await apiFetch('/members/roles', {
            method: 'POST',
            body: { name: newRole }
        });

        document.getElementById('new-role-input').value = '';
        showToast("Rol musical añadido");
        await renderGroupRolesList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function deleteRoleFromGroup(roleName) {
    document.getElementById('delete-role-name-input').value = roleName;
    document.getElementById('delete-role-name-display').textContent = roleName;
    document.getElementById('modal-confirm-delete-role').classList.remove('hidden');
}

async function confirmDeleteMember() {
    const userId = document.getElementById('delete-member-user-id').value;
    const btn = document.getElementById('btn-confirm-delete-member');
    
    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
        await apiFetch(`/members/${userId}`, {
            method: 'DELETE'
        });
        showToast("Miembro eliminado del grupo");
        document.getElementById('modal-confirm-delete-member').classList.add('hidden');
        await renderMembers(true);
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = "Remover";
    }
}

async function confirmDeleteRole() {
    const roleName = document.getElementById('delete-role-name-input').value;
    const btn = document.getElementById('btn-confirm-delete-role');
    
    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
        await apiFetch(`/members/roles/${roleName}`, {
            method: 'DELETE'
        });

        showToast("Rol musical eliminado");
        document.getElementById('modal-confirm-delete-role').classList.add('hidden');
        await renderGroupRolesList();
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = "Eliminar Rol";
    }
}


