/* ============================================================
   URL publique du site, pour construire des liens absolus
   (QR codes, lien de l'email de notification). Si VITE_SITE_URL
   est défini (prod), on l'utilise toujours — même depuis localhost —
   pour que QR et liens pointent vers le site déployé.
   ============================================================ */
const configured = import.meta.env.VITE_SITE_URL

/** Base du site, sans slash final. */
export const SITE_URL = (configured || `${window.location.origin}${import.meta.env.BASE_URL}`).replace(/\/+$/, '')

/** Construit une URL absolue vers une page du site. */
export const pageUrl = (path: string) => `${SITE_URL}/${path.replace(/^\/+/, '')}`

/** true si l'URL retombe sur localhost faute de VITE_SITE_URL configuré. */
export const usesLocalUrl = !configured && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
