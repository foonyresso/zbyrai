// Симулятор підземель: ядро. Без DOM. Кімнати-тайли на ґратці зі стикованими дверима, коридори, відгалуження,
// петлі, таємні двері, пастки, поверхи зі сходами, населення за типом підземелля з Атласу. Усе від зерна.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dungeon-types.js')); else root.DungeonCore = factory(root.DungeonTypes);
})(typeof self !== 'undefined' ? self : this, function (TYPES) {
  'use strict';
  const CELL = 12, MAX_ROOMS = 300, FORMAT = 1;
  const T = { ROCK: 0, FLOOR: 1, CORR: 2, DOOR: 3, SECRET: 4, DOWN: 5, UP: 6 };
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N E S W
  const STYLES = { brick: 'Зали (прямокутні)', cave: 'Печери (овальні)' };
  const CAVE_IDS = ['mountain-cave', 'blue-hollow-caves', 'nest-grottoes', 'occupied-warren', 'scorpion-burrows', 'star-cavern', 'great-hollow', 'mine', 'root-knot-depths', 'barrow'];
  const GENERIC = ['щури', 'скелети', 'розбійники', 'гобліни', 'павуки'];
  const TRAPS = ['плита-натискач', 'яма з шипами', 'стріли зі стіни', 'отруйний газ', 'обвал стелі', 'сигнальний дзвін'];
  const ROOM_NAMES = ['Зала', 'Склад', 'Вартівня', 'Святилище', 'Камера', 'Бібліотека', 'Кузня', 'Їдальня', 'Казарма', 'Майстерня', 'Колодязь', 'Архів'];
  const LOOT = ['скриня зі скарбом', 'зброя на стійці', 'мішок монет', 'сувій із закляттям', 'пляшки зілля', 'коштовності в урні'];
  const TIER = ['бідний', 'простий', 'добрий', 'багатий', 'королівський'];

  function hashSeed(s) { s = String(s); let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; }
  function rng(seed) { let a = hashSeed(seed); return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const randSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ri = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
  const typeById = id => TYPES.find(t => t.id === id) || null;

  /* Особливості кімнат: у кожного типу підземелля свій набір (частка кімнат, що їх мають) */
  const TAGS = {
    flooded: ['Затоплені зали', 'Частка кімнат із водою: повільний рух, плавучі речі'], rubble: ['Завали', 'Частка кімнат із уламками й обваленою стелею'],
    tombs: ['Саркофаги', 'Частка кімнат із саркофагами й нішами для поховань'], webs: ['Павутиння', 'Частка кімнат, затягнутих павутинням'],
    ore: ['Жили руди', 'Частка кімнат зі жилами руди й гірничим знаряддям'], altar: ['Вівтарі', 'Частка кімнат із вівтарем чи святинею'],
    cells: ['Камери', 'Частка кімнат із камерами й гратами'], lab: ['Лабораторії', 'Частка кімнат зі столами, колбами й приладами'],
    library: ['Архіви', 'Частка кімнат зі стелажами, сувоями й книжками'], nests: ['Гнізда й лігва', 'Частка кімнат, де мешканці влаштували гнізда'],
    roots: ['Коріння', 'Частка кімнат, пророслих корінням'], cache: ['Схованки', 'Частка кімнат із прихованими схованками'],
    crystals: ['Кристали', 'Частка кімнат зі світними кристалами'], blood: ['Сліди крові', 'Частка кімнат із калюжами крові й жертовними слідами'],
  };
  const TYPE_TAGS = {
    sewer: { flooded: 60, nests: 25, rubble: 15 }, catacombs: { tombs: 55, webs: 20, altar: 15 }, 'thieves-lair': { cells: 30, cache: 40, library: 10 },
    'royal-vault': { cache: 60, altar: 10, rubble: 5 }, 'ruin-cellars': { rubble: 50, webs: 25, flooded: 10 }, crypt: { tombs: 70, altar: 20, webs: 15 },
    'occupied-warren': { nests: 55, blood: 25, rubble: 15 }, 'village-cellar': { cache: 30, webs: 25, flooded: 15 }, 'ancient-vault': { altar: 25, rubble: 30, library: 20 },
    'keep-cellars': { cells: 35, rubble: 30, cache: 20 }, 'temple-undercroft': { altar: 40, library: 25, tombs: 20 }, 'mage-cellar': { lab: 50, library: 30, crystals: 20 },
    mine: { ore: 55, rubble: 35, flooded: 15 }, 'mountain-cave': { nests: 25, crystals: 20, flooded: 20 }, barrow: { tombs: 60, webs: 15, altar: 15 },
    'bandit-hideout': { cache: 35, cells: 25, blood: 10 }, 'star-cavern': { crystals: 60, nests: 20 }, 'trunk-fortress': { roots: 50, cells: 25, cache: 20 },
    'root-knot-depths': { roots: 70, nests: 25, webs: 15 }, 'palace-cellar-mine': { ore: 40, cache: 30, rubble: 25 }, 'torn-castle-vaults': { rubble: 40, blood: 25, cells: 20 },
    'blood-well-shrine': { blood: 55, altar: 40, tombs: 15 }, 'scorpion-burrows': { nests: 50, webs: 20, rubble: 15 }, 'skull-fortress-depths': { blood: 40, tombs: 35, altar: 25 },
    'trunk-temple': { roots: 45, altar: 35, webs: 25 }, 'great-hollow': { webs: 40, roots: 30, nests: 30 }, 'blue-hollow-caves': { crystals: 35, flooded: 25, nests: 25 },
    'cloud-monastery-crypt': { tombs: 35, altar: 35, library: 20 }, 'nest-grottoes': { nests: 60, crystals: 10, rubble: 15 },
  };
  const FREE_TAGS = { rubble: 15, webs: 15, cache: 20 };
  const tagDefaults = id => Object.assign({}, TYPE_TAGS[id] || FREE_TAGS);

  /* База монстрів: підключається ззовні (у браузері читається з medieval-world/monsters/*.js через реєстр) */
  const RANK = { weak: 1, monster: 2, other: 2, 'mini-boss': 3, boss: 4, 'super-boss': 5, 'world-boss': 6 };
  let MONS = [];
  const setMonsters = list => { MONS = list.filter(m => m && m.id && RANK[m.kind]).slice().sort((a, b) => a.id < b.id ? -1 : 1); };
  const stems = s => String(s).toLowerCase().split(/[^\p{L}]+/u).filter(w => w.length >= 5).map(w => w.slice(0, 5));
  function monsterPool(ty) {
    const dw = ty && Array.isArray(ty.worlds) ? ty.worlds : null, ids = ty ? ty.monsterIds || [] : [], inh = ty ? ty.inhabitants.flatMap(stems) : [];
    const sea = m => Array.isArray(m.spawn.biomes) && m.spawn.biomes.length && m.spawn.biomes.every(b => b === 'deep' || b === 'crown-lakes'); // морські істоти під землею не живуть
    return MONS.filter(m => { const w = m.spawn && m.spawn.worlds; return !sea(m) && (ids.includes(m.id) || w === 'all' || (dw && Array.isArray(w) && w.some(x => dw.includes(x)))); })
      .map(m => ({ m, rank: RANK[m.kind], w: ids.includes(m.id) ? 10 : stems(m.name).some(x => inh.includes(x)) ? 8 : 1 }));
  }
  function pickMonster(rnd, pool, lo, hi) {
    let c = pool.filter(p => p.rank >= lo && p.rank <= hi); if (!c.length) c = pool.filter(p => p.rank <= hi);
    if (!c.length) return null;
    let t = c.reduce((s, p) => s + p.w, 0) * rnd(); for (const p of c) if ((t -= p.w) <= 0) return p;
    return c[c.length - 1];
  }

  function defaults() { return { v: FORMAT, seed: 'zbyrai', type: '', rooms: 24, levels: 1, style: 'brick', branch: 40, loops: 25, secrets: 30, traps: 40, danger: 2, mon: 50, loot: 50, opts: tagDefaults('') }; }
  function normalize(p) {
    const d = defaults(), o = Object.assign(defaults(), p || {});
    o.seed = String(o.seed || d.seed).slice(0, 24);
    o.type = typeById(o.type) ? o.type : '';
    o.rooms = clamp(Math.round(+o.rooms || d.rooms), 3, MAX_ROOMS);
    o.levels = clamp(Math.round(+o.levels || 1), 1, Math.min(6, Math.floor(o.rooms / 2)));
    o.style = STYLES[o.style] ? o.style : 'brick';
    for (const k of ['branch', 'loops', 'secrets', 'traps', 'mon', 'loot']) o[k] = clamp(Math.round(+o[k]), 0, 100) || 0;
    const td = tagDefaults(o.type), src = o.opts && typeof o.opts === 'object' ? o.opts : {};
    o.opts = {}; for (const k of Object.keys(td)) o.opts[k] = k in src ? clamp(Math.round(+src[k]), 0, 100) || 0 : td[k];
    o.danger = clamp(Math.round(+o.danger || 1), 1, 5);
    return o;
  }

  /* ---------- один поверх ---------- */
  function genFloor(P, n, fi, last, start, W, H, rnd, inhab) {
    const cells = [], used = new Map(), open = [0], edges = [], key = (x, y) => y * W + x;
    const add = (x, y) => { used.set(key(x, y), cells.length); cells.push({ x, y, adj: [] }); return cells.length - 1; };
    const link = (a, b, loop) => { edges.push({ a, b, secret: false, loop: !!loop }); cells[a].adj.push(b); cells[b].adj.push(a); };
    add(start.x, start.y);
    while (cells.length < n && open.length) {
      const i = rnd() < P.branch / 100 ? Math.floor(rnd() * open.length) : open.length - 1; // «розгалуження»: випадкова клітинка проти найновішої (довгі ходи)
      const c = cells[open[i]], nb = DIRS.filter(([dx, dy]) => { const x = c.x + dx, y = c.y + dy; return x >= 0 && y >= 0 && x < W && y < H && !used.has(key(x, y)); });
      if (!nb.length) { open.splice(i, 1); continue; }
      const [dx, dy] = pick(rnd, nb), ni = add(c.x + dx, c.y + dy);
      link(open[i], ni); open.push(ni);
    }
    const loopsWant = Math.round(P.loops / 100 * cells.length * 0.35);
    const cand = [];
    cells.forEach((c, i) => { for (const [dx, dy] of [[1, 0], [0, 1]]) { const j = used.get(key(c.x + dx, c.y + dy)); if (j !== undefined && !c.adj.includes(j)) cand.push([i, j]); } });
    for (let k = 0; k < loopsWant && cand.length; k++) { const [a, b] = cand.splice(Math.floor(rnd() * cand.length), 1)[0]; link(a, b, true); }
    // відстані від входу: найдальша кімната = фінал або сходи вниз
    const dist = cells.map(() => -1); dist[0] = 0; const q = [0];
    for (let h = 0; h < q.length; h++) for (const j of cells[q[h]].adj) if (dist[j] < 0) { dist[j] = dist[q[h]] + 1; q.push(j); }
    let exit = 0; dist.forEach((d, i) => { if (d > dist[exit]) exit = i; });
    // кімнати
    const w = W * CELL, h = H * CELL, tiles = new Uint8Array(w * h), rid = new Int16Array(w * h).fill(-1);
    const rooms = cells.map((c, i) => {
      const deg = c.adj.length, big = i === 0 || i === exit || deg >= 3;
      const rw = ri(rnd, big ? 6 : 4, 9), rh = ri(rnd, big ? 6 : 4, 9);
      const x = c.x * CELL + ri(rnd, 1, CELL - 1 - rw), y = c.y * CELL + ri(rnd, 1, CELL - 1 - rh);
      const role = i === 0 ? 'start' : i === exit ? (last ? 'boss' : 'down') : deg === 1 ? 'dead' : deg >= 3 ? 'hub' : 'room';
      return { id: i, cx: c.x, cy: c.y, x, y, w: rw, h: rh, mx: x + (rw >> 1), my: y + (rh >> 1), role, deg, dist: dist[i], doors: [], traps: [], monsters: null, loot: null, secret: false, name: '' };
    });
    const ell = P.style === 'cave';
    for (const r of rooms) for (let yy = 0; yy < r.h; yy++) for (let xx = 0; xx < r.w; xx++) {
      if (ell) { const ex = (xx + .5 - r.w / 2) / (r.w / 2), ey = (yy + .5 - r.h / 2) / (r.h / 2); if (ex * ex + ey * ey > 1.02) continue; }
      const t = (r.y + yy) * w + r.x + xx; tiles[t] = T.FLOOR; rid[t] = r.id;
    }
    // таємні двері: лише глухі кінці (щоб видимі кімнати лишались зв'язними) та частина петель
    for (const e of edges) {
      const dead = [e.a, e.b].find(i => rooms[i].role === 'dead');
      if (e.loop ? rnd() < P.secrets / 100 * 0.5 : dead !== undefined && rnd() < P.secrets / 100 * 0.6) { e.secret = true; if (!e.loop) rooms[dead].secret = true; }
    }
    // коридори: від центру до центру ламаною по межі клітинок; двері на виході з кімнати
    const stepPath = pts => { const out = []; for (let i = 0; i < pts.length - 1; i++) { let [x, y] = pts[i]; const [tx, ty] = pts[i + 1], sx = Math.sign(tx - x), sy = Math.sign(ty - y); while (x !== tx || y !== ty) { out.push([x, y]); x += sx; y += sy; } } out.push(pts[pts.length - 1]); return out; };
    for (const e of edges) {
      let A = rooms[e.a], B = rooms[e.b], pts;
      if (A.cy === B.cy) { if (A.cx > B.cx) [A, B] = [B, A]; const bx = B.cx * CELL; pts = [[A.mx, A.my], [bx, A.my], [bx, B.my], [B.mx, B.my]]; }
      else { if (A.cy > B.cy) [A, B] = [B, A]; const by = B.cy * CELL; pts = [[A.mx, A.my], [A.mx, by], [B.mx, by], [B.mx, B.my]]; }
      const path = stepPath(pts);
      for (const [x, y] of path) if (tiles[y * w + x] === T.ROCK) tiles[y * w + x] = T.CORR;
      const door = (order, R) => { for (const [x, y] of order) { const t = y * w + x; if (rid[t] !== R.id) { if (tiles[t] === T.CORR) tiles[t] = e.secret ? T.SECRET : T.DOOR; R.doors.push([x, y, e.secret ? 1 : 0]); return; } } };
      door(path, A); door(path.slice().reverse(), B);
    }
    // сходи
    if (fi > 0) tiles[rooms[0].my * w + rooms[0].mx] = T.UP;
    if (!last) tiles[rooms[exit].my * w + rooms[exit].mx] = T.DOWN;
    return { index: fi, w, h, W, H, tiles, rid, rooms, edges, exit, start: { x: start.x, y: start.y }, traps: [] };
  }

  function populate(P, f, rnd, inhab, pool) {
    const danger = P.danger, rooms = f.rooms, last = f.index === P.levels - 1;
    const mon = (role, big) => {
      const regHi = Math.min(3, 1 + Math.ceil(danger / 2));
      const lo = role === 'boss' ? (danger <= 2 ? 3 : 4) : big && danger >= 2 ? 2 : 1, hi = role === 'boss' ? (danger >= 5 && rnd() < .5 ? 5 : danger <= 2 ? 3 : 4) : regHi;
      const p = pickMonster(rnd, pool, lo, hi);
      if (p) return { id: p.m.id, name: p.m.name, kind: p.m.kind, rank: p.rank, desc: (p.m.lore && p.m.lore.description) || '', count: role === 'boss' || p.rank >= 3 ? 1 : ri(rnd, 1, 2 + danger), boss: role === 'boss' };
      return { id: null, name: pick(rnd, inhab), kind: 'monster', rank: 2, desc: '', count: role === 'boss' ? 1 : ri(rnd, 1, 2 + danger), boss: role === 'boss' };
    };
    const monP = 0.12 + P.mon / 100 * 0.6 + danger * 0.04, lootDead = Math.min(0.95, P.loot / 100 * 1.6), lootRoom = P.loot / 100 * 0.24;
    let ni = 0;
    for (const r of rooms) {
      r.tags = [];
      if (r.role === 'start') { r.name = f.index === 0 ? 'Вхід' : 'Сходи нагору'; continue; }
      if (r.role === 'boss') { r.name = 'Фінальна зала'; r.monsters = mon('boss'); r.loot = { tier: TIER[Math.min(4, danger)], what: pick(rnd, LOOT) }; continue; }
      if (r.role === 'down') { r.name = 'Сходи вниз'; r.monsters = rnd() < .7 ? mon('room') : null; continue; }
      for (const k of Object.keys(P.opts)) if (rnd() < P.opts[k] / 100) r.tags.push(k);
      r.name = r.secret ? 'Таємна кімната' : r.role === 'dead' ? (rnd() < .5 ? 'Сховок' : 'Скарбниця') : r.role === 'hub' ? 'Перехрестя залів' : ROOM_NAMES[ni++ % ROOM_NAMES.length] + (ni > ROOM_NAMES.length ? ' ' + Math.ceil(ni / ROOM_NAMES.length) : '');
      if (rnd() < monP) r.monsters = mon(r.role, r.role === 'hub');
      if (r.role === 'dead' ? rnd() < lootDead : rnd() < lootRoom) r.loot = { tier: TIER[clamp(ri(rnd, danger - 2, danger - 1), 0, 4)], what: pick(rnd, LOOT) };
    }
    // пастки на коридорах і в кімнатах
    const spots = [];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const t = f.tiles[y * f.w + x]; if (t === T.CORR) spots.push([x, y, -1]); else if (t === T.FLOOR && f.rid[y * f.w + x] > 0 && rooms[f.rid[y * f.w + x]].role !== 'down') spots.push([x, y, f.rid[y * f.w + x]]); }
    const want = Math.min(spots.length, Math.round(P.traps / 100 * rooms.length * 0.9 * (0.5 + danger / 4)));
    for (let k = 0; k < want; k++) { const s = spots.splice(Math.floor(rnd() * spots.length), 1)[0]; const tr = { x: s[0], y: s[1], kind: pick(rnd, TRAPS), room: s[2] }; f.traps.push(tr); if (s[2] >= 0) rooms[s[2]].traps.push(tr); }
  }

  function generate(params) {
    const P = normalize(params), rnd = rng(P.seed + '|' + P.type + '|' + P.rooms + '|' + P.levels), ty = typeById(P.type), pool = monsterPool(ty);
    const inhab = ty && ty.inhabitants.length ? ty.inhabitants : GENERIC;
    const per = Array.from({ length: P.levels }, (_, i) => Math.floor(P.rooms / P.levels) + (i < P.rooms % P.levels ? 1 : 0));
    const W = Math.max(3, Math.ceil(Math.sqrt(Math.max(...per) * 2.5)) + 1), floors = [];
    let start = { x: ri(rnd, 0, W - 1), y: ri(rnd, 0, W - 1) };
    for (let i = 0; i < P.levels; i++) {
      const f = genFloor(P, per[i], i, i === P.levels - 1, start, W, W, rnd, inhab);
      populate(P, f, rng(P.seed + '|pop|' + i), inhab, pool);
      floors.push(f);
      const ex = f.rooms[f.exit]; start = { x: ex.cx, y: ex.cy };
    }
    const all = floors.flatMap(f => f.rooms);
    const stats = {
      floors: floors.length, rooms: all.length,
      corridors: floors.reduce((s, f) => s + f.tiles.reduce((c, t) => c + (t === T.CORR), 0), 0),
      doors: floors.reduce((s, f) => s + f.rooms.reduce((c, r) => c + r.doors.length, 0), 0) / 2,
      secrets: floors.reduce((s, f) => s + f.edges.filter(e => e.secret).length, 0),
      traps: floors.reduce((s, f) => s + f.traps.length, 0),
      monsters: all.reduce((s, r) => s + (r.monsters ? r.monsters.count : 0), 0), kinds: new Set(all.filter(r => r.monsters).map(r => r.monsters.name)).size,
      loot: all.filter(r => r.loot).length,
    };
    return { params: P, type: ty, inhabitants: inhab, floors, stats };
  }

  /* ---------- підгонка під тип підземелля Атласу ---------- */
  function applyType(params, id, rnd) {
    const ty = typeById(id), o = normalize(params);
    if (!ty) { o.type = ''; return o; }
    rnd = rnd || Math.random;
    o.type = ty.id; o.rooms = ri(rnd, ty.rooms[0], ty.rooms[1]); o.levels = ri(rnd, ty.levels[0], ty.levels[1]);
    o.danger = ty.danger; o.style = CAVE_IDS.includes(ty.id) ? 'cave' : 'brick'; o.opts = tagDefaults(ty.id);
    return normalize(o);
  }
  function randomize(params, locks, rnd) {
    rnd = rnd || Math.random; locks = locks || {};
    let o = normalize(params); o.seed = randSeed();
    if (!locks.type) { const ty = rnd() < 0.2 ? null : pick(rnd, TYPES); o = ty ? applyType(o, ty.id, rnd) : Object.assign(o, { type: '' }); }
    else if (o.type) o = applyType(o, o.type, rnd);
    if (!o.type) { o.rooms = ri(rnd, 8, 60); o.levels = ri(rnd, 1, 3); o.danger = ri(rnd, 1, 5); o.style = rnd() < .3 ? 'cave' : 'brick'; }
    o.branch = ri(rnd, 0, 100); o.loops = ri(rnd, 0, 70); o.secrets = ri(rnd, 0, 70); o.traps = ri(rnd, 0, 80); o.mon = ri(rnd, 25, 80); o.loot = ri(rnd, 25, 80);
    for (const k of Object.keys(o.opts)) o.opts[k] = clamp(o.opts[k] + ri(rnd, -25, 25), 0, 100);
    return normalize(o);
  }
  const toJSON = p => JSON.stringify(normalize(p), null, 1);
  const fromJSON = s => normalize(typeof s === 'string' ? JSON.parse(s) : s);
  function describe(d) {
    const s = d.stats, p = d.params;
    return `${d.type ? d.type.name : 'Підземелля'}: ${s.rooms} кімнат, ${s.floors} пов., небезпека ${p.danger}/5; ${s.doors} дверей (з них таємних ${s.secrets}), ${s.traps} пасток, ${s.monsters} істот, ${s.loot} схованок зі здобиччю.`;
  }

  return { TAGS, tagDefaults, setMonsters, T, CELL, MAX_ROOMS, STYLES, TRAPS, defaults, normalize, generate, applyType, randomize, toJSON, fromJSON, describe, rng, randSeed, typeById, types: TYPES };
});
