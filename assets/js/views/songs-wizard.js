/**
 * ==============================================================================
 * Levare — Songs Wizard & Modular Chord Builder (songs-wizard.js)
 * ==============================================================================
 * @fileoverview Controla el proceso de creación, edición y estructuración musical:
 * - Wizard de 2 pasos (Identidad general + Letra y Acordes).
 * - Constructor Visual interactivo por tarjetas de sección (Cards).
 * - Renderizado apilado de acordes con algoritmo anticolisión métrico.
 * - Drag & Drop de secciones (Desktop y Touch en Móviles).
 * - Drag & Drop de acordes con posicionamiento dinámico sobre caracteres.
 * - Modales interactivos: Selector de Acordes (Matriz y Filtros) y Selector de Secciones.
 * - Importador inteligente desde la web y conversor de formato de 2 líneas a ChordPro.
 * ==============================================================================
 */

// Estado del Wizard y Constructor de Acordes
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
let chordPickerMode = 'editor'; // 'editor' o 'baseKey'
let isReorderModeActive = false;
let activeInstLineIdx = 0;

// Filtros del Selector de Acordes
let pickerAccidental = null; // null, '#' o 'b'
let pickerType = 'maj';      // 'maj', 'min', '7th'
let pickerSearch = '';

/**
 * Punto de entrada: Abre el modal selector inicial (Crear nueva / Desde catálogo).
 * @param {Object|null} [prefilledData=null]
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
window.openSongFormModal = openAddSongModal;
window.openAddSongModal = openAddSongModal;

/**
 * Abre la vista de Pantalla Completa del Wizard (Paso 1: Identidad).
 * @param {Object|null} [prefilledData=null]
 */
function openSongWizardView(prefilledData = null) {
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

    updateBaseKeyDisplay('C');

    const medleyCheckbox = document.getElementById('song-form-is-medley');
    if (medleyCheckbox) {
        medleyCheckbox.checked = false;
        handleMedleyToggle(false);
    }

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

    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-community-catalog')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = prefilledData && prefilledData.id ? 'Editar Canción' : 'Nueva Canción';

    goToWizardStep(1);
}
window.openSongWizardView = openSongWizardView;

/**
 * Abre el Wizard para editar una canción existente.
 * @param {number|string} songId
 */
function openEditSongModal(songId) {
    let song = null;
    if (typeof cachedSongs !== 'undefined') {
        song = cachedSongs.find(s => s.id == songId);
    }
    if (!song && typeof communitySongs !== 'undefined') {
        song = communitySongs.find(s => s.id == songId);
    }
    if (!song) return;
    openSongWizardView(song);
}
window.openEditSongModal = openEditSongModal;

/**
 * Cierra la vista del Wizard y regresa al catálogo correspondiente.
 */
function exitSongWizard() {
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');

    if (window.location.hash === '#community' || window.location.hash === '#songs-community') {
        document.getElementById('subpanel-community-catalog')?.classList.remove('hidden');
        document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    } else {
        document.getElementById('subpanel-songs-list')?.classList.remove('hidden');
    }

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Canciones';
}
window.exitSongWizard = exitSongWizard;

/**
 * Control de navegación entre pasos del Wizard.
 * @param {number} step - 1 (Identidad) o 2 (Letra y Acordes).
 */
function goToWizardStep(step) {
    wizardCurrentStep = step;
    const step1 = document.getElementById('wizard-step-1');
    const step2 = document.getElementById('wizard-step-2');
    const subtitle = document.getElementById('wizard-view-subtitle');
    const indicator1 = document.getElementById('step-indicator-1');
    const indicator2 = document.getElementById('step-indicator-2');

    if (step === 1) {
        step1?.classList.remove('hidden');
        step2?.classList.add('hidden');
        if (subtitle) subtitle.textContent = "Paso 1 de 2: Información general";
        
        if (indicator1) {
            indicator1.className = "text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm";
        }
        if (indicator2) {
            indicator2.className = "text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent";
        }
    } else if (step === 2) {
        step1?.classList.add('hidden');
        step2?.classList.remove('hidden');
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
window.goToWizardStep = goToWizardStep;

/**
 * Actualiza la visualización del tono base seleccionado en el Paso 1.
 * @param {string} keyVal
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
window.updateBaseKeyDisplay = updateBaseKeyDisplay;

/**
 * Manejo del switch de Medley / Popurrí en el Paso 1.
 * @param {boolean} isMedley
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
window.handleMedleyToggle = handleMedleyToggle;

/**
 * Configura las pestañas de Vista Previa vs Editor de Texto Plano en el Paso 2.
 */
function setupStep2Tabs() {
    const tabPreview = document.getElementById('tab-step2-preview');
    const tabRaw = document.getElementById('tab-step2-raw');
    const boxPreview = document.getElementById('wizard-live-preview-box');
    const boxRaw = document.getElementById('wizard-raw-editor-box');
    const rawEditor = document.getElementById('song-form-raw-editor');
    const hiddenContent = document.getElementById('song-form-content');

    if (!tabPreview || !tabRaw || !boxPreview || !boxRaw || !rawEditor || !hiddenContent) return;

    tabPreview.onclick = () => {
        tabPreview.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm flex items-center gap-1.5 cursor-pointer";
        tabRaw.className = "px-3 py-1.5 rounded-lg text-xs font-semibold transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer";

        boxPreview.classList.remove('hidden');
        boxRaw.classList.add('hidden');

        renderWizardLivePreview();
    };

    tabRaw.onclick = () => {
        tabRaw.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm flex items-center gap-1.5 cursor-pointer";
        tabPreview.className = "px-3 py-1.5 rounded-lg text-xs font-semibold transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer";

        boxRaw.classList.remove('hidden');
        boxPreview.classList.add('hidden');

        rawEditor.value = hiddenContent.value;
        rawEditor.focus();
    };

    rawEditor.oninput = () => {
        hiddenContent.value = rawEditor.value;
        const countEl = document.getElementById('preview-sections-count');
        const sectionMatches = rawEditor.value.match(/\[(INTRO|VERSO|PRE-CORO|CORO|PUENTE|SOLO|OUTRO)[^\]]*\]/gi) || [];
        if (countEl) {
            countEl.textContent = `${sectionMatches.length} ${sectionMatches.length === 1 ? 'sección' : 'secciones'}`;
        }
    };
}
window.setupStep2Tabs = setupStep2Tabs;

/**
 * Renderiza la vista previa de la letra con los acordes alineados arriba en tiempo real.
 */
function renderWizardLivePreview() {
    const hiddenInput = document.getElementById('song-form-content');
    const content = hiddenInput ? hiddenInput.value.trim() : '';
    const previewContent = document.getElementById('wizard-preview-content');
    const countEl = document.getElementById('preview-sections-count');
    const rawEditor = document.getElementById('song-form-raw-editor');

    if (rawEditor && document.activeElement !== rawEditor) {
        rawEditor.value = hiddenInput ? hiddenInput.value : '';
    }

    if (!previewContent) return;

    if (!content) {
        previewContent.innerHTML = `
            <div class="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs font-sans">
                Aún no has agregado la letra con acordes.<br>
                Haz clic en <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Editor Interactivo"</strong> o <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">"Pegar desde Internet"</strong> para comenzar.
            </div>
        `;
        if (countEl) countEl.textContent = "0 secciones";
        return;
    }

    const sectionMatches = content.match(/\[(INTRO|VERSO|PRE-CORO|CORO|PUENTE|SOLO|OUTRO)[^\]]*\]/gi) || [];
    if (countEl) {
        countEl.textContent = `${sectionMatches.length} ${sectionMatches.length === 1 ? 'sección' : 'secciones'}`;
    }

    const html = parseChordsToHTML(content, 0);
    previewContent.innerHTML = html;
}
window.renderWizardLivePreview = renderWizardLivePreview;

/**
 * Sincroniza las tarjetas del constructor visual al campo de contenido ChordPro del formulario.
 */
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
window.syncEditorToFormContent = syncEditorToFormContent;

/**
 * Manejo del envío del formulario completo del Wizard (POST / PUT).
 * @param {Event} e
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
        if (typeof renderSongsCatalog === 'function') {
            await renderSongsCatalog(true);
        }
        if (window.location.hash === '#community' || window.location.hash === '#songs-community' || !document.getElementById('subpanel-community-catalog')?.classList.contains('hidden')) {
            if (typeof loadCommunitySongs === 'function') loadCommunitySongs();
        }
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Canción';
        }
    }
}
window.handleSongWizardSubmit = handleSongWizardSubmit;

/* ==========================================================================
   CONSTRUCTOR VISUAL DE LETRA Y ACORDES POR SECCIONES MODULARES (CARDS)
   ========================================================================== */

/**
 * Abre el modal de pantalla completa del Constructor Visual de Acordes.
 */
function openChordBuilderModal() {
    const content = document.getElementById('song-form-content').value;
    const isMedley = document.getElementById('song-form-is-medley')?.checked;
    const baseKey = isMedley ? 'Medley' : (document.getElementById('song-form-key').value || 'C');
    const keyBadge = document.getElementById('builder-current-key-badge');

    if (keyBadge) keyBadge.textContent = baseKey;

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
window.openChordBuilderModal = openChordBuilderModal;

/**
 * Configura los eventos del Constructor Visual y sus botones de toolbar.
 */
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
window.setupChordBuilderEvents = setupChordBuilderEvents;

/**
 * Actualiza la UI al alternar el modo de reordenamiento de tarjetas.
 */
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
        
        setTimeout(() => {
            document.querySelectorAll('.stacked-line-block').forEach(lineBlock => {
                const input = lineBlock.querySelector('.stacked-lyrics-input');
                if (input) updateStackedBadgesPosition(lineBlock, input);
            });
        }, 50);
    }
}

/**
 * Renderiza dinámicamente las tarjetas de sección en el contenedor del modal.
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

        const body = document.createElement('div');
        body.className = 'section-card-body';

        if (sec.isInstrumental) {
            const instContainer = document.createElement('div');
            instContainer.className = 'section-instrumental-container space-y-2.5';

            if (!Array.isArray(sec.instrumentalLines) || sec.instrumentalLines.length === 0) {
                sec.instrumentalLines = (Array.isArray(sec.chords) && sec.chords.length > 0) ? [[...sec.chords]] : [[]];
            }

            sec.instrumentalLines.forEach((instLine, instLineIdx) => {
                const lineRow = document.createElement('div');
                lineRow.className = 'instrumental-line-row w-full flex items-center flex-wrap gap-2 p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 transition';

                if (sec.instrumentalLines.length > 1) {
                    const lineLabel = document.createElement('span');
                    lineLabel.className = 'text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/60 select-none';
                    lineLabel.textContent = `L${instLineIdx + 1}`;
                    lineRow.appendChild(lineLabel);
                }

                const badgesBox = document.createElement('div');
                badgesBox.className = 'flex items-center flex-wrap gap-1.5 flex-1 min-w-0';

                if (Array.isArray(instLine) && instLine.length > 0) {
                    instLine.forEach((chordName, chordIdx) => {
                        const badge = createInstrumentalChordBadge(chordName, sec.id, instLineIdx, chordIdx);
                        badgesBox.appendChild(badge);
                    });
                } else {
                    const emptyNotice = document.createElement('span');
                    emptyNotice.className = 'text-xs text-zinc-400 italic pointer-events-none select-none py-1';
                    emptyNotice.textContent = 'Sin acordes en esta línea.';
                    badgesBox.appendChild(emptyNotice);
                }
                lineRow.appendChild(badgesBox);

                const btnAddChordToLine = document.createElement('button');
                btnAddChordToLine.type = 'button';
                btnAddChordToLine.className = 'w-7 h-7 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-xs transition cursor-pointer flex-shrink-0';
                btnAddChordToLine.title = 'Agregar acorde a esta línea';
                btnAddChordToLine.innerHTML = '<i class="fa-solid fa-plus text-[10px]"></i>';
                btnAddChordToLine.onclick = (e) => {
                    e.stopPropagation();
                    activeSectionId = sec.id;
                    activeInstLineIdx = instLineIdx;
                    chordPickerMode = 'editor';
                    editingBadgeTarget = null;
                    openChordPickerModal();
                };
                lineRow.appendChild(btnAddChordToLine);

                if (sec.instrumentalLines.length > 1) {
                    const btnDelLine = document.createElement('button');
                    btnDelLine.type = 'button';
                    btnDelLine.className = 'p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer text-xs flex-shrink-0';
                    btnDelLine.title = 'Eliminar esta línea de acordes';
                    btnDelLine.innerHTML = '<i class="fa-solid fa-trash-can text-[10px]"></i>';
                    btnDelLine.onclick = (e) => {
                        e.stopPropagation();
                        sec.instrumentalLines.splice(instLineIdx, 1);
                        renderSectionCards();
                    };
                    lineRow.appendChild(btnDelLine);
                }

                instContainer.appendChild(lineRow);
            });

            const btnAddNewInstLine = document.createElement('button');
            btnAddNewInstLine.type = 'button';
            btnAddNewInstLine.className = 'w-full py-1.5 px-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1';
            btnAddNewInstLine.innerHTML = '<i class="fa-solid fa-plus text-[10px]"></i> <span>Agregar otra línea de acordes</span>';
            btnAddNewInstLine.onclick = (e) => {
                e.stopPropagation();
                sec.instrumentalLines.push([]);
                renderSectionCards();
            };
            instContainer.appendChild(btnAddNewInstLine);

            body.appendChild(instContainer);
        } else {
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

                const updateActiveCursor = () => {
                    activeSectionId = sec.id;
                    activeLineIdx = lineIdx;
                    activeCharOffset = (input.selectionStart !== undefined) ? input.selectionStart : input.value.length;
                };

                ['focus', 'click', 'keyup', 'select'].forEach(evt => {
                    input.addEventListener(evt, updateActiveCursor);
                });

                input.addEventListener('input', () => {
                    updateInputWidth();
                    updateActiveCursor();
                    sec.lines[lineIdx] = formatLineChordPro(input.value, chords);
                    updateStackedBadgesPosition(lineBlock, input);
                });

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

                attachStackedLineDragDrop(lineBlock, input, sec.id, lineIdx, chords);

                lineBlock.appendChild(chordsLane);
                lineBlock.appendChild(lyricsLane);
                lineContent.appendChild(lineBlock);
                scroller.appendChild(lineContent);
                stackedContainer.appendChild(scroller);

                setTimeout(() => updateStackedBadgesPosition(lineBlock, input), 0);
            });

            body.appendChild(stackedContainer);
        }

        const fabBtn = document.createElement('button');
        fabBtn.type = 'button';
        fabBtn.className = 'btn-section-add-chord-fab cursor-pointer';
        fabBtn.setAttribute('title', 'Agregar acorde en la posición del puntero');
        fabBtn.innerHTML = '<i class="fa-solid fa-plus text-xs"></i>';
        fabBtn.onclick = (e) => {
            e.stopPropagation();
            activeSectionId = sec.id;

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

        setupSectionCardDragAndDrop(card, sec.id);
        container.appendChild(card);
    });

    attachAllBadgeInteractions();
}
window.renderSectionCards = renderSectionCards;

/**
 * Mueve una sección de posición con animación suave.
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
 * Enfoca el input de letra de una sección y línea específica.
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
 * Medición de alta precisión de métricas tipográficas.
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
    testSpan.textContent = 'WWWWWWWWWW';
    document.body.appendChild(testSpan);
    const totalWidth = testSpan.getBoundingClientRect().width;
    document.body.removeChild(testSpan);

    const charWidth = totalWidth > 0 ? (totalWidth / 10) : 9.0;
    return { charWidth, paddingLeft };
}

/**
 * Crea un elemento DOM para el badge de acorde en línea apilada.
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
 * Actualiza las posiciones horizontales de los badges de acordes con anticolisión.
 */
function updateStackedBadgesPosition(lineBlock, input) {
    if (!lineBlock || !input) return;
    const { charWidth, paddingLeft } = getCharMetrics(input);
    const badges = Array.from(lineBlock.querySelectorAll('.stacked-chord-badge'));

    badges.sort((a, b) => {
        const offA = parseInt(a.getAttribute('data-offset')) || 0;
        const offB = parseInt(b.getAttribute('data-offset')) || 0;
        return offA - offB;
    });

    let lastRightEdge = -Infinity;

    badges.forEach(badge => {
        const offset = parseInt(badge.getAttribute('data-offset')) || 0;
        let targetX = paddingLeft + (offset * charWidth) + (charWidth / 2);

        const pill = badge.querySelector('.stacked-chord-pill');
        const badgeHalfWidth = ((pill ? pill.offsetWidth : 36) / 2) + 2;

        if (targetX - badgeHalfWidth < lastRightEdge + 4) {
            targetX = lastRightEdge + 4 + badgeHalfWidth;
        }

        badge.style.left = `${targetX}px`;
        lastRightEdge = targetX + badgeHalfWidth;
    });
}

// Recalcular posiciones en cambio de tamaño de ventana
window.addEventListener('resize', () => {
    document.querySelectorAll('.stacked-line-block').forEach(lineBlock => {
        const input = lineBlock.querySelector('.stacked-lyrics-input');
        if (input) updateStackedBadgesPosition(lineBlock, input);
    });
});

/**
 * Enlaza soporte de Drag & Drop sobre líneas apiladas.
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
 * Mueve un acorde a una nueva posición dentro del editor.
 */
function moveChordToNewPosition(srcData, destSecId, destLineIdx, destOffset) {
    syncCurrentEditorDOMToSections();

    const srcSec = currentEditorSections.find(s => s.id === srcData.secId);
    if (srcSec && srcSec.lines && srcSec.lines[srcData.lineIdx]) {
        const { text: srcText, chords: srcChords } = parseLineChordPro(srcSec.lines[srcData.lineIdx]);
        srcChords.splice(srcData.chordIdx, 1);
        srcSec.lines[srcData.lineIdx] = formatLineChordPro(srcText, srcChords);
    }

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
 * Configura el reordenamiento de tarjetas de sección por Drag & Drop y Touch.
 */
function setupSectionCardDragAndDrop(card, secId) {
    const dragZone = card.querySelector('.section-card-header-drag-zone') || card.querySelector('.section-drag-handle');
    if (!dragZone) return;

    // 1. Escritorio
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

    // 2. Dispositivos Móviles (Touch)
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

        if (e.cancelable) e.preventDefault();

        const touchX = touch.clientX;
        const touchY = touch.clientY;

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

function createInstrumentalChordBadge(chordName, secId, instLineIdx, chordIdx) {
    const badge = document.createElement('span');
    badge.className = 'instrumental-chord-badge';
    badge.setAttribute('draggable', 'true');
    badge.setAttribute('data-chord', chordName);
    badge.setAttribute('data-sec-id', secId);
    badge.setAttribute('data-inst-line-idx', instLineIdx);
    badge.setAttribute('data-chord-idx', chordIdx);
    badge.textContent = chordName;
    return badge;
}

function attachAllBadgeInteractions() {
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
                const instLineIdx = activeSelectedBadge.getAttribute('data-inst-line-idx');
                const lineIdx = activeSelectedBadge.getAttribute('data-line-idx');

                if (secId !== null && chordIdx !== null) {
                    const sec = currentEditorSections.find(s => s.id === secId);
                    if (sec) {
                        if (sec.isInstrumental) {
                            const lIdx = (instLineIdx !== null && instLineIdx !== undefined) ? parseInt(instLineIdx) : 0;
                            if (Array.isArray(sec.instrumentalLines) && sec.instrumentalLines[lIdx]) {
                                sec.instrumentalLines[lIdx].splice(parseInt(chordIdx), 1);
                            } else if (Array.isArray(sec.chords)) {
                                sec.chords.splice(parseInt(chordIdx), 1);
                            }
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

/**
 * Abre el modal selector interactivo de acordes.
 */
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
window.openChordPickerModal = openChordPickerModal;

/**
 * Configura los eventos y filtros del selector de acordes.
 */
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
window.setupChordPickerEvents = setupChordPickerEvents;

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

    // 1. Tono Base
    if (chordPickerMode === 'baseKey') {
        updateBaseKeyDisplay(formatted);
        document.getElementById('modal-chord-picker').classList.add('hidden');
        chordPickerMode = 'editor';
        return;
    }

    // 2. Edición de Badge
    if (editingBadgeTarget) {
        const secId = editingBadgeTarget.getAttribute('data-sec-id');
        const chordIdx = parseInt(editingBadgeTarget.getAttribute('data-chord-idx'));
        const instLineIdx = editingBadgeTarget.getAttribute('data-inst-line-idx');
        const lineIdx = editingBadgeTarget.getAttribute('data-line-idx');

        if (secId !== null && !isNaN(chordIdx)) {
            const sec = currentEditorSections.find(s => s.id === secId);
            if (sec) {
                if (sec.isInstrumental) {
                    const lIdx = (instLineIdx !== null && instLineIdx !== undefined) ? parseInt(instLineIdx) : 0;
                    if (Array.isArray(sec.instrumentalLines) && sec.instrumentalLines[lIdx]) {
                        sec.instrumentalLines[lIdx][chordIdx] = formatted;
                    } else if (Array.isArray(sec.chords)) {
                        sec.chords[chordIdx] = formatted;
                    }
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

    // 3. Inserción en Sección (+ FAB)
    if (activeSectionId) {
        syncCurrentEditorDOMToSections();
        const sec = currentEditorSections.find(s => s.id === activeSectionId);
        if (sec) {
            if (sec.isInstrumental) {
                if (!Array.isArray(sec.instrumentalLines) || sec.instrumentalLines.length === 0) {
                    sec.instrumentalLines = (Array.isArray(sec.chords) && sec.chords.length > 0) ? [[...sec.chords]] : [[]];
                }
                const targetIdx = (activeInstLineIdx !== null && activeInstLineIdx < sec.instrumentalLines.length) ? activeInstLineIdx : (sec.instrumentalLines.length - 1);
                sec.instrumentalLines[targetIdx].push(formatted);
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

                const existingAtOffset = chords.filter(c => Math.abs(c.offset - targetOffset) < 2);
                if (existingAtOffset.length > 0) {
                    targetOffset = Math.max(...existingAtOffset.map(c => c.offset)) + 3;
                }

                chords.push({ chord: formatted, offset: targetOffset });
                sec.lines[activeLineIdx] = formatLineChordPro(text, chords);

                renderSectionCards();
                focusLyricsInput(sec.id, activeLineIdx);

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

/**
 * Configura los eventos del modal de selección de secciones.
 */
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
window.setupSectionPickerEvents = setupSectionPickerEvents;

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
window.syncCurrentEditorDOMToSections = syncCurrentEditorDOMToSections;

/* ==========================================================================
   IMPORTADOR INTELIGENTE DESDE INTERNET (CONVERSOR 2-LINE & SCRAPER DE URL)
   ========================================================================== */

/**
 * Abre el modal importador inteligente de acordes.
 */
function openImportChordsModal() {
    const rawInput = document.getElementById('import-chords-raw-input');
    if (rawInput) rawInput.value = '';
    const urlInput = document.getElementById('import-chords-url-input');
    if (urlInput) urlInput.value = '';
    document.getElementById('modal-import-chords').classList.remove('hidden');
}
window.openImportChordsModal = openImportChordsModal;

/**
 * Configura los eventos del importador de acordes.
 */
function setupImportChordsEvents() {
    document.querySelectorAll('.btn-close-import-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-import-chords').classList.add('hidden');
    });

    const btnFetchUrl = document.getElementById('btn-fetch-url-chords');
    const urlInput = document.getElementById('import-chords-url-input');

    if (btnFetchUrl && urlInput) {
        const handleFetch = async () => {
            const url = urlInput.value.trim();
            if (!url) {
                showToast("Por favor ingresa o pega el enlace de la canción", "danger");
                urlInput.focus();
                return;
            }

            const originalBtnHtml = btnFetchUrl.innerHTML;
            btnFetchUrl.disabled = true;
            btnFetchUrl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-xs"></i> <span>Obteniendo...</span>';

            try {
                const res = await apiFetch('/songs/import-url', {
                    method: 'POST',
                    body: JSON.stringify({ url })
                });

                if (res && res.raw_text) {
                    const rawInput = document.getElementById('import-chords-raw-input');
                    if (rawInput) rawInput.value = res.raw_text;

                    const autoFillMeta = document.getElementById('import-chords-auto-fill-meta');
                    if (autoFillMeta && autoFillMeta.checked) {
                        const titleInput = document.getElementById('song-form-title');
                        if (titleInput && res.title) titleInput.value = res.title;

                        const artistInput = document.getElementById('song-form-artist');
                        if (artistInput && res.artist) artistInput.value = res.artist;

                        const keySelect = document.getElementById('song-form-key');
                        if (keySelect && res.key) keySelect.value = res.key;

                        const formUrl = document.getElementById('song-form-url');
                        if (formUrl && res.url) formUrl.value = res.url;
                    }

                    showToast(`Letra de "${res.title || 'Canción'}" obtenida con éxito`, "success");
                }
            } catch (err) {
                console.error("Error fetching song from URL:", err);
                showToast(err.message || "No se pudo extraer la letra desde el enlace proporcionado.", "danger");
            } finally {
                btnFetchUrl.disabled = false;
                btnFetchUrl.innerHTML = originalBtnHtml;
            }
        };

        btnFetchUrl.onclick = handleFetch;
        urlInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFetch();
            }
        };
    }

    const btnConvert = document.getElementById('btn-convert-imported-chords');
    if (btnConvert) {
        btnConvert.onclick = () => {
            const raw = document.getElementById('import-chords-raw-input').value;
            if (!raw.trim()) {
                showToast("Por favor pega o importa la letra con acordes a convertir", "danger");
                return;
            }

            const chordPro = parseInternetLyricsToChordPro(raw);
            document.getElementById('song-form-content').value = chordPro;
            renderWizardLivePreview();

            document.getElementById('modal-import-chords').classList.add('hidden');
            showToast("Letra y acordes convertidos con éxito", "success");
        };
    }
}
window.setupImportChordsEvents = setupImportChordsEvents;
