'use strict';

const { db, now, uuid } = require('./db');
const { getPlan, isActiveStatus } = require('./plans');

// Deterministic quota window: the current UTC calendar month.
function startOfMonthUTC(ts) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

// The plan whose quota/seats currently apply. Paid plans only count while the
// Stripe subscription is active/trialing; otherwise the account falls back to
// the free trial allowance.
function effectivePlan(company) {
  if (!company) return getPlan('trial');
  if (company.plan && company.plan !== 'trial' && isActiveStatus(company.subscription_status)) {
    return getPlan(company.plan);
  }
  return getPlan('trial');
}

function monthlyUsage(companyId) {
  const since = startOfMonthUTC(now());
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(units), 0) AS used FROM usage_events WHERE company_id = ? AND kind = 'valuation' AND created_at >= ?"
    )
    .get(companyId, since);
  return row.used || 0;
}

function quotaStatus(company) {
  const plan = effectivePlan(company);
  const used = monthlyUsage(company.id);
  const quota = plan.quota;
  return {
    plan: plan.id,
    planName: plan.name,
    used,
    quota,
    remaining: Math.max(0, quota - used),
    allowed: used < quota,
    resetsAt: nextMonthUTC(),
  };
}

function nextMonthUTC() {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

function recordUsage(companyId, userId) {
  db.prepare(
    'INSERT INTO usage_events (id, company_id, user_id, kind, units, created_at) VALUES (?,?,?,?,?,?)'
  ).run(uuid(), companyId, userId || null, 'valuation', 1, now());
}

function seatStatus(company) {
  const plan = effectivePlan(company);
  const used = db.prepare('SELECT COUNT(*) AS n FROM users WHERE company_id = ?').get(company.id).n;
  return { used, seats: plan.seats, remaining: Math.max(0, plan.seats - used), allowed: used < plan.seats };
}

module.exports = { effectivePlan, monthlyUsage, quotaStatus, recordUsage, seatStatus };
