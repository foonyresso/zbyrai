/* Механіка «combat»: класи захисників, монстри, вибір цілі, удар і лікування. Без DOM.
   Бійці — прості об'єкти { x, y, hp, max, team, kind, dmg, range, P }; вигляд і анімація — справа інструмента. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  // P — секунд між ударами; range — дальність; spd — швидкість у px/с; anim — анімація атаки
  const CLASSES = {
    knight: { hp: 70, P: 0.7, range: 10, spd: 20, dmg: 11, anim: 'attack', name: 'Лицар' },
    berserker: { hp: 85, P: 1.0, range: 11, spd: 20, dmg: 17, anim: 'attack', name: 'Берсерк' },
    rogue: { hp: 46, P: 0.5, range: 9, spd: 30, dmg: 6, anim: 'attack', name: 'Розбійник' },
    archer: { hp: 46, P: 1.1, range: 66, spd: 20, dmg: 8, anim: 'shoot', name: 'Лучник' },
    mage: { hp: 40, P: 1.4, range: 58, spd: 19, dmg: 14, anim: 'cast', name: 'Маг' },
    healer: { hp: 42, P: 1.2, range: 28, spd: 20, dmg: 14, anim: 'cast', name: 'Цілитель' },
    militia: { hp: 52, P: 0.9, range: 12, spd: 20, dmg: 8, anim: 'attack', name: 'Ополченець' },
  };
  const MONSTERS = {
    goblin: { hp: 24, dmg: 5, P: 0.8, range: 9, spd: 18, st: 'walk', name: 'Гоблін' },
    skeleton: { hp: 30, dmg: 6, P: 0.8, range: 9, spd: 18, st: 'walk', name: 'Скелет' },
    orc: { hp: 56, dmg: 9, P: 1.0, range: 11, spd: 15, st: 'walk', name: 'Орк' },
    wolf: { hp: 22, dmg: 6, P: 0.7, range: 10, spd: 38, st: 'run', name: 'Вовк' },
    slime: { hp: 28, dmg: 4, P: 1.0, range: 8, spd: 16, st: 'walk', name: 'Слиз' },
    bat: { hp: 16, dmg: 4, P: 0.6, range: 9, spd: 36, st: 'run', name: 'Кажан' },
    spider: { hp: 26, dmg: 5, P: 0.8, range: 9, spd: 26, st: 'run', name: 'Павук' },
    ghost: { hp: 30, dmg: 7, P: 1.1, range: 10, spd: 14, st: 'walk', name: 'Привид' },
    boss: { hp: 200, dmg: 16, P: 1.1, range: 16, spd: 14, st: 'walk', name: 'Огр-бос' },
  };
  const alive = c => c.hp > 0;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  // найближча жива ціль із list за фільтром, не далі maxD
  function nearest(self, list, maxD, filter) {
    let best = null, bd = maxD;
    for (const o of list) { if (o === self || !alive(o) || (filter && !filter(o))) continue; const d = dist(self, o); if (d < bd) { bd = d; best = o; } }
    return best;
  }
  // найбільш поранений союзник у радіусі (для цілителя)
  function mostHurt(self, list, maxD, below = 0.85) {
    let best = null, br = below;
    for (const o of list) { if (o === self || !alive(o) || o.team !== self.team) continue; const r = o.hp / o.max; if (r < br && dist(self, o) < maxD) { br = r; best = o; } }
    return best;
  }
  // удар: hp не опускається нижче 0; повертає { dead }
  function hit(target, dmg) { if (!alive(target)) return { dead: false }; target.hp = Math.max(0, target.hp - dmg); return { dead: target.hp <= 0 }; }
  function heal(target, amt) { if (alive(target)) target.hp = Math.min(target.max, target.hp + amt); return target; }
  // чи пора бити: минув інтервал P від попереднього удару
  const ready = (c, now) => now - (c.lastHit || -1e9) >= c.P;
  const isRanged = kind => kind === 'archer' || kind === 'mage';
  function make(kind, team) {
    const t = team === 'm' ? MONSTERS[kind] : CLASSES[kind];
    if (!t) throw new Error('невідомий тип: ' + kind);
    return { kind, team, hp: t.hp, max: t.hp, dmg: t.dmg, P: t.P, range: t.range, spd: t.spd, lastHit: -1e9 };
  }
  const api = { CLASSES, MONSTERS, alive, dist, nearest, mostHurt, hit, heal, ready, isRanged, make };
  Mech.Combat = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
