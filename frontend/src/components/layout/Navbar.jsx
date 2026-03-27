import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              to="/dm"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={closeMenu}
              data-testid="nav-dm"
            >
              Écran du MJ
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
