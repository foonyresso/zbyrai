/* Planet Forge: літаючі континенти як варіації планети (група «Літаючі континенти»). Це не сфера, а велетенська плита в космосі (shape: 'slab'):
   може бути більшою за кілька планет разом, з ярусами міст і трильйонами мешканців. Малює planet-sky-view.js. Без DOM. */
(function (root) {
  function PlanetSkyKinds(api) {
    const { def, terran, landBiome } = api;
    const PSK = typeof module !== 'undefined' && module.exports ? require('./planet-sky.js') : (typeof PlanetSky !== 'undefined' ? PlanetSky : null);
    const base = terran({ liq: 'water', cap: null, land: landBiome });
    const knobs = (isl, span) => ({
      span: { l: 'Розмір найбільшої плити', min: 0, max: 1, def: span, f: 'km', g: 'surf' }, isl: { l: 'Кількість плит', min: 1, max: 14, def: isl, f: 'int', g: 'surf' }, size: { l: 'Розмір плит', min: .5, max: 1.5, def: 1, f: 'num', g: 'surf' },
      elev: { l: 'Глибина скель знизу', min: 0, max: 1, def: .6, f: 'pct', g: 'surf' }, rivers: { l: 'Річки й водоспади', min: 0, max: 1, def: .6, f: 'pct', g: 'surf' }, bridges: { l: 'Мости між плитами', min: 0, max: 1, def: .5, f: 'pct', g: 'surf' },
      pal: { l: 'Рослинність', min: 0, max: 3, def: 0, f: 'pal', g: 'surf' },
      pop: { l: 'Населення', min: 0, max: 1, def: .6, f: 'pop', g: 'sky' }, tiers: { l: 'Яруси міст', min: 1, max: 9, def: 4, f: 'int', g: 'sky' }, glow: { l: 'Левітаційні кристали (світіння знизу)', min: 0, max: 1, def: .6, f: 'pct', g: 'sky' },
      atmo: { l: 'Атмосферний щит', min: 0, max: 1, def: .6 }, lights: { l: 'Вогні міст', min: 0, max: 1, def: .6 },
    });
    const common = { group: 'sky', shape: 'slab', style: 'fan', hab: { fixed: [60, 95] }, tc: [0, 30], ac: [140, 200, 255], cc: [250, 250, 255], liqName: 'Водоспади', lightB: [5, 6, 8, 12], noCloud: true, ringChance: 0, slabInfo: p => PSK.slabInfo(p), derive: () => ({ sea: .25 }),
      gases: [['Азот', 72], ['Кисень', 24], ['Етер', 3], ['Інше', 1]], px: base };
    def('skyland', Object.assign({ name: 'Літаючий материк', blurb: 'Одна велетенська плита суші, що тримається в космосі левітаційними кристалами. Може бути більшою за кілька планет разом, з ярусами міст і трильйонами мешканців.', life: 'Яруси міст, повітряні ферми й мільярди людей під захисним щитом.', res: ['Левітаційні кристали', 'Орні землі', 'Підскельні руди', 'Прісна вода'], knobs: knobs(2, .72) }, common));
    def('skyarch', Object.assign({ name: 'Небесний архіпелаг', blurb: 'Ізольовані плити суші, що парять у космосі над порожнечею. Річки починаються на плитах і спадають за краї водоспадами, плити з’єднані мостами.', life: 'Острівні держави, мости й водоспади, що розсіюються в космосі.', res: ['Левітаційні кристали', 'Хмарна вода', 'Острівні ліси', 'Небесна руда'], knobs: knobs(8, .55) }, common));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = PlanetSkyKinds; else root.PlanetSkyKinds = PlanetSkyKinds;
})(typeof self !== 'undefined' ? self : this);
