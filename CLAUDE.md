# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Le Compagnon du MJ** — a local web app for Dungeons & Dragons 5.5 (2024) Game Masters: campaigns, player character sheets, a bestiary, scenes (locations/NPCs/enemy instances), and a GM screen with an initiative tracker. Everything runs locally; nothing is sent to the internet. All UI text, code comments, and commit messages are in French — keep new content consistent with that.

## Commands

```bash
# Install (run once, and again after a git pull that touches package.json)
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..

# Dev — runs backend (:3001) and frontend (:5173) together via concurrently
npm run dev

# Dev — run one side only
cd backend && npm run dev     # nodemon, restarts on src/**/*.js changes
cd frontend && npm run dev    # Vite, HMR

# Tests
npm test                          # backend then frontend
cd backend && npm test            # Jest + Supertest
cd backend && npm run test:watch
cd frontend && npm test           # vitest run
cd frontend && npm run test:watch
cd frontend && npm run test:coverage

# Run a single backend test file
cd backend && node --no-warnings=ExperimentalWarning ./node_modules/jest/bin/jest.js tests/campaigns.test.js

# Run a single frontend test file
cd frontend && npx vitest run src/test/Button.test.jsx

# Lint (frontend only)
cd frontend && npm run lint

# Build / production
cd frontend && npm run build            # outputs frontend/dist
cd backend && NODE_ENV=production npm start   # backend serves frontend/dist too

# Admin/auth utility
cd backend && npm run reset-password    # scripts/reset-password.js
```

Backend config lives in `backend/.env` (copy from `.env.example`): `PORT`, `NODE_ENV`, `LOG_LEVEL`, `CORS_ORIGIN`, `DB_PATH`, `JWT_SECRET`, `ADMIN_USERNAME`/`ADMIN_PASSWORD` (seed account created on first boot if the `users` table is empty).

## Architecture

### Monorepo layout
Root `package.json` only orchestrates `backend/` and `frontend/` via `concurrently`/`cd` — there is no shared code or workspace tooling between them.

### Backend (`backend/src`) — Node 22 + Express
- **Database**: `db/database.js` uses Node's *native* `node:sqlite` module (`DatabaseSync`) — no `better-sqlite3`, no native build step. Schema (users, campaigns, players, campaign_players, enemies, scenes, scene_locations, npcs, scene_npcs, scene_enemy_instances, initiative_trackers, tracker_participants, app_settings) is created with `CREATE TABLE IF NOT EXISTS` plus `updated_at` triggers, all executed at startup in `initDatabase()`. `app_settings` is a plain key/value table (no trigger) used for admin-configurable runtime preferences — see the Admin section below. Schema changes for existing installs are handled with ad-hoc `ALTER TABLE` calls wrapped in try/catch (see the `damage_vulnerabilities` / `npc_id` migrations at the bottom of that file) — follow this pattern rather than adding a migration framework.
- **Auth**: hand-rolled, no external JWT/bcrypt library (`utils/auth.js`), to stay consistent with the "native modules only" philosophy. Passwords: scrypt + random salt (`sel:hash` hex string). Tokens: a JWT-like HS256 token signed with HMAC over `JWT_SECRET` (falls back to an insecure dev default outside production; throws if unset in production). `seedDefaultUser()` creates a single GM account on first boot from `ADMIN_USERNAME`/`ADMIN_PASSWORD`. `middleware/auth.js`'s `requireAuth` reads the `Authorization: Bearer` header — **except when `NODE_ENV === 'test'`, where it's bypassed entirely** (`req.user = { id: 0, username: 'test' }`) so the existing route test suites don't need to log in.
- **Routing** (`server.js`): `/api/auth` is public; `/api/campaigns`, `/players`, `/enemies`, `/scenes`, `/npcs`, `/tracker`, `/api/admin` are all mounted behind `requireAuth`; `/api/logs` (frontend error ingestion) is public. In production (`NODE_ENV=production`), Express also serves `frontend/dist` and falls back to `index.html` for any unmatched route (SPA). There is no separate admin role — this is a single-GM app, so any authenticated user can reach `/api/admin`.
- **Admin / AI-assisted NPC generation**: `routes/admin.js` exposes `GET/PUT /api/admin/settings` (toggle `npc_ai_enabled`, persisted in the key/value `app_settings` table — for user-facing preferences that shouldn't require an `.env` edit + restart) and `POST /api/admin/npcs/generate`. Generation logic lives in `data/npcGenerator.js`: a local, dependency-free random draw (species/name/traits) is always available; if `npc_ai_enabled` is on **and** `PERPLEXITY_API_KEY` is set in `.env`, it instead calls the Perplexity chat-completions API via Node's native `fetch` (no new HTTP client dependency) and parses a constrained JSON response. Any AI failure (missing key, non-2xx, malformed JSON) is caught and logged, and the function **silently falls back** to the local random draw — the endpoint never errors due to the AI path. The API key itself is never read from or exposed to the client, matching the `JWT_SECRET`/`ADMIN_PASSWORD` secret-handling pattern.
- **Route module conventions** (see `routes/enemies.js`, `players.js`): each resource module defines a `*_FIELDS` constant listing the DB columns it accepts, used to build both insert and update statements (dedupe `buildXFields`/`buildXUpdates` off the same array — see the players/enemies refactor in `HISTORIQUE.md`). Structured data (abilities, actions, resistances, immunities, equipment, skills, etc.) is stored as JSON text columns and parsed/serialized at the route boundary via a `JSON_FIELDS` list + a `parseX()` helper — free-text fields like `senses`/`speed` have one-off migration handling from an older JSON-object format to plain text.
- **Error handling**: every async route handler is wrapped in `asyncHandler` (`middleware/errorHandler.js`) instead of manual try/catch; errors flow to the global `errorHandler`, which logs via Winston and returns `{ success: false, error }` (plus `stack` when `NODE_ENV=development`). Unmatched routes hit `notFound` first.
- **Responses**: all API responses use the shape `{ success: boolean, data?, error? }`.
- **Uploads**: `multer` disk storage per resource (`uploads/tokens/`, `uploads/enemies/`), served statically at `/uploads/...`, 2MB limit, image extensions only.
- **Logging**: Winston, files under `backend/logs/` (`combined.log`, `error.log`, `exceptions.log`, `rejections.log`); level from `LOG_LEVEL`.

### Frontend (`frontend/src`) — React 19 + Vite + react-router-dom v7
- **Routing/auth gate**: all routes are declared in `main.jsx`. Every route except `/login` is wrapped in `<ProtectedRoute>`, which reads auth state from `AuthContext`. `/dm` (GM screen) intentionally renders without the shared `Layout`/navbar for full-screen use during a session; other pages compose `Layout` themselves.
- **Auth state**: `context/AuthContext.jsx` holds the current user and validates any token found in storage against `GET /api/auth/me` on mount. `api/client.js`'s `tokenStore` wraps `localStorage` (`mj_token`, `mj_user`) and is the single source of truth for the token — both the Axios instance and the AuthContext read/write through it, not `localStorage` directly.
- **API client**: single Axios instance (`baseURL: /api`) in `api/client.js`. A request interceptor attaches `Authorization: Bearer` from `tokenStore` (also patched onto the *global* axios instance, since multipart uploads bypass the local instance). A response interceptor unwraps `{ success, data }` down to just `data`, and on a 401 (outside `/auth/login`) clears the token and redirects to `/login`. Resource-specific helpers (`campaignsAPI`, `playersAPI`, etc.) are built on top of this instance — extend those rather than calling axios directly from pages.
- **Dev proxy**: `vite.config.js` proxies `/api` and `/uploads` to `http://localhost:3001` — pages call relative paths, never the absolute backend URL.
- **Styling**: one global stylesheet (`styles/index.css`) implementing a medieval theme (Crimson Text font, dark/parchment palette); components pair a `.jsx` with a co-located `.css` file rather than CSS-in-JS or a utility framework.
- **Client-side error logging**: `utils/clientLogger.js` is initialized first thing in `main.jsx` and forwards uncaught frontend errors to `POST /api/logs`.
- **Admin screen** (`pages/AdminPage.jsx`, route `/admin`): app-level configuration (currently just the AI-generation toggle) plus a PNJ generator UI that calls `adminAPI.generateNpc()` and then reuses the existing `npcsAPI.create()` to save the result — it does not duplicate NPC-creation logic. `NPCsPage.jsx`'s own local "Générer aléatoirement" button is unrelated and purely client-side (no backend call); both draw on the same hardcoded `SPECIES_LIST`/name-syllable approach, duplicated in `frontend/src/pages/NPCsPage.jsx` and `backend/src/data/npcGenerator.js` and kept in sync manually per the no-shared-code convention (see Monorepo layout above).

### Testing conventions
- Backend tests (`backend/tests/*.test.js`) set `process.env.DB_PATH` to a `/tmp/...` file and `process.env.NODE_ENV = 'test'` **before** requiring `../src/server`, so each suite gets an isolated SQLite file and bypasses auth. They clean their own tables in `beforeEach`/`afterAll`. Jest runs with `--forceExit --detectOpenHandles` because open SQLite connections otherwise hang the process.
- Frontend tests (`frontend/src/test/*.test.jsx`) use Vitest + Testing Library + jsdom, currently covering the shared UI components (`Button`, `Card`, `Modal`, `ConfirmDialog`, `StatBlock`, `TokenAvatar`).

## Documentation in this repo
- `README.md` — short project overview.
- `MODE_EMPLOI.md` — full French user/setup guide (install, run, REST API table, troubleshooting cheat sheet). Check it for anything install/ops-related before re-deriving it.
- `HISTORIQUE.md` — changelog of notable changes, including refactors worth knowing about (e.g. the `*_FIELDS` dedup pattern). Update it when making a change worth recording, following its existing "Ajouté/Modifié/Corrigé/Supprimé" structure.
