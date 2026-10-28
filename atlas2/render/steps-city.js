// Атлас 2.0: кадри міста для демонстрації «Як генерується карта». Малює знімки A.CityTrace (вода, дороги, вулиці, райони, площі, замок, споруди, поля, стіна) векторно; останній кадр — готове місто звичайним малюнком.
(function () {
  'use strict';
  const A = globalThis.Atlas2, D = A.CityData, TAU = Math.PI * 2;
  // кадр = стан після етапу; 'site' — місце до будь-яких вулиць, 'final' — готове місто
  const STAGES = ['site', 'roads', 'side', 'paths', 'districts', 'features', 'castle', 'buildings', 'nature', 'wall', 'final'];
  const ROAD = { avenue: ['#8b7a5a', '#f0e3bd'], street: ['#9a8a6a', '#ece0c4'], lane: ['#a89878', '#e6dac0'], ring: ['#9a8a6a', '#ece0c4'], embankment: ['#9c8d6c', '#dccfa8'], path: ['#a99a79', '#dccfae'] };
  const FEAT = { plaza: ['#efe3c0', '#9a8a6a'], park: ['#a9cf86', '#6f9a54'], pond: ['#7fb2e0', '#4f86c6'], site: ['#d8cdb4', '#8a7e66'] };
  const CROP = ['#dccf84', '#cfd28a', '#d8c48e', '#c9d48c'];
  const upto = (T, i, ids) => { let r = null; for (let k = Math.min(i, STAGES.length - 1); k >= 0; k--) if (ids.includes(STAGES[k]) && T.snaps[STAGES[k]]) { r = T.snaps[STAGES[k]]; break; } return r; };
  const poly = (g, p, k) => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); };
  function waterLayer(T) {
    if (T._water) return T._water; const S = T.snaps.roads, E = S.Rmap + 200, n = 700, PX = E * 2 / n, cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = S.waterKind(-E + (i + 0.5) * PX, -E + (j + 0.5) * PX), o = (j * n + i) * 4; if (v) { im.data[o] = v === 2 ? 79 : 98; im.data[o + 1] = v === 2 ? 134 : 152; im.data[o + 2] = v === 2 ? 184 : 198; im.data[o + 3] = 255; } }
    g.putImageData(im, 0, 0); return (T._water = { cv, E });
  }
  function districtLayer(T, an) {
    if (T._dist) return T._dist; const S = T.snaps.roads, E = S.R * 1.3, n = 160, PX = E * 2 / n, cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = -E + (i + 0.5) * PX, y = -E + (j + 0.5) * PX; if (Math.hypot(x - S.c0[0], y - S.c0[1]) > S.R * 1.1 || S.waterKind(x, y)) continue;
      let b = 0, bd = 1e18; an.anchors.forEach((a, k) => { const q = Math.hypot(a.x - x, a.y - y) * a.wt; if (q < bd) { bd = q; b = k; } });
      const c = D.K[an.anchors[b].kind].col, o = (j * n + i) * 4; im.data[o] = parseInt(c.slice(1, 3), 16); im.data[o + 1] = parseInt(c.slice(3, 5), 16); im.data[o + 2] = parseInt(c.slice(5, 7), 16); im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0); return (T._dist = { cv, E });
  }
  // початковий вид: місто по центру з запасом
  function fit(cv, T) { const R = T.snaps.roads.R * 1.55, k = Math.min(cv.width, cv.height) / (2 * R); return { k, tx: cv.width / 2, ty: cv.height / 2 }; }
  // idx — індекс у STAGES; v — {k, tx, ty}
  function draw(cv, T, idx, v) {
    const g = cv.getContext('2d'), id = STAGES[idx];
    if (id === 'final') { A.TownDraw.draw(cv, T.city, v, { names: true, labels: true, districts: true }); return; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#d3dcab'; g.fillRect(0, 0, cv.width, cv.height); g.save(); g.translate(v.tx, v.ty); const k = v.k, S0 = T.snaps.roads;
    const wl = waterLayer(T); g.imageSmoothingEnabled = true; g.drawImage(wl.cv, -wl.E * k, -wl.E * k, wl.E * 2 * k, wl.E * 2 * k);
    const nat = idx >= 8 ? T.snaps.nature : null;
    if (nat) for (const f of nat.fields) { poly(g, f.pts, k); g.closePath(); g.fillStyle = CROP[(f.crop || 0) % CROP.length]; g.fill(); g.strokeStyle = 'rgba(110,130,60,.7)'; g.lineWidth = Math.max(1, 0.6 * k); g.stroke(); }
    const an = idx >= 4 ? T.snaps.districts : null;
    if (an && an.anchors.length) { const dl = districtLayer(T, an), ga = g.globalAlpha; g.globalAlpha = 0.42; g.drawImage(dl.cv, -dl.E * k, -dl.E * k, dl.E * 2 * k, dl.E * 2 * k); g.globalAlpha = ga; g.font = '700 13px sans-serif'; g.textAlign = 'center'; for (const a of an.anchors) { g.beginPath(); g.arc(a.x * k, a.y * k, 5, 0, TAU); g.fillStyle = '#222'; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(D.K[a.kind].n, a.x * k, a.y * k - 9); g.fillStyle = '#2b2218'; g.fillText(D.K[a.kind].n, a.x * k, a.y * k - 9); } }
    // дороги карти, що входять у місто (етап «Місце»)
    if (idx === 0) { g.lineCap = 'round'; g.setLineDash([8, 6]); g.strokeStyle = '#7a3b1d'; g.lineWidth = 3; for (const r of S0.runs) { poly(g, r.pts, k); g.stroke(); } g.setLineDash([]); }
    const kp = idx >= 6 && T.snaps.castle ? T.snaps.castle.keep : null, fe = idx >= 5 ? (idx >= 7 ? T.snaps.buildings : idx === 6 && T.snaps.castle ? T.snaps.castle : T.snaps.features) : null;
    if (fe) for (const f of fe.F) { const c = FEAT[f.t]; if (!c) continue; g.beginPath(); g.arc(f.x * k, f.y * k, f.r * k, 0, TAU); g.fillStyle = c[0]; g.fill(); g.strokeStyle = c[1]; g.lineWidth = Math.max(1, 0.8 * k); g.stroke(); }
    if (kp) for (const wd of kp.wards) { poly(g, wd.poly, k); g.closePath(); g.fillStyle = wd.kind === 'motte' ? '#bfae86' : wd.kind === 'inner' ? '#ded8c4' : '#d3cdb8'; g.fill(); }
    // вулиці: нові на цьому етапі підсвічені, мости — червоним
    const st = upto(T, idx, ['roads', 'side', 'paths', 'castle']);
    if (st) {
      const prev = idx === 1 ? 0 : idx === 2 ? T.snaps.roads.streets.length : idx === 3 ? T.snaps.side.streets.length : -1; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const pass of [0, 1, 2]) st.streets.forEach((s, n) => {
        if (s.pts.length < 4) return; const fresh = prev >= 0 && n >= prev, hw = s.hw, col = ROAD[s.look || s.kind] || ROAD.street;
        if (pass === 2) { for (let i = 2; i < s.pts.length; i += 2) if (s.br[i / 2]) { g.beginPath(); g.moveTo(s.pts[i - 2] * k, s.pts[i - 1] * k); g.lineTo(s.pts[i] * k, s.pts[i + 1] * k); g.strokeStyle = '#a8321f'; g.lineWidth = Math.max(3, (hw * 2 + 3) * k); g.stroke(); g.strokeStyle = '#f2d6b0'; g.lineWidth = Math.max(1.6, hw * 2 * k); g.stroke(); } return; }
        poly(g, s.pts, k); g.strokeStyle = pass === 0 ? (fresh ? '#8a3a10' : col[0]) : (fresh ? '#ff9a4a' : col[1]); g.lineWidth = Math.max(pass === 0 ? 2 : 1, (hw * 2 + (pass === 0 ? 1.6 : 0)) * k); g.stroke();
      });
    }
    if (idx >= 7) {
      const bl = T.snaps.buildings; g.strokeStyle = '#6b5a45'; g.lineWidth = Math.max(0.5, 0.3 * k);
      for (const b of bl.B) { g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.a); g.fillStyle = (D.T[b.type] || {}).col || '#b79c74'; g.fillRect(-b.w * k / 2, -b.h * k / 2, b.w * k, b.h * k); if (k > 0.35) g.strokeRect(-b.w * k / 2, -b.h * k / 2, b.w * k, b.h * k); g.restore(); }
      g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(2, 3 * k); for (const p of bl.piers) { g.beginPath(); g.moveTo(p.x1 * k, p.y1 * k); g.lineTo(p.x2 * k, p.y2 * k); g.stroke(); }
    }
    if (nat) { g.fillStyle = 'rgba(70,120,60,.8)'; for (const t of nat.trees) { g.beginPath(); g.arc(t[0] * k, t[1] * k, Math.max(1, t[2] * k), 0, TAU); g.fill(); } }
    if (kp) {
      g.lineJoin = 'round'; const wl = (p, w) => { poly(g, p, k); g.strokeStyle = '#4c4c58'; g.lineWidth = Math.max(2, (w + 2) * k); g.stroke(); g.strokeStyle = '#a4a4b2'; g.lineWidth = Math.max(1.2, w * k); g.stroke(); };
      if (kp.inner) wl(kp.inner.poly, kp.inner.w); for (const run of kp.runs) wl(run, kp.w);
      for (const q of kp.towers) { g.beginPath(); g.arc(q.x * k, q.y * k, Math.max(2.5, q.r * k), 0, TAU); g.fillStyle = '#9090a2'; g.fill(); g.strokeStyle = '#3f3f4c'; g.lineWidth = 1; g.stroke(); }
      for (const q of kp.gates) { g.save(); g.translate(q.x * k, q.y * k); g.rotate(q.a); const gl = (kp.w + 7) * k, gw = Math.max(8, q.hw * 2 + 8.5) * k; g.fillStyle = q.main ? '#8f8fa0' : '#9a9aaa'; g.fillRect(-gl / 2, -gw / 2, gl, gw); g.strokeStyle = '#3f3f4c'; g.lineWidth = 1; g.strokeRect(-gl / 2, -gw / 2, gl, gw); g.restore(); }
      if (idx === 6) { g.setLineDash([7, 5]); poly(g, kp.poly.reduce((a, p) => a.concat(p), []).concat(kp.poly[0]), k); g.strokeStyle = '#ff9a4a'; g.lineWidth = 2.5; g.stroke(); g.setLineDash([]); g.font = '700 13px sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(kp.tn, kp.x * k, kp.y * k); g.fillStyle = '#2b2218'; g.fillText(kp.tn, kp.x * k, kp.y * k); }
    }
    const wl2 = idx >= 9 ? T.snaps.wall.wall : null;
    if (wl2 && wl2.on) {
      g.lineJoin = 'round'; for (const run of wl2.runs) { poly(g, run, k); g.strokeStyle = '#3f3a33'; g.lineWidth = Math.max(2, (wl2.w + 2) * k); g.stroke(); g.strokeStyle = wl2.mat === 'stone' ? '#c4bfb2' : '#9a7242'; g.lineWidth = Math.max(1.2, wl2.w * k); g.stroke(); }
      for (const q of wl2.towers) { g.beginPath(); g.arc(q[0] * k, q[1] * k, Math.max(2.5, (wl2.w * 0.75 + 1.5) * k), 0, TAU); g.fillStyle = '#9090a2'; g.fill(); g.strokeStyle = '#3f3f4c'; g.lineWidth = 1; g.stroke(); }
      for (const q of wl2.gates) { g.save(); g.translate(q.x * k, q.y * k); g.rotate(q.a); const gl = (wl2.w + 6) * k, gw = Math.max(10, (q.hw || 4) * 2 + 6) * k; g.fillStyle = '#8b6a45'; g.fillRect(-gl / 2, -gw / 2, gl, gw); g.restore(); }
    }
    // центр міста й радіус для орієнтира
    g.beginPath(); g.arc(S0.c0[0] * k, S0.c0[1] * k, 5, 0, TAU); g.fillStyle = '#c0302f'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
    g.setLineDash([6, 6]); g.beginPath(); g.arc(S0.c0[0] * k, S0.c0[1] * k, S0.R * k, 0, TAU); g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
    g.restore();
  }
  A.StepsCity = { STAGES, draw, fit };
})();
