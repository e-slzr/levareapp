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
    const text = String(announcement.text || '').toLowerCase();
    const meta = announcement.meta || {};

    // 1. Likes en la Comunidad -> Icono de corazón
    if (meta.source === 'community' || text.includes('gustado') || text.includes('like') || text.includes('comunidad') || text.includes('corazón') || text.includes('corazon')) {
        return {
            iconHtml: `<i class="fa-solid fa-heart text-sm"></i>`,
            badgeClass: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/50',
            notifTypeClass: 'pink',
            categoryLabel: 'Comunidad'
        };
    }

    // 2. Sugerencia de canción -> Icono de audífonos / auriculares
    if (text.includes('sugiri') || text.includes('sugerencia') || text.includes('propuso')) {
        return {
            iconHtml: `<i class="fa-solid fa-headphones text-sm"></i>`,
            badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
            notifTypeClass: 'purple',
            categoryLabel: meta.band_name || 'Banda'
        };
    }

    // 3. Nueva canción -> Icono de nota musical
    if (text.includes('canción') || text.includes('cancion') || text.includes('añadió') || text.includes('anadió')) {
        return {
            iconHtml: `<i class="fa-solid fa-music text-sm"></i>`,
            badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
            notifTypeClass: 'blue',
            categoryLabel: meta.band_name || 'Banda'
        };
    }

    // 4. Repertorio -> Icono de lista de verificación (setlist)
    if (text.includes('repertorio') || text.includes('setlist')) {
        return {
            iconHtml: `<i class="fa-solid fa-list-check text-sm"></i>`,
            badgeClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50',
            notifTypeClass: 'green',
            categoryLabel: meta.band_name || 'Banda'
        };
    }

    // 5. Eventos -> Icono de calendario
    if (text.includes('evento') || text.includes('programó') || text.includes('programo') || text.includes('culto') || text.includes('ensayo') || text.includes('concierto')) {
        return {
            iconHtml: `<i class="fa-solid fa-calendar-days text-sm"></i>`,
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
            notifTypeClass: 'green',
            categoryLabel: meta.band_name || 'Banda'
        };
    }

    // Fallbacks por propiedad type
    if (announcement.type === 'pink') {
        return {
            iconHtml: `<i class="fa-solid fa-heart text-sm"></i>`,
            badgeClass: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/50',
            notifTypeClass: 'pink',
            categoryLabel: 'Comunidad'
        };
    } else if (announcement.type === 'purple') {
        return {
            iconHtml: `<i class="fa-solid fa-headphones text-sm"></i>`,
            badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
            notifTypeClass: 'purple',
            categoryLabel: 'Banda'
        };
    } else if (announcement.type === 'green') {
        return {
            iconHtml: `<i class="fa-solid fa-calendar-days text-sm"></i>`,
            badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
            notifTypeClass: 'green',
            categoryLabel: 'Banda'
        };
    }

    return {
        iconHtml: `<i class="fa-solid fa-music text-sm"></i>`,
        badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
        notifTypeClass: 'blue',
        categoryLabel: 'Banda'
    };
}



