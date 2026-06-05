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
}

export interface Equipement {
  id: string
  type: string
  modele: string
  annee: number
  etat: EtatKey
  salle: string
  salleNom: string
  etage: number
  cote: Cote
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
  /* ---------------- 1er étage (R+1) — détaillé ---------------- */
  { etage: 1, num: '201', nom: 'Salle 201', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 1 }, { type: 'VPI', modele: 'Epson EB-695Wi', annee: 2020, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '203', nom: 'Salle 203', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: '205', nom: 'Salle 205', type: 'Salle de classe', cote: 'nord', wifi: 'moyenne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 7010', annee: 2014, etat: 'vetuste', n: 1 } ] },
  { etage: 1, num: '207', nom: 'Salle 207', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G7', annee: 2021, etat: 'fonctionnel', n: 1 }, { type: 'VPI', modele: 'Epson EB-695Wi', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '209', nom: 'Salle 209', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G6', annee: 2020, etat: 'fonctionnel', n: 1 }, { type: 'VPI', modele: 'NEC M300W', annee: 2013, etat: 'vetuste', n: 1 } ] },
  { etage: 1, num: '211', nom: 'Salle 211', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '213', nom: 'Salle 213', type: 'Salle banalisée', cote: 'nord', wifi: 'moyenne', equip: [] },
  { etage: 1, num: '215', nom: 'Salle 215', type: 'Salle de classe', cote: 'nord', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2022, etat: 'fonctionnel', n: 2 } ] },

  { etage: 1, num: 'SDP', nom: 'Salle des profs', type: 'Salle des professeurs', cote: 'sud', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'HP ProDesk 400 G7', annee: 2021, etat: 'fonctionnel', n: 3 } ] },
  { etage: 1, num: '204', nom: 'CDI', type: 'Centre de documentation', cote: 'sud', wifi: 'bonne',
    equip: [ { type: 'PC portable', modele: 'HP ProBook 440 G9', annee: 2022, etat: 'fonctionnel', n: 4 }, { type: 'Visualiseur', modele: 'AverVision F50', annee: 2021, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '206', nom: 'Salle 206', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne',
    equip: [ { type: 'VPI', modele: 'Epson EB-695Wi', annee: 2020, etat: 'fonctionnel', n: 1 } ] },
  { etage: 1, num: '208', nom: 'Salle 208', type: 'Salle de classe', cote: 'sud', wifi: 'moyenne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 7010', annee: 2015, etat: 'panne', n: 1 } ] },
  { etage: 1, num: '210', nom: 'Salle informatique', type: 'Salle informatique', cote: 'sud', wifi: 'bonne',
    equip: [ { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'fonctionnel', n: 13 }, { type: 'PC fixe', modele: 'Dell OptiPlex 3080', annee: 2021, etat: 'panne', n: 1 } ] },
  { etage: 1, num: '212', nom: 'Salle 212', type: 'Salle de classe', cote: 'sud', wifi: 'faible',
    equip: [ { type: 'PC portable', modele: 'Dell Latitude 3540', annee: 2016, etat: 'vetuste', n: 1 } ] },
  { etage: 1, num: '214', nom: 'Salle 214', type: 'Salle banalisée', cote: 'sud', wifi: 'faible', equip: [] },
]

// ---- Génération légère des autres étages (RDC, R+2, R+3) ----
const TYPES_SALLE = ['Salle de classe', 'Salle de classe', 'Salle de classe', 'Salle banalisée']
const WIFI: WifiKey[] = ['bonne', 'bonne', 'moyenne', 'faible']

interface PlanSalle {
  num: string
  cote: Cote
  nom?: string
  type?: string
  kind?: 'X' | 'info'
}

function genEtage(etage: number, plans: PlanSalle[]): void {
  plans.forEach((p, i) => {
    const num = p.num
    const cote = p.cote
    let equip: EquipGroupe[] = []
    const seed = etage * 17 + i * 7
    if (p.kind === 'X') {
      equip = []
    } else if (p.kind === 'info') {
      equip = [ { type: 'PC fixe', modele: 'HP ProDesk 400 G6', annee: 2019, etat: 'fonctionnel', n: 12 } ]
      if (seed % 2 === 0) equip.push({ type: 'PC fixe', modele: 'HP ProDesk 400 G6', annee: 2019, etat: 'vetuste', n: 2 })
    } else {
      const r = seed % 10
      const etat: EtatKey = r < 5 ? 'fonctionnel' : r < 7 ? 'vetuste' : r < 8 ? 'panne' : 'fonctionnel'
      equip = [ { type: 'PC fixe', modele: etat === 'vetuste' ? 'Dell OptiPlex 7010' : 'Dell OptiPlex 3080', annee: etat === 'vetuste' ? 2014 : 2021, etat, n: 1 } ]
      if (r % 3 === 0) equip.push({ type: 'VPI', modele: 'Epson EB-695Wi', annee: 2019, etat: 'fonctionnel', n: 1 })
    }
    SALLES.push({
      etage,
      num,
      nom: p.nom || 'Salle ' + num,
      type: p.type || TYPES_SALLE[i % TYPES_SALLE.length],
      cote,
      wifi: WIFI[seed % WIFI.length],
      equip,
    })
  })
}

// Rez-de-chaussée (niveau 0, salles 1xx)
genEtage(0, [
  { num: '101', cote: 'nord' }, { num: '103', cote: 'nord' }, { num: '105', cote: 'nord', nom: 'Salle Speechi', type: 'Salle multimédia', kind: 'info' },
  { num: '107', cote: 'nord' }, { num: '109', cote: 'nord' }, { num: '111', cote: 'nord' }, { num: '113', cote: 'nord', kind: 'X' }, { num: '115', cote: 'nord' }, { num: '117', cote: 'nord' },
  { num: '102', cote: 'sud' }, { num: '104', cote: 'sud' }, { num: '106', cote: 'sud' }, { num: '108', cote: 'sud' }, { num: '110', cote: 'sud', nom: 'Permanence', type: 'Vie scolaire' }, { num: '112', cote: 'sud', kind: 'X' }, { num: '114', cote: 'sud' }, { num: '116', cote: 'sud' },
])

// 2e étage (niveau 2, salles 3xx)
genEtage(2, [
  { num: '301', cote: 'nord' }, { num: '303', cote: 'nord', kind: 'X' }, { num: '305', cote: 'nord' }, { num: '307', cote: 'nord' }, { num: '309', cote: 'nord', kind: 'X' }, { num: '311', cote: 'nord' }, { num: '313', cote: 'nord' }, { num: '315', cote: 'nord' },
  { num: '302', cote: 'sud' }, { num: '304', cote: 'sud' }, { num: '306', cote: 'sud' }, { num: '308', cote: 'sud', kind: 'X' }, { num: '310', cote: 'sud' }, { num: '312', cote: 'sud' }, { num: '314', cote: 'sud' },
])

// 3e étage (niveau 3, salles 4xx)
genEtage(3, [
  { num: '401', cote: 'nord' }, { num: '403', cote: 'nord' }, { num: '405', cote: 'nord' }, { num: '407', cote: 'nord' }, { num: '409', cote: 'nord' }, { num: '411', cote: 'nord' }, { num: '413', cote: 'nord', kind: 'X' }, { num: '415', cote: 'nord', kind: 'X' },
  { num: '402', cote: 'sud' }, { num: '404', cote: 'sud' }, { num: '406', cote: 'sud' }, { num: '408', cote: 'sud' }, { num: '410', cote: 'sud' }, { num: '412', cote: 'sud' }, { num: '414', cote: 'sud' },
])

// ---- Santé d'une salle d'après son matériel ----
export function santeSalle(s: Salle): SanteKey {
  const actifs = s.equip.filter((e) => e.etat !== 'reforme')
  if (actifs.length === 0) return 'none'
  if (actifs.some((e) => e.etat === 'panne')) return 'panne'
  if (actifs.some((e) => e.etat === 'vetuste')) return 'vetuste'
  return 'fonctionnel'
}

export function nbPostes(s: Salle): number {
  return s.equip.reduce((a, e) => a + e.n, 0)
}

// ---- Liste plate d'équipements (IDs générés) ----
const PREFIX: Record<string, string> = { 'PC fixe': 'PC-FIX', 'PC portable': 'PC-PORT', 'Visualiseur': 'VISU', 'VPI': 'VPI', 'Tablette': 'TAB' }
const EQUIPEMENTS: Equipement[] = []
SALLES.forEach((s) => {
  const counters: Record<string, number> = {}
  s.equip.forEach((g) => {
    for (let k = 0; k < g.n; k++) {
      const pre = PREFIX[g.type] || 'EQ'
      counters[pre] = (counters[pre] || 0) + 1
      const numSafe = String(s.num).replace(/\D/g, '') || s.num
      const id = `${pre}-${numSafe}-${String(counters[pre]).padStart(2, '0')}`
      EQUIPEMENTS.push({
        id, type: g.type, modele: g.modele, annee: g.annee, etat: g.etat,
        salle: s.num, salleNom: s.nom, etage: s.etage, cote: s.cote,
        proprietaire: 'Conseil départemental',
      })
    }
  })
})

export const ETAGE_LABEL: Record<number, string> = { 0: 'Rez-de-chaussée', 1: '1ᵉʳ étage', 2: '2ᵉ étage', 3: '3ᵉ étage' }
export const ETAGE_COURT: Record<number, string> = { 0: 'RDC', 1: 'R+1', 2: 'R+2', 3: 'R+3' }
export const ANNEE_REF = 2026

export { SALLES, EQUIPEMENTS }

export const PARC = {
  ETATS, SALLES, EQUIPEMENTS, ETAGE_LABEL, ETAGE_COURT,
  santeSalle, nbPostes, anneeRef: ANNEE_REF,
}
