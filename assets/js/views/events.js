/* ==========================================================================
   WorshipApp — EVENTS & CALENDAR CONTROLLER (API Connected)
   ========================================================================== */

let calendarCurrentYear = new Date().getFullYear();
let calendarCurrentMonth = new Date().getMonth(); // 0-11
let cachedEvents = [];
let eventIdToDelete = null;
let eventsVisibleLimit = 12;
const EVENTS_PAGE_SIZE = 12;

function getEventTypeBadgeHTML(typeStr) {
    const typeLower = (typeStr || '').toLowerCase();
    
    let colorClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    let label = typeStr || 'Evento';

    if (typeLower.includes('ensayo')) {
        colorClasses = 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60';
        label = 'Ensayo';
    } else if (typeLower.includes('servicio') || typeLower.includes('culto') || typeLower.includes('domingo')) {
        colorClasses = 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60';
        label = 'Servicio / Culto';
    } else if (typeLower.includes('concierto') || typeLower.includes('show') || typeLower.includes('especial')) {
        colorClasses = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60';
        label = 'Concierto';
    } else if (typeLower.includes('reunión') || typeLower.includes('reunion') || typeLower.includes('capacitación')) {
        colorClasses = 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60';
        label = 'Reunión / Capacitación';
    }

    return `<span class="px-2.5 py-1 rounded-xl text-xs font-bold border ${colorClasses}">${label}</span>`;
}

function initEventsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Tab switches
    const btnListView = document.getElementById('toggle-view-list');
    const btnCalendarView = document.getElementById('toggle-view-calendar');
    const listWrapper = document.getElementById('events-list-wrapper');
    const calendarWrapper = document.getElementById('events-calendar-wrapper');

    if (btnListView && btnCalendarView && listWrapper && calendarWrapper) {
        btnListView.onclick = () => {
            btnListView.classList.add('active');
            btnCalendarView.classList.remove('active');
            listWrapper.classList.remove('hidden');
            calendarWrapper.classList.add('hidden');
        };

        btnCalendarView.onclick = () => {
            btnCalendarView.classList.add('active');
            btnListView.classList.remove('active');
            calendarWrapper.classList.remove('hidden');
            listWrapper.classList.add('hidden');
            renderCalendar();
        };
    }

    // Calendar Navigation
    const prevMonthBtn = document.getElementById('btn-prev-month');
    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => {
            calendarCurrentMonth--;
            if (calendarCurrentMonth < 0) {
                calendarCurrentMonth = 11;
                calendarCurrentYear--;
            }
            renderCalendar();
        };
    }

    const nextMonthBtn = document.getElementById('btn-next-month');
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => {
            calendarCurrentMonth++;
            if (calendarCurrentMonth > 11) {
                calendarCurrentMonth = 0;
                calendarCurrentYear++;
            }
            renderCalendar();
        };
    }

    // Add schedule event button visibility
    const scheduleBtn = document.getElementById('btn-schedule-event');
    if (scheduleBtn) {
        if (canEdit()) {
            scheduleBtn.style.display = 'inline-flex';
            scheduleBtn.onclick = () => openScheduleEventModal();
        } else {
            scheduleBtn.style.display = 'none';
        }
    }

    // Modal close triggers
    document.querySelectorAll('#modal-event-detail .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-event-detail').classList.add('hidden');
    });
    const closeXDetail = document.getElementById('btn-close-event-detail-modal-x');
    if (closeXDetail) {
        closeXDetail.onclick = () => document.getElementById('modal-event-detail').classList.add('hidden');
    }

    document.querySelectorAll('#modal-schedule-event .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-schedule-event').classList.add('hidden');
    });
    const closeXSchedule = document.getElementById('btn-close-schedule-event-modal-x');
    if (closeXSchedule) {
        closeXSchedule.onclick = () => document.getElementById('modal-schedule-event').classList.add('hidden');
    }

    // Confirm Delete Event Modal triggers
    document.querySelectorAll('#modal-delete-event-confirm .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-delete-event-confirm').classList.add('hidden');
    });
    const closeXDeleteEvent = document.getElementById('btn-close-delete-event-modal-x');
    if (closeXDeleteEvent) {
        closeXDeleteEvent.onclick = () => document.getElementById('modal-delete-event-confirm').classList.add('hidden');
    }
    const confirmDeleteEventBtn = document.getElementById('btn-confirm-delete-event');
    if (confirmDeleteEventBtn) {
        confirmDeleteEventBtn.onclick = executeDeleteEvent;
    }

    // Populate event type dropdown
    const typeSelect = document.getElementById('event-form-type');
    if (typeSelect) {
        typeSelect.innerHTML = '';
        EVENT_TYPES.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.value;
            opt.textContent = t.label;
            typeSelect.appendChild(opt);
        });
    }

    // Form submit
    const scheduleForm = document.getElementById('event-schedule-form');
    if (scheduleForm) {
        scheduleForm.onsubmit = handleEventScheduleFormSubmit;
    }

    eventsVisibleLimit = EVENTS_PAGE_SIZE;
    renderEvents(true); // force first fetch
}

async function renderEvents(forceRefresh = false) {
    const listContainer = document.getElementById('events-list-container');
    const loadMoreContainer = document.getElementById('events-load-more-container');
    const btnLoadMore = document.getElementById('btn-events-load-more');
    if (!listContainer) return;

    if (forceRefresh || cachedEvents.length === 0) {
        listContainer.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">Cargando eventos...</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        try {
            cachedEvents = await apiFetch('/events') || [];
        } catch (e) {
            console.error("Error loading events:", e);
            listContainer.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-red-500">Fallo al conectar con el servidor de eventos.</div>`;
            return;
        }
    }

    listContainer.innerHTML = '';

    if (cachedEvents.length === 0) {
        listContainer.innerHTML = `<div class="col-span-full text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">No hay eventos programados.</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const visibleEvents = cachedEvents.slice(0, eventsVisibleLimit);

    visibleEvents.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer space-y-3';
        
        const setlistName = ev.setlist ? ev.setlist.name : 'Ninguno';
        const evDate = typeof formatDate === 'function' ? formatDate(ev.date) : ev.date;

        let rosterTagsHTML = '';
        if (ev.musicians && ev.musicians.length > 0) {
            ev.musicians.forEach(mus => {
                rosterTagsHTML += `
                    <span class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        ${mus.pivot.role}: <strong class="text-zinc-900 dark:text-white">${mus.name}</strong>
                    </span>
                `;
            });
        }

        const typeBadgeHTML = getEventTypeBadgeHTML(ev.type);

        card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div>
                    <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100">${ev.name}</h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${evDate} • ${ev.time ? ev.time.substring(0, 5) : '18:00'} hs</p>
                </div>
                ${typeBadgeHTML}
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-400">${ev.description || 'Sin notas adicionales'}</p>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
                <span class="font-semibold text-zinc-700 dark:text-zinc-300">Repertorio:</span> 
                <a href="#setlists" class="view-setlist-link font-bold text-zinc-900 dark:text-zinc-100 hover:underline" data-id="${ev.setlist_id || ''}">${setlistName}</a>
            </div>
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <h5 class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Músicos Asignados</h5>
                <div class="flex flex-wrap gap-1.5">
                    ${rosterTagsHTML || '<span class="text-xs text-zinc-400 italic">Nadie asignado todavía.</span>'}
                </div>
            </div>
        `;

        const setlistLink = card.querySelector('.view-setlist-link');
        if (setlistLink) {
            setlistLink.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (ev.setlist_id) {
                    if (typeof viewSetlistPresentationDirectly === 'function') {
                        viewSetlistPresentationDirectly(ev.setlist_id);
                    } else {
                        window.location.hash = '#setlists';
                    }
                } else {
                    showToast("Este evento no tiene un repertorio asignado", "warning");
                }
            };
        }

        card.onclick = () => {
            viewEventDetails(ev.id);
        };

        listContainer.appendChild(card);
    });

    // Controlar botón Cargar más
    if (loadMoreContainer && btnLoadMore) {
        if (cachedEvents.length > eventsVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                eventsVisibleLimit += EVENTS_PAGE_SIZE;
                renderEvents(false);
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    const calendarWrapper = document.getElementById('events-calendar-wrapper');
    if (calendarWrapper && !calendarWrapper.classList.contains('hidden')) {
        renderCalendar();
    }
}


const MONTHS_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function renderCalendar() {
    document.getElementById('calendar-month-year').textContent = `${MONTHS_NAMES[calendarCurrentMonth]} ${calendarCurrentYear}`;

    const cellsGrid = document.getElementById('calendar-grid-cells');
    cellsGrid.innerHTML = '';

    const firstDayIndex = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay();
    const totalDays = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarCurrentYear, calendarCurrentMonth, 0).getDate();

    // 1. Render overflow days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="day-num">${prevMonthDays - i}</span>`;
        cellsGrid.appendChild(cell);
    }

    // 2. Render current month days
    const today = new Date();
    const isThisMonth = today.getFullYear() === calendarCurrentYear && today.getMonth() === calendarCurrentMonth;

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        
        if (isThisMonth && today.getDate() === day) {
            cell.classList.add('today');
        }

        cell.innerHTML = `<span class="day-num">${day}</span>`;

        const dateStr = `${calendarCurrentYear}-${String(calendarCurrentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        // Filter cached events for this date
        const dayEvents = cachedEvents.filter(e => e.date === dateStr);

        if (dayEvents.length > 0) {
            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'calendar-event-badges-container';
            
            dayEvents.forEach(ev => {
                const badge = document.createElement('div');
                const typeLower = (ev.type || '').toLowerCase();
                let badgeColor = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
                if (typeLower.includes('ensayo')) badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-200';
                else if (typeLower.includes('servicio') || typeLower.includes('culto') || typeLower.includes('domingo')) badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-200';
                else if (typeLower.includes('concierto') || typeLower.includes('show')) badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-200';
                else if (typeLower.includes('reunión') || typeLower.includes('reunion')) badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-200';

                badge.className = `px-1.5 py-0.5 rounded text-[10px] font-bold truncate max-w-full mt-0.5 ${badgeColor}`;
                badge.textContent = ev.name || ev.type;
                badgesContainer.appendChild(badge);
            });

            
            cell.appendChild(badgesContainer);
            
            cell.onclick = () => {
                if (dayEvents.length === 1) {
                    viewEventDetails(dayEvents[0].id);
                } else {
                    viewDayEventsDetails(dateStr, dayEvents);
                }
            };
        } else {
            // For leaders, clicking empty day allows quick event scheduling
            cell.onclick = () => {
                if (canEdit()) {
                    openScheduleEventModal(dateStr);
                }
            };
        }

        cellsGrid.appendChild(cell);
    }

    // 3. Render next month overlap cells
    const totalRenderedCells = firstDayIndex + totalDays;
    const remainingCells = 42 - totalRenderedCells;
    
    for (let i = 1; i <= remainingCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="day-num">${i}</span>`;
        cellsGrid.appendChild(cell);
    }
}

async function viewEventDetails(eventId) {
    if (!cachedEvents || cachedEvents.length === 0) {
        try {
            cachedEvents = await apiFetch('/events') || [];
        } catch (err) {
            console.error("Error loading events for details:", err);
        }
    }
    const ev = cachedEvents.find(e => e.id === eventId);
    if (!ev) return;

    // Enlazar botones de cierre dinámicamente por si se abre desde otra vista como el Dashboard
    const modal = document.getElementById('modal-event-detail');
    if (modal) {
        modal.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.onclick = () => modal.classList.add('hidden');
        });
        const closeX = document.getElementById('btn-close-event-detail-modal-x');
        if (closeX) {
            closeX.onclick = () => modal.classList.add('hidden');
        }
    }

    document.getElementById('event-detail-modal-name').textContent = ev.name;
    const body = document.getElementById('event-detail-modal-body');

    const setlistName = ev.setlist ? ev.setlist.name : 'Ninguno';

    let rosterHTML = '';
    if (ev.musicians && ev.musicians.length > 0) {
        ev.musicians.forEach(mus => {
            rosterHTML += `
                <li class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                    <span class="font-bold text-zinc-700 dark:text-zinc-300">${mus.pivot.role}:</span>
                    <span class="text-zinc-900 dark:text-zinc-100 font-semibold">${mus.name} ${mus.lastname || ''}</span>
                </li>
            `;
        });
    }

    const typeBadgeHTML = getEventTypeBadgeHTML(ev.type);

    body.innerHTML = `
        <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Tipo de Evento</span>
            <div>${typeBadgeHTML}</div>
        </div>
        <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Fecha y Hora</span>
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${formatDate(ev.date)} a las <strong>${ev.time ? ev.time.substring(0, 5) : '18:00'} hs</strong></p>
        </div>
        <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Descripción</span>
            <p class="text-xs text-zinc-600 dark:text-zinc-400">${ev.description || 'Sin notas adicionales.'}</p>
        </div>
        <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Repertorio Asignado</span>
            <div>
                <a href="#setlists" class="view-setlist-modal-link inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline transition">
                    <i class="fa-solid fa-list-check text-xs"></i>
                    <span>${setlistName}</span>
                </a>
            </div>
        </div>
        <div class="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Músicos Asignados</span>
            <ul class="space-y-1.5">
                ${rosterHTML || '<li class="text-xs text-zinc-400 italic">Nadie asignado todavía.</li>'}
            </ul>
        </div>
    `;

    body.querySelector('.view-setlist-modal-link').onclick = (e) => {
        e.preventDefault();
        if (ev.setlist_id) {
            document.getElementById('modal-event-detail').classList.add('hidden');
            if (typeof viewSetlistPresentationDirectly === 'function') {
                viewSetlistPresentationDirectly(ev.setlist_id);
            } else {
                window.location.hash = '#setlists';
            }
        } else {
            showToast("Este evento no tiene un repertorio asignado", "warning");
        }
    };

    // Mostrar/ocultar botón de eliminar evento según permisos
    const deleteBtn = document.getElementById('btn-delete-event');
    if (deleteBtn) {
        if (canEdit()) {
            deleteBtn.style.display = 'inline-flex';
            deleteBtn.onclick = () => handleDeleteEvent(ev.id, ev.name);
        } else {
            deleteBtn.style.display = 'none';
        }
    }

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

function viewDayEventsDetails(dateStr, dayEvents) {
    document.getElementById('event-detail-modal-name').textContent = `Eventos para el ${formatDate(dateStr, true)}`;
    const body = document.getElementById('event-detail-modal-body');
    body.innerHTML = '';

    dayEvents.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'dashboard-card';
        div.style.marginBottom = '12px';
        div.style.padding = '12px';
        
        const typeDetails = EVENT_TYPES.find(t => t.value === ev.type) || { label: 'Otro', badge: 'badge-danger' };

        div.innerHTML = `
            <div class="card-header" style="border:none; padding:0; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <h4 style="margin:0;">${ev.name}</h4>
                <span class="badge ${typeDetails.badge}">${typeDetails.label}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">Hora: ${ev.time.substring(0, 5)} hs</p>
            <button class="btn btn-primary btn-sm btn-block view-specific-event-btn" data-id="${ev.id}">Ver Ficha Completa</button>
        `;

        div.querySelector('.view-specific-event-btn').onclick = () => {
            viewEventDetails(ev.id);
        };

        body.appendChild(div);
    });

    const deleteBtn = document.getElementById('btn-delete-event');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

async function openScheduleEventModal(prefilledDate = null) {
    // Fill setlists options
    const setlistSelect = document.getElementById('event-form-setlist');
    setlistSelect.innerHTML = '<option value="" disabled selected>Cargando repertorios...</option>';
    
    // Populate roster dropdown lists dynamically according to roles of the active group
    const rosterSection = document.getElementById('event-form-roster-selection');
    rosterSection.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px;">Cargando roster...</div>';

    document.getElementById('event-schedule-form').reset();

    try {
        const setlists = await apiFetch('/setlists') || [];
        setlistSelect.innerHTML = '<option value="" selected>-- Ninguno --</option>';

        setlists.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            setlistSelect.appendChild(opt);
        });

        // Load roles and group members
        const roles = await apiFetch('/members/roles') || [];
        const members = await apiFetch('/members') || [];
        
        rosterSection.innerHTML = '';

        const rolesToAssign = roles.length > 0 ? roles : ["Líder", "Voz Principal", "Coros", "Guitarra Acústica", "Teclado", "Bajo", "Batería"];

        rolesToAssign.forEach(role => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs';
            
            let optionsHTML = '<option value="">-- No Asignado --</option>';
            members.forEach(u => {
                const userRole = u.role || '';
                const isMatch = userRole.toLowerCase().includes(role.toLowerCase()) || (role === "Líder" && userRole === "Líder");
                optionsHTML += `<option value="${u.id}">${u.name} ${u.lastname || ''} ${isMatch ? '(Recomendado)' : ''}</option>`;
            });

            div.innerHTML = `
                <span class="font-bold text-zinc-700 dark:text-zinc-300 min-w-[110px] truncate">${role}</span>
                <select name="roster-role-${role}" class="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none">
                    ${optionsHTML}
                </select>
            `;
            rosterSection.appendChild(div);
        });


        // Date pre-fill
        if (prefilledDate) {
            document.getElementById('event-form-date').value = prefilledDate;
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('event-form-date').value = tomorrow.toISOString().split('T')[0];
        }
        
        document.getElementById('event-form-time').value = "18:00";
        document.getElementById('modal-schedule-event').classList.remove('hidden');

    } catch (e) {
        console.error("Error setting up schedule event modal:", e);
        showToast("Fallo al cargar información para la programación.", "danger");
    }
}

async function handleEventScheduleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('event-form-name').value.trim();
    const date = document.getElementById('event-form-date').value;
    const time = document.getElementById('event-form-time').value;
    const type = document.getElementById('event-form-type').value;
    const description = document.getElementById('event-form-desc').value.trim();
    
    const setlistVal = document.getElementById('event-form-setlist').value;
    const setlistId = setlistVal ? parseInt(setlistVal) : null;

    // Build roster array for the API: [{ user_id, role }, ...]
    const musicians = [];
    const selects = document.querySelectorAll('#event-form-roster-selection select');
    selects.forEach(sel => {
        const role = sel.getAttribute('name').replace('roster-role-', '');
        const val = sel.value;
        if (val) {
            musicians.push({
                user_id: parseInt(val),
                role: role
            });
        }
    });

    try {
        await apiFetch('/events', {
            method: 'POST',
            body: { 
                name, 
                date, 
                time, 
                type, 
                description, 
                setlist_id: setlistId, 
                musicians 
            }
        });

        showToast("Evento programado correctamente", "success");
        document.getElementById('modal-schedule-event').classList.add('hidden');
        await renderEvents(true); // force reload
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleDeleteEvent(eventId, eventName) {
    eventIdToDelete = eventId;
    
    const modalNameEl = document.getElementById('delete-event-modal-name');
    if (modalNameEl) {
        modalNameEl.textContent = eventName;
    }
    
    document.getElementById('modal-delete-event-confirm').classList.remove('hidden');
}

async function executeDeleteEvent() {
    if (!eventIdToDelete) return;

    const btn = document.getElementById('btn-confirm-delete-event');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
        await apiFetch(`/events/${eventIdToDelete}`, {
            method: 'DELETE'
        });
        
        showToast("Evento cancelado y eliminado correctamente");
        
        document.getElementById('modal-delete-event-confirm').classList.add('hidden');
        document.getElementById('modal-event-detail').classList.add('hidden');
        
        await renderEvents(true); // force reload
    } catch (err) {
        showToast(err.message, "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Eliminar Evento';
        eventIdToDelete = null;
    }
}
