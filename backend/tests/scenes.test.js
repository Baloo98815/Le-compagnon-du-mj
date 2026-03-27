process.env.DB_PATH = '/tmp/test_compagnon_scenes.db';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/server');

let campaignId;

beforeAll(async () => {
  const res = await request(app).post('/api/campaigns').send({ name: 'Campagne Test Scènes' });
  campaignId = res.body.data.id;
});

beforeEach(() => {
  const { getDb } = require('../src/db/database');
  const db = getDb();
  db.exec('DELETE FROM tracker_participants');
  db.exec('DELETE FROM initiative_trackers');
  db.exec('DELETE FROM scene_enemy_instances');
  db.exec('DELETE FROM scene_npcs');
  db.exec('DELETE FROM scene_locations');
  db.exec('DELETE FROM scenes');
});

afterAll(() => {
  const { getDb } = require('../src/db/database');
  try {
    const db = getDb();
    db.exec('DELETE FROM tracker_participants');
    db.exec('DELETE FROM initiative_trackers');
    db.exec('DELETE FROM scene_enemy_instances');
    db.exec('DELETE FROM scene_npcs');
    db.exec('DELETE FROM scene_locations');
    db.exec('DELETE FROM scenes');
    db.exec('DELETE FROM campaigns');
  } catch {}
});

describe('POST /api/scenes', () => {
  test('crée une scène de combat', async () => {
    const res = await request(app).post('/api/scenes').send({
      campaign_id: campaignId,
      name: 'Embuscade dans la forêt',
      is_combat: true,
      description: 'Les gobelins attaquent'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Embuscade dans la forêt');
    expect(res.body.data.is_combat).toBe(1);
  });

  test('crée une scène hors-combat', async () => {
    const res = await request(app).post('/api/scenes').send({
      campaign_id: campaignId,
      name: 'La taverne du Dragon Rouge',
      is_combat: false
    });
    expect(res.status).toBe(201);
    expect(res.body.data.is_combat).toBe(0);
  });

  test('refuse sans campaign_id', async () => {
    const res = await request(app).post('/api/scenes').send({ name: 'Scène orpheline' });
    expect(res.status).toBe(400);
  });

  test('refuse sans nom', async () => {
    const res = await request(app).post('/api/scenes').send({ campaign_id: campaignId });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/scenes/:id', () => {
  test('retourne le détail d\'une scène avec ses éléments', async () => {
    const created = await request(app).post('/api/scenes').send({
      campaign_id: campaignId,
      name: 'Donjon',
      is_combat: false
    });
    const id = created.body.data.id;
    const res = await request(app).get(`/api/scenes/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.locations).toEqual([]);
    expect(res.body.data.npcs).toEqual([]);
    expect(res.body.data.enemy_instances).toEqual([]);
  });
});

describe('POST /api/scenes/:id/locations', () => {
  test('ajoute un lieu à une scène', async () => {
    const scene = await request(app).post('/api/scenes').send({ campaign_id: campaignId, name: 'Test Lieux' });
    const sceneId = scene.body.data.id;
    const res = await request(app).post(`/api/scenes/${sceneId}/locations`).send({ name: 'Salle du trône', description: 'Grande salle' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Salle du trône');
  });

  test('refuse un lieu sans nom', async () => {
    const scene = await request(app).post('/api/scenes').send({ campaign_id: campaignId, name: 'Test' });
    const sceneId = scene.body.data.id;
    const res = await request(app).post(`/api/scenes/${sceneId}/locations`).send({ description: 'Sans nom' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/scenes/:id/locations/:locId', () => {
  test('supprime un lieu', async () => {
    const scene = await request(app).post('/api/scenes').send({ campaign_id: campaignId, name: 'Test' });
    const sceneId = scene.body.data.id;
    const loc = await request(app).post(`/api/scenes/${sceneId}/locations`).send({ name: 'Lieu temp' });
    const locId = loc.body.data.id;
    const res = await request(app).delete(`/api/scenes/${sceneId}/locations/${locId}`);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/scenes/:id/npcs', () => {
  test('ajoute un PNJ à une scène', async () => {
    const scene = await request(app).post('/api/scenes').send({ campaign_id: campaignId, name: 'Test PNJ' });
    const sceneId = scene.body.data.id;
    const res = await request(app).post(`/api/scenes/${sceneId}/npcs`).send({
      name: 'Le Tavernier',
      role: 'Allié',
      armor_class: 10,
      max_hp: 20
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Le Tavernier');
  });
});

describe('DELETE /api/scenes/:id', () => {
  test('supprime une scène', async () => {
    const created = await request(app).post('/api/scenes').send({ campaign_id: campaignId, name: 'À Supprimer' });
    const id = created.body.data.id;
    const res = await request(app).delete(`/api/scenes/${id}`);
    expect(res.status).toBe(200);
  });
});
