/* Planet Forge: ядро. Процедурна планета: карта висот і біомів на сфері (шум Перліна 3D), хмари, вогні міст, характеристики й назва.
   Без DOM: браузер (глобал PlanetCore) і Node (module.exports). Усе детерміноване за seed і параметрами. */
const PlanetCore = (() => {
  function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  function makeNoise(seed) {
    const R = rngFromSeed('noise:' + seed), p = new Uint8Array(512), a = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    for (let i = 0; i < 512; i++) p[i] = a[i & 255];
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y, z) => { const u = (h & 15) < 8 ? x : y, v = (h & 15) < 4 ? y : (h & 15) === 12 || (h & 15) === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
    return (x, y, z) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z), A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, Bb = p[X + 1] + Y, BA = p[Bb] + Z, BB = p[Bb + 1] + Z;
      return lerp(lerp(lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u), lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u), lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    };
  }

  /* ---------- типи планет: каталог лежить у planet-kinds.js ---------- */
  const PK = typeof module !== 'undefined' && module.exports ? require('./planet-kinds.js') : PlanetKinds;
  const { BIOMES, LIQ, KINDS, landBiome } = PK;
  const DEFAULT = Object.assign({ seed: 'zbyrai', kind: 'earth', ring: false, name: '' }, KINDS.earth.base);
  const kindOf = p => KINDS[p && p.kind] || KINDS.earth;
  const fixKnob = (kb, v) => { v = clamp(Number.isFinite(+v) ? +v : kb.def, kb.min, kb.max); return kb.f === 'int' || kb.f === 'deg' ? Math.round(v) : v; };
  /* Нова планета заданого типу: усі ручки в стандартних значеннях цього типу */
  function fromKind(kind, seed) {
    const K = KINDS[kind] || KINDS.earth;
    return Object.assign({}, K.base, { kind: K.id, seed: seed ?? DEFAULT.seed, name: planetName(seed ?? DEFAULT.seed, K.id), ring: K.ringChance >= .75 });
  }
  /* Привести параметри до допустимих значень типу (діапазони ручок) */
  function clampParams(p) {
    const K = kindOf(p), out = Object.assign({}, K.base, p, { kind: K.id });
    for (const kb of K.knobs) out[kb.k] = fixKnob(kb, out[kb.k]);
    return out;
  }
  /* Випадкова планета: тип, зерно, назва, усі ручки й кільця; замкнені (locks) параметри лишаються як були. rnd — генератор [0,1) */
  function randomPlanet(prev, locks = {}, rnd = Math.random, opts = {}) {
    const ids = Object.keys(KINDS).filter(k => !KINDS[k].hidden), pick = a => a[Math.floor(rnd() * a.length)];
    const kind = locks.kind && KINDS[prev.kind] || opts.keepKind && KINDS[prev.kind] ? prev.kind : pick(ids), K = KINDS[kind];
    const seed = locks.seed && prev.seed ? prev.seed : Math.floor(rnd() * 2176782336).toString(36).padStart(6, '0');
    const p = fromKind(kind, seed);
    for (const kb of K.knobs) {
      if (locks[kb.k] && prev[kb.k] !== undefined) { p[kb.k] = fixKnob(kb, prev[kb.k]); continue; }
      let r = rnd(); if (kb.f !== 'int') r = r < .5 ? 2 * r * r : 1 - 2 * (1 - r) * (1 - r); // трохи більше крайніх значень: різноманітніше
      p[kb.k] = fixKnob(kb, kb.f === 'int' ? kb.min + Math.floor(rnd() * (kb.max - kb.min + 1)) : lerp(kb.min, kb.max, r));
    }
    p.ring = locks.ring ? !!prev.ring : rnd() < K.ringChance;
    p.name = locks.name && prev.name ? prev.name : planetName(seed, kind);
    return p;
  }
  /* Перемкнути тип, зберігши замкнені ручки */
  function switchKind(prev, kind, locks = {}) {
    const p = fromKind(kind, prev.seed), K = KINDS[kind];
    for (const kb of K.knobs) if (locks[kb.k] && prev[kb.k] !== undefined) p[kb.k] = fixKnob(kb, prev[kb.k]);
    if (locks.ring) p.ring = !!prev.ring; if (locks.name && prev.name) p.name = prev.name;
    return p;
  }

  /* ---------- допоміжні для кольору ---------- */
  function hueRot(c, a) { const cs = Math.cos(a), sn = Math.sin(a), r = c[0], g = c[1], b = c[2], k = 1 / 3, s3 = Math.sqrt(1 / 3);
    return [r * (cs + (1 - cs) * k) + g * ((1 - cs) * k - s3 * sn) + b * ((1 - cs) * k + s3 * sn), r * ((1 - cs) * k + s3 * sn) + g * (cs + (1 - cs) * k) + b * ((1 - cs) * k - s3 * sn), r * ((1 - cs) * k - s3 * sn) + g * ((1 - cs) * k + s3 * sn) + b * (cs + (1 - cs) * k)]; }
  const hueAngle = p => (p.hue || 0) * 2 * Math.PI;

  /* ---------- текстура планети (рівнопроміжна проєкція W×H) ----------
     Повертає { W, H, height, biome, rgb, cloud, light, glow, liq, seaLevel, water: частка рідини } */
  function hash3(s, x, y, z) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ s; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
  function generateTexture(p, W = 512, H = 256) {
    const K0 = kindOf(p); p = Object.assign({}, DEFAULT, K0.base, p); const K = kindOf(p); if (K.derive) Object.assign(p, K.derive(p));
    const nz = { h: makeNoise('h' + p.seed), m: makeNoise('m' + p.seed), r: makeNoise('r' + p.seed), c: makeNoise('c' + p.seed), b: makeNoise('b' + p.seed), l: makeNoise('l' + p.seed) };
    const nH = nz.h, nM = nz.m, nR = nz.r, nC = nz.c, nB = nz.b, nL = nz.l, seedInt = xmur3('cell' + p.seed)() | 0;
    const kit = {
      n: (c, f, off, w) => nz[w || 'b'](c.x * f + (off || 0), c.y * f, c.z * f),
      // комірки Вороного: d1/d2 — відстані до найближчої та другої найближчої точки, r/r2 — випадкові числа комірки
      cell: (c, f, salt) => {
        const X = c.x * f, Y = c.y * f, Z = c.z * f, ix = Math.floor(X), iy = Math.floor(Y), iz = Math.floor(Z), s = seedInt ^ ((salt || 0) * 2654435761);
        let d1 = 9, d2 = 9, r = 0, r2 = 0;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          const h = hash3(s, ix + dx, iy + dy, iz + dz), fx = ix + dx + (h & 1023) / 1024, fy = iy + dy + ((h >>> 10) & 1023) / 1024, fz = iz + dz + ((h >>> 20) & 1023) / 1024, d = (fx - X) ** 2 + (fy - Y) ** 2 + (fz - Z) ** 2;
          if (d < d1) { d2 = d1; d1 = d; r = (h & 255) / 255; r2 = ((h >>> 8) & 255) / 255; } else if (d < d2) d2 = d;
        }
        return cellOut.d1 = Math.sqrt(d1), cellOut.d2 = Math.sqrt(d2), cellOut.r = r, cellOut.r2 = r2, cellOut;
      },
      liquid: (c, o, key) => {
        const L = LIQ[key], d = smooth(0, .8, c.depth), a = BIOMES[L.shallow].c, b = BIOMES[L.deep].c;
        o.col = [lerp(a[0], b[0], d), lerp(a[1], b[1], d), lerp(a[2], b[2], d)]; o.b = c.depth > .35 ? L.deep : L.shallow; o.liq = L.shine ? 1 : 0; o.glow = L.glow ? 255 * L.glow : 0; o.tint = false;
      },
    }, cellOut = { d1: 0, d2: 0, r: 0, r2: 0 };
    const N = W * H, height = new Float32Array(N), vec = new Float32Array(N * 3), lat = new Float32Array(N), c = { x: 0, y: 0, z: 0 };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, lon = (x + .5) / W * 2 * Math.PI - Math.PI, la = (.5 - (y + .5) / H) * Math.PI, cl = Math.cos(la);
      const vx = cl * Math.cos(lon), vy = Math.sin(la), vz = cl * Math.sin(lon); vec[i * 3] = vx; vec[i * 3 + 1] = vy; vec[i * 3 + 2] = vz; lat[i] = la;
      const f = p.scale; let amp = 1, fr = f, v = 0, tot = 0;
      for (let k = 0; k < 6; k++) { v += nH(vx * fr + 7.3 * k, vy * fr, vz * fr - 3.1 * k) * amp; tot += amp; amp *= .5; fr *= 2; }
      v /= tot;
      const ridge = 1 - Math.abs(nR(vx * f * 2.6, vy * f * 2.6, vz * f * 2.6)); // гірські хребти
      let h = v + Math.pow(ridge, 3) * p.mount * .55 * smooth(-.15, .25, v);
      if (K.hmod) { c.x = vx; c.y = vy; c.z = vz; h = K.hmod(h, c, p, kit); }
      height[i] = h;
    }
    // рівень рідини — за процентилем висот: частка рідини дорівнює p.sea
    const sorted = Float32Array.from(height).sort(), seaLevel = p.sea <= 0 ? -Infinity : p.sea >= 1 ? Infinity : sorted[Math.min(N - 1, Math.floor(p.sea * N))];
    const hMax = sorted[N - 1], lo = Number.isFinite(seaLevel) ? seaLevel : sorted[0], rise = Math.max(1e-6, hMax - lo);
    const biome = new Uint8Array(N), rgb = new Uint8ClampedArray(N * 3), cloud = new Uint8Array(N), light = new Uint8Array(N), glow = new Uint8Array(N), liq = new Uint8Array(N);
    const lightSet = new Set(K.lightB), hr = hueAngle(p), o = { b: 0, col: null, glow: 0, liq: 0, tint: false, mul: 1 };
    let waterN = 0; const capLat = (1 - p.caps) * 1.25 + .25 * (1 - clamp(p.temp + 1, 0, 2) / 2) + .15; // широта, вище якої лід
    for (let i = 0; i < N; i++) {
      const vx = vec[i * 3], vy = vec[i * 3 + 1], vz = vec[i * 3 + 2], h = height[i], la = Math.abs(lat[i]) + nB(vx * 5 + 11, vy * 5, vz * 5) * .09; // межа шапок нерівна
      const water = h < seaLevel, alt = water ? 0 : clamp((h - lo) / rise, 0, 1);
      c.x = vx; c.y = vy; c.z = vz; c.lat = lat[i]; c.la = la; c.h = h; c.water = water; c.alt = alt; c.capLat = capLat;
      c.depth = water ? clamp((seaLevel - h) / Math.max(.05, seaLevel - sorted[0]), 0, 1) : 0;
      c.t = clamp(.5 + p.temp * .42 - la / (Math.PI / 2) * .55 - alt * .38 + nM(vx * 3 + 9, vy * 3, vz * 3) * .06, 0, 1);
      c.m = clamp(p.humid * .9 + nM(vx * 2.2 - 5, vy * 2.2, vz * 2.2) * .55 - (alt > .5 ? .15 : 0) + .05, 0, 1);
      o.b = 0; o.col = null; o.glow = 0; o.liq = 0; o.tint = false; o.mul = 1;
      K.px(c, o, p, kit);
      if (water) waterN++;
      let col = o.col; if (!col) col = BIOMES[o.b].c.slice();
      if (o.tint && !o.col) { const tint = .86 + (nB(vx * 22, vy * 22, vz * 22) * .5 + .5) * .28; col = col.map(v => clamp(v * tint, 0, 255)); }
      if (o.mul !== 1) col = col.map(v => v * o.mul);
      if (hr) col = hueRot(col, hr);
      biome[i] = o.b; rgb[i * 3] = col[0]; rgb[i * 3 + 1] = col[1]; rgb[i * 3 + 2] = col[2]; glow[i] = o.glow; liq[i] = o.liq;
      if (K.flat) height[i] = 0;
      // хмари: розтягнуті вздовж паралелей
      if (p.cloud > 0 && !K.noCloud) { const cx = nC(vx * 2.6, vy * 5, vz * 2.6) * .6 + nC(vx * 6, vy * 11, vz * 6) * .3 + nC(vx * 13, vy * 20, vz * 13) * .12; cloud[i] = Math.round(255 * smooth(.12 - p.cloud * .32, .45 - p.cloud * .22, cx) * clamp(p.cloud * 1.3, 0, 1)); }
      // вогні міст: лише на придатній поверхні типу
      if (p.lights > 0 && lightSet.has(o.b)) { const cl = nL(vx * 4.5, vy * 4.5, vz * 4.5), dot = nL(vx * 60, vy * 60, vz * 60); if (cl > .12 && dot > .25 - p.lights * .25) light[i] = Math.round(clamp((cl - .12) * 5, 0, 1) * 255); }
    }
    return { W, H, height, biome, rgb, cloud, light, glow, liq, seaLevel, water: waterN / N };
  }

  /* ---------- характеристики, ім'я, супутники ---------- */
  const SETS = {
    sci: ['ва', 'кра', 'зен', 'ту', 'мі', 'ра', 'ліс', 'дор', 'ніс', 'орі', 'а', 'ен', 'ар', 'ти', 'зу', 'бе', 'лор', 'ка', 'ксі', 'он', 'тар', 'ше', 'вул', 'ора', 'гел', 'ім'],
    fan: ['ель', 'ай', 'ун', 'тал', 'ма', 'сей', 'ір', 'ліен', 'вел', 'ось', 'ія', 'кай', 'ната', 'ур', 'веа', 'сі', 'фел', 'ад', 'мор', 'гі', 'ніс', 'лю', 'зар', 'ое'],
    harsh: ['ґар', 'крон', 'бар', 'тор', 'зуг', 'мор', 'кор', 'руд', 'вул', 'гнів', 'драк', 'кам', 'стар', 'нер', 'хорн', 'ост', 'гран', 'баз', 'крем', 'тарк'],
    soft: ['лу', 'мі', 'бе', 'ля', 'но', 'ма', 'ві', 'ро', 'зі', 'па', 'лі', 'сє', 'до', 'ту', 'ні', 'лла', 'мо', 'ки'],
  };
  const SUF = ['', '', '', ' Прайм', ' II', ' III', ' Мінор', ' Альфа'];
  function planetName(seed, kind) {
    const style = (KINDS[kind] || KINDS.earth).style, R = rngFromSeed('name:' + seed + ':' + (KINDS[kind] ? kind : '')), set = SETS[style] || SETS.sci; let n = ''; const k = 2 + Math.floor(R() * 2);
    for (let i = 0; i < k; i++) n += set[Math.floor(R() * set.length)];
    n = n[0].toUpperCase() + n.slice(1).replace(/аа/g, 'а').replace(/(.)\1\1/g, '$1$1');
    return n + SUF[Math.floor(R() * SUF.length)];
  }
  const designation = seed => { const R = rngFromSeed('des:' + seed), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; return 'ZB-' + A[Math.floor(R() * A.length)] + A[Math.floor(R() * A.length)] + '-' + (100 + Math.floor(R() * 900)); };

  function describe(p, tex) {
    p = Object.assign({}, DEFAULT, kindOf(p).base, p); const K = kindOf(p);
    const R = rngFromSeed('stats:' + p.seed + ':' + p.kind);
    const radiusKm = Math.round(lerp(K.size[0], K.size[1], R())), density = lerp(K.dens[0], K.dens[1], R());
    const gravity = Math.round((radiusKm / 6371) * density * 100) / 100, // у g (1 = земна)
      dayH = Math.round(lerp(7, 64, R()) * 10) / 10, yearD = Math.round(lerp(80, 900, R()));
    const tempC = Math.round(lerp(K.tc[0], K.tc[1], (clamp(p.temp, -1, 1) + 1) / 2) + (p.atmo - .5) * 30), pressure = Math.round(p.atmo * 2.4 * 100) / 100;
    const water = tex ? tex.water : p.sea, counts = {};
    if (tex) for (let i = 0; i < tex.biome.length; i++) counts[tex.biome[i]] = (counts[tex.biome[i]] || 0) + 1;
    const biomes = Object.entries(counts).map(([id, n]) => ({ id: +id, name: BIOMES[id].name, share: n / (tex ? tex.biome.length : 1) })).sort((a, b) => b.share - a.share);
    const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
    let hab = 0;
    if (K.hab === 'terran') hab = 100 * g(tempC, 15, 18) * (.35 + .65 * g(water, .6, .3)) * g(pressure, .9, .6) * g(gravity, 1, .55);
    else if (K.hab && K.hab.fixed) hab = lerp(K.hab.fixed[0], K.hab.fixed[1], R());
    hab = Math.round(clamp(hab, 0, 100));
    const resources = K.res.map(n => ({ name: n, rich: 1 + Math.floor(R() * 5) })).sort((a, b) => b.rich - a.rich).slice(0, 3);
    const m = []; const mr = rngFromSeed('moons:' + p.seed);
    for (let i = 0; i < Math.round(p.moons); i++) m.push({ size: lerp(.07, .2, mr()), dist: 1.55 + i * .55 + mr() * .25, phase: mr() * Math.PI * 2, speed: lerp(.6, 1.6, mr()) / (1 + i * .5), shade: Math.round(lerp(120, 210, mr())) });
    const label = hab >= 70 ? 'Придатна для життя' : hab >= 40 ? 'Умовно придатна' : hab >= 12 ? 'Важка для життя' : 'Непридатна';
    return { name: p.name || planetName(p.seed, p.kind), designation: designation(p.seed), kindName: K.name, group: K.group, blurb: K.blurb, life: K.life, liquidName: K.liqName || (K.knobs.find(k => k.k === 'sea') || {}).l || 'Рідина',
      radiusKm, gravity, dayH, yearD, tempC, pressure, atmosphere: K.gases, water, biomes, habitability: hab, habLabel: label, resources, moons: m, slab: K.slabInfo ? K.slabInfo(p) : null, shape: K.shape || 'sphere' };
  }

  /* ---------- кольори атмосфери, хмар, блиск рідини ---------- */
  const atmoColor = p => { const c = kindOf(p).ac; return p.hue ? hueRot(c, hueAngle(p)).map(v => clamp(v, 0, 255)) : c; };
  const cloudColor = p => kindOf(p).cc;
  const shineOf = p => (p.shine == null ? 1 : p.shine);

  return { KINDS, LIQ, DEFAULT, BIOMES, fromKind, clampParams, randomPlanet, switchKind, landBiome, generateTexture, describe, planetName, designation, atmoColor, cloudColor, shineOf, makeNoise, rngFromSeed };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetCore;
