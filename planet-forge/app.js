// Planet Forge: інтерфейс і 3D-рендер сфери з рівнопроміжної текстури. Генерація й характеристики лежать у planet-core.js (PlanetCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const PC = PlanetCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} },
  };
  const randSeed = () => Math.random().toString(36).slice(2, 8);
  const st = Object.assign(PC.fromKind('earth', randSeed()), { name: '', spin: 40, sun: 35, auto: true }, store.get('state', {}));
  const save = () => store.set('state', st);
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  let tex = null, info = null, spin = st.spin * Math.PI / 180, cloudDrift = 0, stars = [], lastT = 0;
  const cv = $('cv'), ctx = cv.getContext('2d'), view = $('view'), sphere = document.createElement('canvas'), sctx = sphere.getContext('2d');

  /* ---------- вибірка текстури (білінійна, з обгорткою по довготі) ---------- */
  function sample3(t, arr, u, v, out) {
    const W = t.W, H = t.H, x = u * W - .5, y = clamp(v * H - .5, 0, H - 1), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, y1 = Math.min(H - 1, y0 + 1);
    const xa = ((x0 % W) + W) % W, xb = (xa + 1) % W, a = (y0 * W + xa) * 3, b = (y0 * W + xb) * 3, c = (y1 * W + xa) * 3, d = (y1 * W + xb) * 3;
    for (let k = 0; k < 3; k++) out[k] = (arr[a + k] * (1 - fx) + arr[b + k] * fx) * (1 - fy) + (arr[c + k] * (1 - fx) + arr[d + k] * fx) * fy;
  }
  function sample1(t, arr, u, v) {
    const W = t.W, H = t.H, x = u * W - .5, y = clamp(v * H - .5, 0, H - 1), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, y1 = Math.min(H - 1, y0 + 1), xa = ((x0 % W) + W) % W, xb = (xa + 1) % W;
    return (arr[y0 * W + xa] * (1 - fx) + arr[y0 * W + xb] * fx) * (1 - fy) + (arr[y1 * W + xa] * (1 - fx) + arr[y1 * W + xb] * fx) * fy;
  }

  /* ---------- сфера ---------- */
  function renderSphere(S, R) {
    if (sphere.width !== S) { sphere.width = sphere.height = S; }
    const img = sctx.createImageData(S, S), d = img.data, tilt = st.tilt * Math.PI / 180, cT = Math.cos(tilt), sT = Math.sin(tilt), cS = Math.cos(spin), sS = Math.sin(spin);
    const phi = st.sun * Math.PI / 180, Lx = -Math.cos(phi), Ly = .22, Lz = Math.sin(phi), Ll = Math.hypot(Lx, Ly, Lz), lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;
    const hx = lx, hy = ly, hz = lz + 1, hl = Math.hypot(hx, hy, hz), atmo = st.atmo, ac = PC.atmoColor(st), gas = st.kind === 'gas', col = [0, 0, 0];
    const half = S / 2, halo = (S / 2 - R) / R;
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px + .5 - half) / R, ny = -(py + .5 - half) / R, r2 = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (r2 > 1) {
        const r = Math.sqrt(r2), g = (r - 1) / Math.max(.001, halo);
        if (g < 1 && atmo > 0) { const dir = (nx * lx + ny * ly) / r, lit = smooth(-.55, .55, dir + .15), a = Math.pow(1 - g, 2.4) * atmo * lit * .85; d[o] = ac[0]; d[o + 1] = ac[1]; d[o + 2] = ac[2]; d[o + 3] = a * 255; }
        continue;
      }
      const nz = Math.sqrt(1 - r2), tx = nx * cT - ny * sT, ty = nx * sT + ny * cT, sx = tx * cS + nz * sS, sz = -tx * sS + nz * cS;
      const lat = Math.asin(clamp(ty, -1, 1)), lon = Math.atan2(sz, sx), u = (lon + Math.PI) / (2 * Math.PI), v = .5 - lat / Math.PI;
      sample3(tex, tex.rgb, u, v, col);
      const diff = nx * lx + ny * ly + nz * lz, shade = .05 + .95 * smooth(-.06, .3, diff) * (.55 + .45 * clamp(diff, 0, 1) * 1.2);
      let r = col[0] * shade, g = col[1] * shade, b = col[2] * shade;
      if (!gas && tex.biome[(clamp(Math.round(v * tex.H - .5), 0, tex.H - 1)) * tex.W + (((Math.round(u * tex.W - .5)) % tex.W) + tex.W) % tex.W] <= 1 && st.kind !== 'lava') { const sp = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 48) * .65 * smooth(0, .3, diff); r += 255 * sp; g += 255 * sp; b += 255 * sp; }
      if (st.kind === 'lava') { const bl = (col[0] > 200) ? 1 : 0; if (bl) { r = Math.max(r, col[0] * .75); g = Math.max(g, col[1] * .7); b = Math.max(b, col[2] * .5); } }
      let cl = 0;
      if (st.cloud > 0 && !gas) { cl = sample1(tex, tex.cloud, (u + cloudDrift) % 1, v) / 255 * .92; if (cl > 0) { const cs = .06 + 1.05 * shade; r = r * (1 - cl) + 238 * cs * cl; g = g * (1 - cl) + 240 * cs * cl; b = b * (1 - cl) + 246 * cs * cl; } }
      if (st.lights > 0 && !gas) { const li = sample1(tex, tex.light, u, v) / 255 * smooth(.12, -.08, diff) * (1 - cl * .8); if (li > 0) { r += 255 * li * .95; g += 200 * li * .9; b += 110 * li * .8; } }
      const rim = Math.pow(1 - nz, 2.6) * atmo * (.18 + .82 * smooth(-.35, .45, diff)) * 1.05;
      r += ac[0] * rim; g += ac[1] * rim; b += ac[2] * rim;
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
  }

  /* ---------- сцена: зорі, кільця, супутники, планета ---------- */
  function makeStars() { const R = PC.rngFromSeed('stars:' + st.seed); stars = Array.from({ length: 170 }, () => ({ x: R(), y: R(), r: .3 + R() * 1.1, a: .25 + R() * .75 })); }
  function draw() {
    if (!tex) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = view.clientWidth, h = view.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#05060d'; ctx.fillRect(0, 0, w, h);
    for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillStyle = '#fff'; ctx.fillRect(s.x * w, s.y * h, s.r, s.r); } ctx.globalAlpha = 1;
    const cx = w / 2, cy = h / 2 - 10, Rp = Math.min(w, h) * (st.ring ? .26 : .33), tilt = st.tilt * Math.PI / 180, k = .24;
    const phi = st.sun * Math.PI / 180, lx = -Math.cos(phi), lz = Math.sin(phi);
    const moons = info.moons;
    const drawMoon = m => {
      const a = m.phase, x = Math.cos(a) * m.dist * Rp, y = Math.sin(a) * m.dist * Rp * k, r = m.size * Rp;
      const g = ctx.createRadialGradient(x + lx * r * .5, y - r * .2, r * .1, x, y, r); const c = m.shade; g.addColorStop(0, `rgb(${c},${c - 6},${c - 14})`); g.addColorStop(1, `rgb(${c * .25 | 0},${c * .25 | 0},${c * .28 | 0})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    for (const m of moons) if (Math.sin(m.phase) < 0) drawMoon(m);
    const ring = (from, to) => {
      const R = PC.rngFromSeed('ring:' + st.seed);
      for (let i = 0; i < 46; i++) { const rr = 1.38 + i * .02, a = (R() < .18 ? .02 : .1 + R() * .3) * (i > 18 && i < 22 ? .15 : 1), col = i % 5 === 0 ? '230,215,190' : '200,180,150'; ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = Rp * .022; ctx.beginPath(); ctx.ellipse(0, 0, rr * Rp * 1.45, rr * Rp * 1.45 * k, 0, from, to); ctx.stroke(); }
    };
    if (st.ring) ring(Math.PI, Math.PI * 2);
    ctx.restore();
    const S = Math.round(Rp * 2 * 1.12) ; renderSphere(S, Rp); ctx.drawImage(sphere, cx - S / 2, cy - S / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); if (st.ring) ring(0, Math.PI);
    for (const m of moons) if (Math.sin(m.phase) >= 0) drawMoon(m);
    ctx.restore();
  }

  /* ---------- генерація текстури: швидка чернетка, потім повна ---------- */
  let genTimer = 0, fullTimer = 0;
  const genParams = () => Object.assign({}, st);
  function generate(W, H) { tex = PC.generateTexture(genParams(), W, H); info = PC.describe(genParams(), tex); }
  function regenerate() {
    clearTimeout(genTimer); clearTimeout(fullTimer); makeStars();
    genTimer = setTimeout(() => { generate(256, 128); renderCard(); draw(); }, 0);
    fullTimer = setTimeout(() => { generate(640, 320); renderCard(); draw(); }, 350);
  }

  /* ---------- паспорт ---------- */
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (v != null) e.setAttribute(k, v); } e.append(...kids.flat().filter(x => x != null)); return e; };
  const f1 = v => String(Math.round(v * 10) / 10), pct = v => Math.round(v * 100) + '%';
  function renderCard() {
    const c = $('card'), i = info; c.replaceChildren();
    const habCol = i.habitability >= 70 ? '#7bd88f' : i.habitability >= 40 ? '#e8c35a' : i.habitability >= 12 ? '#e8924a' : '#e86a6a';
    const palette = ['#5cb8e6', '#8fd6a0', '#e8c35a', '#e079a8', '#b39ddb', '#e8924a', '#6fc3c0', '#c9a766'];
    c.append(el('div', { class: 'p-head' }, el('h3', {}, i.name), el('span', { class: 'des' }, i.designation), el('span', { class: 'kind' }, i.kindName)),
      el('div', { class: 'p-grid' }, [['Радіус', i.radiusKm.toLocaleString('uk') + ' км'], ['Гравітація', f1(i.gravity) + ' g'], ['Доба', f1(i.dayH) + ' год'], ['Рік', i.yearD + ' діб'], ['Температура', (i.tempC > 0 ? '+' : '') + i.tempC + ' °C'], ['Тиск', f1(i.pressure) + ' атм'], ['Вода', pct(i.water)], ['Супутники', i.moons.length]].map(([l, v]) => el('div', { class: 'stat' }, el('b', {}, v), el('span', {}, l)))),
      el('div', { class: 'p-cols' },
        el('div', {}, el('h4', {}, 'Придатність для життя'), el('div', { class: 'hab' }, el('div', { class: 'meter' }, el('i', { style: `width:${i.habitability}%;background:${habCol}` })), el('div', {}, el('b', { style: `color:${habCol}` }, i.habitability + '%'), el('small', {}, i.habLabel))),
          el('h4', { style: 'margin-top:16px' }, 'Ресурси'), el('div', { class: 'res' }, i.resources.map(r => el('div', {}, el('span', {}, r.name), el('span', { class: 'st' }, '★'.repeat(r.rich) + '☆'.repeat(5 - r.rich)))))),
        el('div', { class: 'bars' }, el('h4', {}, 'Атмосфера'), i.atmosphere.map(([n, v], k) => el('div', { class: 'row' }, el('span', {}, n), el('div', { class: 'b' }, el('i', { style: `width:${Math.min(100, v)}%;background:${palette[k % palette.length]}` })), el('span', {}, v + '%')))),
        el('div', { class: 'bars' }, el('h4', {}, 'Поверхня'), i.biomes.slice(0, 7).map(b => el('div', { class: 'row' }, el('span', {}, b.name), el('div', { class: 'b' }, el('i', { style: `width:${b.share * 100}%;background:rgb(${PC.BIOMES[b.id].c.join(',')})` })), el('span', {}, pct(b.share)))))));
  }

  /* ---------- керування ---------- */
  const SL = [['rSea', 'oSea', 'sea', 100, v => v + '%'], ['rScale', 'oScale', 'scale', 10, v => (v / 10).toFixed(1)], ['rMount', 'oMount', 'mount', 100, v => v + '%'], ['rTemp', 'oTemp', 'temp', 100, v => (v > 0 ? '+' : '') + v], ['rHumid', 'oHumid', 'humid', 100, v => v + '%'],
    ['rCaps', 'oCaps', 'caps', 100, v => v + '%'], ['rAtmo', 'oAtmo', 'atmo', 100, v => v + '%'], ['rCloud', 'oCloud', 'cloud', 100, v => v + '%'], ['rLights', 'oLights', 'lights', 100, v => v + '%'], ['rTilt', 'oTilt', 'tilt', 1, v => v + '°'], ['rMoons', 'oMoons', 'moons', 1, v => v]];
  function sync() {
    for (const [r, o, key, mul, fmt] of SL) { const v = Math.round(st[key] * mul); $(r).value = v; $(o).textContent = fmt(v); }
    $('tSeed').value = st.seed; $('tName').value = st.name || ''; $('cRing').checked = !!st.ring; $('cSpin').checked = st.auto; $('rSpin').value = Math.round(((spin * 180 / Math.PI) % 360 + 360) % 360); $('rSun').value = st.sun;
    document.querySelectorAll('.kinds button').forEach(b => b.classList.toggle('on', b.dataset.kind === st.kind));
  }
  for (const [r, , key, mul] of SL) $(r).addEventListener('input', e => { st[key] = +e.target.value / mul; save(); sync(); regenerate(); });
  $('cRing').onchange = e => { st.ring = e.target.checked; save(); draw(); };
  $('cSpin').onchange = e => { st.auto = e.target.checked; save(); };
  $('rSpin').oninput = e => { spin = +e.target.value * Math.PI / 180; draw(); };
  $('rSun').oninput = e => { st.sun = +e.target.value; save(); draw(); };
  $('tSeed').onchange = e => { st.seed = e.target.value.trim() || randSeed(); save(); sync(); regenerate(); };
  $('tName').oninput = e => { st.name = e.target.value.trim(); save(); if (info) { info.name = st.name || PC.planetName(st.seed); renderCard(); } };
  const kb = $('kinds');
  for (const [k, v] of Object.entries(PC.KINDS)) { const b = document.createElement('button'); b.type = 'button'; b.dataset.kind = k; b.textContent = v.name; b.onclick = () => { Object.assign(st, PC.fromKind(k, st.seed), { name: st.name, spin: st.spin, sun: st.sun, auto: st.auto }); save(); sync(); regenerate(); }; kb.append(b); }
  $('btnNew').onclick = () => { st.seed = randSeed(); save(); sync(); regenerate(); };
  $('btnSurprise').onclick = () => {
    const kinds = Object.keys(PC.KINDS), k = kinds[Math.floor(Math.random() * kinds.length)], rnd = (a, b) => a + Math.random() * (b - a);
    Object.assign(st, PC.fromKind(k, randSeed()), { name: '', spin: st.spin, sun: st.sun, auto: st.auto });
    if (k !== 'gas' && k !== 'lava') { st.sea = rnd(.15, .9); st.temp = rnd(-.8, .8); st.humid = rnd(.1, .95); st.mount = rnd(.2, .9); st.scale = rnd(.7, 3.2); st.caps = rnd(0, 1); }
    st.cloud = rnd(0, .9); st.atmo = rnd(.2, 1); st.tilt = Math.round(rnd(0, 45)); st.moons = Math.floor(rnd(0, 4.99)); st.ring = k === 'gas' || Math.random() < .18; st.lights = k === 'earth' || k === 'desert' ? rnd(0, .9) : 0;
    save(); sync(); regenerate();
  };
  addEventListener('keydown', e => { if (e.code === 'Space' && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) { e.preventDefault(); $('btnNew').click(); } });
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, spin }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) { spin = drag.spin - (e.clientX - drag.x) * .008; draw(); } });
  cv.addEventListener('pointerup', () => { drag = null; });

  /* ---------- експорт ---------- */
  $('btnPng').onclick = () => cv.toBlob(b => { download(b, `planet-${st.seed}.png`); toast('Збережено картинку'); });
  function exportTexture(kind) {
    const W = +$('selMap').value, H = W / 2; toast('Готуємо карту…', 20000);
    setTimeout(() => {
      const t = PC.generateTexture(genParams(), W, H), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
      if (kind === 'map') for (let i = 0; i < W * H; i++) { im.data[i * 4] = t.rgb[i * 3]; im.data[i * 4 + 1] = t.rgb[i * 3 + 1]; im.data[i * 4 + 2] = t.rgb[i * 3 + 2]; im.data[i * 4 + 3] = 255; }
      else { let lo = Infinity, hi = -Infinity; for (const v of t.height) { if (v < lo) lo = v; if (v > hi) hi = v; } for (let i = 0; i < W * H; i++) { const v = hi > lo ? (t.height[i] - lo) / (hi - lo) * 255 : 0; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } }
      g.putImageData(im, 0, 0); c.toBlob(b => { download(b, `planet-${st.seed}-${kind}-${W}.png`); toast('Збережено'); });
    }, 30);
  }
  $('btnMap').onclick = () => exportTexture('map'); $('btnHeight').onclick = () => exportTexture('height');
  $('btnJson').onclick = () => { if (!info) return; download(new Blob([JSON.stringify({ params: genParams(), passport: info }, null, 2)], { type: 'application/json' }), `planet-${st.seed}.json`); toast('Збережено паспорт'); };

  /* ---------- цикл анімації ---------- */
  function frame(t) {
    const dt = Math.min(.1, (t - lastT) / 1000 || 0); lastT = t;
    if (st.auto && tex && !drag && !document.hidden) { spin += dt * .35; cloudDrift = (cloudDrift + dt * .004) % 1; for (const m of info.moons) m.phase += dt * .35 * m.speed; draw(); }
    requestAnimationFrame(frame);
  }
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(view);
  sync(); regenerate(); requestAnimationFrame(frame);
})();
