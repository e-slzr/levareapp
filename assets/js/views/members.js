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

    // Real-time username validation in Members Modal
    const memberUsernameInput = document.getElementById('member-form-username');
    const memberUsernameFeedback = document.getElementById('member-username-feedback');
    const memberSubmitBtn = document.getElementById('btn-member-submit');
    let memberUsernameCheckTimeout;

    memberUsernameInput.oninput = function() {
        if (this.disabled) return; // No validar si está deshabilitado (edición)

        clearTimeout(memberUsernameCheckTimeout);
        const username = this.value.trim().toLowerCase().replace('@', '');
        
        if (username === '') {
            memberUsernameFeedback.style.display = 'none';
            memberUsernameFeedback.className = 'field-feedback';
            memberSubmitBtn.disabled = false;
            return;
        }

        // Mostrar estado de carga
        memberUsernameFeedback.style.display = 'flex';
        memberUsernameFeedback.className = 'field-feedback';
        memberUsernameFeedback.style.color = 'var(--text-muted)';
        memberUsernameFeedback.innerHTML = `<span>Verificando disponibilidad...</span>`;
        memberSubmitBtn.disabled = true;

        memberUsernameCheckTimeout = setTimeout(async () => {
            try {
                const data = await apiFetch(`/auth/check-username?username=${encodeURIComponent(username)}`);
                
                if (data.available) {
                    memberUsernameFeedback.className = 'field-feedback available';
                    memberUsernameFeedback.style.color = '';
                    memberUsernameFeedback.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>${data.message}</span>
                    `;
                    memberSubmitBtn.disabled = false;
                } else {
                    memberUsernameFeedback.className = 'field-feedback unavailable';
                    memberUsernameFeedback.style.color = '';
                    memberUsernameFeedback.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span>${data.message}</span>
                    `;
                    memberSubmitBtn.disabled = true;
                }
            } catch (err) {
                memberUsernameFeedback.className = 'field-feedback unavailable';
                memberUsernameFeedback.style.color = '';
                memberUsernameFeedback.innerHTML = `<span>Error al verificar disponibilidad.</span>`;
                memberSubmitBtn.disabled = false;
            }
        }, 400);
    };

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
            const avatarUrl = getAvatarUrl(u.avatar);
            avatarStyle = `background-image: url('${avatarUrl}'); background-size: cover; background-position: center;`;
        }

        let adminActions = '';
        const isLeaderUser = u.account_type === 'leader' || u.account_type === 'superadmin';
        if (editAllowed) {
            // Cannot delete protected Leader system user
            adminActions = `
                <div class="member-actions-row">
                    <button class="member-action-btn btn-reset-pw cursor-pointer" data-id="${u.id}" title="Restablecer Contraseña">
                        <i class="fa-solid fa-key text-xs pointer-events-none"></i>
                    </button>
                    <button class="member-action-btn btn-edit-member cursor-pointer" data-id="${u.id}" title="Editar Integrante">
                        <i class="fa-solid fa-user-pen text-xs pointer-events-none"></i>
                    </button>
                    ${!isLeaderUser ? `
                    <button class="member-action-btn danger btn-delete-member cursor-pointer" data-id="${u.id}" title="Eliminar del Grupo">
                        <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                    </button>` : ''}
                </div>
            `;

        }

        const loginHandle = u.email ? u.email : `@${u.username}`;
        const systemRoleBadge = isLeaderUser ? '<span class="inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">Líder</span>' : '';

        const primaryRole = u.role || (Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : '');
        const secondaryRoles = (Array.isArray(u.roles) ? u.roles : []).filter(r => r !== primaryRole);

        let rolesHTML = '';
        if (primaryRole) {
            const extraCount = secondaryRoles.length;
            const extraBadge = extraCount > 0 
                ? `<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/80 cursor-help flex-shrink-0" title="Roles adicionales: ${secondaryRoles.join(', ')}">+${extraCount}</span>` 
                : '';
            rolesHTML = `
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold text-xs uppercase truncate max-w-[135px]" title="${primaryRole}">
                        <i class="fa-solid fa-star text-[10px]"></i>
                        <span>${primaryRole}</span>
                    </span>
                    ${extraBadge}
                </div>
            `;
        } else {
            rolesHTML = `<p style="color: var(--text-muted); font-weight:600; font-size:0.75rem; text-transform:uppercase; margin-top:2px;">Sin rol musical</p>`;
        }

        card.innerHTML = `
            <div class="member-info-wrapper">
                <div class="avatar" style="${avatarStyle}">${u.avatar ? '' : initials}</div>
                <div class="member-details">
                    <div class="flex items-center gap-1.5">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">${nameStr}</h4>
                        ${systemRoleBadge}
                    </div>
                    ${rolesHTML}
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

let cachedGroupRoles = [];
let modalSelectedRoles = [];
let modalPrimaryRole = '';

async function loadGroupRoles(forceRefresh = false) {
    if (forceRefresh || cachedGroupRoles.length === 0) {
        try {
            cachedGroupRoles = await apiFetch('/members/roles') || [];
        } catch (e) {
            console.error("Error loading group roles:", e);
            cachedGroupRoles = [];
        }
    }
    return cachedGroupRoles;
}

function renderMemberRolesSelector() {
    const container = document.getElementById('member-roles-selector-container');
    if (!container) return;

    container.innerHTML = '';

    if (cachedGroupRoles.length === 0) {
        container.innerHTML = `<span class="text-xs text-zinc-400 italic">No hay roles musicales creados en esta banda. Ve a "Gestionar Roles" para crearlos.</span>`;
        return;
    }

    cachedGroupRoles.forEach(r => {
        const isSelected = modalSelectedRoles.includes(r);
        const isPrimary = isSelected && modalPrimaryRole === r;

        if (!isSelected) {
            // Chip no seleccionado
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer';
            btn.innerHTML = `<i class="fa-solid fa-plus text-[10px] text-zinc-400"></i> <span>${r}</span>`;
            btn.onclick = () => {
                modalSelectedRoles.push(r);
                if (!modalPrimaryRole) {
                    modalPrimaryRole = r;
                }
                renderMemberRolesSelector();
            };
            container.appendChild(btn);
        } else if (isPrimary) {
            // Chip seleccionado y marcado como principal
            const chip = document.createElement('div');
            chip.className = 'px-2.5 py-1 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-500 dark:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm';
            chip.innerHTML = `
                <i class="fa-solid fa-star text-amber-400 text-[11px]" title="Rol Principal"></i>
                <span>${r}</span>
                <span class="text-[9px] uppercase px-1 py-0.5 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 font-extrabold tracking-wider">Principal</span>
                <button type="button" class="btn-remove-role ml-1 text-zinc-400 hover:text-red-500 transition text-sm font-bold leading-none cursor-pointer" title="Quitar rol">&times;</button>
            `;
            chip.querySelector('.btn-remove-role').onclick = (e) => {
                e.stopPropagation();
                modalSelectedRoles = modalSelectedRoles.filter(x => x !== r);
                modalPrimaryRole = modalSelectedRoles.length > 0 ? modalSelectedRoles[0] : '';
                renderMemberRolesSelector();
            };
            container.appendChild(chip);
        } else {
            // Chip seleccionado secundario
            const chip = document.createElement('div');
            chip.className = 'px-2.5 py-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5';
            chip.innerHTML = `
                <button type="button" class="btn-make-primary text-zinc-400 hover:text-amber-400 transition cursor-pointer" title="Marcar como rol principal">
                    <i class="fa-regular fa-star text-[11px]"></i>
                </button>
                <span>${r}</span>
                <button type="button" class="btn-remove-role ml-1 text-zinc-400 hover:text-red-500 transition text-sm font-bold leading-none cursor-pointer" title="Quitar rol">&times;</button>
            `;
            chip.querySelector('.btn-make-primary').onclick = (e) => {
                e.stopPropagation();
                modalPrimaryRole = r;
                renderMemberRolesSelector();
            };
            chip.querySelector('.btn-remove-role').onclick = (e) => {
                e.stopPropagation();
                modalSelectedRoles = modalSelectedRoles.filter(x => x !== r);
                if (modalPrimaryRole === r) {
                    modalPrimaryRole = modalSelectedRoles.length > 0 ? modalSelectedRoles[0] : '';
                }
                renderMemberRolesSelector();
            };
            container.appendChild(chip);
        }
    });
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

    modalSelectedRoles = [];
    modalPrimaryRole = '';
    await loadGroupRoles(true);
    renderMemberRolesSelector();

    // Reset username validation feedback
    const memberFeedback = document.getElementById('member-username-feedback');
    memberFeedback.style.display = 'none';
    memberFeedback.className = 'field-feedback';
    memberFeedback.innerHTML = '';
    document.getElementById('btn-member-submit').disabled = false;

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

    // Load roles & populate selector
    modalPrimaryRole = u.role || '';
    modalSelectedRoles = Array.isArray(u.roles) ? [...u.roles] : (u.role ? [u.role] : []);
    if (modalPrimaryRole && !modalSelectedRoles.includes(modalPrimaryRole)) {
        modalSelectedRoles.unshift(modalPrimaryRole);
    }
    if (!modalPrimaryRole && modalSelectedRoles.length > 0) {
        modalPrimaryRole = modalSelectedRoles[0];
    }
    await loadGroupRoles(true);
    renderMemberRolesSelector();

    // Select system permission role
    const systemRoleSelect = document.getElementById('member-form-system-role');
    const systemRole = u.account_type || (u.role === 'Líder' ? 'leader' : 'member');
    systemRoleSelect.value = (systemRole === 'leader' || systemRole === 'superadmin') ? 'leader' : 'member';
    
    // Protect self-demotion or modifying superadmin from the member modal
    if (currentUser && u.id == currentUser.id) {
        systemRoleSelect.disabled = true;
        systemRoleSelect.title = "No puedes cambiar tu propio rol de sistema.";
    } else if (u.account_type === 'superadmin') {
        systemRoleSelect.disabled = true;
        systemRoleSelect.title = "El Super Admin no puede ser modificado aquí.";
    } else {
        systemRoleSelect.disabled = false;
        systemRoleSelect.title = "";
    }

    // Hide password fields when editing existing members
    document.getElementById('member-form-password-group').style.display = 'none';
    document.getElementById('member-form-password').required = false;

    // Reset username validation feedback
    const memberFeedback = document.getElementById('member-username-feedback');
    memberFeedback.style.display = 'none';
    memberFeedback.className = 'field-feedback';
    memberFeedback.innerHTML = '';
    document.getElementById('btn-member-submit').disabled = false;

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
    const system_role = document.getElementById('member-form-system-role').value;

    const primaryRole = modalPrimaryRole || (modalSelectedRoles.length > 0 ? modalSelectedRoles[0] : null);
    const roles = modalSelectedRoles;

    try {
        if (id) {
            // Update member
            await apiFetch(`/members/${id}`, {
                method: 'PUT',
                body: { name, lastname, email, username, role: primaryRole, roles, system_role }
            });
            showToast("Integrante actualizado correctamente", "success");
        } else {
            // Add new member
            const password = document.getElementById('member-form-password').value;
            await apiFetch('/members', {
                method: 'POST',
                body: { name, lastname, email, username, role: primaryRole, roles, system_role, password }
            });
            showToast("Integrante sumado con éxito", "success");
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


