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
  modele: string | null // inconnu tant que la fiche n'est pas complétée
  annee: number | null  // idem — un relevé de salle ne connaît pas l'année d'achat
  etat: EtatKey
  salle: string       // numéro de salle
  salleNom: string    // dérivé des métadonnées de salle
  etage: number
  cote: Cote          // dérivé des métadonnées de salle
  proprietaire: string
  numero_serie: string | null   // n° de série constructeur
  num_inventaire: string | null // n° d'inventaire / étiquette département
  os: string | null             // système d'exploitation
  notes: string | null          // observations libres
}

/* ============================================================
   Catalogue des types de matériel, dans l'ordre où on les rencontre
   en faisant le tour d'une salle. Sert au relevé de terrain et à la
   génération des références (préfixe + salle + numéro d'ordre).
   ============================================================ */
export interface TypeMateriel {
  /** Libellé affiché et stocké dans parc_equipements.type */
  label: string
  /** Préfixe de référence, ex. VID → VID-204-01 */
  prefixe: string
}

export const TYPES_MATERIEL: TypeMateriel[] = [
  { label: 'PC fixe', prefixe: 'PC-FIX' },
  { label: 'VPI', prefixe: 'VPI' },
  { label: 'TBI', prefixe: 'TBI' },
  { label: 'Écran', prefixe: 'ECR' },
  { label: 'Imprimante', prefixe: 'IMP' },
  { label: 'Visualiseur', prefixe: 'VISU' },
  { label: 'PC portable', prefixe: 'PC-PORT' },
  { label: 'Tablette', prefixe: 'TAB' },
  { label: 'Enceintes', prefixe: 'SON' },
  { label: 'Borne wifi', prefixe: 'WIFI' },
  { label: 'Switch réseau', prefixe: 'SW' },
  { label: 'Serveur', prefixe: 'SRV' },
]

/** Libellés seuls, pour les listes déroulantes. */
export const TYPES_EQUIP: string[] = TYPES_MATERIEL.map((t) => t.label)

/** Préfixe de référence d'un type (repli : les 3 premières lettres). */
export function prefixeType(type: string): string {
  const t = TYPES_MATERIEL.find((x) => x.label === type)
  return t ? t.prefixe : type.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'EQ'
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

/* ---- Inventaire réel — Collège Pierre Mendès France, Woippy (audit CD57 / Atos) ----
   Source : « inventaire ordinateur salle.xlsx » (n° inventaire interne 213.1.0x.xxxx
   + n° série Atos). Specs matériel : dossier PNC-NG (poste standard = écran 22",
   Intel Core i3-12100, 8 Go, SSD 256 Go, Windows 11, garantie 5 ans).
   1 ligne = 1 poste (unité centrale, série « CZC… ») ; le n° d'inventaire et la série
   de l'écran (213.1.02.xxxx / « 3CM… ») sont consignés dans `notes`.
   Mapping plan : CDI = pièce 204, ULIS = salle 114, EPS = gymnase (hors plan 3D).
   ⚠️ `modele` (générique) et `annee` (2023, année de migration estimée) sont des
   hypothèses à confirmer : l'inventaire Atos ne les précise pas. Ce jeu n'amorce que
   les bases vides (cf. parcStore.tsx) ; la base déployée n'est pas modifiée. */
export interface EquipSeed {
  reference: string
  type: string
  modele: string
  annee: number
  etat: EtatKey
  salle: string
  etage: number
  proprietaire: string
  numero_serie: string | null
  num_inventaire: string | null
  os: string | null
  notes: string | null
}

export const SEED_EQUIPEMENTS: EquipSeed[] = [
  { reference: 'PC-FIX-110-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '110', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DVS', num_inventaire: '213.1.01.0002', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0001 / s/n 3CM24801CJ" },
  { reference: 'PC-FIX-113-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '113', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DR2', num_inventaire: '213.1.01.0003', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0003 / s/n 3CM2451075" },
  { reference: 'PC-FIX-114-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '114', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2V', num_inventaire: '213.1.01.0068', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0068 / s/n 3CM24801C4 — dispositif ULIS" },
  { reference: 'PC-FIX-114-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '114', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2R', num_inventaire: '213.1.01.0069', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0069 / s/n 3CM24801BT — dispositif ULIS" },
  { reference: 'PC-FIX-114-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '114', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2Y', num_inventaire: '213.1.01.0070', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0070 / s/n 3CM24801CD — dispositif ULIS" },
  { reference: 'PC-FIX-116-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '116', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F46', num_inventaire: '213.1.01.0004', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0004 / s/n 3CM24510K3" },
  { reference: 'PC-FIX-117-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '117', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F38', num_inventaire: '213.1.01.0005', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0005 / s/n 3CM24801BW" },
  { reference: 'PC-FIX-EPS-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: 'EPS', etage: 0, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D45', num_inventaire: '213.1.01.0064', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0064 / s/n 3CM24801C5 — gymnase EPS (hors plan)" },
  { reference: 'PC-FIX-204-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DWX', num_inventaire: '213.1.01.0001', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0077 / s/n 3CM2451071" },
  { reference: 'PC-FIX-204-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3L', num_inventaire: '213.1.01.0058', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0058 / s/n 3CM24801CM" },
  { reference: 'PC-FIX-204-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D41', num_inventaire: '213.1.01.0059', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0059 / s/n 3CM24801CQ" },
  { reference: 'PC-FIX-204-04', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4Z', num_inventaire: '213.1.01.0060', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0060 / s/n 3CM24801BQ" },
  { reference: 'PC-FIX-204-05', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4V', num_inventaire: '213.1.01.0061', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0061 / s/n 3CM24801BH" },
  { reference: 'PC-FIX-204-06', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4Q', num_inventaire: '213.1.01.0062', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0062 / s/n 3CM24801CC" },
  { reference: 'PC-FIX-204-07', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227CST', num_inventaire: '213.1.01.0063', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0063 / s/n 3CM24801B6" },
  { reference: 'PC-FIX-204-08', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3257S5W', num_inventaire: '213.1.01.0074', os: 'Windows 11', notes: "Écran 22\" (n° non relevé)" },
  { reference: 'PC-FIX-204-09', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3257S4F', num_inventaire: '213.1.01.0075', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0074 / s/n 3CM24801CP" },
  { reference: 'PC-FIX-204-10', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3257S5C', num_inventaire: '213.1.01.0076', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0076 / s/n 3CM2451084" },
  { reference: 'PC-FIX-204-11', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '204', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3257S57', num_inventaire: '213.1.01.0077', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0075 / s/n 3CM2451077" },
  { reference: 'PC-FIX-205-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '205', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D0M', num_inventaire: '213.1.01.0006', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0006 / s/n 3CM24801CB" },
  { reference: 'PC-FIX-209-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '209', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DR1', num_inventaire: '213.1.01.0007', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0007 / s/n 3CM24801CN" },
  { reference: 'PC-FIX-210-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DWV', num_inventaire: '213.1.01.0008', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0008 / s/n 3CM245108K" },
  { reference: 'PC-FIX-210-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DSF', num_inventaire: '213.1.01.0009', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0009 / s/n 3CM24801CH" },
  { reference: 'PC-FIX-210-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F9C', num_inventaire: '213.1.01.0010', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0010 / s/n 3CM24801BM" },
  { reference: 'PC-FIX-210-04', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227FKT', num_inventaire: '213.1.01.0011', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0011 / s/n 3CM24510JW" },
  { reference: 'PC-FIX-210-05', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F2K', num_inventaire: '213.1.01.0012', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0012 / s/n 3CM245107X" },
  { reference: 'PC-FIX-210-06', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DW2', num_inventaire: '213.1.01.0013', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0013 / s/n 3CM2451074" },
  { reference: 'PC-FIX-210-07', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3K', num_inventaire: '213.1.01.0014', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0014 / s/n 3CM245107W" },
  { reference: 'PC-FIX-210-08', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DS7', num_inventaire: '213.1.01.0015', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0015 / s/n 3CM245107J" },
  { reference: 'PC-FIX-210-09', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DSH', num_inventaire: '213.1.01.0016', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0016 / s/n 3CM245108B" },
  { reference: 'PC-FIX-210-10', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DRK', num_inventaire: '213.1.01.0017', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0017 / s/n 3CM245108F" },
  { reference: 'PC-FIX-210-11', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F7H', num_inventaire: '213.1.01.0018', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0018 / s/n 3CM24801CF" },
  { reference: 'PC-FIX-210-12', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DJ4', num_inventaire: '213.1.01.0019', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0019 / s/n 3CM2451076" },
  { reference: 'PC-FIX-210-13', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D5V', num_inventaire: '213.1.01.0020', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0020 / s/n 3CM245108C" },
  { reference: 'PC-FIX-210-14', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D35', num_inventaire: '213.1.01.0021', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0021 / s/n 3CM24801BX" },
  { reference: 'PC-FIX-210-15', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '210', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D36', num_inventaire: '213.1.01.0072', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0072 / s/n 3CM24801C1" },
  { reference: 'PC-FIX-211-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '211', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D6M', num_inventaire: '213.1.01.0022', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0022 / s/n 3CM24801BS" },
  { reference: 'PC-FIX-215-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '215', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2Z', num_inventaire: '213.1.01.0023', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0023 / s/n 3CM245107D" },
  { reference: 'PC-FIX-SDP-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: 'SDP', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D50', num_inventaire: '213.1.01.0065', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0065 / s/n 3CM24801B8" },
  { reference: 'PC-FIX-SDP-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: 'SDP', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D47', num_inventaire: '213.1.01.0066', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0066 / s/n 3CM24801CK" },
  { reference: 'PC-FIX-SDP-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: 'SDP', etage: 1, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3N', num_inventaire: '213.1.01.0067', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0067 / s/n 3CM2450ZGL" },
  { reference: 'PC-FIX-301-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2S', num_inventaire: '213.1.01.0025', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0025 / s/n 3CM2451082" },
  { reference: 'PC-FIX-301-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4T', num_inventaire: '213.1.01.0027', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0027 / s/n 3CM245107T" },
  { reference: 'PC-FIX-301-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D6P', num_inventaire: '213.1.01.0028', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0028 / s/n 3CM245107R" },
  { reference: 'PC-FIX-301-04', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D5X', num_inventaire: '213.1.01.0029', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0029 / s/n 3CM2451089" },
  { reference: 'PC-FIX-301-05', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D89', num_inventaire: '213.1.01.0030', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0030 / s/n 3CM2451088" },
  { reference: 'PC-FIX-301-06', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2N', num_inventaire: '213.1.01.0031', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0031 / s/n 3CM245107Z" },
  { reference: 'PC-FIX-301-07', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D39', num_inventaire: '213.1.01.0032', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0032 / s/n 3CM245107N" },
  { reference: 'PC-FIX-301-08', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227F95', num_inventaire: '213.1.01.0073', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0079 / s/n 3CM2270ZX2" },
  { reference: 'PC-FIX-301-09', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '301', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D7J', num_inventaire: '213.1.01.0078', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0078 / s/n 3CM2270ZXK" },
  { reference: 'PC-FIX-302-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '302', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D31', num_inventaire: '213.1.01.0033', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0033 / s/n 3CM24801C3" },
  { reference: 'PC-FIX-304-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '304', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2X', num_inventaire: '213.1.01.0034', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0034 / s/n 3CM245107B" },
  { reference: 'PC-FIX-305-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4M', num_inventaire: '213.1.01.0024', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0024 / s/n 3CM2451073" },
  { reference: 'PC-FIX-305-02', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4R', num_inventaire: '213.1.01.0026', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0026 / s/n 3CM2450ZD7" },
  { reference: 'PC-FIX-305-03', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4F', num_inventaire: '213.1.01.0035', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0035 / s/n 3CM245107C" },
  { reference: 'PC-FIX-305-04', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2Q', num_inventaire: '213.1.01.0036', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0036 / s/n 3CM245107L" },
  { reference: 'PC-FIX-305-05', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2B', num_inventaire: '213.1.01.0037', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0037 / s/n 3CM24801CS" },
  { reference: 'PC-FIX-305-06', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2D', num_inventaire: '213.1.01.0038', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0038 / s/n 3CM2450ZG2" },
  { reference: 'PC-FIX-305-07', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D37', num_inventaire: '213.1.01.0039', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0039 / s/n 3CM2451085" },
  { reference: 'PC-FIX-305-08', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4L', num_inventaire: '213.1.01.0040', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0040 / s/n 3CM2450Z5W" },
  { reference: 'PC-FIX-305-09', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D5Z', num_inventaire: '213.1.01.0041', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0041 / s/n 3CM24801CR" },
  { reference: 'PC-FIX-305-10', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D33', num_inventaire: '213.1.01.0042', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0042 / s/n 3CM2451086" },
  { reference: 'PC-FIX-305-11', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D32', num_inventaire: '213.1.01.0071', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0071 / s/n 3CM245107F" },
  { reference: 'PC-FIX-305-12', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '305', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227DL4', num_inventaire: '213.1.01.0079', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0073 / s/n 3CM24801BF" },
  { reference: 'PC-FIX-306-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '306', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4J', num_inventaire: '213.1.01.0043', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0043 / s/n 3CM24801CT" },
  { reference: 'PC-FIX-307-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '307', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D38', num_inventaire: '213.1.01.0044', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0044 / s/n 3CM24801CL" },
  { reference: 'PC-FIX-310-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '310', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4K', num_inventaire: '213.1.01.0045', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0045 / s/n 3CM2450ZV2" },
  { reference: 'PC-FIX-311-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '311', etage: 2, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4P', num_inventaire: '213.1.01.0046', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0046 / s/n 3CM3200XDK" },
  { reference: 'PC-FIX-401-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '401', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3D', num_inventaire: '213.1.01.0047', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0047 / s/n 3CM24510HV" },
  { reference: 'PC-FIX-402-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '402', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2M', num_inventaire: '213.1.01.0048', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0048 / s/n 3CM3200XD3" },
  { reference: 'PC-FIX-403-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '403', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3S', num_inventaire: '213.1.01.0049', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0049 / s/n 3CM2451079" },
  { reference: 'PC-FIX-404-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '404', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2F', num_inventaire: '213.1.01.0050', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0050 / s/n 3CM24801BZ" },
  { reference: 'PC-FIX-405-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '405', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D4S', num_inventaire: '213.1.01.0051', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0051 / s/n 3CM24801C9" },
  { reference: 'PC-FIX-406-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '406', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D2H', num_inventaire: '213.1.01.0052', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0052 / s/n 3CM24801C2" },
  { reference: 'PC-FIX-407-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '407', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D5J', num_inventaire: '213.1.01.0053', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0053 / s/n 3CM24801ZJ" },
  { reference: 'PC-FIX-408-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '408', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D49', num_inventaire: '213.1.01.0054', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0054 / s/n 3CM245107Q" },
  { reference: 'PC-FIX-409-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '409', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D5S', num_inventaire: '213.1.01.0055', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0055 / s/n 3CM24801C8" },
  { reference: 'PC-FIX-411-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '411', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3X', num_inventaire: '213.1.01.0056', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0056 / s/n 3CM2451081" },
  { reference: 'PC-FIX-412-01', type: 'PC fixe', modele: 'Poste standard PNC-NG (i3-12100)', annee: 2023, etat: 'fonctionnel', salle: '412', etage: 3, proprietaire: 'Conseil départemental', numero_serie: 'CZC3227D3Z', num_inventaire: '213.1.01.0057', os: 'Windows 11', notes: "Écran 22\" — inv. 213.1.02.0057 / s/n 3CM24801CG" },
]

/** Génère la prochaine référence libre pour un type+salle (ex. PC-FIX-205-03). */
export function nextReference(type: string, salle: string, existing: { reference: string }[]): string {
  const pre = prefixeType(type)
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

export const ETAGE_LABEL: Record<number, string> = { 0: 'Rez-de-chaussée', 1: '1ᵉʳ étage', 2: '2ᵉ étage', 3: '3ᵉ étage' }
export const ETAGE_COURT: Record<number, string> = { 0: 'RDC', 1: 'R+1', 2: 'R+2', 3: 'R+3' }
export const ANNEE_REF = 2026

export { SALLES }
