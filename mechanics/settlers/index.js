/* Механіка «settlers»: прибульці, житло, професії, настрій і стосунки поселенців. Колоністи створюються
   генератором colonist-foundry (ColonistCore): ті самі риси, навички, передісторії. Без DOM.
   state = { seed, nextId, nextArrival, arrivals:[colonist], residents:[colonist] }; у colonist додано: home, job ('auto'|id|null), mood, hunger, low. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const CC = typeof ColonistCore !== 'undefined' ? ColonistCore : require('../../colonist-foundry/colonist-core.js');
  const BD = Mech.BuildingData || require('../building/data.js');
  const Rng = Mech.Rng || require('../rng/index.js');
  const MAX_WAIT = 3, STAY_DAYS = 10;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const g = (c, m, f) => c.female ? f : m;
  const create = seed => ({ seed: String(seed), nextId: 1, nextArrival: 2, arrivals: [], residents: [] });
  const all = st => st.residents.concat(st.arrivals);
  const find = (st, id) => all(st).find(c => c.id === id);
  const jobOf = type => CC.JOBS.find(j => j.id === BD.TYPES[type].job);
  // ефективність роботи в будівлі 0.4–1.6 за навичкою й пристрастю
  function eff(c, type) { const j = jobOf(type); if (!j) return 0.8; return clamp(0.45 + CC.effSkill(c, j.skill) / 14, 0.4, 1.6); }
  const profession = c => CC.profession(c);
  const fullName = c => CC.fullName(c);

  // раз на кілька діб приходить новий поселенець, якщо є будівлі з житлом і нема черги
  function maybeArrive(st, day, houseCap) {
    const ev = [];
    st.arrivals = st.arrivals.filter(c => { if (day - c.arrived > STAY_DAYS) { ev.push({ type: 'left', name: fullName(c), why: g(c, 'не дочекався відповіді', 'не дочекалась відповіді') }); return false; } return true; });
    if (day < st.nextArrival || !houseCap) return ev;
    const R = Rng.stream(st.seed, 'arrive' + day);
    st.nextArrival = day + 3 + Math.floor(R() * 4);
    if (st.arrivals.length >= MAX_WAIT) return ev;
    const id = st.nextId++, used = new Set(all(st).map(c => c.name));
    const c = CC.makeColonist(CC.rngFromSeed(`${st.seed}:s:${id}`), { id, seed: `${st.seed}:${id}`, used });
    c.id = id; Object.assign(c, { home: null, job: 'auto', work: null, mood: 55, hunger: 0, low: 0, arrived: day });
    st.arrivals.push(c); ev.push({ type: 'arrive', came: g(c, 'прийшов', 'прийшла'), id, name: fullName(c), prof: profession(c) });
    return ev;
  }
  const freeSlots = (st, town, house) => (BD.TYPES[house.type].house || 0) - st.residents.filter(c => c.home === house.id).length;
  function settle(st, town, id, houseId) {
    const c = st.arrivals.find(x => x.id === id), h = town.buildings.find(b => b.id === houseId);
    if (!c) return { ok: false, reason: 'Такого прибульця нема' };
    if (!h || !BD.TYPES[h.type].house) return { ok: false, reason: 'Це не житло' };
    if (freeSlots(st, town, h) <= 0) return { ok: false, reason: 'У будинку нема місця' };
    st.arrivals = st.arrivals.filter(x => x !== c); c.home = houseId; st.residents.push(c);
    return { ok: true };
  }
  const reject = (st, id) => { st.arrivals = st.arrivals.filter(x => x.id !== id); };
  const bestHouse = (st, town) => town.buildings.find(b => BD.TYPES[b.type].house && freeSlots(st, town, b) > 0);
  const slotsLeft = (st, b) => (BD.TYPES[b.type].jobs || 0) - st.residents.filter(c => c.work === b.id).length;

  // розподіл робіт: 'auto' сам обирає будівлю за навичкою й нестачею; число = наказ працювати в будівлі; null = без роботи
  function assignJobs(st, town, need) {
    const bs = town.buildings;
    for (const c of st.residents) {
      if (c.work && !bs.some(b => b.id === c.work)) c.work = null; // будівлю знесли
      if (c.job !== 'auto' && c.job != null) { const b = bs.find(x => x.id === c.job); if (!b) { c.job = 'auto'; } else if (c.work !== b.id && slotsLeft(st, b) > 0) c.work = b.id; }
      if (c.job === null) c.work = null;
    }
    for (const c of st.residents) {
      if (c.job !== 'auto' || c.work) continue;
      let best = null, bs2 = -1;
      for (const b of bs) { const T = BD.TYPES[b.type]; if (!T.jobs || slotsLeft(st, b) <= 0) continue; const j = jobOf(b.type); if (!j || c.noJobs.includes(j.id)) continue;
        const sc = CC.effSkill(c, j.skill) + ((T.yields && need[T.yields.res]) || 0) + (T.makes ? 2 : 0) + (b.type === 'hall' ? -5 : 0);
        if (sc > bs2) { bs2 = sc; best = b; } }
      if (best) c.work = best.id;
    }
  }
  const workersOf = (st, town) => { const m = {}; for (const c of st.residents) if (c.work) { const b = town.buildings.find(x => x.id === c.work); if (b) (m[b.id] = m[b.id] || []).push(eff(c, b.type)); } return m; };
  const opinion = (a, b) => CC.baseOpinion(a, b) + CC.baseOpinion(b, a);
  const relLabel = v => v >= 14 ? 'друзі' : v <= -14 ? 'не ладнають' : 'знайомі';

  // доба: харчування, настрій, відхід незадоволених. stock змінюється (їжа). Повертає події.
  function dayTick(st, town, stock, day) {
    const ev = [], tavern = town.buildings.some(b => BD.TYPES[b.type].mood && (st.residents.some(c => c.work === b.id)));
    for (const c of st.residents.slice()) {
      let ate = false;
      for (const r of ['grain', 'fish']) if ((stock[r] || 0) >= 1) { stock[r] -= 1; ate = true; break; }
      c.hunger = ate ? 0 : c.hunger + 1;
      let m = 55 + c.traits.reduce((a, t) => a + CC.TRAIT_BY[t].mood, 0) + (ate ? 8 : -12 * c.hunger) + (tavern ? 8 : 0) + (c.work ? 4 : -6);
      const mates = st.residents.filter(o => o !== c && o.home === c.home);
      if (mates.length) m += clamp(mates.reduce((a, o) => a + opinion(c, o), 0) / mates.length / 4, -8, 8);
      if (mates.length > 3) m -= 4;
      c.mood = Math.round(clamp(m, 0, 100));
      c.low = c.mood < 20 ? c.low + 1 : 0;
      const house = town.buildings.find(b => b.id === c.home);
      if (!house) { st.residents = st.residents.filter(x => x !== c); ev.push({ type: 'left', name: fullName(c), why: g(c, 'залишився без дому', 'залишилась без дому') }); continue; }
      if (c.hunger >= 4 || c.low >= 5) { st.residents = st.residents.filter(x => x !== c); ev.push({ type: 'left', name: fullName(c), why: c.hunger >= 4 ? g(c, 'пішов від голоду', 'пішла від голоду') : g(c, 'пішов, бо йому погано', 'пішла, бо їй погано') }); }
    }
    return ev;
  }
  const api = { g, create, all, find, maybeArrive, settle, reject, bestHouse, freeSlots, slotsLeft, assignJobs, workersOf, dayTick, eff, opinion, relLabel, profession, fullName, jobOf };
  Mech.Settlers = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
