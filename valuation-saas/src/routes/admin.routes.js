'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth, requirePlatformAdmin } = require('../auth');
const { getPlan, isActiveStatus } = require('../plans');
const { monthlyUsage } = require('../usage');

const router = express.Router();
router.use(requireAuth, requirePlatformAdmin);

// Rough MRR from our display price labels (parse the £ number).
function monthlyPrice(planId) {
  const m = String(getPlan(planId).priceLabel).match(/([\d,.]+)/);
  return m ? Number(m[1].replace(/,/g, '')) : 0;
}

// GET /api/admin/overview
router.get('/overview', (req, res) => {
  const companies = db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all();
  let mrr = 0;
  let activePaying = 0;

  const rows = companies.map((c) => {
    const users = db.prepare('SELECT COUNT(*) AS n FROM users WHERE company_id = ?').get(c.id).n;
    const projects = db.prepare('SELECT COUNT(*) AS n FROM projects WHERE company_id = ?').get(c.id).n;
    const paying = c.plan !== 'trial' && isActiveStatus(c.subscription_status);
    if (paying) {
      activePaying += 1;
      mrr += monthlyPrice(c.plan);
    }
    return {
      id: c.id,
      name: c.name,
      plan: c.plan,
      status: c.subscription_status || (c.plan === 'trial' ? 'trial' : 'inactive'),
      users,
      projects,
      usageThisMonth: monthlyUsage(c.id),
      createdAt: c.created_at,
    };
  });

  const totals = {
    companies: companies.length,
    activePaying,
    users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
    valuationsAllTime: db.prepare("SELECT COALESCE(SUM(units),0) AS n FROM usage_events WHERE kind='valuation'").get().n,
    valuationsThisMonth: rows.reduce((a, r) => a + r.usageThisMonth, 0),
    estimatedMrr: mrr,
  };

  res.json({ totals, companies: rows });
});

module.exports = router;
