# 🎲 Le Compagnon du MJ

Application web pour les Maîtres du Jeu de **Donjons & Dragons 5.5 (2024)**.

## Fonctionnalités

- 🗺️ **Gestion de campagnes** — créer, organiser, prendre des notes
- 👥 **Personnages joueurs** — fiches de perso complètes avec tokens
- 👹 **Bestiaire** — créer et gérer les ennemis
- 🎭 **Scènes** — lieux, PNJ, ennemis, maps
- ⚔️ **Écran du MJ** — tracker d'initiative, gestion HP/états, hors-combat

## Stack Technique

- **Frontend** : React + Vite + React Router
- **Backend** : Node.js + Express
- **Base de données** : SQLite (module natif Node 22)
- **Logger** : Winston
- **Tests** : Vitest + Testing Library (frontend), Jest + Supertest (backend)

## Installation

### Prérequis
- Node.js 22+
- npm

### Lancer en développement

```bash
# À la racine du projet
npm install

# Backend (terminal 1)
cd backend
npm install
npm run dev

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`
L'API backend tourne sur `http://localhost:3001`

### Configuration

Copier `backend/.env.example` en `backend/.env` et ajuster les variables :

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
# Chemin de la base de données (dossier avec droits d'écriture)
DB_PATH=./data/compagnon_mj.db
```

> **Note** : La base de données SQLite doit être sur un filesystem qui supporte les opérations SQLite (pas FUSE). En production sur un serveur Linux classique, le chemin par défaut `./data/compagnon_mj.db` fonctionne parfaitement.

### Tests

```bash
# Tests backend (Jest + Supertest)
cd backend && npm test

# Tests frontend (Vitest + Testing Library)
cd frontend && npm test

# Tous les tests depuis la racine
npm test
```

### Build production

```bash
cd frontend && npm run build
```

Les fichiers sont générés dans `frontend/dist/`. Le backend sert ces fichiers en production.

## Structure du projet

```
Le-compagnon-du-mj/
├── backend/
│   ├── src/
│   │   ├── db/           # Base de données SQLite
│   │   ├── middleware/   # Logger, gestion d'erreurs
│   │   ├── routes/       # API REST (campaigns, players, enemies, scenes, tracker)
│   │   ├── utils/        # Winston logger
│   │   └── server.js     # Point d'entrée Express
│   └── tests/            # Tests Jest + Supertest
└── frontend/
    ├── src/
    │   ├── api/           # Client Axios
    │   ├── components/    # Composants UI réutilisables
    │   ├── pages/         # Pages de l'application
    │   ├── styles/        # CSS global (thème médiéval)
    │   └── test/          # Tests Vitest + Testing Library
    └── dist/              # Build de production
```

## API REST

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/api/campaigns` | Campagnes |
| GET/PUT/DELETE | `/api/campaigns/:id` | Détail campagne |
| GET/POST | `/api/players` | Joueurs |
| GET/PUT/DELETE | `/api/players/:id` | Fiche joueur |
| GET/POST | `/api/enemies` | Bestiaire |
| GET/PUT/DELETE | `/api/enemies/:id` | Fiche ennemi |
| GET/POST | `/api/scenes` | Scènes |
| GET/PUT/DELETE | `/api/scenes/:id` | Détail scène |
| GET/POST | `/api/tracker/:sceneId` | Tracker d'initiative |

## Logs

Les logs sont écrits dans `backend/logs/` :
- `error.log` — Erreurs uniquement
- `combined.log` — Tous les logs

---

*Que vos dés soient favorables ! 🎲*
