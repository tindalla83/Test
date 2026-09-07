'use strict';

const path = require('path');
const express = require('express');
const config = require('./config');
const { sessionMiddleware, loadUser } = require('./auth');
const billing = require('./billing');

const app = express();
app.set('trust proxy', 1); // needed for secure cookies behind a proxy/load balancer

// --- Stripe webhook: MUST receive the raw body, so mount before express.json ---
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const type = billing.handleWebhook(req.body, sig);
    res.json({ received: true, type });
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json({ limit: '256kb' }));
app.use(sessionMiddleware);
app.use(loadUser);

// --- API ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, anthropic: config.hasAnthropic, stripe: config.hasStripe, env: config.env });
});
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/team', require('./routes/team.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// --- Static front end ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// Unknown /api routes -> JSON 404 (don't fall through to static)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

const server = app.listen(config.port, () => {
  console.log(`House Type Valuer SaaS listening on ${config.appUrl} (port ${config.port})`);
  if (!config.hasAnthropic) console.warn('⚠  ANTHROPIC_API_KEY not set — valuations will fail until it is configured.');
  if (!config.hasStripe) console.warn('⚠  STRIPE_SECRET_KEY not set — billing endpoints are disabled (trial plan only).');
});
server.timeout = config.valuationTimeoutMs + 15000;

module.exports = app;
