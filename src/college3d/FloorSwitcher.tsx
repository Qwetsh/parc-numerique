import { useMemo } from 'react'
import { ETAGE_COURT, ETAGE_LABEL, SALLES, santeSalle } from '../data/parc'
import type { SanteKey } from '../data/parc'

const DOT_CLS: Partial<Record<SanteKey, string>> = { panne: 'bad', vetuste: 'warn', fonctionnel: 'ok' }

interface Props {
  etage: number
  onChange: (etage: number) => void
}

export function FloorSwitcher({ etage, onChange }: Props) {
  const floors = useMemo(() =>
    [3, 2, 1, 0].map((f) => {
      const salles = SALLES.filter((s) => s.etage === f)
      const counts: Record<string, number> = { panne: 0, vetuste: 0, fonctionnel: 0, none: 0 }
      salles.forEach((s) => { counts[santeSalle(s)]++ })
      return { f, total: salles.length, counts }
    }), [])

  return (
    <div className="floors-sw">
      {floors.map(({ f, total, counts }) => (
        <button
          key={f}
          className={`floor-btn ${f === etage ? 'active' : ''}`}
          onClick={() => onChange(f)}
          aria-pressed={f === etage}
        >
          <span className="fb-short">{ETAGE_COURT[f]}</span>
          <span className="fb-meta">
            <span className="fb-name">{ETAGE_LABEL[f]}</span>
            <span className="fb-dots">
              {(['panne', 'vetuste', 'fonctionnel'] as SanteKey[]).map((k) =>
                counts[k] ? <span key={k} className={`fdot ${DOT_CLS[k]}`} title={String(counts[k])} /> : null,
              )}
              <span className="fb-n">{total} salles</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
