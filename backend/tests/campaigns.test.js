process.env.DB_PATH = '/tmp/test_compagnon_campaigns.db';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/server');

// Nettoyer la DB de test avant chaque test
beforeEach(() => {
  const { getDb } = require('../src/db/database');
  const db = getDb();
  db.exec('DELETE FROM campaign_players');
  db.exec('DELETE FROM scenes');
  db.exec('DELETE FROM campaigns');
});

afterAll(() => {
  const { getDb } = require('../src/db/database');
  try {
    const db = getDb();
    db.exec('DELETE FROM campaign_players');
    db.exec('DELETE FROM scenes');
    db.exec('DELETE FROM campaigns');
  } catch {}
});

describe('GET /api/campaigns', () => {
  test('retourne une liste vide au départ', async () => {
    const res = await request(app).get('/api/campaigns');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('retourne les campagnes créées', async () => {
    await request(app).post('/api/campaigns').send({ name: 'Campagne A' });
    await request(app).post('/api/campaigns').send({ name: 'Campagne B' });
    const res = await request(app).get('/api/campaigns');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('POST /api/campaigns', () => {
  test('crée une campagne avec un nom', async () => {
    const res = await request(app).post('/api/campaigns').send({ name: 'La Descente dans les Abysses' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('La Descente dans les Abysses');
    expect(res.body.data.id).toBeDefined();
  });

  test('refuse de créer une campagne sans nom', async () => {
    const res = await request(app).post('/api/campaigns').send({ description: 'Sans nom' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('refuse de créer une campagne avec un nom vide', async () => {
    const res = await request(app).post('/api/campaigns').send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  test('crée une campagne avec description et notes', async () => {
    const res = await request(app).post('/api/campaigns').send({
      name: 'Mines de Phandelver',
      description: 'La quête commence',
      notes: 'Premier arc narratif'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('La quête commence');
  });
});

describe('GET /api/campaigns/:id', () => {
  test('retourne le détail d\'une campagne', async () => {
    const created = await request(app).post('/api/campaigns').send({ name: 'Test Détail' });
    const id = created.body.data.id;
    const res = await request(app).get(`/api/campaigns/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Détail');
    expect(res.body.data.players).toEqual([]);
    expect(res.body.data.scenes).toEqual([]);
  });

  test('retourne 404 pour une campagne inexistante', async () => {
    const res = await request(app).get('/api/campaigns/99999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/campaigns/:id', () => {
  test('modifie le nom d\'une campagne', async () => {
    const created = await request(app).post('/api/campaigns').send({ name: 'Ancien Nom' });
    const id = created.body.data.id;
    const res = await request(app).put(`/api/campaigns/${id}`).send({ name: 'Nouveau Nom' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Nouveau Nom');
  });

  test('retourne 404 pour une campagne inexistante', async () => {
    const res = await request(app).put('/api/campaigns/99999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  test('modifie les notes', async () => {
    const created = await request(app).post('/api/campaigns').send({ name: 'Notes Test' });
    const id = created.body.data.id;
    const res = await request(app).put(`/api/campaigns/${id}`).send({ notes: 'Nouvelles notes' });
    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe('Nouvelles notes');
  });
});

describe('DELETE /api/campaigns/:id', () => {
  test('supprime une campagne existante', async () => {
    const created = await request(app).post('/api/campaigns').send({ name: 'À Supprimer' });
    const id = created.body.data.id;
    const res = await request(app).delete(`/api/campaigns/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Vérifier qu'elle n'existe plus
    const check = await request(app).get(`/api/campaigns/${id}`);
    expect(check.status).toBe(404);
  });

  test('retourne 404 pour une campagne inexistante', async () => {
    const res = await request(app).delete('/api/campaigns/99999');
    expect(res.status).toBe(404);
  });
});

describe('Health check', () => {
  test('retourne OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
