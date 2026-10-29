// Атлас 2.0: порожні острови. Острів з однією провінцією, де менше 3 регіонів або жодного морського порту, лишається без міст і поселень (жителям нема звідки брати ресурси): провінція знімається, суша стає нічиєю.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  // S — щойно створені поселення; змінює W і S на місці; повертає множину id суходолів, які лишаються порожніми
  function pruneIslands(W, S) {
    const empty = new Set(); if (A.Params.isVoid(W.params)) return empty;
    const { w, h } = W, N = w * h, lmProvs = new Map();
    for (let i = 0; i < N; i++) if (W.province[i] >= 0) { const m = W.landmass[i]; (lmProvs.get(m) || lmProvs.set(m, new Set()).get(m)).add(W.province[i]); }
    const provLms = new Map(); for (const [m, ps] of lmProvs) for (const k of ps) (provLms.get(k) || provLms.set(k, new Set()).get(k)).add(m);
    const dead = new Set();
    for (const [m, ps] of lmProvs) {
      if (ps.size !== 1 || provLms.get([...ps][0]).size !== 1) continue; const k = [...ps][0], p = W.provinces[k];
      if (p.regions.length >= 3 && S.some(s => s.prov === k && s.port && s.body === -1)) continue;
      dead.add(k); empty.add(m);
    }
    if (!dead.size) return empty;
    const pm = new Map(), rm = new Map(), prov = [], reg = [];
    W.provinces.forEach(p => { if (!dead.has(p.id)) { pm.set(p.id, prov.length); prov.push(p); } });
    W.regions.forEach(g => { if (!dead.has(g.prov)) { rm.set(g.id, reg.length); reg.push(g); } });
    const fix = (arr, map) => { for (let i = 0; i < N; i++) if (arr[i] >= 0) arr[i] = map.has(arr[i]) ? map.get(arr[i]) : -1; };
    fix(W.province, pm); fix(W.region, rm); fix(W.provW, pm); fix(W.regW, rm);
    const keep = S.filter(s => !dead.has(s.prov)), sm = new Map(); keep.forEach((s, n) => sm.set(s.id, n));
    S.length = 0; keep.forEach((s, n) => { s.id = n; s.prov = pm.get(s.prov); s.region = rm.get(s.region); S.push(s); });
    reg.forEach((g, n) => { g.id = n; g.prov = pm.get(g.prov); if (g.center != null) g.center = sm.get(g.center); });
    prov.forEach((p, n) => { p.id = n; p.regions = p.regions.map(id => rm.get(id)); if (p.capital != null) p.capital = sm.get(p.capital); });
    W.provinces = prov; W.regions = reg;
    return empty;
  }
  A.pruneIslands = pruneIslands;
})();
