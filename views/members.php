<!-- Invite Code Card (visible only for leaders, populated by JS) -->
<div id="invite-code-card" class="hidden" style="
    background: linear-gradient(135deg, var(--accent-color, #7c3aed) 0%, color-mix(in srgb, var(--accent-color, #7c3aed) 60%, #000) 100%);
    border-radius: var(--radius-lg, 12px);
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
">
    <div>
        <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
            Código de Invitación del Grupo
        </p>
        <p style="font-size: 2rem; font-weight: 800; letter-spacing: 0.18em; color: #fff; font-family: 'Outfit', monospace; line-height: 1;" id="invite-code-display">
            --------
        </p>
        <p style="font-size: 0.78rem; color: rgba(255,255,255,0.65); margin-top: 6px;">
            Comparte este código para que otros se unan a tu banda
        </p>
    </div>
    <div style="display: flex; gap: 10px; flex-shrink: 0;">
        <button id="btn-copy-invite-code" class="btn" style="
            background: rgba(255,255,255,0.18);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(8px);
            font-size: 0.85rem;
            padding: 8px 16px;
            display: flex; align-items: center; gap: 6px;
        " title="Copiar código">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar
        </button>
        <button id="btn-share-invite-code" class="btn" style="
            background: rgba(255,255,255,0.18);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(8px);
            font-size: 0.85rem;
            padding: 8px 16px;
            display: flex; align-items: center; gap: 6px;
        " title="Compartir código">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Compartir
        </button>
        <button id="btn-reset-invite-code" class="btn" style="
            background: rgba(255,255,255,0.18);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(8px);
            font-size: 0.85rem;
            padding: 8px 16px;
            display: flex; align-items: center; gap: 6px;
        " title="Regenerar código">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        </button>
    </div>
</div>

<!-- Actions & Tools Header -->
<div class="action-bar" style="flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
    <div>
        <h2>Integrantes de la Banda</h2>
    </div>
    <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; flex: 1; min-width: 250px;">
        <button class="btn btn-outline" id="btn-manage-roles" style="display: none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Gestionar Roles</span>
        </button>
        <button class="btn btn-primary" id="btn-add-member" style="display: none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agregar Miembro</span>
        </button>
    </div>
</div>

<!-- Team Members Grid -->
<div class="team-grid" id="team-members-list" style="margin-bottom: 30px;">
    <!-- Populated via JS -->
</div>



<!-- ================= MODALS ================= -->
<!-- 1. ADD/EDIT MEMBER MODAL -->
<div class="modal-backdrop hidden" id="modal-member">
    <div class="modal-card">
        <div class="modal-header">
            <h3 id="member-modal-title">Agregar Nuevo Integrante</h3>
            <button class="btn-close-modal" id="btn-close-member-modal-x">&times;</button>
        </div>
        <form id="member-form">
            <input type="hidden" id="member-form-id">
            <div class="form-row">
                <div class="form-group col-6">
                    <label for="member-form-name">Nombres</label>
                    <input type="text" id="member-form-name" placeholder="Ej. Juan" required>
                </div>
                <div class="form-group col-6">
                    <label for="member-form-lastname">Apellidos</label>
                    <input type="text" id="member-form-lastname" placeholder="Ej. Pérez" required>
                </div>
            </div>
            <div class="form-group">
                <label for="member-form-email">Correo Electrónico (Opcional)</label>
                <input type="email" id="member-form-email" placeholder="ejemplo@worshipapp.com">
            </div>
            <div class="form-group">
                <label for="member-form-username">Nombre de Usuario (Obligatorio si no tiene email)</label>
                <div style="position:relative;">
                    <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-weight:600;">@</span>
                    <input type="text" id="member-form-username" placeholder="juanperez" required style="padding-left:28px;">
                </div>
                <div id="member-username-feedback" class="field-feedback"></div>
                <small class="form-help">Utilizado para iniciar sesión. Caracteres alfanuméricos simples.</small>
            </div>
            <div class="form-row">
                <div class="form-group col-6">
                    <label for="member-form-role">Rol Musical / Instrumento</label>
                    <select id="member-form-role" required>
                        <!-- Populated dynamically with group_roles -->
                    </select>
                </div>
                <div class="form-group col-6">
                    <label for="member-form-system-role">Rol de Sistema (Permisos)</label>
                    <select id="member-form-system-role" required>
                        <option value="member">Miembro (Lectura)</option>
                        <option value="leader">Líder (Control total)</option>
                    </select>
                </div>
            </div>
            <div class="form-group" id="member-form-password-group">
                <label for="member-form-password">Contraseña Temporal</label>
                <input type="password" id="member-form-password" placeholder="Contraseña de 6+ caracteres" required minlength="6">
                <small class="form-help">Se le pedirá cambiarla en su primer inicio de sesión.</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline btn-close-modal" id="btn-close-member-modal">Cancelar</button>
                <button type="submit" id="btn-member-submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. RESET PASSWORD MODAL -->
<!-- 2. RESET PASSWORD MODAL -->
<div class="modal-backdrop hidden" id="modal-reset-password">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Restablecer Contraseña</h3>
            <button class="btn-close-modal" id="btn-close-reset-password-modal-x">&times;</button>
        </div>
        
        <!-- Step 1: Confirmation -->
        <div id="reset-password-confirm-step" style="padding: 20px 24px;">
            <input type="hidden" id="reset-password-user-id">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">Estás por resetear la contraseña del integrante:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;" id="reset-password-user-name">...</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">Se activará la solicitud de cambio de contraseña obligatoria en su siguiente inicio de sesión.</p>
            
            <div class="modal-footer" style="padding: 16px 0 0; margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="btn btn-outline btn-close-modal" id="btn-close-reset-password-modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="btn-confirm-reset-password">
                    Confirmar Restablecimiento
                </button>
            </div>
        </div>

        <!-- Step 2: Show generated password -->
        <div id="reset-password-success-step" class="hidden" style="padding: 20px 24px;">
            <div style="text-align: center; margin-bottom: 16px; color: #10b981;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">¡Contraseña restablecida con éxito!</p>
            
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="generated-member-temporary-password">Contraseña Temporal Generada</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="generated-member-temporary-password" readonly style="
                        flex: 1; text-align: center; font-size: 1.25rem; font-weight: 700;
                        letter-spacing: 0.1em; font-family: 'Outfit', monospace; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px; border-radius: var(--radius-sm);
                    ">
                    <button class="btn btn-primary" id="btn-copy-member-generated-password" style="padding: 0 16px; display: flex; align-items: center;">
                        Copiar
                    </button>
                </div>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); text-align: center;">Comparte esta contraseña con el integrante. Se le exigirá cambiarla al ingresar.</p>
            
            <div class="modal-footer" style="padding: 16px 0 0; margin-top: 20px;">
                <button type="button" class="btn btn-primary btn-close-modal btn-block" id="btn-close-reset-password-success-modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

<!-- 3. MANAGE ROLES MODAL -->
<div class="modal-backdrop hidden" id="modal-manage-roles">
    <div class="modal-card">
        <div class="modal-header">
            <h3>Gestionar Roles Musicales</h3>
            <button class="btn-close-modal" id="btn-close-manage-roles-modal-x">&times;</button>
        </div>
        <div class="modal-body">
            <form id="add-role-form" style="display:flex; gap:10px; margin-bottom:20px;">
                <input type="text" id="new-role-input" placeholder="Ej. Saxofón, Sonidista..." required style="flex:1;">
                <button type="submit" class="btn btn-primary">Añadir</button>
            </form>
            
            <h4 style="margin-bottom:10px; font-size:0.9rem;">Roles actuales en tu banda:</h4>
            <div class="scrollable-y max-h-200" id="roles-list-container" style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:10px; background-color:var(--bg-input);">
                <!-- Populated via JS -->
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-close-modal btn-block" id="btn-close-manage-roles-modal">Cerrar</button>
        </div>
    </div>
</div>

<!-- 4. CONFIRM RESET INVITE CODE MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-reset-invite-code">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Regenerar Código de Invitación</h3>
            <button class="btn-close-modal" id="btn-close-reset-invite-code-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 6px;">¿Confirmas que deseas generar un nuevo código?</p>
            <p style="font-size: 0.85rem; color: var(--danger, #ef4444); margin-top: 12px;">El código anterior dejará de funcionar inmediatamente. Los nuevos integrantes deberán utilizar el nuevo código para registrarse.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-reset-invite-code">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-reset-invite-code">
                Confirmar Regeneración
            </button>
        </div>
    </div>
</div>

<!-- 5. CONFIRM DELETE MEMBER MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-delete-member">
    <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
            <h3>Remover Integrante</h3>
            <button class="btn-close-modal" id="btn-close-delete-member-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <input type="hidden" id="delete-member-user-id">
            <p style="font-size: 0.95rem; color: var(--text-secondary);">¿Estás seguro de que deseas remover a <strong id="delete-member-user-name">...</strong> de tu grupo?</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-delete-member">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-delete-member">Remover</button>
        </div>
    </div>
</div>

<!-- 6. CONFIRM DELETE ROLE MODAL -->
<div class="modal-backdrop hidden" id="modal-confirm-delete-role">
    <div class="modal-card" style="max-width: 450px;">
        <div class="modal-header">
            <h3>Eliminar Rol Musical</h3>
            <button class="btn-close-modal" id="btn-close-delete-role-modal-x">&times;</button>
        </div>
        <div style="padding: 20px 24px;">
            <input type="hidden" id="delete-role-name-input">
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">¿Deseas eliminar el rol "<strong id="delete-role-name-display">...</strong>" de tu banda?</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">Los miembros que tengan este rol conservarán su nombre de rol, pero este ya no figurará para nuevos ingresos.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline btn-close-modal" id="btn-cancel-delete-role">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btn-confirm-delete-role">Eliminar Rol</button>
        </div>
    </div>
</div>
