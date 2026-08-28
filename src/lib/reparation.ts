/* ============================================================
   Génération de messages précomplétés de demande de réparation
   à partir d'un signalement, + réglages (destinataire, signature)
   mémorisés dans le navigateur (localStorage).
   ============================================================ */
import { ETAGE_LABEL, salleMeta } from '../data/parc'
import type { Signalement } from './signalements'

const KEY = 'parc.reparation.v1'

export interface ReparationSettings {
  destinataire: string
  signature: string
}

const DEFAULT: ReparationSettings = {
  destinataire: '',
  signature: 'Le référent numérique\nCollège Pierre Mendès France',
}

export function loadSettings(): ReparationSettings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveSettings(s: ReparationSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* quota / mode privé : on ignore */ }
}

function localisation(s: Signalement): string {
  const nom = s.etage != null ? salleMeta(s.etage, s.salle ?? '')?.nom : undefined
  const base = nom ?? (s.salle ? `Salle ${s.salle}` : 'Salle inconnue')
  const num = nom && s.salle ? ` (${s.salle})` : ''
  const etage = s.etage != null ? ` · ${ETAGE_LABEL[s.etage]}` : ''
  return `${base}${num}${etage}`
}

/** Objet de la demande de réparation. */
export function buildObjet(s: Signalement): string {
  return `Demande de réparation — ${s.equipement_ref ?? 'équipement'} · ${localisation(s)}`
}

/** Détails techniques optionnels (récupérés sur la fiche équipement). */
export interface EquipExtra {
  numero_serie?: string | null
  num_inventaire?: string | null
}

/** Corps du message (incluant la signature). */
export function buildCorps(s: Signalement, signature: string, extra?: EquipExtra): string {
  const date = new Date(s.created_at).toLocaleDateString('fr-FR')
  const lignes = [
    'Bonjour,',
    '',
    'Je vous signale une panne sur un équipement du parc numérique du collège, à prendre en charge :',
    '',
    `• Équipement   : ${s.equipement_ref ?? '—'}`,
  ]
  if (extra?.numero_serie) lignes.push(`• N° de série   : ${extra.numero_serie}`)
  if (extra?.num_inventaire) lignes.push(`• N° inventaire : ${extra.num_inventaire}`)
  lignes.push(
    `• Localisation : ${localisation(s)}`,
    `• Problème     : ${s.probleme}`,
  )
  if (s.description) lignes.push(`• Détails      : ${s.description}`)
  lignes.push(
    `• Signalé le   : ${date}`,
    '',
    'Pourriez-vous programmer une intervention ? Je reste à disposition.',
    '',
    'Cordialement,',
    signature,
  )
  return lignes.join('\n')
}

/** Texte complet à copier (destinataire + objet + corps). */
export function composeMessage(destinataire: string, objet: string, corps: string): string {
  const tete = destinataire ? `À : ${destinataire}\n` : ''
  return `${tete}Objet : ${objet}\n\n${corps}`
}
