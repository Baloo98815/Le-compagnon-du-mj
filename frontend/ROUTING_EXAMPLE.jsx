/**
 * EXEMPLE DE CONFIGURATION REACT ROUTER
 *
 * Ce fichier montre comment configurer les routes pour les 4 pages créées
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages créées
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import PlayersPage from './pages/PlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';

// Autres pages (exemples)
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Configuration des routes de l'application
 *
 * Routes disponibles:
 * - / : Page d'accueil
 * - /campaigns : Liste des campagnes
 * - /campaigns/:id : Détail d'une campagne
 * - /players : Liste des personnages
 * - /players/:id : Détail d'un personnage
 * - /scenes/:id : Détail d'une scène (à implémenter)
 * - * : Page 404
 */

function App() {
  return (
    <Router>
      <Routes>
        {/* Route d'accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Routes Campagnes */}
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />

        {/* Routes Personnages */}
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />

        {/* Route 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;


/**
 * ALTERNATIVE: Configuration avec plusieurs routes groupées
 * (Plus facile à maintenir pour un grand projet)
 */

export function AppWithGrouping() {
  return (
    <Router>
      <Routes>
        {/* Accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Routes Campagnes groupées */}
        <Route path="/campaigns">
          <Route index element={<CampaignsPage />} />
          <Route path=":id" element={<CampaignDetailPage />} />
        </Route>

        {/* Routes Personnages groupées */}
        <Route path="/players">
          <Route index element={<PlayersPage />} />
          <Route path=":id" element={<PlayerDetailPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}


/**
 * ALTERNATIVE: Avec Loader (React Router v6.4+)
 * Pour pré-charger les données
 */

// Dans un fichier routeLoaders.js:
export const campaignLoader = async ({ params }) => {
  const { campaignsAPI } = await import('./api/client');
  return campaignsAPI.getById(params.id);
};

export const playerLoader = async ({ params }) => {
  const { playersAPI } = await import('./api/client');
  return playersAPI.getById(params.id);
};

// Dans App.jsx:
export function AppWithLoaders() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/campaigns">
          <Route index element={<CampaignsPage />} />
          <Route
            path=":id"
            element={<CampaignDetailPage />}
            // loader={campaignLoader} // Décommentez si vous utilisez un loader
          />
        </Route>

        <Route path="/players">
          <Route index element={<PlayersPage />} />
          <Route
            path=":id"
            element={<PlayerDetailPage />}
            // loader={playerLoader} // Décommentez si vous utilisez un loader
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}


/**
 * NAVIGATION AVEC useNavigate
 *
 * Les pages utilisent déjà useNavigate pour naviguer.
 * Exemples d'utilisation:
 */

export function NavigationExamples() {
  return (
    <>
      {/* Dans CampaignsPage */}
      {/* navigate(`/campaigns/${campaign.id}`) - Ouvre une campagne */}
      {/* navigate('/campaigns') - Retour à la liste */}

      {/* Dans CampaignDetailPage */}
      {/* navigate(`/players/${player.id}`) - Ouvre un personnage */}
      {/* navigate(`/scenes/${scene.id}`) - Ouvre une scène */}
      {/* navigate('/campaigns') - Retour à la liste des campagnes */}

      {/* Dans PlayersPage */}
      {/* navigate(`/players/${player.id}`) - Ouvre un personnage */}

      {/* Dans PlayerDetailPage */}
      {/* navigate('/players') - Retour à la liste des personnages */}
    </>
  );
}


/**
 * LIENS DE NAVIGATION
 *
 * Si vous voulez utiliser des <Link> au lieu de navigate:
 */

import { Link } from 'react-router-dom';

export function LinkExamples() {
  return (
    <>
      {/* Lien vers la page des campagnes */}
      <Link to="/campaigns">Aller aux campagnes</Link>

      {/* Lien vers une campagne spécifique */}
      <Link to={`/campaigns/${campaignId}`}>Ouvrir campagne</Link>

      {/* Lien vers la page des personnages */}
      <Link to="/players">Aller aux personnages</Link>

      {/* Lien vers un personnage spécifique */}
      <Link to={`/players/${playerId}`}>Ouvrir personnage</Link>
    </>
  );
}


/**
 * PARAMÈTRES DE ROUTE
 *
 * Les pages utilisent useParams pour récupérer les IDs:
 *
 * CampaignDetailPage: const { id } = useParams();
 * PlayerDetailPage: const { id } = useParams();
 */

export function ParamsExamples() {
  return (
    <>
      {/* /campaigns/123 → id = "123" */}
      {/* /players/456 → id = "456" */}
    </>
  );
}


/**
 * GESTION DU STATE LORS DE LA NAVIGATION
 *
 * Si vous voulez passer du state lors de la navigation:
 */

import { useLocation } from 'react-router-dom';

export function StateNavigationExample() {
  const location = useLocation();

  // Pour naviguer avec state:
  // navigate(`/campaigns/${id}`, { state: { from: 'campaigns-list' } });

  // Pour récupérer le state:
  // const state = location.state;

  return null;
}


/**
 * REDIRECTION
 *
 * Exemple de redirection automatique:
 */

export function RedirectExample() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/players" element={<PlayersPage />} />

      {/* Redirection automatique */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/gestion" element={<Navigate to="/campaigns" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


/**
 * NOTES IMPORTANTES
 *
 * 1. Assurez-vous que react-router-dom est installé
 *    npm install react-router-dom
 *
 * 2. Les pages gèrent le loading et les erreurs automatiquement
 *    Pas besoin de composant ErrorBoundary pour ces pages
 *
 * 3. Les paramètres de route utilisant useParams doivent correspondre
 *    aux paramètres définis dans la route (ex: :id)
 *
 * 4. Les pages utilisent navigate pour les actions dynamiques
 *    et Link pour les liens statiques
 *
 * 5. Tous les appels API utilisent les méthodes de client.js
 *    Les erreurs sont capturées et affichées via toast
 *
 * 6. Les pages gèrent leur propre état (useState) pour les modales,
 *    formulaires, etc.
 */
