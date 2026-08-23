/* ==========================================================================
   Levare — Web Push Notifications Client Manager
   ========================================================================== */

let isPushSubscribing = false;

// Convert base64 / base64url string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Check if browser/platform supports Web Push
function isPushNotificationSupported() {
    return ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
}

// Get current push subscription if active
async function getCurrentPushSubscription() {
    if (!isPushNotificationSupported()) return null;
    try {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    } catch (e) {
        console.warn("Error getting push subscription:", e);
        return null;
    }
}

// Subscribe user to Web Push
async function subscribeUserToPush(silent = false) {
    if (!isPushNotificationSupported()) {
        if (!silent) showToast("Este navegador o dispositivo no soporta notificaciones Push.", "warning");
        return false;
    }

    if (isPushSubscribing) return false;
    isPushSubscribing = true;

    try {
        // 1. Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            if (!silent) {
                if (permission === 'denied') {
                    showToast("Permiso de notificaciones bloqueado en el navegador.", "danger");
                } else {
                    showToast("No se concedió permiso para notificaciones.", "warning");
                }
            }
            updatePushUI(false);
            isPushSubscribing = false;
            return false;
        }

        // 2. Fetch VAPID Public Key from backend
        const keyData = await apiFetch('/push/vapid-public-key');
        if (!keyData || !keyData.publicKey) {
            throw new Error("No se pudo obtener la clave pública VAPID del servidor.");
        }

        // 3. Register push subscription with browser service
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
        }

        // 4. Send subscription keys to backend
        const subJson = subscription.toJSON();
        await apiFetch('/push/subscribe', {
            method: 'POST',
            body: {
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                user_agent: navigator.userAgent
            }
        });

        updatePushUI(true);
        if (!silent) showToast("Notificaciones push activadas correctamente.", "success");
        isPushSubscribing = false;
        return true;
    } catch (err) {
        console.error("Error subscribing to push notifications:", err);
        if (!silent) showToast("Fallo al activar notificaciones push: " + (err.message || "Error desconocido"), "danger");
        updatePushUI(false);
        isPushSubscribing = false;
        return false;
    }
}

// Unsubscribe user from Web Push
async function unsubscribeUserFromPush(silent = false) {
    if (!isPushNotificationSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            const endpoint = subscription.endpoint;
            // Unsubscribe from browser
            await subscription.unsubscribe();
            // Notify backend
            await apiFetch('/push/unsubscribe', {
                method: 'POST',
                body: { endpoint: endpoint }
            });
        }

        updatePushUI(false);
        if (!silent) showToast("Notificaciones push desactivadas en este dispositivo.", "info");
        return true;
    } catch (err) {
        console.error("Error unsubscribing from push:", err);
        if (!silent) showToast("Fallo al desactivar notificaciones.", "danger");
        return false;
    }
}

// Toggle Push state from UI switch
async function togglePushNotifications() {
    const subscription = await getCurrentPushSubscription();
    if (subscription) {
        await unsubscribeUserFromPush();
    } else {
        await subscribeUserToPush();
    }
}

// Send a test notification
async function triggerTestPushNotification() {
    try {
        showToast("Enviando notificación de prueba...", "info");

        // 1. Send push to backend (which delivers via Google FCM / Apple APNs)
        const res = await apiFetch('/push/test', { method: 'POST' });
        if (res && res.message) {
            showToast(res.message, "success");
        }

        // 2. Also trigger local Service Worker showNotification for immediate visual confirmation
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                if (reg && reg.showNotification) {
                    reg.showNotification("Levare • Notificaciones Activas", {
                        body: "¡Las notificaciones en este dispositivo están funcionando correctamente!",
                        icon: "icon-levareapp.png",
                        badge: "icon-levareapp.png",
                        data: { url: "./" }
                    });
                }

            });
        }
    } catch (e) {
        showToast("Error al enviar notificación de prueba.", "danger");
    }
}



// Update UI toggle switch & status texts across the app
async function updatePushUI(isSubscribed) {
    const switchBtn = document.getElementById('push-switch-btn');
    const switchKnob = document.getElementById('push-switch-knob');
    const statusText = document.getElementById('profile-push-status-text');
    const testBtn = document.getElementById('btn-test-push-notif');

    if (!isPushNotificationSupported()) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && navigator.standalone);
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (statusText) {
            if (!isSecure) {
                statusText.textContent = "Requiere conexión segura HTTPS";
            } else if (isIOS && !isStandalone) {
                statusText.textContent = "En iOS: abre en Safari y toca 'Agregar a pantalla de inicio'";
            } else if (isIOS) {
                statusText.textContent = "Requiere iOS 16.4+ agregada al inicio desde Safari";
            } else {
                statusText.textContent = "No compatible con este navegador/SO";
            }
        }
        if (switchBtn) {
            switchBtn.classList.add('opacity-50', 'cursor-not-allowed');
            switchBtn.disabled = true;
        }
        if (testBtn) testBtn.classList.add('hidden');
        return;
    }


    if (switchBtn && switchKnob) {
        if (isSubscribed) {
            switchBtn.classList.remove('bg-zinc-300', 'dark:bg-zinc-700', 'bg-zinc-900', 'dark:bg-zinc-100');
            switchBtn.classList.add('bg-emerald-500');
            switchKnob.classList.remove('translate-x-0', 'dark:bg-zinc-900');
            switchKnob.classList.add('translate-x-5', 'bg-white');
            if (statusText) statusText.textContent = "Notificaciones activas en este dispositivo";
            if (testBtn) testBtn.classList.remove('hidden');
        } else {
            switchBtn.classList.remove('bg-emerald-500', 'bg-zinc-900', 'dark:bg-zinc-100');
            switchBtn.classList.add('bg-zinc-300', 'dark:bg-zinc-700');
            switchKnob.classList.remove('translate-x-5', 'dark:bg-zinc-900');
            switchKnob.classList.add('translate-x-0', 'bg-white');
            if (statusText) {
                if (Notification.permission === 'denied') {
                    statusText.textContent = "Bloqueado en ajustes del navegador";
                } else {
                    statusText.textContent = "Desactivadas en este dispositivo";
                }
            }
            if (testBtn) testBtn.classList.add('hidden');
        }
    }
}

// Check and sync Push state on view load
async function syncPushNotificationState() {
    if (!isPushNotificationSupported()) {
        updatePushUI(false);
        return;
    }
    const subscription = await getCurrentPushSubscription();
    updatePushUI(!!subscription);
}

// Listen for messages from Service Worker (when user clicks push notification)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION_CLICKED') {
            const notifData = event.data.data || {};
            const category = notifData.category || '';
            const meta = notifData.meta || {};

            if (category === 'community' || meta.source === 'community') {
                if (typeof navigateTo === 'function') navigateTo('announcements');
            } else if (meta.event_id || category === 'events') {
                if (typeof navigateTo === 'function') navigateTo('events');
            } else if (meta.setlist_id || category === 'setlists') {
                if (typeof navigateTo === 'function') navigateTo('setlists');
            } else if (meta.song_id || category === 'songs') {
                if (typeof navigateTo === 'function') navigateTo('songs');
            } else if (category === 'suggestions') {
                if (typeof navigateTo === 'function') navigateTo('suggestions');
            } else {
                if (typeof navigateTo === 'function') navigateTo('dashboard');
            }
        }
    });
}

// Prompt Invitation Modal Helpers

function showPushInvitationModal() {
    const modal = document.getElementById('modal-push-permission-invitation');
    if (modal) modal.classList.remove('hidden');
}

function dismissPushInvitationModal() {
    const modal = document.getElementById('modal-push-permission-invitation');
    if (modal) modal.classList.add('hidden');
    // Store in localStorage to avoid re-prompting frequently
    localStorage.setItem('worship_push_prompt_dismissed', Date.now().toString());
}

async function acceptPushInvitationModal() {
    dismissPushInvitationModal();
    await subscribeUserToPush();
}

function checkAndShowPushInvitationPrompt() {
    if (!isPushNotificationSupported()) return;
    if (Notification.permission !== 'default') return;

    // Check if user is logged in
    const token = localStorage.getItem('worship_token');
    if (!token) return;

    const lastDismissed = localStorage.getItem('worship_push_prompt_dismissed');
    if (lastDismissed) {
        const daysPassed = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
        if (daysPassed < 7) return; // Do not disturb for 7 days
    }

    // Delay slighty after login so UI settles
    setTimeout(() => {
        showPushInvitationModal();
    }, 2500);
}

// Check invitation on startup
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(checkAndShowPushInvitationPrompt, 1500);
    });
}

