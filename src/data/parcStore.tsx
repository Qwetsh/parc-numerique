/* ============================================================
   Store du parc : source de vérité de l'inventaire (Supabase).
   Charge les équipements, amorce la base avec le jeu de démo si elle
   est vide, et expose le CRUD + les dérivés (santé/postes par salle).
   Les salles restent des données statiques (data/parc.ts) qui décrivent
   le bâtiment ; seul l'inventaire est dynamique.
   ============================================================ */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, TABLE_EQUIPEMENTS } from '../lib/supabase'
import { SEED_EQUIPEMENTS, salleKey, salleMeta, santeFromList } from './parc'
import type { Cote, Equipement, EtatKey, SanteKey } from './parc'
import { TABLE_SIGNALEMENTS, listSignalementsActifs } from '../lib/signalements'
import type { Signalement } from '../lib/signalements'

/** Champs modifiables d'un équipement (sans l'id ni les champs dérivés). */
export interface EquipInput {
  reference: string
  type: string
  modele: string
  annee: number
  etat: EtatKey
  salle: string
  etage: number
  proprietaire: string
  numero_serie: string | null
  num_inventaire: string | null
  os: string | null
  notes: string | null
}

/** Ligne brute telle que stockée en base (sans salleNom/cote, dérivés du plan). */
type Row = Omit<Equipement, 'salleNom' | 'cote'>

/** Enrichit une ligne base avec les métadonnées de salle (nom, côté). */
function enrich(r: Row): Equipement {
  const meta = salleMeta(r.etage, r.salle)
  return { ...r, salleNom: meta?.nom ?? r.salle, cote: (meta?.cote ?? 'nord') as Cote }
}

interface ParcCtx {
  equipements: Equipement[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  addEquip: (input: EquipInput) => Promise<void>
  updateEquip: (id: string, input: EquipInput) => Promise<void>
  removeEquip: (id: string) => Promise<void>
  /** Équipements d'une salle donnée. */
  equipOf: (etage: number, num: string) => Equipement[]
  /** Santé d'une salle calculée en direct. */
  santeSalle: (etage: number, num: string) => SanteKey
  /** Nombre de postes (équipements) d'une salle. */
  nbPostes: (etage: number, num: string) => number
  /** Signalements non résolus, tous confondus (les plus récents d'abord). */
  signalementsActifs: Signalement[]
  /** Signalements non résolus d'une salle donnée. */
  signalementsOf: (etage: number, num: string) => Signalement[]
  /** Une salle a-t-elle au moins un signalement non résolu (→ alerte visuelle) ? */
  alerteSalle: (etage: number, num: string) => boolean
}

const Ctx = createContext<ParcCtx | null>(null)

export function ParcProvider({ children }: { children: ReactNode }) {
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: selErr } = await supabase.from(TABLE_EQUIPEMENTS).select('*')
    if (selErr) { setError(selErr.message); setLoading(false); return }
    let rows = (data ?? []) as Row[]

    // Amorçage idempotent : si la table est vide, on insère le jeu de démo.
    // upsert + ignoreDuplicates protège du double-montage StrictMode (clé unique : reference).
    if (rows.length === 0) {
      const { error: seedErr } = await supabase
        .from(TABLE_EQUIPEMENTS)
        .upsert(SEED_EQUIPEMENTS, { onConflict: 'reference', ignoreDuplicates: true })
      if (seedErr) { setError(seedErr.message); setLoading(false); return }
      const { data: after, error: reErr } = await supabase.from(TABLE_EQUIPEMENTS).select('*')
      if (reErr) { setError(reErr.message); setLoading(false); return }
      rows = (after ?? []) as Row[]
    }

    setEquipements(rows.map(enrich))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Signalements de panne : chargés une fois, puis tenus à jour en TEMPS RÉEL
  // (un enseignant scanne un QR → la salle passe en alerte sans recharger).
  const loadSignalements = useCallback(async () => {
    try { setSignalements(await listSignalementsActifs()) }
    catch { /* non bloquant : l'inventaire reste utilisable sans les signalements */ }
  }, [])

  useEffect(() => {
    loadSignalements()
    const channel = supabase
      .channel('parc_signalements_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_SIGNALEMENTS }, () => {
        void loadSignalements()
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [loadSignalements])

  const addEquip = useCallback(async (input: EquipInput) => {
    const { data, error: e } = await supabase.from(TABLE_EQUIPEMENTS).insert(input).select('*').single()
    if (e) throw e
    setEquipements((prev) => [...prev, enrich(data as Row)])
  }, [])

  const updateEquip = useCallback(async (id: string, input: EquipInput) => {
    const { data, error: e } = await supabase.from(TABLE_EQUIPEMENTS).update(input).eq('id', id).select('*').single()
    if (e) throw e
    setEquipements((prev) => prev.map((x) => (x.id === id ? enrich(data as Row) : x)))
  }, [])

  const removeEquip = useCallback(async (id: string) => {
    const { error: e } = await supabase.from(TABLE_EQUIPEMENTS).delete().eq('id', id)
    if (e) throw e
    setEquipements((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const bySalle = useMemo(() => {
    const m = new Map<string, Equipement[]>()
    for (const e of equipements) {
      const k = salleKey(e.etage, e.salle)
      const arr = m.get(k)
      if (arr) arr.push(e)
      else m.set(k, [e])
    }
    return m
  }, [equipements])

  const signalementsBySalle = useMemo(() => {
    const m = new Map<string, Signalement[]>()
    for (const s of signalements) {
      if (s.salle == null || s.etage == null) continue
      const k = salleKey(s.etage, s.salle)
      const arr = m.get(k)
      if (arr) arr.push(s)
      else m.set(k, [s])
    }
    return m
  }, [signalements])

  const value = useMemo<ParcCtx>(() => ({
    equipements,
    loading,
    error,
    reload: load,
    addEquip,
    updateEquip,
    removeEquip,
    equipOf: (etage, num) => bySalle.get(salleKey(etage, num)) ?? [],
    santeSalle: (etage, num) => santeFromList(bySalle.get(salleKey(etage, num)) ?? []),
    nbPostes: (etage, num) => (bySalle.get(salleKey(etage, num)) ?? []).length,
    signalementsActifs: signalements,
    signalementsOf: (etage, num) => signalementsBySalle.get(salleKey(etage, num)) ?? [],
    alerteSalle: (etage, num) => signalementsBySalle.has(salleKey(etage, num)),
  }), [equipements, loading, error, load, addEquip, updateEquip, removeEquip, bySalle, signalements, signalementsBySalle])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useParc(): ParcCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useParc doit être utilisé à l’intérieur de <ParcProvider>')
  return ctx
}
