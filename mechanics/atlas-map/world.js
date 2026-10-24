/* Механіка «atlas-map»: адаптер світу Атласу 2.0 до потреб ігрових механік (торгівля, загрози, будівництво).
   wrap(W) дає «світ» з однаковим інтерфейсом: S (поселення), start, classAt/around (місцевість), routePath (дороги Атласу), lairs (лігва з монстрами).
   Класи місцевості: 0 вода, 1 узбережжя, 2 рівнина, 3 ліс, 4 пагорби, 5 гори й сніг, 6 болото. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const A = () => root.Atlas2;
  const CLASS_OF = { grass: 2, steppe: 2, savanna: 2, desert: 2, tundra: 2, forest: 3, taiga: 3, jungle: 3, hills: 4, mountain: 5, peaks: 5, snow: 5, swamp: 6 };
  const CLASSES = [{ id: 0, name: 'Вода', res: null }, { id: 1, name: 'Узбережжя', res: 'fish' }, { id: 2, name: 'Рівнина', res: 'grain' }, { id: 3, name: 'Ліс', res: 'wood' }, { id: 4, name: 'Пагорби', res: 'stone' }, { id: 5, name: 'Гори', res: 'ore' }, { id: 6, name: 'Болото', res: 'herbs' }];
  const SPEED_CELLS = 40; // клітин карти за добу для каравану

  function heap() { const h = []; return { n: () => h.length, push(it) { let i = h.push(it) - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } }, pop() { const top = h[0], last = h.pop(); if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; } }; }

  function wrap(W) {
    const w = W.w, h = W.h, S = W.settlements, adj = new Map(), cache = new Map();
    const alive = s => !s.ruined && !s.fate;
    const classAtCell = i => { if (i < 0 || W.ocean[i] || W.lake[i]) return 0; const g = A().Danger.groupName(W, i), c = CLASS_OF[g] || 2; return (c === 2 || c === 3) && W.waterDist[i] <= 1.5 ? (c === 2 ? 1 : c) : c; };
    const classAt = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx < 0 || cy < 0 || cx >= w || cy >= h ? 0 : classAtCell(cy * w + cx); };
    function around(x, y, r) { const cnt = [0, 0, 0, 0, 0, 0, 0]; const x0 = Math.floor(x), y0 = Math.floor(y); for (let yy = y0 - r; yy <= y0 + r; yy++) for (let xx = x0 - r; xx <= x0 + r; xx++) if ((xx - x0) ** 2 + (yy - y0) ** 2 <= r * r) { cnt[classAt(xx, yy)]++; const i = yy * w + xx; if (xx >= 0 && yy >= 0 && xx < w && yy < h && W.river[i]) cnt[1]++; } return cnt; }
    // частка клітин заданих класів у радіусі r клітин (0..1)
    function share(x, y, classes, r) { const c = around(x, y, r), tot = c.reduce((a, v) => a + v, 0) || 1; return classes.reduce((a, k) => a + c[k], 0) / tot; }

    // граф доріг Атласу
    const link = (a, b) => { const ax = a % w, ay = (a / w) | 0, bx = b % w, by = (b / w) | 0, d = Math.hypot(ax - bx, ay - by); (adj.get(a) || adj.set(a, []).get(a)).push([b, d]); (adj.get(b) || adj.set(b, []).get(b)).push([a, d]); };
    for (const r of W.roads) for (let k = 1; k < r.cells.length; k++) link(r.cells[k - 1], r.cells[k]);
    const nodeOf = s => { if (adj.has(s.i)) return s.i; let best = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const j = (s.y + dy) * w + s.x + dx; if (adj.has(j) && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = j; } } return best; };
    function dijkstra(src) {
      if (cache.has(src)) return cache.get(src);
      const dist = new Map([[src, 0]]), prev = new Map(), hp = heap(); hp.push([0, src]);
      while (hp.n()) { const [d, c] = hp.pop(); if (d > dist.get(c)) continue; for (const [n, wt] of adj.get(c) || []) { const nd = d + wt; if (!dist.has(n) || nd < dist.get(n)) { dist.set(n, nd); prev.set(n, c); hp.push([nd, n]); } } }
      const r = { dist, prev }; cache.set(src, r); return r;
    }
    // шлях по дорогах між поселеннями: [[x,y],...] у клітинах; null, якщо не з'єднані
    function routePath(a, b) {
      const sa = nodeOf(S[a]), sb = nodeOf(S[b]); if (sa < 0 || sb < 0) return null; const { dist, prev } = dijkstra(sa); if (!dist.has(sb)) return null;
      const out = []; for (let c = sb; c !== undefined; c = prev.get(c)) out.push([c % w, (c / w) | 0]); return out.reverse();
    }
    // поселення, досяжні дорогами з `from`, за зростанням довжини шляху
    function reachable(from, maxLen) { const sa = nodeOf(S[from]); if (sa < 0) return []; const { dist } = dijkstra(sa); return S.filter(s => s.id !== from && alive(s) && dist.has(nodeOf(s)) && dist.get(nodeOf(s)) <= maxLen).map(s => ({ id: s.id, len: dist.get(nodeOf(s)) })).sort((p, q) => p.len - q.len); }

    // лігва: місця з монстрами або бандитами; небезпека 1..5 за рівнем загрози
    const lairs = []; for (const s of W.sites || []) if ((s.cat === 'm' || s.cat === 'b') && s.tier >= 1 && s.monsters && s.monsters.length) lairs.push({ id: lairs.length, siteId: s.id, name: s.name, x: s.x, y: s.y, danger: Math.min(5, s.tier), level: s.level, tier: s.tier, monsters: s.monsters, kind: s.cat === 'b' ? 'bandits' : 'monsters' });

    // старт гравця: село чи хутір на дорозі з різноманітним оточенням і сусідами поруч
    function pickStart() {
      const cands = S.filter(s => alive(s) && s.rank !== 'capital' && s.rank !== 'regional' && !W.lake[s.i] && !W.ocean[s.i] && nodeOf(s) >= 0 && s.x > 12 && s.y > 12 && s.x < w - 12 && s.y < h - 12)
        .map(s => { const x = s.x + .5, y = s.y + .5, c = around(x, y, 4), here = classAt(x, y), fields = share(x, y, [1, 2], 2), wood = share(x, y, [3], 4), rock = share(x, y, [4, 5], 4), variety = [1, 2, 3, 4, 5, 6].filter(k => c[k] >= 3).length;
          const v = variety * 4 + Math.min(fields, 0.6) * 60 + Math.min(wood, 0.3) * 60 + Math.min(rock, 0.3) * 60 - c[0] * 0.15 - (c[5] > 24 ? 8 : 0) - (s.rank === 'town' ? 4 : 0);
          return { s, v: here === 0 ? -99 : v, fields, wood, rock }; }).sort((a, b) => b.v - a.v).slice(0, 25);
      let best = null, bs = -1e9; for (const o of cands) { const n = reachable(o.s.id, 300).length, sc = o.v + Math.min(n, 8) * 3 - (n < 4 ? 60 : 0); if (sc > bs) { bs = sc; best = o.s; } }
      return (best || S.find(alive)).id;
    }
    // середовище поселення для будівництва: координати в метрах від центру клітини поселення → клас місцевості й частка класів поруч
    function townEnv(sid) {
      const s = S[sid], CS = W.params.kmPerCell * 1000, pos = (mx, my) => [s.x + 0.5 + mx / CS, s.y + 0.5 + my / CS];
      return { classAt: (mx, my) => { const [x, y] = pos(mx, my); return classAt(x, y); }, share: (mx, my, classes, r) => { const [x, y] = pos(mx, my); return share(x, y, classes, r); } };
    }
    // стартовий вигляд поселення з генератора міст Атласу: лише центр (вулиці, площа, колодязь, дім старости) і дерева; решту будинків додає гравець
    function startTown(sid) {
      const A_ = A(), s = S[sid], c = A_.Town.build(W, Object.assign({}, W.settlements[sid], { rank: 'village', pop: 150, ruined: false, fate: null }));
      const pl = c.features.find(f => f.t === 'plaza') || { x: 0, y: 0, r: 16 }, el = c.buildings.find(b => b.type === 'elder') || c.buildings[0];
      return { name: s.name, R: c.R, streets: c.streets.map(t => ({ kind: t.kind, hw: t.hw, name: t.name, pts: t.pts.slice() })), plaza: { x: pl.x, y: pl.y, r: pl.r, name: pl.name }, props: c.props.map(p => Object.assign({}, p)), elder: { x: el.x, y: el.y, w: el.w, h: el.h, a: el.a }, trees: c.trees.map(t => Object.assign({}, t)) };
    }
    const world = { townEnv, startTown, seed: W.params.seed, w, h, W, S, kmPerCell: W.params.kmPerCell, alive, classAt, around, share, routePath, reachable, lairs, SPEED_CELLS, CLASSES };
    world.start = pickStart();
    return world;
  }
  Mech.AtlasWorld = { wrap, CLASSES, CLASS_OF, SPEED_CELLS };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.AtlasWorld;
})(globalThis);
