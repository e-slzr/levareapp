/* ==========================================================================
   WorshipApp — USER PROFILE CONTROLLER (API Connected)
   ========================================================================== */

function initProfileView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    
    if (!currentUser) return;

    // Ensure forms inside modals are visible when modal opens



    // Populate Fields if present
    const nameInput = document.getElementById('profile-input-name');
    if (nameInput) nameInput.value = currentUser.name;
    const lastnameInput = document.getElementById('profile-input-lastname');
    if (lastnameInput) lastnameInput.value = currentUser.lastname || '';
    const usernameInput = document.getElementById('profile-input-username');
    if (usernameInput) usernameInput.value = currentUser.username || '';
    
    const emailInput = document.getElementById('profile-input-email');
    if (emailInput) {
        emailInput.value = currentUser.email || '';
        const emailContainer = document.getElementById('profile-email-container');
        if (emailContainer) {
            emailContainer.style.display = 'block';
        }
    }

    // Render profile header card details
    const profileNameElem = document.getElementById('profile-full-name') || document.getElementById('profile-user-name');
    if (profileNameElem) profileNameElem.textContent = `${currentUser.name} ${currentUser.lastname || ''}`.trim();

    // System role badge (SUPERADMIN / LÍDER / MIEMBRO)
    const roleBadgeElem = document.getElementById('profile-system-role-badge');
    if (roleBadgeElem) {
        if (currentUser.account_type === 'superadmin') {
            roleBadgeElem.textContent = 'SUPERADMIN';
            roleBadgeElem.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800/60 uppercase';
        } else if (currentUser.account_type === 'leader') {
            roleBadgeElem.textContent = 'LÍDER';
            roleBadgeElem.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 uppercase';
        } else {
            roleBadgeElem.textContent = 'MIEMBRO';
            roleBadgeElem.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 uppercase';
        }
    }
    
    const profileDetailsElem = document.getElementById('profile-user-details');
    const userGroups = getData('userGroups') || [];
    const activeGroup = userGroups.find(g => g.id == currentGroupId);
    const activeGroupName = activeGroup ? activeGroup.name : 'Sin Banda';
    const activeRole = activeGroup && activeGroup.role ? activeGroup.role : 'Sin rol musical';

    // Role-specific sections visibility
    const bandSection = document.getElementById('profile-band-management-section');
    const bandMembersRow = document.getElementById('profile-band-members-row');
    const feedbackRow = document.getElementById('profile-feedback-row');

    if (currentUser.account_type === 'superadmin') {
        if (bandSection) bandSection.classList.add('hidden');
        if (bandMembersRow) bandMembersRow.classList.add('hidden');
        if (feedbackRow) feedbackRow.classList.add('hidden');
        if (profileDetailsElem) profileDetailsElem.textContent = 'Super Administrador • Plataforma Levare';
    } else {
        if (bandSection) bandSection.classList.remove('hidden');
        if (bandMembersRow) bandMembersRow.classList.remove('hidden');
        if (feedbackRow) feedbackRow.classList.remove('hidden');
        if (profileDetailsElem) profileDetailsElem.textContent = `Banda ${activeGroupName} • Rol: ${activeRole}`;
    }

    // Render avatar photo / initials
    const profileAvatarBox = document.getElementById('profile-avatar-container') || document.getElementById('profile-avatar-box');
    if (profileAvatarBox) {
        const initials = getInitials(`${currentUser.name} ${currentUser.lastname || ''}`);
        if (currentUser.avatar) {
            profileAvatarBox.style.backgroundImage = `url('${getAvatarUrl(currentUser.avatar)}')`;
            profileAvatarBox.style.backgroundSize = 'cover';
            profileAvatarBox.style.backgroundPosition = 'center';
            profileAvatarBox.style.backgroundColor = 'transparent';
            profileAvatarBox.textContent = '';
        } else {
            profileAvatarBox.style.backgroundImage = 'none';
            profileAvatarBox.style.backgroundColor = getAvatarBgColor(`${currentUser.name} ${currentUser.lastname || ''}`);
            profileAvatarBox.textContent = initials;
        }
    }

    // Refresh group selector dropdowns
    if (currentUser.account_type !== 'superadmin' && typeof renderWorkspaceGroupSelector === 'function') {
        renderWorkspaceGroupSelector(userGroups);
    }

    // Initialize Accent Color Selectors
    const activeAccent = currentUser.accentColor || currentUser.accent_color || 'purple';
    initAccentColorSelectors(activeAccent);

    // Sync Theme Switch state & Push Notifications state
    const currentTheme = localStorage.getItem('worship_theme') || 'dark';
    if (typeof applyTheme === 'function') {
        applyTheme(currentTheme);
    }
    if (typeof syncPushNotificationState === 'function') {
        syncPushNotificationState();
    }



    // Form Submits
    const formInfo = document.getElementById('profile-info-form');
    if (formInfo) formInfo.onsubmit = handleProfileInfoSubmit;

    const formPw = document.getElementById('profile-password-form');
    if (formPw) formPw.onsubmit = handleProfilePasswordSubmit;

    // Avatar Upload controls
    const uploadInput = document.getElementById('profile-avatar-upload');
    if (uploadInput) uploadInput.onchange = handleAvatarUpload;

    const removeAvatarBtn = document.getElementById('btn-remove-avatar');
    if (removeAvatarBtn) {
        removeAvatarBtn.onclick = () => {
            const modal = document.getElementById('modal-confirm-remove-avatar');
            if (modal) modal.classList.remove('hidden');
        };
    }

    const closeRemoveX = document.getElementById('btn-close-remove-avatar-modal-x');
    if (closeRemoveX) closeRemoveX.onclick = closeRemoveAvatarModal;

    const cancelRemoveBtn = document.getElementById('btn-cancel-remove-avatar');
    if (cancelRemoveBtn) cancelRemoveBtn.onclick = closeRemoveAvatarModal;

    const confirmRemoveBtn = document.getElementById('btn-confirm-remove-avatar');
    if (confirmRemoveBtn) confirmRemoveBtn.onclick = confirmRemoveAvatar;

    // Close on backdrop click
    const modalRemoveAvatar = document.getElementById('modal-confirm-remove-avatar');
    if (modalRemoveAvatar) {
        modalRemoveAvatar.onclick = (e) => {
            if (e.target === modalRemoveAvatar) {
                closeRemoveAvatarModal();
            }
        };
    }


    // Initialize Theme Accent Selector
    initAccentColorSelectors(currentUser.accentColor || 'purple');

    renderProfileAvatar();

    // Username real-time check validation
    const usernameFeedback = document.getElementById('profile-username-feedback');
    const saveBtn = document.getElementById('btn-profile-save');
    let usernameCheckTimeout;

    if (usernameInput) {

        usernameInput.oninput = function() {
            clearTimeout(usernameCheckTimeout);
            const username = this.value.trim().toLowerCase().replace('@', '');
            
            if (username === '') {
                if (usernameFeedback) {
                    usernameFeedback.style.display = 'none';
                    usernameFeedback.className = 'field-feedback';
                }
                if (saveBtn) saveBtn.disabled = false;
                return;
            }

            // Si es el mismo username que ya tiene el usuario, no hace falta validar en backend
            if (username === currentUser.username) {
                if (usernameFeedback) {
                    usernameFeedback.style.display = 'flex';
                    usernameFeedback.className = 'field-feedback available';
                    usernameFeedback.style.color = '';
                    usernameFeedback.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Este es tu nombre de usuario actual.</span>
                    `;
                }
                if (saveBtn) saveBtn.disabled = false;
                return;
            }

            // Mostrar estado de carga
            if (usernameFeedback) {
                usernameFeedback.style.display = 'flex';
                usernameFeedback.className = 'field-feedback';
                usernameFeedback.style.color = 'var(--text-muted)';
                usernameFeedback.innerHTML = `<span>Verificando disponibilidad...</span>`;
            }
            if (saveBtn) saveBtn.disabled = true;

            usernameCheckTimeout = setTimeout(async () => {
                try {
                    const data = await apiFetch(`/auth/check-username?username=${encodeURIComponent(username)}&exclude_id=${currentUser.id}`);
                    
                    if (data.available) {
                        if (usernameFeedback) {
                            usernameFeedback.className = 'field-feedback available';
                            usernameFeedback.style.color = ''; 
                            usernameFeedback.innerHTML = `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>${data.message}</span>
                            `;
                        }
                        if (saveBtn) saveBtn.disabled = false;
                    } else {
                        if (usernameFeedback) {
                            usernameFeedback.className = 'field-feedback unavailable';
                            usernameFeedback.style.color = ''; 
                            usernameFeedback.innerHTML = `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                <span>${data.message}</span>
                            `;
                        }
                        if (saveBtn) saveBtn.disabled = true;
                    }
                } catch (err) {
                    if (usernameFeedback) {
                        usernameFeedback.className = 'field-feedback unavailable';
                        usernameFeedback.style.color = '';
                        usernameFeedback.innerHTML = `<span>Error al verificar disponibilidad.</span>`;
                    }
                    if (saveBtn) saveBtn.disabled = false; 
                }
            }, 400);
        };
    }

    // Sync Web Push Notifications switch state
    if (typeof syncPushNotificationState === 'function') {
        syncPushNotificationState();
    }
}



function initAccentColorSelectors(activeAccent) {
    const buttons = document.querySelectorAll('.accent-dot-btn');
    if (!buttons || buttons.length === 0) return;

    buttons.forEach(btn => {
        const accent = btn.getAttribute('data-accent');
        const isWhite = accent === 'white';
        const checkColor = isWhite ? 'text-zinc-900' : 'text-white';
        
        // Render checkmark and ring if active
        if (accent === activeAccent) {
            btn.innerHTML = `<svg class="w-3.5 h-3.5 ${checkColor} pointer-events-none drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            btn.className = `accent-dot-btn w-6 h-6 rounded-full flex items-center justify-center transition scale-110 cursor-pointer ring-2 ring-offset-2 ring-zinc-900 dark:ring-white ring-offset-white dark:ring-offset-zinc-900 shadow-md ${isWhite ? 'bg-zinc-200 dark:bg-zinc-100 border border-zinc-400 dark:border-zinc-300' : btn.className.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`;
        } else {
            btn.innerHTML = '';
            btn.className = `accent-dot-btn w-6 h-6 rounded-full flex items-center justify-center transition hover:scale-110 cursor-pointer shadow-sm ${isWhite ? 'bg-zinc-200 dark:bg-zinc-100 border border-zinc-400 dark:border-zinc-300' : btn.className.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`;
        }

        // Click handler
        btn.onclick = async () => {
            const user = getData('currentUser');
            if (!user) return;

            try {
                // Apply dynamic theme immediately
                applyAccentColor(accent);
                
                // Save selection to backend
                await apiFetch('/user/profile', {
                    method: 'POST',
                    body: {
                        name: user.name,
                        lastname: user.lastname || '',
                        username: user.username,
                        email: user.email || '',
                        accentColor: accent
                    }
                });

                user.accentColor = accent;
                user.accent_color = accent;
                setData('currentUser', user);
                
                // Re-render checks
                initAccentColorSelectors(accent);
                showToast(`Color de énfasis: ${btn.getAttribute('title') || accent}`, "success");
            } catch (err) {
                console.error("Error saving accent color:", err);
                showToast("Fallo al guardar preferencia de color.", "danger");
            }
        };
    });
}


function showProfileTab(tabName) {
    const btnInfo = document.getElementById('btn-profile-tab-info');
    const btnPw = document.getElementById('btn-profile-tab-pw');
    const formInfo = document.getElementById('profile-info-form');
    const formPw = document.getElementById('profile-password-form');

    if (tabName === 'info') {
        if (btnInfo) btnInfo.classList.add('active-tab-btn');
        if (btnPw) btnPw.classList.remove('active-tab-btn');
        if (formInfo) formInfo.classList.remove('hidden');
        if (formPw) formPw.classList.add('hidden');
    } else {
        if (btnPw) btnPw.classList.add('active-tab-btn');
        if (btnInfo) btnInfo.classList.remove('active-tab-btn');
        if (formPw) formPw.classList.remove('hidden');
        if (formInfo) formInfo.classList.add('hidden');
    }
}


function renderProfileAvatar() {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    const container = document.getElementById('profile-avatar-container') || document.getElementById('profile-avatar-box');
    const removeBtn = document.getElementById('btn-remove-avatar');
    const nameElem = document.getElementById('profile-full-name') || document.getElementById('profile-user-name');
    
    const nameStr = `${currentUser.name} ${currentUser.lastname || ''}`.trim();
    const initials = getInitials(nameStr);
    
    if (nameElem) nameElem.textContent = nameStr;

    if (container) {
        if (currentUser.avatar) {
            container.style.backgroundImage = `url('${getAvatarUrl(currentUser.avatar)}')`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.style.backgroundColor = 'transparent';
            container.textContent = '';
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        } else {
            container.style.backgroundImage = 'none';
            container.style.backgroundColor = getAvatarBgColor(nameStr);
            container.textContent = initials;
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }
}


async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("Por favor sube una imagen válida", "danger");
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showToast("La imagen es demasiado grande. Límite: 2MB.", "warning");
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    // Show uploading state
    const uploadBtn = document.getElementById('btn-upload-avatar');
    if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.textContent = 'Subiendo...'; }

    try {
        const data = await apiFetch('/user/profile/avatar', {
            method: 'POST',
            body: formData
        });

        // Re-read from storage to avoid stale closure
        let user = getData('currentUser');
        user.avatar = data.avatar_url;
        setData('currentUser', user);

        renderProfileAvatar();

        // Update sidebar avatar
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.style.backgroundImage = `url('${getAvatarUrl(data.avatar_url)}')`;
            sidebarAvatar.style.backgroundSize = 'cover';
            sidebarAvatar.style.backgroundPosition = 'center';
            sidebarAvatar.style.backgroundColor = 'transparent';
            sidebarAvatar.textContent = '';
        }

        // Reset file input so user can re-upload same file later
        e.target.value = '';

        showToast("Foto de perfil actualizada", "success");
    } catch (err) {
        showToast(err.message || "Error al subir la foto de perfil.", "danger");
    } finally {
        if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.textContent = 'Cambiar Foto'; }
    }
}

async function handleProfileInfoSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('profile-input-name').value.trim();
    const lastname = document.getElementById('profile-input-lastname').value.trim();
    const username = document.getElementById('profile-input-username').value.trim().toLowerCase().replace('@', '');
    const email = document.getElementById('profile-input-email')?.value.trim() || '';

    // Always read fresh from storage
    let user = getData('currentUser');

    try {
        const data = await apiFetch('/user/profile', {
            method: 'POST',
            body: { 
                name, 
                lastname, 
                username, 
                email,
                accentColor: user.accentColor || 'purple'
            }
        });

        user = data.user;
        setData('currentUser', user);

        // Update Sidebar and Profile display names
        const sidebarName = document.getElementById('sidebar-user-name');
        if (sidebarName) sidebarName.textContent = `${user.name} ${user.lastname || ''}`.trim();
        
        renderProfileAvatar();
        closeEditProfileModal();
        
        showToast("Perfil actualizado correctamente", "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleProfilePasswordSubmit(e) {
    e.preventDefault();
    const currentPw = document.getElementById('profile-input-current-password')?.value || '';
    const newPw = document.getElementById('profile-pw-new').value;
    const confirmPw = document.getElementById('profile-pw-confirm').value;

    const pwdError = typeof validatePasswordRules === 'function' 
        ? validatePasswordRules(newPw) 
        : (newPw.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : null);
        
    if (pwdError) {
        showToast(pwdError, "warning");
        return;
    }

    if (newPw !== confirmPw) {
        showToast("Las nuevas contraseñas no coinciden.", "warning");
        return;
    }

    try {
        await apiFetch('/auth/change-password', {
            method: 'POST',
            body: { 
                current_password: currentPw,
                password: newPw, 
                password_confirmation: confirmPw 
            }
        });

        document.getElementById('profile-password-form').reset();
        closeChangePasswordModal();
        showToast("Contraseña cambiada exitosamente", "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// --- Profile & Password Modal Dialog Helpers ---
function openEditProfileModal() {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    const formInfo = document.getElementById('profile-info-form');
    if (formInfo) formInfo.classList.remove('hidden');

    const nameInput = document.getElementById('profile-input-name');
    if (nameInput) nameInput.value = currentUser.name;
    const lastnameInput = document.getElementById('profile-input-lastname');
    if (lastnameInput) lastnameInput.value = currentUser.lastname || '';
    const usernameInput = document.getElementById('profile-input-username');
    if (usernameInput) usernameInput.value = currentUser.username || '';
    
    const emailInput = document.getElementById('profile-input-email');
    if (emailInput) {
        emailInput.value = currentUser.email || '';
        const emailContainer = document.getElementById('profile-email-container');
        if (emailContainer) {
            emailContainer.style.display = 'block';
        }
    }

    const modal = document.getElementById('modal-edit-profile');
    if (modal) modal.classList.remove('hidden');
}

function closeEditProfileModal() {
    const modal = document.getElementById('modal-edit-profile');
    if (modal) modal.classList.add('hidden');
}

function openChangePasswordModal() {
    const formPw = document.getElementById('profile-password-form');
    if (formPw) {
        formPw.classList.remove('hidden');
        formPw.reset();
    }
    const check = document.getElementById('toggle-show-passwords');
    if (check) {
        check.checked = false;
        toggleProfileModalPasswords(false);
    }
    const modal = document.getElementById('modal-change-password');
    if (modal) modal.classList.remove('hidden');
}

function closeChangePasswordModal() {
    const modal = document.getElementById('modal-change-password');
    if (modal) modal.classList.add('hidden');
}

function toggleProfileModalPasswords(show) {
    const type = show ? 'text' : 'password';
    ['profile-input-current-password', 'profile-pw-new', 'profile-pw-confirm'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.type = type;
    });
}
window.toggleProfileModalPasswords = toggleProfileModalPasswords;

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.togglePasswordVisibility = togglePasswordVisibility;


// --- Remove Avatar Modal Flow ---
function closeRemoveAvatarModal() {
    document.getElementById('modal-confirm-remove-avatar').classList.add('hidden');
}

async function confirmRemoveAvatar() {
    const btn = document.getElementById('btn-confirm-remove-avatar');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
        await apiFetch('/user/profile/avatar', {
            method: 'DELETE'
        });
        
        // Read fresh from storage
        let user = getData('currentUser');
        user.avatar = null;
        setData('currentUser', user);
        
        renderProfileAvatar();
        
        // Update sidebar avatar
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        if (sidebarAvatar) {
            const nameStr = `${user.name} ${user.lastname || ''}`.trim();
            sidebarAvatar.style.backgroundImage = 'none';
            sidebarAvatar.style.backgroundColor = getAvatarBgColor(nameStr);
            sidebarAvatar.textContent = getInitials(nameStr);
        }
        
        closeRemoveAvatarModal();
        showToast("Foto de perfil eliminada", "success");
    } catch (err) {
        showToast(err.message || "Error al eliminar la foto.", "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Eliminar Foto';
    }
}

// --- Sobre Levare Modal Flow ---
function openAboutLevareModal() {
    const modal = document.getElementById('modal-about-levare');
    if (modal) modal.classList.remove('hidden');
}

function closeAboutLevareModal() {
    const modal = document.getElementById('modal-about-levare');
    if (modal) modal.classList.add('hidden');
}

