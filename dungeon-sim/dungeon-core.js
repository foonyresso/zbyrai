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
  // Кімнати ростуть деревом від входу. Без коридору нова кімната стає впритул до батьківської (між ними лише стіна з проходом).
  // Коридор — окремий елемент: він відсуває кімнату далі на свою довжину, решта групи лишається щільною.
  const LINKS = { tunnel: 'коридор', direct: 'прохід у стіні' };
  function corrLength(P, rnd) { // довжина коридору (плиток між кімнатами): база з «довжини», розкид з «розкиду»
    const e0 = 3 + P.corrLen / 100 * 15, lo = Math.max(3, e0 * (1 - P.corrVar / 100)), hi = e0 + (30 - e0) * P.corrVar / 100;
    return Math.round(lo + rnd() * (hi - lo));
  }
  function genFloor(P, n, fi, last, rnd) {
    const rooms = [], edges = [], occ = new Map(), K = 40000, key = (x, y) => (x + 20000) * K + (y + 20000), cave = P.style === 'cave';
    const mark = r => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) occ.set(key(x, y), r.id); };
    const free = (x, y, w, h) => { for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) if (occ.has(key(xx, yy))) return false; return true; };
    const dim = () => rnd() < .3 ? ri(rnd, 6, 10) : ri(rnd, 4, 8);
    const link = (a, b, kind, loop, path) => { edges.push({ a, b, secret: false, loop: !!loop, kind, path }); rooms[a].adj.push(b); rooms[b].adj.push(a); };
    const room = (x, y, w, h) => { const r = { id: rooms.length, x, y, w, h, adj: [] }; rooms.push(r); mark(r); return r; };
    room(0, 0, ri(rnd, 6, 9), ri(rnd, 6, 9));
    const open = [0];
    while (rooms.length < n && open.length) {
      const i = rnd() < P.branch / 100 ? Math.floor(rnd() * open.length) : open.length - 1, A = rooms[open[i]];
      let done = false;
      for (let t = 0; t < 14 && !done; t++) {
        const d = ri(rnd, 0, 3), hor = d === 1 || d === 3, tun = rnd() < P.corr / 100, rw = dim(), rh = dim(), L = tun ? corrLength(P, rnd) : 1;
        const ax = hor ? A.y : A.x, al = hor ? A.h : A.w, bl = hor ? rh : rw; // вздовж стіни
        const lo = ax - bl + (tun ? -1 : 3), hi = ax + al - (tun ? 1 : 3) + (tun ? 3 : 0), off = ri(rnd, tun ? lo - 3 : lo, Math.max(hi, tun ? lo - 3 : lo));
        if (!tun && (Math.min(ax + al, off + bl) - Math.max(ax, off) < 3)) continue;
        const bx = d === 1 ? A.x + A.w + L : d === 3 ? A.x - L - rw : hor ? 0 : off, by = d === 2 ? A.y + A.h + L : d === 0 ? A.y - L - rh : hor ? off : 0;
        const x = hor ? bx : off, y = hor ? off : by;
        if (!free(x, y, rw, rh)) continue;
        let path = null;
        if (tun) { // Z-подібний хід посередині проміжку, не торкаючись інших кімнат і ходів
          const B = { x, y, w: rw, h: rh }, mx = r => r.x + (r.w >> 1), my = r => r.y + (r.h >> 1), c = hor ? (d === 1 ? A.x + A.w + (L >> 1) : B.x + B.w + (L >> 1)) : (d === 2 ? A.y + A.h + (L >> 1) : B.y + B.h + (L >> 1));
          const pts = hor ? [[mx(A), my(A)], [c, my(A)], [c, my(B)], [mx(B), my(B)]] : [[mx(A), my(A)], [mx(A), c], [mx(B), c], [mx(B), my(B)]];
          path = []; for (let k = 0; k < 3; k++) { let [px, py] = pts[k]; const [tx, ty] = pts[k + 1], sx = Math.sign(tx - px), sy = Math.sign(ty - py); while (px !== tx || py !== ty) { path.push([px, py]); px += sx; py += sy; } } path.push(pts[3]);
          const inr = (r, px, py) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h; let ok = true;
          for (const [px, py] of path) { if (inr(A, px, py) || inr(B, px, py)) continue; if (occ.has(key(px, py))) { ok = false; break; } for (const [dx, dy] of DIRS) { const o = occ.get(key(px + dx, py + dy)); if (o !== undefined && o !== A.id && !inr(B, px + dx, py + dy)) { ok = false; break; } } if (!ok) break; }
          if (!ok) continue;
          for (const [px, py] of path) if (!inr(A, px, py) && !inr(B, px, py)) occ.set(key(px, py), -2);
        }
        const B = room(x, y, rw, rh); link(A.id, B.id, tun ? 'tunnel' : 'direct', false, path); open.push(B.id); done = true;
      }
      if (!done) open.splice(i, 1);
    }
    // петлі: сусіди впритул (одна стіна, перетин ≥3 плитки), ще не з'єднані
    const near = (A, B) => { if (A.x + A.w + 1 === B.x || B.x + B.w + 1 === A.x) return Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) >= 3; if (A.y + A.h + 1 === B.y || B.y + B.h + 1 === A.y) return Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) >= 3; return false; };
    const cand = []; for (const A of rooms) for (const B of rooms) if (A.id < B.id && !A.adj.includes(B.id) && near(A, B)) cand.push([A.id, B.id]);
    for (let k = Math.round(P.loops / 100 * rooms.length * .35); k > 0 && cand.length; k--) { const [a, b] = cand.splice(Math.floor(rnd() * cand.length), 1)[0]; link(a, b, 'direct', true); }
    // відстані від входу: найдальша кімната = фінал або сходи вниз
    const dist = rooms.map(() => -1); dist[0] = 0; const q = [0];
    for (let h = 0; h < q.length; h++) for (const j of rooms[q[h]].adj) if (dist[j] < 0) { dist[j] = dist[q[h]] + 1; q.push(j); }
    let exit = 0; dist.forEach((d, i) => { if (d > dist[exit]) exit = i; });
    // зсув у додатні координати
    let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9; for (const r of rooms) { mnx = Math.min(mnx, r.x); mny = Math.min(mny, r.y); mxx = Math.max(mxx, r.x + r.w); mxy = Math.max(mxy, r.y + r.h); }
    const PAD = 3, sx = PAD - mnx, sy = PAD - mny, w = mxx - mnx + PAD * 2, h = mxy - mny + PAD * 2, tiles = new Uint8Array(w * h), rid = new Int16Array(w * h).fill(-1);
    for (const e of edges) if (e.path) e.path = e.path.map(([x, y]) => [x + sx, y + sy]);
    for (const c of rooms) {
      c.x += sx; c.y += sy; const deg = c.adj.length, i = c.id;
      Object.assign(c, { mx: c.x + (c.w >> 1), my: c.y + (c.h >> 1), shape: pickShape(rnd, P.style), cor: ri(rnd, 0, 3), role: i === 0 ? 'start' : i === exit ? (last ? 'boss' : 'down') : deg === 1 ? 'dead' : deg >= 3 ? 'hub' : 'room', deg, dist: dist[i], doors: [], traps: [], monsters: null, loot: null, secret: false, name: '' }); delete c.adj;
    }
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
    // прохід у стіні між двома кімнатами, що стоять впритул
    function carveDirect(A, B, hor, e) {
      const g = hor ? B.x - 1 : B.y - 1;
      const lo = hor ? Math.max(A.y, B.y) : Math.max(A.x, B.x), hi = hor ? Math.min(A.y + A.h, B.y + B.h) : Math.min(A.x + A.w, B.x + B.w), ok = [];
      for (let k = lo; k < hi; k++) { const t1 = hor ? at(g - 1, k) : at(k, g - 1), t2 = hor ? at(g + 1, k) : at(k, g + 1); if (rid[t1] === A.id && rid[t2] === B.id) ok.push(k); }
      if (!ok.length) { // форма не дотягується до стіни: прорубуємо ходок усередину кімнати до її підлоги
        const k = (lo + hi) >> 1;
        for (const [x, y, dx, dy, R] of hor ? [[g - 1, k, -1, 0, A], [g + 1, k, 1, 0, B]] : [[k, g - 1, 0, -1, A], [k, g + 1, 0, 1, B]])
          for (let px = x, py = y; px >= R.x && py >= R.y && px < R.x + R.w && py < R.y + R.h && rid[at(px, py)] !== R.id; px += dx, py += dy) { tiles[at(px, py)] = T.FLOOR; rid[at(px, py)] = R.id; }
        ok.push(k);
      }
      let a0 = ri(rnd, 0, ok.length - 1), len = 1; if (!e.secret) { const full = rnd() < .25; while (len < (full ? 9 : 3) && a0 + len < ok.length && ok[a0 + len] === ok[a0] + len && (full || rnd() < .6)) len++; }
      for (let i = 0; i < len; i++) { const k = ok[a0 + i], t = hor ? at(g, k) : at(k, g); tiles[t] = e.secret ? T.SECRET : len === 1 ? T.DOOR : T.FLOOR; }
      const m = ok[a0 + (len >> 1)], d = hor ? [g, m, e.secret ? 1 : 0] : [m, g, e.secret ? 1 : 0]; A.doors.push(d); B.doors.push(d);
    }
    function carveTunnel(A, B, e) {
      const path = e.path;
      for (const [x, y] of path) if (tiles[at(x, y)] === T.ROCK) tiles[at(x, y)] = T.CORR;
      const door = (order, R) => { for (const [x, y] of order) { const t = at(x, y); if (rid[t] !== R.id) { if (e.secret) tiles[t] = T.SECRET; else if (tiles[t] === T.CORR) tiles[t] = T.DOOR; R.doors.push([x, y, e.secret ? 1 : 0]); return; } } };
      door(path, A); door(path.slice().reverse(), B);
    }
    for (const e of edges) {
      let A = rooms[e.a], B = rooms[e.b];
      if (e.kind === 'tunnel') { carveTunnel(A, B, e); continue; }
      const hor = A.x + A.w + 1 === B.x || B.x + B.w + 1 === A.x;
      if (hor ? A.x > B.x : A.y > B.y) [A, B] = [B, A];
      carveDirect(A, B, hor, e);
    }
    // сходи
    if (fi > 0) tiles[rooms[0].my * w + rooms[0].mx] = T.UP;
    if (!last) tiles[rooms[exit].my * w + rooms[exit].mx] = T.DOWN;
    return { index: fi, w, h, tiles, rid, rooms, edges, exit, traps: [] };
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
    const floors = [];
    for (let i = 0; i < P.levels; i++) {
      const f = genFloor(P, per[i], i, i === P.levels - 1, rnd);
      populate(P, f, rng(P.seed + '|pop|' + i), inhab, pool);
      floors.push(f);
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
