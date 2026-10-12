/* Idea Mixer: ядро. Дані ідей, вибір з фіксацією, назви й пітч у Markdown.
   Без DOM: працює і в браузері (глобал MixerCore), і в Node (module.exports), тож його можна тестувати.

   Ідея = { title, picks: { core, prog, world, twist, limit, tone, view } }, де кожен pick = { t: текст, from: [ігри] }.
   Принцип: не копіювати гру, а взяти механіку з однієї й доповнити механікою з іншої. */
const MixerCore = (() => {
  const SLOTS = [
    { id: 'core', name: 'Ядро', hint: 'що гравець робить постійно' },
    { id: 'prog', name: 'Прогресія', hint: 'як гра росте разом із гравцем' },
    { id: 'world', name: 'Світ', hint: 'де це відбувається' },
    { id: 'twist', name: 'Твіст', hint: 'чим гра відрізняється від інших' },
    { id: 'limit', name: 'Обмеження', hint: 'щоб довести до кінця' },
    { id: 'tone', name: 'Тон', hint: 'як це звучить' },
    { id: 'view', name: 'Вигляд', hint: 'камера й формат' },
  ];

  const e = (t, ...from) => ({ t, from });
  const POOLS = {
    core: [
      e('Збирати ресурси, будувати базу й відбивати хвилі ворогів', '7 Days to Die', 'Raft'),
      e('Виживати хвилями й збирати предмети, що множать один одного', 'Risk of Rain', 'Brotato'),
      e('Керувати поселенням жителів із характерами, які діють самі', 'RimWorld', 'The Sims 4'),
      e('Планувати виробничі ланцюги заводу на всю карту', 'Satisfactory'),
      e('Тримати крамницю: герої самі приходять купувати спорядження', 'Shop Heroes'),
      e('Гриндити предмети зі статами заради ідеального білда', 'Borderlands', 'Diablo 4'),
      e('Командою керувати кораблем і виконувати ролі на борту', 'Sea of Thieves'),
      e('Оборона башт хвилями з героєм, якого можна прокачувати', 'Dungeon Defenders', 'Warcraft 3 TD'),
      e('Розбудовувати місто, яке живе саме, але без гравця розвалюється', 'Cities: Skylines'),
      e('Досліджувати нескінченний згенерований світ', 'No Man’s Sky', 'Terraria'),
      e('Разом із друзями розв’язувати фізичні задачі', 'Human: Fall Flat', 'PEAK'),
      e('Один гравець мисливець, а решта будує стіни й башти', 'Petri Balance'),
      e('Збирати картки чи моди й комбінувати їх у білд', 'Warframe', 'Ragnarok Online'),
      e('Будувати з блоків і захищати споруди від нападів', 'Minecraft', 'Castle Story'),
      e('Битися з великими монстрами, ухиляючись і вичікуючи момент', 'Monster Hunter: World'),
    ],
    prog: [
      e('Складність росте без стелі, а мета протриматися якнайдовше', 'Risk of Rain', 'Vampire Survivors'),
      e('Дерево скілів на сотні вузлів', 'Shape of Dreams'),
      e('Механіки відкриваються поступово: на старті майже порожньо', 'Vampire Survivors'),
      e('Від мікроба до галактики, кожна фаза окремий жанр', 'Spore'),
      e('Предмети з випадковими статами й картки у слотах', 'Ragnarok Online', 'Diablo 4'),
      e('Нащадки успадковують риси й вміння', 'The Sims 4'),
      e('Нові землі відкриваються за репутацію й торгівлю', 'Anno'),
      e('Тех-дерево відкривається дослідженням руїн', 'Satisfactory'),
      e('Кожні N днів приходить орда сильніша за попередню', '7 Days to Die'),
      e('Нові класи відкриваються за приховані умови, але з чесними підказками', 'Vampire Survivors', 'Megabonk'),
    ],
    world: [
      e('Воксельна пісочниця з генерацією світу', 'Minecraft', 'Terraria'),
      e('Космос і планети з правдоподібною фізикою', 'No Man’s Sky'),
      e('Середньовічні міста, дороги й села', 'Anno', 'Stronghold'),
      e('Море, острови й кораблі', 'Sea of Thieves'),
      e('Постапокаліпсис на знайомих українських просторах', 'S.T.A.L.K.E.R. 2'),
      e('Стилізоване атмосферне фентезі', 'Valheim'),
      e('Печери й підземелля під містом', 'Terraria', 'Deep Rock Galactic'),
      e('Аніме-фентезі з ефектними героями: кішки, лисиці, ельфійки'),
      e('Піксель-арт збоку, затишний і вайбовий', 'Kingdom Two Crowns'),
      e('Космічна станція, засипана сміттям, і дивний гумор', 'Breathedge'),
    ],
    twist: [
      e('Гравець не герой, а торговець чи ціле місто', 'Shop Heroes'),
      e('Жителі мають риси, конфліктують і мають вподобання', 'RimWorld'),
      e('Рефлекти й тригери запускають скіли, тож персонаж фармить сам', 'Ragnarok Online'),
      e('Світ без стін: нескінченна карта чанками', 'Minecraft'),
      e('Можна поєднати будь-які два предмети', 'Baldur’s Gate 3'),
      e('Асиметрія: мисливець проти будівельників', 'Petri Balance'),
      e('Усі описи предметів написані чорним гумором', 'Borderlands'),
      e('Дрон і гаджети, щоб веселитися з NPC', 'Watch Dogs 2'),
      e('Економіка між поселеннями: торгівля чи війна', 'Anno', 'Black Desert'),
      e('Жителі впливають на світ: ремонтують, сваряться, ночують', 'Conan Exiles'),
      e('Фізичні регдоли: усе виходить смішно', 'Human: Fall Flat'),
      e('Із кожного вбитого монстра випадають частини для крафту', 'Almighty: Kill Your Gods'),
    ],
    limit: [
      e('Зробити за два тижні (game jam)'),
      e('Лише 16 кольорів у палітрі'),
      e('Без сюжету, тільки системи'),
      e('Усе на одному екрані без прокрутки'),
      e('Керування однією кнопкою'),
      e('Працює повністю в браузері, без завантажень'),
      e('Лише три види ресурсів'),
      e('Одна фаза, доведена до кінця (вертикальний зріз)'),
      e('Усі дані в JSON, які можна правити без коду'),
      e('Сесія тривалістю п’ять хвилин'),
    ],
    tone: [
      e('Чорний відвертий гумор', 'Borderlands', 'Saints Row'),
      e('Затишно-похмура атмосфера', 'Valheim'),
      e('Епічний екшен', 'Helldivers 2'),
      e('Іронія над самим жанром'),
      e('Тиха медитативна пісочниця', 'Raft'),
      e('Безглуздий хаос без цензури', 'Saints Row', 'Postal'),
    ],
    view: [
      e('2D збоку'),
      e('Вигляд зверху'),
      e('Від третьої особи'),
      e('Ізометрія'),
      e('Від першої особи'),
      e('Воксельна 3D-камера, яку можна обертати', 'Minecraft'),
    ],
  };

  const TITLE_A = ['Хутір', 'Орбіта', 'Кузня', 'Вежа', 'Попіл', 'Дрейф', 'Сіль', 'Відлуння', 'Ковчег', 'Прірва', 'Вулик', 'Маяк', 'Іскра', 'Лігво', 'Ярмарок', 'Прихисток'];
  const TITLE_B = ['Безодні', 'Сміття', 'Бунту', 'Світанку', 'Пустки', 'Дрібниць', 'Богів', 'Скла', 'Сусідів', 'Хвилі', 'Забутих', 'Попелу', 'Залізниці', 'Мільярда'];

  /* ---------- детермінований генератор ---------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());
  const randomSeed = () => Math.random().toString(36).slice(2, 8);

  /* ---------- пули: вбудовані + власні ---------- */
  // custom = { slotId: [текст, …] }
  function mergePools(custom) {
    const out = {};
    for (const s of SLOTS) {
      out[s.id] = POOLS[s.id].slice();
      for (const t of (custom && custom[s.id]) || []) if (typeof t === 'string' && t.trim()) out[s.id].push({ t: t.trim().slice(0, 140), from: [], custom: true });
    }
    return out;
  }

  /* ---------- кидок ---------- */
  function pickOne(rng, list, avoid) {
    if (list.length <= 1) return list[0];
    for (let i = 0; i < 12; i++) { const c = list[Math.floor(rng() * list.length)]; if (!avoid || c.t !== avoid.t) return c; }
    return list[0];
  }
  function makeTitle(rng) {
    return TITLE_A[Math.floor(rng() * TITLE_A.length)] + ' ' + TITLE_B[Math.floor(rng() * TITLE_B.length)];
  }
  // current = попередня ідея (або null); locks = { slotId: true }
  function rollAll(rng, pools, current, locks = {}) {
    const picks = {};
    for (const s of SLOTS) picks[s.id] = current && locks[s.id] && current.picks[s.id] ? current.picks[s.id] : pickOne(rng, pools[s.id], current && current.picks[s.id]);
    return { title: current && locks.title ? current.title : makeTitle(rng), picks };
  }
  function rollSlot(rng, pools, idea, slotId) {
    return { title: idea.title, picks: Object.assign({}, idea.picks, { [slotId]: pickOne(rng, pools[slotId], idea.picks[slotId]) }) };
  }

  /* ---------- пітч ---------- */
  function sources(idea) {
    const seen = new Set(), out = [];
    for (const s of SLOTS) for (const g of (idea.picks[s.id] && idea.picks[s.id].from) || []) if (!seen.has(g)) { seen.add(g); out.push(g); }
    return out;
  }
  function pitch(idea) {
    const lines = ['# ' + idea.title, ''];
    for (const s of SLOTS) if (idea.picks[s.id]) lines.push(`- **${s.name}:** ${idea.picks[s.id].t}`);
    const src = sources(idea);
    if (src.length) lines.push('', '*Основа: ' + src.join(', ') + '*');
    return lines.join('\n');
  }

  // Перевірка збереженої/імпортованої ідеї перед відновленням.
  function sanitizeIdea(raw) {
    if (!raw || typeof raw !== 'object' || !raw.picks) return null;
    const picks = {};
    for (const s of SLOTS) {
      const p = raw.picks[s.id];
      if (!p || typeof p.t !== 'string') return null;
      picks[s.id] = { t: p.t.slice(0, 160), from: (Array.isArray(p.from) ? p.from : []).filter(x => typeof x === 'string').slice(0, 6).map(x => x.slice(0, 60)), custom: !!p.custom };
      if (!picks[s.id].custom) delete picks[s.id].custom;
    }
    return { title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim().slice(0, 60) : 'Без назви', picks };
  }

  return { SLOTS, POOLS, rngFromSeed, randomSeed, mergePools, rollAll, rollSlot, makeTitle, pitch, sources, sanitizeIdea };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = MixerCore;
