const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * POST /api/logs
 * Reçoit les erreurs du frontend et les écrit dans Winston
 */
router.post('/', (req, res) => {
  const { level = 'error', message, source, stack, metadata = {} } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Le champ "message" est requis' });
  }

  const logData = {
    source: source || 'frontend',
    userAgent: req.headers['user-agent'],
    ...metadata,
  };

  if (stack) {
    logData.stack = stack;
  }

  const validLevels = ['error', 'warn', 'info', 'debug'];
  const logLevel = validLevels.includes(level) ? level : 'error';

  logger[logLevel](`[FRONTEND] ${message}`, logData);

  return res.json({ success: true });
});

module.exports = router;
