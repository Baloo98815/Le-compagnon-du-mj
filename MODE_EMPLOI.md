# 🎲 Mode d'emploi — Le Compagnon du MJ

Guide d'installation, de lancement et d'utilisation du Compagnon du MJ, l'application web pour Maîtres du Jeu de **Donjons & Dragons 5.5 (2024)**.

---

## 1. Présentation rapide

Le Compagnon du MJ est une application web locale qui aide à préparer et animer une partie de D&D :

- **Campagnes** — créer, organiser, prendre des notes
- **Joueurs** — fiches de personnages complètes (caractéristiques, sauvegardes, compétences, équipement, token)
- **Bestiaire** — créer/gérer des modèles d'ennemis (statblocks complets : actions, résistances, immunités…)
- **Scènes** — lieux, PNJ, instances d'ennemis, map
- **Écran du MJ** — tracker d'initiative, gestion HP/états, en combat ou hors combat

L'application tourne en local (rien n'est envoyé sur Internet), avec un frontend React et un backend Node.js qui stocke les données dans une base SQLite.

---

## 2. Prérequis

Avant de lancer le projet, vérifier que les outils suivants sont installés sur la machine :

| Outil      | Version requise        | Vérification                    |
|------------|------------------------|---------------------------------|
| Node.js    | **22.x ou supérieur**  | `node --version`                |
| npm        | livré avec Node.js     | `npm --version`                 |
| git        | recommandé (pour cloner et suivre les commits) | `git --version`                 |

> Le projet utilise le **module SQLite natif** introduit dans Node 22 (`node:sqlite`). Pas besoin de `better-sqlite3` ni de toolchain C++.

---

## 3. Installation

À effectuer **une seule fois** au premier lancement (ou après un `git pull` qui modifie les `package.json`).

```bash
# 1. Se placer à la racine du projet
cd E:\dev\compagnon

# 2. Installer les dépendances racine (concurrently pour lancer back+front en parallèle)
npm install

# 3. Installer les dépendances backend
cd backend
npm install
cd ..

# 4. Installer les dépendances frontend
cd frontend
npm install
cd ..
```

### Configuration du backend

Copier le fichier d'exemple et l'ajuster si besoin :

```bash
copy backend\.env.example backend\.env
```

Contenu typique de `backend/.env` :

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
# DB_PATH=./data/compagnon_mj.db   # facultatif, valeur par défaut
```

> ⚠️ Le fichier `.env` est ignoré par git (présent dans `.gitignore`).

---

## 4. Lancer le projet

### Option A — Tout lancer d'un coup (recommandé)

Depuis la racine du projet :

```bash
npm run dev
```

Cette commande utilise `concurrently` pour démarrer **simultanément** :
- le backend sur `http://localhost:3001`
- le frontend sur `http://localhost:5173`

Le frontend proxy automatiquement les requêtes `/api/*` et `/uploads/*` vers le backend (configuré dans `frontend/vite.config.js`).

### Option B — Lancer chaque service dans son propre terminal

**Terminal 1 — Backend :**

```bash
cd backend
npm run dev
```

Le serveur Express démarre via `nodemon` (rechargement automatique sur changement de `src/**/*.js`).

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

Vite démarre avec hot module reload.

### Accéder à l'application

Ouvrir le navigateur sur **http://localhost:5173**.

L'application redirige vers `/campaigns` au démarrage. La barre de navigation propose :

- **Campagnes** (`/campaigns`)
- **Joueurs** (`/players`)
- **Ennemis** (`/enemies`)
- **Écran du MJ** (`/dm`)

L'écran du MJ (`/dm`) s'affiche en mode plein écran sans navbar — pratique pour basculer dessus pendant la session.

---

## 5. Vérifier que tout fonctionne

### Healthcheck backend

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :

```json
{ "success": true, "status": "OK", "timestamp": "2026-04-29T..." }
```

### Tests automatisés

```bash
# À la racine — lance backend puis frontend
npm test

# Ou séparément
cd backend && npm test            # Jest + Supertest
cd frontend && npm test           # Vitest + Testing Library
```

---

## 6. Build de production

```bash
cd frontend
npm run build
```

Les fichiers statiques sont générés dans `frontend/dist/`. En production (`NODE_ENV=production`), le backend Express sert directement ce dossier — un seul process suffit alors :

```bash
cd backend
NODE_ENV=production npm start
```

Le site est accessible sur `http://localhost:3001` (frontend + API au même endroit).

---

## 7. Structure du projet

```
compagnon/
├── HISTORIQUE.md                # Évolutions du projet (changelog)
├── MODE_EMPLOI.md               # Ce fichier
├── README.md                    # Présentation courte
├── package.json                 # Scripts racine (dev / build / test via concurrently)
│
├── backend/                     # API Node.js + Express
│   ├── .env                     # (à créer) variables d'env locales
│   ├── .env.example             # Modèle pour .env
│   ├── nodemon.json             # Config du watcher
│   ├── package.json
│   ├── data/                    # Base SQLite (générée au runtime, ignorée par git)
│   │   └── compagnon_mj.db
│   ├── logs/                    # Logs Winston (combined, error, exceptions, rejections)
│   ├── uploads/                 # Tokens uploadés (joueurs, ennemis)
│   ├── src/
│   │   ├── server.js            # Point d'entrée Express
│   │   ├── db/database.js       # Init SQLite + schéma
│   │   ├── middleware/          # errorHandler, requestLogger
│   │   ├── routes/              # campaigns, players, enemies, scenes, tracker, logs
│   │   └── utils/logger.js      # Logger Winston
│   └── tests/                   # Tests Jest + Supertest
│
└── frontend/                    # SPA React + Vite
    ├── index.html
    ├── vite.config.js           # Proxy /api et /uploads vers :3001
    ├── package.json
    ├── public/                  # favicon
    └── src/
        ├── main.jsx             # Entrée React (BrowserRouter + Toaster + clientLogger)
        ├── styles/index.css     # Thème médiéval global
        ├── api/client.js        # Client Axios + helpers (campaignsAPI, playersAPI, …)
        ├── utils/clientLogger.js  # Capture erreurs front → POST /api/logs
        ├── components/
        │   ├── layout/          # Layout, Navbar
        │   └── ui/              # Button, Card, ConfirmDialog, Input, Modal, StatBlock, TokenAvatar
        ├── pages/               # CampaignsPage, CampaignDetailPage, PlayersPage,
        │                        #   PlayerDetailPage, EnemiesPage, EnemyDetailPage,
        │                        #   SceneDetailPage, DMScreenPage
        └── test/                # Tests Vitest + Testing Library
```

---

## 8. API REST (résumé)

| Méthode          | Route                                    | Description                              |
|------------------|------------------------------------------|------------------------------------------|
| GET / POST       | `/api/campaigns`                         | Liste / création de campagnes            |
| GET / PUT / DEL  | `/api/campaigns/:id`                     | Détail / mise à jour / suppression       |
| POST / DEL       | `/api/campaigns/:id/players/:playerId`   | Associer / dissocier un joueur           |
| GET / POST       | `/api/players`                           | Joueurs                                  |
| GET / PUT / DEL  | `/api/players/:id`                       | Fiche joueur                             |
| POST             | `/api/players/:id/token`                 | Upload du token (multipart)              |
| GET / POST       | `/api/enemies`                           | Bestiaire                                |
| GET / PUT / DEL  | `/api/enemies/:id`                       | Fiche ennemi                             |
| POST             | `/api/enemies/:id/token`                 | Upload du token                          |
| GET / POST       | `/api/scenes`                            | Scènes (filtrer par `?campaign_id=`)     |
| GET / PUT / DEL  | `/api/scenes/:id`                        | Détail scène                             |
| POST / PUT / DEL | `/api/scenes/:id/locations[/:locId]`     | Lieux d'une scène                        |
| POST / PUT / DEL | `/api/scenes/:id/npcs[/:npcId]`          | PNJ d'une scène                          |
| POST / DEL       | `/api/scenes/:id/enemies[/:instanceId]`  | Instances d'ennemis                      |
| GET / POST / DEL | `/api/tracker/:sceneId`                  | Tracker d'initiative                     |
| POST             | `/api/tracker/:sceneId/participants`     | Ajouter un participant                   |
| PATCH            | `/api/tracker/:sceneId/participants/:id/hp`         | Modifier les PV (`{ delta }`)  |
| PATCH            | `/api/tracker/:sceneId/participants/:id/conditions` | Modifier les états             |
| DELETE           | `/api/tracker/:sceneId/participants/:id`            | Retirer un participant         |
| PATCH            | `/api/tracker/:sceneId/turn`             | Tour suivant                             |
| GET              | `/api/health`                            | Vérification de l'état du serveur        |
| POST             | `/api/logs`                              | Réception des erreurs frontend           |

Toutes les réponses suivent le format `{ success: boolean, data?: ..., error?: ... }`. Le client Axios extrait automatiquement le champ `data`.

---

## 9. Workflow recommandé en partie

1. **Préparation** — créer la campagne, ajouter les joueurs (fiches complètes avec tokens), constituer le bestiaire d'ennemis qu'on prévoit de croiser.
2. **Création de scènes** — depuis la fiche campagne, créer les scènes attendues. Pour chaque scène : ajouter les lieux, les PNJ, les ennemis (instances copiées du bestiaire).
3. **En session** — ouvrir l'**Écran du MJ** (`/dm`) sur un second écran ou une tablette. Y déclencher le tracker d'initiative quand un combat démarre, gérer les PV et états, faire avancer les tours.
4. **Après la session** — annoter la campagne (notes, découvertes, suite à préparer), mettre à jour les fiches de joueurs si montée de niveau.

---

## 10. Maintenance & dépannage

### Logs

- Backend : `backend/logs/`
  - `combined.log` — tous les logs
  - `error.log` — erreurs uniquement
  - `exceptions.log` — exceptions non gérées
  - `rejections.log` — promesses rejetées non gérées
- Frontend : les erreurs sont capturées par `clientLogger.js` et envoyées au backend (`POST /api/logs`).

Le niveau de log est contrôlé par `LOG_LEVEL` dans `backend/.env` (`info`, `warn`, `error`, `debug`).

### Base de données

- Fichier : `backend/data/compagnon_mj.db` (avec `-shm` et `-wal` en mode WAL).
- Schéma initialisé automatiquement au démarrage (voir `backend/src/db/database.js`).
- Pour réinitialiser totalement : arrêter le serveur, supprimer les fichiers `compagnon_mj.db*`, redémarrer.
- En production sur un filesystem qui ne supporte pas WAL (FUSE, certains conteneurs), le code retombe en mode journal classique automatiquement.

### Uploads

- Tokens stockés dans `backend/uploads/tokens/` (joueurs) et `backend/uploads/enemies/` (ennemis).
- Servis via `http://localhost:3001/uploads/...`.
- Ignorés par git.

### Problèmes courants

| Symptôme                                 | Cause probable / Solution                                                           |
|------------------------------------------|--------------------------------------------------------------------------------------|
| `Error: Cannot find module 'node:sqlite'` | Node < 22 → mettre à jour Node                                                      |
| Port 3001 ou 5173 déjà utilisé           | Modifier `PORT` dans `backend/.env` ou `server.port` dans `frontend/vite.config.js` |
| Le frontend ne voit pas l'API            | Vérifier que le backend tourne et que le proxy Vite pointe sur le bon port          |
| CORS bloque les requêtes                 | Vérifier `CORS_ORIGIN` dans `backend/.env` (doit matcher l'URL du frontend)         |
| Tests Jest qui ne se terminent pas       | `--detectOpenHandles --forceExit` est déjà actif, vérifier les connexions DB ouvertes |

---

## 11. Commandes utiles (cheat sheet)

```bash
# Lancer en dev (back + front)
npm run dev

# Tests
npm test                          # tous les tests
cd backend && npm test            # backend seul
cd backend && npm run test:watch  # backend en watch
cd frontend && npm test           # frontend seul
cd frontend && npm run test:watch # frontend en watch
cd frontend && npm run test:coverage  # couverture frontend

# Lint
cd frontend && npm run lint

# Build production
cd frontend && npm run build
cd frontend && npm run preview    # prévisualiser le build

# Démarrage production (le backend sert le frontend buildé)
cd backend && NODE_ENV=production npm start
```

---

*Que vos dés soient favorables ! 🎲*
