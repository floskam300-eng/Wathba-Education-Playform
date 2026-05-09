const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) { _cache.set(key, { data, ts: Date.now() }); }

function invalidateCache(teacherId) {
  for (const k of _cache.keys()) {
    if (k.startsWith(`t${teacherId}_`)) _cache.delete(k);
  }
}

module.exports = { getCached, setCache, invalidateCache };
