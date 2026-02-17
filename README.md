# La Cale Helper v2 — Audit & Déploiement

Ce dépôt est une **exportation HTTrack** d'une application front existante.

## 1) Audit du repo

### Arborescence observée
- `index.html`
- `404.html` (ajouté pour fallback GitHub Pages)
- `favicon.svg`
- `assets/index-Ddv4Ao2m.js`
- `assets/index-BXI7GdG3.css`

### Déductions techniques
- **Framework** : Vue 3 (présence de signatures `@vue/shared v3.5.27` dans le bundle JS).
- **Build tool probable** : Vite (structure des assets hashés + bootstrap modulepreload typique).
- **Style** : Tailwind CSS (classes utilitaires et reset Tailwind dans le CSS bundle).
- **Routing** : pas de sources disponibles, donc impossible de confirmer `vue-router`; l'app est au minimum une SPA montée dans `#app`.
- **API externes visibles** : TMDB (`https://api.themoviedb.org/3`) et images TMDB (`https://image.tmdb.org/t/p/w500`).

### Points sensibles déploiement
- `index.html` contient `<base href="/lacale-helper-v2/">` :
  - ✅ adapté à GitHub Pages (repo project pages),
  - ⚠️ à prendre en compte en Docker (servir sous `/lacale-helper-v2/`, ou modifier le `base href`).
- Le correctif du bouton Home/logo est volontairement injecté en **script inline dans `index.html`** (avant le bundle) pour éviter toute édition directe du JS minifié Vite, source de collisions de noms globales et d'écrans noirs.
- Absence de code source (`src/`, `package.json`) : on déploie une version **statique prébuildée**, sans rebuild local.
- Vérifier la cohérence `index.html` ↔ `assets/` : tout chunk référencé (scripts modules, modulepreload, imports dynamiques) doit exister dans le dépôt, sinon le déploiement doit échouer via les tests.
- SPA refresh : il faut une stratégie fallback vers `index.html`/`404.html` selon l'hébergeur.
- CSP : aucune CSP déclarée dans `index.html`; si vous en ajoutez une stricte, autoriser au minimum TMDB + éventuels CDN.

---

## 2) Comparaison avec le “premier” projet

### Ce qui a pu être comparé ici
Dans ce repo local, l'historique Git montre 2 commits :
1. import HTTrack,
2. ajout d'un `<base href="/lacale-helper-v2/">`.

Donc la différence vérifiable localement est :
- **Ajout du base path** dans `index.html`.

### Ce qu'il manque pour une comparaison complète
Je n'ai pas accès à votre ancien repo/ancienne version dans cet environnement, donc je ne peux pas établir automatiquement :
- diff UI,
- diff logique métier,
- diff endpoints complets,
- diff bundles détaillé ancien vs nouveau.

➡️ Si vous fournissez le dépôt/commit de référence, je peux produire un diff exhaustif.

---

## 3) Modes de déploiement

## A) GitHub Pages (statique)

Ce repo est déjà prêt pour un déploiement statique avec base path `/lacale-helper-v2/`.

### Pré-requis
- Repo GitHub nommé `lacale-helper-v2` (ou adapter le `base href` sinon).
- Activer GitHub Pages via Actions (workflow inclus ci-dessous).

### Étapes
1. Push de la branche `deploy`.
2. Vérifier l’exécution du workflow `.github/workflows/pages.yml`.
3. Ouvrir l’URL Pages générée.

### SPA fallback
- `404.html` (copie de `index.html`) est inclus pour gérer les refresh sur routes client potentielles.

## B) Docker (Nginx)

Le mode Docker sert l’application sous `/lacale-helper-v2/` pour rester cohérent avec le `base href`.

### Lancer
```bash
docker compose up -d --build
```

### Accéder
- http://localhost:8080/ (redirige vers `/lacale-helper-v2/`)
- http://localhost:8080/lacale-helper-v2/

### SPA fallback
- `nginx.conf` utilise `try_files` vers `/lacale-helper-v2/index.html`.

---

## 4) Checklist de validation

### Validation fonctionnelle
- [ ] La page charge sans erreur 404 sur JS/CSS.
- [ ] Le favicon s’affiche.
- [ ] Les interactions principales de l’app fonctionnent.
- [ ] Les appels TMDB passent (vérifier onglet Network).

### Validation GitHub Pages
- [ ] URL Pages en HTTPS accessible.
- [ ] Refresh manuel sur une route (si route client) ne casse pas l’affichage.
- [ ] Aucun asset ne pointe vers un mauvais préfixe.

### Validation Docker
- [ ] `docker compose up -d --build` passe.
- [ ] `curl -I http://localhost:8080/` retourne une redirection vers `/lacale-helper-v2/`.
- [ ] `curl -I http://localhost:8080/lacale-helper-v2/` retourne `200`.
- [ ] Refresh dans le navigateur conserve l’affichage.

---

## Fichiers de déploiement ajoutés
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `.github/workflows/pages.yml`
- `404.html`
