// Народи й раси «Материка»: кожна провінція належить одному народові (файли ../../peoples/*.js), раси змішані в поселеннях (../../races/*.js).
// Окремі потоки випадкових чисел, тож решта світу (карта, назви, дороги) не змінюється. Без реєстру Atlas нічого не робить.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const CAP = { hamlet: 3, mine: 4, village: 5, town: 9 }; // скільки рас вміщає поселення; центри регіонів і столиці — усі
  const GROUPS = { cold: ['tundra', 'taiga'], dry: ['desert', 'wasteland'], wet: ['swamp'], mountain: ['mountain', 'peaks', 'hills'], forest: ['forest', 'taiga', 'enchanted'] };

  // прикмети місця: клімат, рельєф і узбережжя навколо клітинки (радіус 3)
  function tagsAt(world, cell) {
    const g = world.grid, cx = g.cx[cell], cy = g.cy[cell], cnt = {}; let water = 0, n = 0;
    for (let i = 0; i < g.n; i++) {
      if (Math.abs(g.cx[i] - cx) > 3 || Math.abs(g.cy[i] - cy) > 3) continue;
      n++; if (world.water[i]) { water++; continue; }
      const id = R.Data.biomes[world.bio[i]].id;
      for (const k in GROUPS) if (GROUPS[k].includes(id)) cnt[k] = (cnt[k] || 0) + 1;
    }
    const t = Object.keys(cnt).filter(k => cnt[k] >= Math.max(3, n * 0.2));
    if (water >= 3 && water < n * 0.7) t.push('coast');
    if (!t.length) t.push('temperate');
    return t;
  }

  function weightedPick(list, w, u) { let tot = 0; for (const x of list) tot += w(x); let a = u * tot; for (const x of list) { a -= w(x); if (a <= 0) return x; } return list[list.length - 1]; }

  // раси поселення: [{ id, name, share }], відбір без повторів за вагою (ключ u^(1/w))
  function raceMix(seed, s, people, races) {
    const rnd = R.Rng.stream(seed, 'races' + s.id), bias = people.raceBias || {};
    const wt = r => r.weight * (bias[r.id] || 1) * (r.category === 'звіролюд' ? (bias.beast || 1) : 1);
    const keyed = races.map(r => ({ r, k: Math.pow(Math.max(1e-9, rnd()), 1 / wt(r)), u: rnd() })).sort((a, b) => b.k - a.k).slice(0, CAP[s.rank] || 99);
    const out = keyed.map(q => ({ id: q.r.id, name: q.r.name, share: wt(q.r) * (0.6 + 0.8 * q.u) })), t = out.reduce((a, o) => a + o.share, 0);
    for (const o of out) o.share = Math.round(o.share / t * 1000) / 1000;
    return out.sort((a, b) => b.share - a.share);
  }

  function assign(world, p) {
    const A = globalThis.Atlas;
    if (!A || !A.peoples || !A.peoples.length) return;
    const rnd = R.Rng.stream(p.seed, 'peoples'), used = {};
    for (const pv of world.provinces) {
      const cap = world.settlements[pv.capital], tg = tagsAt(world, cap.cell);
      // народи, що вже є в інших провінціях, трохи менш імовірні: у світі видно різні культури
      const pe = weightedPick(A.peoples, q => (1 + 4 * q.habitat.filter(h => tg.includes(h)).length + (q.habitat.includes('any') ? 2 : 0)) * Math.pow(0.35, used[q.id] || 0), rnd());
      used[pe.id] = (used[pe.id] || 0) + 1; pv.people = pe.id; pv.peopleName = pe.name;
    }
    const byId = id => A.peoples.find(q => q.id === id);
    for (const s of world.settlements) {
      const pe = byId(world.provinces[s.province].people);
      s.people = pe.id; s.look = pe.look;
      if (A.races.length) s.races = raceMix(p.seed, s, pe, A.races);
    }
  }
  R.Peoples = { assign, tagsAt, raceMix };
})();
