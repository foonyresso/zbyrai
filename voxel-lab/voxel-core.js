/* Voxel World Lab: ядро. Генерація воксельного світу (шум, біоми, печери, руди, дерева), ізометричний обхід,
   редагування блоків, експорт у MagicaVoxel .vox. Без DOM: браузер (глобал VoxelCore) і Node (module.exports). */
const VoxelCore = (() => {
  function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());

  // блоки: id → { name, color [r,g,b], solid }
  const B = (name, color, o = {}) => Object.assign({ name, color, solid: true }, o);
  const BLOCKS = [
    B('Повітря', [0, 0, 0], { solid: false }), B('Камінь', [128, 128, 134]), B('Земля', [121, 85, 58]), B('Трава', [96, 158, 72]), B('Пісок', [219, 203, 142]),
    B('Вода', [64, 118, 200], { solid: false, liquid: true }), B('Сніг', [240, 245, 250]), B('Деревина', [110, 80, 48]), B('Листя', [58, 118, 52]), B('Вугілля', [60, 60, 64]),
    B('Залізо', [200, 160, 130]), B('Золото', [235, 200, 70]), B('Гравій', [150, 145, 140]), B('Основа', [40, 40, 44]), B('Цегла', [170, 82, 68]), B('Дошки', [186, 148, 92]),
    B('Мідь', [205, 118, 70], { glow: true }), B('Алмаз', [90, 235, 240], { glow: true }), B('Смарагд', [60, 220, 110], { glow: true }),
  ];
  const ID = Object.fromEntries(['AIR', 'STONE', 'DIRT', 'GRASS', 'SAND', 'WATER', 'SNOW', 'WOOD', 'LEAVES', 'COAL', 'IRON', 'GOLD', 'GRAVEL', 'BEDROCK', 'BRICK', 'PLANKS', 'COPPER', 'DIAMOND', 'EMERALD'].map((k, i) => [k, i]));

  /* ---------- шум Перліна 3D з перестановкою за seed ---------- */
  function makeNoise(seed) {
    const R = rngFromSeed('noise:' + seed), p = new Uint8Array(512), a = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    for (let i = 0; i < 512; i++) p[i] = a[i & 255];
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => a + (b - a) * t;
    const grad = (h, x, y, z) => { const u = (h & 15) < 8 ? x : y, v = (h & 15) < 4 ? y : (h & 15) === 12 || (h & 15) === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
    return (x, y = 0, z = 0) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z), A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, Bb = p[X + 1] + Y, BA = p[Bb] + Z, BB = p[Bb + 1] + Z;
      return lerp(lerp(lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u), lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u), lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u), v), w); // ≈ −1..1
    };
  }

  const DEFAULTS = { seed: 'zbyrai', sx: 48, sz: 48, sy: 56, scale: 28, octaves: 4, rough: .5, water: .38, island: .0, caves: .35, trees: .5, ores: .5, snow: .8, flat: 0 };
  const idx = (w, x, y, z) => x + w.sx * (z + w.sz * y);
  const inb = (w, x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < w.sx && y < w.sy && z < w.sz;
  const get = (w, x, y, z) => (inb(w, x, y, z) ? w.blocks[idx(w, x, y, z)] : 0);
  const set = (w, x, y, z, b) => { if (inb(w, x, y, z)) w.blocks[idx(w, x, y, z)] = b; };

  /* generate(opts) → { sx, sy, sz, blocks, opts, heights } ; висота 1..sy−1, нижній шар — основа */
  function generate(o = {}) {
    o = Object.assign({}, DEFAULTS, o);
    const w = { sx: o.sx, sy: o.sy, sz: o.sz, blocks: new Uint8Array(o.sx * o.sy * o.sz), opts: o, heights: new Int16Array(o.sx * o.sz) };
    const n2 = makeNoise('h' + o.seed), n3 = makeNoise('c' + o.seed), nm = makeNoise('m' + o.seed), R = rngFromSeed('d' + o.seed);
    const sea = Math.round(o.water * (o.sy - 6)) + 3;
    for (let z = 0; z < w.sz; z++) for (let x = 0; x < w.sx; x++) {
      let amp = 1, f = 1 / o.scale, v = 0, tot = 0;
      for (let k = 0; k < o.octaves; k++) { v += n2(x * f + 100 * k, z * f + 37 * k, 0.5) * amp; tot += amp; amp *= o.rough; f *= 2; }
      v = v / tot * .5 + .5; // 0..1
      if (o.flat > 0) v = v * (1 - o.flat) + .5 * o.flat;
      if (o.island > 0) { const dx = (x / (w.sx - 1) - .5) * 2, dz = (z / (w.sz - 1) - .5) * 2, d = Math.min(1, Math.hypot(dx, dz)); v = v * (1 - o.island * d * d) - o.island * d * d * .25 + o.island * .15; }
      const h = Math.max(2, Math.min(w.sy - 2, Math.round(2 + v * (w.sy - 6) * .95)));
      w.heights[x + w.sx * z] = h;
      const moist = nm(x / (o.scale * 1.7) + 9, z / (o.scale * 1.7) - 4, 3) * .5 + .5, snowline = Math.round(o.snow * (w.sy - 3));
      for (let y = 0; y <= h; y++) {
        let b;
        if (y === 0) b = ID.BEDROCK;
        else if (y < h - 3) b = ID.STONE;
        else if (y < h) b = h <= sea + 1 ? (y >= h - 1 ? ID.SAND : ID.STONE) : ID.DIRT;
        else b = h > snowline ? ID.SNOW : h <= sea + 1 ? ID.SAND : (h > snowline - 4 && moist < .45 ? ID.STONE : moist < .3 && h < sea + 4 ? ID.SAND : ID.GRASS);
        if (b === ID.STONE && y > 2 && y < h - 3 && o.ores > 0) { const r = n3(x * .45 + 50, y * .45, z * .45 + 50); if (r > .62 - .3 * o.ores) { const u = n3(x * .31 + 200, y * .31 + 7, z * .31 - 90), deep = y < sea - 6, high = y > sea + 8; b = deep && u > .22 && r > .7 - .3 * o.ores ? ID.DIAMOND : high && u > .2 ? ID.EMERALD : deep && u > .02 ? ID.GOLD : u > .15 ? ID.IRON : u < -.15 ? ID.COPPER : ID.COAL; } }
        w.blocks[idx(w, x, y, z)] = b;
      }
      for (let y = h + 1; y <= sea; y++) w.blocks[idx(w, x, y, z)] = ID.WATER;
      if (h === sea + 0 || h === sea + 1) { /* пляж */ }
    }
    // печери: 3D-шум вирізає камінь, але не поверхню й не основу
    if (o.caves > 0) for (let z = 0; z < w.sz; z++) for (let x = 0; x < w.sx; x++) {
      const h = w.heights[x + w.sx * z];
      for (let y = 3; y < h - 2; y++) { const c = n3(x / 9, y / 6, z / 9) + n3(x / 4 + 20, y / 4, z / 4) * .3; if (c > 0.52 - o.caves * .22) { const i = idx(w, x, y, z); if (w.blocks[i] === ID.STONE || w.blocks[i] === ID.COAL || w.blocks[i] === ID.IRON || w.blocks[i] === ID.DIRT) w.blocks[i] = ID.AIR; } }
    }
    // дерева: на траві, не надто близько один до одного
    if (o.trees > 0) {
      const tries = Math.round(w.sx * w.sz * .035 * o.trees), placed = [];
      for (let t = 0; t < tries; t++) {
        const x = 2 + Math.floor(R() * (w.sx - 4)), z = 2 + Math.floor(R() * (w.sz - 4)), h = w.heights[x + w.sx * z];
        if (get(w, x, h, z) !== ID.GRASS || h <= sea + 1 || placed.some(p => Math.abs(p[0] - x) + Math.abs(p[1] - z) < 4)) continue;
        const th = 3 + Math.floor(R() * 3); if (h + th + 3 >= w.sy) continue;
        placed.push([x, z]);
        for (let y = 1; y <= th; y++) set(w, x, h + y, z, ID.WOOD);
        const top = h + th, r = 2;
        for (let dy = -1; dy <= 2; dy++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          const d = Math.abs(dx) + Math.abs(dz) + Math.max(0, dy); if (d > 3 || (dy === 2 && d > 1)) continue; if (dx === 0 && dz === 0 && dy <= 0) continue;
          if (get(w, x + dx, top + dy, z + dz) === ID.AIR) set(w, x + dx, top + dy, z + dz, ID.LEAVES);
        }
      }
    }
    return w;
  }

  /* ---------- видимість і ізометричний обхід ---------- */
  const solidAt = (w, x, y, z) => { const b = get(w, x, y, z); return b !== 0 && !BLOCKS[b].liquid; };
  // грань відкрита, якщо сусід — повітря; вода показує грані лише до повітря (і зверху); листя й вода не затуляють сусідів
  function faceVisible(w, x, y, z, face) {
    const b = get(w, x, y, z), nb = face === 0 ? get(w, x, y + 1, z) : face === 1 ? get(w, x, y, z + 1) : get(w, x + 1, y, z);
    if (b === 0) return false;
    if (BLOCKS[b].liquid) return nb === 0;
    if (nb === 0) return true;
    return BLOCKS[nb].liquid || nb === ID.LEAVES && b !== ID.LEAVES;
  }
  // те саме, але для довільного напрямку (dx, dy, dz) — потрібно для поворотів вигляду
  function visibleDir(w, x, y, z, dx, dy, dz) {
    const b = get(w, x, y, z), nb = get(w, x + dx, y + dy, z + dz);
    if (b === 0) return false;
    if (BLOCKS[b].liquid) return nb === 0;
    if (nb === 0) return true;
    return BLOCKS[nb].liquid || nb === ID.LEAVES && b !== ID.LEAVES;
  }
  // напрямки екранних осей у світових координатах для повороту rot: [xs → (dx,dz), zs → (dx,dz)]
  const SCREEN_DIRS = [[[1, 0], [0, 1]], [[0, -1], [1, 0]], [[-1, 0], [0, -1]], [[0, 1], [-1, 0]]];

  /* Обхід ззаду наперед для вигляду rot (0..3 — поворот на 90°). cb(x, y, z, faces[3], sx, sz) отримує «екранні» координати (x', z').
     Порядок: зростання x'+z', потім y — це правильний painter's order для ізометрії. cut — показувати лише y <= cut. */
  const extents = (w, rot) => (rot & 1 ? [w.sz, w.sx] : [w.sx, w.sz]); // [ширина, глибина] сцени на екрані
  function walk(w, rot, cut, cb) {
    const [W, D] = extents(w, rot), ym = Math.min(cut, w.sy - 1);
    for (let d = 0; d <= W + D - 2; d++) for (let xs = Math.max(0, d - (D - 1)); xs <= Math.min(W - 1, d); xs++) {
      const zs = d - xs; let x, z;
      if (rot === 0) { x = xs; z = zs; } else if (rot === 1) { x = zs; z = W - 1 - xs; } else if (rot === 2) { x = w.sx - 1 - xs; z = w.sz - 1 - zs; } else { x = D - 1 - zs; z = xs; }
      for (let y = 0; y <= ym; y++) { if (get(w, x, y, z) === 0) continue; cb(x, y, z, xs, zs); }
    }
  }

  // стовпчик-зріз: найвищий твердий блок (для карти висот і підказки)
  function topSolid(w, x, z) { for (let y = w.sy - 1; y >= 0; y--) { const b = get(w, x, y, z); if (b && !BLOCKS[b].liquid) return y; } return -1; }
  function heightmap(w) { const out = new Uint8ClampedArray(w.sx * w.sz); for (let z = 0; z < w.sz; z++) for (let x = 0; x < w.sx; x++) out[x + w.sx * z] = Math.round(Math.max(0, topSolid(w, x, z)) / (w.sy - 1) * 255); return out; }
  function counts(w) { const c = new Array(BLOCKS.length).fill(0); for (let i = 0; i < w.blocks.length; i++) c[w.blocks[i]]++; return c; }

  /* ---------- знаходження блока для кліку: найближча до глядача грань під точкою ---------- */
  function neighborOf(x, y, z, face) { return face === 0 ? [x, y + 1, z] : face === 1 ? [x, y, z + 1] : [x + 1, y, z]; }

  /* ---------- чанковий меш: лише видимі грані (сусід — повітря/вода/листя), без прихованих блоків ----------
     Чанк CS×CS по x/z і на всю висоту. Вершини: pos Uint8 (x,y,z,0) відносно кута чанка, col Uint8 (r,g,b,a) з уже «запеченим» освітленням.
     Грані, закриті твердим сусідом, у меш не потрапляють; змінений блок перебудовує лише свій чанк (і сусідній, якщо стоїть на межі). */
  const CS = 16;
  const FACES = [ // [dx, dy, dz, світло, 4 кути (x,y,z)]
    [0, 1, 0, 1, [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0]], [0, -1, 0, .5, [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1]],
    [1, 0, 0, .82, [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1]], [-1, 0, 0, .7, [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0]],
    [0, 0, 1, .66, [0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]], [0, 0, -1, .78, [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0]],
  ];
  const hash3 = (x, y, z) => (Math.imul(x * 73856093 ^ y * 19349663 ^ z * 83492791, 2654435761) >>> 0 & 255) / 255;
  const chunkCount = w => [Math.ceil(w.sx / CS), Math.ceil(w.sz / CS)];
  // вершина = 8 байт: x,y,z,0 (відносно кута чанка) і r,g,b,a; грань = 4 вершини, індекси для всіх граней однакові (quadIndices)
  function newBuf(maxFaces) { return { v: new Uint8Array(maxFaces * 32), n: 0 }; }
  const sliceBuf = b => (b.n ? { v: b.v.slice(0, b.n * 32), n: b.n } : null);
  function quadIndices(nFaces) {
    const idx = new Uint32Array(nFaces * 6);
    for (let f = 0, i = 0; f < nFaces; f++, i += 6) { const v = f * 4; idx[i] = v; idx[i + 1] = v + 1; idx[i + 2] = v + 2; idx[i + 3] = v; idx[i + 4] = v + 2; idx[i + 5] = v + 3; }
    return idx;
  }
  let scratch = null;
  /* meshChunk(w, cx, cz, cut) → { opaque, water, faces }; cut — показувати лише y <= cut (блоки вище вважаються повітрям, тож на зрізі видно «кришку») */
  function meshChunk(w, cx, cz, cut = 999) {
    const ym = Math.min(cut, w.sy - 1), x0 = cx * CS, z0 = cz * CS, x1 = Math.min(w.sx, x0 + CS), z1 = Math.min(w.sz, z0 + CS), sx = w.sx, sz = w.sz, blocks = w.blocks, layer = sx * sz;
    const cap = (x1 - x0) * (z1 - z0) * (ym + 1) * 6; // межа зверху: шість граней на клітинку
    if (!scratch || scratch.cap < cap) scratch = { cap, o: newBuf(cap), w: newBuf(cap) };
    const O = scratch.o, Wt = scratch.w; O.n = 0; Wt.n = 0;
    const at = (x, y, z) => (x < 0 || z < 0 || x >= sx || z >= sz || y < 0 || y > ym ? 0 : blocks[x + sx * z + layer * y]);
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
      for (let y = 0; y <= ym; y++) {
        const b = blocks[x + sx * z + layer * y]; if (!b) continue;
        const B = BLOCKS[b], liquid = B.liquid, c = B.color, buf = liquid ? Wt : O;
        const tint = .94 + hash3(x, y, z) * .1, depth = liquid ? 1 : .86 + .14 * Math.min(1, (y + 1) / w.sy);
        for (let f = 0; f < 6; f++) {
          const F = FACES[f]; if (F[1] < 0 && y === 0) continue; // низ світу не видно
          const nb = at(x + F[0], y + F[1], z + F[2]);
          if (nb && (liquid || !(BLOCKS[nb].liquid || nb === ID.LEAVES && b !== ID.LEAVES))) continue; // закрита грань
          const m = B.glow ? 1.2 + tint * .15 : F[3] * tint * depth, r = Math.min(255, c[0] * m) | 0, g = Math.min(255, c[1] * m) | 0, bl = Math.min(255, c[2] * m) | 0, a = liquid ? 184 : 255, k = F[4], v = buf.v;
          let o = buf.n * 32;
          for (let q = 0; q < 4; q++, o += 8) { v[o] = x - x0 + k[q * 3]; v[o + 1] = y + k[q * 3 + 1]; v[o + 2] = z - z0 + k[q * 3 + 2]; v[o + 3] = 0; v[o + 4] = r; v[o + 5] = g; v[o + 6] = bl; v[o + 7] = a; }
          buf.n++;
        }
      }
    }
    return { opaque: sliceBuf(O), water: sliceBuf(Wt), faces: O.n + Wt.n };
  }

  /* ---------- промінь через воксельну сітку (DDA Амантідеса-Ву): перший непорожній блок, нормаль грані влучання ---------- */
  function raycast(w, o, d, maxDist = 1e9, cut = 999) {
    const ym = Math.min(cut, w.sy - 1); let t0 = 0, t1 = maxDist;
    const lo = [0, 0, 0], hi = [w.sx, ym + 1, w.sz]; // вхід променя в коробку світу, щоб не крокувати по порожнечі
    for (let a = 0; a < 3; a++) {
      if (Math.abs(d[a]) < 1e-12) { if (o[a] < lo[a] || o[a] > hi[a]) return null; continue; }
      let ta = (lo[a] - o[a]) / d[a], tb = (hi[a] - o[a]) / d[a]; if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return null;
    }
    const e = 1e-6, p = [o[0] + d[0] * (t0 + e), o[1] + d[1] * (t0 + e), o[2] + d[2] * (t0 + e)], c = p.map(Math.floor), step = [], tMax = [], tDelta = [];
    c[0] = Math.min(w.sx - 1, Math.max(0, c[0])); c[1] = Math.min(ym, Math.max(0, c[1])); c[2] = Math.min(w.sz - 1, Math.max(0, c[2]));
    for (let a = 0; a < 3; a++) {
      step[a] = d[a] > 0 ? 1 : -1; tDelta[a] = Math.abs(d[a]) < 1e-12 ? Infinity : Math.abs(1 / d[a]);
      tMax[a] = Math.abs(d[a]) < 1e-12 ? Infinity : t0 + e + ((d[a] > 0 ? c[a] + 1 - p[a] : p[a] - c[a]) * tDelta[a]);
    }
    let n = [0, 0, 0], t = t0, first = true;
    for (let i = 0; i < w.sx + w.sy + w.sz + 8; i++) {
      if (c[0] < 0 || c[1] < 0 || c[2] < 0 || c[0] >= w.sx || c[1] > ym || c[2] >= w.sz || t > t1 + 1e-6) return null;
      if (w.blocks[c[0] + w.sx * c[2] + w.sx * w.sz * c[1]]) {
        if (first && n[0] === 0 && n[1] === 0 && n[2] === 0) { /* початок усередині блока: нормаль проти променя за домінантною віссю */ let m = 0; for (let a = 1; a < 3; a++) if (Math.abs(d[a]) > Math.abs(d[m])) m = a; n[m] = -step[m]; }
        return { x: c[0], y: c[1], z: c[2], nx: n[0], ny: n[1], nz: n[2], t };
      }
      first = false;
      const a = tMax[0] < tMax[1] ? (tMax[0] < tMax[2] ? 0 : 2) : (tMax[1] < tMax[2] ? 1 : 2);
      t = tMax[a]; tMax[a] += tDelta[a]; c[a] += step[a]; n = [0, 0, 0]; n[a] = -step[a];
    }
    return null;
  }

  /* ---------- експорт MagicaVoxel (.vox, версія 150) ----------
     Вісі .vox: x праворуч, y вглиб, z вгору; максимум 256 на сторону. Палітра = кольори блоків (індекс = id блока). */
  function toVox(w) {
    if (w.sx > 256 || w.sz > 256 || w.sy > 256) throw new Error('.vox підтримує до 256 вокселів на сторону: зменште світ до 256×256');
    let cnt = 0; for (let i = 0; i < w.blocks.length; i++) if (w.blocks[i]) cnt++;
    const xyzi = new Uint8Array(4 + cnt * 4), dv = new DataView(xyzi.buffer); dv.setUint32(0, cnt, true);
    let o = 4; for (let y = 0; y < w.sy; y++) for (let z = 0; z < w.sz; z++) for (let x = 0; x < w.sx; x++) { const b = w.blocks[idx(w, x, y, z)]; if (b) { xyzi[o++] = x; xyzi[o++] = w.sz - 1 - z; xyzi[o++] = y; xyzi[o++] = b; } }
    const u32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255], tag = s => [...s].map(c => c.charCodeAt(0));
    const size = Uint8Array.from([...u32(w.sx), ...u32(w.sz), ...u32(w.sy)]);
    const rgba = []; for (let i = 0; i < 256; i++) { const c = BLOCKS[i] ? BLOCKS[i].color : [0, 0, 0]; rgba.push(c[0], c[1], c[2], 255); }
    // в .vox колір вокселя з індексом i береться з palette[i-1]: зсуваємо палітру на один
    const pal = Uint8Array.from(rgba.slice(4).concat([0, 0, 0, 255]));
    const chunk = (id, content, children = []) => { const kids = children.reduce((s, k) => s + k.length, 0), out = new Uint8Array(12 + content.length + kids); out.set(tag(id), 0); out.set(u32(content.length), 4); out.set(u32(kids), 8); out.set(content, 12); let p = 12 + content.length; for (const k of children) { out.set(k, p); p += k.length; } return out; };
    const main = chunk('MAIN', [], [chunk('SIZE', size), chunk('XYZI', xyzi), chunk('RGBA', pal)]), out = new Uint8Array(8 + main.length);
    out.set(tag('VOX '), 0); out.set(u32(150), 4); out.set(main, 8); return out;
  }

  function toJson(w) {
    const runs = []; let last = -1, n = 0; // стиснення довжинами серій, щоб JSON не був гігантським
    for (let i = 0; i < w.blocks.length; i++) { const b = w.blocks[i]; if (b === last) n++; else { if (n) runs.push([last, n]); last = b; n = 1; } }
    if (n) runs.push([last, n]);
    return { format: 'zbyrai-voxel-1', size: [w.sx, w.sy, w.sz], order: 'x + sx * (z + sz * y)', blocks: BLOCKS.map(b => b.name), rle: runs, opts: w.opts };
  }
  function fromJson(j) {
    if (!j || j.format !== 'zbyrai-voxel-1') throw new Error('невідомий формат');
    const [sx, sy, sz] = j.size, blocks = new Uint8Array(sx * sy * sz); let p = 0;
    for (const [b, n] of j.rle) { blocks.fill(b, p, p + n); p += n; }
    if (p !== blocks.length) throw new Error('розмір не збігається');
    const heights = new Int16Array(sx * sz), w = { sx, sy, sz, blocks, opts: Object.assign({}, DEFAULTS, j.opts), heights };
    for (let z = 0; z < sz; z++) for (let x = 0; x < sx; x++) heights[x + sx * z] = Math.max(0, topSolid(w, x, z));
    return w;
  }

  return { BLOCKS, ID, DEFAULTS, rngFromSeed, makeNoise, generate, idx, inb, get, set, faceVisible, visibleDir, SCREEN_DIRS, solidAt, walk, extents, topSolid, heightmap, counts, neighborOf, CS, chunkCount, meshChunk, quadIndices, raycast, toVox, toJson, fromJson };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = VoxelCore;
