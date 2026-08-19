/* ==========================================================================
   WorshipApp — DASHBOARD PANEL CONTROLLER (API Connected)
   ========================================================================== */

async function initDashboardView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    
    if (!currentUser || !currentGroupId) return;

    // Welcome title & role
    document.getElementById('welcome-message').textContent = `¡Hola, ${currentUser.name}!`;
    
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
    const userRole = getUserRoleInGroup(currentUser.id, currentGroupId);
    if (roleBadge) roleBadge.textContent = userRole;
    
    // Set current date formatted
    const dateElem = document.getElementById('dashboard-date');
    if (dateElem) dateElem.textContent = formatDate(getLocalDateString());

    // Refresh active group workspace selectors
    if (typeof renderWorkspaceGroupSelector === 'function') {
        const userGroups = getData('userGroups') || [];
        renderWorkspaceGroupSelector(userGroups);
    }


    // Fetch Announcements from API
    const listContainer = document.getElementById('announcements-list');
    const viewAllBtnContainer = document.getElementById('announcements-view-all-container');
    if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted);">Cargando novedades...</div>`;
    
    try {
        const announcements = await apiFetch('/announcements') || [];
        if (listContainer) listContainer.innerHTML = '';
        
        if (announcements.length === 0) {
            if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size: 0.9rem;">No hay novedades recientes en este grupo.</div>`;
            if (viewAllBtnContainer) viewAllBtnContainer.classList.add('hidden');
        } else {
            // Mostrar solo las 5 novedades más recientes en el Dashboard
            announcements.slice(0, 5).forEach(a => {
                const item = document.createElement('div');
                item.className = 'p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition';
                
                const iconConfig = getAnnouncementIconConfig(a);
                const categoryLabel = iconConfig.categoryLabel || 'Banda';
                const isCommunity = categoryLabel.toLowerCase() === 'comunidad';
                const categoryChipClass = isCommunity 
                    ? 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/60'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';

                // Formatear hora de creación
                const timeStr = a.created_at ? new Date(a.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs' : '';
                
                item.innerHTML = `
                    <div class="w-9 h-9 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0">
                        ${iconConfig.iconHtml}
                    </div>
                    <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">${a.text}</p>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryChipClass} uppercase">${categoryLabel}</span>
                            <span>•</span>
                            <span>${timeStr}</span>
                        </div>
                    </div>
                `;
                if (listContainer) listContainer.appendChild(item);
            });


            // Mostrar el botón de ver todas las novedades siempre que existan registros
            if (viewAllBtnContainer) {
                viewAllBtnContainer.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error("Error loading dashboard announcements:", e);
        if (listContainer) listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--danger); font-size: 0.9rem;">Fallo al cargar novedades.</div>`;
    }

    // Fetch Next Event Widget from API
    const nextEventContent = document.getElementById('next-event-content');
    const nextEventBadge = document.getElementById('next-event-badge');
    if (nextEventContent) nextEventContent.innerHTML = `<p class="text-xs text-zinc-500">Cargando próximo evento...</p>`;
    
    try {
        const events = await apiFetch('/events') || [];
        const todayStr = getLocalDateString();
        
        // Filter events by date (upcoming)
        const upcomingEvents = events
            .filter(ev => ev.date >= todayStr)
            .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

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

    // Bind dashboard quick links boxes
    document.querySelectorAll('.quick-link-box').forEach(box => {
        box.replaceWith(box.cloneNode(true)); // remove duplicate listeners
    });
    
    document.querySelectorAll('.quick-link-box').forEach(box => {
        box.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = box.getAttribute('data-nav');
            window.location.hash = `#${targetView}`;
        });
    });
}
