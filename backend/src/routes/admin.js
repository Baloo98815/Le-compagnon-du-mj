const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateNpc } = require('../data/npcGenerator');
const logger = require('../utils/logger');

const NPC_AI_ENABLED_KEY = 'npc_ai_enabled';

function getSetting(db, key, fallback) {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(db, key, value) {
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
}

// GET /api/admin/settings
router.get('/settings', asyncHandler((req, res) => {
  const db = getDb();
  const npcAiEnabled = getSetting(db, NPC_AI_ENABLED_KEY, 'false') === 'true';
  res.json({
    success: true,
    data: {
      npc_ai_enabled: npcAiEnabled,
      // La clé elle-même n'est jamais exposée : seulement si elle est configurée côté serveur.
      ai_configured: Boolean(process.env.PERPLEXITY_API_KEY),
    },
  });
}));

// PUT /api/admin/settings
router.put('/settings', asyncHandler((req, res) => {
  const db = getDb();
  if (typeof req.body.npc_ai_enabled === 'boolean') {
    setSetting(db, NPC_AI_ENABLED_KEY, String(req.body.npc_ai_enabled));
    logger.info('Réglage admin modifié', { key: NPC_AI_ENABLED_KEY, value: req.body.npc_ai_enabled });
  }
  const npcAiEnabled = getSetting(db, NPC_AI_ENABLED_KEY, 'false') === 'true';
  res.json({
    success: true,
    data: {
      npc_ai_enabled: npcAiEnabled,
      ai_configured: Boolean(process.env.PERPLEXITY_API_KEY),
    },
  });
}));

// POST /api/admin/npcs/generate
router.post('/npcs/generate', asyncHandler(async (req, res) => {
  const db = getDb();
  const aiEnabled = getSetting(db, NPC_AI_ENABLED_KEY, 'false') === 'true';
  const npc = await generateNpc({ aiEnabled, apiKey: process.env.PERPLEXITY_API_KEY });
  res.json({ success: true, data: npc });
}));

module.exports = router;
