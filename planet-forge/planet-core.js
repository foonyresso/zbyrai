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

  /* ---------- типи планет ---------- */
  // sea: частка води; temp: −1 холодно … +1 спекотно (до широтного градієнта); humid: 0..1; ground — колір «суходолу» за замовчуванням
  const KINDS = {
    earth: { name: 'Земного типу', sea: .62, temp: .05, humid: .55, atmo: .6, cloud: .55, caps: .5, mount: .5, scale: 1.4, lights: .5 },
    ocean: { name: 'Океанічна', sea: .9, temp: .2, humid: .9, atmo: .75, cloud: .75, caps: .3, mount: .3, scale: 1.7, lights: 0 },
    desert: { name: 'Пустельна', sea: .12, temp: .6, humid: .1, atmo: .35, cloud: .12, caps: 0, mount: .6, scale: 1.3, lights: .15 },
    ice: { name: 'Крижана', sea: .35, temp: -.7, humid: .4, atmo: .45, cloud: .35, caps: .7, mount: .5, scale: 1.4, lights: 0 },
    lava: { name: 'Вулканічна', sea: 0, temp: 1, humid: 0, atmo: .7, cloud: .3, caps: 0, mount: .85, scale: 1.8, lights: 0 },
    gas: { name: 'Газовий гігант', sea: 0, temp: -.3, humid: 0, atmo: 1, cloud: 0, caps: 0, mount: 0, scale: 1, lights: 0 },
  };
  const DEFAULT = { seed: 'zbyrai', kind: 'earth', sea: .62, temp: .05, humid: .55, atmo: .6, cloud: .55, caps: .5, mount: .5, scale: 1.4, lights: .5, ring: false, moons: 1, tilt: 18 };
  const fromKind = (kind, seed) => Object.assign({}, DEFAULT, KINDS[kind], { kind, seed: seed ?? DEFAULT.seed, name: undefined, ring: kind === 'gas', moons: kind === 'gas' ? 3 : 1 });

  /* ---------- біоми ---------- */
  const BIOMES = [
    { id: 0, name: 'Глибокий океан', c: [18, 48, 110] }, { id: 1, name: 'Мілководдя', c: [44, 112, 170] }, { id: 2, name: 'Лід і сніг', c: [236, 243, 250] },
    { id: 3, name: 'Тундра', c: [150, 160, 140] }, { id: 4, name: 'Тайга', c: [58, 98, 70] }, { id: 5, name: 'Луки', c: [118, 168, 80] },
    { id: 6, name: 'Ліс', c: [48, 118, 58] }, { id: 7, name: 'Пустеля', c: [214, 182, 118] }, { id: 8, name: 'Савана', c: [176, 164, 84] },
    { id: 9, name: 'Джунглі', c: [28, 112, 60] }, { id: 10, name: 'Гори', c: [126, 118, 112] }, { id: 11, name: 'Засніжені піки', c: [226, 230, 236] },
    { id: 12, name: 'Пляж', c: [226, 210, 160] }, { id: 13, name: 'Лава', c: [255, 110, 30] }, { id: 14, name: 'Вулканічна порода', c: [52, 40, 40] },
  ];
  /* Чиста функція вибору біома для суходолу. t, m ∈ [0,1] (температура, вологість), alt ∈ [0,1] (висота над морем) */
  function landBiome(t, m, alt) {
    if (alt > .78) return t < .55 ? 11 : 10;
    if (alt > .55) return t < .3 ? 11 : 10;
    if (t < .12) return 2;
    if (t < .27) return m > .45 ? 4 : 3;
    if (t < .6) return m > .62 ? 6 : m > .3 ? 5 : 8;
    return m > .7 ? 9 : m > .4 ? 8 : 7;
  }

  /* ---------- текстура планети (рівнопроміжна проєкція W×H) ----------
     Повертає { W, H, height: Float32Array, biome: Uint8Array, rgb: Uint8Array(W*H*3), cloud: Uint8Array, light: Uint8Array, seaLevel, water: частка води } */
  function generateTexture(p, W = 512, H = 256) {
    p = Object.assign({}, DEFAULT, p);
    const nH = makeNoise('h' + p.seed), nM = makeNoise('m' + p.seed), nR = makeNoise('r' + p.seed), nC = makeNoise('c' + p.seed), nB = makeNoise('b' + p.seed), nL = makeNoise('l' + p.seed);
    const N = W * H, height = new Float32Array(N), vec = new Float32Array(N * 3), lat = new Float32Array(N);
    const gas = p.kind === 'gas', lava = p.kind === 'lava';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, lon = (x + .5) / W * 2 * Math.PI - Math.PI, la = (.5 - (y + .5) / H) * Math.PI, cl = Math.cos(la);
      const vx = cl * Math.cos(lon), vy = Math.sin(la), vz = cl * Math.sin(lon); vec[i * 3] = vx; vec[i * 3 + 1] = vy; vec[i * 3 + 2] = vz; lat[i] = la;
      const f = p.scale; let amp = 1, fr = f, v = 0, tot = 0;
      for (let k = 0; k < 6; k++) { v += nH(vx * fr + 7.3 * k, vy * fr, vz * fr - 3.1 * k) * amp; tot += amp; amp *= .5; fr *= 2; }
      v /= tot;
      const ridge = 1 - Math.abs(nR(vx * f * 2.6, vy * f * 2.6, vz * f * 2.6)); // гірські хребти
      height[i] = v + Math.pow(ridge, 3) * p.mount * .55 * smooth(-.15, .25, v);
    }
    // рівень моря — за процентилем висот: частка води дорівнює p.sea
    const sorted = Float32Array.from(height).sort(), seaLevel = p.sea <= 0 ? -Infinity : p.sea >= 1 ? Infinity : sorted[Math.min(N - 1, Math.floor(p.sea * N))];
    const hMax = sorted[N - 1], rise = Math.max(1e-6, hMax - (Number.isFinite(seaLevel) ? seaLevel : sorted[0]));
    const biome = new Uint8Array(N), rgb = new Uint8ClampedArray(N * 3), cloud = new Uint8Array(N), light = new Uint8Array(N);
    let waterN = 0; const capLat = (1 - p.caps) * 1.25 + .25 * (1 - clamp(p.temp + 1, 0, 2) / 2) + .15; // широта, вище якої лід
    for (let i = 0; i < N; i++) {
      const vx = vec[i * 3], vy = vec[i * 3 + 1], vz = vec[i * 3 + 2], h = height[i], la = Math.abs(lat[i]) + nB(vx * 5 + 11, vy * 5, vz * 5) * .09; // межа шапок нерівна
      let col, b;
      if (gas) {
        // смуги за широтою зі збуренням
        const turb = nB(vx * 3, vy * 7, vz * 3) * .09 + nB(vx * 8, vy * 2, vz * 8) * .03, band = Math.sin((lat[i] + turb) * 21 + nL(vx * 1.5, vy * 1.5, vz * 1.5) * .8) + .35 * Math.sin((lat[i] + turb) * 47), tint = .5 + .32 * band;
        const base = p.temp < -.1 ? [[226, 202, 160], [186, 142, 98], [214, 176, 130]] : [[170, 196, 214], [110, 140, 176], [200, 216, 226]];
        const c1 = base[0], c2 = base[1], c3 = base[2], k = smooth(.25, .75, tint);
        col = [lerp(c2[0], c1[0], k) * .9 + c3[0] * .1, lerp(c2[1], c1[1], k) * .9 + c3[1] * .1, lerp(c2[2], c1[2], k) * .9 + c3[2] * .1];
        const storm = nB(vx * 3 + 40, vy * 3, vz * 3) > .62 && Math.abs(lat[i]) < .6; if (storm) col = [col[0] * .8 + 50, col[1] * .55, col[2] * .45]; b = 5;
        biome[i] = 5; height[i] = 0;
      } else {
        const water = h < seaLevel;
        const alt = water ? 0 : clamp((h - seaLevel) / rise, 0, 1);
        const t = clamp(.5 + p.temp * .42 - la / (Math.PI / 2) * .55 - alt * .38 + nM(vx * 3 + 9, vy * 3, vz * 3) * .06, 0, 1);
        const m = clamp(p.humid * .9 + nM(vx * 2.2 - 5, vy * 2.2, vz * 2.2) * .55 - (alt > .5 ? .15 : 0) + .05, 0, 1);
        if (lava) {
          const veins = Math.abs(nR(vx * 5 + 3, vy * 5, vz * 5)), hot = veins < .07 + p.mount * .03 || (h > seaLevel + .35 && nB(vx * 8, vy * 8, vz * 8) > .5);
          b = hot ? 13 : 14; col = BIOMES[b].c.slice(); const sh = .8 + (nB(vx * 18, vy * 18, vz * 18) * .5 + .5) * .5; if (!hot) col = col.map(v => v * sh); else col = col.map((v, k) => v * (.85 + .3 * (nB(vx * 12 + 2, vy * 12, vz * 12) * .5 + .5)) + (k === 0 ? 0 : 0));
        } else if (water) {
          waterN++; const depth = clamp((seaLevel - h) / Math.max(.05, seaLevel - sorted[0]), 0, 1); b = depth > .35 ? 0 : 1;
          const c0 = BIOMES[1].c, c1 = BIOMES[0].c; col = [lerp(c0[0], c1[0], smooth(0, .8, depth)), lerp(c0[1], c1[1], smooth(0, .8, depth)), lerp(c0[2], c1[2], smooth(0, .8, depth))];
          if (la > capLat && p.caps > 0) { b = 2; col = [232, 240, 248]; }
        } else {
          b = alt < .015 && t > .25 ? 12 : landBiome(t, m, alt); if (p.caps > 0 && la > capLat + .1 * (1 - p.caps)) b = 2; if (p.kind === 'ice' && b !== 2 && b !== 10 && b !== 11 && alt > .01) b = t < .3 ? 2 : b;
          col = BIOMES[b].c.slice(); const tint = .86 + (nB(vx * 22, vy * 22, vz * 22) * .5 + .5) * .28; col = col.map(v => clamp(v * tint, 0, 255));
        }
        biome[i] = b;
      }
      rgb[i * 3] = col[0]; rgb[i * 3 + 1] = col[1]; rgb[i * 3 + 2] = col[2];
      // хмари: розтягнуті вздовж паралелей
      if (p.cloud > 0 && !(lava)) { const cx = nC(vx * 2.6, vy * 5, vz * 2.6) * .6 + nC(vx * 6, vy * 11, vz * 6) * .3 + nC(vx * 13, vy * 20, vz * 13) * .12; cloud[i] = Math.round(255 * smooth(.12 - p.cloud * .32, .45 - p.cloud * .22, cx) * clamp(p.cloud * 1.3, 0, 1)); }
      // вогні міст: лише на придатному суходолі
      if (p.lights > 0 && [5, 6, 8, 12].includes(biome[i])) { const cl = nL(vx * 4.5, vy * 4.5, vz * 4.5), dot = nL(vx * 60, vy * 60, vz * 60); if (cl > .12 && dot > .25 - p.lights * .25) light[i] = Math.round(clamp((cl - .12) * 5, 0, 1) * 255); }
    }
    return { W, H, height, biome, rgb, cloud, light, seaLevel, water: waterN / N };
  }

  /* ---------- характеристики, ім'я, супутники ---------- */
  const SYL = ['ва', 'кра', 'зен', 'ту', 'мі', 'ра', 'ліс', 'дор', 'ніс', 'орі', 'а', 'ен', 'ар', 'ти', 'зу', 'бе', 'лор', 'ка', 'ксі', 'он', 'тар', 'ше', 'вул', 'ора', 'гел', 'ім'];
  const SUF = ['', '', '', ' Прайм', ' II', ' III', ' Мінор', ' Альфа'];
  function planetName(seed) {
    const R = rngFromSeed('name:' + seed); let n = ''; const k = 2 + Math.floor(R() * 2);
    for (let i = 0; i < k; i++) n += SYL[Math.floor(R() * SYL.length)];
    n = n[0].toUpperCase() + n.slice(1).replace(/аа/g, 'а').replace(/(.)\1\1/g, '$1$1');
    return n + SUF[Math.floor(R() * SUF.length)];
  }
  const designation = seed => { const R = rngFromSeed('des:' + seed), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; return 'ZB-' + A[Math.floor(R() * A.length)] + A[Math.floor(R() * A.length)] + '-' + (100 + Math.floor(R() * 900)); };

  const ATMOS = {
    earth: [['Азот', 77], ['Кисень', 21], ['Аргон', 1], ['Інше', 1]], ocean: [['Азот', 72], ['Кисень', 26], ['Водяна пара', 1.5], ['Інше', .5]],
    desert: [['Діоксид вуглецю', 80], ['Азот', 17], ['Аргон', 2], ['Інше', 1]], ice: [['Азот', 88], ['Метан', 9], ['Аргон', 2], ['Інше', 1]],
    lava: [['Діоксид сірки', 45], ['Діоксид вуглецю', 40], ['Азот', 13], ['Інше', 2]], gas: [['Водень', 86], ['Гелій', 13], ['Метан', .8], ['Інше', .2]],
  };

  function describe(p, tex) {
    p = Object.assign({}, DEFAULT, p);
    const R = rngFromSeed('stats:' + p.seed + ':' + p.kind), gas = p.kind === 'gas';
    const radiusKm = Math.round(gas ? lerp(22000, 70000, R()) : lerp(2800, 9200, R())), density = gas ? lerp(.2, .35, R()) : lerp(.75, 1.3, R());
    const gravity = Math.round((radiusKm / 6371) * density * 100) / 100, // у g (1 = земна)
       dayH = Math.round(lerp(7, 64, R()) * 10) / 10, yearD = Math.round(lerp(80, 900, R()));
    const tempC = Math.round(-55 + (p.temp + 1) * 55 + (p.atmo - .5) * 30 + (p.kind === 'lava' ? 250 : 0) + (p.kind === 'ice' ? -25 : 0)), pressure = Math.round(p.atmo * 2.4 * 100) / 100;
    const water = tex ? tex.water : p.sea, counts = {};
    if (tex) for (let i = 0; i < tex.biome.length; i++) counts[tex.biome[i]] = (counts[tex.biome[i]] || 0) + 1;
    const biomes = Object.entries(counts).map(([id, n]) => ({ id: +id, name: BIOMES[id].name, share: n / (tex ? tex.biome.length : 1) })).sort((a, b) => b.share - a.share);
    const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
    let hab = p.kind === 'gas' || p.kind === 'lava' ? 0 : 100 * g(tempC, 15, 18) * (.35 + .65 * g(water, .6, .3)) * g(pressure, .9, .6) * g(gravity, 1, .55);
    hab = Math.round(clamp(hab, 0, 100));
    const resPool = { earth: ['Дерево', 'Родюча земля', 'Метали', 'Прісна вода'], ocean: ['Риба й водорості', 'Дейтерій', 'Перли', 'Прісна вода'], desert: ['Силікати', 'Сонячна енергія', 'Рідкісні метали', 'Сіль'], ice: ['Водяний лід', 'Метановий лід', 'Кристали', 'Геотермальні гейзери'], lava: ['Рідкі метали', 'Сірка', 'Геотермальна енергія', 'Обсидіан'], gas: ['Гелій-3', 'Водень', 'Рідкий метан', 'Екзотичні ізотопи'] }[p.kind];
    const resources = resPool.map(n => ({ name: n, rich: 1 + Math.floor(R() * 5) })).sort((a, b) => b.rich - a.rich).slice(0, 3);
    const m = []; const mr = rngFromSeed('moons:' + p.seed);
    for (let i = 0; i < Math.round(p.moons); i++) m.push({ size: lerp(.07, .2, mr()), dist: 1.55 + i * .55 + mr() * .25, phase: mr() * Math.PI * 2, speed: lerp(.6, 1.6, mr()) / (1 + i * .5), shade: Math.round(lerp(120, 210, mr())) });
    const label = hab >= 70 ? 'Придатна для життя' : hab >= 40 ? 'Умовно придатна' : hab >= 12 ? 'Важка для життя' : 'Непридатна';
    return { name: p.name || planetName(p.seed), designation: designation(p.seed), kindName: KINDS[p.kind].name, radiusKm, gravity, dayH, yearD, tempC, pressure, atmosphere: ATMOS[p.kind], water, biomes, habitability: hab, habLabel: label, resources, moons: m };
  }

  /* ---------- кольори атмосфери ---------- */
  const atmoColor = p => ({ earth: [110, 170, 255], ocean: [100, 190, 255], desert: [255, 190, 120], ice: [170, 210, 255], lava: [255, 120, 70], gas: p.temp < -.1 ? [255, 210, 150] : [150, 200, 255] }[p.kind] || [120, 170, 255]);

  return { KINDS, DEFAULT, BIOMES, fromKind, landBiome, generateTexture, describe, planetName, designation, atmoColor, makeNoise, rngFromSeed };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetCore;
