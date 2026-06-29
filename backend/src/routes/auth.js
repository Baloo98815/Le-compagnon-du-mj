const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const { verifyPassword, signToken } = require('../utils/auth');
const logger = require('../utils/logger');

// POST /api/auth/login - Connexion d'un MJ
router.post('/login', asyncHandler((req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Identifiant et mot de passe requis' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username).trim());

  // Message volontairement générique pour ne pas révéler l'existence du compte.
  if (!user || !verifyPassword(password, user.password_hash)) {
    logger.warn('Échec de connexion', { username });
    return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
  }

  const token = signToken({ sub: user.id, username: user.username });
  logger.info('Connexion réussie', { id: user.id, username: user.username });
  res.json({ success: true, data: { token, user: { id: user.id, username: user.username } } });
}));

// GET /api/auth/me - Utilisateur courant (vérifie le jeton)
router.get('/me', requireAuth, asyncHandler((req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Compte introuvable' });
  }
  res.json({ success: true, data: user });
}));

module.exports = router;
