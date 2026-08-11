/* ==========================================================================
   WorshipApp — SONGS CATALOG & VISOR CONTROLLER (API Connected)
   ========================================================================== */

let songsSearchQuery = "";
let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;
let cachedSongs = [];
let songIdToDelete = null;

window.openSongFormModal = openAddSongModal;
window.openAddSongModal = openAddSongModal;

function openAddSongModal(prefilledData = null) {
    document.getElementById('song-modal-title').textContent = "Agregar Nueva Canción";
    document.getElementById('song-form-id').value = "";
    document.getElementById('song-form-suggestion-id').value = "";
    document.getElementById('song-form').reset();
    document.getElementById('btn-delete-song').classList.add('hidden');
    
    if (prefilledData) {
        document.getElementById('song-form-title').value = prefilledData.title || '';
        document.getElementById('song-form-artist').value = prefilledData.artist || '';
        if (prefilledData.suggestionId) {
            document.getElementById('song-form-suggestion-id').value = prefilledData.suggestionId;
        }
    }
    
    document.getElementById('modal-song').classList.remove('hidden');
}

function initSongsView() {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    // Stop autoscroll and show catalog subpanel
    stopAutoScroll();
    const subpanelDetail = document.getElementById('subpanel-song-detail');
    const subpanelList = document.getElementById('subpanel-songs-list');
    if (subpanelDetail) subpanelDetail.classList.add('hidden');
    if (subpanelList) subpanelList.classList.remove('hidden');
    currentViewingSong = null;
    transposeOffset = 0;

    const searchInput = document.getElementById('song-search-input') || document.getElementById('songs-search-input');
    if (searchInput) {
        songsSearchQuery = "";
        searchInput.value = "";
        searchInput.removeEventListener('input', handleSongsSearch);
        searchInput.addEventListener('input', handleSongsSearch);
    }

    // Add song button visibility
    const addSongBtn = document.getElementById('btn-add-song');
    if (addSongBtn) {
        if (canEdit()) {
            addSongBtn.classList.remove('hidden');
            addSongBtn.style.display = 'flex';
            addSongBtn.onclick = () => openAddSongModal();
        } else {
            addSongBtn.classList.add('hidden');
            addSongBtn.style.display = 'none';
        }

    }

    // Modal Close Triggers
    document.querySelectorAll('#modal-song .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-song').classList.add('hidden');
    });
    const closeXSong = document.getElementById('btn-close-song-modal-x');
    if (closeXSong) {
        closeXSong.onclick = () => document.getElementById('modal-song').classList.add('hidden');
    }

    // Confirm Delete Song Modal triggers
    document.querySelectorAll('#modal-delete-song-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-song-confirm').classList.add('hidden');
    });
    const closeXDeleteSong = document.getElementById('btn-close-delete-song-modal-x');
    if (closeXDeleteSong) {
        closeXDeleteSong.onclick = () => document.getElementById('modal-delete-song-confirm').classList.add('hidden');
    }
    const confirmDeleteSongBtn = document.getElementById('btn-confirm-delete-song');
    if (confirmDeleteSongBtn) {
        confirmDeleteSongBtn.onclick = executeDeleteSong;
    }
    
    // Song form submit
    const songForm = document.getElementById('song-form');
    if (songForm) songForm.onsubmit = handleSongFormSubmit;

    // Transpose and auto-scroll control buttons
    const btnTransposeUp = document.getElementById('btn-transpose-up');
    if (btnTransposeUp) {
        btnTransposeUp.onclick = () => {
            transposeOffset = (transposeOffset + 1) % 12;
            renderTransposedLyrics();
        };
    }

    const btnTransposeDown = document.getElementById('btn-transpose-down');
    if (btnTransposeDown) {
        btnTransposeDown.onclick = () => {
            transposeOffset = (transposeOffset - 1 + 12) % 12;
            renderTransposedLyrics();
        };
    }

    const btnTransposeReset = document.getElementById('btn-transpose-reset');
    if (btnTransposeReset) {
        btnTransposeReset.onclick = () => {
            transposeOffset = 0;
            renderTransposedLyrics();
        };
    }

    const btnBackToSongs = document.getElementById('back-to-songs');
    if (btnBackToSongs) {
        btnBackToSongs.onclick = () => {
            stopAutoScroll();
            document.getElementById('subpanel-song-detail').classList.add('hidden');
            document.getElementById('subpanel-songs-list').classList.remove('hidden');
            const pageTitleElem = document.getElementById('current-page-title');
            if (pageTitleElem) pageTitleElem.textContent = 'Catálogo de Canciones';
        };
    }

    const btnScrollToggle = document.getElementById('btn-scroll-toggle');
    if (btnScrollToggle) {
        btnScrollToggle.onclick = () => {
            if (isScrolling) {
                stopAutoScroll();
            } else {
                startAutoScroll();
            }
        };
    }

    // Render list initially
    renderSongsCatalog(true);
}

function handleSongsSearch(e) {
    songsSearchQuery = e.target.value;
    renderSongsCatalog(false);
}

async function renderSongsCatalog(forceRefresh = false) {
    const list = document.getElementById('songs-catalog-list') || document.getElementById('songs-list-container');
    if (!list) return;
    
    list.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">Cargando canciones del catálogo...</div>`;

    if (forceRefresh || cachedSongs.length === 0) {
        try {
            cachedSongs = await apiFetch('/songs') || [];
        } catch (e) {
            console.error("Error fetching songs:", e);
            list.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-red-500">Error al conectar con la base de datos.</div>`;
            return;
        }
    }

    list.innerHTML = '';
    const query = songsSearchQuery.toLowerCase().trim();
    const filtered = cachedSongs.filter(s => 
        (s.title && s.title.toLowerCase().includes(query)) || 
        (s.artist && s.artist.toLowerCase().includes(query)) || 
        (s.key && s.key.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron canciones en el catálogo.</div>`;
        return;
    }

    const editAllowed = canEdit();

    filtered.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex items-center justify-between cursor-pointer group';
        card.innerHTML = `
            <div class="space-y-0.5">
                <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition">${s.title}</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">${s.artist || 'Artista no especificado'}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">${s.key || 'C'}</span>
                ${editAllowed ? `
                <button type="button" class="btn-edit-song-trigger p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition" data-id="${s.id}" title="Editar">
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                </button>
                <button type="button" class="btn-delete-song-trigger p-2 text-zinc-400 hover:text-red-600 transition" data-id="${s.id}" title="Eliminar">
                    <i class="fa-solid fa-trash text-xs pointer-events-none"></i>
                </button>
                ` : ''}
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.btn-edit-song-trigger') || e.target.closest('.btn-delete-song-trigger')) return;
            viewSongDetail(s.id);
        };

        if (editAllowed) {
            const btnEdit = card.querySelector('.btn-edit-song-trigger');
            if (btnEdit) {
                btnEdit.onclick = (e) => {
                    e.stopPropagation();
                    openEditSongModal(s.id);
                };
            }
            const btnDelete = card.querySelector('.btn-delete-song-trigger');
            if (btnDelete) {
                btnDelete.onclick = (e) => {
                    e.stopPropagation();
                    handleDeleteSong(s.id, s.title);
                };
            }
        }

        list.appendChild(card);
    });
}


function openAddSongModal(prefilledData = null) {
    document.getElementById('song-modal-title').textContent = "Agregar Nueva Canción";
    document.getElementById('song-form-id').value = "";
    document.getElementById('song-form-suggestion-id').value = "";
    document.getElementById('song-form').reset();
    document.getElementById('btn-delete-song').style.display = 'none';
    
    if (prefilledData) {
        document.getElementById('song-form-title').value = prefilledData.title || '';
        document.getElementById('song-form-artist').value = prefilledData.artist || '';
        if (prefilledData.suggestionId) {
            document.getElementById('song-form-suggestion-id').value = prefilledData.suggestionId;
        }
    }
    
    document.getElementById('modal-song').classList.remove('hidden');
}

function openEditSongModal(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;

    document.getElementById('song-modal-title').textContent = "Editar Canción";
    document.getElementById('song-form-id').value = song.id;
    document.getElementById('song-form-suggestion-id').value = ""; // No aplica para edición
    document.getElementById('song-form-title').value = song.title;
    document.getElementById('song-form-key').value = song.key;
    document.getElementById('song-form-artist').value = song.artist;
    document.getElementById('song-form-url').value = song.url || '';
    document.getElementById('song-form-content').value = song.content || '';

    // Show delete button for Leaders
    const deleteBtn = document.getElementById('btn-delete-song');
    if (canEdit()) {
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.onclick = () => handleDeleteSong(song.id, song.title);
    } else {
        deleteBtn.style.display = 'none';
    }

    document.getElementById('modal-song').classList.remove('hidden');
}

function formatMusicalKey(val) {
    if (!val) return '';
    val = val.trim();
    if (val.length === 0) return '';
    
    let first = val.charAt(0).toUpperCase();
    
    if (val.length > 1) {
        let second = val.charAt(1);
        if (second === '#' || second === 's' || second === 'S') {
            second = '#';
        } else if (second === 'b' || second === 'B') {
            second = 'b';
        }
        return first + second + val.substring(2);
    }
    
    return first;
}

async function handleSongFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('song-form-id').value;
    const suggestionId = document.getElementById('song-form-suggestion-id').value;
    const title = document.getElementById('song-form-title').value.trim();
    const key = formatMusicalKey(document.getElementById('song-form-key').value);
    const artist = document.getElementById('song-form-artist').value.trim();
    const url = document.getElementById('song-form-url').value.trim();
    const content = document.getElementById('song-form-content').value.trim();

    try {
        if (id) {
            // Edit existing
            await apiFetch(`/songs/${id}`, {
                method: 'PUT',
                body: { title, key, artist, url, content }
            });
            showToast("Canción actualizada correctamente");
        } else {
            // Create new
            const finalContent = content || `[Intro]\n[${key}]\n\n[Verso 1]\nEscribe la letra aquí`;
            await apiFetch('/songs', {
                method: 'POST',
                body: { title, key, artist, url, content: finalContent }
            });
            showToast("Canción guardada con éxito");

            // Si vino de una sugerencia, la marcamos automáticamente como agregada
            if (suggestionId) {
                try {
                    await apiFetch(`/suggestions/${suggestionId}/status`, {
                        method: 'PUT',
                        body: { status: 'agregada' }
                    });
                } catch (sugErr) {
                    console.error("Error al actualizar estado de sugerencia:", sugErr);
                }
            }
        }

        document.getElementById('modal-song').classList.add('hidden');
        await renderSongsCatalog(true); // force reload list
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleDeleteSong(songId, songTitle) {
    songIdToDelete = songId;
    
    const modalNameEl = document.getElementById('delete-song-modal-name');
    if (modalNameEl) {
        modalNameEl.textContent = songTitle;
    }
    
    document.getElementById('modal-delete-song-confirm').classList.remove('hidden');
}

async function executeDeleteSong() {
    if (!songIdToDelete) return;

    const btn = document.getElementById('btn-confirm-delete-song');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
        await apiFetch(`/songs/${songIdToDelete}`, {
            method: 'DELETE'
        });
        
        showToast("Canción eliminada del catálogo");
        
        document.getElementById('modal-delete-song-confirm').classList.add('hidden');
        document.getElementById('modal-song').classList.add('hidden');
        
        await renderSongsCatalog(true);
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Eliminar';
        songIdToDelete = null;
    }
}

function viewSongDetail(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;

    currentViewingSong = song;
    transposeOffset = 0; // reset
    stopAutoScroll();

    const titleEl = document.getElementById('song-detail-title');
    if (titleEl) titleEl.textContent = song.title;

    const artistEl = document.getElementById('song-detail-artist');
    if (artistEl) artistEl.textContent = song.artist;

    const origKeyEl = document.getElementById('song-detail-original-key');
    if (origKeyEl) origKeyEl.textContent = song.key;

    const curKeyEl = document.getElementById('song-current-key');
    if (curKeyEl) curKeyEl.textContent = song.key;

    // Render media link
    const mediaWrap = document.getElementById('song-media-links');
    if (mediaWrap) {
        mediaWrap.innerHTML = '';
        if (song.url) {
            mediaWrap.innerHTML = `
                <a href="${song.url}" target="_blank" class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition inline-flex items-center gap-1.5">
                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    <span>Audio / Video</span>
                </a>
            `;
        }
    }


    renderTransposedLyrics();
    
    // Switch sub-panels
    const subpanelList = document.getElementById('subpanel-songs-list');
    if (subpanelList) subpanelList.classList.add('hidden');
    const subpanelDetail = document.getElementById('subpanel-song-detail');
    if (subpanelDetail) subpanelDetail.classList.remove('hidden');
    
    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Letra y Acordes';

    // Activar modo visor expandido en móvil (fallback para :has())
    document.querySelector('.app-content')?.classList.add('song-detail-mode');
}

function renderTransposedLyrics() {
    if (!currentViewingSong) return;
    const lyricsContent = document.getElementById('chords-lyrics-content');
    
    // Parse chords inside brackets using the transposeOffset from transposer.js
    const parsedHTML = parseChordsToHTML(currentViewingSong.content, transposeOffset);
    lyricsContent.innerHTML = parsedHTML;

    // Update Tonality display
    const currentKey = transposeChord(currentViewingSong.key, transposeOffset);
    document.getElementById('song-current-key').textContent = currentKey;
}

function startAutoScroll() {
    isScrolling = true;
    const toggleBtn = document.getElementById('btn-scroll-toggle');
    toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    toggleBtn.style.backgroundColor = "var(--primary-soft)";
    toggleBtn.style.color = "var(--primary)";
    
    const speed = parseInt(document.getElementById('scroll-speed-select').value);
    let intervalMs = 100; // Velocidad x1 (más pausado)
    if (speed === 2) intervalMs = 50;  // Velocidad x2 (intermedio)
    if (speed === 3) intervalMs = 30;  // Velocidad x3 (más rápido)

    const container = document.getElementById('lyrics-container');
    scrollInterval = setInterval(() => {
        container.scrollTop += 1;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
            stopAutoScroll();
        }
    }, intervalMs);
}

function stopAutoScroll() {
    isScrolling = false;
    if (scrollInterval) clearInterval(scrollInterval);
    const toggleBtn = document.getElementById('btn-scroll-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        toggleBtn.style.backgroundColor = "var(--bg-input)";
        toggleBtn.style.color = "var(--text-main)";
    }
}
