/* ==========================================================================
   WorshipApp — SONGS CATALOG & VISOR CONTROLLER (API Connected)
   ========================================================================== */

let songsSearchQuery = "";
let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;
let cachedSongs = [];

function initSongsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Asegurar volver al listado de canciones y detener autoscroll al navegar o volver a esta sección
    stopAutoScroll();
    const subpanelDetail = document.getElementById('subpanel-song-detail');
    const subpanelList = document.getElementById('subpanel-songs-list');
    if (subpanelDetail) subpanelDetail.classList.add('hidden');
    if (subpanelList) subpanelList.classList.remove('hidden');
    document.querySelector('.app-content')?.classList.remove('song-detail-mode');
    currentViewingSong = null;
    transposeOffset = 0;

    const searchInput = document.getElementById('songs-search-input');
    
    // Reset search
    songsSearchQuery = "";
    searchInput.value = "";
    
    // Setup search listener
    searchInput.removeEventListener('input', handleSongsSearch);
    searchInput.addEventListener('input', handleSongsSearch);

    // Add song button visibility
    const addSongBtn = document.getElementById('btn-add-song');
    if (canEdit()) {
        addSongBtn.style.display = 'inline-flex';
        addSongBtn.onclick = () => openAddSongModal();
    } else {
        addSongBtn.style.display = 'none';
    }

    // Modal Close Triggers
    document.querySelectorAll('#modal-song .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-song').classList.add('hidden');
    });
    document.getElementById('btn-close-song-modal-x').onclick = () => {
        document.getElementById('modal-song').classList.add('hidden');
    };
    
    // Song form submit
    document.getElementById('song-form').onsubmit = handleSongFormSubmit;

    // Transpose and auto-scroll control buttons
    document.getElementById('btn-transpose-up').onclick = () => {
        transposeOffset = (transposeOffset + 1) % 12;
        renderTransposedLyrics();
    };

    document.getElementById('btn-transpose-down').onclick = () => {
        transposeOffset = (transposeOffset - 1 + 12) % 12;
        renderTransposedLyrics();
    };

    document.getElementById('btn-transpose-reset').onclick = () => {
        transposeOffset = 0;
        renderTransposedLyrics();
    };

    document.getElementById('back-to-songs').onclick = () => {
        stopAutoScroll();
        document.getElementById('subpanel-song-detail').classList.add('hidden');
        document.getElementById('subpanel-songs-list').classList.remove('hidden');
        document.getElementById('current-page-title').textContent = 'Catálogo de Canciones';
        // Restaurar padding del contenedor principal
        document.querySelector('.app-content')?.classList.remove('song-detail-mode');
    };

    document.getElementById('btn-scroll-toggle').onclick = () => {
        if (isScrolling) {
            stopAutoScroll();
        } else {
            startAutoScroll();
        }
    };

    // Render list initially
    renderSongsCatalog(true); // force first load
}

function handleSongsSearch(e) {
    songsSearchQuery = e.target.value;
    renderSongsCatalog(false); // local filter from cached
}

async function renderSongsCatalog(forceRefresh = false) {
    const list = document.getElementById('songs-catalog-list');
    list.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">Cargando catálogo...</div>`;

    if (forceRefresh || cachedSongs.length === 0) {
        try {
            cachedSongs = await apiFetch('/songs') || [];
        } catch (e) {
            console.error("Error fetching songs:", e);
            list.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--danger);">Error al conectar con la base de datos.</div>`;
            return;
        }
    }

    list.innerHTML = '';
    const query = songsSearchQuery.toLowerCase().trim();
    const filtered = cachedSongs.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.artist.toLowerCase().includes(query) || 
        s.key.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">No se encontraron canciones.</div>`;
        return;
    }

    const editAllowed = canEdit();

    filtered.forEach(s => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-card-info">
                <h4>${s.title}</h4>
                <p>${s.artist}</p>
            </div>
            <div class="song-card-meta">
                <span class="song-key-badge">${s.key}</span>
                <button class="song-action-btn btn-edit-song-trigger" data-id="${s.id}" title="Editar" style="display: ${editAllowed ? 'flex' : 'none'};">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.song-action-btn')) return;
            viewSongDetail(s.id);
        };

        if (editAllowed) {
            card.querySelector('.btn-edit-song-trigger').onclick = (e) => {
                e.stopPropagation();
                openEditSongModal(s.id);
            };
        }

        list.appendChild(card);
    });
}

function openAddSongModal(prefilledData = null) {
    document.getElementById('song-modal-title').textContent = "Agregar Nueva Canción";
    document.getElementById('song-form-id').value = "";
    document.getElementById('song-form').reset();
    document.getElementById('btn-delete-song').style.display = 'none';
    
    if (prefilledData) {
        document.getElementById('song-form-title').value = prefilledData.title || '';
        document.getElementById('song-form-artist').value = prefilledData.artist || '';
    }
    
    document.getElementById('modal-song').classList.remove('hidden');
}

function openEditSongModal(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;

    document.getElementById('song-modal-title').textContent = "Editar Canción";
    document.getElementById('song-form-id').value = song.id;
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

async function handleSongFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('song-form-id').value;
    const title = document.getElementById('song-form-title').value.trim();
    const key = document.getElementById('song-form-key').value.toUpperCase().trim();
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
        }

        document.getElementById('modal-song').classList.add('hidden');
        await renderSongsCatalog(true); // force reload list
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleDeleteSong(songId, songTitle) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la canción "${songTitle}"?`)) {
        return;
    }

    try {
        await apiFetch(`/songs/${songId}`, {
            method: 'DELETE'
        });
        showToast("Canción eliminada del catálogo");
        document.getElementById('modal-song').classList.add('hidden');
        await renderSongsCatalog(true);
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function viewSongDetail(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;

    currentViewingSong = song;
    transposeOffset = 0; // reset
    stopAutoScroll();

    document.getElementById('song-detail-title').textContent = song.title;
    document.getElementById('song-detail-artist').textContent = song.artist;
    document.getElementById('song-detail-original-key').textContent = song.key;
    document.getElementById('song-current-key').textContent = song.key;

    // Render media link
    const mediaWrap = document.getElementById('song-media-links');
    mediaWrap.innerHTML = '';
    if (song.url) {
        mediaWrap.innerHTML = `
            <a href="${song.url}" target="_blank" class="btn btn-outline btn-sm" style="color: var(--secondary); border-color: rgba(6,182,212,0.3);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>Video/Audio</span>
            </a>
        `;
    }

    renderTransposedLyrics();
    
    // Switch sub-panels
    document.getElementById('subpanel-songs-list').classList.add('hidden');
    document.getElementById('subpanel-song-detail').classList.remove('hidden');
    document.getElementById('current-page-title').textContent = 'Letra y Acordes';
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
