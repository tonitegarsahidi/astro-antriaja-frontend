import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl) {
    console.log('AntriAja Service Worker registered:', swScriptUrl);
  },
  onOfflineReady() {
    console.log('AntriAja is ready for offline use.');
  },
});
