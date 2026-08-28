/* ============================================================
   Génération des demandes d'intervention à partir d'un signalement.

   Tout ne part pas au même endroit : une panne matérielle relève du
   Guichet Unique du Département, un compte MBN de l'administrateur ENT,
   SIECLE ou LSU de l'assistance académique. Le canal est déduit du
   signalement puis reste modifiable, et chaque canal garde son adresse
   et son format de message.

   Adresses, signature et établissement sont mémorisés dans le navigateur
   (localStorage) : ce sont des réglages, pas des données de l'application.
   ============================================================ */
import { ETAGE_LABEL, salleMeta } from '../data/parc'
import type { Signalement } from './signalements'

const KEY = 'parc.reparation.v2'
const KEY_V1 = 'parc.reparation.v1'

/* ---------------- Canaux ---------------- */

export type CanalKey = 'guichet' | 'ent' | 'pronote' | 'academie'

export interface Canal {
  key: CanalKey
  /** Nom du destinataire, affiché dans le sélecteur. */
  label: string
  /** Ce qui relève de ce canal, pour lever le doute au moment de choisir. */
  aide: string
}

export const CANAUX: Canal[] = [
  {
    key: 'guichet',
    label: 'Guichet Unique du Département',
    aide: 'Matériel, réseau, serveur pédagogique, Windows et logiciels installés sur les postes.',
  },
  {
    key: 'ent',
    label: 'Administrateur ENT, puis support MBN',
    aide: 'Compte élève ou professeur qui ne fonctionne pas dans MBN.',
  },
  {
    key: 'pronote',
    label: 'Administrateur Pronote local, puis Index Éducation',
    aide: 'Tout ce qui concerne Pronote.',
  },
  {
    key: 'academie',
    label: 'Assistance académique Nancy-Metz',
    aide: 'SIECLE, LSU, ARENA, messagerie académique, Pix Orga et remontée des élèves.',
  },
]

export function canalDe(key: CanalKey): Canal {
  return CANAUX.find((c) => c.key === key) ?? CANAUX[0]
}

/** Mots-clés qui trahissent un canal applicatif plutôt qu'une panne matérielle. */
const INDICES: { canal: CanalKey; mots: string[] }[] = [
  { canal: 'ent', mots: ['mbn', 'ent', 'mon bureau numérique', 'mon bureau numerique'] },
  { canal: 'pronote', mots: ['pronote', 'index éducation', 'index education'] },
  { canal: 'academie', mots: ['siecle', 'lsu', 'arena', 'pix', 'messagerie académique', 'messagerie academique', 'webmail', 'iprof'] },
]

/** Canal probable d'un signalement : matériel par défaut, sauf mention
 *  explicite d'une application académique dans le problème ou les détails. */
export function canalPour(probleme: string, description?: string): CanalKey {
  const texte = `${probleme} ${description ?? ''}`.toLowerCase()
  for (const { canal, mots } of INDICES) {
    if (mots.some((m) => texte.includes(m))) return canal
  }
  return 'guichet'
}

/* ---------------- Réglages mémorisés ---------------- */

export interface ReparationSettings {
  /** Une adresse (ou un nom de destinataire) par canal. */
  adresses: Record<CanalKey, string>
  /** Établissement et RNE, attendus par l'assistance académique. */
  etablissement: string
  signature: string
}

const DEFAULT: ReparationSettings = {
  adresses: { guichet: '', ent: '', pronote: '', academie: '' },
  etablissement: 'Collège Pierre Mendès France — Woippy',
  signature: 'Le référent numérique\nCollège Pierre Mendès France',
}

export function loadSettings(): ReparationSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Partial<ReparationSettings>
      return { ...DEFAULT, ...s, adresses: { ...DEFAULT.adresses, ...(s.adresses ?? {}) } }
    }
    // Reprise de l'ancien réglage : le destinataire unique était en pratique
    // le Guichet Unique, on le récupère plutôt que de le perdre.
    const v1 = localStorage.getItem(KEY_V1)
    if (v1) {
      const a = JSON.parse(v1) as { destinataire?: string; signature?: string }
      return {
        ...DEFAULT,
        adresses: { ...DEFAULT.adresses, guichet: a.destinataire ?? '' },
        signature: a.signature || DEFAULT.signature,
      }
    }
  } catch { /* JSON illisible ou mode privé : on repart des valeurs par défaut */ }
  return { ...DEFAULT }
}

export function saveSettings(s: ReparationSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* quota / mode privé : on ignore */ }
}

/* ---------------- Composition du message ---------------- */

function localisation(s: Signalement): string {
  const nom = s.etage != null ? salleMeta(s.etage, s.salle ?? '')?.nom : undefined
  const base = nom ?? (s.salle ? `Salle ${s.salle}` : 'Salle inconnue')
  const num = nom && s.salle ? ` (${s.salle})` : ''
  const etage = s.etage != null ? ` · ${ETAGE_LABEL[s.etage]}` : ''
  return `${base}${num}${etage}`
}

/** Objet de la demande, adapté au canal. */
export function buildObjet(s: Signalement, canal: CanalKey): string {
  if (canal === 'guichet') {
    return `Demande de réparation — ${s.equipement_ref ?? 'équipement'} · ${localisation(s)}`
  }
  return `${canalDe(canal).label.split(',')[0]} — ${s.probleme}`
}

/** Détails techniques optionnels (récupérés sur la fiche équipement). */
export interface EquipExtra {
  numero_serie?: string | null
  num_inventaire?: string | null
}

/** Ce dont la rédaction du message a besoin — pas l'adresse, qui ne
 *  figure pas dans le corps et ne doit donc pas le faire régénérer. */
export type EnTeteDemande = Pick<ReparationSettings, 'signature' | 'etablissement'>

/** Corps du message, incluant la signature. Le Guichet Unique attend
 *  l'identification du matériel ; les canaux applicatifs attendent
 *  l'établissement et le compte concerné. */
export function buildCorps(
  s: Signalement,
  settings: EnTeteDemande,
  canal: CanalKey,
  extra?: EquipExtra,
): string {
  const date = new Date(s.created_at).toLocaleDateString('fr-FR')
  const lignes = ['Bonjour,', '']

  if (canal === 'guichet') {
    lignes.push(
      'Je vous signale une panne sur un équipement du parc numérique du collège, à prendre en charge :',
      '',
      `• Équipement   : ${s.equipement_ref ?? '—'}`,
    )
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
    )
  } else {
    lignes.push(
      'Je vous sollicite au sujet du problème suivant :',
      '',
      `• Établissement : ${settings.etablissement}`,
      `• Problème      : ${s.probleme}`,
    )
    if (s.description) lignes.push(`• Détails       : ${s.description}`)
    lignes.push(
      `• Constaté le   : ${date}`,
      `• Localisation  : ${localisation(s)}`,
      '• Compte concerné : (à préciser)',
      '',
      'Pourriez-vous me dire comment procéder ? Je reste à disposition.',
    )
  }

  lignes.push('', 'Cordialement,', settings.signature)
  return lignes.join('\n')
}

/** Texte complet à copier (destinataire + objet + corps). */
export function composeMessage(destinataire: string, objet: string, corps: string): string {
  const tete = destinataire ? `À : ${destinataire}\n` : ''
  return `${tete}Objet : ${objet}\n\n${corps}`
}

/** Lien mailto prérempli. Renvoie null si l'adresse n'est pas un email
 *  (le champ accepte aussi un simple nom de destinataire). */
export function mailtoUrl(adresse: string, objet: string, corps: string): string | null {
  const a = adresse.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) return null
  return `mailto:${encodeURIComponent(a)}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`
}
