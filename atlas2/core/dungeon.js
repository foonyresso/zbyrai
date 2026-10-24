// Атлас 2.0, підземелля: генератор карти підземелля від зерна (кімнати різних форм і розмірів, коридори, двері, секретні ходи, сходи між поверхами, монстри, пастки, скарби). Без DOM. Одна клітина = TILE метрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2, DD = A.DungeonData, TILE = 1.5, FL = 1, COR = 2;
  const SIZES = { small: { w: 52, h: 38, rooms: [6, 9], floors: [1, 1] }, mid: { w: 68, h: 50, rooms: [9, 14], floors: [1, 2] }, big: { w: 90, h: 64, rooms: [13, 20], floors: [4, 6] } };
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1)), pickW = (r, o) => { let t = 0; for (const k in o) t += o[k]; let v = r() * t; for (const k in o) { v -= o[k]; if (v <= 0) return k; } return Object.keys(o)[0]; };
  // ---- форми кімнат: повертають список клітин відносно кутка (0..w, 0..h)
  function cellsOf(shape, w, h, r) {
    const out = [];
    if (shape === 'rect' || shape === 'long') { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.push([x, y]); }
    else if (shape === 'round') { const cx = (w - 1) / 2, cy = (h - 1) / 2; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (x - cx) / (w / 2), dy = (y - cy) / (h / 2); if (dx * dx + dy * dy <= 1.02 + (r() - 0.5) * 0.18) out.push([x, y]); } }
    else if (shape === 'cross') { const a = Math.max(2, w / 3 | 0), b = Math.max(2, h / 3 | 0); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x >= (w - a) / 2 && x < (w + a) / 2) || (y >= (h - b) / 2 && y < (h + b) / 2)) out.push([x, y]); }
    return out;
  }
  function floorGen(spec, n, total, r) {
    const K = DD.KINDS[spec.kind], S = SIZES[spec.size], W = S.w, H = S.h, g = new Uint8Array(W * H), rid = new Int16Array(W * H).fill(-1), rooms = [], cors = [];
    const target = ri(r, S.rooms[0], S.rooms[1]);
    for (let t = 0; t < target * 40 && rooms.length < target; t++) {
      const shape = pickW(r, K.shapes); let w, h;
      if (shape === 'long') { const v = r() < 0.5; w = v ? ri(r, 3, 4) : ri(r, 9, 15); h = v ? ri(r, 9, 15) : ri(r, 3, 4); } else if (shape === 'round') { w = ri(r, 6, 12); h = ri(r, 6, 12); } else if (shape === 'cross') { w = ri(r, 8, 12); h = ri(r, 8, 12); } else { w = ri(r, 4, 12); h = ri(r, 4, 10); }
      const x0 = ri(r, 2, W - w - 2), y0 = ri(r, 2, H - h - 2); let ok = true;
      for (let y = y0 - 2; y < y0 + h + 2 && ok; y++) for (let x = x0 - 2; x < x0 + w + 2; x++) if (g[y * W + x]) { ok = false; break; }
      if (!ok) continue; const cells = cellsOf(shape, w, h, r).map(c => [c[0] + x0, c[1] + y0]), id = rooms.length;
      for (const c of cells) { g[c[1] * W + c[0]] = FL; rid[c[1] * W + c[0]] = id; }
      rooms.push({ id, x: x0, y: y0, w, h, shape, cx: Math.round(x0 + w / 2), cy: Math.round(y0 + h / 2), type: 'hall', area: cells.length, doors: 0 });
    }
    // з'єднання: мінімальне остовне дерево + кілька зайвих зв'язків (петлі)
    const edges = [], inT = new Set([0]); const d2 = (a, b) => Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy);
    while (inT.size < rooms.length) { let best = null; for (const i of inT) for (const j of rooms.keys()) if (!inT.has(j)) { const d = d2(rooms[i], rooms[j]) * (0.8 + r() * 0.5); if (!best || d < best[0]) best = [d, i, j]; } edges.push([best[1], best[2], false]); inT.add(best[2]); }
    const extra = Math.floor(rooms.length * (0.2 + r() * 0.2)); for (let t = 0; t < extra * 6 && edges.length < rooms.length - 1 + extra; t++) { const a = ri(r, 0, rooms.length - 1), b = ri(r, 0, rooms.length - 1); if (a !== b && d2(rooms[a], rooms[b]) < 28 && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) edges.push([a, b, true]); }
    const doors = [], cw = K.cw;
    for (const [a, b, loop] of edges) {
      const A0 = rooms[a], B0 = rooms[b], secret = r() < (loop ? 0.45 : 0.1), pts = [], horizFirst = r() < 0.5;
      let x = A0.cx, y = A0.cy; const mid = horizFirst ? [B0.cx, A0.cy] : [A0.cx, B0.cy];
      const walk = (tx, ty) => { while (x !== tx || y !== ty) { if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y); pts.push([x, y]); } };
      pts.push([x, y]); walk(mid[0], mid[1]); walk(B0.cx, B0.cy);
      const path = [];
      for (const [px, py] of pts) {
        for (let dy = 0; dy < cw; dy++) for (let dx = 0; dx < cw; dx++) { const q = (py + dy) * W + px + dx; if (px + dx < W - 1 && py + dy < H - 1 && !g[q]) { g[q] = COR; } }
        path.push([px, py]);
      }
      cors.push({ a, b, secret, pts: path });
      // двері: перехід кімната→коридор на початку й наприкінці
      let prev = rid[path[0][1] * W + path[0][0]];
      for (let i = 1; i < path.length; i++) { const cur = rid[path[i][1] * W + path[i][0]], pq = rid[path[i - 1][1] * W + path[i - 1][0]]; if (pq >= 0 && cur < 0) doors.push({ x: path[i][0], y: path[i][1], room: pq, secret: secret && r() < 0.8, locked: r() < 0.12, corr: cors.length - 1 }); if (pq < 0 && cur >= 0) doors.push({ x: path[i - 1][0], y: path[i - 1][1], room: cur, secret: secret && r() < 0.8, locked: r() < 0.12, corr: cors.length - 1 }); prev = cur; }
    }
    // двері звичайним проходам: не кожен перехід має двері (дрібні отвори просто арка)
    const dm = new Map(); for (const d of doors) { const k = d.x + ',' + d.y; if (!dm.has(k)) dm.set(k, d); } const dl = [...dm.values()].filter(d => d.secret || d.locked || r() < 0.75); dl.forEach(d => { rooms[d.room].doors++; });
    return { n, W, H, g, rid, rooms, cors, doors: dl };
  }
  // наповнення поверху: типи кімнат, монстри, пастки, скарби
  function fill(fl, spec, n, total, r) {
    const K = DD.KINDS[spec.kind], rooms = fl.rooms, lvl = spec.level + n * 2, tier = i => Math.min(K.mons.length - 1, Math.max(0, Math.floor(i)));
    const free = rooms.map(q => q.id), take = id => { const k = free.indexOf(id); if (k >= 0) free.splice(k, 1); };
    // вхід/сходи нагору: найближча до заданої точки (поверх 1) або випадкова
    let up = rooms[0]; if (n === 0 && spec.entry) { let bd = 1e9; for (const q of rooms) { const d = Math.hypot(q.cx - spec.entry.tx * fl.W, q.cy - spec.entry.ty * fl.H); if (d < bd) { bd = d; up = q; } } } else up = rooms[ri(r, 0, rooms.length - 1)];
    up.type = n === 0 ? 'entrance' : 'stairs'; take(up.id); fl.up = { room: up.id, x: up.cx, y: up.cy };
    if (n < total - 1) { let dn = null, bd = -1; for (const q of rooms) { const d = Math.hypot(q.cx - up.cx, q.cy - up.cy); if (q !== up && d > bd) { bd = d; dn = q; } } if (dn) { dn.type = 'stairs'; take(dn.id); fl.down = { room: dn.id, x: dn.cx, y: dn.cy }; } }
    // бос: найдальша від входу кімната на нижньому поверсі (на інших — мінібос)
    if (n === total - 1 && free.length) { let b = null, bd = -1; for (const id of free) { const q = rooms[id], d = Math.hypot(q.cx - up.cx, q.cy - up.cy) + q.area * 0.3; if (d > bd) { bd = d; b = q; } } b.type = 'boss'; b.boss = true; take(b.id); }
    const rest = free.slice(), specials = ['treasury', 'shrine', 'lair', 'guard', 'store', 'library', 'cell', 'cell'];
    for (const id of rest) { const q = rooms[id]; q.type = r() < 0.3 ? 'hall' : specials[ri(r, 0, specials.length - 1)]; if (spec.kind === 'sewer' && r() < 0.25) q.type = 'cistern'; }
    // таємна кімната: кімната з одним входом, всі її двері стають секретними
    for (const q of rooms) if (q.type !== 'entrance' && q.type !== 'stairs' && !q.boss && q.doors <= 1 && r() < 0.5) { q.secret = true; for (const d of fl.doors) if (d.room === q.id) d.secret = true; if (q.type === 'hall') q.type = 'secret'; }
    fl.monsters = []; fl.traps = []; fl.loot = [];
    const rmon = (q, boss) => { const base = (lvl / 12) * K.mons.length * 0.5 + r() * 2.2, count = boss ? 1 : ri(r, 1, 3 + (q.area > 60 ? 2 : 0)), name = boss ? (n === total - 1 ? K.boss : 'Страж ' + K.mons[tier(base)].toLowerCase()) : K.mons[tier(base - 1 + r() * 2)]; return { name, count, level: lvl + (boss ? 3 : ri(r, -1, 1)), boss: !!boss, room: q.id }; };
    for (const q of rooms) {
      const cells = []; for (let y = q.y; y < q.y + q.h; y++) for (let x = q.x; x < q.x + q.w; x++) if (fl.rid[y * fl.W + x] === q.id) cells.push([x, y]);
      const at = () => cells[ri(r, 0, cells.length - 1)];
      if (q.boss) { const m = rmon(q, true); [m.x, m.y] = [q.cx, q.cy]; fl.monsters.push(m); const c = at(); fl.loot.push({ ...pickLoot(r, 3), x: c[0], y: c[1], room: q.id }); }
      else if (q.type === 'lair' || q.type === 'guard' || (q.type !== 'entrance' && q.type !== 'stairs' && r() < 0.45)) { const m = rmon(q, q.type === 'lair' && r() < 0.35 && n < total - 1); const c = at(); [m.x, m.y] = c; fl.monsters.push(m); }
      if (q.type === 'treasury' || q.secret || r() < 0.3) { const c = at(); fl.loot.push({ ...pickLoot(r, q.type === 'treasury' || q.secret ? 2 : 1), x: c[0], y: c[1], room: q.id }); }
      if (q.type === 'treasury' || r() < 0.25) { const c = at(), t = DD.TRAPS[ri(r, 0, DD.TRAPS.length - 1)]; fl.traps.push({ name: t[0], text: t[1], x: c[0], y: c[1], room: q.id, hidden: r() < 0.7 }); }
    }
    // пастки в коридорах
    for (const c of fl.cors) if (r() < 0.2 && c.pts.length > 8) { const p = c.pts[ri(r, 3, c.pts.length - 4)], t = DD.TRAPS[ri(r, 0, DD.TRAPS.length - 1)]; if (fl.rid[p[1] * fl.W + p[0]] < 0) fl.traps.push({ name: t[0], text: t[1], x: p[0], y: p[1], room: -1, hidden: true }); }
  }
  // клітини, видимі лише після розкриття секретів: таємні кімнати й клітини, якими ходять тільки таємні коридори
  function hidden(f, cw) {
    const W = f.W, use = new Uint8Array(W * f.H), open = new Uint8Array(W * f.H); f.hid = new Uint8Array(W * f.H);
    for (const c of f.cors) for (const [x, y] of c.pts) for (let dy = 0; dy < cw; dy++) for (let dx = 0; dx < cw; dx++) { const q = (y + dy) * W + x + dx; if (x + dx < W && y + dy < f.H) { use[q] = 1; if (!c.secret) open[q] = 1; } }
    for (let i = 0; i < use.length; i++) if (f.g[i] === 2 && use[i] && !open[i]) f.hid[i] = 1;
    for (const q of f.rooms) if (q.secret) for (let i = 0; i < use.length; i++) if (f.rid[i] === q.id) f.hid[i] = 1;
  }
  const pickLoot = (r, minV) => { const c = DD.LOOT.filter(l => l[2] >= minV - 1); const l = c[ri(r, 0, c.length - 1)]; return { name: l[0], text: l[1], value: l[2] }; };
  // ---- публічне: spec = { id, seed, kind, size, floors?, level, entry?: {tx,ty} (0..1 положення входу), links?: [{to, name, secret, dir}] }
  function generate(spec) {
    const r = A.Rng.stream(spec.seed, 'dungeon|' + spec.id), S = SIZES[spec.size] || SIZES.small, K = DD.KINDS[spec.kind] || DD.KINDS.cellar;
    spec = { level: 1, ...spec, size: SIZES[spec.size] ? spec.size : 'small', kind: DD.KINDS[spec.kind] ? spec.kind : 'cellar' };
    const total = spec.floors || ri(r, S.floors[0], S.floors[1]), floors = [];
    for (let n = 0; n < total; n++) { const f = floorGen(spec, n, total, r); fill(f, spec, n, total, r); hidden(f, K.cw); floors.push(f); }
    // зв'язки з іншими підземеллями: двері-переходи на першому поверсі в кімнатах, найближчих до напрямку
    const f0 = floors[0], links = [];
    for (const L of spec.links || []) { const ang = L.dir || 0; let best = null, bd = -1e9; for (const q of f0.rooms) { const d = (q.cx - f0.W / 2) * Math.cos(ang) + (q.cy - f0.H / 2) * Math.sin(ang); if (d > bd && q.type !== 'entrance') { bd = d; best = q; } } if (best) links.push({ to: L.to, name: L.name, secret: !!L.secret, room: best.id, x: best.cx, y: best.cy, floor: L.floor == null ? 0 : Math.min(L.floor, total - 1) }); }
    for (const L of links) { const f = floors[L.floor]; const q = f.rooms.find(z => z.id === L.room) || f.rooms[0]; L.room = q.id; L.x = q.cx; L.y = q.cy; }
    return { format: 'atlas2-dungeon', version: 1, id: spec.id, seed: spec.seed, kind: spec.kind, kindName: K.n, name: spec.name || spec.id, size: spec.size, level: spec.level, depth: spec.depth, tile: TILE, floors, links, text: K.d };
  }
  // стислий опис для JSON-збереження (без сирих сіток)
  function toJSON(D) {
    return { format: D.format, version: D.version, id: D.id, seed: D.seed, kind: D.kind, name: D.name, size: D.size, level: D.level, depthM: D.depth, tileM: D.tile, links: D.links,
      floors: D.floors.map(f => ({ n: f.n + 1, w: f.W, h: f.H, up: f.up, down: f.down || null, rooms: f.rooms.map(q => ({ id: q.id, type: q.type, shape: q.shape, x: q.x, y: q.y, w: q.w, h: q.h, secret: !!q.secret })), corridors: f.cors.map(c => ({ from: c.a, to: c.b, secret: c.secret, points: c.pts })), doors: f.doors.map(d => ({ x: d.x, y: d.y, secret: d.secret, locked: d.locked })), monsters: f.monsters, traps: f.traps, loot: f.loot })) };
  }
  A.Dungeon = { generate, toJSON, SIZES, TILE };
})();
