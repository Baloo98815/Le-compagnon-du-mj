// Réinitialise (ou crée) le compte MJ à partir de ADMIN_USERNAME / ADMIN_PASSWORD
// du fichier backend/.env. Utile car seedDefaultUser() ne s'exécute qu'une fois
// (table users vide) : changer ADMIN_PASSWORD ne suffit pas à mettre à jour un
// compte déjà existant.
//
// Usage : depuis backend/ → npm run reset-password
require('dotenv').config();
const { initDatabase, getDb } = require('../src/db/database');
const { hashPassword, verifyPassword } = require('../src/utils/auth');

const username = (process.env.ADMIN_USERNAME || 'mj').trim();
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  console.error('❌ ADMIN_PASSWORD n\'est pas défini dans backend/.env — abandon.');
  process.exit(1);
}

initDatabase();
const db = getDb();
const hash = hashPassword(password);

const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
if (existing) {
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
  console.log(`✔ Mot de passe mis à jour pour « ${username} ».`);
} else {
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`✔ Compte « ${username} » créé.`);
}

const u = db.prepare('SELECT password_hash FROM users WHERE username = ?').get(username);
console.log(`Vérification : ${verifyPassword(password, u.password_hash) ? 'OK ✅' : 'ÉCHEC ❌'}`);
