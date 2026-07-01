/* ==========================================================================
   WorshipApp — API CLIENT & LOCAL STORAGE CLIENT
   ========================================================================== */

// Resolve API server host dynamically to support local network mobile access
const API_URL = `${window.location.protocol}//${window.location.hostname}:9090/api`;
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
 * Global HTTP Fetcher for Laravel API
 */
async function apiFetch(endpoint, options = {}) {
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

        // Handle Session Expired
        if (response.status === 401) {
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

        const data = await response.json();

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
    
    const apiBase = API_URL.replace('/api', '');
    
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        try {
            const urlObj = new URL(avatarPath);
            const apiBaseUrl = new URL(apiBase);
            urlObj.host = apiBaseUrl.host;
            urlObj.protocol = apiBaseUrl.protocol;
            return urlObj.toString();
        } catch {
            return avatarPath;
        }
    }
    
    return `${apiBase}/${avatarPath}`;
}
