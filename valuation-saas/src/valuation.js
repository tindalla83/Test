'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const config = require('./config');

let client = null;
function getClient() {
  if (!config.hasAnthropic) return null;
  if (!client) {
    // maxRetries low: a timeout should surface, not silently triple the wait.
    client = new Anthropic({ apiKey: config.anthropicApiKey, timeout: config.valuationTimeoutMs, maxRetries: 1 });
  }
  return client;
}

const PARKING_OPTIONS = new Set(['none', 'allocated space', 'single garage', 'double garage']);
const TYPOLOGY_OPTIONS = new Set(['detached', 'semi-detached', 'terraced', 'end-terrace', 'bungalow', 'apartment']);

// Validate + normalise a valuation request. Returns { error } or { location, houseTypes }.
function validate(body) {
  if (!body || typeof body !== 'object') return { error: 'Request body must be JSON.' };

  const location = typeof body.location === 'string' ? body.location.trim() : '';
  if (!location) return { error: 'Please provide a development location (town, area, or postcode).' };

  if (!Array.isArray(body.houseTypes) || body.houseTypes.length === 0) {
    return { error: 'Please add at least one house type.' };
  }
  if (body.houseTypes.length > config.maxHouseTypes) {
    return { error: `Please limit the request to ${config.maxHouseTypes} house types or fewer.` };
  }

  const houseTypes = [];
  for (let i = 0; i < body.houseTypes.length; i++) {
    const raw = body.houseTypes[i] || {};
    const label = `House type ${i + 1}`;
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) return { error: `${label}: please give it a name or reference.` };

    const sqft = Number(raw.sqft);
    if (!Number.isFinite(sqft) || sqft <= 0) return { error: `${label} (${name}): size in sqft must be a positive number.` };

    const bedrooms = Number(raw.bedrooms);
    if (!Number.isFinite(bedrooms) || bedrooms <= 0 || !Number.isInteger(bedrooms)) {
      return { error: `${label} (${name}): number of bedrooms must be a positive whole number.` };
    }

    const parking = typeof raw.parking === 'string' ? raw.parking.trim().toLowerCase() : '';
    if (!PARKING_OPTIONS.has(parking)) return { error: `${label} (${name}): parking must be one of ${[...PARKING_OPTIONS].join(', ')}.` };

    const typology = typeof raw.typology === 'string' ? raw.typology.trim().toLowerCase() : '';
    if (!TYPOLOGY_OPTIONS.has(typology)) return { error: `${label} (${name}): typology must be one of ${[...TYPOLOGY_OPTIONS].join(', ')}.` };

    const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `house-${i + 1}`;
    houseTypes.push({ id, name, sqft, bedrooms, parking, typology });
  }
  return { location, houseTypes };
}

const SYSTEM_PROMPT = `You are a UK residential development valuation analyst. A housing
developer needs indicative selling-price predictions for a set of house types they are
proposing to build at a specific location, to feed into an early-stage viability appraisal.

For EACH house type, use live web search to research:
(a) new-build asking prices for comparable size/typology/bedroom-count homes being marketed
    near the given location (major housebuilder developments, new-homes portals, local estate
    agent new-build listings), and
(b) recent second-hand / resale sold prices for comparable homes in the same area — consider
    HM Land Registry Price Paid Data and the sold-price sections of major UK property portals
    (Rightmove, Zoopla, OnTheMarket) as sources.

Reconcile the new-build and resale evidence, adjust for the stated sqft, bedroom count,
parking provision, and typology of each house type, and produce a realistic predicted selling
price in GBP. New-build homes typically carry a premium over equivalent resale stock — reflect
that where the evidence supports it. Be explicit in your per-house-type summary about how you
weighed new-build vs. resale evidence and any notable local market factors.

Work efficiently: search enough to ground each price in real evidence, but do not exhaustively
search beyond what is needed to reach a well-evidenced answer for every house type.

When you have researched all house types, respond with ONLY a single JSON object — no prose
before or after it, no markdown code fences — matching exactly this shape:

{
  "location": string,
  "marketOverview": string,
  "results": [
    { "id": string, "name": string, "predictedPrice": number,
      "priceRange": { "low": number, "high": number }, "pricePerSqft": number,
      "confidence": "low" | "medium" | "high", "summary": string,
      "comparables": [ { "description": string, "price": number, "source": string } ] }
  ]
}

Rules for the JSON:
- Echo back the exact "id" given for each house type, one result per house type, in input order.
- All prices are plain GBP numbers (no symbols, no commas) — e.g. 425000.
- "pricePerSqft" is predictedPrice divided by the house type's sqft, rounded to a whole number.
- "confidence": "high" for strong, recent, closely comparable evidence; "medium" for reasonable
  but imperfect evidence; "low" when relying on broader-area or loosely comparable evidence.
- "summary" is 2-3 sentences: the predicted price, why, and the key evidence behind it.
- "comparables" lists 2-4 of the most relevant data points (mix of new-build and resold where
  available), each with a short description, its price, and its source (site or publication).
- "marketOverview" is a short (3-5 sentence) summary of the overall local housing market.
- Return valid, strictly parseable JSON. Do not wrap it in markdown code fences.`;

function buildUserPrompt(location, houseTypes) {
  const lines = houseTypes.map(
    (ht, i) =>
      `${i + 1}. id: ${ht.id} | name/ref: ${ht.name} | size: ${ht.sqft} sqft | bedrooms: ${ht.bedrooms} | parking: ${ht.parking} | typology: ${ht.typology}`
  );
  return (
    `Development location: ${location}\n\nHouse types to value:\n${lines.join('\n')}\n\n` +
    `Research current new-build asking prices and recent second-hand sold prices near this ` +
    `location for each house type above, then respond with the JSON object described in your ` +
    `instructions — one result per house type, in the order listed.`
  );
}

function extractJson(text) {
  if (!text) return null;
  let c = text.trim();
  const fence = c.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) c = fence[1].trim();
  const start = c.indexOf('{');
  const end = c.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  c = c.slice(start, end + 1);
  try {
    return JSON.parse(c);
  } catch (e) {
    return null;
  }
}

async function callClaude(location, houseTypes) {
  const c = getClient();
  // Cap searches so a run stays fast and cost-bounded (the model rarely needs
  // more than a handful per house type to reach a well-evidenced answer).
  const tool = { type: 'web_search_20260209', name: 'web_search', max_uses: 5 * houseTypes.length + 3 };
  const messages = [{ role: 'user', content: buildUserPrompt(location, houseTypes) }];

  let response = await c.messages.create({
    model: config.model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [tool],
    messages,
  });

  let attempts = 0;
  while (response.stop_reason === 'pause_turn' && attempts < 5) {
    messages.push({ role: 'assistant', content: response.content });
    response = await c.messages.create({
      model: config.model,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [tool],
      messages,
    });
    attempts += 1;
  }
  return response;
}

// Run a valuation. Returns { location, marketOverview, results, model }.
// Throws { code, message } on failure ('no_key' | 'refused' | 'bad_response' | 'upstream').
async function runValuation({ location, houseTypes }) {
  if (!config.hasAnthropic) {
    throw { code: 'no_key', message: 'Valuation service is not configured (missing Anthropic API key).' };
  }
  let response;
  try {
    response = await callClaude(location, houseTypes);
  } catch (err) {
    // Log the real Anthropic error so the cause is visible in server logs.
    console.error('Anthropic call failed:', {
      name: err && err.name,
      status: err && err.status,
      message: err && err.message,
    });
    if (err instanceof Anthropic.RateLimitError) throw { code: 'upstream', message: 'The valuation service is busy right now. Please try again shortly.' };
    if (err instanceof Anthropic.AuthenticationError) throw { code: 'upstream', message: 'The valuation service rejected the API key. Check ANTHROPIC_API_KEY.' };
    if (err instanceof Anthropic.APIError) {
      const detail = (err && err.message) ? String(err.message).slice(0, 200) : '';
      throw { code: 'upstream', message: `The valuation service returned an error (HTTP ${err.status || '?'}). ${detail}` };
    }
    throw { code: 'upstream', message: `Something went wrong generating valuations: ${(err && err.message) || 'unknown error'}` };
  }

  if (response.stop_reason === 'refusal') {
    throw { code: 'refused', message: 'Claude declined to produce this valuation. Try rephrasing the inputs.' };
  }

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const parsed = extractJson(text);
  if (!parsed || !Array.isArray(parsed.results)) {
    throw { code: 'bad_response', message: 'Received an unexpected response while generating valuations. Please try again.' };
  }

  const byId = new Map((parsed.results || []).map((r) => [r && r.id, r]));
  const results = houseTypes.map((ht) => {
    const r = byId.get(ht.id) || {};
    const pr = r.priceRange && typeof r.priceRange === 'object' ? r.priceRange : {};
    return {
      id: ht.id,
      name: r.name || ht.name,
      predictedPrice: typeof r.predictedPrice === 'number' ? r.predictedPrice : null,
      priceRange: { low: typeof pr.low === 'number' ? pr.low : null, high: typeof pr.high === 'number' ? pr.high : null },
      pricePerSqft: typeof r.pricePerSqft === 'number' ? r.pricePerSqft : null,
      confidence: ['low', 'medium', 'high'].includes(r.confidence) ? r.confidence : 'medium',
      summary: typeof r.summary === 'string' ? r.summary : '',
      comparables: Array.isArray(r.comparables) ? r.comparables : [],
    };
  });

  return {
    location: parsed.location || location,
    marketOverview: typeof parsed.marketOverview === 'string' ? parsed.marketOverview : '',
    results,
    model: config.model,
  };
}

module.exports = { validate, runValuation };
