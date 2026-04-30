const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// GET /api/npcs
router.get('/', asyncHandler((req, res) => {
  const db = getDb();
  const npcs = db.prepare('SELECT * FROM npcs ORDER BY name ASC').all();
  res.json({ success: true, data: npcs });
}));

// GET /api/npcs/:id
router.get('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const npc = db.prepare('SELECT * FROM npcs WHERE id = ?').get(req.params.id);
  if (!npc) return res.status(404).json({ success: false, error: 'PNJ non trouvé' });
  res.json({ success: true, data: npc });
}));

// POST /api/npcs
router.post('/', asyncHandler((req, res) => {
  const {
    name, species, gender, character_traits,
    armor_class, max_hp,
    strength, dexterity, constitution, intelligence, wisdom, charisma,
    speed, notes
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Le nom du PNJ est requis' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO npcs
      (name, species, gender, character_traits, armor_class, max_hp,
       strength, dexterity, constitution, intelligence, wisdom, charisma,
       speed, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name.trim(),
    species || null,
    gender || null,
    character_traits || null,
    armor_class ?? 10,
    max_hp ?? 10,
    strength ?? 10,
    dexterity ?? 10,
    constitution ?? 10,
    intelligence ?? 10,
    wisdom ?? 10,
    charisma ?? 10,
    speed ?? 30,
    notes || null
  );

  const npc = db.prepare('SELECT * FROM npcs WHERE id = ?').get(result.lastInsertRowid);
  logger.info('PNJ créé', { id: npc.id, name: npc.name });
  res.status(201).json({ success: true, data: npc });
}));

// PUT /api/npcs/:id
router.put('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM npcs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'PNJ non trouvé' });

  const allowed = [
    'name', 'species', 'gender', 'character_traits',
    'armor_class', 'max_hp',
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
    'speed', 'notes'
  ];

  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(key === 'name' ? req.body[key].trim() : req.body[key]);
    }
  }

  if (sets.length > 0) {
    db.prepare(`UPDATE npcs SET ${sets.join(', ')} WHERE id = ?`).run(...values, req.params.id);
  }

  const npc = db.prepare('SELECT * FROM npcs WHERE id = ?').get(req.params.id);
  logger.info('PNJ modifié', { id: req.params.id });
  res.json({ success: true, data: npc });
}));

// DELETE /api/npcs/:id
router.delete('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM npcs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'PNJ non trouvé' });

  db.prepare('DELETE FROM npcs WHERE id = ?').run(req.params.id);
  logger.info('PNJ supprimé', { id: req.params.id });
  res.json({ success: true, message: 'PNJ supprimé' });
}));

module.exports = router;
