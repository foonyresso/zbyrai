// Чиста логіка «Віддаленого SD» (без Cloudflare-API): перевірка кодів, обмеження параметрів. Тести: sd-remote/test/sd-core.test.js
export const LIMITS = { minSide: 256, maxSide: 1536, maxFinal: 2800, maxSteps: 12, maxMask: 700000, maxCfg: 15, maxPrompt: 2000, maxQueuePerUser: 3, keepDays: 7, maxImagesPerUser: 40, jobTimeoutMs: 10 * 60 * 1000, onlineMs: 60 * 1000 };

// ACCESS_CODES = "логін:пароль,логін2:пароль2". Повертає логін або null.
export function userOf(codes, login, pass) {
  login = String(login || '').trim(); pass = String(pass || '');
  if (!login || !pass) return null;
  for (const part of String(codes || '').split(',')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === login && part.slice(i + 1).trim() === pass) return login;
  }
  return null;
}

const num = (v, def, lo, hi) => { v = Number(v); if (!Number.isFinite(v)) v = def; return Math.min(hi, Math.max(lo, v)); };
const str = (v, max) => String(v == null ? '' : v).slice(0, max);

// Перемалювання: посилання на вихідну картинку (srcId на сервері), чорно-біла маска (base64 PNG), денойз 0.05–1, розмір обробки кратний 64
function cleanInpaint(p) {
  const side = (v) => Math.min(1536, Math.max(512, Math.round(num(v, 1024, 512, 1536) / 64) * 64));
  return {
    kind: 'inpaint',
    prompt: str(p.prompt, LIMITS.maxPrompt).trim(), negative: str(p.negative, LIMITS.maxPrompt).trim(),
    steps: p.steps ? Math.round(num(p.steps, 0, 1, LIMITS.maxSteps)) : 0, seed: Math.round(num(p.seed, -1, -1, 4294967295)),
    srcId: /^[0-9a-f-]{36}$/.test(String(p.srcId)) ? String(p.srcId) : '',
    mask: /^[A-Za-z0-9+/=]+$/.test(String(p.mask)) && String(p.mask).length <= LIMITS.maxMask ? String(p.mask) : '',
    denoise: Math.round(num(p.denoise, 0.5, 0.05, 1) * 20) / 20, width: side(p.width), height: side(p.height),
    padding: Math.round(num(p.padding, 64, 0, 256) / 8) * 8, blur: Math.round(num(p.blur, 8, 0, 64)),
  };
}

export function cleanParams(p) {
  p = p || {};
  if (p.kind === 'inpaint') return cleanInpaint(p);
  const snap = (v) => Math.round(num(v, 512, LIMITS.minSide, LIMITS.maxSide) / 8) * 8;
  const width = snap(p.width), height = snap(p.height);
  // апскейл не може дати довгу сторону більшу за maxFinal (крок 0.05)
  const upMax = Math.max(1, Math.floor(LIMITS.maxFinal / Math.max(width, height) * 20) / 20);
  return {
    prompt: str(p.prompt, LIMITS.maxPrompt).trim(),
    negative: str(p.negative, LIMITS.maxPrompt).trim(),
    width, height,
    // 0 = значення за замовчуванням із воркера на ПК (CFG, Shift, семплер там)
    steps: p.steps ? Math.round(num(p.steps, 0, 1, LIMITS.maxSteps)) : 0,
    cfg: p.cfg ? Math.round(num(p.cfg, 0, 1, LIMITS.maxCfg) * 2) / 2 : 0,
    seed: Math.round(num(p.seed, -1, -1, 4294967295)),
    sampler: str(p.sampler, 40).trim(),
    scheduler: str(p.scheduler, 40).trim(),
    upscale: Math.min(upMax, Math.round(num(p.upscale, 1, 1, 2) * 20) / 20),
    adFace: !!p.adFace,
    adPrompt: str(p.adPrompt, 1000).trim(),
    adNeg: str(p.adNeg, 1000).trim(),
  };
}

export const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// --- Акаунти: валідація, хеш пароля (PBKDF2), токени сесій
export const validLogin = (l) => /^[a-z0-9_]{3,20}$/.test(String(l || ''));
export const validPass = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 100;
const hex = (u8) => [...new Uint8Array(u8)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from(h.match(/../g) || [], (x) => parseInt(x, 16));
export const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(16)));
export async function hashPassword(pass, saltHex) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 50000, hash: 'SHA-256' }, key, 256);
  return { salt: hex(salt), hash: hex(bits) };
}
Object.assign(LIMITS, { sessionDays: 30, maxPending: 20, maxFails: 8, lockMs: 15 * 60 * 1000 });
