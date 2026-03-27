process.env.DB_PATH = '/tmp/test_compagnon_players.db';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/server');

const samplePlayer = {
  name: 'Aragorn',
  race: 'Humain',
  class: 'Rôdeur',
  level: 10,
  strength: 16, dexterity: 14, constitution: 15,
  intelligence: 12, wisdom: 14, charisma: 15,
  armor_class: 16, max_hp: 80, current_hp: 80,
  passive_perception: 14, passive_investigation: 11, passive_insight: 12,
};

beforeEach(() => {
  const { getDb } = require('../src/db/database');
  const db = getDb();
  db.exec('DELETE FROM campaign_players');
  db.exec('DELETE FROM players');
});

afterAll(() => {
  const { getDb } = require('../src/db/database');
  try {
    const db = getDb();
    db.exec('DELETE FROM campaign_players');
    db.exec('DELETE FROM players');
  } catch {}
});

describe('GET /api/players', () => {
  test('retourne une liste vide au départ', async () => {
    const res = await request(app).get('/api/players');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('POST /api/players', () => {
  test('crée un joueur avec les informations de base', async () => {
    const res = await request(app).post('/api/players').send(samplePlayer);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Aragorn');
    expect(res.body.data.armor_class).toBe(16);
    expect(res.body.data.max_hp).toBe(80);
  });

  test('refuse de créer un joueur sans nom', async () => {
    const res = await request(app).post('/api/players').send({ race: 'Elfe' });
    expect(res.status).toBe(400);
  });

  test('crée un joueur avec des stats par défaut', async () => {
    const res = await request(app).post('/api/players').send({ name: 'Gandalf' });
    expect(res.status).toBe(201);
    expect(res.body.data.strength).toBe(10);
    expect(res.body.data.armor_class).toBe(10);
  });
});

describe('GET /api/players/:id', () => {
  test('retourne les détails d\'un joueur', async () => {
    const created = await request(app).post('/api/players').send(samplePlayer);
    const id = created.body.data.id;
    const res = await request(app).get(`/api/players/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Aragorn');
    expect(res.body.data.campaigns).toEqual([]);
  });

  test('retourne 404 pour un joueur inexistant', async () => {
    const res = await request(app).get('/api/players/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/players/:id', () => {
  test('modifie les statistiques d\'un joueur', async () => {
    const created = await request(app).post('/api/players').send(samplePlayer);
    const id = created.body.data.id;
    const res = await request(app).put(`/api/players/${id}`).send({ current_hp: 45, armor_class: 18 });
    expect(res.status).toBe(200);
    expect(res.body.data.current_hp).toBe(45);
    expect(res.body.data.armor_class).toBe(18);
  });

  test('retourne 404 pour un joueur inexistant', async () => {
    const res = await request(app).put('/api/players/99999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/players/:id', () => {
  test('supprime un joueur existant', async () => {
    const created = await request(app).post('/api/players').send({ name: 'Temporaire' });
    const id = created.body.data.id;
    const res = await request(app).delete(`/api/players/${id}`);
    expect(res.status).toBe(200);
    const check = await request(app).get(`/api/players/${id}`);
    expect(check.status).toBe(404);
  });

  test('retourne 404 pour un joueur inexistant', async () => {
    const res = await request(app).delete('/api/players/99999');
    expect(res.status).toBe(404);
  });
});
