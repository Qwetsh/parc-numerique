# Base de données et fonctions serveur

Projet Supabase : **Class'it** (`djodkjysovalpufgevrr`).

## Contenu

- `migrations/` — le SQL réellement appliqué au projet, dans l'ordre. Les
  migrations antérieures au 28 août 2026 ne sont pas reprises ici : elles ont été
  appliquées depuis le dashboard et concernent aussi les autres applications du
  projet partagé.
- `functions/notify-signalement/` — edge function déclenchée par le trigger
  `trg_notify_signalement` (AFTER INSERT sur `parc_signalements`). Envoie l'alerte
  au référent via l'API REST EmailJS, côté serveur.

## Modèle d'accès

La clé publiable (`VITE_SUPABASE_ANON_KEY`) est publique par conception : elle est
embarquée dans le bundle du site. **Tout repose donc sur les politiques RLS.**

| Table / fonction | `anon` | `authenticated` habilité |
|---|---|---|
| `parc_equipements` | aucun accès | lecture + écriture |
| `parc_signalements` | insertion seule | lecture + mise à jour (pas de suppression) |
| `parc_admins` | aucun accès | lecture de sa propre ligne |
| `parc_equipement_public(uuid)` | exécution | exécution |
| `parc_est_admin()` | aucun accès | exécution |

« Habilité » = l'adresse du compte figure dans `parc_admins`. Un compte authentifié
absent de cette table ne voit rien : le contrôle vit en base, pas dans le front.

La page publique `/signaler/:id` n'accède jamais à `parc_equipements` : elle appelle
`parc_equipement_public(uuid)`, qui ne renvoie que `reference`, `type`, `modele`,
`salle` et `etage` — jamais `numero_serie`, `num_inventaire`, `proprietaire` ni `notes`.

## Ajouter un administrateur

```sql
insert into public.parc_admins (email) values ('prenom.nom@ac-nancy-metz.fr')
on conflict (email) do nothing;
```

L'adresse doit être écrite en minuscules (la comparaison est insensible à la casse,
mais autant rester cohérent).

## Configuration Auth à faire dans le dashboard

1. **Authentication → Providers → Email** : activé, « Confirm email » actif.
2. **Authentication → URL Configuration → Redirect URLs** : ajouter
   `https://qwetsh.github.io/parc-numerique/` et `http://localhost:5173/`.
3. Une fois le compte du référent créé (première connexion réussie), passer
   **Authentication → Sign In / Providers → Allow new users to sign up** sur *off*.
   À faire **après** la première connexion, sinon le lien magique est refusé.

## Secrets de l'edge function

`Project Settings → Edge Functions → Secrets` :

| Secret | Rôle |
|---|---|
| `WEBHOOK_SECRET` | doit être **identique** au header `x-webhook-secret` envoyé par la fonction SQL `notify_signalement_email()` |
| `EMAILJS_PRIVATE_KEY` | « Access Token » du compte EmailJS |

Pour retrouver la valeur attendue du premier (elle n'est volontairement pas écrite
ici : ce dépôt est public) :

```sql
select pg_get_functiondef(oid) from pg_proc where proname = 'notify_signalement_email';
```

## Notification : quel canal est actif ?

Deux chemins mènent au même email, **un seul doit être actif à la fois** :

| Canal | Chaîne | État au 28/08/2026 |
|---|---|---|
| Serveur (préféré) | `insert` → `trg_notify_signalement` → `net.http_post` → edge function → EmailJS | **inactif** : `WEBHOOK_SECRET` jamais configuré, et EmailJS refuse les appels hors navigateur |
| Navigateur (secours) | `Signaler.tsx` → `lib/notify.ts` → EmailJS | **actif** (`VITE_NOTIF_NAVIGATEUR=true`) |

Pour basculer sur le canal serveur :

1. EmailJS → `Account → Security` : autoriser l'API hors navigateur, puis copier
   l'« Access Token » (clé privée).
2. Supabase → `Edge Functions → Secrets` : créer `EMAILJS_PRIVATE_KEY` et
   `WEBHOOK_SECRET` (voir ci-dessous).
3. Passer `VITE_NOTIF_NAVIGATEUR` à `false` dans `.env` et redéployer, **sinon chaque
   signalement enverra deux emails**.

## Dépannage — aucun email reçu après un signalement

Si le canal serveur est actif, lire les logs de la fonction
(`Edge Functions → notify-signalement → Logs`) :

| Message | Cause |
|---|---|
| `WEBHOOK_SECRET non configuré` | le secret n'existe pas dans le projet |
| `x-webhook-secret absent ou différent` | secret présent mais différent de celui du trigger |
| `EMAILJS_PRIVATE_KEY manquant` | Access Token EmailJS non renseigné |
| `EmailJS a refusé l'envoi` | service/template/clé invalides côté EmailJS |

Aucune ligne du tout : le trigger n'a pas appelé la fonction — vérifier
`select * from net._http_response order by created desc limit 5;`.

Le template EmailJS ne doit plus référencer `{{enseignant}}` ni `{{email}}` :
ces variables n'existent plus (voir P3). Les variables encore transmises sont
`equipement`, `salle`, `probleme`, `details`, `date` et `lien`.
