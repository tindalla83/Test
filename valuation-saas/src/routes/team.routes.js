'use strict';

const express = require('express');
const crypto = require('crypto');
const config = require('../config');
const { db, now, uuid } = require('../db');
const { requireAuth, requireRole } = require('../auth');
const { seatStatus } = require('../usage');

const router = express.Router();
router.use(requireAuth);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/team
router.get('/', (req, res) => {
  const members = db
    .prepare('SELECT id, email, name, role, created_at FROM users WHERE company_id = ? ORDER BY created_at ASC')
    .all(req.company.id);
  const invites = db
    .prepare('SELECT id, email, role, token, created_at FROM invites WHERE company_id = ? AND accepted_at IS NULL ORDER BY created_at DESC')
    .all(req.company.id)
    .map((i) => ({ id: i.id, email: i.email, role: i.role, createdAt: i.created_at, link: inviteLink(i.token) }));
  res.json({ members, invites, seats: seatStatus(req.company) });
});

// POST /api/team/invite  (owner/admin)
router.post('/invite', requireRole('owner', 'admin'), (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  let role = String((req.body && req.body.role) || 'member').toLowerCase();
  if (!['member', 'admin'].includes(role)) role = 'member';
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'That person already has an account.' });
  }
  const seats = seatStatus(req.company);
  const pending = db.prepare('SELECT COUNT(*) AS n FROM invites WHERE company_id = ? AND accepted_at IS NULL').get(req.company.id).n;
  if (seats.used + pending >= seats.seats) {
    return res.status(403).json({ error: 'No seats left on your plan. Upgrade or remove a member/invite first.' });
  }

  const existing = db.prepare('SELECT id FROM invites WHERE company_id = ? AND email = ? AND accepted_at IS NULL').get(req.company.id, email);
  if (existing) return res.status(409).json({ error: 'An invite for that email is already pending.' });

  const token = crypto.randomBytes(24).toString('hex');
  const id = uuid();
  db.prepare('INSERT INTO invites (id, company_id, email, role, token, invited_by, created_at) VALUES (?,?,?,?,?,?,?)').run(
    id,
    req.company.id,
    email,
    role,
    token,
    req.user.id,
    now()
  );
  res.json({ invite: { id, email, role, link: inviteLink(token) } });
});

// DELETE /api/team/invite/:id
router.delete('/invite/:id', requireRole('owner', 'admin'), (req, res) => {
  const inv = db.prepare('SELECT * FROM invites WHERE id = ? AND company_id = ?').get(req.params.id, req.company.id);
  if (!inv) return res.status(404).json({ error: 'Invite not found.' });
  db.prepare('DELETE FROM invites WHERE id = ?').run(inv.id);
  res.json({ ok: true });
});

// DELETE /api/team/user/:id  (owner/admin) — remove a member
router.delete('/user/:id', requireRole('owner', 'admin'), (req, res) => {
  const target = db.prepare('SELECT * FROM users WHERE id = ? AND company_id = ?').get(req.params.id, req.company.id);
  if (!target) return res.status(404).json({ error: 'Member not found.' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'You cannot remove yourself.' });
  if (target.role === 'owner') return res.status(400).json({ error: 'You cannot remove the account owner.' });
  db.prepare('DELETE FROM users WHERE id = ?').run(target.id);
  res.json({ ok: true });
});

function inviteLink(token) {
  return `${config.appUrl}/signup.html?invite=${token}`;
}

module.exports = router;
