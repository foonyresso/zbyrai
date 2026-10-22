// Раси «Материка»: раси змішані в поселеннях (файли ../../races/*.js). Народів немає.
// Окремий потік випадкових чисел, тож решта світу (карта, назви, дороги) не змінюється. Без реєстру Atlas нічого не робить.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const CAP = { hamlet: 3, mine: 4, village: 5, town: 9 }; // скільки рас вміщає поселення; центри регіонів і столиці — усі

  // раси поселення: [{ id, name, share }], відбір без повторів за вагою (ключ u^(1/w))
  function raceMix(seed, s, races) {
    const rnd = R.Rng.stream(seed, 'races' + s.id), wt = r => r.weight;
    const keyed = races.map(r => ({ r, k: Math.pow(Math.max(1e-9, rnd()), 1 / wt(r)), u: rnd() })).sort((a, b) => b.k - a.k).slice(0, CAP[s.rank] || 99);
    const out = keyed.map(q => ({ id: q.r.id, name: q.r.name, share: wt(q.r) * (0.6 + 0.8 * q.u) })), t = out.reduce((a, o) => a + o.share, 0);
    for (const o of out) o.share = Math.round(o.share / t * 1000) / 1000;
    return out.sort((a, b) => b.share - a.share);
  }

  function assign(world, p) {
    const A = globalThis.Atlas;
    if (!A || !A.races || !A.races.length) return;
    const rs = A.racesFor ? A.racesFor(p.theme && p.theme !== 'continent' ? p.theme : ({ island: 'island', archipelago: 'archipelago', pangea: 'pangea' })[p.worldType] || 'continent') : A.races; // id виміру = тема
    for (const s of world.settlements) s.races = raceMix(p.seed, s, rs);
  }
  R.Races = { assign, raceMix };
})();
