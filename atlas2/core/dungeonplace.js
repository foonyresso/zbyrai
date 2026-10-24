// Атлас 2.0, підземелля: розміщення під містом. Кожне має вхід у місті, відбиток у плані й смугу глибини; два підземелля з перетином смуг глибини не перетинаються в плані. Великі багатоповерхові лежать глибше за всі звичайні. Деякі з'єднані ходами (часом секретними). Детерміновано від зерна світу й номера поселення.
(function () {
  'use strict';
  const A = globalThis.Atlas2, DD = A.DungeonData, TILE = 1.5, FLOOR_H = 3.5, DEEP0 = 45, DEEP_H = 6;
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  // скільки підземель за рангом: [мін, макс, імовірність найменшого], велике: імовірність
  const COUNT = { hamlet: [0, 1, 0.25, 0], village: [0, 1, 0.55, 0], town: [1, 2, 1, 0.1], regional: [2, 3, 1, 0.5], capital: [3, 5, 1, 0.9] };
  // види за вхідними спорудами: [вид, типи споруд (або 'plaza'), мін. ранг, ваги]
  const ENTRY = [['crypt', ['temple', 'chapel', 'cathedral'], 2, 3], ['manor', ['estate', 'rich'], 1, 2], ['cellar', ['tavern', 'inn', 'warehouse', 'brewery', 'smith'], 0, 3], ['sewer', ['plaza'], 2, 3], ['ruin', ['ruin'], 1, 1], ['cave', ['hut', 'fishhut', 'farmstead'], 0, 1], ['mine', ['manufact', 'smith', 'hut'], 1, 1]];
  const RANK = { hamlet: 0, village: 1, town: 2, regional: 3, capital: 4 };
  const caches = new WeakMap();
  // відбиток: радіус кола в метрах (половина діагоналі карти поверху)
  const footR = size => { const S = A.Dungeon.SIZES[size]; return Math.hypot(S.w, S.h) * TILE / 2 * 0.72; };
  function pickEntries(c, s, r) {
    const tier = RANK[s.rank], b = c.buildings || [], plazas = c.features ? c.features.filter(f => f.t === 'plaza' || f.t === 'square') : [];
    const cands = [];
    for (const [kind, types, minTier, wt] of ENTRY) { if (tier < minTier) continue; const spots = types[0] === 'plaza' ? plazas.map(f => ({ x: f.x, y: f.y, name: f.name || 'Площа', kind: 'plaza' })) : b.filter(q => types.includes(q.type)).map(q => ({ x: q.x, y: q.y, name: q.name || (A.CityData.T[q.type] || {}).n || q.type, kind: q.type })); if (spots.length) cands.push({ kind, spots, wt }); }
    if (!cands.length && b.length) cands.push({ kind: 'cellar', spots: b.map(q => ({ x: q.x, y: q.y, name: q.name || (A.CityData.T[q.type] || {}).n || q.type, kind: q.type })), wt: 1 });
    return cands;
  }
  function plan(W, s) {
    const c = A.Town.get(W, s), r = A.Rng.stream(W.params.seed, 'dungeons|' + s.id), cfg = COUNT[s.rank] || COUNT.hamlet, list = [];
    if (s.ruined && !s.fate) return list;
    const cands = pickEntries(c, s, r); if (!cands.length) return list;
    let n = r() < cfg[2] ? ri(r, Math.max(cfg[0], 1), cfg[1]) : cfg[0]; const big = r() < cfg[3];
    const jobs = []; for (let i = 0; i < n; i++) { const tot = cands.reduce((a, q) => a + q.wt, 0); let v = r() * tot, q = cands[0]; for (const k of cands) { v -= k.wt; if (v <= 0) { q = k; break; } } jobs.push({ kind: q.kind, spot: q.spots[ri(r, 0, q.spots.length - 1)], size: r() < (RANK[s.rank] >= 3 ? 0.5 : 0.25) ? 'mid' : 'small' }); }
    if (big) jobs.push({ kind: r() < 0.5 ? 'catacomb' : 'deep', spot: null, size: 'big' }); // великі йдуть останніми
    const clash = (p, q) => p.d0 < q.d1 && q.d0 < p.d1 && Math.hypot(p.x - q.x, p.y - q.y) < p.R + q.R + 6;
    for (const j of jobs) {
      const R = footR(j.size), floors = j.size === 'big' ? ri(r, 4, 6) : j.size === 'mid' ? ri(r, 1, 2) : 1;
      let ok = null;
      for (let t = 0; t < 80 && !ok; t++) {
        const spot = j.spot || (() => { const b = c.buildings[ri(r, 0, c.buildings.length - 1)]; return b ? { x: b.x, y: b.y, name: b.name || 'Споруда', kind: b.type } : { x: c.c0[0], y: c.c0[1], name: 'Центр', kind: 'plaza' }; })();
        const off = r() * R * 0.45, ang = r() * 6.2832, d0 = j.size === 'big' ? DEEP0 + ri(r, 0, 20) : 3 + r() * 14;
        const p = { x: spot.x + Math.cos(ang) * off, y: spot.y + Math.sin(ang) * off, R, d0, d1: d0 + floors * (j.size === 'big' ? DEEP_H : FLOOR_H), spot };
        if (!list.some(q => clash(p, q))) ok = p;
        if (!ok && !j.spot) j.spot = null;
      }
      if (!ok) continue; const id = s.id + '.' + list.length, nm = DD.nameOf(r, j.kind);
      list.push({ id, sid: s.id, kind: j.kind, size: j.size, floors, level: Math.max(1, (s.level || 1) + (j.size === 'big' ? 4 : j.size === 'mid' ? 1 : 0)), name: nm, depth: Math.round(ok.d0 * 10) / 10, depthEnd: Math.round(ok.d1 * 10) / 10, x: Math.round(ok.x), y: Math.round(ok.y), R: Math.round(ok.R), entry: { x: Math.round(ok.spot.x), y: Math.round(ok.spot.y), name: ok.spot.name, kind: ok.spot.kind }, d0: ok.d0, d1: ok.d1, links: [] });
    }
    // ходи між підземеллями: близькі за глибиною й за відстанню; великі з'єднуються шахтою з одним звичайним над собою
    for (let i = 0; i < list.length; i++) for (let k = i + 1; k < list.length; k++) {
      const p = list[i], q = list[k], gap = Math.hypot(p.x - q.x, p.y - q.y) - p.R - q.R, big = p.size === 'big' || q.size === 'big';
      if (big ? (p.links.some(l => l.big) || q.links.some(l => l.big) || r() > 0.6 || gap > 90) : (Math.abs(p.d0 - q.d0) > 9 || gap > 60 || r() > 0.55)) continue;
      const secret = r() < 0.5, ang = Math.atan2(q.y - p.y, q.x - p.x);
      p.links.push({ to: q.id, name: q.name, secret, dir: ang, big: big && p.size !== 'big' ? false : big }); q.links.push({ to: p.id, name: p.name, secret, dir: ang + Math.PI, big: big && q.size !== 'big' ? false : big });
    }
    return list;
  }
  function forTown(W, s) { let m = caches.get(W); if (!m) caches.set(W, m = new Map()); let l = m.get(s.id); if (!l) m.set(s.id, l = plan(W, s)); return l; }
  // повний опис підземелля для генератора карти: вхід переводиться в положення на карті поверху (0..1)
  function specOf(W, s, d) {
    const sz = A.Dungeon.SIZES[d.size], dx = (d.entry.x - d.x) / (sz.w * TILE), dy = (d.entry.y - d.y) / (sz.h * TILE);
    return { id: d.id, seed: W.params.seed, kind: d.kind, size: d.size, floors: d.floors, level: d.level, depth: d.depth, name: d.name, entry: { tx: Math.min(0.9, Math.max(0.1, 0.5 + dx)), ty: Math.min(0.9, Math.max(0.1, 0.5 + dy)) }, links: d.links.map(l => ({ to: l.to, name: l.name, secret: l.secret, dir: l.dir })) };
  }
  const find = (W, id) => { const sid = +String(id).split('.')[0], s = W.settlements[sid]; return s ? forTown(W, s).find(d => d.id === id) || null : null; };
  A.DungeonPlace = { forTown, specOf, find, footR };
})();
