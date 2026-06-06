import { createClient } from '@supabase/supabase-js'

// Client Supabase partagé (projet « Class'it »). La clé publishable est publique
// par conception (accès régi par les policies RLS de la table parc_equipements).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

/** Nom de la table de l'inventaire (préfixée pour cohabiter dans le projet partagé). */
export const TABLE_EQUIPEMENTS = 'parc_equipements'
