# 🍪 Jardin Cookie Clicker — Site d'optimisation

Petit site **100% local** (aucune dépendance, aucun serveur requis) qui affiche les
graines du jardin de *Cookie Clicker* pour suivre ton optimisation.

## Lancer le site

Ouvre simplement `index.html` dans ton navigateur :

```bash
xdg-open index.html      # Linux
open index.html          # macOS
start index.html         # Windows
```

> Astuce : tu peux aussi le servir avec `python3 -m http.server` puis ouvrir
> http://localhost:8000 — mais un double-clic sur `index.html` suffit.

## Fonctionnalités

- **Liste complète des plantes** avec nom anglais / français, dans ton ordre et tes 2 groupes.
- **Notation reprise de ta feuille** : `(ticks avant maturation)` puis `+ ticks de vie après maturité`.
  - `♾️` = plante immortelle.
  - Un `+` final = durée notable / plante à récolter (bonus).
  - Marqueurs `¹ ² ³ W J` repris de ta feuille (variantes / groupes).
- **Cases à cocher** pour marquer ce que tu as débloqué — **sauvegardé** dans le navigateur.
- **Recherche**, **filtres** (toutes / débloquées / à débloquer), **tri** et **barre de progression**.
- **Bonus depuis le wiki** : effet de chaque plante, recette de mutation (plantes parentes) et coût.

## Fichiers

| Fichier      | Rôle                                            |
|--------------|-------------------------------------------------|
| `index.html` | Structure de la page                            |
| `style.css`  | Thème jardin / terre                            |
| `app.js`     | Affichage, filtres, recherche, sauvegarde       |
| `data.js`    | **Toutes les données des plantes** (à éditer)   |

Pour ajuster une valeur (ticks, effet…), modifie `data.js`.

## Sources

- [Cookie Clicker Wiki — Garden](https://cookieclicker.wiki.gg/wiki/Garden)
- [Cookie Clicker Wiki — Garden Strategies](https://cookieclicker.wiki.gg/wiki/Garden_Strategies)
