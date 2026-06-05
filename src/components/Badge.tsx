import type { EtatCls, SanteKey } from '../data/parc'
import { ETATS } from '../data/parc'

const SANTE_CLS: Record<SanteKey, EtatCls | 'none'> = {
  fonctionnel: 'ok',
  vetuste: 'warn',
  panne: 'bad',
  reforme: 'gone',
  none: 'none',
}

const SANTE_LABEL: Record<SanteKey, string> = {
  fonctionnel: 'Fonctionnel',
  vetuste: 'Vétuste',
  panne: 'En panne',
  reforme: 'Réformé',
  none: 'Sans poste',
}

/** Badge d'état sémantique (couleur toujours doublée par le libellé). */
export function Badge({ sante }: { sante: SanteKey }) {
  return (
    <span className={`badge ${SANTE_CLS[sante]}`}>
      <span className="dot" />
      {SANTE_LABEL[sante]}
    </span>
  )
}

export function EtatBadge({ etat }: { etat: keyof typeof ETATS }) {
  const def = ETATS[etat]
  return (
    <span className={`badge ${def.cls}`}>
      <span className="dot" />
      {def.label}
    </span>
  )
}
