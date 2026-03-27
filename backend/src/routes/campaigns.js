const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// GET /api/campaigns - Lister toutes les campagnes
router.get('/', asyncHandler((req, res) => {
  const db = getDb();
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY updated_at DESC').all();
  logger.info('Campagnes récupérées', { count: campaigns.length });
  res.json({ success: true, data: campaigns });
}));

// GET /api/campaigns/:id - Détail d'une campagne
router.get('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campagne non trouvée' });
  }

  // Joueurs de la campagne
  const players = db.prepare(`
    SELECT p.* FROM players p
    JOIN campaign_players cp ON cp.player_id = p.id
    WHERE cp.campaign_id = ?
    ORDER BY p.name
  `).all(req.params.id);

  // Scènes de la campagne
  const scenes = db.prepare(`
    SELECT * FROM scenes WHERE campaign_id = ? ORDER BY created_at ASC
  `).all(req.params.id);

  res.json({ success: true, data: { ...campaign, players, scenes } });
}));

// POST /api/campaigns - Créer une campagne
router.post('/', asyncHandler((req, res) => {
  const { name, description, notes } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Le nom de la campagne est requis' });
  }
  const db = getDb();
  const stmt = db.prepare('INSERT INTO campaigns (name, description, notes) VALUES (?, ?, ?)');
  const result = stmt.run(name.trim(), description || null, notes || null);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Campagne créée', { id: campaign.id, name: campaign.name });
  res.status(201).json({ success: true, data: campaign });
}));

// PUT /api/campaigns/:id - Modifier une campagne
router.put('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Campagne non trouvée' });
  }
  const { name, description, notes } = req.body;
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Le nom ne peut pas être vide' });
  }
  db.prepare(`
    UPDATE campaigns SET
      name = COALESCE(?, name),
      description = ?,
      notes = ?
    WHERE id = ?
  `).run(name?.trim() || null, description ?? null, notes ?? null, req.params.id);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  logger.info('Campagne modifiée', { id: campaign.id });
  res.json({ success: true, data: campaign });
}));

// DELETE /api/campaigns/:id - Supprimer une campagne
router.delete('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Campagne non trouvée' });
  }
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  logger.info('Campagne supprimée', { id: req.params.id });
  res.json({ success: true, message: 'Campagne supprimée' });
}));

// POST /api/campaigns/:id/players/:playerId - Associer un joueur
router.post('/:id/players/:playerId', asyncHandler((req, res) => {
  const db = getDb();
  const campaign = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campagne non trouvée' });
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ success: false, error: 'Joueur non trouvé' });

  const existing = db.prepare('SELECT * FROM campaign_players WHERE campaign_id = ? AND player_id = ?')
    .get(req.params.id, req.params.playerId);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Joueur déjà associé à cette campagne' });
  }
  db.prepare('INSERT INTO campaign_players (campaign_id, player_id) VALUES (?, ?)').run(req.params.id, req.params.playerId);
  logger.info('Joueur associé à la campagne', { campaignId: req.params.id, playerId: req.params.playerId });
  res.status(201).json({ success: true, message: 'Joueur associé à la campagne' });
}));

// DELETE /api/campaigns/:id/players/:playerId - Retirer un joueur
router.delete('/:id/players/:playerId', asyncHandler((req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM campaign_players WHERE campaign_id = ? AND player_id = ?')
    .run(req.params.id, req.params.playerId);
  logger.info('Joueur retiré de la campagne', { campaignId: req.params.id, playerId: req.params.playerId });
  res.json({ success: true, message: 'Joueur retiré de la campagne' });
}));

module.exports = router;
