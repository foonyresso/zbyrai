// API «Віддаленого SD» на Cloudflare Pages Functions + D1.
// Друг: register/login/me/submit/status/image/ping. Адмін (x-admin): admin-list/admin-set. Воркер на ПК (Bearer WORKER_TOKEN): next/result.
// Налаштування Cloudflare описані в sd-remote/README.md.
import { LIMITS, userOf, cleanParams, b64ToBytes, validLogin, validPass, hashPassword, randomToken } from './sd-core.js';

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const now = () => Date.now();

export async function onRequest({ request, env, params }) {
  const db = env.DB;
  if (!db) return J({ error: 'Не підключена база D1 (binding DB)' }, 500);
  const url = new URL(request.url), action = params.action, method = request.method;
  try {
    if (action === 'ping' && method === 'GET') return ping(db);
    if (action === 'register' && method === 'POST') return register(request, env, db);
    if (action === 'login' && method === 'POST') return login(request, env, db);
    if (action === 'me' && method === 'GET') return me(request, db);
    if (action === 'submit' && method === 'POST') return submit(request, db);
    if (action === 'loras' && method === 'GET') return loras(request, db);
    if (action === 'loras-sync' && method === 'POST') return workerOnly(request, env) || lorasSync(request, db);
    if (action === 'admin-list' && method === 'GET') return adminOnly(request, env) || adminList(db);
    if (action === 'admin-set' && method === 'POST') return adminOnly(request, env) || adminSet(request, db);
    if (action === 'status' && method === 'GET') return status(url, db);
    if (action === 'image' && method === 'GET') return image(url, db);
    if (action === 'next' && method === 'POST') return workerOnly(request, env) || next(db);
    if (action === 'progress' && method === 'POST') return workerOnly(request, env) || progress(request, db);
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

const body = async (request) => { try { return await request.json(); } catch { return null; } };

function adminOnly(request, env) {
  const p = request.headers.get('x-admin') || '';
  if (!env.ADMIN_PASSWORD || p !== env.ADMIN_PASSWORD) return J({ error: 'Невірний пароль адміна' }, 401);
  return null;
}

// Сесія: заголовок x-token → логін активного акаунта (або null)
async function authed(request, db) {
  const t = request.headers.get('x-token') || '';
  if (!/^[0-9a-f]{32}$/.test(t)) return null;
  const r = await db.prepare('SELECT s.login, s.legacy, s.created, u.status FROM sessions s LEFT JOIN users u ON u.login = s.login WHERE s.token=?').bind(t).first();
  if (!r || now() - r.created > LIMITS.sessionDays * 864e5) return null;
  return r.legacy || r.status === 'active' ? r.login : null;
}

async function me(request, db) {
  const u = await authed(request, db);
  return u ? J({ user: u }) : J({ error: 'Потрібно увійти' }, 401);
}

async function register(request, env, db) {
  const b = await body(request);
  if (!b) return J({ error: 'Некоректний запит' }, 400);
  if (b.hp) return J({ ok: true }); // пастка для ботів: приховане поле заповнене
  const login = String(b.login || '').trim().toLowerCase();
  if (!validLogin(login)) return J({ error: 'Логін: 3–20 символів, латиниця, цифри або _' }, 400);
  if (!validPass(b.password)) return J({ error: 'Пароль: від 8 символів' }, 400);
  const legacy = String(env.ACCESS_CODES || '').split(',').some((x) => x.split(':')[0].trim().toLowerCase() === login);
  const taken = await db.prepare('SELECT 1 x FROM users WHERE login=?').bind(login).first();
  if (legacy || taken) return J({ error: 'Цей логін зайнятий' }, 409);
  const n = await db.prepare("SELECT COUNT(*) n FROM users WHERE status='pending'").first();
  if (n && n.n >= LIMITS.maxPending) return J({ error: 'Зараз заявки не приймаються, спробуй пізніше' }, 429);
  const h = await hashPassword(b.password);
  await db.prepare("INSERT INTO users (login,salt,hash,status,created) VALUES (?,?,?, 'pending', ?)").bind(login, h.salt, h.hash, now()).run();
  return J({ ok: true });
}

async function login(request, env, db) {
  const b = await body(request);
  if (!b) return J({ error: 'Некоректний запит' }, 400);
  const name = String(b.login || '').trim().toLowerCase(), t = now();
  let legacy = 0;
  if (userOf(env.ACCESS_CODES, b.login, b.password)) legacy = 1;
  else {
    const u = await db.prepare('SELECT * FROM users WHERE login=?').bind(name).first();
    if (!u) return J({ error: 'Невірний логін або пароль' }, 401);
    if (u.locked > t) return J({ error: 'Забагато спроб. Зачекай 15 хвилин' }, 429);
    const h = await hashPassword(String(b.password || ''), u.salt);
    if (h.hash !== u.hash) {
      const f = u.fails + 1;
      await db.prepare('UPDATE users SET fails=?, locked=? WHERE login=?').bind(f >= LIMITS.maxFails ? 0 : f, f >= LIMITS.maxFails ? t + LIMITS.lockMs : 0, name).run();
      return J({ error: 'Невірний логін або пароль' }, 401);
    }
    if (u.status === 'pending') return J({ error: 'Заявку ще не підтверджено. Зачекай, поки власник відкриє доступ' }, 403);
    if (u.status !== 'active') return J({ error: 'Доступ закрито' }, 403);
    await db.prepare('UPDATE users SET fails=0 WHERE login=?').bind(name).run();
  }
  const token = randomToken(), who = legacy ? String(b.login).trim() : name;
  await db.prepare('DELETE FROM sessions WHERE created < ?').bind(t - LIMITS.sessionDays * 864e5).run();
  await db.prepare('INSERT INTO sessions (token,login,legacy,created) VALUES (?,?,?,?)').bind(token, who, legacy, t).run();
  return J({ token, user: who });
}

async function adminList(db) {
  const r = await db.prepare('SELECT login,status,created FROM users ORDER BY created DESC LIMIT 200').all();
  return J({ users: r.results || [] });
}

async function adminSet(request, db) {
  const b = await body(request);
  const login = String(b && b.login || '').toLowerCase(), act = b && b.action;
  if (!login || !['approve', 'block', 'delete'].includes(act)) return J({ error: 'Некоректний запит' }, 400);
  if (act === 'delete') await db.prepare('DELETE FROM users WHERE login=?').bind(login).run();
  else await db.prepare('UPDATE users SET status=? WHERE login=?').bind(act === 'approve' ? 'active' : 'blocked', login).run();
  if (act !== 'approve') await db.prepare('DELETE FROM sessions WHERE login=?').bind(login).run();
  return J({ ok: true });
}

async function submit(request, db) {
  const user = await authed(request, db);
  if (!user) return J({ error: 'Потрібно увійти' }, 401);
  const b = await body(request);
  if (!b) return J({ error: 'Некоректний запит' }, 400);
  const p = cleanParams(b);
  if (!p.prompt) return J({ error: 'Напиши промпт' }, 400);
  if (p.kind === 'inpaint') {   // вихідна картинка має бути твоєю й ще лежати на сервері
    if (!p.mask || !p.srcId) return J({ error: 'Зафарбуй ділянку для перемалювання' }, 400);
    const src = await db.prepare('SELECT user, image IS NOT NULL AS has FROM jobs WHERE id=?').bind(p.srcId).first();
    if (!src || src.user !== user || !src.has) return J({ error: 'Вихідну картинку не знайдено: вона могла бути видалена з сервера (лишаються останні 40)' }, 400);
  }
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
  let prog = null;
  if (r.status === 'running') { const pr = await db.prepare('SELECT v FROM meta WHERE k=?').bind('p:' + id).first(); prog = pr ? pr.v / 1000 : 0; }
  return J({ status: r.status, position, progress: prog, error: r.error || '', info: r.info ? JSON.parse(r.info) : null });
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
  await db.prepare('DELETE FROM meta WHERE k=?').bind('p:' + id).run();
  if (b.error) {
    await db.prepare("UPDATE jobs SET status='error', error=?, updated=? WHERE id=?").bind(String(b.error).slice(0, 300), t, id).run();
    return J({ ok: true });
  }
  if (!b.image || b.image.length > 1.5e6) return J({ error: 'Картинка порожня або завелика (макс. ~1 МБ)' }, 400);
  await db.prepare("UPDATE jobs SET status='done', image=?, mime=?, info=?, updated=? WHERE id=?").bind(b.image, b.mime === 'image/png' ? 'image/png' : 'image/webp', safeInfo(b.info), t, id).run();
  // ліміт: у кожного користувача зберігається лише останні maxImagesPerUser картинок (старі стираються, щоб не розросталась база)
  const j = await db.prepare('SELECT user FROM jobs WHERE id=?').bind(id).first();
  if (j) await db.prepare('UPDATE jobs SET image=NULL WHERE user=? AND image IS NOT NULL AND id NOT IN (SELECT id FROM jobs WHERE user=? AND image IS NOT NULL ORDER BY updated DESC LIMIT ?)').bind(j.user, j.user, LIMITS.maxImagesPerUser).run();
  return J({ ok: true });
}

async function loras(request, db) {
  if (!(await authed(request, db))) return J({ error: 'Потрібно увійти' }, 401);
  const r = await db.prepare('SELECT data FROM sd_loras ORDER BY name').all();
  return J({ loras: (r.results || []).map((x) => { try { return JSON.parse(x.data); } catch { return null; } }).filter(Boolean) });
}

// Воркер надсилає повний список LoRA з папки Forge; відсутні на ПК видаляються
async function lorasSync(request, db) {
  const b = await body(request);
  if (!b || !Array.isArray(b.loras) || b.loras.length > 500) return J({ error: 'Некоректний список' }, 400);
  const items = b.loras.filter((l) => l && typeof l.name === 'string' && l.name && l.name.length < 200).map((l) => [l.name, JSON.stringify(l)]).filter((x) => x[1].length < 90000);
  const st = [db.prepare('DELETE FROM sd_loras')].concat(items.map((x) => db.prepare('INSERT OR REPLACE INTO sd_loras (name,data) VALUES (?,?)').bind(x[0], x[1])));
  await db.batch(st);
  return J({ ok: true, count: items.length });
}

// Воркер передає реальний прогрес генерації (0…1) із Forge; зберігається в meta як проміле
async function progress(request, db) {
  const b = await body(request);
  if (!b || !/^[0-9a-f-]{36}$/.test(String(b.id))) return J({ error: 'Некоректний запит' }, 400);
  const v = Math.round(Math.min(1, Math.max(0, Number(b.p) || 0)) * 1000);
  await db.prepare('INSERT INTO meta (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind('p:' + b.id, v).run();
  return J({ ok: true });
}

// Лог генерації: seed, підсумок Forge (infotext) і запит воркера; обмежено за розміром
function safeInfo(i) {
  i = i || {};
  const info = { seed: Number.isFinite(+i.seed) ? +i.seed : -1, infotext: String(i.infotext || '').slice(0, 6000) };
  if (i.request && typeof i.request === 'object') info.request = i.request;
  let json = JSON.stringify(info);
  if (json.length > 20000) { delete info.request; json = JSON.stringify(info); }
  return json;
}
