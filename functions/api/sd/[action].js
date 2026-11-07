// API «Віддаленого SD» на Cloudflare Pages Functions + D1.
// Друг: submit/me/status/image/ping. Воркер на ПК (Bearer WORKER_TOKEN): next/result.
// Налаштування Cloudflare описані в sd-remote/README.md.
import { LIMITS, userOf, cleanParams, b64ToBytes } from './sd-core.js';

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const now = () => Date.now();

export async function onRequest({ request, env, params }) {
  const db = env.DB;
  if (!db) return J({ error: 'Не підключена база D1 (binding DB)' }, 500);
  const url = new URL(request.url), action = params.action, method = request.method;
  try {
    if (action === 'ping' && method === 'GET') return ping(db);
    if (action === 'me' && method === 'GET') return me(request, env);
    if (action === 'submit' && method === 'POST') return submit(request, env, db);
    if (action === 'status' && method === 'GET') return status(url, db);
    if (action === 'image' && method === 'GET') return image(url, db);
    if (action === 'next' && method === 'POST') return workerOnly(request, env) || next(db);
    if (action === 'result' && method === 'POST') return workerOnly(request, env) || result(request, db);
    return J({ error: 'Невідома дія' }, 404);
  } catch (e) {
    return J({ error: 'Помилка сервера: ' + (e && e.message || e) }, 500);
  }
}

function workerOnly(request, env) {
  const t = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.WORKER_TOKEN || t !== env.WORKER_TOKEN) return J({ error: 'Невірний токен воркера' }, 401);
  return null;
}

async function ping(db) {
  const a = await db.prepare("SELECT v FROM meta WHERE k='alive'").first();
  const q = await db.prepare("SELECT COUNT(*) n FROM jobs WHERE status IN ('queued','running')").first();
  return J({ online: !!a && now() - a.v < LIMITS.onlineMs, queue: q ? q.n : 0 });
}

const authed = (request, env) => userOf(env.ACCESS_CODES, decodeURIComponent(request.headers.get('x-login') || ''), decodeURIComponent(request.headers.get('x-pass') || ''));

function me(request, env) {
  const u = authed(request, env);
  return u ? J({ user: u }) : J({ error: 'Невірний логін або пароль' }, 401);
}

async function submit(request, env, db) {
  const user = authed(request, env);
  if (!user) return J({ error: 'Невірний логін або пароль' }, 401);
  let body; try { body = await request.json(); } catch { return J({ error: 'Некоректний запит' }, 400); }
  const p = cleanParams(body);
  if (!p.prompt) return J({ error: 'Напиши промпт' }, 400);
  const t = now();
  await db.prepare('DELETE FROM jobs WHERE created < ?').bind(t - LIMITS.keepDays * 864e5).run();
  const c = await db.prepare("SELECT COUNT(*) n FROM jobs WHERE user=? AND status IN ('queued','running')").bind(user).first();
  if (c && c.n >= LIMITS.maxQueuePerUser) return J({ error: `У черзі вже ${c.n} твоїх задач, дочекайся їх` }, 429);
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO jobs (id,user,status,params,created,updated) VALUES (?,?,'queued',?,?,?)").bind(id, user, JSON.stringify(p), t, t).run();
  return J({ id });
}

async function status(url, db) {
  const id = url.searchParams.get('id') || '';
  const r = await db.prepare('SELECT status,error,info,created FROM jobs WHERE id=?').bind(id).first();
  if (!r) return J({ error: 'Задачі не знайдено (можливо, застаріла)' }, 404);
  let position = 0;
  if (r.status === 'queued') {
    const q = await db.prepare("SELECT COUNT(*) n FROM jobs WHERE status='queued' AND created < ?").bind(r.created).first();
    position = (q ? q.n : 0) + 1;
  }
  return J({ status: r.status, position, error: r.error || '', info: r.info ? JSON.parse(r.info) : null });
}

async function image(url, db) {
  const r = await db.prepare("SELECT image,mime FROM jobs WHERE id=? AND status='done'").bind(url.searchParams.get('id') || '').first();
  if (!r || !r.image) return new Response('Немає картинки', { status: 404 });
  return new Response(b64ToBytes(r.image), { headers: { 'content-type': r.mime || 'image/webp', 'cache-control': 'public, max-age=86400, immutable' } });
}

async function next(db) {
  const t = now();
  // «живий» сигнал воркера (запис не частіше ніж раз на 20 с, щоб не витрачати ліміт запису D1)
  await db.prepare("INSERT INTO meta (k,v) VALUES ('alive',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v WHERE meta.v < excluded.v - 20000").bind(t).run();
  await db.prepare("UPDATE jobs SET status='error', error='Таймаут: ПК не відповів', updated=? WHERE status='running' AND updated < ?").bind(t, t - LIMITS.jobTimeoutMs).run();
  const r = await db.prepare("UPDATE jobs SET status='running', updated=? WHERE id=(SELECT id FROM jobs WHERE status='queued' ORDER BY created LIMIT 1) RETURNING id, params").bind(t).first();
  return J(r ? { job: { id: r.id, params: JSON.parse(r.params) } } : { job: null });
}

async function result(request, db) {
  let b; try { b = await request.json(); } catch { return J({ error: 'Некоректний запит' }, 400); }
  const id = String(b.id || ''), t = now();
  if (b.error) {
    await db.prepare("UPDATE jobs SET status='error', error=?, updated=? WHERE id=?").bind(String(b.error).slice(0, 300), t, id).run();
    return J({ ok: true });
  }
  if (!b.image || b.image.length > 1.5e6) return J({ error: 'Картинка порожня або завелика (макс. ~1 МБ)' }, 400);
  await db.prepare("UPDATE jobs SET status='done', image=?, mime=?, info=?, updated=? WHERE id=?").bind(b.image, b.mime === 'image/png' ? 'image/png' : 'image/webp', JSON.stringify(b.info || {}), t, id).run();
  return J({ ok: true });
}
