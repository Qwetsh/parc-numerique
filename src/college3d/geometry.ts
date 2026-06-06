/* ============================================================
   Géométrie du bâtiment — port 3D du moteur isométrique.
   Le plan d'origine raisonne en (x = longueur, y = profondeur).
   Ici on mappe : plan.x -> monde X, plan.y -> monde Z, hauteur -> monde Y.
   Le bâtiment est recentré autour de l'origine.
   ============================================================ */
import { SALLES } from '../data/parc'
import type { Salle } from '../data/parc'

export const SW = 2.7 // emprise cage d'escalier (x)
export const ROOM_D = 3.6 // profondeur d'une salle (z)
export const CORR = 2.1 // largeur couloir
export const MARGIN = 0.9 // marge socle
export const H = 1.75 // hauteur des volumes
export const PLINTH = 0.55 // épaisseur du socle
const BAY = 2.45 // largeur de référence d'une travée
const MAX_BAYS = 9 // longueur commune à tous les étages
const U = MAX_BAYS * BAY // longueur utile (salles)

// Largeur intérieure totale du bâtiment (rangée nord = pleine largeur ;
// rangée sud = escaliers d'extrémité + salles + escalier central).
const INNER = SW * 2 + U

export const TOTAL_X = MARGIN * 2 + INNER
export const TOTAL_Y = MARGIN * 2 + ROOM_D * 2 + CORR

/** Demi-dimensions pour recentrer le bâtiment sur l'origine. */
const CX = TOTAL_X / 2
const CZ = TOTAL_Y / 2

export interface RoomSolid {
  kind: 'room'
  salle: Salle
  /** centre monde (X, Z) et tailles */
  x: number
  z: number
  w: number // taille X
  d: number // taille Z
  h: number
}

export interface StairSolid {
  kind: 'stair'
  label?: string
  x: number
  z: number
  w: number
  d: number
  h: number
}

/** Bande de circulation au sol (couloir transversal, couloir de suite…). */
export interface CorridorSolid {
  kind: 'corridor'
  x: number
  z: number
  w: number
  d: number
  label?: string
}

/** Mur/cloison visible (fine boîte verticale). */
export interface WallSolid {
  kind: 'wall'
  x: number
  z: number
  w: number
  d: number
  h: number
}

export type Solid = RoomSolid | StairSolid | CorridorSolid | WallSolid

/* ============================================================
   Disposition EXPLICITE (au plan réel), étage par étage.
   Les cages d'escalier (ouest, centrale, est) sont à des positions X
   FIXES, identiques à tous les étages → cohérence verticale du bâtiment.
   Chaque aile place ses salles par poids relatif dans son segment.
   L'escalier central n'existe que jusqu'au R+2 (absent au R+3).
   ============================================================ */
interface Slot { num: string; w: number; square?: boolean } // square = pièce carrée (moins profonde)
/** Suite subdivisée occupant l'empreinte d'un slot : rangée de pièces profondes
 *  le long de la façade + couloir de desserte au fond (côté couloir principal),
 *  avec d'éventuelles petites salles (WC) à l'ouest et un mur de séparation. */
interface Suite {
  front: Slot[] // pièces desservies par le couloir (peu profondes)
  endRoom?: Slot // pièce de bout pleine profondeur, qui termine le couloir à l'est
  backRooms: Slot[] // petites salles au fond, posées à l'ouest (ex. WC)
  backLabel?: string // libellé du couloir de desserte
}
interface FloorLayout {
  northLeft: Slot[]; northRight: Slot[]
  southLeft: Slot[]; southRight: Slot[]
  /** escalier central côté sud — RDC→R+2, pas R+3 */
  centralStair: boolean
  /** couloir transversal côté nord au droit du noyau — RDC uniquement */
  transverseCorridor: boolean
  /** suites subdivisées, indexées par le num du slot qu'elles remplacent */
  suites?: Record<string, Suite>
}

// --- Ancrages fixes des cages (coords monde), partagés par tous les étages ---
const WEST_W = 1.65 // largeur cage ouest (sud)
const EAST_W = 1.65 // largeur cage est (sud)
const CORE_W = 1.4 // largeur du noyau central
const CORE_CX = MARGIN + 0.6 * INNER // centre du noyau (~60 % de l'emprise)
const CORE_LX = CORE_CX - CORE_W / 2
const CORE_RX = CORE_CX + CORE_W / 2

const FLOORS: Record<number, FloorLayout> = {
  // ---------------- RDC ----------------
  0: {
    northLeft: [
      { num: '101', w: 1.35 }, { num: '103', w: 0.75 }, { num: '105', w: 1.75 },
      { num: '107', w: 1.0 }, { num: '109', w: 0.45 }, { num: '111', w: 0.4 },
    ],
    northRight: [{ num: '113', w: 1.65 }, { num: '115', w: 0.65 }, { num: '117', w: 1.5 }],
    southLeft: [
      { num: '102', w: 1.7 }, { num: '106', w: 0.95 }, { num: '110', w: 1.85 }, { num: '112', w: 0.5 },
    ],
    southRight: [{ num: '114', w: 1.7 }, { num: '116', w: 1.3 }],
    centralStair: true,
    transverseCorridor: true,
  },
  // ---------------- R+1 ----------------
  1: {
    northLeft: [
      { num: '201', w: 3.0 }, { num: '203', w: 0.6 }, { num: '205', w: 1.2 },
      { num: '207', w: 0.45 }, { num: '209', w: 1.0 },
    ],
    northRight: [{ num: '211', w: 1.6 }, { num: '213', w: 0.5 }, { num: '215', w: 1.5 }],
    southLeft: [{ num: 'WC1', w: 0.32 }, { num: 'SDP', w: 1.0 }, { num: '204', w: 1.9 }],
    southRight: [
      { num: '208', w: 0.7 }, { num: '210', w: 2.4 }, { num: '212', w: 0.8 }, { num: '214', w: 0.45 },
    ],
    centralStair: true,
    transverseCorridor: false,
    // 201 = suite : 5 pièces profondes (façade nord) + couloir de desserte au fond
    // (avec un WC à l'ouest), séparé du couloir central par un mur.
    suites: {
      '201': {
        front: [{ num: 'P1', w: 1 }, { num: 'P2', w: 1, square: true }, { num: 'P3', w: 1 }, { num: 'P4', w: 1 }],
        endRoom: { num: 'P5', w: 1 }, // pleine profondeur, ferme le couloir à l'est
        backRooms: [{ num: 'WC2', w: 0.7 }],
        backLabel: '201',
      },
    },
  },
  // ---------------- R+2 (largeurs provisoires — à affiner à la revue R+2) ----------------
  2: {
    northLeft: [{ num: '301', w: 1.7 }, { num: '303', w: 0.6 }, { num: '305', w: 1.7 }],
    northRight: [{ num: '307', w: 1.2 }, { num: '309', w: 1.1 }, { num: '311', w: 1.5 }],
    southLeft: [
      { num: 'WC3', w: 0.3 }, { num: '302', w: 1.1 }, { num: '304', w: 1.1 }, { num: '306', w: 1.2 },
    ],
    southRight: [
      { num: '308', w: 0.7 }, { num: '310', w: 1.8 }, { num: '312', w: 0.45 }, { num: '314', w: 0.45 },
    ],
    centralStair: true,
    transverseCorridor: false,
  },
  // ---------------- R+3 (pas d'escalier central — largeurs provisoires) ----------------
  3: {
    northLeft: [
      { num: '401', w: 1.1 }, { num: '403', w: 1.1 }, { num: '405', w: 1.1 }, { num: '407', w: 1.1 },
      { num: '409', w: 1.1 }, { num: '411', w: 1.2 }, { num: '413', w: 0.8 }, { num: '415', w: 0.8 },
    ],
    northRight: [],
    southLeft: [
      { num: 'WC4', w: 0.3 }, { num: '402', w: 1.1 }, { num: '404', w: 1.1 }, { num: '406', w: 1.1 },
      { num: '408', w: 1.1 }, { num: '410', w: 1.1 }, { num: '412', w: 1.6 }, { num: 'WC5', w: 0.3 },
    ],
    southRight: [],
    centralStair: false,
    transverseCorridor: false,
  },
}

const salleByNum = (etage: number, num: string): Salle =>
  SALLES.find((s) => s.etage === etage && s.num === num)!

const sumW = (slots: Slot[]) => slots.reduce((a, s) => a + s.w, 0)

/** Construit la liste des solides (salles + escaliers + couloir) d'un étage,
 *  en coords monde centrées, à partir de sa table explicite. */
export function buildFloor(etage: number): Solid[] {
  const L = FLOORS[etage] ?? FLOORS[0]
  const sh = H * 0.92
  const zNord = MARGIN
  const zSud = MARGIN + ROOM_D + CORR
  const x0 = MARGIN
  const xEnd = MARGIN + INNER

  // Suite subdivisée sur l'empreinte [xa, xb] de la bande nord (profondeur ROOM_D).
  // Pièces profondes en façade (nord) + couloir de desserte au fond (sud), avec
  // d'éventuelles petites salles à l'ouest et un mur côté couloir principal.
  const buildSuite = (out: Solid[], suite: Suite, xa: number, xb: number, zBand: number) => {
    const span = xb - xa
    const dFront = ROOM_D * 0.72 // pièces très rectangulaires (plus profondes que larges)
    const dBack = ROOM_D - dFront // couloir de desserte étroit
    const zBackTop = zBand + dFront
    const unit = sumW(suite.front) + (suite.endRoom ? suite.endRoom.w : 0) || 1

    const addRoom = (num: string, x0: number, x1: number, zTop: number, depth: number) => {
      const s = salleByNum(etage, num)
      out.push({
        kind: 'room', salle: s,
        x: (x0 + x1) / 2 - CX, z: zTop + depth / 2 - CZ, w: x1 - x0, d: depth, h: H,
      })
    }

    // façade : pièces desservies par le couloir. Une pièce « carrée » est moins
    // profonde (profondeur = largeur) → le couloir gagne une alcôve derrière elle.
    let px = xa
    for (const f of suite.front) {
      const w = (f.w / unit) * span
      const depth = f.square ? Math.min(w, dFront) : dFront
      addRoom(f.num, px, px + w, zBand, depth)
      if (depth < dFront - 0.01) {
        out.push({
          kind: 'corridor',
          x: px + w / 2 - CX, z: zBand + (depth + dFront) / 2 - CZ, w, d: dFront - depth,
        })
      }
      px += w
    }
    const xSplit = px // bord ouest de la pièce de bout
    // pièce de bout, pleine profondeur (ferme le couloir)
    if (suite.endRoom) addRoom(suite.endRoom.num, xSplit, xb, zBand, ROOM_D)

    // fond : couloir de desserte sur toute la largeur (jusqu'à la pièce de bout),
    // bord bien droit ; les petites salles (WC) sont posées dessus à l'ouest.
    out.push({
      kind: 'corridor', label: suite.backLabel,
      x: (xa + xSplit) / 2 - CX, z: zBackTop + dBack / 2 - CZ, w: xSplit - xa, d: dBack,
    })
    let bx = xa
    for (const r of suite.backRooms) {
      const w = (r.w / unit) * span
      addRoom(r.num, bx, bx + w, zBackTop, dBack)
      bx += w
    }
    // mur visible entre le couloir de la suite et le couloir central (bord sud)
    out.push({
      kind: 'wall',
      x: (xa + xSplit) / 2 - CX, z: zBand + ROOM_D - CZ, w: xSplit - xa, d: 0.12, h: H * 0.6,
    })
  }

  // Place des salles par poids relatif sur [xa, xb] (les slots-suite sont éclatés).
  const place = (slots: Slot[], xa: number, xb: number, z0: number): Solid[] => {
    const out: Solid[] = []
    const W = sumW(slots) || 1
    const span = xb - xa
    let cx = xa
    for (const slot of slots) {
      const w = (slot.w / W) * span
      const suite = L.suites?.[slot.num]
      if (suite) {
        buildSuite(out, suite, cx, cx + w, z0)
      } else {
        const s = salleByNum(etage, slot.num)
        out.push({
          kind: 'room', salle: s,
          x: cx + w / 2 - CX, z: z0 + ROOM_D / 2 - CZ, w, d: ROOM_D, h: H,
        })
      }
      cx += w
    }
    return out
  }
  const stairAt = (xa: number, xb: number, z0: number, label?: string): StairSolid => ({
    kind: 'stair', label,
    x: (xa + xb) / 2 - CX, z: z0 + ROOM_D / 2 - CZ,
    w: xb - xa, d: ROOM_D, h: sh,
  })
  const corridorAt = (xa: number, xb: number, z0: number): CorridorSolid => ({
    kind: 'corridor',
    x: (xa + xb) / 2 - CX, z: z0 + ROOM_D / 2 - CZ,
    w: xb - xa, d: ROOM_D,
  })

  const solids: Solid[] = []
  // cages d'extrémité (toujours présentes, rangée sud)
  solids.push(stairAt(x0, x0 + WEST_W, zSud, 'Esc. O'))
  solids.push(stairAt(xEnd - EAST_W, xEnd, zSud, 'Esc. E'))

  if (L.centralStair) {
    // rangée sud coupée par le noyau central (escalier, X fixe)
    solids.push(...place(L.southLeft, x0 + WEST_W, CORE_LX, zSud))
    solids.push(...place(L.southRight, CORE_RX, xEnd - EAST_W, zSud))
    solids.push(stairAt(CORE_LX, CORE_RX, zSud, 'Esc. C'))
    if (L.transverseCorridor) {
      // rangée nord coupée par le couloir transversal (RDC)
      solids.push(...place(L.northLeft, x0, CORE_LX, zNord))
      solids.push(...place(L.northRight, CORE_RX, xEnd, zNord))
      solids.push(corridorAt(CORE_LX, CORE_RX, zNord))
    } else {
      // rangée nord continue (R+1/R+2) : pas de couloir au droit du noyau
      solids.push(...place([...L.northLeft, ...L.northRight], x0, xEnd, zNord))
    }
  } else {
    // R+3 : pas de noyau central, rangées continues entre les cages d'extrémité
    solids.push(...place([...L.northLeft, ...L.northRight], x0, xEnd, zNord))
    solids.push(...place([...L.southLeft, ...L.southRight], x0 + WEST_W, xEnd - EAST_W, zSud))
  }

  return solids
}

/** Bande de couloir (centre monde et tailles) — sur toute la largeur intérieure. */
export function corridorRect() {
  const cz0 = MARGIN + ROOM_D
  return {
    x: 0,
    z: cz0 + CORR / 2 - CZ,
    w: INNER,
    d: CORR,
  }
}

export const PLINTH_RECT = { x: 0, z: 0, w: TOTAL_X, d: TOTAL_Y }
