'use strict';

const express = require('express');
const config = require('../config');
const { db, now, uuid } = require('../db');
const { hashPassword, verifyPassword, requireAuth } = require('../auth');
const { quotaStatus, seatStatus, effectivePlan } = require('../usage');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPlatformAdmin(email) {
  return config.platformAdminEmails.includes(email.toLowerCase());
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, isPlatformAdmin: !!user.is_platform_admin };
}

function mePayload(req) {
  const plan = effectivePlan(req.company);
  return {
    user: publicUser(req.user),
    company: {
      id: req.company.id,
      name: req.company.name,
      plan: plan.id,
      planName: plan.name,
      subscriptionStatus: req.company.subscription_status || null,
    },
    quota: quotaStatus(req.company),
    seats: seatStatus(req.company),
  };
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();
  const inviteToken = body.inviteToken ? String(body.inviteToken).trim() : '';

  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'An account with that email already exists. Try signing in.' });

  let companyId;
  let role = 'owner';

  if (inviteToken) {
    const invite = db.prepare('SELECT * FROM invites WHERE token = ? AND accepted_at IS NULL').get(inviteToken);
    if (!invite) return res.status(400).json({ error: 'That invite link is invalid or has already been used.' });
    if (invite.email.toLowerCase() !== email) {
      return res.status(400).json({ error: 'This invite was issued for a different email address.' });
    }
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(invite.company_id);
    if (!company) return res.status(400).json({ error: 'The inviting account no longer exists.' });
    const seats = seatStatus(company);
    if (!seats.allowed) return res.status(403).json({ error: 'That team has no seats left on its plan.' });
    companyId = invite.company_id;
    role = invite.role || 'member';
    db.prepare('UPDATE invites SET accepted_at = ? WHERE id = ?').run(now(), invite.id);
  } else {
    const companyName = String(body.companyName || '').trim() || `${name || email}'s company`;
    companyId = uuid();
    db.prepare('INSERT INTO companies (id, name, plan, created_at) VALUES (?,?,?,?)').run(companyId, companyName, 'trial', now());
  }

  const userId = uuid();
  db.prepare(
    'INSERT INTO users (id, company_id, email, password_hash, name, role, is_platform_admin, created_at) VALUES (?,?,?,?,?,?,?,?)'
  ).run(userId, companyId, email, hashPassword(password), name || null, role, isPlatformAdmin(email) ? 1 : 0, now());

  req.session.userId = userId;
  req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  req.company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
  res.json(mePayload(req));
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  // Keep platform-admin flag in sync with config on each login.
  const shouldBeAdmin = isPlatformAdmin(email) ? 1 : 0;
  if (shouldBeAdmin !== user.is_platform_admin) {
    db.prepare('UPDATE users SET is_platform_admin = ? WHERE id = ?').run(shouldBeAdmin, user.id);
    user.is_platform_admin = shouldBeAdmin;
  }
  req.session.userId = user.id;
  req.user = user;
  req.company = db.prepare('SELECT * FROM companies WHERE id = ?').get(user.company_id);
  res.json(mePayload(req));
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/me
router.get('/me', requireAuth, (req, res) => {
  res.json(mePayload(req));
});

module.exports = router;
