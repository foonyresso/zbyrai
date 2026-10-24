/* Закладини: формат збереження (версія 1). Світ не зберігається, лише зерно: він відтворюється. Зміни формату: docs/data-versions.md. */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech || {};
  const req = (g, p) => M[g] || require(p);
  const World = req('WorldLite', '../mechanics/world-lite/index.js'), Build = req('Building', '../mechanics/building/index.js');
  const VERSION = 1, FORMAT = 'zakladyny', KEY = 'zk_save';

  function toJSON(G) {
    const s = G.s;
    return { format: FORMAT, v: VERSION, seed: s.seed, day: s.day, stock: s.stock, town: Build.serialize(s.town), settlers: s.settlers, markets: s.markets,
      caravans: s.caravans.map(c => { const o = Object.assign({}, c); delete o.path; return o; }), nextCaravan: s.nextCaravan, nextRaid: s.nextRaid, log: s.log };
  }
  // старіші версії піднімаються сюди поступово
  const MIGRATE = {};
  function fromJSON(o) {
    if (!o || o.format !== FORMAT) throw new Error('Це не файл збереження «Закладин»');
    while (o.v < VERSION) { if (!MIGRATE[o.v]) throw new Error('Невідома версія збереження: ' + o.v); o = MIGRATE[o.v](o); }
    if (o.v > VERSION) throw new Error('Збереження зроблено новішою версією гри (v' + o.v + ')');
    const world = World.generate(o.seed), s = { v: o.v, seed: o.seed, day: o.day, stock: o.stock, town: Build.restore(world, o.town), settlers: o.settlers, markets: o.markets, caravans: o.caravans, nextCaravan: o.nextCaravan, nextRaid: o.nextRaid, log: o.log || [] };
    return { world, s };
  }
  function saveLocal(G) { try { localStorage.setItem(KEY, JSON.stringify(toJSON(G))); return true; } catch (e) { return false; } }
  function loadLocal() { try { const t = localStorage.getItem(KEY); return t ? fromJSON(JSON.parse(t)) : null; } catch (e) { return null; } }
  Z.Save = { VERSION, FORMAT, KEY, toJSON, fromJSON, saveLocal, loadLocal };
  if (typeof module !== 'undefined' && module.exports) module.exports = Z.Save;
})(globalThis);
