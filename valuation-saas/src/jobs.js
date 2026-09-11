'use strict';

// In-memory registry of running valuation jobs. A valuation takes minutes of
// live web research — far longer than the platform's ~100s HTTP request limit —
// so the POST starts a job and returns immediately; the browser polls for the
// result. Jobs are scoped to a company + project so status can't be read across
// accounts. Finished jobs are dropped after a short TTL to bound memory. (If the
// process restarts mid-job the job is lost and the client is told to re-run;
// no usage is recorded for a job that never completes.)

const { uuid } = require('./db');

const jobs = new Map();
const TTL_MS = 10 * 60 * 1000;

function create(companyId, projectId) {
  const id = uuid();
  jobs.set(id, { id, companyId, projectId, status: 'pending', createdAt: Date.now() });
  return id;
}

function get(id) {
  return jobs.get(id) || null;
}

function finish(id, patch) {
  const j = jobs.get(id);
  if (!j) return;
  Object.assign(j, patch, { finishedAt: Date.now() });
  const t = setTimeout(() => jobs.delete(id), TTL_MS);
  if (t.unref) t.unref();
}

module.exports = { create, get, finish };
