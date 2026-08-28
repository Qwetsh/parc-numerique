-- ============================================================
-- P3 — Un signalement identifie un problème, pas une personne.
-- Suppression des champs nominatifs : plus aucune donnée personnelle
-- en base, ni transmise à EmailJS.
-- ============================================================
alter table public.parc_signalements
  drop column if exists enseignant_nom,
  drop column if exists enseignant_email;

-- Garde-fous sur le dépôt anonyme (l'insert reste ouvert à anon) :
-- borne la taille du texte librement saisi pour limiter l'abus.
alter table public.parc_signalements
  drop constraint if exists parc_signalements_probleme_len,
  drop constraint if exists parc_signalements_description_len;

alter table public.parc_signalements
  add constraint parc_signalements_probleme_len
    check (char_length(probleme) <= 120),
  add constraint parc_signalements_description_len
    check (description is null or char_length(description) <= 2000);
