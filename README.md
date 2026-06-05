# Parc numérique — Collège Jean-Moulin

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
| `/design-system` | **Système de design** | Palette, états sémantiques, échelle typo, rayons, ombres, composants. |

## Architecture

```
src/
  data/parc.ts          Données de démonstration typées (salles, équipements, helpers santé)
  styles/               tokens.css (variables réutilisables) + app.css (shell & composants)
  components/            Sidebar, Topbar, Badge, Wifi, icônes
  pages/                 Dashboard, Equipements, VueCollege, DesignSystem
  college3d/             Moteur 3D : geometry (layout), Building3D (scène), Room3D, Stair3D,
                         RoomPanel, FloorSwitcher, Legend, shades (teintes par état)
```

## Notes

- Les données sont **fictives** (`src/data/parc.ts`). Le **R+1 est l'étage « réel »**
  (salles de démo : CDI, salle informatique 210, labo, etc.) ; RDC / R+2 / R+3 sont
  peuplés de façon variée pour illustrer le code couleur.
- La vue 3D (Three.js) est **chargée à la demande** (code splitting) : le tableau de
  bord et la liste se chargent instantanément.
- Accessibilité : l'état n'est **jamais codé par la couleur seule** (toujours doublé
  d'un libellé et d'une icône), focus clavier visible, contrastes WCAG AA.

## Prochaines étapes possibles

- Brancher de vraies données (API / Supabase) en remplaçant `src/data/parc.ts`.
- Fiche équipement au clic dans la table, export CSV réel.
- Écrans « Bientôt » : Tickets, Logiciels, Demandes, Mémoire.
