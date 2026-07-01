/* ==========================================================================
   Levare — SETLISTS (REPERTORIOS) CONTROLLER (API Connected)
   ========================================================================== */

let setlistSearchQuery = "";
let cachedSetlists = [];
let allSongs = [];
let selectedSongIds = new Set();
let setlistSearchSongQuery = "";

// Presentation view state variables
let currentPresentationSetlist = null;
let currentPresentationSong = null;
let presTransposeOffset = 0;
let presIsScrolling = false;
let presScrollInterval = null;

function initSetlistsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    const searchInput = document.getElementById('setlists-search-input');
    const songSearchInput = document.getElementById('setlist-song-search');
    
    // Reset filters
    setlistSearchQuery = "";
    searchInput.value = "";
    if (songSearchInput) {
        songSearchInput.value = "";
        setlistSearchSongQuery = "";
    }

    // Event listeners
    searchInput.removeEventListener('input', handleSetlistsSearch);
    searchInput.addEventListener('input', handleSetlistsSearch);

    if (songSearchInput) {
        songSearchInput.removeEventListener('input', handleSetlistSongSearch);
        songSearchInput.addEventListener('input', handleSetlistSongSearch);
    }

    // Create setlist button visibility
    const createBtn = document.getElementById('btn-create-setlist');
    if (canEdit()) {
        createBtn.style.display = 'inline-flex';
        createBtn.onclick = openCreateSetlistModal;
    } else {
        createBtn.style.display = 'none';
    }

    // Modal Close triggers
    document.querySelectorAll('#modal-setlist .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-setlist').classList.add('hidden');
    });
    document.getElementById('btn-close-setlist-modal-x').onclick = () => {
        document.getElementById('modal-setlist').classList.add('hidden');
    };

    // Presentation view controls listeners
    const btnPresBack = document.getElementById('btn-presentation-back');
    if (btnPresBack) btnPresBack.onclick = closeSetlistPresentation;

    const btnPresDown = document.getElementById('btn-pres-transpose-down');
    if (btnPresDown) btnPresDown.onclick = () => transposePresSong(-1);

    const btnPresUp = document.getElementById('btn-pres-transpose-up');
    if (btnPresUp) btnPresUp.onclick = () => transposePresSong(1);

    const btnPresReset = document.getElementById('btn-pres-transpose-reset');
    if (btnPresReset) btnPresReset.onclick = resetPresSongTranspose;

    const btnPresScroll = document.getElementById('btn-pres-scroll-toggle');
    if (btnPresScroll) btnPresScroll.onclick = togglePresScroll;

    const selectPresSpeed = document.getElementById('pres-scroll-speed-select');
    if (selectPresSpeed) {
        selectPresSpeed.onchange = () => {
            if (presIsScrolling) {
                stopPresScroll();
                startPresScroll();
            }
        };
    }

    const btnPresToggleSongs = document.getElementById('btn-toggle-presentation-songs');
    if (btnPresToggleSongs) btnPresToggleSongs.onclick = togglePresentationSongsSidebar;

    // Form submit
    document.getElementById('setlist-form').onsubmit = handleSetlistFormSubmit;

    // Delete setlist action
    const deleteBtn = document.getElementById('btn-delete-setlist');
    if (deleteBtn) {
        deleteBtn.onclick = handleDeleteSetlist;
    }

    renderSetlists(true); // force first load
}

function handleSetlistsSearch(e) {
    setlistSearchQuery = e.target.value;
    renderSetlists(false);
}

function handleSetlistSongSearch(e) {
    setlistSearchSongQuery = e.target.value;
    renderModalSongsSelection();
}

async function renderSetlists(forceRefresh = false) {
    const container = document.getElementById('setlists-container');
    container.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">Cargando repertorios...</div>`;

    if (forceRefresh || cachedSetlists.length === 0) {
        try {
            cachedSetlists = await apiFetch('/setlists') || [];
        } catch (e) {
            console.error("Error loading setlists:", e);
            container.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--danger);">Fallo al cargar repertorios de la base de datos.</div>`;
            return;
        }
    }

    container.innerHTML = '';
    const query = setlistSearchQuery.toLowerCase().trim();

    // Filter setlists from cache
    const filtered = cachedSetlists.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query));
        return matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">No se encontraron repertorios.</div>`;
        return;
    }

    filtered.forEach(s => {
        const card = document.createElement('div');
        card.className = 'setlist-card';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        
        // Add card hover styling programmatically
        card.onmouseenter = () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        };
        card.onmouseleave = () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        };

        let songItemsHTML = '';
        if (s.songs && s.songs.length > 0) {
            // Render only first 2 songs
            const firstTwoSongs = s.songs.slice(0, 2);
            firstTwoSongs.forEach(song => {
                songItemsHTML += `
                    <div class="song-preview-item">
                        <span class="title">${song.title}</span>
                        <span class="key">${song.key}</span>
                    </div>
                `;
            });

            // If there are more than 2, show the bubble indicator
            if (s.songs.length > 2) {
                const remaining = s.songs.length - 2;
                songItemsHTML += `
                    <div class="song-preview-item-more" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-input);
                        border: 1px dashed var(--border-color);
                        border-radius: var(--radius-sm);
                        padding: 8px 12px;
                        font-size: 0.75rem;
                        font-weight: 700;
                        color: var(--primary);
                    ">
                        +${remaining} canción${remaining > 1 ? 'es' : ''} más...
                    </div>
                `;
            }
        }

        let editBtnHTML = '';
        if (canEdit()) {
            editBtnHTML = `
                <button class="btn-edit-setlist" style="
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                " onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'" title="Editar repertorio">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            `;
        }

        card.innerHTML = `
            <div class="setlist-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap: 10px; margin-bottom: 8px;">
                <h3 style="margin:0; font-size:1.15rem; font-weight:700;">${s.name}</h3>
                ${editBtnHTML}
            </div>
            <p class="setlist-desc" style="margin-bottom:12px;">${s.description || 'Sin descripción'}</p>
            <div class="setlist-songs-list-preview">
                <h5>Canciones (${s.songs ? s.songs.length : 0})</h5>
                <div class="songs-preview-list">
                    ${songItemsHTML || '<div style="color:var(--text-muted); font-size:0.8rem;">Sin canciones en esta lista.</div>'}
                </div>
            </div>
        `;

        // Card click opens the presentation view
        card.onclick = () => {
            openSetlistPresentation(s);
        };

        // Edit setlist button action (stopping propagation to prevent opening presentation)
        if (canEdit()) {
            const editBtn = card.querySelector('.btn-edit-setlist');
            if (editBtn) {
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    openEditSetlistModal(s.id);
                };
            }
        }

        container.appendChild(card);
    });
}

function openSetlistPresentation(setlist) {
    currentPresentationSetlist = setlist;
    document.body.classList.add('setlist-presentation-mode');

    const layout = document.querySelector('.setlist-presentation-layout');
    if (layout) layout.classList.remove('sidebar-collapsed');
    const textSpan = document.getElementById('btn-toggle-songs-text');
    if (textSpan) textSpan.textContent = "Ocultar Lista";

    document.getElementById('subpanel-setlists-list').classList.add('hidden');
    document.getElementById('subpanel-setlist-presentation').classList.remove('hidden');

    // Populate metadata
    document.getElementById('presentation-setlist-title').textContent = setlist.name;
    document.getElementById('presentation-setlist-desc').textContent = setlist.description || 'Sin notas o descripción asociada.';

    // Populate songs sidebar list
    const sidebarList = document.getElementById('presentation-songs-list-container');
    sidebarList.innerHTML = '';

    if (setlist.songs && setlist.songs.length > 0) {
        setlist.songs.forEach(song => {
            const item = document.createElement('button');
            item.className = 'presentation-song-item';
            item.setAttribute('data-song-id', song.id);
            item.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist}</span>
                </div>
                <span class="song-key">${song.key}</span>
            `;

            item.onclick = () => {
                selectPresentationSong(song);
            };

            sidebarList.appendChild(item);
        });

        // Load first song by default
        selectPresentationSong(setlist.songs[0]);
    } else {
        sidebarList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:20px;">Sin canciones en este repertorio.</div>';
        
        document.getElementById('pres-song-title').textContent = 'Sin canciones';
        document.getElementById('pres-song-artist').textContent = '';
        document.getElementById('pres-song-current-key').textContent = '-';
        document.getElementById('pres-chords-lyrics-content').innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 40px;">Agrega canciones al repertorio para presentarlo.</div>';
    }
}

function closeSetlistPresentation() {
    stopPresScroll();
    document.body.classList.remove('setlist-presentation-mode');
    document.getElementById('subpanel-setlist-presentation').classList.add('hidden');
    document.getElementById('subpanel-setlists-list').classList.remove('hidden');

    currentPresentationSetlist = null;
    currentPresentationSong = null;
}

function selectPresentationSong(song) {
    currentPresentationSong = song;
    presTransposeOffset = 0;
    stopPresScroll();

    // Toggle active classes in sidebar items
    document.querySelectorAll('.presentation-song-item').forEach(item => {
        if (item.getAttribute('data-song-id') == song.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Populate viewer header
    document.getElementById('pres-song-title').textContent = song.title;
    document.getElementById('pres-song-artist').textContent = song.artist;
    document.getElementById('pres-song-current-key').textContent = song.key;

    // Reset container scroll to top
    const container = document.getElementById('pres-lyrics-container');
    if (container) container.scrollTop = 0;

    renderPresTransposedLyrics();
}

function renderPresTransposedLyrics() {
    if (!currentPresentationSong) return;

    if (typeof parseChordsToHTML === 'function') {
        const html = parseChordsToHTML(currentPresentationSong.content, presTransposeOffset);
        document.getElementById('pres-chords-lyrics-content').innerHTML = html;
    } else {
        document.getElementById('pres-chords-lyrics-content').textContent = currentPresentationSong.content;
    }
}

function transposePresSong(semitones) {
    if (!currentPresentationSong) return;
    presTransposeOffset += semitones;

    // Calculate resulting key
    let resultingKey = currentPresentationSong.key;
    if (typeof transposeChord === 'function') {
        resultingKey = transposeChord(currentPresentationSong.key, presTransposeOffset);
    }
    document.getElementById('pres-song-current-key').textContent = resultingKey;

    renderPresTransposedLyrics();
}

function resetPresSongTranspose() {
    if (!currentPresentationSong) return;
    presTransposeOffset = 0;
    document.getElementById('pres-song-current-key').textContent = currentPresentationSong.key;
    renderPresTransposedLyrics();
}

function togglePresScroll() {
    if (presIsScrolling) {
        stopPresScroll();
    } else {
        startPresScroll();
    }
}

function startPresScroll() {
    if (!currentPresentationSong) return;
    presIsScrolling = true;

    // Change scroll button to pause icon
    const scrollBtn = document.getElementById('btn-pres-scroll-toggle');
    if (scrollBtn) {
        scrollBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        scrollBtn.style.color = 'var(--primary)';
        scrollBtn.style.borderColor = 'var(--primary)';
    }

    const speedVal = parseInt(document.getElementById('pres-scroll-speed-select').value) || 2;
    // Map speeds: x1 (120ms), x2 (70ms), x3 (35ms)
    const intervalMs = speedVal === 1 ? 120 : speedVal === 3 ? 35 : 70;

    const container = document.getElementById('pres-lyrics-container');

    presScrollInterval = setInterval(() => {
        container.scrollTop += 1;
        // Check if reached bottom
        if (Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight) {
            stopPresScroll();
        }
    }, intervalMs);
}

function stopPresScroll() {
    presIsScrolling = false;
    if (presScrollInterval) {
        clearInterval(presScrollInterval);
        presScrollInterval = null;
    }

    // Change scroll button to play icon
    const scrollBtn = document.getElementById('btn-pres-scroll-toggle');
    if (scrollBtn) {
        scrollBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        scrollBtn.style.color = '';
        scrollBtn.style.borderColor = '';
    }
}

function togglePresentationSongsSidebar() {
    const layout = document.querySelector('.setlist-presentation-layout');
    const textSpan = document.getElementById('btn-toggle-songs-text');
    if (!layout) return;

    const isCollapsed = layout.classList.toggle('sidebar-collapsed');
    if (textSpan) {
        textSpan.textContent = isCollapsed ? "Mostrar Lista" : "Ocultar Lista";
    }
}

async function openCreateSetlistModal() {
    document.getElementById('setlist-form-id').value = "";
    document.getElementById('setlist-modal-title').textContent = "Crear Nuevo Repertorio";
    document.getElementById('btn-submit-setlist').textContent = "Crear Lista";
    document.getElementById('btn-delete-setlist').style.display = "none";
    document.getElementById('setlist-form').reset();
    
    selectedSongIds = new Set();
    setlistSearchSongQuery = "";
    const searchInput = document.getElementById('setlist-song-search');
    if (searchInput) searchInput.value = "";

    await loadAllSongsForModal();
}

async function openEditSetlistModal(setlistId) {
    const setlist = cachedSetlists.find(s => s.id == setlistId);
    if (!setlist) return;

    document.getElementById('setlist-form-id').value = setlist.id;
    document.getElementById('setlist-modal-title').textContent = "Editar Repertorio";
    document.getElementById('btn-submit-setlist').textContent = "Guardar Cambios";
    
    // Show delete button
    const deleteBtn = document.getElementById('btn-delete-setlist');
    if (deleteBtn && canEdit()) {
        deleteBtn.style.display = "inline-flex";
    }

    document.getElementById('setlist-form-name').value = setlist.name;
    document.getElementById('setlist-form-desc').value = setlist.description || "";
    
    // Load existing songs
    selectedSongIds = new Set(setlist.songs ? setlist.songs.map(song => song.id) : []);
    setlistSearchSongQuery = "";
    const searchInput = document.getElementById('setlist-song-search');
    if (searchInput) searchInput.value = "";

    await loadAllSongsForModal();
}

async function loadAllSongsForModal() {
    const songsSelect = document.getElementById('setlist-form-songs-selection');
    songsSelect.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px;">Cargando catálogo...</div>';

    try {
        allSongs = await apiFetch('/songs') || [];
        renderModalSongsSelection();
        document.getElementById('modal-setlist').classList.remove('hidden');
    } catch (e) {
        console.error("Error loading songs for setlist modal:", e);
        songsSelect.innerHTML = '<div style="color:var(--danger); font-size:0.85rem; padding: 10px;">Fallo al cargar canciones.</div>';
    }
}

function renderModalSongsSelection() {
    const songsSelect = document.getElementById('setlist-form-songs-selection');
    songsSelect.innerHTML = '';

    const query = setlistSearchSongQuery.toLowerCase().trim();

    if (query.length < 3) {
        // Show message requesting 3 chars
        const msg = document.createElement('div');
        msg.style.padding = '8px 4px 12px 4px';
        msg.style.color = 'var(--text-muted)';
        msg.style.fontSize = '0.85rem';
        msg.style.fontStyle = 'italic';
        msg.textContent = 'Escribe al menos 3 caracteres para buscar canciones...';
        songsSelect.appendChild(msg);

        // Render already selected songs so the user can see them and uncheck them
        if (selectedSongIds.size > 0) {
            const heading = document.createElement('div');
            heading.style.fontSize = '0.75rem';
            heading.style.fontWeight = '600';
            heading.style.textTransform = 'uppercase';
            heading.style.color = 'var(--primary)';
            heading.style.marginBottom = '6px';
            heading.textContent = 'Canciones Seleccionadas:';
            songsSelect.appendChild(heading);

            allSongs.forEach(s => {
                if (selectedSongIds.has(s.id)) {
                    const label = createSongCheckboxItem(s);
                    songsSelect.appendChild(label);
                }
            });
        }
        return;
    }

    // Filter list
    const filtered = allSongs.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.artist.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.padding = '10px';
        noResults.style.color = 'var(--text-muted)';
        noResults.style.fontSize = '0.85rem';
        noResults.textContent = 'No se encontraron canciones en el catálogo.';
        songsSelect.appendChild(noResults);
        return;
    }

    filtered.forEach(s => {
        const label = createSongCheckboxItem(s);
        songsSelect.appendChild(label);
    });
}

function createSongCheckboxItem(song) {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    
    const isChecked = selectedSongIds.has(song.id) ? 'checked' : '';
    
    label.innerHTML = `
        <input type="checkbox" name="setlist-songs" value="${song.id}" ${isChecked}>
        <span><strong>${song.title}</strong> - ${song.artist} (${song.key})</span>
    `;

    // Listen to changes to dynamically update selectedSongIds Set
    label.querySelector('input').addEventListener('change', (e) => {
        const sId = parseInt(e.target.value);
        if (e.target.checked) {
            selectedSongIds.add(sId);
        } else {
            selectedSongIds.delete(sId);
        }
        // If query is short, unchecking will dynamically remove it from selection list view
        if (setlistSearchSongQuery.toLowerCase().trim().length < 3) {
            renderModalSongsSelection();
        }
    });

    return label;
}

async function handleSetlistFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('setlist-form-id').value;
    const name = document.getElementById('setlist-form-name').value.trim();
    const date = getLocalDateString();
    const description = document.getElementById('setlist-form-desc').value.trim();

    const songIds = Array.from(selectedSongIds);

    if (songIds.length === 0) {
        showToast("Selecciona al menos una canción", "warning");
        return;
    }

    try {
        if (id) {
            // Edit setlist
            await apiFetch(`/setlists/${id}`, {
                method: 'PUT',
                body: { name, date, description, songs: songIds }
            });
            showToast("Repertorio actualizado con éxito", "success");
        } else {
            // Create setlist
            await apiFetch('/setlists', {
                method: 'POST',
                body: { name, date, description, songs: songIds }
            });
            showToast("Repertorio creado con éxito", "success");
        }

        document.getElementById('modal-setlist').classList.add('hidden');
        await renderSetlists(true); // force reload
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleDeleteSetlist() {
    const id = document.getElementById('setlist-form-id').value;
    const name = document.getElementById('setlist-form-name').value.trim();
    if (!id) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el repertorio "${name}"?`)) {
        return;
    }

    try {
        await apiFetch(`/setlists/${id}`, {
            method: 'DELETE'
        });
        showToast("Repertorio eliminado con éxito", "success");
        document.getElementById('modal-setlist').classList.add('hidden');
        await renderSetlists(true); // reload
    } catch (err) {
        showToast(err.message, "danger");
    }
}
