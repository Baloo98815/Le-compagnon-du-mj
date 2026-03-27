// Utilise le module SQLite natif de Node.js 22 (pas de dépendance native à compiler)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data', 'compagnon_mj.db');

// Créer le dossier data s'il n'existe pas
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    try {
      db = new DatabaseSync(DB_PATH);
      // Activer WAL mode et foreign keys via PRAGMA SQL
      // WAL mode pour les performances (peut être désactivé si le filesystem ne le supporte pas)
      try { db.exec('PRAGMA journal_mode = WAL'); } catch (e) { /* filesystem non compatible WAL */ }
      db.exec('PRAGMA foreign_keys = ON');
      logger.info(`Base de données connectée : ${DB_PATH}`);
    } catch (error) {
      logger.error('Erreur connexion base de données', { error: error.message });
      throw error;
    }
  }
  return db;
}

function initDatabase() {
  const database = getDb();

  database.exec(`
    -- Campagnes
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Personnages joueurs
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      race TEXT,
      class TEXT,
      level INTEGER DEFAULT 1,
      strength INTEGER DEFAULT 10,
      dexterity INTEGER DEFAULT 10,
      constitution INTEGER DEFAULT 10,
      intelligence INTEGER DEFAULT 10,
      wisdom INTEGER DEFAULT 10,
      charisma INTEGER DEFAULT 10,
      save_strength INTEGER DEFAULT 0,
      save_dexterity INTEGER DEFAULT 0,
      save_constitution INTEGER DEFAULT 0,
      save_intelligence INTEGER DEFAULT 0,
      save_wisdom INTEGER DEFAULT 0,
      save_charisma INTEGER DEFAULT 0,
      skills TEXT DEFAULT '{}',
      resistances TEXT DEFAULT '[]',
      immunities TEXT DEFAULT '[]',
      armor_class INTEGER DEFAULT 10,
      initiative_bonus INTEGER DEFAULT 0,
      max_hp INTEGER DEFAULT 10,
      current_hp INTEGER DEFAULT 10,
      speed INTEGER DEFAULT 30,
      passive_perception INTEGER DEFAULT 10,
      passive_investigation INTEGER DEFAULT 10,
      passive_insight INTEGER DEFAULT 10,
      proficiency_bonus INTEGER DEFAULT 2,
      equipment TEXT DEFAULT '[]',
      token_image TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Association joueurs <-> campagnes
    CREATE TABLE IF NOT EXISTS campaign_players (
      campaign_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      PRIMARY KEY (campaign_id, player_id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    -- Ennemis (modèles de base)
    CREATE TABLE IF NOT EXISTS enemies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      size TEXT,
      alignment TEXT,
      strength INTEGER DEFAULT 10,
      dexterity INTEGER DEFAULT 10,
      constitution INTEGER DEFAULT 10,
      intelligence INTEGER DEFAULT 10,
      wisdom INTEGER DEFAULT 10,
      charisma INTEGER DEFAULT 10,
      armor_class INTEGER DEFAULT 10,
      max_hp INTEGER DEFAULT 10,
      speed TEXT DEFAULT '{"marche": 30}',
      challenge_rating TEXT,
      abilities TEXT DEFAULT '[]',
      actions TEXT DEFAULT '[]',
      reactions TEXT DEFAULT '[]',
      legendary_actions TEXT DEFAULT '[]',
      damage_resistances TEXT DEFAULT '[]',
      damage_immunities TEXT DEFAULT '[]',
      condition_immunities TEXT DEFAULT '[]',
      senses TEXT DEFAULT '{}',
      languages TEXT,
      token_image TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Scènes
    CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_combat INTEGER DEFAULT 0,
      description TEXT,
      notes TEXT,
      map_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );

    -- Lieux d'une scène
    CREATE TABLE IF NOT EXISTS scene_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      map_url TEXT,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
    );

    -- PNJ d'une scène
    CREATE TABLE IF NOT EXISTS scene_npcs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      armor_class INTEGER DEFAULT 10,
      max_hp INTEGER DEFAULT 10,
      current_hp INTEGER DEFAULT 10,
      strength INTEGER DEFAULT 10,
      dexterity INTEGER DEFAULT 10,
      constitution INTEGER DEFAULT 10,
      intelligence INTEGER DEFAULT 10,
      wisdom INTEGER DEFAULT 10,
      charisma INTEGER DEFAULT 10,
      speed INTEGER DEFAULT 30,
      token_image TEXT,
      notes TEXT,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
    );

    -- Instances d'ennemis dans une scène (copie indépendante)
    CREATE TABLE IF NOT EXISTS scene_enemy_instances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id INTEGER NOT NULL,
      enemy_id INTEGER NOT NULL,
      instance_name TEXT,
      armor_class INTEGER,
      max_hp INTEGER,
      current_hp INTEGER,
      initiative INTEGER,
      conditions TEXT DEFAULT '[]',
      is_alive INTEGER DEFAULT 1,
      notes TEXT,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
      FOREIGN KEY (enemy_id) REFERENCES enemies(id)
    );

    -- Tracker d'initiative
    CREATE TABLE IF NOT EXISTS initiative_trackers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scene_id INTEGER NOT NULL UNIQUE,
      is_active INTEGER DEFAULT 1,
      current_turn INTEGER DEFAULT 0,
      round INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
    );

    -- Participants du tracker
    CREATE TABLE IF NOT EXISTS tracker_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracker_id INTEGER NOT NULL,
      participant_type TEXT NOT NULL,
      participant_id INTEGER NOT NULL,
      initiative INTEGER NOT NULL,
      current_hp INTEGER,
      conditions TEXT DEFAULT '[]',
      is_alive INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (tracker_id) REFERENCES initiative_trackers(id) ON DELETE CASCADE
    );

    -- Triggers pour updated_at
    CREATE TRIGGER IF NOT EXISTS campaigns_updated_at
      AFTER UPDATE ON campaigns
      BEGIN
        UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS players_updated_at
      AFTER UPDATE ON players
      BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS scenes_updated_at
      AFTER UPDATE ON scenes
      BEGIN
        UPDATE scenes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS enemies_updated_at
      AFTER UPDATE ON enemies
      BEGIN
        UPDATE enemies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
  `);

  logger.info('Base de données initialisée avec succès');
  return database;
}

module.exports = { getDb, initDatabase };
