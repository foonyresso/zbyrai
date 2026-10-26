// Атлас 2.0, місто: захоплене монстрами місто живе своїм ладом. Частина споруд заселена й замінена монстрячими (гніздо замість хати, горн замість кузні, капище замість храму),
// додаються зала вождя, бійцівська яма, клітки, скарбниця, сторожові вежі з черепами; райони перейменовуються. Бандити мають лише схованки й скупки.
(function () {
  'use strict';
  const A = globalThis.Atlas2, T = A.CityData.T, MK = A.CityData.MK, TAU = Math.PI * 2, pick = (r, a) => a[Math.floor(r() * a.length)];
  // що замінюється на що (першим ключем, ймовірність заміни 0.75 для заселених)
  const MAP = {
    house: ['nest', 'warren'], rich: ['nest', 'warren'], estate: ['warren'], farmstead: ['warren', 'pen'], hut: ['warren'], slum: ['warren'], weaver: ['warren'],
    tavern: ['feast'], inn: ['feast'], brothel: ['cage'], bath: ['feast'],
    smith: ['mforge'], weapon: ['mforge'], armory: ['mforge'], manufact: ['mforge'],
    temple: ['totem'], chapel: ['totem'], cathedral: ['totem'], shrine: ['totem'], hall: ['mhall'], elder: ['totem'],
    barracks: ['warband'], garrison: ['warband'], prison: ['cage'], court: ['cage'],
    shop: ['larder'], bakery: ['larder'], warehouse: ['larder', 'hoard'], pharm: ['shaman'], bank: ['hoard'], jewel: ['hoard'], gthief: ['hoard'], market: ['larder'],
    arena: ['pit'], theater: ['pit'], school: ['ritual'], library: ['ritual'], academy: ['ritual'], gmage: ['ritual'], mtower: ['ritual'], hospital: ['shaman'],
    stable: ['kennel'], farm: ['pen'], mill: ['pen'], windmill: ['pen'], tannery: ['larder'],
  }, MAP_BANDITS = { tavern: ['hideout'], inn: ['hideout'], shop: ['fence'], jewel: ['fence'], bank: ['fence'], pharm: ['fence'], warehouse: ['hideout'] };
  const popOf = (r, id) => { const p = T[id].pop; return p[0] + Math.floor(r() * (p[1] - p[0] + 1)); };

  // c: {B, r, s, tier, x0, y0, R, d0, anchors, placeNear, tryB}; повертає множину id заселених споруд
  function apply(c) {
    const { B, r, s, tier, x0, y0, R, d0 } = c, mon = s.occupier !== 'bandits', lair = new Set(), at = kinds => { for (const k of kinds) { const a = c.anchors.find(q => q.kind === k); if (a) return [a.x, a.y]; } return [x0, y0]; };
    const extra = mon ? [['mhall', ['centre'], B.some(b => b.type === 'hall') ? 0 : 1], ['totem', ['temple', 'centre'], tier >= 1 ? 1 + (tier >= 3) : 0], ['pit', ['centre'], tier >= 2 ? 1 : 0], ['cage', ['castle', 'centre'], tier >= 2 ? 1 : 0], ['hoard', ['rich', 'centre'], tier >= 2 ? 1 : 0],
      ['mforge', ['craft', 'centre'], tier >= 2 ? 1 + (tier >= 3) : 0], ['larder', ['trade', 'centre'], tier >= 2 ? 1 + (tier >= 3) : 0], ['shaman', ['temple', 'centre'], tier >= 1 ? 1 : 0], ['warband', ['castle', 'centre'], tier >= 2 ? 1 + (tier >= 3) : 0], ['nest', ['poor', 'outskirts', 'centre'], tier === 0 ? 2 : 2 + tier]]
      : [['hideout', ['centre'], tier >= 1 ? 1 : 0], ['fence', ['trade', 'centre'], tier >= 2 ? 1 : 0]];
    for (const [id, kinds, n] of extra) for (let k = 0; k < n; k++) { const [ax, ay] = at(kinds), b = c.placeNear(id, ax, ay, 150 + R * 0.2); if (b) lair.add(b.id); }
    if (mon) for (let k = 0, n = tier === 0 ? 1 : 2 + tier * 2, tries = 0; k < n && tries < n * 12; tries++) { const a = r() * TAU, d = R * (0.78 + 0.22 * r()), b = c.tryB({ type: 'mwatch', x: x0 + Math.cos(a) * d, y: y0 + Math.sin(a) * d, w: 8, h: 8, a: r() * TAU, st: -1, side: 1, uniq: true }); if (b) { lair.add(b.id); k++; } }
    const map = mon ? MAP : MAP_BANDITS;
    for (const b of B) {
      if (b.site || lair.has(b.id) || b.type === 'castle' || T[b.type].cat === 'Монстри' || T[b.type].cat === 'Руїни') continue;
      const p = (mon ? 0.7 : 0.18) - (mon ? 0.35 : 0.1) * Math.min(1, d0(b.x, b.y) / R); if (r() >= p && !(b.type === 'hall' && mon)) continue;
      lair.add(b.id); const m = map[b.type]; if (m && (b.type === 'hall' || r() < 0.75)) { b.was = T[b.type].n; b.type = pick(r, m); }
    }
    for (const b of B) if (lair.has(b.id)) b.inhab = popOf(r, b.type);
    const hall = B.find(b => b.type === 'mhall'); if (hall && s.order) hall.pdesc = s.order.chief + '. ' + s.order.laws[0];
    return lair;
  }

  // райони живуть за ладом орди
  function districts(dst) { for (const d of dst) { const m = MK[d.kind]; if (!m) continue; d.name = m[0]; d.text = m[1]; d.vibe = m[2]; d.wealth = 'здобич'; d.safety = 'смертельна для чужих'; } }

  A.TownMon = { apply, districts, MAP };
})();
