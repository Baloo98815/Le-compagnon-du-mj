# 📋 Référence Complète des Data-TestID

Cette page répertorie tous les `data-testid` disponibles pour les tests automatisés.

## CampaignsPage (`/campaigns`)

### Page Container
```
data-testid="campaigns-page"
```

### Boutons
```
data-testid="create-campaign-btn"
```

### Cartes de campagne (dynamiques)
```
data-testid="campaign-card-{id}"
```

### Boutons d'action (dynamiques)
```
data-testid="delete-campaign-btn-{id}"
```

**Exemple complet:**
```javascript
// Page
cy.get('[data-testid="campaigns-page"]').should('exist');

// Créer une campagne
cy.get('[data-testid="create-campaign-btn"]').click();

// Ouvrir une campagne (suppose id = "123")
cy.get('[data-testid="campaign-card-123"]').click();

// Supprimer une campagne
cy.get('[data-testid="delete-campaign-btn-123"]').click();
```

---

## CampaignDetailPage (`/campaigns/:id`)

### Page Container
```
data-testid="campaign-detail-page"
```

### Boutons de navigation
```
data-testid="back-btn"
```

### Textarea des notes
```
data-testid="edit-notes-textarea"
```

### Section Joueurs
```
data-testid="add-player-btn"
data-testid="remove-player-btn-{playerId}"  // Dynamique
```

### Section Scènes
```
data-testid="create-scene-btn"
data-testid="scene-card-{sceneId}"           // Dynamique
data-testid="delete-scene-btn-{sceneId}"     // Dynamique
data-testid="open-scene-btn"
```

**Exemple complet:**
```javascript
// Page
cy.get('[data-testid="campaign-detail-page"]').should('exist');

// Retour
cy.get('[data-testid="back-btn"]').click();

// Éditer notes
cy.get('[data-testid="edit-notes-textarea"]').type('Ma note');

// Ajouter un joueur
cy.get('[data-testid="add-player-btn"]').click();

// Retirer un joueur (suppose playerId = "456")
cy.get('[data-testid="remove-player-btn-456"]').click();

// Créer une scène
cy.get('[data-testid="create-scene-btn"]').click();

// Supprimer une scène (suppose sceneId = "789")
cy.get('[data-testid="delete-scene-btn-789"]').click();
```

---

## PlayersPage (`/players`)

### Page Container
```
data-testid="players-page"
```

### Boutons
```
data-testid="create-player-btn"
```

### Cartes de personnage (dynamiques)
```
data-testid="player-card-{id}"
```

### Boutons d'action (dynamiques)
```
data-testid="delete-player-btn-{id}"
```

**Exemple complet:**
```javascript
// Page
cy.get('[data-testid="players-page"]').should('exist');

// Créer un personnage
cy.get('[data-testid="create-player-btn"]').click();

// Ouvrir un personnage (suppose id = "abc")
cy.get('[data-testid="player-card-abc"]').click();

// Supprimer un personnage
cy.get('[data-testid="delete-player-btn-abc"]').click();
```

---

## PlayerDetailPage (`/players/:id`)

### Page Container
```
data-testid="player-detail-page"
```

### Boutons de navigation et action
```
data-testid="back-btn"
data-testid="save-player-btn"
```

### Upload de token
```
data-testid="token-upload-input"
```

### Champs éditables
```
data-testid="player-name-input"
```

### Caractéristiques (statistiques)
```
data-testid="stat-strength-input"
data-testid="stat-dexterity-input"
data-testid="stat-constitution-input"
data-testid="stat-intelligence-input"
data-testid="stat-wisdom-input"
data-testid="stat-charisma-input"
```

### Section Combat
```
data-testid="ac-input"
data-testid="hp-max-input"
data-testid="hp-current-input"
```

**Exemple complet:**
```javascript
// Page
cy.get('[data-testid="player-detail-page"]').should('exist');

// Retour
cy.get('[data-testid="back-btn"]').click();

// Upload token
cy.get('[data-testid="token-upload-input"]').selectFile('image.png');

// Éditer le nom
cy.get('[data-testid="player-name-input"]').clear().type('Thorgrim');

// Éditer les stats
cy.get('[data-testid="stat-strength-input"]').clear().type('18');
cy.get('[data-testid="stat-dexterity-input"]').clear().type('14');
cy.get('[data-testid="stat-constitution-input"]').clear().type('16');
cy.get('[data-testid="stat-intelligence-input"]').clear().type('12');
cy.get('[data-testid="stat-wisdom-input"]').clear().type('15');
cy.get('[data-testid="stat-charisma-input"]').clear().type('11');

// Éditer le combat
cy.get('[data-testid="ac-input"]').clear().type('15');
cy.get('[data-testid="hp-max-input"]').clear().type('52');
cy.get('[data-testid="hp-current-input"]').clear().type('50');

// Sauvegarder
cy.get('[data-testid="save-player-btn"]').click();
```

---

## Résumé par fichier

### CampaignsPage
- Total: 4 testids (2 statiques, 2 dynamiques)
- Statiques: campaigns-page, create-campaign-btn
- Dynamiques: campaign-card-{id}, delete-campaign-btn-{id}

### CampaignDetailPage
- Total: 8 testids (5 statiques, 3 dynamiques)
- Statiques: campaign-detail-page, back-btn, edit-notes-textarea, add-player-btn, create-scene-btn, open-scene-btn
- Dynamiques: remove-player-btn-{id}, scene-card-{id}, delete-scene-btn-{id}

### PlayersPage
- Total: 4 testids (2 statiques, 2 dynamiques)
- Statiques: players-page, create-player-btn
- Dynamiques: player-card-{id}, delete-player-btn-{id}

### PlayerDetailPage
- Total: 14 testids (tous statiques)
- player-detail-page, back-btn, save-player-btn, token-upload-input
- player-name-input
- stat-strength-input, stat-dexterity-input, stat-constitution-input
- stat-intelligence-input, stat-wisdom-input, stat-charisma-input
- ac-input, hp-max-input, hp-current-input

**Total: 30+ testids**

---

## Patterns pour les testids dynamiques

### Format: `{action}-{type}-{id}`

**Pour les cartes:**
- `campaign-card-{campaignId}`
- `player-card-{playerId}`
- `scene-card-{sceneId}`

**Pour les boutons d'action:**
- `delete-campaign-btn-{campaignId}`
- `delete-player-btn-{playerId}`
- `delete-scene-btn-{sceneId}`
- `remove-player-btn-{playerId}`

---

## Utilisation avec différents outils de test

### Cypress
```javascript
cy.get('[data-testid="campaigns-page"]').should('exist');
cy.get('[data-testid="create-campaign-btn"]').click();
```

### Jest + React Testing Library
```javascript
import { render, screen } from '@testing-library/react';

render(<CampaignsPage />);
expect(screen.getByTestId('campaigns-page')).toBeInTheDocument();
screen.getByTestId('create-campaign-btn').click();
```

### Selenium/WebDriver
```python
from selenium.webdriver.common.by import By

element = driver.find_element(By.CSS_SELECTOR, '[data-testid="campaigns-page"]')
```

### Playwright
```javascript
await page.getByTestId('campaigns-page').isVisible();
await page.getByTestId('create-campaign-btn').click();
```

---

## Conseils pour les tests

1. **Utilisez les testids spécifiques** plutôt que les sélecteurs CSS génériques
2. **Testez les chemins heureux** d'abord (create, read, update, delete)
3. **Testez les cas limites** (listes vides, validation, erreurs)
4. **Attendez les éléments** avant d'interagir avec eux
5. **Vérifiez les notifications toast** après les actions
6. **Testez la navigation** entre les pages

---

## Checklist de couverture de test

Pour une couverture complète:

- [ ] Test de création (modal, validation, sauvegarde)
- [ ] Test de lecture (affichage des données)
- [ ] Test de mise à jour (édition, auto-save)
- [ ] Test de suppression (confirmation, exécution)
- [ ] Test de navigation (liens, retour)
- [ ] Test des états vides
- [ ] Test des loading states
- [ ] Test des erreurs API
- [ ] Test des validations de formulaire
- [ ] Test des permissions (si applicable)

