// Атлас 2.0: природні точки ресурсів (етап після локацій). Каталог: resdata.js. Кожна точка: {id, type, name, x, y, i, region, prov, tier}; W.resources.
// Точки лише на землях провінцій (порожні острови без нічого); кількість на регіон з каталогу; між однаковими типами мінімальна відстань.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const hm = (e) => Math.max(0, (e - 0.4) * 480); // висота над морем, м (гори ~90–230 м)

  function resources(W) {
    const { w, h } = W, N = w * h, km = W.params.kmPerCell, cm = km * 1000, r = A.Rng.stream(W.params.seed, 'resources'), out = [];
    const bioId = i => { const b = A.BIOMES[W.bio[i]]; return b.alias || b.id; };
    const sold = new Set(); for (const s of W.settlements) sold.add(s.i);
    const oceanNear = new Uint8Array(N), slope = new Float32Array(N), dLand = new Float32Array(N).fill(1e9), q = [];
    for (let i = 0; i < N; i++) {
      const x = i % w, y = (i / w) | 0; let sl = 0, oc = 0;
      for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (W.ocean[j]) oc = 1; if (d < 4) sl = Math.max(sl, Math.abs(hm(W.elev[j]) - hm(W.elev[i]))); }
      oceanNear[i] = oc; slope[i] = sl; if (W.land[i] && !W.lake[i]) { dLand[i] = 0; q.push(i); }
    }
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (dLand[j] > dLand[i] + 1) { dLand[j] = dLand[i] + 1; q.push(j); } } }
    const hillMin = 45, smallLm = new Set(W.lm.list.filter(m => m.area < 0.2 * W.lm.list[0].area).map(m => m.id));
    const hot = i => W.temp[i] > 0.55, cold = i => W.temp[i] < 0.3; // температура 0..1 з клімату
    // чи клітина підходить типу (без урахування сусідніх точок)
    function fits(t, i) {
      const land = W.land[i] && !W.lake[i], c = t.cond, tier = A.ResData.TIER[t.tier], tr = W.tier[i];
      if (t.on === 'land' || t.on === 'river') {
        if (!land) return false; if (t.on === 'river' && !W.river[i]) return false; if (t.on === 'land' && W.river[i]) return false;
        if (t.bio) { const b = bioId(i); let ok = false; for (const k of t.bio) { if (k === b || (k === 'hills' && b !== 'mountain' && b !== 'snow' && hm(W.elev[i]) >= hillMin && b !== 'desert') || (k === 'beach' && oceanNear[i] && W.land[i])) { ok = true; break; } } if (!ok) return false; }
      } else if (t.on === 'lake') { if (!W.lake[i]) return false; }
      else if (t.on === 'shore') { if (!W.ocean[i] || dLand[i] > 2) return false; }
      else if (t.on === 'deep') { if (!W.ocean[i] || dLand[i] * cm < 2000) return false; }
      if (land && (tr < tier[0] || tr > tier[1])) return false;
      const hh = hm(W.elev[i]); if (t.h && land && (hh < t.h[0] || hh > t.h[1])) return false;
      if (c.slope && slope[i] < c.slope) return false;
      if (c.water && W.waterDist[i] * cm > Math.max(c.water, cm * 1.5)) return false;
      if (c.isle && !smallLm.has(W.landmass[i])) return false;
      if (c.warm && !hot(i)) return false; if (c.cold && !cold(i)) return false;
      return true;
    }
    const placed = new Map(); // id → список точок типу
    const tooClose = (t, x, y, md) => { for (const o of placed.get(t.id) || []) if (Math.hypot(o.x - x, o.y - y) < md) return true; return false; };
    const nearTo = (t, x, y) => { if (!t.cond.near) return true; const [oid, m] = t.cond.near; for (const o of placed.get('resource.' + oid) || []) if (Math.hypot(o.x - x, o.y - y) * cm <= m) return true; return false; };
    // типи, від яких залежать інші (олово біля міді), розставляються першими: порядок каталогу це гарантує
    const prov = A.ResData.LIST.filter(t => !t.cond.dungeon), byReg = new Map(), byProv = new Map(), deep = new Map();
    for (const t of prov) { byReg.set(t.id, new Map()); byProv.set(t.id, new Map()); deep.set(t.id, []); }
    for (let i = 0; i < N; i++) {
      const reg = W.region[i] >= 0 ? W.region[i] : W.regW && W.regW[i] >= 0 ? W.regW[i] : -1;
      for (const t of prov) {
        if (t.on === 'deep') { if (fits(t, i)) deep.get(t.id).push(i); continue; }
        if (reg < 0) continue; if (t.on !== 'land' && t.on !== 'river' && !(W.ocean[i] || W.lake[i])) continue;
        if (sold.has(i) || !fits(t, i)) continue;
        const key = t.perProv ? W.regions[reg].prov : reg, mp = t.perProv ? byProv.get(t.id) : byReg.get(t.id);
        (mp.get(key) || mp.set(key, []).get(key)).push(i);
      }
    }
    // вузол: якість (бідна ×0,7 / звичайна / багата ×1,35) визначає добич за добу
    const makeNode = (t, i, x, y, reg, p) => {
      const u = r(), f = u < 0.3 ? 0.7 : u < 0.8 ? 1 : 1.35, q = f < 1 ? 'poor' : f > 1 ? 'rich' : 'normal';
      const node = { id: out.length, type: t.id, name: t.name, mat: t.mat, x: +x.toFixed(2), y: +y.toFixed(2), i, region: reg, prov: p, tier: W.tier[i], q, out: t.out.map(([res, item, v]) => ({ res, item, qty: Math.max(1, Math.round(v * f)) })) };
      if (t.animals) { const a = t.animals.slice().sort(() => r() - 0.5); node.animals = a.slice(0, 2 + Math.floor(r() * 2)); }
      return node;
    };
    const place = (t, cells, want, regId) => {
      let got = 0, tries = 0; const md = Math.max(0.5, t.dist / cm);
      while (got < want && cells.length && tries++ < want * 30 + 30) {
        const k = (r() * cells.length) | 0, i = cells[k], x = (i % w) + 0.2 + 0.6 * r(), y = ((i / w) | 0) + 0.2 + 0.6 * r();
        if (tooClose(t, x, y, md) || !nearTo(t, x, y)) continue;
        const reg = regId != null ? regId : (W.region[i] >= 0 ? W.region[i] : W.regW[i]), p = reg >= 0 ? W.regions[reg].prov : -1;
        const node = makeNode(t, i, x, y, reg, p);
        out.push(node); (placed.get(t.id) || placed.set(t.id, []).get(t.id)).push(node); got++; cells.splice(k, 1);
      }
    };
    const count = (t) => { const [a, b] = t.per[0] !== undefined ? t.per : [0, 0]; if (t.cond.rare && r() > t.cond.rare) return 0; return a + Math.floor(r() * (b - a + 1)); };
    for (const t of prov) {
      if (t.cond.bal) continue;
      if (t.on === 'deep') { place(t, deep.get(t.id), Math.max(1, Math.round(W.regions.length * (t.per[0] + t.per[1]) / 2 * 0.5))); continue; }
      const mp = t.perProv ? byProv.get(t.id) : byReg.get(t.id);
      for (const [key, cells] of mp) place(t, cells, count(t), t.perProv ? null : key);
    }
    const api = { fits, tooClose, nearTo, makeNode, placed, cm, km, bioId, r, sold, types: prov };
    A.ResAssign.run(W, out, api); for (const n of out) n.road = A.ResData.byId[n.type].road; A.ResRoads.run(W, out);
    W.resources = out; W.resourceTypes = prov.map(t => ({ id: t.id, name: t.name, grp: t.grp, mat: t.mat, res: t.res }));
  }
  A.resources = resources;
  (A.stages = A.stages || []).push(resources);
})();
