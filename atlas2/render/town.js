// Атлас 2.0, місто: малювання плану міста (земля, вода, поля, дерева, райони, площі, вулиці, мости, стіни, споруди, порт, підписи).
(function () {
  'use strict';
  const A = globalThis.Atlas2, T = A.CityData.T, TAU = Math.PI * 2;
  const GROUND = { grass: '#d3dcab', steppe: '#dfd5a0', savanna: '#dccf94', forest: '#b9cc90', taiga: '#b4c79c', jungle: '#a9c486', hills: '#cfc9a0', mountain: '#c9c3ae', peaks: '#d8d6cc', swamp: '#a9b78d', desert: '#e8d9a6', tundra: '#cfd6c4', snow: '#eaf0f2' };
  const ROAD = { avenue: ['#8b7a5a', '#f0e3bd'], street: ['#9a8a6a', '#ece0c4'], lane: ['#a89878', '#e6dac0'], ring: ['#9a8a6a', '#ece0c4'], embankment: ['#9c8d6c', '#dccfa8'], path: ['#a99a79', '#dccfae'] };
  const CAT_COL = { 'Житлова': 0, 'Руїни': 0 };
  // кеш: вода (растр 5 м), райони (растр 8 м)
  function waterLayer(c) {
    if (c._water) return c._water; const E = c.Rmap + 200, PX = Math.max(2.5, E * 2 / 900), n = Math.ceil(E * 2 / PX), cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n), d = im.data, WK = c.env.waterKind, grid = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) grid[j * n + i] = WK(-E + (i + 0.5) * PX, -E + (j + 0.5) * PX);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = grid[j * n + i], o = (j * n + i) * 4;
      if (v === 2) { d[o] = 79; d[o + 1] = 134; d[o + 2] = 184; d[o + 3] = 255; } else if (v === 1) { d[o] = 98; d[o + 1] = 152; d[o + 2] = 198; d[o + 3] = 255; }
      else { let wet = false; for (let q = -1; q <= 1 && !wet; q++) for (let p = -1; p <= 1; p++) { const a = i + p, b = j + q; if (a >= 0 && b >= 0 && a < n && b < n && grid[b * n + a]) { wet = true; break; } } if (wet) { d[o] = 232; d[o + 1] = 222; d[o + 2] = 176; d[o + 3] = 255; } } }
    g.putImageData(im, 0, 0); return (c._water = { cv, E });
  }
  function districtLayer(c) {
    if (c._dist) return c._dist; const E = c.R * 1.35, PX = 8, n = Math.ceil(E * 2 / PX), cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n), d = im.data, WK = c.env.waterKind, cols = c.districts.map(q => { const h = q.col.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; });
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -E + (i + 0.5) * PX, y = -E + (j + 0.5) * PX, o = (j * n + i) * 4; const dd = Math.hypot(x - c.c0[0], y - c.c0[1]); if (dd > c.R * 1.25 || WK(x, y) !== 0) continue; const k = c.districtOf(x, y); if (k < 0) continue; d[o] = cols[k][0]; d[o + 1] = cols[k][1]; d[o + 2] = cols[k][2]; d[o + 3] = Math.round(255 * Math.min(1, (c.R * 1.25 - dd) / (c.R * 0.3))); }
    g.putImageData(im, 0, 0); return (c._dist = { cv, E });
  }
  // «маса» міста: усі споруди одним розмитим плямою для далеких масштабів (кеш, 5 м на піксель)
  function massLayer(c) {
    if (c._mass) return c._mass; const E = c.R * 1.3, PX = 5, n = Math.ceil(E * 2 / PX), cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d');
    g.fillStyle = '#b79c74'; for (const b of c.buildings) { const w = Math.max(2, b.w / PX * 1.15), h = Math.max(2, b.h / PX * 1.15); g.fillRect((b.x + E) / PX - w / 2, (b.y + E) / PX - h / 2, w, h); }
    g.strokeStyle = '#d8c9a6'; g.lineCap = 'round'; for (const st of c.streets) { if (st.kind === 'lane') continue; g.lineWidth = Math.max(1.2, st.hw * 2 / PX); g.beginPath(); for (let i = 0; i < st.pts.length; i += 2) { const x = (st.pts[i] + E) / PX, y = (st.pts[i + 1] + E) / PX; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    return (c._mass = { cv, E });
  }
  const poly = (g, p, k) => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); };
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const YARD = new Set(['house', 'rich', 'estate', 'farmstead', 'farm', 'slum', 'hut']);
  const COL = { good: 1, worn: 0.88, damaged: 0.8 };
  function shade(hex, f) { const h = hex.replace('#', ''), v = [0, 2, 4].map(i => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f)))); return `rgb(${v[0]},${v[1]},${v[2]})`; }
  // житлові й дрібні споруди беруть колір даху району (як на референсах: кожен квартал читається своєю барвою), особливі споруди лишають свій
  const ROOF = { centre: '#b9714a', trade: '#d9a04a', craft: '#8f6a9a', rich: '#b3503f', poor: '#6e5646', temple: '#a9a39a', castle: '#7d7d8c', port: '#6f7d86', suburb: '#b88f66', outskirts: '#b88f66' }, TINT = new Set(['house', 'rich', 'estate', 'slum', 'shop', 'bakery', 'weaver', 'smith', 'warehouse', 'farmstead', 'tannery', 'brewery', 'pharm', 'jewel', 'weapon', 'stable', 'fishhut', 'hut', 'farm']);
  function mix(a, b, f) { const x = a.replace('#', ''), y = b.replace('#', ''); return '#' + [0, 2, 4].map(i => Math.round(parseInt(x.slice(i, i + 2), 16) * (1 - f) + parseInt(y.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join(''); }
  function buildingFill(b, c) { const t = T[b.type]; if (b.cond === 'ruined') return '#8d867a'; if (b.cond === 'burnt') return '#4a403a'; if (b.cond === 'lair') return '#9a3228'; let col = t.col; const d = c && b.district >= 0 && c.districts[b.district]; if (d && TINT.has(b.type) && ROOF[d.kind]) col = mix(col, ROOF[d.kind], 0.7); return shade(col, COL[b.cond] || 1); }
  // ділянка поля: колір і малюнок за культурою; живопліт по краю
  const CROP = ['#dccf84', '#cfd28a', '#d8c48e', '#c9d48c'], FILL = { garden: '#b4c97e', orchard: '#bcd08a', meadow: '#bdd48e', vineyard: '#c4cf86' };
  function fieldPlot(g, f, k, fate) {
    g.save(); const p = f.pts, trace = () => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); g.closePath(); }; trace();
    g.fillStyle = f.k === 'arable' ? (fate ? '#c5c88f' : CROP[f.crop || 0]) : FILL[f.k] || '#bdd48e'; g.fill();
    if (k > 0.3) { g.save(); g.clip(); g.translate(f.x * k, f.y * k); g.rotate(f.a); const q = f.r;
      if (f.k === 'arable') { g.strokeStyle = 'rgba(120,100,50,.38)'; g.lineWidth = 1; g.beginPath(); const sp = 4 + (f.crop || 0); for (let y = -q; y < q; y += sp) { g.moveTo(-q * k, y * k); g.lineTo(q * k, y * k); } g.stroke(); }
      else if (f.k === 'vineyard') { g.strokeStyle = 'rgba(60,100,40,.75)'; g.lineWidth = Math.max(1, 1.3 * k); g.beginPath(); for (let y = -q; y < q; y += 6) { g.moveTo(-q * k, y * k); g.lineTo(q * k, y * k); } g.stroke(); }
      else if (f.k === 'garden' || f.k === 'orchard') { const st = f.k === 'garden' ? 9 : 12; g.fillStyle = f.k === 'garden' ? 'rgba(70,120,50,.7)' : 'rgba(60,110,45,.85)'; for (let y = -q; y < q; y += st) for (let x = -q; x < q; x += st) { g.beginPath(); g.arc(x * k, y * k, Math.max(1, (f.k === 'garden' ? 2 : 3) * k), 0, TAU); g.fill(); } }
      g.restore(); }
    trace(); g.strokeStyle = 'rgba(70,100,45,.8)'; g.lineWidth = Math.max(1, 1.2 * k); g.lineJoin = 'round'; g.stroke(); g.restore();
  }
  // view: {k px/м, tx, ty — де в пікселях центр міста}; opt: {districts, names, hover, sel, hoverDistrict}
  function draw(cv, c, view, opt) {
    const g = cv.getContext('2d'), k = view.k, W = cv.width, H = cv.height; opt = opt || {};
    g.setTransform(1, 0, 0, 1, 0, 0); if (!opt.map) { g.fillStyle = GROUND[c.group] || GROUND.grass; g.fillRect(0, 0, W, H); }
    g.save(); if (opt.alpha != null) g.globalAlpha = opt.alpha; g.translate(view.tx, view.ty); g.lineCap = 'round'; g.lineJoin = 'round';
    if (!opt.map) { const wl = waterLayer(c); g.imageSmoothingEnabled = true; g.drawImage(wl.cv, -wl.E * k, -wl.E * k, wl.E * 2 * k, wl.E * 2 * k); }
    const lod = (a, b) => opt.map ? sm((k - a) / (b - a)) : 1, A0 = opt.alpha == null ? 1 : opt.alpha, setA = v => { g.globalAlpha = A0 * v; };
    const vis = (x, y, r) => { const sx = x * k + view.tx, sy = y * k + view.ty, rr = r * k; return sx + rr > 0 && sy + rr > 0 && sx - rr < W && sy - rr < H; };
    setA(lod(0.04, 0.15)); if (g.globalAlpha > 0.01) for (const f of c.fields) { if (!vis(f.x, f.y, f.r)) continue; fieldPlot(g, f, k, c.fate); }
    setA(1); { const ma = opt.map ? 1 - lod(0.12, 0.5) : 0; if (ma > 0.02) { const ml = massLayer(c); setA(ma * 0.92); g.drawImage(ml.cv, -ml.E * k, -ml.E * k, ml.E * 2 * k, ml.E * 2 * k); setA(1); } }
    if (opt.districts && c.districts.length) { const dl = districtLayer(c); const ga = g.globalAlpha; g.globalAlpha = (opt.map ? 0.3 + 0.25 * (1 - lod(0.1, 0.5)) : 0.34) * ga; g.drawImage(dl.cv, -dl.E * k, -dl.E * k, dl.E * 2 * k, dl.E * 2 * k); g.globalAlpha = ga; }
    setA(lod(0.03, 0.1)); if (g.globalAlpha > 0.01 && c.sites) for (const f of c.sites) { if (!vis(f.x, f.y, f.r * 1.4)) continue;
      for (const q of f.ground) { poly(g, q.pts, k); g.closePath(); g.fillStyle = q.col; g.fill(); g.strokeStyle = q.edge; g.lineWidth = Math.max(1, 1.2 * k); g.stroke(); }
      for (const w of f.walls) { poly(g, w.pts, k); g.lineJoin = 'round'; g.strokeStyle = '#3f3f4a'; g.lineWidth = Math.max(1.5, (w.w + 1.2) * k); g.stroke(); g.strokeStyle = w.col; g.lineWidth = Math.max(1, w.w * k); g.stroke(); }
      if (f.paths) for (const q of f.paths) { poly(g, q.pts, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#a99a79'; g.lineWidth = Math.max(1.4, (q.w + 1) * k); g.stroke(); g.strokeStyle = '#e2d6b6'; g.lineWidth = Math.max(0.8, q.w * k); g.stroke(); }
      if (k > 0.15) for (const d of f.decos) { const x = d.x * k, y = d.y * k, R = Math.max(1.2, d.r * k);
        if (d.t === 'tree') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = 'rgba(70,120,60,.85)'; g.fill(); }
        else if (d.t === 'tower') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#9a9aa8'; g.fill(); g.strokeStyle = '#3f3f4c'; g.lineWidth = Math.max(1, 0.7 * k); g.stroke(); }
        else if (d.t === 'stone') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#8f8f9a'; g.fill(); g.strokeStyle = '#4a4a56'; g.lineWidth = Math.max(1, 0.5 * k); g.stroke(); }
        else if (d.t === 'garden') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = 'rgba(130,175,90,.8)'; g.fill(); g.strokeStyle = 'rgba(80,120,60,.7)'; g.lineWidth = Math.max(1, 0.6 * k); for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x - R * 0.8, y + i * R * 0.3); g.lineTo(x + R * 0.8, y + i * R * 0.3); g.stroke(); } }
        else if (d.t === 'glyph') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.strokeStyle = 'rgba(122,90,208,.75)'; g.lineWidth = Math.max(1, 0.7 * k); g.stroke(); }
        else if (d.t === 'cross') { g.strokeStyle = '#6c6c66'; g.lineWidth = Math.max(0.8, 0.45 * k); g.beginPath(); g.moveTo(x, y - k * 1.1); g.lineTo(x, y + k * 1.1); g.moveTo(x - k * 0.7, y - k * 0.4); g.lineTo(x + k * 0.7, y - k * 0.4); g.stroke(); }
        else if (d.t === 'tomb') { g.fillStyle = '#b4b2a8'; g.fillRect(x - k * 0.9, y - k * 1.5, k * 1.8, k * 3); g.strokeStyle = '#5c5c58'; g.lineWidth = Math.max(0.6, 0.3 * k); g.strokeRect(x - k * 0.9, y - k * 1.5, k * 1.8, k * 3); }
        else if (d.t === 'statue') { g.beginPath(); g.arc(x, y, Math.max(1.5, R), 0, TAU); g.fillStyle = '#d4d2c8'; g.fill(); g.strokeStyle = '#4a4a46'; g.lineWidth = Math.max(0.8, 0.5 * k); g.stroke(); }
        else if (d.t === 'mound') { g.beginPath(); g.ellipse(x, y, R * 1.5, R, d.a, 0, TAU); g.fillStyle = '#9a8a62'; g.fill(); g.strokeStyle = '#6a5a3a'; g.lineWidth = Math.max(0.6, 0.3 * k); g.stroke(); }
        else if (d.t === 'grave') { g.fillStyle = '#767f74'; g.fillRect(x - k * 0.6, y - k * 0.9, k * 1.2, k * 1.8); }
        else if (d.t === 'spoil') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#8f887a'; g.fill(); }
        else if (d.t === 'fire') { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#e0702a'; g.fill(); }
        else if (d.t === 'tent') { g.save(); g.translate(x, y); g.rotate(d.a); g.beginPath(); g.moveTo(-R, R * 0.8); g.lineTo(0, -R); g.lineTo(R, R * 0.8); g.closePath(); g.fillStyle = '#d9c9a0'; g.fill(); g.strokeStyle = '#6a5a3a'; g.lineWidth = Math.max(1, 0.6 * k); g.stroke(); g.restore(); }
        else if (d.t === 'cart' || d.t === 'rack') { g.save(); g.translate(x, y); g.rotate(d.a); g.fillStyle = '#8a6a44'; g.fillRect(-R, -R * 0.6, R * 2, R * 1.2); g.restore(); } } }
    setA(lod(0.1, 0.22)); if (g.globalAlpha > 0.01) for (const f of c.features) { if (f.t === 'pond' && vis(f.x, f.y, f.r)) { poly(g, f.poly, k); g.closePath(); g.fillStyle = '#86bcd6'; g.fill(); g.lineWidth = Math.max(1, 1.4 * k); g.strokeStyle = '#4f86a8'; g.stroke(); if (k > 0.6) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(0.6, 0.5 * k); g.beginPath(); g.arc(f.x * k - f.rad * 0.2 * k, f.y * k - f.rad * 0.1 * k, f.rad * 0.4 * k, 3.4, 5.2); g.stroke(); } } if (f.t === 'site' || f.t === 'pond' || !vis(f.x, f.y, f.r)) continue; g.beginPath(); g.arc(f.x * k, f.y * k, f.r * k, 0, TAU); g.fillStyle = f.t === 'plaza' ? '#e6dec9' : f.t === 'park' ? '#97c47e' : '#a9b49a'; g.fill(); g.lineWidth = Math.max(1, 1.2 * k); g.strokeStyle = f.t === 'plaza' ? '#a99a78' : f.t === 'park' ? '#6f9a5a' : '#7c8870'; g.stroke();
      if (f.t === 'plaza' && k > 0.5) { g.strokeStyle = 'rgba(150,135,100,.5)'; g.lineWidth = 1; g.beginPath(); g.arc(f.x * k, f.y * k, f.r * 0.62 * k, 0, TAU); g.stroke(); }
      if (f.t === 'cemetery' && k > 0.7) { g.fillStyle = '#6d786a'; for (let i = 0; i < 18; i++) { const a = i * 2.4, d = Math.sqrt((i + 1) / 18) * f.r * 0.8; g.fillRect((f.x + Math.cos(a) * d) * k - k * 0.6, (f.y + Math.sin(a) * d) * k - k * 0.9, k * 1.2, k * 1.8); } } }
    // вулиці: обводка, заливка; мости окремо
    // обводка лише там, де дорога реально над водою (вибірка маски води вздовж лінії, незалежно від позначок вершин)
    g.lineCap = 'butt'; g.lineJoin = 'round'; const WKd = c.env.waterKind; for (const st of c.streets) { const sa = st.kind === 'lane' || st.kind === 'path' ? lod(0.3, 0.5) : st.kind === 'street' ? lod(0.1, 0.2) : lod(0.03, 0.08), p = st.pts; if (sa < 0.02 || p.length < 4) continue; g.globalAlpha = A0 * sa; g.strokeStyle = '#3d3a36'; g.lineWidth = Math.max(2, (st.hw * 2 + 2.6) * k); g.beginPath();
      for (let q = 2; q < p.length; q += 2) { const ax = p[q - 2], ay = p[q - 1], dx = p[q] - ax, dy = p[q + 1] - ay, L = Math.hypot(dx, dy), m = Math.max(1, Math.ceil(L / 2)); let on = false; for (let t = 0; t <= m; t++) { const x = ax + dx * t / m, y = ay + dy * t / m, w = WKd(x, y) !== 0; if (w) { if (!on) { g.moveTo(x * k, y * k); on = true; } else g.lineTo(x * k, y * k); } else on = false; } }
      g.stroke(); } g.lineCap = 'round'; g.lineJoin = 'round';
    for (const pass of [0, 1]) for (const st of c.streets) { const rc = ROAD[st.kind] || ROAD.street, p = st.pts; if (p.length < 4) continue; const sa = st.kind === 'lane' || st.kind === 'path' ? lod(0.3, 0.5) : st.kind === 'street' ? lod(0.1, 0.2) : lod(0.03, 0.08); if (sa < 0.02) continue; g.globalAlpha = A0 * sa; g.strokeStyle = pass ? rc[1] : rc[0]; g.lineWidth = Math.max(pass ? 0.8 : 1.4, (st.hw * 2 + (pass ? 0 : 1.6)) * k); g.beginPath(); let pen = false; for (let i = 0; i < p.length; i += 2) { if (!pen) { g.moveTo(p[i] * k, p[i + 1] * k); pen = true; } else g.lineTo(p[i] * k, p[i + 1] * k); } g.stroke(); if (st.kind === 'avenue' && pass && k > 0.6) { g.strokeStyle = 'rgba(150,130,90,.45)'; g.setLineDash([k * 3, k * 4]); g.lineWidth = Math.max(1, 0.5 * k); g.stroke(); g.setLineDash([]); } }
    setA(lod(0.2, 0.4)); for (const pr of c.piers) { g.strokeStyle = '#5d4630'; g.lineWidth = Math.max(2, 6.4 * k); g.beginPath(); g.moveTo(pr.x1 * k, pr.y1 * k); g.lineTo(pr.x2 * k, pr.y2 * k); g.stroke(); g.strokeStyle = '#a98558'; g.lineWidth = Math.max(1, 5 * k); g.stroke(); }
    for (const sh of c.ships) { g.save(); g.translate(sh.x * k, sh.y * k); g.rotate(sh.a + Math.PI / 2); const L = sh.len * k, w = sh.w * k; g.beginPath(); g.moveTo(0, -L / 2); g.quadraticCurveTo(w, -L / 6, w * 0.7, L / 2); g.lineTo(-w * 0.7, L / 2); g.quadraticCurveTo(-w, -L / 6, 0, -L / 2); g.fillStyle = '#7b5a3a'; g.fill(); g.strokeStyle = '#3d2c1c'; g.lineWidth = Math.max(0.8, 0.5 * k); g.stroke(); if (k > 0.5) { g.fillStyle = '#f1ead8'; g.fillRect(-w * 0.55, -L * 0.18, w * 1.1, L * 0.36); } g.restore(); }
    // дерева під спорудами, споруди зверху
    setA(lod(0.25, 0.6)); if (g.globalAlpha > 0.01) for (const t of c.trees) { if (!vis(t.x, t.y, 6)) continue; g.beginPath(); g.arc(t.x * k, t.y * k, Math.max(0.8, t.r * k), 0, TAU); g.fillStyle = t.c ? '#4d7a52' : '#76a35a'; g.fill(); if (k > 0.4) { g.strokeStyle = 'rgba(40,70,40,.5)'; g.lineWidth = 0.8; g.stroke(); } }
    const detail = k > 0.45;
    // двори й огорожі садиб малих поселень: ділянка за будинком (сад) обведена парканом, під будинками
    if (c.tier <= 2) { setA(lod(0.5, 0.9)); if (g.globalAlpha > 0.02) for (const b of c.buildings) { if (b.st < 0 || b.site || b.uniq || !YARD.has(b.type) || !vis(b.x, b.y, 30)) continue;
      g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.a); const sd = b.side > 0 ? 1 : -1, x0 = -(b.w / 2 + 2) * k, wy = (b.w + 4) * k, y0 = sd > 0 ? -(b.h / 2 + 1.5) * k : -(b.h / 2 + 8) * k, hy = (b.h + 9.5) * k;
      g.fillStyle = 'rgba(140,185,95,.35)'; g.fillRect(x0, y0, wy, hy); g.strokeStyle = 'rgba(110,80,45,.75)'; g.lineWidth = Math.max(0.7, 0.5 * k); g.strokeRect(x0, y0, wy, hy); g.restore(); } }
    for (const cls of [0, 1, 2]) { const ba = cls === 0 ? lod(0.08, 0.18) : cls === 1 ? lod(0.18, 0.34) : lod(0.3, 0.55); if (ba < 0.02) continue; setA(ba);
    for (const b of c.buildings) {
      const ar = b.w * b.h; if ((ar >= 600 || b.uniq) ? cls !== 0 : ar >= 220 ? cls !== 1 : cls !== 2) continue; if (b.w * k < 0.7 && b.h * k < 0.7) continue;
      if (!vis(b.x, b.y, Math.max(b.w, b.h))) continue; g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.a); const w = b.w * k, h = b.h * k, t = T[b.type];
      if (b.type === 'castle') { g.fillStyle = '#b9b9c4'; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = Math.max(2, 3 * k); g.strokeStyle = '#5d5d6c'; g.strokeRect(-w / 2, -h / 2, w, h); g.fillStyle = '#8f8fa0'; g.fillRect(-w * 0.2, -h * 0.2, w * 0.4, h * 0.4); g.strokeStyle = '#3f3f4c'; g.lineWidth = Math.max(1, k); g.strokeRect(-w * 0.2, -h * 0.2, w * 0.4, h * 0.4); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.beginPath(); g.arc(sx * w / 2, sy * h / 2, Math.max(2, 6 * k), 0, TAU); g.fillStyle = '#a1a1b2'; g.fill(); g.stroke(); } if (b.cond === 'lair') { g.fillStyle = 'rgba(154,50,40,.45)'; g.fillRect(-w / 2, -h / 2, w, h); } }
      else if (b.type === 'lighthouse' || b.type === 'windmill' || b.type === 'mtower' || b.type === 'observ' || b.type === 'portal' || b.type === 'obelisk' || b.type === 'shrine' || b.type === 'dungeon') { g.beginPath(); g.arc(0, 0, Math.max(1.5, b.w / 2 * k), 0, TAU); g.fillStyle = buildingFill(b); g.fill(); g.strokeStyle = '#3b2f2a'; g.lineWidth = Math.max(0.8, 0.6 * k); g.stroke(); if (b.type === 'windmill' && detail) { g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(0, 0); g.lineTo(Math.cos(i * Math.PI / 2 + 0.4) * w * 1.1, Math.sin(i * Math.PI / 2 + 0.4) * w * 1.1); } g.stroke(); } }
      else { if (b.type === 'arena') { g.beginPath(); g.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); g.fillStyle = '#d8c28e'; g.fill(); g.lineWidth = Math.max(1, 0.7 * k); g.strokeStyle = '#3b2f2a'; g.stroke(); g.beginPath(); g.ellipse(0, 0, w * 0.34, h * 0.34, 0, 0, TAU); g.strokeStyle = '#a07a4a'; g.stroke(); g.restore(); continue; } g.fillStyle = buildingFill(b, c); g.fillRect(-w / 2, -h / 2, w, h); if (k > 0.25) { g.strokeStyle = b.cond === 'lair' ? '#4a120e' : '#3b2f2a'; g.lineWidth = Math.max(0.6, 0.55 * k); g.strokeRect(-w / 2, -h / 2, w, h); }
        if (detail && b.cond !== 'ruined' && b.cond !== 'burnt') { g.strokeStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.stroke(); }
        if (b.cond === 'ruined' && detail) { g.strokeStyle = '#4e483f'; g.beginPath(); g.moveTo(-w / 2, -h / 3); g.lineTo(0, 0); g.lineTo(w / 3, h / 2); g.moveTo(w / 2, -h / 4); g.lineTo(w / 8, h / 6); g.stroke(); }
        if (b.cond === 'damaged' && detail) { g.strokeStyle = '#3b2f2a'; g.beginPath(); g.moveTo(-w / 3, -h / 2); g.lineTo(w / 6, h / 2); g.stroke(); }
        if (b.type === 'cathedral' || b.type === 'temple') { g.strokeStyle = '#8a8570'; g.lineWidth = Math.max(1, 0.8 * k); g.beginPath(); g.moveTo(0, -h * 0.4); g.lineTo(0, h * 0.4); g.moveTo(-w * 0.3, -h * 0.1); g.lineTo(w * 0.3, -h * 0.1); g.stroke(); } }
      g.restore();
    } }
    setA(lod(0.03, 0.08)); for (const wl of [c.wall.on ? c.wall : null, c.keep ? Object.assign({ mat: 'stone' }, c.keep) : null]) if (wl) { setA(lod(0.03, 0.08)); for (const run of wl.runs) { poly(g, run, k); g.lineJoin = 'round'; const wm = wl.mat; if (wm === 'stone') { g.strokeStyle = '#4c4c58'; g.lineWidth = Math.max(2, (wl.w + 2) * k); g.stroke(); g.strokeStyle = '#a4a4b2'; g.lineWidth = Math.max(1, wl.w * k); g.stroke(); g.strokeStyle = '#8a8a98'; g.lineWidth = Math.max(0.6, wl.w * 0.3 * k); g.stroke(); }
        else if (wm === 'palisade') { g.strokeStyle = '#4a3220'; g.lineWidth = Math.max(1.5, (wl.w + 1) * k); g.stroke(); g.strokeStyle = '#9a7242'; g.lineWidth = Math.max(1, wl.w * k); g.stroke(); if (k > 0.5) { g.setLineDash([1.2 * k, 1.2 * k]); g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(0.8, wl.w * 0.8 * k); g.stroke(); g.setLineDash([]); } }
        else { g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(1, 1.6 * k); g.stroke(); g.strokeStyle = '#b08a5a'; g.lineWidth = Math.max(0.6, 0.9 * k); g.stroke(); } }
      setA(lod(0.2, 0.4)); for (const q of wl.towers) { g.beginPath(); g.arc(q[0] * k, q[1] * k, Math.max(2, (wl.w * 0.75 + 1.5) * k), 0, TAU); g.fillStyle = '#9090a2'; g.fill(); g.strokeStyle = '#3f3f4c'; g.lineWidth = Math.max(1, 0.9 * k); g.stroke(); }
      setA(lod(0.15, 0.3)); for (const q of wl.gates) { g.save(); g.translate(q.x * k, q.y * k); g.rotate(q.a); const gl = (wl.w + 6) * k, gw = Math.max(12, (q.hw || 4) * 2 + 6) * k; g.fillStyle = q.main ? '#8b6a45' : '#a08560'; g.fillRect(-gl / 2, -gw / 2, gl, gw); g.strokeStyle = '#3d2c1c'; g.lineWidth = Math.max(1, k); g.strokeRect(-gl / 2, -gw / 2, gl, gw); g.restore(); } }
    setA(lod(0.5, 0.8)); if (g.globalAlpha > 0.01) for (const p of c.props) { g.beginPath(); g.arc(p.x * k, p.y * k, Math.max(2, p.r * k), 0, TAU); g.fillStyle = p.t === 'monument' ? '#b8b8c0' : '#6ab0e0'; g.fill(); g.strokeStyle = '#3f4a58'; g.lineWidth = Math.max(1, 0.8 * k); g.stroke(); if (p.t === 'fountain') { g.beginPath(); g.arc(p.x * k, p.y * k, Math.max(1, p.r * 0.45 * k), 0, TAU); g.fillStyle = '#e8f6ff'; g.fill(); } }
    setA(lod(0.3, 0.6)); if (g.globalAlpha > 0.01) for (const m of c.camps) { const x = m.x * k, y = m.y * k, u = Math.max(2, 2.2 * k); g.save(); g.translate(x, y); g.rotate(m.a);
      if (m.t === 'tent') { g.beginPath(); g.moveTo(0, -u * 1.4); g.lineTo(u * 1.4, u); g.lineTo(-u * 1.4, u); g.closePath(); g.fillStyle = '#7a5a3a'; g.fill(); g.strokeStyle = '#2d1f12'; g.lineWidth = 1; g.stroke(); }
      else if (m.t === 'fire') { g.beginPath(); g.arc(0, 0, u * 0.9, 0, TAU); g.fillStyle = '#f08a2c'; g.fill(); g.beginPath(); g.arc(0, 0, u * 0.45, 0, TAU); g.fillStyle = '#ffe27a'; g.fill(); }
      else if (m.t === 'barricade') { g.strokeStyle = '#4a3220'; g.lineWidth = Math.max(2, u * 0.7); g.beginPath(); g.moveTo(-u * 2, 0); g.lineTo(u * 2, 0); g.stroke(); g.beginPath(); g.moveTo(-u, -u); g.lineTo(u, u); g.moveTo(u, -u); g.lineTo(-u, u); g.stroke(); }
      else if (m.t === 'bones') { g.fillStyle = '#efe9d8'; for (let i = 0; i < 4; i++) g.fillRect(Math.cos(i * 1.7) * u, Math.sin(i * 2.3) * u, u * 0.9, u * 0.35); }
      else if (m.t === 'nest') { g.beginPath(); g.arc(0, 0, u * 1.5, 0, TAU); g.fillStyle = '#3d2c26'; g.fill(); g.strokeStyle = '#1d1210'; g.lineWidth = 1; g.stroke(); }
      else { g.strokeStyle = '#3d2c1c'; g.lineWidth = Math.max(1, u * 0.3); g.beginPath(); g.moveTo(0, u); g.lineTo(0, -u * 1.6); g.stroke(); g.fillStyle = '#c0302f'; g.fillRect(0, -u * 1.6, u * 1.5, u); }
      g.restore(); }
    // підписи
    setA(1);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const halo = (txt, x, y, col) => { g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeText(txt, x, y); g.fillStyle = col || '#2b2218'; g.fillText(txt, x, y); };
    setA(lod(0.3, 0.6)); if (opt.names && c.R * k > 90) for (const st of c.streets) {
      if ((st.kind === 'lane' || st.kind === 'path') && k < 1.2) continue; const p = st.pts, fs = Math.max(9, Math.min(15, 4.6 * k)); g.font = `600 ${fs}px sans-serif`; const wtxt = g.measureText(st.name).width / k; if (st.len < wtxt * 1.05 || k < 0.55) continue;
      let acc = 0, mx = 0, my = 0, half = st.len / 2, mi = 2; for (; mi < p.length; mi += 2) { const l = Math.hypot(p[mi] - p[mi - 2], p[mi + 1] - p[mi - 1]); if (acc + l >= half) { const t = (half - acc) / l; mx = p[mi - 2] + (p[mi] - p[mi - 2]) * t; my = p[mi - 1] + (p[mi + 1] - p[mi - 1]) * t; break; } acc += l; }
      if (!vis(mx, my, wtxt)) continue; const ptAt = d => { let q = 0; for (let i = 2; i < p.length; i += 2) { const l = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); if (q + l >= d) { const t = (d - q) / l; return [p[i - 2] + (p[i] - p[i - 2]) * t, p[i - 1] + (p[i + 1] - p[i - 1]) * t]; } q += l; } return [p[p.length - 2], p[p.length - 1]]; };
      const a0 = ptAt(Math.max(0, half - wtxt / 2)), a1 = ptAt(Math.min(st.len, half + wtxt / 2)); let a = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]); if (a > Math.PI / 2 || a < -Math.PI / 2) a += Math.PI; g.save(); g.translate(mx * k, my * k); g.rotate(a); halo(st.name, 0, 0, '#4a3b22'); g.restore(); }
    setA(lod(1.0, 1.6)); if (opt.labels && k > 1.5) for (const b of c.buildings) { if (!vis(b.x, b.y, 20) || (!b.uniq && (k < 4.5 && T[b.type].cat === 'Житлова')) || (b.cond === 'ruined' && !b.uniq)) continue; if (b.w * k < 30 && k < 3.2) continue; g.font = `${Math.max(9, Math.min(13, 2.8 * k))}px sans-serif`; halo(b.name, b.x * k, b.y * k, '#1d1a14'); }
    setA(lod(0.06, 0.14)); if (opt.districts && c.R * k > 110) for (const d of c.districts) { if (!vis(d.x, d.y, 50)) continue; const fs = Math.max(11, Math.min(20, 0.1 * c.R * k * 0.45)); g.font = `700 ${fs}px sans-serif`; halo(d.name.toUpperCase(), d.x * k, d.y * k, '#222'); }
    setA(lod(0.3, 0.5)); for (const f of c.features) if (f.t !== 'plaza' || opt.names) { if (!vis(f.x, f.y, f.r) || k < 0.6) continue; g.font = `600 ${Math.max(9, Math.min(13, 3.4 * k))}px sans-serif`; halo(f.name, f.x * k, f.y * k + (f.t === 'plaza' ? f.r * 0.5 * k : 0), f.t === 'park' ? '#1f4a22' : '#3a2f1a'); }
    setA(lod(0.4, 0.7)); for (const q of c.wall.gates) if (opt.names && k > 0.9) { g.font = `600 ${Math.max(9, Math.min(12, 3 * k))}px sans-serif`; halo(q.name, q.x * k, q.y * k - 14 * k, '#2b2b3a'); }
    setA(1); if (opt.map) { const fs = Math.max(12, Math.min(22, c.R * k * 0.09)); g.font = `700 ${fs}px sans-serif`; halo(c.name, c.c0[0] * k, (c.c0[1] - c.R * 1.18) * k, '#201810'); }
    g.restore(); if (opt.map) return;
    // масштабна лінійка
    const nice = [5, 10, 20, 50, 100, 200, 500, 1000], target = 120 / k, m = nice.find(v => v >= target * 0.6) || 1000, px = m * k; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(12, H - 34, px + 70, 24); g.fillStyle = '#222'; g.fillRect(18, H - 20, px, 3); g.fillRect(18, H - 25, 2, 8); g.fillRect(18 + px - 2, H - 25, 2, 8); g.font = '12px sans-serif'; g.textAlign = 'left'; g.fillText(m + ' м', 26 + px, H - 20);
  }
  // підсвітка наведеного району й споруд на верхньому шарі (без перемальовування карти)
  function overlay(cv, c, view, opt) {
    const g = cv.getContext('2d'), k = view.k; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(view.tx, view.ty); g.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    if (opt.hoverDistrict != null && opt.hoverDistrict >= 0) { const E = c.R * 1.35, PX = 8, n = Math.ceil(E * 2 / PX); if (!c._hm || c._hm.id !== opt.hoverDistrict) { const m = document.createElement('canvas'); m.width = m.height = n; const mg = m.getContext('2d'), im = mg.createImageData(n, n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -E + (i + 0.5) * PX, y = -E + (j + 0.5) * PX; if (Math.hypot(x - c.c0[0], y - c.c0[1]) < c.R * 1.25 && c.env.waterKind(x, y) === 0 && c.districtOf(x, y) === opt.hoverDistrict) { const o = (j * n + i) * 4; im.data[o] = 255; im.data[o + 1] = 255; im.data[o + 2] = 255; im.data[o + 3] = 255; } } mg.putImageData(im, 0, 0); c._hm = { id: opt.hoverDistrict, cv: m }; } const ga = g.globalAlpha; g.globalAlpha = 0.35 * ga; g.drawImage(c._hm.cv, -E * k, -E * k, E * 2 * k, E * 2 * k); g.globalAlpha = ga; }
    for (const b of [opt.hover, opt.sel]) if (b && b.type) { g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.a); g.lineWidth = Math.max(2, 1.6 * k); g.strokeStyle = b === opt.sel ? '#ffd34a' : '#ffffff'; const w = b.w * k + 4, h = b.h * k + 4; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
    g.restore();
  }
  // місто на карті: на карті воно проявляється з наближенням; view — карта (k пікселів на клітинку)
  const morph = (s, k, CS) => { const z = A.Town.sizeOf(s); return sm((z.R * k / CS - 26) / 40); };
  function onMap(cv, W, view, L, list) {
    const g = cv.getContext('2d'), CS = W.params.kmPerCell * 1000; g.save();
    for (const [s, c] of list) { const t = morph(s, view.k, CS); if (t <= 0.01) continue; const tx = view.tx + (s.x + 0.5) * view.k, ty = view.ty + (s.y + 0.5) * view.k, r = c.Rmap * view.k / CS; if (tx + r < 0 || ty + r < 0 || tx - r > cv.width || ty - r > cv.height) continue; draw(cv, c, { k: view.k / CS, tx, ty }, { map: true, alpha: t, districts: L.cdist !== false, names: L.cnames !== false, labels: L.clabels !== false }); }
    g.restore();
  }
  A.TownDraw = { draw, onMap, overlay, morph };
})();
