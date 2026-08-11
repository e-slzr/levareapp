/* ==========================================================================
   Levare — SETLISTS (REPERTORIOS) CONTROLLER (API Connected)
   ========================================================================== */

let setlistSearchQuery = "";
let cachedSetlists = [];
let allSongs = [];
let selectedSongIds = [];
let setlistSearchSongQuery = "";

// Presentation view state variables
let currentPresentationSetlist = null;
let currentPresentationSong = null;
let presTransposeOffset = 0;
let presIsScrolling = false;
let presScrollInterval = null;
let directPresentationSetlistId = null;
let setlistIdToDelete = null;

function initSetlistsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    if (directPresentationSetlistId !== null) {
        const listSubpanel = document.getElementById('subpanel-setlists-list');
        const presSubpanel = document.getElementById('subpanel-setlist-presentation');
        if (listSubpanel && presSubpanel) {
            listSubpanel.classList.add('hidden');
            presSubpanel.classList.remove('hidden');
            document.body.classList.add('setlist-presentation-mode');
        }
    }

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

    // Confirm Delete Setlist Modal triggers
    document.querySelectorAll('#modal-delete-setlist-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-setlist-confirm').classList.add('hidden');
    });
    const closeXDelete = document.getElementById('btn-close-delete-setlist-modal-x');
    if (closeXDelete) {
        closeXDelete.onclick = () => document.getElementById('modal-delete-setlist-confirm').classList.add('hidden');
    }
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-setlist');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = executeDeleteSetlist;
    }

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
    if (btnPresToggleSongs) btnPresToggleSongs.onclick = openMobileSongsModal;

    // Form submit
    document.getElementById('setlist-form').onsubmit = handleSetlistFormSubmit;

    // Delete setlist action
    const deleteBtn = document.getElementById('btn-delete-setlist');
    if (deleteBtn) {
        deleteBtn.onclick = handleDeleteSetlist;
    }

    if (directPresentationSetlistId !== null) {
        const targetId = directPresentationSetlistId;
        directPresentationSetlistId = null; // reset
        loadDirectPresentation(targetId);
        return;
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
        card.className = 'p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer flex flex-col justify-between';


        let songItemsHTML = '';
        if (s.songs && s.songs.length > 0) {
            // Render only first 2 songs
            const firstTwoSongs = s.songs.slice(0, 2);
            firstTwoSongs.forEach(song => {
                songItemsHTML += `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
                        <span class="font-semibold text-zinc-800 dark:text-zinc-200 truncate">${song.title}</span>
                        <span class="font-bold text-zinc-600 dark:text-zinc-400 ml-2">${song.key}</span>
                    </div>
                `;
            });

            // If there are more than 2, show the bubble indicator
            if (s.songs.length > 2) {
                const remaining = s.songs.length - 2;
                songItemsHTML += `
                    <div class="flex items-center justify-center p-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                        +${remaining} canción${remaining > 1 ? 'es' : ''} más...
                    </div>
                `;
            }
        }


        let editBtnHTML = '';
        if (canEdit()) {
            editBtnHTML = `
                <div style="display: flex; gap: 4px;">
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
                    <button class="btn-delete-setlist-card" style="
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
                    " onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'" title="Eliminar repertorio">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex justify-between items-start gap-2 mb-2">
                <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100">${s.name}</h3>
                ${editBtnHTML}
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3">${s.description || 'Sin descripción'}</p>
            <div class="border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                <h5 class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Canciones (${s.songs ? s.songs.length : 0})</h5>
                <div class="space-y-1.5">
                    ${songItemsHTML || '<div class="text-xs text-zinc-400 italic">Sin canciones en esta lista.</div>'}
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
            const deleteCardBtn = card.querySelector('.btn-delete-setlist-card');
            if (deleteCardBtn) {
                deleteCardBtn.onclick = (e) => {
                    e.stopPropagation();
                    handleDeleteSetlistCard(s.id, s.name);
                };
            }
        }

        container.appendChild(card);
    });
}

function openSetlistPresentation(setlist) {
    currentPresentationSetlist = setlist;
    document.body.classList.add('setlist-presentation-mode');

    const textSpan = document.getElementById('btn-toggle-songs-text');
    if (textSpan) textSpan.textContent = "Ver Canciones";

    document.getElementById('subpanel-setlists-list').classList.add('hidden');
    document.getElementById('subpanel-setlist-presentation').classList.remove('hidden');

    // Populate metadata
    document.getElementById('presentation-setlist-title').textContent = setlist.name;
    document.getElementById('presentation-setlist-desc').textContent = setlist.description || 'Sin notas o descripción asociada.';

    // Populate songs sidebar list and mobile modal list
    const sidebarList = document.getElementById('presentation-songs-list-container');
    if (sidebarList) sidebarList.innerHTML = '';
    
    const mobileList = document.getElementById('mobile-presentation-songs-container');
    if (mobileList) mobileList.innerHTML = '';
    
    const mobileTitle = document.getElementById('mobile-pres-setlist-title');
    if (mobileTitle) mobileTitle.textContent = setlist.name;

    if (setlist.songs && setlist.songs.length > 0) {
        setlist.songs.forEach(song => {
            if (sidebarList) {
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
                item.onclick = () => selectPresentationSong(song);
                sidebarList.appendChild(item);
            }

            if (mobileList) {
                const mobileItem = document.createElement('button');
                mobileItem.className = 'mobile-song-item w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left flex items-center justify-between transition flex-shrink-0';
                mobileItem.setAttribute('data-song-id', song.id);
                mobileItem.innerHTML = `
                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">${song.title}</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${song.artist}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 ml-2 flex-shrink-0">${song.key}</span>
                `;
                mobileItem.onclick = () => {
                    selectPresentationSong(song);
                    closeMobileSongsModal();
                };
                mobileList.appendChild(mobileItem);
            }
        });

        // Load first song by default
        selectPresentationSong(setlist.songs[0]);
    } else {
        if (sidebarList) sidebarList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:20px;">Sin canciones en este repertorio.</div>';
        if (mobileList) mobileList.innerHTML = '<div class="text-xs text-zinc-400 text-center p-4">Sin canciones en este repertorio.</div>';

        document.getElementById('pres-song-title').textContent = 'Sin canciones';
        document.getElementById('pres-song-artist').textContent = '';
        document.getElementById('pres-song-current-key').textContent = '-';
        document.getElementById('pres-chords-lyrics-content').innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 40px;">Agrega canciones al repertorio para presentarlo.</div>';
    }
}

function closeSetlistPresentation() {
    stopPresScroll();
    closeMobileSongsModal();
    document.body.classList.remove('setlist-presentation-mode');
    document.getElementById('subpanel-setlist-presentation').classList.add('hidden');
    document.getElementById('subpanel-setlists-list').classList.remove('hidden');

    currentPresentationSetlist = null;
    currentPresentationSong = null;
}

function openMobileSongsModal() {
    const modal = document.getElementById('modal-presentation-songs-mobile');
    if (modal) modal.classList.remove('hidden');
}

function closeMobileSongsModal() {
    const modal = document.getElementById('modal-presentation-songs-mobile');
    if (modal) modal.classList.add('hidden');
}

window.openMobileSongsModal = openMobileSongsModal;
window.closeMobileSongsModal = closeMobileSongsModal;


function selectPresentationSong(song) {
    currentPresentationSong = song;
    presTransposeOffset = 0;
    stopPresScroll();

    // Toggle active classes in sidebar and mobile modal items
    document.querySelectorAll('.presentation-song-item').forEach(item => {
        if (item.getAttribute('data-song-id') == song.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    document.querySelectorAll('.mobile-song-item').forEach(item => {
        if (item.getAttribute('data-song-id') == song.id) {
            item.classList.add('bg-zinc-100', 'dark:bg-zinc-800');
        } else {
            item.classList.remove('bg-zinc-100', 'dark:bg-zinc-800');
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
    openMobileSongsModal();
}

async function openCreateSetlistModal() {
    document.getElementById('setlist-form-id').value = "";
    document.getElementById('setlist-modal-title').textContent = "Crear Nuevo Repertorio";
    document.getElementById('btn-submit-setlist').textContent = "Guardar";
    document.getElementById('btn-delete-setlist').style.display = "none";
    document.getElementById('setlist-form').reset();

    selectedSongIds = [];
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
    document.getElementById('btn-submit-setlist').textContent = "Guardar";

    // Show delete button
    const deleteBtn = document.getElementById('btn-delete-setlist');
    if (deleteBtn && canEdit()) {
        deleteBtn.style.display = "inline-flex";
    }

    document.getElementById('setlist-form-name').value = setlist.name;
    document.getElementById('setlist-form-desc').value = setlist.description || "";

    // Load existing songs in order
    selectedSongIds = setlist.songs ? setlist.songs.map(song => song.id) : [];
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
        renderSelectedSongsOrder();
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
        if (selectedSongIds.length > 0) {
            const heading = document.createElement('div');
            heading.style.fontSize = '0.75rem';
            heading.style.fontWeight = '600';
            heading.style.textTransform = 'uppercase';
            heading.style.color = 'var(--primary)';
            heading.style.marginBottom = '6px';
            heading.textContent = 'Canciones Seleccionadas:';
            songsSelect.appendChild(heading);

            selectedSongIds.forEach(id => {
                const s = allSongs.find(song => song.id == id);
                if (s) {
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

    const isChecked = selectedSongIds.includes(song.id) ? 'checked' : '';

    label.innerHTML = `
        <input type="checkbox" name="setlist-songs" value="${song.id}" ${isChecked}>
        <span><strong>${song.title}</strong> - ${song.artist} (${song.key})</span>
    `;

    // Listen to changes to dynamically update selectedSongIds Array
    label.querySelector('input').addEventListener('change', (e) => {
        const sId = parseInt(e.target.value);
        if (e.target.checked) {
            if (!selectedSongIds.includes(sId)) {
                selectedSongIds.push(sId);
            }
        } else {
            selectedSongIds = selectedSongIds.filter(id => id !== sId);
        }
        
        renderSelectedSongsOrder();
        
        // If query is short, unchecking will dynamically remove it from selection list view
        if (setlistSearchSongQuery.toLowerCase().trim().length < 3) {
            renderModalSongsSelection();
        }
    });

    return label;
}

let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
    this.style.opacity = '0.5';
    this.style.borderColor = 'var(--primary)';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.style.background = 'var(--bg-hover)';
}

function handleDragLeave(e) {
    this.style.background = 'var(--bg-card)';
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (dragSrcEl !== this) {
        const fromIndex = parseInt(dragSrcEl.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // Reordenar en la variable
        const [movedId] = selectedSongIds.splice(fromIndex, 1);
        selectedSongIds.splice(toIndex, 0, movedId);
        
        renderSelectedSongsOrder();
        renderModalSongsSelection();
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    this.style.borderColor = 'var(--border-color)';
    document.querySelectorAll('.selected-song-order-item').forEach(item => {
        item.style.background = 'var(--bg-card)';
    });
}

function moveSongInOrder(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedSongIds.length) return;
    
    // Intercambiar
    const temp = selectedSongIds[index];
    selectedSongIds[index] = selectedSongIds[targetIndex];
    selectedSongIds[targetIndex] = temp;
    
    renderSelectedSongsOrder();
    renderModalSongsSelection();
}

function removeSongFromOrder(songId) {
    selectedSongIds = selectedSongIds.filter(id => id !== songId);
    renderSelectedSongsOrder();
    renderModalSongsSelection();
}

function renderSelectedSongsOrder() {
    const orderContainer = document.getElementById('setlist-form-songs-order');
    if (!orderContainer) return;
    
    orderContainer.innerHTML = '';
    
    if (selectedSongIds.length === 0) {
        orderContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; font-style:italic; padding:8px;" class="no-songs-msg">No has seleccionado ninguna canción todavía.</div>`;
        return;
    }
    
    selectedSongIds.forEach((id, index) => {
        const song = allSongs.find(s => s.id == id);
        if (!song) return;
        
        const row = document.createElement('div');
        row.className = 'selected-song-order-item';
        row.draggable = true;
        row.dataset.id = id;
        row.dataset.index = index;
        
        // Estilos para la fila del orden (premium look, dark-mode ready)
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.padding = '8px 12px';
        row.style.background = 'var(--bg-card)';
        row.style.border = '1px solid var(--border-color)';
        row.style.borderRadius = 'var(--radius-sm)';
        row.style.cursor = 'grab';
        row.style.transition = 'background var(--transition-fast), border-color var(--transition-fast)';
        row.style.gap = '8px';
        row.style.marginBottom = '4px';
        
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <span style="font-weight:700; color:var(--primary); font-size:0.85rem; min-width:18px;">${index + 1}.</span>
                <span style="font-size:0.85rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;">
                    ${song.title} <span style="font-weight:400; color:var(--text-muted); font-size:0.8rem;">por ${song.artist} (${song.key})</span>
                </span>
            </div>
            <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                <button type="button" class="btn btn-outline btn-sm btn-order-up" style="padding: 2px 6px; font-size:0.65rem;" title="Subir">▲</button>
                <button type="button" class="btn btn-outline btn-sm btn-order-down" style="padding: 2px 6px; font-size:0.65rem;" title="Bajar">▼</button>
                <button type="button" class="btn btn-outline btn-sm btn-order-remove" style="padding: 2px 6px; color:var(--danger); border-color:rgba(239,68,68,0.2); font-size:0.75rem; font-weight:700;" title="Quitar">×</button>
            </div>
        `;
        
        // Drag & Drop listeners
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
        row.addEventListener('dragenter', handleDragEnter);
        row.addEventListener('dragleave', handleDragLeave);
        
        // Button listeners
        row.querySelector('.btn-order-up').onclick = (e) => {
            e.stopPropagation();
            moveSongInOrder(index, -1);
        };
        row.querySelector('.btn-order-down').onclick = (e) => {
            e.stopPropagation();
            moveSongInOrder(index, 1);
        };
        row.querySelector('.btn-order-remove').onclick = (e) => {
            e.stopPropagation();
            removeSongFromOrder(id);
        };
        
        orderContainer.appendChild(row);
    });
}

async function handleSetlistFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('setlist-form-id').value;
    const name = document.getElementById('setlist-form-name').value.trim();
    const date = getLocalDateString();
    const description = document.getElementById('setlist-form-desc').value.trim();

    const songIds = selectedSongIds;

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

function handleDeleteSetlistCard(setlistId, setlistName) {
    setlistIdToDelete = setlistId;

    const modalNameEl = document.getElementById('delete-setlist-modal-name');
    if (modalNameEl) {
        modalNameEl.textContent = `"${setlistName}"`;
    }

    document.getElementById('modal-delete-setlist-confirm').classList.remove('hidden');
}

function handleDeleteSetlist() {
    const id = document.getElementById('setlist-form-id').value;
    const name = document.getElementById('setlist-form-name').value.trim();
    if (!id) return;

    setlistIdToDelete = id;

    // Poblar nombre
    const modalNameEl = document.getElementById('delete-setlist-modal-name');
    if (modalNameEl) {
        modalNameEl.textContent = `"${name}"`;
    }

    // Ocultar modal principal
    document.getElementById('modal-setlist').classList.add('hidden');

    // Mostrar modal de confirmación
    document.getElementById('modal-delete-setlist-confirm').classList.remove('hidden');
}

async function executeDeleteSetlist() {
    if (!setlistIdToDelete) return;

    try {
        await apiFetch(`/setlists/${setlistIdToDelete}`, {
            method: 'DELETE'
        });
        showToast("Repertorio eliminado con éxito", "success");
        document.getElementById('modal-delete-setlist-confirm').classList.add('hidden');
        await renderSetlists(true); // reload
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        setlistIdToDelete = null;
    }
}

async function loadDirectPresentation(setlistId) {
    if (cachedSetlists.length === 0) {
        try {
            cachedSetlists = await apiFetch('/setlists') || [];
        } catch (err) {
            console.error("Error loading setlists dynamically:", err);
            closeSetlistPresentation();
            renderSetlists(true);
            return;
        }
    }
    
    const setlist = cachedSetlists.find(s => s.id == setlistId);
    if (setlist) {
        // Render en background para poblar la lista y que cuando el usuario regrese esté cargada
        await renderSetlists(false);
        openSetlistPresentation(setlist);
    } else {
        closeSetlistPresentation();
        await renderSetlists(true);
        showToast("No se pudo encontrar el repertorio en este grupo.", "danger");
    }
}

async function viewSetlistPresentationDirectly(setlistId) {
    directPresentationSetlistId = setlistId;

    // Close the event detail modal if open
    const eventDetailModal = document.getElementById('modal-event-detail');
    if (eventDetailModal) eventDetailModal.classList.add('hidden');

    // Force the setlists panel to reload so initSetlistsView() binds fresh DOM elements
    const setlistsPanel = document.getElementById('panel-setlists');
    if (setlistsPanel) {
        setlistsPanel.dataset.loaded = '';
    }

    // Navigate to #setlists — app.js handleHashRouting will load the panel and call initSetlistsView()
    window.location.hash = '#setlists';
}

