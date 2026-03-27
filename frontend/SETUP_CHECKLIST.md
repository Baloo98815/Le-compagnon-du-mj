# ✅ Checklist de Configuration - Pages React

Utilisez cette checklist pour vous assurer que tous les éléments nécessaires sont en place.

## 📦 Prérequis (Dépendances)

- [ ] `react` - Framework React
- [ ] `react-dom` - DOM React
- [ ] `react-router-dom` - Routage
- [ ] `react-hot-toast` - Notifications toast
- [ ] `axios` - Requêtes HTTP (pour le client API)

**Installation:**
```bash
npm install react react-dom react-router-dom react-hot-toast axios
```

## 📁 Structure des Fichiers

Vérifiez que les fichiers suivants existent:

### Pages créées:
- [ ] `/src/pages/CampaignsPage.jsx` (367 lignes, 11 KB)
- [ ] `/src/pages/CampaignDetailPage.jsx` (726 lignes, 21 KB)
- [ ] `/src/pages/PlayersPage.jsx` (472 lignes, 14 KB)
- [ ] `/src/pages/PlayerDetailPage.jsx` (755 lignes, 22 KB)

### Composants UI (doivent déjà exister):
- [ ] `/src/components/ui/Button.jsx`
- [ ] `/src/components/ui/Modal.jsx`
- [ ] `/src/components/ui/Input.jsx`
- [ ] `/src/components/ui/Card.jsx`
- [ ] `/src/components/ui/ConfirmDialog.jsx`
- [ ] `/src/components/ui/TokenAvatar.jsx`
- [ ] `/src/components/ui/StatBlock.jsx`

### Layout (doit déjà exister):
- [ ] `/src/components/layout/Layout.jsx`
- [ ] `/src/components/layout/Navbar.jsx`

### API (doit déjà exister):
- [ ] `/src/api/client.js` avec exports:
  - [ ] `campaignsAPI.getAll()`
  - [ ] `campaignsAPI.getById()`
  - [ ] `campaignsAPI.create()`
  - [ ] `campaignsAPI.update()`
  - [ ] `campaignsAPI.delete()`
  - [ ] `campaignsAPI.addPlayer()`
  - [ ] `campaignsAPI.removePlayer()`
  - [ ] `playersAPI.getAll()`
  - [ ] `playersAPI.getById()`
  - [ ] `playersAPI.create()`
  - [ ] `playersAPI.update()`
  - [ ] `playersAPI.delete()`
  - [ ] `playersAPI.uploadToken()`
  - [ ] `scenesAPI.getAll()`
  - [ ] `scenesAPI.create()`
  - [ ] `scenesAPI.delete()`

## 🔧 Configuration App.jsx

- [ ] Importer `BrowserRouter` de `react-router-dom`
- [ ] Importer les 4 pages créées
- [ ] Configurer les routes:
  ```jsx
  <BrowserRouter>
    <Routes>
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/:id" element={<PlayerDetailPage />} />
    </Routes>
  </BrowserRouter>
  ```

## 🎨 Variables CSS

Vérifier que les variables CSS suivantes existent dans votre fichier CSS global:

- [ ] `--color-parchment` - Couleur de fond (ex: `#f4e9d8`)
- [ ] `--color-leather` - Texte principal (ex: `#3d2817`)
- [ ] `--color-gold` - Accents (ex: `#d4af37`)
- [ ] `--color-gold-light` - Accents légers (ex: `#e8c547`)
- [ ] `--color-stone` - Texte secondaire (ex: `#6c757d`)
- [ ] `--color-blood` - Danger/Combat (ex: `#8b0000`)
- [ ] `--color-forest` - Couleur alternative (ex: `#2d5016`)

**Exemple de déclaration:**
```css
:root {
  --color-parchment: #f4e9d8;
  --color-leather: #3d2817;
  --color-gold: #d4af37;
  --color-gold-light: #e8c547;
  --color-stone: #6c757d;
  --color-blood: #8b0000;
  --color-forest: #2d5016;
}
```

## 🔌 API Backend

- [ ] Backend API disponible sur `/api`
- [ ] Endpoints CRUD pour campagnes
- [ ] Endpoints CRUD pour personnages
- [ ] Endpoints CRUD pour scènes
- [ ] Endpoint pour upload de token (multipart/form-data)
- [ ] CORS correctement configuré
- [ ] Gestion des erreurs retournant `{ error: "message" }`

## 🧩 Composants UI

Vérifier que les composants fonctionnent comme suit:

### Button
- [ ] Accepte prop `variant` (primary, secondary, danger)
- [ ] Accepte prop `size` (sm, md, lg)
- [ ] Accepte prop `loading`
- [ ] Accepte prop `onClick`
- [ ] Accepte prop `data-testid`

### Modal
- [ ] Accepte prop `isOpen`
- [ ] Accepte prop `onClose`
- [ ] Accepte prop `title`
- [ ] Accepte prop `size` (sm, md, lg)
- [ ] Accepte prop `children`

### Input
- [ ] Accepte prop `label`
- [ ] Accepte prop `error`
- [ ] Accepte prop `id`
- [ ] Accepte tous les props HTML standard
- [ ] Accepte prop `data-testid`

### Card
- [ ] Accepte prop `title`
- [ ] Accepte prop `actions`
- [ ] Accepte prop `children`
- [ ] Accepte prop `onClick`

### ConfirmDialog
- [ ] Accepte prop `isOpen`
- [ ] Accepte prop `onClose`
- [ ] Accepte prop `onConfirm`
- [ ] Accepte prop `title`
- [ ] Accepte prop `message`
- [ ] Accepte prop `danger` pour styling

### TokenAvatar
- [ ] Accepte prop `image` (URL ou undefined)
- [ ] Accepte prop `name` (pour initiales)
- [ ] Accepte prop `size` (sm, md, lg)
- [ ] Affiche initiales si pas d'image

### Layout
- [ ] Enveloppe la Navbar
- [ ] Affiche les enfants dans une section main

## 📱 Test des Pages

### CampaignsPage
- [ ] Affiche la liste des campagnes
- [ ] Permet de créer une campagne
- [ ] Peut supprimer une campagne
- [ ] Navigation vers détail fonctionne
- [ ] État vide s'affiche si aucune campagne

### CampaignDetailPage
- [ ] Affiche les détails de la campagne
- [ ] Peut éditer les notes (auto-save)
- [ ] Affiche la liste des joueurs
- [ ] Peut ajouter/retirer des joueurs
- [ ] Affiche la liste des scènes
- [ ] Peut créer une scène
- [ ] Peut supprimer une scène
- [ ] Bouton retour fonctionne

### PlayersPage
- [ ] Affiche la liste des personnages
- [ ] Permet de créer un personnage
- [ ] Peut supprimer un personnage
- [ ] Navigation vers détail fonctionne
- [ ] État vide s'affiche si aucun personnage

### PlayerDetailPage
- [ ] Affiche tous les champs du personnage
- [ ] Peut éditer les stats
- [ ] Peut uploader une photo token
- [ ] Peut sauvegarder les modifications
- [ ] Calcule correctement les modificateurs
- [ ] Affiche les compétences avec modificateurs
- [ ] Bouton retour fonctionne

## 🧪 Tests E2E (optionnel)

Si vous avez des tests:

- [ ] Tous les data-testid sont présents
- [ ] Les tests peuvent trouver et cliquer sur les boutons
- [ ] Les tests peuvent remplir les formulaires
- [ ] Les tests peuvent vérifier les notifications
- [ ] Les tests peuvent naviguer entre les pages

**Data-testid disponibles:**
- CampaignsPage: 4 testids
- CampaignDetailPage: 8 testids
- PlayersPage: 4 testids
- PlayerDetailPage: 8 testids

## 🔍 Vérifications de Code

- [ ] Aucun `console.log()` laissé en production
- [ ] Gestion des erreurs correcte (try/catch)
- [ ] Pas de références à `localStorage` sans sécurité
- [ ] Pas de données sensibles en URL
- [ ] Tous les appels API utilisent le client centralisé

## 📊 Performance

- [ ] Images/tokens chargent rapidement
- [ ] Les listes ne causent pas de lag même avec beaucoup de données
- [ ] Les modales ouvrent/ferment en <300ms
- [ ] Les transitions sont fluides (60fps)

## 🚀 Déploiement

- [ ] Variables d'environnement configurées (baseURL API, etc.)
- [ ] Build fonctionne sans erreur: `npm run build`
- [ ] Pas de warnings lors du build
- [ ] Sourcemaps générées (pour debug en prod)
- [ ] Assets optimisés

## ✨ Finition

- [ ] L'interface ressemble à du Medieval/Fantasy
- [ ] Couleurs cohérentes avec le thème
- [ ] Typography lisible et hiérarchisée
- [ ] Spacing cohérent
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Notifications toast visibles et claires
- [ ] Loading states visibles
- [ ] États vides sont encourageants

## 📋 Documentation

- [ ] Fichier `PAGES_INTEGRATION.md` lu
- [ ] Fichier `PAGES_SUMMARY.txt` consulté
- [ ] Fichier `ROUTING_EXAMPLE.jsx` utilisé comme référence

---

## ✅ Checklist Finale

Si tout est coché, vos pages React sont prêtes à l'emploi!

**Avant de déployer:**
- [ ] Tester chaque page manuellement
- [ ] Vérifier les notifications toast
- [ ] Tester la création/édition/suppression
- [ ] Vérifier les validations de formulaires
- [ ] Tester la navigation entre pages
- [ ] Vérifier les états vides

**Problèmes courants:**

Si les pages ne se chargent pas:
- [ ] Vérifier que React Router est configuré
- [ ] Vérifier que le chemin de l'API est correct
- [ ] Vérifier que les composants UI existent
- [ ] Vérifier la console pour les erreurs

Si les styles ne s'appliquent pas:
- [ ] Vérifier que les variables CSS sont définies
- [ ] Vérifier que le Layout est utilisé
- [ ] Vérifier que les fichiers CSS des composants sont importés

Si l'API ne répond pas:
- [ ] Vérifier que le backend fonctionne
- [ ] Vérifier le CORS
- [ ] Vérifier les en-têtes Content-Type
- [ ] Vérifier le format des réponses API

---

**Besoin d'aide?** Consultez les fichiers fournis:
- `PAGES_INTEGRATION.md` - Configuration détaillée
- `PAGES_SUMMARY.txt` - Résumé des fonctionnalités
- `ROUTING_EXAMPLE.jsx` - Exemples de routing
