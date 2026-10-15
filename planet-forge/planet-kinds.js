/* Planet Forge: каталог типів планет. Кожен тип має власні ручки (з власними діапазонами), палітру біомів, рідину, небо, склад атмосфери й ресурси.
   Без DOM: браузер (глобал PlanetKinds) і Node (module.exports). Ядро (planet-core.js) лише виконує ці описи. */
const PlanetKinds = (() => {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)], mulc = (a, f) => [a[0] * f, a[1] * f, a[2] * f];
  const fract = x => x - Math.floor(x);
  function hsv(h, s, v) { h = fract(h) * 6; const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6]; return [r * 255, g * 255, b * 255]; }

  /* ---------- біоми (id 0–14 незмінні, нові додаються) ---------- */
  const BIOMES = [
    { id: 0, name: 'Глибокий океан', c: [18, 48, 110] }, { id: 1, name: 'Мілководдя', c: [44, 112, 170] }, { id: 2, name: 'Лід і сніг', c: [236, 243, 250] },
    { id: 3, name: 'Тундра', c: [150, 160, 140] }, { id: 4, name: 'Тайга', c: [58, 98, 70] }, { id: 5, name: 'Луки', c: [118, 168, 80] },
    { id: 6, name: 'Ліс', c: [48, 118, 58] }, { id: 7, name: 'Пустеля', c: [214, 182, 118] }, { id: 8, name: 'Савана', c: [176, 164, 84] },
    { id: 9, name: 'Джунглі', c: [28, 112, 60] }, { id: 10, name: 'Гори', c: [126, 118, 112] }, { id: 11, name: 'Засніжені піки', c: [226, 230, 236] },
    { id: 12, name: 'Пляж', c: [226, 210, 160] }, { id: 13, name: 'Лава', c: [255, 110, 30] }, { id: 14, name: 'Вулканічна порода', c: [52, 40, 40] },
  ];
  const B = (name, c) => (BIOMES.push({ id: BIOMES.length, name, c }), BIOMES.length - 1);

  /* ---------- рідини: глибока й мілка частини, блиск, власне світіння ---------- */
  const LIQ = {
    water: { name: 'Вода', deep: 0, shallow: 1, shine: 1 },
    lava: { name: 'Лава', deep: B('Магмове море', [205, 52, 12]), shallow: 13, shine: .2, glow: .9 },
    methane: { name: 'Метан', deep: B('Метанове озеро', [58, 40, 26]), shallow: B('Етанова мілина', [112, 76, 42]), shine: .7 },
    murk: { name: 'Болотна вода', deep: B('Каламутна вода', [52, 78, 54]), shallow: B('Болотна твань', [96, 120, 64]), shine: .35 },
    molten: { name: 'Розплав', deep: B('Озеро розплаву', [230, 120, 40]), shallow: B('Розпечений метал', [255, 190, 90]), shine: .5, glow: .8 },
    basalt: { name: 'Темні моря', deep: B('Базальтове море', [58, 58, 66]), shallow: B('Базальтова рівнина', [92, 92, 100]), shine: 0 },
    ichor: { name: 'Лімфа', deep: B('Лімфатичне море', [128, 28, 62]), shallow: B('Мілка лімфа', [190, 76, 104]), shine: .6, glow: .15 },
    poison: { name: 'Отруєна вода', deep: B('Отруйне море', [70, 96, 40]), shallow: B('Токсична мілина', [130, 150, 70]), shine: .4 },
    glowsea: { name: 'Світний океан', deep: B('Світний океан', [8, 70, 110]), shallow: B('Світна мілина', [30, 200, 190]), shine: .5, glow: 1 },
    choco: { name: 'Шоколад', deep: B('Шоколадне море', [86, 48, 34]), shallow: B('Какао-мілина', [150, 92, 62]), shine: .8 },
    spores: { name: 'Спорова імла', deep: B('Спорове озеро', [88, 40, 110]), shallow: B('Спорова мілина', [150, 90, 170]), shine: .4, glow: .25 },
    stormsea: { name: 'Штормове море', deep: B('Штормове море', [22, 38, 56]), shallow: B('Піна штормів', [92, 112, 130]), shine: .55 },
    resin: { name: 'Смола', deep: B('Смоляне озеро', [110, 62, 16]), shallow: B('Тягуча смола', [188, 120, 36]), shine: .9 },
    mercury: { name: 'Ртуть', deep: B('Ртутне озеро', [170, 182, 200]), shallow: B('Ртутна плівка', [226, 232, 242]), shine: 1 },
  };

  /* ---------- допоміжне: опис ручок ---------- */
  // G — стандартні ручки; kn({ ключ: { l, min, max, def, f, g } }) зливає їх зі своїми. f: pct | num | int | deg | sgn. g: surf (поверхня) | sky (небо й життя)
  const G = {
    sea: { l: 'Вода', min: 0, max: 1, def: .6, f: 'pct', g: 'surf' }, scale: { l: 'Дрібність ландшафту', min: .6, max: 4, def: 1.4, f: 'num', g: 'surf' },
    mount: { l: 'Гори', min: 0, max: 1, def: .5, f: 'pct', g: 'surf' }, temp: { l: 'Клімат (холод ↔ спека)', min: -1, max: 1, def: 0, f: 'sgn', g: 'surf' },
    humid: { l: 'Вологість', min: 0, max: 1, def: .5, f: 'pct', g: 'surf' }, caps: { l: 'Полярні шапки', min: 0, max: 1, def: .5, f: 'pct', g: 'surf' },
    atmo: { l: 'Атмосфера', min: 0, max: 1, def: .6, f: 'pct', g: 'sky' }, cloud: { l: 'Хмари', min: 0, max: 1, def: .5, f: 'pct', g: 'sky' },
    lights: { l: 'Вогні міст', min: 0, max: 1, def: .4, f: 'pct', g: 'sky' }, tilt: { l: 'Нахил осі', min: 0, max: 60, def: 18, f: 'deg', g: 'sky' },
    moons: { l: 'Супутники', min: 0, max: 4, def: 1, f: 'int', g: 'sky' }, hue: { l: 'Відтінок', min: -.1, max: .1, def: 0, f: 'sgn', g: 'sky' },
  };
  function kn(o) {
    return Object.entries(o).map(([k, ov]) => { const d = Object.assign({ f: 'pct', g: 'surf' }, G[k], ov), step = d.f === 'int' || d.f === 'deg' ? 1 : .01; return { k, l: d.l, min: d.min, max: d.max, def: d.def, f: d.f, g: d.g, step }; });
  }
  const ABSENT = { sea: 0, scale: 1.4, mount: .5, temp: 0, humid: .5, caps: 0, atmo: .5, cloud: 0, lights: 0, tilt: 18, moons: 1, hue: 0 };

  /* ---------- вибір біома суходолу для земних типів ---------- */
  function landBiome(t, m, alt) {
    if (alt > .78) return t < .55 ? 11 : 10;
    if (alt > .55) return t < .3 ? 11 : 10;
    if (t < .12) return 2;
    if (t < .27) return m > .45 ? 4 : 3;
    if (t < .6) return m > .62 ? 6 : m > .3 ? 5 : 8;
    return m > .7 ? 9 : m > .4 ? 8 : 7;
  }

  /* ---------- рушії поверхні ---------- */
  // c: контекст пікселя { x,y,z, lat, la, h, alt, water, depth, t, m, capLat }, o: вихід { b, col, glow, liq, tint }, k: набір допоміжних (шум, комірки, рідина)
  const terran = spec => (c, o, p, k) => {
    const L = spec.liq || 'water';
    if (c.water) {
      k.liquid(c, o, L);
      if (spec.cap != null && p.caps > 0 && c.la > c.capLat) { o.b = spec.cap; o.col = spec.capCol || [232, 240, 248]; o.liq = 0; o.glow = 0; }
    } else {
      let b = c.alt < .015 && c.t > .25 && spec.beach !== false ? (spec.beachB == null ? 12 : spec.beachB) : spec.land(c.t, c.m, c.alt, c, p, k);
      if (spec.cap != null && p.caps > 0 && c.la > c.capLat + .1 * (1 - p.caps)) { b = spec.cap; if (spec.capCol) o.col = spec.capCol; }
      if (spec.fix) b = spec.fix(b, c);
      o.b = b; o.tint = true;
    }
    if (spec.post) spec.post(c, o, p, k);
  };
  const GASB = B('Хмарні смуги', [200, 170, 130]);
  const gasPx = spec => (c, o, p, k) => {
    const N = (f, off, w) => k.n(c, f, off, w), turb = N(3, 0) * .09 * (.4 + p.turb * 1.4) + N(8, 0) * .03 * p.turb;
    const lat = c.lat + turb, fq = p.bands, band = Math.sin(lat * fq + N(1.5, 0, 'l') * .8 * (.5 + p.turb)) + .35 * Math.sin(lat * fq * 2.2), tint = .5 + .32 * band;
    const A = spec.pal[0], Bp = spec.pal[1];
    const c1 = mixc(A[0], Bp[0], p.pal), c2 = mixc(A[1], Bp[1], p.pal), c3 = mixc(A[2], Bp[2], p.pal), kk = smooth(.25, .75, tint);
    let col = [lerp(c2[0], c1[0], kk) * .9 + c3[0] * .1, lerp(c2[1], c1[1], kk) * .9 + c3[1] * .1, lerp(c2[2], c1[2], kk) * .9 + c3[2] * .1];
    if (p.storms > 0 && N(3, 40) > 1 - .1 - p.storms * .38 && Math.abs(c.lat) < .75) { const s = spec.storm || [50, -.45, -.55]; col = [col[0] * .8 + s[0], col[1] * (1 + s[1] * .8), col[2] * (1 + s[2] * .8)]; }
    o.col = col; o.b = GASB;
  };

  /* ---------- ручки, спільні для кількох типів ---------- */
  const ATM = (a, b, d) => ({ min: a, max: b, def: d });

  const KINDS = {};
  const def = (id, o) => {
    const knobs = kn(o.knobs), base = Object.assign({}, ABSENT, o.fix || {}); for (const kb of knobs) base[kb.k] = kb.def;
    KINDS[id] = Object.assign({ id, group: 'real', name: id, style: 'sci', hab: 0, tc: [-55, 55], size: [2800, 9200], dens: [.75, 1.3], ringChance: .12, lightB: [5, 6, 8, 12], ac: [120, 170, 255], cc: [238, 240, 246], flat: false, noCloud: false }, o, { knobs, base });
  };
  const gasComp = [['Водень', 86], ['Гелій', 13], ['Метан', .8], ['Інше', .2]];

  /* ======================= РЕАЛЬНІ ТИПИ ======================= */
  def('earth', { name: 'Земного типу', group: 'real', hab: 'terran', tc: [-55, 55], ac: [110, 170, 255],
    blurb: 'Континенти, океани, ліси й полярні шапки: найближче до рідного дому.', life: 'Багата біосфера, ліси, луки й океанічні екосистеми.',
    gases: [['Азот', 77], ['Кисень', 21], ['Аргон', 1], ['Інше', 1]], res: ['Дерево', 'Родюча земля', 'Метали', 'Прісна вода'], liqName: 'Вода',
    knobs: { sea: { min: .05, max: .9, def: .48 }, scale: { min: .8, max: 3.2, def: 1.4 }, mount: {}, temp: { min: -.6, max: .8, def: .05 }, humid: { min: .1, max: 1, def: .55 }, caps: {}, atmo: { min: .3, max: 1, def: .6 }, cloud: { def: .55 }, lights: { def: .5 }, tilt: {}, moons: {}, hue: { min: -.14, max: .14 } },
    terran: { liq: 'water', cap: 2, land: landBiome } });
  KINDS.earth.px = terran(KINDS.earth.terran);

  def('ocean', { name: 'Океанічна', group: 'real', hab: 'terran', tc: [-30, 45], ac: [100, 190, 255],
    blurb: 'Суцільний світовий океан з розсипом архіпелагів.', life: 'Планктон, коралові рифи й плавучі міста.',
    gases: [['Азот', 72], ['Кисень', 26], ['Водяна пара', 1.5], ['Інше', .5]], res: ['Риба й водорості', 'Дейтерій', 'Перли', 'Прісна вода'],
    knobs: { sea: { l: 'Рівень океану', min: .78, max: .98, def: .9 }, scale: { l: 'Дрібність архіпелагів', min: 1, max: 4, def: 1.7 }, mount: { l: 'Вулканічні острови', min: 0, max: .7, def: .3 }, temp: { min: -.2, max: .8, def: .2 }, humid: { min: .5, max: 1, def: .9 }, caps: { min: 0, max: .6, def: .3 }, atmo: { min: .4, max: 1, def: .75 }, cloud: { min: .3, max: 1, def: .75 }, lights: { l: 'Плавучі міста', min: 0, max: .5, def: 0 }, tilt: {}, moons: {}, hue: { min: -.14, max: .14 } },
    terran: { liq: 'water', cap: 2, land: landBiome } });
  KINDS.ocean.px = terran(KINDS.ocean.terran);

  def('desert', { name: 'Пустельна', group: 'real', hab: 'terran', tc: [10, 90], ac: [255, 190, 120], cc: [250, 240, 225],
    blurb: 'Дюни до горизонту, рідкісні оази й розпечене небо.', life: 'Витривалі чагарі й мікроби в оазах.',
    gases: [['Діоксид вуглецю', 80], ['Азот', 17], ['Аргон', 2], ['Інше', 1]], res: ['Силікати', 'Сонячна енергія', 'Рідкісні метали', 'Сіль'],
    knobs: { sea: { l: 'Оази й солоні моря', min: 0, max: .3, def: .12 }, scale: { min: .8, max: 3, def: 1.3 }, mount: { l: 'Скелясті плато', min: .1, max: 1, def: .6 }, temp: { min: .25, max: 1, def: .6 }, humid: { l: 'Вологість оаз', min: 0, max: .3, def: .1 }, dunes: { l: 'Бархани', min: 0, max: 1, def: .5, g: 'surf' }, atmo: { min: .1, max: .8, def: .35 }, cloud: { min: 0, max: .3, def: .12 }, lights: { min: 0, max: .5, def: .15 }, tilt: {}, moons: {}, hue: { min: -.1, max: .1 } },
    terran: { liq: 'water', land: landBiome, post: (c, o, p, k) => { if (!c.water && p.dunes > 0 && o.col == null) { const s = Math.sin(c.lat * 70 + k.n(c, 2.2, 5) * 9) * .5 + .5; o.mul = 1 + (s - .5) * .32 * p.dunes; } } } });
  KINDS.desert.px = terran(KINDS.desert.terran);

  def('ice', { name: 'Крижана', group: 'real', hab: 'terran', tc: [-130, -10], ac: [170, 210, 255], cc: [235, 244, 252],
    blurb: 'Крижані рівнини з тріщинами льоду й підльодовими морями.', life: 'Мікроби під кригою й у гейзерах.',
    gases: [['Азот', 88], ['Метан', 9], ['Аргон', 2], ['Інше', 1]], res: ['Водяний лід', 'Метановий лід', 'Кристали', 'Геотермальні гейзери'],
    knobs: { sea: { l: 'Незамерзла вода', min: .05, max: .6, def: .3 }, scale: { min: .8, max: 3, def: 1.4 }, mount: { l: 'Крижані хребти', min: .1, max: 1, def: .5 }, temp: { min: -1, max: -.3, def: -.7 }, humid: { min: .1, max: .8, def: .4 }, caps: { min: .4, max: 1, def: .7 }, cracks: { l: 'Тріщини льоду', min: 0, max: 1, def: .5, g: 'surf' }, atmo: { min: .2, max: .9, def: .45 }, cloud: { min: .1, max: .7, def: .35 }, tilt: {}, moons: {}, hue: { min: -.12, max: .12 } },
    terran: { liq: 'water', cap: 2, land: landBiome, fix: (b, c) => (b !== 2 && b !== 10 && b !== 11 && c.alt > .01 ? (c.t < .3 ? 2 : b) : b),
      post: (c, o, p, k) => { if (p.cracks > 0 && !c.water && Math.abs(k.n(c, 3.5, 21, 'r')) < .012 + p.cracks * .02) { o.col = [96, 150, 196]; o.tint = false; } } } });
  KINDS.ice.px = terran(KINDS.ice.terran);

  def('lava', { name: 'Вулканічна', group: 'real', tc: [180, 620], ac: [255, 120, 70], cc: [70, 60, 58], style: 'harsh', size: [2400, 9000],
    blurb: 'Чорна кора, пронизана розпеченими розломами та озерами лави.', life: 'Життя неможливе. Лише термофільні мінерали.',
    gases: [['Діоксид сірки', 45], ['Діоксид вуглецю', 40], ['Азот', 13], ['Інше', 2]], res: ['Рідкі метали', 'Сірка', 'Геотермальна енергія', 'Обсидіан'], liqName: 'Лава',
    fix: { temp: 1 },
    knobs: { sea: { l: 'Лавові озера й моря', min: 0, max: .7, def: .22 }, scale: { min: .8, max: 3.5, def: 1.8 }, mount: { l: 'Вулканічні гори', min: .3, max: 1, def: .85 }, veins: { l: 'Жили розплаву', min: 0, max: 1, def: .5, g: 'surf' }, heat: { l: 'Жар (світіння)', min: .2, max: 1, def: .75, g: 'surf' }, atmo: { min: .3, max: 1, def: .7 }, cloud: { l: 'Попіл у небі', min: 0, max: .85, def: .3 }, tilt: {}, moons: { min: 0, max: 3, def: 0 }, hue: { min: -.08, max: .08 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'lava'); o.glow = 255 * p.heat * (.7 + .3 * (1 - c.depth)); return; }
      const veins = Math.abs(k.n(c, 5, 3, 'r')), hot = veins < .02 + p.veins * .075 || (c.alt > .55 && k.n(c, 8, 0) > .5 - p.veins * .2);
      if (hot) { o.b = 13; o.glow = 255 * p.heat; o.col = mulc([255, 110, 30], .85 + .3 * (k.n(c, 12, 2) * .5 + .5)); }
      else { o.b = k.n(c, 4, 80) > .35 ? ASHB : 14; const sh = .8 + (k.n(c, 18, 0) * .5 + .5) * .5; o.col = mulc(BIOMES[o.b].c, sh); }
    } });
  const ASHB = B('Вулканічний попіл', [86, 78, 74]);

  const gasKnobs = (pal, bands, turbDef, stormDef) => ({ pal: { l: pal, min: 0, max: 1, def: .4, f: 'pct', g: 'surf' }, bands: { l: 'Кількість смуг', min: bands[0], max: bands[1], def: bands[2], f: 'int', g: 'surf' }, turb: { l: 'Турбулентність', min: 0, max: 1, def: turbDef, f: 'pct', g: 'surf' }, storms: { l: 'Урагани й плями', min: 0, max: 1, def: stormDef, f: 'pct', g: 'surf' } });
  def('gas', { name: 'Газовий гігант', group: 'real', flat: true, noCloud: true, ringChance: .75, tc: [-190, -90], size: [22000, 70000], dens: [.2, .35], ac: [210, 190, 150],
    blurb: 'Смугасті хмарні шари, вихори й вічні урагани. Твердої поверхні немає.', life: 'Гіпотетичні літаючі мікроорганізми у хмарах.',
    gases: gasComp, res: ['Гелій-3', 'Водень', 'Рідкий метан', 'Екзотичні ізотопи'],
    knobs: Object.assign(gasKnobs('Палітра (бурштин ↔ блакить)', [6, 40, 21], .5, .35), { atmo: { min: .6, max: 1, def: 1 }, tilt: {}, moons: { min: 1, max: 4, def: 3 }, hue: { min: -.12, max: .12 } }),
    px: gasPx({ pal: [[[226, 202, 160], [186, 142, 98], [214, 176, 130]], [[170, 196, 214], [110, 140, 176], [200, 216, 226]]] }) });

  def('icegiant', { name: 'Крижаний гігант', group: 'real', flat: true, noCloud: true, ringChance: .5, tc: [-230, -190], size: [14000, 32000], dens: [.5, .8], ac: [130, 200, 255],
    blurb: 'Бірюзові й індигові шари з метаном та діамантовим дощем у надрах.', life: 'Невідоме. Умови надто екстремальні.',
    gases: [['Водень', 80], ['Гелій', 18], ['Метан', 2]], res: ['Аміачний лід', 'Метановий лід', 'Алмазний пил', 'Дейтерій'],
    knobs: Object.assign(gasKnobs('Колір (бірюза ↔ індиго)', [3, 22, 9], .25, .25), { atmo: { min: .6, max: 1, def: .9 }, tilt: { min: 0, max: 98, def: 30 }, moons: { min: 1, max: 4, def: 2 }, hue: { min: -.12, max: .12 } }),
    px: gasPx({ pal: [[[150, 220, 235], [80, 150, 200], [190, 235, 245]], [[110, 130, 230], [50, 70, 170], [150, 170, 240]]], storm: [-30, -.5, -.3] }) });

  const MARS = { rust: B('Іржавий реголіт', [176, 92, 56]), dark: B('Базальтові рівнини', [96, 58, 48]), dust: B('Світлий пил', [214, 152, 112]), frost: B('Полярний іній', [240, 228, 222]) };
  def('mars', { name: 'Марсіанська', group: 'real', hab: 'terran', tc: [-110, 20], ac: [230, 160, 120], cc: [240, 220, 205], size: [2200, 5200], dens: [.8, 1.1],
    blurb: 'Іржаві рівнини, гігантські каньйони й пилові бурі. Колись тут були моря.', life: 'Можливі сліди давніх мікробів.',
    gases: [['Діоксид вуглецю', 95], ['Азот', 3], ['Аргон', 1.8], ['Інше', .2]], res: ['Залізна руда', 'Підземний лід', 'Перхлорати', 'Базальт'], liqName: 'Давні моря',
    knobs: { sea: { l: 'Давні моря', min: 0, max: .25, def: 0 }, scale: { min: .8, max: 3, def: 1.5 }, mount: { l: 'Вулкани й хребти', min: .2, max: 1, def: .6 }, temp: { min: -.8, max: .3, def: -.3 }, humid: { l: 'Запиленість', min: 0, max: 1, def: .45 }, caps: { min: 0, max: .8, def: .35 }, canyon: { l: 'Каньйони', min: 0, max: 1, def: .5, g: 'surf' }, atmo: { min: .05, max: .45, def: .2 }, cloud: { min: 0, max: .35, def: .1 }, tilt: {}, moons: { min: 0, max: 3, def: 2 }, hue: { min: -.1, max: .1 } },
    terran: { liq: 'water', cap: MARS.frost, beach: false, land: (t, m, alt) => (alt > .72 ? 10 : m > .62 ? MARS.dust : m < .3 ? MARS.dark : MARS.rust),
      post: (c, o, p, k) => { if (!c.water && p.canyon > 0 && Math.abs(k.n(c, 2.4, 61, 'r')) < .012 + p.canyon * .02) { o.b = MARS.dark; o.col = mulc(BIOMES[MARS.dark].c, .65); o.tint = false; } } } });
  KINDS.mars.px = terran(KINDS.mars.terran);

  const VEN = { plain: B('Сірчані рівнини', [196, 150, 72]), high: B('Тессери', [134, 98, 62]), plat: B('Світлі плато', [230, 196, 110]) };
  def('venus', { name: 'Венеріанська', group: 'real', tc: [380, 520], ac: [255, 215, 130], cc: [238, 214, 150], size: [5000, 8000],
    blurb: 'Вічні сірчані хмари, тиск як на дні океану й розпечена поверхня під ними.', life: 'Життя неможливе. Можливі мікроби у хмарах.',
    gases: [['Діоксид вуглецю', 96], ['Азот', 3.5], ['Діоксид сірки', .4], ['Інше', .1]], res: ['Сірка', 'Рідкісні метали', 'Геотермальна енергія', 'Кислотні хмари'],
    knobs: { scale: { min: .8, max: 3, def: 1.3 }, mount: { l: 'Плато й вулкани', min: .1, max: 1, def: .5 }, sulfur: { l: 'Сірчаність', min: 0, max: 1, def: .5, g: 'surf' }, atmo: { min: .8, max: 1, def: .95 }, cloud: { l: 'Хмарний покрив', min: .75, max: 1, def: .95 }, tilt: { min: 0, max: 10, def: 3 }, moons: { min: 0, max: 1, def: 0 }, hue: { min: -.08, max: .08 } },
    px: (c, o, p, k) => { o.b = c.alt > .6 ? VEN.high : c.alt > .3 && c.m > .5 ? VEN.plat : VEN.plain; o.col = mixc(BIOMES[o.b].c, [235, 205, 80], p.sulfur * .45); o.col = mulc(o.col, .85 + (k.n(c, 20, 0) * .5 + .5) * .3); } });

  const MOON = { reg: B('Реголіт', [150, 148, 142]), rim: B('Кратерні вали', [196, 194, 188]), floor: B('Дно кратерів', [104, 102, 100]) };
  def('moon', { name: 'Кам’яниста (місячна)', group: 'real', tc: [-170, 120], ac: [200, 200, 210], size: [1200, 3600], dens: [.6, 1], ringChance: .02,
    blurb: 'Мертва кам’яна куля без повітря, вкрита кратерами й темними базальтовими морями.', life: 'Життя неможливе. Відкрита поверхня без захисту.',
    gases: [['Гелій', 40], ['Неон', 40], ['Аргон', 15], ['Інше', 5]], res: ['Гелій-3', 'Реголіт', 'Титан', 'Підземний лід'], liqName: 'Темні моря',
    knobs: { sea: { l: 'Темні базальтові моря', min: 0, max: .6, def: .25 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { l: 'Гори', min: 0, max: .8, def: .3 }, craters: { l: 'Кратерність', min: .1, max: 1, def: .6, g: 'surf' }, atmo: { min: 0, max: .12, def: 0 }, tilt: { min: 0, max: 30, def: 6 }, moons: { min: 0, max: 2, def: 0 }, hue: { min: -.08, max: .08 } },
    px: (c, o, p, k) => {
      let sh = 1, b = MOON.reg;
      for (let s = 0; s < 2; s++) {
        const cl = k.cell(c, s ? 12 : 4.5, 3 + s), dens = p.craters * (s ? .8 : .55), rr = .18 + cl.r * .3;
        if (cl.r2 < dens) { const d = cl.d1 / rr; if (d < 1) { const rim = smooth(.7, 1, d); sh *= d < .85 ? .82 + .18 * d : 1.22 - (1 - rim) * .1; b = d < .85 ? MOON.floor : MOON.rim; } else if (d < 1.25) sh *= 1.08; }
      }
      if (c.water) { k.liquid(c, o, 'basalt'); o.col = mulc(o.col, sh * .95); o.tint = false; return; }
      o.b = b; o.col = mulc(mixc(BIOMES[MOON.reg].c, [128, 124, 118], smooth(.3, .9, c.alt)), sh * (.9 + (k.n(c, 24, 0) * .5 + .5) * .2));
    } });

  const TIT = { dune: B('Органічні дюни', [132, 86, 40]), ice: B('Оранжевий лід', [196, 138, 76]), dark: B('Темні дюни', [68, 48, 34]) };
  def('titan', { name: 'Титаноподібна', group: 'real', tc: [-190, -150], ac: [230, 150, 60], cc: [214, 150, 80], size: [2400, 6000], dens: [.8, 1.1],
    blurb: 'Оранжевий смог, метанові дощі й озера вуглеводнів під гущавиною атмосфери.', life: 'Гіпотетична екзотична біохімія в метанових озерах.',
    gases: [['Азот', 95], ['Метан', 4.9], ['Водень', .1]], res: ['Вуглеводні', 'Метановий лід', 'Органічні сполуки', 'Водяний лід'], liqName: 'Метан',
    knobs: { sea: { l: 'Метанові озера', min: .08, max: .6, def: .3 }, scale: { min: .8, max: 3.2, def: 1.5 }, mount: { l: 'Крижані гори', min: 0, max: .8, def: .35 }, humid: { l: 'Темні дюни', min: 0, max: 1, def: .45 }, atmo: { min: .8, max: 1, def: .95 }, cloud: { l: 'Оранжевий смог', min: .5, max: 1, def: .8 }, tilt: {}, moons: { min: 0, max: 2, def: 0 }, hue: { min: -.1, max: .1 } },
    terran: { liq: 'methane', beach: false, land: (t, m, alt) => (alt > .6 ? TIT.ice : m > .55 ? TIT.dark : TIT.dune) } });
  KINDS.titan.px = terran(KINDS.titan.terran);

  const SW = { bog: B('Болото', [70, 92, 56]), mang: B('Мангровий ліс', [38, 84, 52]), fog: B('Заплави', [104, 130, 76]) };
  def('swamp', { name: 'Болотяна', group: 'real', hab: 'terran', tc: [10, 50], ac: [150, 190, 120], cc: [210, 225, 200], style: 'soft',
    blurb: 'Нескінченні болота, мангрові ліси й туман над теплою водою.', life: 'Буйна вегетація, земноводні, комахи-велетні.',
    gases: [['Азот', 70], ['Кисень', 18], ['Метан', 6], ['Водяна пара', 5], ['Інше', 1]], res: ['Торф', 'Метан', 'Лікарські рослини', 'Прісна вода'], liqName: 'Болотна вода',
    knobs: { sea: { l: 'Болотна вода', min: .3, max: .75, def: .5 }, scale: { min: 1, max: 4, def: 2 }, mount: { l: 'Пагорби', min: 0, max: .5, def: .15 }, temp: { min: 0, max: .8, def: .3 }, humid: { min: .6, max: 1, def: .9 }, atmo: { min: .5, max: 1, def: .75 }, cloud: { l: 'Туман', min: .3, max: 1, def: .65 }, lights: { min: 0, max: .5, def: .1 }, tilt: {}, moons: {}, hue: { min: -.12, max: .12 } },
    terran: { liq: 'murk', beach: false, land: (t, m, alt) => { m += (t - .5) * .4; return alt > .65 ? 10 : alt < .12 ? SW.bog : m > .6 ? SW.mang : m > .4 ? SW.fog : 6; } } });
  KINDS.swamp.px = terran(KINDS.swamp.terran);

  const JU = { fern: B('Папороті', [56, 140, 70]), orchid: B('Орхідейні гаї', [96, 150, 100]) };
  def('jungle', { name: 'Джунглева', group: 'real', hab: 'terran', tc: [15, 50], ac: [120, 200, 140], cc: [235, 242, 235], style: 'soft',
    blurb: 'Суцільний тропічний ліс, ріки й вологі хмари над кронами.', life: 'Надзвичайно багата біосфера, мільйони видів.',
    gases: [['Азот', 74], ['Кисень', 24], ['Водяна пара', 1.5], ['Інше', .5]], res: ['Тропічна деревина', 'Ліки з рослин', 'Біомаса', 'Прісна вода'],
    knobs: { sea: { l: 'Річки й моря', min: .2, max: .6, def: .35 }, scale: { min: .8, max: 3, def: 1.5 }, mount: { min: 0, max: .8, def: .4 }, temp: { min: .1, max: .9, def: .5 }, humid: { min: .6, max: 1, def: .88 }, atmo: { min: .5, max: 1, def: .8 }, cloud: { min: .4, max: 1, def: .7 }, lights: { min: 0, max: .6, def: .2 }, tilt: {}, moons: {}, hue: { min: -.14, max: .14 } },
    terran: { liq: 'water', land: (t, m, alt) => (alt > .72 ? (t < .5 ? 11 : 10) : m > .78 ? 9 : m > .55 ? JU.fern : m > .4 ? JU.orchid : 6) } });
  KINDS.jungle.px = terran(KINDS.jungle.terran);

  const MET = { iron: B('Залізна кора', [120, 118, 122]), rust: B('Іржа', [150, 88, 58]), chrome: B('Хромовані рівнини', [190, 196, 208]), ore: B('Рудні жили', [214, 168, 78]) };
  def('metal', { name: 'Металева', group: 'real', tc: [-60, 300], ac: [190, 200, 220], cc: [190, 195, 205], style: 'harsh', size: [2000, 7000], dens: [1.4, 2.2], ringChance: .1,
    blurb: 'Оголене залізо-нікелеве ядро: хромовані рівнини, іржаві плями й рудні жили.', life: 'Життя неможливе. Можливі машинні форми.',
    gases: [['Аргон', 50], ['Азот', 30], ['Діоксид вуглецю', 18], ['Інше', 2]], res: ['Залізо', 'Нікель', 'Платиноїди', 'Золото'], liqName: 'Розплав',
    knobs: { sea: { l: 'Озера розплаву', min: 0, max: .35, def: 0 }, scale: { min: .8, max: 3.5, def: 1.8 }, mount: { l: 'Гори й уступи', min: .1, max: 1, def: .5 }, humid: { l: 'Іржавість', min: 0, max: 1, def: .4 }, ore: { l: 'Рудні жили', min: 0, max: 1, def: .5, g: 'surf' }, atmo: { min: 0, max: .4, def: .1 }, cloud: { min: 0, max: .25, def: 0 }, tilt: {}, moons: { min: 0, max: 3, def: 1 }, hue: { min: -.1, max: .1 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'molten'); return; }
      let b = c.alt > .62 ? MET.chrome : c.m > .62 ? MET.rust : MET.iron;
      if (p.ore > 0 && Math.abs(k.n(c, 6, 17, 'r')) < .012 + p.ore * .02) b = MET.ore;
      o.b = b; o.tint = true;
      if (b === MET.ore) o.glow = 40 * p.ore;
    } });

  /* ======================= ФАНТАСТИЧНІ ТИПИ ======================= */
  const FL = { abyss: B('Небесна безодня', [60, 108, 196]), haze: B('Хмарне море', [196, 220, 244]), rock: B('Скеля острова', [128, 104, 86]), bridge: B('Мости', [170, 124, 80]) };
  def('floating', { name: 'Літаючі острови', group: 'fantasy', style: 'fan', hab: { fixed: [60, 95] }, tc: [-5, 30], ac: [140, 200, 255], cc: [250, 250, 255], liqName: 'Безодня', lightB: [5, 6, 8, 11],
    blurb: 'Тисячі острівців парять над хмарною безоднею, а між ними натягнуті мости.', life: 'Повітряні екосистеми, острівні поселення й літаючі кити.',
    gases: [['Азот', 72], ['Кисень', 24], ['Етер', 3], ['Інше', 1]], res: ['Левітаційні кристали', 'Хмарна вода', 'Острівні ліси', 'Небесна руда'],
    derive: p => ({ sea: lerp(.88, .4, p.isl) }),
    knobs: { isl: { l: 'Кількість островів', min: .05, max: 1, def: .5, g: 'surf' }, scale: { l: 'Дрібність островів', min: .8, max: 3.8, def: 1.6 }, elev: { l: 'Висота островів', min: 0, max: 1, def: .5, g: 'surf' }, bridge: { l: 'Мости між островами', min: 0, max: 1, def: .5, g: 'surf' }, temp: { min: -.5, max: .7, def: .1 }, humid: { l: 'Зелень на островах', min: .1, max: 1, def: .6 }, atmo: { min: .4, max: 1, def: .8 }, cloud: { min: .2, max: 1, def: .6 }, lights: { l: 'Поселення', min: 0, max: 1, def: .5 }, tilt: {}, moons: {}, hue: { min: -.25, max: .25 } },
    px: (c, o, p, k) => {
      if (c.water) {
        if (p.bridge > 0 && c.depth < .3 && Math.abs(k.n(c, 2.3, 31, 'r')) < .008 + p.bridge * .02) { o.b = FL.bridge; o.col = mulc(BIOMES[FL.bridge].c, .9 + k.n(c, 40, 0) * .15); return; }
        const d = smooth(0, 1, c.depth); o.b = c.depth > .55 ? FL.abyss : FL.haze; o.col = mixc(BIOMES[FL.haze].c, BIOMES[FL.abyss].c, d); return;
      }
      const alt = clamp(c.alt * (.4 + p.elev * 1.2), 0, 1); o.tint = true;
      if (c.alt < .1) { o.b = FL.rock; o.col = mulc(BIOMES[FL.rock].c, .7 + c.alt * 3); return; }
      if (alt > .8 && c.t < .6) o.b = 11; else if (alt > .6) o.b = 10; else { const mm = c.m - (c.t - .5) * .5; o.b = mm > .6 ? 6 : mm > .35 ? 5 : 8; }
    } });

  const CR = [B('Аметистові поля', [150, 90, 200]), B('Кварцові плато', [210, 225, 240]), B('Смарагдові друзи', [60, 200, 150]), B('Рубінові жили', [220, 60, 90]), B('Сапфірові грані', [70, 110, 230])];
  def('crystal', { name: 'Кристалічна', group: 'fantasy', style: 'fan', hab: { fixed: [0, 12] }, tc: [-80, 60], ac: [190, 150, 255], cc: [230, 225, 255],
    blurb: 'Поверхня з гігантських кристалічних граней, що світяться зсередини.', life: 'Кремнієві форми життя, що ростуть, як друзи.',
    gases: [['Аргон', 50], ['Азот', 30], ['Неон', 15], ['Інше', 5]], res: ['Енергетичні кристали', 'Рідкісні землі', 'Алмази', 'Кварц'],
    knobs: { size: { l: 'Розмір кристалів', min: 0, max: 1, def: .5, g: 'surf' }, glow: { l: 'Світіння', min: 0, max: 1, def: .4, g: 'surf' }, variety: { l: 'Різнобарв’я', min: 0, max: 1, def: .6, g: 'surf' }, atmo: { min: 0, max: .7, def: .3 }, cloud: { l: 'Кришталевий серпанок', min: 0, max: .45, def: .12 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      const cl = k.cell(c, lerp(11, 3, p.size), 7), edge = cl.d2 - cl.d1, nCol = 1 + Math.floor(p.variety * 4.99), b = CR[Math.floor(cl.r * nCol) % 5], facet = .62 + fract(cl.r * 13.7) * .6;
      o.b = b; let col = mulc(BIOMES[b].c, facet);
      if (edge < .07) { col = mixc(col, [255, 255, 255], .55 * (1 - edge / .07)); o.glow = 255 * p.glow; } else if (fract(cl.r * 31.1) < .3) o.glow = 150 * p.glow;
      o.col = col;
    } });

  const LV = { flesh: B('М’ясиста рівнина', [188, 98, 108]), vein: B('Пульсуючі жили', [214, 52, 72]), spore: B('Спорові ліси', [108, 150, 62]), mem: B('Слизова мембрана', [226, 172, 152]) };
  def('living', { name: 'Жива', group: 'fantasy', style: 'soft', hab: { fixed: [15, 70] }, tc: [20, 45], ac: [230, 120, 140], cc: [240, 200, 205], liqName: 'Лімфа',
    blurb: 'Планета — єдиний гігантський організм: жили, мембрани й спорові ліси.', life: 'Сама планета жива. Мільярди симбіотів на її шкірі.',
    gases: [['Азот', 60], ['Кисень', 18], ['Метан', 12], ['Аміак', 8], ['Інше', 2]], res: ['Біомаса', 'Ферменти', 'Стовбурові клітини', 'Органічний метал'],
    knobs: { sea: { l: 'Лімфатичні моря', min: 0, max: .5, def: .2 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { l: 'Горби й складки', min: 0, max: 1, def: .5 }, veins: { l: 'Жили', min: .1, max: 1, def: .5, g: 'surf' }, spore: { l: 'Спорові ліси', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: .3, max: 1, def: .6 }, cloud: { l: 'Спорова імла', min: 0, max: .8, def: .3 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'ichor'); return; }
      const v = Math.abs(k.n(c, 4, 3, 'r'));
      if (v < .02 + p.veins * .05) { o.b = LV.vein; o.col = mulc(BIOMES[LV.vein].c, .9 + .2 * k.n(c, 14, 0)); o.glow = 70 * p.veins; return; }
      if (k.n(c, 3, 11) > .5 - p.spore * .9) o.b = LV.spore; else o.b = c.alt > .5 ? LV.mem : LV.flesh; o.tint = true;
    } });

  const RU = { dry: B('Висохла земля', [150, 124, 94]), city: B('Уламки міст', [112, 106, 100]), road: B('Давні шосе', [68, 66, 70]), over: B('Зарості на руїнах', [70, 102, 60]), war: B('Кратери війни', [60, 54, 52]) };
  def('ruin', { name: 'Планета-руїна', group: 'fantasy', style: 'harsh', hab: { fixed: [8, 32] }, tc: [-10, 40], ac: [190, 170, 150], cc: [190, 180, 170], liqName: 'Отруєна вода', lightB: [RU.city, RU.road],
    blurb: 'Колись тут була цивілізація: уламки мегаполісів, шосе й кратери давньої війни.', life: 'Мутанти, рослини, що вростають у руїни, та автоматони.',
    gases: [['Азот', 74], ['Кисень', 18], ['Діоксид вуглецю', 6], ['Інше', 2]], res: ['Давні технології', 'Сталь із руїн', 'Артефакти', 'Енергоядра'],
    knobs: { sea: { l: 'Залишки морів', min: 0, max: .4, def: .15 }, scale: { min: .8, max: 3, def: 1.4 }, mount: { min: 0, max: .7, def: .3 }, ruins: { l: 'Площа руїн', min: .1, max: 1, def: .55, g: 'surf' }, over: { l: 'Зарослість', min: 0, max: 1, def: .3, g: 'surf' }, war: { l: 'Кратери війни', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: .2, max: .9, def: .5 }, cloud: { min: 0, max: .7, def: .3 }, lights: { l: 'Залишкові вогні', min: 0, max: .6, def: .2 }, tilt: {}, moons: {}, hue: { min: -.2, max: .2 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'poison'); return; }
      const ph = Math.atan2(c.z, c.x), gx = Math.abs(fract(ph * 22 / Math.PI) - .5), gy = Math.abs(fract(c.lat * 22 / Math.PI) - .5), zone = k.n(c, 2.6, 17, 'm') > .45 - p.ruins * .95;
      let b = RU.dry;
      if (zone) { const road = gx > .43 || gy > .43; b = road ? RU.road : RU.city; o.col = mulc(BIOMES[b].c, .75 + fract(Math.sin(Math.floor(ph * 22 / Math.PI) * 12.9 + Math.floor(c.lat * 22 / Math.PI) * 78.2) * 43758.5) * .5); }
      if (p.over > 0 && k.n(c, 6, 4) > .5 - p.over * .9) { b = RU.over; o.col = null; }
      if (p.war > 0) { const cl = k.cell(c, 7, 9); if (cl.r2 < p.war * .6 && cl.d1 < .22) { b = RU.war; o.col = null; } }
      o.b = b; o.tint = true;
    } });

  const BL = { moss: B('Темний мох', [18, 40, 52]), flora: B('Світні гриби', [60, 230, 200]), neon: B('Неонові ліси', [140, 70, 230]) };
  def('biolum', { name: 'Біолюмінесцентна', group: 'fantasy', style: 'fan', hab: { fixed: [25, 65] }, tc: [5, 35], ac: [70, 220, 210], cc: [150, 220, 230], liqName: 'Світний океан', lightB: [],
    blurb: 'Вночі вона сяє: океани й ліси випромінюють холодне біолюмінесцентне світло.', life: 'Світні мікроорганізми, медузи-велетні та неонові ліси.',
    gases: [['Азот', 70], ['Кисень', 22], ['Діоксид вуглецю', 6], ['Інше', 2]], res: ['Люциферин', 'Світні спори', 'Рідке світло', 'Морські кристали'],
    knobs: { sea: { l: 'Світний океан', min: .3, max: .9, def: .6 }, scale: { min: .8, max: 3.5, def: 1.8 }, mount: { min: 0, max: .6, def: .25 }, glow: { l: 'Яскравість світіння', min: .2, max: 1, def: .7, g: 'surf' }, flora: { l: 'Щільність флори', min: .1, max: 1, def: .5, g: 'surf' }, atmo: { min: .3, max: 1, def: .7 }, cloud: { l: 'Світний туман', min: 0, max: .7, def: .3 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'glowsea'); o.glow = 255 * p.glow * (.35 + .65 * (1 - c.depth) * (.6 + .4 * k.n(c, 10, 0))); return; }
      o.b = BL.moss; o.col = mulc(BIOMES[BL.moss].c, .8 + (k.n(c, 20, 0) * .5 + .5) * .5);
      if (k.n(c, 6, 11) > .45 - p.flora * .9) { const neon = k.n(c, 2, 5) > 0; o.b = neon ? BL.neon : BL.flora; o.col = BIOMES[o.b].c.slice(); o.glow = 255 * p.glow * (.6 + .4 * k.n(c, 18, 0)); }
    } });

  const RG = { rock: B('Кільцева скеля', [170, 140, 110]), dust: B('Крижаний пил', [214, 218, 224]) };
  def('ringed', { name: 'Кільцева', group: 'fantasy', style: 'fan', ringChance: 1, hab: { fixed: [5, 30] }, tc: [-80, 30], ac: [220, 200, 255], cc: [240, 236, 255],
    blurb: 'Крижано-скельний світ із величезною системою кілець, що перетинають небо.', life: 'Мікробні колонії на крижаних скелях.',
    gases: [['Азот', 80], ['Метан', 10], ['Аргон', 8], ['Інше', 2]], res: ['Кільцевий лід', 'Рідкісні метали', 'Кристали', 'Водень'],
    knobs: { scale: { min: .8, max: 3.2, def: 1.5 }, mount: { min: .1, max: 1, def: .5 }, temp: { min: -1, max: .3, def: -.4 }, humid: { l: 'Крижаний пил', min: 0, max: 1, def: .5 }, ringw: { l: 'Ширина кілець', min: .15, max: 1, def: .7, g: 'sky' }, ringd: { l: 'Густина кілець', min: .25, max: 1, def: .7, g: 'sky' }, atmo: { min: 0, max: .6, def: .25 }, cloud: { min: 0, max: .5, def: .15 }, tilt: { min: 0, max: 60, def: 26 }, moons: { min: 0, max: 4, def: 2 }, hue: { min: -.4, max: .4 } },
    px: (c, o, p, k) => { o.b = c.m + (.5 - c.t) * .5 > .55 ? RG.dust : c.alt > .6 ? 10 : RG.rock; o.tint = true; if (c.alt > .78) o.b = 11; } });

  const TU = { shell: B('Щиток панцира', [108, 120, 72]), groove: B('Борозна між щитками', [50, 44, 34]), moss: B('Мох на панцирі', [66, 132, 62]), bone: B('Кістяні гребені', [204, 192, 160]) };
  def('turtle', { name: 'Планета-черепаха', group: 'fantasy', style: 'soft', hab: { fixed: [40, 80] }, tc: [5, 35], ac: [150, 200, 140], cc: [230, 240, 225], liqName: 'Озера',
    blurb: 'Космічна черепаха: рельєфні щитки панциря, між якими течуть ріки й озера.', life: 'Мохові ліси на панцирі й мешканці щитків.',
    gases: [['Азот', 74], ['Кисень', 21], ['Аргон', 4], ['Інше', 1]], res: ['Кістка панцира', 'Мох-цілитель', 'Прісна вода', 'Давня руда'],
    hmod: (h, c, p, k) => { const cl = k.cell(c, lerp(8, 2.4, p.plate), 5); return (1 - cl.d1 * 1.15) * .8 + h * .25 - (cl.d2 - cl.d1 < .05 + p.groove * .12 ? .35 : 0); },
    knobs: { sea: { l: 'Озера й ріки в борознах', min: 0, max: .4, def: .15 }, mount: { l: 'Рельєф щитків', min: 0, max: 1, def: .5 }, plate: { l: 'Розмір щитків', min: 0, max: 1, def: .5, g: 'surf' }, groove: { l: 'Глибина борозен', min: 0, max: 1, def: .5, g: 'surf' }, humid: { l: 'Мох на панцирі', min: .1, max: 1, def: .55 }, atmo: { min: .3, max: 1, def: .6 }, cloud: { min: 0, max: .8, def: .4 }, tilt: {}, moons: {}, hue: { min: -.3, max: .3 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'water'); return; }
      const cl = k.cell(c, lerp(8, 2.4, p.plate), 5), edge = cl.d2 - cl.d1;
      if (edge < .05 + p.groove * .12 || c.alt < .05) { o.b = TU.groove; o.col = mulc(BIOMES[TU.groove].c, .8 + edge * 3); return; }
      o.b = c.alt > .82 ? TU.bone : c.m + (k.n(c, 7, 3) * .3) > .55 ? TU.moss : TU.shell; o.col = mulc(BIOMES[o.b].c, .85 + fract(cl.r * 17.3) * .3); o.tint = true;
    } });

  const CA = { cotton: B('Цукрова вата', [250, 170, 212]), caramel: B('Карамель', [212, 142, 62]), mint: B('М’ятний льодяник', [150, 232, 204]), glaze: B('Глазур', [255, 245, 238]), sand: B('Цукровий пісок', [248, 232, 204]) };
  def('candy', { name: 'Цукеркова', group: 'fantasy', style: 'soft', hab: { fixed: [55, 90] }, tc: [10, 35], ac: [255, 170, 220], cc: [255, 214, 236], liqName: 'Шоколад',
    blurb: 'Ріки шоколаду, цукрова вата й карамельні гори з льодяниковими смужками.', life: 'Цукрові звірята й карамельні дерева.',
    gases: [['Азот', 70], ['Кисень', 22], ['Ванільні пари', 6], ['Інше', 2]], res: ['Цукор', 'Какао', 'Ваніль', 'Карамельна руда'],
    knobs: { sea: { l: 'Шоколадні ріки', min: 0, max: .6, def: .25 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { l: 'Карамельні скелі', min: 0, max: .8, def: .35 }, humid: { l: 'Смак (карамель ↔ м’ята)', min: 0, max: 1, def: .5 }, caps: { l: 'Глазур на полюсах', min: 0, max: 1, def: .5 }, stripes: { l: 'Льодяникові смужки', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: .3, max: 1, def: .6 }, cloud: { l: 'Цукрова вата', min: 0, max: .8, def: .4 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    terran: { liq: 'choco', cap: CA.glaze, beach: true, beachB: CA.sand, land: (t, m, alt) => (alt > .7 ? CA.glaze : m > .62 ? CA.mint : m > .38 ? CA.cotton : CA.caramel),
      post: (c, o, p, k) => { if (!c.water && p.stripes > 0) { const s = Math.sin((c.lat * 26 + k.n(c, 1.6, 4) * 5)) > .35; if (s) { o.col = mixc(BIOMES[o.b].c, [255, 255, 255], .5 * p.stripes); o.tint = false; } } } } });
  KINDS.candy.px = terran(KINDS.candy.terran);

  const TE = { city: B('Мегаполіс', [112, 118, 134]), ind: B('Промзона', [92, 86, 82]), road: B('Магістралі', [58, 60, 68]), core: B('Енергополя', [80, 200, 255]), open: B('Незабудовані рівнини', [96, 110, 90]) };
  def('tech', { name: 'Планета-місто', group: 'fantasy', style: 'harsh', hab: { fixed: [35, 80] }, tc: [5, 45], ac: [170, 190, 230], cc: [180, 184, 196], liqName: 'Резервуари', lightB: [TE.city, TE.ind, TE.road, TE.core],
    blurb: 'Суцільний мегаполіс: сітка магістралей, промзони й реактори, що горять вночі.', life: 'Мільярди мешканців і штучний інтелект міст.',
    gases: [['Азот', 72], ['Кисень', 19], ['Діоксид вуглецю', 6], ['Смог', 3]], res: ['Мікросхеми', 'Енергоядра', 'Стальні сплави', 'Дані'],
    knobs: { sea: { l: 'Резервуари', min: 0, max: .35, def: .1 }, scale: { min: .8, max: 3, def: 1.4 }, mount: { l: 'Хмарочоси', min: 0, max: .6, def: .2 }, built: { l: 'Забудова', min: .2, max: 1, def: .75, g: 'surf' }, grid: { l: 'Щільність магістралей', min: 12, max: 60, def: 28, f: 'int', g: 'surf' }, cores: { l: 'Енергополя', min: 0, max: 1, def: .3, g: 'surf' }, atmo: { min: .3, max: 1, def: .6 }, cloud: { l: 'Смог', min: 0, max: .8, def: .3 }, lights: { l: 'Нічні вогні', min: .3, max: 1, def: .9 }, tilt: {}, moons: {}, hue: { min: -.3, max: .3 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'water'); return; }
      // райони: великі плями забудови різного вигляду; між ними зелені пояси й пустирі
      const zone = k.n(c, 1.5, 7, 'm') * .5 + .5, built = k.n(c, 2.2, 7, 'm') > .45 - p.built * .95;
      if (!built) { o.b = TE.open; o.tint = true; return; }
      const g1 = p.grid, ph = Math.atan2(c.z, c.x), u = ph * g1 / (2 * Math.PI), v = c.lat * g1 / Math.PI, gx = Math.abs(fract(u) - .5), gy = Math.abs(fract(v) - .5);
      const ix = Math.floor(u), iy = Math.floor(v), hash = fract(Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453);
      // магістралі: тонкі лінії сітки, кожна п'ята ширша й світліша; поверх кільцева траса й промені
      const wide = (ix % 5 === 0 || iy % 5 === 0), rw = wide ? .485 : .5 - .035;
      if (gx > rw || gy > rw) { o.b = TE.road; o.col = mulc(BIOMES[TE.road].c, wide ? 1.25 : .9); return; }
      // енергополя: рідкісні великі диски (комірки Вороного), а не випадкові плями
      const cl = k.cell(c, 1.1 + p.cores * .6, 17);
      if (p.cores > 0 && cl.r > 1 - p.cores * .12 && cl.d1 < .14) { const f = 1 - cl.d1 / .14; o.b = TE.core; o.col = mixc(mulc(BIOMES[TE.city].c, .6), BIOMES[TE.core].c, smooth(0, .6, f)); o.glow = 230 * smooth(.1, .7, f); return; }
      // квартали: колір залежить від району, відмінність між кварталами невелика
      const ind = zone > .62, glass = zone < .34, base = ind ? TE.ind : TE.city;
      o.b = base; let col = BIOMES[base].c; if (glass) col = mixc(col, [74, 108, 150], .55);
      o.col = mulc(col, (.88 + hash * .24) * (1 + (c.alt - .5) * p.mount * .5));
    } });

  const SH = { plate: B('Уламок кори', [74, 66, 64]), crack: B('Розлом', [255, 140, 40]), ash: B('Попіл', [42, 38, 38]) };
  def('shattered', { name: 'Розколота', group: 'fantasy', style: 'harsh', hab: 0, tc: [120, 420], ac: [255, 140, 70], cc: [80, 70, 66], lightB: [],
    blurb: 'Розламана на уламки планета: між плитами палає розпечене ядро.', life: 'Життя неможливе. Лише вогняні елементалі, якщо вірити легендам.',
    gases: [['Діоксид сірки', 40], ['Діоксид вуглецю', 40], ['Азот', 15], ['Інше', 5]], res: ['Розплавлене ядро', 'Уламки кори', 'Вулканічне скло', 'Рідкі метали'],
    knobs: { size: { l: 'Розмір уламків', min: 0, max: 1, def: .5, g: 'surf' }, gap: { l: 'Ширина розломів', min: 0, max: 1, def: .4, g: 'surf' }, heat: { l: 'Жар розломів', min: .2, max: 1, def: .8, g: 'surf' }, atmo: { min: 0, max: .8, def: .4 }, cloud: { l: 'Попіл і дим', min: 0, max: .7, def: .25 }, tilt: {}, moons: { min: 0, max: 3, def: 1 }, hue: { min: -.3, max: .3 } },
    px: (c, o, p, k) => {
      const cl = k.cell(c, lerp(8, 2.6, p.size), 11), e = cl.d2 - cl.d1, w = .03 + p.gap * .14;
      if (e < w) { o.b = SH.crack; o.col = mulc(BIOMES[SH.crack].c, .7 + (1 - e / w) * .5); o.glow = 255 * p.heat; return; }
      if (e < w * 2.2) { const f = 1 - (e - w) / (w * 1.2); o.b = SH.plate; o.col = mixc(BIOMES[SH.plate].c, [220, 90, 20], f * f * .8); o.glow = 120 * p.heat * f * f; return; }
      o.b = fract(cl.r * 9.1) < .3 ? SH.ash : SH.plate; o.col = mulc(BIOMES[o.b].c, .8 + (k.n(c, 16, 0) * .5 + .5) * .4);
    } });

  const MU = { ground: B('Спорова ферма', [190, 120, 160]), cap: B('Велетенські гриби', [214, 76, 70]), myc: B('Міцелій', [240, 230, 210]), phos: B('Фосфорні плями', [100, 210, 170]) };
  def('mushroom', { name: 'Грибна', group: 'fantasy', style: 'soft', hab: { fixed: [30, 75] }, tc: [10, 30], ac: [200, 140, 220], cc: [235, 215, 240], liqName: 'Спорові води', lightB: [MU.phos],
    blurb: 'Ліси велетенських грибів, міцелій під ногами й світні спори в повітрі.', life: 'Розумні грибні мережі та спорові істоти.',
    gases: [['Азот', 70], ['Кисень', 18], ['Діоксид вуглецю', 9], ['Спори', 3]], res: ['Спори', 'Міцелій', 'Грибні ліки', 'Деревина-гриб'],
    knobs: { sea: { l: 'Спорові водойми', min: 0, max: .5, def: .2 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { min: 0, max: .6, def: .25 }, dens: { l: 'Густота грибів', min: .1, max: 1, def: .6, g: 'surf' }, dots: { l: 'Крапки на капелюхах', min: 0, max: 1, def: .6, g: 'surf' }, phos: { l: 'Фосфор у повітрі', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: .3, max: 1, def: .7 }, cloud: { l: 'Спорова імла', min: 0, max: .9, def: .4 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'spores'); return; }
      const cl = k.cell(c, lerp(8, 22, p.dens), 13);
      if (cl.r2 < p.dens && cl.d1 < .28 + cl.r * .12) {
        const hues = [[214, 76, 70], [232, 150, 70], [120, 110, 220], [230, 100, 160]]; let col = hues[Math.floor(cl.r * 4) % 4].slice(); o.b = MU.cap;
        if (p.dots > 0) { const d = k.cell(c, 60, 21); if (d.d1 < .2 * p.dots && d.r2 < .6) col = [250, 244, 232]; }
        o.col = mulc(col, 1.1 - cl.d1 * .6); return;
      }
      if (Math.abs(k.n(c, 7, 9, 'r')) < .02) { o.b = MU.myc; o.col = BIOMES[MU.myc].c.slice(); return; }
      if (k.n(c, 8, 33) > .5) { o.b = MU.phos; o.col = BIOMES[MU.phos].c.slice(); o.glow = 120 * p.phos; return; }
      o.b = MU.ground; o.tint = true;
    } });

  const VO = { ink: B('Чорнильна порожнеча', [16, 12, 30]), star: B('Зоряний пил', [235, 235, 255]), vein: B('Фіолетові жили', [140, 70, 230]) };
  def('void', { name: 'Планета-порожнеча', group: 'fantasy', style: 'harsh', hab: 0, noCloud: true, tc: [-250, -200], ac: [150, 90, 255], lightB: [],
    blurb: 'Чорна куля, всередині якої видно зорі та пурпурові жили нічного неба.', life: 'Невідоме. Можливо, це вхід в інший всесвіт.',
    gases: [['Порожнеча', 90], ['Темна матерія', 8], ['Інше', 2]], res: ['Темна матерія', 'Зоряний пил', 'Тіні', 'Антиречовина'],
    knobs: { stars: { l: 'Зорі всередині', min: 0, max: 1, def: .5, g: 'surf' }, veins: { l: 'Жили світла', min: 0, max: 1, def: .5, g: 'surf' }, nebula: { l: 'Туманність', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: 0, max: .6, def: .3 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      o.b = VO.ink; let col = BIOMES[VO.ink].c.slice(); const nb = k.n(c, 2.4, 8, 'c') * .5 + .5;
      if (p.nebula > 0) { const f = smooth(.45, .9, nb) * p.nebula; col = mixc(col, [70, 30, 130], f * .8); o.glow = 120 * f; }
      if (Math.abs(k.n(c, 5, 2, 'r')) < .01 + p.veins * .03) { o.b = VO.vein; col = BIOMES[VO.vein].c.slice(); o.glow = 255 * (.4 + p.veins * .6); }
      else if (k.n(c, 70, 0, 'l') > .72 - p.stars * .2) { o.b = VO.star; col = BIOMES[VO.star].c.slice(); o.glow = 255; }
      o.col = col;
    } });

  const ST = { rock: B('Чорні скелі', [48, 48, 58]) };
  def('storm', { name: 'Штормова', group: 'fantasy', style: 'harsh', hab: { fixed: [0, 20] }, tc: [-5, 30], ac: [130, 150, 190], cc: [140, 146, 164], liqName: 'Штормове море', lightB: [],
    blurb: 'Вічна гроза: чорні скелі й океан під шаром хмар, що розрізають блискавки.', life: 'Блискавкоїдні мікроби та літаючі скати.',
    gases: [['Азот', 76], ['Кисень', 20], ['Озон', 2], ['Інше', 2]], res: ['Енергія блискавок', 'Озон', 'Магнітні руди', 'Морська сіль'],
    knobs: { sea: { l: 'Штормовий океан', min: .5, max: 1, def: .8 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { min: 0, max: .8, def: .4 }, light: { l: 'Блискавки', min: 0, max: 1, def: .6, g: 'surf' }, atmo: { min: .6, max: 1, def: .85 }, cloud: { l: 'Грозові хмари', min: .7, max: 1, def: .95 }, tilt: {}, moons: {}, hue: { min: -.2, max: .2 } },
    px: (c, o, p, k) => {
      if (c.water) k.liquid(c, o, 'stormsea'); else { o.b = ST.rock; o.tint = true; }
      if (p.light > 0 && k.n(c, 48, 0, 'l') > 1 - .06 - p.light * .24) { o.glow = 255; o.col = [200, 210, 255]; o.tint = false; }
    } });

  const AM = { amber: B('Застиглий бурштин', [222, 150, 40]), dark: B('Темний бурштин', [140, 82, 22]), fossil: B('Скам’янілий ліс', [172, 112, 44]) };
  def('amber', { name: 'Бурштинова', group: 'fantasy', style: 'soft', hab: { fixed: [0, 22] }, tc: [10, 50], ac: [255, 190, 90], cc: [255, 230, 180], liqName: 'Смола',
    blurb: 'Застигла у смолі планета: медові озера, прозорі скелі й закам’янілі ліси.', life: 'Законсервовані в бурштині давні істоти.',
    gases: [['Азот', 70], ['Кисень', 18], ['Терпени', 10], ['Інше', 2]], res: ['Бурштин', 'Смола', 'Скам’янілості', 'Давня ДНК'],
    knobs: { sea: { l: 'Смоляні озера', min: 0, max: .6, def: .25 }, scale: { min: .8, max: 3.5, def: 1.6 }, mount: { min: 0, max: .8, def: .4 }, humid: { l: 'Скам’янілі ліси', min: 0, max: 1, def: .45 }, clear: { l: 'Прозорість', min: 0, max: 1, def: .5, g: 'surf' }, bugs: { l: 'Вкраплення', min: 0, max: 1, def: .4, g: 'surf' }, atmo: { min: .2, max: .9, def: .5 }, cloud: { min: 0, max: .6, def: .2 }, tilt: {}, moons: {}, hue: { min: -.3, max: .3 } },
    terran: { liq: 'resin', beach: false, land: (t, m, alt) => (alt > .65 ? AM.dark : m > .55 ? AM.fossil : AM.amber),
      post: (c, o, p, k) => { if (c.water) return; o.col = mixc(BIOMES[o.b].c, [255, 225, 150], p.clear * .35); o.tint = true; if (p.bugs > 0 && k.n(c, 55, 0, 'l') > 1 - p.bugs * .35) { o.col = [60, 38, 14]; o.tint = false; } } } });
  KINDS.amber.px = terran(KINDS.amber.terran);

  const MI = { salt: B('Соляна пустеля', [244, 232, 232]), edge: B('Соляні межі', [214, 180, 190]) };
  def('mirror', { name: 'Дзеркальна', group: 'fantasy', style: 'fan', hab: { fixed: [0, 10] }, tc: [-20, 60], ac: [200, 220, 255], cc: [240, 244, 252], liqName: 'Ртутні озера',
    blurb: 'Соляні рівнини й ртутні озера, що відбивають небо, як гігантське дзеркало.', life: 'Майже безжиттєва. Солелюбні мікроби в калюжах.',
    gases: [['Азот', 80], ['Аргон', 15], ['Неон', 4], ['Інше', 1]], res: ['Сіль', 'Ртуть', 'Дзеркальний пісок', 'Срібло'],
    knobs: { sea: { l: 'Дзеркальні озера', min: .1, max: .9, def: .45 }, scale: { min: .8, max: 3.2, def: 1.4 }, mount: { min: 0, max: .5, def: .15 }, shine: { l: 'Блиск дзеркала', min: .3, max: 1.4, def: 1, f: 'num', g: 'surf' }, salt: { l: 'Соляні візерунки', min: 0, max: 1, def: .6, g: 'surf' }, atmo: { min: .2, max: 1, def: .6 }, cloud: { min: 0, max: .6, def: .2 }, tilt: {}, moons: {}, hue: { min: -.4, max: .4 } },
    px: (c, o, p, k) => {
      if (c.water) { k.liquid(c, o, 'mercury'); return; }
      const cl = k.cell(c, 7, 17), e = cl.d2 - cl.d1; o.b = MI.salt; o.col = mulc(BIOMES[MI.salt].c, .93 + fract(cl.r * 7.7) * .08);
      if (p.salt > 0 && e < .06 * p.salt + .01) { o.b = MI.edge; o.col = mixc(BIOMES[MI.edge].c, o.col, e / (.06 * p.salt + .01) * .6); }
    } });

  def('rainbow', { name: 'Райдужна', group: 'fantasy', style: 'fan', hab: { fixed: [30, 70] }, tc: [0, 35], ac: [255, 200, 240], cc: [250, 240, 255], lightB: [],
    blurb: 'Гігантські кольорові смуги, що переливаються по всій поверхні, мов веселка.', life: 'Барвисті мікроби, що змінюють колір.',
    gases: [['Азот', 70], ['Кисень', 20], ['Гелій', 8], ['Інше', 2]], res: ['Пігменти', 'Світлові кристали', 'Спектральна пилюка', 'Кольорове скло'],
    knobs: { stripes: { l: 'Кількість смуг', min: .3, max: 3, def: 1.2, f: 'num', g: 'surf' }, swirl: { l: 'Завихрення', min: 0, max: 1, def: .4, g: 'surf' }, scale: { min: .8, max: 3.2, def: 1.5 }, mount: { l: 'Гребені', min: 0, max: 1, def: .4 }, caps: { l: 'Білі полюси', min: 0, max: 1, def: .4 }, atmo: { min: .3, max: 1, def: .7 }, cloud: { l: 'Перламутрові хмари', min: 0, max: .8, def: .35 }, tilt: {}, moons: {}, hue: { min: -.5, max: .5 } },
    px: (c, o, p, k) => {
      const hh = c.lat / Math.PI * p.stripes * 1.6 + k.n(c, 2, 4) * p.swirl * 1.3 + c.alt * .15; o.b = RAIN; o.col = hsv(hh, .62 - c.alt * .25, .88 - (1 - c.alt) * .08);
      if (p.caps > 0 && c.la > c.capLat + .1 * (1 - p.caps)) o.col = [244, 240, 252];
    } });
  const RAIN = B('Райдужні смуги', [200, 160, 220]);

  // типи світів: окремий файл, отримує внутрішні засоби цього
  const WORLDS = typeof module !== 'undefined' && module.exports ? require('./planet-kinds-worlds.js') : (typeof PlanetWorlds === 'function' ? PlanetWorlds : null);
  if (WORLDS) WORLDS({ def, terran, B, BIOMES, KINDS, landBiome, mulc, mixc, lerp, clamp, smooth });
  return { BIOMES, LIQ, KINDS, landBiome, hsv, G, ABSENT };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlanetKinds;
