// Симулятор підземель: ядро. Без DOM. Кімнати-тайли на ґратці зі стикованими дверима, коридори, відгалуження,
// петлі, таємні двері, пастки, поверхи зі сходами, населення за типом підземелля з Атласу. Усе від зерна.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./dungeon-types.js')); else root.DungeonCore = factory(root.DungeonTypes);
})(typeof self !== 'undefined' ? self : this, function (TYPES) {
  'use strict';
  const CELL = 12, MAX_ROOMS = 300, FORMAT = 3;
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
  TYPES = TYPES || [];
  const setTypes = list => { TYPES.length = 0; for (const t of list) TYPES.push(t); };
  const typeById = id => TYPES.find(t => t.id === id) || null;
  /* Види кімнат: kinds підключаються ззовні з папки room-kinds/ (у кожного: id, name, roles, types, tags, weight, desc) */
  let KINDS = [];
  const setRoomKinds = list => { KINDS = list.filter(k => k && k.id && k.name).slice().sort((a, b) => a.id < b.id ? -1 : 1); };
  function pickKind(rnd, typeId, role, tags, used) {
    const c = [];
    for (const k of KINDS) {
      if (!k.roles.includes(role)) continue;
      const own = k.types.includes(typeId), any = k.types.includes('*'); if (!own && !any) continue;
      let w = (k.weight || 1) * (own ? 3 : 1) * (k.tags && k.tags.some(t => tags.includes(t)) ? 4 : 1) * Math.pow(.35, used[k.id] || 0);
      c.push([k, w]);
    }
    if (!c.length) return null;
    let t = c.reduce((a, b) => a + b[1], 0) * rnd(); for (const [k, w] of c) if ((t -= w) <= 0) { used[k.id] = (used[k.id] || 0) + 1; return k; }
    const k = c[c.length - 1][0]; used[k.id] = (used[k.id] || 0) + 1; return k;
  }

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
  /* Типова частка коридорів-тунелів серед з'єднань (%). Решта: прямі проходи, зали-проходи, печерні ходи. Тунелі лишаються частіше для каналізації й шахт */
  const TYPE_CORR = { sewer: 35, mine: 30, 'village-cellar': 20, catacombs: 12, crypt: 12, 'palace-cellar-mine': 15, 'ruin-cellars': 10, 'thieves-lair': 10, barrow: 8, 'keep-cellars': 10, 'cloud-monastery-crypt': 8, 'great-hollow': 6, 'occupied-warren': 5, 'mountain-cave': 5, 'star-cavern': 5, 'root-knot-depths': 5, 'scorpion-burrows': 5, 'blue-hollow-caves': 5, 'nest-grottoes': 5 };
  const corrDefault = id => { const t = typeById(id); return t && t.sim && t.sim.corr !== undefined ? t.sim.corr : TYPE_CORR[id] || 8; };
  const tagDefaults = id => { const t = typeById(id); return Object.assign({}, (t && t.sim && t.sim.tags) || TYPE_TAGS[id] || FREE_TAGS); };
  const isCave = id => { const t = typeById(id); return t && t.sim && t.sim.cave !== undefined ? !!t.sim.cave : CAVE_IDS.includes(id); };

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

  function defaults() { return { v: FORMAT, seed: 'zbyrai', type: '', rooms: 24, levels: 1, style: 'brick', branch: 40, loops: 25, secrets: 30, traps: 40, danger: 2, corr: 8, corrLen: 20, corrVar: 35, mon: 50, loot: 50, opts: tagDefaults('') }; }
  function normalize(p) {
    const d = defaults(), o = Object.assign(defaults(), p || {});
    o.seed = String(o.seed || d.seed).slice(0, 24);
    o.type = typeById(o.type) ? o.type : '';
    o.rooms = clamp(Math.round(+o.rooms || d.rooms), 3, MAX_ROOMS);
    o.levels = clamp(Math.round(+o.levels || 1), 1, Math.min(6, Math.floor(o.rooms / 2)));
    o.style = STYLES[o.style] ? o.style : 'brick';
    for (const k of ['branch', 'loops', 'secrets', 'traps', 'corr', 'corrLen', 'corrVar', 'mon', 'loot']) o[k] = clamp(Math.round(+o[k]), 0, 100) || 0;
    if (p && p.v !== undefined && p.v < 3) { o.corr = corrDefault(o.type); o.corrLen = 20; o.corrVar = 35; } // формати 1-2: коридорів було забагато, беремо нову типову частку
    o.v = FORMAT;
    const td = tagDefaults(o.type), src = o.opts && typeof o.opts === 'object' ? o.opts : {};
    o.opts = {}; for (const k of Object.keys(td)) o.opts[k] = k in src ? clamp(Math.round(+src[k]), 0, 100) || 0 : td[k];
    o.danger = clamp(Math.round(+o.danger || 1), 1, 5);
    return o;
  }

  /* ---------- форми кімнат ---------- */
  const SHAPES = { brick: [['rect', .46], ['oct', .16], ['cross', .13], ['L', .15], ['round', .1]], cave: [['blob', .5], ['round', .28], ['oct', .1], ['L', .12]] };
  const SHAPE_NAMES = { rect: 'прямокутна', oct: 'восьмикутна', cross: 'хрестова', L: 'Г-подібна', round: 'кругла', blob: 'печерна' };
  function pickShape(rnd, style) { let t = rnd(); for (const [n, w] of SHAPES[style]) { if ((t -= w) <= 0) return n; } return 'rect'; }
  function inShape(sh, cor, w, h, x, y) {
    switch (sh) {
      case 'round': { const ex = (x + .5 - w / 2) / (w / 2), ey = (y + .5 - h / 2) / (h / 2); return ex * ex + ey * ey <= 1.02; }
      case 'oct': { const c = Math.max(1, Math.floor(Math.min(w, h) / 3)); return !(x + y < c || w - 1 - x + y < c || x + h - 1 - y < c || w - 1 - x + h - 1 - y < c); }
      case 'cross': { const bw = Math.max(2, Math.round(w / 2)), bh = Math.max(2, Math.round(h / 2)), x0 = (w - bw) >> 1, y0 = (h - bh) >> 1; return (x >= x0 && x < x0 + bw) || (y >= y0 && y < y0 + bh); }
      case 'L': { const qw = Math.max(1, (w >> 1) - 1), qh = Math.max(1, (h >> 1) - 1); const cx = cor & 1 ? x < qw : x >= w - qw, cy = cor & 2 ? y < qh : y >= h - qh; return !(cx && cy); }
      case 'blob': { const a = (x + .5 - w * .36) / (w * .36), b = (y + .5 - h * .5) / (h * .5), c = (x + .5 - w * .68) / (w * .32), d = (y + .5 - h * .45) / (h * .42); return a * a + b * b <= 1 || c * c + d * d <= 1; }
      default: return true;
    }
  }

  /* ---------- один поверх ---------- */
  // розміри клітинок ґратки: база від «довжини», розкид від «розкиду довжини» (від 1 до ~10 клітинок між кімнатами)
  function cellSizes(P, W, rnd) {
    const e0 = P.corrLen / 100 * 14, lo = e0 * (1 - P.corrVar / 100), hi = e0 + (24 - e0) * P.corrVar / 100, one = () => 12 + Math.round(lo + rnd() * (hi - lo));
    const cw = Array.from({ length: W }, one), ch = Array.from({ length: W }, one), acc = a => { const o = [0]; for (const v of a) o.push(o[o.length - 1] + v); return o; };
    return { cw, ch, x0: acc(cw), y0: acc(ch) };
  }
  const LINKS = { tunnel: 'тунель', direct: 'прямий прохід', wide: 'зал-прохід', natural: 'печерний хід' };
  function genFloor(P, n, fi, last, start, W, H, rnd, sz) {
    const { cw, ch, x0, y0 } = sz; // ширини колонок і висоти рядків ґратки: чим більші, тим довші проміжки між кімнатами
    const cells = [], used = new Map(), open = [0], edges = [], key = (x, y) => y * W + x;
    const add = (x, y) => { used.set(key(x, y), cells.length); cells.push({ x, y, adj: [] }); return cells.length - 1; };
    const link = (a, b, loop) => { edges.push({ a, b, secret: false, loop: !!loop, kind: 'tunnel' }); cells[a].adj.push(b); cells[b].adj.push(a); };
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
    // вид зв'язку: тунель, прямий прохід (кімнати впритул), зал-прохід, печерний хід
    const need = cells.map(() => ({ E: 0, W: 0, N: 0, S: 0 })), cave = P.style === 'cave';
    for (const e of edges) {
      if (rnd() < P.corr / 100) continue; // тунель
      const r = rnd(); e.kind = r < (cave ? .3 : .55) ? 'direct' : r < (cave ? .4 : .85) ? 'wide' : 'natural';
      if (e.kind !== 'direct') continue;
      let A = e.a, B = e.b, hor = cells[A].y === cells[B].y; if (hor ? cells[A].x > cells[B].x : cells[A].y > cells[B].y) [A, B] = [B, A];
      const [fa, fb] = hor ? ['E', 'W'] : ['S', 'N'], [oa, ob] = hor ? ['W', 'E'] : ['N', 'S'];
      if (need[A][oa] || need[B][ob]) { e.kind = 'wide'; continue; }
      need[A][fa] = 1; need[B][fb] = 1;
    }
    // кімнати: форма, розмір, розташування в клітинці (впритул до межі, якщо є прямий прохід)
    const w = x0[W], h = y0[H], tiles = new Uint8Array(w * h), rid = new Int16Array(w * h).fill(-1);
    const rooms = cells.map((c, i) => {
      const deg = c.adj.length, big = i === 0 || i === exit || deg >= 3, nd = need[i];
      const shape = pickShape(rnd, P.style), rw = ri(rnd, big ? 6 : 4, 9), rh = ri(rnd, big ? 6 : 4, 9);
      const CW = cw[c.x], CH = ch[c.y];
      const ox = nd.W ? 0 : nd.E ? CW - 1 - rw : ri(rnd, 1, CW - 1 - rw), oy = nd.N ? 0 : nd.S ? CH - 1 - rh : ri(rnd, 1, CH - 1 - rh);
      const x = x0[c.x] + ox, y = y0[c.y] + oy;
      const role = i === 0 ? 'start' : i === exit ? (last ? 'boss' : 'down') : deg === 1 ? 'dead' : deg >= 3 ? 'hub' : 'room';
      return { id: i, cx: c.x, cy: c.y, x, y, w: rw, h: rh, mx: x + (rw >> 1), my: y + (rh >> 1), shape, cor: ri(rnd, 0, 3), role, deg, dist: dist[i], doors: [], traps: [], monsters: null, loot: null, secret: false, name: '' };
    });
    for (const r of rooms) for (let yy = 0; yy < r.h; yy++) for (let xx = 0; xx < r.w; xx++) {
      if (!(xx === (r.w >> 1) && yy === (r.h >> 1)) && !inShape(r.shape, r.cor, r.w, r.h, xx, yy)) continue;
      const t = (r.y + yy) * w + r.x + xx; tiles[t] = T.FLOOR; rid[t] = r.id;
    }
    // таємні двері: лише глухі кінці (щоб видимі кімнати лишались зв'язними) та частина петель
    for (const e of edges) {
      const dead = [e.a, e.b].find(i => rooms[i].role === 'dead');
      if (e.loop ? rnd() < P.secrets / 100 * 0.5 : dead !== undefined && rnd() < P.secrets / 100 * 0.6) { e.secret = true; if (!e.loop) rooms[dead].secret = true; }
    }
    const at = (x, y) => y * w + x;
    const stepPath = pts => { const out = []; for (let i = 0; i < pts.length - 1; i++) { let [x, y] = pts[i]; const [tx, ty] = pts[i + 1], sx = Math.sign(tx - x), sy = Math.sign(ty - y); while (x !== tx || y !== ty) { out.push([x, y]); x += sx; y += sy; } } out.push(pts[pts.length - 1]); return out; };
    // прямий прохід: проріз у стіні між двома кімнатами, що стоять впритул
    function carveDirect(A, B, hor, e) {
      const g = hor ? B.x - 1 : B.y - 1; if ((hor ? A.x + A.w : A.y + A.h) !== g) return false;
      const lo = hor ? Math.max(A.y, B.y) : Math.max(A.x, B.x), hi = hor ? Math.min(A.y + A.h, B.y + B.h) : Math.min(A.x + A.w, B.x + B.w), ok = [];
      for (let k = lo; k < hi; k++) { const t1 = hor ? at(g - 1, k) : at(k, g - 1), t2 = hor ? at(g + 1, k) : at(k, g + 1); if (rid[t1] === A.id && rid[t2] === B.id) ok.push(k); }
      if (!ok.length) return false;
      let a0 = ri(rnd, 0, ok.length - 1), len = 1; if (!e.secret) { const full = rnd() < .25; while (len < (full ? 9 : 3) && a0 + len < ok.length && ok[a0 + len] === ok[a0] + len && (full || rnd() < .6)) len++; }
      for (let i = 0; i < len; i++) { const k = ok[a0 + i], t = hor ? at(g, k) : at(k, g); tiles[t] = e.secret ? T.SECRET : len === 1 ? T.DOOR : T.FLOOR; }
      const m = ok[a0 + (len >> 1)], d = hor ? [g, m, e.secret ? 1 : 0] : [m, g, e.secret ? 1 : 0]; A.doors.push(d); B.doors.push(d);
      return true;
    }
    // вибір смуги для вертикального/горизонтального звену ламаної: колонка без чужих кімнат поруч
    const band = (c0, ya, yb, hor, span) => {
      const lo = Math.min(ya, yb), hi = Math.max(ya, yb);
      for (const c of [c0, c0 - 1, c0 + 1, c0 - 2]) { let ok = true; for (let k = lo; k <= hi && ok; k++) for (let o = -span; o <= span; o++) { const t = hor ? at(c + o, k) : at(k, c + o); if (rid[t] >= 0) { ok = false; break; } } if (ok) return c; }
      return c0;
    };
    function carvePath(A, B, hor, e) {
      let pts;
      if (hor) { const c = band(x0[B.cx], A.my, B.my, true, e.kind === 'wide' ? 2 : 1); pts = [[A.mx, A.my], [c, A.my], [c, B.my], [B.mx, B.my]]; }
      else { const c = band(y0[B.cy], A.mx, B.mx, false, e.kind === 'wide' ? 2 : 1); pts = [[A.mx, A.my], [A.mx, c], [B.mx, c], [B.mx, B.my]]; }
      let path;
      if (e.kind === 'natural') { // блукання від центру до центру з нахилом до цілі, без заходу в чужі кімнати
        path = []; let [x, y] = [A.mx, A.my]; const [tx, ty] = [B.mx, B.my]; let guard = 0;
        while ((x !== tx || y !== ty) && guard++ < 600) {
          path.push([x, y]); const dx = tx - x, dy = ty - y; let mx = 0, my = 0;
          if (rnd() < .28) { if (Math.abs(dx) > Math.abs(dy)) my = rnd() < .5 ? 1 : -1; else mx = rnd() < .5 ? 1 : -1; }
          else if (dx !== 0 && (dy === 0 || rnd() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)))) mx = Math.sign(dx); else my = Math.sign(dy);
          const nx = x + mx, ny = y + my; if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
          const r = rid[at(nx, ny)]; if (r >= 0 && r !== A.id && r !== B.id) continue;
          x = nx; y = ny;
        }
        if (x !== tx || y !== ty) path = stepPath(pts); else path.push([tx, ty]);
      } else path = stepPath(pts);
      const spread = e.kind === 'wide' ? 1 : 0;
      for (const [x, y] of path) {
        for (let oy = -spread; oy <= spread; oy++) for (let ox = -spread; ox <= spread; ox++) { const t = at(x + ox, y + oy); if (x + ox < 0 || y + oy < 0 || x + ox >= w || y + oy >= h) continue; if (tiles[t] === T.ROCK) tiles[t] = e.kind === 'wide' ? T.FLOOR : T.CORR; }
        if (e.kind === 'natural' && rnd() < .3) { const [ox, oy] = pick(rnd, DIRS), x2 = x + ox, y2 = y + oy; if (x2 > 0 && y2 > 0 && x2 < w - 1 && y2 < h - 1 && rid[at(x2, y2)] < 0 && tiles[at(x2, y2)] === T.ROCK) tiles[at(x2, y2)] = T.CORR; }
      }
      const door = (order, R) => { for (const [x, y] of order) { const t = at(x, y); if (rid[t] !== R.id) { if (e.secret) tiles[t] = T.SECRET; else if (e.kind === 'tunnel' && tiles[t] === T.CORR) tiles[t] = T.DOOR; R.doors.push([x, y, e.secret ? 1 : 0]); return; } } };
      door(path, A); door(path.slice().reverse(), B);
    }
    for (const e of edges) {
      let A = rooms[e.a], B = rooms[e.b]; const hor = A.cy === B.cy;
      if (hor ? A.cx > B.cx : A.cy > B.cy) [A, B] = [B, A];
      if (e.kind === 'direct' && carveDirect(A, B, hor, e)) continue;
      if (e.kind === 'direct') e.kind = cave ? 'natural' : 'wide';
      carvePath(A, B, hor, e);
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
    let ni = 0; const used = {}, setKind = (r, role) => { const k = pickKind(rnd, P.type, role, r.tags, used); if (k) { r.kind = k.id; r.desc = k.desc || ''; r.name = k.name; } return !!k; };
    for (const r of rooms) {
      r.tags = []; r.kind = ''; r.desc = '';
      if (r.role === 'start') { if (!setKind(r, 'start')) r.name = 'Вхід'; if (f.index > 0) r.name = 'Сходи нагору'; continue; }
      if (r.role === 'boss') { if (!setKind(r, 'boss')) r.name = 'Фінальна зала'; r.monsters = mon('boss'); r.loot = { tier: TIER[Math.min(4, danger)], what: pick(rnd, LOOT) }; continue; }
      if (r.role === 'down') { r.name = 'Сходи вниз'; r.monsters = rnd() < .7 ? mon('room') : null; continue; }
      for (const k of Object.keys(P.opts)) if (rnd() < P.opts[k] / 100) r.tags.push(k);
      const role = r.secret ? 'secret' : r.role;
      if (!setKind(r, role)) r.name = r.secret ? 'Таємна кімната' : r.role === 'dead' ? (rnd() < .5 ? 'Сховок' : 'Скарбниця') : r.role === 'hub' ? 'Перехрестя залів' : ROOM_NAMES[ni++ % ROOM_NAMES.length] + (ni > ROOM_NAMES.length ? ' ' + Math.ceil(ni / ROOM_NAMES.length) : '');
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
    const sz = cellSizes(P, W, rng(P.seed + '|sizes'));
    for (let i = 0; i < P.levels; i++) {
      const f = genFloor(P, per[i], i, i === P.levels - 1, start, W, W, rnd, sz);
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
      links: floors.reduce((m, f) => { for (const e of f.edges) m[e.kind] = (m[e.kind] || 0) + 1; return m; }, {}),
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
    o.danger = ty.danger; o.style = isCave(ty.id) ? 'cave' : 'brick'; o.opts = tagDefaults(ty.id); o.corr = corrDefault(ty.id);
    return normalize(o);
  }
  function randomize(params, locks, rnd) {
    rnd = rnd || Math.random; locks = locks || {};
    let o = normalize(params); o.seed = randSeed();
    if (!locks.type) { const ty = rnd() < 0.2 ? null : pick(rnd, TYPES); o = ty ? applyType(o, ty.id, rnd) : Object.assign(o, { type: '' }); }
    else if (o.type) o = applyType(o, o.type, rnd);
    if (!o.type) { o.rooms = ri(rnd, 8, 60); o.levels = ri(rnd, 1, 3); o.danger = ri(rnd, 1, 5); o.style = rnd() < .3 ? 'cave' : 'brick'; }
    o.branch = ri(rnd, 0, 100); o.loops = ri(rnd, 0, 70); o.secrets = ri(rnd, 0, 70); o.traps = ri(rnd, 0, 80); o.corr = ri(rnd, 2, 35); o.corrLen = ri(rnd, 0, 60); o.corrVar = ri(rnd, 0, 100); o.mon = ri(rnd, 25, 80); o.loot = ri(rnd, 25, 80);
    for (const k of Object.keys(o.opts)) o.opts[k] = clamp(o.opts[k] + ri(rnd, -25, 25), 0, 100);
    return normalize(o);
  }
  const toJSON = p => JSON.stringify(normalize(p), null, 1);
  const fromJSON = s => normalize(typeof s === 'string' ? JSON.parse(s) : s);
  function describe(d) {
    const s = d.stats, p = d.params;
    return `${d.type ? d.type.name : 'Підземелля'}: ${s.rooms} кімнат, ${s.floors} пов., небезпека ${p.danger}/5; ${s.doors} дверей (з них таємних ${s.secrets}), ${s.traps} пасток, ${s.monsters} істот, ${s.loot} схованок зі здобиччю.`;
  }

  return { setTypes, setRoomKinds, corrDefault, SHAPE_NAMES, LINKS, TAGS, tagDefaults, setMonsters, T, CELL, MAX_ROOMS, STYLES, TRAPS, defaults, normalize, generate, applyType, randomize, toJSON, fromJSON, describe, rng, randSeed, typeById, types: TYPES, get kindCount() { return KINDS.length; } };
});
