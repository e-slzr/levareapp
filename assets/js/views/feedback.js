/* ==========================================================================
   Levare (v1.0 Beta) — FEEDBACK & BUG REPORT VIEW CONTROLLER
   ========================================================================== */

let feedbackSelectedFiles = [];
let currentFeedbackType = 'bug';
let feedbackDropzoneBound = false;

/**
 * Initialize Feedback View Screen
 */
function initFeedbackView(forceReset = false) {
    // Only reset if forceReset is explicitly requested
    if (forceReset) {
        feedbackSelectedFiles = [];
        currentFeedbackType = 'bug';

        const form = document.getElementById('feedback-form');
        if (form) form.reset();

        selectFeedbackType('bug');
        renderFeedbackAttachments();
    }

    // Setup Dropzone Drag & Drop once
    const dropzone = document.getElementById('feedback-dropzone');
    const fileInput = document.getElementById('feedback-file-input');

    if (dropzone && fileInput && !feedbackDropzoneBound) {
        feedbackDropzoneBound = true;
        dropzone.onclick = () => fileInput.click();

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('border-zinc-500', 'dark:border-zinc-400', 'bg-zinc-100', 'dark:bg-zinc-800/80');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('border-zinc-500', 'dark:border-zinc-400', 'bg-zinc-100', 'dark:bg-zinc-800/80');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-zinc-500', 'dark:border-zinc-400', 'bg-zinc-100', 'dark:bg-zinc-800/80');
            const dt = e.dataTransfer;
            const files = dt.files;
            processAddedFeedbackFiles(files);
        }, false);
    }
}

/**
 * Switch feedback category
 */
function selectFeedbackType(type) {
    currentFeedbackType = type;
    const inputHidden = document.getElementById('feedback-input-type');
    if (inputHidden) inputHidden.value = type;

    const buttons = document.querySelectorAll('.feedback-type-btn');
    buttons.forEach(btn => {
        const btnType = btn.getAttribute('data-type');
        if (btnType === type) {
            btn.className = 'feedback-type-btn active py-2.5 px-3 rounded-xl border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm';
        } else {
            btn.className = 'feedback-type-btn py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-center gap-2 transition cursor-pointer';
        }
    });
}

/**
 * Handle files selected through input
 */
function handleFeedbackFilesSelected(event) {
    const files = event.target.files;
    processAddedFeedbackFiles(files);
    event.target.value = ''; // Reset input so same file can be re-selected if needed
}

/**
 * Process and validate uploaded files
 */
function processAddedFeedbackFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 4 * 1024 * 1024; // 4MB

    for (let i = 0; i < fileList.length; i++) {
        if (feedbackSelectedFiles.length >= 5) {
            showToast('Solo puedes adjuntar un máximo de 5 capturas de pantalla.', 'warning');
            break;
        }

        const file = fileList[i];

        if (!allowedTypes.includes(file.type.toLowerCase())) {
            showToast(`El archivo ${file.name} no es una imagen válida (JPG, PNG, WEBP).`, 'warning');
            continue;
        }

        if (file.size > maxSizeBytes) {
            showToast(`La imagen ${file.name} supera el límite de 4MB.`, 'warning');
            continue;
        }

        // Avoid duplicate files by name and size
        const isDuplicate = feedbackSelectedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!isDuplicate) {
            feedbackSelectedFiles.push(file);
        }
    }

    renderFeedbackAttachments();
}

/**
 * Remove a selected file from the queue
 */
function removeFeedbackAttachment(index) {
    if (index >= 0 && index < feedbackSelectedFiles.length) {
        feedbackSelectedFiles.splice(index, 1);
        renderFeedbackAttachments();
    }
}

/**
 * Render preview grid of selected attachments
 */
function renderFeedbackAttachments() {
    const previewContainer = document.getElementById('feedback-attachments-preview');
    const counterBadge = document.getElementById('feedback-attachments-counter');

    if (counterBadge) {
        counterBadge.textContent = `${feedbackSelectedFiles.length} / 5 capturas`;
        if (feedbackSelectedFiles.length > 0) {
            counterBadge.classList.add('text-zinc-900', 'dark:text-zinc-100', 'font-bold');
            counterBadge.classList.remove('text-zinc-400');
        } else {
            counterBadge.classList.remove('text-zinc-900', 'dark:text-zinc-100', 'font-bold');
            counterBadge.classList.add('text-zinc-400');
        }
    }

    if (!previewContainer) return;

    if (feedbackSelectedFiles.length === 0) {
        previewContainer.classList.add('hidden');
        previewContainer.innerHTML = '';
        return;
    }

    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = '';

    feedbackSelectedFiles.forEach((file, index) => {
        const objectUrl = URL.createObjectURL(file);
        const sizeFormatted = (file.size / 1024).toFixed(0) + ' KB';

        const card = document.createElement('div');
        card.className = 'relative group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 overflow-hidden flex items-center gap-2.5 shadow-sm screen-fade';
        
        card.innerHTML = `
            <div class="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                <img src="${objectUrl}" alt="Captura" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0 pr-6">
                <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate" title="${file.name}">
                    ${file.name}
                </p>
                <p class="text-[10px] text-zinc-400">
                    ${sizeFormatted}
                </p>
            </div>
            <button type="button" onclick="removeFeedbackAttachment(${index})" 
                class="absolute right-2 top-2 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xs transition cursor-pointer" 
                title="Eliminar captura">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        previewContainer.appendChild(card);
    });
}

/**
 * Collect silent diagnostic telemetry from client
 */
function collectFeedbackTelemetry() {
    const userAgent = navigator.userAgent || '';
    
    // Detect OS
    let os = 'Desconocido';
    if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/Macintosh|Mac OS X/i.test(userAgent)) os = 'macOS';
    else if (/Windows NT/i.test(userAgent)) os = 'Windows';
    else if (/Linux/i.test(userAgent)) os = 'Linux';

    // Detect Browser
    let browser = 'Desconocido';
    if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent) && !/OPR/i.test(userAgent)) browser = 'Chrome';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Edg/i.test(userAgent)) browser = 'Edge';
    else if (/OPR|Opera/i.test(userAgent)) browser = 'Opera';

    // Active Group
    const userGroups = getData('userGroups') || [];
    const activeGroupObj = Array.isArray(userGroups) ? userGroups.find(g => g.id == currentGroupId) : null;

    return {
        app_version: 'v1.0-beta',
        os: os,
        browser: browser,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        device_pixel_ratio: window.devicePixelRatio || 1,
        theme: localStorage.getItem('worship_theme') || 'dark',
        language: navigator.language || 'es',
        active_group: activeGroupObj ? activeGroupObj.name : 'Ninguna',
        user_role: currentUser ? (currentUser.account_type || 'member') : 'guest',
        timestamp: new Date().toISOString()
    };
}

/**
 * Handle feedback form submit
 */
async function handleFeedbackSubmit(event) {
    event.preventDefault();

    const titleInput = document.getElementById('feedback-input-title');
    const descInput = document.getElementById('feedback-input-description');
    const submitBtn = document.getElementById('btn-submit-feedback');
    const submitBtnText = document.getElementById('btn-submit-feedback-text');

    const title = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';

    if (!title || !description) {
        showToast('Por favor completa el título y la descripción del reporte.', 'warning');
        return;
    }

    // Set loading state
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.textContent = 'Enviando...';

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('type', currentFeedbackType);
        
        if (currentGroupId) {
            formData.append('group_id', currentGroupId);
        }

        const telemetry = collectFeedbackTelemetry();
        formData.append('device_info', JSON.stringify(telemetry));

        // Append attachments
        feedbackSelectedFiles.forEach(file => {
            formData.append('attachments[]', file);
        });

        const res = await apiFetch('/feedback', {
            method: 'POST',
            body: formData
        });

        if (res && (res.feedback || res.message)) {
            showToast(res.message || '¡Reporte enviado con éxito! Gracias por tu feedback.', 'success');
            
            // Clean up state
            feedbackSelectedFiles = [];
            if (document.getElementById('feedback-form')) {
                document.getElementById('feedback-form').reset();
            }
            renderFeedbackAttachments();

            // Redirect back to profile after short delay
            setTimeout(() => {
                navigateTo('profile');
            }, 700);
        } else {
            showToast(res?.message || 'No se pudo enviar el reporte. Inténtalo de nuevo.', 'danger');
        }
    } catch (err) {
        console.error('Error al enviar reporte de feedback:', err);
        showToast('Ocurrió un error inesperado al enviar el reporte.', 'danger');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = 'Enviar Reporte';
    }
}

window.selectFeedbackType = selectFeedbackType;
window.handleFeedbackFilesSelected = handleFeedbackFilesSelected;
window.removeFeedbackAttachment = removeFeedbackAttachment;
window.handleFeedbackSubmit = handleFeedbackSubmit;
window.initFeedbackView = initFeedbackView;
