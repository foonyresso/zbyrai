/* Planet Forge: літаючий континент (не планета). Ізольовані плити суші в повітрі, замість океану порожнеча, річки стікають за краї водоспадами.
   Без DOM: браузер (PlanetSky) і Node (module.exports). Детерміновано за зерном; малює planet-sky-view.js. */
const PlanetSky = (() => {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const PALETTES = ['Буяння (зелень)', 'Осінь', 'Крижані плити', 'Чужа флора'];
  const KNOBS = [
    { k: 'isl', l: 'Кількість плит', min: 3, max: 14, def: 7, f: 'int', tip: 'Скільки ізольованих плит суші парить у повітрі' },
    { k: 'size', l: 'Розмір плит', min: .5, max: 1.5, def: 1, f: 'num', tip: 'Середній розмір плит: від крихітних острівців до материків' },
    { k: 'elev', l: 'Глибина скель знизу', min: 0, max: 1, def: .6, f: 'pct', tip: 'Як глибоко звисають скелі під плитами' },
    { k: 'rivers', l: 'Річки й водоспади', min: 0, max: 1, def: .6, f: 'pct', tip: 'Скільки річок починається на плитах і падає за краї водоспадами' },
    { k: 'bridges', l: 'Мости між плитами', min: 0, max: 1, def: .5, f: 'pct', tip: 'Скільки мотузяних мостів з’єднує близькі плити' },
    { k: 'mist', l: 'Хмари й імла', min: 0, max: 1, def: .55, f: 'pct', tip: 'Густота хмар у порожнечі між плитами' },
    { k: 'pal', l: 'Рослинність', min: 0, max: 3, def: 0, f: 'int', tip: 'Колір рослинності: ' + PALETTES.join(', ') },
  ];
  const fixOne = (o, v) => { v = clamp(Number.isFinite(+v) ? +v : o.def, o.min, o.max); return o.f === 'int' ? Math.round(v) : v; };
  const defaults = seed => Object.assign({ seed: String(seed ?? 'sky') }, ...KNOBS.map(o => ({ [o.k]: o.def })));
  const clampSky = p => Object.assign({ seed: String((p && p.seed) || 'sky') }, ...KNOBS.map(o => ({ [o.k]: fixOne(o, p && p[o.k]) })));
  const randomSky = (rnd = Math.random) => Object.assign({ seed: Math.floor(rnd() * 2176782336).toString(36).padStart(6, '0') }, ...KNOBS.map(o => ({ [o.k]: fixOne(o, o.f === 'int' ? o.min + Math.floor(rnd() * (o.max - o.min + 1)) : o.min + (o.max - o.min) * rnd()) })));
  function rng(seed) { let a = 0; for (const ch of String(seed)) a = Math.imul(a ^ ch.charCodeAt(0), 2654435761) >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* Світ: плити (контур, озера, гори, ліси, річки з водоспадами, глибина скель), мости, хмари. Координати в одиницях світу: x ∈ [-1.7, 1.7], y ∈ [-1, 1] */
  function generate(p) {
    p = clampSky(p); const R = rng('sky:' + p.seed), isl = [];
    for (let tries = 0; isl.length < p.isl && tries < 600; tries++) {
      const z = R(), r = (.15 + R() * .3) * p.size * (.6 + .4 * z), x = (R() * 2 - 1) * 1.8, y = (R() * 2 - 1) * .85;
      if (isl.every(o => Math.hypot(o.x - x, (o.y - y) * 1.8) > (o.r + r) * 1.15)) isl.push({ x, y, r, z, phase: R() * 6.28 });
    }
    for (const o of isl) {
      const n = 26, ph = R() * 6.28, a1 = R() * 2 + 1, a2 = R() * 3 + 2;
      o.poly = Array.from({ length: n }, (_, i) => { const a = i / n * 6.2832, k = 1 + .22 * Math.sin(a * a1 + ph) + .12 * Math.sin(a * a2 + ph * 2) + (R() - .5) * .06; return [Math.cos(a) * k, Math.sin(a) * k]; }); // у частках радіуса
      o.depth = o.r * (.5 + p.elev * 1.5) * (.75 + R() * .5); o.tip = (R() - .5) * .5; o.rock = Array.from({ length: 6 }, () => R());
      o.lakes = Array.from({ length: Math.floor(R() * 2.4) }, () => ({ x: (R() - .5) * .8, y: (R() - .5) * .8, r: .1 + R() * .16 }));
      o.peaks = Array.from({ length: 1 + Math.floor(R() * 3 * (o.r / .3)) }, () => ({ x: (R() - .5) * 1.0, y: (R() - .5) * .7 - .08, h: .25 + R() * .45 }));
      o.cities = Array.from({ length: Math.round(3 + R() * 8 * (o.r / .3)) }, () => { const a = R() * 6.28, d = Math.sqrt(R()) * .6; return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: .6 + R() * .8 }; });
      o.trees = Array.from({ length: Math.round(14 + R() * 30 * (o.r / .3)) }, () => { const a = R() * 6.28, d = Math.sqrt(R()) * .86; return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: .6 + R() * .8, t: R() }; });
      const nr = R() < p.rivers ? 1 + Math.floor(R() * p.rivers * 2.5) : 0;
      o.rivers = Array.from({ length: nr }, () => { const a = R() * Math.PI, src = o.lakes.length ? o.lakes[Math.floor(R() * o.lakes.length)] : { x: 0, y: 0 }, edge = [Math.cos(a) * .96, Math.sin(a) * .96], mid = [(src.x + edge[0]) / 2 + (R() - .5) * .3, (src.y + edge[1]) / 2 + (R() - .5) * .3]; return { a, pts: [[src.x, src.y], mid, edge], len: .6 + R() * .9 }; });
    }
    const bridges = []; for (let i = 0; i < isl.length; i++) for (let j = i + 1; j < isl.length; j++) { const a = isl[i], b = isl[j], d = Math.hypot(a.x - b.x, (a.y - b.y) * 1.8) - a.r - b.r; if (d < .22 + p.bridges * .6 && R() < p.bridges * 1.1) bridges.push([i, j]); }
    const clouds = Array.from({ length: Math.round(8 + p.mist * 34) }, () => ({ x: (R() * 2 - 1) * 2.2, y: (R() * 2 - 1) * 1.1, w: .2 + R() * .5, a: .18 + R() * .4, v: .01 + R() * .03, z: R() }));
    return { params: p, islands: isl, bridges, clouds };
  }
  /* Розміри літаючого континенту: span 0..1 → ширина 2 500…90 000 км (Земля 12 742 км), pop 0..1 → населення 1 млрд…50 трлн */
  const widthKm = span => Math.round(2500 * Math.pow(36, clamp(+span || 0, 0, 1)) / 100) * 100;
  const popOf = v => Math.pow(10, 9 + clamp(+v || 0, 0, 1) * 4.7);
  const fmtPop = n => n >= 1e12 ? (Math.round(n / 1e11) / 10).toLocaleString('uk') + ' трлн' : Math.round(n / 1e8) / 10 + ' млрд';
  const fmtKm = km => km.toLocaleString('uk') + ' км';
  const fromPlanet = st => ({ seed: st.seed, isl: st.isl, size: st.size, elev: st.elev, rivers: st.rivers, bridges: st.bridges, pal: st.pal, mist: 0 });
  /* Паспорт: ширина, площа (плити + яруси), населення, щільність */
  function slabInfo(p) {
    const w = widthKm(p.span), area = w * w * .4 / 1e6, pop = popOf(p.pop), tiers = Math.round(p.tiers || 1), floor = area * 1e6 * tiers;
    return { widthKm: w, areaM: Math.round(area), earths: Math.round(area / 510 * 10) / 10, pop, popText: fmtPop(pop), tiers, density: Math.round(pop / floor), plates: Math.round(p.isl) };
  }
  return { PALETTES, KNOBS, defaults, clampSky, randomSky, generate, widthKm, popOf, fmtPop, fmtKm, fromPlanet, slabInfo };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetSky;
