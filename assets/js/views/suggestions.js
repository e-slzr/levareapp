/* ==========================================================================
   WorshipApp — SUGGESTIONS BOX CONTROLLER (API Connected)
   ========================================================================== */

let cachedSuggestions = [];
let filterSongQuery = "";
let filterAuthorQuery = "";
let filterStatus = "all";
let suggestionIdToDelete = null;
let suggestionsVisibleLimit = 12;
const SUGGESTIONS_PAGE_SIZE = 12;

function initSuggestionsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Add suggestion button
    const addBtn = document.getElementById('btn-add-suggestion');
    if (addBtn) {
        addBtn.onclick = () => {
            const form = document.getElementById('suggestion-form');
            if (form) form.reset();
            const modal = document.getElementById('modal-suggestion');
            if (modal) modal.classList.remove('hidden');
        };
    }

    // Modal Close triggers
    document.querySelectorAll('#modal-suggestion .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-suggestion').classList.add('hidden');
    });
    const closeX = document.getElementById('btn-close-suggestion-modal-x');
    if (closeX) {
        closeX.onclick = () => document.getElementById('modal-suggestion').classList.add('hidden');
    }

    // Form submit
    const form = document.getElementById('suggestion-form');
    if (form) form.onsubmit = handleSuggestionFormSubmit;

    // Reset filters
    filterSongQuery = "";
    filterAuthorQuery = "";
    filterStatus = "all";
    suggestionIdToDelete = null;
    suggestionsVisibleLimit = SUGGESTIONS_PAGE_SIZE;

    const filterSongInput = document.getElementById('suggestions-filter-song');
    const filterAuthorInput = document.getElementById('suggestions-filter-author');
    const filterStatusSelect = document.getElementById('suggestions-filter-status');

    if (filterSongInput) {
        filterSongInput.value = "";
        filterSongInput.oninput = (e) => {
            filterSongQuery = e.target.value;
            suggestionsVisibleLimit = SUGGESTIONS_PAGE_SIZE;
            renderSuggestionsList();
        };
    }
    if (filterAuthorInput) {
        filterAuthorInput.value = "";
        filterAuthorInput.oninput = (e) => {
            filterAuthorQuery = e.target.value;
            suggestionsVisibleLimit = SUGGESTIONS_PAGE_SIZE;
            renderSuggestionsList();
        };
    }
    if (filterStatusSelect) {
        filterStatusSelect.value = "all";
        filterStatusSelect.onchange = (e) => {
            filterStatus = e.target.value;
            suggestionsVisibleLimit = SUGGESTIONS_PAGE_SIZE;
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
    if (!container) return;

    if (forceRefresh || cachedSuggestions.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">Cargando sugerencias...</div>`;
        try {
            cachedSuggestions = await apiFetch('/suggestions') || [];
        } catch (e) {
            console.error("Error loading suggestions:", e);
            container.innerHTML = `<div class="text-center py-12 text-xs text-red-500">Fallo al cargar sugerencias musicales.</div>`;
            return;
        }
    }

    renderSuggestionsList();
}

function getAuthorFullName(s) {
    if (s.suggested_by_name) {
        return `${s.suggested_by_name} ${s.suggested_by_lastname || ''}`.trim();
    }
    if (s.suggested_by_user && s.suggested_by_user.name) {
        return `${s.suggested_by_user.name} ${s.suggested_by_user.lastname || ''}`.trim();
    }
    if (typeof s.suggested_by === 'object' && s.suggested_by && s.suggested_by.name) {
        return `${s.suggested_by.name} ${s.suggested_by.lastname || ''}`.trim();
    }
    return 'Miembro';
}

function getCreatorId(s) {
    if (typeof s.suggested_by === 'object' && s.suggested_by && s.suggested_by.id) {
        return parseInt(s.suggested_by.id);
    }
    if (s.suggested_by_user && s.suggested_by_user.id) {
        return parseInt(s.suggested_by_user.id);
    }
    return parseInt(s.suggested_by);
}

function renderSuggestionsList() {
    const container = document.getElementById('suggestions-container-list');
    const loadMoreContainer = document.getElementById('suggestions-load-more-container');
    const btnLoadMore = document.getElementById('btn-suggestions-load-more');
    if (!container) return;
    container.innerHTML = '';

    const songQ = filterSongQuery.toLowerCase().trim();
    const authorQ = filterAuthorQuery.toLowerCase().trim();
    const statusQ = filterStatus;

    const filtered = cachedSuggestions.filter(s => {
        const matchesSong = !songQ ||
            (s.title && s.title.toLowerCase().includes(songQ)) ||
            (s.artist && s.artist.toLowerCase().includes(songQ));

        const authorName = getAuthorFullName(s).toLowerCase();
        const matchesAuthor = !authorQ || authorName.includes(authorQ);

        const matchesStatus = statusQ === 'all' || s.status === statusQ;

        return matchesSong && matchesAuthor && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron sugerencias.</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const currentUser = getData('currentUser');
    const isLeader = canEdit();
    const visibleItems = filtered.slice(0, suggestionsVisibleLimit);

    visibleItems.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex gap-3.5 items-start';

        // Status badge
        let statusBadge = '';
        if (s.status === 'pendiente') {
            statusBadge = '<span class="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">Sugerida</span>';
        } else if (s.status === 'ensayo') {
            statusBadge = '<span class="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">En Ensayo</span>';
        } else if (s.status === 'agregada') {
            statusBadge = '<span class="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">Agregada</span>';
        }

        // Admin action (solo si es líder y está pendiente)
        let adminActionHTML = '';
        if (isLeader && s.status === 'pendiente') {
            adminActionHTML = `
                <button class="btn-send-to-catalog px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition cursor-pointer">
                    <i class="fa-solid fa-plus text-[10px]"></i> Añadir al Catálogo
                </button>
            `;
        }

        // Delete button (Solo si el usuario logueado es el CREADOR de la sugerencia)
        const creatorId = getCreatorId(s);
        const isCreator = currentUser && (parseInt(currentUser.id) === creatorId);
        let deleteBtnHTML = '';
        if (isCreator && s.status !== 'agregada') {
            deleteBtnHTML = `
                <button class="btn-delete-suggestion px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-1.5 transition cursor-pointer" title="Eliminar sugerencia">
                    <i class="fa-solid fa-trash-can text-[10px]"></i> Eliminar
                </button>
            `;
        }

        // Votes and Has Voted
        const votesCount = (s.votes_count !== undefined && s.votes_count !== null) ? parseInt(s.votes_count) : (s.votes ? s.votes.length : 0);
        const hasVoted = Boolean(s.has_voted);

        // Heart / vote icon
        const heartIcon = hasVoted
            ? `<i class="fa-solid fa-heart text-red-500 text-sm"></i>`
            : `<i class="fa-regular fa-heart text-zinc-400 dark:text-zinc-500 text-sm"></i>`;

        const authorFullName = getAuthorFullName(s);

        card.innerHTML = `
            <!-- Vote Column -->
            <button class="btn-vote flex flex-col items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800/80 hover:scale-105 transition active:scale-95 cursor-pointer" title="${hasVoted ? 'Quitar voto' : 'Me gusta'}">
                ${heartIcon}
                <span class="vote-count text-[10px] font-bold mt-0.5 ${hasVoted ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}">${votesCount}</span>
            </button>

            <!-- Content -->
            <div class="flex-1 min-w-0 space-y-1.5">
                <!-- Title row -->
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">${s.title}</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">por ${s.artist}</p>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        ${statusBadge}
                    </div>
                </div>

                <!-- Notes -->
                ${s.notes ? `<p class="text-xs text-zinc-600 dark:text-zinc-400">${s.notes}</p>` : ''}

                <!-- Footer -->
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span class="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Sugerido por <strong class="text-zinc-700 dark:text-zinc-300">${authorFullName}</strong>
                    </span>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        ${deleteBtnHTML}
                        ${adminActionHTML}
                    </div>
                </div>
            </div>
        `;

        // Vote listener
        const voteBtn = card.querySelector('.btn-vote');
        if (voteBtn) voteBtn.onclick = () => toggleSuggestionVote(s.id);

        // Delete listener
        const deleteBtn = card.querySelector('.btn-delete-suggestion');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                suggestionIdToDelete = s.id;
                const modal = document.getElementById('modal-delete-suggestion-confirm');
                if (modal) modal.classList.remove('hidden');
            };
        }

        // Send to catalog listener
        const catalogBtn = card.querySelector('.btn-send-to-catalog');
        if (catalogBtn) {
            catalogBtn.onclick = () => {
                window.location.hash = '#songs';
                setTimeout(() => {
                    if (typeof openAddSongModal === 'function') {
                        openAddSongModal({ title: s.title, artist: s.artist, suggestionId: s.id });
                    }
                }, 200);
            };
        }

        container.appendChild(card);
    });

    // Controlar botón Cargar más
    if (loadMoreContainer && btnLoadMore) {
        if (filtered.length > suggestionsVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                suggestionsVisibleLimit += SUGGESTIONS_PAGE_SIZE;
                renderSuggestionsList();
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
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
        const modal = document.getElementById('modal-delete-suggestion-confirm');
        if (modal) modal.classList.add('hidden');

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

    const titleInput = document.getElementById('suggestion-form-title');
    const artistInput = document.getElementById('suggestion-form-artist');
    const notesInput = document.getElementById('suggestion-form-notes');
    const urlInput = document.getElementById('suggestion-form-url');

    const title = titleInput ? titleInput.value.trim() : '';
    const artist = artistInput ? artistInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';

    if (!title || !artist) {
        showToast("Por favor completa el título y artista.", "warning");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
    }

    try {
        await apiFetch('/suggestions', {
            method: 'POST',
            body: { title, artist, notes, url }
        });

        showToast("Sugerencia compartida con el equipo", "success");
        const modal = document.getElementById('modal-suggestion');
        if (modal) modal.classList.add('hidden');
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
