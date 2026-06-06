/* ============================================================
   PARC NUMÉRIQUE — Données de démonstration (port typé de data.js)
   Partagé par : tableau de bord, liste, vue du collège.
   ============================================================ */

export type EtatKey = 'fonctionnel' | 'vetuste' | 'panne' | 'reforme'
export type SanteKey = EtatKey | 'none'
export type EtatCls = 'ok' | 'warn' | 'bad' | 'gone'
export type WifiKey = 'bonne' | 'moyenne' | 'faible'
export type Cote = 'nord' | 'sud'

export interface EtatDef {
  key: EtatKey
  label: string
  cls: EtatCls
  rank: number
}

export interface EquipGroupe {
  type: string
  modele: string
  annee: number
  etat: EtatKey
  n: number
}

export interface Salle {
  etage: number
  num: string
  nom: string
  type: string
  cote: Cote
  wifi: WifiKey
  equip: EquipGroupe[]
  /** Largeur relative de la salle dans la maquette 3D (1 = salle standard).
   *  Permet de coller aux proportions réelles du plan 2D. */
  poids?: number
}

export interface Equipement {
  id: string          // uuid (clé primaire Supabase)
  reference: string   // code affiché (ex. PC-FIX-205-01)
  type: string
  modele: string
  annee: number
  etat: EtatKey
  salle: string       // numéro de salle
  salleNom: string    // dérivé des métadonnées de salle
  etage: number
  cote: Cote          // dérivé des métadonnées de salle
  proprietaire: string
}

export const ETATS: Record<EtatKey, EtatDef> = {
  fonctionnel: { key: 'fonctionnel', label: 'Fonctionnel', cls: 'ok', rank: 0 },
  vetuste: { key: 'vetuste', label: 'Vétuste', cls: 'warn', rank: 1 },
  panne: { key: 'panne', label: 'En panne', cls: 'bad', rank: 3 },
  reforme: { key: 'reforme', label: 'Réformé', cls: 'gone', rank: -1 },
}

// ---- Définition des salles (R+1 détaillé, autres étages plus légers) ----
const SALLES: Salle[] = [
  /* ---------------- 1er étage (R+1) — détaillé, fidèle au plan 2D ----------------
     Sur le plan, certaines salles portent deux numéros mais ne forment qu'UNE pièce :
     204+206 = le CDI, 207+209 = « poste 7 », 212+214 = « postes 74 à 77 ».
     Le champ `poids` reflète la largeur réelle de chaque salle. */

  // -- Rangée nord --
  // 201 = une SUITE subdivisée : 5 pièces profondes (façade nord) desservies par
  // un couloir interne « 201 » (séparé du couloir central par un mur), + un WC.
  // « 201 » est donc une circulation, pas une salle inventoriée.
  { etage: 1, num: 'P1', nom: 'Pièce', type: 'Bureau', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: 'P2', nom: 'Pièce', type: 'Bureau', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: 'P3', nom: 'Pièce', type: 'Bureau', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: 'P4', nom: 'Pièce', type: 'Bureau', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: 'P5', nom: 'Pièce', type: 'Bureau', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: 'WC2', nom: 'Toilettes', type: 'Sanitaires', cote: 'nord', wifi: 'faible', equip: [] },
  { etage: 1, num: '203', nom: 'Salle 203', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', poids: 0.75, equip: [] },
  { etage: 1, num: '205', nom: 'Salle 205', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', poids: 1.0,
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 7010', annee: 2014, etat: 'vetuste', n: 1 } ] },
  // 207 et 209 = deux salles séparées (207 très petite)
  { etage: 1, num: '207', nom: 'Salle 207', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G7', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '209', nom: 'Salle 209', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G6', annee: 2020, etat: 'fonctionnel', n: 1 }, { type: 'VPI', modele: 'Epson EB-695Wi', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '211', nom: 'Salle 211', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', poids: 1.2,
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '213', nom: 'Salle 213', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', poids: 0.55, equip: [] },
  { etage: 1, num: '215', nom: 'Salle 215', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', poids: 1.45,
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2022, etat: 'fonctionnel', n: 2 } ] },

  // -- Rangée sud --
  { etage: 1, num: 'WC1', nom: 'Toilettes', type: 'Sanitaires', cote: 'sud', wifi: 'faible', equip: [] },
  { etage: 1, num: 'SDP', nom: 'Salle des profs', type: 'Salle des professeurs', cote: 'sud', wifi: 'bonne', poids: 1.25,
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G7', annee: 2021, etat: 'fonctionnel', n: 3 } ] },
  // 204 + 206 = le CDI (une seule grande salle sur le plan)
  { etage: 1, num: '204', nom: 'CDI', type: 'Centre de documentation', cote: 'sud', wifi: 'bonne', poids: 2.3,
    equip: [ { type: 'PC portable', modele: 'HP ProBook 440 G9', annee: 2022, etat: 'fonctionnel', n: 4 }, { type: 'Visualiseur', modele: 'AverVision F50', annee: 2021, etat: 'fonctionnel', n: 1 }, { type: 'VPI', modele: 'Epson EB-695Wi', annee: 2020, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '208', nom: 'Salle 208', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', poids: 0.85,
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 7010', annee: 2015, etat: 'panne', n: 1 } ] },
  { etage: 1, num: '210', nom: 'Salle informatique', type: 'Salle informatique', cote: 'sud', wifi: 'bonne', poids: 2.0,
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 13 }, { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'panne', n: 1 } ] },
  // 212 et 214 = deux salles séparées (214 toute petite)
  { etage: 1, num: '212', nom: 'Salle 212', type: 'Salle de classe', cote: 'sud', wifi: 'faible',
    equip: [ { type: 'PC portable', modele: 'Dell Latitude 3540', annee: 2016, etat: 'vetuste', n: 1 } ] },
  { etage: 1, num: '214', nom: 'Salle 214', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
]

/* ============================================================
   Autres étages — transcrits du plan 2D (numéros, noms, salles VPI,
   salles vides « X », grandes salles). Le plan ne précise pas l'état
   du matériel : les états (fonctionnel/vétuste/panne) restent une
   répartition d'exemple réaliste.
   ============================================================ */
const PCF = (annee: number, etat: EtatKey, n = 1): EquipGroupe => ({ type: 'PC fixe', modele: etat === 'vetuste' ? 'Dell OptiPlex 7010' : annee <= 2019 ? 'HP ProDesk 400 G6' : 'Dell OptiPlex 3080', annee, etat, n })
const VPI = (annee = 2020): EquipGroupe => ({ type: 'VPI', modele: 'Epson EB-695Wi', annee, etat: 'fonctionnel', n: 1 })

const AUTRES_SALLES: Salle[] = [
  /* ---------------- Rez-de-chaussée (RDC, salles 1xx) — fidèle au plan réel ----------------
     Structure : aile gauche (101→112) / noyau central (couloir transversal nord + escalier sud)
     / aile droite (113→117 et 114-116). Fusions réelles : 102+104 = local technique,
     108+110 = Permanence. 107/109/111 = pôle infirmerie + toilettes (blocs cliquables sans parc).
     Les largeurs sont fixées dans la table de disposition (college3d/geometry.ts). */
  // Rangée nord
  { etage: 0, num: '101', nom: 'Salle 101', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 0, num: '103', nom: 'Salle 103', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 0, num: '105', nom: 'Salle Speechi', type: 'Salle multimédia', cote: 'nord', wifi: 'bonne', equip: [ PCF(2019, 'fonctionnel', 12) ] },
  { etage: 0, num: '107', nom: 'Infirmerie', type: 'Infirmerie', cote: 'nord', wifi: 'bonne', equip: [] },
  { etage: 0, num: '109', nom: 'Attente infirmerie', type: "Salle d'attente", cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 0, num: '111', nom: 'Toilettes', type: 'Sanitaires', cote: 'nord', wifi: 'faible', equip: [] },
  { etage: 0, num: '113', nom: 'Salle 113', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel'), VPI(2020) ] },
  { etage: 0, num: '115', nom: 'Salle 115', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 0, num: '117', nom: 'Salle 117', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2019, 'fonctionnel') ] },
  // Rangée sud
  { etage: 0, num: '102', nom: 'Local technique', type: 'Local technique', cote: 'sud', wifi: 'faible', equip: [] }, // 102 + 104 fusionnés
  { etage: 0, num: '106', nom: 'Salle 106', type: 'Salle de classe', cote: 'sud', wifi: 'faible', equip: [ PCF(2015, 'panne') ] },
  { etage: 0, num: '110', nom: 'Permanence', type: 'Vie scolaire', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel', 2) ] }, // 108 + 110 fusionnés
  { etage: 0, num: '112', nom: 'Salle 112', type: 'Salle banalisée', cote: 'sud', wifi: 'faible', equip: [] },
  { etage: 0, num: '114', nom: 'Salle 114', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2019, 'fonctionnel', 3) ] },
  { etage: 0, num: '116', nom: 'Salle 116', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },

  /* ---------------- 2e étage (R+2, salles 3xx) — fidèle au plan ----------------
     Nord = 6 salles seulement (301→311) ; 313/315 n'existent pas. */
  // Rangée nord
  { etage: 2, num: '301', nom: 'Salle 301', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel'), VPI(2020) ] },
  { etage: 2, num: '303', nom: 'Salle 303', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 2, num: '305', nom: 'Salle 305', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 2, num: '307', nom: 'Salle 307', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', equip: [ PCF(2014, 'vetuste') ] },
  { etage: 2, num: '309', nom: 'Salle 309', type: 'Salle banalisée', cote: 'nord', wifi: 'faible', equip: [] },
  { etage: 2, num: '311', nom: 'Salle 311', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  // Rangée sud
  { etage: 2, num: 'WC3', nom: 'Toilettes', type: 'Sanitaires', cote: 'sud', wifi: 'faible', equip: [] },
  { etage: 2, num: '302', nom: 'Salle 302', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 2, num: '304', nom: 'Salle 304', type: 'Salle de classe', cote: 'sud', wifi: 'faible', equip: [ PCF(2015, 'panne') ] },
  { etage: 2, num: '306', nom: 'Salle 306', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel'), VPI(2019) ] },
  { etage: 2, num: '308', nom: 'Salle 308', type: 'Salle banalisée', cote: 'sud', wifi: 'moyenne', poids: 0.7, equip: [] },
  { etage: 2, num: '310', nom: 'Salle 310', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 2, num: '312', nom: 'Salle 312', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2014, 'vetuste') ] },
  { etage: 2, num: '314', nom: 'Salle 314', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },

  /* ---------------- 3e étage (R+3, salles 4xx) — pas d'escalier central ---------------- */
  // Rangée nord
  { etage: 3, num: '401', nom: 'Salle 401', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '403', nom: 'Salle 403', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '405', nom: 'Salle 405', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '407', nom: 'Salle 407', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne', equip: [ PCF(2014, 'vetuste') ] },
  { etage: 3, num: '409', nom: 'Salle 409', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '411', nom: 'Salle 411', type: 'Salle de classe', cote: 'nord', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel'), VPI(2020) ] },
  { etage: 3, num: '413', nom: 'Salle 413', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', poids: 0.7, equip: [] },
  { etage: 3, num: '415', nom: 'Salle 415', type: 'Salle banalisée', cote: 'nord', wifi: 'faible', poids: 0.7, equip: [] },
  // Rangée sud — 6 salles (402→412, 412 large) encadrées de WC ; 414 n'existe pas
  { etage: 3, num: 'WC4', nom: 'Toilettes', type: 'Sanitaires', cote: 'sud', wifi: 'faible', equip: [] },
  { etage: 3, num: '402', nom: 'Salle 402', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '404', nom: 'Salle 404', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '406', nom: 'Salle 406', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '408', nom: 'Salle 408', type: 'Salle de classe', cote: 'sud', wifi: 'faible', equip: [ PCF(2015, 'panne') ] },
  { etage: 3, num: '410', nom: 'Salle 410', type: 'Salle de classe', cote: 'sud', wifi: 'bonne', equip: [ PCF(2021, 'fonctionnel') ] },
  { etage: 3, num: '412', nom: 'Salle 412', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne', equip: [ PCF(2022, 'fonctionnel') ] },
  { etage: 3, num: 'WC5', nom: 'Toilettes', type: 'Sanitaires', cote: 'sud', wifi: 'faible', equip: [] },
]

SALLES.push(...AUTRES_SALLES)

/* ============================================================
   Données dynamiques : la santé et le nombre de postes d'une salle
   sont désormais calculés à partir de l'inventaire en base (Supabase),
   et non plus des données de démo embarquées. Voir data/parcStore.tsx.
   Les fonctions ci-dessous opèrent sur une liste d'éléments {etat}.
   ============================================================ */

/** Santé d'une salle d'après la liste de ses équipements (par leur état). */
export function santeFromList(items: { etat: EtatKey }[]): SanteKey {
  const actifs = items.filter((e) => e.etat !== 'reforme')
  if (actifs.length === 0) return 'none'
  if (actifs.some((e) => e.etat === 'panne')) return 'panne'
  if (actifs.some((e) => e.etat === 'vetuste')) return 'vetuste'
  return 'fonctionnel'
}

/** Clé d'une salle : le numéro n'est pas unique entre étages → on combine. */
export const salleKey = (etage: number, num: string) => `${etage}|${num}`
const SALLE_BY_KEY = new Map(SALLES.map((s) => [salleKey(s.etage, s.num), s]))
/** Métadonnées statiques d'une salle (nom, type, côté, wifi…), depuis le plan. */
export const salleMeta = (etage: number, num: string): Salle | undefined =>
  SALLE_BY_KEY.get(salleKey(etage, num))

/* ---- Jeu de démonstration servant à amorcer la base si elle est vide ---- */
export interface EquipSeed {
  reference: string
  type: string
  modele: string
  annee: number
  etat: EtatKey
  salle: string
  etage: number
  proprietaire: string
}

const PREFIX: Record<string, string> = {
  'PC fixe': 'PC-FIX', 'PC portable': 'PC-PORT', 'Visualiseur': 'VISU', 'VPI': 'VPI', 'Tablette': 'TAB',
}

export const SEED_EQUIPEMENTS: EquipSeed[] = []
SALLES.forEach((s) => {
  const counters: Record<string, number> = {}
  s.equip.forEach((g) => {
    for (let k = 0; k < g.n; k++) {
      const pre = PREFIX[g.type] || 'EQ'
      counters[pre] = (counters[pre] || 0) + 1
      const numSafe = String(s.num).replace(/\D/g, '') || s.num
      SEED_EQUIPEMENTS.push({
        reference: `${pre}-${numSafe}-${String(counters[pre]).padStart(2, '0')}`,
        type: g.type, modele: g.modele, annee: g.annee, etat: g.etat,
        salle: s.num, etage: s.etage, proprietaire: 'Conseil départemental',
      })
    }
  })
})

/** Génère la prochaine référence libre pour un type+salle (ex. PC-FIX-205-03). */
export function nextReference(type: string, salle: string, existing: { reference: string }[]): string {
  const pre = PREFIX[type] || 'EQ'
  const numSafe = String(salle).replace(/\D/g, '') || salle
  const base = `${pre}-${numSafe}-`
  let max = 0
  for (const e of existing) {
    if (e.reference?.startsWith(base)) {
      const n = parseInt(e.reference.slice(base.length), 10)
      if (!Number.isNaN(n) && n > max) max = n
    }
  }
  return `${base}${String(max + 1).padStart(2, '0')}`
}

/** Types d'équipement proposés dans le formulaire d'ajout. */
export const TYPES_EQUIP = ['PC fixe', 'PC portable', 'Tablette', 'VPI', 'Visualiseur']

export const ETAGE_LABEL: Record<number, string> = { 0: 'Rez-de-chaussée', 1: '1ᵉʳ étage', 2: '2ᵉ étage', 3: '3ᵉ étage' }
export const ETAGE_COURT: Record<number, string> = { 0: 'RDC', 1: 'R+1', 2: 'R+2', 3: 'R+3' }
export const ANNEE_REF = 2026

export { SALLES }
