# CLAUDE.md — Jardin Cookie Clicker

Mémoire de projet pour Claude Code (CLI **et** extension VSCode). Lis ce fichier au
démarrage pour connaître le projet, ses conventions et son état.

## Règles de travail (IMPORTANT)

- **Pas de commit/push automatique.** Ne commit et ne push QUE si l'utilisateur le
  demande explicitement (« commit », « push », « envoie »…). Sinon, on édite les
  fichiers et on s'arrête là.
- **Langue : français** pour l'UI, les réponses et les messages de commit.
- Branche de dev : **`claude/cool-wright-pr57m9`** — dépôt **`tidurand/cookie-clicker-garden`**.
- Messages de commit : finir par les lignes `Co-Authored-By:` et `Claude-Session:`
  (voir l'historique git pour le format exact).

## Présentation

Site **local, sans dépendance ni build** (HTML/CSS/JS pur) qui sert de guide complet
au mini-jeu **Jardin** de Cookie Clicker : les 34 plantes, leur arbre des mutations
(parents → enfant + probabilité), la progression, et des outils d'optimisation
(save-scum, cookies de jardin…). Interface en français.

Lancer : ouvrir `index.html` dans le navigateur (un rechargement normal suffit grâce
aux balises no-cache). Aucune commande de build.

## Fichiers

| Fichier      | Rôle                                                                 |
|--------------|----------------------------------------------------------------------|
| `index.html` | Structure, balises **no-cache**, légende (en bas), modale, liens `?v=N` |
| `style.css`  | Thème terre/cookie, badges, modale                                   |
| `app.js`     | Rendu de l'arbre, état, badges, modales, chrono, top 3              |
| `data.js`    | `PLANTS` (34), `MUTATIONS` (recettes), `AGING` (ageTick/ageTickR)     |
| `img/`       | Sprites des plantes (1 PNG par plante) + cookie.png, garden-bg.jpg    |
| `README.md`  | Doc utilisateur                                                       |

### Convention cache-busting
À **chaque** modif de css/js/data, incrémenter `?v=N` sur les 3 liens dans
`index.html` (`sed -i 's/?v=N/?v=N+1/g' index.html`). Valeur actuelle : **v25**.

## Données (`data.js`)

`PLANTS[]` — un objet par plante. Champs :
- `en`, `fr` : noms (le **français** est affiché en principal, l'anglais en secondaire).
- `mature` : ticks avant maturation (valeurs de la feuille de l'utilisateur).
- `window` : ticks de vie après maturité avant disparition ; `-1` = immortelle.
- `group` : 1 (prioritaires) / 2 (autres) ; `checked` : état initial ; `marker` : ¹²³ W J.
- `fungus` (🍄 sinon 🌱), `effect`, `mutation`, `cost` (textes wiki, peu affichés).
- Optionnels : `overtake` (⚠️), `scumForce` (force le 🔄), `gardenCookie` (string « 0,1% » → 🍪),
  `alts` (tableau de strings « façon (proba) » → 🔀).
- Fusionnés au chargement depuis `AGING` : `at` (ex. "0.4-1.1"), `ma` (âge à maturité).

`MUTATIONS[]` — recettes `{ child, parents:[{en,qty}], chance, note, row }`. Tri
topologique (`topoSortMutations`) : un enfant n'apparaît qu'après ses parents.
Plusieurs entrées peuvent avoir le même `child` (= plusieurs recettes affichées).

`AGING{}` — `en → {at, ma}` issus **du code source du jeu** (`minigameGarden.js`).
`at` = `ageTick`-`(ageTick+ageTickR)`. Vérifié exact contre la source.

## État (localStorage)

| Clé | Contenu | Affecté par « Réinitialiser » ? |
|-----|---------|----------------------------------|
| `cc-garden-checked` | `checkedState` : 0/1/2 par plante (⬜ pas sur jardin / 🟡 sur jardin / ✅ débloquée) | **Oui** (remis à 0, sauf Baker's Wheat → 2) |
| `cc-garden-cookies` | `cookieState` : cookies de jardin obtenus (permanent) | **Non** (volontaire) |
| `cc-garden-timer-start` | timestamp du chrono | relancé au reset |
| `cc-garden-best-times` | top 3 `[{ms,date}]` | non |
| `cc-garden-growth-mult` | multiplicateur de croissance (champ retiré de l'UI, défaut 1) | non |

## Badges sur chaque plante / recette

- **🌱/🍄 N** : ticks avant maturation. **💀 N** : ticks avant disparition (après maturité) ; **♾️** immortelle.
- **🔄** (toutes les plantes) : optimisation save/reload. Survol → `~N (min–max), P%`.
  - `N` = baisse du compteur « mûr dans X » **au meilleur reroll** = `gain_max / AT_moyen`
    (`saveScumGain`). `min–max` = floor/ceil. `P%` = chance d'obtenir le gain d'âge max (`maxRerollChance`).
  - Mécanique du jeu : `âge += randomFloor((ageTick + ageTickR·rand)·mult)`, mature à `MA`, mort à **100**.
    L'utilisateur joue sans dragon + sol engrais ⇒ `mult = 1`. Le badge n'affiche que l'émoji ;
    le texte apparaît au survol (`.modif-val`, pas de title natif).
- **⚠️** : peut envahir/submerger les voisines (`overtake`) — Indiscrerbe, Sporemiette, Champipâte.
- **🍪** : cookie de jardin. **Bouton cliquable** (bascule obtenu/non), **permanent** (clé `cc-garden-cookies`,
  non touché par le reset). Vert = obtenu, gris = non (couleurs du bouton Réinitialiser). Survol → % (`.cookie-val`).
  Plantes & % : Blé du Pâtissier 0,1 · Pâtisetille 1,5 · Odeurweiss 1 · Vertiture 0,5 · Ducdeterre 0,5.
- **🔀** : plusieurs façons d'obtenir la plante (`alts`). Placé **au niveau de la recette** (sur l'enfant
  uniquement, pas sur les parents). **Cliquable** → modale listant les façons. Plantes : Maïspouce,
  Trèfle Doré, Odeurweiss, Sporemiette, Gardelichen, Burburleur.
- **🧬 N** : nombre de mutations encore obtenables grâce à cette plante (parent d'enfants non débloqués,
  `PARENT_OF`). **Cliquable** → modale des recettes. Couleur selon l'état de la plante.

## Fonctionnalités UI

- **Filtres** : Toutes / ✅ Obtenues / 🌟 Débloquables / ⬜ À débloquer. Couleur de fond seulement
  au survol ou si actif. « Débloquables » = mutations dont les parents sont obtenus (vert) ou sur le
  jardin (jaune).
- **Surbrillance** des recettes débloquables : vert (2 parents ✅) / jaune (parents 🟡).
- **Recherche** (FR/EN), **barre de progression**, **chrono** (jours+HH:MM:SS) relancé au reset,
  **Top 3** des meilleurs temps (datés, bouton Vider). Bouton **Réinitialiser** actif seulement quand
  tout est débloqué.
- **Modale partagée** `#mutation-modal` réutilisée par 🧬 (`showMutationsFor`) et 🔀 (`showAltsFor`).

## Légende
En **bas de page** (`index.html`), liste toutes les icônes. La maintenir à jour quand on
ajoute/modifie un badge.

## Pièges connus
- Toujours bumper `?v=N` sinon l'utilisateur ne voit pas les changements (cache).
- Les badges cliquables (🍪, 🔀, 🧬) doivent faire `e.stopPropagation()` pour ne pas déclencher
  le cycle d'état du nœud parent.
- Les valeurs AT/MA et les recettes proviennent du **vrai code source** `minigameGarden.js`
  (téléchargeable via curl) — référence fiable en cas de doute, pas le résumé wiki.
