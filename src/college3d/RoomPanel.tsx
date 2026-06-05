import { useEffect, useRef } from 'react'
import { Badge, EtatBadge } from '../components/Badge'
import { Wifi, WIFI_LABEL } from '../components/Wifi'
import { EquipIcon, IconClose } from '../components/Icon'
import { ETAGE_LABEL, nbPostes, santeSalle } from '../data/parc'
import type { EquipGroupe, Salle } from '../data/parc'

interface Props {
  salle: Salle | null
  onClose: () => void
}

function groupEquip(equip: EquipGroupe[]): EquipGroupe[] {
  const groups: Record<string, EquipGroupe> = {}
  equip.forEach((g) => {
    const k = `${g.type}|${g.modele}|${g.etat}`
    if (!groups[k]) groups[k] = { ...g, n: 0 }
    groups[k].n += g.n
  })
  return Object.values(groups)
}

export function RoomPanel({ salle, onClose }: Props) {
  // conserve la dernière salle affichée pour l'animation de fermeture
  const last = useRef<Salle | null>(salle)
  if (salle) last.current = salle
  const s = salle ?? last.current

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = salle != null

  let content = null
  if (s) {
    const sante = santeSalle(s)
    const groups = groupEquip(s.equip)
    const total = nbPostes(s)
    const nbF = s.equip.filter((e) => e.etat === 'fonctionnel').reduce((a, e) => a + e.n, 0)
    const nbW = s.equip.filter((e) => e.etat === 'vetuste').reduce((a, e) => a + e.n, 0)
    const nbB = s.equip.filter((e) => e.etat === 'panne').reduce((a, e) => a + e.n, 0)

    content = (
      <div className="p-body">
        <div className="p-top">
          <div className="p-num">{s.num}</div>
          <div>
            <div className="p-name">{s.nom}</div>
            <div className="p-type">{s.type} · {ETAGE_LABEL[s.etage]}</div>
          </div>
        </div>

        <div className="p-tags">
          <Badge sante={sante} />
          <span className="p-wifi">Wifi <Wifi level={s.wifi} /> {WIFI_LABEL[s.wifi]}</span>
        </div>

        {total > 0 && (
          <div className="p-stats">
            <div className="st"><div className="v tnum">{total}</div><div className="l">poste{total > 1 ? 's' : ''}</div></div>
            <div className="st"><div className="v tnum" style={{ color: 'var(--ok-ink)' }}>{nbF}</div><div className="l">fonctionnel{nbF > 1 ? 's' : ''}</div></div>
            {nbW > 0 && <div className="st"><div className="v tnum" style={{ color: 'var(--warn-ink)' }}>{nbW}</div><div className="l">vétuste{nbW > 1 ? 's' : ''}</div></div>}
            {nbB > 0 && <div className="st"><div className="v tnum" style={{ color: 'var(--bad-ink)' }}>{nbB}</div><div className="l">en panne</div></div>}
          </div>
        )}

        <div className="p-sec">Équipements</div>
        <div className="eq-list">
          {groups.length > 0 ? (
            groups.map((g, i) => (
              <div className="eq-row" key={i}>
                <span className="eq-ic"><EquipIcon type={g.type} size={17} /></span>
                <div className="eq-meta">
                  <div className="eq-t">{g.type}{g.n > 1 && <span className="eq-n"> ×{g.n}</span>}</div>
                  <div className="eq-m">{g.modele} · {g.annee}</div>
                </div>
                <EtatBadge etat={g.etat} />
              </div>
            ))
          ) : (
            <div className="eq-empty">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 5 18 14" />
              </svg>
              <div>Aucun équipement<br /><span>Salle non équipée (« X » au plan)</span></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <aside className={`panel ${open ? 'open' : ''}`} aria-live="polite" aria-hidden={!open}>
      <div className="panel-bar">
        <span className="eyebrow">Détail de la salle</span>
        <button className="panel-close" onClick={onClose} aria-label="Fermer">
          <IconClose size={17} />
        </button>
      </div>
      {content}
    </aside>
  )
}
