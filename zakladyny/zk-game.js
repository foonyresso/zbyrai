/* Закладини: складання гри з механік (світ, будівництво, поселенці, торгівля, загрози). Тут лише порядок доби й стан, без DOM.
   G = { world, s }, де s — стан гри (див. zk-save.js для збереженого вигляду). */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {};
  const M = root.Mech || (root.Mech = {});
  const req = (g, p) => M[g] || require(p);
  const Rng = req('Rng', '../mechanics/rng/index.js'), Trade = req('Trade', '../mechanics/trade/index.js'),
    Build = req('Building', '../mechanics/building/index.js'), Set = req('Settlers', '../mechanics/settlers/index.js'), Thr = req('Threats', '../mechanics/threats/index.js'), TD = req('TradeData', '../mechanics/trade/data.js');
  const START = { gold: 300, wood: 90, stone: 40, grain: 40, fish: 0, ore: 0, herbs: 0, tools: 0 };
  const CARGO_MAX = 30;

  // параметри світу Атласу для гри: малий материк із поміркованою кількістю поселень
  const worldParams = seed => ({ seed: String(seed || Math.random().toString(36).slice(2, 8)), size: 'small', worldType: 'continent', provinces: 3, regionsPerProvince: 4, density: 0.4 });
  // world — фасад світу (mechanics/atlas-map/world.js), уже згенерований за params
  function newGame(world, params) {
    const s = { v: 2, params, seed: params.seed, day: 1, stock: Object.assign({}, START), town: Build.create(world.townEnv(world.start, Build.TILE, Build.N, Build.C), world.start), settlers: Set.create(params.seed), markets: Trade.initMarkets(world), caravans: [], nextCaravan: 1, nextRaid: 25, log: [] };
    const G = { world, s }; log(G, 'Ви заклали поселення «' + world.S[world.start].name + '». Зведіть житло, і незабаром прийдуть перші люди.', 'info');
    return G;
  }
  function log(G, text, kind = 'info') { G.s.log.unshift({ day: G.s.day, text, kind }); if (G.s.log.length > 80) G.s.log.length = 80; }
  const pop = G => G.s.settlers.residents.length;
  const activeCaravans = G => G.s.caravans.filter(c => c.status !== 'done').length;
  const caravanSlots = G => Build.count(G.s.town, 'yard') - activeCaravans(G);
  // нестача ресурсу, що штовхає авто-розподіл до відповідних будівель
  function need(G) {
    const st = G.s.stock, n = {}, food = (st.grain || 0) + (st.fish || 0), p = Math.max(2, pop(G));
    const low = food < p * 12 + 20;
    if (low) { n.grain = 8; n.fish = 8; }
    if (st.wood < 40) n.wood = 3; if (st.stone < 30) n.stone = 3; if (st.ore < 10) n.ore = 1;
    return n;
  }
  function defense(G) {
    let d = Build.defense(G.s.town);
    for (const b of G.s.town.buildings) if (b.type === 'guard') d += (G.s.settlers.workersOf ? 0 : 0);
    const w = Set.workersOf(G.s.settlers, G.s.town);
    for (const b of G.s.town.buildings) if (b.type === 'guard') d += (w[b.id] || []).reduce((a, e) => a + 2 * e, 0);
    return Math.round(d * 10) / 10;
  }

  function stepDay(G) {
    const s = G.s; s.day++;
    Set.assignJobs(s.settlers, s.town, need(G));
    const w = Set.workersOf(s.settlers, s.town);
    Build.produceDay(s.town, s.stock, w, pop(G));
    for (const e of Set.dayTick(s.settlers, s.town, s.stock, s.day)) log(G, e.name + ': ' + e.why, 'bad');
    for (const e of Set.maybeArrive(s.settlers, s.day, Build.housing(s.town) > 0 && (s.stock.grain + s.stock.fish) >= pop(G) * 3)) {
      if (e.type === 'arrive') log(G, 'До воріт ' + e.came + ' ' + e.name + ' (' + e.prof + '). Огляньте й поселіть.', 'good'); else log(G, e.name + ': ' + e.why, 'info');
    }
    Trade.tick(s.markets, 1);
    const R = Rng.stream(s.seed, 'day' + s.day);
    for (const c of s.caravans) {
      if (!c.path) c.path = G.world.routePath(c.from, c.to);
      for (const e of Trade.advance(G.world, s.markets, c, 1, R)) {
        if (e.type === 'ambush') log(G, 'Засідка біля «' + e.lair + '»: втрачено ' + e.lost + '% вантажу.', 'bad');
        if (e.type === 'sold') { s.stock.gold += e.gold; log(G, 'Караван у «' + G.world.S[e.to].name + '»: виручка ' + e.income + ' золота' + (Object.keys(e.bought).length ? ', закуплено ' + Object.entries(e.bought).map(([r, n]) => n + ' ' + TD.RES[r].name.toLowerCase()).join(', ') : '') + '.', 'good'); }
        if (e.type === 'home' && e.goods) { const cap = Build.storageCap(s.town); for (const r in e.goods) s.stock[r] = Math.min(cap, (s.stock[r] || 0) + e.goods[r]); if (Object.keys(e.goods).length) log(G, 'Караван повернувся з товаром.', 'good'); }
      }
    }
    s.caravans = s.caravans.filter(c => c.status !== 'done');
    if (s.day >= s.nextRaid) {
      const r = Thr.raid(G.world, G.world.start, defense(G), s.stock, R); s.nextRaid = s.day + Thr.nextDelay(R);
      if (r) log(G, r.win ? 'Набіг із «' + r.lair + '» відбито (сила ' + r.strength + ', оборона ' + r.defense + ').' : 'Набіг із «' + r.lair + '» прорвався (сила ' + r.strength + ', оборона ' + r.defense + '). Втрати: ' + Object.entries(r.loss).map(([k, v]) => v + ' ' + (k === 'gold' ? 'золота' : TD.RES[k].name.toLowerCase())).join(', ') + '.', r.win ? 'good' : 'bad');
    }
    for (const k in s.stock) s.stock[k] = Math.max(0, Math.round(s.stock[k] * 1000) / 1000);
  }

  // дії гравця: повертають { ok, reason }
  function build(G, type, x, y) { const r = Build.place(G.s.town, G.s.stock, type, x, y); if (r.ok) log(G, 'Збудовано: ' + Build.TYPES[type].name + (r.newRoad ? ' (+' + r.newRoad + ' дороги)' : ''), 'info'); return r; }
  function demolish(G, id) { const r = Build.demolish(G.s.town, G.s.stock, id); if (r.ok) log(G, 'Знесено: ' + Build.TYPES[r.building.type].name + (r.roadsRemoved ? ' (зникло доріг: ' + r.roadsRemoved + ')' : ''), 'info'); return r; }
  function settle(G, id, houseId) { const r = Set.settle(G.s.settlers, G.s.town, id, houseId); if (r.ok) { const c = Set.find(G.s.settlers, id); log(G, Set.fullName(c) + Set.g(c, ' оселився.', ' оселилась.'), 'good'); } return r; }
  function sendCaravan(G, to, cargo, escort, buy = {}) {
    const s = G.s; if (caravanSlots(G) <= 0) return { ok: false, reason: 'Потрібен вільний караванний двір' };
    const total = Object.values(cargo).reduce((a, v) => a + v, 0);
    if (!(total > 0) && !Object.values(buy).some(v => v > 0)) return { ok: false, reason: 'Вкажіть, що продати або купити' };
    if (total > CARGO_MAX) return { ok: false, reason: 'Караван бере не більше ' + CARGO_MAX + ' одиниць' };
    for (const r in cargo) if ((s.stock[r] || 0) < cargo[r]) return { ok: false, reason: 'На складі нема стільки: ' + TD.RES[r].name };
    const cost = Trade.CARAVAN_COST + (escort ? Trade.ESCORT_COST : 0); if (s.stock.gold < cost) return { ok: false, reason: 'Не вистачає золота на дорогу (' + cost + ')' };
    const c = Trade.dispatch(G.world, G.world.start, to, cargo, escort, s.nextCaravan, buy); if (!c) return { ok: false, reason: 'Дорога туди не веде' };
    s.nextCaravan++; s.stock.gold -= cost; for (const r in cargo) s.stock[r] -= cargo[r]; s.caravans.push(c);
    log(G, 'Караван вирушив до «' + G.world.S[to].name + '».', 'info');
    return { ok: true, caravan: c };
  }
  Z.Game = { START, CARGO_MAX, worldParams, newGame, stepDay, build, demolish, settle, sendCaravan, log, pop, need, defense, caravanSlots, activeCaravans };
  if (typeof module !== 'undefined' && module.exports) module.exports = Z.Game;
})(globalThis);
