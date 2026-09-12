import { registerSW } from 'virtual:pwa-register';

// Di mode development, nonaktifkan service worker dan bersihkan service worker lama
// agar tidak mengganggu Vite HMR, client routing, dan dev dynamic modules.
if (import.meta.env.DEV) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((unregistered) => {
          if (unregistered) {
            console.log('Dev Service Worker unregistered successfully.');
          }
        });
      }
    });
  }
} else {
  // Hanya daftarkan Service Worker di mode produksi
  registerSW({
    immediate: true,
    onRegisteredSW(swScriptUrl) {
      console.log('AntriAja Service Worker registered:', swScriptUrl);
    },
    onOfflineReady() {
      console.log('AntriAja is ready for offline use.');
    },
  });
}
