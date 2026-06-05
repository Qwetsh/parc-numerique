import type { WifiKey } from '../data/parc'

export const WIFI_LABEL: Record<WifiKey, string> = {
  bonne: 'Bonne',
  moyenne: 'Moyenne',
  faible: 'Faible',
}

/** Indicateur de qualité wifi (3 barres). */
export function Wifi({ level }: { level: WifiKey }) {
  return (
    <span className={`wifi ${level}`} aria-label={`Wifi ${WIFI_LABEL[level]}`}>
      <i /><i /><i />
    </span>
  )
}
