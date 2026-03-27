import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Intercepteur requête : log en dev
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Intercepteur réponse : extraire data ou lever l'erreur
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ----- CAMPAGNES -----
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  addPlayer: (campaignId, playerId) => api.post(`/campaigns/${campaignId}/players/${playerId}`),
  removePlayer: (campaignId, playerId) => api.delete(`/campaigns/${campaignId}/players/${playerId}`),
};

// ----- JOUEURS -----
export const playersAPI = {
  getAll: () => api.get('/players'),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
  uploadToken: (id, file) => {
    const form = new FormData();
    form.append('token', file);
    return axios.post(`/api/players/${id}/token`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

// ----- ENNEMIS -----
export const enemiesAPI = {
  getAll: () => api.get('/enemies'),
  getById: (id) => api.get(`/enemies/${id}`),
  create: (data) => api.post('/enemies', data),
  update: (id, data) => api.put(`/enemies/${id}`, data),
  delete: (id) => api.delete(`/enemies/${id}`),
  uploadToken: (id, file) => {
    const form = new FormData();
    form.append('token', file);
    return axios.post(`/api/enemies/${id}/token`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

// ----- SCÈNES -----
export const scenesAPI = {
  getAll: (campaignId) => api.get('/scenes', { params: { campaign_id: campaignId } }),
  getById: (id) => api.get(`/scenes/${id}`),
  create: (data) => api.post('/scenes', data),
  update: (id, data) => api.put(`/scenes/${id}`, data),
  delete: (id) => api.delete(`/scenes/${id}`),
  // Lieux
  addLocation: (sceneId, data) => api.post(`/scenes/${sceneId}/locations`, data),
  updateLocation: (sceneId, locId, data) => api.put(`/scenes/${sceneId}/locations/${locId}`, data),
  deleteLocation: (sceneId, locId) => api.delete(`/scenes/${sceneId}/locations/${locId}`),
  // PNJ
  addNpc: (sceneId, data) => api.post(`/scenes/${sceneId}/npcs`, data),
  updateNpc: (sceneId, npcId, data) => api.put(`/scenes/${sceneId}/npcs/${npcId}`, data),
  deleteNpc: (sceneId, npcId) => api.delete(`/scenes/${sceneId}/npcs/${npcId}`),
  // Ennemis
  addEnemy: (sceneId, data) => api.post(`/scenes/${sceneId}/enemies`, data),
  removeEnemy: (sceneId, instanceId) => api.delete(`/scenes/${sceneId}/enemies/${instanceId}`),
};

// ----- TRACKER -----
export const trackerAPI = {
  get: (sceneId) => api.get(`/tracker/${sceneId}`),
  create: (sceneId) => api.post(`/tracker/${sceneId}`),
  addParticipant: (sceneId, data) => api.post(`/tracker/${sceneId}/participants`, data),
  updateHp: (sceneId, participantId, delta) => api.patch(`/tracker/${sceneId}/participants/${participantId}/hp`, { delta }),
  updateConditions: (sceneId, participantId, conditions) => api.patch(`/tracker/${sceneId}/participants/${participantId}/conditions`, { conditions }),
  removeParticipant: (sceneId, participantId) => api.delete(`/tracker/${sceneId}/participants/${participantId}`),
  nextTurn: (sceneId) => api.patch(`/tracker/${sceneId}/turn`),
};
