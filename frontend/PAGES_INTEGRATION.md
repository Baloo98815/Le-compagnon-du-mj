# Pages React - Le Compagnon du MJ

## Fichiers créés

Quatre pages React complètes ont été créées dans `/src/pages/` :

### 1. CampaignsPage.jsx (367 lignes)
**Route:** `/campaigns`

**Fonctionnalités:**
- Liste de toutes les campagnes en grille responsive
- Bouton "Créer une campagne" ouvrant une modale
- Chaque campagne affiche: nom, description courte, date de mise à jour
- Actions: "Ouvrir" (navigue vers `/campaigns/{id}`), "Supprimer" (avec confirmation)
- État vide avec message d'encouragement
- Loading state
- Notifications toast (succès/erreur)

**Data-testid:**
- `campaigns-page`
- `create-campaign-btn`
- `campaign-card-{id}`
- `delete-campaign-btn-{id}`

---

### 2. CampaignDetailPage.jsx (726 lignes)
**Route:** `/campaigns/:id`

**Fonctionnalités:**
- En-tête avec nom et description de la campagne
- **Section Notes:** textarea éditable avec auto-sauvegarde on blur
- **Section Joueurs:**
  - Affiche les PJ associés avec token, nom, classe, niveau, CA
  - Bouton "Ajouter" pour associer un joueur existant (dropdown des joueurs disponibles)
  - Bouton "Retirer" pour chaque joueur
- **Section Scènes:**
  - Liste des scènes avec nom, type (combat/roleplay), description courte
  - Bouton "Nouvelle scène" ouvrant une modale
  - Actions: "Ouvrir" (navigue vers `/scenes/{id}`), "Supprimer" (avec confirmation)
- Bouton retour vers `/campaigns`

**Data-testid:**
- `campaign-detail-page`
- `back-btn`
- `edit-notes-textarea`
- `add-player-btn`
- `remove-player-btn-{id}`
- `create-scene-btn`
- `scene-card-{id}`
- `delete-scene-btn-{id}`
- `open-scene-btn`

---

### 3. PlayersPage.jsx (472 lignes)
**Route:** `/players`

**Fonctionnalités:**
- Liste de tous les personnages joueurs en grille responsive
- Bouton "Nouveau personnage" ouvrant une modale
- Chaque personnage affiche: token image, nom, race, classe, niveau, CA, HP
- Actions: "Ouvrir" (navigue vers `/players/{id}`), "Supprimer" (avec confirmation)
- État vide avec message d'encouragement
- Loading state
- Notifications toast (succès/erreur)

**Data-testid:**
- `players-page`
- `create-player-btn`
- `player-card-{id}`
- `delete-player-btn-{id}`

---

### 4. PlayerDetailPage.jsx (755 lignes)
**Route:** `/players/:id`

**Fonctionnalités:**
- **En-tête:** Affiche le nom, token image avec option de changement, race, classe, niveau
- **Caractéristiques:** 6 stats (FOR/DEX/CON/INT/SAG/CHA) éditables avec calcul automatique des modificateurs
- **Jets de sauvegarde:** Cases à cocher pour maîtrise + calcul automatique
- **Compétences:** Affichage de 24 compétences D&D 5e avec modificateurs auto-calculés
- **Combat:**
  - CA, Initiative, Vitesse
  - HP max/actuels
  - Perception/Investigation/Insight passifs
- **Équipement:** Liste éditable (ajouter/supprimer items)
- **Résistances/Immunités:** Champs texte éditables
- **Notes:** Textarea pour notes personnelles
- **Sauvegarde:** Bouton "Sauvegarder" avec feedback visuel

**Data-testid:**
- `player-detail-page`
- `back-btn`
- `save-player-btn`
- `token-upload-input`
- `player-name-input`
- `stat-{strength|dexterity|constitution|intelligence|wisdom|charisma}-input`
- `ac-input`
- `hp-max-input`
- `hp-current-input`

---

## Configuration React Router

Exemple d'intégration dans votre App.jsx ou Routes.jsx :

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import PlayersPage from './pages/PlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Dépendances

Les pages utilisent les éléments suivants :

### Imports React
- `React`, `useState`, `useEffect`
- `useNavigate`, `useParams` (React Router)
- `toast` (react-hot-toast)

### Composants UI
- `Layout` : Wrapper principal avec navbar
- `Button` : Boutons avec variantes (primary, secondary, danger)
- `Modal` : Modale personnalisée
- `Input` : Champs de saisie
- `Card` : Cartes pour afficher le contenu
- `ConfirmDialog` : Dialogue de confirmation
- `TokenAvatar` : Avatar circulaire avec initiales ou image

### API
- `campaignsAPI.getAll()`, `getById()`, `create()`, `update()`, `delete()`, `addPlayer()`, `removePlayer()`
- `playersAPI.getAll()`, `getById()`, `create()`, `update()`, `delete()`, `uploadToken()`
- `scenesAPI.getAll()`, `getById()`, `create()`, `delete()`

### Variables CSS utilisées
- `--color-parchment` : Couleur de fond
- `--color-leather` : Texte principal
- `--color-gold` : Accents/bordures
- `--color-stone` : Texte secondaire
- `--color-blood` : Dangereuses actions/combat
- `--color-gold-light` : Bordures légères

---

## Style CSS

Toutes les pages utilisent **CSS inline** avec des objets `pageStyles` pour chaque fichier. Aucune dépendance à Tailwind ou fichiers CSS externes.

Les styles incluent :
- Grilles responsives avec `grid-template-columns: repeat(auto-fill, minmax(...))`
- Transitions smooth pour les hovers
- Design médiéval/fantastique cohérent
- Support mobile (flex, responsive images)

---

## Gestion des erreurs et notifications

- **Succès:** `toast.success('Message')`
- **Erreur:** `toast.error('Message')`
- **Loading states:** Affichage de "Chargement..." pendant les appels API
- **Empty states:** Messages d'encouragement pour les listes vides
- **Validation:** Vérifications basiques (champs requis) avec messages d'erreur

---

## Résumé des statistiques

- **Ligne de code totales:** 2,320 lignes
- **Nombre de composants:** 4 pages complètes
- **API calls:** ~12 endpoints différents
- **Data-testid:** 30+ identifiants uniques
- **TypeScript:** Aucun (JavaScript pur)
- **Tailwind:** Aucun (CSS inline)

---

## Points clés

✅ Pas de TypeScript
✅ Pas de Tailwind
✅ CSS inline avec variables médiévales
✅ Tous les data-testid présents
✅ Gestion complète des erreurs et loading states
✅ Toast notifications intégrées
✅ Composants UI réutilisables
✅ Design responsif
✅ Intégration API complète
✅ Auto-sauvegarde pour les notes
✅ Calculs automatiques (modificateurs, jets de sauvegarde)
