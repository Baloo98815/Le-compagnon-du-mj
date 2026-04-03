const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// GET /api/tracker/:sceneId - Récupérer le tracker d'une scène
router.get('/:sceneId', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT * FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.json({ success: true, data: null }); // Pas encore de tracker pour cette scène

  const participants = db.prepare(`
    SELECT tp.*,
      CASE
        WHEN tp.participant_type = 'player' THEN p.name
        WHEN tp.participant_type = 'enemy_instance' THEN COALESCE(sei.instance_name, e.name)
        WHEN tp.participant_type = 'npc' THEN n.name
      END as display_name,
      CASE
        WHEN tp.participant_type = 'player' THEN p.token_image
        WHEN tp.participant_type = 'enemy_instance' THEN e.token_image
        WHEN tp.participant_type = 'npc' THEN n.token_image
      END as token_image,
      CASE
        WHEN tp.participant_type = 'player' THEN p.armor_class
        WHEN tp.participant_type = 'enemy_instance' THEN sei.armor_class
        WHEN tp.participant_type = 'npc' THEN n.armor_class
      END as armor_class,
      CASE
        WHEN tp.participant_type = 'player' THEN p.max_hp
        WHEN tp.participant_type = 'enemy_instance' THEN sei.max_hp
        WHEN tp.participant_type = 'npc' THEN n.max_hp
      END as max_hp
    FROM tracker_participants tp
    LEFT JOIN players p ON tp.participant_type = 'player' AND tp.participant_id = p.id
    LEFT JOIN scene_enemy_instances sei ON tp.participant_type = 'enemy_instance' AND tp.participant_id = sei.id
    LEFT JOIN enemies e ON sei.enemy_id = e.id
    LEFT JOIN scene_npcs n ON tp.participant_type = 'npc' AND tp.participant_id = n.id
    WHERE tp.tracker_id = ?
    ORDER BY tp.sort_order ASC, tp.initiative DESC
  `).all(tracker.id).map(p => ({
    ...p,
    conditions: JSON.parse(p.conditions || '[]')
  }));

  res.json({ success: true, data: { ...tracker, participants } });
}));

// POST /api/tracker/:sceneId - Créer/initialiser le tracker
router.post('/:sceneId', asyncHandler((req, res) => {
  const db = getDb();
  const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.sceneId);
  if (!scene) return res.status(404).json({ success: false, error: 'Scène non trouvée' });

  // Supprimer l'ancien tracker si existant
  const existing = db.prepare('SELECT id FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (existing) {
    db.prepare('DELETE FROM tracker_participants WHERE tracker_id = ?').run(existing.id);
    db.prepare('DELETE FROM initiative_trackers WHERE id = ?').run(existing.id);
  }

  const result = db.prepare('INSERT INTO initiative_trackers (scene_id) VALUES (?)').run(req.params.sceneId);
  const tracker = db.prepare('SELECT * FROM initiative_trackers WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Tracker créé', { sceneId: req.params.sceneId, trackerId: tracker.id });
  res.status(201).json({ success: true, data: tracker });
}));

// POST /api/tracker/:sceneId/participants - Ajouter un participant
router.post('/:sceneId/participants', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT * FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.status(404).json({ success: false, error: 'Tracker non trouvé' });

  const { participant_type, participant_id, initiative } = req.body;
  if (!participant_type || !participant_id || initiative === undefined) {
    return res.status(400).json({ success: false, error: 'participant_type, participant_id et initiative sont requis' });
  }

  // Récupérer les HP actuels selon le type
  let current_hp;
  if (participant_type === 'player') {
    const p = db.prepare('SELECT current_hp FROM players WHERE id = ?').get(participant_id);
    current_hp = p?.current_hp;
  } else if (participant_type === 'enemy_instance') {
    const e = db.prepare('SELECT current_hp FROM scene_enemy_instances WHERE id = ?').get(participant_id);
    current_hp = e?.current_hp;
  } else if (participant_type === 'npc') {
    const n = db.prepare('SELECT current_hp FROM scene_npcs WHERE id = ?').get(participant_id);
    current_hp = n?.current_hp;
  }

  // Calculer le sort_order (tri par initiative desc)
  const maxOrder = db.prepare('SELECT MAX(sort_order) as mo FROM tracker_participants WHERE tracker_id = ?').get(tracker.id);
  const sort_order = (maxOrder?.mo ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO tracker_participants (tracker_id, participant_type, participant_id, initiative, current_hp, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(tracker.id, participant_type, participant_id, initiative, current_hp, sort_order);

  // Re-trier par initiative
  const participants = db.prepare('SELECT * FROM tracker_participants WHERE tracker_id = ? ORDER BY initiative DESC').all(tracker.id);
  const reorder = db.prepare('UPDATE tracker_participants SET sort_order = ? WHERE id = ?');
  participants.forEach((p, idx) => reorder.run(idx, p.id));

  const participant = db.prepare('SELECT * FROM tracker_participants WHERE id = ?').get(result.lastInsertRowid);
  logger.info('Participant ajouté au tracker', { trackerId: tracker.id, type: participant_type });
  res.status(201).json({ success: true, data: { ...participant, conditions: JSON.parse(participant.conditions || '[]') } });
}));

// PATCH /api/tracker/:sceneId/participants/:participantId/hp - Modifier les HP
router.patch('/:sceneId/participants/:participantId/hp', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT id FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.status(404).json({ success: false, error: 'Tracker non trouvé' });

  const { delta } = req.body; // delta positif = soin, négatif = dégâts
  if (delta === undefined) return res.status(400).json({ success: false, error: 'delta est requis' });

  const participant = db.prepare('SELECT * FROM tracker_participants WHERE id = ? AND tracker_id = ?').get(req.params.participantId, tracker.id);
  if (!participant) return res.status(404).json({ success: false, error: 'Participant non trouvé' });

  const newHp = Math.max(0, (participant.current_hp || 0) + Number(delta));
  const isAlive = participant.participant_type === 'player' ? 1 : (newHp > 0 ? 1 : 0);

  db.prepare('UPDATE tracker_participants SET current_hp = ?, is_alive = ? WHERE id = ?').run(newHp, isAlive, participant.id);

  // Sync HP vers la table source
  if (participant.participant_type === 'player') {
    db.prepare('UPDATE players SET current_hp = ? WHERE id = ?').run(newHp, participant.participant_id);
  } else if (participant.participant_type === 'enemy_instance') {
    db.prepare('UPDATE scene_enemy_instances SET current_hp = ?, is_alive = ? WHERE id = ?').run(newHp, isAlive, participant.participant_id);
  } else if (participant.participant_type === 'npc') {
    db.prepare('UPDATE scene_npcs SET current_hp = ? WHERE id = ?').run(newHp, participant.participant_id);
  }

  const updated = db.prepare('SELECT * FROM tracker_participants WHERE id = ?').get(participant.id);
  res.json({ success: true, data: { ...updated, conditions: JSON.parse(updated.conditions || '[]') } });
}));

// PATCH /api/tracker/:sceneId/participants/:participantId/conditions - Gérer les états
router.patch('/:sceneId/participants/:participantId/conditions', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT id FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.status(404).json({ success: false, error: 'Tracker non trouvé' });

  const { conditions } = req.body; // tableau des états actifs
  if (!Array.isArray(conditions)) return res.status(400).json({ success: false, error: 'conditions doit être un tableau' });

  db.prepare('UPDATE tracker_participants SET conditions = ? WHERE id = ? AND tracker_id = ?')
    .run(JSON.stringify(conditions), req.params.participantId, tracker.id);

  const updated = db.prepare('SELECT * FROM tracker_participants WHERE id = ?').get(req.params.participantId);
  res.json({ success: true, data: { ...updated, conditions: JSON.parse(updated.conditions || '[]') } });
}));

// DELETE /api/tracker/:sceneId/participants/:participantId
router.delete('/:sceneId/participants/:participantId', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT id FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.status(404).json({ success: false, error: 'Tracker non trouvé' });
  db.prepare('DELETE FROM tracker_participants WHERE id = ? AND tracker_id = ?').run(req.params.participantId, tracker.id);
  res.json({ success: true, message: 'Participant retiré du tracker' });
}));

// PATCH /api/tracker/:sceneId/turn - Passer au tour suivant
router.patch('/:sceneId/turn', asyncHandler((req, res) => {
  const db = getDb();
  const tracker = db.prepare('SELECT * FROM initiative_trackers WHERE scene_id = ?').get(req.params.sceneId);
  if (!tracker) return res.status(404).json({ success: false, error: 'Tracker non trouvé' });

  const aliveCount = db.prepare('SELECT COUNT(*) as c FROM tracker_participants WHERE tracker_id = ? AND is_alive = 1').get(tracker.id).c;
  if (aliveCount === 0) return res.json({ success: true, data: tracker });

  let nextTurn = (tracker.current_turn + 1) % aliveCount;
  let newRound = tracker.round;
  if (nextTurn === 0) newRound = tracker.round + 1;

  db.prepare('UPDATE initiative_trackers SET current_turn = ?, round = ? WHERE id = ?').run(nextTurn, newRound, tracker.id);
  const updated = db.prepare('SELECT * FROM initiative_trackers WHERE id = ?').get(tracker.id);
  res.json({ success: true, data: updated });
}));

module.exports = router;
