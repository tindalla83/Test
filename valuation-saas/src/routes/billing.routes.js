'use strict';

const express = require('express');
const config = require('../config');
const { requireAuth, requireRole } = require('../auth');
const { PLANS, ORDER, getPlan } = require('../plans');
const { quotaStatus, effectivePlan } = require('../usage');
const billing = require('../billing');

const router = express.Router();
router.use(requireAuth);

// GET /api/billing — current plan + catalogue
router.get('/', (req, res) => {
  const plan = effectivePlan(req.company);
  res.json({
    stripeEnabled: config.hasStripe,
    current: {
      plan: plan.id,
      planName: plan.name,
      status: req.company.subscription_status || null,
      currentPeriodEnd: req.company.current_period_end || null,
    },
    quota: quotaStatus(req.company),
    plans: ORDER.map((id) => {
      const p = getPlan(id);
      return {
        id: p.id,
        name: p.name,
        priceLabel: p.priceLabel,
        quota: p.quota,
        seats: p.seats,
        features: p.features,
        purchasable: !!p.stripePrice,
        current: p.id === plan.id,
      };
    }),
  });
});

// POST /api/billing/checkout { plan }  (owner only)
router.post('/checkout', requireRole('owner'), async (req, res) => {
  if (!config.hasStripe) return res.status(400).json({ error: 'Billing is not configured on this deployment.' });
  const planId = String((req.body && req.body.plan) || '');
  if (!PLANS[planId] || !PLANS[planId].stripePrice) {
    return res.status(400).json({ error: 'Unknown or unavailable plan.' });
  }
  try {
    const url = await billing.createCheckoutSession(req.company, req.user, planId);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not start checkout.' });
  }
});

// POST /api/billing/portal  (owner only)
router.post('/portal', requireRole('owner'), async (req, res) => {
  if (!config.hasStripe) return res.status(400).json({ error: 'Billing is not configured on this deployment.' });
  try {
    const url = await billing.createPortalSession(req.company);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not open the billing portal.' });
  }
});

module.exports = router;
