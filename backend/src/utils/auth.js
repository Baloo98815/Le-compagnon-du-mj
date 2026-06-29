// Authentification sans dépendance externe : on s'appuie uniquement sur le
// module `crypto` natif de Node (cohérent avec le choix de node:sqlite côté DB).
// - Mots de passe : hachés avec scrypt + sel aléatoire.
// - Jetons : format JWT-like (HS256) signé en HMAC-SHA256.
const crypto = require('crypto');
const logger = require('./logger');

// ─── Mots de passe ──────────────────────────────────────────────────────────

const SCRYPT_KEYLEN = 64;

/** Hache un mot de passe en clair → "sel:hash" (hex). */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${derived}`;
}

/** Vérifie un mot de passe en clair contre un hash stocké ("sel:hash"). */
function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  const hashBuf = Buffer.from(hash, 'hex');
  if (hashBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(hashBuf, derived);
}

// ─── Jetons (JWT-like, HS256) ─────────────────────────────────────────────────

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Secret de repli pour le développement uniquement. En production, les
    // jetons seraient invalidés à chaque redémarrage : définir JWT_SECRET.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET doit être défini en production');
    }
    return 'dev-secret-non-securise-changez-moi';
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

/** Génère un jeton signé pour un utilisateur. */
function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS }));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

/** Vérifie un jeton et renvoie son payload, ou lève une erreur. */
function verifyToken(token) {
  if (typeof token !== 'string') throw new Error('Jeton manquant');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Jeton invalide');
  const [header, body, signature] = parts;

  const expected = sign(`${header}.${body}`);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Signature invalide');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Jeton expiré');
  }
  return payload;
}

// ─── Seed du compte MJ ────────────────────────────────────────────────────────

/**
 * Crée le compte MJ au démarrage s'il n'existe aucun utilisateur.
 * Identifiants lus depuis ADMIN_USERNAME / ADMIN_PASSWORD (valeurs de repli
 * pour le développement, avec avertissement).
 */
function seedDefaultUser(db) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || 'mj';
  const password = process.env.ADMIN_PASSWORD || 'changeme';

  if (!process.env.ADMIN_PASSWORD) {
    logger.warn(
      `Aucun ADMIN_PASSWORD défini : compte "${username}" créé avec le mot de passe par défaut "changeme". ` +
      'Définissez ADMIN_USERNAME / ADMIN_PASSWORD dans .env puis supprimez ce compte.'
    );
  }

  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, hashPassword(password));
  logger.info(`Compte MJ initial créé : ${username}`);
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, seedDefaultUser };
