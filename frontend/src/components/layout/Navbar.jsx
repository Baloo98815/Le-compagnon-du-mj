import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">🎲</span>
          <h1 className="navbar-title">Le Compagnon du MJ</h1>
        </div>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Basculer le menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <NavLink
              to="/campaigns"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-campaigns"
            >
              Campagnes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/players"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-players"
            >
              Joueurs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/enemies"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-enemies"
            >
              Ennemis
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/npcs"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-npcs"
            >
              PNJ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dm"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-dm"
            >
              Écran du MJ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-admin"
            >
              Admin
            </NavLink>
          </li>
          <li className="navbar-account">
            {user && <span className="navbar-user" title="Connecté">{user.username}</span>}
            <button
              className="nav-link nav-logout"
              onClick={() => { closeMenu(); handleLogout(); }}
              data-testid="nav-logout"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
