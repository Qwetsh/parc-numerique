/* ============================================================
   Écran de connexion à l'espace d'administration.
   Lien magique par email : on saisit son adresse, on reçoit un lien,
   on clique — pas de mot de passe à retenir ni à stocker.
   ============================================================ */
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { IconMonitor } from '../components/Icon'
import { envoyerLienConnexion, useAuth } from '../lib/auth'
import './Connexion.css'

export function Connexion() {
  const { session, pret } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Déjà connecté : on repart vers la page demandée à l'origine.
  const retour = (location.state as { from?: string } | null)?.from ?? '/'
  if (pret && session) return <Navigate to={retour} replace />

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!email.trim()) { setErr('Merci d’indiquer votre adresse email.'); return }
    setBusy(true); setErr(null)
    try {
      await envoyerLienConnexion(email)
      setEnvoye(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Impossible d’envoyer le lien.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cx-wrap">
      <div className="cx-card">
        <div className="cx-head">
          <div className="cx-logo"><IconMonitor size={20} /></div>
          <div>
            <div className="cx-title">Parc numérique</div>
            <div className="cx-sub">Collège Pierre Mendès France · Woippy</div>
          </div>
        </div>

        {envoye ? (
          <div className="cx-done">
            <div className="cx-check">✓</div>
            <h2>Vérifiez votre boîte mail</h2>
            <p>
              Un lien de connexion vient d’être envoyé à <strong>{email.trim().toLowerCase()}</strong>.
              Il est valable une trentaine de minutes et ne fonctionne qu’une fois.
            </p>
            <button className="btn btn-ghost" onClick={() => { setEnvoye(false); setEmail('') }}>
              Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <>
            <p className="cx-intro">
              L’espace d’administration est réservé au référent numérique.
              Indiquez votre adresse pour recevoir un lien de connexion.
            </p>
            <form className="cx-form" onSubmit={submit}>
              <label className="cx-field">
                <span>Adresse email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@ac-nancy-metz.fr"
                  autoComplete="email"
                  autoFocus
                />
              </label>

              {err && <p className="cx-err">{err}</p>}

              <button type="submit" className="btn btn-primary cx-submit" disabled={busy}>
                {busy ? 'Envoi…' : 'Recevoir le lien de connexion'}
              </button>
            </form>
          </>
        )}

        <p className="cx-foot">
          Une panne à signaler ? Scannez le QR code collé sur l’équipement —
          aucun compte n’est nécessaire.
        </p>
      </div>
    </div>
  )
}
