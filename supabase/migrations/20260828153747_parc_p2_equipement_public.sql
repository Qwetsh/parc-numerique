-- ============================================================
-- P2 — Vue publique restreinte d'un équipement, pour la page de scan QR.
-- parc_equipements n'est plus lisible anonymement (elle contient les
-- numéros de série) : la page /signaler passe par cette fonction, qui ne
-- renvoie qu'une ligne et seulement les colonnes d'identification.
-- ============================================================

-- Le rôle anon conserve l'EXECUTE hérité des privilèges par défaut Supabase :
-- on le retire explicitement (principe de moindre privilège).
revoke all on function public.parc_est_admin() from anon;

create or replace function public.parc_equipement_public(p_id uuid)
returns table (
  id        uuid,
  reference text,
  type      text,
  modele    text,
  salle     text,
  etage     integer
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id, e.reference, e.type, e.modele, e.salle, e.etage
  from public.parc_equipements e
  where e.id = p_id;
$$;

revoke all on function public.parc_equipement_public(uuid) from public, anon, authenticated;
grant execute on function public.parc_equipement_public(uuid) to anon, authenticated;
