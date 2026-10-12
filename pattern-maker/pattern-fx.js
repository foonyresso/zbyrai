/* Pattern Maker: ефекти кінцевого результату. Без DOM: працює і в браузері (глобал PMFx), і в Node (module.exports).

   Усі ефекти застосовуються до ГОТОВОГО зображення (вимощеного полотна), а не до текстури-джерела.
   Тому піксель-арт видно за будь-якого масштабу візерунка: «піксель» = блок B×B пікселів кінцевого зображення.

   Конвеєр: хвиля → лінза/вир → аберація → рельєф → зменшення блоками (піксель-арт) → колір → градієнт-мапа → дізерінг/палітра → збільшення → сканлінії → віньєтка → зерно.
   Зображення = { data: Uint8ClampedArray (RGBA), width, height }. */
const PMFx = (() => {
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const P = (name, list) => ({ name, rgb: list.map(hex) });
  const PALETTES = {
    mono: P('Монохром', ['#000000', '#ffffff']),
    gameboy: P('Game Boy', ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']),
    cga: P('CGA', ['#000000', '#55ffff', '#ff55ff', '#ffffff']),
    sepia: P('Сепія', ['#2b1d0e', '#5c4326', '#9a7b4f', '#d4b483', '#f3e6c8']),
    neon: P('Неон', ['#0b0b1a', '#2d1b69', '#ff2a6d', '#05d9e8', '#d1f7ff', '#ffcb05']),
    gold: P('Обсидіан і золото', ['#09090c', '#1a1a21', '#2a2a34', '#8c7240', '#c9a766', '#e8d29e', '#ece8df']),
    pico8: P('PICO-8', ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']),
  };

  // градієнт-мапи: яскравість пікселя вибирає колір уздовж градієнта (стопи рівномірно від темного до світлого)
  const G = (name, list) => ({ name, rgb: list.map(hex) });
  const GRADS = {
    fire: G('Вогонь', ['#000000', '#5a0a0a', '#d8431a', '#ffb81c', '#fff7d6']),
    ocean: G('Океан', ['#02061a', '#0b2a63', '#1f7a9c', '#8fe3d6', '#f0fffb']),
    forest: G('Ліс', ['#06120a', '#143d22', '#3f7a2f', '#b5c95a', '#f3f0c4']),
    dusk: G('Сутінки', ['#0d0221', '#4b1d6b', '#c2417a', '#ff9b62', '#ffeab0']),
    ice: G('Лід', ['#050b1c', '#1c3a73', '#5f9be0', '#c4e4ff', '#ffffff']),
    goldg: G('Золото', ['#09090c', '#2a2a34', '#8c7240', '#e8d29e', '#fffaf0']),
  };

  const DEFAULT_FX = { px: 1, pal: 'none', dith: 0, post: 0, hue: 0, sat: 100, bri: 0, con: 100, inv: false, grain: 0, scan: 0, wave: 0, waveL: 60, ang: 0,
    lens: 0, swirl: 0, ca: 0, relief: 0, edge: 0, gmap: 'none', vig: 0, pgrid: 'sq' };

  const hasGmap = fx => fx.gmap !== 'none' && !!GRADS[fx.gmap];
  const hasColor = fx => fx.hue !== 0 || fx.sat !== 100 || fx.bri !== 0 || fx.con !== 100 || !!fx.inv || hasGmap(fx);
  const hasQuant = fx => fx.post >= 2 || (fx.pal !== 'none' && !!PALETTES[fx.pal]) || fx.dith > 0;
  // колірні ефекти не змінюють геометрію: їх можна застосовувати й до тайла без втрати безшовності
  const hasColorOnly = fx => hasColor(fx) || hasQuant(fx);
  const hasSpatial = fx => fx.px > 1 || fx.wave > 0 || fx.scan > 0 || fx.grain > 0 || fx.lens !== 0 || fx.swirl !== 0 || fx.ca > 0 || fx.relief > 0 || fx.edge > 0 || fx.vig > 0;
  const active = fx => hasColorOnly(fx) || hasSpatial(fx);

  const clone = img => ({ data: new Uint8ClampedArray(img.data), width: img.width, height: img.height });

  /* ---------- піксель-арт: усереднення блоками й збільшення «найближчим» ---------- */
  function boxDown(img, B) {
    const W = img.width, H = img.height, lw = Math.ceil(W / B), lh = Math.ceil(H / B);
    const out = new Uint8ClampedArray(lw * lh * 4), s = img.data;
    for (let by = 0; by < lh; by++) for (let bx = 0; bx < lw; bx++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const x1 = Math.min(W, (bx + 1) * B), y1 = Math.min(H, (by + 1) * B);
      for (let y = by * B; y < y1; y++) for (let x = bx * B; x < x1; x++) { const i = (y * W + x) * 4; r += s[i]; g += s[i + 1]; b += s[i + 2]; a += s[i + 3]; n++; }
      const o = (by * lw + bx) * 4; out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
    return { data: out, width: lw, height: lh };
  }
  function upNearest(low, B, W, H) {
    const out = new Uint8ClampedArray(W * H * 4), s = low.data, lw = low.width;
    for (let y = 0; y < H; y++) {
      const row = Math.floor(y / B) * lw;
      for (let x = 0; x < W; x++) { const i = (row + Math.floor(x / B)) * 4, o = (y * W + x) * 4; out[o] = s[i]; out[o + 1] = s[i + 1]; out[o + 2] = s[i + 2]; out[o + 3] = s[i + 3]; }
    }
    return { data: out, width: W, height: H };
  }

  /* ---------- колір: відтінок, насиченість, яскравість, контраст, інверсія (на місці) ---------- */
  function colorAdjust(img, fx) {
    const d = img.data, a = fx.hue * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), sat = fx.sat / 100, bri = fx.bri * 2.55, con = fx.con / 100;
    const m = [.213 + c * .787 - s * .213, .715 - c * .715 - s * .715, .072 - c * .072 + s * .928,
      .213 - c * .213 + s * .143, .715 + c * .285 + s * .140, .072 - c * .072 - s * .283,
      .213 - c * .213 - s * .787, .715 - c * .715 + s * .715, .072 + c * .928 + s * .072];
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      if (fx.hue !== 0) { const R = m[0] * r + m[1] * g + m[2] * b, G = m[3] * r + m[4] * g + m[5] * b, B = m[6] * r + m[7] * g + m[8] * b; r = R; g = G; b = B; }
      if (fx.sat !== 100) { const l = .2126 * r + .7152 * g + .0722 * b; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; }
      if (fx.con !== 100) { r = (r - 128) * con + 128; g = (g - 128) * con + 128; b = (b - 128) * con + 128; }
      r += bri; g += bri; b += bri;
      if (fx.inv) { r = 255 - Math.min(255, Math.max(0, r)); g = 255 - Math.min(255, Math.max(0, g)); b = 255 - Math.min(255, Math.max(0, b)); }
      d[i] = r; d[i + 1] = g; d[i + 2] = b; // Uint8ClampedArray обрізає до 0..255
    }
  }

  /* ---------- постеризація, палітра, впорядкований дізерінг Bayer 4×4 (на місці) ---------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function quantize(img, fx) {
    const d = img.data, W = img.width, pal = fx.pal !== 'none' && PALETTES[fx.pal] ? PALETTES[fx.pal].rgb : null;
    const levels = fx.post >= 2 ? fx.post : (pal ? 0 : 4); // дізерінг без палітри й постеризації працює як 4 рівні
    const step = pal ? (pal.length > 8 ? 70 : 110) : 255 / (levels - 1), amount = fx.dith / 100;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const x = p % W, y = (p - x) / W;
      const off = amount > 0 ? ((BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16 - .5) * amount * step : 0;
      let r = d[i] + off, g = d[i + 1] + off, b = d[i + 2] + off;
      if (pal) {
        let best = 0, bd = Infinity;
        for (let k = 0; k < pal.length; k++) { const q = pal[k], dr = r - q[0], dg = g - q[1], db = b - q[2], dist = dr * dr + dg * dg + db * db; if (dist < bd) { bd = dist; best = k; } }
        r = pal[best][0]; g = pal[best][1]; b = pal[best][2];
      } else if (levels >= 2) {
        r = Math.round(Math.min(255, Math.max(0, r)) / step) * step; g = Math.round(Math.min(255, Math.max(0, g)) / step) * step; b = Math.round(Math.min(255, Math.max(0, b)) / step) * step;
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
  }

  /* ---------- хвиля: зсув по синусоїді в обох напрямках ---------- */
  function wave(img, amp, len) {
    const W = img.width, H = img.height, s = img.data, out = new Uint8ClampedArray(s.length), k = 2 * Math.PI / len;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, Math.round(x + amp * Math.sin(y * k)))), sy = Math.min(H - 1, Math.max(0, Math.round(y + amp * Math.sin(x * k))));
      const i = (sy * W + sx) * 4, o = (y * W + x) * 4;
      out[o] = s[i]; out[o + 1] = s[i + 1]; out[o + 2] = s[i + 2]; out[o + 3] = s[i + 3];
    }
    return { data: out, width: W, height: H };
  }

  /* ---------- сканлінії й зерно (на місці) ---------- */
  function scanlines(img, strength, period) {
    const W = img.width, d = img.data, k = 1 - strength / 100 * .6;
    for (let y = 0; y < img.height; y += period) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
  }
  function grain(img, strength, seed = 1) {
    const d = img.data, amp = strength * 1.28;
    let s = (seed >>> 0) || 1;
    for (let i = 0; i < d.length; i += 4) {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; // xorshift32
      const n = ((s & 0xffff) / 65535 - .5) * 2 * amp;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
  }

  /* ---------- піксельна сітка не з квадратів: шестикутники й ромби ----------
     Кожен піксель належить найближчому центру комірки; колір комірки = середнє її пікселів. Розмір комірки B. */
  function cellId(x, y, B, kind) {
    if (kind === 'dia') { const u = Math.floor((x + y) / B), v = Math.floor((x - y) / B); return [u, v]; }
    // шестикутна решітка: рядки висотою .866·B, непарні зсунуті на півкрок; обираємо найближчий із сусідніх центрів
    const h = B * .866, j0 = Math.floor(y / h);
    let best = null, bd = Infinity;
    for (let j = j0 - 1; j <= j0 + 1; j++) {
      const sh = (j & 1) ? .5 : 0, i0 = Math.floor(x / B - sh);
      for (let i = i0 - 1; i <= i0 + 1; i++) {
        const dx = x - (i + sh + .5) * B, dy = y - (j + .5) * h, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = [i, j]; }
      }
    }
    return best;
  }
  function cellPixelate(img, B, kind) {
    const W = img.width, H = img.height, s = img.data, out = new Uint8ClampedArray(s.length), acc = new Map(), ids = new Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const id = cellId(x + .5, y + .5, B, kind), key = id[0] * 100003 + id[1], p = y * W + x, i = p * 4;
      ids[p] = key;
      let a = acc.get(key); if (!a) { a = [0, 0, 0, 0, 0]; acc.set(key, a); }
      a[0] += s[i]; a[1] += s[i + 1]; a[2] += s[i + 2]; a[3] += s[i + 3]; a[4]++;
    }
    for (let p = 0; p < W * H; p++) { const a = acc.get(ids[p]), i = p * 4; out[i] = a[0] / a[4]; out[i + 1] = a[1] / a[4]; out[i + 2] = a[2] / a[4]; out[i + 3] = a[3] / a[4]; }
    return { data: out, width: W, height: H };
  }

  /* ---------- лінза й вир: радіальне спотворення навколо центру (на місці не можна: повертає нове) ----------
     lens > 0: опуклість (центр збільшується), lens < 0: увігнутість; swirl: закручування, градуси на край. Центр і краї лишаються на місці. */
  function lensWarp(img, lens, swirl) {
    const W = img.width, H = img.height, s = img.data, out = new Uint8ClampedArray(s.length), R = Math.min(W, H) / 2, cx = W / 2, cy = H / 2;
    const L = lens / 100, sw = swirl * Math.PI / 180;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x + .5 - cx, dy = y + .5 - cy, r = Math.hypot(dx, dy), o = (y * W + x) * 4;
      let sx = x, sy = y;
      if (r < R) {
        const t = r / R, f = 1 - t; // вплив затухає до нуля на краю кола
        const rr = r * (1 - L * f * f * .7); // джерело ближче до центру → збільшення
        const a = Math.atan2(dy, dx) + sw * f * f;
        sx = cx + rr * Math.cos(a) - .5; sy = cy + rr * Math.sin(a) - .5;
      }
      const xi = Math.min(W - 1, Math.max(0, Math.round(sx))), yi = Math.min(H - 1, Math.max(0, Math.round(sy))), i = (yi * W + xi) * 4;
      out[o] = s[i]; out[o + 1] = s[i + 1]; out[o + 2] = s[i + 2]; out[o + 3] = s[i + 3];
    }
    return { data: out, width: W, height: H };
  }

  /* ---------- хроматична аберація: червоний і синій канали зсунуті в протилежні боки ---------- */
  function chromatic(img, shift) {
    const W = img.width, H = img.height, s = img.data, out = new Uint8ClampedArray(s.length), k = Math.round(shift);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4, xr = Math.min(W - 1, Math.max(0, x - k)), xb = Math.min(W - 1, Math.max(0, x + k));
      out[o] = s[(y * W + xr) * 4]; out[o + 1] = s[o + 1]; out[o + 2] = s[(y * W + xb) * 4 + 2]; out[o + 3] = s[o + 3];
    }
    return { data: out, width: W, height: H };
  }

  /* ---------- рельєф і контури (згортка Собеля по яскравості) ----------
     relief: підмішує тиснення з освітленням зліва вгорі; edge: підмішує темні лінії контурів. */
  function relief(img, relAmt, edgeAmt) {
    const W = img.width, H = img.height, s = img.data, out = new Uint8ClampedArray(s.length);
    const lum = new Float32Array(W * H);
    for (let i = 0, p = 0; p < lum.length; i += 4, p++) lum[p] = .2126 * s[i] + .7152 * s[i + 1] + .0722 * s[i + 2];
    const at = (x, y) => lum[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
    const ra = relAmt / 100, ea = edgeAmt / 100;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const gx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const gy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
      const emboss = (-gx - gy) * .35 * ra, mag = Math.min(255, Math.hypot(gx, gy) * .5), line = mag * ea * 1.6;
      const o = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) out[o + c] = s[o + c] + emboss - line;
      out[o + 3] = s[o + 3];
    }
    return { data: out, width: W, height: H };
  }

  /* ---------- градієнт-мапа (на місці) ---------- */
  function gradientMap(img, key) {
    const g = GRADS[key].rgb, d = img.data, n = g.length - 1;
    for (let i = 0; i < d.length; i += 4) {
      const l = (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255 * n, k = Math.min(n - 1, Math.floor(l)), f = l - k, a = g[k], b = g[k + 1];
      d[i] = a[0] + (b[0] - a[0]) * f; d[i + 1] = a[1] + (b[1] - a[1]) * f; d[i + 2] = a[2] + (b[2] - a[2]) * f;
    }
  }

  /* ---------- віньєтка: затемнення до країв (на місці) ---------- */
  function vignette(img, strength) {
    const W = img.width, H = img.height, d = img.data, cx = W / 2, cy = H / 2, maxR = Math.hypot(cx, cy), st = strength / 100;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = Math.hypot(x + .5 - cx, y + .5 - cy) / maxR, k = 1 - st * Math.max(0, (t - .35) / .65) ** 1.6, i = (y * W + x) * 4;
      d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
    }
  }

  /* ---------- повний конвеєр ----------
     scale = розмір одного CSS-пікселя в пікселях полотна (devicePixelRatio для превʼю, 1 для експорту);
     colorOnly = лише колірні ефекти (для тайла: геометрію не чіпаємо). */
  function process(img, fx, scale = 1, colorOnly = false) {
    let work = clone(img);
    if (!colorOnly && fx.wave > 0) work = wave(work, fx.wave * .4 * scale, Math.max(4, fx.waveL * scale));
    if (!colorOnly && (fx.lens !== 0 || fx.swirl !== 0)) work = lensWarp(work, fx.lens, fx.swirl);
    if (!colorOnly && fx.ca > 0) work = chromatic(work, fx.ca * scale);
    if (!colorOnly && (fx.relief > 0 || fx.edge > 0)) work = relief(work, fx.relief, fx.edge);
    const B = colorOnly ? 1 : Math.max(1, Math.round(fx.px * scale));
    const shaped = B > 1 && (fx.pgrid === 'hex' || fx.pgrid === 'dia'); // комірки не квадратні: колір на повному розмірі, без зменшення
    let low = shaped ? cellPixelate(work, B, fx.pgrid) : (B > 1 ? boxDown(work, B) : work);
    if (hasColor(fx)) colorAdjust(low, fx);
    if (hasGmap(fx)) gradientMap(low, fx.gmap);
    if (hasQuant(fx)) quantize(low, fx);
    let out = B > 1 && !shaped ? upNearest(low, B, img.width, img.height) : low;
    if (!colorOnly && fx.scan > 0) scanlines(out, fx.scan, Math.max(2, Math.round(3 * scale)));
    if (!colorOnly && fx.vig > 0) vignette(out, fx.vig);
    if (!colorOnly && fx.grain > 0) grain(out, fx.grain, 12345);
    return out;
  }

  /* ---------- розетка (мандала): N-кратне дзеркальне складання навколо центру ----------
     src = джерело; o = { n, spin (рад), cx, cy (центр у джерелі), R (радіус джерела, що відповідає половині меншої сторони виходу) } */
  function rosette(src, W, H, o) {
    const out = new Uint8ClampedArray(W * H * 4), s = src.data, sw = src.width, sh = src.height;
    const n = Math.max(2, Math.round(o.n)), m = 2 * Math.PI / n, half = Math.min(W, H) / 2, k = o.R / half;
    const refl = (v, size) => { const p = 2 * size; v = ((v % p) + p) % p; return v < size ? v : p - v; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x + .5 - W / 2, dy = y + .5 - H / 2, r = Math.hypot(dx, dy) * k;
      let t = (((Math.atan2(dy, dx) - o.spin) % m) + m) % m;
      if (t > m / 2) t = m - t;
      const px = refl(o.cx + r * Math.cos(t), sw - 1), py = refl(o.cy + r * Math.sin(t), sh - 1);
      const x0 = Math.floor(px), y0 = Math.floor(py), x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1), fx = px - x0, fy = py - y0;
      const a = (y0 * sw + x0) * 4, b = (y0 * sw + x1) * 4, c = (y1 * sw + x0) * 4, e = (y1 * sw + x1) * 4, oo = (y * W + x) * 4;
      for (let ch = 0; ch < 4; ch++) out[oo + ch] = (s[a + ch] * (1 - fx) + s[b + ch] * fx) * (1 - fy) + (s[c + ch] * (1 - fx) + s[e + ch] * fx) * fy;
    }
    return { data: out, width: W, height: H };
  }

  return { PALETTES, GRADS, DEFAULT_FX, active, hasColorOnly, hasSpatial, process, boxDown, upNearest, cellPixelate, cellId, colorAdjust, quantize, wave, rosette, lensWarp, chromatic, relief, gradientMap, vignette };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PMFx;
