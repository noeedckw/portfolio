# Portfolio — map 3D pilotée par config

## Principe

En arrivant sur le site : une **map globale en 3D**, minimaliste, où
chaque projet est une carte flottante (image + titre + date). On
clique sur une carte → la caméra **zoome dessus en douceur** et un
panneau affiche les détails du projet, avec un **thème visuel propre
au projet** (couleur de fond, couleur d'accent, particules). Touche
Échap ou bouton "retour" pour revenir à la vue globale.

Tout est piloté par un seul fichier :

- `src/config/projects.config.js` — un objet = une carte sur la map
- `src/config/site.config.js` — ton identité (nom, rôle, bio...)

**Aucune modification de composant nécessaire pour ajouter un
projet.** Champs obligatoires : `id`, `title`, `date`, `image` (mets
`null` si pas d'image, une carte de fond stylée le remplace). Tout le
reste est optionnel.

## Ajouter un projet

1. Duplique un des objets dans `projects.config.js`
2. Mets ton image dans `public/assets/projects/ton-projet/cover.jpg`
   (conseil perf : compresse-la, ~1200px de large max, format `.webp`
   ou `.jpg` — les textures lourdes sont la première cause de lag sur
   ce genre de scène)
3. Personnalise `theme` (background / accent / particles) pour que le
   zoom sur ce projet ait sa propre ambiance
4. Laisse `position` non défini pour que le placement sur la map soit
   calculé automatiquement (`src/config/layout.js`), ou fixe-le
   toi-même en `[x, y, z]` si tu veux un placement précis
5. C'est tout — la map s'adapte automatiquement, pas de limite de
   nombre de projets

## Comment ça reste léger

- Un seul `<Canvas>` R3F pour toute l'app, jamais recréé
- Chaque carte = un plan texturé (pas de modèle 3D lourd)
- Le "zoom" est une animation de caméra (`CameraControls.setLookAt`),
  pas une scène rechargée
- Le changement de thème = une interpolation de couleur de fond/fog,
  pas une reconstruction de la scène
- `dpr` plafonné à 1.5, pas d'ombres portées, pas de post-processing
- Un seul système de particules GPU (`Sparkles`) réutilisé partout

## Lancer en local

```bash
npm install
npm run dev
```

## Déployer sur GitHub Pages

1. Dans `vite.config.js`, mets `base: "/nom-du-repo/"` (ou `"/"` si le
   repo s'appelle `ton-pseudo.github.io`)
2. `npm run deploy`
3. Dans les settings GitHub du repo → Pages → source = branche `gh-pages`

## Pistes d'évolution

- Ajouter un `sceneStyle` par thème plus poussé (ex: un mesh de fond
  différent selon le projet plutôt que juste couleur + particules)
- Ajouter des URLs dédiées par projet (`react-router` + `slug`) pour
  pouvoir lier directement un projet zoomé
- Ajouter une mini-liste/nav (points cliquables) pour naviguer entre
  projets sans repasser par la vue globale