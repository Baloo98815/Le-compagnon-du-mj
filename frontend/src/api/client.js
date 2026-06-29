import axios from 'axios';

const TOKEN_KEY = 'mj_token';
const USER_KEY = 'mj_user';

// ----- Gestion du jeton (partagée avec le contexte d'auth) -----
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Intercepteur requête : ajoute le jeton Bearer s'il existe
function attachToken(config) {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
// L'instance globale axios sert aux uploads multipart : on y attache aussi le jeton.
axios.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// En cas de 401 (hors page de connexion), on déconnecte et on renvoie au login.
function handleUnauthorized(error) {
  const status = error.response?.status;
  const url = error.config?.url || '';
  if (status === 401 && !url.includes('/auth/login')) {
    tokenStore.clear();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }
}

// Intercepteur réponse : extraire le champ "data" du corps { success, data }
// ou retourner le corps complet si pas de champ "data" (ex: { success, message })
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    return body?.data !== undefined ? body.data : body;
  },
  (error) => {
    handleUnauthorized(error);
    const message = error.response?.data?.error || error.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleUnauthorized(error);
    return Promise.reject(error);
  }
);

export default api;

// ----- AUTHENTIFICATION -----
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

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
    }).then(r => r.data?.data ?? r.data);
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
    }).then(r => r.data?.data ?? r.data);
  },
};

// ----- PNJ (bibliothèque globale) -----
export const npcsAPI = {
  getAll: () => api.get('/npcs'),
  getById: (id) => api.get(`/npcs/${id}`),
  create: (data) => api.post('/npcs', data),
  update: (id, data) => api.put(`/npcs/${id}`, data),
  delete: (id) => api.delete(`/npcs/${id}`),
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
  delete: (sceneId) => api.delete(`/tracker/${sceneId}`),
  addParticipant: (sceneId, data) => api.post(`/tracker/${sceneId}/participants`, data),
  updateHp: (sceneId, participantId, delta) => api.patch(`/tracker/${sceneId}/participants/${participantId}/hp`, { delta }),
  updateConditions: (sceneId, participantId, conditions) => api.patch(`/tracker/${sceneId}/participants/${participantId}/conditions`, { conditions }),
  removeParticipant: (sceneId, participantId) => api.delete(`/tracker/${sceneId}/participants/${participantId}`),
  nextTurn: (sceneId) => api.patch(`/tracker/${sceneId}/turn`),
};
