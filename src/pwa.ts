import { registerSW } from 'virtual:pwa-register'

let updateServiceWorker: (() => Promise<void>) | undefined

updateServiceWorker = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    const checkForUpdates = () => {
      if (document.visibilityState === 'visible') {
        void registration.update()
      }
    }

    void registration.update()
    document.addEventListener('visibilitychange', checkForUpdates)
    window.addEventListener('focus', checkForUpdates)
  },
  onNeedRefresh() {
    void updateServiceWorker?.()
  },
})
