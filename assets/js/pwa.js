/**
 * ==============================================================================
 * Levare — Progressive Web App (PWA) & Offline Module (pwa.js)
 * ==============================================================================
 * @fileoverview Controla las capacidades PWA de Levare:
 * - Captura del evento `beforeinstallprompt` para la instalación guiada.
 * - Desencadenador interactivo de instalación (`installAppPWA`).
 * - Registro y comprobación de actualización del Service Worker (`sw.js`).
 * ==============================================================================
 */

let deferredInstallPrompt = null;

// Capturar el evento de instalación nativo para controlarlo desde la UI
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) {
        installBtn.classList.remove('hidden');
    }
});

/**
 * Solicita al usuario la instalación de la aplicación como PWA en su dispositivo.
 */
async function installAppPWA() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('¡Gracias por instalar Levare!', 'success');
        }
        deferredInstallPrompt = null;
    } else {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            showToast('Levare ya está instalada y ejecutándose como App.', 'info');
        } else {
            showToast('Para instalar: abre el menú del navegador y selecciona "Agregar a la pantalla de inicio" o "Instalar".', 'info');
        }
    }
}
window.installAppPWA = installAppPWA;

// Registro del Service Worker con soporte de Web Push y actualización transparente
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=2.0.7')
            .then(reg => {
                console.log('PWA ServiceWorker activo:', reg.scope);
                if (typeof reg.update === 'function') {
                    reg.update();
                }
            })
            .catch(err => {
                console.warn('PWA ServiceWorker no registrado:', err);
            });
    });
}
