-- parc_signalements était publiée en Realtime (migration 20260609130800)
-- alors que l'application ne s'y abonne pas. Canal inutile = surface inutile :
-- on la retire de la publication. (À remettre le jour où le front en aura besoin.)
alter publication supabase_realtime drop table public.parc_signalements;
