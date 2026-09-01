/**
 * ==============================================================================
 * Levare — Authentication & Session Management Module (auth.js)
 * ==============================================================================
 * @fileoverview Controla el ciclo de vida de autenticación del usuario:
 * - Login y registro (Líder y Miembro vía código de invitación).
 * - Enrutamiento interno entre pestañas de autenticación.
 * - Validación de políticas de contraseñas y cambio forzado de credenciales.
 * - Cierre de sesión y limpieza de estados locales.
 * - Carga interactiva del flujo de Onboarding inicial.
 * ==============================================================================
 */

/**
 * Conmuta entre las distintas pantallas secundarias del contenedor de autenticación.
 * @param {'login'|'register'|'invite'|'member-register'|'force-password'} tab
 */
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

/**
 * Valida que una contraseña cumpla con las políticas mínimas de seguridad (mínimo 8 caracteres, letras y números).
 * @param {string} pwd - Contraseña a evaluar.
 * @returns {string|null} Mensaje de error si no cumple o null si es válida.
 */
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

/**
 * Alterna la visibilidad (tipo text / password) de un campo de contraseña.
 * @param {string} inputId - Identificador del input DOM.
 * @param {HTMLElement} btn - Botón desencadenante para alternar el icono.
 */
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

/**
 * Enlaza los escuchadores de eventos para formularios y botones de navegación de autenticación.
 */
function bindAuthEvents() {
    // Enlaces de navegación entre pantallas de Auth
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

    // Formularios principales de autenticación
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

    // Modales y botones de cierre de sesión
    const openLogoutModal = (e) => {
        if (e) e.preventDefault();
        const modal = document.getElementById('modal-confirm-logout');
        if (modal) modal.classList.remove('hidden');
    };
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');
    if (logoutBtnSidebar) logoutBtnSidebar.onclick = openLogoutModal;

    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.onclick = openLogoutModal;

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
}
window.bindAuthEvents = bindAuthEvents;

/**
 * Procesa el envío del formulario de inicio de sesión.
 * @param {Event} e
 */
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
window.handleLoginFormSubmit = handleLoginFormSubmit;

/**
 * Procesa el registro de un nuevo líder y creación de cuenta directa.
 * @param {Event} e
 */
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

        // Guardar sesión activa (Auto Login)
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
window.handleLeaderRegisterSubmit = handleLeaderRegisterSubmit;

/**
 * Valida el código de invitación de una banda antes de registrar a un miembro.
 * @param {Event} e
 */
async function handleMemberInviteSubmit(e) {
    e.preventDefault();
    const inviteCode = document.getElementById('invite-code-entry').value.trim();

    try {
        const data = await apiFetch('/auth/validate-invite-code', {
            method: 'POST',
            body: { invite_code: inviteCode }
        });

        // Configurar información de la banda en la tarjeta de registro
        document.getElementById('register-member-group-name').textContent = data.group_name;
        document.getElementById('register-member-invite-code').value = data.invite_code;

        // Limpiar campos
        document.getElementById('member-register-name').value = '';
        document.getElementById('member-register-lastname').value = '';
        document.getElementById('member-register-email').value = '';
        document.getElementById('member-register-password').value = '';

        // Transición de vista
        document.getElementById('view-member-invite').classList.add('hidden');
        document.getElementById('view-member-register').classList.remove('hidden');

        showToast(data.message, "success");
    } catch (err) {
        showToast(err.message, "danger");
    }
}
window.handleMemberInviteSubmit = handleMemberInviteSubmit;

/**
 * Procesa el registro de un nuevo miembro asociado a un código de invitación válido.
 * @param {Event} e
 */
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
window.handleMemberRegisterSubmit = handleMemberRegisterSubmit;

/**
 * Procesa el cambio obligatorio de contraseña cuando el usuario tiene la bandera must_change_password.
 * @param {Event} e
 */
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

        currentUser.must_change_password = false;
        setData('currentUser', currentUser);
        
        showToast("Contraseña actualizada exitosamente.");
        await updateShellVisibility();
    } catch (err) {
        showToast(err.message, "danger");
    }
}
window.handleForcePasswordChangeSubmit = handleForcePasswordChangeSubmit;

/**
 * Carga de forma asíncrona la vista modular y el flujo de Onboarding inicial.
 */
async function loadOnboardingLayout() {
    const wrapper = document.getElementById('auth-onboarding-panel');
    if (!wrapper) return;

    try {
        const response = await fetch(`views/onboarding.php?t=${Date.now()}`);
        wrapper.innerHTML = await response.text();
        
        const onboardingChoices = document.querySelector('.onboarding-choices');
        const fCreate = document.getElementById('form-create-group');
        const fJoin = document.getElementById('form-join-group');

        const cCreate = document.getElementById('btn-choice-create');
        const cJoin = document.getElementById('btn-choice-join');
        
        if (cCreate) {
            cCreate.onclick = () => {
                onboardingChoices?.classList.add('hidden');
                fCreate?.classList.remove('hidden');
            };
        }
        if (cJoin) {
            cJoin.onclick = () => {
                onboardingChoices?.classList.add('hidden');
                fJoin?.classList.remove('hidden');
            };
        }

        const btnBackCreate = document.getElementById('btn-back-to-choices-create');
        if (btnBackCreate) {
            btnBackCreate.onclick = () => {
                fCreate?.classList.add('hidden');
                onboardingChoices?.classList.remove('hidden');
            };
        }
        const btnBackJoin = document.getElementById('btn-back-to-choices-join');
        if (btnBackJoin) {
            btnBackJoin.onclick = () => {
                fJoin?.classList.add('hidden');
                onboardingChoices?.classList.remove('hidden');
            };
        }

        if (fCreate) fCreate.onsubmit = handleCreateGroupSubmit;
        if (fJoin) fJoin.onsubmit = handleJoinGroupSubmit;
    } catch (e) {
        wrapper.innerHTML = `<div style="color:#fff; text-align:center;">Fallo cargando onboarding.</div>`;
    }
}
window.loadOnboardingLayout = loadOnboardingLayout;

/**
 * Ejecuta el cierre de sesión en el servidor y limpia el estado local del cliente.
 */
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
    
    applyAccentColor('purple');
    
    window.location.hash = '';
    
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
window.confirmLogout = confirmLogout;
