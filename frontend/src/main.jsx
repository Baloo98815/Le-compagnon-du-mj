import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { initClientLogger } from './utils/clientLogger'

// Initialiser la capture d'erreurs frontend dès le démarrage
initClientLogger()

import './styles/index.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import PlayersPage from './pages/PlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import EnemiesPage from './pages/EnemiesPage'
import EnemyDetailPage from './pages/EnemyDetailPage'
import SceneDetailPage from './pages/SceneDetailPage'
import NPCsPage from './pages/NPCsPage'
import DMScreenPage from './pages/DMScreenPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2c2c2c',
              color: '#f4e4c1',
              border: '1px solid #d4a017',
              fontFamily: 'Crimson Text, serif',
            },
          }}
        />
        <Routes>
          {/* Page de connexion (publique) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Écran du MJ (sans navbar) */}
          <Route path="/dm" element={<ProtectedRoute><DMScreenPage /></ProtectedRoute>} />

          {/* Routes protégées — chaque page gère son propre Layout */}
          <Route path="/" element={<Navigate to="/campaigns" replace />} />
          <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
          <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
          <Route path="/players/:id" element={<ProtectedRoute><PlayerDetailPage /></ProtectedRoute>} />
          <Route path="/enemies" element={<ProtectedRoute><EnemiesPage /></ProtectedRoute>} />
          <Route path="/enemies/:id" element={<ProtectedRoute><EnemyDetailPage /></ProtectedRoute>} />
          <Route path="/npcs" element={<ProtectedRoute><NPCsPage /></ProtectedRoute>} />
          <Route path="/scenes/:id" element={<ProtectedRoute><SceneDetailPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
