/* Механіка «threats»: набіги монстрів із лігв на поселення. Без DOM.
   Чим ближче лігво й вища небезпека, тим сильніший набіг; оборона (варта) його відбиває. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const REACH = 16; // з яких відстаней (клітин світу) лігва нападають
  const threatsFor = (world, sid) => world.lairs.map(l => ({ lair: l, dist: Math.hypot(l.x - world.S[sid].x, l.y - world.S[sid].y) })).filter(t => t.dist <= REACH).sort((a, b) => a.dist - b.dist);
  // час до наступного набігу в добах
  const nextDelay = R => 14 + Math.floor(R() * 12);
  // набіг: сила = небезпека × (3..5); оборона = defense + вартові. Повертає { win, lair, strength, defense, loss:{gold,food,wood} }
  function raid(world, sid, defense, stock, R) {
    const list = threatsFor(world, sid); if (!list.length) return null;
    const t = list[Math.floor(R() * Math.min(2, list.length))], strength = Math.round(t.lair.danger * (2.5 + R() * 2));
    if (defense >= strength) return { win: true, lair: t.lair.name, strength, defense };
    const k = Math.min(0.5, (strength - defense) / (strength + 4)), loss = {};
    for (const r of ['gold', 'grain', 'fish', 'wood']) { const l = Math.floor((stock[r] || 0) * k * 0.6); if (l > 0) { stock[r] -= l; loss[r] = l; } }
    return { win: false, lair: t.lair.name, strength, defense, loss };
  }
  const api = { REACH, threatsFor, nextDelay, raid };
  Mech.Threats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
