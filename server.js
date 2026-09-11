// Meridian Viability — House-type valuation tool
//
// Small Express app: serves the static front end from /public and exposes
// POST /api/valuation, which asks Claude (with the live web search tool) to
// research current asking/sold prices near a development location and
// produce a predicted price for each house type submitted.

'use strict';

require('dotenv').config();

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const PORT = Number(process.env.PORT) || 3000;
// A current Sonnet-class model is the sensible default for this task —
// good research/reasoning quality without Opus-level cost/latency for what
// is, per request, several web searches plus a JSON summary.
const MODEL = process.env.MODEL || 'claude-sonnet-5';
const MAX_HOUSE_TYPES = 15;
// Generous ceiling — a single call may involve many rounds of web search.
const REQUEST_TIMEOUT_MS = 120_000;

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static('public'));
// Also expose the marketing site's shared assets (palette, brand mark, mobile
// nav script) so the tool page can reuse them without duplicating files.
app.use('/assets', express.static('assets'));

// Lazily construct the Anthropic client so a missing key never crashes the
// server at boot — it only surfaces when a valuation is actually requested.
function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: REQUEST_TIMEOUT_MS,
  });
}

const PARKING_OPTIONS = new Set([
  'none',
  'allocated space',
  'single garage',
  'double garage',
]);

const TYPOLOGY_OPTIONS = new Set([
  'detached',
  'semi-detached',
  'terraced',
  'end-terrace',
  'bungalow',
  'apartment',
]);

/**
 * Validate the incoming request body.
 * Returns { error: string } on failure, or { houseTypes } (normalised) on success.
 */
function validateRequest(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be JSON.' };
  }

  const location = typeof body.location === 'string' ? body.location.trim() : '';
  if (!location) {
    return { error: 'Please provide a development location (town, area, or postcode).' };
  }

  if (!Array.isArray(body.houseTypes) || body.houseTypes.length === 0) {
    return { error: 'Please add at least one house type.' };
  }

  if (body.houseTypes.length > MAX_HOUSE_TYPES) {
    return { error: `Please limit the request to ${MAX_HOUSE_TYPES} house types or fewer.` };
  }

  const houseTypes = [];
  for (let i = 0; i < body.houseTypes.length; i++) {
    const raw = body.houseTypes[i];
    const rowLabel = `House type ${i + 1}`;

    if (!raw || typeof raw !== 'object') {
      return { error: `${rowLabel} is invalid.` };
    }

    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) {
      return { error: `${rowLabel}: please give it a name or reference.` };
    }

    const sqft = Number(raw.sqft);
    if (!Number.isFinite(sqft) || sqft <= 0) {
      return { error: `${rowLabel} (${name}): size in sqft must be a positive number.` };
    }

    const bedrooms = Number(raw.bedrooms);
    if (!Number.isFinite(bedrooms) || bedrooms <= 0 || !Number.isInteger(bedrooms)) {
      return { error: `${rowLabel} (${name}): number of bedrooms must be a positive whole number.` };
    }

    const parking = typeof raw.parking === 'string' ? raw.parking.trim().toLowerCase() : '';
    if (!PARKING_OPTIONS.has(parking)) {
      return { error: `${rowLabel} (${name}): parking must be one of ${[...PARKING_OPTIONS].join(', ')}.` };
    }

    const typology = typeof raw.typology === 'string' ? raw.typology.trim().toLowerCase() : '';
    if (!TYPOLOGY_OPTIONS.has(typology)) {
      return { error: `${rowLabel} (${name}): typology must be one of ${[...TYPOLOGY_OPTIONS].join(', ')}.` };
    }

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
weighed new-build vs. resale evidence and any notable local market factors (e.g. limited new
supply, strong/weak demand, a particular price band being scarce).

Work efficiently: search enough to ground each price in real evidence, but do not exhaustively
search beyond what's needed to reach a well-evidenced answer for every house type.

When you have researched all house types, respond with ONLY a single JSON object — no prose
before or after it, no markdown code fences — matching exactly this shape:

{
  "location": string,
  "marketOverview": string,
  "results": [
    {
      "id": string,
      "name": string,
      "predictedPrice": number,
      "priceRange": { "low": number, "high": number },
      "pricePerSqft": number,
      "confidence": "low" | "medium" | "high",
      "summary": string,
      "comparables": [
        { "description": string, "price": number, "source": string }
      ]
    }
  ]
}

Rules for the JSON:
- Echo back the exact "id" given for each house type in the input, and produce one result
  object per house type, in the same order.
- All prices are numbers in GBP (no currency symbols, no commas) — e.g. 425000, not "£425,000".
- "pricePerSqft" is predictedPrice divided by the house type's sqft, rounded to the nearest whole number.
- "confidence" reflects how much directly comparable evidence you found: "high" for strong,
  recent, closely comparable evidence; "medium" for reasonable but imperfect evidence; "low"
  when you had to rely on broader-area or loosely comparable evidence.
- "summary" is 2-3 sentences: the predicted price, why, and the key evidence behind it.
- "comparables" lists 2-4 of the most relevant data points you used (a mix of new-build and
  resold, where available), each with a short description, its price, and its source (site or
  publication name).
- "marketOverview" is a short (3-5 sentence) summary of the overall local housing market near
  the given location — general demand, price trends, and anything relevant to a developer
  pricing a scheme there.
- Return valid, strictly parseable JSON. Do not wrap it in markdown code fences.`;

function buildUserPrompt(location, houseTypes) {
  const lines = houseTypes.map((ht, i) => {
    return `${i + 1}. id: ${ht.id} | name/ref: ${ht.name} | size: ${ht.sqft} sqft | ` +
      `bedrooms: ${ht.bedrooms} | parking: ${ht.parking} | typology: ${ht.typology}`;
  });

  return `Development location: ${location}\n\nHouse types to value:\n${lines.join('\n')}\n\n` +
    `Research current new-build asking prices and recent second-hand sold prices near this ` +
    `location for each house type above, then respond with the JSON object described in your ` +
    `instructions — one result per house type, in the order listed.`;
}

/**
 * Defensively extract a JSON object from a model response that is supposed to be
 * "strict JSON only" but may still arrive wrapped in markdown fences or with stray text.
 */
function extractJson(text) {
  if (!text) return null;

  let candidate = text.trim();

  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fenceMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    candidate = fenceMatch[1].trim();
  }

  // Find the outermost { ... } object in case there's leading/trailing prose.
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  candidate = candidate.slice(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch (err) {
    return null;
  }
}

/**
 * Call Claude with the web search tool enabled, resuming automatically if the
 * model pauses mid-turn after a long run of server-side tool calls.
 */
async function runValuation(client, location, houseTypes) {
  const messages = [
    { role: 'user', content: buildUserPrompt(location, houseTypes) },
  ];

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: 'web_search_20260209',
        name: 'web_search',
        max_uses: 10 * houseTypes.length + 6,
      },
    ],
    messages,
  });

  // Server-side tools (web search) execute inline within a single response, but
  // a long run of searches can hit an internal iteration limit and pause the
  // turn. Resume by feeding the paused assistant turn straight back.
  let resumeAttempts = 0;
  while (response.stop_reason === 'pause_turn' && resumeAttempts < 5) {
    messages.push({ role: 'assistant', content: response.content });
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [
        { type: 'web_search_20260209', name: 'web_search', max_uses: 10 * houseTypes.length + 6 },
      ],
      messages,
    });
    resumeAttempts += 1;
  }

  return response;
}

app.post('/api/valuation', async (req, res) => {
  req.setTimeout(REQUEST_TIMEOUT_MS);
  res.setTimeout(REQUEST_TIMEOUT_MS);

  const client = getAnthropicClient();
  if (!client) {
    res.status(500).json({
      error: 'Server is not configured with an Anthropic API key. Set ANTHROPIC_API_KEY in the server environment and restart.',
    });
    return;
  }

  const validated = validateRequest(req.body);
  if (validated.error) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const { location, houseTypes } = validated;

  try {
    const response = await runValuation(client, location, houseTypes);

    if (response.stop_reason === 'refusal') {
      res.status(502).json({
        error: 'Claude declined to produce this valuation. Try rephrasing the location or house types.',
      });
      return;
    }

    // Concatenate all text blocks — the final answer may follow several
    // interleaved web-search-result blocks in the same response.
    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const parsed = extractJson(text);

    if (!parsed || !Array.isArray(parsed.results)) {
      console.error('Failed to parse valuation JSON from Claude response. Raw text:\n', text);
      res.status(502).json({
        error: 'Received an unexpected response while generating valuations. Please try again.',
      });
      return;
    }

    // Key each result to its input id so the front end can match them reliably,
    // and fill in the id/name from the input if the model dropped them.
    const resultsById = new Map(
      (parsed.results || []).map((r) => [r && r.id, r]),
    );

    const results = houseTypes.map((ht) => {
      const r = resultsById.get(ht.id) || {};
      return {
        id: ht.id,
        name: r.name || ht.name,
        predictedPrice: typeof r.predictedPrice === 'number' ? r.predictedPrice : null,
        priceRange: r.priceRange && typeof r.priceRange === 'object'
          ? { low: r.priceRange.low ?? null, high: r.priceRange.high ?? null }
          : { low: null, high: null },
        pricePerSqft: typeof r.pricePerSqft === 'number' ? r.pricePerSqft : null,
        confidence: ['low', 'medium', 'high'].includes(r.confidence) ? r.confidence : 'medium',
        summary: typeof r.summary === 'string' ? r.summary : '',
        comparables: Array.isArray(r.comparables) ? r.comparables : [],
      };
    });

    res.json({
      location: parsed.location || location,
      marketOverview: typeof parsed.marketOverview === 'string' ? parsed.marketOverview : '',
      results,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Chain most-specific-first so callers get a useful message without ever
    // leaking the API key or raw error internals.
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Anthropic authentication error:', err.message);
      res.status(500).json({ error: 'Server is not configured with a valid Anthropic API key.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error('Anthropic rate limit error:', err.message);
      res.status(429).json({ error: 'The valuation service is busy right now. Please try again in a moment.' });
    } else if (err instanceof Anthropic.BadRequestError) {
      console.error('Anthropic bad request error:', err.message);
      res.status(502).json({ error: 'Could not generate valuations for that request. Please check your inputs and try again.' });
    } else if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', err.status, err.message);
      res.status(502).json({ error: 'The valuation service returned an error. Please try again shortly.' });
    } else {
      console.error('Unexpected error generating valuation:', err);
      res.status(500).json({ error: 'Something went wrong generating valuations. Please try again.' });
    }
  }
});

const server = app.listen(PORT, () => {
  console.log(`Meridian house valuation tool listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY is not set — /api/valuation will return a friendly error until it is configured.');
  }
});

// Generous timeout: web search research can legitimately take 30-90s.
server.timeout = REQUEST_TIMEOUT_MS;

module.exports = app;
