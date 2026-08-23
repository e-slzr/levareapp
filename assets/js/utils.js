/* ==========================================================================
   WorshipApp — UTILITIES & COMMON HELPERS
   ========================================================================== */

function canEdit() {
    const user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : getData('currentUser');
    if (!user) return false;
    return user.account_type === 'superadmin' || user.account_type === 'leader';
}

// Get the user's role string inside a specific group
function getUserRoleInGroup(userId, groupId) {
    const currentUser = getData('currentUser');
    if (currentUser && currentUser.account_type === 'superadmin') return 'Super Admin';

    const userGroups = getData('userGroups') || [];
    const activeGroup = userGroups.find(g => g.id == groupId);
    if (activeGroup && activeGroup.role) {
        return activeGroup.role;
    }

    if (currentUser && currentUser.account_type === 'leader') return 'Líder de Banda';
    return 'Miembro';
}


// Get initials from user's name
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Format date to local Spanish string
function formatDate(dateStr, short = false) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const options = short
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Generate random color from string (for colored avatars)
function getAvatarBgColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', // Purple-Pink
        'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', // Blue-Cyan
        'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Green
        'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Orange-Yellow
        'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', // Red
        'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'  // Indigo
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Toast Notifications Helper
function showToast(message, type = 'success') {
    // Check if container exists, if not create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.maxWidth = '320px';
        container.style.width = '100%';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Simple inline styles to ensure toast visuals match design
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.display = 'flex';
    toast.style.justifyContent = 'between';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'space-between';
    toast.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    } else if (type === 'danger') {
        toast.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'; // primary
    }

    toast.innerHTML = `
        <span style="flex:1; padding-right:8px;">${message}</span>
        <button style="color:inherit; font-size:1.2rem; background:none; border:none; cursor:pointer; font-weight:bold;">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
        toast.remove();
    });

    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Global Event Types Constant
const EVENT_TYPES = [
    { value: 'ensayo', label: 'Ensayo', badge: 'badge-primary' },
    { value: 'concierto', label: 'Concierto / Show', badge: 'badge-success' },
    { value: 'culto', label: 'Culto / Servicio', badge: 'badge-info' },
    { value: 'especial', label: 'Evento Especial', badge: 'badge-warning' },
    { value: 'otro', label: 'Otro', badge: 'badge-danger' }
];

// Helper to switch system theme accent color
function applyAccentColor(accentName) {
    const accents = ['accent-purple', 'accent-green', 'accent-yellow', 'accent-aqua', 'accent-red', 'accent-white'];
    accents.forEach(acc => document.body.classList.remove(acc));

    const activeAccent = accentName ? `accent-${accentName}` : 'accent-purple';
    document.body.classList.add(activeAccent);
}

// Get current local date in YYYY-MM-DD format
function getLocalDateString() {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get notification icon & styling by announcement content/type
function getAnnouncementIconConfig(announcement) {
    const type = String(announcement.type || '').toLowerCase();
    const meta = announcement.meta || {};
    const category = String(meta.category || '').toLowerCase();
    const text = String(announcement.text || '').toLowerCase();

    // 0. Anuncios y Comunicados Globales del Sistema (Superadmin)
    if (type === 'system_update' || category === 'system_update') {
        return {
            iconHtml: `<i class="fa-solid fa-rocket text-sm"></i>`,
            badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60',
            chipClass: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
            notifTypeClass: 'indigo',
            categoryLabel: 'Actualización',
            isGlobal: true
        };
    }

    if (type === 'system_announcement' || category === 'system_announcement') {
        return {
            iconHtml: `<i class="fa-solid fa-bullhorn text-sm"></i>`,
            badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60',
            chipClass: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
            notifTypeClass: 'amber',
            categoryLabel: 'Comunicado',
            isGlobal: true
        };
    }

    if (type === 'system_event' || category === 'system_event') {
        return {
            iconHtml: `<i class="fa-solid fa-calendar-check text-sm"></i>`,
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60',
            chipClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
            notifTypeClass: 'emerald',
            categoryLabel: 'Evento / Invitación',
            isGlobal: true
        };
    }

    // 1. Likes en la Comunidad -> Icono de corazón
    if (meta.source === 'community' || text.includes('gustado') || text.includes('like') || text.includes('comunidad') || text.includes('corazón') || text.includes('corazon')) {
        return {
            iconHtml: `<i class="fa-solid fa-heart text-sm"></i>`,
            badgeClass: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/50',
            chipClass: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/60',
            notifTypeClass: 'pink',
            categoryLabel: 'Comunidad',
            isGlobal: false
        };
    }

    // 2. Sugerencia de canción -> Icono de audífonos / auriculares
    if (text.includes('sugiri') || text.includes('sugerencia') || text.includes('propuso')) {
        return {
            iconHtml: `<i class="fa-solid fa-headphones text-sm"></i>`,
            badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
            chipClass: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
            notifTypeClass: 'purple',
            categoryLabel: meta.band_name || 'Banda',
            isGlobal: false
        };
    }

    // 3. Nueva canción -> Icono de nota musical
    if (text.includes('canción') || text.includes('cancion') || text.includes('añadió') || text.includes('anadió')) {
        return {
            iconHtml: `<i class="fa-solid fa-music text-sm"></i>`,
            badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
            chipClass: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
            notifTypeClass: 'blue',
            categoryLabel: meta.band_name || 'Banda',
            isGlobal: false
        };
    }

    // 4. Repertorio -> Icono de lista de verificación (setlist)
    if (text.includes('repertorio') || text.includes('setlist')) {
        return {
            iconHtml: `<i class="fa-solid fa-list-check text-sm"></i>`,
            badgeClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50',
            chipClass: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/60',
            notifTypeClass: 'green',
            categoryLabel: meta.band_name || 'Banda',
            isGlobal: false
        };
    }

    // 5. Eventos -> Icono de calendario
    if (text.includes('evento') || text.includes('programó') || text.includes('programo') || text.includes('culto') || text.includes('ensayo') || text.includes('concierto')) {
        return {
            iconHtml: `<i class="fa-solid fa-calendar-days text-sm"></i>`,
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
            chipClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
            notifTypeClass: 'green',
            categoryLabel: meta.band_name || 'Banda',
            isGlobal: false
        };
    }

    // Fallbacks por propiedad type
    if (announcement.type === 'pink') {
        return {
            iconHtml: `<i class="fa-solid fa-heart text-sm"></i>`,
            badgeClass: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/50',
            chipClass: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/60',
            notifTypeClass: 'pink',
            categoryLabel: 'Comunidad',
            isGlobal: false
        };
    } else if (announcement.type === 'purple') {
        return {
            iconHtml: `<i class="fa-solid fa-headphones text-sm"></i>`,
            badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
            chipClass: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
            notifTypeClass: 'purple',
            categoryLabel: 'Banda',
            isGlobal: false
        };
    } else if (announcement.type === 'green') {
        return {
            iconHtml: `<i class="fa-solid fa-calendar-days text-sm"></i>`,
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
            chipClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
            notifTypeClass: 'green',
            categoryLabel: 'Banda',
            isGlobal: false
        };
    }

    return {
        iconHtml: `<i class="fa-solid fa-music text-sm"></i>`,
        badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
        chipClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
        notifTypeClass: 'blue',
        categoryLabel: 'Banda',
        isGlobal: false
    };
}

// Modal helper: Open Announcement Details Modal
function openAnnouncementDetailModal(announcement) {
    const modal = document.getElementById('modal-announcement-detail');
    if (!modal) return;

    const meta = announcement.meta || {};
    const iconConfig = getAnnouncementIconConfig(announcement);

    // Title
    const titleElem = document.getElementById('announcement-detail-title');
    const titleText = meta.title || announcement.text || 'Novedad';
    if (titleElem) titleElem.textContent = titleText;

    // Badge & Category
    const badgeContainer = document.getElementById('announcement-detail-badge-container');
    const categoryLabel = iconConfig.categoryLabel || 'Sistema';
    if (badgeContainer) {
        badgeContainer.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl ${iconConfig.badgeClass} flex items-center justify-center flex-shrink-0">
                    ${iconConfig.iconHtml}
                </div>
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${iconConfig.chipClass || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'} uppercase tracking-wider">
                    ${categoryLabel}
                </span>
            </div>
        `;
    }

    // Date & Time
    const dateElem = document.getElementById('announcement-detail-date');
    if (dateElem && announcement.created_at) {
        const d = new Date(announcement.created_at);
        const formattedDate = d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs';
        dateElem.textContent = `${formattedDate} • ${formattedTime}`;
    } else if (dateElem) {
        dateElem.textContent = '';
    }

    // Image container
    const imgContainer = document.getElementById('announcement-detail-image-container');
    const imgElem = document.getElementById('announcement-detail-image');
    const imageUrl = meta.image_url;

    if (imgContainer && imgElem) {
        if (imageUrl) {
            let fullImgUrl = imageUrl;
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                fullImgUrl = 'storage/' + imageUrl.replace(/^storage\//, '');
            }
            imgElem.src = fullImgUrl;
            imgContainer.classList.remove('hidden');
        } else {
            imgElem.src = '';
            imgContainer.classList.add('hidden');
        }
    }

    // Content text
    const contentElem = document.getElementById('announcement-detail-content');
    const rawContent = meta.content || announcement.text || '';
    if (contentElem) {
        // Render paragraphs cleanly while escaping HTML
        const safeText = document.createElement('div');
        safeText.textContent = rawContent;
        const paragraphs = safeText.innerHTML
            .split('\n')
            .filter(p => p.trim().length > 0)
            .map(p => `<p class="leading-relaxed">${p}</p>`)
            .join('');
        contentElem.innerHTML = paragraphs || `<p class="leading-relaxed">${safeText.innerHTML}</p>`;
    }

    // Author Footer visibility
    const footerElem = document.getElementById('announcement-detail-footer');
    const authorElem = document.getElementById('announcement-detail-author');

    const isPushTest = (announcement.type === 'push_test' || meta.type === 'push_test' || (typeof titleText === 'string' && titleText.toLowerCase().includes('notificación push')));
    const isGlobal = iconConfig.isGlobal || Boolean(meta.author_name) || meta.is_global || announcement.is_global;

    if (footerElem) {
        if (isGlobal || isPushTest) {
            const authorName = meta.author_name || (isPushTest ? 'Levare' : 'Eliú Salazar | Desarrollador');
            if (authorElem) authorElem.textContent = authorName;
            footerElem.classList.remove('hidden');
        } else {
            // Hide footer completely for automatic band activity notifications (added songs, setlists, events, etc.)
            footerElem.classList.add('hidden');
        }
    }


    modal.classList.remove('hidden');
}

function closeAnnouncementDetailModal() {
    const modal = document.getElementById('modal-announcement-detail');
    if (modal) modal.classList.add('hidden');
}

// Lightbox modal controls
function openImageLightbox(src) {
    if (!src) return;
    const lightbox = document.getElementById('modal-image-lightbox');
    const img = document.getElementById('lightbox-image-src');
    if (lightbox && img) {
        img.src = src;
        lightbox.classList.remove('hidden');
    }
}

function closeImageLightbox() {
    const lightbox = document.getElementById('modal-image-lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
    }
}





