/* ==========================================================================
   Levare OS — SONGS CATALOG, FULLSCREEN WIZARD & CHORD BUILDER (v2.0)
   ========================================================================== */

let songsSearchQuery = "";
let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;
let cachedSongs = [];
let songIdToDelete = null;

// Wizard & Builder State
let wizardCurrentStep = 1;
let wizardPrefilledData = null;
let savedEditorRange = null;
let activeSelectedBadge = null;
let editingBadgeTarget = null;
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
    if (subpanelDetail) subpanelDetail.classList.add('hidden');
    if (subpanelWizard) subpanelWizard.classList.add('hidden');
    if (subpanelList) subpanelList.classList.remove('hidden');
    currentViewingSong = null;
    transposeOffset = 0;

    // Buscador general del catálogo
    const searchInput = document.getElementById('song-search-input') || document.getElementById('songs-search-input');
    if (searchInput) {
        songsSearchQuery = "";
        searchInput.value = "";
        searchInput.removeEventListener('input', handleSongsSearch);
        searchInput.addEventListener('input', handleSongsSearch);
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
        (s.album && s.album.toLowerCase().includes(query)) || 
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
        
        const medleyBadge = s.is_medley ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mr-1.5">Medley</span>` : '';
        const albumText = s.album ? ` • ${s.album}` : '';

        card.innerHTML = `
            <div class="space-y-0.5 min-w-0 flex-1 pr-2">
                <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition truncate">${s.title}</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${medleyBadge}${s.artist || 'Desconocido'}${albumText}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <span class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">${s.is_medley ? 'Medley' : (s.key || 'C')}</span>
                ${editAllowed ? `
                <button type="button" class="btn-edit-song-trigger p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition" data-id="${s.id}" title="Editar">
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                </button>
                <button type="button" class="btn-delete-song-trigger p-2 text-red-500/80 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition" data-id="${s.id}" title="Eliminar">
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

function syncEditorToFormContent() {
    const editor = document.getElementById('visual-chord-editor');
    if (editor && editor.children.length > 0) {
        const chordPro = editorHTMLToChordPro(editor);
        if (chordPro) {
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
   CONSTRUCTOR VISUAL DE LETRA Y ACORDES CON BADGES Y DRAG & DROP
   ========================================================================== */

function openChordBuilderModal() {
    const content = document.getElementById('song-form-content').value;
    const isMedley = document.getElementById('song-form-is-medley')?.checked;
    const baseKey = isMedley ? 'Medley' : (document.getElementById('song-form-key').value || 'C');
    const editor = document.getElementById('visual-chord-editor');
    const keyBadge = document.getElementById('builder-current-key-badge');

    if (keyBadge) keyBadge.textContent = baseKey;
    if (editor) {
        editor.innerHTML = chordProToEditorHTML(content);
        attachBadgeInteractions(editor);
    }

    document.getElementById('modal-chord-builder').classList.remove('hidden');
}

function setupChordBuilderEvents() {
    const btnApply = document.getElementById('btn-apply-chord-builder');
    const btnCloseX = document.getElementById('btn-close-chord-builder-x');
    const btnAddChord = document.getElementById('btn-toolbar-add-chord');
    const btnAddSection = document.getElementById('btn-toolbar-add-section');
    const editor = document.getElementById('visual-chord-editor');

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

    // Guardar selección del cursor antes de abrir modales de acorde o sección
    if (editor) {
        ['keyup', 'mouseup', 'touchend'].forEach(evt => {
            editor.addEventListener(evt, () => saveEditorSelection());
        });

        // Soporte Drag & Drop dentro del editor
        editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        editor.addEventListener('drop', (e) => {
            e.preventDefault();
            const chordName = e.dataTransfer.getData('text/plain');
            if (!chordName) return;

            let range;
            if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(e.clientX, e.clientY);
            } else if (document.caretPositionFromPoint) {
                const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
            }

            if (range) {
                const draggingBadge = editor.querySelector('.chord-badge.dragging');
                if (draggingBadge) draggingBadge.remove();

                const newBadge = createChordBadgeElement(chordName);
                range.insertNode(newBadge);
                attachBadgeInteractions(editor);
            }
        });
    }

    if (btnAddChord) {
        btnAddChord.onclick = () => {
            saveEditorSelection();
            chordPickerMode = 'editor';
            editingBadgeTarget = null;
            openChordPickerModal();
        };
    }

    if (btnAddSection) {
        btnAddSection.onclick = () => {
            saveEditorSelection();
            document.getElementById('modal-section-picker').classList.remove('hidden');
        };
    }

    setupPopoverChordActions();
}

function saveEditorSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
        savedEditorRange = sel.getRangeAt(0);
    }
}

function restoreEditorSelection() {
    if (savedEditorRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedEditorRange);
    }
}

function createChordBadgeElement(chordName) {
    const badge = document.createElement('span');
    badge.className = 'chord-badge';
    badge.setAttribute('contenteditable', 'false');
    badge.setAttribute('draggable', 'true');
    badge.setAttribute('data-chord', chordName);
    badge.textContent = chordName;
    return badge;
}

function attachBadgeInteractions(container) {
    container.querySelectorAll('.chord-badge').forEach(badge => {
        badge.ondragstart = (e) => {
            badge.classList.add('dragging');
            e.dataTransfer.setData('text/plain', badge.getAttribute('data-chord') || badge.textContent);
            e.dataTransfer.effectAllowed = 'move';
        };

        badge.ondragend = () => {
            badge.classList.remove('dragging');
        };

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
                activeSelectedBadge.remove();
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

    // Caso 2: Edición de un Badge existente en el editor
    if (editingBadgeTarget) {
        editingBadgeTarget.setAttribute('data-chord', formatted);
        editingBadgeTarget.textContent = formatted;
        editingBadgeTarget = null;
    } else {
        // Caso 3: Inserción de un nuevo Badge en el caret
        const editor = document.getElementById('visual-chord-editor');
        if (editor) {
            editor.focus();
            restoreEditorSelection();

            const badge = createChordBadgeElement(formatted);
            const sel = window.getSelection();

            if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(badge);

                range.setStartAfter(badge);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                editor.appendChild(badge);
            }

            attachBadgeInteractions(editor);
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
    const editor = document.getElementById('visual-chord-editor');
    if (!editor) return;

    let secName = formatSectionHeader(sectionKey);
    if (secName === 'VERSO') {
        const currentText = editorHTMLToChordPro(editor);
        const nextNum = getNextVerseNumber(currentText);
        secName = `VERSO ${nextNum}`;
    }

    const row = document.createElement('div');
    row.className = 'editor-line editor-section-row';
    row.setAttribute('data-section', secName);
    row.innerHTML = `<span class="editor-section-badge" contenteditable="false">[${secName}]</span>`;

    const nextLine = document.createElement('div');
    nextLine.className = 'editor-line';
    nextLine.innerHTML = '<br>';

    editor.focus();
    restoreEditorSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        let node = sel.anchorNode;
        // Subir hasta encontrar el hijo directo de editor
        while (node && node.parentNode !== editor) {
            node = node.parentNode;
        }

        if (node && node.parentNode === editor) {
            node.after(row);
            row.after(nextLine);
        } else {
            editor.appendChild(row);
            editor.appendChild(nextLine);
        }
    } else {
        editor.appendChild(row);
        editor.appendChild(nextLine);
    }

    // Posicionar cursor en la nueva línea creada
    const range = document.createRange();
    range.setStart(nextLine, 0);
    range.collapse(true);
    if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
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
