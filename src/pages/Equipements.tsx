import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Topbar } from '../components/Topbar'
import { EtatBadge } from '../components/Badge'
import { EquipIcon, IconCheck, IconExport, IconPlus, IconSearch } from '../components/Icon'
import {
  ANNEE_REF, ETAGE_COURT, ETAGE_LABEL, ETATS, SALLES, TYPES_EQUIP, nextReference, salleKey,
} from '../data/parc'
import type { Equipement, EtatKey } from '../data/parc'
import { useParc } from '../data/parcStore'
import './Equipements.css'

type SortKey = 'reference' | 'type' | 'salle' | 'etage' | 'annee' | 'etat'
const ETAT_KEYS: EtatKey[] = ['fonctionnel', 'vetuste', 'panne', 'reforme']
const RANK_ETAT: Record<EtatKey, number> = { fonctionnel: 0, vetuste: 1, panne: 2, reforme: 3 }

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: 'reference', label: 'Référence', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: null, label: 'Modèle', sortable: false },
  { key: 'salle', label: 'Salle', sortable: true },
  { key: 'etage', label: 'Étage', sortable: true },
  { key: 'annee', label: 'Acquisition', sortable: true },
  { key: 'etat', label: 'État', sortable: true },
]

// Salles triées (étage puis numéro) pour le sélecteur du formulaire.
const SALLES_TRIEES = [...SALLES].sort((a, b) => a.etage - b.etage || a.num.localeCompare(b.num))

export function Equipements() {
  const { equipements, loading } = useParc()
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [etat, setEtat] = useState('')
  const [etage, setEtage] = useState('')
  const [vieux, setVieux] = useState(false)
  const [sortK, setSortK] = useState<SortKey>('salle')
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  // null = panneau fermé ; 'new' = ajout ; sinon = édition de cet équipement
  const [form, setForm] = useState<Equipement | 'new' | null>(null)

  const types = useMemo(() => [...new Set(equipements.map((e) => e.type))], [equipements])

  const rows = useMemo(() => {
    const age = (annee: number) => ANNEE_REF - annee
    const r = equipements.filter((e) => {
      if (type && e.type !== type) return false
      if (etat && e.etat !== etat) return false
      if (etage !== '' && String(e.etage) !== etage) return false
      if (vieux && age(e.annee) <= 5) return false
      if (q) {
        const needle = q.toLowerCase()
        const hay = `${e.reference} ${e.modele} ${e.salleNom} ${e.salle} ${e.type} ${e.numero_serie ?? ''} ${e.num_inventaire ?? ''}`.toLowerCase()
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
  }, [equipements, q, type, etat, etage, vieux, sortK, sortDir])

  function toggleSort(k: SortKey) {
    if (sortK === k) setSortDir((d) => (d === 1 ? -1 : 1))
    else { setSortK(k); setSortDir(1) }
  }

  const age = (annee: number) => ANNEE_REF - annee

  return (
    <main className="main">
      <Topbar title="Équipements" sub="Inventaire complet du parc">
        <button className="btn btn-ghost"><IconExport size={16} /> Exporter</button>
        <button className="btn btn-primary" onClick={() => setForm('new')}><IconPlus size={16} /> Ajouter</button>
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
                  <tr className="clickable" key={e.id} onClick={() => setForm(e)}>
                    <td className="cell-id">{e.reference}</td>
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
            <div className="empty">
              {loading ? 'Chargement de l’inventaire…' : 'Aucun équipement ne correspond à ces critères.'}
            </div>
          )}
        </div>
      </div>

      {form !== null && (
        <EquipForm
          initial={form === 'new' ? null : form}
          onClose={() => setForm(null)}
        />
      )}
    </main>
  )
}

/* ============================================================
   Formulaire d'ajout / édition / suppression (panneau latéral)
   ============================================================ */
function EquipForm({ initial, onClose }: { initial: Equipement | null; onClose: () => void }) {
  const { addEquip, updateEquip, removeEquip, equipements } = useParc()
  const isEdit = initial != null

  const [type, setType] = useState(initial?.type ?? TYPES_EQUIP[0])
  const [modele, setModele] = useState(initial?.modele ?? '')
  const [salleSel, setSalleSel] = useState(
    initial ? salleKey(initial.etage, initial.salle) : salleKey(SALLES_TRIEES[0].etage, SALLES_TRIEES[0].num),
  )
  const [etat, setEtat] = useState<EtatKey>(initial?.etat ?? 'fonctionnel')
  const [annee, setAnnee] = useState<number>(initial?.annee ?? ANNEE_REF)
  const [proprietaire, setProprietaire] = useState(initial?.proprietaire ?? 'Conseil départemental')
  const [serie, setSerie] = useState(initial?.numero_serie ?? '')
  const [inventaire, setInventaire] = useState(initial?.num_inventaire ?? '')
  const [os, setOs] = useState(initial?.os ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!modele.trim()) { setErr('Le modèle est obligatoire.'); return }
    setBusy(true); setErr(null)
    const [etageStr, num] = salleSel.split('|')
    const etg = Number(etageStr)
    const reference = isEdit ? initial!.reference : nextReference(type, num, equipements)
    const input = {
      reference, type, modele: modele.trim(), annee, etat,
      salle: num, etage: etg, proprietaire: proprietaire.trim() || 'Conseil départemental',
      numero_serie: serie.trim() || null,
      num_inventaire: inventaire.trim() || null,
      os: os.trim() || null,
      notes: notes.trim() || null,
    }
    try {
      if (isEdit) await updateEquip(initial!.id, input)
      else await addEquip(input)
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!isEdit) return
    if (!window.confirm(`Supprimer définitivement l’équipement ${initial!.reference} ?`)) return
    setBusy(true); setErr(null)
    try { await removeEquip(initial!.id); onClose() }
    catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur lors de la suppression.')
      setBusy(false)
    }
  }

  return (
    <>
      <div className="ef-scrim" onClick={onClose} />
      <aside className="ef-panel" aria-label={isEdit ? 'Modifier un équipement' : 'Ajouter un équipement'}>
        <div className="ef-bar">
          <div>
            <span className="eyebrow">{isEdit ? 'Modifier' : 'Nouvel équipement'}</span>
            {isEdit && <div className="ef-ref">{initial!.reference}</div>}
          </div>
          <button className="ef-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <form className="ef-body" onSubmit={submit}>
          <label className="ef-field">
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES_EQUIP.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="ef-field">
            <span>Modèle</span>
            <input
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              placeholder="ex. Dell OptiPlex 3080"
              autoFocus
            />
          </label>

          <label className="ef-field">
            <span>Salle</span>
            <select value={salleSel} onChange={(e) => setSalleSel(e.target.value)}>
              {SALLES_TRIEES.map((s) => (
                <option key={salleKey(s.etage, s.num)} value={salleKey(s.etage, s.num)}>
                  {ETAGE_COURT[s.etage]} — {s.num} · {s.nom}
                </option>
              ))}
            </select>
          </label>

          <div className="ef-row">
            <label className="ef-field">
              <span>État</span>
              <select value={etat} onChange={(e) => setEtat(e.target.value as EtatKey)}>
                {ETAT_KEYS.map((s) => <option key={s} value={s}>{ETATS[s].label}</option>)}
              </select>
            </label>
            <label className="ef-field">
              <span>Acquisition</span>
              <input
                type="number"
                value={annee}
                min={2000}
                max={ANNEE_REF}
                onChange={(e) => setAnnee(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="ef-row">
            <label className="ef-field">
              <span>Numéro de série</span>
              <input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="ex. 5CG1234ABC" />
            </label>
            <label className="ef-field">
              <span>N° inventaire (dépt.)</span>
              <input value={inventaire} onChange={(e) => setInventaire(e.target.value)} placeholder="étiquette CD57" />
            </label>
          </div>

          <div className="ef-row">
            <label className="ef-field">
              <span>Système d’exploitation</span>
              <input value={os} onChange={(e) => setOs(e.target.value)} placeholder="ex. Windows 11" list="ef-os-list" />
              <datalist id="ef-os-list">
                <option value="Windows 11" />
                <option value="Windows 10" />
                <option value="Linux" />
                <option value="ChromeOS" />
                <option value="macOS" />
              </datalist>
            </label>
            <label className="ef-field">
              <span>Propriétaire</span>
              <input value={proprietaire} onChange={(e) => setProprietaire(e.target.value)} />
            </label>
          </div>

          <label className="ef-field">
            <span>Observations</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="remarques, historique, emplacement précis…" />
          </label>

          {!isEdit && (
            <p className="ef-hint">La référence sera générée automatiquement à l’enregistrement.</p>
          )}
          {err && <p className="ef-err">{err}</p>}

          <div className="ef-actions">
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                Supprimer
              </button>
            )}
            <span style={{ flex: 1 }} />
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
