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

- **Arbre des mutations** façon diagramme : chaque ligne se lit comme une recette
  **parent + parent → (probabilité) plante obtenue**, regroupée en chaînes comme ta feuille.
- **Probabilité de mutation par tick** affichée sur chaque flèche (ex. `0.05`, `0.0007`).
  Les mutations « à la récolte » sont signalées à part.
- **`3×` / `8×`** = nombre de cases requises pour la recette.
- **Clique une plante** (parent ou enfant) pour faire défiler 3 états :
  ⬜ pas sur le jardin → 🟡 sur le jardin (pas encore débloquée) → ✅ débloquée → ⬜…
  L'état est **sauvegardé** dans le navigateur et se met à jour partout dans l'arbre.
- **Recherche**, **filtres** (toutes / obtenues / à débloquer) et **barre de progression**.

## Fichiers

| Fichier      | Rôle                                                        |
|--------------|-------------------------------------------------------------|
| `index.html` | Structure de la page                                        |
| `style.css`  | Thème jardin / terre + styles du diagramme                  |
| `app.js`     | Construction du diagramme, filtres, recherche, sauvegarde   |
| `data.js`    | **Plantes** (`PLANTS`) **et recettes de mutation** (`MUTATIONS`) |
| `img/`       | Sprites des graines (1 PNG par plante, depuis le wiki)      |

Pour ajuster une recette (parents, probabilité…), modifie le tableau `MUTATIONS` dans `data.js`.

## Sources

- [Cookie Clicker Wiki — Garden](https://cookieclicker.wiki.gg/wiki/Garden)
- [Cookie Clicker Wiki — Garden Strategies](https://cookieclicker.wiki.gg/wiki/Garden_Strategies)
