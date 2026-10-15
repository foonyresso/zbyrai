/* Planet Forge: типи світів (група «Типи світів»): континентальний, пангея, архіпелаг, вулканічний архіпелаг.
   Підключається з planet-kinds.js: отримує його внутрішні засоби (def, terran, B…) і додає типи в той самий каталог. Без DOM. */
(function (root) {
  function PlanetWorlds(api) {
    const { def, terran, B, BIOMES, KINDS, landBiome, mulc, mixc, lerp, clamp, smooth } = api;
    const fract = x => x - Math.floor(x);
    const earthGas = [['Азот', 77], ['Кисень', 21], ['Аргон', 1], ['Інше', 1]];
    const seedDir = seed => { let h = 2166136261; for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); const r = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 * 2 - 1; }; const x = r(), y = r() * .2, z = r(), l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
    const common = { temp: { min: -.6, max: .8, def: .1 }, caps: { def: .25 }, atmo: { min: .3, max: 1, def: .6 }, cloud: { def: .5 }, lights: { def: .5 }, tilt: {}, moons: {}, hue: { min: -.14, max: .14 } };

    /* ---- 1. Континентальний світ (класична Земля) ---- */
    const base1 = terran({ liq: 'water', cap: 2, land: landBiome });
    def('continental', { name: 'Континентальний світ', group: 'world', hab: 'terran', tc: [-55, 55], ac: [110, 170, 255],
      blurb: 'Класична Земля: велетенські континенти, поділені на провінції, з внутрішніми морями, озерами, шельфом і великими океанами.', life: 'Багата біосфера, ліси й луки на материках, коралові шельфи біля берегів.',
      gases: earthGas, res: ['Дерево', 'Родюча земля', 'Метали', 'Прісна вода'], liqName: 'Вода',
      knobs: Object.assign({ sea: { min: .3, max: .75, def: .5 }, scale: { l: 'Розмір материків', min: .6, max: 2.2, def: 1.1 }, mount: {}, humid: { min: .1, max: 1, def: .55 },
        prov: { l: 'Межі провінцій', min: 0, max: 1, def: .5, g: 'surf' }, provn: { l: 'Кількість провінцій', min: 8, max: 48, def: 22, f: 'int', g: 'surf' },
        inland: { l: 'Внутрішні моря й озера', min: 0, max: 1, def: .4, g: 'surf' }, shelf: { l: 'Ширина шельфу', min: 0, max: 1, def: .5, g: 'surf' } }, common),
      hmod: (h, c, p, k) => { const basin = smooth(.2, .45, k.n(c, 2.1, 9, 'm')); return h - p.inland * .4 * basin * smooth(.05, .3, h); },
      px: (c, o, p, k) => {
        if (c.water) c.depth = Math.pow(c.depth, .55 + p.shelf * 1.5);
        base1(c, o, p, k);
        if (!c.water && p.prov > 0) { const cl = k.cell(c, Math.sqrt(p.provn / 10), 3), e = cl.d2 - cl.d1; o.mul = (.93 + cl.r * .14) * (e < .035 ? 1 - p.prov * .4 * (1 - e / .035) : 1); }
      } });

    /* ---- 2. Внутрішньоконтинентальний (Пангея) ---- */
    const base2 = terran({ liq: 'water', cap: 2, land: (t, m, alt, c, p, k) => landBiome(t, clamp(m - p.dry * (.25 + alt * .6), 0, 1), alt) });
    def('pangaea', { name: 'Пангея', group: 'world', hab: 'terran', tc: [-45, 60], ac: [120, 175, 255],
      blurb: 'Один гігантський суцільний материк на всю планету: вологі береги, посушливі пустелі в глибині й гори посередині.', life: 'Лісисті узбережжя й степи; у глибині материка життя рідкісне.',
      gases: earthGas, res: ['Дерево', 'Степові трави', 'Метали', 'Солі'], liqName: 'Вода',
      knobs: Object.assign({ sea: { l: 'Моря й затоки', min: .15, max: .6, def: .36 }, scale: { l: 'Дрібність рельєфу', min: .6, max: 2.4, def: 1.1 }, mount: {}, humid: { min: .1, max: 1, def: .6 },
        mass: { l: 'Цілісність материка', min: .3, max: 1, def: .85, g: 'surf' }, dry: { l: 'Сухість у глибині', min: 0, max: 1, def: .55, g: 'surf' } }, common),
      hmod: (h, c, p) => { const a = seedDir(p.seed), d = c.x * a[0] + c.y * a[1] + c.z * a[2]; return h * (1 - p.mass * .35) + p.mass * 1.5 * smooth(-.5, .05, d); },
      px: (c, o, p, k) => { if (!c.water) { const a = c.alt * (1 - p.mass * .5); c.t = clamp(c.t + (c.alt - a) * .38, 0, 1); c.alt = a; } base2(c, o, p, k); } });

    /* ---- 3. Архіпелаг / Острівний світ ---- */
    const base3 = terran({ liq: 'water', cap: 2, land: landBiome });
    def('archipelago', { name: 'Архіпелаг', group: 'world', hab: 'terran', tc: [-30, 50], ac: [100, 190, 255],
      blurb: 'Острівний світ: вервечки островів, мілини між ними й безкрайні води навколо.', life: 'Острівні ліси, лагуни, кораловi рифи й рибальські поселення.',
      gases: [['Азот', 74], ['Кисень', 24], ['Водяна пара', 1.5], ['Інше', .5]], res: ['Риба', 'Перли', 'Кокоси й фрукти', 'Прісна вода'], liqName: 'Вода',
      knobs: Object.assign({ sea: { l: 'Рівень води', min: .55, max: .92, def: .74 }, scale: { l: 'Дрібність островів', min: .8, max: 3.5, def: 1.6 }, mount: { l: 'Гірські острови', min: 0, max: .8, def: .35 }, humid: { min: .3, max: 1, def: .75 },
        chain: { l: 'Ланцюги островів', min: 0, max: 1, def: .6, g: 'surf' } }, common),
      hmod: (h, c, p, k) => lerp(h, .75 - 2.1 * Math.abs(k.n(c, 1.9 + 1.4 * p.scale / 3.5, 4, 'r')), p.chain * .8),
      px: base3 });

    /* ---- 5. Вулканічний / лавовий архіпелаг ---- */
    const VA = { rock: 14, lava: 13, ash: B('Попелясті пустки', [78, 72, 70]), hot: B('Розпечена плита', [190, 70, 28]), acid: B('Кислотне озеро', [148, 196, 52]), spring: B('Геотермальне джерело', [206, 232, 236]), cone: B('Кратер вулкана', [38, 30, 30]) };
    def('volcanic', { name: 'Вулканічний архіпелаг', group: 'world', style: 'harsh', hab: { fixed: [4, 24] }, tc: [60, 320], ac: [255, 140, 80], cc: [96, 86, 82], lightB: [],
      blurb: 'Молода суша з хребтами вулканів: попелясті пустки, розпечені плити, лавові річки, геотермальні джерела й кислотні озера.', life: 'Лише витривалі мікроби біля джерел і кислотних озер.',
      gases: [['Діоксид сірки', 38], ['Діоксид вуглецю', 34], ['Азот', 24], ['Інше', 4]], res: ['Сірка', 'Обсидіан', 'Геотермальна енергія', 'Рідкі метали'], liqName: 'Лава',
      knobs: { sea: { l: 'Лавові моря', min: .15, max: .8, def: .38 }, scale: { l: 'Дрібність островів', min: .8, max: 3.5, def: 1.7 }, mount: { l: 'Хребти', min: .2, max: 1, def: .7 }, cones: { l: 'Вулкани', min: 0, max: 1, def: .6, g: 'surf' }, rivers: { l: 'Лавові річки', min: 0, max: 1, def: .5, g: 'surf' }, acid: { l: 'Кислотні озера', min: 0, max: 1, def: .4, g: 'surf' }, springs: { l: 'Геотермальні джерела', min: 0, max: 1, def: .4, g: 'surf' }, heat: { l: 'Жар (світіння)', min: .2, max: 1, def: .75, g: 'surf' }, atmo: { min: .3, max: 1, def: .7 }, cloud: { l: 'Попіл у небі', min: 0, max: .85, def: .35 }, tilt: {}, moons: { min: 0, max: 3, def: 1 }, hue: { min: -.12, max: .12 } },
      derive: p => ({ temp: 1 }),
      hmod: (h, c, p, k) => { const cl = k.cell(c, 3.2, 5); return lerp(h, .7 - 2 * Math.abs(k.n(c, 2.2, 4, 'r')), .45) + (cl.r > .45 ? smooth(.42, 0, cl.d1) * .65 * p.cones : 0); },
      px: (c, o, p, k) => {
        if (c.water) { k.liquid(c, o, 'lava'); o.glow = 200 * p.heat * (.5 + .4 * (1 - c.depth)); return; }
        const riv = Math.abs(k.n(c, 4.6, 3, 'r')), w = .01 + p.rivers * .028;
        if (riv < w) { o.b = VA.lava; o.col = mulc(BIOMES[VA.lava].c, .85 + .3 * (k.n(c, 14, 0) * .5 + .5)); o.glow = 255 * p.heat; return; }
        if (riv < w * 2.4) { const f = 1 - (riv - w) / (w * 1.4); o.b = VA.hot; o.col = mixc(BIOMES[14].c, BIOMES[VA.hot].c, f); o.glow = 150 * p.heat * f; return; }
        if (c.alt < .3 && k.n(c, 6, 9) > .6 - p.acid * .25 && p.acid > 0) { o.b = VA.acid; o.col = mulc(BIOMES[VA.acid].c, .8 + c.alt); o.glow = 30; return; }
        const sp = k.cell(c, 11, 8); if (p.springs > 0 && sp.r > 1 - p.springs * .45 && sp.d1 < .07 && c.alt < .6) { o.b = VA.spring; o.col = BIOMES[VA.spring].c.slice(); return; }
        if (c.alt > .72) { o.b = VA.cone; o.col = mulc(BIOMES[VA.cone].c, .9 + k.n(c, 20, 0) * .3); o.glow = 70 * p.heat * smooth(.72, 1, c.alt); return; }
        o.b = k.n(c, 4, 80) > .15 ? VA.ash : VA.rock; o.col = mulc(BIOMES[o.b].c, .8 + (k.n(c, 18, 0) * .5 + .5) * .45);
      } });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = PlanetWorlds; else root.PlanetWorlds = PlanetWorlds;
})(typeof self !== 'undefined' ? self : this);
