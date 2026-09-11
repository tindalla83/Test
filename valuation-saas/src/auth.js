'use strict';

const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const config = require('./config');
const { db } = require('./db');

function hashPassword(pw) {
  return bcrypt.hashSync(pw, 12);
}
function verifyPassword(pw, hash) {
  try {
    return bcrypt.compareSync(pw, hash);
  } catch (e) {
    return false;
  }
}

const sessionMiddleware = session({
  store: new SQLiteStore({ dir: config.dataDir, db: 'sessions.sqlite' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd, // requires HTTPS in production
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
  },
});

// Attach req.user and req.company from the session (if any).
function loadUser(req, res, next) {
  const userId = req.session && req.session.userId;
  if (!userId) return next();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    req.session.destroy(() => {});
    return next();
  }
  req.user = user;
  req.company = db.prepare('SELECT * FROM companies WHERE id = ?').get(user.company_id);
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in.' });
  next();
}

// roles: e.g. requireRole('owner','admin')
function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Please sign in.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
  };
}

function requirePlatformAdmin(req, res, next) {
  if (!req.user || !req.user.is_platform_admin) {
    return res.status(403).json({ error: 'Platform administrators only.' });
  }
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  sessionMiddleware,
  loadUser,
  requireAuth,
  requireRole,
  requirePlatformAdmin,
};
