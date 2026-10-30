// Атлас 2.0: прив'язка точок ресурсів до поселень і баланс. Кожна точка належить найближчому (з урахуванням «впливу» за рангом) живому поселенню;
// життєві потреби (їжа, вода, дрова) покриваються власними точками, нестача добудовується (поля, джерела, гаї), решта — імпорт (порт або дорога). eco кожного поселення: {need, prod, imp, via, nodes, other}.
(function () {
  'use strict';
  const A = globalThis.Atlas2, N_ = A.Needs, VITAL = ['water', 'food', 'wood'];
  const WOOD_TYPES = ['resource.oak_grove', 'resource.birch_grove', 'resource.pine_forest', 'resource.willow', 'resource.palm_grove'];

  function run(W, nodes, api) {
    const { w, h } = W, km = api.km, cm = api.cm, S = W.settlements, live = S.filter(s => !s.ruined && !s.fate && s.pop > 0);
    const reach = s => N_.REACH_KM[s.rank] / km, byId = Object.fromEntries(api.types.map(t => [t.id, t]));
    // 1. прив'язка: найменше d / вплив серед тих, до кого дотягується
    const keep = [];
    for (const n of nodes) {
      const t = byId[n.type]; let best = null, bv = 1e9;
      if (t.on === 'deep') { for (const s of live) if (s.port) { const d = Math.hypot(s.x - n.x, s.y - n.y) * km; if (d < 25 && d < bv) { bv = d; best = s; } } }
      else for (const s of live) { if (t.on === 'land' || t.on === 'river' ? s.landmass !== W.landmass[n.i] : false) continue; const d = Math.hypot(s.x - n.x, s.y - n.y), R = reach(s); if (d < R && d / R < bv) { bv = d / R; best = s; } }
      if (best) { n.sid = best.id; keep.push(n); }
    }
    nodes.length = 0; keep.forEach((n, k) => { n.id = k; nodes.push(n); });
    // 2. баланс, від малих до великих (малі першими беруть найближчі поля)
    const bySid = new Map(); for (const n of nodes) (bySid.get(n.sid) || bySid.set(n.sid, []).get(n.sid)).push(n);
    const sumOut = (list, res) => { let v = 0; for (const n of list) for (const o of n.out) if (o.res === res) v += o.qty; return v; };
    const wBiggest = W.lm.list[0].area, isle = s => (W.lm.list.find(m => m.id === s.landmass) || { area: 0 }).area < 0.25 * wBiggest;
    const haveWater = s => W.waterDist && W.waterDist[s.i] * cm <= 2000;
    function extra(s, t, list) { // додає точку типу t поблизу s; false, якщо місця нема
      const R = Math.ceil(reach(s)), md = Math.max(0.5, t.dist / cm), cand = [];
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const d = Math.hypot(dx, dy); if (d > R || d < 1.5) continue;
        const i = y * w + x; if (W.region[i] < 0 || W.landmass[i] !== s.landmass || api.sold.has(i) || !api.fits(t, i)) continue; cand.push([d * (0.8 + 0.4 * api.r()), i]);
      }
      cand.sort((a, b) => a[0] - b[0]);
      for (const [, i] of cand) {
        const x = (i % w) + 0.2 + 0.6 * api.r(), y = ((i / w) | 0) + 0.2 + 0.6 * api.r(); if (api.tooClose(t, x, y, md)) continue;
        const reg = W.region[i], n = api.makeNode(t, i, x, y, reg, W.regions[reg].prov); n.id = nodes.length; n.sid = s.id; n.extra = true;
        nodes.push(n); list.push(n); (api.placed.get(t.id) || api.placed.set(t.id, []).get(t.id)).push(n); return true;
      }
      return false;
    }
    for (const s of live.slice().sort((a, b) => a.pop - b.pop)) {
      const list = bySid.get(s.id) || (bySid.set(s.id, []), bySid.get(s.id)), need = N_.need(s.pop), prod = {}, imp = {}, nat = haveWater(s);
      for (const k of VITAL) prod[k] = sumOut(list, k);
      if (nat) prod.water = Math.max(prod.water, need.water); // річка, озеро чи море поряд: води вистачає
      for (const k of VITAL) {
        for (let tries = 0; prod[k] < need[k] && tries < 400; tries++) {
          const ts = k === 'food' ? ['resource.farmland'] : k === 'water' ? ['resource.spring'] : WOOD_TYPES.slice().sort(() => api.r() - 0.5);
          let ok = false; for (const id of ts) { const n0 = nodes.length; if (extra(s, byId[id], list)) { ok = true; prod[k] += nodes[n0].out.filter(o => o.res === k).reduce((a, o) => a + o.qty, 0); break; } }
          if (!ok) break;
        }
        if (prod[k] < need[k]) imp[k] = Math.ceil((need[k] - prod[k]) * 10) / 10;
      }
      const other = {}; for (const n of list) for (const o of n.out) if (VITAL.indexOf(o.res) < 0) other[o.res] = (other[o.res] || 0) + o.qty;
      const r1 = v => Math.round(v * 10) / 10;
      s.eco = { need, prod: { food: r1(prod.food), water: r1(prod.water), wood: r1(prod.wood) }, imp, via: Object.keys(imp).length ? (isle(s) ? 'port' : 'road') : null, natWater: nat, nodes: list.length, other };
      if (!nat) {} // води з джерел
    }
    nodes.forEach((n, k) => { n.id = k; });
  }
  A.ResAssign = { run };
})();
