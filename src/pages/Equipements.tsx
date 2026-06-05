import { useMemo, useState } from 'react'
import { Topbar } from '../components/Topbar'
import { EtatBadge } from '../components/Badge'
import { EquipIcon, IconCheck, IconExport, IconPlus, IconSearch } from '../components/Icon'
import {
  ANNEE_REF, EQUIPEMENTS, ETAGE_COURT, ETAGE_LABEL, ETATS,
} from '../data/parc'
import type { EtatKey } from '../data/parc'
import './Equipements.css'

type SortKey = 'id' | 'type' | 'salle' | 'etage' | 'annee' | 'etat'
const ETAT_KEYS: EtatKey[] = ['fonctionnel', 'vetuste', 'panne', 'reforme']
const RANK_ETAT: Record<EtatKey, number> = { fonctionnel: 0, vetuste: 1, panne: 2, reforme: 3 }

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: 'id', label: 'Référence', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: null, label: 'Modèle', sortable: false },
  { key: 'salle', label: 'Salle', sortable: true },
  { key: 'etage', label: 'Étage', sortable: true },
  { key: 'annee', label: 'Acquisition', sortable: true },
  { key: 'etat', label: 'État', sortable: true },
]

export function Equipements() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [etat, setEtat] = useState('')
  const [etage, setEtage] = useState('')
  const [vieux, setVieux] = useState(false)
  const [sortK, setSortK] = useState<SortKey>('salle')
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  const types = useMemo(() => [...new Set(EQUIPEMENTS.map((e) => e.type))], [])

  const rows = useMemo(() => {
    const age = (annee: number) => ANNEE_REF - annee
    const r = EQUIPEMENTS.filter((e) => {
      if (type && e.type !== type) return false
      if (etat && e.etat !== etat) return false
      if (etage !== '' && String(e.etage) !== etage) return false
      if (vieux && age(e.annee) <= 5) return false
      if (q) {
        const needle = q.toLowerCase()
        const hay = `${e.id} ${e.modele} ${e.salleNom} ${e.salle} ${e.type}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
    r.sort((a, b) => {
      let av: number | string
      let bv: number | string
      switch (sortK) {
        case 'etat': av = RANK_ETAT[a.etat]; bv = RANK_ETAT[b.etat]; break
        case 'annee': av = a.annee; bv = b.annee; break
        case 'etage': av = a.etage; bv = b.etage; break
        case 'salle': av = String(a.salle); bv = String(b.salle); break
        default: av = String(a[sortK]); bv = String(b[sortK])
      }
      if (av < bv) return -1 * sortDir
      if (av > bv) return 1 * sortDir
      return 0
    })
    return r
  }, [q, type, etat, etage, vieux, sortK, sortDir])

  function toggleSort(k: SortKey) {
    if (sortK === k) setSortDir((d) => (d === 1 ? -1 : 1))
    else { setSortK(k); setSortDir(1) }
  }

  const age = (annee: number) => ANNEE_REF - annee

  return (
    <main className="main">
      <Topbar title="Équipements" sub="Inventaire complet du parc">
        <button className="btn btn-ghost"><IconExport size={16} /> Exporter</button>
        <button className="btn btn-primary"><IconPlus size={16} /> Ajouter</button>
      </Topbar>

      <div className="content">
        <div className="toolbar">
          <div className="field">
            <IconSearch size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par référence, modèle, salle…"
            />
          </div>
          <select className="sel" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous les types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="sel" value={etat} onChange={(e) => setEtat(e.target.value)}>
            <option value="">Tous les états</option>
            {ETAT_KEYS.map((s) => <option key={s} value={s}>{ETATS[s].label}</option>)}
          </select>
          <select className="sel" value={etage} onChange={(e) => setEtage(e.target.value)}>
            <option value="">Tous les étages</option>
            {[0, 1, 2, 3].map((f) => <option key={f} value={f}>{ETAGE_LABEL[f]}</option>)}
          </select>
          <button
            className="toggle-chip"
            aria-pressed={vieux}
            onClick={() => setVieux((v) => !v)}
          >
            <span className="tk"><IconCheck size={11} /></span>
            + de 5 ans
          </button>
          <div className="count"><b>{rows.length}</b> équipements</div>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.label}
                    className={`${c.sortable ? 'sortable' : ''} ${c.sortable && c.key === sortK ? 'sorted' : ''}`}
                    onClick={c.sortable && c.key ? () => toggleSort(c.key as SortKey) : undefined}
                  >
                    {c.label}
                    {c.sortable && (
                      <span className="sort-ar">
                        {c.key === sortK ? (sortDir > 0 ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const a = age(e.annee)
                const showNum = e.salleNom !== 'Salle ' + e.salle
                return (
                  <tr className="clickable" key={e.id}>
                    <td className="cell-id">{e.id}</td>
                    <td>
                      <div className="type-cell">
                        <span className="type-ic"><EquipIcon type={e.type} /></span>
                        <span className="cell-strong">{e.type}</span>
                      </div>
                    </td>
                    <td>{e.modele}</td>
                    <td>{showNum ? `${e.salleNom} · ${e.salle}` : e.salleNom}</td>
                    <td><span className="chip">{ETAGE_COURT[e.etage]}</span></td>
                    <td>
                      <div className="age-cell">
                        <span className="yr">{e.annee}</span>
                        <span className={`ag ${a > 5 ? 'old' : ''}`}>{a} an{a > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td><EtatBadge etat={e.etat} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">Aucun équipement ne correspond à ces critères.</div>
          )}
        </div>
      </div>
    </main>
  )
}
