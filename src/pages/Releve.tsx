/* ============================================================
   Relevé de terrain — pensé pour le téléphone, en marchant.
   On choisit un étage, on entre dans une salle, on incrémente le
   matériel qu'on voit. Chaque appui écrit immédiatement en base :
   pas de bouton « enregistrer » à oublier en sortant de la salle.

   Une salle sans matériel est indiscernable d'une salle pas encore
   visitée : le bouton « Rien ici » mémorise le passage dans le
   navigateur (localStorage), ce qui suffit à suivre une tournée.
   ============================================================ */
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EquipIcon, IconCheck } from '../components/Icon'
import { ETAGE_COURT, ETAGE_LABEL, SALLES, TYPES_MATERIEL, salleKey } from '../data/parc'
import type { Equipement } from '../data/parc'
import { useParc } from '../data/parcStore'
import './Releve.css'

const ETAGES = [0, 1, 2, 3]
const CLE_VUES = 'parc.releve.vues.v1'

function lireVues(): Set<string> {
  try {
    const raw = localStorage.getItem(CLE_VUES)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function ecrireVues(v: Set<string>): void {
  try { localStorage.setItem(CLE_VUES, JSON.stringify([...v])) } catch { /* mode privé */ }
}

export function Releve() {
  const { equipOf, loading, error } = useParc()
  const [etage, setEtage] = useState(0)
  const [ouverte, setOuverte] = useState<string | null>(null)
  const [vues, setVues] = useState<Set<string>>(lireVues)

  const sallesEtage = useMemo(() => SALLES.filter((s) => s.etage === etage), [etage])

  const marquerVue = useCallback((k: string) => {
    setVues((prev) => {
      const next = new Set(prev).add(k)
      ecrireVues(next)
      return next
    })
  }, [])

  // Nombre de salles de l'étage déjà traitées : celles qui contiennent du
  // matériel, plus celles explicitement marquées « rien ici ».
  const avancement = useMemo(() => {
    const faites = sallesEtage.filter((s) => {
      const k = salleKey(s.etage, s.num)
      return vues.has(k) || equipOf(s.etage, s.num).length > 0
    }).length
    return { faites, total: sallesEtage.length }
  }, [sallesEtage, vues, equipOf])

  if (loading) {
    return <div className="rv-wrap"><div className="rv-card"><p className="rv-info">Chargement de l’inventaire…</p></div></div>
  }
  if (error) {
    return <div className="rv-wrap"><div className="rv-card"><p className="rv-info rv-bad">Erreur : {error}</p></div></div>
  }

  const salleOuverte = ouverte ? sallesEtage.find((s) => salleKey(s.etage, s.num) === ouverte) : undefined

  if (salleOuverte) {
    const idx = sallesEtage.indexOf(salleOuverte)
    const suivante = sallesEtage[idx + 1]
    return (
      <SalleReleve
        etage={salleOuverte.etage}
        num={salleOuverte.num}
        nom={salleOuverte.nom}
        usage={salleOuverte.type}
        onRetour={() => setOuverte(null)}
        onVue={() => marquerVue(salleKey(salleOuverte.etage, salleOuverte.num))}
        onSuivante={suivante ? () => {
          marquerVue(salleKey(salleOuverte.etage, salleOuverte.num))
          setOuverte(salleKey(suivante.etage, suivante.num))
        } : undefined}
        nomSuivante={suivante ? `${suivante.num} · ${suivante.nom}` : undefined}
      />
    )
  }

  return (
    <div className="rv-wrap">
      <div className="rv-card">
        <div className="rv-head">
          <div>
            <div className="rv-title">Relevé du matériel</div>
            <div className="rv-sub">Salle par salle, sur le terrain</div>
          </div>
          <Link to="/" className="rv-sortie">Quitter</Link>
        </div>

        <div className="rv-etages" role="tablist" aria-label="Étage">
          {ETAGES.map((e) => (
            <button
              key={e}
              role="tab"
              aria-selected={e === etage}
              className={`rv-etage ${e === etage ? 'on' : ''}`}
              onClick={() => setEtage(e)}
            >
              {ETAGE_COURT[e]}
            </button>
          ))}
        </div>

        <p className="rv-avancement">
          {ETAGE_LABEL[etage]} — <strong>{avancement.faites}</strong> salle{avancement.faites > 1 ? 's' : ''} sur {avancement.total}
        </p>

        <ul className="rv-salles">
          {sallesEtage.map((s) => {
            const k = salleKey(s.etage, s.num)
            const n = equipOf(s.etage, s.num).length
            const faite = n > 0 || vues.has(k)
            return (
              <li key={k}>
                <button className={`rv-salle ${faite ? 'faite' : ''}`} onClick={() => setOuverte(k)}>
                  <span className="rv-salle-id">{s.num}</span>
                  <span className="rv-salle-nom">{s.nom}</span>
                  {n > 0 ? (
                    <span className="rv-salle-n">{n}</span>
                  ) : faite ? (
                    <span className="rv-salle-ok"><IconCheck size={14} /></span>
                  ) : (
                    <span className="rv-salle-vide">—</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/* ============================================================
   Écran d'une salle : un compteur par type de matériel.
   ============================================================ */
function SalleReleve({
  etage, num, nom, usage, onRetour, onVue, onSuivante, nomSuivante,
}: {
  etage: number
  num: string
  nom: string
  usage: string
  onRetour: () => void
  onVue: () => void
  onSuivante?: () => void
  nomSuivante?: string
}) {
  const { equipOf, ajouterMateriel, removeEquip } = useParc()
  const [enCours, setEnCours] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const presents = equipOf(etage, num)
  const parType = useMemo(() => {
    const m = new Map<string, Equipement[]>()
    for (const e of presents) {
      const arr = m.get(e.type)
      if (arr) arr.push(e)
      else m.set(e.type, [e])
    }
    return m
  }, [presents])

  // Les types du catalogue, plus ceux déjà présents en salle qui n'y figurent pas.
  const types = useMemo(() => {
    const connus = TYPES_MATERIEL.map((t) => t.label)
    const extras = [...parType.keys()].filter((t) => !connus.includes(t))
    return [...connus, ...extras]
  }, [parType])

  async function ajouter(type: string) {
    setEnCours(type); setErr(null)
    try { await ajouterMateriel(type, etage, num); onVue() }
    catch (e) { setErr(e instanceof Error ? e.message : 'Enregistrement impossible.') }
    finally { setEnCours(null) }
  }

  async function retirer(type: string) {
    const liste = parType.get(type) ?? []
    if (liste.length === 0) return
    // On retire le dernier ajouté. Si c'est une fiche déjà documentée
    // (modèle, n° de série…), on demande confirmation : ce n'est pas une
    // ligne créée à la volée pendant le relevé.
    const cible = liste[liste.length - 1]
    const documentee = Boolean(cible.modele || cible.numero_serie || cible.num_inventaire)
    if (documentee && !window.confirm(
      `${cible.reference} est une fiche déjà renseignée. La supprimer définitivement ?`,
    )) return
    setEnCours(type); setErr(null)
    try { await removeEquip(cible.id) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Suppression impossible.') }
    finally { setEnCours(null) }
  }

  const total = presents.length

  return (
    <div className="rv-wrap">
      <div className="rv-card">
        <div className="rv-head">
          <button className="rv-retour" onClick={onRetour} aria-label="Retour à la liste des salles">‹</button>
          <div>
            <div className="rv-title">{num} · {nom}</div>
            <div className="rv-sub">{usage} — {ETAGE_LABEL[etage]}</div>
          </div>
        </div>

        <p className="rv-avancement">
          {total === 0 ? 'Aucun matériel enregistré' : <><strong>{total}</strong> matériel{total > 1 ? 's' : ''} dans cette salle</>}
        </p>

        {err && <p className="rv-err">{err}</p>}

        <ul className="rv-types">
          {types.map((type) => {
            const n = (parType.get(type) ?? []).length
            const busy = enCours === type
            return (
              <li key={type} className={`rv-type ${n > 0 ? 'on' : ''}`}>
                <span className="rv-type-ic"><EquipIcon type={type} size={20} /></span>
                <span className="rv-type-nom">{type}</span>
                <span className="rv-type-n">{n}</span>
                <button
                  className="rv-btn moins"
                  onClick={() => retirer(type)}
                  disabled={busy || n === 0}
                  aria-label={`Retirer un ${type}`}
                >−</button>
                <button
                  className="rv-btn plus"
                  onClick={() => ajouter(type)}
                  disabled={busy}
                  aria-label={`Ajouter un ${type}`}
                >+</button>
              </li>
            )
          })}
        </ul>

        <div className="rv-actions">
          <button className="btn btn-ghost rv-rien" onClick={() => { onVue(); onRetour() }}>
            Rien de plus ici
          </button>
          {onSuivante && (
            <button className="btn btn-primary rv-suivante" onClick={onSuivante}>
              Salle suivante <span>{nomSuivante}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
