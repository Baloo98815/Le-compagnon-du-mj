process.env.DB_PATH = '/tmp/test_compagnon_enemies.db';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/server');

const sampleEnemy = {
  name: 'Gobelin à épée',
  type: 'Humanoïde',
  size: 'Petit',
  alignment: 'Neutre mauvais',
  armor_class: 15,
  max_hp: 7,
  challenge_rating: '1/4',
  strength: 8, dexterity: 14, constitution: 10,
  intelligence: 10, wisdom: 8, charisma: 8,
};

beforeEach(() => {
  const { getDb } = require('../src/db/database');
  const db = getDb();
  db.exec('DELETE FROM scene_enemy_instances');
  db.exec('DELETE FROM enemies');
});

afterAll(() => {
  const { getDb } = require('../src/db/database');
  try {
    const db = getDb();
    db.exec('DELETE FROM scene_enemy_instances');
    db.exec('DELETE FROM enemies');
  } catch {}
});

describe('GET /api/enemies', () => {
  test('retourne une liste vide', async () => {
    const res = await request(app).get('/api/enemies');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('POST /api/enemies', () => {
  test('crée un ennemi complet', async () => {
    const res = await request(app).post('/api/enemies').send(sampleEnemy);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Gobelin à épée');
    expect(res.body.data.armor_class).toBe(15);
    expect(res.body.data.challenge_rating).toBe('1/4');
  });

  test('refuse de créer un ennemi sans nom', async () => {
    const res = await request(app).post('/api/enemies').send({ armor_class: 10 });
    expect(res.status).toBe(400);
  });

  test('crée avec des stats par défaut', async () => {
    const res = await request(app).post('/api/enemies').send({ name: 'Zombie' });
    expect(res.status).toBe(201);
    expect(res.body.data.strength).toBe(10);
  });
});

describe('GET /api/enemies/:id', () => {
  test('retourne les détails d\'un ennemi', async () => {
    const created = await request(app).post('/api/enemies').send(sampleEnemy);
    const id = created.body.data.id;
    const res = await request(app).get(`/api/enemies/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Gobelin à épée');
    // Vérifier que les arrays JSON sont parsés
    expect(Array.isArray(res.body.data.actions)).toBe(true);
    expect(Array.isArray(res.body.data.abilities)).toBe(true);
  });

  test('retourne 404 pour un ennemi inexistant', async () => {
    const res = await request(app).get('/api/enemies/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/enemies/:id', () => {
  test('modifie les statistiques d\'un ennemi', async () => {
    const created = await request(app).post('/api/enemies').send(sampleEnemy);
    const id = created.body.data.id;
    const res = await request(app).put(`/api/enemies/${id}`).send({ armor_class: 20, max_hp: 50 });
    expect(res.status).toBe(200);
    expect(res.body.data.armor_class).toBe(20);
    expect(res.body.data.max_hp).toBe(50);
  });
});

describe('DELETE /api/enemies/:id', () => {
  test('supprime un ennemi', async () => {
    const created = await request(app).post('/api/enemies').send({ name: 'Temp' });
    const id = created.body.data.id;
    const res = await request(app).delete(`/api/enemies/${id}`);
    expect(res.status).toBe(200);
    const check = await request(app).get(`/api/enemies/${id}`);
    expect(check.status).toBe(404);
  });
});
