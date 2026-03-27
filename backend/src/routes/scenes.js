const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// GET /api/scenes?campaign_id=X
router.get('/', asyncHandler((req, res) => {
  const db = getDb();
  const { campaign_id } = req.query;
  let scenes;
  if (campaign_id) {
    scenes = db.prepare('SELECT * FROM scenes WHERE campaign_id = ? ORDER BY created_at ASC').all(campaign_id);
  } else {
    scenes = db.prepare('SELECT * FROM scenes ORDER BY created_at DESC').all();
  }
  res.json({ success: true, data: scenes });
}));

// GET /api/scenes/:id - Détail complet d'une scène
router.get('/:id', asyncHandler((req, res) => {
  const db = getDb();
  const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.id);
  if (!scene) return res.status(404).json({ success: false, error: 'Scène non trouvée' });

  const locations = db.prepare('SELECT * FROM scene_locations WHERE scene_id = ?').all(req.params.id);
  const npcs = db.prepare('SELECT * FROM scene_npcs WHERE scene_id = ?').all(req.params.id);
  const enemyInstances = db.prepare(`
    SELECT sei.*, e.name as enemy_name, e.token_image as enemy_token, e.armor_class as enemy_ac,
           e.max_hp as enemy_max_hp
    FROM scene_enemy_instances sei
    JOIN enemies e ON e.id = sei.enemy_id
    WHERE sei.scene_id = ?
  `).all(req.params.id).map(inst => ({
    ...inst,
    conditions: JSON.parse(inst.conditions || '[]')
  }));

  res.json({
    success: true,
    data: { ...scene, locations, npcs, enemy_instances: enemyInstances }
  });
}));

// POST /api/scenes - Créer une scène
router.post('/', asyncHandler((req, res) => {
  const { campaign_id, name, is_combat, description, notes, map_url } = req.body;
  if (!campaign_id) return res.status(400).json({ success: false, error: 'campaign_id est requis' });
  if (!name || name.trim() === '') return res.status(400).json({ success: false, error: 'Le nom de la scène est requis' });

  const db = getDb();
  const campaign = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(campaign_id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campagne non trouvée' });

  const result = db.prepare(`
    INSERT INTO scenes (campaign_id, name, is_combat, description, notes, map_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(campaign_id, name.trim(), is_combat ? 1 : 0, description || null, notes || null, map_url || null);

  const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Scène créée', { id: scene.id, name: scene.name, campaign_id });
  res.status(201).json({ success: true, data: scene });
}));

// PUT /api/scenes/:id
router.put('/:id', asyncHandler((req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM scenes WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ success: false, error: 'Scène non trouvée' });
  }
  const { name, is_combat, description, notes, map_url } = req.body;
  db.prepare(`
    UPDATE scenes SET
      name = COALESCE(?, name),
      is_combat = COALESCE(?, is_combat),
      description = ?,
      notes = ?,
      map_url = ?
    WHERE id = ?
  `).run(name?.trim() || null, is_combat !== undefined ? (is_combat ? 1 : 0) : null, description ?? null, notes ?? null, map_url ?? null, req.params.id);
  const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.id);
  logger.info('Scène modifiée', { id: req.params.id });
  res.json({ success: true, data: scene });
}));

// DELETE /api/scenes/:id
router.delete('/:id', asyncHandler((req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM scenes WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ success: false, error: 'Scène non trouvée' });
  }
  db.prepare('DELETE FROM scenes WHERE id = ?').run(req.params.id);
  logger.info('Scène supprimée', { id: req.params.id });
  res.json({ success: true, message: 'Scène supprimée' });
}));

// ---- LIEUX ----
router.get('/:id/locations', asyncHandler((req, res) => {
  const db = getDb();
  const locations = db.prepare('SELECT * FROM scene_locations WHERE scene_id = ?').all(req.params.id);
  res.json({ success: true, data: locations });
}));

router.post('/:id/locations', asyncHandler((req, res) => {
  const { name, description, map_url } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Le nom du lieu est requis' });
  const db = getDb();
  const result = db.prepare('INSERT INTO scene_locations (scene_id, name, description, map_url) VALUES (?, ?, ?, ?)').run(req.params.id, name, description || null, map_url || null);
  const loc = db.prepare('SELECT * FROM scene_locations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: loc });
}));

router.put('/:id/locations/:locId', asyncHandler((req, res) => {
  const { name, description, map_url } = req.body;
  const db = getDb();
  db.prepare('UPDATE scene_locations SET name = COALESCE(?, name), description = ?, map_url = ? WHERE id = ? AND scene_id = ?')
    .run(name || null, description ?? null, map_url ?? null, req.params.locId, req.params.id);
  const loc = db.prepare('SELECT * FROM scene_locations WHERE id = ?').get(req.params.locId);
  res.json({ success: true, data: loc });
}));

router.delete('/:id/locations/:locId', asyncHandler((req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM scene_locations WHERE id = ? AND scene_id = ?').run(req.params.locId, req.params.id);
  res.json({ success: true, message: 'Lieu supprimé' });
}));

// ---- PNJ ----
router.get('/:id/npcs', asyncHandler((req, res) => {
  const db = getDb();
  const npcs = db.prepare('SELECT * FROM scene_npcs WHERE scene_id = ?').all(req.params.id);
  res.json({ success: true, data: npcs });
}));

router.post('/:id/npcs', asyncHandler((req, res) => {
  const { name, role, armor_class, max_hp, strength, dexterity, constitution, intelligence, wisdom, charisma, speed, notes } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Le nom du PNJ est requis' });
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO scene_npcs (scene_id, name, role, armor_class, max_hp, current_hp, strength, dexterity, constitution, intelligence, wisdom, charisma, speed, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, name, role || null, armor_class || 10, max_hp || 10, max_hp || 10, strength || 10, dexterity || 10, constitution || 10, intelligence || 10, wisdom || 10, charisma || 10, speed || 30, notes || null);
  const npc = db.prepare('SELECT * FROM scene_npcs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: npc });
}));

router.put('/:id/npcs/:npcId', asyncHandler((req, res) => {
  const db = getDb();
  const allowed = ['name', 'role', 'armor_class', 'max_hp', 'current_hp', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'speed', 'notes'];
  const sets = [], values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) { sets.push(`${key} = ?`); values.push(req.body[key]); }
  }
  if (sets.length > 0) {
    db.prepare(`UPDATE scene_npcs SET ${sets.join(', ')} WHERE id = ? AND scene_id = ?`).run(...values, req.params.npcId, req.params.id);
  }
  const npc = db.prepare('SELECT * FROM scene_npcs WHERE id = ?').get(req.params.npcId);
  res.json({ success: true, data: npc });
}));

router.delete('/:id/npcs/:npcId', asyncHandler((req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM scene_npcs WHERE id = ? AND scene_id = ?').run(req.params.npcId, req.params.id);
  res.json({ success: true, message: 'PNJ supprimé' });
}));

// ---- INSTANCES D'ENNEMIS ----
router.post('/:id/enemies', asyncHandler((req, res) => {
  const { enemy_id, count = 1 } = req.body;
  if (!enemy_id) return res.status(400).json({ success: false, error: 'enemy_id est requis' });
  const db = getDb();
  const enemy = db.prepare('SELECT * FROM enemies WHERE id = ?').get(enemy_id);
  if (!enemy) return res.status(404).json({ success: false, error: 'Ennemi non trouvé' });

  const instances = [];
  const insertStmt = db.prepare(`
    INSERT INTO scene_enemy_instances (scene_id, enemy_id, instance_name, armor_class, max_hp, current_hp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(count, 20); i++) {
    const name = count > 1 ? `${enemy.name} ${i + 1}` : enemy.name;
    const result = insertStmt.run(req.params.id, enemy_id, name, enemy.armor_class, enemy.max_hp, enemy.max_hp);
    instances.push(db.prepare('SELECT * FROM scene_enemy_instances WHERE id = ?').get(result.lastInsertRowid));
  }
  logger.info('Instances ennemies ajoutées', { sceneId: req.params.id, enemyId: enemy_id, count });
  res.status(201).json({ success: true, data: instances });
}));

router.delete('/:id/enemies/:instanceId', asyncHandler((req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM scene_enemy_instances WHERE id = ? AND scene_id = ?').run(req.params.instanceId, req.params.id);
  logger.info('Instance ennemie supprimée', { instanceId: req.params.instanceId });
  res.json({ success: true, message: 'Ennemi retiré de la scène' });
}));

module.exports = router;
