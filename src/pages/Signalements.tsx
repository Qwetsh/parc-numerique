import { useEffect, useMemo, useState } from 'react'
import { Topbar } from '../components/Topbar'
import { ETAGE_COURT } from '../data/parc'
import {
  STATUT_LABEL, getEquipement, listSignalements, setStatut,
} from '../lib/signalements'
import type { Signalement, Statut } from '../lib/signalements'
import type { EquipExtra } from '../lib/reparation'
import {
  CANAUX, buildCorps, buildObjet, canalDe, canalPour, composeMessage,
  loadSettings, mailtoUrl, saveSettings,
} from '../lib/reparation'
import type { CanalKey, ReparationSettings } from '../lib/reparation'
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
  const [demande, setDemande] = useState<Signalement | null>(null)

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
                <button className="sgl-prep-btn" onClick={() => setDemande(s)}>
                  ✉ Préparer la demande
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {demande && <DemandeReparation s={demande} onClose={() => setDemande(null)} />}
    </main>
  )
}

/* ============================================================
   Panneau « Préparer la demande » — le canal est déduit du
   signalement puis reste modifiable ; adresses, établissement et
   signature sont mémorisés.
   ============================================================ */
function DemandeReparation({ s, onClose }: { s: Signalement; onClose: () => void }) {
  const [settings, setSettings] = useState<ReparationSettings>(loadSettings)
  const [canal, setCanal] = useState<CanalKey>(() => canalPour(s.probleme, s.description))
  const [extra, setExtra] = useState<EquipExtra | null>(null)
  const [objet, setObjet] = useState(() => buildObjet(s, canal))
  const [corps, setCorps] = useState(() => buildCorps(s, settings, canal))
  const [copied, setCopied] = useState(false)

  const adresse = settings.adresses[canal]

  // récupère n° de série / inventaire sur la fiche équipement pour enrichir le message
  useEffect(() => {
    let alive = true
    if (s.equipement_id) {
      getEquipement(s.equipement_id)
        .then((e) => { if (alive) setExtra(e ? { numero_serie: e.numero_serie, num_inventaire: e.num_inventaire } : null) })
        .catch(() => { if (alive) setExtra(null) })
    } else setExtra(null)
    return () => { alive = false }
  }, [s])

  useEffect(() => { setCanal(canalPour(s.probleme, s.description)) }, [s])
  useEffect(() => { setObjet(buildObjet(s, canal)) }, [s, canal])
  // Régénère le corps quand le signalement, le canal, la signature,
  // l'établissement ou les détails de l'équipement changent. Volontairement
  // pas sur `settings` entier : modifier l'adresse ne doit pas écraser les
  // retouches faites à la main dans le message.
  const { signature, etablissement } = settings
  useEffect(() => {
    setCorps(buildCorps(s, { signature, etablissement }, canal, extra ?? undefined))
  }, [s, canal, signature, etablissement, extra])

  function patch(p: Partial<ReparationSettings>) {
    const next = { ...settings, ...p }
    setSettings(next)
    saveSettings(next)
  }

  function patchAdresse(v: string) {
    patch({ adresses: { ...settings.adresses, [canal]: v } })
  }

  const lienMail = mailtoUrl(adresse, objet, corps)

  async function copier() {
    try {
      await navigator.clipboard.writeText(composeMessage(adresse, objet, corps))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* presse-papiers indisponible (contexte non sécurisé) */ }
  }

  return (
    <>
      <div className="dr-scrim" onClick={onClose} />
      <aside className="dr-panel" aria-label="Préparer la demande">
        <div className="dr-bar">
          <span className="eyebrow">Préparer la demande</span>
          <button className="dr-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className="dr-body">
          <div className="dr-field">
            <span>Qui prend en charge ?</span>
            <div className="dr-canaux" role="radiogroup" aria-label="Destinataire de la demande">
              {CANAUX.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={c.key === canal}
                  className={`dr-canal ${c.key === canal ? 'on' : ''}`}
                  onClick={() => setCanal(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="dr-hint">{canalDe(canal).aide}</p>
          </div>

          <label className="dr-field">
            <span>Adresse <em>(mémorisée pour ce destinataire)</em></span>
            <input
              value={adresse}
              onChange={(e) => patchAdresse(e.target.value)}
              placeholder="adresse email, ou nom du destinataire"
            />
          </label>

          <label className="dr-field">
            <span>Objet</span>
            <input value={objet} onChange={(e) => setObjet(e.target.value)} />
          </label>

          <label className="dr-field">
            <span>Message</span>
            <textarea value={corps} onChange={(e) => setCorps(e.target.value)} rows={13} />
          </label>

          {canal !== 'guichet' && (
            <label className="dr-field">
              <span>Établissement <em>(mémorisé)</em></span>
              <input
                value={settings.etablissement}
                onChange={(e) => patch({ etablissement: e.target.value })}
                placeholder="nom et RNE de l’établissement"
              />
            </label>
          )}

          <label className="dr-field">
            <span>Signature <em>(mémorisée)</em></span>
            <textarea value={settings.signature} onChange={(e) => patch({ signature: e.target.value })} rows={2} />
          </label>

          <div className="dr-actions">
            <span className="dr-copied">{copied ? '✓ Copié dans le presse-papiers' : ''}</span>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Fermer</button>
            <button type="button" className="btn btn-ghost" onClick={copier}>Copier</button>
            {lienMail ? (
              <a className="btn btn-primary" href={lienMail}>Ouvrir dans le mail</a>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled
                title="Renseignez une adresse email pour ouvrir votre messagerie"
              >Ouvrir dans le mail</button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
