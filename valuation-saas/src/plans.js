'use strict';

// Plan catalogue. `quota` = valuations included per billing month.
// `seats` = users allowed in the company account. Prices here are display-only
// (marketing copy); the actual charge is whatever the linked Stripe Price says.
const config = require('./config');

const PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial',
    priceLabel: 'Free',
    quota: 3,
    seats: 1,
    stripePrice: null,
    features: ['3 valuations to try it out', 'Single user', 'Saved projects & history'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceLabel: '£49 / month',
    quota: 40,
    seats: 3,
    stripePrice: config.stripe.prices.starter,
    features: ['40 valuations / month', 'Up to 3 users', 'Branded PDF export', 'Saved projects & history'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: '£149 / month',
    quota: 200,
    seats: 10,
    stripePrice: config.stripe.prices.pro,
    features: ['200 valuations / month', 'Up to 10 users', 'Branded PDF export', 'Priority support'],
  },
};

const ORDER = ['trial', 'starter', 'pro'];

function getPlan(id) {
  return PLANS[id] || PLANS.trial;
}

// Map a Stripe Price ID back to our plan id (used by the webhook).
function planForStripePrice(priceId) {
  if (!priceId) return null;
  const hit = ORDER.find((id) => PLANS[id].stripePrice && PLANS[id].stripePrice === priceId);
  return hit || null;
}

// A subscription is "active" if Stripe says active or trialing.
function isActiveStatus(status) {
  return status === 'active' || status === 'trialing';
}

module.exports = { PLANS, ORDER, getPlan, planForStripePrice, isActiveStatus };
