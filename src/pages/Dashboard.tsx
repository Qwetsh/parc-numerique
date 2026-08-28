import { lazy, Suspense, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Topbar } from '../components/Topbar'
import { Badge } from '../components/Badge'
import {
  IconAlert, IconArrowUp, IconClock, IconMonitor, IconPlus, IconSearch, IconTrend,
} from '../components/Icon'
import { ANNEE_REF, ETAGE_COURT, ETATS, SALLES } from '../data/parc'
import type { EtatKey } from '../data/parc'
import { useParc } from '../data/parcStore'
import './Dashboard.css'

// La tour 3D (Three.js) est chargée à la demande pour garder le dashboard léger.
const BuildingTower3D = lazy(() => import('../college3d/BuildingTower3D'))

const ETAT_ORDER: EtatKey[] = ['fonctionnel', 'vetuste', 'panne', 'reforme']
const ETAT_COLOR: Record<EtatKey, string> = {
  fonctionnel: 'var(--ok-solid)',
  vetuste: 'var(--warn-solid)',
  panne: 'var(--bad-solid)',
  reforme: 'var(--gone-solid)',
}

interface Kpi {
  label: string
  num: ReactNode
  icon: ReactNode
  foot: ReactNode
  gauge?: number
  alert?: boolean
}

export function Dashboard() {
  const { equipements, santeSalle, equipOf } = useParc()

  const data = useMemo(() => {
    const eq = equipements
    const total = eq.length
    // L'âge n'est calculé que sur les fiches dont l'année est renseignée :
    // un matériel relevé sur le terrain n'a pas encore d'année d'achat.
    const dates = eq.filter((e): e is typeof e & { annee: number } => e.annee != null)
    const ageMoy = dates.length
      ? dates.reduce((a, e) => a + (ANNEE_REF - e.annee), 0) / dates.length
      : 0
    const vieux = dates.filter((e) => ANNEE_REF - e.annee > 5).length
    const pctVieux = dates.length ? Math.round((vieux / dates.length) * 100) : 0
    const enPanne = eq.filter((e) => e.etat === 'panne').length

    const counts: Record<EtatKey, number> = { fonctionnel: 0, vetuste: 0, panne: 0, reforme: 0 }
    eq.forEach((e) => { counts[e.etat]++ })

    const maxFloor = Math.max(1, ...[0, 1, 2, 3].map((f) => eq.filter((e) => e.etage === f).length))
    const floors = [3, 2, 1, 0].map((f) => {
      const items = eq.filter((e) => e.etage === f)
      const segs = ETAT_ORDER.map((o) => ({ etat: o, n: items.filter((e) => e.etat === o).length }))
        .filter((s) => s.n > 0)
      return { f, total: items.length, segs }
    })

    const watch = SALLES.map((s) => ({ s, sante: santeSalle(s.etage, s.num), items: equipOf(s.etage, s.num) }))
      .filter((x) => x.sante === 'panne' || x.sante === 'vetuste')
      .sort((a, b) => (a.sante === 'panne' ? 0 : 1) - (b.sante === 'panne' ? 0 : 1))
      .slice(0, 6)

    const typeCounts: Record<string, number> = {}
    eq.forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1 })
    const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
    const maxType = Math.max(1, ...Object.values(typeCounts))

    return { total, datees: dates.length, ageMoy, vieux, pctVieux, enPanne, counts, maxFloor, floors, watch, types, maxType }
  }, [equipements, santeSalle, equipOf])

  const kpis: Kpi[] = [
    {
      label: 'Équipements au total',
      num: data.total.toLocaleString('fr-FR'),
      icon: <IconMonitor />,
      foot: <span>sur 4 étages · 1 site</span>,
    },
    {
      label: 'Âge moyen du parc',
      num: <>{data.ageMoy.toFixed(1)}<small> ans</small></>,
      icon: <IconClock />,
      foot: data.datees < data.total
        ? <span>sur {data.datees} fiche{data.datees > 1 ? 's' : ''} datée{data.datees > 1 ? 's' : ''} / {data.total}</span>
        : <span className="trend down"><IconArrowUp size={12} /> renouvelé en 2024</span>,
    },
    {
      label: 'Matériel de + de 5 ans',
      num: <>{data.pctVieux}<small> %</small></>,
      icon: <IconTrend />,
      gauge: data.pctVieux,
      foot: <span>{data.vieux} équipements concernés</span>,
    },
    {
      label: 'Équipements en panne',
      num: data.enPanne,
      icon: <IconAlert />,
      alert: true,
      foot: <span className="trend up">2 salles touchées</span>,
    },
  ]

  const poste = (n: number) => `${n}${n > 1 ? ' postes' : ' poste'}`

  return (
    <main className="main">
      <Topbar title="Tableau de bord" sub="Vue d'ensemble du parc — données d'exemple">
        <div className="field" style={{ width: 280 }}>
          <IconSearch size={16} />
          <input placeholder="Rechercher…" />
        </div>
        <button className="btn btn-primary"><IconPlus size={16} /> Ajouter un équipement</button>
      </Topbar>

      <div className="content">
        {/* KPIs */}
        <div className="kpis">
          {kpis.map((k) => (
            <div className={`card kpi ${k.alert ? 'alert' : ''}`} key={k.label}>
              <div className="top">
                <span className="label">{k.label}</span>
                <span className="ic">{k.icon}</span>
              </div>
              <div className="num tnum">{k.num}</div>
              {k.gauge != null && (
                <div className="gauge"><i style={{ width: `${k.gauge}%` }} /></div>
              )}
              <div className="foot">{k.foot}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Répartition par état */}
          <div className="card card-pad">
            <div className="panel-head">
              <h3>Répartition par état</h3>
              <Link to="/equipements">Voir les équipements →</Link>
            </div>
            <div className="stack">
              {ETAT_ORDER.filter((o) => data.counts[o] > 0).map((o) => (
                <div key={o} style={{ flex: data.counts[o], background: ETAT_COLOR[o] }} title={ETATS[o].label}>
                  {data.counts[o]}
                </div>
              ))}
            </div>
            <div className="legend">
              {ETAT_ORDER.map((o) => (
                <div className="li" key={o}>
                  <span className="sw2" style={{ background: ETAT_COLOR[o] }} />
                  <span className="nm">{ETATS[o].label}</span>
                  <span className="vl tnum">{data.counts[o]}</span>
                  <span className="pc tnum">{Math.round((data.counts[o] / data.total) * 100)} %</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maquette 3D du collège */}
          <Suspense fallback={<div className="card tw-card tw-loading">Chargement de la maquette…</div>}>
            <BuildingTower3D />
          </Suspense>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Salles à surveiller */}
          <div className="card card-pad">
            <div className="panel-head">
              <h3>Salles à surveiller</h3>
              <Link to="/vue-college">Ouvrir la maquette →</Link>
            </div>
            <div className="watch">
              {data.watch.map(({ s, sante, items }) => {
                const cls = sante === 'panne' ? 'bad' : 'warn'
                const nbPanne = items.filter((e) => e.etat === 'panne').length
                const nbVet = items.filter((e) => e.etat === 'vetuste').length
                const detail = sante === 'panne'
                  ? `${nbPanne} en panne · ${poste(items.length)}`
                  : `${nbVet} vétuste · ${poste(items.length)}`
                const showNum = s.nom !== 'Salle ' + s.num
                return (
                  <div className="item" key={`${s.etage}-${s.num}`}>
                    <div className={`rm ${cls}`}>{ETAGE_COURT[s.etage]}</div>
                    <div className="info">
                      <div className="t">{showNum ? `${s.nom} · ${s.num}` : s.nom}</div>
                      <div className="d">{detail}</div>
                    </div>
                    <Badge sante={sante} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Répartition par type */}
          <div className="card card-pad">
            <div className="panel-head"><h3>Répartition par type</h3></div>
            <div className="floors">
              {data.types.map(([t, n]) => (
                <div className="floor-row" key={t} style={{ gridTemplateColumns: '110px 1fr 44px' }}>
                  <span className="fl" style={{ fontWeight: 500, color: 'var(--ink-600)' }}>{t}</span>
                  <span className="bar">
                    <i style={{ width: `${(n / data.maxType) * 100}%`, background: 'var(--brand-500)' }} />
                  </span>
                  <span className="ct tnum">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
