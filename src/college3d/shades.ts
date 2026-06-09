/* Teintes des volumes par santé (reprises du moteur isométrique).
   top = toit (clair), mid = corps, dark = côtés ombrés, line = contour, glyph = icône. */
import type { SanteKey } from '../data/parc'

export interface Shade {
  top: string
  mid: string
  dark: string
  line: string
  glyph: string
}

export const SHADE: Record<SanteKey, Shade> = {
  fonctionnel: { top: '#e6f5ec', mid: '#cbe9d4', dark: '#b4ddc0', line: '#5fb682', glyph: '✓' },
  vetuste: { top: '#fbeed8', mid: '#f4dba6', dark: '#eccd87', line: '#d49a3a', glyph: '!' },
  panne: { top: '#fbe4e0', mid: '#f3c6bf', dark: '#eab0a7', line: '#d96a59', glyph: '✕' },
  reforme: { top: '#eaedf2', mid: '#d6dde6', dark: '#c6cfdb', line: '#9fadbe', glyph: '–' },
  none: { top: '#eef2f7', mid: '#dfe6ee', dark: '#d0d9e4', line: '#c4cedb', glyph: '·' },
}

/** Salle avec ≥1 signalement de panne non résolu : rouge vif d'alerte, distinct
 *  du « panne » d'inventaire (rose doux). Prioritaire sur la couleur de santé. */
export const ALERT_SHADE: Shade = { top: '#fee2e2', mid: '#ef4444', dark: '#c81e1e', line: '#b91c1c', glyph: '!' }

export const PLINTH_SHADE = { top: '#eef2f7', mid: '#dbe2ec', dark: '#c8d2df' }
export const CORR_FILL = '#e4eaf2'
export const STAIR_SHADE: Shade = { top: '#dde4ee', mid: '#c4cedd', dark: '#b2bed0', line: '#9aa7bb', glyph: '' }

export const SANTE_LABEL: Record<SanteKey, string> = {
  fonctionnel: 'Fonctionnel',
  vetuste: 'Vétuste',
  panne: 'En panne',
  reforme: 'Réformé',
  none: 'Sans poste',
}
