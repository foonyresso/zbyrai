// Атлас 2.0: кадри світу для демонстрації «Як генерується карта». Малює стан світу після кожного етапу конвеєра (рельєф → води → біоми → провінції → поселення → дороги → …) у окреме полотно.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const PAL = ['#b58fd1', '#e0a35f', '#7fbf7f', '#e08f8f', '#6fb8c9', '#d6c75a', '#9aa0e0', '#d98fc0', '#8fc9a6', '#c9a07a'];
  const TIER = [null, [255, 232, 110, 70], [255, 170, 60, 85], [240, 100, 45, 100], [205, 45, 45, 115], [150, 20, 75, 135], [60, 0, 70, 150]];
  const RAD = [7, 5, 3.8, 2.6, 2];
  // порядок етапів: кадр містить усі шари до свого включно
  const ORDER = ['terrain', 'hydrology', 'climate', 'politics', 'settlements', 'roads', 'landmarks', 'searoutes', 'seas', 'danger', 'sites'];

  // дані кадру: до кліматичного кроку світу ще немає, тож беремо проміжні масиви ландшафту й гідрології
  function view(c) {
    const T = c.T, H = c.H, W = c.world;
    if (W) return W;
    return { w: c.p.w, h: c.p.h, land: T.land, ocean: T.ocean, elev: T.elev, sea: T.sea, lake: H ? H.lake : null, river: H ? H.river : null, rivers: H ? H.rivers : null, acc: H ? H.acc : null, riverThr: H ? H.riverThr : 20, bio: null, params: c.p };
  }
  // базова картинка клітин: висота або біом, світлотінь з північного заходу
  function baseImage(V, mode) {
    const { w, h } = V, im = new ImageData(w, h), d = im.data, cols = mode === 'bio' ? A.BIOMES.map(b => hex(b.color)) : null;
    let mx = 0.001; for (let i = 0; i < w * h; i++) if (V.land[i] && V.elev[i] > mx) mx = V.elev[i];
    const el = i => V.land[i] ? V.elev[i] : V.sea * 0.6;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, o = i * 4; let r, g, b;
      if (!V.land[i]) { const t = Math.max(0, Math.min(1, (V.sea - V.elev[i]) * 2.5)); r = 110 - 50 * t; g = 160 - 60 * t; b = 205 - 50 * t; }
      else {
        if (cols) { const cc = cols[V.bio[i]]; r = cc[0]; g = cc[1]; b = cc[2]; }
        else { const t = Math.max(0, Math.min(1, (V.elev[i] - V.sea) / (mx - V.sea))); // зелений → жовтий → коричневий → білий
          if (t < 0.35) { const u = t / 0.35; r = 120 + 80 * u; g = 170 + 20 * u; b = 100 + 10 * u; } else if (t < 0.7) { const u = (t - 0.35) / 0.35; r = 200 - 50 * u; g = 190 - 60 * u; b = 110 - 20 * u; } else { const u = (t - 0.7) / 0.3; r = 150 + 100 * u; g = 130 + 120 * u; b = 90 + 160 * u; } }
        const ex = el(Math.min(w * h - 1, i + 1)) - el(Math.max(0, i - 1)), ey = el(Math.min(w * h - 1, i + w)) - el(Math.max(0, i - w)), f = 1 + Math.max(-0.3, Math.min(0.3, (-ex - ey) * 6));
        r *= f; g *= f; b *= f;
      }
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    return im;
  }
  const toCv = (im) => { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; cv.getContext('2d').putImageData(im, 0, 0); return cv; };
  // кадр: id етапу, c — стан конвеєра; opts.roadLevel — до якого рівня доріг показувати (для підкадрів доріг)
  function frame(id, c, S, opts) {
    opts = opts || {}; const V = view(c), { w, h } = V, up = ORDER.indexOf(id), has = k => up >= ORDER.indexOf(k);
    const cv = document.createElement('canvas'); cv.width = w * S; cv.height = h * S; const g = cv.getContext('2d');
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(toCv(baseImage(V, has('climate') ? 'bio' : 'elev')), 0, 0, w * S, h * S);
    if (has('danger') && V.tier) { const im = new ImageData(w, h); for (let i = 0; i < w * h; i++) { const q = TIER[V.tier[i]]; if (q) { im.data[i * 4] = q[0]; im.data[i * 4 + 1] = q[1]; im.data[i * 4 + 2] = q[2]; im.data[i * 4 + 3] = q[3]; } } g.drawImage(toCv(im), 0, 0, w * S, h * S); }
    if (has('politics') && V.province) { // заливка провінцій і межі (товсті провінцій, тонкі регіонів)
      const im = new ImageData(w, h); for (let i = 0; i < w * h; i++) { const p = V.province[i]; if (p >= 0 && V.land[i]) { const q = hex(PAL[p % PAL.length]); im.data[i * 4] = q[0]; im.data[i * 4 + 1] = q[1]; im.data[i * 4 + 2] = q[2]; im.data[i * 4 + 3] = 105; } }
      g.drawImage(toCv(im), 0, 0, w * S, h * S);
      const edge = (arr, col, lw) => { g.beginPath(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, a = arr[i]; if (a < 0 || !V.land[i]) continue; if (x + 1 < w && arr[i + 1] !== a && arr[i + 1] >= 0) { g.moveTo((x + 1) * S, y * S); g.lineTo((x + 1) * S, (y + 1) * S); } if (y + 1 < h && arr[i + w] !== a && arr[i + w] >= 0) { g.moveTo(x * S, (y + 1) * S); g.lineTo((x + 1) * S, (y + 1) * S); } } g.strokeStyle = col; g.lineWidth = lw; g.stroke(); };
      edge(V.region, 'rgba(60,40,70,.35)', Math.max(0.6, S * 0.25)); edge(V.province, 'rgba(50,30,60,.85)', Math.max(1.2, S * 0.55));
    }
    // озера й річки
    if (V.lake) { const im = new ImageData(w, h); for (let i = 0; i < w * h; i++) if (V.lake[i] && V.land[i]) { im.data[i * 4] = 100; im.data[i * 4 + 1] = 160; im.data[i * 4 + 2] = 220; im.data[i * 4 + 3] = 255; } g.drawImage(toCv(im), 0, 0, w * S, h * S); }
    if (V.rivers) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#4f86c6'; for (const cells of V.rivers) { g.beginPath(); cells.forEach((i, n) => { const x = ((i % w) + 0.5) * S, y = (((i / w) | 0) + 0.5) * S; n ? g.lineTo(x, y) : g.moveTo(x, y); }); const a = V.acc[cells[cells.length - 1]] || 1; g.lineWidth = Math.max(0.8, S * (0.18 + 0.12 * Math.log2(1 + a / (V.riverThr || 20)))); g.stroke(); } }
    // дороги: до заданого рівня (1 головні … 4 хутори)
    if (has('roads') && V.roads) {
      const maxL = opts.roadLevel || 9; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const pass of [0, 1]) for (const rd of V.roads) { if (rd.level > maxL) continue; g.beginPath(); rd.cells.forEach((i, n) => { const x = ((i % w) + 0.5) * S, y = (((i / w) | 0) + 0.5) * S; n ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = pass ? ['', '#7a3b1d', '#8a5a2c', '#9a7a4a', '#a89070'][rd.level] : 'rgba(255,255,255,.7)'; g.lineWidth = (pass ? 1 : 2.2) * Math.max(1, S * (rd.level === 1 ? 0.5 : rd.level === 2 ? 0.38 : 0.28)); g.setLineDash(rd.level >= 4 && pass ? [S, S] : []); g.stroke(); }
      g.setLineDash([]); g.fillStyle = '#fff'; g.strokeStyle = '#7a3b1d'; g.lineWidth = 1; for (const i of V.bridges || []) { if (V.roadLevel && V.roadLevel[i] > maxL) continue; const x = ((i % w) + 0.5) * S, y = (((i / w) | 0) + 0.5) * S, r = Math.max(1.8, S * 0.6); g.fillRect(x - r, y - r, r * 2, r * 2); g.strokeRect(x - r, y - r, r * 2, r * 2); }
    }
    if (has('searoutes') && V.seaRoutes) { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1, S * 0.3); g.setLineDash([S * 1.6, S * 1.2]); for (const r of V.seaRoutes) { g.beginPath(); r.cells.forEach((i, n) => { const x = ((i % w) + 0.5) * S, y = (((i / w) | 0) + 0.5) * S; n ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); } g.setLineDash([]); }
    if (has('landmarks') && V.landmarks) { g.fillStyle = '#7a5ad0'; g.strokeStyle = '#fff'; g.lineWidth = 1; const r = Math.max(2, S * 0.7); for (const q of V.landmarks) { const x = (q.x + 0.5) * S, y = (q.y + 0.5) * S; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill(); g.stroke(); } }
    if (has('sites') && V.sites) { for (const q of V.sites) { g.beginPath(); g.arc((q.x + 0.5) * S, (q.y + 0.5) * S, Math.max(1.6, S * 0.5), 0, 6.3); g.fillStyle = '#c0302f'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 0.8; g.stroke(); } }
    if (has('settlements') && V.settlements) {
      const sc = Math.max(1, S / 3);
      V.settlements.forEach(s => { const k = ['capital', 'regional', 'town', 'village', 'hamlet'].indexOf(s.rank), r = RAD[k] * sc, x = (s.x + 0.5) * S, y = (s.y + 0.5) * S; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = s.ruined ? '#888' : k <= 1 ? '#222' : '#fff'; g.fill(); g.strokeStyle = k <= 1 ? '#fff' : '#222'; g.lineWidth = Math.max(1, sc); g.stroke(); if (k === 0) { g.beginPath(); g.arc(x, y, r + 2 * sc, 0, 6.3); g.stroke(); } });
    }
    if (has('seas') && V.waterBodies) { g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `italic 600 ${Math.max(11, S * 4)}px sans-serif`; for (const b of V.waterBodies) { if (b.kind === 'lake' || b.cells < 400) continue; g.lineWidth = 3; g.strokeStyle = 'rgba(20,50,90,.6)'; g.strokeText(b.name, b.cx * S, b.cy * S); g.fillStyle = '#eaf4ff'; g.fillText(b.name, b.cx * S, b.cy * S); } }
    if (has('settlements') && V.settlements) { g.textAlign = 'center'; g.textBaseline = 'bottom'; g.font = `700 ${Math.max(10, S * 3.2)}px sans-serif`; for (const s of V.settlements) { if (s.rank !== 'capital') continue; const x = (s.x + 0.5) * S, y = (s.y + 0.5) * S - RAD[0] * Math.max(1, S / 3) - 2; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeText(s.name, x, y); g.fillStyle = '#201810'; g.fillText(s.name, x, y); } }
    return cv;
  }
  A.StepsWorld = { frame, ORDER };
})();
