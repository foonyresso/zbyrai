// Planet Forge: інтерфейс і 3D-рендер сфери з рівнопроміжної текстури. Генерація й характеристики лежать у planet-core.js (PlanetCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const PC = PlanetCore, PB = PlanetBg;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} },
  };
  const randSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  const UI = ['spin', 'sun', 'auto', 'locks', 'bg', ...Object.values(PB.KNOBS).map(o => o.k)];
  let st = Object.assign(PC.fromKind('earth', randSeed()), { spin: 40, sun: 35, auto: true, locks: {} }, PB.defaults());
  { const saved = store.get('state3', null); if (saved && PC.KINDS[saved.kind]) Object.assign(st, saved); st = Object.assign(st, PC.clampParams(st)); Object.assign(st, PB.clampBg(st)); if (!st.locks || typeof st.locks !== 'object') st.locks = {}; if (!st.name) st.name = PC.planetName(st.seed, st.kind); }
  const save = () => store.set('state3', st);
  const keepUI = () => Object.fromEntries(UI.map(k => [k, st[k]]));
  const KD = () => PC.KINDS[st.kind];
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  let tex = null, info = null, spin = st.spin * Math.PI / 180, cloudDrift = 0, lastT = 0, bgT = 0, texVer = 0, sphereSig = '';
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
    const hx = lx, hy = ly, hz = lz + 1, hl = Math.hypot(hx, hy, hz), atmo = st.atmo, ac = PC.atmoColor(st), cc = PC.cloudColor(st), flat = KD().flat, shine = PC.shineOf(st), col = [0, 0, 0];
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
      if (!flat && shine > 0 && tex.liq[(clamp(Math.round(v * tex.H - .5), 0, tex.H - 1)) * tex.W + (((Math.round(u * tex.W - .5)) % tex.W) + tex.W) % tex.W]) { const sp = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 48) * .65 * shine * smooth(0, .3, diff); r += 255 * sp; g += 255 * sp; b += 255 * sp; }
      const gl = flat ? 0 : sample1(tex, tex.glow, u, v) / 255; // власне світіння: лава, кристали, біолюмінесценція, розломи
      if (gl > 0.004) { r = Math.max(r, col[0] * gl * .85); g = Math.max(g, col[1] * gl * .85); b = Math.max(b, col[2] * gl * .85); }
      let cl = 0;
      if (st.cloud > 0 && !flat) { cl = sample1(tex, tex.cloud, (u + cloudDrift) % 1, v) / 255 * .92; if (cl > 0) { const cs = .06 + 1.05 * shade; r = r * (1 - cl) + cc[0] * cs * cl; g = g * (1 - cl) + cc[1] * cs * cl; b = b * (1 - cl) + cc[2] * cs * cl; } }
      if (st.lights > 0 && !flat) { const li = sample1(tex, tex.light, u, v) / 255 * smooth(.12, -.08, diff) * (1 - cl * .8); if (li > 0) { r += 255 * li * .95; g += 200 * li * .9; b += 110 * li * .8; } }
      const rim = Math.pow(1 - nz, 2.6) * atmo * (.18 + .82 * smooth(-.35, .45, diff)) * 1.05;
      r += ac[0] * rim; g += ac[1] * rim; b += ac[2] * rim;
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
  }

  /* ---------- сцена: зорі, кільця, супутники, планета ---------- */
    function draw() {
    if (!tex) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = view.clientWidth, h = view.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); PB.draw(ctx, w, h, st, st.seed, bgT);
    const cx = w / 2, cy = h / 2 - 10, Rp = Math.min(w, h) * (st.ring ? .3 - .05 * (st.ringw ?? .5) : .33), tilt = st.tilt * Math.PI / 180, k = .24;
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
      const R = PC.rngFromSeed('ring:' + st.seed), nr = 16 + Math.round((st.ringw ?? .5) * 60), dens = .4 + (st.ringd ?? .5) * 1.2;
      for (let i = 0; i < nr; i++) { const rr = 1.38 + i * .02, a = Math.min(.95, (R() < .18 ? .02 : .1 + R() * .3) * (i > 18 && i < 22 ? .15 : 1) * dens), col = i % 5 === 0 ? '230,215,190' : '200,180,150'; ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = Rp * .022; ctx.beginPath(); ctx.ellipse(0, 0, rr * Rp * 1.45, rr * Rp * 1.45 * k, 0, from, to); ctx.stroke(); }
    };
    if (st.ring) ring(Math.PI, Math.PI * 2);
    ctx.restore();
    const S = Math.round(Rp * 2 * 1.12), sig = [S, spin.toFixed(4), cloudDrift.toFixed(4), st.sun, st.tilt, texVer].join('|'); if (sig !== sphereSig) { renderSphere(S, Rp); sphereSig = sig; } ctx.drawImage(sphere, cx - S / 2, cy - S / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); if (st.ring) ring(0, Math.PI);
    for (const m of moons) if (Math.sin(m.phase) >= 0) drawMoon(m);
    ctx.restore();
  }

  /* ---------- генерація текстури: швидка чернетка, потім повна ---------- */
  let genTimer = 0, fullTimer = 0;
  const genParams = () => Object.assign({}, st);
  function generate(W, H) { texVer++; tex = PC.generateTexture(genParams(), W, H); info = PC.describe(genParams(), tex); }
  function regenerate() {
    clearTimeout(genTimer); clearTimeout(fullTimer);
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
    c.append(el('div', { class: 'p-head' }, el('h3', {}, i.name), el('span', { class: 'des' }, i.designation), el('span', { class: 'kind' }, i.kindName)), el('p', { class: 'p-blurb' }, i.blurb),
      el('div', { class: 'p-grid' }, [['Радіус', i.radiusKm.toLocaleString('uk') + ' км'], ['Гравітація', f1(i.gravity) + ' g'], ['Доба', f1(i.dayH) + ' год'], ['Рік', i.yearD + ' діб'], ['Температура', (i.tempC > 0 ? '+' : '') + i.tempC + ' °C'], ['Тиск', f1(i.pressure) + ' атм'], i.water > 0 ? [i.liquidName, pct(i.water)] : null, ['Супутники', i.moons.length]].filter(Boolean).map(([l, v]) => el('div', { class: 'stat' }, el('b', {}, v), el('span', {}, l)))),
      el('div', { class: 'p-cols' },
        el('div', {}, el('h4', {}, 'Придатність для життя'), el('div', { class: 'hab' }, el('div', { class: 'meter' }, el('i', { style: `width:${i.habitability}%;background:${habCol}` })), el('div', {}, el('b', { style: `color:${habCol}` }, i.habitability + '%'), el('small', {}, i.habLabel))), el('p', { class: 'hint', style: 'margin:6px 0 0' }, i.life),
          el('h4', { style: 'margin-top:16px' }, 'Ресурси'), el('div', { class: 'res' }, i.resources.map(r => el('div', {}, el('span', {}, r.name), el('span', { class: 'st' }, '★'.repeat(r.rich) + '☆'.repeat(5 - r.rich)))))),
        el('div', { class: 'bars' }, el('h4', {}, 'Атмосфера'), i.atmosphere.map(([n, v], k) => el('div', { class: 'row' }, el('span', {}, n), el('div', { class: 'b' }, el('i', { style: `width:${Math.min(100, v)}%;background:${palette[k % palette.length]}` })), el('span', {}, v + '%')))),
        el('div', { class: 'bars' }, el('h4', {}, 'Поверхня'), i.biomes.slice(0, 7).map(b => el('div', { class: 'row' }, el('span', {}, b.name), el('div', { class: 'b' }, el('i', { style: `width:${b.share * 100}%;background:rgb(${PC.BIOMES[b.id].c.join(',')})` })), el('span', {}, pct(b.share)))))));
  }

  /* ---------- керування: набір ручок залежить від типу ---------- */
  const FMT = { pct: v => Math.round(v * 100) + '%', num: v => (Math.round(v * 100) / 100).toFixed(2), int: v => String(Math.round(v)), deg: v => Math.round(v) + '°', sgn: v => (v > 0 ? '+' : '') + Math.round(v * 100) };
  function syncLocks() { document.querySelectorAll('.lock').forEach(b => { const on = !!st.locks[b.dataset.lock]; b.setAttribute('aria-pressed', on); b.textContent = on ? '🔒' : '🔓'; }); }
  const lockBtn = key => { const b = document.createElement('button'); b.type = 'button'; b.className = 'lock'; b.dataset.lock = key; b.title = 'Зафіксувати: «Повний рандом» і «Рандом налаштувань» цього не змінять'; b.onclick = e => { e.preventDefault(); st.locks[key] = !st.locks[key]; save(); syncLocks(); }; return b; };
  const KTIPS = { sea: 'Скільки поверхні вкрито рідиною', scale: 'Розмір деталей ландшафту: більше число дає дрібніші материки й острови', mount: 'Скільки гір і хребтів', temp: 'Загальний клімат: від холодного до спекотного', humid: 'Вологість: сухі пустелі проти густих лісів', caps: 'Розмір полярних шапок', atmo: 'Товщина й густота атмосфери: впливає на сяйво по краю планети', cloud: 'Скільки хмар у небі', lights: 'Вогні міст на нічному боці', tilt: 'Нахил осі планети: впливає на вигляд кілець і пір року', moons: 'Кількість супутників', hue: 'Зсув кольору всієї планети' };
  let built = '';
  function buildControls() {
    if (built === st.kind) return; built = st.kind;
    for (const [id, grp] of [['surfCtl', 'surf'], ['skyCtl', 'sky']]) {
      const box = $(id); box.replaceChildren();
      for (const kb of KD().knobs.filter(k => k.g === grp)) {
        const out = el('output', { id: 'o_' + kb.k }), inp = el('input', { type: 'range', id: 'r_' + kb.k, min: kb.min, max: kb.max, step: kb.step });
        inp.addEventListener('input', e => { st[kb.k] = +e.target.value; out.textContent = FMT[kb.f](st[kb.k]); save(); regenerate(); });
        box.append(el('div', { class: 'ctl', title: (KTIPS[kb.k] ? KTIPS[kb.k] + '. ' : 'Параметр «' + kb.l + '». ') + 'Замочок праворуч фіксує значення' }, el('span', {}, kb.l), out, lockBtn(kb.k), inp));
      }
    }
  }
  for (const [id, key] of [['lkKind', 'kind'], ['lkSeed', 'seed'], ['lkName', 'name'], ['lkRing', 'ring']]) { const b = $(id); b.dataset.lock = key; b.title = 'Зафіксувати: «Повний рандом» і «Рандом налаштувань» цього не змінять'; b.onclick = () => { st.locks[key] = !st.locks[key]; save(); syncLocks(); }; }
  /* ---------- фон ---------- */
  let bgBuilt = '';
  function buildBg() {
    const key = st.bg; if (bgBuilt === key) return; bgBuilt = key;
    const tb = $('bgTypes'); tb.replaceChildren(...PB.ORDER.map(id => { const b = document.createElement('button'); b.type = 'button'; b.dataset.bg = id; b.textContent = PB.TYPES[id].name; b.title = PB.TYPES[id].tip; b.onclick = () => { st.bg = id; save(); sync(); draw(); }; return b; }));
    const box = $('bgCtl'); box.replaceChildren();
    for (const o of PB.knobsOf(st.bg)) {
      const out = el('output', { id: 'o_' + o.k }), inp = el('input', { type: 'range', id: 'r_' + o.k, min: o.min, max: o.max, step: o.f === 'int' ? 1 : .01 });
      inp.addEventListener('input', e => { st[o.k] = +e.target.value; out.textContent = FMT[o.f](st[o.k]); save(); draw(); });
      box.append(el('div', { class: 'ctl', title: o.tip }, el('span', {}, o.l), out, el('span'), inp));
    }
  }
  function syncBg() { buildBg(); document.querySelectorAll('#bgTypes button').forEach(b => b.classList.toggle('on', b.dataset.bg === st.bg)); for (const o of PB.knobsOf(st.bg)) { $('r_' + o.k).value = st[o.k]; $('o_' + o.k).textContent = FMT[o.f](st[o.k]); } }
  $('lkBg').dataset.lock = 'bg'; $('lkBg').onclick = () => { st.locks.bg = !st.locks.bg; save(); syncLocks(); };
  function sync() {
    buildControls(); syncBg();
    for (const kb of KD().knobs) { const r = $('r_' + kb.k); if (r) { r.value = st[kb.k]; $('o_' + kb.k).textContent = FMT[kb.f](st[kb.k]); } }
    $('tSeed').value = st.seed; $('tName').value = st.name || ''; $('cRing').checked = !!st.ring; $('cSpin').checked = st.auto; $('rSpin').value = Math.round(((spin * 180 / Math.PI) % 360 + 360) % 360); $('rSun').value = st.sun;
    document.querySelectorAll('.kinds button').forEach(b => b.classList.toggle('on', b.dataset.kind === st.kind));
    $('kindName').textContent = KD().name;
    syncLocks();
  }
  $('cRing').onchange = e => { st.ring = e.target.checked; save(); draw(); };
  $('cSpin').onchange = e => { st.auto = e.target.checked; save(); };
  $('rSpin').oninput = e => { spin = +e.target.value * Math.PI / 180; draw(); };
  $('rSun').oninput = e => { st.sun = +e.target.value; save(); draw(); };
  $('tSeed').onchange = e => { st.seed = e.target.value.trim() || randSeed(); if (!st.locks.name) st.name = PC.planetName(st.seed, st.kind); save(); sync(); regenerate(); };
  $('tName').oninput = e => { st.name = e.target.value.trim(); if (st.name) st.locks.name = true; save(); syncLocks(); if (info) { info.name = st.name || PC.planetName(st.seed, st.kind); renderCard(); } };
  $('tName').onchange = () => { if (!st.name) { st.locks.name = false; st.name = PC.planetName(st.seed, st.kind); save(); sync(); if (info) { info.name = st.name; renderCard(); } } };
  const kb = $('kinds');
  for (const grp of [['world', 'Типи світів'], ['real', 'Реальні типи'], ['fantasy', 'Фантастичні типи']]) {
    kb.append(el('h5', {}, grp[1]));
    for (const [k, v] of Object.entries(PC.KINDS)) if (v.group === grp[0]) { const b = document.createElement('button'); b.type = 'button'; b.dataset.kind = k; b.textContent = v.name; b.onclick = () => { st = Object.assign(PC.switchKind(st, k, st.locks), keepUI()); save(); sync(); regenerate(); closePanels(); }; kb.append(b); }
  }
  const reroll = opts => { st = Object.assign(PC.randomPlanet(st, st.locks, Math.random, opts), keepUI()); if (!opts.keepKind) Object.assign(st, PB.randomBg(st, st.locks.bg)); save(); sync(); regenerate(); };
  $('btnNew').onclick = () => reroll({ keepKind: true });
  $('btnSurprise').onclick = () => reroll({});
  addEventListener('keydown', e => { if (e.code === 'Space' && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) { e.preventDefault(); $('btnNew').click(); } });
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, spin }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) { spin = drag.spin - (e.clientX - drag.x) * .008; draw(); } });
  cv.addEventListener('pointerup', () => { drag = null; });

  /* ---------- панелі з іконок (полотно на весь екран) ---------- */
  const SIDE = ['pKind', 'pSeed', 'pBg', 'pSurf', 'pSky', 'pExport'];
  function showPanel(id, on) { const e = $(id); e.hidden = !on; e.classList.toggle('open', on); document.querySelector(`#rail [data-panel=${id}]`).classList.toggle('on', on); if (id === 'card' && on) renderCard(); $('side').classList.toggle('has-open', SIDE.some(s => $(s).classList.contains('open'))); store.set('panel', SIDE.find(s => $(s).classList.contains('open')) || ($('card').classList.contains('open') ? 'card' : '')); }
  function closePanels() { for (const s of SIDE) showPanel(s, false); }
  $('rail').addEventListener('click', e => { const b = e.target.closest('button[data-panel]'); if (!b) return; const id = b.dataset.panel, was = $(id).classList.contains('open'); if (id !== 'card') closePanels(); showPanel(id, !was); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closePanels(); showPanel('card', false); } });
  for (const s of [...SIDE, 'card']) showPanel(s, false);
  { const last = store.get('panel', innerWidth > 980 ? 'pSurf' : ''); if (last) showPanel(last, true); }

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
  $('btnJson').onclick = () => { if (!info) return; download(new Blob([JSON.stringify({ tool: 'planet-forge', params: genParams(), passport: info }, null, 2)], { type: 'application/json' }), `planet-${st.seed}.json`); toast('Збережено паспорт'); };

  $('btnCopyJson').onclick = async () => { if (!info) return; try { await navigator.clipboard.writeText(JSON.stringify({ tool: 'planet-forge', params: genParams(), passport: info }, null, 2)); toast('JSON скопійовано'); } catch { toast('Браузер не дає копіювати: збережіть файл'); } };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const d = JSON.parse(await f.text()), p = d.params;
      if (!p || !PC.KINDS[p.kind] || !p.seed) throw new Error('bad');
      st = Object.assign(PC.fromKind(p.kind, String(p.seed)), p, { locks: st.locks });
      st = Object.assign(st, PC.clampParams(st), PB.clampBg(st)); save(); sync(); regenerate(); toast('Планету завантажено');
    } catch { toast('Не вдалося прочитати: потрібен файл, збережений цим інструментом'); }
  };

  /* ---------- цикл анімації ---------- */
  function frame(t) {
    const dt = Math.min(.1, (t - lastT) / 1000 || 0); lastT = t;
    if (tex && !drag && !document.hidden) { bgT += dt; if (st.auto) { spin += dt * .35; cloudDrift = (cloudDrift + dt * .004) % 1; for (const m of info.moons) m.phase += dt * .35 * m.speed; } if (st.auto || PB.animated(st)) draw(); }
    requestAnimationFrame(frame);
  }
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(view);
  sync(); regenerate(); requestAnimationFrame(frame);
})();
