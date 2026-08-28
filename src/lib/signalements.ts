/* ============================================================
   Signalements de panne (app support enseignants via QR code).
   Accès direct à Supabase, indépendant du store admin (parcStore) :
   la page publique /signaler ne charge pas tout l'inventaire.

   Un signalement décrit un équipement, un lieu et une panne — jamais
   une personne : aucune donnée nominative n'est collectée.
   ============================================================ */
import { supabase } from './supabase'
import { salleMeta } from '../data/parc'
import type { Cote, Equipement } from '../data/parc'

export const TABLE_SIGNALEMENTS = 'parc_signalements'

export type Statut = 'ouvert' | 'en_cours' | 'resolu'

export const STATUT_LABEL: Record<Statut, string> = {
  ouvert: 'Ouvert', en_cours: 'En cours', resolu: 'Résolu',
}

/** Catégories de problème proposées à l'enseignant. */
export const PROBLEMES = [
  'Ne s’allume pas',
  'Écran / affichage',
  'Réseau / Wifi',
  'Son',
  'Clavier / souris',
  'Vidéoprojecteur (VPI)',
  'Logiciel',
  'Autre',
]

export interface Signalement {
  id: string
  equipement_id: string | null
  equipement_ref: string | null
  salle: string | null
  etage: number | null
  probleme: string
  description: string
  statut: Statut
  created_at: string
}

export interface SignalementInput {
  equipement_id: string | null
  equipement_ref: string | null
  salle: string | null
  etage: number | null
  probleme: string
  description: string
}

type EquipRow = Omit<Equipement, 'salleNom' | 'cote'>

/** Ce que la page publique est autorisée à connaître d'un équipement :
 *  de quoi le reconnaître et le situer, rien de plus (ni n° de série,
 *  ni n° d'inventaire, ni propriétaire, ni notes). */
export interface EquipementPublic {
  id: string
  reference: string
  type: string
  modele: string
  salle: string
  etage: number
  salleNom: string
}

/** Ligne renvoyée par la fonction SQL parc_equipement_public. */
type EquipPublicRow = Omit<EquipementPublic, 'salleNom'>

/** Récupère un équipement scanné depuis la page publique.
 *  Passe par une fonction SQL restreinte : la table parc_equipements
 *  n'est pas lisible sans être authentifié. */
export async function getEquipementPublic(id: string): Promise<EquipementPublic | null> {
  const { data, error } = await supabase
    .rpc('parc_equipement_public', { p_id: id }).maybeSingle()
  if (error) throw error
  if (!data) return null
  const r = data as EquipPublicRow
  return { ...r, salleNom: salleMeta(r.etage, r.salle)?.nom ?? r.salle }
}

/** Récupère un équipement complet (vue admin, nécessite une session). */
export async function getEquipement(id: string): Promise<Equipement | null> {
  const { data, error } = await supabase
    .from('parc_equipements').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  const r = data as EquipRow
  const meta = salleMeta(r.etage, r.salle)
  return { ...r, salleNom: meta?.nom ?? r.salle, cote: (meta?.cote ?? 'nord') as Cote }
}

/** Crée un signalement (depuis la page enseignant). */
export async function createSignalement(input: SignalementInput): Promise<void> {
  const { error } = await supabase.from(TABLE_SIGNALEMENTS).insert(input)
  if (error) throw error
}

/** Liste tous les signalements (vue admin), les plus récents d'abord. */
export async function listSignalements(): Promise<Signalement[]> {
  const { data, error } = await supabase
    .from(TABLE_SIGNALEMENTS).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Signalement[]
}

/** Met à jour le statut d'un signalement (vue admin). */
export async function setStatut(id: string, statut: Statut): Promise<void> {
  const { error } = await supabase.from(TABLE_SIGNALEMENTS).update({ statut }).eq('id', id)
  if (error) throw error
}
