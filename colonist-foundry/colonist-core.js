/* Colonist Foundry: ядро. Генерація колоністів із навичками, рисами, передісторією, потребами й стосунками,
   та симуляція доби поселення. Без DOM: браузер (глобал ColonistCore) і Node (module.exports). Усе детерміноване за seed. */
const ColonyData_ = typeof ColonyData !== 'undefined' ? ColonyData : require('./colony-data.js');
const ColonistCore = (() => {
  const D2 = ColonyData_;
  function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());
  const pick = (R, l) => l[Math.floor(R() * l.length)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const SKILLS = [
    { id: 'build', name: 'Будівництво' }, { id: 'farm', name: 'Землеробство' }, { id: 'mine', name: 'Видобуток' }, { id: 'craft', name: 'Ремесло' },
    { id: 'cook', name: 'Кухня' }, { id: 'heal', name: 'Лікування' }, { id: 'fight', name: 'Ближній бій' }, { id: 'shoot', name: 'Стрільба' },
    { id: 'think', name: 'Дослідження' }, { id: 'talk', name: 'Соціум' },
  ];
  // робота = навичка, від якої залежить виконання
  const JOBS = [
    { id: 'build', name: 'Будівництво', skill: 'build' }, { id: 'farm', name: 'Поле', skill: 'farm' }, { id: 'mine', name: 'Копальня', skill: 'mine' }, { id: 'craft', name: 'Майстерня', skill: 'craft' },
    { id: 'cook', name: 'Кухня', skill: 'cook' }, { id: 'heal', name: 'Лікарня', skill: 'heal' }, { id: 'guard', name: 'Варта', skill: 'fight' }, { id: 'research', name: 'Дослідження', skill: 'think' },
    { id: 'hunt', name: 'Полювання', skill: 'shoot' }, { id: 'lumber', name: 'Лісоруб', skill: 'build' }, { id: 'tailor', name: 'Швейня', skill: 'craft' }, { id: 'brew', name: 'Броварня', skill: 'cook' },
    { id: 'trade', name: 'Торгівля', skill: 'talk' }, { id: 'teach', name: 'Навчання', skill: 'think' }, { id: 'scout', name: 'Розвідка', skill: 'shoot' }, { id: 'herb', name: 'Збір трав', skill: 'heal' },
  ];
  // професія за роботою: чоловіча й жіноча форми
  const PROF = { build: ['Будівельник', 'Будівельниця'], farm: ['Хлібороб', 'Хліборобка'], mine: ['Шахтар', 'Шахтарка'], craft: ['Майстер', 'Майстриня'], cook: ['Кухар', 'Кухарка'], heal: ['Лікар', 'Лікарка'],
    guard: ['Вартовий', 'Вартова'], research: ['Дослідник', 'Дослідниця'], hunt: ['Мисливець', 'Мисливиця'], lumber: ['Лісоруб', 'Лісорубка'], tailor: ['Кравець', 'Кравчиня'], brew: ['Броварник', 'Броварниця'],
    trade: ['Торговець', 'Торговка'], teach: ['Вчитель', 'Вчителька'], scout: ['Розвідник', 'Розвідниця'], herb: ['Травник', 'Травниця'] };
  const NEEDS = [{ id: 'food', name: 'Ситість', decay: .045 }, { id: 'rest', name: 'Відпочинок', decay: .05 }, { id: 'fun', name: 'Розвага', decay: .03 }, { id: 'social', name: 'Спілкування', decay: .035 }];

  // риси: skill = бонус до рівня навички, mood = базовий настрій, need = множник спаду потреби, conflicts — несумісні риси
  const T = (id, name, desc, o = {}) => Object.assign({ id, name, desc, skill: {}, mood: 0, need: {}, conflicts: [] }, o);
  const TRAITS = [
    T('diligent', 'Працьовитий', 'Любить працювати, рідко відпочиває.', { conflicts: ['lazy'], need: { rest: .8 }, skill: { build: 1, farm: 1 } }),
    T('lazy', 'Ледар', 'Працює через силу і швидко втомлюється.', { conflicts: ['diligent'], need: { rest: 1.4 }, mood: -2 }),
    T('optimist', 'Оптиміст', 'Бачить хороше навіть у поганому.', { conflicts: ['pessimist', 'gloomy'], mood: 8 }),
    T('pessimist', 'Песиміст', 'Чекає найгіршого.', { conflicts: ['optimist'], mood: -8 }),
    T('gloomy', 'Похмурий', 'Рідко усміхається, тримається осібно.', { conflicts: ['optimist', 'sociable'], need: { social: .6 }, mood: -4 }),
    T('sociable', 'Товариський', 'Потребує людей навколо.', { conflicts: ['gloomy', 'loner'], need: { social: 1.5 }, skill: { talk: 3 } }),
    T('loner', 'Самітник', 'Найкраще почувається на самоті.', { conflicts: ['sociable'], need: { social: .4 }, skill: { talk: -2 } }),
    T('glutton', 'Ненажера', 'Голодніє швидше за інших.', { conflicts: ['ascetic'], need: { food: 1.5 }, skill: { cook: 1 } }),
    T('ascetic', 'Аскет', 'Задовольняється малим.', { conflicts: ['glutton', 'epicure'], need: { food: .6, fun: .6 }, mood: 2 }),
    T('epicure', 'Гурман', 'Вимогливий до їжі й обстановки.', { conflicts: ['ascetic'], need: { fun: 1.3 }, skill: { cook: 3 }, mood: -2 }),
    T('brave', 'Відважний', 'Не губиться в бою.', { conflicts: ['coward'], skill: { fight: 2, shoot: 2 } }),
    T('coward', 'Полохливий', 'Тікає від небезпеки.', { conflicts: ['brave'], skill: { fight: -3, shoot: -2 }, mood: -2 }),
    T('genius', 'Кмітливий', 'Швидко вчиться і вигадує.', { conflicts: ['dull'], skill: { think: 4, craft: 2 } }),
    T('dull', 'Тугодум', 'Повільно схоплює складне.', { conflicts: ['genius'], skill: { think: -3, craft: -1 } }),
    T('kind', 'Добрий', 'Піклується про інших.', { conflicts: ['cruel'], skill: { heal: 2 }, mood: 3 }),
    T('cruel', 'Жорстокий', 'Байдужий до чужого болю.', { conflicts: ['kind'], skill: { fight: 2, heal: -2 } }),
    T('night', 'Нічна сова', 'Найактивніший пізно ввечері.', { conflicts: ['early'] }),
    T('early', 'Жайворонок', 'Прокидається до світанку.', { conflicts: ['night'], skill: { farm: 1 } }),
    T('tough', 'Витривалий', 'Мало потребує відпочинку.', { conflicts: ['frail'], need: { rest: .75 }, skill: { mine: 2 } }),
    T('frail', 'Кволий', 'Часто хворіє.', { conflicts: ['tough'], need: { rest: 1.25 }, skill: { mine: -2 }, mood: -2 }),
  ];
  const TRAIT_BY = Object.fromEntries(TRAITS.map(t => [t.id, t]));

  // передісторії: skill — зсув рівнів, no — роботи, яких людина не виконує
  const B = (id, name, text, skill = {}, no = []) => ({ id, name, text, skill, no });
  const CHILD = [
    B('farmkid', 'Дитина селянина', 'Виросла на полі: пізно лягала, рано вставала.', { farm: 4, cook: 1 }),
    B('smithkid', 'Учень коваля', 'Змалку дула міхи й клепала цвяхи.', { craft: 4, mine: 1 }),
    B('monk', 'Вихованець монастиря', 'Читав переписи й лікував монахів.', { think: 3, heal: 2 }, ['guard']),
    B('orphan', 'Безпритульний', 'Виживав на вулицях, навчився крутитися.', { talk: 2, shoot: 2 }),
    B('noble', 'Дитя шляхти', 'Мав вчителів, але ніколи не працював руками.', { talk: 3, think: 2, fight: 1 }, ['mine', 'farm']),
    B('miner', 'Син шахтаря', 'Бачив більше каміння, ніж неба.', { mine: 4, build: 1 }),
    B('hunter', 'Син мисливця', 'Знає ліс і вміє мовчати.', { shoot: 4, cook: 1 }),
    B('healer', 'Дитя знахарки', 'Збирав трави й слухав, як дихають хворі.', { heal: 4, think: 1 }),
  ];
  const ADULT = [
    B('soldier', 'Колишній вояк', 'Бився в чужих війнах і втомився.', { fight: 5, shoot: 3, build: 1 }),
    B('builder', 'Будівельник', 'Зводив мури й мости для князів.', { build: 5, mine: 2 }),
    B('cook', 'Корчмар', 'Годував мандрівників і слухав їхні історії.', { cook: 5, talk: 3 }),
    B('doctor', 'Лікар-цирульник', 'Лікував усіх: від шляхти до злодіїв.', { heal: 5, think: 2 }, ['guard']),
    B('scholar', 'Переписувач', 'Копіював книги, знає більше, ніж каже.', { think: 5, craft: 1 }, ['mine']),
    B('farmer', 'Хлібороб', 'Двадцять урожаїв за плечима.', { farm: 5, cook: 2 }),
    B('smith', 'Коваль', 'Робить усе, що можна вдарити молотом.', { craft: 5, mine: 2, fight: 1 }),
    B('miner2', 'Рудокоп', 'Працював у штольнях, поки не завалило вихід.', { mine: 5, build: 2 }),
    B('trader', 'Крамар', 'Купував, продавав, а часом і обманював.', { talk: 5, craft: 1 }),
    B('exile', 'Вигнанець', 'Покинув рідні землі не з власної волі.', { fight: 2, shoot: 2, talk: -2 }),
  ];

  const MALE = ['Богдан', 'Остап', 'Тарас', 'Ярослав', 'Данило', 'Мирон', 'Орест', 'Левко', 'Захар', 'Степан', 'Назар', 'Роман', 'Гордій', 'Климент', 'Ратибор', 'Милан', 'Святослав', 'Юрко'];
  const FEMALE = ['Соломія', 'Орися', 'Мирослава', 'Дарина', 'Устина', 'Ярина', 'Леся', 'Оксана', 'Златомира', 'Любава', 'Зорина', 'Мелана', 'Яринка', 'Ніна', 'Олена', 'Христя', 'Віра', 'Квітка'];
  const SURN = ['Коваленко', 'Гончар', 'Мельник', 'Лісовик', 'Рудий', 'Сорока', 'Вовк', 'Ткач', 'Бондар', 'Кравець', 'Крук', 'Зайченко', 'Орлик', 'Черемош', 'Дзвінка', 'Голуб', 'Шевчук', 'Будник'];
  const NICK = ['Тихий', 'Рудий', 'Сивий', 'Швидкий', 'Лисий', 'Дзвінкий', 'Кривий', 'Мудрий', 'Гострий', 'Веселий'];

  /* ---------- генерація ---------- */
  // покоління даних: 1 — початкові списки, 2 — розширені (більше імен, передісторій, епізод життя, звичка). Те саме зерно в різних поколіннях дає різні колонії.
  const dataFor = gen => gen === 1 ? { MALE, FEMALE, SURN, NICK, CHILD, ADULT } : { MALE: [...MALE, ...D2.MALE], FEMALE: [...FEMALE, ...D2.FEMALE], SURN: [...SURN, ...D2.SURN], NICK: [...NICK, ...D2.NICK], CHILD: [...CHILD, ...D2.CHILD], ADULT: [...ADULT, ...D2.ADULT] };
  const DATA_CACHE = { 1: dataFor(1), 2: dataFor(2) };
  const GEN = 2;
  function makeColonist(R, o = {}) {
    const gen = o.gen === 1 ? 1 : GEN, L = DATA_CACHE[gen];
    const female = o.female ?? R() < .5, age = o.age ?? Math.round(18 + Math.pow(R(), 1.4) * 47);
    const traitN = R() < .25 ? 3 : 2, traits = [];
    for (let guard = 0; traits.length < traitN && guard < 60; guard++) {
      const t = pick(R, TRAITS); if (traits.includes(t.id)) continue;
      if (traits.some(x => TRAIT_BY[x].conflicts.includes(t.id) || t.conflicts.includes(x))) continue;
      traits.push(t.id);
    }
    const child = pick(R, L.CHILD), adult = age >= 25 ? pick(R, L.ADULT) : null;
    const skills = {}, passion = {};
    for (const s of SKILLS) {
      let v = 2 + Math.round(R() * 5);
      v += child.skill[s.id] || 0; if (adult) v += adult.skill[s.id] || 0;
      for (const t of traits) v += TRAIT_BY[t].skill[s.id] || 0;
      v += Math.round((age - 30) / 15); // досвід росте з віком, але ледь-ледь
      skills[s.id] = clamp(v, 0, 20); passion[s.id] = 0;
    }
    // пристрасті: 1–2 «цікаво» й максимум одна «горить»; ставляться на найвищі навички з випадковістю
    const ranked = SKILLS.map(s => ({ id: s.id, w: skills[s.id] + R() * 6 })).sort((a, b) => b.w - a.w);
    passion[ranked[0].id] = R() < .45 ? 2 : 1; passion[ranked[1].id] = 1; if (R() < .35) passion[ranked[2].id] = 1;
    const no = [...new Set([...(child.no || []), ...(adult ? adult.no : [])])];
    const surname = pick(R, L.SURN); let name = pick(R, female ? L.FEMALE : L.MALE);
    for (let g = 0; g < 20 && o.used && o.used.has(name); g++) name = pick(R, female ? L.FEMALE : L.MALE); // імена в колонії різні (поки вистачає)
    const nick = R() < .22 ? pick(R, L.NICK) : '';
    // покоління 2: епізод життя й звичка (кидки в кінці, щоб не зсувати попередні)
    const life = gen === 2 ? pick(R, D2.LIFE) : null, quirk = gen === 2 ? pick(R, D2.QUIRK) : '';
    if (life) for (const k of Object.keys(life.skill)) skills[k] = clamp(skills[k] + life.skill[k], 0, 20);
    return { id: o.id ?? 0, gen, name, surname: female ? surname.replace(/(о|ий)$/, m => (m === 'ий' ? 'а' : 'о')) : surname, nick, female, age, traits, child: child.id, adult: adult ? adult.id : null, life: life ? life.id : null, quirk, skills, passion, noJobs: no, seed: o.seed ?? 0 };
  }
  const fullName = c => `${c.name}${c.nick ? ` «${c.nick}»` : ''} ${c.surname}`;
  const ALL_CHILD = [...CHILD, ...D2.CHILD], ALL_ADULT = [...ADULT, ...D2.ADULT];
  const backstoryText = c => [ALL_CHILD.find(b => b.id === c.child), c.adult && ALL_ADULT.find(b => b.id === c.adult), c.life && D2.LIFE.find(b => b.id === c.life)].filter(Boolean);

  /* Колонія з n людей. locks: { індекс: колоніст } лишаються на місці. */
  function generateColony(seed, n, locks = {}, gen = GEN) {
    const R = rngFromSeed('colony:' + seed), out = [];
    for (let i = 0; i < n; i++) {
      const rr = rngFromSeed(`c:${seed}:${i}`); // кожен слот має власний потік: зміна n не перетасовує вже згенерованих
      const used = new Set(out.map(c => c.name));
      out.push(locks[i] || makeColonist(rr, { id: i, seed: `${seed}:${i}`, used, gen }));
      out[i].id = i;
    }
    return { seed, gen, colonists: out, relations: buildRelations(out, R) };
  }
  // окрема перегенерація одного слота
  function reroll(colony, i, newSeed) { const c = makeColonist(rngFromSeed(`r:${newSeed}:${i}`), { id: i, seed: `${newSeed}:${i}`, gen: colony.gen ?? 1, used: new Set(colony.colonists.filter((_, k) => k !== i).map(x => x.name)) }); c.id = i; const cs = colony.colonists.slice(); cs[i] = c; return { seed: colony.seed, gen: colony.gen, colonists: cs, relations: buildRelations(cs, rngFromSeed('colony:' + colony.seed + ':' + newSeed)) }; }

  /* ---------- стосунки ---------- */
  // base: вроджена симпатія за рисами; rel: родинні/сердечні зв'язки
  function baseOpinion(a, b) {
    let v = 0;
    for (const x of a.traits) for (const y of b.traits) {
      if (x === y) v += 6;
      if (TRAIT_BY[x].conflicts.includes(y)) v -= 10;
    }
    if (a.traits.includes('sociable')) v += 5; if (a.traits.includes('loner')) v -= 4;
    if (a.traits.includes('kind')) v += 4; if (a.traits.includes('cruel')) v -= 4;
    if (b.traits.includes('kind')) v += 5; if (b.traits.includes('cruel')) v -= 6;
    if (b.traits.includes('optimist')) v += 3; if (b.traits.includes('gloomy')) v -= 3;
    v -= Math.min(6, Math.abs(a.age - b.age) / 8);
    return Math.round(v);
  }
  const REL = { sibling: 'брат/сестра', spouse: 'пара', friend: 'друг', rival: 'суперник' };
  function buildRelations(cs, R) {
    const rel = new Map(), key = (i, j) => (i < j ? `${i}-${j}` : `${j}-${i}`), set = (i, j, t) => { if (!rel.has(key(i, j))) rel.set(key(i, j), t); };
    // пари: двоє дорослих, що не пов'язані родинно, з невеликою ймовірністю
    const idx = cs.map((_, i) => i).sort(() => R() - .5), used = new Set();
    for (const i of idx) {
      if (used.has(i) || cs[i].age < 20 || R() > .6) continue;
      const j = idx.find(k => k !== i && !used.has(k) && cs[k].age >= 20 && Math.abs(cs[k].age - cs[i].age) <= 14 && baseOpinion(cs[i], cs[k]) + baseOpinion(cs[k], cs[i]) > 4);
      if (j != null) { set(i, j, 'spouse'); used.add(i); used.add(j); }
    }
    // родичі: однакове прізвище (з урахуванням жіночої форми) → брати/сестри
    const sn = c => c.surname.replace(/а$/, 'ий').replace(/о$/, 'о');
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (sn(cs[i]) === sn(cs[j]) && !rel.has(key(i, j))) set(i, j, 'sibling');
    // друзі й суперники з найсильніших/найслабших взаємних симпатій
    const pairs = []; for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) pairs.push({ i, j, s: baseOpinion(cs[i], cs[j]) + baseOpinion(cs[j], cs[i]) + (R() - .5) * 4 });
    pairs.sort((p, q) => q.s - p.s);
    const nF = Math.max(1, Math.round(cs.length * .6)), nR = Math.max(1, Math.round(cs.length * .3));
    let f = 0; for (const p of pairs) { if (f >= nF) break; if (p.s > 3 && !rel.has(key(p.i, p.j))) { set(p.i, p.j, 'friend'); f++; } }
    let r = 0; for (const p of pairs.slice().reverse()) { if (r >= nR) break; if (p.s < -2 && !rel.has(key(p.i, p.j))) { set(p.i, p.j, 'rival'); r++; } }
    return [...rel].map(([k, type]) => { const [i, j] = k.split('-').map(Number); return { a: i, b: j, type }; });
  }
  const REL_BONUS = { sibling: 15, spouse: 35, friend: 22, rival: -28 };
  // думка a про b (не симетрична): вроджена + зв'язок
  function opinion(colony, i, j) {
    const cs = colony.colonists, r = colony.relations.find(x => (x.a === i && x.b === j) || (x.a === j && x.b === i));
    return clamp(baseOpinion(cs[i], cs[j]) + (r ? REL_BONUS[r.type] : 0), -100, 100);
  }
  const relOf = (colony, i, j) => (colony.relations.find(x => (x.a === i && x.b === j) || (x.a === j && x.b === i)) || {}).type || null;

  /* ---------- робота: пріоритети ---------- */
  // 1 = найвищий, 4 = найнижчий, 0 = не виконує; пристрасть підвищує пріоритет
  function priorities(c) {
    const out = {};
    for (const j of JOBS) {
      if (c.noJobs.includes(j.id)) { out[j.id] = 0; continue; }
      const lvl = c.skills[j.skill] + (c.passion[j.skill] === 2 ? 4 : c.passion[j.skill] === 1 ? 2 : 0);
      out[j.id] = lvl >= 14 ? 1 : lvl >= 10 ? 2 : lvl >= 6 ? 3 : 4;
    }
    return out;
  }
  // професія: найвища робота за пріоритетом і навичкою (для тих, хто нічого не вміє, — «Підсобник»)
  function profession(c) {
    const p = priorities(c), best = JOBS.filter(j => p[j.id] > 0).sort((a, b) => p[a.id] - p[b.id] || c.skills[b.skill] - c.skills[a.skill])[0];
    return best && p[best.id] <= 2 ? PROF[best.id][c.female ? 1 : 0] : (c.female ? 'Підсобниця' : 'Підсобник');
  }
  const effSkill = (c, skill) => c.skills[skill] * (c.passion[skill] === 2 ? 1.3 : c.passion[skill] === 1 ? 1.1 : 1);

  /* ---------- симуляція доби ---------- */
  // Розклад: 22–6 сон, 6–8 і 18–22 вільний час (їжа, розваги, розмови), 8–18 робота за пріоритетами.
  // Крок = година. Повертає { log: [{h, text, kind}], stats, hours: [{h, who: [{act, mood}]}], final: [...] }.
  function simulateDay(colony, seed = 1) {
    const cs = colony.colonists, R = rngFromSeed(`day:${colony.seed}:${seed}`), log = [], n = cs.length;
    const st = cs.map(c => ({ needs: Object.fromEntries(NEEDS.map(x => [x.id, .65 + R() * .3])), mood: 0, work: 0, breakdown: 0, acts: [] }));
    const ops = cs.map((_, i) => cs.map((_, j) => (i === j ? 0 : opinion(colony, i, j))));
    const stats = { work: Object.fromEntries(JOBS.map(j => [j.id, 0])), talks: 0, fights: 0, bonds: 0, breakdowns: 0 };
    const nm = i => cs[i].name;
    const moodOf = i => { const c = cs[i], s = st[i]; const need = NEEDS.reduce((a, x) => a + (s.needs[x.id] - .5) * 40, 0) / NEEDS.length; return clamp(Math.round(50 + need + c.traits.reduce((a, t) => a + TRAIT_BY[t].mood, 0) + s.mood), 0, 100); };
    const load = Array(JOBS.length).fill(0), assign = cs.map(c => priorities(c));
    for (let h = 0; h < 24; h++) {
      const row = [];
      const busy = new Set();
      // 1) що робить кожен
      cs.forEach((c, i) => {
        const s = st[i], tm = TRAIT_BY, night = c.traits.includes('night'), early = c.traits.includes('early');
        const sleepFrom = night ? 24 : 22, sleepTo = early ? 5 : night ? 8 : 6;
        const asleep = h >= sleepFrom % 24 && (sleepFrom >= 24 ? h < sleepTo : true) || h < sleepTo;
        let act;
        if (s.breakdown > 0) { act = 'зрив'; s.breakdown--; }
        else if (asleep && s.needs.rest > .12) act = 'сон';
        else if (s.needs.food < .3) act = 'їжа';
        else if (s.needs.rest < .15) act = 'сон';
        else if (h >= 8 && h < 18) {
          // найвищий пріоритет серед робіт, на яких ще не забагато людей
          const opts = JOBS.filter(j => assign[i][j.id] > 0).sort((a, b) => assign[i][a.id] - assign[i][b.id] || (c.skills[b.skill] - c.skills[a.skill]));
          let j = opts.find(x => load[JOBS.indexOf(x)] < Math.max(1, Math.ceil(n / 3)));
          j = j || opts[0]; act = j ? 'робота:' + j.id : 'відпочинок';
          if (j) load[JOBS.indexOf(j)]++;
        } else act = s.needs.fun < .45 ? 'розвага' : s.needs.social < .45 ? 'розмова' : (s.needs.food < .55 ? 'їжа' : 'відпочинок');
        if (h === 18 || h === 8) load.fill(0);
        s.acts.push(act);
        // 2) наслідки для потреб
        for (const nd of NEEDS) { const mult = c.traits.reduce((a, t) => a * (tm[t].need[nd.id] ?? 1), 1); let d = -nd.decay * mult; if (act.startsWith('робота')) d *= nd.id === 'rest' ? 1.6 : 1; s.needs[nd.id] += d; }
        if (act === 'сон') s.needs.rest += .22; if (act === 'їжа') s.needs.food += .55; if (act === 'відпочинок') s.needs.rest += .06; if (act === 'розвага') s.needs.fun += .35;
        if (act === 'зрив') { s.needs.fun += .1; }
        if (act.startsWith('робота')) {
          const job = JOBS.find(x => 'робота:' + x.id === act), q = effSkill(c, job.skill) * (.6 + .4 * moodOf(i) / 100); s.work += q; stats.work[job.id] += q;
          if (c.passion[job.skill]) s.mood += .3; // улюблена справа підіймає настрій
        }
        row.push(i);
      });
      // 3) розмови: ті, хто обрав «розмова»/«розвага» чи просто вільний, шукають співрозмовника
      const free = cs.map((_, i) => i).filter(i => /^(розмова|розвага|відпочинок)$/.test(st[i].acts[h]) && !(h < 6 || h >= 22));
      const order = free.slice().sort(() => R() - .5);
      for (const i of order) {
        if (busy.has(i)) continue;
        const cand = order.filter(j => j !== i && !busy.has(j)); if (!cand.length) break;
        const j = cand.reduce((b, k) => (ops[i][k] + R() * 12 > ops[i][b] + R() * 12 ? k : b), cand[0]);
        busy.add(i); busy.add(j); stats.talks++;
        const o = (ops[i][j] + ops[j][i]) / 2, roll = R() * 100 - 20 + o;
        for (const k of [i, j]) { st[k].needs.social = Math.min(1, st[k].needs.social + .3); st[k].acts[h] = 'розмова'; }
        if (roll < 12 && o < 10) { stats.fights++; ops[i][j] -= 8; ops[j][i] -= 8; st[i].mood -= 4; st[j].mood -= 4; log.push({ h, kind: 'bad', text: `${nm(i)} посварилась з ${nm(j)}`.replace('посварилась', cs[i].female ? 'посварилась' : 'посварився') }); }
        else if (roll > 78) { stats.bonds++; ops[i][j] += 6; ops[j][i] += 6; st[i].mood += 3; st[j].mood += 3; log.push({ h, kind: 'good', text: `${nm(i)} і ${nm(j)} щиро поговорили`, }); }
        else { ops[i][j] += 1; ops[j][i] += 1; st[i].mood += .6; st[j].mood += .6; }
      }
      // 4) межі, зриви настрою
      cs.forEach((c, i) => {
        const s = st[i]; for (const nd of NEEDS) s.needs[nd.id] = clamp(s.needs[nd.id], 0, 1);
        s.mood *= .94; const m = moodOf(i);
        if (m < 22 && s.breakdown === 0 && R() < .35) { s.breakdown = 2; stats.breakdowns++; log.push({ h, kind: 'bad', text: `${nm(i)} зірвався: ${m < 12 ? 'ховається й відмовляється працювати' : 'кидає все й іде гуляти'}`.replace('зірвався', c.female ? 'зірвалась' : 'зірвався') }); }
        if (s.needs.food === 0 && h % 3 === 0) log.push({ h, kind: 'bad', text: `${nm(i)} голодує` });
      });
      st.forEach((s, i) => { if (!row[i] && row[i] !== 0) return; });
    }
    log.sort((a, b) => a.h - b.h);
    const final = cs.map((c, i) => ({ id: i, mood: moodOf(i), needs: Object.assign({}, st[i].needs), work: st[i].work, acts: st[i].acts }));
    return { log, stats, final, ops };
  }

  const toCsv = colony => {
    const head = ['ім\'я', 'вік', 'стать', 'риси', 'передісторія', ...SKILLS.map(s => s.name)];
    const rows = colony.colonists.map(c => [JSON.stringify(fullName(c)), c.age, c.female ? 'ж' : 'ч', JSON.stringify(c.traits.map(t => TRAIT_BY[t].name).join(', ')), JSON.stringify(backstoryText(c).map(b => b.name).join(' → ')), ...SKILLS.map(s => c.skills[s.id] + ['', '+', '++'][c.passion[s.id]])].join(','));
    return [head.map(h => JSON.stringify(h)).join(','), ...rows].join('\n');
  };

  return { SKILLS, JOBS, NEEDS, TRAITS, TRAIT_BY, CHILD, ADULT, REL, rngFromSeed, makeColonist, generateColony, reroll, fullName, backstoryText, baseOpinion, opinion, relOf, priorities, profession, PROF, effSkill, simulateDay, toCsv };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ColonistCore;
