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

initDatabase();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/players', require('./routes/players'));
app.use('/api/enemies', require('./routes/enemies'));
app.use('/api/scenes', require('./routes/scenes'));
app.use('/api/npcs', require('./routes/npcs'));
app.use('/api/tracker', require('./routes/tracker'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Le Compagnon du MJ - API', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info('Compagnon du MJ - Serveur demarre sur http://localhost:' + PORT);
  });
}

module.exports = app;
