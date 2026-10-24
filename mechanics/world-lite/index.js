/* Механіка «world-lite»: малий материк за зерном: ландшафт, біоми, поселення, дороги між ними, лігва загроз.
   Усе детерміноване (світ не зберігають, лише зерно). Вхід: generate(seed). Вихід: див. README.md. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const Rng = Mech.Rng || require('../rng/index.js');
  const Names = Mech.WorldNames || require('./names.js');
  const W = 72, H = 48;
  // біоми: 0 море, 1 узбережжя, 2 рівнина, 3 ліс, 4 пагорби, 5 гори, 6 болото
  const BIOMES = [{ id: 0, name: 'Море', res: null }, { id: 1, name: 'Узбережжя', res: 'fish' }, { id: 2, name: 'Рівнина', res: 'grain' }, { id: 3, name: 'Ліс', res: 'wood' }, { id: 4, name: 'Пагорби', res: 'stone' }, { id: 5, name: 'Гори', res: 'ore' }, { id: 6, name: 'Болото', res: 'herbs' }];
  const MOVE = [99, 1.2, 1, 2, 3, 8, 4]; // ціна проходу клітини дорогою
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  function terrain(seed, salt) {
    const s = seed + '#' + salt, biome = new Uint8Array(W * H), elev = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2), d = Math.sqrt(dx * dx + dy * dy);
      const n = Rng.fbm(s + 'e', x / 14, y / 14, 3), e = n * 1.05 - d * 0.85 + 0.12;
      elev[y * W + x] = e;
      let b;
      if (e < 0.05) b = 0; else if (e < 0.1) b = 1;
      else if (e > 0.5) b = 5; else if (e > 0.38) b = 4;
      else { const m = Rng.fbm(s + 'm', x / 9, y / 9, 2); b = m > 0.64 && e < 0.25 ? 6 : m > 0.5 ? 3 : 2; }
      biome[y * W + x] = b;
    }
    // лишаємо найбільшу сушу, решту заливає море
    const comp = new Int32Array(W * H).fill(-1); let best = -1, bestN = 0, id = 0;
    for (let i = 0; i < W * H; i++) {
      if (biome[i] === 0 || comp[i] >= 0) continue;
      const q = [i]; comp[i] = id; let n = 0;
      while (q.length) { const c = q.pop(); n++; const x = c % W, y = (c / W) | 0; for (let k = 0; k < 4; k++) { const nx = x + D8[k][0], ny = y + D8[k][1]; if (!inb(nx, ny)) continue; const j = ny * W + nx; if (biome[j] !== 0 && comp[j] < 0) { comp[j] = id; q.push(j); } } }
      if (n > bestN) { bestN = n; best = id; } id++;
    }
    for (let i = 0; i < W * H; i++) if (biome[i] !== 0 && comp[i] !== best) biome[i] = 0;
    // узбережжя: суша поруч із морем
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (biome[i] === 0 || biome[i] === 5) continue; for (let k = 0; k < 4; k++) { const nx = x + D8[k][0], ny = y + D8[k][1]; if (!inb(nx, ny) || biome[ny * W + nx] === 0) { biome[i] = 1; break; } } }
    return { biome, landN: bestN };
  }

  // кількість клітин кожного біома навколо точки (радіус r)
  function around(biome, cx, cy, r) {
    const cnt = [0, 0, 0, 0, 0, 0, 0];
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (inb(x, y) && (x - cx) ** 2 + (y - cy) ** 2 <= r * r) cnt[biome[y * W + x]]++;
    return cnt;
  }

  // пошук дороги (Дейкстра по суші з цінами біомів)
  function findPath(biome, a, b) {
    const dist = new Float64Array(W * H).fill(1e9), prev = new Int32Array(W * H).fill(-1), hp = [[0, a]]; dist[a] = 0;
    const push = it => { let i = hp.push(it) - 1; while (i > 0) { const p = (i - 1) >> 1; if (hp[p][0] <= hp[i][0]) break; [hp[p], hp[i]] = [hp[i], hp[p]]; i = p; } };
    const pop = () => { const top = hp[0], last = hp.pop(); if (hp.length) { hp[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < hp.length && hp[l][0] < hp[m][0]) m = l; if (r < hp.length && hp[r][0] < hp[m][0]) m = r; if (m === i) break; [hp[m], hp[i]] = [hp[i], hp[m]]; i = m; } } return top; };
    while (hp.length) {
      const [d, c] = pop(); if (c === b) break; if (d > dist[c]) continue;
      const x = c % W, y = (c / W) | 0;
      for (const [ox, oy] of D8) { const nx = x + ox, ny = y + oy; if (!inb(nx, ny)) continue; const j = ny * W + nx, bm = biome[j]; if (bm === 0) continue; const nd = d + MOVE[bm] * (ox && oy ? 1.41 : 1); if (nd < dist[j]) { dist[j] = nd; prev[j] = c; push([nd, j]); } }
    }
    if (prev[b] < 0) return null;
    const path = []; for (let c = b; c !== -1; c = prev[c]) path.push([c % W, (c / W) | 0]);
    return path.reverse();
  }

  function generate(seed) {
    seed = String(seed || '1');
    let T = null;
    for (let salt = 0; salt < 40; salt++) { T = terrain(seed, salt); if (T.landN >= W * H * 0.28 && T.landN <= W * H * 0.62) { T.salt = salt; break; } }
    const { biome } = T, R = Rng.stream(seed, 'settle'), used = new Set();
    // кандидати під поселення
    const cand = []; for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) { const b = biome[y * W + x]; if (b === 1 || b === 2 || b === 3) cand.push([x, y]); }
    // старт гравця: різноманітність ресурсів поруч, ближче до центру
    let start = null, bs = -1;
    for (let k = 0; k < 400; k++) { const [x, y] = cand[Math.floor(R() * cand.length)], c = around(biome, x, y, 6); const variety = c.slice(1).filter(v => v >= 5).length, dc = Math.hypot(x - W / 2, y - H / 2); const s = variety * 10 - dc * 0.3 + (c[2] >= 8 ? 5 : 0) + (c[0] > 0 && c[0] < 30 ? 3 : 0); if (s > bs) { bs = s; start = [x, y]; } }
    const S = [{ id: 0, name: 'Ваше поселення', x: start[0], y: start[1], rank: 'player', pop: 0 }];
    const want = 8; let tries = 0, mind = 11;
    while (S.length < want && tries < 4000) {
      tries++; if (tries % 500 === 0) mind -= 2;
      const [x, y] = cand[Math.floor(R() * cand.length)];
      if (S.some(s => Math.hypot(s.x - x, s.y - y) < mind)) continue;
      const big = S.length % 3 === 0;
      S.push({ id: S.length, name: Names.town(R, used), x, y, rank: big ? 'town' : 'village', pop: big ? 800 + Math.floor(R() * 1500) : 120 + Math.floor(R() * 400) });
    }
    S[0].name = Names.town(R, used);
    for (const s of S) s.coast = around(biome, s.x, s.y, 2)[0] > 0;
    // дороги: мінімальне покриття + кілька зайвих зв'язків
    const links = [], inTree = new Set([0]);
    while (inTree.size < S.length) {
      let bl = null, bd = 1e9;
      for (const a of inTree) for (const s of S) { if (inTree.has(s.id)) continue; const d = Math.hypot(S[a].x - s.x, S[a].y - s.y); if (d < bd) { bd = d; bl = [a, s.id]; } }
      links.push(bl); inTree.add(bl[1]);
    }
    const has = (a, b) => links.some(l => (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a));
    for (const s of S) { const near = S.filter(o => o.id !== s.id && !has(s.id, o.id)).sort((p, q) => Math.hypot(p.x - s.x, p.y - s.y) - Math.hypot(q.x - s.x, q.y - s.y))[0]; if (near && Math.hypot(near.x - s.x, near.y - s.y) < 26 && R() < 0.5) links.push([s.id, near.id]); }
    const roads = new Uint8Array(W * H), routes = [];
    for (const [a, b] of links) { const p = findPath(biome, S[a].y * W + S[a].x, S[b].y * W + S[b].x); if (p) { routes.push({ a, b, path: p }); for (const [x, y] of p) roads[y * W + x] = 1; } }
    // лігва: за 2–5 клітин від доріг, подалі від поселень
    const KIND = { 3: ['forest', 2], 5: ['mountain', 4], 6: ['swamp', 3], 4: ['hills', 3], 2: ['plain', 2], 1: ['plain', 1] };
    const lairs = [], RL = Rng.stream(seed, 'lairs');
    const nearRoad = (x, y) => { let d = 99; for (let yy = y - 5; yy <= y + 5; yy++) for (let xx = x - 5; xx <= x + 5; xx++) if (inb(xx, yy) && roads[yy * W + xx]) d = Math.min(d, Math.hypot(xx - x, yy - y)); return d; };
    for (let tr = 0; tr < 3000 && lairs.length < 6; tr++) {
      const [x, y] = cand.length ? [3 + Math.floor(RL() * (W - 6)), 3 + Math.floor(RL() * (H - 6))] : [0, 0], b = biome[y * W + x];
      if (!KIND[b] || roads[y * W + x]) continue;
      if (S.some(s => Math.hypot(s.x - x, s.y - y) < 7) || lairs.some(l => Math.hypot(l.x - x, l.y - y) < 9)) continue;
      const d = nearRoad(x, y); if (d < 2 || d > 5) continue;
      const [kind, danger] = KIND[b];
      lairs.push({ id: lairs.length, name: Names.lair(RL, kind, used), kind, danger: Math.min(5, danger + (RL() < 0.3 ? 1 : 0)), x, y });
    }
    return { v: 1, seed, w: W, h: H, biome, S, settlements: S, routes, roads, lairs, start: 0 };
  }

  // шлях між двома поселеннями по дорогах (послідовність клітин); null, якщо дороги не з'єднують
  function routePath(world, a, b) {
    const adj = new Map(); for (const r of world.routes) { (adj.get(r.a) || adj.set(r.a, []).get(r.a)).push([r.b, r, false]); (adj.get(r.b) || adj.set(r.b, []).get(r.b)).push([r.a, r, true]); }
    const prev = new Map([[a, null]]), q = [a];
    while (q.length) { const c = q.shift(); if (c === b) break; for (const [n, r, rev] of adj.get(c) || []) if (!prev.has(n)) { prev.set(n, [c, r, rev]); q.push(n); } }
    if (!prev.has(b)) return null;
    const segs = []; for (let c = b; prev.get(c); c = prev.get(c)[0]) { const [, r, rev] = prev.get(c); segs.push(rev ? r.path.slice() : r.path.slice().reverse()); }
    segs.reverse(); const out = []; for (const s of segs) for (let i = out.length ? 1 : 0; i < s.length; i++) out.push(s[i]);
    return out;
  }
  const api = { W, H, BIOMES, generate, routePath, around };
  Mech.WorldLite = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
