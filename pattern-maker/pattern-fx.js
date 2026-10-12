/* Pattern Maker: ефекти кінцевого результату. Без DOM: працює і в браузері (глобал PMFx), і в Node (module.exports).

   Усі ефекти застосовуються до ГОТОВОГО зображення (вимощеного полотна), а не до текстури-джерела.
   Тому піксель-арт видно за будь-якого масштабу візерунка: «піксель» = блок B×B пікселів кінцевого зображення.

   Конвеєр: хвиля → зменшення блоками (піксель-арт) → колір → дізерінг/палітра → збільшення → сканлінії → зерно.
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

  const DEFAULT_FX = { px: 1, pal: 'none', dith: 0, post: 0, hue: 0, sat: 100, bri: 0, con: 100, inv: false, grain: 0, scan: 0, wave: 0, waveL: 60, ang: 0 };

  const hasColor = fx => fx.hue !== 0 || fx.sat !== 100 || fx.bri !== 0 || fx.con !== 100 || !!fx.inv;
  const hasQuant = fx => fx.post >= 2 || (fx.pal !== 'none' && !!PALETTES[fx.pal]) || fx.dith > 0;
  // колірні ефекти не змінюють геометрію: їх можна застосовувати й до тайла без втрати безшовності
  const hasColorOnly = fx => hasColor(fx) || hasQuant(fx);
  const hasSpatial = fx => fx.px > 1 || fx.wave > 0 || fx.scan > 0 || fx.grain > 0;
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

  /* ---------- повний конвеєр ----------
     scale = розмір одного CSS-пікселя в пікселях полотна (devicePixelRatio для превʼю, 1 для експорту);
     colorOnly = лише колірні ефекти (для тайла: геометрію не чіпаємо). */
  function process(img, fx, scale = 1, colorOnly = false) {
    let work = clone(img);
    if (!colorOnly && fx.wave > 0) work = wave(work, fx.wave * .4 * scale, Math.max(4, fx.waveL * scale));
    const B = colorOnly ? 1 : Math.max(1, Math.round(fx.px * scale));
    let low = B > 1 ? boxDown(work, B) : work;
    if (hasColor(fx)) colorAdjust(low, fx);
    if (hasQuant(fx)) quantize(low, fx);
    let out = B > 1 ? upNearest(low, B, img.width, img.height) : low;
    if (!colorOnly && fx.scan > 0) scanlines(out, fx.scan, Math.max(2, Math.round(3 * scale)));
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

  return { PALETTES, DEFAULT_FX, active, hasColorOnly, hasSpatial, process, boxDown, upNearest, colorAdjust, quantize, wave, rosette };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PMFx;
