/* ==========================================================================
   WorshipApp — SUGGESTIONS BOX CONTROLLER (API Connected)
   ========================================================================== */

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

    renderSuggestions();
}

async function renderSuggestions() {
    const container = document.getElementById('suggestions-container-list');
    container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">Cargando sugerencias...</div>`;

    try {
        const suggestions = await apiFetch('/suggestions') || [];
        container.innerHTML = '';

        if (suggestions.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">No hay sugerencias en la lista. ¡Sé el primero en proponer una!</div>`;
            return;
        }

        const isLeader = canEdit();

        suggestions.forEach(s => {
            const card = document.createElement('div');
            card.className = 'suggestion-card';

            let statusBadge = '';
            if (s.status === 'pendiente') statusBadge = '<span class="badge badge-warning">Sugerida</span>';
            if (s.status === 'ensayo') statusBadge = '<span class="badge badge-primary">En Ensayo</span>';
            if (s.status === 'agregada') statusBadge = '<span class="badge badge-success">Agregada</span>';

            // Admin actions inside suggestion card (only if user is leader/admin)
            let adminActionHTML = '';
            if (isLeader) {
                adminActionHTML = `
                    <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; align-items:flex-end;">
                        <select class="form-select-sm select-suggestion-status" style="font-size:0.75rem; padding:4px 8px; width:150px;">
                            <option value="pendiente" ${s.status === 'pendiente' ? 'selected' : ''}>Sugerida</option>
                            <option value="ensayo" ${s.status === 'ensayo' ? 'selected' : ''}>En Ensayo</option>
                            <option value="agregada" ${s.status === 'agregada' ? 'selected' : ''}>Añadida al Catálogo</option>
                        </select>
                        <button class="btn btn-outline btn-sm btn-send-to-catalog" style="font-size:0.75rem; padding:4px 8px; width:150px; justify-content:center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Enviar al Catálogo
                        </button>
                    </div>
                `;
            }

            // Heart Icon voting (❤️ solid if voted, outline if not)
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
                <div class="suggestion-info-block">
                    <h4>${s.title}</h4>
                    <p class="artist">por ${s.artist}</p>
                    <p class="notes">${s.notes || 'Sin comentarios.'}</p>
                    <span class="author">Propuesto por: <strong>${authorName}</strong></span>
                </div>
                <div class="suggestion-actions">
                    ${statusBadge}
                    ${adminActionHTML}
                </div>
            `;

            // Vote listener
            card.querySelector('.btn-vote').onclick = () => toggleSuggestionVote(s.id);

            if (isLeader) {
                // Status changer select listener
                card.querySelector('.select-suggestion-status').onchange = (e) => {
                    changeSuggestionStatus(s.id, e.target.value);
                };

                // Enviar al catálogo button listener
                card.querySelector('.btn-send-to-catalog').onclick = () => {
                    // Navigate to songs hash
                    window.location.hash = '#songs';
                    
                    // Open add song modal prefilled
                    setTimeout(() => {
                        if (typeof openAddSongModal === 'function') {
                            openAddSongModal({
                                title: s.title,
                                artist: s.artist
                            });
                        }
                    }, 200);
                };
            }

            container.appendChild(card);
        });
    } catch (e) {
        console.error("Error loading suggestions:", e);
        container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--danger);">Fallo al cargar sugerencias musicales.</div>`;
    }
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

        await renderSuggestions();
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

        await renderSuggestions();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleSuggestionFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('suggestion-form-title').value.trim();
    const artist = document.getElementById('suggestion-form-artist').value.trim();
    const notes = document.getElementById('suggestion-form-notes').value.trim();

    try {
        await apiFetch('/suggestions', {
            method: 'POST',
            body: { title, artist, notes }
        });

        showToast("Sugerencia compartida con el equipo", "success");
        document.getElementById('modal-suggestion').classList.add('hidden');
        await renderSuggestions();
    } catch (err) {
        showToast(err.message, "danger");
    }
}
