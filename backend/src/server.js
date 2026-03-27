require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialiser la base de données
initDatabase();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Servir les uploads (images tokens)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/players', require('./routes/players'));
app.use('/api/enemies', require('./routes/enemies'));
app.use('/api/scenes', require('./routes/scenes'));
app.use('/api/tracker', require('./routes/tracker'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// Servir le frontend en production
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

// Gestion des erreurs (doit être en dernier)
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🎲 Compagnon du MJ - Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
