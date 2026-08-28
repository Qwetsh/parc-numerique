-- Relevé de terrain : on parcourt les salles et on note ce qui s'y trouve
-- (un VPI, une imprimante…) sans connaître le modèle ni l'année d'achat.
-- Ces deux colonnes deviennent optionnelles ; elles seront complétées ensuite.
alter table public.parc_equipements
  alter column modele drop not null,
  alter column annee  drop not null;
