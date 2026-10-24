/* Закладини: формат збереження (версія 3). Світ не зберігається, лише зерно: він відтворюється. Зміни формату: docs/data-versions.md. */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech || {};
  const req = (g, p) => M[g] || require(p);
  const Build = req('Building', '../mechanics/building/index.js');
  const VERSION = 3, FORMAT = 'zakladyny', KEY = 'zk_save';

  function toJSON(G) {
    const s = G.s;
    return { format: FORMAT, v: VERSION, params: s.params, seed: s.seed, day: s.day, stock: s.stock, town: Build.serialize(s.town), settlers: s.settlers, markets: s.markets,
      caravans: s.caravans.map(c => { const o = Object.assign({}, c); delete o.path; return o; }), nextCaravan: s.nextCaravan, nextRaid: s.nextRaid, log: s.log };
  }
  // старіші версії піднімаються сюди; v1 мала власний малий світ, який Атлас 2.0 замінив: такі збереження не відновлюються
  // v2: ділянка з плиток 40×40 → v3: вулиці й будівлі в метрах (старі будівлі переносяться у найближче допустиме місце, див. restore)
  const MIGRATE = { 2: o => Object.assign({}, o, { v: 3 }) };
  // перевіряє формат і повертає дані; сам світ треба згенерувати за o.params (Atlas 2.0), потім викликати restore(o, world)
  function parse(o) {
    if (!o || o.format !== FORMAT) throw new Error('Це не файл збереження «Закладин»');
    if (o.v === 1) throw new Error('Збереження версії 1 зроблено для старого світу й не підтримується');
    while (o.v < VERSION) { if (!MIGRATE[o.v]) throw new Error('Невідома версія збереження: ' + o.v); o = MIGRATE[o.v](o); }
    if (o.v > VERSION) throw new Error('Збереження зроблено новішою версією гри (v' + o.v + ')');
    return o;
  }
  // ділянку v2 (плитки, 20 м) переносимо в метри: будівлі, яким не знайшлось місця, зникають разом із прив'язкою мешканців
  function townFromV2(env, world, old, stock) {
    const t = Build.create(env, world.start, world.startTown(world.start)), big = { gold: 1e9, wood: 1e9, stone: 1e9, ore: 1e9, tools: 1e9, grain: 1e9, fish: 1e9, herbs: 1e9 }, kept = new Set([1]);
    for (const b of old.buildings) if (b.id !== 1) { const x = (b.x - 20) * 20 + 10, y = (b.y - 20) * 20 + 10; let r = null; for (const [dx, dy] of [[0, 0], [8, 0], [-8, 0], [0, 8], [0, -8], [16, 16], [-16, -16], [16, -16], [-16, 16]]) { r = Build.place(t, big, b.type, x + dx, y + dy); if (r.ok) break; } if (r && r.ok) { r.building.id = b.id; kept.add(b.id); } }
    t.nextId = Math.max(old.nextId || 2, 2); return { t, kept };
  }
  function restore(o, world) {
    const env = world.townEnv(world.start); let town, st = o.settlers;
    if (o.town.v === 1) { const m = townFromV2(env, world, o.town, o.stock); town = m.t; st = JSON.parse(JSON.stringify(o.settlers)); for (const c of st.residents) { if (c.home && !m.kept.has(c.home)) c.home = null; if (c.work && !m.kept.has(c.work)) c.work = null; } }
    else town = Build.restore(env, world.startTown(world.start), o.town);
    return { world, s: { v: VERSION, params: o.params, seed: o.seed, day: o.day, stock: o.stock, town, settlers: st, markets: o.markets, caravans: o.caravans, nextCaravan: o.nextCaravan, nextRaid: o.nextRaid, log: o.log || [] } };
  }
  function readLocal() { try { const t = localStorage.getItem(KEY); return t ? parse(JSON.parse(t)) : null; } catch (e) { return null; } }
  function saveLocal(G) { try { localStorage.setItem(KEY, JSON.stringify(toJSON(G))); return true; } catch (e) { return false; } }
  Z.Save = { VERSION, FORMAT, KEY, toJSON, parse, restore, readLocal, saveLocal };
  if (typeof module !== 'undefined' && module.exports) module.exports = Z.Save;
})(globalThis);
