import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/campaigns';

  // Déjà connecté → on évite d'afficher le formulaire
  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success('Bienvenue, Maître du Jeu !');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card fade-in" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-logo">🎲</span>
          <h1 className="login-title">Le Compagnon du MJ</h1>
          <p className="login-subtitle">Connexion au grimoire</p>
        </div>

        <Input
          id="username"
          label="Identifiant"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <Input
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={!username || !password}
          className="login-submit"
        >
          Se connecter
        </Button>
      </form>
    </div>
  );
}
