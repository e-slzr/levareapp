/* ==========================================================================
   WorshipApp — DASHBOARD PANEL CONTROLLER (API Connected)
   ========================================================================== */

async function initDashboardView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    
    if (!currentUser || !currentGroupId) return;

    // Welcome title & role
    document.getElementById('welcome-message').textContent = `¡Hola, ${currentUser.name}!`;
    
    // Set role badge
    const roleBadge = document.getElementById('dashboard-user-role-badge');
    const userRole = getUserRoleInGroup(currentUser.id, currentGroupId);
    roleBadge.textContent = userRole;
    
    // Set current date formatted (using client's local timezone)
    document.getElementById('dashboard-date').textContent = formatDate(getLocalDateString());

    // Fetch Announcements from API
    const listContainer = document.getElementById('announcements-list');
    listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted);">Cargando novedades...</div>`;
    
    try {
        const announcements = await apiFetch('/announcements') || [];
        listContainer.innerHTML = '';
        
        if (announcements.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size: 0.9rem;">No hay novedades recientes en este grupo.</div>`;
        } else {
            // Mostrar solo las 10 novedades más recientes
            announcements.slice(0, 10).forEach(a => {
                const item = document.createElement('div');
                item.className = 'notification-item';
                
                let iconSvg = '';
                if (a.type === 'purple') {
                    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
                } else if (a.type === 'green') {
                    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
                } else {
                    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.7 0 3.2-.4 4.5-1.1L22 22l-1.1-5.5c.7-1.3 1.1-2.8 1.1-4.5A10 10 0 0 0 12 2z"/></svg>`;
                }
                
                // Formatear hora de creación
                const timeStr = a.created_at ? new Date(a.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs' : '';
                
                item.innerHTML = `
                    <div class="notif-icon ${a.type}">
                        ${iconSvg}
                    </div>
                    <div class="notif-details">
                        <p>${a.text}</p>
                        <span class="notif-time">${timeStr}</span>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }
    } catch (e) {
        console.error("Error loading dashboard announcements:", e);
        listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--danger); font-size: 0.9rem;">Fallo al cargar novedades.</div>`;
    }

    // Fetch Next Event Widget from API
    const nextEventContent = document.getElementById('next-event-content');
    const nextEventBadge = document.getElementById('next-event-badge');
    nextEventContent.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">Cargando próximo evento...</p>`;
    
    try {
        const events = await apiFetch('/events') || [];
        const todayStr = getLocalDateString();
        
        // Filter events by date (upcoming)
        const upcomingEvents = events
            .filter(ev => ev.date >= todayStr)
            .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        if (upcomingEvents.length > 0) {
            const ev = upcomingEvents[0];
            
            nextEventBadge.textContent = ev.type === 'concierto' ? 'Concierto' : ev.type === 'culto' ? 'Culto' : ev.type === 'ensayo' ? 'Ensayo' : ev.type === 'especial' ? 'Especial' : 'Otro';
            nextEventBadge.className = `badge ${ev.type === 'concierto' ? 'badge-success' : ev.type === 'culto' ? 'badge-info' : ev.type === 'ensayo' ? 'badge-primary' : ev.type === 'especial' ? 'badge-warning' : 'badge-danger'}`;
            
            // Find my role in event musicians roster
            const myAssignment = ev.musicians ? ev.musicians.find(m => m.id == currentUser.id) : null;
            const rosterRole = myAssignment ? myAssignment.pivot.role : "No asignado";

            const evDate = formatDate(ev.date, true);

            nextEventContent.innerHTML = `
                <h4 id="next-event-name">${ev.name}</h4>
                <div class="event-meta-info">
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>${evDate}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>${ev.time.substring(0, 5)} hs</span>
                    </div>
                </div>
                <div class="event-roster-quick">
                    <h5>Tu rol asignado: <strong id="next-event-user-role" style="color:var(--primary);">${rosterRole}</strong></h5>
                </div>
                <div class="card-actions-row">
                    <button class="btn btn-outline btn-sm" id="dashboard-view-setlist-btn" ${ev.setlist_id ? '' : 'disabled'} data-setlist-id="${ev.setlist_id || ''}">Ver Repertorio</button>
                    <button class="btn btn-primary btn-sm" id="dashboard-view-event-btn" data-event-id="${ev.id}">Detalles</button>
                </div>
            `;

            document.getElementById('dashboard-view-setlist-btn').addEventListener('click', () => {
                if (ev.setlist_id) {
                    if (typeof viewSetlistPresentationDirectly === 'function') {
                        viewSetlistPresentationDirectly(ev.setlist_id);
                    } else {
                        window.location.hash = '#setlists';
                    }
                } else {
                    showToast("Este evento no tiene un repertorio asignado.", "warning");
                }
            });

            document.getElementById('dashboard-view-event-btn').addEventListener('click', () => {
                if (typeof viewEventDetails === 'function') {
                    viewEventDetails(ev.id);
                }
            });
        } else {
            nextEventBadge.textContent = 'Ninguno';
            nextEventBadge.className = 'badge badge-danger';
            nextEventContent.innerHTML = `
                <h4>No hay eventos programados</h4>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 20px;">Todo en orden. ¡Disfruta de tu descanso musical!</p>
                <button class="btn btn-primary btn-sm" id="dashboard-schedule-btn" style="display:none;">Programar Evento</button>
            `;
            
            const scheduleBtn = document.getElementById('dashboard-schedule-btn');
            if (canEdit()) {
                scheduleBtn.style.display = 'inline-flex';
                scheduleBtn.addEventListener('click', () => {
                    window.location.hash = '#events';
                    setTimeout(() => {
                        if (typeof openScheduleEventModal === 'function') {
                            openScheduleEventModal();
                        }
                    }, 150);
                });
            }
        }
    } catch (e) {
        console.error("Error loading upcoming event:", e);
        nextEventBadge.textContent = 'Error';
        nextEventBadge.className = 'badge badge-danger';
        nextEventContent.innerHTML = `<p style="color:var(--danger); font-size:0.9rem;">Fallo al cargar próximo evento.</p>`;
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
