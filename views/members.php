<!-- Members Screen (Minimalist UI - Dual Light & Dark Mode) -->
<div class="space-y-5 screen-fade">
    <!-- Aviso para líderes: Redirige a Gestión de Banda -->
    <div id="members-leader-notice" class="hidden p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
        <div class="flex items-center gap-2.5">
            <i class="fa-solid fa-users-gear text-amber-500 text-sm"></i>
            <span>Eres líder de esta banda. La administración completa, código de invitación y atajos se gestionan en <strong>Banda</strong>.</span>
        </div>
        <button type="button" onclick="navigateTo('band')" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer self-start sm:self-auto flex-shrink-0 shadow-sm">
            Ir a Banda
        </button>
    </div>

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
    <div class="team-grid" id="team-members-list">
        <!-- Populated via JS -->
    </div>
</div>

