'use strict';

require('dotenv').config();

const path = require('path');

function bool(v, def) {
  if (v == null) return def;
  return /^(1|true|yes|on)$/i.test(String(v));
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  env: NODE_ENV,
  isProd: NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  appUrl: (process.env.APP_URL || 'http://localhost:4000').replace(/\/$/, ''),

  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',
  dataDir: path.resolve(process.env.DATA_DIR || './data'),

  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.MODEL || 'claude-sonnet-5',
  // Web search research can legitimately take 30–90s.
  valuationTimeoutMs: 120_000,
  maxHouseTypes: 20,

  platformAdminEmails: (process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    prices: {
      starter: process.env.STRIPE_PRICE_STARTER || '',
      pro: process.env.STRIPE_PRICE_PRO || '',
    },
  },
};

config.hasAnthropic = Boolean(config.anthropicApiKey);
config.hasStripe = Boolean(config.stripe.secretKey);

module.exports = config;
