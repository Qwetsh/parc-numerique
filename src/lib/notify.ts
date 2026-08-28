/* ============================================================
   Notification email au référent à chaque signalement (EmailJS).

   Deux canaux existent, un seul doit être actif à la fois :

   1. SERVEUR (préféré) — trigger SQL sur parc_signalements → edge function
      « notify-signalement » → API EmailJS. Fiable quel que soit l'appareil
      de l'enseignant, mais suppose deux réglages faits une fois pour toutes :
      les secrets WEBHOOK_SECRET / EMAILJS_PRIVATE_KEY côté Supabase, et
      l'autorisation des appels hors navigateur côté EmailJS.
   2. NAVIGATEUR (secours, ce fichier) — actif tant que VITE_NOTIF_NAVIGATEUR
      vaut « true ». Passer ce drapeau à false le jour où le canal serveur
      fonctionne, sinon chaque signalement enverra DEUX emails.

   Aucune donnée nominative n'est transmise : un signalement décrit un
   équipement, un lieu et une panne.
   ============================================================ */
import emailjs from '@emailjs/browser'

const ACTIF = import.meta.env.VITE_NOTIF_NAVIGATEUR === 'true'
const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const notifyConfigured = ACTIF && Boolean(SERVICE && TEMPLATE && PUBLIC_KEY)

/** Variables transmises au template EmailJS (les noms doivent y correspondre). */
export interface NotifyParams {
  equipement: string
  salle: string
  probleme: string
  details: string
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
