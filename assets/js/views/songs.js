/**
 * ==============================================================================
 * Levare — Songs Catalog & Presentation Viewer Module (songs.js)
 * ==============================================================================
 * @fileoverview Orquestador de la vista de Canciones y Visor de Letra y Acordes:
 * - Catálogo propio de la banda activa con paginación y buscador en tiempo real.
 * - Eliminación de canciones con desvinculación condicional de la comunidad.
 * - Visor interactivo de letra y acordes con transposición de tonos dinámica.
 * - Función de Autoscroll suave con velocidad ajustable.
 * - Inicializador central que conecta con el catálogo comunitario y el wizard.
 * ==============================================================================
 */

// Estado del Catálogo Propio y Visor
let songsSearchQuery = "";
let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;
let cachedSongs = [];
let songIdToDelete = null;

// Paginación del catálogo local
let songsVisibleLimit = 12;
const SONGS_PAGE_SIZE = 12;

/**
 * Inicialización principal de la vista de canciones.
 * @param {boolean} [forceRefresh=true]
 * @param {boolean} [openCommunity=false]
 */
function initSongsView(forceRefresh = true, openCommunity = false) {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    stopAutoScroll();
    const subpanelDetail = document.getElementById('subpanel-song-detail');
    const subpanelWizard = document.getElementById('subpanel-song-wizard');
    const subpanelList = document.getElementById('subpanel-songs-list');
    const subpanelCommunity = document.getElementById('subpanel-community-catalog');

    currentViewingSong = null;
    if (typeof currentCommunityViewingSong !== 'undefined') {
        currentCommunityViewingSong = null;
    }
    transposeOffset = 0;

    const isCommunityHash = window.location.hash === '#community' || window.location.hash === '#songs-community';
    if (openCommunity || isCommunityHash) {
        if (subpanelDetail) subpanelDetail.classList.add('hidden');
        if (subpanelWizard) subpanelWizard.classList.add('hidden');
        if (subpanelList) subpanelList.classList.add('hidden');
        if (subpanelCommunity) subpanelCommunity.classList.remove('hidden');
        
        const pageTitleElem = document.getElementById('current-page-title');
        if (pageTitleElem) pageTitleElem.textContent = 'Comunidad';
        if (typeof loadCommunitySongs === 'function') loadCommunitySongs();
    } else {
        if (subpanelDetail) subpanelDetail.classList.add('hidden');
        if (subpanelWizard) subpanelWizard.classList.add('hidden');
        if (subpanelCommunity) subpanelCommunity.classList.add('hidden');
        if (subpanelList) subpanelList.classList.remove('hidden');
    }

    // Buscador propio
    const searchInput = document.getElementById('song-search-input') || document.getElementById('songs-search-input');
    if (searchInput) {
        songsSearchQuery = "";
        searchInput.value = "";
        searchInput.removeEventListener('input', handleSongsSearch);
        searchInput.addEventListener('input', handleSongsSearch);
    }

    // Buscador de la comunidad
    const commSearchInput = document.getElementById('community-songs-search-input');
    if (commSearchInput && typeof handleCommunitySearch === 'function') {
        if (typeof communitySearchQuery !== 'undefined') communitySearchQuery = "";
        commSearchInput.value = "";
        commSearchInput.removeEventListener('input', handleCommunitySearch);
        commSearchInput.addEventListener('input', handleCommunitySearch);
    }

    // Botón directo a la Comunidad desde el header
    const btnOpenCommunity = document.getElementById('btn-open-community-catalog');
    if (btnOpenCommunity) {
        btnOpenCommunity.onclick = () => {
            if (typeof openCommunityCatalogView === 'function') openCommunityCatalogView();
        };
    }

    // Botón principal de agregar canción (+)
    const addSongBtn = document.getElementById('btn-add-song');
    if (addSongBtn) {
        if (canEdit()) {
            addSongBtn.classList.remove('hidden');
            addSongBtn.style.display = 'flex';
            addSongBtn.onclick = () => {
                if (typeof openAddSongModal === 'function') openAddSongModal();
            };
        } else {
            addSongBtn.classList.add('hidden');
            addSongBtn.style.display = 'none';
        }
    }

    // Modal Inicial de Elección
    document.querySelectorAll('.btn-close-choose-type').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-song-choose-type')?.classList.add('hidden');
    });
    const btnCreateNew = document.getElementById('btn-choose-create-new');
    if (btnCreateNew) {
        btnCreateNew.onclick = () => {
            if (typeof openSongWizardView === 'function') openSongWizardView(wizardPrefilledData);
        };
    }

    const btnChooseFromCatalog = document.getElementById('btn-choose-from-catalog');
    if (btnChooseFromCatalog) {
        btnChooseFromCatalog.onclick = () => {
            if (typeof openCommunityCatalogView === 'function') openCommunityCatalogView();
        };
    }

    const btnCommBackToList = document.getElementById('btn-community-back-to-list');
    if (btnCommBackToList) {
        btnCommBackToList.onclick = () => {
            if (typeof exitCommunityCatalogView === 'function') exitCommunityCatalogView();
        };
    }

    // Pestañas de Ordenamiento de la Comunidad
    document.querySelectorAll('.btn-community-sort').forEach(btn => {
        btn.onclick = () => {
            const sortType = btn.getAttribute('data-sort');
            if (typeof handleCommunitySortChange === 'function') handleCommunitySortChange(sortType);
        };
    });

    // Botones del Modal de Vista Previa de la Comunidad
    const btnCloseCommPreviewX = document.getElementById('btn-close-comm-preview-x');
    if (btnCloseCommPreviewX) {
        btnCloseCommPreviewX.onclick = () => document.getElementById('modal-community-song-preview')?.classList.add('hidden');
    }

    const btnCommPreviewLike = document.getElementById('btn-comm-preview-like');
    if (btnCommPreviewLike) {
        btnCommPreviewLike.onclick = () => {
            if (typeof currentCommunityViewingSong !== 'undefined' && currentCommunityViewingSong && typeof toggleCommunitySongLike === 'function') {
                toggleCommunitySongLike(currentCommunityViewingSong.id);
            }
        };
    }

    const btnCommPreviewImport = document.getElementById('btn-comm-preview-import');
    if (btnCommPreviewImport) {
        btnCommPreviewImport.onclick = () => {
            if (typeof currentCommunityViewingSong !== 'undefined' && currentCommunityViewingSong && typeof importCommunitySong === 'function') {
                importCommunitySong(currentCommunityViewingSong.id);
            }
        };
    }

    // Botones del Wizard
    const btnBackToList = document.getElementById('btn-wizard-back-to-list');
    if (btnBackToList && typeof exitSongWizard === 'function') btnBackToList.onclick = exitSongWizard;

    const btnCancel1 = document.getElementById('btn-wizard-cancel-1');
    if (btnCancel1 && typeof exitSongWizard === 'function') btnCancel1.onclick = exitSongWizard;

    const btnSelectBaseKey = document.getElementById('btn-select-base-key');
    if (btnSelectBaseKey) {
        btnSelectBaseKey.onclick = () => {
            if (typeof chordPickerMode !== 'undefined') chordPickerMode = 'baseKey';
            if (typeof openChordPickerModal === 'function') openChordPickerModal();
        };
    }

    const medleySwitch = document.getElementById('song-form-is-medley');
    if (medleySwitch && typeof handleMedleyToggle === 'function') {
        medleySwitch.onchange = (e) => handleMedleyToggle(e.target.checked);
    }

    const btnWizardNext = document.getElementById('btn-wizard-next');
    if (btnWizardNext) {
        btnWizardNext.onclick = () => {
            const titleInput = document.getElementById('song-form-title');
            if (!titleInput.value.trim()) {
                titleInput.focus();
                showToast("Por favor ingresa el título de la canción", "danger");
                return;
            }
            if (typeof goToWizardStep === 'function') goToWizardStep(2);
        };
    }

    const btnWizardPrev = document.getElementById('btn-wizard-prev');
    if (btnWizardPrev && typeof goToWizardStep === 'function') {
        btnWizardPrev.onclick = () => goToWizardStep(1);
    }

    const wizardForm = document.getElementById('song-wizard-form');
    if (wizardForm && typeof handleSongWizardSubmit === 'function') {
        wizardForm.onsubmit = handleSongWizardSubmit;
    }

    // Modal de confirmación para eliminar canción
    document.querySelectorAll('#modal-delete-song-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-song-confirm')?.classList.add('hidden');
    });
    const confirmDeleteSongBtn = document.getElementById('btn-confirm-delete-song');
    if (confirmDeleteSongBtn) {
        confirmDeleteSongBtn.onclick = executeDeleteSong;
    }

    // Botones de llamada al Constructor Visual e Importador
    const btnOpenBuilder = document.getElementById('btn-open-chord-builder');
    if (btnOpenBuilder && typeof openChordBuilderModal === 'function') {
        btnOpenBuilder.onclick = openChordBuilderModal;
    }

    const btnOpenImport = document.getElementById('btn-open-import-chords');
    if (btnOpenImport && typeof openImportChordsModal === 'function') {
        btnOpenImport.onclick = openImportChordsModal;
    }

    // Controles del visor y eventos de submódulos
    setupVisorControls();
    if (typeof setupChordBuilderEvents === 'function') setupChordBuilderEvents();
    if (typeof setupChordPickerEvents === 'function') setupChordPickerEvents();
    if (typeof setupSectionPickerEvents === 'function') setupSectionPickerEvents();
    if (typeof setupImportChordsEvents === 'function') setupImportChordsEvents();
    if (typeof setupStep2Tabs === 'function') setupStep2Tabs();

    renderSongsCatalog(true);
}
window.initSongsView = initSongsView;

/**
 * Configura los controles de transposición, autoscroll y regreso en el visor de canción.
 */
function setupVisorControls() {
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
            document.getElementById('subpanel-song-detail')?.classList.add('hidden');
            document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
            document.getElementById('subpanel-songs-list')?.classList.remove('hidden');
            const pageTitleElem = document.getElementById('current-page-title');
            if (pageTitleElem) pageTitleElem.textContent = 'Canciones';
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
}

/**
 * Filtra el catálogo local de canciones según el término de búsqueda ingresado.
 * @param {Event} e
 */
function handleSongsSearch(e) {
    songsSearchQuery = e.target.value;
    songsVisibleLimit = SONGS_PAGE_SIZE;
    renderSongsCatalog(false);
}

/**
 * Renderiza las tarjetas del catálogo local de la banda.
 * @param {boolean} [forceRefresh=false]
 */
async function renderSongsCatalog(forceRefresh = false) {
    const list = document.getElementById('songs-catalog-list') || document.getElementById('songs-list-container');
    const loadMoreContainer = document.getElementById('songs-load-more-container');
    const btnLoadMore = document.getElementById('btn-songs-load-more');
    if (!list) return;
    
    if (forceRefresh || cachedSongs.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">Cargando canciones del catálogo...</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
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
        (s.album && s.album.toLowerCase().includes(query)) || 
        (s.key && s.key.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron canciones en el catálogo.</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const editAllowed = canEdit();
    const visibleSongs = filtered.slice(0, songsVisibleLimit);

    visibleSongs.forEach(s => {
        const card = document.createElement('div');

        // Caso 1: Canción eliminada por el autor original (No disponible)
        if (s.is_deleted == 1 || s.is_deleted === true) {
            card.className = 'p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-red-500/20 shadow-sm flex items-center justify-between opacity-80';
            card.innerHTML = `
                <div class="space-y-0.5 min-w-0 flex-1 pr-2">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <h4 class="font-bold text-sm text-zinc-500 dark:text-zinc-400 line-through truncate">${s.title}</h4>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Canción no disponible</span>
                    </div>
                    <p class="text-xs text-zinc-400 dark:text-zinc-500 truncate">${s.artist || 'Desconocido'}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    ${editAllowed ? `
                    <button type="button" class="btn-delete-song-trigger p-2 text-red-500/80 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition cursor-pointer" data-id="${s.id}" title="Eliminar del catálogo">
                        <i class="fa-solid fa-trash text-xs pointer-events-none"></i>
                    </button>
                    ` : ''}
                </div>
            `;

            if (editAllowed) {
                const btnDelete = card.querySelector('.btn-delete-song-trigger');
                if (btnDelete) {
                    btnDelete.onclick = (e) => {
                        e.stopPropagation();
                        handleDeleteSong(s.id, s.title);
                    };
                }
            }

            list.appendChild(card);
            return;
        }

        // Caso 2: Canción activa y disponible
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex items-center justify-between cursor-pointer group';
        
        const medleyBadge = s.is_medley ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mr-1.5">Medley</span>` : '';
        const albumText = s.album ? ` • ${s.album}` : '';
        const isAuthor = s.is_author == 1 || s.is_author === true;
        const communityBadge = !isAuthor ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mr-1.5">Comunidad</span>` : '';

        card.innerHTML = `
            <div class="space-y-0.5 min-w-0 flex-1 pr-2">
                <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition truncate">${s.title}</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${communityBadge}${medleyBadge}${s.artist || 'Desconocido'}${albumText}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <span class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">${s.is_medley ? 'Medley' : (s.key || 'C')}</span>
                ${editAllowed ? `
                    ${isAuthor ? `
                    <button type="button" class="btn-edit-song-trigger p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer" data-id="${s.id}" title="Editar">
                        <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                    </button>
                    ` : ''}
                    <button type="button" class="btn-delete-song-trigger p-2 text-red-500/80 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition cursor-pointer" data-id="${s.id}" title="${isAuthor ? 'Eliminar canción' : 'Quitar de la banda'}">
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
                    if (typeof openEditSongModal === 'function') openEditSongModal(s.id);
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

    if (loadMoreContainer && btnLoadMore) {
        if (filtered.length > songsVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                songsVisibleLimit += SONGS_PAGE_SIZE;
                renderSongsCatalog(false);
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}
window.renderSongsCatalog = renderSongsCatalog;

/**
 * Prepara y abre el modal de confirmación para eliminar una canción.
 * @param {number|string} songId
 * @param {string} songTitle
 */
function handleDeleteSong(songId, songTitle) {
    songIdToDelete = songId;
    const modalNameEl = document.getElementById('delete-song-modal-name');
    if (modalNameEl) modalNameEl.textContent = songTitle;

    let song = cachedSongs.find(s => s.id == songId);
    if (!song && typeof communitySongs !== 'undefined') {
        song = communitySongs.find(s => s.id == songId);
    }
    const currentUser = getData('currentUser');
    const communityContainer = document.getElementById('container-delete-from-community');
    const communityCheck = document.getElementById('checkbox-delete-from-community');

    if (communityContainer) {
        if (song && currentUser && (song.created_by == currentUser.id || currentUser.account_type === 'superadmin')) {
            communityContainer.classList.remove('hidden');
            if (communityCheck) communityCheck.checked = (window.location.hash === '#community' || !song.already_in_group);
        } else {
            communityContainer.classList.add('hidden');
            if (communityCheck) communityCheck.checked = false;
        }
    }

    document.getElementById('modal-delete-song-confirm')?.classList.remove('hidden');
}
window.handleDeleteSong = handleDeleteSong;

/**
 * Ejecuta la eliminación de una canción en el backend.
 */
async function executeDeleteSong() {
    if (!songIdToDelete) return;
    const btn = document.getElementById('btn-confirm-delete-song');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
    }

    const communityCheck = document.getElementById('checkbox-delete-from-community');
    const deleteFromCommunity = (communityCheck && communityCheck.checked) ? 1 : 0;

    try {
        const res = await apiFetch(`/songs/${songIdToDelete}?delete_from_community=${deleteFromCommunity}`, { method: 'DELETE' });
        showToast(res?.message || "Canción eliminada");
        document.getElementById('modal-delete-song-confirm')?.classList.add('hidden');
        if (typeof exitSongWizard === 'function') exitSongWizard();
        await renderSongsCatalog(true);
        if (window.location.hash === '#community' || window.location.hash === '#songs-community' || !document.getElementById('subpanel-community-catalog')?.classList.contains('hidden')) {
            if (typeof loadCommunitySongs === 'function') loadCommunitySongs();
        }
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Eliminar';
        }
        songIdToDelete = null;
    }
}
window.executeDeleteSong = executeDeleteSong;

/**
 * Abre el visor detallado de letra y acordes para una canción seleccionada.
 * @param {number|string} songId
 */
function viewSongDetail(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;

    currentViewingSong = song;
    transposeOffset = 0;
    stopAutoScroll();

    const titleEl = document.getElementById('song-detail-title');
    if (titleEl) titleEl.textContent = song.title;

    const artistEl = document.getElementById('song-detail-artist');
    if (artistEl) {
        const album = song.album ? ` • ${song.album}` : '';
        artistEl.textContent = `${song.artist || 'Desconocido'}${album}`;
    }

    const curKeyEl = document.getElementById('song-current-key');
    if (curKeyEl) curKeyEl.textContent = song.is_medley ? 'Medley' : song.key;

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
    
    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-community-catalog')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.remove('hidden');
    
    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Letra y Acordes';

    document.querySelector('.app-content')?.classList.add('song-detail-mode');
}
window.viewSongDetail = viewSongDetail;

/**
 * Renderiza la letra con acordes transposicionados según el transposeOffset actual.
 */
function renderTransposedLyrics() {
    if (!currentViewingSong) return;
    const lyricsContent = document.getElementById('chords-lyrics-content');
    if (!lyricsContent) return;
    
    const parsedHTML = parseChordsToHTML(currentViewingSong.content, transposeOffset);
    lyricsContent.innerHTML = parsedHTML;

    const currentKey = currentViewingSong.is_medley ? 'Medley' : transposeChord(currentViewingSong.key, transposeOffset);
    const keyEl = document.getElementById('song-current-key');
    if (keyEl) keyEl.textContent = currentKey;
}

/**
 * Inicia el desplazamiento automático vertical de la letra.
 */
function startAutoScroll() {
    isScrolling = true;
    const toggleBtn = document.getElementById('btn-scroll-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = `<i class="fa-solid fa-pause text-[10px]"></i>`;
        toggleBtn.style.backgroundColor = "var(--primary-soft, rgba(245, 158, 11, 0.2))";
        toggleBtn.style.color = "var(--primary, #f59e0b)";
    }
    
    const speed = parseInt(document.getElementById('scroll-speed-select')?.value || '2');
    let intervalMs = 100;
    if (speed === 2) intervalMs = 50;
    if (speed === 3) intervalMs = 30;

    const container = document.getElementById('lyrics-container');
    if (!container) return;

    scrollInterval = setInterval(() => {
        container.scrollTop += 1;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
            stopAutoScroll();
        }
    }, intervalMs);
}
window.startAutoScroll = startAutoScroll;

/**
 * Detiene el desplazamiento automático vertical de la letra.
 */
function stopAutoScroll() {
    isScrolling = false;
    if (scrollInterval) clearInterval(scrollInterval);
    const toggleBtn = document.getElementById('btn-scroll-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = `<i class="fa-solid fa-play text-[10px]"></i>`;
        toggleBtn.style.backgroundColor = "";
        toggleBtn.style.color = "";
    }
}
window.stopAutoScroll = stopAutoScroll;
