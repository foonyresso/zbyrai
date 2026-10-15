/* Colonist Foundry: місце дії: планета, місцевість, тип поселення, погода й хвороби (дані + дрібні функції).
   Без DOM: глобал ColonyWorld (браузер) і module.exports (Node). Використовується colony-sim.js та інтерфейсом. */
const ColonyWorld = (() => {
  // mood: базова зміна настрою від місця; ill: множник ризику хвороб; need: множники спаду потреб; ev: множники ваги подій за id; w: ваги погоди
  const BIOMES = {
    temperate: { name: 'Помірна', desc: 'Лагідний клімат, чотири пори.', mood: 1, ill: 1, need: {}, ev: {}, temp: 12, w: { clear: 4, cloud: 4, rain: 3, fog: 1, storm: .6, cold: .6, heat: .4, snow: .3 }, problems: ['Мінлива погода: дощі й нежить'] },
    desert: { name: 'Пустеля', desc: 'Спека, піщані бурі, мало води.', mood: -2, ill: 1.1, need: { food: 1.1, rest: 1.15 }, ev: { sandstorm: 3, drought: 3, collapse: .6 }, temp: 32, w: { clear: 7, heat: 5, cloud: 1, storm: 1.2, rain: .1 }, problems: ['Спека: перегрів і виснаження', 'Нестача води: гірші врожаї'] },
    jungle: { name: 'Джунглі', desc: 'Волого, душно, повно комах і недуг.', mood: -2, ill: 1.6, need: { food: .95 }, ev: { beast: 2, fever: 2, drought: .2 }, temp: 27, w: { rain: 6, cloud: 3, clear: 2, fog: 2, storm: 2, heat: 1.5 }, problems: ['Волога й комахи: лихоманка', 'Хижаки на краю табору'] },
    tundra: { name: 'Тундра', desc: 'Холод, сніг, короткі дні.', mood: -3, ill: 1.3, need: { food: 1.25, rest: 1.1 }, ev: { blizzard: 3, collapse: .8 }, temp: -8, w: { cold: 5, snow: 5, cloud: 3, clear: 2, fog: 1, storm: .8 }, problems: ['Холод: застуди й обмороження', 'Їжа швидко закінчується'] },
    mountain: { name: 'Гори', desc: 'Багато руди, обвали й вітер.', mood: 0, ill: 1, need: { rest: 1.1 }, ev: { collapse: 2.5, ore: 2 }, temp: 4, w: { cloud: 4, clear: 3, snow: 2, cold: 2, storm: 1.5, fog: 1.5, rain: 1 }, problems: ['Обвали в копальнях', 'Крутий рельєф: важко будувати'] },
    swamp: { name: 'Болото', desc: 'Туман, мокро, гнилі випари.', mood: -2, ill: 1.5, need: {}, ev: { fever: 2.5, beast: 1.3 }, temp: 15, w: { fog: 5, rain: 4, cloud: 4, clear: 1, storm: 1 }, problems: ['Гнилі випари: хвороби', 'Туман: легко заблукати'] },
  };
  const KINDS = {
    village: { name: 'Село', desc: 'Тихе й тісне: усі знають усіх, мало розваг.', fun: .85, social: 1.1, raid: .8, thought: 1 },
    city: { name: 'Місто', desc: 'Гамірне: більше розваг, але більше й сварок та загроз.', fun: 1.25, social: .9, raid: 1.4, thought: 0 },
    outpost: { name: 'Форпост', desc: 'Невеликий укріплений табір: безпечніший, але суворий.', fun: .7, social: 1, raid: .6, thought: -1 },
  };
  const SYL = [['Ор', 'Ліс', 'Зор', 'Вел', 'Ар', 'Мир', 'Тер', 'Кал', 'Дан', 'Сел'], ['ве', 'но', 'ра', 'ли', 'мі', 'ту', 'да', 'ре', 'го', 'ні'], ['лія', 'ська', 'ора', 'ена', 'ія', 'ада', 'има', 'ея', 'ура', 'іна']];
  const planetName = R => SYL.map(l => l[Math.floor(R() * l.length)]).join('').replace(/(.)\1\1/g, '$1$1');
  const pick = (R, l) => l[Math.floor(R() * l.length)];
  const randomPlace = R => ({ planet: planetName(R), biome: pick(R, Object.keys(BIOMES)), kind: pick(R, Object.keys(KINDS)) });
  const normPlace = p => ({ planet: String((p && p.planet) || 'Орвелія').slice(0, 24), biome: BIOMES[p && p.biome] ? p.biome : 'temperate', kind: KINDS[p && p.kind] ? p.kind : 'village' });
  const problemsOf = pl => [...BIOMES[pl.biome].problems, KINDS[pl.kind].desc];

  // погода: mood — зміна настрою, out — множник роботи просто неба, ill — множник ризику хвороб, t — зсув температури
  const WEATHER = {
    clear: { name: 'Ясно', mood: 1, out: 1, ill: .9, t: 0 }, cloud: { name: 'Хмарно', mood: 0, out: 1, ill: 1, t: -2 }, rain: { name: 'Дощ', mood: -1, out: .8, ill: 1.2, t: -3 },
    fog: { name: 'Туман', mood: -1, out: .85, ill: 1.1, t: -2 }, storm: { name: 'Буря', mood: -3, out: .5, ill: 1.3, t: -4 }, heat: { name: 'Спека', mood: -2, out: .8, ill: 1.4, t: 8 },
    cold: { name: 'Холоднеча', mood: -2, out: .85, ill: 1.5, t: -10 }, snow: { name: 'Сніг', mood: 0, out: .7, ill: 1.3, t: -8 },
  };
  const OUTDOOR = new Set(['farm', 'build', 'lumber', 'hunt', 'scout', 'guard', 'herb']);
  const rollWeather = (R, biome, prev) => {
    const w = BIOMES[biome].w, keys = Object.keys(w), tot = keys.reduce((a, k) => a + w[k], 0); let r = R() * tot;
    for (const k of keys) { r -= w[k]; if (r <= 0) return k; }
    return prev || 'clear';
  };
  const tempOf = (biome, weather, h) => Math.round(BIOMES[biome].temp + WEATHER[weather].t + 4 * Math.sin((h - 9) / 24 * Math.PI * 2));

  // хвороби й травми: hrs — тривалість [від, до] годин, mood — штраф настрою, work — множник роботи, bed — потрібне ліжко, cont — заразна
  const ILLNESS = {
    cold: { name: 'Застуда', hrs: [24, 60], mood: -6, work: .7, bed: false, cont: true },
    fever: { name: 'Лихоманка', hrs: [36, 84], mood: -14, work: .3, bed: true, cont: true },
    heat: { name: 'Тепловий удар', hrs: [10, 24], mood: -12, work: .2, bed: true, cont: false },
    frost: { name: 'Обмороження', hrs: [30, 70], mood: -10, work: .5, bed: false, cont: false },
    poison: { name: 'Отруєння', hrs: [12, 30], mood: -10, work: .3, bed: true, cont: false },
    exhaust: { name: 'Виснаження', hrs: [12, 30], mood: -8, work: .5, bed: false, cont: false },
    bruise: { name: 'Забите місце', hrs: [8, 20], mood: -4, work: .8, bed: false, cont: false, injury: true },
    wound: { name: 'Поранення', hrs: [36, 96], mood: -12, work: .35, bed: true, cont: false, injury: true },
  };
  return { BIOMES, KINDS, WEATHER, OUTDOOR, ILLNESS, planetName, randomPlace, normPlace, problemsOf, rollWeather, tempOf };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ColonyWorld;
