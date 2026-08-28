# Parc numérique — Collège Pierre Mendès France

[![Déploiement GitHub Pages](https://github.com/Qwetsh/parc-numerique/actions/workflows/deploy.yml/badge.svg)](https://github.com/Qwetsh/parc-numerique/actions/workflows/deploy.yml)

> **▶ Démo en ligne : https://qwetsh.github.io/parc-numerique/**

Outil web d'inventaire et de pilotage du parc numérique d'un collège, destiné au
référent numérique. Interface moderne, claire et spacieuse, avec un fil conducteur
d'**états sémantiques** (vert = fonctionnel, ambre = vétuste, rouge = en panne,
gris = réformé) présent du badge jusqu'à la maquette 3D.

## Stack

- **Vite + React 18 + TypeScript**
- **React Router** (navigation entre écrans)
- **Three.js + @react-three/fiber + @react-three/drei** pour la vue 3D du collège
- Styles : **CSS + design tokens** (variables CSS dans `src/styles/tokens.css`),
  directement réutilisables.

## Démarrer

```bash
npm install
npm run dev        # serveur de développement (http://localhost:5173)
npm run build      # build de production (typecheck + bundle)
npm run preview    # prévisualise le build
npm run typecheck  # vérification TypeScript seule
```

## Écrans

| Route | Écran | Description |
|-------|-------|-------------|
| `/` | **Tableau de bord** | Indicateurs clés (total, âge moyen, % +5 ans, en panne), répartition par état, parc par étage, salles à surveiller, répartition par type. |
| `/equipements` | **Équipements** | Table triable, recherche, filtres (type / état / étage) + filtre rapide « + de 5 ans ». |
| `/vue-college` | **Vue du collège** | Maquette **3D Three.js** : salles teintées par santé + icône, clic = la salle s'élève et s'illumine, le reste s'estompe, panneau latéral détaillé. Sélecteur d'étage (RDC → R+3), légende, rotation à la souris. |
| `/signalements` | **Signalements** | Pannes remontées par les enseignants, filtrables par statut, avec message de demande de réparation précomplété. |
| `/design-system` | **Système de design** | Palette, états sémantiques, échelle typo, rayons, ombres, composants. |
| `/signaler/:id` | **Signaler une panne** | **Page publique** ouverte par QR code, sans compte. Aucune donnée nominative n'est demandée. |
| `/connexion` | **Connexion** | Lien magique par email pour accéder à l'espace d'administration. |

Toutes les routes sauf `/signaler/:id` et `/connexion` exigent une session **et** une
adresse inscrite dans `parc_admins`.

## Accès et sécurité

La clé Supabase publiable est embarquée dans le bundle : elle est publique par
conception, et **seules les politiques RLS protègent les données**. Le détail du
modèle d'accès, la marche à suivre pour habiliter une adresse et la configuration
Auth à effectuer dans le dashboard sont documentés dans
[`supabase/README.md`](supabase/README.md).

Deux principes à ne pas défaire :

- `parc_equipements` (qui contient les numéros de série) **n'est jamais lisible en
  anonyme**. La page de scan passe par la fonction `parc_equipement_public(uuid)`,
  qui ne renvoie que de quoi identifier et situer l'équipement.
- Un signalement décrit un problème, pas une personne : **aucune donnée nominative
  n'est collectée**, ni stockée, ni transmise à EmailJS.

L'email envoyé au référent à chaque signalement peut partir de deux endroits — un seul
canal doit être actif à la fois, voir « Notification : quel canal est actif ? » dans
[`supabase/README.md`](supabase/README.md).

## Architecture

```
src/
  data/parc.ts           Plan du bâtiment (salles, helpers santé) + inventaire d'amorçage
  data/parcStore.tsx     Store de l'inventaire : chargement et CRUD Supabase
  lib/auth.tsx           Session, lien magique, habilitation (parc_admins)
  lib/signalements.ts    Accès aux signalements + vue publique d'un équipement
  styles/                tokens.css (variables réutilisables) + app.css (shell & composants)
  components/            Sidebar, Topbar, Badge, Wifi, icônes, RouteProtegee
  pages/                 Dashboard, Equipements, VueCollege, Signalements, Signaler,
                         Connexion, DesignSystem
  college3d/             Moteur 3D : geometry (layout), Building3D (scène), Room3D, Stair3D,
                         RoomPanel, FloorSwitcher, Legend, shades (teintes par état)
supabase/
  migrations/            SQL appliqué au projet (RLS, fonctions)
  functions/             Edge function notify-signalement
```

## Déploiement

Le site est déployé automatiquement sur **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy.yml`) : à chaque `git push` sur `main`, l'app est buildée
puis publiée sur https://qwetsh.github.io/parc-numerique/.

Détails techniques (projet servi sous un sous-chemin `/parc-numerique/`) :

- `base` Vite réglé sur `/parc-numerique/` **en build uniquement** (la racine `/` reste
  utilisée en développement).
- `BrowserRouter` configuré avec `basename={import.meta.env.BASE_URL}`.
- Routage SPA géré sur Pages via `public/404.html` (encode l'URL profonde et redirige)
  + un script de restauration dans `index.html` — les liens directs et le rafraîchissement
  fonctionnent avec des URLs propres.

> Si le dépôt est renommé, adapter `base` dans `vite.config.ts` et `pathSegmentsToKeep`
> dans `public/404.html`.

## Notes

- L'inventaire vit dans Supabase. `SEED_EQUIPEMENTS` (`src/data/parc.ts`) ne sert qu'à
  amorcer une base vide ; le plan des salles, lui, reste statique.
- La vue 3D (Three.js) est **chargée à la demande** (code splitting) : le tableau de
  bord et la liste se chargent instantanément.
- Accessibilité : l'état n'est **jamais codé par la couleur seule** (toujours doublé
  d'un libellé et d'une icône), focus clavier visible, contrastes WCAG AA.

## Prochaines étapes possibles

- Isoler l'application dans son propre projet Supabase (région UE), aujourd'hui
  partagé avec d'autres applications.
- Fiche équipement au clic dans la table, export CSV réel.
- Écrans « Bientôt » : Tickets, Logiciels, Demandes, Mémoire.
