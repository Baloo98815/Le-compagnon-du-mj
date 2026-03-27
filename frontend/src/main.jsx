import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './styles/index.css'
import Layout from './components/layout/Layout'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import PlayersPage from './pages/PlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import EnemiesPage from './pages/EnemiesPage'
import EnemyDetailPage from './pages/EnemyDetailPage'
import SceneDetailPage from './pages/SceneDetailPage'
import DMScreenPage from './pages/DMScreenPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
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
        {/* Écran du MJ (sans navbar) */}
        <Route path="/dm" element={<DMScreenPage />} />

        {/* Routes avec layout standard */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/campaigns" replace />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/enemies" element={<EnemiesPage />} />
          <Route path="/enemies/:id" element={<EnemyDetailPage />} />
          <Route path="/scenes/:id" element={<SceneDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
