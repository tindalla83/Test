'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const config = require('./config');

fs.mkdirSync(config.dataDir, { recursive: true });

const db = new Database(path.join(config.dataDir, 'app.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  plan                  TEXT NOT NULL DEFAULT 'trial',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  subscription_status   TEXT,
  current_period_end    INTEGER,
  created_at            INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  company_id        TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  name              TEXT,
  role              TEXT NOT NULL DEFAULT 'member',      -- owner | admin | member
  is_platform_admin INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

CREATE TABLE IF NOT EXISTS invites (
  id          TEXT PRIMARY KEY,
  company_id  TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',
  token       TEXT NOT NULL UNIQUE,
  invited_by  TEXT,
  accepted_at INTEGER,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invites_company ON invites(company_id);

CREATE TABLE IF NOT EXISTS projects (
  id               TEXT PRIMARY KEY,
  company_id       TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  location         TEXT NOT NULL,
  house_types_json TEXT NOT NULL DEFAULT '[]',
  created_by       TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);

CREATE TABLE IF NOT EXISTS valuations (
  id               TEXT PRIMARY KEY,
  project_id       TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id       TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by       TEXT,
  created_at       INTEGER NOT NULL,
  model            TEXT,
  location         TEXT,
  input_json       TEXT NOT NULL,
  market_overview  TEXT,
  results_json     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_valuations_project ON valuations(project_id);
CREATE INDEX IF NOT EXISTS idx_valuations_company ON valuations(company_id);

CREATE TABLE IF NOT EXISTS usage_events (
  id          TEXT PRIMARY KEY,
  company_id  TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     TEXT,
  kind        TEXT NOT NULL DEFAULT 'valuation',
  units       INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_company_time ON usage_events(company_id, created_at);
`);

const now = () => Date.now();
const uuid = () => crypto.randomUUID();

module.exports = { db, now, uuid };
