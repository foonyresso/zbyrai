/* Planet Forge: зоряна система. Типи зір (справжні й вигадані, чорна діра), планети на орбітах, два масштаби відстаней.
   Без DOM: браузер (PlanetSystem) і Node (module.exports). Детерміновано за зерном; малює planet-system-view.js. */
const PlanetSystem = (() => {
  const PC = typeof module !== 'undefined' && module.exports ? require('./planet-core.js') : PlanetCore;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  /* lum — світність відносно Сонця, size — візуальний розмір, hue — колір світіння, real — існує в природі */
  const STARS = {
    yellow: { name: 'Жовтий карлик', lum: 1, size: 1, col: [255, 236, 170], real: true, w: 5, tip: 'Як наше Сонце: стабільна зоря з широкою зоною життя' },
    orange: { name: 'Помаранчевий карлик', lum: .35, size: .8, col: [255, 190, 110], real: true, w: 3, tip: 'Холодніша й довговічна зоря; зона життя ближче' },
    red: { name: 'Червоний карлик', lum: .04, size: .55, col: [255, 120, 90], real: true, w: 3, tip: 'Найпоширеніша зоря: тьмяна, планети тісно біля неї' },
    white: { name: 'Білий карлик', lum: .02, size: .35, col: [225, 238, 255], real: true, w: 1, tip: 'Гаряче дотліле ядро зорі: дуже мале й тьмяне' },
    blue: { name: 'Блакитний гігант', lum: 40, size: 1.7, col: [150, 190, 255], real: true, w: 1, tip: 'Дуже яскрава гаряча зоря: зона життя дуже далеко' },
    redgiant: { name: 'Червоний гігант', lum: 90, size: 2.3, col: [255, 140, 90], real: true, w: 1, tip: 'Роздута постаріла зоря: гігантська й палюча' },
    binary: { name: 'Подвійна зоря', lum: 1.6, size: 1, col: [255, 226, 170], real: true, w: 2, tip: 'Дві зорі, що кружляють одна навколо одної' },
    pulsar: { name: 'Пульсар (нейтронна зоря)', lum: .6, size: .3, col: [170, 210, 255], real: true, w: 1, tip: 'Крихітне надщільне ядро з променями, що б’ють у простір' },
    violet: { name: 'Фіолетова зоря (вигадана)', lum: 3, size: 1.2, col: [190, 130, 255], real: false, w: 1, tip: 'Вигадана зоря з фіолетовим сяйвом' },
    emerald: { name: 'Смарагдова зоря (вигадана)', lum: 1.2, size: 1.1, col: [110, 240, 170], real: false, w: 1, tip: 'Вигадана зоря зі смарагдовим світлом' },
    blackhole: { name: 'Чорна діра', lum: .5, size: .9, col: [255, 170, 90], real: true, w: 1, tip: 'Чорна діра з розпеченим диском: планети живляться лише його випромінюванням' },
  };
  const STAR_ORDER = Object.keys(STARS);
  const hz = star => ({ in: Math.sqrt(star.lum / 1.1), out: Math.sqrt(star.lum / .53) });
  const teq = (star, au) => 278 * Math.pow(star.lum, .25) / Math.sqrt(au);
  const POOL = {
    hot: ['lava', 'venus', 'metal', 'volcanic', 'moon', 'shattered', 'desert'],
    warm: ['earth', 'continental', 'pangaea', 'archipelago', 'ocean', 'jungle', 'swamp', 'desert', 'tech', 'candy', 'living', 'floating'],
    cool: ['mars', 'earth', 'continental', 'ice', 'ocean', 'mushroom', 'turtle', 'moon', 'amber', 'ringed'],
    cold: ['ice', 'titan', 'moon', 'mirror', 'void', 'crystal', 'storm'],
    giant: ['gas', 'icegiant', 'ringed', 'storm'],
  };
  const classOf = (t, au, snow) => au > snow * 2.2 ? 'giant' : t > 420 ? 'hot' : t > 260 ? 'warm' : t > 170 ? 'cool' : 'cold';
  const seedStr = (rnd) => Math.floor(rnd() * 2176782336).toString(36).padStart(6, '0');
  const strip = p => { const o = Object.assign({}, p); delete o.spin; delete o.sun; delete o.auto; delete o.locks; for (const k of Object.keys(o)) if (/^bg/.test(k) || k === 'bg') delete o[k]; return o; };

  /* Нова система: зоря (або задана), 3–9 планет з типами за температурою орбіти */
  function generate(seed, opts = {}) {
    const R = PC.rngFromSeed('sys:' + seed), starId = STARS[opts.star] ? opts.star : pickStar(R), star = STARS[starId];
    const count = clamp(Math.round(opts.count || 4 + Math.floor(R() * 5)), 3, 9), z = hz(star), snow = z.out * 1.6;
    let au = Math.max(.12, z.in * (.25 + R() * .25)); const planets = [];
    for (let i = 0; i < count; i++) {
      au *= 1.38 + R() * .45; const t = teq(star, au), cls = classOf(t, au, snow), kind = R() < .12 ? Object.keys(PC.KINDS)[Math.floor(R() * Object.keys(PC.KINDS).length)] : POOL[cls][Math.floor(R() * POOL[cls].length)];
      const ps = seedStr(R), prev = PC.fromKind(kind, ps), params = PC.randomPlanet(prev, { kind: true, seed: true, name: true }, R, { keepKind: true });
      planets.push({ au: +au.toFixed(3), params: Object.assign(strip(params), { seed: ps, name: PC.planetName(ps, kind) }), phase: R() * 6.2832 });
    }
    return { tool: 'planet-forge', seed: String(seed), star: starId, count, name: PC.planetName(String(seed), 'earth') + ' (зоря)', planets };
  }
  function pickStar(R) { const tot = STAR_ORDER.reduce((s, k) => s + STARS[k].w, 0); let r = R() * tot; for (const k of STAR_ORDER) { r -= STARS[k].w; if (r <= 0) return k; } return 'yellow'; }
  /* Перевірити збережену систему; зіпсовану замінити новою */
  function clampSystem(s) {
    if (!s || !Array.isArray(s.planets) || !s.planets.length || !STARS[s.star] || s.planets.some(p => !p || !PC.KINDS[p.params && p.params.kind] || !(p.au > 0))) return null;
    return Object.assign({}, s, { count: s.planets.length, planets: s.planets.map(p => ({ au: p.au, phase: +p.phase || 0, params: Object.assign(PC.clampParams(p.params), { seed: String(p.params.seed), name: p.params.name || PC.planetName(String(p.params.seed), p.params.kind) }) })) });
  }
  /* Орбіта в піксельних одиницях 0..1 від краю: compact — рівномірно за номером, real — пропорційно до відстані в а.о. */
  function orbitFrac(sys, i, mode) { const n = sys.planets.length; if (mode === 'real') return sys.planets[i].au / (sys.planets[n - 1].au * 1.08); return .16 + (i + .5) / n * .78; }
  /* Швидкість: за Кеплером від відстані (real) або від номера (compact) */
  const speedOf = (sys, i, mode) => mode === 'real' ? .6 * Math.pow(sys.planets[i].au, -1.5) : .5 / Math.pow(i + 1, .85);
  const info = (sys, i) => { const star = STARS[sys.star], p = sys.planets[i], z = hz(star), t = teq(star, p.au); return { au: p.au, temp: Math.round(t - 273), inZone: p.au >= z.in && p.au <= z.out, yearD: Math.round(365 * Math.pow(p.au, 1.5) / Math.sqrt(Math.pow(star.lum, .28))) }; };
  return { STARS, STAR_ORDER, generate, clampSystem, orbitFrac, speedOf, hz, teq, info, strip };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetSystem;
