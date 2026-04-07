function isLocalLikeHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function shouldEnableServiceWorker() {
  const explicitFlag = import.meta.env.VITE_ENABLE_SERVICE_WORKER
  if (explicitFlag === 'true') return true
  if (explicitFlag === 'false') return false

  return !isLocalLikeHost(window.location.hostname)
}

async function unregisterScopedServiceWorkers(scopeUrl: string) {
  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(
    registrations
      .filter((registration) => registration.scope.startsWith(scopeUrl))
      .map((registration) => registration.unregister()),
  )
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    const scopeUrl = new URL(normalizedBaseUrl, window.location.origin).toString()

    if (!shouldEnableServiceWorker()) {
      void unregisterScopedServiceWorkers(scopeUrl)
      return
    }

    void navigator.serviceWorker.register(`${normalizedBaseUrl}sw.js`, {
      scope: normalizedBaseUrl,
    })
  })
}
