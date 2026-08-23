/* ==========================================================================
   Levare — ANNOUNCEMENTS & ACTIVITY HISTORY CONTROLLER (API Connected)
   ========================================================================== */

let cachedAnnouncementsList = [];
let announcementsSearchQuery = "";
let announcementsDateQuery = "";
let announcementsVisibleLimit = 15;
const ANNOUNCEMENTS_PAGE_SIZE = 15;

function initAnnouncementsView() {
    const currentUser = getData('currentUser');
    if (!currentUser) return;

    // Reset filters
    announcementsSearchQuery = "";
    announcementsDateQuery = "";
    announcementsVisibleLimit = ANNOUNCEMENTS_PAGE_SIZE;

    const searchInput = document.getElementById('announcements-search-input');
    const dateInput = document.getElementById('announcements-date-input');
    const clearBtn = document.getElementById('btn-clear-announcements-filters');

    if (searchInput) {
        searchInput.value = "";
        searchInput.oninput = (e) => {
            announcementsSearchQuery = e.target.value;
            announcementsVisibleLimit = ANNOUNCEMENTS_PAGE_SIZE;
            renderAnnouncementsFullList();
        };
    }

    if (dateInput) {
        dateInput.value = "";
        dateInput.onchange = (e) => {
            announcementsDateQuery = e.target.value;
            announcementsVisibleLimit = ANNOUNCEMENTS_PAGE_SIZE;
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
    const loadMoreContainer = document.getElementById('announcements-load-more-container');
    if (!container) return;

    if (forceRefresh || cachedAnnouncementsList.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">Cargando historial de novedades...</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
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
    announcementsVisibleLimit = ANNOUNCEMENTS_PAGE_SIZE;

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
    const loadMoreContainer = document.getElementById('announcements-load-more-container');
    const btnLoadMore = document.getElementById('btn-announcements-load-more');
    if (!container) return;

    container.innerHTML = '';

    const textQ = announcementsSearchQuery.toLowerCase().trim();
    const dateQ = announcementsDateQuery.trim();

    const filtered = cachedAnnouncementsList.filter(a => {
        const meta = a.meta || {};
        const titleStr = String(meta.title || '').toLowerCase();
        const contentStr = String(meta.content || '').toLowerCase();
        const textStr = String(a.text || '').toLowerCase();

        const matchesText = !textQ || titleStr.includes(textQ) || contentStr.includes(textQ) || textStr.includes(textQ);
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
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const visibleItems = filtered.slice(0, announcementsVisibleLimit);

    visibleItems.forEach(a => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer';

        const iconConfig = getAnnouncementIconConfig(a);
        const meta = a.meta || {};
        const categoryChipClass = iconConfig.chipClass || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
        const displayTitle = meta.title || a.text;
        const hasImage = !!meta.image_url;

        const iconContainer = `<div class="w-9 h-9 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0 mt-0.5">${iconConfig.iconHtml}</div>`;

        // Format created date & time
        let formattedDateStr = '';
        let timeStr = '';
        if (a.created_at) {
            const d = new Date(a.created_at);
            formattedDateStr = d.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs';
        }

        card.onclick = () => openAnnouncementDetailModal(a);

        card.innerHTML = `
            ${iconContainer}
            <div class="flex-1 min-w-0 space-y-1.5">
                <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">${displayTitle}</p>
                ${meta.content && meta.title ? `<p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">${meta.content}</p>` : ''}
                <div class="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryChipClass} uppercase">${iconConfig.categoryLabel}</span>
                    ${hasImage ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1"><i class="fa-solid fa-image text-[9px]"></i> Foto</span>' : ''}
                    <span>•</span>
                    <span>${formattedDateStr}</span>
                    <span>•</span>
                    <span>${timeStr}</span>
                </div>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400 self-center"></i>
        `;

        container.appendChild(card);
    });

    // Controlar botón Cargar más
    if (loadMoreContainer && btnLoadMore) {
        if (filtered.length > announcementsVisibleLimit) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => {
                announcementsVisibleLimit += ANNOUNCEMENTS_PAGE_SIZE;
                renderAnnouncementsFullList();
            };
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}
