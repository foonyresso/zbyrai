/* Закладини: формат збереження (версія 1). Світ не зберігається, лише зерно: він відтворюється. Зміни формату: docs/data-versions.md. */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech || {};
  const req = (g, p) => M[g] || require(p);
  const Build = req('Building', '../mechanics/building/index.js');
  const VERSION = 2, FORMAT = 'zakladyny', KEY = 'zk_save';

  function toJSON(G) {
    const s = G.s;
    return { format: FORMAT, v: VERSION, params: s.params, seed: s.seed, day: s.day, stock: s.stock, town: Build.serialize(s.town), settlers: s.settlers, markets: s.markets,
      caravans: s.caravans.map(c => { const o = Object.assign({}, c); delete o.path; return o; }), nextCaravan: s.nextCaravan, nextRaid: s.nextRaid, log: s.log };
  }
  // старіші версії піднімаються сюди; v1 мала власний малий світ, який Атлас 2.0 замінив: такі збереження не відновлюються
  const MIGRATE = {};
  // перевіряє формат і повертає дані; сам світ треба згенерувати за o.params (Atlas 2.0), потім викликати restore(o, world)
  function parse(o) {
    if (!o || o.format !== FORMAT) throw new Error('Це не файл збереження «Закладин»');
    if (o.v === 1) throw new Error('Збереження версії 1 зроблено для старого світу й не підтримується');
    while (o.v < VERSION) { if (!MIGRATE[o.v]) throw new Error('Невідома версія збереження: ' + o.v); o = MIGRATE[o.v](o); }
    if (o.v > VERSION) throw new Error('Збереження зроблено новішою версією гри (v' + o.v + ')');
    return o;
  }
  function restore(o, world) {
    return { world, s: { v: o.v, params: o.params, seed: o.seed, day: o.day, stock: o.stock, town: Build.restore(world.townEnv(world.start, Build.TILE, Build.N, Build.C), o.town), settlers: o.settlers, markets: o.markets, caravans: o.caravans, nextCaravan: o.nextCaravan, nextRaid: o.nextRaid, log: o.log || [] } };
  }
  function readLocal() { try { const t = localStorage.getItem(KEY); return t ? parse(JSON.parse(t)) : null; } catch (e) { return null; } }
  function saveLocal(G) { try { localStorage.setItem(KEY, JSON.stringify(toJSON(G))); return true; } catch (e) { return false; } }
  Z.Save = { VERSION, FORMAT, KEY, toJSON, parse, restore, readLocal, saveLocal };
  if (typeof module !== 'undefined' && module.exports) module.exports = Z.Save;
})(globalThis);
