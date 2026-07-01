/* ==========================================================================
   WorshipApp — EVENTS & CALENDAR CONTROLLER (API Connected)
   ========================================================================== */

let calendarCurrentYear = new Date().getFullYear();
let calendarCurrentMonth = new Date().getMonth(); // 0-11
let cachedEvents = [];

function initEventsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Tab switches
    const btnListView = document.getElementById('toggle-view-list');
    const btnCalendarView = document.getElementById('toggle-view-calendar');
    const listWrapper = document.getElementById('events-list-wrapper');
    const calendarWrapper = document.getElementById('events-calendar-wrapper');

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

    // Calendar Navigation
    document.getElementById('btn-prev-month').onclick = () => {
        calendarCurrentMonth--;
        if (calendarCurrentMonth < 0) {
            calendarCurrentMonth = 11;
            calendarCurrentYear--;
        }
        renderCalendar();
    };

    document.getElementById('btn-next-month').onclick = () => {
        calendarCurrentMonth++;
        if (calendarCurrentMonth > 11) {
            calendarCurrentMonth = 0;
            calendarCurrentYear++;
        }
        renderCalendar();
    };

    // Add schedule event button visibility
    const scheduleBtn = document.getElementById('btn-schedule-event');
    if (canEdit()) {
        scheduleBtn.style.display = 'inline-flex';
        scheduleBtn.onclick = () => openScheduleEventModal();
    } else {
        scheduleBtn.style.display = 'none';
    }

    // Modal close triggers
    document.querySelectorAll('#modal-event-detail .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-event-detail').classList.add('hidden');
    });
    document.getElementById('btn-close-event-detail-modal-x').onclick = () => {
        document.getElementById('modal-event-detail').classList.add('hidden');
    };

    document.querySelectorAll('#modal-schedule-event .btn-close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('modal-schedule-event').classList.add('hidden');
    });
    document.getElementById('btn-close-schedule-event-modal-x').onclick = () => {
        document.getElementById('modal-schedule-event').classList.add('hidden');
    };

    // Populate event type dropdown
    const typeSelect = document.getElementById('event-form-type');
    typeSelect.innerHTML = '';
    EVENT_TYPES.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.value;
        opt.textContent = t.label;
        typeSelect.appendChild(opt);
    });

    // Form submit
    document.getElementById('event-schedule-form').onsubmit = handleEventScheduleFormSubmit;

    renderEvents(true); // force first fetch
}

async function renderEvents(forceRefresh = false) {
    const listContainer = document.getElementById('events-list-container');
    listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">Cargando eventos...</div>`;

    if (forceRefresh || cachedEvents.length === 0) {
        try {
            cachedEvents = await apiFetch('/events') || [];
        } catch (e) {
            console.error("Error loading events:", e);
            listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--danger);">Fallo al conectar con el servidor de la base de datos.</div>`;
            return;
        }
    }

    listContainer.innerHTML = '';

    if (cachedEvents.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">No hay eventos programados.</div>`;
        return;
    }

    cachedEvents.forEach(ev => {
        const card = document.createElement('div');
        card.className = `event-card ${ev.type}`;
        
        const setlistName = ev.setlist ? ev.setlist.name : 'Ninguno';
        const evDate = formatDate(ev.date);

        // Build roster tags from database musicians relation
        let rosterTagsHTML = '';
        if (ev.musicians && ev.musicians.length > 0) {
            ev.musicians.forEach(mus => {
                rosterTagsHTML += `
                    <div class="roster-tag">
                        <span>${mus.pivot.role}: <strong>${mus.name}</strong></span>
                    </div>
                `;
            });
        }

        const typeDetails = EVENT_TYPES.find(t => t.value === ev.type) || { label: 'Otro', badge: 'badge-danger' };

        card.innerHTML = `
            <div class="event-card-header">
                <div>
                    <h3>${ev.name}</h3>
                    <p>${evDate} • ${ev.time.substring(0, 5)} hs</p>
                </div>
                <span class="badge ${typeDetails.badge}">
                    ${typeDetails.label}
                </span>
            </div>
            <div class="event-card-body">
                <p style="font-size:0.9rem;">${ev.description || 'Sin notas adicionales'}</p>
                <div style="font-size:0.85rem;">
                    <strong>Repertorio:</strong> <a href="#setlists" class="view-setlist-link" data-id="${ev.setlist_id || ''}">${setlistName}</a>
                </div>
                <div class="event-roster-preview">
                    <h5>Músicos Asignados</h5>
                    <div class="roster-tags-grid">
                        ${rosterTagsHTML || '<div style="color:var(--text-muted); font-size:0.75rem;">Nadie asignado todavía.</div>'}
                    </div>
                </div>
            </div>
        `;

        card.querySelector('.view-setlist-link').onclick = (e) => {
            e.preventDefault();
            if (ev.setlist_id) {
                window.location.hash = '#setlists';
                setTimeout(() => {
                    const searchInput = document.getElementById('setlists-search-input');
                    if (searchInput) {
                        searchInput.value = setlistName;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }, 200);
            } else {
                showToast("Este evento no tiene un repertorio asignado", "warning");
            }
        };

        listContainer.appendChild(card);
    });

    if (!document.getElementById('events-calendar-wrapper').classList.contains('hidden')) {
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
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'calendar-events-dots';
            
            dayEvents.forEach(ev => {
                const dot = document.createElement('span');
                dot.className = `event-dot ${ev.type}`;
                dotsContainer.appendChild(dot);
            });
            
            cell.appendChild(dotsContainer);
            
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

function viewEventDetails(eventId) {
    const ev = cachedEvents.find(e => e.id === eventId);
    if (!ev) return;

    document.getElementById('event-detail-modal-name').textContent = ev.name;
    const body = document.getElementById('event-detail-modal-body');

    const setlistName = ev.setlist ? ev.setlist.name : 'Ninguno';

    let rosterHTML = '';
    if (ev.musicians && ev.musicians.length > 0) {
        ev.musicians.forEach(mus => {
            rosterHTML += `
                <li style="padding: 8px 12px; background-color: var(--bg-hover); border-radius:var(--radius-sm); margin-bottom:6px; display:flex; justify-content:space-between; font-size:0.9rem;">
                    <span><strong>${mus.pivot.role}:</strong></span>
                    <span>${mus.name} ${mus.lastname || ''}</span>
                </li>
            `;
        });
    }

    const typeDetails = EVENT_TYPES.find(t => t.value === ev.type) || { label: 'Otro', badge: 'badge-danger' };

    body.innerHTML = `
        <div class="modal-detail-section">
            <h4>Fecha y Hora</h4>
            <p>${formatDate(ev.date)} a las <strong>${ev.time.substring(0, 5)} hs</strong></p>
        </div>
        <div class="modal-detail-section">
            <h4>Tipo de Evento</h4>
            <span class="badge ${typeDetails.badge}">
                ${typeDetails.label}
            </span>
        </div>
        <div class="modal-detail-section">
            <h4>Descripción</h4>
            <p>${ev.description || 'Sin notas adicionales.'}</p>
        </div>
        <div class="modal-detail-section">
            <h4>Repertorio Asignado</h4>
            <p><a href="#setlists" class="btn btn-outline btn-sm view-setlist-modal-link" style="margin-top:4px;">${setlistName}</a></p>
        </div>
        <div class="modal-detail-section">
            <h4>Músicos en Roster</h4>
            <ul style="list-style:none;">
                ${rosterHTML || '<span style="color:var(--text-muted); font-size:0.9rem;">Nadie asignado.</span>'}
            </ul>
        </div>
    `;

    body.querySelector('.view-setlist-modal-link').onclick = (e) => {
        e.preventDefault();
        document.getElementById('modal-event-detail').classList.add('hidden');
        if (ev.setlist_id) {
            window.location.hash = '#setlists';
            setTimeout(() => {
                const searchInput = document.getElementById('setlists-search-input');
                if (searchInput) {
                    searchInput.value = setlistName;
                    searchInput.dispatchEvent(new Event('input'));
                }
            }, 200);
        }
    };

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
            opt.textContent = `${s.name} (${formatDate(s.date, true)})`;
            setlistSelect.appendChild(opt);
        });

        // Load roles and group members
        const roles = await apiFetch('/members/roles') || [];
        const members = await apiFetch('/members') || [];
        
        rosterSection.innerHTML = '';

        const rolesToAssign = roles.length > 0 ? roles : ["Líder", "Voz Principal", "Coros", "Guitarra Acústica", "Teclado", "Bajo", "Batería"];

        rolesToAssign.forEach(role => {
            const div = document.createElement('div');
            div.className = 'roster-setup-item';
            
            let optionsHTML = '<option value="">-- No Asignado --</option>';
            members.forEach(u => {
                const isMatch = u.role.toLowerCase().includes(role.toLowerCase()) || (role === "Líder" && u.role === "Líder");
                optionsHTML += `<option value="${u.id}">${u.name} ${u.lastname || ''} ${isMatch ? '(Recomendado)' : ''}</option>`;
            });

            div.innerHTML = `
                <span class="role-label">${role}</span>
                <select name="roster-role-${role}" class="form-select-sm">
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
