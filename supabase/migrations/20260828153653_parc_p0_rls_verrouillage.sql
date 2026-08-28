-- ============================================================
-- P0 — Verrouillage des politiques RLS de l'application « Parc numérique ».
-- Les deux tables étaient ouvertes en lecture/écriture à tout internet
-- (policy unique ALL / anon+authenticated / using(true)).
-- ============================================================

-- 1. Liste blanche des administrateurs (référent numérique).
create table if not exists public.parc_admins (
  email      text primary key,
  ajoute_le  timestamptz not null default now()
);

alter table public.parc_admins enable row level security;

-- Un compte authentifié peut lire sa propre ligne (le front s'en sert pour
-- savoir s'il est habilité) et rien d'autre.
drop policy if exists parc_admins_self_read on public.parc_admins;
create policy parc_admins_self_read on public.parc_admins
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Helper : le compte courant figure-t-il dans la liste blanche ?
-- SECURITY DEFINER pour lire parc_admins sans dépendre de sa propre RLS.
create or replace function public.parc_est_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.parc_admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.parc_est_admin() from public;
grant execute on function public.parc_est_admin() to authenticated;

-- 3. Suppression des politiques permissives.
drop policy if exists parc_equipements_open_all  on public.parc_equipements;
drop policy if exists parc_signalements_open_all on public.parc_signalements;

-- 4. Inventaire : réservé aux administrateurs authentifiés.
-- Contient numero_serie / num_inventaire : aucun accès anonyme.
drop policy if exists parc_equipements_admin on public.parc_equipements;
create policy parc_equipements_admin on public.parc_equipements
  for all to authenticated
  using ((select public.parc_est_admin()))
  with check ((select public.parc_est_admin()));

-- 5. Signalements : dépôt anonyme autorisé (page publique QR),
-- lecture et mise à jour réservées aux administrateurs.
-- Aucune politique DELETE : la suppression passe par le dashboard.
drop policy if exists parc_signalements_insert_public on public.parc_signalements;
create policy parc_signalements_insert_public on public.parc_signalements
  for insert to anon, authenticated
  with check (true);

drop policy if exists parc_signalements_select_admin on public.parc_signalements;
create policy parc_signalements_select_admin on public.parc_signalements
  for select to authenticated
  using ((select public.parc_est_admin()));

drop policy if exists parc_signalements_update_admin on public.parc_signalements;
create policy parc_signalements_update_admin on public.parc_signalements
  for update to authenticated
  using ((select public.parc_est_admin()))
  with check ((select public.parc_est_admin()));
