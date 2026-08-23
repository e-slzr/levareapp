/* ==========================================================================
   Levare — SONGS CATALOG, FULLSCREEN WIZARD & CHORD BUILDER (v2.0)
   ========================================================================== */

let songsSearchQuery = "";
let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;
let cachedSongs = [];
let songIdToDelete = null;

// Pagination state for local songs
let songsVisibleLimit = 12;
const SONGS_PAGE_SIZE = 12;

// Community Catalog State & Pagination
let communitySongs = [];
let communitySearchQuery = "";
let communitySort = "popular"; // 'popular', 'recent', 'alpha'
let currentCommunityViewingSong = null;
let commCurrentPage = 1;
const COMM_PAGE_SIZE = 12;
let commHasMore = false;
let commIsLoading = false;
let commSearchDebounceTimer = null;

// Wizard & Builder State
let wizardCurrentStep = 1;
let wizardPrefilledData = null;
let currentEditorSections = [];
let activeSectionId = null;
let activeLineIdx = null;
let activeCharOffset = 0;
let activeSelectedBadge = null;
let editingBadgeTarget = null;
let draggedSectionCard = null;
let draggedChordData = null;
let chordPickerMode = 'editor'; // 'editor' (insert/change badge in editor) or 'baseKey' (select base key in step 1)

// Chord Picker Filters State
let pickerAccidental = null; // null (natural), '#' or 'b'
let pickerType = 'maj';      // 'maj', 'min', '7th'
let pickerSearch = '';

window.openSongFormModal = openAddSongModal;
window.openAddSongModal = openAddSongModal;

/**
 * Punto de entrada: Abre el modal selector inicial (Crear nueva / Desde catálogo)
 */
function openAddSongModal(prefilledData = null) {
    wizardPrefilledData = prefilledData;
    const modalChoose = document.getElementById('modal-song-choose-type');
    if (modalChoose) {
        modalChoose.classList.remove('hidden');
    } else {
        openSongWizardView(prefilledData);
    }
}

/**
 * Abre la vista de Pantalla Completa del Wizard (Paso 1: Identidad)
 */
function openSongWizardView(prefilledData = null) {
    // Cerrar modal selector si estaba abierto
    document.getElementById('modal-song-choose-type')?.classList.add('hidden');

    const form = document.getElementById('song-wizard-form');
    if (form) form.reset();

    const viewTitleEl = document.getElementById('wizard-view-title');
    const deleteBtn = document.getElementById('btn-delete-song');
    
    document.getElementById('song-form-id').value = "";
    document.getElementById('song-form-suggestion-id').value = "";
    document.getElementById('song-form-content').value = "";
    if (deleteBtn) deleteBtn.classList.add('hidden');

    if (viewTitleEl) viewTitleEl.textContent = "Agregar Canción";

    // Restablecer Tono Base por defecto a 'C'
    updateBaseKeyDisplay('C');

    // Restablecer Medley Switch
    const medleyCheckbox = document.getElementById('song-form-is-medley');
    if (medleyCheckbox) {
        medleyCheckbox.checked = false;
        handleMedleyToggle(false);
    }

    // Switch de Compartir en Comunidad (Activo por defecto)
    const publicCheckbox = document.getElementById('song-form-is-public');
    if (publicCheckbox) {
        publicCheckbox.checked = true;
    }

    if (prefilledData) {
        if (prefilledData.id) {
            document.getElementById('song-form-id').value = prefilledData.id;
            if (viewTitleEl) viewTitleEl.textContent = "Editar Canción";
            if (deleteBtn && canEdit()) deleteBtn.classList.remove('hidden');
        }
        document.getElementById('song-form-title').value = prefilledData.title || '';
        document.getElementById('song-form-artist').value = prefilledData.artist || '';
        document.getElementById('song-form-album').value = prefilledData.album || '';
        
        const isMedley = !!prefilledData.is_medley;
        if (medleyCheckbox) {
            medleyCheckbox.checked = isMedley;
            handleMedleyToggle(isMedley);
        }

        if (publicCheckbox) {
            publicCheckbox.checked = prefilledData.is_public !== 0 && prefilledData.is_public !== false && prefilledData.is_public !== '0';
        }

        const songKey = prefilledData.key || 'C';
        updateBaseKeyDisplay(songKey);

        document.getElementById('song-form-url').value = prefilledData.url || '';
        document.getElementById('song-form-content').value = prefilledData.content || '';
        
        if (prefilledData.suggestionId) {
            document.getElementById('song-form-suggestion-id').value = prefilledData.suggestionId;
        }
    }

    // Switch a subpanel pantalla completa
    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = prefilledData && prefilledData.id ? 'Editar Canción' : 'Nueva Canción';

    goToWizardStep(1);
}

/**
 * Abre el Wizard para editar una canción existente
 */
function openEditSongModal(songId) {
    const song = cachedSongs.find(s => s.id == songId);
    if (!song) return;
    openSongWizardView(song);
}

/**
 * Cierra la vista del Wizard y regresa al catálogo de canciones
 */
function exitSongWizard() {
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-songs-list')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Canciones';
}

/**
 * Control de navegación entre pasos del Wizard (1: Identidad, 2: Letra y Acordes)
 */
function goToWizardStep(step) {
    wizardCurrentStep = step;
    const step1 = document.getElementById('wizard-step-1');
    const step2 = document.getElementById('wizard-step-2');
    const subtitle = document.getElementById('wizard-view-subtitle');
    const indicator1 = document.getElementById('step-indicator-1');
    const indicator2 = document.getElementById('step-indicator-2');

    if (step === 1) {
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        if (subtitle) subtitle.textContent = "Paso 1 de 2: Información general";
        
        if (indicator1) {
            indicator1.className = "text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm";
        }
        if (indicator2) {
            indicator2.className = "text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent";
        }
    } else if (step === 2) {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        if (subtitle) subtitle.textContent = "Paso 2 de 2: Letra y acordes";

        if (indicator1) {
            indicator1.className = "text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent";
        }
        if (indicator2) {
            indicator2.className = "text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm";
        }

        renderWizardLivePreview();
    }
}

/**
 * Actualiza la UI del selector de tono base en el Paso 1
 */
function updateBaseKeyDisplay(keyVal) {
    const formatted = formatMusicalChord(keyVal) || 'C';
    const hiddenInput = document.getElementById('song-form-key');
    const badgeEl = document.getElementById('selected-base-key-badge');
    const nameEl = document.getElementById('selected-base-key-name');

    if (hiddenInput) hiddenInput.value = formatted;
    if (badgeEl) badgeEl.textContent = formatted;
    if (nameEl) {
        const isMinor = formatted.includes('m') && !formatted.includes('maj');
        nameEl.textContent = `${formatted} ${isMinor ? 'Menor' : 'Mayor'}`;
    }
}

/**
 * Manejo del switch de Medley / Popurrí
 */
function handleMedleyToggle(isMedley) {
    const keyContainer = document.getElementById('container-base-key');
    const medleyInfo = document.getElementById('container-medley-info');
    
    if (isMedley) {
        if (keyContainer) keyContainer.classList.add('hidden');
        if (medleyInfo) medleyInfo.classList.remove('hidden');
    } else {
        if (keyContainer) keyContainer.classList.remove('hidden');
        if (medleyInfo) medleyInfo.classList.add('hidden');
    }
}

/**
 * Renderiza la vista previa de la letra con los acordes alineados arriba en tiempo real
 */
function renderWizardLivePreview() {
    const content = document.getElementById('song-form-content').value.trim();
    const previewContent = document.getElementById('wizard-preview-content');
    const countEl = document.getElementById('preview-sections-count');
    if (!previewContent) return;

    if (!content) {
        previewContent.innerHTML = `
            <div class="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs font-sans">
                Aún no has agregado la letra con acordes.<br>
                Haz clic en <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Editor de Letra y Acordes"</strong> o <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Pegar desde Internet"</strong> para comenzar.
            </div>
        `;
        if (countEl) countEl.textContent = "0 secciones";
        return;
    }

    // Contar secciones
    const sectionMatches = content.match(/\[(INTRO|VERSO|PRE-CORO|CORO|PUENTE|SOLO|OUTRO)[^\]]*\]/gi) || [];
    if (countEl) {
        countEl.textContent = `${sectionMatches.length} ${sectionMatches.length === 1 ? 'sección' : 'secciones'}`;
    }

    // Parsear usando el motor de acordes (con transpose 0 para el tono base)
    const html = parseChordsToHTML(content, 0);
    previewContent.innerHTML = html;
}

/**
 * Inicialización de la vista principal de canciones
 */
function initSongsView() {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    // Detener autoscroll y restablecer subpaneles
    stopAutoScroll();
    const subpanelDetail = document.getElementById('subpanel-song-detail');
    const subpanelWizard = document.getElementById('subpanel-song-wizard');
    const subpanelList = document.getElementById('subpanel-songs-list');
    const subpanelCommunity = document.getElementById('subpanel-community-catalog');

    if (subpanelDetail) subpanelDetail.classList.add('hidden');
    if (subpanelWizard) subpanelWizard.classList.add('hidden');
    if (subpanelCommunity) subpanelCommunity.classList.add('hidden');
    if (subpanelList) subpanelList.classList.remove('hidden');
    
    currentViewingSong = null;
    currentCommunityViewingSong = null;
    transposeOffset = 0;

    // Buscador general del catálogo propio
    const searchInput = document.getElementById('song-search-input') || document.getElementById('songs-search-input');
    if (searchInput) {
        songsSearchQuery = "";
        searchInput.value = "";
        searchInput.removeEventListener('input', handleSongsSearch);
        searchInput.addEventListener('input', handleSongsSearch);
    }

    // Buscador del catálogo de la comunidad
    const commSearchInput = document.getElementById('community-songs-search-input');
    if (commSearchInput) {
        communitySearchQuery = "";
        commSearchInput.value = "";
        commSearchInput.removeEventListener('input', handleCommunitySearch);
        commSearchInput.addEventListener('input', handleCommunitySearch);
    }

    // Botón principal de agregar canción (+)
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

    // Modal Inicial de Elección
    document.querySelectorAll('.btn-close-choose-type').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-song-choose-type').classList.add('hidden');
    });
    const btnCreateNew = document.getElementById('btn-choose-create-new');
    if (btnCreateNew) {
        btnCreateNew.onclick = () => openSongWizardView(wizardPrefilledData);
    }

    // Opción 2: Abrir Catálogo de la Comunidad
    const btnChooseFromCatalog = document.getElementById('btn-choose-from-catalog');
    if (btnChooseFromCatalog) {
        btnChooseFromCatalog.onclick = () => openCommunityCatalogView();
    }

    // Botón Volver de la Comunidad a la lista propia
    const btnCommBackToList = document.getElementById('btn-community-back-to-list');
    if (btnCommBackToList) {
        btnCommBackToList.onclick = () => exitCommunityCatalogView();
    }

    // Pestañas de Ordenamiento de la Comunidad
    document.querySelectorAll('.btn-community-sort').forEach(btn => {
        btn.onclick = () => {
            const sortType = btn.getAttribute('data-sort');
            handleCommunitySortChange(sortType);
        };
    });

    // Botones del Modal de Vista Previa de la Comunidad
    const btnCloseCommPreviewX = document.getElementById('btn-close-comm-preview-x');
    if (btnCloseCommPreviewX) {
        btnCloseCommPreviewX.onclick = () => document.getElementById('modal-community-song-preview').classList.add('hidden');
    }

    const btnCommPreviewLike = document.getElementById('btn-comm-preview-like');
    if (btnCommPreviewLike) {
        btnCommPreviewLike.onclick = () => {
            if (currentCommunityViewingSong) {
                toggleCommunitySongLike(currentCommunityViewingSong.id);
            }
        };
    }

    const btnCommPreviewImport = document.getElementById('btn-comm-preview-import');
    if (btnCommPreviewImport) {
        btnCommPreviewImport.onclick = () => {
            if (currentCommunityViewingSong) {
                importCommunitySong(currentCommunityViewingSong.id);
            }
        };
    }

    // Botón Volver del Wizard a lista
    const btnBackToList = document.getElementById('btn-wizard-back-to-list');
    if (btnBackToList) btnBackToList.onclick = exitSongWizard;

    const btnCancel1 = document.getElementById('btn-wizard-cancel-1');
    if (btnCancel1) btnCancel1.onclick = exitSongWizard;

    // Botón Selector de Tono Base Modal
    const btnSelectBaseKey = document.getElementById('btn-select-base-key');
    if (btnSelectBaseKey) {
        btnSelectBaseKey.onclick = () => {
            chordPickerMode = 'baseKey';
            openChordPickerModal();
        };
    }

    // Listener del Switch Medley
    const medleySwitch = document.getElementById('song-form-is-medley');
    if (medleySwitch) {
        medleySwitch.onchange = (e) => handleMedleyToggle(e.target.checked);
    }

    // Botones de pasos del Wizard
    const btnWizardNext = document.getElementById('btn-wizard-next');
    if (btnWizardNext) {
        btnWizardNext.onclick = () => {
            const titleInput = document.getElementById('song-form-title');
            if (!titleInput.value.trim()) {
                titleInput.focus();
                showToast("Por favor ingresa el título de la canción", "danger");
                return;
            }
            goToWizardStep(2);
        };
    }

    const btnWizardPrev = document.getElementById('btn-wizard-prev');
    if (btnWizardPrev) {
        btnWizardPrev.onclick = () => goToWizardStep(1);
    }

    const wizardForm = document.getElementById('song-wizard-form');
    if (wizardForm) {
        wizardForm.onsubmit = handleSongWizardSubmit;
    }

    // Modal de confirmación para eliminar canción
    document.querySelectorAll('#modal-delete-song-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-song-confirm').classList.add('hidden');
    });
    const confirmDeleteSongBtn = document.getElementById('btn-confirm-delete-song');
    if (confirmDeleteSongBtn) {
        confirmDeleteSongBtn.onclick = executeDeleteSong;
    }

    // Botones de llamada al Constructor Visual e Importador
    const btnOpenBuilder = document.getElementById('btn-open-chord-builder');
    if (btnOpenBuilder) {
        btnOpenBuilder.onclick = openChordBuilderModal;
    }

    const btnOpenImport = document.getElementById('btn-open-import-chords');
    if (btnOpenImport) {
        btnOpenImport.onclick = openImportChordsModal;
    }

    // Transposición y Controles del Visor Detallado
    setupVisorControls();

    // Setup de eventos del Constructor Visual y Modales
    setupChordBuilderEvents();
    setupChordPickerEvents();
    setupSectionPickerEvents();
    setupImportChordsEvents();

    // Renderizar catálogo
    renderSongsCatalog(true);
}

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
            document.getElementById('subpanel-song-detail').classList.add('hidden');
            document.getElementById('subpanel-song-wizard').classList.add('hidden');
            document.getElementById('subpanel-songs-list').classList.remove('hidden');
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

function handleSongsSearch(e) {
    songsSearchQuery = e.target.value;
    songsVisibleLimit = SONGS_PAGE_SIZE;
    renderSongsCatalog(false);
}

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

    // Controlar visibilidad del botón "Cargar más"
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

function syncEditorToFormContent() {
    const container = document.getElementById('section-cards-container');
    if (container && container.children.length > 0) {
        syncCurrentEditorDOMToSections();
        const chordPro = sectionsToChordPro(currentEditorSections);
        if (chordPro !== undefined) {
            document.getElementById('song-form-content').value = chordPro;
            renderWizardLivePreview();
        }
    }
}

/**
 * Manejo del Submit del Wizard
 */
async function handleSongWizardSubmit(e) {
    e.preventDefault();
    syncEditorToFormContent();

    const id = document.getElementById('song-form-id').value;
    const suggestionId = document.getElementById('song-form-suggestion-id').value;
    const title = document.getElementById('song-form-title').value.trim();
    let artist = document.getElementById('song-form-artist').value.trim();
    if (!artist) artist = 'Desconocido';
    
    const album = document.getElementById('song-form-album').value.trim();
    const is_medley = document.getElementById('song-form-is-medley').checked ? 1 : 0;
    const key = is_medley ? 'C' : (formatMusicalChord(document.getElementById('song-form-key').value) || 'C');
    const is_public = document.getElementById('song-form-is-public')?.checked ? 1 : 0;
    const url = document.getElementById('song-form-url').value.trim();
    let content = document.getElementById('song-form-content').value.trim();

    if (!title) {
        showToast("El título de la canción es obligatorio", "danger");
        return;
    }

    if (!content) {
        content = `[INTRO]\n#[${key}]\n\n[VERSO 1]\nEscribe la letra aquí`;
    }

    const payload = {
        title,
        artist,
        album,
        key,
        is_medley,
        is_public,
        url,
        content
    };

    const submitBtn = document.getElementById('btn-save-song-wizard');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';
    }

    try {
        if (id) {
            await apiFetch(`/songs/${id}`, {
                method: 'PUT',
                body: payload
            });
            showToast("Canción actualizada correctamente");
        } else {
            await apiFetch('/songs', {
                method: 'POST',
                body: payload
            });
            showToast("Canción registrada con éxito");

            if (suggestionId) {
                try {
                    await apiFetch(`/suggestions/${suggestionId}/status`, {
                        method: 'PUT',
                        body: { status: 'agregada' }
                    });
                } catch (sugErr) {
                    console.error("Error al actualizar sugerencia:", sugErr);
                }
            }
        }

        exitSongWizard();
        await renderSongsCatalog(true);
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Canción';
        }
    }
}

function handleDeleteSong(songId, songTitle) {
    songIdToDelete = songId;
    const modalNameEl = document.getElementById('delete-song-modal-name');
    if (modalNameEl) modalNameEl.textContent = songTitle;
    document.getElementById('modal-delete-song-confirm').classList.remove('hidden');
}

async function executeDeleteSong() {
    if (!songIdToDelete) return;
    const btn = document.getElementById('btn-confirm-delete-song');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
        await apiFetch(`/songs/${songIdToDelete}`, { method: 'DELETE' });
        showToast("Canción eliminada del catálogo");
        document.getElementById('modal-delete-song-confirm').classList.add('hidden');
        exitSongWizard();
        await renderSongsCatalog(true);
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Eliminar';
        songIdToDelete = null;
    }
}

/* ==========================================================================
   CATÁLOGO DE CANCIONES DE LA COMUNIDAD (LEVARE)
   ========================================================================== */

/**
 * Abre el subpanel de exploración de la comunidad
 */
function openCommunityCatalogView() {
    document.getElementById('modal-song-choose-type')?.classList.add('hidden');
    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-community-catalog')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Comunidad';

    loadCommunitySongs();
}

/**
 * Regresa de la comunidad a la lista propia de canciones
 */
function exitCommunityCatalogView() {
    document.getElementById('subpanel-community-catalog')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-songs-list')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Canciones';

    renderSongsCatalog(true);
}

/**
 * Manejo de búsqueda en la comunidad
 */
function handleCommunitySearch(e) {
    communitySearchQuery = e.target.value;
    commCurrentPage = 1;
    if (commSearchDebounceTimer) clearTimeout(commSearchDebounceTimer);
    commSearchDebounceTimer = setTimeout(() => {
        loadCommunitySongs(false);
    }, 300);
}

/**
 * Cambio de ordenamiento en catálogo comunitario
 */
function handleCommunitySortChange(sortType) {
    communitySort = sortType;
    commCurrentPage = 1;
    document.querySelectorAll('.btn-community-sort').forEach(btn => {
        if (btn.getAttribute('data-sort') === sortType) {
            btn.className = 'btn-community-sort active px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition flex items-center gap-1.5 cursor-pointer';
        } else {
            btn.className = 'btn-community-sort px-3 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 cursor-pointer';
        }
    });
    loadCommunitySongs(false);
}

/**
 * Carga canciones comunitarias desde el backend con paginación
 */
async function loadCommunitySongs(isAppend = false) {
    const grid = document.getElementById('community-songs-grid');
    const countEl = document.getElementById('community-songs-count');
    const loadMoreContainer = document.getElementById('community-load-more-container');
    const btnLoadMore = document.getElementById('btn-community-load-more');
    if (!grid) return;

    if (!isAppend) {
        commCurrentPage = 1;
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">Explorando canciones de la comunidad...</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
    } else {
        commCurrentPage++;
        if (btnLoadMore) {
            btnLoadMore.disabled = true;
            btnLoadMore.textContent = "Cargando...";
        }
    }

    try {
        const url = `/songs/community?q=${encodeURIComponent(communitySearchQuery)}&sort=${communitySort}&page=${commCurrentPage}&limit=${COMM_PAGE_SIZE}`;
        const data = await apiFetch(url) || [];

        commHasMore = data.length === COMM_PAGE_SIZE;

        if (!isAppend) {
            communitySongs = data;
        } else {
            communitySongs = [...communitySongs, ...data];
        }

        renderCommunityCatalog(isAppend, data);
    } catch (e) {
        console.error("Error al cargar canciones comunitarias:", e);
        if (!isAppend) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-red-500">Error al cargar el catálogo de la comunidad.</div>`;
        } else {
            showToast("Error al cargar más canciones de la comunidad.", "danger");
        }
    } finally {
        if (btnLoadMore) {
            btnLoadMore.disabled = false;
            btnLoadMore.textContent = "Cargar más";
        }
    }
}

/**
 * Renderiza las tarjetas del catálogo comunitario
 */
function renderCommunityCatalog(isAppend = false, newBatch = []) {
    const grid = document.getElementById('community-songs-grid');
    const countEl = document.getElementById('community-songs-count');
    const loadMoreContainer = document.getElementById('community-load-more-container');
    const btnLoadMore = document.getElementById('btn-community-load-more');
    if (!grid) return;

    if (countEl) {
        countEl.textContent = `${communitySongs.length} ${communitySongs.length === 1 ? 'canción' : 'canciones'}`;
    }

    if (!isAppend) {
        grid.innerHTML = '';
    }

    if (communitySongs.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron canciones disponibles en la comunidad con los filtros actuales.</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const itemsToRender = isAppend ? newBatch : communitySongs;

    itemsToRender.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between gap-3 cursor-pointer group';

        const medleyBadge = s.is_medley ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mr-1.5">Medley</span>` : '';
        const albumText = s.album ? ` • ${s.album}` : '';
        const creatorName = s.creator_name ? `${s.creator_name}${s.creator_lastname ? ' ' + s.creator_lastname : ''}` : 'Usuario Levare';

        card.innerHTML = `
            <div class="space-y-1">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition truncate">${s.title}</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${medleyBadge}${s.artist || 'Desconocido'}${albumText}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 flex-shrink-0">${s.is_medley ? 'Medley' : (s.key || 'C')}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                    <i class="fa-solid fa-user-pen text-[10px]"></i>
                    <span class="truncate">Agregada por: <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">${creatorName}</strong></span>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <div class="flex items-center gap-1.5">
                    <button type="button" class="btn-community-like-toggle px-2.5 py-1 rounded-xl border ${s.user_has_liked ? 'border-pink-500/30 bg-pink-500/10 text-pink-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-pink-500'} transition flex items-center gap-1.5 cursor-pointer" data-id="${s.id}">
                        <i class="${s.user_has_liked ? 'fa-solid' : 'fa-regular'} fa-heart text-xs"></i>
                        <span class="font-semibold comm-likes-count">${s.likes_count}</span>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button type="button" class="btn-community-preview px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer" data-id="${s.id}">
                        Ver letra
                    </button>
                    ${s.already_in_group ? `
                        <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                            <i class="fa-solid fa-check text-[10px]"></i> En la banda
                        </span>
                    ` : `
                        <button type="button" class="btn-community-import px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-1 cursor-pointer" data-id="${s.id}">
                            <i class="fa-solid fa-plus text-[10px]"></i> Agregar
                        </button>
                    `}
                </div>
            </div>
        `;

        const btnLike = card.querySelector('.btn-community-like-toggle');
        if (btnLike) {
            btnLike.onclick = (e) => {
                e.stopPropagation();
                toggleCommunitySongLike(s.id);
            };
        }

        const btnPreview = card.querySelector('.btn-community-preview');
        if (btnPreview) {
            btnPreview.onclick = (e) => {
                e.stopPropagation();
                openCommunitySongPreview(s.id);
            };
        }

        const btnImport = card.querySelector('.btn-community-import');
        if (btnImport) {
            btnImport.onclick = (e) => {
                e.stopPropagation();
                importCommunitySong(s.id);
            };
        }

        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            openCommunitySongPreview(s.id);
        };

        grid.appendChild(card);
    });

    // Controlar botón Cargar más de la comunidad
    if (loadMoreContainer && btnLoadMore) {
        if (commHasMore) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => loadCommunitySongs(true);
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}

/**
 * Abre el modal de vista previa de una canción comunitaria
 */
function openCommunitySongPreview(songId) {
    const song = communitySongs.find(s => s.id == songId);
    if (!song) return;

    currentCommunityViewingSong = song;

    const modal = document.getElementById('modal-community-song-preview');
    if (!modal) return;

    // Hidratar campos
    document.getElementById('comm-preview-title').textContent = song.title;
    
    const keyBadge = document.getElementById('comm-preview-key-badge');
    const medleyBadge = document.getElementById('comm-preview-medley-badge');
    if (keyBadge) keyBadge.textContent = song.is_medley ? 'Medley' : (song.key || 'C');
    if (medleyBadge) {
        if (song.is_medley) medleyBadge.classList.remove('hidden');
        else medleyBadge.classList.add('hidden');
    }

    const artistAlbumEl = document.getElementById('comm-preview-artist-album');
    if (artistAlbumEl) {
        const albumText = song.album ? ` • ${song.album}` : '';
        artistAlbumEl.textContent = `${song.artist || 'Desconocido'}${albumText}`;
    }

    const creatorNameEl = document.getElementById('comm-preview-creator-name');
    if (creatorNameEl) {
        const creator = song.creator_name ? `${song.creator_name}${song.creator_lastname ? ' ' + song.creator_lastname : ''}` : 'Usuario Levare';
        creatorNameEl.textContent = creator;
    }

    // Likes
    updateCommunityModalLikeUI(song.user_has_liked, song.likes_count);

    // Botón de Importar / Agregar
    updateCommunityModalImportUI(song.already_in_group);

    // Letra y Acordes
    const chordsContent = document.getElementById('comm-preview-chords-content');
    if (chordsContent) {
        chordsContent.innerHTML = parseChordsToHTML(song.content || '', 0);
    }

    // URL video/audio
    const urlWrapper = document.getElementById('comm-preview-url-wrapper');
    const urlLink = document.getElementById('comm-preview-url-link');
    if (urlWrapper && urlLink) {
        if (song.url && song.url.trim().length > 0) {
            urlLink.href = song.url.trim();
            urlWrapper.classList.remove('hidden');
        } else {
            urlWrapper.classList.add('hidden');
        }
    }

    modal.classList.remove('hidden');
}

/**
 * Actualiza la UI del botón de Like en el modal
 */
function updateCommunityModalLikeUI(hasLiked, count) {
    const likeIcon = document.getElementById('comm-preview-like-icon');
    const likeCount = document.getElementById('comm-preview-likes-count');
    const btnLike = document.getElementById('btn-comm-preview-like');

    if (likeCount) likeCount.textContent = count || 0;
    if (likeIcon) {
        if (hasLiked) {
            likeIcon.className = 'fa-solid fa-heart text-red-500 text-sm';
        } else {
            likeIcon.className = 'fa-regular fa-heart text-zinc-400 text-sm';
        }
    }
}

/**
 * Actualiza la UI del botón de Importar en el modal
 */
function updateCommunityModalImportUI(alreadyInGroup) {
    const container = document.getElementById('comm-preview-import-container');
    if (!container) return;

    if (alreadyInGroup) {
        container.innerHTML = `
            <span class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <i class="fa-solid fa-check text-xs"></i>
                <span>En tu repertorio</span>
            </span>
        `;
    } else {
        container.innerHTML = `
            <button type="button" id="btn-comm-preview-import" class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Agregar a mi Repertorio</span>
            </button>
        `;
        const btnImport = document.getElementById('btn-comm-preview-import');
        if (btnImport && currentCommunityViewingSong) {
            btnImport.onclick = () => importCommunitySong(currentCommunityViewingSong.id);
        }
    }
}

/**
 * Toggle Like en una canción de la comunidad
 */
async function toggleCommunitySongLike(songId) {
    try {
        const res = await apiFetch(`/songs/${songId}/like`, { method: 'POST' });
        
        // Actualizar en array en memoria
        const song = communitySongs.find(s => s.id == songId);
        if (song) {
            song.user_has_liked = res.liked;
            song.likes_count = res.likes_count;
        }

        if (currentCommunityViewingSong && currentCommunityViewingSong.id == songId) {
            currentCommunityViewingSong.user_has_liked = res.liked;
            currentCommunityViewingSong.likes_count = res.likes_count;
            updateCommunityModalLikeUI(res.liked, res.likes_count);
        }

        renderCommunityCatalog();
    } catch (e) {
        showToast(e.message || "Error al registrar el voto", "danger");
    }
}

/**
 * Importa / Agrega una canción comunitaria a la banda activa
 */
async function importCommunitySong(songId) {
    try {
        await apiFetch(`/songs/${songId}/import`, { method: 'POST' });
        showToast("Canción agregada al catálogo de tu banda con éxito");

        // Actualizar en array en memoria
        const song = communitySongs.find(s => s.id == songId);
        if (song) {
            song.already_in_group = true;
        }

        if (currentCommunityViewingSong && currentCommunityViewingSong.id == songId) {
            currentCommunityViewingSong.already_in_group = true;
            updateCommunityModalImportUI(true);
        }

        // Invalidar caché del catálogo propio para forzar refresco
        cachedSongs = [];

        renderCommunityCatalog();
    } catch (e) {
        showToast(e.message || "Error al agregar canción", "danger");
    }
}

/* ==========================================================================
   CONSTRUCTOR VISUAL DE LETRA Y ACORDES POR SECCIONES MODULARES (CARDS)
   ========================================================================== */

function openChordBuilderModal() {
    const content = document.getElementById('song-form-content').value;
    const isMedley = document.getElementById('song-form-is-medley')?.checked;
    const baseKey = isMedley ? 'Medley' : (document.getElementById('song-form-key').value || 'C');
    const keyBadge = document.getElementById('builder-current-key-badge');

    if (keyBadge) keyBadge.textContent = baseKey;

    // Convertir ChordPro a array de objetos de sección
    currentEditorSections = chordProToSections(content);
    if (!currentEditorSections || currentEditorSections.length === 0) {
        currentEditorSections = [{
            id: 'sec_' + Date.now(),
            type: 'VERSO 1',
            isInstrumental: false,
            chords: [],
            lines: ['']
        }];
    }

    isReorderModeActive = false;
    renderSectionCards();
    updateReorderModeUI();
    document.getElementById('modal-chord-builder').classList.remove('hidden');
}

let isReorderModeActive = false;

function setupChordBuilderEvents() {
    const btnApply = document.getElementById('btn-apply-chord-builder');
    const btnCloseX = document.getElementById('btn-close-chord-builder-x');
    const btnAddSection = document.getElementById('btn-toolbar-add-section');
    const btnToggleReorder = document.getElementById('btn-toggle-reorder-mode');

    if (btnApply) {
        btnApply.onclick = () => {
            syncEditorToFormContent();
            document.getElementById('modal-chord-builder').classList.add('hidden');
        };
    }

    if (btnCloseX) {
        btnCloseX.onclick = () => {
            syncEditorToFormContent();
            document.getElementById('modal-chord-builder').classList.add('hidden');
        };
    }

    if (btnAddSection) {
        btnAddSection.onclick = () => {
            syncCurrentEditorDOMToSections();
            document.getElementById('modal-section-picker').classList.remove('hidden');
        };
    }

    if (btnToggleReorder) {
        btnToggleReorder.onclick = () => {
            isReorderModeActive = !isReorderModeActive;
            updateReorderModeUI();
        };
    }

    setupPopoverChordActions();
}

function updateReorderModeUI() {
    const container = document.getElementById('section-cards-container');
    const btn = document.getElementById('btn-toggle-reorder-mode');
    const label = document.getElementById('reorder-mode-btn-label');

    if (!container || !btn) return;

    if (isReorderModeActive) {
        container.classList.add('reorder-mode-active');
        btn.classList.add('active');
        if (label) label.textContent = 'Ver Normal';
        btn.innerHTML = '<i class="fa-solid fa-check text-xs"></i> <span id="reorder-mode-btn-label">Ver Normal</span>';
    } else {
        container.classList.remove('reorder-mode-active');
        btn.classList.remove('active');
        if (label) label.textContent = 'Modo Ordenar';
        btn.innerHTML = '<i class="fa-solid fa-arrows-up-down text-xs"></i> <span id="reorder-mode-btn-label">Modo Ordenar</span>';
        
        // Re-posicionar badges al expandir
        setTimeout(() => {
            document.querySelectorAll('.stacked-line-block').forEach(lineBlock => {
                const input = lineBlock.querySelector('.stacked-lyrics-input');
                if (input) updateStackedBadgesPosition(lineBlock, input);
            });
        }, 50);
    }
}

/**
 * Renderiza dinámicamente las tarjetas de sección en el contenedor del modal
 */
function renderSectionCards() {
    const container = document.getElementById('section-cards-container');
    if (!container) return;

    container.innerHTML = '';

    currentEditorSections.forEach((sec, secIdx) => {
        const theme = getSectionTheme(sec.type);
        const card = document.createElement('div');
        card.className = 'section-card-block group';
        card.setAttribute('data-section-id', sec.id);

        // Header de la Tarjeta (Toda el área izquierda/central es zona de arrastre)
        const header = document.createElement('div');
        header.className = 'section-card-header';
        header.innerHTML = `
            <div class="section-card-header-drag-zone flex-1 flex items-center gap-2 cursor-grab select-none touch-none py-1" title="Arrastrar para reordenar sección">
                <span class="section-drag-handle">
                    <i class="fa-solid fa-grip-vertical text-xs"></i>
                </span>
                <span class="px-2 py-0.5 rounded-md text-xs font-bold font-mono uppercase border ${theme.badgeBg}">
                    ${escapeHtmlText(sec.type)}
                </span>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
                <button type="button" class="btn-move-section-up p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs transition cursor-pointer ${secIdx === 0 ? 'opacity-25 pointer-events-none' : ''}" title="Subir sección">
                    <i class="fa-solid fa-arrow-up text-xs"></i>
                </button>
                <button type="button" class="btn-move-section-down p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs transition cursor-pointer ${secIdx === currentEditorSections.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="Bajar sección">
                    <i class="fa-solid fa-arrow-down text-xs"></i>
                </button>
                <button type="button" class="btn-toggle-section-mode p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs transition cursor-pointer" title="${sec.isInstrumental ? 'Cambiar a modo Letra' : 'Cambiar a modo Instrumental'}">
                    <i class="fa-solid ${sec.isInstrumental ? 'fa-align-left' : 'fa-guitar'}"></i>
                </button>
                <button type="button" class="btn-delete-section p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 text-xs transition cursor-pointer" title="Eliminar sección">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        // Body de la Tarjeta
        const body = document.createElement('div');
        body.className = 'section-card-body';

        if (sec.isInstrumental) {
            // MODO INSTRUMENTAL: Badges grandes cuadrados
            const instContainer = document.createElement('div');
            instContainer.className = 'section-instrumental-container';

            if (Array.isArray(sec.chords) && sec.chords.length > 0) {
                sec.chords.forEach((chordName, chordIdx) => {
                    const badge = createInstrumentalChordBadge(chordName, sec.id, chordIdx);
                    instContainer.appendChild(badge);
                });
            } else {
                const emptyNotice = document.createElement('span');
                emptyNotice.className = 'text-xs text-zinc-400 italic pointer-events-none select-none';
                emptyNotice.textContent = 'Sin acordes aún. Usa el botón + para agregar acordes a este instrumental.';
                instContainer.appendChild(emptyNotice);
            }

            body.appendChild(instContainer);
        } else {
            // MODO LETRA: Líneas Apiladas (Acordes en línea superior + Letra en línea inferior)
            const stackedContainer = document.createElement('div');
            stackedContainer.className = 'section-stacked-container';

            if (!Array.isArray(sec.lines) || sec.lines.length === 0) {
                sec.lines = [''];
            }

            sec.lines.forEach((lineStr, lineIdx) => {
                const { text, chords } = parseLineChordPro(lineStr);

                const scroller = document.createElement('div');
                scroller.className = 'stacked-line-scroller';

                const lineContent = document.createElement('div');
                lineContent.className = 'stacked-line-content';

                const lineBlock = document.createElement('div');
                lineBlock.className = 'stacked-line-block';
                lineBlock.setAttribute('data-line-idx', lineIdx);

                // 1. Carril Superior de Acordes
                const chordsLane = document.createElement('div');
                chordsLane.className = 'stacked-chords-lane';

                chords.forEach((chordItem, chordIdx) => {
                    const badge = createStackedChordBadge(chordItem.chord, sec.id, lineIdx, chordIdx, chordItem.offset);
                    chordsLane.appendChild(badge);
                });

                // 2. Carril Inferior de Letra
                const lyricsLane = document.createElement('div');
                lyricsLane.className = 'stacked-lyrics-lane';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'stacked-lyrics-input';
                input.setAttribute('data-sec-id', sec.id);
                input.setAttribute('data-line-idx', lineIdx);
                input.setAttribute('spellcheck', 'false');
                input.value = text;
                input.placeholder = 'Escribe la letra o acordes de esta línea...';

                const updateInputWidth = () => {
                    const len = Math.max(input.value.length, 12);
                    input.style.width = `max(100%, ${len + 8}ch)`;
                };
                updateInputWidth();

                // Tracking infalible del cursor y línea activa
                const updateActiveCursor = () => {
                    activeSectionId = sec.id;
                    activeLineIdx = lineIdx;
                    activeCharOffset = (input.selectionStart !== undefined) ? input.selectionStart : input.value.length;
                };

                ['focus', 'click', 'keyup', 'select'].forEach(evt => {
                    input.addEventListener(evt, updateActiveCursor);
                });

                // Al escribir en la línea, actualizar sec.lines[lineIdx]
                input.addEventListener('input', () => {
                    updateInputWidth();
                    updateActiveCursor();
                    sec.lines[lineIdx] = formatLineChordPro(input.value, chords);
                    updateStackedBadgesPosition(lineBlock, input);
                });

                // Teclas de navegación / enter / backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        syncCurrentEditorDOMToSections();
                        sec.lines.splice(lineIdx + 1, 0, '');
                        activeSectionId = sec.id;
                        activeLineIdx = lineIdx + 1;
                        activeCharOffset = 0;
                        renderSectionCards();
                        focusLyricsInput(sec.id, lineIdx + 1);
                    } else if (e.key === 'Backspace' && input.value === '' && sec.lines.length > 1) {
                        e.preventDefault();
                        syncCurrentEditorDOMToSections();
                        sec.lines.splice(lineIdx, 1);
                        activeSectionId = sec.id;
                        activeLineIdx = Math.max(0, lineIdx - 1);
                        activeCharOffset = 0;
                        renderSectionCards();
                        focusLyricsInput(sec.id, activeLineIdx);
                    }
                });

                // Soporte para pegar texto multilínea
                input.addEventListener('paste', (e) => {
                    const pasted = e.clipboardData?.getData('text/plain') || '';
                    if (pasted.includes('\n')) {
                        e.preventDefault();
                        syncCurrentEditorDOMToSections();
                        const pastedLines = pasted.split(/\r?\n/).filter(l => l.trim() !== '');
                        if (pastedLines.length > 0) {
                            sec.lines.splice(lineIdx, 1, ...pastedLines);
                            renderSectionCards();
                        }
                    }
                });

                lyricsLane.appendChild(input);

                // Soporte Drag & Drop con Resalto de Letras
                attachStackedLineDragDrop(lineBlock, input, sec.id, lineIdx, chords);

                lineBlock.appendChild(chordsLane);
                lineBlock.appendChild(lyricsLane);
                lineContent.appendChild(lineBlock);
                scroller.appendChild(lineContent);
                stackedContainer.appendChild(scroller);

                // Posicionar con precisión métrica de píxeles y anticolisión
                setTimeout(() => updateStackedBadgesPosition(lineBlock, input), 0);
            });

            body.appendChild(stackedContainer);
        }

        // Botón Circular Flotante (+ FAB) en la esquina inferior derecha
        const fabBtn = document.createElement('button');
        fabBtn.type = 'button';
        fabBtn.className = 'btn-section-add-chord-fab cursor-pointer';
        fabBtn.setAttribute('title', 'Agregar acorde en la posición del puntero');
        fabBtn.innerHTML = '<i class="fa-solid fa-plus text-xs"></i>';
        fabBtn.onclick = (e) => {
            e.stopPropagation();
            activeSectionId = sec.id;

            // Si la sección no tenía línea enfocada aún, seleccionar la última línea o primera
            if (activeLineIdx === null || activeLineIdx >= (sec.lines || []).length) {
                activeLineIdx = (sec.lines && sec.lines.length > 0) ? sec.lines.length - 1 : 0;
                activeCharOffset = 0;
            }

            chordPickerMode = 'editor';
            editingBadgeTarget = null;
            openChordPickerModal();
        };
        body.appendChild(fabBtn);

        card.appendChild(header);
        card.appendChild(body);

        // Eventos del Header
        const btnUp = header.querySelector('.btn-move-section-up');
        if (btnUp) {
            btnUp.onclick = (e) => {
                e.stopPropagation();
                moveSectionPosition(secIdx, secIdx - 1);
            };
        }

        const btnDown = header.querySelector('.btn-move-section-down');
        if (btnDown) {
            btnDown.onclick = (e) => {
                e.stopPropagation();
                moveSectionPosition(secIdx, secIdx + 1);
            };
        }

        const btnToggleMode = header.querySelector('.btn-toggle-section-mode');
        if (btnToggleMode) {
            btnToggleMode.onclick = (e) => {
                e.stopPropagation();
                syncCurrentEditorDOMToSections();
                sec.isInstrumental = !sec.isInstrumental;
                renderSectionCards();
            };
        }

        const btnDeleteSec = header.querySelector('.btn-delete-section');
        if (btnDeleteSec) {
            btnDeleteSec.onclick = (e) => {
                e.stopPropagation();
                syncCurrentEditorDOMToSections();
                currentEditorSections = currentEditorSections.filter(s => s.id !== sec.id);
                if (currentEditorSections.length === 0) {
                    currentEditorSections.push({
                        id: 'sec_' + Date.now(),
                        type: 'VERSO 1',
                        isInstrumental: false,
                        chords: [],
                        lines: ['']
                    });
                }
                renderSectionCards();
            };
        }

        // Configurar Drag & Drop de la tarjeta de sección
        setupSectionCardDragAndDrop(card, sec.id);

        container.appendChild(card);
    });

    attachAllBadgeInteractions();
}

/**
 * Mueve una sección de posición con animación suave de intercambio
 */
function moveSectionPosition(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= currentEditorSections.length || fromIndex === toIndex) return;

    syncCurrentEditorDOMToSections();

    const container = document.getElementById('section-cards-container');
    const cards = container?.querySelectorAll('.section-card-block');
    if (!cards || !cards[fromIndex] || !cards[toIndex]) {
        const [movedSec] = currentEditorSections.splice(fromIndex, 1);
        currentEditorSections.splice(toIndex, 0, movedSec);
        renderSectionCards();
        if (isReorderModeActive) updateReorderModeUI();
        return;
    }

    const cardA = cards[fromIndex];
    const cardB = cards[toIndex];

    const distY = cardB.offsetTop - cardA.offsetTop;

    cardA.style.transition = 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)';
    cardB.style.transition = 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)';
    cardA.style.transform = `translateY(${distY}px)`;
    cardB.style.transform = `translateY(${-distY}px)`;
    cardA.style.zIndex = '20';

    setTimeout(() => {
        const [movedSec] = currentEditorSections.splice(fromIndex, 1);
        currentEditorSections.splice(toIndex, 0, movedSec);
        renderSectionCards();
        if (isReorderModeActive) {
            updateReorderModeUI();
        }
    }, 220);
}

/**
 * Enfoca el input de letra de una sección y línea específica
 */
function focusLyricsInput(secId, lineIdx) {
    setTimeout(() => {
        const input = document.querySelector(`.stacked-lyrics-input[data-sec-id="${secId}"][data-line-idx="${lineIdx}"]`);
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }, 30);
}

/**
 * Medición de alta precisión de métricas de caracteres (charWidth y paddingLeft)
 */
function getCharMetrics(inputEl) {
    const computed = window.getComputedStyle(inputEl || document.body);
    const paddingLeft = parseFloat(computed.paddingLeft) || 6;

    const testSpan = document.createElement('span');
    testSpan.style.font = computed.font;
    testSpan.style.fontFamily = computed.fontFamily;
    testSpan.style.fontSize = computed.fontSize;
    testSpan.style.letterSpacing = computed.letterSpacing;
    testSpan.style.visibility = 'hidden';
    testSpan.style.position = 'absolute';
    testSpan.style.whiteSpace = 'pre';
    testSpan.textContent = 'WWWWWWWWWW'; // 10 caracteres monospace para promedio exacto
    document.body.appendChild(testSpan);
    const totalWidth = testSpan.getBoundingClientRect().width;
    document.body.removeChild(testSpan);

    const charWidth = totalWidth > 0 ? (totalWidth / 10) : 9.0;
    return { charWidth, paddingLeft };
}

/**
 * Crea un badge de acorde posicionado en la línea superior sobre la letra
 */
function createStackedChordBadge(chordName, secId, lineIdx, chordIdx, offset) {
    const badge = document.createElement('div');
    badge.className = 'stacked-chord-badge';
    badge.setAttribute('draggable', 'true');
    badge.setAttribute('data-chord', chordName);
    badge.setAttribute('data-sec-id', secId);
    badge.setAttribute('data-line-idx', lineIdx);
    badge.setAttribute('data-chord-idx', chordIdx);
    badge.setAttribute('data-offset', offset);

    badge.innerHTML = `
        <div class="stacked-chord-pill">${escapeHtmlText(chordName)}</div>
        <div class="stacked-chord-arrow"></div>
    `;

    return badge;
}

/**
 * Actualiza las posiciones horizontales de los badges de acordes en una línea con algoritmo anticolisión
 */
function updateStackedBadgesPosition(lineBlock, input) {
    if (!lineBlock || !input) return;
    const { charWidth, paddingLeft } = getCharMetrics(input);
    const badges = Array.from(lineBlock.querySelectorAll('.stacked-chord-badge'));

    // Ordenar por offset ascendente
    badges.sort((a, b) => {
        const offA = parseInt(a.getAttribute('data-offset')) || 0;
        const offB = parseInt(b.getAttribute('data-offset')) || 0;
        return offA - offB;
    });

    let lastRightEdge = -Infinity;

    badges.forEach(badge => {
        const offset = parseInt(badge.getAttribute('data-offset')) || 0;
        let targetX = paddingLeft + (offset * charWidth) + (charWidth / 2);

        // Anticolisión: Evitar que los acordes se sobrepongan visualmente
        const pill = badge.querySelector('.stacked-chord-pill');
        const badgeHalfWidth = ((pill ? pill.offsetWidth : 36) / 2) + 2;

        if (targetX - badgeHalfWidth < lastRightEdge + 4) {
            targetX = lastRightEdge + 4 + badgeHalfWidth;
        }

        badge.style.left = `${targetX}px`;
        lastRightEdge = targetX + badgeHalfWidth;
    });
}

// Recalcular posiciones si cambia el tamaño o la orientación en móvil
window.addEventListener('resize', () => {
    document.querySelectorAll('.stacked-line-block').forEach(lineBlock => {
        const input = lineBlock.querySelector('.stacked-lyrics-input');
        if (input) updateStackedBadgesPosition(lineBlock, input);
    });
});

/**
 * Soporte Drag & Drop para mover acordes entre caracteres y líneas con resalto visual
 */
function attachStackedLineDragDrop(lineBlock, input, secId, lineIdx, chords) {
    lineBlock.addEventListener('dragover', (e) => {
        if (!draggedChordData) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        lineBlock.classList.add('drag-target-line');

        const rect = input.getBoundingClientRect();
        const { charWidth, paddingLeft } = getCharMetrics(input);
        const relativeX = Math.max(0, e.clientX - rect.left - paddingLeft);
        const targetOffset = Math.min(input.value.length, Math.round(relativeX / charWidth));

        // Mostrar u orientar el indicador de caída vertical exactamente en la división del carácter
        let indicator = lineBlock.querySelector('.char-drop-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'char-drop-indicator';
            input.parentElement.appendChild(indicator);
        }
        indicator.style.left = `${paddingLeft + (targetOffset * charWidth)}px`;
    });

    lineBlock.addEventListener('dragleave', (e) => {
        if (!lineBlock.contains(e.relatedTarget)) {
            lineBlock.classList.remove('drag-target-line');
            const indicator = lineBlock.querySelector('.char-drop-indicator');
            if (indicator) indicator.remove();
        }
    });

    lineBlock.addEventListener('drop', (e) => {
        if (!draggedChordData) return;
        e.preventDefault();

        lineBlock.classList.remove('drag-target-line');
        const indicator = lineBlock.querySelector('.char-drop-indicator');
        if (indicator) indicator.remove();

        const rect = input.getBoundingClientRect();
        const { charWidth, paddingLeft } = getCharMetrics(input);
        const relativeX = Math.max(0, e.clientX - rect.left - paddingLeft);
        const targetOffset = Math.min(input.value.length, Math.round(relativeX / charWidth));

        moveChordToNewPosition(draggedChordData, secId, lineIdx, targetOffset);
    });
}

/**
 * Mueve un acorde desde su posición original a una nueva línea y offset
 */
function moveChordToNewPosition(srcData, destSecId, destLineIdx, destOffset) {
    syncCurrentEditorDOMToSections();

    // 1. Remover acorde de la posición de origen
    const srcSec = currentEditorSections.find(s => s.id === srcData.secId);
    if (srcSec && srcSec.lines && srcSec.lines[srcData.lineIdx]) {
        const { text: srcText, chords: srcChords } = parseLineChordPro(srcSec.lines[srcData.lineIdx]);
        srcChords.splice(srcData.chordIdx, 1);
        srcSec.lines[srcData.lineIdx] = formatLineChordPro(srcText, srcChords);
    }

    // 2. Insertar en la posición de destino
    const destSec = currentEditorSections.find(s => s.id === destSecId);
    if (destSec && destSec.lines) {
        if (!destSec.lines[destLineIdx]) destSec.lines[destLineIdx] = '';
        const { text: destText, chords: destChords } = parseLineChordPro(destSec.lines[destLineIdx]);
        destChords.push({ chord: srcData.chord, offset: destOffset });
        destSec.lines[destLineIdx] = formatLineChordPro(destText, destChords);
    }

    draggedChordData = null;
    renderSectionCards();
}

/**
 * Reordenamiento vertical de tarjetas de secciones por Drag & Drop (Desktop + Mobile Touch)
 */
function setupSectionCardDragAndDrop(card, secId) {
    const dragZone = card.querySelector('.section-card-header-drag-zone') || card.querySelector('.section-drag-handle');
    if (!dragZone) return;

    // ==========================================
    // 1. SOPORTE PARA ESCRITORIO (HTML5 Drag & Drop)
    // ==========================================
    dragZone.setAttribute('draggable', 'true');

    dragZone.addEventListener('dragstart', (e) => {
        draggedSectionCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/section-id', secId);
    });

    dragZone.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.section-card-block').forEach(c => {
            c.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        draggedSectionCard = null;
    });

    card.addEventListener('dragover', (e) => {
        if (!draggedSectionCard || draggedSectionCard === card) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
            card.classList.add('drag-over-top');
            card.classList.remove('drag-over-bottom');
        } else {
            card.classList.add('drag-over-bottom');
            card.classList.remove('drag-over-top');
        }
    });

    card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    card.addEventListener('drop', (e) => {
        if (!draggedSectionCard || draggedSectionCard === card) return;
        e.preventDefault();

        syncCurrentEditorDOMToSections();

        const fromId = draggedSectionCard.getAttribute('data-section-id');
        const toId = card.getAttribute('data-section-id');

        const fromIndex = currentEditorSections.findIndex(s => s.id === fromId);
        const toIndex = currentEditorSections.findIndex(s => s.id === toId);

        if (fromIndex !== -1 && toIndex !== -1) {
            const [movedSec] = currentEditorSections.splice(fromIndex, 1);
            const rect = card.getBoundingClientRect();
            const insertIndex = (e.clientY < rect.top + rect.height / 2) ? toIndex : toIndex + 1;
            currentEditorSections.splice(insertIndex > fromIndex ? insertIndex - 1 : insertIndex, 0, movedSec);
            renderSectionCards();
        }
    });

    // ==========================================
    // 2. SOPORTE PARA DISPOSITIVOS MÓVILES (Touch Events)
    // ==========================================
    let touchTargetCard = null;
    let touchInsertAbove = true;

    dragZone.addEventListener('touchstart', () => {
        draggedSectionCard = card;
        card.classList.add('dragging');
        touchTargetCard = null;
    }, { passive: true });

    dragZone.addEventListener('touchmove', (e) => {
        if (!draggedSectionCard) return;
        const touch = e.touches[0];
        if (!touch) return;

        // Evitar el scroll de la página mientras se arrastra la sección
        if (e.cancelable) e.preventDefault();

        const touchX = touch.clientX;
        const touchY = touch.clientY;

        // Detectar la tarjeta de sección que se encuentra bajo el dedo
        const elements = document.elementsFromPoint(touchX, touchY) || [];
        const hoveredCard = elements.find(el => el.classList && el.classList.contains('section-card-block') && el !== card);

        document.querySelectorAll('.section-card-block').forEach(c => {
            c.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        if (hoveredCard) {
            touchTargetCard = hoveredCard;
            const rect = hoveredCard.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            touchInsertAbove = (touchY < midY);

            if (touchInsertAbove) {
                hoveredCard.classList.add('drag-over-top');
            } else {
                hoveredCard.classList.add('drag-over-bottom');
            }
        } else {
            touchTargetCard = null;
        }
    }, { passive: false });

    const handleTouchEnd = () => {
        if (!draggedSectionCard) return;

        card.classList.remove('dragging');
        document.querySelectorAll('.section-card-block').forEach(c => {
            c.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        if (touchTargetCard && touchTargetCard !== card) {
            syncCurrentEditorDOMToSections();

            const fromId = card.getAttribute('data-section-id');
            const toId = touchTargetCard.getAttribute('data-section-id');

            const fromIndex = currentEditorSections.findIndex(s => s.id === fromId);
            const toIndex = currentEditorSections.findIndex(s => s.id === toId);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [movedSec] = currentEditorSections.splice(fromIndex, 1);
                const insertIndex = touchInsertAbove ? toIndex : toIndex + 1;
                currentEditorSections.splice(insertIndex > fromIndex ? insertIndex - 1 : insertIndex, 0, movedSec);
                renderSectionCards();
            }
        }

        draggedSectionCard = null;
        touchTargetCard = null;
    };

    dragZone.addEventListener('touchend', handleTouchEnd);
    dragZone.addEventListener('touchcancel', handleTouchEnd);
}

function createInstrumentalChordBadge(chordName, secId, chordIdx) {
    const badge = document.createElement('span');
    badge.className = 'instrumental-chord-badge';
    badge.setAttribute('draggable', 'true');
    badge.setAttribute('data-chord', chordName);
    badge.setAttribute('data-sec-id', secId);
    badge.setAttribute('data-chord-idx', chordIdx);
    badge.textContent = chordName;
    return badge;
}

function attachAllBadgeInteractions() {
    // 1. Badges apilados en letra (.stacked-chord-badge)
    document.querySelectorAll('.stacked-chord-badge').forEach(badge => {
        badge.ondragstart = (e) => {
            e.stopPropagation();
            const secId = badge.getAttribute('data-sec-id');
            const lineIdx = parseInt(badge.getAttribute('data-line-idx'));
            const chordIdx = parseInt(badge.getAttribute('data-chord-idx'));
            const chord = badge.getAttribute('data-chord');

            draggedChordData = { secId, lineIdx, chordIdx, chord };
            e.dataTransfer.setData('text/plain', chord);
            e.dataTransfer.effectAllowed = 'move';
        };

        badge.ondragend = () => {
            draggedChordData = null;
            document.querySelectorAll('.drag-target-line').forEach(el => el.classList.remove('drag-target-line'));
            document.querySelectorAll('.char-drop-indicator').forEach(el => el.remove());
        };

        badge.onclick = (e) => {
            e.stopPropagation();
            showPopoverForBadge(badge);
        };
    });

    // 2. Badges instrumentales (.instrumental-chord-badge)
    document.querySelectorAll('.instrumental-chord-badge').forEach(badge => {
        badge.onclick = (e) => {
            e.stopPropagation();
            showPopoverForBadge(badge);
        };
    });
}

function showPopoverForBadge(badge) {
    activeSelectedBadge = badge;
    const popover = document.getElementById('popover-chord-action');
    if (!popover) return;

    const rect = badge.getBoundingClientRect();
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.left = `${Math.max(10, rect.left + window.scrollX - 20)}px`;
    popover.classList.remove('hidden');

    const handleOutsideClick = (e) => {
        if (!popover.contains(e.target) && e.target !== badge) {
            popover.classList.add('hidden');
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    setTimeout(() => document.addEventListener('click', handleOutsideClick), 10);
}

function setupPopoverChordActions() {
    const popover = document.getElementById('popover-chord-action');
    const btnChange = document.getElementById('btn-popover-change-chord');
    const btnDelete = document.getElementById('btn-popover-delete-chord');

    if (btnChange) {
        btnChange.onclick = () => {
            if (activeSelectedBadge) {
                editingBadgeTarget = activeSelectedBadge;
                chordPickerMode = 'editor';
                popover.classList.add('hidden');
                openChordPickerModal();
            }
        };
    }

    if (btnDelete) {
        btnDelete.onclick = () => {
            if (activeSelectedBadge) {
                const secId = activeSelectedBadge.getAttribute('data-sec-id');
                const chordIdx = activeSelectedBadge.getAttribute('data-chord-idx');
                const lineIdx = activeSelectedBadge.getAttribute('data-line-idx');

                if (secId !== null && chordIdx !== null) {
                    const sec = currentEditorSections.find(s => s.id === secId);
                    if (sec) {
                        if (sec.isInstrumental && Array.isArray(sec.chords)) {
                            sec.chords.splice(parseInt(chordIdx), 1);
                        } else if (lineIdx !== null && sec.lines && sec.lines[parseInt(lineIdx)]) {
                            const { text, chords } = parseLineChordPro(sec.lines[parseInt(lineIdx)]);
                            chords.splice(parseInt(chordIdx), 1);
                            sec.lines[parseInt(lineIdx)] = formatLineChordPro(text, chords);
                        }
                        renderSectionCards();
                    }
                } else {
                    activeSelectedBadge.remove();
                }

                activeSelectedBadge = null;
                popover.classList.add('hidden');
            }
        };
    }
}

/* ==========================================================================
   MODAL SELECTOR DE ACORDES (MATRIZ CON BÚSQUEDA Y FILTROS)
   ========================================================================== */

function openChordPickerModal() {
    const baseKey = document.getElementById('song-form-key').value || 'C';
    const keyLabel = document.getElementById('picker-key-label');
    if (keyLabel) keyLabel.textContent = baseKey;

    pickerAccidental = null;
    pickerType = 'maj';
    pickerSearch = '';

    const searchInput = document.getElementById('chord-picker-search');
    if (searchInput) searchInput.value = '';

    updatePickerFilterUI();
    renderChordSuggestions(baseKey);
    renderChordPickerGrid();

    document.getElementById('modal-chord-picker').classList.remove('hidden');
}

function setupChordPickerEvents() {
    document.querySelectorAll('.btn-close-chord-picker').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-chord-picker').classList.add('hidden');
    });

    const searchInput = document.getElementById('chord-picker-search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            pickerSearch = e.target.value.trim().toLowerCase();
            renderChordPickerGrid();
        };
    }

    // Filtros de alteración (# / b toggle exclusivo)
    const btnSharp = document.getElementById('btn-alt-sharp');
    const btnFlat = document.getElementById('btn-alt-flat');

    if (btnSharp) {
        btnSharp.onclick = () => {
            pickerAccidental = (pickerAccidental === '#') ? null : '#';
            updatePickerFilterUI();
            renderChordPickerGrid();
        };
    }

    if (btnFlat) {
        btnFlat.onclick = () => {
            pickerAccidental = (pickerAccidental === 'b') ? null : 'b';
            updatePickerFilterUI();
            renderChordPickerGrid();
        };
    }

    // Filtros de Tipo (Mayores / Menores / 7mas)
    const btnMaj = document.getElementById('btn-type-maj');
    const btnMin = document.getElementById('btn-type-min');
    const btn7th = document.getElementById('btn-type-7th');

    if (btnMaj) {
        btnMaj.onclick = () => {
            pickerType = 'maj';
            updatePickerFilterUI();
            renderChordPickerGrid();
        };
    }

    if (btnMin) {
        btnMin.onclick = () => {
            pickerType = 'min';
            updatePickerFilterUI();
            renderChordPickerGrid();
        };
    }

    if (btn7th) {
        btn7th.onclick = () => {
            pickerType = '7th';
            updatePickerFilterUI();
            renderChordPickerGrid();
        };
    }
}

function updatePickerFilterUI() {
    const btnSharp = document.getElementById('btn-alt-sharp');
    const btnFlat = document.getElementById('btn-alt-flat');
    const btnMaj = document.getElementById('btn-type-maj');
    const btnMin = document.getElementById('btn-type-min');
    const btn7th = document.getElementById('btn-type-7th');

    if (btnSharp) {
        btnSharp.className = (pickerAccidental === '#')
            ? "px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 shadow-sm transition"
            : "px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition";
    }

    if (btnFlat) {
        btnFlat.className = (pickerAccidental === 'b')
            ? "px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 shadow-sm transition"
            : "px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition";
    }

    if (btnMaj) {
        btnMaj.className = (pickerType === 'maj')
            ? "flex-1 py-1 text-center rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition"
            : "flex-1 py-1 text-center rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition";
    }

    if (btnMin) {
        btnMin.className = (pickerType === 'min')
            ? "flex-1 py-1 text-center rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition"
            : "flex-1 py-1 text-center rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition";
    }

    if (btn7th) {
        btn7th.className = (pickerType === '7th')
            ? "flex-1 py-1 text-center rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition"
            : "flex-1 py-1 text-center rounded-lg text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition";
    }
}

function renderChordSuggestions(baseKey) {
    const container = document.getElementById('chord-picker-suggestions');
    if (!container) return;

    const root = baseKey.replace('m', '');
    const suggestions = [
        root,
        transposeChord(root, 2) + 'm',
        transposeChord(root, 4) + 'm',
        transposeChord(root, 5),
        transposeChord(root, 7),
        transposeChord(root, 9) + 'm',
        transposeChord(root, 7) + '/' + transposeChord(root, 4)
    ];

    container.innerHTML = '';
    suggestions.forEach(chord => {
        const formatted = formatMusicalChord(chord);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition';
        btn.textContent = formatted;
        btn.onclick = () => selectChordFromPicker(formatted);
        container.appendChild(btn);
    });
}

function renderChordPickerGrid() {
    const grid = document.getElementById('chord-picker-grid');
    if (!grid) return;

    const baseNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let chordList = [];

    if (pickerSearch) {
        const allAcc = ['', '#', 'b'];
        const allExt = ['', 'm', '7', 'maj7', 'm7', 'sus4', 'dim', 'add9'];
        baseNotes.forEach(note => {
            allAcc.forEach(acc => {
                allExt.forEach(ext => {
                    const chord = formatMusicalChord(note + acc + ext);
                    if (chord.toLowerCase().includes(pickerSearch) && !chordList.includes(chord)) {
                        chordList.push(chord);
                    }
                });
            });
        });
    } else {
        const acc = pickerAccidental || '';
        baseNotes.forEach(note => {
            if (pickerType === 'maj') {
                chordList.push(formatMusicalChord(note + acc));
            } else if (pickerType === 'min') {
                chordList.push(formatMusicalChord(note + acc + 'm'));
            } else if (pickerType === '7th') {
                chordList.push(formatMusicalChord(note + acc + '7'));
                chordList.push(formatMusicalChord(note + acc + 'maj7'));
                chordList.push(formatMusicalChord(note + acc + 'm7'));
            }
        });
    }

    grid.innerHTML = '';
    chordList.forEach(chord => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chord-picker-btn';
        btn.textContent = chord;
        btn.onclick = () => selectChordFromPicker(chord);
        grid.appendChild(btn);
    });
}

function selectChordFromPicker(chordName) {
    const formatted = formatMusicalChord(chordName);

    // Caso 1: Selección de Tono Base para el Paso 1
    if (chordPickerMode === 'baseKey') {
        updateBaseKeyDisplay(formatted);
        document.getElementById('modal-chord-picker').classList.add('hidden');
        chordPickerMode = 'editor';
        return;
    }

    // Caso 2: Edición de un Badge existente
    if (editingBadgeTarget) {
        const secId = editingBadgeTarget.getAttribute('data-sec-id');
        const chordIdx = parseInt(editingBadgeTarget.getAttribute('data-chord-idx'));
        const lineIdx = editingBadgeTarget.getAttribute('data-line-idx');

        if (secId !== null && !isNaN(chordIdx)) {
            const sec = currentEditorSections.find(s => s.id === secId);
            if (sec) {
                if (sec.isInstrumental && Array.isArray(sec.chords)) {
                    sec.chords[chordIdx] = formatted;
                } else if (lineIdx !== null && sec.lines && sec.lines[parseInt(lineIdx)]) {
                    const lIdx = parseInt(lineIdx);
                    const { text, chords } = parseLineChordPro(sec.lines[lIdx]);
                    if (chords[chordIdx]) {
                        chords[chordIdx].chord = formatted;
                        sec.lines[lIdx] = formatLineChordPro(text, chords);
                    }
                }
                renderSectionCards();
            }
        }

        editingBadgeTarget = null;
        document.getElementById('modal-chord-picker').classList.add('hidden');
        return;
    }

    // Caso 3: Inserción en la Sección Activa (+ FAB)
    if (activeSectionId) {
        syncCurrentEditorDOMToSections();
        const sec = currentEditorSections.find(s => s.id === activeSectionId);
        if (sec) {
            if (sec.isInstrumental) {
                if (!Array.isArray(sec.chords)) sec.chords = [];
                sec.chords.push(formatted);
                renderSectionCards();
            } else {
                if (!Array.isArray(sec.lines) || sec.lines.length === 0) {
                    sec.lines = [''];
                }
                if (activeLineIdx === null || activeLineIdx >= sec.lines.length) {
                    activeLineIdx = 0;
                }

                const lineStr = sec.lines[activeLineIdx] || '';
                let { text, chords } = parseLineChordPro(lineStr);

                let targetOffset = activeCharOffset || 0;

                // Si ya existe un acorde en este mismo offset exacto, desplazar el nuevo al lado
                const existingAtOffset = chords.filter(c => Math.abs(c.offset - targetOffset) < 2);
                if (existingAtOffset.length > 0) {
                    targetOffset = Math.max(...existingAtOffset.map(c => c.offset)) + 3;
                }

                chords.push({ chord: formatted, offset: targetOffset });
                sec.lines[activeLineIdx] = formatLineChordPro(text, chords);

                renderSectionCards();
                focusLyricsInput(sec.id, activeLineIdx);

                // Auto-scroll del scroller horizontal hacia el acorde insertado
                setTimeout(() => {
                    const block = document.querySelector(`.section-card-block[data-section-id="${sec.id}"] .stacked-line-block[data-line-idx="${activeLineIdx}"]`);
                    const scroller = block?.closest('.stacked-line-scroller');
                    const input = block?.querySelector('.stacked-lyrics-input');
                    if (scroller && input) {
                        const { charWidth, paddingLeft } = getCharMetrics(input);
                        const targetX = paddingLeft + (targetOffset * charWidth);
                        if (targetX > scroller.clientWidth - 80) {
                            scroller.scrollTo({ left: targetX - 60, behavior: 'smooth' });
                        }
                    }
                }, 50);
            }
        }
    }

    document.getElementById('modal-chord-picker').classList.add('hidden');
}

/* ==========================================================================
   MODAL SELECTOR DE SECCIONES ([INTRO], [VERSO 1], [CORO]...)
   ========================================================================== */

function setupSectionPickerEvents() {
    document.querySelectorAll('.btn-close-section-picker').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-section-picker').classList.add('hidden');
    });

    document.querySelectorAll('.btn-insert-section').forEach(btn => {
        btn.onclick = () => {
            const sec = btn.getAttribute('data-section');
            insertSectionIntoEditor(sec);
            document.getElementById('modal-section-picker').classList.add('hidden');
        };
    });
}

function insertSectionIntoEditor(sectionKey) {
    syncCurrentEditorDOMToSections();

    let secName = formatSectionHeader(sectionKey);
    if (secName === 'VERSO') {
        const currentText = sectionsToChordPro(currentEditorSections);
        const nextNum = getNextVerseNumber(currentText);
        secName = `VERSO ${nextNum}`;
    }

    const isInst = isInstrumentalSectionType(secName);
    const newSection = {
        id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        type: secName,
        isInstrumental: isInst,
        chords: isInst ? [] : [],
        lines: isInst ? [] : ['']
    };

    currentEditorSections.push(newSection);
    renderSectionCards();

    // Scroll suave hacia la nueva tarjeta agregada
    setTimeout(() => {
        const container = document.getElementById('section-cards-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 50);
}

function syncCurrentEditorDOMToSections() {
    const container = document.getElementById('section-cards-container');
    if (!container) return;

    const cards = container.querySelectorAll('.section-card-block');
    const updated = [];

    cards.forEach(card => {
        const secId = card.getAttribute('data-section-id');
        const existing = currentEditorSections.find(s => s.id === secId);
        if (!existing) return;

        if (existing.isInstrumental) {
            updated.push(existing);
        } else {
            const inputs = card.querySelectorAll('.stacked-lyrics-input');
            const lines = [];
            inputs.forEach((input, lIdx) => {
                const currentLineStr = (existing.lines && existing.lines[lIdx]) ? existing.lines[lIdx] : '';
                const { chords } = parseLineChordPro(currentLineStr);
                lines.push(formatLineChordPro(input.value, chords));
            });
            existing.lines = lines.length > 0 ? lines : [''];
            updated.push(existing);
        }
    });

    if (updated.length > 0) {
        currentEditorSections = updated;
    }
}

/* ==========================================================================
   IMPORTADOR INTELIGENTE DESDE INTERNET (CONVERSOR 2-LINE)
   ========================================================================== */

function openImportChordsModal() {
    const rawInput = document.getElementById('import-chords-raw-input');
    if (rawInput) rawInput.value = '';
    document.getElementById('modal-import-chords').classList.remove('hidden');
}

function setupImportChordsEvents() {
    document.querySelectorAll('.btn-close-import-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-import-chords').classList.add('hidden');
    });

    const btnConvert = document.getElementById('btn-convert-imported-chords');
    if (btnConvert) {
        btnConvert.onclick = () => {
            const raw = document.getElementById('import-chords-raw-input').value;
            if (!raw.trim()) {
                showToast("Por favor pega la letra con acordes a convertir", "danger");
                return;
            }

            const chordPro = parseInternetLyricsToChordPro(raw);
            document.getElementById('song-form-content').value = chordPro;
            renderWizardLivePreview();

            document.getElementById('modal-import-chords').classList.add('hidden');
            showToast("Letra y acordes convertidos con éxito");

            openChordBuilderModal();
        };
    }
}

/* ==========================================================================
   VISOR DETALLADO DE CANCIÓN (LETRA Y ACORDES RENDERIZADOS)
   ========================================================================== */

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

    // Enlaces multimedia
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
    
    // Cambiar subpaneles
    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.remove('hidden');
    
    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Letra y Acordes';

    document.querySelector('.app-content')?.classList.add('song-detail-mode');
}

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
