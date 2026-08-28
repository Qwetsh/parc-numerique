/* ============================================================
   Garde de route de l'espace d'administration.

   Trois cas :
   — session inconnue      → écran d'attente (pas de flash de redirection) ;
   — pas de session        → renvoi vers /connexion ;
   — session non habilitée → message explicite plutôt qu'un écran vide,
     car les politiques RLS ne renverraient aucune donnée.
   ============================================================ */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { deconnecter, useAuth } from '../lib/auth'
import '../pages/Connexion.css'

export function RouteProtegee({ children }: { children: ReactNode }) {
  const { session, email, estAdmin, pret } = useAuth()
  const location = useLocation()

  if (!pret) {
    return (
      <div className="cx-wrap">
        <div className="cx-card"><p className="cx-intro">Vérification de la session…</p></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  if (!estAdmin) {
    return (
      <div className="cx-wrap">
        <div className="cx-card">
          <div className="cx-refus">
            <h2>Accès non autorisé</h2>
            <p>
              Le compte <span className="cx-mail">{email}</span> n’est pas habilité à consulter
              l’inventaire. Demandez au référent numérique d’ajouter cette adresse
              à la liste des administrateurs.
            </p>
            <button className="btn btn-ghost" onClick={() => { void deconnecter() }}>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
