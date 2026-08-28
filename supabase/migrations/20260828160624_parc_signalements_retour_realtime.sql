-- Annule la migration 20260828154610 : l'application s'abonne bien à
-- parc_signalements en temps réel (alertes de salle dans la vue 3D et badge
-- de la barre latérale, ajoutés par la PR #1). Le canal était considéré à tort
-- comme inutilisé.
--
-- Realtime applique les politiques RLS de la table : un client anonyme ne
-- reçoit aucun événement, seul un compte habilité est notifié.
alter publication supabase_realtime add table public.parc_signalements;
