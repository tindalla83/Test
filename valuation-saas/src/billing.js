'use strict';

const Stripe = require('stripe');
const config = require('./config');
const { db, now } = require('./db');
const { getPlan, planForStripePrice } = require('./plans');

let stripe = null;
function getStripe() {
  if (!config.hasStripe) return null;
  if (!stripe) stripe = new Stripe(config.stripe.secretKey);
  return stripe;
}

async function ensureCustomer(company, user) {
  const s = getStripe();
  if (!s) throw new Error('Stripe is not configured.');
  if (company.stripe_customer_id) return company.stripe_customer_id;
  const customer = await s.customers.create({
    email: user.email,
    name: company.name,
    metadata: { company_id: company.id },
  });
  db.prepare('UPDATE companies SET stripe_customer_id = ? WHERE id = ?').run(customer.id, company.id);
  company.stripe_customer_id = customer.id;
  return customer.id;
}

async function createCheckoutSession(company, user, planId) {
  const s = getStripe();
  if (!s) throw new Error('Stripe is not configured.');
  const plan = getPlan(planId);
  if (!plan.stripePrice) throw new Error(`Plan "${planId}" has no Stripe price configured.`);
  const customerId = await ensureCustomer(company, user);
  const sess = await s.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.stripePrice, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${config.appUrl}/app.html?billing=success`,
    cancel_url: `${config.appUrl}/billing.html?billing=cancelled`,
    metadata: { company_id: company.id, plan: planId },
    subscription_data: { metadata: { company_id: company.id, plan: planId } },
  });
  return sess.url;
}

async function createPortalSession(company) {
  const s = getStripe();
  if (!s) throw new Error('Stripe is not configured.');
  if (!company.stripe_customer_id) throw new Error('No billing account yet — subscribe to a plan first.');
  const portal = await s.billingPortal.sessions.create({
    customer: company.stripe_customer_id,
    return_url: `${config.appUrl}/billing.html`,
  });
  return portal.url;
}

// Apply a Stripe subscription object to the matching company row.
function applySubscription(sub) {
  const company = db.prepare('SELECT * FROM companies WHERE stripe_customer_id = ?').get(sub.customer);
  if (!company) return;
  const priceId = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
  const planId = planForStripePrice(priceId) || company.plan || 'trial';
  const status = sub.status;
  const active = status === 'active' || status === 'trialing';
  db.prepare(
    'UPDATE companies SET plan = ?, stripe_subscription_id = ?, subscription_status = ?, current_period_end = ? WHERE id = ?'
  ).run(active ? planId : 'trial', sub.id, status, (sub.current_period_end || 0) * 1000, company.id);
}

// Verify + process a raw webhook. `rawBody` must be the unparsed Buffer.
function handleWebhook(rawBody, signature) {
  const s = getStripe();
  if (!s) throw new Error('Stripe is not configured.');
  const event = s.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      applySubscription(event.data.object);
      break;
    case 'checkout.session.completed': {
      // Fetch the subscription to sync plan immediately after checkout.
      const sess = event.data.object;
      if (sess.subscription) {
        s.subscriptions.retrieve(sess.subscription).then(applySubscription).catch(() => {});
      }
      break;
    }
    default:
      break;
  }
  return event.type;
}

module.exports = {
  getStripe,
  ensureCustomer,
  createCheckoutSession,
  createPortalSession,
  applySubscription,
  handleWebhook,
};
