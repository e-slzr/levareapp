/**
 * @fileoverview Submódulo de Sincronización en Vivo y Cues para Repertorios (Live Sync).
 * Gestiona el Modo Director ("Uno Dirige, el Resto Sigue"), cambio sincronizado de canciones,
 * despacho táctil de indicaciones (tonos, dinámicas, atajos privados) y marco Tally para seguidores.
 * Compatible con Mobile, Tablet y PC.
 * 
 * Reglas:
 * - Estrictamente sin emojis en UI, logs y alertas.
 * - Soporte dual (Modo Oscuro / Claro).
 * - Aislamiento multi-tenancy mediante X-Group-Id y Bearer token.
 */

// Estado interno del módulo Live Sync
let liveSyncState = {
    setlistId: null,
    pollingInterval: null,
    isDirector: false,
    isFollowerConnected: false,
    activeSession: null,
    cueTimer: null,
    isSharp: false,
    selectedQuality: 'Mayor',
    lastReceivedCueText: null
};

/**
 * Determina de forma robusta si el usuario actual tiene permisos de líder/administrador.
 * @returns {boolean}
 */
function isCurrentUserLeader() {
    if (typeof canEdit === 'function') {
        return canEdit();
    }
    const user = (typeof currentUser !== 'undefined' && currentUser) 
        ? currentUser 
        : (typeof getData === 'function' ? getData('currentUser') : null);
    if (!user) return false;
    return user.account_type === 'leader' || user.account_type === 'superadmin';
}

/**
 * Actualiza la visibilidad y apariencia de los botones de Emisión en Móvil y Tablet/PC.
 * @param {boolean} isDirecting True si el usuario actual es el Director de una sesión activa.
 */
function updateDirectorButtonsUI(isDirecting) {
    const isLeader = isCurrentUserLeader();
    
    const toggleBtn = document.getElementById('btn-pres-live-sync-toggle');
    const toggleBtnText = document.getElementById('pres-live-sync-btn-text');
    const cueTrigger = document.getElementById('btn-pres-cue-pad-trigger');
    const sidebarBtn = document.getElementById('btn-sidebar-pres-live-sync');
    const sidebarBtnText = document.getElementById('pres-sidebar-live-sync-text');
    const railBtn = document.getElementById('btn-rail-pres-live-sync');

    if (!isLeader) {
        // Si no es líder, ocultar todos los controles de emisión
        if (toggleBtn) { toggleBtn.classList.add('hidden'); toggleBtn.classList.remove('inline-flex'); }
        if (cueTrigger) cueTrigger.classList.add('hidden');
        if (sidebarBtn) { sidebarBtn.classList.add('hidden'); sidebarBtn.classList.remove('flex'); }
        if (railBtn) { railBtn.classList.add('hidden'); railBtn.classList.remove('flex'); }
        return;
    }

    // Si es líder pero otro líder ya inició la sesión activa como director
    if (liveSyncState.activeSession && !liveSyncState.activeSession.is_director) {
        if (toggleBtn) { toggleBtn.classList.add('hidden'); toggleBtn.classList.remove('inline-flex'); }
        if (cueTrigger) cueTrigger.classList.add('hidden');
        if (sidebarBtn) { sidebarBtn.classList.add('hidden'); sidebarBtn.classList.remove('flex'); }
        if (railBtn) { railBtn.classList.add('hidden'); railBtn.classList.remove('flex'); }
        return;
    }

    // El usuario es líder y puede emitir o ya está emitiendo
    if (isDirecting) {
        // Estado: Transmitiendo en Vivo (Activo) -> Botones en ROJO con animación de pulso
        if (toggleBtn) {
            toggleBtn.classList.remove('hidden', 'bg-zinc-200', 'dark:bg-zinc-800', 'text-zinc-700', 'dark:text-zinc-300', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'bg-amber-500', 'text-zinc-950', 'border-amber-500/30');
            toggleBtn.classList.add('inline-flex', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border', 'border-red-500', 'animate-pulse', 'shadow-sm');
            if (toggleBtnText) toggleBtnText.textContent = 'En Emisión';
            toggleBtn.title = 'Transmitiendo en Vivo • Clic para detener';
        }
        if (sidebarBtn) {
            sidebarBtn.classList.remove('hidden', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'bg-amber-500', 'text-zinc-950', 'border-amber-500/30');
            sidebarBtn.classList.add('flex', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border', 'border-red-500', 'animate-pulse', 'shadow-sm');
            if (sidebarBtnText) sidebarBtnText.textContent = 'En Emisión';
            sidebarBtn.title = 'Transmitiendo en Vivo • Clic para detener';
        }
        if (railBtn) {
            railBtn.classList.remove('hidden', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'bg-amber-500', 'text-zinc-950', 'border-amber-500/30');
            railBtn.classList.add('flex', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border', 'border-red-500', 'animate-pulse', 'shadow-sm');
            railBtn.title = 'Transmitiendo en Vivo • Clic para detener';
        }
        if (cueTrigger) {
            cueTrigger.classList.remove('hidden', 'animate-pulse', 'bg-zinc-800', 'text-amber-400', 'border-zinc-700');
            cueTrigger.classList.add('bg-amber-500', 'text-zinc-950', 'hover:bg-amber-400', 'shadow-xl', 'shadow-amber-500/25', 'border', 'border-amber-400/80');
            cueTrigger.title = 'Indicaciones en Vivo (Abrir pad de mensajes)';
        }
    } else {
        // Estado: Listo para emitir (Inactivo)
        if (toggleBtn) {
            toggleBtn.classList.remove('hidden', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border-red-500', 'animate-pulse', 'shadow-sm', 'bg-amber-500', 'text-zinc-950');
            toggleBtn.classList.add('inline-flex', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'border', 'border-amber-500/30', 'hover:bg-amber-500', 'hover:text-zinc-950', 'transition');
            if (toggleBtnText) toggleBtnText.textContent = 'Emisión';
            toggleBtn.title = 'Iniciar Emisión en Vivo';
        }
        if (sidebarBtn) {
            sidebarBtn.classList.remove('hidden', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border-red-500', 'animate-pulse', 'shadow-sm', 'bg-amber-500', 'text-zinc-950');
            sidebarBtn.classList.add('flex', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'border', 'border-amber-500/30', 'hover:bg-amber-500', 'hover:text-zinc-950', 'transition');
            if (sidebarBtnText) sidebarBtnText.textContent = 'Emisión en Vivo';
            sidebarBtn.title = 'Iniciar Emisión en Vivo';
        }
        if (railBtn) {
            railBtn.classList.remove('hidden', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'border-red-500', 'animate-pulse', 'shadow-sm', 'bg-amber-500', 'text-zinc-950');
            railBtn.classList.add('flex', 'bg-amber-500/15', 'text-amber-600', 'dark:text-amber-400', 'border', 'border-amber-500/30', 'hover:bg-amber-500', 'hover:text-zinc-950', 'transition');
            railBtn.title = 'Iniciar Emisión en Vivo';
        }
        if (cueTrigger) {
            cueTrigger.classList.remove('hidden', 'bg-amber-500', 'text-zinc-950', 'hover:bg-amber-400', 'shadow-xl', 'shadow-amber-500/25', 'border-amber-400/80', 'animate-pulse');
            cueTrigger.classList.add('bg-zinc-800', 'text-amber-400', 'border', 'border-zinc-700', 'hover:bg-zinc-700', 'shadow-lg');
            cueTrigger.title = 'Indicaciones en Vivo (Ver o configurar mensajes)';
        }
    }
}

/**
 * Inicializa la lógica de Live Sync al abrir la vista de presentación de un repertorio.
 * @param {Object} setlist Objeto del repertorio activo.
 */
function initLiveSyncForPresentation(setlist) {
    if (!setlist || !setlist.id) return;

    liveSyncState.setlistId = setlist.id;
    liveSyncState.isDirector = false;
    liveSyncState.isFollowerConnected = false;
    liveSyncState.activeSession = null;
    liveSyncState.lastReceivedCueText = null;

    // 1. Mostrar de inmediato los botones de Emisión en Móvil y Tablet/PC si es líder
    updateDirectorButtonsUI(false);

    // 2. Iniciar sondeo ultraligero del estado de la sesión
    startLiveSyncPolling();
}

/**
 * Detiene el sondeo y limpia estados al salir del visor de presentación.
 */
function teardownLiveSyncForPresentation() {
    stopLiveSyncPolling();
    dismissLiveCue();

    // Restablecer estilos de marco Tally y badges
    const presSubpanel = document.getElementById('subpanel-setlist-presentation');
    if (presSubpanel) presSubpanel.classList.remove('tally-frame-active');

    const cornerBadge = document.getElementById('pres-corner-live-badge');
    if (cornerBadge) cornerBadge.classList.add('hidden');

    const followerBar = document.getElementById('pres-follower-live-bar');
    if (followerBar) followerBar.classList.add('hidden');

    const connectedBar = document.getElementById('pres-follower-connected-bar');
    if (connectedBar) connectedBar.classList.add('hidden');

    const toggleBtn = document.getElementById('btn-pres-live-sync-toggle');
    if (toggleBtn) { toggleBtn.classList.add('hidden'); toggleBtn.classList.remove('inline-flex'); }

    const cueTrigger = document.getElementById('btn-pres-cue-pad-trigger');
    if (cueTrigger) cueTrigger.classList.add('hidden');

    const sidebarBtn = document.getElementById('btn-sidebar-pres-live-sync');
    if (sidebarBtn) { sidebarBtn.classList.add('hidden'); sidebarBtn.classList.remove('flex'); }

    const railBtn = document.getElementById('btn-rail-pres-live-sync');
    if (railBtn) { railBtn.classList.add('hidden'); railBtn.classList.remove('flex'); }

    liveSyncState.setlistId = null;
    liveSyncState.isDirector = false;
    liveSyncState.isFollowerConnected = false;
    liveSyncState.activeSession = null;
}

/**
 * Inicia el sondeo de estado con pausa automática en segundo plano.
 */
function startLiveSyncPolling() {
    stopLiveSyncPolling();
    pollLiveSyncState(); // Primera consulta inmediata

    liveSyncState.pollingInterval = setInterval(() => {
        // Pausar si la pestaña del navegador no está activa para ahorrar recursos
        if (document.hidden) return;
        pollLiveSyncState();
    }, 2500);
}

/**
 * Detiene el temporizador de sondeo.
 */
function stopLiveSyncPolling() {
    if (liveSyncState.pollingInterval) {
        clearInterval(liveSyncState.pollingInterval);
        liveSyncState.pollingInterval = null;
    }
}

/**
 * Consulta el estado actual de la sesión Live Sync al backend.
 */
async function pollLiveSyncState() {
    if (!liveSyncState.setlistId) return;

    try {
        const res = await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session`, {
            method: 'GET'
        });

        if (!res) return;

        handleLiveSyncStateResponse(res);
    } catch (err) {
        console.warn('Live Sync polling error:', err);
    }
}

/**
 * Procesa la respuesta del estado de sesión y actualiza la UI.
 * @param {Object} data Respuesta del endpoint.
 */
function handleLiveSyncStateResponse(data) {
    const isSessionActive = !!(data && data.is_active && data.session);
    const session = isSessionActive ? data.session : null;
    liveSyncState.activeSession = session;

    const followerBar = document.getElementById('pres-follower-live-bar');
    const connectedBar = document.getElementById('pres-follower-connected-bar');
    const presSubpanel = document.getElementById('subpanel-setlist-presentation');
    const cornerBadge = document.getElementById('pres-corner-live-badge');

    if (isSessionActive) {
        // ==========================================
        // CASO A: EL USUARIO ACTUAL ES EL DIRECTOR
        // ==========================================
        if (session.is_director) {
            liveSyncState.isDirector = true;

            // Actualizar botones de emisión a estado "En Emisión"
            updateDirectorButtonsUI(true);

            // Ocultar barras de seguidor en el director
            if (followerBar) followerBar.classList.add('hidden');
            if (connectedBar) connectedBar.classList.add('hidden');
            if (presSubpanel) presSubpanel.classList.remove('tally-frame-active');
            if (cornerBadge) cornerBadge.classList.add('hidden');

            return;
        }

        // ==========================================
        // CASO B: EL USUARIO ES UN SEGUIDOR (O LÍDER SECUNDARIO)
        // ==========================================
        liveSyncState.isDirector = false;

        // Ocultar botones de emisión al no ser el director activo
        updateDirectorButtonsUI(false);

        // Si el integrante ya presionó "Conectarme" (Seguidor Enlazado)
        if (liveSyncState.isFollowerConnected) {
            if (followerBar) followerBar.classList.add('hidden');
            if (connectedBar) {
                connectedBar.classList.remove('hidden');
                const label = document.getElementById('pres-connected-director-label');
                if (label) label.textContent = session.director_name || 'Director';
            }

            // Activar marco Tally y badge de esquina
            if (presSubpanel) presSubpanel.classList.add('tally-frame-active');
            if (cornerBadge) cornerBadge.classList.remove('hidden');

            // 1. Sincronización automática de canción
            if (session.current_song_id) {
                synchronizeFollowerSong(session.current_song_id);
            }

            // 2. Sincronización de transposición (si difiere)
            if (typeof presTransposeOffset !== 'undefined' && session.current_transpose !== presTransposeOffset) {
                if (typeof window.setPresTransposeDirect === 'function') {
                    window.setPresTransposeDirect(session.current_transpose);
                }
            }

            // 3. Procesar indicación en vivo (Cue)
            if (session.active_cue) {
                displayLiveCueBanner(session.active_cue, session.active_cue_type || 'Indicación en Vivo', session.cue_timestamp);
            } else {
                dismissLiveCue();
            }

        } else {
            // Seguidor aún no conectado: mostrar barra para unirse
            if (followerBar) {
                followerBar.classList.remove('hidden');
                const nameSpan = document.getElementById('pres-follower-director-name');
                if (nameSpan) nameSpan.textContent = session.director_name || 'El Director';
            }
            if (connectedBar) connectedBar.classList.add('hidden');
            if (presSubpanel) presSubpanel.classList.remove('tally-frame-active');
            if (cornerBadge) cornerBadge.classList.add('hidden');
            dismissLiveCue();
        }

    } else {
        // ==========================================
        // CASO C: NO HAY SESIÓN LIVE ACTIVA
        // ==========================================
        if (liveSyncState.isFollowerConnected) {
            // El director acaba de apagar la sesión
            liveSyncState.isFollowerConnected = false;
            if (typeof showToast === 'function') {
                showToast('El Director ha finalizado la sesión Live Sync.', 'info');
            }
        }

        liveSyncState.isDirector = false;

        // Si es líder, mostrar botones listos para emitir
        updateDirectorButtonsUI(false);

        if (followerBar) followerBar.classList.add('hidden');
        if (connectedBar) connectedBar.classList.add('hidden');
        if (presSubpanel) presSubpanel.classList.remove('tally-frame-active');
        if (cornerBadge) cornerBadge.classList.add('hidden');
        dismissLiveCue();
    }
}

/**
 * Conecta al integrante a la sesión Live Sync como seguidor.
 */
function joinLiveSync() {
    liveSyncState.isFollowerConnected = true;
    if (typeof showToast === 'function') {
        showToast('Enlazado a la sesión en vivo del Director.', 'success');
    }
    // Forzar actualización inmediata de la UI
    if (liveSyncState.activeSession) {
        handleLiveSyncStateResponse({ is_active: true, session: liveSyncState.activeSession });
    }
}

/**
 * Desconecta al integrante de la sesión Live Sync y lo regresa a modo autónomo.
 */
function leaveLiveSync() {
    liveSyncState.isFollowerConnected = false;
    const presSubpanel = document.getElementById('subpanel-setlist-presentation');
    if (presSubpanel) presSubpanel.classList.remove('tally-frame-active');

    const cornerBadge = document.getElementById('pres-corner-live-badge');
    if (cornerBadge) cornerBadge.classList.add('hidden');

    const connectedBar = document.getElementById('pres-follower-connected-bar');
    if (connectedBar) connectedBar.classList.add('hidden');

    dismissLiveCue();

    if (typeof showToast === 'function') {
        showToast('Desconectado de Live Sync. Controles locales desbloqueados.', 'info');
    }

    // Volver a mostrar la barra para unirse si la sesión sigue activa
    if (liveSyncState.activeSession) {
        const followerBar = document.getElementById('pres-follower-live-bar');
        if (followerBar) followerBar.classList.remove('hidden');
    }
}

/**
 * Sincroniza la canción del seguidor con la del director si difiere de la actual.
 * @param {number} songId ID de la canción que está tocando el director.
 */
function synchronizeFollowerSong(songId) {
    if (!songId || typeof currentPresentationSong === 'undefined') return;
    if (currentPresentationSong && currentPresentationSong.id == songId) return;

    if (typeof currentPresentationSetlist !== 'undefined' && currentPresentationSetlist && currentPresentationSetlist.songs) {
        const targetSong = currentPresentationSetlist.songs.find(s => s.id == songId);
        if (targetSong && typeof selectPresentationSong === 'function') {
            selectPresentationSong(targetSong);
            
            // Efecto visual sutil de cambio sincronizado
            const lyricsArea = document.getElementById('pres-lyrics-container');
            if (lyricsArea) {
                lyricsArea.style.opacity = '0.35';
                setTimeout(() => { lyricsArea.style.opacity = '1'; }, 180);
            }
        }
    }
}

/**
 * Comprueba si el usuario tiene sus controles bloqueados por estar en Live Sync.
 * @returns {boolean} True si es seguidor conectado.
 */
function isMusicianControlLocked() {
    return liveSyncState.isFollowerConnected && !liveSyncState.isDirector;
}

/**
 * Emite una vibración corta y feedback si el músico intenta realizar una acción bloqueada.
 */
function showMusicianLockedFeedback() {
    if (typeof showToast === 'function') {
        showToast('Control bloqueado por el Director en Live Sync.', 'warning');
    }
    const presSubpanel = document.getElementById('subpanel-setlist-presentation');
    if (presSubpanel) {
        presSubpanel.classList.add('live-haptic-feedback');
        setTimeout(() => { presSubpanel.classList.remove('live-haptic-feedback'); }, 400);
    }
}

// ==============================================================================
// FLUJO DEL DIRECTOR: INICIO, CIERRE Y DESPACHO DE INDICACIONES
// ==============================================================================

/**
 * Acción del botón principal de Emisión (Cabecera y Sidebar Tablet/PC).
 * Inicia de inmediato la Emisión sin abrir el panel de atajos,
 * o abre el modal de confirmación si ya está emitiendo.
 */
function toggleDirectorLiveSync() {
    if (liveSyncState.isDirector) {
        confirmStopLiveSync();
    } else {
        startDirectorLiveSync(false);
    }
}

/**
 * Inicia la sesión Live Sync en el backend.
 * @param {boolean} openPad Determina si debe abrirse el panel de atajos tras iniciar.
 */
async function startDirectorLiveSync(openPad = false) {
    if (!liveSyncState.setlistId) return;

    try {
        const songId = typeof currentPresentationSong !== 'undefined' && currentPresentationSong ? currentPresentationSong.id : null;
        const transpose = typeof presTransposeOffset !== 'undefined' ? presTransposeOffset : 0;

        const res = await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session/start`, {
            method: 'POST',
            body: { current_song_id: songId, current_transpose: transpose }
        });

        if (res && res.session) {
            liveSyncState.isDirector = true;
            liveSyncState.activeSession = res.session;
            updateDirectorButtonsUI(true);
            updateCuePadModalStatus();

            if (typeof showToast === 'function') {
                showToast('Emisión iniciada. Transmitiendo en vivo a la banda.', 'success');
            }
            pollLiveSyncState();
            if (openPad) {
                openDirectorCuePad();
            }
        }
    } catch (err) {
        if (err.status === 409) {
            if (typeof showToast === 'function') {
                showToast('Ya existe otro Director emitiendo en esta sesión en vivo.', 'warning');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Error al iniciar Emisión: ' + (err.message || 'Error desconocido'), 'error');
            }
        }
    }
}

/**
 * Inicia la emisión directamente desde el botón interior del pad de mensajes.
 */
async function startDirectorFromPad() {
    await startDirectorLiveSync(false);
}

/**
 * Abre el modal HTML minimalista para confirmar la detención de la Emisión.
 */
function confirmStopLiveSync() {
    const modal = document.getElementById('modal-confirm-stop-live');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        stopDirectorLiveSync();
    }
}

/**
 * Cierra el modal HTML de confirmación para detener la emisión.
 */
function closeStopLiveSyncModal() {
    const modal = document.getElementById('modal-confirm-stop-live');
    if (modal) modal.classList.add('hidden');
}

/**
 * Ejecuta la detención de la emisión tras la confirmación en el modal.
 */
async function executeStopLiveSync() {
    closeStopLiveSyncModal();
    await stopDirectorLiveSync();
}

/**
 * Finaliza la sesión Live Sync en el backend.
 */
async function stopDirectorLiveSync() {
    if (!liveSyncState.setlistId) return;

    try {
        await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session/stop`, {
            method: 'POST'
        });

        liveSyncState.isDirector = false;
        liveSyncState.activeSession = null;
        updateDirectorButtonsUI(false);
        updateCuePadModalStatus();

        if (typeof showToast === 'function') {
            showToast('Emisión finalizada correctamente.', 'info');
        }

        pollLiveSyncState();
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al finalizar la sesión.', 'error');
        }
    }
}

/**
 * Notifica al backend cuando el director cambia de canción o transpone.
 * @param {number} songId ID de la nueva canción.
 * @param {number} transpose Semitonos aplicados.
 */
async function notifyDirectorSongChange(songId, transpose) {
    if (!liveSyncState.isDirector || !liveSyncState.setlistId) return;

    try {
        await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session/sync`, {
            method: 'POST',
            body: { song_id: songId, transpose: transpose || 0 }
        });
    } catch (err) {
        console.warn('Error al sincronizar canción del Director:', err);
    }
}

// ==============================================================================
// MODAL BOTTOM SHEET DE CUES DEL DIRECTOR
// ==============================================================================

/**
 * Abre el panel de indicaciones rápidas sin iniciar automáticamente la emisión.
 */
function openDirectorCuePad() {
    const modal = document.getElementById('modal-director-cue-pad');
    if (modal) {
        modal.classList.remove('hidden');
        updateCuePadModalStatus();
        loadPersonalQuickCues();
    }
}

/**
 * Actualiza los indicadores visuales y botones del modal del pad según el estado de emisión.
 */
function updateCuePadModalStatus() {
    const dot = document.getElementById('modal-cue-status-dot');
    const desc = document.getElementById('modal-cue-status-desc');
    const btnStop = document.getElementById('btn-modal-stop-live');
    const btnStart = document.getElementById('btn-modal-start-live');

    if (liveSyncState.isDirector) {
        if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse';
        if (desc) desc.textContent = 'Transmitiendo en Vivo • La banda ve tus indicaciones';
        if (btnStop) btnStop.classList.remove('hidden');
        if (btnStart) btnStart.classList.add('hidden');
    } else {
        if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-zinc-400';
        if (desc) desc.textContent = 'Emisión inactiva • Abre mensajes o inicia para transmitir';
        if (btnStop) btnStop.classList.add('hidden');
        if (btnStart) btnStart.classList.remove('hidden');
    }
}

function closeDirectorCuePad() {
    const modal = document.getElementById('modal-director-cue-pad');
    if (modal) modal.classList.add('hidden');
}

function switchDirectorCueTab(tabName) {
    ['keys', 'dynamics', 'custom', 'text'].forEach(t => {
        const content = document.getElementById(`tab-cue-content-${t}`);
        const btn = document.getElementById(`tab-cue-btn-${t}`);
        if (content) content.classList.add('hidden');
        if (btn) {
            btn.classList.remove('bg-white', 'dark:bg-zinc-800', 'text-amber-600', 'dark:text-amber-400', 'shadow-sm');
            btn.classList.add('text-zinc-600', 'dark:text-zinc-400');
        }
    });

    const activeContent = document.getElementById(`tab-cue-content-${tabName}`);
    const activeBtn = document.getElementById(`tab-cue-btn-${tabName}`);
    if (activeContent) activeContent.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'dark:bg-zinc-800', 'text-amber-600', 'dark:text-amber-400', 'shadow-sm');
        activeBtn.classList.remove('text-zinc-600', 'dark:text-zinc-400');
    }
}

function toggleDirectorCueSharp() {
    liveSyncState.isSharp = !liveSyncState.isSharp;
    const btn = document.getElementById('btn-cue-sharp-toggle');
    if (btn) {
        if (liveSyncState.isSharp) {
            btn.classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-700', 'dark:text-zinc-300');
            btn.classList.add('bg-amber-500', 'text-zinc-950');
        } else {
            btn.classList.add('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-700', 'dark:text-zinc-300');
            btn.classList.remove('bg-amber-500', 'text-zinc-950');
        }
    }
}

function setDirectorCueQuality(quality) {
    liveSyncState.selectedQuality = quality;
    const majBtn = document.getElementById('btn-cue-quality-maj');
    const minBtn = document.getElementById('btn-cue-quality-min');

    if (quality === 'Mayor') {
        if (majBtn) majBtn.className = 'py-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition';
        if (minBtn) minBtn.className = 'py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:text-zinc-900 dark:hover:text-zinc-200 transition';
    } else {
        if (minBtn) minBtn.className = 'py-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition';
        if (majBtn) majBtn.className = 'py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:text-zinc-900 dark:hover:text-zinc-200 transition';
    }
}

/**
 * Envía un tono de improvisación al instante.
 */
function dispatchKeyCue(noteName, chordSymbol) {
    const sharp = liveSyncState.isSharp ? '#' : '';
    const isMin = liveSyncState.selectedQuality === 'Menor';
    const finalChord = chordSymbol + sharp + (isMin ? 'm' : '');
    const finalName = noteName + sharp + (isMin ? ' menor' : ' Mayor');

    sendCueToLiveSession(`Tono: ${finalName} (${finalChord})`, 'Tonalidad');
}

/**
 * Envía una indicación directa de dinámica o estructura.
 */
function dispatchDirectCue(text, type) {
    sendCueToLiveSession(text, type || 'Dinámica');
}

/**
 * Envía un texto libre al vuelo.
 */
function dispatchFreeTextCue() {
    const input = document.getElementById('input-free-text-cue');
    if (!input || !input.value.trim()) return;

    sendCueToLiveSession(input.value.trim(), 'Aviso del Líder');
    input.value = '';
}

/**
 * Envía la indicación al backend.
 */
async function sendCueToLiveSession(cueText, cueType) {
    if (!liveSyncState.setlistId) return;

    if (!liveSyncState.isDirector) {
        if (typeof showToast === 'function') {
            showToast('La Emisión no está activa. Inicia la Emisión para transmitir indicaciones a la banda.', 'warning');
        }
        return;
    }

    try {
        await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session/cue`, {
            method: 'POST',
            body: { cue: cueText, cue_type: cueType }
        });

        // Haptic feedback en dispositivo del director
        if (navigator.vibrate) navigator.vibrate(40);

        if (typeof showToast === 'function') {
            showToast(`Indicación transmitida: "${cueText}"`, 'success');
        }

        closeDirectorCuePad();
        pollLiveSyncState();
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al transmitir indicación.', 'error');
        }
    }
}

/**
 * Limpia la pantalla de la banda.
 */
async function clearLiveCueBroadcast() {
    if (!liveSyncState.isDirector || !liveSyncState.setlistId) return;

    try {
        await apiFetch(`/setlists/${liveSyncState.setlistId}/live-session/cue/clear`, {
            method: 'POST'
        });

        if (typeof showToast === 'function') {
            showToast('Pantallas de la banda despejadas.', 'info');
        }

        closeDirectorCuePad();
        pollLiveSyncState();
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al despejar avisos.', 'error');
        }
    }
}

// ==============================================================================
// GESTIÓN DE ATAJOS PRIVADOS DEL LÍDER
// ==============================================================================

async function loadPersonalQuickCues() {
    const container = document.getElementById('director-personal-cues-list');
    if (!container) return;

    try {
        const cues = await apiFetch('/quick-cues', { method: 'GET' });

        container.innerHTML = '';
        if (!cues || cues.length === 0) {
            container.innerHTML = '<div class="text-xs text-zinc-400 text-center py-3">No tienes atajos guardados aún.</div>';
            return;
        }

        cues.forEach(cue => {
            const item = document.createElement('div');
            item.className = 'w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 transition hover:border-amber-500/50';
            item.innerHTML = `
                <button type="button" class="text-left flex-1 min-w-0 cursor-pointer">
                    <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block">${cue.title}</span>
                    <span class="text-[10px] text-zinc-500 font-mono">${cue.category || 'Atajo'}</span>
                </button>
                <button type="button" class="btn-del-cue text-zinc-400 hover:text-red-500 p-1 flex-shrink-0 cursor-pointer" title="Eliminar atajo">
                    <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                </button>
            `;

            // Enviar cue al hacer clic en el texto
            item.querySelector('button').onclick = () => {
                dispatchDirectCue(cue.title, 'Atajo Personalizado');
            };

            // Eliminar atajo
            item.querySelector('.btn-del-cue').onclick = (e) => {
                e.stopPropagation();
                deletePersonalQuickCue(cue.id);
            };

            container.appendChild(item);
        });

    } catch (err) {
        container.innerHTML = '<div class="text-xs text-red-400 text-center py-3">Error al cargar atajos.</div>';
    }
}

async function addPersonalQuickCue() {
    const input = document.getElementById('input-new-personal-cue');
    if (!input || !input.value.trim()) return;

    const title = input.value.trim();

    try {
        await apiFetch('/quick-cues', {
            method: 'POST',
            body: { title: title, category: 'Personalizado' }
        });

        input.value = '';
        loadPersonalQuickCues();
        if (typeof showToast === 'function') {
            showToast('Atajo personal guardado.', 'success');
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al guardar atajo.', 'error');
        }
    }
}

let pendingDeleteCueId = null;

/**
 * Abre el modal HTML minimalista para confirmar la eliminación de un atajo personal.
 * @param {number} cueId ID del atajo a eliminar.
 */
function deletePersonalQuickCue(cueId) {
    pendingDeleteCueId = cueId;
    const modal = document.getElementById('modal-confirm-delete-cue');
    if (modal) {
        modal.classList.remove('hidden');
        const btnConfirm = document.getElementById('btn-confirm-delete-cue-action');
        if (btnConfirm) {
            btnConfirm.onclick = async () => {
                closeDeleteCueModal();
                await executeDeletePersonalQuickCue(pendingDeleteCueId);
            };
        }
    } else {
        executeDeletePersonalQuickCue(cueId);
    }
}

/**
 * Cierra el modal HTML de confirmación para eliminar un atajo.
 */
function closeDeleteCueModal() {
    const modal = document.getElementById('modal-confirm-delete-cue');
    if (modal) modal.classList.add('hidden');
    pendingDeleteCueId = null;
}

/**
 * Ejecuta la eliminación en el backend.
 */
async function executeDeletePersonalQuickCue(cueId) {
    if (!cueId) return;

    try {
        await apiFetch(`/quick-cues/${cueId}`, { method: 'DELETE' });
        loadPersonalQuickCues();
        if (typeof showToast === 'function') {
            showToast('Atajo personal eliminado.', 'info');
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('Error al eliminar atajo.', 'error');
        }
    }
}

// ==============================================================================
// RENDERIZADO VISUAL DEL CUE EN PANTALLA DEL MÚSICO
// ==============================================================================

/**
 * Despliega la indicación en vivo en el slot reservado de la pantalla del integrante.
 */
function displayLiveCueBanner(cueText, cueType, timestamp) {
    const slot = document.getElementById('pres-live-cue-slot');
    const textEl = document.getElementById('pres-live-cue-text');
    const typeEl = document.getElementById('pres-live-cue-type');
    const iconEl = document.getElementById('pres-live-cue-icon');
    const progressBar = document.getElementById('pres-live-cue-progress-bar');
    const progressBox = document.getElementById('pres-live-cue-progress-box');

    if (!slot || !textEl || !typeEl) return;

    // Si es un cue nuevo, disparar vibración háptica y animación
    if (liveSyncState.lastReceivedCueText !== cueText) {
        liveSyncState.lastReceivedCueText = cueText;

        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); // Pulsación háptica doble sutil
        }
    }

    textEl.textContent = cueText;
    typeEl.textContent = cueType;

    // Adaptar icono según tipo
    if (iconEl) {
        if (cueType === 'Tonalidad') {
            iconEl.className = 'fa-solid fa-music text-xs';
        } else if (cueType === 'Dinámica') {
            iconEl.className = 'fa-solid fa-bolt text-xs';
        } else {
            iconEl.className = 'fa-solid fa-bullhorn text-xs';
        }
    }

    slot.classList.remove('hidden');

    // Manejar duración de la barra de progreso
    if (cueType === 'Tonalidad') {
        // Tonalidad se queda fija hasta cambio o despeje
        if (progressBox) progressBox.classList.add('hidden');
    } else {
        if (progressBox) progressBox.classList.remove('hidden');

        // Duración de 8 segundos con temporizador decreciente
        const durationSeconds = 8;
        if (liveSyncState.cueTimer) clearInterval(liveSyncState.cueTimer);
        if (progressBar) progressBar.style.width = '100%';

        let elapsed = 0;
        const intervalMs = 100;
        const totalSteps = (durationSeconds * 1000) / intervalMs;

        liveSyncState.cueTimer = setInterval(() => {
            elapsed++;
            const pct = Math.max(0, 100 - (elapsed / totalSteps) * 100);
            if (progressBar) progressBar.style.width = pct + '%';

            if (elapsed >= totalSteps) {
                clearInterval(liveSyncState.cueTimer);
                liveSyncState.cueTimer = null;
                dismissLiveCue();
            }
        }, intervalMs);
    }
}

/**
 * Oculta la indicación en vivo.
 */
function dismissLiveCue() {
    if (liveSyncState.cueTimer) {
        clearInterval(liveSyncState.cueTimer);
        liveSyncState.cueTimer = null;
    }
    const slot = document.getElementById('pres-live-cue-slot');
    if (slot) slot.classList.add('hidden');
    liveSyncState.lastReceivedCueText = null;
}

// Exportar funciones y estado para uso global en ventanas y listeners HTML
window.liveSyncState = liveSyncState;
window.initLiveSyncForPresentation = initLiveSyncForPresentation;
window.teardownLiveSyncForPresentation = teardownLiveSyncForPresentation;
window.toggleDirectorLiveSync = toggleDirectorLiveSync;
window.startDirectorLiveSync = startDirectorLiveSync;
window.startDirectorFromPad = startDirectorFromPad;
window.confirmStopLiveSync = confirmStopLiveSync;
window.closeStopLiveSyncModal = closeStopLiveSyncModal;
window.executeStopLiveSync = executeStopLiveSync;
window.openDirectorCuePad = openDirectorCuePad;
window.closeDirectorCuePad = closeDirectorCuePad;
window.updateCuePadModalStatus = updateCuePadModalStatus;
window.closeDeleteCueModal = closeDeleteCueModal;
window.switchDirectorCueTab = switchDirectorCueTab;
window.toggleDirectorCueSharp = toggleDirectorCueSharp;
window.setDirectorCueQuality = setDirectorCueQuality;
window.dispatchKeyCue = dispatchKeyCue;
window.dispatchDirectCue = dispatchDirectCue;
window.dispatchFreeTextCue = dispatchFreeTextCue;
window.clearLiveCueBroadcast = clearLiveCueBroadcast;
window.loadPersonalQuickCues = loadPersonalQuickCues;
window.addPersonalQuickCue = addPersonalQuickCue;
window.deletePersonalQuickCue = deletePersonalQuickCue;
window.dismissLiveCue = dismissLiveCue;
window.joinLiveSync = joinLiveSync;
window.leaveLiveSync = leaveLiveSync;
window.notifyDirectorSongChange = notifyDirectorSongChange;
window.isMusicianControlLocked = isMusicianControlLocked;
window.showMusicianLockedFeedback = showMusicianLockedFeedback;
