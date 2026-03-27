const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Config upload images (tokens)
const uploadsDir = path.join(__dirname, '../../uploads/tokens');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `token_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Format image non supporté (jpg, png, gif, webp)'));
  },
});

// GET /api/players - Lister tous les joueurs
router.get('/', asyncHandler((req, res) => {
  const db = getDb();
  const players = db.prepare('SELECT * FROM players ORDER BY name').all();
  res.json({ success: true, data: players });
}));

// GET /api/players/:id - Détail d'un joueur
router.get('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ success: false, error: 'Joueur non trouvé' });

  // Parse JSON fields
  player.skills = JSON.parse(player.skills || '{}');
  player.resistances = JSON.parse(player.resistances || '[]');
  player.immunities = JSON.parse(player.immunities || '[]');
  player.equipment = JSON.parse(player.equipment || '[]');

  // Campagnes associées
  const campaigns = db.prepare(`
    SELECT c.id, c.name FROM campaigns c
    JOIN campaign_players cp ON cp.campaign_id = c.id
    WHERE cp.player_id = ?
  `).all(req.params.id);

  res.json({ success: true, data: { ...player, campaigns } });
}));

// POST /api/players - Créer un joueur
router.post('/', asyncHandler((req, res) => {
  const { name, race, class: playerClass, level, ...stats } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Le nom du joueur est requis' });
  }
  const db = getDb();
  const fields = buildPlayerFields({ name, race, class: playerClass, level, ...stats });
  const stmt = db.prepare(`INSERT INTO players (${fields.columns}) VALUES (${fields.placeholders})`);
  const result = stmt.run(...fields.values);
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Joueur créé', { id: player.id, name: player.name });
  res.status(201).json({ success: true, data: player });
}));

// PUT /api/players/:id - Modifier un joueur
router.put('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Joueur non trouvé' });

  const updates = buildPlayerUpdates(req.body);
  if (updates.sets.length === 0) {
    return res.status(400).json({ success: false, error: 'Aucun champ à mettre à jour' });
  }
  db.prepare(`UPDATE players SET ${updates.sets.join(', ')} WHERE id = ?`).run(...updates.values, req.params.id);
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  logger.info('Joueur modifié', { id: req.params.id });
  res.json({ success: true, data: player });
}));

// DELETE /api/players/:id - Supprimer un joueur
router.delete('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ success: false, error: 'Joueur non trouvé' });

  // Supprimer l'image token si elle existe
  if (player.token_image) {
    const imgPath = path.join(uploadsDir, path.basename(player.token_image));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  logger.info('Joueur supprimé', { id: req.params.id });
  res.json({ success: true, message: 'Joueur supprimé' });
}));

// POST /api/players/:id/token - Upload image token
router.post('/:id/token', upload.single('token'), asyncHandler((req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ success: false, error: 'Joueur non trouvé' });
  if (!req.file) return res.status(400).json({ success: false, error: 'Aucune image fournie' });

  // Supprimer l'ancien token
  if (player.token_image) {
    const oldPath = path.join(uploadsDir, path.basename(player.token_image));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const tokenUrl = `/uploads/tokens/${req.file.filename}`;
  db.prepare('UPDATE players SET token_image = ? WHERE id = ?').run(tokenUrl, req.params.id);
  logger.info('Token joueur mis à jour', { id: req.params.id, file: tokenUrl });
  res.json({ success: true, data: { token_image: tokenUrl } });
}));

// Helpers
function buildPlayerFields(data) {
  const allowed = [
    'name', 'race', 'class', 'level',
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
    'save_strength', 'save_dexterity', 'save_constitution', 'save_intelligence', 'save_wisdom', 'save_charisma',
    'skills', 'resistances', 'immunities', 'equipment',
    'armor_class', 'initiative_bonus', 'max_hp', 'current_hp', 'speed',
    'passive_perception', 'passive_investigation', 'passive_insight',
    'proficiency_bonus', 'notes'
  ];
  const columns = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      columns.push(key);
      const val = (typeof data[key] === 'object') ? JSON.stringify(data[key]) : data[key];
      values.push(val);
    }
  }
  return { columns: columns.join(', '), placeholders: columns.map(() => '?').join(', '), values };
}

function buildPlayerUpdates(data) {
  const allowed = [
    'name', 'race', 'class', 'level',
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
    'save_strength', 'save_dexterity', 'save_constitution', 'save_intelligence', 'save_wisdom', 'save_charisma',
    'skills', 'resistances', 'immunities', 'equipment',
    'armor_class', 'initiative_bonus', 'max_hp', 'current_hp', 'speed',
    'passive_perception', 'passive_investigation', 'passive_insight',
    'proficiency_bonus', 'notes'
  ];
  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`);
      const val = (typeof data[key] === 'object') ? JSON.stringify(data[key]) : data[key];
      values.push(val);
    }
  }
  return { sets, values };
}

module.exports = router;
