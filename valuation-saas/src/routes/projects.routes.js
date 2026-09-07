'use strict';

const express = require('express');
const { db, now, uuid } = require('../db');
const { requireAuth } = require('../auth');
const { validate, runValuation } = require('../valuation');
const { quotaStatus, recordUsage } = require('../usage');
const { streamReport } = require('../pdf');

const router = express.Router();
router.use(requireAuth);

function getOwnedProject(companyId, id) {
  return db.prepare('SELECT * FROM projects WHERE id = ? AND company_id = ?').get(id, companyId);
}

function projectSummary(p) {
  const latest = db
    .prepare('SELECT id, created_at, results_json FROM valuations WHERE project_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(p.id);
  let unitCount = 0;
  try {
    unitCount = JSON.parse(p.house_types_json || '[]').length;
  } catch (e) {}
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    unitCount,
    updatedAt: p.updated_at,
    lastValuationAt: latest ? latest.created_at : null,
  };
}

// GET /api/projects
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE company_id = ? ORDER BY updated_at DESC').all(req.company.id);
  res.json({ projects: rows.map(projectSummary), quota: quotaStatus(req.company) });
});

// POST /api/projects
router.post('/', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const location = String(body.location || '').trim();
  if (!name) return res.status(400).json({ error: 'Please give the project a name.' });
  if (!location) return res.status(400).json({ error: 'Please provide a development location.' });
  const houseTypes = Array.isArray(body.houseTypes) ? body.houseTypes : [];

  const id = uuid();
  const t = now();
  db.prepare(
    'INSERT INTO projects (id, company_id, name, location, house_types_json, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)'
  ).run(id, req.company.id, name, location, JSON.stringify(houseTypes), req.user.id, t, t);
  res.json({ project: getOwnedProject(req.company.id, id) });
});

// GET /api/projects/:id  (with valuation history)
router.get('/:id', (req, res) => {
  const p = getOwnedProject(req.company.id, req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found.' });
  const valuations = db
    .prepare('SELECT id, created_at, model, location, market_overview, results_json FROM valuations WHERE project_id = ? ORDER BY created_at DESC')
    .all(p.id)
    .map((v) => ({
      id: v.id,
      createdAt: v.created_at,
      model: v.model,
      location: v.location,
      marketOverview: v.market_overview,
      results: safeParse(v.results_json, []),
    }));
  res.json({
    project: {
      id: p.id,
      name: p.name,
      location: p.location,
      houseTypes: safeParse(p.house_types_json, []),
      updatedAt: p.updated_at,
    },
    valuations,
    quota: quotaStatus(req.company),
  });
});

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
  const p = getOwnedProject(req.company.id, req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found.' });
  const body = req.body || {};
  const name = body.name != null ? String(body.name).trim() : p.name;
  const location = body.location != null ? String(body.location).trim() : p.location;
  const houseTypes = Array.isArray(body.houseTypes) ? body.houseTypes : safeParse(p.house_types_json, []);
  db.prepare('UPDATE projects SET name = ?, location = ?, house_types_json = ?, updated_at = ? WHERE id = ?').run(
    name || p.name,
    location || p.location,
    JSON.stringify(houseTypes),
    now(),
    p.id
  );
  res.json({ project: getOwnedProject(req.company.id, p.id) });
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  const p = getOwnedProject(req.company.id, req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found.' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(p.id);
  res.json({ ok: true });
});

// POST /api/projects/:id/valuation  — run a live valuation (quota-gated)
router.post('/:id/valuation', async (req, res) => {
  const p = getOwnedProject(req.company.id, req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found.' });

  const q = quotaStatus(req.company);
  if (!q.allowed) {
    return res.status(402).json({
      error: `You have used all ${q.quota} valuations on your ${q.planName} plan this month. Upgrade your plan for more.`,
      quota: q,
    });
  }

  const body = req.body || {};
  const input = validate({ location: body.location || p.location, houseTypes: body.houseTypes });
  if (input.error) return res.status(400).json({ error: input.error });

  req.setTimeout(130000);
  res.setTimeout(130000);

  let out;
  try {
    out = await runValuation(input);
  } catch (err) {
    const status = err.code === 'no_key' ? 500 : err.code === 'refused' || err.code === 'bad_response' ? 502 : 502;
    return res.status(status).json({ error: err.message || 'Failed to generate valuations.' });
  }

  // Persist inputs on the project + save the valuation, and record usage.
  const vid = uuid();
  const t = now();
  db.prepare(
    'INSERT INTO valuations (id, project_id, company_id, created_by, created_at, model, location, input_json, market_overview, results_json) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(
    vid,
    p.id,
    req.company.id,
    req.user.id,
    t,
    out.model,
    out.location,
    JSON.stringify(input.houseTypes),
    out.marketOverview,
    JSON.stringify(out.results)
  );
  db.prepare('UPDATE projects SET house_types_json = ?, location = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify(input.houseTypes),
    input.location,
    t,
    p.id
  );
  recordUsage(req.company.id, req.user.id);

  res.json({
    valuation: { id: vid, createdAt: t, model: out.model, location: out.location, marketOverview: out.marketOverview, results: out.results },
    quota: quotaStatus(req.company),
  });
});

// GET /api/projects/:id/valuations/:vid/pdf
router.get('/:id/valuations/:vid/pdf', (req, res) => {
  const p = getOwnedProject(req.company.id, req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found.' });
  const v = db.prepare('SELECT * FROM valuations WHERE id = ? AND project_id = ?').get(req.params.vid, p.id);
  if (!v) return res.status(404).json({ error: 'Valuation not found.' });

  const filename = `${p.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-valuation.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  streamReport(res, {
    company: req.company,
    project: p,
    valuation: {
      location: v.location,
      createdAt: v.created_at,
      marketOverview: v.market_overview,
      results: safeParse(v.results_json, []),
      model: v.model,
    },
  });
});

function safeParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}

module.exports = router;
