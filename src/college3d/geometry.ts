/* ============================================================
   Géométrie du bâtiment — port 3D du moteur isométrique.
   Le plan d'origine raisonne en (x = longueur, y = profondeur).
   Ici on mappe : plan.x -> monde X, plan.y -> monde Z, hauteur -> monde Y.
   Le bâtiment est recentré autour de l'origine.
   ============================================================ */
import { SALLES, nbPostes, santeSalle } from '../data/parc'
import type { Salle, SanteKey } from '../data/parc'

export const SW = 2.7 // emprise cage d'escalier (x)
export const ROOM_D = 3.6 // profondeur d'une salle (z)
export const CORR = 2.1 // largeur couloir
export const MARGIN = 0.9 // marge socle
export const H = 1.75 // hauteur des volumes
export const PLINTH = 0.55 // épaisseur du socle
const BAY = 2.45 // largeur de référence d'une travée
const MAX_BAYS = 9 // longueur commune à tous les étages
const U = MAX_BAYS * BAY // longueur utile (salles)

export const TOTAL_X = MARGIN * 2 + SW * 2 + U
export const TOTAL_Y = MARGIN * 2 + ROOM_D * 2 + CORR

/** Demi-dimensions pour recentrer le bâtiment sur l'origine. */
const CX = TOTAL_X / 2
const CZ = TOTAL_Y / 2

export interface RoomSolid {
  kind: 'room'
  salle: Salle
  sante: SanteKey
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

export type Solid = RoomSolid | StairSolid

function numOrder(s: Salle): number {
  const n = parseInt(String(s.num).replace(/\D/g, ''), 10)
  return isNaN(n) ? s.etage * 100 : n
}

function weight(s: Salle): number {
  const n = nbPostes(s)
  if (s.type === 'Salle informatique' || s.type === 'Salle multimédia' || n >= 10) return 1.95
  if (s.type === 'Centre de documentation') return 1.55
  if (s.type === 'Salle des professeurs') return 1.25
  return 1
}

/** Construit la liste des solides (salles + escaliers) d'un étage, en coords monde centrées. */
export function buildFloor(etage: number): Solid[] {
  const salles = SALLES.filter((s) => s.etage === etage)
  const nord = salles.filter((s) => s.cote === 'nord').sort((a, b) => numOrder(a) - numOrder(b))
  const sud = salles.filter((s) => s.cote === 'sud').sort((a, b) => numOrder(a) - numOrder(b))
  const x0Rooms = MARGIN + SW

  function placeRow(list: Salle[], z0: number): RoomSolid[] {
    const W = list.reduce((a, s) => a + weight(s), 0)
    let cx = x0Rooms
    return list.map((s) => {
      const w = (weight(s) / W) * U
      const solid: RoomSolid = {
        kind: 'room',
        salle: s,
        sante: santeSalle(s),
        x: cx + w / 2 - CX,
        z: z0 + ROOM_D / 2 - CZ,
        w,
        d: ROOM_D,
        h: H,
      }
      cx += w
      return solid
    })
  }

  const zNord = MARGIN
  const zSud = MARGIN + ROOM_D + CORR
  const solids: Solid[] = [...placeRow(nord, zNord), ...placeRow(sud, zSud)]

  // Cages d'escalier (ouest / est), scindées nord/sud
  const sh = H * 0.92
  const wX0 = MARGIN
  const eX0 = MARGIN + SW + U
  const zS0 = MARGIN + ROOM_D + CORR

  const mkStair = (x0: number, z0: number, label?: string): StairSolid => ({
    kind: 'stair',
    label,
    x: x0 + SW / 2 - CX,
    z: z0 + ROOM_D / 2 - CZ,
    w: SW,
    d: ROOM_D,
    h: sh,
  })

  solids.push(mkStair(wX0, zNord))
  solids.push(mkStair(wX0, zS0, 'Esc. O'))
  solids.push(mkStair(eX0, zNord))
  solids.push(mkStair(eX0, zS0, 'Esc. E'))

  return solids
}

/** Bande de couloir (centre monde et tailles). */
export function corridorRect() {
  const cz0 = MARGIN + ROOM_D
  return {
    x: (MARGIN + SW + U / 2) - CX,
    z: cz0 + CORR / 2 - CZ,
    w: U,
    d: CORR,
  }
}

export const PLINTH_RECT = { x: 0, z: 0, w: TOTAL_X, d: TOTAL_Y }
