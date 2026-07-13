# 📜 Historique du projet — Le Compagnon du MJ

Ce document retrace les évolutions du projet, à partir de l'historique git et des principaux jalons fonctionnels.

> Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
> Le projet suit la convention [SemVer](https://semver.org/lang/fr/).

---

## [Non publié]

### Ajouté
- **Assistant de création de personnage** (`/players/creer`, `frontend/src/pages/CharacterCreatorPage.jsx`) : wizard multi-étapes D&D 2024 (espèce → classe → statistiques → identité → compétences → sorts si lanceur → historique → récapitulatif). Réintégration native (React 19, thème médiéval) de l'app externe `rpg-character-creator` (Expo/React Native). À la fin, le personnage est enregistré directement dans la table `players` via `playersAPI.create()` — donc utilisable dans les campagnes et l'écran du MJ. Accessible depuis la navbar (« Création ») et un bouton « 🧙 Assistant de création » sur la page Joueurs.
- **Base de règles D&D 2024** (`frontend/src/data/dnd2024/`) : portage JS des données du `rpg-character-creator` — `species.js` (8 espèces), `classes.js` (12 classes), `feats.js` (dons d'origine + `BACKGROUND_FEAT_MAP`), `spells.js` (tours de magie + sorts de niveau 1), `rules.js` (modificateur, PV, CA, bonus de maîtrise), assemblés par `index.js` (`getSystem`). `characterMapper.js` convertit un brouillon de personnage en payload `players` (calcul des sauvegardes, PV, CA, perceptions passives, correspondance des noms de compétences, note récapitulative).
- **Écran Admin** (`/admin`, `frontend/src/pages/AdminPage.jsx`) : réglage d'activation de la génération de PNJ assistée par IA, et générateur de PNJ (bouton "Générer" → affiche une suggestion → "Ajouter à la bibliothèque").
- **Génération de PNJ (espèce, nom, traits)** : `backend/src/data/npcGenerator.js` fournit un tirage aléatoire local (toujours disponible) et un appel optionnel à l'API Perplexity (`PERPLEXITY_API_KEY` dans `.env`, jamais exposée côté client). En cas d'échec de l'appel IA, repli automatique et silencieux sur le tirage aléatoire.
- **Route `/api/admin`** (`backend/src/routes/admin.js`, protégée par `requireAuth`) : `GET/PUT /settings` (toggle `npc_ai_enabled`, persistance en base) et `POST /npcs/generate`.
- **Table `app_settings`** (clé/valeur) dans `backend/src/db/database.js` pour les réglages admin modifiables sans redémarrage.
- Le tirage aléatoire déjà présent sur `NPCsPage` (bouton "Générer aléatoirement") génère désormais aussi un nom (auparavant laissé vide).

### Modifié
- **`frontend/src/pages/PlayerDetailPage.jsx`** — ajout des espèces de base D&D 2024 (`Elfe`, `Nain`, `Halfelin`, `Gnome`, `Demi-Orque`) à la liste `RACES_DND5` du menu Espèce, afin que les personnages créés via l'assistant (et via la création rapide) affichent correctement leur espèce dans la fiche.
- **`backend/src/routes/players.js`** — extraction de la liste des champs autorisés dans une constante `PLAYER_FIELDS` (déduplication entre `buildPlayerFields` et `buildPlayerUpdates`, même approche que `ENEMY_FIELDS` dans `enemies.js`). Refacto pur, aucun changement de comportement.

### Supprimé
- **Vite scaffolding mort** : `frontend/src/App.jsx`, `App.css`, `index.css`, `assets/hero.png`, `assets/react.svg`, `assets/vite.svg`, `public/icons.svg` — non importés (le routage et les styles passent par `main.jsx` et `styles/index.css`).
- **Documentation obsolète** : `frontend/README.md` (template Vite par défaut), `INDEX_PAGES.md`, `PAGES_INTEGRATION.md`, `PAGES_SUMMARY.txt`, `README_PAGES.md`, `ROUTING_EXAMPLE.jsx`, `SETUP_CHECKLIST.md`, `TESTID_REFERENCE.md` — guides d'intégration de l'init, intégration déjà faite.
- **Journaux SQLite orphelins** : `backend/data/test*.db-journal` — les tests utilisent `/tmp/` (voir l'en-tête de chaque fichier `tests/*.test.js`).

À venir : suivi des prochaines évolutions (bestiaire enrichi, import/export de campagnes, mode mobile dédié à l'écran du MJ, etc.).

---

## [1.0.2] — 2026-04-10

### Corrigé
- **Audit complet de cohérence des champs entre création et affichage** (`5d60ca1`)
  - Backend : harmonisation des routes `enemies` et `players` (champs et payloads alignés sur le schéma SQLite)
  - Frontend : `EnemyDetailPage`, `PlayerDetailPage`, `SceneDetailPage` corrigés pour consommer les mêmes noms de champs
- **Affichage des ennemis, tracker et navigation vers l'écran MJ** (`bc389fc`)
  - Backend : ajustements sur `tracker.js`
  - Frontend : refonte d'`DMScreenPage`, retouches sur `EnemiesPage`, ajout d'une entrée dans le client API

---

## [1.0.1] — 2026-04-04

### Ajouté
- **Logging frontend** (`fbed0b4`)
  - `frontend/src/utils/clientLogger.js` : capture des erreurs côté navigateur et envoi vers `/api/logs`
  - Initialisation dans `main.jsx` au démarrage de l'application
  - Nouvelle route backend `routes/logs.js` qui réceptionne et journalise les erreurs frontend
- Configuration `nodemon.json` pour le backend
- Notifications via `react-hot-toast` côté frontend

### Modifié
- Mise à jour des dépendances backend et frontend
- Refonte de `frontend/src/main.jsx` pour intégrer `BrowserRouter`, `Toaster` et le logger client
- `EnemyDetailPage`, `EnemiesPage`, `SceneDetailPage` adaptés au nouveau client API
- `frontend/src/api/client.js` enrichi (helpers, intercepteurs)

### Initialisation complète (`fdd28c2`)
- Ajustements multiples sur les routes backend (`enemies`, `scenes`, `tracker`, `db/database.js`)
- Pages frontend retravaillées : `CampaignDetailPage`, `EnemiesPage`, `PlayerDetailPage`, `SceneDetailPage`

---

## [1.0.0] — 2026-03-27

### Ajouté — Initialisation du projet (`d6a1f7f`)

Première version fonctionnelle du Compagnon du MJ pour **D&D 5.5 (2024)**.

**Backend (Node.js 22 + Express)**
- Serveur Express avec CORS, gestion d'erreurs, logger Winston
- Base de données SQLite via le module natif `node:sqlite` (Node 22+)
- Schéma : `campaigns`, `players`, `campaign_players`, `enemies`, `scenes`, `scene_locations`, `scene_npcs`, `scene_enemy_instances`, `initiative_trackers`, `tracker_participants`
- Triggers SQL `updated_at` automatiques
- Routes REST :
  - `/api/campaigns` — gestion des campagnes
  - `/api/players` — fiches de joueurs (caractéristiques, sauvegardes, équipement, tokens)
  - `/api/enemies` — bestiaire (modèles d'ennemis avec actions, résistances, immunités, etc.)
  - `/api/scenes` — scènes (lieux, PNJ, instances d'ennemis)
  - `/api/tracker/:sceneId` — tracker d'initiative
- Tests Jest + Supertest pour campaigns, players, enemies, scenes
- Logs Winston dans `backend/logs/` (`combined.log`, `error.log`, `exceptions.log`, `rejections.log`)

**Frontend (React 19 + Vite)**
- Routing via `react-router-dom` v7
- Client API Axios centralisé (`src/api/client.js`)
- Pages : `CampaignsPage`, `CampaignDetailPage`, `PlayersPage`, `PlayerDetailPage`, `EnemiesPage`, `EnemyDetailPage`, `SceneDetailPage`, `DMScreenPage`
- Composants UI : `Button`, `Card`, `ConfirmDialog`, `Input`, `Modal`, `StatBlock`, `TokenAvatar`
- Composants layout : `Layout`, `Navbar`
- Thème médiéval (CSS global, police Crimson Text)
- Tests Vitest + Testing Library pour les composants UI

**Outillage**
- Workspace racine avec `concurrently` pour lancer backend et frontend en parallèle
- Scripts npm `dev`, `build`, `test` à la racine
- `.gitignore` (node_modules, builds, base de données, logs, uploads)
- Documentation initiale : `README.md` racine, plus dans `frontend/` : `README.md`, `INDEX_PAGES.md`, `PAGES_INTEGRATION.md`, `PAGES_SUMMARY.txt`, `README_PAGES.md`, `ROUTING_EXAMPLE.jsx`, `SETUP_CHECKLIST.md`, `TESTID_REFERENCE.md`

---

## Synthèse des commits

| Hash       | Date       | Sujet                                                                  |
|------------|------------|------------------------------------------------------------------------|
| `5d60ca1`  | 2026-04-10 | fix: audit complet cohérence des noms de champs création/affichage     |
| `bc389fc`  | 2026-04-10 | fix: corriger affichage ennemis, tracker et navigation écran MJ        |
| `fdd28c2`  | 2026-04-04 | feat: initialisation complete du projet Le Compagnon du MJ             |
| `fbed0b4`  | 2026-04-04 | feat: update dependencies and add logging                              |
| `d6a1f7f`  | 2026-03-27 | feat: initialisation complète du projet Le Compagnon du MJ             |

---

*Document généré le 2026-04-29.*
