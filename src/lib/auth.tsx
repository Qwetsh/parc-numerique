/* ============================================================
   Authentification de l'espace d'administration.

   Lien magique par email (Supabase Auth) : aucun mot de passe à gérer,
   aucun secret côté client. L'habilitation ne dépend pas du front :
   elle est portée par la table parc_admins et vérifiée par les
   politiques RLS. Un compte hors liste blanche peut se connecter, il
   ne voit simplement aucune donnée — la fonction parc_est_admin()
   permet de le lui dire clairement.
   ============================================================ */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/** Adresse de retour du lien de connexion : la racine du site courant
 *  (localhost en développement, /parc-numerique/ en production).
 *  Ces deux URL doivent figurer dans les « Redirect URLs » du projet Supabase. */
export const REDIRECT_URL = `${window.location.origin}${import.meta.env.BASE_URL}`

/** Envoie le lien de connexion à l'adresse indiquée. */
export async function envoyerLienConnexion(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: REDIRECT_URL },
  })
  if (error) throw error
}

export async function deconnecter(): Promise<void> {
  await supabase.auth.signOut()
}

interface AuthCtx {
  session: Session | null
  /** Email du compte connecté, s'il y en a un. */
  email: string | null
  /** Le compte figure-t-il dans la liste blanche parc_admins ? */
  estAdmin: boolean
  /** false tant que l'état de session n'est pas connu (évite un flash de redirection). */
  pret: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

/** Interroge la base : le compte courant est-il habilité ? */
async function verifierAdmin(session: Session | null): Promise<boolean> {
  if (!session) return false
  const { data, error } = await supabase.rpc('parc_est_admin')
  if (error) return false
  return data === true
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [estAdmin, setEstAdmin] = useState(false)
  const [pret, setPret] = useState(false)

  useEffect(() => {
    let alive = true
    // Chaque changement de session incrémente le jeton : seule la vérification
    // la plus récente a le droit d'écrire dans l'état.
    let jeton = 0

    const appliquer = (s: Session | null) => {
      const n = ++jeton
      setSession(s)
      verifierAdmin(s).then((ok) => {
        if (!alive || n !== jeton) return
        setEstAdmin(ok)
        setPret(true)
      })
    }

    supabase.auth.getSession().then(({ data }) => { if (alive) appliquer(data.session) })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (alive) appliquer(s)
    })

    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  const value = useMemo<AuthCtx>(() => ({
    session,
    email: session?.user.email ?? null,
    estAdmin,
    pret,
  }), [session, estAdmin, pret])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>')
  return ctx
}
