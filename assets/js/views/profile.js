/* ==========================================================================
   WorshipApp — USER PROFILE CONTROLLER (API Connected)
   ========================================================================== */

function initProfileView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    
    if (!currentUser) return;

    // Set active tab default
    showProfileTab('info');

    // Tab buttons triggers
    document.getElementById('btn-profile-tab-info').onclick = () => showProfileTab('info');
    document.getElementById('btn-profile-tab-pw').onclick = () => showProfileTab('pw');

    // Populate Fields
    document.getElementById('profile-input-name').value = currentUser.name;
    document.getElementById('profile-input-lastname').value = currentUser.lastname || '';
    document.getElementById('profile-input-username').value = currentUser.username || '';
    
    const emailInput = document.getElementById('profile-input-email');
    emailInput.value = currentUser.email || '';
    
    // Hide or disable fields according to account restrictions
    if (currentUser.account_type === 'member') {
        document.getElementById('profile-email-container').style.display = 'none';
        emailInput.required = false;
    } else {
        document.getElementById('profile-email-container').style.display = 'block';
        emailInput.required = true;
    }

    // Set Badge Role
    const roleBadge = document.getElementById('profile-system-role-badge');
    if (currentUser.account_type === 'superadmin') {
        roleBadge.textContent = 'Super Admin';
        roleBadge.className = 'badge badge-danger';
    } else {
        const userGroups = getData('userGroups') || [];
        const activeGroup = userGroups.find(g => g.id == currentGroupId);
        const userRole = activeGroup ? (activeGroup.role || 'Miembro') : 'Miembro';
        roleBadge.textContent = userRole;
        roleBadge.className = 'badge badge-primary';
    }

    // Form Submits
    document.getElementById('profile-info-form').onsubmit = handleProfileInfoSubmit;
    document.getElementById('profile-password-form').onsubmit = handleProfilePasswordSubmit;

    // Avatar Upload controls
    const uploadInput = document.getElementById('profile-avatar-upload');
    const removeAvatarBtn = document.getElementById('btn-remove-avatar');

    uploadInput.onchange = handleAvatarUpload;
    
    // Bind modal triggers
    removeAvatarBtn.onclick = () => {
        document.getElementById('modal-confirm-remove-avatar').classList.remove('hidden');
    };

    document.getElementById('btn-close-remove-avatar-modal-x').onclick = closeRemoveAvatarModal;
    document.getElementById('btn-cancel-remove-avatar').onclick = closeRemoveAvatarModal;
    document.getElementById('btn-confirm-remove-avatar').onclick = confirmRemoveAvatar;

    // Close on backdrop click
    document.getElementById('modal-confirm-remove-avatar').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirm-remove-avatar')) {
            closeRemoveAvatarModal();
        }
    };

    // Initialize Theme Accent Selector
    initAccentColorSelectors(currentUser.accentColor || 'purple');

    renderProfileAvatar();

    // Username real-time check validation
    const usernameInput = document.getElementById('profile-input-username');
    const usernameFeedback = document.getElementById('profile-username-feedback');
    const saveBtn = document.getElementById('btn-profile-save');
    let usernameCheckTimeout;

    usernameInput.oninput = function() {
        clearTimeout(usernameCheckTimeout);
        const username = this.value.trim().toLowerCase().replace('@', '');
        
        if (username === '') {
            usernameFeedback.style.display = 'none';
            usernameFeedback.className = 'field-feedback';
            saveBtn.disabled = false;
            return;
        }

        // Si es el mismo username que ya tiene el usuario, no hace falta validar en backend
        if (username === currentUser.username) {
            usernameFeedback.style.display = 'flex';
            usernameFeedback.className = 'field-feedback available';
            usernameFeedback.style.color = '';
            usernameFeedback.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Este es tu nombre de usuario actual.</span>
            `;
            saveBtn.disabled = false;
            return;
        }

        // Mostrar estado de carga
        usernameFeedback.style.display = 'flex';
        usernameFeedback.className = 'field-feedback';
        usernameFeedback.style.color = 'var(--text-muted)';
        usernameFeedback.innerHTML = `<span>Verificando disponibilidad...</span>`;
        saveBtn.disabled = true;

        usernameCheckTimeout = setTimeout(async () => {
            try {
                const data = await apiFetch(`/auth/check-username?username=${encodeURIComponent(username)}&exclude_id=${currentUser.id}`);
                
                if (data.available) {
                    usernameFeedback.className = 'field-feedback available';
                    usernameFeedback.style.color = ''; 
                    usernameFeedback.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>${data.message}</span>
                    `;
                    saveBtn.disabled = false;
                } else {
                    usernameFeedback.className = 'field-feedback unavailable';
                    usernameFeedback.style.color = ''; 
                    usernameFeedback.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        <span>${data.message}</span>
                    `;
                    saveBtn.disabled = true;
                }
            } catch (err) {
                usernameFeedback.className = 'field-feedback unavailable';
                usernameFeedback.style.color = '';
                usernameFeedback.innerHTML = `<span>Error al verificar disponibilidad.</span>`;
                saveBtn.disabled = false; 
            }
        }, 400);
    };
}

function initAccentColorSelectors(activeAccent) {
    const buttons = document.querySelectorAll('.accent-dot-btn');
    buttons.forEach(btn => {
        const accent = btn.getAttribute('data-accent');
        
        // Render checkmark if active
        if (accent === activeAccent) {
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            btn.style.boxShadow = '0 0 0 3px var(--text-main)';
        } else {
            btn.innerHTML = '';
            btn.style.boxShadow = 'none';
        }

        // Click handler
        btn.onclick = async () => {
            try {
                // Apply dynamic stylesheet override
                applyAccentColor(accent);
                
                // Save selection to Laravel database
                const data = await apiFetch('/user/profile', {
                    method: 'POST',
                    body: {
                        name: currentUser.name,
                        lastname: currentUser.lastname,
                        username: currentUser.username,
                        email: currentUser.email,
                        accentColor: accent
                    }
                });

                currentUser.accentColor = accent;
                setData('currentUser', currentUser);
                
                // Re-render checks
                initAccentColorSelectors(accent);
                showToast(`Tema de color cambiado a: ${btn.getAttribute('title')}`);
            } catch (err) {
                showToast("Fallo al guardar preferencia de color en el servidor.", "danger");
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
        btnInfo.classList.add('active-tab-btn');
        btnPw.classList.remove('active-tab-btn');
        formInfo.classList.remove('hidden');
        formPw.classList.add('hidden');
    } else {
        btnPw.classList.add('active-tab-btn');
        btnInfo.classList.remove('active-tab-btn');
        formPw.classList.remove('hidden');
        formInfo.classList.add('hidden');
    }
}

function renderProfileAvatar() {
    const currentUser = getData('currentUser');
    const container = document.getElementById('profile-avatar-container');
    const removeBtn = document.getElementById('btn-remove-avatar');
    
    const nameStr = `${currentUser.name} ${currentUser.lastname || ''}`.trim();
    const initials = getInitials(nameStr);
    
    document.getElementById('profile-full-name').textContent = nameStr;

    if (currentUser.avatar) {
        container.style.backgroundImage = `url('${getAvatarUrl(currentUser.avatar)}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundColor = 'transparent';
        container.textContent = '';
        removeBtn.style.display = 'inline-flex';
    } else {
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = getAvatarBgColor(nameStr);
        container.textContent = initials;
        removeBtn.style.display = 'none';
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
    const email = document.getElementById('profile-input-email').value.trim();

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

        // Update Sidebar name
        document.getElementById('sidebar-user-name').textContent = `${user.name} ${user.lastname || ''}`.trim();
        renderProfileAvatar();
        
        showToast("Perfil actualizado correctamente", "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleProfilePasswordSubmit(e) {
    e.preventDefault();
    const newPw = document.getElementById('profile-pw-new').value;
    const confirmPw = document.getElementById('profile-pw-confirm').value;

    if (newPw !== confirmPw) {
        showToast("Las nuevas contraseñas no coinciden.", "warning");
        return;
    }

    try {
        await apiFetch('/auth/change-password', {
            method: 'POST',
            body: { 
                password: newPw, 
                password_confirmation: confirmPw 
            }
        });

        document.getElementById('profile-password-form').reset();
        showToast("Contraseña cambiada exitosamente", "success");
        
        // Return to default tab
        showProfileTab('info');
    } catch (err) {
        showToast(err.message, "danger");
    }
}

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
