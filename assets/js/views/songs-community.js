/**
 * ==============================================================================
 * Levare — Songs Community Catalog Module (songs-community.js)
 * ==============================================================================
 * @fileoverview Controla la exploración e interacción del Catálogo Comunitario:
 * - Carga y paginación asíncrona de canciones públicas (`/songs/community`).
 * - Búsqueda con debounce y ordenamiento por popularidad, fecha y alfabético.
 * - Modal de vista previa con renderizado dinámico de acordes.
 * - Sistema de votación (Likes) en tiempo real.
 * - Importación de canciones comunitarias a la banda activa.
 * ==============================================================================
 */

// Estado y Paginación del Catálogo Comunitario
let communitySongs = [];
let communitySearchQuery = "";
let communitySort = "popular"; // 'popular', 'recent', 'alpha'
let currentCommunityViewingSong = null;
let commCurrentPage = 1;
const COMM_PAGE_SIZE = 12;
let commHasMore = false;
let commIsLoading = false;
let commSearchDebounceTimer = null;

/**
 * Abre el subpanel de exploración de la comunidad y sincroniza la URL (#community).
 */
function openCommunityCatalogView() {
    if (window.location.hash !== '#community' && window.location.hash !== '#songs-community') {
        window.location.hash = '#community';
    }
    document.getElementById('modal-song-choose-type')?.classList.add('hidden');
    document.getElementById('subpanel-songs-list')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-community-catalog')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Comunidad';

    loadCommunitySongs();
}
window.openCommunityCatalogView = openCommunityCatalogView;

/**
 * Regresa de la vista de la comunidad a la lista propia de canciones de la banda.
 */
function exitCommunityCatalogView() {
    window.location.hash = '#songs';
    document.getElementById('subpanel-community-catalog')?.classList.add('hidden');
    document.getElementById('subpanel-song-detail')?.classList.add('hidden');
    document.getElementById('subpanel-song-wizard')?.classList.add('hidden');
    document.getElementById('subpanel-songs-list')?.classList.remove('hidden');

    const pageTitleElem = document.getElementById('current-page-title');
    if (pageTitleElem) pageTitleElem.textContent = 'Canciones';

    if (typeof renderSongsCatalog === 'function') {
        renderSongsCatalog(true);
    }
}
window.exitCommunityCatalogView = exitCommunityCatalogView;

/**
 * Manejador de búsqueda en tiempo real en la comunidad con debounce de 300ms.
 * @param {Event} e
 */
function handleCommunitySearch(e) {
    communitySearchQuery = e.target.value;
    commCurrentPage = 1;
    if (commSearchDebounceTimer) clearTimeout(commSearchDebounceTimer);
    commSearchDebounceTimer = setTimeout(() => {
        loadCommunitySongs(false);
    }, 300);
}
window.handleCommunitySearch = handleCommunitySearch;

/**
 * Aplica un nuevo criterio de ordenamiento a las canciones de la comunidad.
 * @param {'popular'|'recent'|'alpha'} sortType
 */
function handleCommunitySortChange(sortType) {
    communitySort = sortType;
    commCurrentPage = 1;
    document.querySelectorAll('.btn-community-sort').forEach(btn => {
        if (btn.getAttribute('data-sort') === sortType) {
            btn.className = 'btn-community-sort active px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm transition flex items-center gap-1.5 cursor-pointer';
        } else {
            btn.className = 'btn-community-sort px-3 py-1.5 rounded-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 cursor-pointer';
        }
    });
    loadCommunitySongs(false);
}
window.handleCommunitySortChange = handleCommunitySortChange;

/**
 * Consulta las canciones comunitarias desde el servidor con paginación.
 * @param {boolean} [isAppend=false] - Si es true, añade al final en vez de reemplazar.
 */
async function loadCommunitySongs(isAppend = false) {
    const grid = document.getElementById('community-songs-grid');
    const countEl = document.getElementById('community-songs-count');
    const loadMoreContainer = document.getElementById('community-load-more-container');
    const btnLoadMore = document.getElementById('btn-community-load-more');
    if (!grid) return;

    if (!isAppend) {
        commCurrentPage = 1;
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">Explorando canciones de la comunidad...</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
    } else {
        commCurrentPage++;
        if (btnLoadMore) {
            btnLoadMore.disabled = true;
            btnLoadMore.textContent = "Cargando...";
        }
    }

    try {
        const url = `/songs/community?q=${encodeURIComponent(communitySearchQuery)}&sort=${communitySort}&page=${commCurrentPage}&limit=${COMM_PAGE_SIZE}`;
        const data = await apiFetch(url) || [];

        commHasMore = data.length === COMM_PAGE_SIZE;

        if (!isAppend) {
            communitySongs = data;
        } else {
            communitySongs = [...communitySongs, ...data];
        }

        renderCommunityCatalog(isAppend, data);
    } catch (e) {
        console.error("Error al cargar canciones comunitarias:", e);
        if (!isAppend) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-red-500">Error al cargar el catálogo de la comunidad.</div>`;
        } else {
            showToast("Error al cargar más canciones de la comunidad.", "danger");
        }
    } finally {
        if (btnLoadMore) {
            btnLoadMore.disabled = false;
            btnLoadMore.textContent = "Cargar más";
        }
    }
}
window.loadCommunitySongs = loadCommunitySongs;

/**
 * Renderiza las tarjetas del catálogo comunitario en el grid.
 * @param {boolean} [isAppend=false]
 * @param {Array} [newBatch=[]]
 */
function renderCommunityCatalog(isAppend = false, newBatch = []) {
    const grid = document.getElementById('community-songs-grid');
    const countEl = document.getElementById('community-songs-count');
    const loadMoreContainer = document.getElementById('community-load-more-container');
    const btnLoadMore = document.getElementById('btn-community-load-more');
    if (!grid) return;

    if (countEl) {
        countEl.textContent = `${communitySongs.length} ${communitySongs.length === 1 ? 'canción' : 'canciones'}`;
    }

    if (!isAppend) {
        grid.innerHTML = '';
    }

    if (communitySongs.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No se encontraron canciones disponibles en la comunidad con los filtros actuales.</div>`;
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        return;
    }

    const itemsToRender = isAppend ? newBatch : communitySongs;
    const currentUser = getData('currentUser');
    const isSuperadmin = currentUser && currentUser.account_type === 'superadmin';

    itemsToRender.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between gap-3 cursor-pointer group';

        const medleyBadge = s.is_medley ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mr-1.5">Medley</span>` : '';
        const albumText = s.album ? ` • ${s.album}` : '';
        const creatorName = s.creator_name ? `${s.creator_name}${s.creator_lastname ? ' ' + s.creator_lastname : ''}` : 'Usuario Levare';
        const canAdminSong = isSuperadmin || (currentUser && s.created_by == currentUser.id);

        card.innerHTML = `
            <div class="space-y-1">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition truncate">${s.title}</h4>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${medleyBadge}${s.artist || 'Desconocido'}${albumText}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 flex-shrink-0">${s.is_medley ? 'Medley' : (s.key || 'C')}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                    <i class="fa-solid fa-user-pen text-[10px]"></i>
                    <span class="truncate">Agregada por: <strong class="text-zinc-700 dark:text-zinc-300 font-semibold">${creatorName}</strong></span>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <div class="flex items-center gap-1.5">
                    <button type="button" class="btn-community-like-toggle px-2.5 py-1 rounded-xl border ${s.user_has_liked ? 'border-pink-500/30 bg-pink-500/10 text-pink-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-pink-500'} transition flex items-center gap-1.5 cursor-pointer" data-id="${s.id}">
                        <i class="${s.user_has_liked ? 'fa-solid' : 'fa-regular'} fa-heart text-xs"></i>
                        <span class="font-semibold comm-likes-count">${s.likes_count}</span>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    ${canAdminSong ? `
                        <button type="button" class="btn-community-card-edit p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer" data-id="${s.id}" title="Editar canción">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                    ` : ''}
                    <button type="button" class="btn-community-preview px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer" data-id="${s.id}">
                        Ver letra
                    </button>
                    ${s.already_in_group ? `
                        <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                            <i class="fa-solid fa-check text-[10px]"></i> En la banda
                        </span>
                    ` : (canEdit() ? `
                        <button type="button" class="btn-community-import px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-1 cursor-pointer" data-id="${s.id}">
                            <i class="fa-solid fa-plus text-[10px]"></i> Agregar
                        </button>
                    ` : '')}
                </div>
            </div>
        `;

        const btnLike = card.querySelector('.btn-community-like-toggle');
        if (btnLike) {
            btnLike.onclick = (e) => {
                e.stopPropagation();
                toggleCommunitySongLike(s.id);
            };
        }

        const btnCardEdit = card.querySelector('.btn-community-card-edit');
        if (btnCardEdit) {
            btnCardEdit.onclick = (e) => {
                e.stopPropagation();
                if (typeof openEditSongModal === 'function') {
                    openEditSongModal(s.id);
                }
            };
        }

        const btnPreview = card.querySelector('.btn-community-preview');
        if (btnPreview) {
            btnPreview.onclick = (e) => {
                e.stopPropagation();
                openCommunitySongPreview(s.id);
            };
        }

        const btnImport = card.querySelector('.btn-community-import');
        if (btnImport) {
            btnImport.onclick = (e) => {
                e.stopPropagation();
                importCommunitySong(s.id);
            };
        }

        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            openCommunitySongPreview(s.id);
        };

        grid.appendChild(card);
    });

    if (loadMoreContainer && btnLoadMore) {
        if (commHasMore) {
            loadMoreContainer.classList.remove('hidden');
            btnLoadMore.onclick = () => loadCommunitySongs(true);
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}
window.renderCommunityCatalog = renderCommunityCatalog;

/**
 * Abre el modal de vista previa detallada de una canción comunitaria.
 * @param {number|string} songId
 */
function openCommunitySongPreview(songId) {
    const song = communitySongs.find(s => s.id == songId);
    if (!song) return;

    currentCommunityViewingSong = song;

    const modal = document.getElementById('modal-community-song-preview');
    if (!modal) return;

    document.getElementById('comm-preview-title').textContent = song.title;
    
    const keyBadge = document.getElementById('comm-preview-key-badge');
    const medleyBadge = document.getElementById('comm-preview-medley-badge');
    if (keyBadge) keyBadge.textContent = song.is_medley ? 'Medley' : (song.key || 'C');
    if (medleyBadge) {
        if (song.is_medley) medleyBadge.classList.remove('hidden');
        else medleyBadge.classList.add('hidden');
    }

    const artistAlbumEl = document.getElementById('comm-preview-artist-album');
    if (artistAlbumEl) {
        const albumText = song.album ? ` • ${song.album}` : '';
        artistAlbumEl.textContent = `${song.artist || 'Desconocido'}${albumText}`;
    }

    const creatorNameEl = document.getElementById('comm-preview-creator-name');
    if (creatorNameEl) {
        const creator = song.creator_name ? `${song.creator_name}${song.creator_lastname ? ' ' + song.creator_lastname : ''}` : 'Usuario Levare';
        creatorNameEl.textContent = creator;
    }

    updateCommunityModalLikeUI(song.user_has_liked, song.likes_count);

    const currentUser = getData('currentUser');
    const adminActions = document.getElementById('comm-preview-admin-actions');
    const btnEdit = document.getElementById('btn-comm-preview-edit');
    const btnDelete = document.getElementById('btn-comm-preview-delete');
    const canAdminSong = currentUser && (currentUser.account_type === 'superadmin' || song.created_by == currentUser.id);

    if (adminActions) {
        if (canAdminSong) {
            adminActions.classList.remove('hidden');
            if (btnEdit) {
                btnEdit.onclick = () => {
                    modal.classList.add('hidden');
                    if (typeof openEditSongModal === 'function') openEditSongModal(song.id);
                };
            }
            if (btnDelete) {
                btnDelete.onclick = () => {
                    modal.classList.add('hidden');
                    if (typeof handleDeleteSong === 'function') handleDeleteSong(song.id, song.title);
                };
            }
        } else {
            adminActions.classList.add('hidden');
        }
    }

    updateCommunityModalImportUI(song.already_in_group);

    const chordsContent = document.getElementById('comm-preview-chords-content');
    if (chordsContent) {
        chordsContent.innerHTML = parseChordsToHTML(song.content || '', 0);
    }

    const urlWrapper = document.getElementById('comm-preview-url-wrapper');
    const urlLink = document.getElementById('comm-preview-url-link');
    if (urlWrapper && urlLink) {
        if (song.url && song.url.trim().length > 0) {
            urlLink.href = song.url.trim();
            urlWrapper.classList.remove('hidden');
        } else {
            urlWrapper.classList.add('hidden');
        }
    }

    modal.classList.remove('hidden');
}
window.openCommunitySongPreview = openCommunitySongPreview;

/**
 * Actualiza la UI del botón de Like en el modal de vista previa comunitaria.
 */
function updateCommunityModalLikeUI(hasLiked, count) {
    const likeIcon = document.getElementById('comm-preview-like-icon');
    const likeCount = document.getElementById('comm-preview-likes-count');

    if (likeCount) likeCount.textContent = count || 0;
    if (likeIcon) {
        if (hasLiked) {
            likeIcon.className = 'fa-solid fa-heart text-red-500 text-sm';
        } else {
            likeIcon.className = 'fa-regular fa-heart text-zinc-400 text-sm';
        }
    }
}

/**
 * Actualiza la UI del botón de Importar en el modal de vista previa comunitaria.
 */
function updateCommunityModalImportUI(alreadyInGroup) {
    const container = document.getElementById('comm-preview-import-container');
    if (!container) return;

    if (alreadyInGroup) {
        container.innerHTML = `
            <span class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <i class="fa-solid fa-check text-xs"></i>
                <span>En tu repertorio</span>
            </span>
        `;
    } else if (canEdit()) {
        container.innerHTML = `
            <button type="button" id="btn-comm-preview-import" class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Agregar a mi Repertorio</span>
            </button>
        `;
        const btnImport = document.getElementById('btn-comm-preview-import');
        if (btnImport && currentCommunityViewingSong) {
            btnImport.onclick = () => importCommunitySong(currentCommunityViewingSong.id);
        }
    } else {
        container.innerHTML = '';
    }
}

/**
 * Alterna el voto (Like) en una canción comunitaria.
 * @param {number|string} songId
 */
async function toggleCommunitySongLike(songId) {
    try {
        const res = await apiFetch(`/songs/${songId}/like`, { method: 'POST' });
        
        const song = communitySongs.find(s => s.id == songId);
        if (song) {
            song.user_has_liked = res.liked;
            song.likes_count = res.likes_count;
        }

        if (currentCommunityViewingSong && currentCommunityViewingSong.id == songId) {
            currentCommunityViewingSong.user_has_liked = res.liked;
            currentCommunityViewingSong.likes_count = res.likes_count;
            updateCommunityModalLikeUI(res.liked, res.likes_count);
        }

        renderCommunityCatalog();
    } catch (e) {
        showToast(e.message || "Error al registrar el voto", "danger");
    }
}
window.toggleCommunitySongLike = toggleCommunitySongLike;

/**
 * Importa una canción comunitaria al catálogo propio de la banda activa.
 * @param {number|string} songId
 */
async function importCommunitySong(songId) {
    try {
        await apiFetch(`/songs/${songId}/import`, { method: 'POST' });
        showToast("Canción agregada al catálogo de tu banda con éxito");

        const song = communitySongs.find(s => s.id == songId);
        if (song) {
            song.already_in_group = true;
        }

        if (currentCommunityViewingSong && currentCommunityViewingSong.id == songId) {
            currentCommunityViewingSong.already_in_group = true;
            updateCommunityModalImportUI(true);
        }

        // Invalidar caché del catálogo propio
        if (typeof cachedSongs !== 'undefined') {
            cachedSongs = [];
        }

        renderCommunityCatalog();
    } catch (e) {
        showToast(e.message || "Error al agregar canción", "danger");
    }
}
window.importCommunitySong = importCommunitySong;
