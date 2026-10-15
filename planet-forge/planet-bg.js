/* Planet Forge: фони за планетою. Типи: зоряне небо, політ крізь зорі, туманність, галактика, глибока порожнеча. У кожного свої ручки.
   Дані й випадковість без DOM (браузер: PlanetBg, Node: module.exports); малює draw() на canvas 2D. */
const PlanetBg = (() => {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const K = {
    hue: { k: 'bgHue', l: 'Відтінок фону', min: 0, max: 1, def: .6, f: 'pct', tip: 'Основний колір фону: від синього до багряного й зеленого' },
    dens: { k: 'bgDens', l: 'Густота', min: .1, max: 1, def: .55, f: 'pct', tip: 'Скільки зір або наскільки густий туман' },
    move: { k: 'bgMove', l: 'Рух', min: 0, max: 1, def: .4, f: 'pct', tip: 'Швидкість руху фону; 0 робить його нерухомим' },
    arms: { k: 'bgArms', l: 'Рукави галактики', min: 2, max: 6, def: 3, f: 'int', tip: 'Скільки спіральних рукавів у галактики' },
    glow: { k: 'bgGlow', l: 'Яскравість', min: .1, max: 1, def: .6, f: 'pct', tip: 'Яскравість туману, ядра галактики чи зір' },
  };
  const TYPES = {
    stars: { name: 'Зоряне небо', tip: 'Нерухомі зорі, що мерехтять', knobs: ['hue', 'dens', 'move'] },
    drift: { name: 'Політ крізь зорі', tip: 'Зорі пропливають повз, ніби корабель летить крізь космос', knobs: ['hue', 'dens', 'move'] },
    nebula: { name: 'Туманність', tip: 'Кольорові хмари газу на тлі зір', knobs: ['hue', 'dens', 'glow', 'move'] },
    galaxy: { name: 'Галактика', tip: 'Велика спіральна галактика, що повільно обертається', knobs: ['hue', 'arms', 'glow', 'move'] },
    deep: { name: 'Глибока порожнеча', tip: 'Майже чорний простір з рідкісними далекими зорями', knobs: ['hue', 'dens'] },
  };
  const ORDER = Object.keys(TYPES), ALL = Object.values(K);
  const defaults = () => Object.assign({ bg: 'stars' }, ...ALL.map(o => ({ [o.k]: o.def })));
  const fixOne = (o, v) => { v = clamp(Number.isFinite(+v) ? +v : o.def, o.min, o.max); return o.f === 'int' ? Math.round(v) : v; };
  /* Привести фон до допустимих значень */
  function clampBg(p) { const out = {}; out.bg = TYPES[p && p.bg] ? p.bg : 'stars'; for (const o of ALL) out[o.k] = fixOne(o, p ? p[o.k] : undefined); return out; }
  /* Випадковий фон; замкнений (locked) не змінюється */
  function randomBg(prev, locked, rnd = Math.random) {
    if (locked) return clampBg(prev);
    const out = { bg: ORDER[Math.floor(rnd() * ORDER.length)] };
    for (const o of ALL) out[o.k] = fixOne(o, o.f === 'int' ? o.min + Math.floor(rnd() * (o.max - o.min + 1)) : o.min + (o.max - o.min) * rnd());
    return out;
  }
  const knobsOf = type => (TYPES[type] || TYPES.stars).knobs.map(n => K[n]);

  /* ---------- малювання ---------- */
  function rng(seed) { let a = 0; for (const ch of String(seed)) a = Math.imul(a ^ ch.charCodeAt(0), 2654435761) >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hsl = (h, s, l, a = 1) => `hsla(${Math.round(((h % 1) + 1) % 1 * 360)},${Math.round(s * 100)}%,${Math.round(l * 100)}%,${a})`;
  let cache = { key: '', stars: [], layer: null };
  function build(bg, seed, w, h) {
    const key = [bg.bg, seed, bg.bgHue, bg.bgDens, bg.bgGlow, bg.bgArms, Math.round(w), Math.round(h)].join('|');
    if (cache.key === key) return cache;
    const R = rng('bg:' + seed + bg.bg), t = bg.bg, n = Math.round((t === 'deep' ? 40 : t === 'nebula' ? 120 : 160) + bg.bgDens * (t === 'deep' ? 120 : 420));
    const stars = Array.from({ length: n }, () => ({ x: R(), y: R(), z: .15 + R() * .85, r: .3 + R() * 1.1, a: .25 + R() * .75, p: R() * 6.28, h: R() }));
    let layer = null;
    if ((t === 'nebula' || t === 'galaxy') && typeof document !== 'undefined') {
      layer = document.createElement('canvas'); layer.width = Math.max(2, Math.round(w)); layer.height = Math.max(2, Math.round(h)); const g = layer.getContext('2d'), hue = bg.bgHue;
      if (t === 'nebula') {
        g.globalCompositeOperation = 'lighter'; const blobs = 5 + Math.round(bg.bgDens * 14);
        for (let i = 0; i < blobs; i++) { const x0 = R() * w, y = R() * h, r = (.18 + R() * .35) * Math.max(w, h), c = hsl(hue + (R() - .5) * .22, .75, .5, (.05 + R() * .1) * (.4 + bg.bgGlow)); for (const off of [-w, 0, w]) { const x = x0 + off, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, hsl(hue, .7, .4, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } } // копії по краях: шар безшовно повторюється при русі
      } else {
        const cx = w / 2, cy = h / 2, S = Math.max(w, h) * .62, arms = bg.bgArms; g.translate(cx, cy); g.scale(1, .5); g.globalCompositeOperation = 'lighter';
        const core = g.createRadialGradient(0, 0, 0, 0, 0, S * .35); core.addColorStop(0, hsl(hue, .5, .85, .55 * bg.bgGlow + .2)); core.addColorStop(1, hsl(hue, .6, .4, 0)); g.fillStyle = core; g.fillRect(-S, -S, S * 2, S * 2);
        for (let i = 0; i < 2600; i++) { const rr = Math.pow(R(), .7) * S, a = R() * 6.2832, arm = Math.floor(R() * arms), th = arm / arms * 6.2832 + rr / S * 3.4 + (R() - .5) * (.6 - rr / S * .3), x = Math.cos(th) * rr + (R() - .5) * 14, y = Math.sin(th) * rr + (R() - .5) * 14; g.fillStyle = hsl(hue + (R() - .5) * .12, .6, .6 + R() * .3, (.1 + R() * .35) * (.4 + bg.bgGlow)); g.fillRect(x, y, 1.6, 1.6); void a; }
      }
    }
    return cache = { key, stars, layer };
  }
  /* t — секунди; малює фон на всю область w×h */
  function draw(ctx, w, h, bg, seed, t = 0) {
    const c = build(bg, seed, w, h), type = bg.bg, hue = bg.bgHue, sp = bg.bgMove;
    const base = ctx.createLinearGradient(0, 0, 0, h); base.addColorStop(0, hsl(hue, .5, type === 'deep' ? .015 : .03)); base.addColorStop(1, hsl(hue + .08, .5, type === 'deep' ? .01 : .02)); ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    if (c.layer) {
      if (type === 'galaxy') { ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-.35 + t * sp * .02); ctx.drawImage(c.layer, -w / 2, -h / 2); ctx.restore(); }
      else { const dx = (t * sp * 6) % w; ctx.drawImage(c.layer, -dx, 0, w, h); ctx.drawImage(c.layer, w - dx, 0, w, h); }
    }
    for (const s of c.stars) {
      let x = s.x * w, y = s.y * h, a = s.a;
      if (type === 'drift') { const f = ((s.z + t * sp * .18) % 1), vx = s.x - .5, vy = s.y - .5, k = .15 + f * 1.6; x = (.5 + vx * k) * w; y = (.5 + vy * k) * h; a *= Math.min(1, f * 3); if (x < 0 || y < 0 || x > w || y > h) continue; }
      else if (type !== 'deep') a *= .65 + .35 * Math.sin(t * (1 + s.z * 2) + s.p);
      ctx.globalAlpha = clamp(a, 0, 1); ctx.fillStyle = s.h < .2 ? hsl(hue, .6, .85) : s.h < .3 ? '#ffe9c4' : '#fff'; ctx.fillRect(x, y, s.r * (type === 'drift' ? .7 + s.z : 1), s.r * (type === 'drift' ? .7 + s.z : 1));
    }
    ctx.globalAlpha = 1;
  }
  const animated = bg => bg.bg !== "deep";
  return { TYPES, ORDER, KNOBS: K, defaults, clampBg, randomBg, knobsOf, draw, animated };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetBg;
