/* ==========================================================================
   WorshipApp — API CLIENT & LOCAL STORAGE CLIENT
   ========================================================================== */

// Dynamic base path and API URL resolution
function getAppBasePath() {
    let path = window.location.pathname;
    // Remove filename like index.php or login.php if present
    path = path.replace(/\/[^\/]+\.(php|html)$/i, '/');
    if (!path.endsWith('/')) {
        path += '/';
    }
    return path;
}

const BASE_PATH = getAppBasePath();
const API_URL = `${window.location.origin}${BASE_PATH}api_native/index.php`;
/**
 * Basic LocalStorage Helpers (for session state)
 */
function getData(key) {
    const raw = localStorage.getItem(`worship_${key}`);
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function setData(key, val) {
    localStorage.setItem(`worship_${key}`, JSON.stringify(val));
}

/**
 * Global HTTP Fetcher for Native API
 */
async function apiFetch(endpoint, options = {}, maybeBody = null) {
    if (typeof options === 'string') {
        options = {
            method: options,
            body: maybeBody
        };
    }

    const token = getData('token');
    const groupId = getData('currentGroupId');

    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
    };


    // If body is NOT a FormData instance, set content-type header to json
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Token'] = token;
    }

    if (groupId) {
        headers['X-Group-Id'] = groupId;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle Session Expired (except on login attempts)
        if (response.status === 401 && endpoint !== '/auth/login') {
            setData('currentUser', null);
            setData('token', null);
            setData('currentGroupId', null);

            // Redirect to Auth shell views
            window.location.hash = '';

            // Check if active session is visible
            const authContainer = document.getElementById('auth-container');
            const mainContainer = document.getElementById('main-container');
            if (authContainer && mainContainer) {
                authContainer.classList.remove('hidden');
                mainContainer.classList.add('hidden');
            }

            showToast("Tu sesión ha expirado. Inicia sesión de nuevo.", "danger");
            return null;
        }

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Respuesta del servidor no es JSON:", text);
            throw new Error(`El servidor respondió con un error HTTP ${response.status} o una página HTML.`);
        }

        if (!response.ok) {
            const err = new Error(data.message || 'Ocurrió un error en la solicitud.');
            err.errors = data.errors;
            throw err;
        }

        return data;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

/**
 * Normalizes user avatar path or URL to match the dynamically resolved active API host and port.
 */
function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    // Clean up the path whether the backend sent an absolute URL via asset() or a relative path
    let relativePath = avatarPath;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        try {
            const urlObj = new URL(avatarPath);
            const pathParts = urlObj.pathname.split('storage/');
            if (pathParts.length > 1) {
                relativePath = 'storage/' + pathParts[1];
            } else {
                return avatarPath;
            }
        } catch {
            return avatarPath;
        }
    } else {
        if (!relativePath.startsWith('storage/')) {
            relativePath = 'storage/' + relativePath;
        }
    }
    
    // Resolve public base depending on API routing
    let publicBase = API_URL;
    if (publicBase.includes('/api_native/index.php')) {
        publicBase = publicBase.replace('/api_native/index.php', '');
    } else if (publicBase.includes('/index.php/api')) {
        publicBase = publicBase.replace('/index.php/api', '');
    } else {
        publicBase = publicBase.replace('/api', '');
    }
    
    // Trim trailing slash if present
    publicBase = publicBase.replace(/\/$/, '');
    return `${publicBase}/${relativePath}`;
}

