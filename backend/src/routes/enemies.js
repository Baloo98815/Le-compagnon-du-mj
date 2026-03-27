const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Config upload tokens ennemis
const uploadsDir = path.join(__dirname, '../../uploads/enemies');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `enemy_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Format image non supporté'));
  },
});

const JSON_FIELDS = ['abilities', 'actions', 'reactions', 'legendary_actions', 'damage_resistances', 'damage_immunities', 'condition_immunities', 'senses', 'speed'];

function parseEnemy(enemy) {
  if (!enemy) return null;
  const parsed = { ...enemy };
  for (const f of JSON_FIELDS) {
    try { parsed[f] = JSON.parse(parsed[f] || (f === 'senses' || f === 'speed' ? '{}' : '[]')); } catch { }
  }
  return parsed;
}

// GET /api/enemies
router.get('/', asyncHandler((req, res) => {
  const db = getDb();
  const enemies = db.prepare('SELECT * FROM enemies ORDER BY name').all();
  res.json({ success: true, data: enemies.map(parseEnemy) });
}));

// GET /api/enemies/:id
router.get('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(req.params.id);
  if (!enemy) return res.status(404).json({ success: false, error: 'Ennemi non trouvé' });
  res.json({ success: true, data: parseEnemy(enemy) });
}));

// POST /api/enemies
router.post('/', asyncHandler((req, res) => {
  const { name, ...rest } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: "Le nom de l'ennemi est requis" });
  }
  const db = getDb();
  const fields = buildEnemyFields({ name, ...rest });
  const result = db.prepare(`INSERT INTO enemies (${fields.columns}) VALUES (${fields.placeholders})`).run(...fields.values);
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Ennemi créé', { id: enemy.id, name: enemy.name });
  res.status(201).json({ success: true, data: parseEnemy(enemy) });
}));

// PUT /api/enemies/:id
router.put('/:id', asyncHandler((req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM enemies WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ success: false, error: 'Ennemi non trouvé' });
  }
  const updates = buildEnemyUpdates(req.body);
  if (updates.sets.length === 0) return res.status(400).json({ success: false, error: 'Aucun champ à mettre à jour' });
  db.prepare(`UPDATE enemies SET ${updates.sets.join(', ')} WHERE id = ?`).run(...updates.values, req.params.id);
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(req.params.id);
  logger.info('Ennemi modifié', { id: req.params.id });
  res.json({ success: true, data: parseEnemy(enemy) });
}));

// DELETE /api/enemies/:id
router.delete('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(req.params.id);
  if (!enemy) return res.status(404).json({ success: false, error: 'Ennemi non trouvé' });
  if (enemy.token_image) {
    const imgPath = path.join(uploadsDir, path.basename(enemy.token_image));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('DELETE FROM enemies WHERE id = ?').run(req.params.id);
  logger.info('Ennemi supprimé', { id: req.params.id });
  res.json({ success: true, message: 'Ennemi supprimé' });
}));

// POST /api/enemies/:id/token
router.post('/:id/token', upload.single('token'), asyncHandler((req, res) => {
  const db = getDb();
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(req.params.id);
  if (!enemy) return res.status(404).json({ success: false, error: 'Ennemi non trouvé' });
  if (!req.file) return res.status(400).json({ success: false, error: 'Aucune image fournie' });
  if (enemy.token_image) {
    const oldPath = path.join(uploadsDir, path.basename(enemy.token_image));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const tokenUrl = `/uploads/enemies/${req.file.filename}`;
  db.prepare('UPDATE enemies SET token_image = ? WHERE id = ?').run(tokenUrl, req.params.id);
  res.json({ success: true, data: { token_image: tokenUrl } });
}));

// Helpers
const ENEMY_FIELDS = [
  'name', 'type', 'size', 'alignment',
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
  'armor_class', 'max_hp', 'speed', 'challenge_rating',
  'abilities', 'actions', 'reactions', 'legendary_actions',
  'damage_resistances', 'damage_immunities', 'condition_immunities',
  'senses', 'languages', 'notes'
];

function buildEnemyFields(data) {
  const columns = [], values = [];
  for (const key of ENEMY_FIELDS) {
    if (data[key] !== undefined) {
      columns.push(key);
      values.push(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
    }
  }
  return { columns: columns.join(', '), placeholders: columns.map(() => '?').join(', '), values };
}

function buildEnemyUpdates(data) {
  const sets = [], values = [];
  for (const key of ENEMY_FIELDS) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
    }
  }
  return { sets, values };
}

module.exports = router;
