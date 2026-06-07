/* ============================================================
   Notification email au référent à chaque signalement (EmailJS).
   Envoi côté navigateur, sans backend. Les identifiants EmailJS
   sont publics par conception (clé publique). Si non configurés,
   la fonction ne fait rien (l'app reste fonctionnelle).
   ============================================================ */
import emailjs from '@emailjs/browser'

const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const notifyConfigured = Boolean(SERVICE && TEMPLATE && PUBLIC_KEY)

/** Variables transmises au template EmailJS (les noms doivent y correspondre). */
export interface NotifyParams {
  equipement: string
  salle: string
  probleme: string
  details: string
  enseignant: string
  email: string
  date: string
  lien: string
}

/** Envoie la notification. N'échoue jamais bruyamment : un email raté ne doit
 *  pas casser le signalement déjà enregistré. */
export async function notifySignalement(params: NotifyParams): Promise<void> {
  if (!notifyConfigured) return
  try {
    await emailjs.send(SERVICE, TEMPLATE, { ...params }, { publicKey: PUBLIC_KEY })
  } catch (e) {
    // on log mais on n'interrompt pas le flux utilisateur
    console.warn('Notification email non envoyée :', e)
  }
}
