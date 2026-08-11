<!-- Admin Panel: Directorio Global de Usuarios -->
<div class="action-bar" style="flex-wrap: wrap; gap: 15px; margin-bottom: 24px;">
    <div>
        <h2>Directorio Global de Usuarios</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Administración y control de accesos de líderes e integrantes en la plataforma
        </p>
    </div>
    <div style="display: flex; gap: 10px; align-items: center; margin-left: auto;">
        <button class="btn btn-outline" id="btn-refresh-requests">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Actualizar
        </button>
    </div>
</div>

<!-- Stats Cards -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px;">
    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px 20px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 8px;">Total Usuarios</p>
        <p style="font-size: 2rem; font-weight: 800; color: var(--accent-color, #7c3aed);" id="admin-stat-total">—</p>
    </div>
    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px 20px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 8px;">Bloqueados</p>
        <p style="font-size: 2rem; font-weight: 800; color: var(--danger, #ef4444);" id="admin-stat-blocked">—</p>
    </div>
</div>

<!-- Tabs -->
<div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; gap: 0;">
    <button class="admin-tab-btn active" id="tab-all-users" data-tab="all" style="
        padding: 10px 20px; font-size: 0.9rem; font-weight: 600; background: none; border: none;
        border-bottom: 2px solid var(--accent-color, #7c3aed); color: var(--accent-color, #7c3aed);
        cursor: pointer; transition: all 0.2s;
    ">Todos los Usuarios</button>
    <button class="admin-tab-btn" id="tab-blocked-users" data-tab="blocked" style="
        padding: 10px 20px; font-size: 0.9rem; font-weight: 600; background: none; border: none;
        border-bottom: 2px solid transparent; color: var(--text-muted);
        cursor: pointer; transition: all 0.2s;
    ">Bloqueados</button>
</div>

<!-- Users List -->
<div id="admin-requests-list">
    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display: block; opacity: 0.4;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Cargando usuarios...
    </div>
</div>

<!-- Confirmation Modal: Block User -->
<div class="modal-backdrop hidden" id="modal-confirm-block">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Bloquear Usuario</h3>
            <button class="btn-close-modal" id="btn-close-block-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">¿Confirmas el bloqueo del usuario:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);" id="block-leader-name">—</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;" id="block-leader-email">—</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">El usuario no podrá iniciar sesión en la aplicación ni acceder a sus grupos mientras esté bloqueado.</p>
        </div>
        <div class="modal-footer" style="display:flex; gap:10px; justify-content:flex-end;">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-block">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-block">
                Confirmar Bloqueo
            </button>
        </div>
    </div>
</div>

<!-- Confirmation Modal: Unblock User -->
<div class="modal-backdrop hidden" id="modal-confirm-unblock">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Desbloquear Usuario</h3>
            <button class="btn-close-modal" id="btn-close-unblock-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">¿Confirmas el desbloqueo del usuario:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);" id="unblock-leader-name">—</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;" id="unblock-leader-email">—</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 12px;">Se restaurará el acceso del usuario a la aplicación y a sus respectivos grupos.</p>
        </div>
        <div class="modal-footer" style="display:flex; gap:10px; justify-content:flex-end;">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-unblock">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-unblock" style="background: #10b981; border-color: #10b981;">
                Confirmar Desbloqueo
            </button>
        </div>
    </div>
</div>

<!-- Reset Password Modal: User -->
<div class="modal-backdrop hidden" id="modal-confirm-reset-leader-password">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Restablecer Contraseña</h3>
            <button class="btn-close-modal" id="btn-close-reset-leader-modal-x">&times;</button>
        </div>
        
        <!-- Step 1: Confirmation -->
        <div id="reset-leader-password-confirm-step" style="padding: 20px 24px;">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">Estás por resetear la contraseña del usuario:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);" id="reset-leader-name">—</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;" id="reset-leader-email">—</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">Se activará la solicitud de cambio de contraseña obligatoria en su siguiente inicio de sesión.</p>
            
            <div class="modal-footer" style="padding: 16px 0 0; margin-top: 20px; display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-reset-leader">Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-reset-leader-password">
                    Confirmar Restablecimiento
                </button>
            </div>
        </div>

        <!-- Step 2: Show generated password -->
        <div id="reset-leader-password-success-step" class="hidden" style="padding: 20px 24px;">
            <div style="text-align: center; margin-bottom: 16px; color: #10b981;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">¡Contraseña restablecida con éxito!</p>
            
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="generated-temporary-password">Contraseña Temporal Generada</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="generated-temporary-password" readonly style="
                        flex: 1; text-align: center; font-size: 1.25rem; font-weight: 700;
                        letter-spacing: 0.1em; font-family: 'Outfit', monospace; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px; border-radius: var(--radius-sm);
                    ">
                    <button class="btn btn-primary" id="btn-copy-generated-password" style="padding: 0 16px; display: flex; align-items: center;">
                        Copiar
                    </button>
                </div>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); text-align: center;">Comparte esta contraseña con el usuario. Se le exigirá cambiarla al ingresar.</p>
            
            <div class="modal-footer" style="padding: 16px 0 0; margin-top: 20px;">
                <button type="button" class="btn btn-primary btn-close-modal btn-block">Cerrar</button>
            </div>
        </div>
    </div>
</div>
