// Counts project views. Needs a KV binding named VIEWS (see setup steps).
const KEY = 'counts';

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}

async function readCounts(env) {
  const txt = await env.VIEWS.get(KEY);
  try { return txt ? JSON.parse(txt) : {}; } catch (e) { return {}; }
}

// GET /api/views  ->  {"0":12,"1":5}
export async function onRequestGet({ env }) {
  if (!env.VIEWS) return json({ error: 'KV binding VIEWS missing' }, 503);
  return json(await readCounts(env));
}

// POST /api/views?p=0  ->  adds 1 view to project 0
export async function onRequestPost({ env, request }) {
  if (!env.VIEWS) return json({ error: 'KV binding VIEWS missing' }, 503);
  const origin = request.headers.get('origin');
  if (origin) { try { if (new URL(origin).host !== new URL(request.url).host) return json({ error: 'blocked' }, 403); } catch (e) { return json({ error: 'blocked' }, 403); } }
  const p = new URL(request.url).searchParams.get('p') || '';
  if (!/^\d{1,2}$/.test(p)) return json({ error: 'bad project number' }, 400);
  const counts = await readCounts(env);
  counts[p] = (counts[p] || 0) + 1;
  try { await env.VIEWS.put(KEY, JSON.stringify(counts)); } catch (e) { /* daily write limit reached: keep the site working */ }
  return json(counts);
}
