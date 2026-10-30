// Атлас 2.0, етап 8: рівні, небезпека й локації.
// • Рівень росте з відстанню від нульових координат (центр карти): 1 рівень ≈ 2,5 км, ±10 % плавного шуму. Рівень регіону = середній по його суші, провінції = середній по її регіонах.
// • Небезпека залежить від відстані до живих поселень (більші поселення відсувають монстрів далі): безпечно → слабкі → звичайні → міні-боси → боси → супербоси → світові боси.
// • Локації (лігва, нори, табори бандитів, руїни, печери, шахти, джерела тощо) стоять за типом, ландшафтом і небезпекою; монстрів беремо з бестіарію (core/bestiary.js).
(function () {
  'use strict';
  const A = globalThis.Atlas2, B = A.Bestiary, { DX, DY } = A.Grid;
  const KM_PER_LEVEL = 2.5;
  const TIERS = ['Безпечно', 'Слабкі створіння', 'Звичайні монстри', 'Міні-боси', 'Боси', 'Супербоси', 'Світові боси'];
  const KIND_UA = ['слабкий', 'звичайний', 'інший', 'міні-бос', 'бос', 'супербос', 'світовий бос'];
  const KT = [-1, 0, 1, 3, 4, 5, 6]; // небезпека → тип монстра в бестіарії (індекс у B.KINDS)
  const KIND_BONUS = [-2, 0, 0, 3, 6, 10, 15];
  const REACH = { capital: 1.5, regional: 1.25, town: 1, village: 0.6, hamlet: 0.4 }; // у скільки разів поселення відсуває небезпеку
  const THR = [0.35, 1, 2, 3.5, 5.5, 8]; // ефективні км до поселення, з яких починається рівень небезпеки 1..6
  const GI = {}; B.GROUPS.forEach((g, i) => GI[g] = i); GI.sea = 13; GI.deep = 14; GI.lake = 15; // води: прибережні, відкрите море, озера
  const GROUPS_ALL = B.GROUPS.concat(['sea', 'deep', 'lake']), NB = B.list.length;
  // Морська бестіарія: [назва, тип, магія, маска груп (13 прибережні, 14 відкрите море, 15 озера), опис, сім'я]
  const SH = 1 << 13, DP = 1 << 14, LK = 1 << 15, SD = SH | DP;
  const SEA = [
    ['Морська гадюка', 0, 0, SD, 'Отруйна змійка, що ховається в рифах.', 'serpent'], ['Мурена-хапуха', 0, 0, SH, 'Виглядає з печерки й кусає за руки.', 'serpent'], ['Рифовий вужак', 0, 0, SH, 'Скручується на камінні біля берега.', 'serpent'],
    ['Морський змій', 1, 0, SD, 'Довгий змій, що топить рибальські човни.', 'serpent'], ['Зеленоокий змій', 1, 0, SD, 'Підстерігає кораблі на мілині.', 'serpent'], ['Рогатий змій глибин', 1, 0, DP, 'Хвилями скидає людей з палуби.', 'serpent'],
    ['Змій-ватажок', 3, 0, SD, 'Командує зграєю морських змій.', 'serpent'], ['Гідра затоки', 3, 0, SH, 'Кожна відрубана голова відростає під водою.', 'serpent'],
    ['Левіафан-змій', 4, 0, SD, 'Величезний змій, що розбиває кораблі навпіл.', 'serpent'], ['Морський дракон Сорґ', 4, 1, DP, 'Дихає киплячою парою.', 'serpent'],
    ['Старий Змій Шести Штормів', 5, 1, DP, 'Його поява віщує бурю на тиждень.', 'serpent'], ['Ур-Змій, Опоясувач морів', 6, 1, DP, 'Кажуть, що він здатен обвити весь материк.', 'serpent'],
    ['Мала медуза-пекарка', 0, 0, SD, 'Опіки від дотику не гояться тижнями.', 'kraken'], ['Кальмар-хапун', 0, 0, SD, 'Чіпляється присосками за весла.', 'kraken'], ['Восьминіг-душитель', 0, 0, SH, 'Затягує під воду неуважних купальників.', 'kraken'],
    ['Кракеня', 1, 0, SD, 'Підліток-кракен, уже небезпечний для шлюпок.', 'kraken'], ['Гігантський кальмар', 1, 0, DP, 'Обіймає борти, ламаючи ребра шпангоутів.', 'kraken'], ['Сіра медуза-вбивця', 1, 1, SD, 'Паралізує жертву та тягне на глибину.', 'kraken'],
    ['Кальмар-старійшина', 3, 0, SD, 'Вдвічі більший за будь-якого сородича.', 'kraken'], ['Королівська медуза', 3, 1, DP, 'Світиться у темряві й заворожує екіпажі.', 'kraken'],
    ['Кракен', 4, 0, DP, 'Щупальця, що сягають щогл.', 'kraken'], ['Мати-восьминіг', 4, 0, SD, 'Охороняє кладку; гнів її нищівний.', 'kraken'],
    ['Старий Кракен Безодні', 5, 1, DP, 'Потопив десять флотів і пам’ятає кожен.', 'kraken'], ['Нічне Щупальце, Пожирач кораблів', 6, 1, DP, 'Темрява ворушиться там, де він спить.', 'kraken'],
    ['Рифова піранья', 0, 0, SH, 'Зграя обгризає здобич до кісток.', 'shark'], ['Скат-колючка', 0, 0, SH, 'Хвіст з отрутою, що вражає крізь чобіт.', 'shark'], ['Зубатий вугор', 0, 0, SD, 'Електричний розряд і дві щелепи.', 'shark'],
    ['Акула-людожер', 1, 0, SD, 'Йде на запах крові за милі.', 'shark'], ['Молот-акула', 1, 0, SD, 'Б’є кораблі головою.', 'shark'], ['Косатка-розбійниця', 1, 0, DP, 'Полює зграями, як вовки.', 'shark'],
    ['Білий вожак акул', 3, 0, SD, 'Ватажок зграї з шрамами від гарпунів.', 'shark'], ['Король вугрів', 3, 1, SD, 'Блискавкою спалює вітрила.', 'shark'],
    ['Мегалодон', 4, 0, DP, 'Проковтує шлюпки разом із командою.', 'shark'], ['Чорний Бік, кит-убивця', 4, 0, SD, 'Легенда північних портів.', 'shark'],
    ['Праакула Крижаних вод', 5, 0, DP, 'Рід, що пережив усіх своїх нащадків.', 'shark'], ['Левіафан Глибин', 6, 1, DP, 'Гора з зубів, спливає раз на століття.', 'shark'],
    ['Мала русалка-заманниця', 0, 1, SD, 'Співає й ховається за скелею.', 'siren'], ['Водяний бісеня', 0, 1, SH, 'Плутає рибалкам мережі.', 'siren'], ['Морський шепіт', 0, 1, SH, 'Голос, що кличе стрибнути за борт.', 'siren'],
    ['Сирена', 1, 1, SD, 'Її спів змушує стерно виходити з рук.', 'siren'], ['Морська відьма', 1, 1, SD, 'Продає вітер у склянках і топить кораблі.', 'siren'], ['Нага-сирена', 1, 1, SH, 'Напівжінка, напівзмія.', 'siren'],
    ['Королева сирен', 3, 1, SD, 'Заколисує цілі екіпажі.', 'siren'], ['Співуча Відьма припливів', 3, 1, SH, 'Піднімає хвилі за настроєм.', 'siren'],
    ['Володарка штормів', 4, 1, SD, 'Блискавка виходить з її рук.', 'siren'], ['Мараж, морська чародійка', 4, 1, DP, 'Створює міражі міст посеред океану.', 'siren'],
    ['Талассія, богиня хвиль', 5, 1, DP, 'Їй досі приносять жертви в далеких гаванях.', 'siren'], ['Праматір Хвиль', 6, 1, DP, 'Кажуть, моря слухаються її голосу.', 'siren'],
    ['Утоплений матрос', 0, 0, SD, 'Блукає по дну й тягне до себе.', 'ghost'], ['Блукаючий вогник моря', 0, 1, SD, 'Заманює кораблі на мілину.', 'ghost'], ['Мокрий мрець', 0, 0, SH, 'Виповзає з води на берег ночами.', 'ghost'],
    ['Привид-матрос', 1, 1, SD, 'Дозорний проклятого корабля.', 'ghost'], ['Мертвий юнга-стрілець', 1, 0, SD, 'Стріляє з арбалета з води.', 'ghost'], ['Проклята команда', 1, 1, DP, 'Ніколи не ступлять на сушу.', 'ghost'],
    ['Капітан-привид', 3, 1, SD, 'Не вірить, що вже помер.', 'ghost'], ['Боцман-мрець', 3, 0, SD, 'Ще й досі рахує борги екіпажу.', 'ghost'],
    ['Корабель-привид «Летючий»', 4, 1, DP, 'З’являється з туману без вітру.', 'ghost'], ['Адмірал потопельників', 4, 1, SD, 'Веде флот мерців проти живих.', 'ghost'],
    ['Флот Проклятих', 5, 1, DP, 'Півсотні кораблів з порожніми палубами.', 'ghost'], ['Король затонулих флотів', 6, 1, DP, 'Корону йому викували з якорів.', 'ghost'],
    ['Рифовий краб', 0, 0, SH, 'Щипає за пальці й тікає боком.', 'crab'], ['Мушля-кусака', 0, 0, SH, 'Закривається на нозі, як капкан.', 'crab'], ['Рак-відлюдник', 0, 0, SH, 'Живе в уламках корабельної обшивки.', 'crab'],
    ['Гігантський краб', 1, 0, SH, 'Клешні як ножиці для залізних листів.', 'crab'], ['Панцирний лобстер', 1, 0, SD, 'Тисне вантажні судна.', 'crab'], ['Краб-розбійник', 1, 0, SH, 'Збирає блискуче з потонулих скринь.', 'crab'],
    ['Королівський краб-панцирник', 3, 0, SD, 'Панцир не пробиває й катапульта.', 'crab'], ['Мушля-Мати', 4, 1, SD, 'У її мушлі ціле лігво перлів.', 'crab'],
    ['Краб-колос', 4, 0, DP, 'Нагадує острів, поки не ворухнеться.', 'crab'], ['Скеляний Панцир', 5, 0, DP, 'Острів, який іноді ходить.', 'crab'],
    ['Піратський зуха', 0, 0, SH, 'Нахабний новачок з гнилою абордажною шаблею.', 'pirate'], ['Пірат', 1, 0, SH, 'Грабує торгові судна.', 'pirate'], ['Корсар', 1, 0, SH, 'Має каперське свідоцтво від кого завгодно.', 'pirate'], ['Контрабандист', 1, 0, SH, 'Везе те, чого не показують митниці.', 'pirate'],
    ['Піратський боцман', 3, 0, SH, 'Муштрує команду батогом.', 'pirate'], ['Піратський адмірал', 4, 0, SH, 'Має флот з десятка кораблів.', 'pirate'],
    ['Озерна п’явка', 0, 0, LK, 'Прилипає й п’є кров.', 'lake'], ['Водяний щур', 0, 0, LK, 'Гризе рибальські сіті.', 'lake'], ['Озерна піранья', 0, 0, LK, 'Зграя вигризає півкорови за хвилину.', 'lake'],
    ['Водяник', 1, 1, LK, 'Дух озера, що тягне під лід.', 'lake'], ['Щука-велетка', 1, 0, LK, 'Гладка, як колода, і така ж довга.', 'lake'], ['Болотна трясовинниця', 1, 1, LK, 'Заманює в очерет зеленими вогниками.', 'lake'],
    ['Старий Водяник', 3, 1, LK, 'Борода з водоростей, недобрі очі.', 'lake'], ['Русалка-утоплениця', 3, 1, LK, 'Співає, щоб утягнути на дно.', 'lake'],
    ['Озерний змій', 4, 0, LK, 'Кожен рибалка бачив хвіст, і ніхто — голову.', 'lake'], ['Мати-Водяниця', 4, 1, LK, 'Володарка всіх прісних вод навколо.', 'lake'],
    ['Дух Озера', 5, 1, LK, 'Дзеркало, що дивиться у відповідь.', 'lake']
  ];
  const LIST = B.list.concat(SEA.map(e => e.slice(0, 5)));
  // сім'ї монстрів: на нічиїх островах і в кожній водоймі переважає одна
  const FAM_LAND = [['spider', /павук|павуч|тарантул|вдова/i], ['goblin', /гобл|орк|гноль|гноли|огр|тролл|троль/i], ['wolf', /вовк|варг|гієн/i], ['undead', /скелет|кістян|мерт|зомб|привид|упир|вампір|(?<![а-яіїєґ])лич(?![а-яіїєґ’'])|тінь|тіней|гнил/i], ['dragon', /дракон|василіск|виверн|гідр|змій|гадюк|кобр|лускар|ящір/i], ['insect', /жук|(?<![а-яіїєґ])ос[аи](?![а-яіїєґ’'])|комар|міль|мурах|терміт|богомол|метелик|цикад|кліщ|скорпіон|мокриц/i], ['beast', /ведмід|кабан|бізон|баран|козел|олень|рись|тигр|(?<![а-яіїєґ])лев(?![а-яіїєґ’'])/i], ['giant', /велет|гігант|колос|голем/i], ['bird', /орел|гриф|ворон|гарпі|грифон|сова|совин/i], ['elemental', /дух|елемент|вогн|крижан|грозов|буревій|піщан/i], ['frog', /жаб|тритон|крокодил/i]];
  const FAMOF = LIST.map((e, i) => i >= NB ? SEA[i - NB][5] : (FAM_LAND.find(f => f[1].test(e[0])) || [null])[0]);
  const FAM_UA = { spider: 'Павуки', goblin: 'Гобліни й орки', wolf: 'Вовки й гієни', undead: 'Нежить', dragon: 'Змії й дракони', insect: 'Комахи й членистоногі', beast: 'Дикі звірі', giant: 'Велетні й големи', bird: 'Птахи й гарпії', elemental: 'Духи стихій', frog: 'Болотні тварі', serpent: 'Морські змії', kraken: 'Кракени й медузи', shark: 'Хижі риби', siren: 'Сирени й морські відьми', ghost: 'Морська нежить', crab: 'Краби й панцирники', pirate: 'Пірати', lake: 'Мешканці озер' };
  const FAMS = Object.keys(FAM_UA);
  const GROUP_UA = { peaks: 'Вершини', mountain: 'Гори', hills: 'Пагорби', grass: 'Рівнина', steppe: 'Степ', savanna: 'Савана', forest: 'Ліс', taiga: 'Тайга', jungle: 'Джунглі', swamp: 'Болото', desert: 'Пустеля', tundra: 'Тундра', snow: 'Сніги' , sea: 'Прибережні води', deep: 'Відкрите море', lake: 'Озеро' };
  const CATS = { m: 'Монстри', b: 'Бандити', r: 'Руїни й давнина', n: 'Природа', e: 'Господарство', k: 'Святе місце' };

  // Типи локацій: id, назва, категорія, [мін. небезпека, макс.], вага, групи (null — будь-які), монстри (0 ніколи, 1 від небезпеки 1), обмеження типу монстра (cap), особливість
  const ANY = null, FOR = ['forest', 'taiga', 'jungle'], HIL = ['hills', 'mountain', 'peaks'], OPEN = ['grass', 'steppe', 'savanna'];
  const TYPES = [
    { id: 'spring', name: 'Джерело', cat: 'n', t: [0, 2], w: 3, g: ANY, mon: 0 },
    { id: 'shrine', name: 'Придорожня каплиця', cat: 'k', t: [0, 1], w: 3, g: ANY, mon: 0 },
    { id: 'sawmill', name: 'Покинута лісопильня', cat: 'e', t: [0, 2], w: 2, g: FOR, mon: 1, cap: 1 },
    { id: 'quarry', name: 'Закинутий кар’єр', cat: 'e', t: [0, 3], w: 2, g: ['hills', 'mountain'], mon: 1, cap: 1 },
    { id: 'mine', name: 'Закинута шахта', cat: 'e', t: [1, 4], w: 2, g: HIL, mon: 1 },
    { id: 'farm', name: 'Покинута садиба', cat: 'r', t: [0, 2], w: 2, g: OPEN.concat(['forest']), mon: 1, cap: 1 },
    { id: 'cave', name: 'Печера', cat: 'n', t: [1, 4], w: 3, g: HIL.concat(['forest', 'taiga']), mon: 1 },
    { id: 'den', name: 'Нора', cat: 'm', t: [1, 2], w: 4, g: ANY, mon: 1, cap: 1, pack: [4, 9] },
    { id: 'nest', name: 'Гніздо', cat: 'm', t: [1, 3], w: 3, g: ['forest', 'jungle', 'swamp', 'hills', 'mountain', 'peaks', 'grass', 'taiga'], mon: 1, cap: 1, pack: [3, 7] },
    { id: 'lair', name: 'Лігво', cat: 'm', t: [2, 6], w: 5, g: ANY, mon: 1 },
    { id: 'banditcamp', name: 'Табір бандитів', cat: 'b', t: [1, 3], w: 4, g: ['grass', 'forest', 'hills', 'taiga', 'steppe', 'savanna'], mon: 1, bandits: true },
    { id: 'banditfort', name: 'Розбійницька фортеця', cat: 'b', t: [3, 5], w: 2, g: ['grass', 'forest', 'hills', 'taiga', 'steppe'], mon: 1, bandits: true, big: true },
    { id: 'ruins', name: 'Старі руїни', cat: 'r', t: [1, 6], w: 4, g: ANY, mon: 1, ruin: true },
    { id: 'tomb', name: 'Давній склеп', cat: 'r', t: [2, 6], w: 2, g: ANY, mon: 1 },
    { id: 'barrow', name: 'Курган', cat: 'r', t: [1, 3], w: 2, g: ['grass', 'steppe', 'hills', 'tundra'], mon: 1 },
    { id: 'tower', name: 'Покинута вежа', cat: 'r', t: [0, 3], w: 2, g: ['hills', 'grass', 'forest'], mon: 1, cap: 1 },
    { id: 'temple', name: 'Забутий храм', cat: 'r', t: [3, 6], w: 2, g: ANY, mon: 1 },
    { id: 'mage', name: 'Вежа мага', cat: 'r', t: [2, 5], w: 1.5, g: ['hills', 'grass', 'forest', 'taiga'], mon: 1, magic: true },
    { id: 'monument', name: 'Давній пам’ятник', cat: 'r', t: [0, 4], w: 2, g: ANY, mon: 1, cap: 1 },
    { id: 'peak', name: 'Вершина', cat: 'n', t: [1, 6], w: 2, g: ['peaks'], mon: 1 },
    { id: 'waterfall', name: 'Водоспад', cat: 'n', t: [0, 3], w: 1.5, g: ANY, mon: 0, river: true },
    { id: 'grove', name: 'Священний гай', cat: 'k', t: [0, 3], w: 1, g: ['forest', 'taiga'], mon: 0 },
    { id: 'battle', name: 'Старе поле битви', cat: 'r', t: [2, 4], w: 1, g: ['grass', 'steppe', 'savanna'], mon: 1 },
    { id: 'oasis', name: 'Оаза', cat: 'n', t: [0, 3], w: 2, g: ['desert'], mon: 0 },
    { id: 'fort', name: 'Покинутий форт', cat: 'r', t: [1, 4], w: 1.5, g: ['hills', 'grass', 'steppe', 'forest'], mon: 1 },
    { id: 'citadel', name: 'Забута цитадель', cat: 'r', t: [5, 6], w: 3, g: ANY, mon: 1 },
    { id: 'domain', name: 'Володіння світового боса', cat: 'm', t: [6, 6], w: 4, g: ANY, mon: 1 },
    // у воді (water): рифи, вири, лігва, затонулі кораблі й міста, піратські бази, озерні схованки
    { id: 'reef', name: 'Підводний риф', cat: 'n', t: [1, 3], w: 4, g: ['sea'], mon: 1, cap: 1, pack: [4, 9], water: true },
    { id: 'wreck', name: 'Затонулий корабель', cat: 'r', t: [1, 4], w: 4, g: ['sea', 'deep', 'lake'], mon: 1, water: true },
    { id: 'seacave', name: 'Підводна печера', cat: 'm', t: [2, 5], w: 3, g: ['sea', 'deep'], mon: 1, water: true },
    { id: 'seanest', name: 'Гніздо морських тварин', cat: 'm', t: [1, 3], w: 3, g: ['sea', 'deep'], mon: 1, cap: 1, pack: [3, 7], water: true },
    { id: 'sealair', name: 'Морське лігво', cat: 'm', t: [2, 6], w: 4, g: ['sea', 'deep'], mon: 1, water: true },
    { id: 'whirl', name: 'Морський вир', cat: 'n', t: [2, 5], w: 2, g: ['deep'], mon: 1, water: true },
    { id: 'ghostship', name: 'Корабель-привид', cat: 'r', t: [3, 5], w: 2, g: ['sea', 'deep'], mon: 1, fam: 'ghost', water: true },
    { id: 'sirens', name: 'Скеля сирен', cat: 'm', t: [2, 5], w: 2, g: ['sea'], mon: 1, fam: 'siren', water: true },
    { id: 'krakenlair', name: 'Лігво кракена', cat: 'm', t: [4, 6], w: 2, g: ['deep'], mon: 1, fam: 'kraken', water: true },
    { id: 'piratecove', name: 'Піратська бухта', cat: 'b', t: [1, 3], w: 3, g: ['sea'], mon: 1, bandits: true, water: true },
    { id: 'piratefort', name: 'Піратська твердиня', cat: 'b', t: [3, 5], w: 1.5, g: ['sea'], mon: 1, bandits: true, big: true, water: true },
    { id: 'sunken', name: 'Затонуле місто', cat: 'r', t: [3, 6], w: 2, g: ['sea', 'deep'], mon: 1, ruin: true, water: true },
    { id: 'abyss', name: 'Безодня світового боса', cat: 'm', t: [6, 6], w: 4, g: ['deep'], mon: 1, water: true },
    { id: 'lakelair', name: 'Лігво в озері', cat: 'm', t: [1, 4], w: 4, g: ['lake'], mon: 1, water: true },
    { id: 'drowned', name: 'Затоплене селище', cat: 'r', t: [1, 4], w: 2, g: ['lake'], mon: 1, ruin: true, water: true }
  ];
  const TYPE_BY = {}; TYPES.forEach(t => TYPE_BY[t.id] = t);
  const BANDIT = /бандит|розбійн|грабіж|злодій|контрабанд|ватаг|отаман/i;

  // відстань (хамфер 1 / 1.41), у клітинах, від джерел
  function distField(w, h, srcs) {
    const d = new Float32Array(w * h).fill(1e9); for (const c of srcs) d[c] = 0;
    const F = [[-1, -1, 1.414], [0, -1, 1], [1, -1, 1.414], [-1, 0, 1]], Bk = [[1, 1, 1.414], [0, 1, 1], [-1, 1, 1.414], [1, 0, 1]];
    const pass = (L, y0, y1, dy, x0, x1, dx) => { for (let y = y0; y !== y1; y += dy) for (let x = x0; x !== x1; x += dx) { const i = y * w + x; let v = d[i]; for (const [ox, oy, c] of L) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const q = d[ny * w + nx] + c; if (q < v) v = q; } d[i] = v; } };
    pass(F, 0, h, 1, 0, w, 1); pass(Bk, h - 1, -1, -1, w - 1, -1, -1);
    return d;
  }
  const heightM = (W, i) => W.land[i] && !W.lake[i] ? Math.round(Math.max(0, W.elev[i] - W.sea) / Math.max(1e-6, W.top - W.sea) * 4800 / 10) * 10 : null;
  // пул монстрів за типом і групою (з запасними варіантами, щоб пул не був порожнім)
  const pools = new Map();
  function pool(kind, group) {
    const key = kind + '|' + group; let p = pools.get(key); if (p) return p;
    const L = LIST, bit = 1 << group, a = group >= 13 ? NB : 0, z = group >= 13 ? L.length : NB; // води й суша мають окремі списки
    p = []; for (let i = a; i < z; i++) if (L[i][1] === kind && (L[i][3] & bit)) p.push(i);
    if (!p.length) for (let i = a; i < z; i++) if (L[i][1] === kind) p.push(i);
    pools.set(key, p); return p;
  }
  const mon = (idx, count, W, i) => { const e = LIST[idx]; return { name: e[0], kind: KIND_UA[e[1]], kindIdx: e[1], magic: !!e[2], count, level: Math.max(1, W.level[i] + KIND_BONUS[e[1]]), desc: e[4] }; };

  // ---- етап 1: рівні, групи ландшафту, небезпека, щільність монстрів ----
  function danger(W) {
    const { w, h } = W, N = w * h, km = W.params.kmPerCell, nz = A.Noise.make((W.params.wseed || W.params.seed) + '|danger'), gx0 = (W.params.bx | 0) * w, gy0 = (W.params.by | 0) * h; // шум по наскрізних координатах світу: у безкінечному світі небезпека на стику блоків не рветься
    const bx = W.params.bx | 0, by = W.params.by | 0; W.origin = { x: w / 2 - bx * w, y: h / 2 - by * h }; // нульові координати — центр домашнього материка (у сусідніх блоках безкінечного світу лежить поза картою блока)
    let top = 0; for (let i = 0; i < N; i++) if (W.land[i] && W.elev[i] > top) top = W.elev[i]; W.top = top || 1;
    // рівень клітини
    const level = new Uint16Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot(x + 0.5 - W.origin.x, y + 0.5 - W.origin.y) * km, mult = 1 + (nz.fbm((x + gx0) * 0.03 + 5, (y + gy0) * 0.03 + 5, 2) - 0.5) * 0.9; level[y * w + x] = Math.max(1, Math.round(1 + d / KM_PER_LEVEL * mult)); }
    W.level = level;
    // групи ландшафту: біом + висота (пагорби, вершини)
    const el = []; for (let i = 0; i < N; i += 7) if (W.land[i] && !W.lake[i]) el.push(W.elev[i]); el.sort((a, b) => a - b);
    const hillT = el[Math.floor(el.length * 0.72)] || 1, peakT = el[Math.floor(el.length * 0.985)] || 1;
    const group = new Uint8Array(N).fill(255);
    for (let i = 0; i < N; i++) {
      if (!W.land[i] || W.lake[i]) continue; const bi = A.BIOMES[W.bio[i]], b = bi.alias || bi.id; let g = b; // alias: особливі біоми виміру діють як найближча група ландшафту
      if (b === 'mountain') g = W.elev[i] > peakT ? 'peaks' : 'mountain';
      else if (b === 'snow') g = W.elev[i] > peakT ? 'peaks' : 'snow';
      else if ((b === 'grass' || b === 'forest' || b === 'steppe' || b === 'savanna' || b === 'taiga') && W.elev[i] > hillT) g = 'hills';
      group[i] = GI[g] != null ? GI[g] : GI.grass;
    }
    // води: прибережні (до 6 клітин від суші), відкрите море, озера
    const landSrc = []; for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) landSrc.push(i);
    const dLand = distField(w, h, landSrc);
    const cosmos = A.Params.isVoid(W.params); // космос за краєм: ні монстрів, ні локацій
    for (let i = 0; i < N; i++) if (!W.land[i] || W.lake[i]) group[i] = W.lake[i] ? GI.lake : cosmos ? 255 : dLand[i] <= 6 ? GI.sea : GI.deep;
    W.group = group;
    // доля поселень: частина сіл і міст (не столиці й не центри регіонів) зруйнована або окупована монстрів/бандитами; чим далі від центру, тим частіше
    const fr = A.Rng.stream(W.params.seed, 'fates'), dmax = Math.hypot(w, h) / 2, PF = { town: 0.1, village: 0.16, hamlet: 0.2 };
    for (const s of W.settlements) {
      const outer = cosmos && s.rank !== 'capital' && W.fr[s.i] > A.WALL_FR; // Астракор: за Великою стіною всі поселення захоплені монстрами або зруїновані
      if (s.ruined || s.fortress || (s.port && s.body === -1 && !outer) || (!PF[s.rank] && !outer)) continue; // морські порти не гинуть: через них острови отримують ресурси // фортеця Великої стіни живе завжди
      if (outer) { s.fate = fr() < 0.15 ? 'ruined' : 'occupied'; if (s.fate === 'occupied') s.occupier = 'monsters'; }
      else {
        if (fr() >= PF[s.rank] * (0.6 + 1.2 * Math.min(1, Math.hypot(s.x - w / 2, s.y - h / 2) / dmax))) continue;
        s.fate = fr() < 0.4 ? 'ruined' : 'occupied'; if (s.fate === 'occupied') { s.occupier = fr() < 0.3 ? 'bandits' : 'monsters'; if (!A.RoadGraph.canBlock(W, s)) { s.fate = 'ruined'; s.occupier = null; } } // окуповане лише відгалуженням: не на дорозі між живими поселеннями
      }
      s.popBefore = s.pop; if (s.region >= 0) { W.regions[s.region].pop -= s.pop; W.provinces[W.regions[s.region].prov].pop -= s.pop; } s.pop = 0;
    }
    // небезпека за відстанню до живих поселень
    const eff = new Float32Array(N).fill(1e9);
    for (const rank of Object.keys(REACH)) {
      const srcs = []; for (const s of W.settlements) if (!s.ruined && !s.fate && s.rank === rank) srcs.push(s.i);
      if (!srcs.length) continue; const d = distField(w, h, srcs), k = km / REACH[rank];
      for (let i = 0; i < N; i++) { const v = d[i] * k; if (v < eff[i]) eff[i] = v; }
    }
    if (cosmos && W.fortresses) { const fc = W.fortresses.map(f => f.i); if (fc.length) { const dF = distField(w, h, fc), kF = km / 1.5; for (let i = 0; i < N; i++) { const v = dF[i] * kF; if (v < eff[i]) eff[i] = v; } } } // фортеці відсувають небезпеку як столиці
    // на воді безпечніше біля портів (кораблі ходять, порти їх охороняють) і вздовж морських шляхів
    const effW = Float32Array.from(eff);
    { const ports = []; for (const s of W.settlements) if (s.port && !s.ruined && !s.fate) ports.push(s.i);
      if (ports.length) { const d = distField(w, h, ports), k = km / 1.7; for (let i = 0; i < N; i++) { const v = d[i] * k; if (v < effW[i]) effW[i] = v; } }
      const rc = []; for (const rt of W.seaRoutes || []) for (const c of rt.cells) rc.push(c);
      if (rc.length) { const d = distField(w, h, rc); for (let i = 0; i < N; i++) if (d[i] <= 2) effW[i] *= 0.6; } }
    if (W.params.infinite && !cosmos) { const E = 70; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, ed = Math.min(x, w - 1 - x, y, h - 1 - y); if (ed < E && W.ocean[i]) { const t = 1 - ed / E; effW[i] += (40 - effW[i]) * t * t; } } } // безкінечний світ: біля краю карти відкритий океан до найвищої небезпеки, тож на стику материків рівні збігаються (сусіда видно лише після створення)
    const tier = new Uint8Array(N), dens = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, wet = !W.land[i] || W.lake[i];
      const e = (cosmos && !wet && W.fr[i] < A.WALL_FR ? 0.15 + 0.85 * Math.pow(W.fr[i] / A.WALL_FR, 1.5) : 1) * (wet ? effW[i] : eff[i]) * Math.min(1.35, Math.max(0.7, 1 + (nz.fbm((x + gx0) * 0.035 + 40, (y + gy0) * 0.035 + 7, 3) - 0.5) * 3));
      let t = 0; while (t < THR.length && e >= THR[t]) t++; tier[i] = t;
      dens[i] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + (nz.fbm((x + gx0) * 0.02 + 90, (y + gy0) * 0.02 + 3, 3) - 0.5) * 4.5)));
    }
    // навколо окупованих і зруйнованих поселень небезпека не нижча за мінімум: у серці окупації найвища
    const FR = { town: 8, village: 5, hamlet: 4 }, FB = { town: 4, village: 3, hamlet: 3 };
    for (const s of W.settlements) {
      if (!s.fate) continue; const R = FR[s.rank];
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x, d = Math.hypot(dx, dy); if (d > R || !W.land[i] || W.lake[i]) continue;
        const f = s.fate === 'occupied' ? FB[s.rank] - (d > R / 2 ? 1 : 0) : (d <= R / 2 ? 2 : 1); if (tier[i] < f) tier[i] = f;
      }
    }
    // нічиї острови (суша без жодної провінції): заселені монстрами, один тип переважає; у водоймах теж переважає один тип
    const lc = A.Grid.components(w, h, i => W.land[i] === 1 && !W.lake[i]), owned = new Uint8Array(lc.sizes.length);
    for (let i = 0; i < N; i++) if (lc.id[i] >= 0 && W.province[i] >= 0) owned[lc.id[i]] = 1;
    const dr = A.Rng.stream(W.params.seed, 'dom'), isl = [], islOf = new Int32Array(N).fill(-1), dom = new Uint8Array(N).fill(255), cellsOf = new Map();
    for (let i = 0; i < N; i++) { const c = lc.id[i]; if (c >= 0 && !owned[c]) (cellsOf.get(c) || cellsOf.set(c, []).get(c)).push(i); }
    const famWeights = (g, fams) => fams.map(f => { let n = 0; for (const k of [0, 1]) for (const x of pool(k, g)) if (FAMOF[x] === f) n++; return n; });
    const pickFam = (g, fams) => { const wts = famWeights(g, fams), tot = wts.reduce((a, b) => a + b, 0); if (!tot) return fams[Math.floor(dr() * fams.length)]; let q = dr() * tot; for (let k = 0; k < fams.length; k++) { q -= wts[k]; if (q <= 0) return fams[k]; } return fams[0]; };
    const LAND_FAMS = FAM_LAND.map(f => f[0]), SEA_FAMS = ['serpent', 'kraken', 'shark', 'siren', 'ghost', 'crab'];
    for (const [, cells] of cellsOf) {
      const cnt = {}; for (const i of cells) cnt[group[i]] = (cnt[group[i]] || 0) + 1; const g = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0], fam = pickFam(g, LAND_FAMS), id = isl.length;
      for (const i of cells) { islOf[i] = id; dom[i] = FAMS.indexOf(fam); const x = i % w, y = (i / w) | 0;
        let inner = true; for (let d = 0; d < 8 && inner; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h || !W.land[ny * w + nx] || W.lake[ny * w + nx]) inner = false; }
        const f = inner && cells.length >= 30 ? 3 : 2; if (tier[i] < f) tier[i] = f; }
      isl.push({ id, cells, size: cells.length, fam, famName: FAM_UA[fam], group: GROUPS_ALL[g] });
    }
    W.islands = isl; W.island = islOf;
    (W.waterBodies || []).forEach((b, id) => { b.fam = b.kind === 'lake' ? 'lake' : pickFam(GI.deep, SEA_FAMS); b.famName = FAM_UA[b.fam]; b.domIdx = FAMS.indexOf(b.fam); });
    for (let i = 0; i < N; i++) if (group[i] >= 13 && W.waterBody && W.waterBody[i] >= 0) dom[i] = W.waterBodies[W.waterBody[i]].domIdx;
    W.dom = dom; W.domNames = FAMS;
    if (cosmos) { // Астракор: чим далі від дерева, тим небезпечніше; за стіною (70 %) не нижче 3, біля обриву до 6; у космосі нуль
      for (let i = 0; i < N; i++) {
        if (W.ocean[i]) { tier[i] = 0; continue; } if (!W.land[i] || W.lake[i]) continue;
        const f = W.fr[i], fl = f > A.WALL_FR ? 3 + Math.min(3, Math.floor((f - A.WALL_FR) / (1 - A.WALL_FR) * 4)) : f > 0.64 ? 2 : f > 0.5 ? 1 : 0;
        if (tier[i] < fl) tier[i] = fl;
      }
      for (const fo of W.fortresses || []) fo.level = W.level[fo.i] + 3;
    }
    W.tier = tier; W.dens = dens;
    // середні рівні регіонів і провінцій
    const sum = W.regions.map(() => 0), cnt = W.regions.map(() => 0), mn = W.regions.map(() => 1e9), mx = W.regions.map(() => 0);
    for (let i = 0; i < N; i++) { const r = W.region[i]; if (r < 0 || !W.land[i] || W.lake[i]) continue; sum[r] += level[i]; cnt[r]++; if (level[i] < mn[r]) mn[r] = level[i]; if (level[i] > mx[r]) mx[r] = level[i]; }
    W.regions.forEach((g, k) => { g.level = cnt[k] ? Math.round(sum[k] / cnt[k]) : level[g.centerCell]; g.levelMin = cnt[k] ? mn[k] : g.level; g.levelMax = cnt[k] ? mx[k] : g.level; });
    W.provinces.forEach(p => { const rs = p.regions.map(id => W.regions[id]); p.level = Math.round(rs.reduce((a, g) => a + g.level, 0) / Math.max(1, rs.length)); p.levelMin = Math.min(...rs.map(g => g.levelMin)); p.levelMax = Math.max(...rs.map(g => g.levelMax)); });
    for (const s of W.settlements) s.level = level[s.i];
  }

  // ---- етап 2: локації ----
  function sites(W) {
    const { w, h } = W, N = w * h, km = W.params.kmPerCell, r = A.Rng.stream(W.params.seed, 'sites'), names = A.Names.make(W.params.seed + '|sites');
    const landCells = []; for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) landCells.push(i);
    const riverCells = []; for (let i = 0; i < N; i++) if (W.river[i] && W.acc[i] > (W.riverThr || 20) * 2.5) riverCells.push(i);
    const bk = (x, y) => ((y / 16) | 0) * 1000 + ((x / 16) | 0), buckets = new Map(), out = [], SP = [7, 9, 11, 18, 32, 60, 110];
    const near = (x, y, d, list) => { for (let by = Math.floor((y - d) / 16); by <= Math.floor((y + d) / 16); by++) for (let bx = Math.floor((x - d) / 16); bx <= Math.floor((x + d) / 16); bx++) for (const s of buckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    const sBuckets = new Map(); for (const s of W.settlements) { const k = bk(s.x, s.y); (sBuckets.get(k) || sBuckets.set(k, []).get(k)).push(s); }
    const nearS = (x, y, d) => { for (let by = Math.floor((y - d) / 16); by <= Math.floor((y + d) / 16); by++) for (let bx = Math.floor((x - d) / 16); bx <= Math.floor((x + d) / 16); bx++) for (const s of sBuckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    const pickIdx = p => p[Math.floor(r() * p.length)];
    const bandits = idx => B.list.map((e, k) => BANDIT.test(e[0]) && e[1] === idx ? k : -1).filter(k => k >= 0);
    const banditPool = [0, 1, 3, 4].map(bandits);
    const NBL = B.list.length, pirates = idx => LIST.map((e, k) => k >= NBL && FAMOF[k] === 'pirate' && e[1] === idx ? k : -1).filter(k => k >= 0), pirPool = [0, 1, 3, 4].map(pirates);
    let curFam = null, famP = 0.82; // домінантна сім'я в точці: більшість мешканців з неї
    const fp = p => { if (!curFam || !p.length || r() > famP) return p; let f = p.filter(x => FAMOF[x] === curFam); if (!f.length) { const kd = LIST[p[0]][1], wt = p[0] >= NBL; f = LIST.map((e, k) => k >= NBL === wt && e[1] === kd && FAMOF[k] === curFam ? k : -1).filter(k => k >= 0); } return f.length ? f : p; }; // немає в групі ландшафту — беремо з будь-якої
    function crew(type, tier, g, i, force) {
      if (!type.mon || tier < 1) return [];
      const bpool = g >= 13 ? pirPool : banditPool; curFam = type.fam || (W.dom[i] === 255 ? null : FAMS[W.dom[i]]); famP = type.fam ? 1 : 0.82;
      let k = force != null ? force : KT[tier]; if (force == null && tier >= 2 && r() < 0.3) k = KT[tier - 1]; if (type.cap != null && k > type.cap) k = type.cap;
      const lead = [], lk = [0, 1, 3, 4].indexOf(k) >= 0 ? k : 1;
      if (type.bandits) {
        const bp = bpool[[0, 1, 3, 4].indexOf(Math.min(lk, 4))] || [];
        const main = bp.length ? pickIdx(bp) : pickIdx(pool(1, g)), cnt = type.big ? 8 + Math.floor(r() * 13) : 3 + Math.floor(r() * 6);
        lead.push(mon(main, cnt, W, i));
        if (type.big || tier >= 3) { const bossK = pickIdx(bpool[3].length ? bpool[3] : pool(3, g)); lead.unshift(mon(bossK, 1, W, i)); }
        return lead;
      }
      const lp = pool(k, g); if (!lp.length) return [];
      const lcount = k <= 1 ? (type.pack ? type.pack[0] + Math.floor(r() * (type.pack[1] - type.pack[0] + 1)) : k === 0 ? 3 + Math.floor(r() * 5) : 2 + Math.floor(r() * 4)) : 1;
      lead.push(mon(pickIdx(fp(lp)), lcount, W, i));
      if (k >= 3) { let ek = k === 3 ? 1 : k - 1, ep = pool(ek, g); if (curFam && ek > 1 && !ep.some(x => FAMOF[x] === curFam)) { ek = 1; ep = pool(1, g); } /* свита з домінантної сім'ї, якщо в неї немає такого сильного */ if (ep.length) lead.push(mon(pickIdx(fp(ep)), ek <= 1 ? (curFam ? 4 : 2) + Math.floor(r() * 4) : 1 + Math.floor(r() * 2), W, i)); if (k >= 5) { const ep2 = pool(1, g); if (ep2.length) lead.push(mon(pickIdx(fp(ep2)), 3 + Math.floor(r() * 4), W, i)); } }
      return lead;
    }
    // окуповані поселення: мешканці-монстри (або бандити); сила за небезпекою навколо
    for (const q of W.settlements) {
      if (q.fate !== 'occupied') continue; const tier = Math.max(3, W.tier[q.i]), g = W.group[q.i];
      q.monsters = crew({ mon: 1, bandits: q.occupier === 'bandits', big: q.rank === 'town', pack: [5, 10] }, tier, g, q.i); const lead = q.monsters[0];
      q.level = lead ? Math.max(1, W.level[q.i] + KIND_BONUS[lead.kindIdx]) : W.level[q.i];
      if (q.occupier === 'monsters') q.order = A.MonOrder.make(A.Rng.stream(W.params.seed, 'order|' + q.id), q); // лад орди: вождь і закони
    }
    // руїни поселень на нічиїх островах охороняє бос (небезпека навколо не нижча за 4)
    for (const q of W.settlements) {
      if (!q.ruined) continue; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = q.x + dx, y = q.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const j = y * w + x, d = Math.hypot(dx, dy); if (d > 3.5 || !W.land[j] || W.lake[j]) continue; const f = d <= 2 ? 4 : 3; if (W.tier[j] < f) W.tier[j] = f; }
      q.monsters = crew({ mon: 1 }, Math.max(4, W.tier[q.i]), W.group[q.i], q.i, 4); const lead = q.monsters[0]; q.level = lead ? Math.max(1, W.level[q.i] + KIND_BONUS[lead.kindIdx]) : W.level[q.i];
    }
    // гарантовані сильні мешканці: міні-боси 1–2 на регіон, боси 2–4 на провінцію, супербос 1 на 2–4 провінції (не менше мінімумів 1–3 і 1 на 3–7); навколо лігва небезпека не нижча за його рівень
    const byReg = W.regions.map(() => []), byProv = W.provinces.map(() => []);
    for (const i of landCells) { const rg = W.region[i]; if (rg >= 0) { byReg[rg].push(i); byProv[W.regions[rg].prov].push(i); } }
    const raise = (x, y, R, floor, wt) => { for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy * w + xx, d = Math.hypot(dx, dy); if (d > R * 1.8 || (W.group[j] >= 13) !== wt || nearS(xx, yy, 4)) continue; const f = d <= R ? floor : floor - 1; if (W.tier[j] < f) W.tier[j] = f; } };
    function force(cells, kind, spacing, R) { // kind: 3 міні-бос, 4 бос, 5 супербос
      let best = -1, bs = -1;
      for (let n = 0; n < 60 && cells.length; n++) {
        const i = cells[Math.floor(r() * cells.length)], x = i % w, y = (i / w) | 0; if (W.group[i] === 255 || W.river[i] || nearS(x, y, 4) || near(x, y, spacing)) continue;
        if (W.fortresses && W.fr[i] < (kind >= 5 ? 0.78 : kind === 4 ? 0.62 : 0.5)) continue; // Астракор: сильні мешканці далеко від дерева
        const sc = W.tier[i] + r() * 1.5; if (sc > bs) { bs = sc; best = i; }
      }
      if (best < 0) return;
      const x = best % w, y = (best / w) | 0; const wt = W.group[best] >= 13; raise(x, y, R, kind, wt); const tier = Math.max(kind, W.tier[best]), g = W.group[best], gname = GROUPS_ALL[g];
      const opts = TYPES.filter(T => T.mon && T.cap == null && !T.river && !!T.water === wt && (!T.ruin || kind >= 4) && !(T.bandits && W.island[best] >= 0) && tier >= T.t[0] && tier <= T.t[1] && (!T.g || T.g.indexOf(gname) >= 0)); if (!opts.length) return;
      let tw = opts.reduce((a, T) => a + T.w, 0), pick = r() * tw, type = opts[0]; for (const T of opts) { pick -= T.w; if (pick <= 0) { type = T; break; } }
      const monsters = crew(type, tier, g, best, KT[kind]), lead = monsters[0];
      const site = { id: out.length, type: type.id, typeName: type.name, cat: type.cat, name: type.name + ' ' + names.town(names.lang()), i: best, x, y, tier: W.tier[best], group: gname, level: lead ? Math.max(1, W.level[best] + KIND_BONUS[lead.kindIdx]) : W.level[best], monsters, forced: true };
      out.push(site); const k = bk(x, y); (buckets.get(k) || buckets.set(k, []).get(k)).push(site);
    }
    for (let q = 0; q < W.provinces.length; q++) { const nb = 2 + Math.floor(r() * 3); for (let n = 0; n < nb; n++) force(byProv[q], 4, 14, 6); }
    const nsb = Math.max(1, Math.round(W.provinces.length / (2 + 2 * r()))), order = W.provinces.map((_, q) => q).sort(() => r() - 0.5);
    for (let n = 0; n < nsb; n++) force(byProv[order[n % order.length]], 5, 40, 8);
    for (let q = 0; q < W.regions.length; q++) { const nm = 1 + (r() < 0.6 ? 1 : 0); for (let n = 0; n < nm; n++) force(byReg[q], 3, 5, 4); }
    // сторожі водойм: мінімуми як на суші (океан: 2–4 боси, міні-боси, супербос; море: 1–2 боси; озеро: міні-бос, велике ще й бос)
    const bodies = W.waterBodies || [], byBody = bodies.map(() => []);
    for (let i = 0; i < N; i++) if (W.group[i] >= 13 && W.waterBody[i] >= 0) byBody[W.waterBody[i]].push(i);
    const fn = (c, kind, sp, R) => { for (const k2 of [1, 0.6, 0.35, 0]) { const n0 = out.length; force(c, kind, sp * k2, R); if (out.length > n0) return; } }; // не вдалося зі звичайною відстанню — розміщуємо ближче
    bodies.forEach((b, id) => {
      const c = byBody[id]; if (c.length < 12) return;
      if (b.kind === 'ocean') { for (let n = 0, m = 2 + Math.floor(r() * 3) + Math.floor(c.length / 4000); n < m; n++) fn(c, 4, 14, 6); fn(c, 5, 40, 8); if (c.length > 3500) fn(c, 5, 40, 8); for (let n = 0, m = 3 + Math.floor(r() * 3) + Math.floor(c.length / 1500); n < m; n++) fn(c, 3, 6, 4); }
      else if (b.kind === 'sea') { for (let n = 0, m = 1 + (r() < 0.5 ? 1 : 0) + Math.floor(c.length / 3000); n < m; n++) fn(c, 4, 12, 5); if (c.length > 400 && r() < 0.5) fn(c, 5, 30, 7); for (let n = 0, m = 2 + Math.floor(r() * 2) + Math.floor(c.length / 800); n < m; n++) fn(c, 3, 6, 4); }
      else { if (c.length >= 15) fn(c, 3, 5, 3); if (c.length >= 60) fn(c, 4, 8, 4); }
    });
    // загальне наповнення: суша й вода окремо; ruin-локації завжди мають боса (нижчу небезпеку навколо піднімаємо)
    const waterCells = []; for (let i = 0; i < N; i++) if (W.group[i] >= 13 && W.waterBody[i] >= 0) waterCells.push(i);
    const place = (i, wantRiver, strict) => {
      const x = i % w, y = (i / w) | 0, g = W.group[i], wt = g >= 13; let tier = W.tier[i]; if (g === 255 || (W.river[i] && !wantRiver)) return false;
      if (strict) { if (tier >= 1 && r() > 0.45 + 0.55 * W.dens[i] / 255) return false; if (tier === 0 && r() > 0.25) return false; }
      const gname = GROUPS_ALL[g], opts = TYPES.filter(T => tier >= T.t[0] && tier <= T.t[1] && (!T.g || T.g.indexOf(gname) >= 0) && !!T.river === wantRiver && !!T.water === wt && !(T.bandits && W.island[i] >= 0));
      if (!opts.length || nearS(x, y, 4)) return false; let tw = opts.reduce((a, T) => a + T.w, 0), pick = r() * tw, type = opts[0]; for (const T of opts) { pick -= T.w; if (pick <= 0) { type = T; break; } }
      if (near(x, y, type.ruin ? Math.max(SP[tier], 18) : W.island[i] >= 0 ? Math.min(SP[tier], 12) : SP[tier])) return false;
      if (type.ruin && tier < 4) { raise(x, y, 2, 4, wt); tier = W.tier[i]; }
      const monsters = crew(type, tier, g, i, type.ruin ? 4 : null), lead = monsters[0];
      const site = { id: out.length, type: type.id, typeName: type.name, cat: type.cat, name: type.name + ' ' + names.town(names.lang()), i, x, y, tier, group: gname, level: lead ? Math.max(1, W.level[i] + KIND_BONUS[lead.kindIdx]) : W.level[i], monsters };
      out.push(site); const k = bk(x, y); (buckets.get(k) || buckets.set(k, []).get(k)).push(site); return true;
    };
    // нічиї острови: боси за розміром і лігва (тип мешканців — домінантна сім'я острова)
    for (const isl of W.islands) {
      const c = isl.cells, n = c.length;
      if (n >= 250) force(c, 5, 30, 6); if (n >= 40) for (let q = 0; q < (n >= 120 ? 2 : 1); q++) force(c, 4, 9, 4); if (n >= 12) for (let q = 0; q < (n >= 60 ? 2 : 1); q++) force(c, 3, 5, 3);
      const want = n < 4 ? 0 : Math.max(1, Math.round(n / 16)); let got = 0; for (let t = 0; t < want * 30 && got < want; t++) if (place(c[Math.floor(r() * c.length)], false, false)) got++;
    }
    const target = Math.round(landCells.length / 130) + out.length;
    for (let t = 0; t < target * 14 && out.length < target; t++) {
      const wantRiver = r() < 0.04 && riverCells.length; place(wantRiver ? riverCells[Math.floor(r() * riverCells.length)] : landCells[Math.floor(r() * landCells.length)], wantRiver, true);
    }
    const targetW = Math.round(waterCells.length / 240) + out.length;
    for (let t = 0; t < targetW * 14 && out.length < targetW && waterCells.length; t++) place(waterCells[Math.floor(r() * waterCells.length)], false, true);
    W.sites = out;
  }

  // що зазвичай водиться на клітині (для підказки): тип за небезпекою, 2 види за хешем ділянки 8×8, щоб не мінялося щокліку
  function encounter(W, i) {
    const tier = W.tier[i], g = W.group[i]; if (!tier || g === 255) return { tier: 0, label: TIERS[0], species: [] };
    const x = i % W.w, y = (i / W.w) | 0, hs = A.Rng.hashSeed(W.params.seed), dm = W.dom && W.dom[i] !== 255 ? W.domNames[W.dom[i]] : null; let p = pool(KT[tier], g); const sp = []; if (dm) { const f = p.filter(q => FAMOF[q] === dm); if (f.length) p = f; }
    if (p.length) { const hh = Math.imul((x >> 3) * 73856093 ^ (y >> 3) * 19349663 ^ hs, 2654435761) >>> 0; for (let k = 0; k < Math.min(2, p.length); k++) sp.push(LIST[p[(hh + k * 7919) % p.length]]); }
    return { tier, label: TIERS[tier], dominant: dm ? FAM_UA[dm] : null, species: sp.map(e => ({ name: e[0], kind: KIND_UA[e[1]], magic: !!e[2], desc: e[4], level: Math.max(1, W.level[i] + KIND_BONUS[e[1]]) })) };
  }
  A.Danger = { TIERS, KIND_UA, CATS, GROUP_UA, TYPES, TYPE_BY, KM_PER_LEVEL, heightM, encounter, famOf: name => { const k = LIST.findIndex(e => e[0] === name); return k < 0 ? null : FAMOF[k]; }, groupName: (W, i) => W.group[i] === 255 ? null : GROUPS_ALL[W.group[i]], FAM_UA };
  (A.stages = A.stages || []).push(danger, sites);
})();
