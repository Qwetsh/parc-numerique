/* ============================================================
   Page publique « Signaler une panne » — ouverte par QR code (un par
   équipement). Pensée mobile, sans la barre latérale admin.
   ============================================================ */
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { EquipIcon } from '../components/Icon'
import { ETAGE_LABEL } from '../data/parc'
import { faqFor } from '../data/faq'
import { PROBLEMES, createSignalement, getEquipementPublic } from '../lib/signalements'
import type { EquipementPublic } from '../lib/signalements'
import { notifyConfigured, notifySignalement } from '../lib/notify'
import { pageUrl } from '../lib/site'
import './Signaler.css'

type Phase = 'loading' | 'ready' | 'notfound' | 'error' | 'done'

export function Signaler() {
  const { equipementId = '' } = useParams()
  const [phase, setPhase] = useState<Phase>('loading')
  const [equip, setEquip] = useState<EquipementPublic | null>(null)

  const [probleme, setProbleme] = useState(PROBLEMES[0])
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [emailWarn, setEmailWarn] = useState(false)

  useEffect(() => {
    let alive = true
    getEquipementPublic(equipementId)
      .then((e) => { if (!alive) return; setEquip(e); setPhase(e ? 'ready' : 'notfound') })
      .catch(() => { if (alive) setPhase('error') })
    return () => { alive = false }
  }, [equipementId])

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setBusy(true); setErr(null)
    try {
      await createSignalement({
        equipement_id: equip?.id ?? null,
        equipement_ref: equip?.reference ?? null,
        salle: equip?.salle ?? null,
        etage: equip?.etage ?? null,
        probleme,
        description: description.trim(),
      })
      // Notifie le référent par email (canal navigateur — voir lib/notify.ts).
      // On ATTEND la fin de l'envoi pour qu'il ne soit pas annulé si la page se
      // ferme, sans bloquer l'enregistrement déjà fait.
      const showNum = equip ? equip.salleNom !== `Salle ${equip.salle}` : false
      const sent = await notifySignalement({
        equipement: equip ? `${equip.type} — ${equip.modele} (${equip.reference})` : '—',
        salle: equip ? `${equip.salleNom}${showNum ? ` (${equip.salle})` : ''} · ${ETAGE_LABEL[equip.etage]}` : '—',
        probleme,
        details: description.trim() || '—',
        date: new Date().toLocaleString('fr-FR'),
        lien: pageUrl('signalements'),
      })
      // Avertit seulement si l'email était censé partir mais a échoué.
      setEmailWarn(notifyConfigured && !sent)
      setPhase('done')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur lors de l’envoi.')
      setBusy(false)
    }
  }

  return (
    <div className="sg-wrap">
      <div className="sg-card">
        <div className="sg-head">
          <div className="sg-logo"><EquipIcon type="PC fixe" size={18} /></div>
          <div>
            <div className="sg-title">Signaler une panne</div>
            <div className="sg-sub">Collège Pierre Mendès France · Woippy</div>
          </div>
        </div>

        {phase === 'loading' && <p className="sg-info">Chargement…</p>}

        {phase === 'notfound' && (
          <p className="sg-info">Équipement introuvable. Vérifiez le QR code ou prévenez le référent numérique.</p>
        )}
        {phase === 'error' && (
          <p className="sg-info sg-bad">Une erreur est survenue. Réessayez dans un instant.</p>
        )}

        {phase === 'done' && (
          <div className="sg-done">
            <div className="sg-check">✓</div>
            <h2>Merci !</h2>
            <p>Votre signalement a bien été enregistré. Le référent numérique le prendra en charge.</p>
            {emailWarn && (
              <p className="sg-warn">⚠ Le signalement est bien enregistré, mais l’email d’alerte n’a pas pu partir depuis cet appareil. Le référent le verra malgré tout dans son outil.</p>
            )}
            <button className="btn btn-ghost" onClick={() => {
              setProbleme(PROBLEMES[0]); setDescription(''); setBusy(false); setEmailWarn(false); setPhase('ready')
            }}>Faire un autre signalement</button>
          </div>
        )}

        {phase === 'ready' && equip && (
          <>
            <div className="sg-equip">
              <span className="sg-equip-ic"><EquipIcon type={equip.type} size={20} /></span>
              <div className="sg-equip-meta">
                <div className="sg-equip-t">{equip.type} · {equip.modele}</div>
                <div className="sg-equip-d">
                  {equip.reference} — {equip.salleNom}
                  {equip.salleNom !== `Salle ${equip.salle}` ? ` (${equip.salle})` : ''} · {ETAGE_LABEL[equip.etage]}
                </div>
              </div>
            </div>

            {faqFor(equip.type).length > 0 && (
              <div className="sg-faq">
                <div className="sg-faq-title">💡 Avant de signaler — quelques vérifications</div>
                {faqFor(equip.type).map((f) => (
                  <details className="sg-faq-item" key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
                <p className="sg-faq-foot">Ça n’a pas résolu le problème ? Signalez-le ci-dessous.</p>
              </div>
            )}

            <form className="sg-form" onSubmit={submit}>
              <label className="sg-field">
                <span>Quel est le problème ?</span>
                <select value={probleme} autoComplete="off" onChange={(e) => setProbleme(e.target.value)}>
                  {PROBLEMES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label className="sg-field">
                <span>Détails (optionnel)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Ex. l’écran reste noir au démarrage…"
                />
                <small className="sg-note">
                  Ne renseignez pas de nom d’élève ni d’information personnelle dans ce champ.
                </small>
              </label>

              {err && <p className="sg-err">{err}</p>}

              <button type="submit" className="btn btn-primary sg-submit" disabled={busy}>
                {busy ? 'Envoi…' : 'Envoyer le signalement'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
