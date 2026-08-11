/* ==========================================================================
   WorshipApp — ANNOUNCEMENTS & ACTIVITY HISTORY CONTROLLER (API Connected)
   ========================================================================== */

let cachedAnnouncementsList = [];
let announcementsSearchQuery = "";
let announcementsDateQuery = "";

function initAnnouncementsView() {
    const currentUser = getData('currentUser');
    const currentGroupId = getData('currentGroupId');
    if (!currentUser || !currentGroupId) return;

    // Reset filters
    announcementsSearchQuery = "";
    announcementsDateQuery = "";

    const searchInput = document.getElementById('announcements-search-input');
    const dateInput = document.getElementById('announcements-date-input');
    const clearBtn = document.getElementById('btn-clear-announcements-filters');

    if (searchInput) {
        searchInput.value = "";
        searchInput.oninput = (e) => {
            announcementsSearchQuery = e.target.value;
            renderAnnouncementsFullList();
        };
    }

    if (dateInput) {
        dateInput.value = "";
        dateInput.onchange = (e) => {
            announcementsDateQuery = e.target.value;
            renderAnnouncementsFullList();
        };
    }

    if (clearBtn) {
        clearBtn.onclick = resetAnnouncementsFilters;
    }

    loadAnnouncementsHistory(true);
}

async function loadAnnouncementsHistory(forceRefresh = false) {
    const container = document.getElementById('announcements-full-list');
    if (!container) return;

    if (forceRefresh || cachedAnnouncementsList.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">Cargando historial de novedades...</div>`;
        try {
            cachedAnnouncementsList = await apiFetch('/announcements?limit=100') || [];
        } catch (e) {
            console.error("Error loading announcements history:", e);
            container.innerHTML = `<div class="text-center py-12 text-xs text-red-500">Fallo al cargar el historial de novedades.</div>`;
            return;
        }
    }

    renderAnnouncementsFullList();
}

function resetAnnouncementsFilters() {
    announcementsSearchQuery = "";
    announcementsDateQuery = "";

    const searchInput = document.getElementById('announcements-search-input');
    const dateInput = document.getElementById('announcements-date-input');
    if (searchInput) searchInput.value = "";
    if (dateInput) dateInput.value = "";

    renderAnnouncementsFullList();
}

function renderAnnouncementsFullList() {
    const container = document.getElementById('announcements-full-list');
    const summaryContainer = document.getElementById('announcements-filter-summary');
    const summaryCount = document.getElementById('announcements-filter-count');
    if (!container) return;

    container.innerHTML = '';

    const textQ = announcementsSearchQuery.toLowerCase().trim();
    const dateQ = announcementsDateQuery.trim();

    const filtered = cachedAnnouncementsList.filter(a => {
        const matchesText = !textQ || (a.text && a.text.toLowerCase().includes(textQ));
        let matchesDate = true;
        if (dateQ && a.created_at) {
            const itemDate = a.created_at.substring(0, 10);
            matchesDate = (itemDate === dateQ);
        }
        return matchesText && matchesDate;
    });

    // Update filter summary
    if (summaryContainer && summaryCount) {
        if (textQ || dateQ) {
            summaryCount.textContent = `Mostrando ${filtered.length} de ${cachedAnnouncementsList.length} registros`;
            summaryContainer.classList.remove('hidden');
        } else {
            summaryContainer.classList.add('hidden');
        }
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron registros en el historial.</div>`;
        return;
    }

    filtered.forEach(a => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition';

        const iconConfig = getAnnouncementIconConfig(a);
        const iconContainer = `<div class="w-9 h-9 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0">${iconConfig.iconHtml}</div>`;

        // Format created date & time
        let formattedDateStr = '';
        let timeStr = '';
        if (a.created_at) {
            const d = new Date(a.created_at);
            formattedDateStr = d.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs';
        }

        card.innerHTML = `
            ${iconContainer}
            <div class="flex-1 min-w-0 space-y-1">
                <p class="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">${a.text}</p>
                <div class="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <span>${formattedDateStr}</span>
                    <span>•</span>
                    <span>${timeStr}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
