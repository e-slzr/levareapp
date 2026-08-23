let selectedAnnouncementImageFile = null;
let saAnnouncementsVisibleLimit = 10;
const SA_ANNOUNCEMENTS_PAGE_SIZE = 10;
let cachedSaGlobalAnnouncements = [];

async function initDashboardView(forceRefresh = false) {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    
    if (!currentUser) return;

    // Welcome title & role
    const welcomeElem = document.getElementById('welcome-message');
    if (welcomeElem) welcomeElem.textContent = `¡Hola, ${currentUser.name}!`;
    
    // Render avatar photo / initials in hero card
    const avatarContainer = document.getElementById('dashboard-user-avatar');
    if (avatarContainer) {
        const initials = getInitials(`${currentUser.name} ${currentUser.lastname || ''}`);
        if (currentUser.avatar) {
            avatarContainer.style.backgroundImage = `url('${getAvatarUrl(currentUser.avatar)}')`;
            avatarContainer.style.backgroundSize = 'cover';
            avatarContainer.style.backgroundPosition = 'center';
            avatarContainer.style.backgroundColor = 'transparent';
            avatarContainer.textContent = '';
        } else {
            avatarContainer.style.backgroundImage = 'none';
            avatarContainer.style.backgroundColor = getAvatarBgColor(`${currentUser.name} ${currentUser.lastname || ''}`);
            avatarContainer.textContent = initials;
        }
    }
    
    // Set role badge
    const roleBadge = document.getElementById('dashboard-user-role-badge');
    const isSuperAdmin = currentUser.account_type === 'superadmin';

    if (roleBadge) {
        if (isSuperAdmin) {
            roleBadge.textContent = 'SUPER ADMIN';
            roleBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/60 uppercase';
        } else if (currentGroupId) {
            const userRole = getUserRoleInGroup(currentUser.id, currentGroupId);
            roleBadge.textContent = (userRole || 'MIEMBRO').toUpperCase();
            roleBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase';
        } else {
            roleBadge.textContent = 'SIN BANDA';
            roleBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase';
        }
    }
    
    // Set current date formatted
    const dateElem = document.getElementById('dashboard-date');
    if (dateElem) dateElem.textContent = formatDate(getLocalDateString());

    // Toggle View Sections based on Role
    const saSection = document.getElementById('dashboard-superadmin-section');
    const userSection = document.getElementById('dashboard-regular-user-section');
    const groupSelectContainer = document.getElementById('group-selector-sidebar-container');

    if (isSuperAdmin) {
        if (saSection) saSection.classList.remove('hidden');
        if (userSection) userSection.classList.add('hidden');
        if (groupSelectContainer) groupSelectContainer.classList.add('hidden');
        
        await loadSuperadminDashboardData(forceRefresh);
        return;
    }

    // --- Regular User View Initialization ---
    if (saSection) saSection.classList.add('hidden');
    if (userSection) userSection.classList.remove('hidden');
    if (groupSelectContainer) groupSelectContainer.classList.remove('hidden');

    // Refresh active group workspace selectors
    if (typeof renderWorkspaceGroupSelector === 'function') {
        const userGroups = getData('userGroups') || [];
        renderWorkspaceGroupSelector(userGroups);
    }

    await loadRegularUserDashboardData();
}

/**
 * Load and render data for Superadmin Dashboard
 */
async function loadSuperadminDashboardData(forceRefresh = false) {
    const listContainer = document.getElementById('sa-announcements-list');
    if (listContainer) {
        listContainer.innerHTML = `<div class="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">Cargando métricas y anuncios del sistema...</div>`;
    }

    try {
        // 1. Fetch Stats in parallel
        const statsPromise = apiFetch('/admin/stats');
        const announcementsPromise = apiFetch('/announcements?limit=50');

        const [stats, announcements] = await Promise.all([statsPromise, announcementsPromise]);

        // Render Stats
        if (stats) {
            const usersEl = document.getElementById('sa-stat-users');
            const groupsEl = document.getElementById('sa-stat-groups');
            const songsEl = document.getElementById('sa-stat-songs');
            const pushEl = document.getElementById('sa-stat-push');

            if (usersEl) usersEl.textContent = stats.users?.total ?? 0;
            if (groupsEl) groupsEl.textContent = stats.groups?.total ?? 0;
            if (songsEl) songsEl.textContent = stats.songs?.total ?? 0;
            if (pushEl) pushEl.textContent = stats.push?.total_devices ?? 0;
        }

        // Render Global Announcements List
        const loadMoreContainer = document.getElementById('sa-announcements-load-more-container');
        const btnLoadMore = document.getElementById('btn-sa-announcements-load-more');

        if (listContainer) {
            listContainer.innerHTML = '';

            const globalAnnouncements = (announcements || []).filter(a => !a.group_id && !a.user_id);
            cachedSaGlobalAnnouncements = globalAnnouncements;

            if (globalAnnouncements.length === 0) {
                listContainer.innerHTML = `
                    <div class="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                        <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                            <i class="fa-solid fa-bullhorn text-sm"></i>
                        </div>
                        <p class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No hay anuncios globales emitidos</p>
                        <p class="text-[11px] text-zinc-400">Haz clic en "Nuevo Anuncio Global" para publicar el primer comunicado a toda la comunidad.</p>
                    </div>
                `;
                if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
                return;
            }

            const visibleAnnouncements = globalAnnouncements.slice(0, saAnnouncementsVisibleLimit);

            visibleAnnouncements.forEach(a => {
                const card = document.createElement('div');
                card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition';

                const iconConfig = getAnnouncementIconConfig(a);
                const meta = a.meta || {};
                const titleText = meta.title || a.text || 'Anuncio';
                const hasImage = !!meta.image_url;

                let dateStr = '';
                if (a.created_at) {
                    const d = new Date(a.created_at);
                    dateStr = d.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' hs';
                }

                card.innerHTML = `
                    <div class="flex items-start gap-3 min-w-0 flex-1 cursor-pointer" onclick='openAnnouncementDetailModal(${JSON.stringify(a).replace(/'/g, "&apos;")})'>
                        <div class="w-10 h-10 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0 mt-0.5">
                            ${iconConfig.iconHtml}
                        </div>
                        <div class="min-w-0 flex-1 space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${iconConfig.chipClass} uppercase">${iconConfig.categoryLabel}</span>
                                ${hasImage ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1"><i class="fa-solid fa-image text-[9px]"></i> Imagen</span>' : ''}
                                <span class="text-[11px] text-zinc-400 dark:text-zinc-500">${dateStr}</span>
                            </div>
                            <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">${titleText}</h4>
                            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">${meta.content || a.text}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button type="button" onclick='openAnnouncementDetailModal(${JSON.stringify(a).replace(/'/g, "&apos;")})' class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                            Ver
                        </button>
                        <button type="button" onclick="deleteGlobalAnnouncement(${a.id})" class="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer" title="Eliminar anuncio">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                `;

                listContainer.appendChild(card);
            });

            // Controlar botón Cargar más para superadmin announcements
            if (loadMoreContainer && btnLoadMore) {
                if (globalAnnouncements.length > saAnnouncementsVisibleLimit) {
                    loadMoreContainer.classList.remove('hidden');
                    btnLoadMore.onclick = () => {
                        saAnnouncementsVisibleLimit += SA_ANNOUNCEMENTS_PAGE_SIZE;
                        loadSuperadminDashboardData(false);
                    };
                } else {
                    loadMoreContainer.classList.add('hidden');
                }
            }
        }
    } catch (e) {
        console.error("Error loading superadmin dashboard data:", e);
        if (listContainer) {
            listContainer.innerHTML = `<div class="p-8 text-center text-xs text-red-500">Error al cargar datos del panel de administración.</div>`;
        }
    }
}

/**
 * Load and render data for regular members/leaders
 */
async function loadRegularUserDashboardData() {
    const currentGroupId = getData('currentGroupId');
    const listContainer = document.getElementById('announcements-list');
    const viewAllBtnContainer = document.getElementById('announcements-view-all-container');

    // Fetch Announcements from API
    if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size: 0.85rem;">Cargando novedades...</div>`;
    
    try {
        const announcements = await apiFetch('/announcements') || [];
        if (listContainer) listContainer.innerHTML = '';
        
        if (announcements.length === 0) {
            if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size: 0.85rem;">No hay novedades recientes.</div>`;
            if (viewAllBtnContainer) viewAllBtnContainer.classList.add('hidden');
        } else {
            // Mostrar solo las 5 novedades más recientes en el Dashboard
            announcements.slice(0, 5).forEach(a => {
                const item = document.createElement('div');
                item.className = 'p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer';
                
                const iconConfig = getAnnouncementIconConfig(a);
                const categoryChipClass = iconConfig.chipClass || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';

                // Formatear hora de creación
                const timeStr = a.created_at ? new Date(a.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs' : '';
                const meta = a.meta || {};
                const displayTitle = meta.title || a.text;
                
                item.onclick = () => openAnnouncementDetailModal(a);

                item.innerHTML = `
                    <div class="w-9 h-9 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0 mt-0.5">
                        ${iconConfig.iconHtml}
                    </div>
                    <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed truncate">${displayTitle}</p>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex-wrap">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryChipClass} uppercase">${iconConfig.categoryLabel}</span>
                            ${meta.image_url ? '<span class="text-[10px] text-zinc-400 flex items-center gap-1"><i class="fa-solid fa-image text-[9px]"></i> Foto</span><span>•</span>' : ''}
                            <span>${timeStr}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400 self-center"></i>
                `;
                if (listContainer) listContainer.appendChild(item);
            });

            if (viewAllBtnContainer) {
                viewAllBtnContainer.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error("Error loading dashboard announcements:", e);
        if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--danger); font-size: 0.85rem;">Fallo al cargar novedades.</div>`;
    }

    // Fetch Next Event Widget from API (Only if in a group)
    if (!currentGroupId) {
        const nameElem = document.getElementById('next-event-name');
        if (nameElem) nameElem.textContent = 'No perteneces a ninguna banda';
        const dateElemEv = document.getElementById('next-event-date');
        if (dateElemEv) dateElemEv.textContent = 'Sin fecha';
        const timeElem = document.getElementById('next-event-time');
        if (timeElem) timeElem.textContent = '--:--';
        const setlistNameElem = document.getElementById('next-event-setlist-name');
        if (setlistNameElem) setlistNameElem.textContent = 'Sin repertorio';
        const badgeEv = document.getElementById('next-event-badge');
        if (badgeEv) badgeEv.textContent = '--';
        return;
    }

    try {
        const events = await apiFetch('/events') || [];
        const todayStr = getLocalDateString();
        
        // Filter events by date (upcoming)
        const upcomingEvents = events
            .filter(ev => ev.date >= todayStr)
            .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        const nextEventBadge = document.getElementById('next-event-badge');
        if (upcomingEvents.length > 0) {
            const ev = upcomingEvents[0];
            
            if (nextEventBadge) {
                nextEventBadge.textContent = (ev.type || 'ENSAYO').toUpperCase();
            }
            
            const nameElem = document.getElementById('next-event-name');
            if (nameElem) nameElem.textContent = ev.name || ev.title || 'Evento Programado';

            const dateElem = document.getElementById('next-event-date');
            if (dateElem) dateElem.textContent = formatDate(ev.date, true);

            const timeElem = document.getElementById('next-event-time');
            if (timeElem) timeElem.textContent = ev.time ? ev.time.substring(0, 5) + ' hs' : '';

            const setlistNameElem = document.getElementById('next-event-setlist-name');
            const setlistName = ev.setlist_name || (ev.setlist ? ev.setlist.name : (ev.repertoire || 'Sin repertorio asignado'));
            if (setlistNameElem) setlistNameElem.textContent = setlistName;
        } else {
            const nameElem = document.getElementById('next-event-name');
            if (nameElem) nameElem.textContent = 'No hay eventos programados';

            const dateElem = document.getElementById('next-event-date');
            if (dateElem) dateElem.textContent = 'Sin fecha';

            const timeElem = document.getElementById('next-event-time');
            if (timeElem) timeElem.textContent = '--:--';
        }
    } catch (e) {
        console.error("Error loading next event:", e);
    }
}

// --- Superadmin Global Announcement Modal Controls ---

function openCreateGlobalAnnouncementModal() {
    const modal = document.getElementById('modal-create-global-announcement');
    if (!modal) return;

    // Reset fields
    const form = document.getElementById('form-create-global-announcement');
    if (form) form.reset();

    clearAnnouncementImageSelection();
    modal.classList.remove('hidden');
}

function closeCreateGlobalAnnouncementModal() {
    const modal = document.getElementById('modal-create-global-announcement');
    if (modal) modal.classList.add('hidden');
}

function handleAnnouncementImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedAnnouncementImageFile = file;

    const label = document.getElementById('global-announcement-image-label');
    const removeBtn = document.getElementById('btn-remove-announcement-image');
    const previewContainer = document.getElementById('global-announcement-preview-container');
    const previewImg = document.getElementById('global-announcement-preview');

    if (label) label.textContent = file.name;
    if (removeBtn) removeBtn.classList.remove('hidden');

    if (previewContainer && previewImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function clearAnnouncementImageSelection() {
    selectedAnnouncementImageFile = null;
    const fileInput = document.getElementById('global-announcement-image');
    const label = document.getElementById('global-announcement-image-label');
    const removeBtn = document.getElementById('btn-remove-announcement-image');
    const previewContainer = document.getElementById('global-announcement-preview-container');
    const previewImg = document.getElementById('global-announcement-preview');

    if (fileInput) fileInput.value = '';
    if (label) label.textContent = 'Seleccionar imagen';
    if (removeBtn) removeBtn.classList.add('hidden');
    if (previewContainer) previewContainer.classList.add('hidden');
    if (previewImg) previewImg.src = '';
}

async function handleCreateGlobalAnnouncementSubmit(event) {
    event.preventDefault();

    const titleInput = document.getElementById('global-announcement-title');
    const typeSelect = document.getElementById('global-announcement-type');
    const contentInput = document.getElementById('global-announcement-content');
    const sendPushCheckbox = document.getElementById('global-announcement-send-push');
    const submitBtn = document.getElementById('btn-submit-global-announcement');

    const title = titleInput ? titleInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : 'system_announcement';
    const content = contentInput ? contentInput.value.trim() : '';
    const sendPush = sendPushCheckbox ? sendPushCheckbox.checked : true;

    if (!title) {
        showToast('El título del anuncio es obligatorio.', 'warning');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-xs"></i> <span>Publicando...</span>`;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('content', content);
        formData.append('send_push', sendPush ? '1' : '0');

        if (selectedAnnouncementImageFile) {
            formData.append('image', selectedAnnouncementImageFile);
        }

        const res = await apiFetch('/admin/announcements', {
            method: 'POST',
            body: formData
        });

        showToast(res.message || 'Anuncio global emitido con éxito.', 'success');
        closeCreateGlobalAnnouncementModal();
        await loadSuperadminDashboardData(true);
    } catch (err) {
        console.error("Error creating global announcement:", err);
        showToast(err.message || 'Error al emitir el anuncio global.', 'danger');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane text-xs"></i> <span>Publicar y Notificar</span>`;
        }
    }
}

async function deleteGlobalAnnouncement(id) {
    if (!id) return;

    try {
        const res = await apiFetch(`/admin/announcements/${id}`, { method: 'DELETE' });
        showToast(res.message || 'Anuncio eliminado correctamente.', 'success');
        await loadSuperadminDashboardData(true);
    } catch (err) {
        showToast(err.message || 'Error al eliminar anuncio.', 'danger');
    }
}
