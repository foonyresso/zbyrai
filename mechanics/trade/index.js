/* Механіка «trade»: ринки поселень (що виробляють і що потребують), ціни, каравани, засідки. Без DOM.
   markets = { [settlementId]: { produces, needs, stock, target } }; караван — звичайний об'єкт (JSON). */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const Rng = Mech.Rng || require('../rng/index.js');
  const World = Mech.WorldLite || require('../world-lite/index.js');
  const D = Mech.TradeData || require('./data.js');
  const SPEED = 5, ESCORT_COST = 30, CARAVAN_COST = 15; // клітин на добу; золото
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ринки чужих поселень: виробляють 2 ресурси за оточенням, потребують 2–3 інших
  function initMarkets(world) {
    const R = Rng.stream(world.seed, 'markets'), out = {};
    for (const s of world.S) {
      if (s.id === world.start) continue;
      const cnt = World.around(world.biome, s.x, s.y, 5), score = D.RAW.map(r => [r, cnt[World.BIOMES.findIndex(b => b.res === r)] + R()]).sort((a, b) => b[1] - a[1]);
      const produces = score.slice(0, 2).map(x => x[0]);
      const others = D.IDS.filter(r => !produces.includes(r)).map(r => [r, R()]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      const needs = others.slice(0, s.rank === 'town' ? 3 : 2);
      const stock = {}, target = {};
      for (const r of D.IDS) { target[r] = produces.includes(r) ? 100 : needs.includes(r) ? 60 : 40; stock[r] = produces.includes(r) ? 80 : needs.includes(r) ? 4 + Math.floor(R() * 8) : 30; }
      out[s.id] = { produces, needs, stock, target };
    }
    return out;
  }
  const price = (m, r, stock = m.stock[r]) => D.RES[r].base * clamp(2.2 - 1.6 * stock / m.target[r], 0.4, 2.4);
  // виручка від продажу qty одиниць (ціна падає з кожною проданою одиницею)
  function quote(m, r, qty) { let g = 0; for (let i = 0; i < qty; i++) g += price(m, r, m.stock[r] + i); return Math.round(g); }
  // добовий дрейф: виробники поповнюють склад, потребуючі витрачають, решта тягнеться до норми
  function tick(markets, days = 1) {
    for (const id in markets) { const m = markets[id]; for (const r of D.IDS) {
      if (m.produces.includes(r)) m.stock[r] = Math.min(m.target[r] * 1.6, m.stock[r] + 2.5 * days);
      else if (m.needs.includes(r)) m.stock[r] = Math.max(0, m.stock[r] - 1.2 * days);
      else m.stock[r] += (m.target[r] - m.stock[r]) * 0.04 * days;
    } }
  }

  // новий караван з поселення `from` до `to` по дорогах; повертає null, якщо дороги не з'єднують
  function dispatch(world, from, to, cargo, escort = false, id = 1) {
    const path = World.routePath(world, from, to); if (!path) return null;
    return { id, from, to, path, pos: 0, dir: 1, cargo: Object.assign({}, cargo), escort: !!escort, status: 'out', gold: 0 };
  }
  const eta = path => Math.ceil((path.length - 1) / SPEED);
  const riskOf = (world, path, escort) => { let r = 0; for (const [x, y] of path) for (const l of world.lairs) if (Math.hypot(l.x - x, l.y - y) <= 3) r += l.danger * (escort ? 0.004 : 0.012); return Math.min(0.95, r); };
  // просунути караван на `days` діб; повертає події [{type:'ambush'|'sold'|'home', ...}]. Золото від продажу — в event.gold
  function advance(world, markets, c, days, R) {
    const ev = []; let left = days * SPEED;
    while (left > 0 && c.status !== 'done') {
      const step = Math.min(1, left); left -= step;
      const before = Math.floor(c.pos); c.pos += c.dir * step; c.pos = clamp(c.pos, 0, c.path.length - 1);
      if (Math.floor(c.pos) !== before || c.pos === 0 || c.pos === c.path.length - 1) {
        const [x, y] = c.path[Math.round(c.pos)];
        for (const l of world.lairs) if (c.status === 'out' && Math.hypot(l.x - x, l.y - y) <= 3 && !(c.hit || (c.hit = {}))[l.id] && R() < l.danger * (c.escort ? 0.05 : 0.15)) {
          c.hit[l.id] = 1; const lost = c.escort ? 0.25 : 0.6;
          for (const r in c.cargo) c.cargo[r] = Math.floor(c.cargo[r] * (1 - lost));
          ev.push({ type: 'ambush', lair: l.name, lost: Math.round(lost * 100) });
        }
      }
      if (c.status === 'out' && c.pos >= c.path.length - 1) {
        let g = 0; const m = markets[c.to];
        for (const r in c.cargo) { const q = c.cargo[r]; if (q > 0) { g += quote(m, r, q); m.stock[r] += q; } }
        c.gold = g; c.cargo = {}; c.status = 'back'; c.dir = -1; c.hit = {};
        ev.push({ type: 'sold', to: c.to, gold: g });
      } else if (c.status === 'back' && c.pos <= 0) { c.status = 'done'; ev.push({ type: 'home' }); }
    }
    return ev;
  }
  const api = { SPEED, ESCORT_COST, CARAVAN_COST, initMarkets, price, quote, tick, dispatch, eta, riskOf, advance };
  Mech.Trade = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
