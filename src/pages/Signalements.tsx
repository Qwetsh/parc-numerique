import { useEffect, useMemo, useState } from 'react'
import { Topbar } from '../components/Topbar'
import { ETAGE_COURT } from '../data/parc'
import {
  STATUT_LABEL, listSignalements, setStatut,
} from '../lib/signalements'
import type { Signalement, Statut } from '../lib/signalements'
import './Signalements.css'

const STATUTS: Statut[] = ['ouvert', 'en_cours', 'resolu']

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function Signalements() {
  const [items, setItems] = useState<Signalement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<Statut | 'tous'>('tous')

  useEffect(() => {
    let alive = true
    listSignalements()
      .then((d) => { if (alive) { setItems(d); setLoading(false) } })
      .catch((e) => { if (alive) { setError(e instanceof Error ? e.message : 'Erreur'); setLoading(false) } })
    return () => { alive = false }
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = { tous: items.length, ouvert: 0, en_cours: 0, resolu: 0 }
    items.forEach((s) => { c[s.statut]++ })
    return c
  }, [items])

  const rows = useMemo(
    () => (filtre === 'tous' ? items : items.filter((s) => s.statut === filtre)),
    [items, filtre],
  )

  async function changeStatut(s: Signalement, statut: Statut) {
    const prev = items
    setItems((list) => list.map((x) => (x.id === s.id ? { ...x, statut } : x))) // optimiste
    try { await setStatut(s.id, statut) }
    catch { setItems(prev) /* rollback */ }
  }

  return (
    <main className="main">
      <Topbar title="Signalements" sub="Pannes signalées par les enseignants" />

      <div className="content">
        <div className="sgl-filters">
          {(['tous', ...STATUTS] as const).map((k) => (
            <button
              key={k}
              className={`sgl-chip ${filtre === k ? 'active' : ''} st-${k}`}
              onClick={() => setFiltre(k)}
            >
              {k === 'tous' ? 'Tous' : STATUT_LABEL[k]}
              <span className="sgl-chip-n">{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading && <div className="empty">Chargement des signalements…</div>}
        {error && <div className="empty">Erreur : {error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="empty">Aucun signalement{filtre !== 'tous' ? ` « ${STATUT_LABEL[filtre as Statut]} »` : ''} pour le moment.</div>
        )}

        <div className="sgl-list">
          {rows.map((s) => (
            <div className={`sgl-card st-${s.statut}`} key={s.id}>
              <div className="sgl-main">
                <div className="sgl-top">
                  <span className="sgl-probleme">{s.probleme}</span>
                  <span className={`sgl-badge st-${s.statut}`}>{STATUT_LABEL[s.statut]}</span>
                </div>
                <div className="sgl-equip">
                  {s.equipement_ref ?? 'Équipement supprimé'}
                  {s.salle && <> · {s.salle}</>}
                  {s.etage != null && <span className="sgl-floor">{ETAGE_COURT[s.etage]}</span>}
                </div>
                {s.description && <p className="sgl-desc">{s.description}</p>}
                <div className="sgl-meta">
                  <span className="sgl-who">{s.enseignant_nom}</span>
                  {s.enseignant_email && <a href={`mailto:${s.enseignant_email}`} className="sgl-mail">{s.enseignant_email}</a>}
                  <span className="sgl-date">{formatDate(s.created_at)}</span>
                </div>
              </div>
              <div className="sgl-actions">
                {STATUTS.map((st) => (
                  <button
                    key={st}
                    className={`sgl-statut-btn st-${st} ${s.statut === st ? 'active' : ''}`}
                    onClick={() => changeStatut(s, st)}
                    disabled={s.statut === st}
                  >
                    {STATUT_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
