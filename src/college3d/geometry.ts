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

/** Construit la liste des solides (salles + escaliers) d'un étage, en coords monde centrées.
 *
 *  Modèle (d'après le plan 2D) :
 *  - rangée NORD = salles uniquement, sur toute la largeur intérieure (201 … 215) ;
 *  - rangée SUD  = cage d'escalier OUEST (coin SO) + salles + cage CENTRALE (RDC/R+1/R+2)
 *    + salles + cage EST (coin SE). Les escaliers sont à des positions X fixes, identiques
 *    à tous les étages (cohérence verticale d'un bâtiment réel). */
export function buildFloor(etage: number): Solid[] {
  const salles = SALLES.filter((s) => s.etage === etage)
  const nord = salles.filter((s) => s.cote === 'nord').sort((a, b) => numOrder(a) - numOrder(b))
  const sud = salles.filter((s) => s.cote === 'sud').sort((a, b) => numOrder(a) - numOrder(b))
  const sh = H * 0.92

  const zNord = MARGIN
  const zSud = MARGIN + ROOM_D + CORR

  const x0 = MARGIN // bord intérieur ouest
  const xEnd = MARGIN + INNER // bord intérieur est
  const center = (x0 + xEnd) / 2 // centre du bâtiment (escalier central)

  // Place une liste de salles, réparties par poids sur l'intervalle X [xa, xb].
  function placeRooms(list: Salle[], xa: number, xb: number, z0: number): RoomSolid[] {
    const W = list.reduce((a, s) => a + weight(s), 0) || 1
    const span = xb - xa
    let cx = xa
    return list.map((s) => {
      const w = (weight(s) / W) * span
      const solid: RoomSolid = {
        kind: 'room', salle: s, sante: santeSalle(s),
        x: cx + w / 2 - CX, z: z0 + ROOM_D / 2 - CZ, w, d: ROOM_D, h: H,
      }
      cx += w
      return solid
    })
  }

  const stairAt = (xa: number, xb: number, label?: string): StairSolid => ({
    kind: 'stair', label,
    x: (xa + xb) / 2 - CX, z: zSud + ROOM_D / 2 - CZ,
    w: xb - xa, d: ROOM_D, h: sh,
  })

  // Rangée nord : salles sur toute la largeur.
  const solids: Solid[] = [...placeRooms(nord, x0, xEnd, zNord)]

  // Rangée sud : escaliers d'extrémité (côté sud uniquement) + salles.
  solids.push(stairAt(x0, x0 + SW, 'Esc. O'))
  solids.push(stairAt(xEnd - SW, xEnd, 'Esc. E'))

  if (etage !== 3) {
    // escalier central (présent RDC/R+1/R+2) — coupe la rangée sud en deux segments
    const cHalf = SW / 2
    solids.push(stairAt(center - cHalf, center + cHalf, 'Esc. C'))
    const k = Math.floor(sud.length / 2)
    solids.push(...placeRooms(sud.slice(0, k), x0 + SW, center - cHalf, zSud))
    solids.push(...placeRooms(sud.slice(k), center + cHalf, xEnd - SW, zSud))
  } else {
    // R+3 : pas d'escalier central, salles entre les deux cages d'extrémité
    solids.push(...placeRooms(sud, x0 + SW, xEnd - SW, zSud))
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
