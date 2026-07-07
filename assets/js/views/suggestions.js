/* ==========================================================================
   WorshipApp — SUGGESTIONS BOX CONTROLLER (API Connected)
   ========================================================================== */

let cachedSuggestions = [];
let filterSongQuery = "";
let filterAuthorQuery = "";
let filterStatus = "all";
let suggestionIdToDelete = null;

function initSuggestionsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Add suggestion button
    document.getElementById('btn-add-suggestion').onclick = () => {
        document.getElementById('suggestion-form').reset();
        document.getElementById('modal-suggestion').classList.remove('hidden');
    };

    // Modal Close triggers
    document.querySelectorAll('#modal-suggestion .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-suggestion').classList.add('hidden');
    });
    document.getElementById('btn-close-suggestion-modal-x').onclick = () => {
        document.getElementById('modal-suggestion').classList.add('hidden');
    };

    // Form submit
    document.getElementById('suggestion-form').onsubmit = handleSuggestionFormSubmit;

    // Reset filters
    filterSongQuery = "";
    filterAuthorQuery = "";
    filterStatus = "all";
    suggestionIdToDelete = null;

    const filterSongInput = document.getElementById('suggestions-filter-song');
    const filterAuthorInput = document.getElementById('suggestions-filter-author');
    const filterStatusSelect = document.getElementById('suggestions-filter-status');

    if (filterSongInput) {
        filterSongInput.value = "";
        filterSongInput.oninput = (e) => {
            filterSongQuery = e.target.value;
            renderSuggestionsList();
        };
    }
    if (filterAuthorInput) {
        filterAuthorInput.value = "";
        filterAuthorInput.oninput = (e) => {
            filterAuthorQuery = e.target.value;
            renderSuggestionsList();
        };
    }
    if (filterStatusSelect) {
        filterStatusSelect.value = "all";
        filterStatusSelect.onchange = (e) => {
            filterStatus = e.target.value;
            renderSuggestionsList();
        };
    }

    // Modal Delete Confirmation triggers
    document.querySelectorAll('#modal-delete-suggestion-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-suggestion-confirm').classList.add('hidden');
    });
    const deleteCloseX = document.getElementById('btn-close-delete-suggestion-modal-x');
    if (deleteCloseX) {
        deleteCloseX.onclick = () => document.getElementById('modal-delete-suggestion-confirm').classList.add('hidden');
    }
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-suggestion');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = confirmDeleteSuggestion;
    }

    renderSuggestions(true);
}

async function renderSuggestions(forceRefresh = false) {
    const container = document.getElementById('suggestions-container-list');

    if (forceRefresh || cachedSuggestions.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">Cargando sugerencias...</div>`;
        try {
            cachedSuggestions = await apiFetch('/suggestions') || [];
        } catch (e) {
            console.error("Error loading suggestions:", e);
            container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--danger);">Fallo al cargar sugerencias musicales.</div>`;
            return;
        }
    }

    renderSuggestionsList();
}

function renderSuggestionsList() {
    const container = document.getElementById('suggestions-container-list');
    container.innerHTML = '';

    const songQ = filterSongQuery.toLowerCase().trim();
    const authorQ = filterAuthorQuery.toLowerCase().trim();
    const statusQ = filterStatus;

    const filtered = cachedSuggestions.filter(s => {
        const matchesSong = !songQ ||
            s.title.toLowerCase().includes(songQ) ||
            s.artist.toLowerCase().includes(songQ);

        const authorName = `${s.suggested_by.name} ${s.suggested_by.lastname || ''}`.toLowerCase();
        const matchesAuthor = !authorQ || authorName.includes(authorQ);

        const matchesStatus = statusQ === 'all' || s.status === statusQ;

        return matchesSong && matchesAuthor && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">No se encontraron sugerencias.</div>`;
        return;
    }

    const currentUser = getData('currentUser');
    const isLeader = canEdit();

    filtered.forEach(s => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';

        // Badge adaptativo a responsive (inicial en móvil)
        let statusBadge = '';
        if (s.status === 'pendiente') {
            statusBadge = '<span class="badge badge-warning"><span class="hide-mobile">Sugerida</span><span class="show-mobile">S</span></span>';
        } else if (s.status === 'ensayo') {
            statusBadge = '<span class="badge badge-primary"><span class="hide-mobile">En Ensayo</span><span class="show-mobile">E</span></span>';
        } else if (s.status === 'agregada') {
            statusBadge = '<span class="badge badge-success"><span class="hide-mobile">Agregada</span><span class="show-mobile">A</span></span>';
        }

        // Acciones administrativas (sólo si es líder y está pendiente)
        let adminActionHTML = '';
        if (isLeader && s.status === 'pendiente') {
            adminActionHTML = `
                <button class="btn btn-outline btn-sm btn-send-to-catalog" style="font-size:0.75rem; padding:4px 8px; display:inline-flex; align-items:center; gap:4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span class="hide-mobile">Enviar al Catálogo</span>
                </button>
            `;
        }

        // Botón de eliminar (sólo si es el creador de la propuesta y no está agregada)
        let deleteBtnHTML = '';
        if (s.suggested_by.id === currentUser?.id && s.status !== 'agregada') {
            deleteBtnHTML = `
                <button class="btn btn-outline btn-sm btn-delete-suggestion" style="color:var(--danger); border-color:rgba(239,68,68,0.2); padding:4px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span class="hide-mobile">Eliminar</span>
                </button>
            `;
        }

        // Corazones de votación
        const heartIcon = s.has_voted
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:var(--danger);"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

        const authorName = `${s.suggested_by.name} ${s.suggested_by.lastname || ''}`.trim();

        card.innerHTML = `
            <div class="suggestion-vote-box">
                <button class="btn-vote ${s.has_voted ? 'voted' : ''}" title="Me gusta">
                    ${heartIcon}
                </button>
                <span class="vote-count">${s.votes_count}</span>
            </div>
            <div class="suggestion-info-block" style="display:flex; flex-direction:column; gap:6px; min-width:0; flex:1;">
                <!-- Línea Superior: Título/Artista y Badge de Estado -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%; min-width:0; gap:12px;">
                    <div style="min-width:0; flex:1;">
                        <h4 style="font-size:1.05rem; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.title}</h4>
                        <p class="artist" style="margin:0; font-size:0.85rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">por ${s.artist}</p>
                    </div>
                    <div style="flex-shrink:0;">
                        ${statusBadge}
                    </div>
                </div>

                <!-- Línea Media: Notas a ancho completo -->
                <p class="notes" style="margin:0; width:100%; box-sizing:border-box;">${s.notes || 'Sin comentarios.'}</p>

                <!-- Línea Inferior: Autor (Nombre solo) y Botones de Acción -->
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:8px;">
                    <span class="author" style="font-size:0.75rem; color:var(--text-muted);">
                        <strong>${authorName}</strong>
                    </span>
                    <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                        ${deleteBtnHTML}
                        ${adminActionHTML}
                    </div>
                </div>
            </div>
        `;

        // Vote listener
        card.querySelector('.btn-vote').onclick = () => toggleSuggestionVote(s.id);

        // Delete button listener (si aplica)
        const deleteBtn = card.querySelector('.btn-delete-suggestion');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                suggestionIdToDelete = s.id;
                document.getElementById('modal-delete-suggestion-confirm').classList.remove('hidden');
            };
        }

        // Send to catalog button listener
        if (isLeader && s.status === 'pendiente') {
            card.querySelector('.btn-send-to-catalog').onclick = () => {
                // Navigate to songs hash
                window.location.hash = '#songs';

                // Open add song modal prefilled
                setTimeout(() => {
                    if (typeof openAddSongModal === 'function') {
                        openAddSongModal({
                            title: s.title,
                            artist: s.artist,
                            suggestionId: s.id
                        });
                    }
                }, 200);
            };
        }

        container.appendChild(card);
    });
}

async function toggleSuggestionVote(id) {
    try {
        const data = await apiFetch(`/suggestions/${id}/vote`, {
            method: 'POST'
        });

        if (data.has_voted) {
            showToast("¡Te gusta esta sugerencia!", "success");
        } else {
            showToast("Voto retirado");
        }

        // Update local cached state & re-render
        const idx = cachedSuggestions.findIndex(s => s.id === id);
        if (idx !== -1) {
            cachedSuggestions[idx].has_voted = data.has_voted;
            cachedSuggestions[idx].votes_count = data.votes_count;
        }
        renderSuggestionsList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function changeSuggestionStatus(id, newStatus) {
    try {
        await apiFetch(`/suggestions/${id}/status`, {
            method: 'PUT',
            body: { status: newStatus }
        });

        if (newStatus === 'agregada') {
            showToast(`La sugerencia se marcó como AGREGADA.`, "success");
        } else {
            showToast(`Estado cambiado a: ${newStatus}`);
        }

        // Update local cache
        const idx = cachedSuggestions.findIndex(s => s.id === id);
        if (idx !== -1) {
            cachedSuggestions[idx].status = newStatus;
        }
        renderSuggestionsList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function confirmDeleteSuggestion() {
    if (!suggestionIdToDelete) return;

    const confirmBtn = document.getElementById('btn-confirm-delete-suggestion');
    const originalText = confirmBtn ? confirmBtn.textContent : 'Eliminar';

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Eliminando...';
    }

    try {
        await apiFetch(`/suggestions/${suggestionIdToDelete}`, {
            method: 'DELETE'
        });

        showToast("Sugerencia eliminada correctamente", "success");
        document.getElementById('modal-delete-suggestion-confirm').classList.add('hidden');

        // Remove from local cache and render
        cachedSuggestions = cachedSuggestions.filter(s => s.id !== suggestionIdToDelete);
        suggestionIdToDelete = null;
        renderSuggestionsList();
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalText;
        }
    }
}

async function handleSuggestionFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Sugerir';

    const title = document.getElementById('suggestion-form-title').value.trim();
    const artist = document.getElementById('suggestion-form-artist').value.trim();
    const notes = document.getElementById('suggestion-form-notes').value.trim();

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
    }

    try {
        await apiFetch('/suggestions', {
            method: 'POST',
            body: { title, artist, notes }
        });

        showToast("Sugerencia compartida con el equipo", "success");
        document.getElementById('modal-suggestion').classList.add('hidden');
        await renderSuggestions(true); // force fresh list reload
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}
