/* ==========================================================================
   STATE MANAGEMENT & SEED DATA (localStorage)
   ========================================================================== */

const DEFAULTS = {
    users: [
        { id: 1, email: "lider@adoraflow.com", name: "Carlos Mendoza", role: "Director Musical" },
        { id: 2, email: "sofia@adoraflow.com", name: "Sofía Martínez", role: "Voz Principal" },
        { id: 3, email: "mateo@adoraflow.com", name: "Mateo Silva", role: "Guitarra Acústica" },
        { id: 4, email: "daniel@adoraflow.com", name: "Daniel Castro", role: "Bajo" },
        { id: 5, email: "lucas@adoraflow.com", name: "Lucas Duarte", role: "Batería" },
        { id: 6, email: "ana@adoraflow.com", name: "Ana Gómez", role: "Coros" }
    ],
    songs: [
        {
            id: 1,
            title: "La Bondad de Dios",
            artist: "Bethel Music",
            key: "G",
            url: "https://www.youtube.com/watch?v=kcn4j7v5nU0",
            content: `[Intro]
[G]  [C]  [G]  [C]

[Verso 1]
Te amo Di[G]os, tu amor no [C]me ha fa[G]llado
En tus ma[D]nos [Em]yo he es[C]tado de pr[D]incipio a fin
Cant[Em]aré de la bo[C]ndad de Di[G]os [D/F#]   [Em]
Con mi vi[C]da y mi vo[D]z, te alab[G]aré

[Coro]
[C]Fiel has sido T[G]ú, [C]fiel has sido T[G]ú  [D]
Muy bu[C]eno has si[G]do, mi Se[D/F#]ñor  [Em]   [D]
Cant[C]aré de la bo[D]ndad de D[G]ios

[Verso 2]
Amo tu vo[G]z, me has gu[C]iado en el f[G]uego
En la oscuri[D]dad, [Em]tú has si[C]do mi com[D]pañero fiel
Te co[Em]nozco co[C]mo mi pa[G]dre y mi a[D/F#]migo   [Em]
He vivi[C]do en la bo[D]ndad de Di[G]os

[Puente]
[D/F#]Tu amor me s[C]igue, tu amor me s[G]igue, Señor  [D]
[D/F#]Tu amor me s[C]igue, tu amor me s[G]igue, Señor  [D]
Rendi[Em]do ante ti, [C]te entrego todo a [G]ti  [D]
[D/F#]Tu amor me s[C]igue, tu amor me s[G]igue, Señor`
        },
        {
            id: 2,
            title: "Way Maker (Creador de Caminos)",
            artist: "Sinach / Leeland",
            key: "C",
            url: "https://www.youtube.com/watch?v=iJCV_2H9xD0",
            content: `[Intro]
[F]  [C]  [G]  [Am]

[Verso 1]
[F]Aquí estás, te vemos o[C]perar
Te adora[G]ré, te adora[Am]ré
[F]Aquí estás, tocando mi co[C]razón
Te adora[G]ré, te adora[Am]ré

[Coro]
Milag[F]roso, abres camino, cumples pr[C]omesas
Luz en tin[G]ieblas, mi Dios, así e[Am]res Tú
Milag[F]roso, abres camino, cumples pr[C]omesas
Luz en tin[G]ieblas, mi Dios, así e[Am]res Tú

[Verso 2]
[F]Aquí estás, sanando mi do[C]lor
Te adora[G]ré, te adora[Am]ré
[F]Aquí estás, restaurando mi vi[C]da
Te adora[G]ré, te adora[Am]ré

[Puente]
A[F]sí eres Tú, aunque no pueda ver, estás o[C]perando
Aunque no pueda sentir, estás o[G]perando
Siempre estás, siempre estás o[Am]perando`
        },
        {
            id: 3,
            title: "Hermoso Nombre",
            artist: "Hillsong Worship",
            key: "D",
            url: "https://www.youtube.com/watch?v=Fj7n0Z0a6L0",
            content: `[Intro]
[D]  [G]  [Bm]  [A]

[Verso 1]
Tú el ve[D]rbo en el pr[G]incipio fu[Bm]iste, el al[A]tísimo Se[D]ñor
Tu mi[Bm]sterio en la cr[A]eación se re[D/F#]veló en t[G]u gran a[Bm]mor  [A]

[Coro]
Qué herm[D]oso nombre es, qué herm[A]oso nombre es
El no[Bm]mbre de Je[A]sús mi R[G]ey
Qué herm[D/F#]oso nombre es, na[A]da se iguala a Él
Qué herm[Bm]oso nombre es, el no[A]mbre de Je[G]sús

[Verso 2]
No me qu[D]isiste en mi p[G]ecado, por e[Bm]so a la ti[A]erra ba[D]jaste
Tu gr[Bm]acia en m[A]i se derra[D/F#]mó, la d[G]istancia can[Bm]celas[A]te

[Puente]
La mu[G]erte venciste, el v[A]elo rompiste
La t[Bm]umba vacía a[F#m]hora está
Los ci[G]elos te adoran, tu gl[A]oria proclaman
Pues res[Bm]ucitaste en ma[A]jestad`
        },
        {
            id: 4,
            title: "Cuerdas de Amor",
            artist: "Julio Melgar",
            key: "F",
            url: "https://www.youtube.com/watch?v=yYyM19jH9xM",
            content: `[Verso 1]
Au[F]nque pase el ti[C]empo sé que cu[Dm]mplirás
Tu pa[Bb]labra que me d[F]iste
[F]En ti confia[C]ré, no me de[Dm]jarás
Mi so[Bb]stén está en t[F]i

[Coro]
[F]Tu mano me sost[C]iene, tu a[Dm]mor me ha rode[Bb]ado
Y tu ca[F]ntas sobre m[C]i
[F]Tu mano me sost[C]iene, tu a[Dm]mor me ha rode[Bb]ado
Tus cue[F]rdas de a[C]mor cayeron sobre m[Dm]i  [Bb]

[Puente]
Es[F]cucho tu vo[C]z que me dice
Que me a[Dm]mas y me di[Bb]ce:
Que en ti e[F]stoy se[C]guro, seguro e[Dm]stoy  [Bb]`
        }
    ],
    setlists: [
        {
            id: 1,
            name: "Culto de Jóvenes - Avivamiento",
            date: "2026-06-27",
            description: "Ensayo a las 5pm antes del culto",
            songs: [2, 3]
        },
        {
            id: 2,
            name: "Domingo de Adoración",
            date: "2026-06-28",
            description: "Servicio general dominical",
            songs: [1, 4]
        }
    ],
    events: [
        {
            id: 1,
            name: "Ensayo General",
            type: "ensayo",
            date: "2026-06-27",
            time: "18:00",
            description: "Preparación para el culto de jóvenes",
            setlistId: 1,
            roster: {
                "Director Musical": 1,
                "Voz Principal": 2,
                "Guitarra Acústica": 3,
                "Bajo": 4
            }
        },
        {
            id: 2,
            name: "Servicio Dominical",
            type: "culto",
            date: "2026-06-28",
            time: "09:00",
            description: "Servicio general dominical mañana",
            setlistId: 2,
            roster: {
                "Director Musical": 1,
                "Voz Principal": 2,
                "Coros": 6,
                "Guitarra Acústica": 3,
                "Bajo": 4,
                "Batería": 5
            }
        }
    ],
    suggestions: [
        {
            id: 1,
            title: "Digno es el Cordero",
            artist: "Marco Barrientos",
            notes: "Clásico para cantar en el momento de comunión.",
            suggestedBy: "Ana Gómez",
            votes: 4,
            voters: [1, 2, 5, 6],
            status: "pendiente"
        },
        {
            id: 2,
            title: "A una Voz",
            artist: "Elevation Worship",
            notes: "Alabanza muy alegre, excelente para la apertura de cultos.",
            suggestedBy: "Mateo Silva",
            votes: 2,
            voters: [3, 4],
            status: "ensayo"
        }
    ],
    announcements: [
        { id: 1, text: "Nuevo ensayo general programado para este sábado a las 6:00 PM.", time: "Hace 2 horas", type: "purple" },
        { id: 2, text: "Se añadieron sugerencias musicales del mes. ¡Entra a votar por tus favoritas!", time: "Hace 1 día", type: "blue" },
        { id: 3, text: "Sofía Martínez sugirió cantar 'Digno es el Cordero' para la comunión.", time: "Hace 2 días", type: "green" }
    ],
    currentUser: null
};

// Database Initialization Helper
function initDatabase() {
    for (let key in DEFAULTS) {
        if (localStorage.getItem(`adora_${key}`) === null) {
            localStorage.setItem(`adora_${key}`, JSON.stringify(DEFAULTS[key]));
        }
    }
}
initDatabase();

// Getters and Setters
function getData(key) {
    return JSON.parse(localStorage.getItem(`adora_${key}`));
}
function setData(key, data) {
    localStorage.setItem(`adora_${key}`, JSON.stringify(data));
}

// Current User State
let currentUser = getData('currentUser');

/* ==========================================================================
   MUSICAL CHORD TRANSPOSER ENGINE
   ========================================================================== */

const SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'F#': 'F#', 'C#': 'C#' };

function transposeChord(chord, semitones) {
    if (semitones === 0) return chord;
    
    // Slash Chord handling (e.g., G/B or D/F#)
    if (chord.includes('/')) {
        return chord.split('/').map(part => transposeSingleChord(part, semitones)).join('/');
    }
    return transposeSingleChord(chord, semitones);
}

function transposeSingleChord(chord, semitones) {
    // Regex matching root notes (A-G with flats/sharps)
    // Group 1: Root Note, Group 2: The rest of the chord suffix (m7, maj7, add9, etc.)
    const chordRegex = /^([A-G][#b]?)(.*)$/;
    const match = chord.match(chordRegex);
    
    if (!match) return chord; // fallback if not matchable
    
    let root = match[1];
    const suffix = match[2];
    
    // Normalize flats to sharps
    if (FLATS[root]) {
        root = FLATS[root];
    } else if (root.endsWith('b')) {
        // Handle generic flats by going back a step in scale
        const letter = root.charAt(0);
        let index = SCALE.indexOf(letter);
        if (index !== -1) {
            index = (index - 1 + 12) % 12;
            root = SCALE[index];
        }
    }
    
    let index = SCALE.indexOf(root);
    if (index === -1) return chord;
    
    // Transpose
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return SCALE[newIndex] + suffix;
}

// Parses brackets [C] and returns HTML with styled chords inline
function parseChordsToHTML(text, semitones = 0) {
    return text.replace(/\[([^\]]+)\]/g, (match, chord) => {
        const transposed = transposeChord(chord, semitones);
        return `<span class="chord-line">${transposed}</span>`;
    });
}

/* ==========================================================================
   APP ROUTING & LAYOUT VIEWS
   ========================================================================== */

function navigateTo(viewId) {
    const views = document.querySelectorAll('.content-view');
    views.forEach(v => v.classList.add('hidden'));
    
    const target = document.getElementById(`panel-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
    }
    
    // Close mobile "More" menu if open
    document.getElementById('mobile-more-menu').classList.add('hidden');
    
    // Update navigation items active classes
    const navItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-view') === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Top Header Title
    const titles = {
        'dashboard': 'Panel Inicial',
        'songs': 'Catálogo de Alabanzas',
        'song-detail': 'Letra y Acordes',
        'setlists': 'Listas de Repertorios',
        'events': 'Programación de Eventos',
        'suggestions': 'Caja de Sugerencias',
        'team': 'Equipo & Simulador'
    };
    
    document.getElementById('current-page-title').textContent = titles[viewId] || 'AdoraFlow';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render logic per view
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'songs') renderSongsCatalog();
    if (viewId === 'setlists') renderSetlists();
    if (viewId === 'events') renderEvents();
    if (viewId === 'suggestions') renderSuggestions();
    if (viewId === 'team') renderTeam();
}

function updateShellVisibility() {
    const auth = document.getElementById('auth-container');
    const main = document.getElementById('main-container');
    
    if (currentUser) {
        auth.classList.add('hidden');
        main.classList.remove('hidden');
        
        // Update user elements
        document.getElementById('sidebar-user-name').textContent = currentUser.name;
        document.getElementById('sidebar-user-role').textContent = currentUser.role;
        document.getElementById('sidebar-avatar').textContent = getInitials(currentUser.name);
        
        // Render starting panel
        navigateTo('dashboard');
    } else {
        auth.classList.remove('hidden');
        main.classList.add('hidden');
        document.getElementById('view-login').classList.remove('hidden');
        document.getElementById('view-register').classList.add('hidden');
    }
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button style="color:inherit; font-size:1.1rem; margin-left:12px;">&times;</button>
    `;
    
    toast.querySelector('button').addEventListener('click', () => {
        toast.remove();
    });
    
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   AUTHENTICATION LÓGICA (SIMULATED)
   ========================================================================== */

document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-register').classList.remove('hidden');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('view-register').classList.add('hidden');
    document.getElementById('view-login').classList.remove('hidden');
});

// Login Form Submit
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const users = getData('users');
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        currentUser = user;
        setData('currentUser', currentUser);
        updateShellVisibility();
        showToast(`¡Bienvenido de nuevo, ${user.name}!`);
    } else {
        // Auto create dummy user for easy prototyping
        const newDummyUser = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0].toUpperCase(),
            role: "Voz Principal"
        };
        users.push(newDummyUser);
        setData('users', users);
        currentUser = newDummyUser;
        setData('currentUser', currentUser);
        updateShellVisibility();
        showToast(`Cuenta de prueba creada para: ${email}`);
    }
});

// Register Form Submit
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const role = document.getElementById('register-role').value;
    
    const users = getData('users');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast("Este correo ya está registrado", "danger");
        return;
    }
    
    const newUser = {
        id: Date.now(),
        email: email,
        name: name,
        role: role
    };
    
    users.push(newUser);
    setData('users', users);
    
    currentUser = newUser;
    setData('currentUser', currentUser);
    updateShellVisibility();
    showToast("¡Registro exitoso y sesión iniciada!");
});

// Logouts
function logout() {
    currentUser = null;
    setData('currentUser', null);
    updateShellVisibility();
    showToast("Sesión cerrada");
}
document.getElementById('logout-btn-sidebar').addEventListener('click', logout);
document.getElementById('logout-btn-mobile').addEventListener('click', logout);

/* ==========================================================================
   VIEW RENDERING: DASHBOARD
   ========================================================================== */
function renderDashboard() {
    // Welcome title
    document.getElementById('welcome-message').textContent = `¡Hola, ${currentUser.name}!`;
    document.getElementById('welcome-subtext').textContent = `Tu rol principal: ${currentUser.role}`;
    
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dashboard-date').textContent = new Date().toLocaleDateString('es-ES', options);

    // Announcements
    const listContainer = document.getElementById('announcements-list');
    const announcements = getData('announcements') || [];
    listContainer.innerHTML = '';
    
    announcements.forEach(a => {
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
        
        item.innerHTML = `
            <div class="notif-icon ${a.type}">
                ${iconSvg}
            </div>
            <div class="notif-details">
                <p>${a.text}</p>
                <span class="notif-time">${a.time}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });

    // Next Event Widget
    const events = getData('events');
    // Find soonest event (date in future or today)
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = events
        .filter(ev => ev.date >= todayStr)
        .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const nextEventContent = document.getElementById('next-event-content');
    const nextEventBadge = document.getElementById('next-event-badge');

    if (upcomingEvents.length > 0) {
        const ev = upcomingEvents[0];
        nextEventBadge.textContent = ev.type === 'culto' ? 'Culto' : ev.type === 'ensayo' ? 'Ensayo' : 'Especial';
        nextEventBadge.className = `badge ${ev.type === 'culto' ? 'badge-success' : ev.type === 'ensayo' ? 'badge-primary' : 'badge-warning'}`;
        
        // Find if user is in roster
        let rosterRole = "No asignado";
        for (let role in ev.roster) {
            if (ev.roster[role] == currentUser.id) {
                rosterRole = role;
                break;
            }
        }

        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const evDate = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', dateOptions);

        nextEventContent.innerHTML = `
            <h4 id="next-event-name">${ev.name}</h4>
            <div class="event-meta-info">
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>${evDate}</span>
                </div>
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${ev.time} hs</span>
                </div>
            </div>
            <div class="event-roster-quick">
                <h5>Roster: <strong>${rosterRole}</strong></h5>
            </div>
            <div class="card-actions-row">
                <button class="btn btn-outline btn-sm" id="dashboard-view-setlist-btn" data-setlist-id="${ev.setlistId}">Ver Repertorio</button>
                <button class="btn btn-primary btn-sm" id="dashboard-view-event-btn" data-event-id="${ev.id}">Roster Completo</button>
            </div>
        `;

        document.getElementById('dashboard-view-setlist-btn').addEventListener('click', () => {
            viewSetlistDetail(ev.setlistId);
        });

        document.getElementById('dashboard-view-event-btn').addEventListener('click', () => {
            viewEventDetails(ev.id);
        });
    } else {
        nextEventBadge.textContent = 'Ninguno';
        nextEventBadge.className = 'badge badge-danger';
        nextEventContent.innerHTML = `
            <h4>No hay eventos programados</h4>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 20px;">Todo en orden. ¡Disfruta de tu descanso musical!</p>
            <button class="btn btn-primary btn-sm" id="dashboard-schedule-btn">Programar Evento</button>
        `;
        document.getElementById('dashboard-schedule-btn').addEventListener('click', () => {
            navigateTo('events');
            openScheduleEventModal();
        });
    }
}

/* ==========================================================================
   VIEW RENDERING: SONGS CATALOG & VISOR
   ========================================================================== */

let songsSearchQuery = "";

document.getElementById('songs-search-input').addEventListener('input', (e) => {
    songsSearchQuery = e.target.value;
    renderSongsCatalog();
});

function renderSongsCatalog() {
    const list = document.getElementById('songs-catalog-list');
    const songs = getData('songs');
    list.innerHTML = '';

    const query = songsSearchQuery.toLowerCase().trim();
    const filtered = songs.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.artist.toLowerCase().includes(query) || 
        s.key.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">No se encontraron canciones que coincidan con la búsqueda.</div>`;
        return;
    }

    filtered.forEach(s => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-card-info">
                <h4>${s.title}</h4>
                <p>${s.artist}</p>
            </div>
            <div class="song-card-meta">
                <span class="song-key-badge">${s.key}</span>
                <button class="song-action-btn btn-edit-song-trigger" data-id="${s.id}" title="Editar alabanza">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
            </div>
        `;

        // Click card -> detail viewer
        card.addEventListener('click', (e) => {
            if (e.target.closest('.song-action-btn')) return; // edit button clicked
            viewSongDetail(s.id);
        });

        // Click edit button
        card.querySelector('.btn-edit-song-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditSongModal(s.id);
        });

        list.appendChild(card);
    });
}

// Add song modal triggers
document.getElementById('btn-add-song').addEventListener('click', () => {
    document.getElementById('song-modal-title').textContent = "Agregar Nueva Alabanza";
    document.getElementById('song-form-id').value = "";
    document.getElementById('song-form').reset();
    document.getElementById('modal-song').classList.remove('hidden');
});

// Modal Close triggers
document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal-backdrop').classList.add('hidden');
    });
});

// Song Form Submission (Add or Edit)
document.getElementById('song-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('song-form-id').value;
    const title = document.getElementById('song-form-title').value;
    const key = document.getElementById('song-form-key').value;
    const artist = document.getElementById('song-form-artist').value;
    const url = document.getElementById('song-form-url').value;
    const content = document.getElementById('song-form-content').value;

    const songs = getData('songs');
    
    if (id) {
        // Edit existing
        const idx = songs.findIndex(s => s.id == id);
        if (idx !== -1) {
            songs[idx] = { ...songs[idx], title, key, artist, url, content };
            setData('songs', songs);
            showToast("Alabanza actualizada correctamente");
        }
    } else {
        // Add new
        const newSong = {
            id: Date.now(),
            title,
            key,
            artist,
            url,
            content: content || `[Intro]\n[${key}]\n\n[Verso 1]\nEscribe la letra aquí`
        };
        songs.push(newSong);
        setData('songs', songs);
        showToast("Alabanza guardada con éxito");
    }

    document.getElementById('modal-song').classList.add('hidden');
    renderSongsCatalog();
});

function openEditSongModal(songId) {
    const songs = getData('songs');
    const song = songs.find(s => s.id == songId);
    if (!song) return;

    document.getElementById('song-modal-title').textContent = "Editar Alabanza";
    document.getElementById('song-form-id').value = song.id;
    document.getElementById('song-form-title').value = song.title;
    document.getElementById('song-form-key').value = song.key;
    document.getElementById('song-form-artist').value = song.artist;
    document.getElementById('song-form-url').value = song.url || '';
    document.getElementById('song-form-content').value = song.content || '';

    document.getElementById('modal-song').classList.remove('hidden');
}

/* ==========================================================================
   VIEW SONG DETAIL & TRANSPOSE ENGINE IMPLEMENTATION
   ========================================================================== */

let currentViewingSong = null;
let transposeOffset = 0;
let scrollInterval = null;
let isScrolling = false;

function viewSongDetail(songId) {
    const songs = getData('songs');
    const song = songs.find(s => s.id == songId);
    if (!song) return;

    currentViewingSong = song;
    transposeOffset = 0; // reset transpose
    
    // Clear auto-scroll if active
    stopAutoScroll();

    document.getElementById('song-detail-title').textContent = song.title;
    document.getElementById('song-detail-artist').textContent = song.artist;
    document.getElementById('song-detail-original-key').textContent = song.key;
    document.getElementById('song-current-key').textContent = song.key;

    // Render media link
    const mediaWrap = document.getElementById('song-media-links');
    mediaWrap.innerHTML = '';
    if (song.url) {
        mediaWrap.innerHTML = `
            <a href="${song.url}" target="_blank" class="btn btn-outline btn-sm" style="color: var(--secondary); border-color: rgba(6,182,212,0.3);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>Ver Video / Audio</span>
            </a>
        `;
    }

    renderTransposedLyrics();
    navigateTo('song-detail');
}

function renderTransposedLyrics() {
    if (!currentViewingSong) return;
    const lyricsContent = document.getElementById('chords-lyrics-content');
    
    // Parse chords inside brackets using the transposeOffset
    const parsedHTML = parseChordsToHTML(currentViewingSong.content, transposeOffset);
    lyricsContent.innerHTML = parsedHTML;

    // Update Tonality display
    const currentKey = transposeChord(currentViewingSong.key, transposeOffset);
    document.getElementById('song-current-key').textContent = currentKey;
}

// Transpose Buttons
document.getElementById('btn-transpose-up').addEventListener('click', () => {
    transposeOffset = (transposeOffset + 1) % 12;
    renderTransposedLyrics();
});

document.getElementById('btn-transpose-down').addEventListener('click', () => {
    transposeOffset = (transposeOffset - 1 + 12) % 12;
    renderTransposedLyrics();
});

document.getElementById('btn-transpose-reset').addEventListener('click', () => {
    transposeOffset = 0;
    renderTransposedLyrics();
});

// Back navigation
document.getElementById('back-to-songs').addEventListener('click', () => {
    stopAutoScroll();
    navigateTo('songs');
});

// Auto-Scroll Logic
const scrollToggleBtn = document.getElementById('btn-scroll-toggle');
const scrollSpeedSelect = document.getElementById('scroll-speed-select');
const lyricsContainer = document.getElementById('lyrics-container');

scrollToggleBtn.addEventListener('click', () => {
    if (isScrolling) {
        stopAutoScroll();
    } else {
        startAutoScroll();
    }
});

function startAutoScroll() {
    isScrolling = true;
    scrollToggleBtn.textContent = "⏸ Pausar";
    scrollToggleBtn.style.backgroundColor = "var(--primary-soft)";
    scrollToggleBtn.style.color = "var(--primary)";
    
    const speed = parseInt(scrollSpeedSelect.value); // 1, 2, or 3
    let intervalMs = 90;
    if (speed === 2) intervalMs = 60;
    if (speed === 3) intervalMs = 35;

    scrollInterval = setInterval(() => {
        lyricsContainer.scrollTop += 1;
        // Stop automatically if reached bottom
        if (lyricsContainer.scrollTop + lyricsContainer.clientHeight >= lyricsContainer.scrollHeight - 1) {
            stopAutoScroll();
        }
    }, intervalMs);
}

function stopAutoScroll() {
    isScrolling = false;
    if (scrollInterval) clearInterval(scrollInterval);
    scrollToggleBtn.textContent = "▶ Iniciar";
    scrollToggleBtn.style.backgroundColor = "var(--bg-input)";
    scrollToggleBtn.style.color = "var(--text-main)";
}

/* ==========================================================================
   VIEW RENDERING: SETLISTS (REPERTORIOS)
   ========================================================================== */

function renderSetlists() {
    const container = document.getElementById('setlists-container');
    const setlists = getData('setlists');
    const songs = getData('songs');
    container.innerHTML = '';

    if (setlists.length === 0) {
        container.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px; color:var(--text-muted);">No hay repertorios creados aún.</div>`;
        return;
    }

    setlists.forEach(s => {
        const card = document.createElement('div');
        card.className = 'setlist-card';
        
        // Render song items list inside setlist card
        let songItemsHTML = '';
        s.songs.forEach(songId => {
            const song = songs.find(x => x.id === songId);
            if (song) {
                songItemsHTML += `
                    <div class="song-preview-item" data-song-id="${song.id}">
                        <span class="title">${song.title}</span>
                        <span class="key">${song.key}</span>
                    </div>
                `;
            }
        });

        const formattedDate = new Date(s.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });

        card.innerHTML = `
            <div class="setlist-header">
                <h3>${s.name}</h3>
                <span class="setlist-date-badge">${formattedDate}</span>
            </div>
            <p class="setlist-desc">${s.description || 'Sin descripción'}</p>
            <div class="setlist-songs-list-preview">
                <h5>Canciones (${s.songs.length})</h5>
                <div class="songs-preview-list">
                    ${songItemsHTML || '<div style="color:var(--text-muted); font-size:0.8rem;">Sin canciones.</div>'}
                </div>
            </div>
        `;

        // Direct links from setlist card preview to song detailed sheet!
        card.querySelectorAll('.song-preview-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const sId = parseInt(item.getAttribute('data-song-id'));
                viewSongDetail(sId);
            });
        });

        container.appendChild(card);
    });
}

// Create Setlist Modal Setup
document.getElementById('btn-create-setlist').addEventListener('click', () => {
    // Populate songs check list
    const songsSelect = document.getElementById('setlist-form-songs-selection');
    const songs = getData('songs');
    songsSelect.innerHTML = '';

    if (songs.length === 0) {
        songsSelect.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px;">Carga canciones en el catálogo primero.</div>';
    } else {
        songs.forEach(s => {
            const div = document.createElement('label');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="checkbox" name="setlist-songs" value="${s.id}">
                <span><strong>${s.title}</strong> - ${s.artist} (${s.key})</span>
            `;
            songsSelect.appendChild(div);
        });
    }

    // Set default date today
    document.getElementById('setlist-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('setlist-form').reset();
    document.getElementById('modal-setlist').classList.remove('hidden');
});

// Setlist Form Submit
document.getElementById('setlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('setlist-form-name').value;
    const date = document.getElementById('setlist-form-date').value;
    const description = document.getElementById('setlist-form-desc').value;

    const checkedInputs = document.querySelectorAll('input[name="setlist-songs"]:checked');
    const songIds = Array.from(checkedInputs).map(inp => parseInt(inp.value));

    if (songIds.length === 0) {
        showToast("Selecciona al menos una canción", "warning");
        return;
    }

    const setlists = getData('setlists');
    const newSet = {
        id: Date.now(),
        name,
        date,
        description,
        songs: songIds
    };
    
    setlists.push(newSet);
    setData('setlists', setlists);

    // Auto post dynamic announcement
    const announcements = getData('announcements');
    announcements.unshift({
        id: Date.now(),
        text: `Se ha creado el repertorio "${name}" para el día ${date}.`,
        time: "Recién",
        type: "blue"
    });
    setData('announcements', announcements);

    document.getElementById('modal-setlist').classList.add('hidden');
    renderSetlists();
    showToast("Repertorio creado con éxito");
});

function viewSetlistDetail(setlistId) {
    navigateTo('setlists');
    // For visual simulation, we just highlight or scroll.
    // In our design, the cards show all details, so going to Setlists page is perfect.
}

/* ==========================================================================
   VIEW RENDERING: EVENTS & CALENDAR GRID
   ========================================================================== */

let calendarCurrentYear = 2026;
let calendarCurrentMonth = 5; // June (0-indexed)

// Tab switches (List vs Calendar)
const btnListView = document.getElementById('toggle-view-list');
const btnCalendarView = document.getElementById('toggle-view-calendar');
const listWrapper = document.getElementById('events-list-wrapper');
const calendarWrapper = document.getElementById('events-calendar-wrapper');

btnListView.addEventListener('click', () => {
    btnListView.classList.add('active');
    btnCalendarView.classList.remove('active');
    listWrapper.classList.remove('hidden');
    calendarWrapper.classList.add('hidden');
});

btnCalendarView.addEventListener('click', () => {
    btnCalendarView.classList.add('active');
    btnListView.classList.remove('active');
    calendarWrapper.classList.remove('hidden');
    listWrapper.classList.add('hidden');
    renderCalendar();
});

// Render Events (both List and Dot loaders for Calendar)
function renderEvents() {
    const listContainer = document.getElementById('events-list-container');
    const events = getData('events');
    const setlists = getData('setlists');
    const users = getData('users');
    listContainer.innerHTML = '';

    if (events.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">No hay eventos programados.</div>`;
        return;
    }

    // Sort events soonest first
    const sorted = [...events].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    sorted.forEach(ev => {
        const card = document.createElement('div');
        card.className = `event-card ${ev.type}`;
        
        const setlist = setlists.find(s => s.id === ev.setlistId);
        const setlistName = setlist ? setlist.name : 'Ninguno';

        // Format dates
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const evDate = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', dateOptions);

        // Build roster elements
        let rosterTagsHTML = '';
        for (let role in ev.roster) {
            const musicianId = ev.roster[role];
            const musician = users.find(u => u.id === musicianId);
            if (musician) {
                rosterTagsHTML += `
                    <div class="roster-tag">
                        <span>${role}: <strong>${musician.name}</strong></span>
                    </div>
                `;
            }
        }

        card.innerHTML = `
            <div class="event-card-header">
                <div>
                    <h3>${ev.name}</h3>
                    <p>${evDate} • ${ev.time} hs</p>
                </div>
                <span class="badge ${ev.type === 'culto' ? 'badge-success' : ev.type === 'ensayo' ? 'badge-primary' : 'badge-warning'}">
                    ${ev.type === 'culto' ? 'Culto' : ev.type === 'ensayo' ? 'Ensayo' : 'Especial'}
                </span>
            </div>
            <div class="event-card-body">
                <p style="font-size:0.9rem;">${ev.description || 'Sin notas'}</p>
                <div style="font-size:0.85rem;">
                    <strong>Repertorio:</strong> <a href="#setlists" class="view-setlist-link" data-id="${ev.setlistId}">${setlistName}</a>
                </div>
                <div class="event-roster-preview">
                    <h5>Músicos Asignados</h5>
                    <div class="roster-tags-grid">
                        ${rosterTagsHTML || '<div style="color:var(--text-muted); font-size:0.75rem;">Nadie asignado todavía.</div>'}
                    </div>
                </div>
            </div>
        `;

        card.querySelector('.view-setlist-link').addEventListener('click', (e) => {
            e.preventDefault();
            viewSetlistDetail(ev.setlistId);
        });

        listContainer.appendChild(card);
    });

    if (!calendarWrapper.classList.contains('hidden')) {
        renderCalendar();
    }
}

// Calendar Month Navigation
document.getElementById('btn-prev-month').addEventListener('click', () => {
    calendarCurrentMonth--;
    if (calendarCurrentMonth < 0) {
        calendarCurrentMonth = 11;
        calendarCurrentYear--;
    }
    renderCalendar();
});

document.getElementById('btn-next-month').addEventListener('click', () => {
    calendarCurrentMonth++;
    if (calendarCurrentMonth > 11) {
        calendarCurrentMonth = 0;
        calendarCurrentYear++;
    }
    renderCalendar();
});

const MONTHS_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function renderCalendar() {
    document.getElementById('calendar-month-year').textContent = `${MONTHS_NAMES[calendarCurrentMonth]} ${calendarCurrentYear}`;

    const cellsGrid = document.getElementById('calendar-grid-cells');
    cellsGrid.innerHTML = '';

    // First day of current month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay();
    
    // Total days in current month
    const totalDays = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();
    
    // Total days in previous month
    const prevMonthDays = new Date(calendarCurrentYear, calendarCurrentMonth, 0).getDate();

    // 1. Render overflow days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="day-num">${prevMonthDays - i}</span>`;
        cellsGrid.appendChild(cell);
    }

    // 2. Render current month days
    const events = getData('events');
    const today = new Date();
    const isThisMonth = today.getFullYear() === calendarCurrentYear && today.getMonth() === calendarCurrentMonth;

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        
        // Highlight today
        if (isThisMonth && today.getDate() === day) {
            cell.classList.add('today');
        }

        cell.innerHTML = `<span class="day-num">${day}</span>`;

        // Check if there are events on this date
        const dateStr = `${calendarCurrentYear}-${String(calendarCurrentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);

        if (dayEvents.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'calendar-events-dots';
            
            dayEvents.forEach(ev => {
                const dot = document.createElement('span');
                dot.className = `event-dot ${ev.type}`;
                dotsContainer.appendChild(dot);
            });
            
            cell.appendChild(dotsContainer);
            
            // Add click interaction to trigger Event Details modal!
            cell.addEventListener('click', () => {
                if (dayEvents.length === 1) {
                    viewEventDetails(dayEvents[0].id);
                } else {
                    // If multiple, trigger details for all
                    viewDayEventsDetails(dateStr, dayEvents);
                }
            });
        } else {
            // For leaders, clicking empty day allows quick event scheduling
            cell.addEventListener('click', () => {
                if (currentUser.role.includes('Líder') || currentUser.role.includes('Director')) {
                    openScheduleEventModal(dateStr);
                }
            });
        }

        cellsGrid.appendChild(cell);
    }

    // 3. Render next month overlap cells to complete 6 rows (42 cells)
    const totalRenderedCells = firstDayIndex + totalDays;
    const remainingCells = 42 - totalRenderedCells;
    
    for (let i = 1; i <= remainingCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="day-num">${i}</span>`;
        cellsGrid.appendChild(cell);
    }
}

// Detailed Event View Modal Loader
function viewEventDetails(eventId) {
    const events = getData('events');
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    document.getElementById('event-detail-modal-name').textContent = ev.name;
    const body = document.getElementById('event-detail-modal-body');

    const setlists = getData('setlists');
    const setlist = setlists.find(s => s.id === ev.setlistId);
    const setlistName = setlist ? setlist.name : 'Ninguno';

    const users = getData('users');
    let rosterHTML = '';
    for (let role in ev.roster) {
        const musId = ev.roster[role];
        const mus = users.find(u => u.id === musId);
        if (mus) {
            rosterHTML += `
                <li style="padding: 6px 12px; background-color: var(--bg-hover); border-radius:var(--radius-sm); margin-bottom:6px; display:flex; justify-content:space-between; font-size:0.9rem;">
                    <span><strong>${role}:</strong></span>
                    <span>${mus.name}</span>
                </li>
            `;
        }
    }

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const evDate = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', dateOptions);

    body.innerHTML = `
        <div class="modal-detail-section">
            <h4>Fecha y Hora</h4>
            <p>${evDate} a las <strong>${ev.time} hs</strong></p>
        </div>
        <div class="modal-detail-section">
            <h4>Tipo de Evento</h4>
            <span class="badge ${ev.type === 'culto' ? 'badge-success' : ev.type === 'ensayo' ? 'badge-primary' : 'badge-warning'}">
                ${ev.type === 'culto' ? 'Culto / Servicio' : ev.type === 'ensayo' ? 'Ensayo' : 'Evento Especial'}
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
                ${rosterHTML || '<span style="color:var(--text-muted);">Nadie asignado.</span>'}
            </ul>
        </div>
    `;

    body.querySelector('.view-setlist-modal-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('modal-event-detail').classList.add('hidden');
        viewSetlistDetail(ev.setlistId);
    });

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

function viewDayEventsDetails(dateStr, dayEvents) {
    // Modal header showing date
    document.getElementById('event-detail-modal-name').textContent = `Eventos para el ${dateStr}`;
    const body = document.getElementById('event-detail-modal-body');
    body.innerHTML = '';

    dayEvents.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'dashboard-card';
        div.style.marginBottom = '12px';
        div.innerHTML = `
            <div class="card-header" style="border:none; padding:0; margin-bottom:8px;">
                <h4 style="margin:0;">${ev.name}</h4>
                <span class="badge ${ev.type === 'culto' ? 'badge-success' : ev.type === 'ensayo' ? 'badge-primary' : 'badge-warning'}">${ev.type}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">Hora: ${ev.time} hs</p>
            <button class="btn btn-primary btn-sm btn-block view-specific-event-btn" data-id="${ev.id}">Ver Ficha Completa</button>
        `;

        div.querySelector('.view-specific-event-btn').addEventListener('click', () => {
            viewEventDetails(ev.id);
        });

        body.appendChild(div);
    });

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

// Schedule Event Modal Trigger
document.getElementById('btn-schedule-event').addEventListener('click', () => {
    openScheduleEventModal();
});

function openScheduleEventModal(prefilledDate = null) {
    // Fill setlists options
    const setlistSelect = document.getElementById('event-form-setlist');
    setlistSelect.innerHTML = '<option value="" disabled selected>Selecciona un repertorio...</option>';
    const setlists = getData('setlists');
    setlists.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.date})`;
        setlistSelect.appendChild(opt);
    });

    // Generate dynamic roster selection list based on required worship band instruments
    const rosterSection = document.getElementById('event-form-roster-selection');
    rosterSection.innerHTML = '';

    const rolesToAssign = [
        "Director Musical",
        "Voz Principal",
        "Coros",
        "Guitarra Acústica",
        "Guitarra Eléctrica",
        "Teclado",
        "Bajo",
        "Batería",
        "Sonido / Multimedia"
    ];

    const users = getData('users');

    rolesToAssign.forEach(role => {
        const div = document.createElement('div');
        div.className = 'roster-setup-item';
        
        // Find users sharing this role to prioritize them in select dropdown list
        let optionsHTML = '<option value="">-- No Asignado --</option>';
        users.forEach(u => {
            // prioritize if role matches primary role
            const isMatch = u.role.toLowerCase().includes(role.toLowerCase()) || (role === "Director Musical" && u.role.includes("Líder"));
            optionsHTML += `<option value="${u.id}">${u.name} ${isMatch ? '(Recomendado)' : ''}</option>`;
        });

        div.innerHTML = `
            <span class="role-label">${role}</span>
            <select name="roster-role-${role}" class="form-select-sm">
                ${optionsHTML}
            </select>
        `;
        rosterSection.appendChild(div);
    });

    // Prefill date if provided, otherwise tomorrow
    if (prefilledDate) {
        document.getElementById('event-form-date').value = prefilledDate;
    } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('event-form-date').value = tomorrow.toISOString().split('T')[0];
    }
    
    document.getElementById('event-form-time').value = "18:00";
    document.getElementById('event-schedule-form').reset();
    if (prefilledDate) {
        document.getElementById('event-form-date').value = prefilledDate;
    }
    
    document.getElementById('modal-schedule-event').classList.remove('hidden');
}

// Event Scheduler form submit
document.getElementById('event-schedule-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('event-form-name').value;
    const date = document.getElementById('event-form-date').value;
    const time = document.getElementById('event-form-time').value;
    const type = document.getElementById('event-form-type').value;
    const description = document.getElementById('event-form-desc').value;
    const setlistId = parseInt(document.getElementById('event-form-setlist').value);

    // Build roster object
    const roster = {};
    const selects = document.querySelectorAll('#event-form-roster-selection select');
    selects.forEach(sel => {
        const role = sel.getAttribute('name').replace('roster-role-', '');
        const val = sel.value;
        if (val) {
            roster[role] = parseInt(val);
        }
    });

    const events = getData('events');
    const newEvent = {
        id: Date.now(),
        name,
        date,
        time,
        type,
        description,
        setlistId,
        roster
    };

    events.push(newEvent);
    setData('events', events);

    // Dynamic notification posting
    const announcements = getData('announcements');
    const typeName = type === 'culto' ? 'Culto' : type === 'ensayo' ? 'Ensayo' : 'Evento Especial';
    announcements.unshift({
        id: Date.now(),
        text: `Nuevo ${typeName} programado: "${name}" para el ${date} a las ${time} hs.`,
        time: "Recién",
        type: type === 'culto' ? 'green' : type === 'ensayo' ? 'purple' : 'blue'
    });
    setData('announcements', announcements);

    document.getElementById('modal-schedule-event').classList.add('hidden');
    renderEvents();
    showToast("Evento programado correctamente");
});

/* ==========================================================================
   VIEW RENDERING: SUGGESTIONS BOX (CON UPVOTES)
   ========================================================================== */

function renderSuggestions() {
    const container = document.getElementById('suggestions-container-list');
    const suggestions = getData('suggestions');
    container.innerHTML = '';

    if (suggestions.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted);">No hay sugerencias en la lista. ¡Sé el primero en proponer una!</div>`;
        return;
    }

    // Sort by votes count desc
    const sorted = [...suggestions].sort((a,b) => b.votes - a.votes);

    sorted.forEach(s => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';

        // Check if user has already upvoted
        const hasVoted = s.voters.includes(currentUser.id);

        let statusBadge = '';
        if (s.status === 'pendiente') statusBadge = '<span class="badge badge-warning">Sugerido</span>';
        if (s.status === 'ensayo') statusBadge = '<span class="badge badge-primary">En Ensayo</span>';
        if (s.status === 'agregada') statusBadge = '<span class="badge badge-success">Cargada</span>';

        // Admin actions inside suggestion card (only if user is leader)
        let adminActionHTML = '';
        const isLeader = currentUser.role.includes('Líder') || currentUser.role.includes('Director');
        if (isLeader) {
            adminActionHTML = `
                <select class="form-select-sm select-suggestion-status" data-id="${s.status}" style="font-size:0.75rem; padding:4px 8px; margin-top: 4px;">
                    <option value="pendiente" ${s.status === 'pendiente' ? 'selected' : ''}>Sugerido</option>
                    <option value="ensayo" ${s.status === 'ensayo' ? 'selected' : ''}>En Ensayo</option>
                    <option value="agregada" ${s.status === 'agregada' ? 'selected' : ''}>Añadida al Catálogo</option>
                </select>
            `;
        }

        card.innerHTML = `
            <div class="suggestion-vote-box">
                <button class="btn-vote ${hasVoted ? 'voted' : ''}" data-id="${s.id}" title="Votar por esta sugerencia">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <span class="vote-count">${s.votes}</span>
            </div>
            <div class="suggestion-info-block">
                <h4>${s.title}</h4>
                <p class="artist">por ${s.artist}</p>
                <p class="notes">${s.notes || 'Sin comentarios.'}</p>
                <span class="author">Propuesto por: <strong>${s.suggestedBy}</strong></span>
            </div>
            <div class="suggestion-actions">
                ${statusBadge}
                ${adminActionHTML}
            </div>
        `;

        // Vote button event listener
        card.querySelector('.btn-vote').addEventListener('click', () => {
            toggleVote(s.id);
        });

        // Admin status changer select dropdown listener
        if (isLeader) {
            card.querySelector('.select-suggestion-status').addEventListener('change', (e) => {
                changeSuggestionStatus(s.id, e.target.value);
            });
        }

        container.appendChild(card);
    });
}

function toggleVote(id) {
    const suggestions = getData('suggestions');
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx === -1) return;

    const s = suggestions[idx];
    const userIndex = s.voters.indexOf(currentUser.id);

    if (userIndex === -1) {
        // Vote
        s.voters.push(currentUser.id);
        s.votes++;
        showToast("Voto sumado correctamente");
    } else {
        // Unvote
        s.voters.splice(userIndex, 1);
        s.votes--;
        showToast("Voto retirado");
    }

    suggestions[idx] = s;
    setData('suggestions', suggestions);
    renderSuggestions();
}

function changeSuggestionStatus(id, newStatus) {
    const suggestions = getData('suggestions');
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx === -1) return;

    suggestions[idx].status = newStatus;
    
    // If status changed to added, display prompt to leader
    if (newStatus === 'agregada') {
        showToast(`La sugerencia se marcó como AÑADIDA. ¡Recuerda sumarla al catálogo!`, "success");
    } else {
        showToast(`Estado de sugerencia cambiado a: ${newStatus}`);
    }

    setData('suggestions', suggestions);
    renderSuggestions();
}

// Add Suggestion Modal trigger
document.getElementById('btn-add-suggestion').addEventListener('click', () => {
    document.getElementById('suggestion-form').reset();
    document.getElementById('modal-suggestion').classList.remove('hidden');
});

// Suggestion Submit
document.getElementById('suggestion-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('suggestion-form-title').value;
    const artist = document.getElementById('suggestion-form-artist').value;
    const notes = document.getElementById('suggestion-form-notes').value;

    const suggestions = getData('suggestions');
    const newSug = {
        id: Date.now(),
        title,
        artist,
        notes,
        suggestedBy: currentUser.name,
        votes: 1,
        voters: [currentUser.id],
        status: "pendiente"
    };

    suggestions.push(newSug);
    setData('suggestions', suggestions);

    // Auto post dynamic announcement
    const announcements = getData('announcements');
    announcements.unshift({
        id: Date.now(),
        text: `${currentUser.name} sugirió la alabanza "${title}" de ${artist}.`,
        time: "Recién",
        type: "green"
    });
    setData('announcements', announcements);

    document.getElementById('modal-suggestion').classList.add('hidden');
    renderSuggestions();
    showToast("Sugerencia compartida con el equipo");
});

/* ==========================================================================
   VIEW RENDERING: TEAM & ROLES SIMULATOR
   ========================================================================== */

function renderTeam() {
    // 1. Populate Simulator Dropdown selector
    const users = getData('users');
    const simSelect = document.getElementById('simulator-user-select');
    simSelect.innerHTML = '';

    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name} (${u.role})`;
        if (u.id === currentUser.id) {
            opt.selected = true;
        }
        simSelect.appendChild(opt);
    });

    // 2. Render Roster Directory grid list
    const teamGrid = document.getElementById('team-members-list');
    teamGrid.innerHTML = '';

    users.forEach(u => {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.innerHTML = `
            <div class="avatar">${getInitials(u.name)}</div>
            <div class="member-details">
                <h4>${u.name}</h4>
                <p>${u.role}</p>
                <p style="font-size:0.7rem; color:var(--text-muted); opacity: 0.8;">${u.email}</p>
            </div>
        `;
        teamGrid.appendChild(card);
    });
}

// Simulator Selector Change Event listener
document.getElementById('simulator-user-select').addEventListener('change', (e) => {
    const selectedUserId = parseInt(e.target.value);
    const users = getData('users');
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
        currentUser = user;
        setData('currentUser', currentUser);
        
        // Update headers info
        document.getElementById('sidebar-user-name').textContent = currentUser.name;
        document.getElementById('sidebar-user-role').textContent = currentUser.role;
        document.getElementById('sidebar-avatar').textContent = getInitials(currentUser.name);
        
        // Redraw current tab
        renderTeam();
        
        showToast(`Simulador activo como: ${currentUser.name} (${currentUser.role})`, "warning");
    }
});

/* ==========================================================================
   DARK/LIGHT THEME SWITCHER
   ========================================================================== */

const themeToggle = document.getElementById('theme-toggle');
const iconMoon = themeToggle.querySelector('.icon-moon');
const iconSun = themeToggle.querySelector('.icon-sun');

// Load stored preference
const activeTheme = localStorage.getItem('adora_theme') || 'dark';
if (activeTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
        // Switch to light
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
        localStorage.setItem('adora_theme', 'light');
        showToast("Modo claro activado");
    } else {
        // Switch to dark
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
        localStorage.setItem('adora_theme', 'dark');
        showToast("Modo oscuro activado");
    }
});

/* ==========================================================================
   BOTTOM NAV MOBILE MORE MENU TRIGGERS
   ========================================================================== */

const btnMobileMore = document.getElementById('btn-mobile-more');
const mobileMoreMenu = document.getElementById('mobile-more-menu');
const btnCloseMoreMenu = document.getElementById('btn-close-more-menu');

btnMobileMore.addEventListener('click', () => {
    mobileMoreMenu.classList.remove('hidden');
});

btnCloseMoreMenu.addEventListener('click', () => {
    mobileMoreMenu.classList.add('hidden');
});

// Close menu if clicked outside content card
mobileMoreMenu.addEventListener('click', (e) => {
    if (e.target === mobileMoreMenu) {
        mobileMoreMenu.classList.add('hidden');
    }
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

// Wire view routing triggers for navbar links
document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');
        navigateTo(viewId);
    });
});

// Setup shells
updateShellVisibility();
