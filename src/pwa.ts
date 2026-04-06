export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    void navigator.serviceWorker.register(`${normalizedBaseUrl}sw.js`, {
      scope: normalizedBaseUrl,
    })
  })
}
