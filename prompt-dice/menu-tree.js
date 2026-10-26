// Меню параметрів: категорії (рівень 1) → підгрупи (рівень 2) → параметри (картки). Лише подання: промпт збирається з типів (types.js).
// Додати параметр у меню: id у `slots` потрібної підгрупи; не вказаний ніде параметр сам потрапляє в «Інше» (тест menu.test.js це відловить).
// Додати підгрупу чи категорію: об'єкт у MENU_CATS (id стабільні: на них спираються збережені відкриті групи й вибрана підгрупа).
// Колір категорії (--cat) бере палітру сайту (золото, зелений, синій, теплий, рожевий) і лише підсвічує меню й картки.
const MENU_ICONS = {
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.8-3.9 3.4-6 6.5-6s5.7 2.1 6.5 6"/>',
  hair: '<path d="M5 10c0-4.2 3-7 7-7s7 2.8 7 7"/><path d="M5 10c-.6 3.6-.4 7.4 1.4 10M19 10c.6 3.6.4 7.4-1.4 10M9 6.5c-.8 3.2-.8 8.3.4 13.5M15 6.5c.8 3.2.8 8.3-.4 13.5"/>',
  face: '<circle cx="12" cy="12" r="8.6"/><path d="M8.6 14.2c1 1.8 5.8 1.8 6.8 0"/><circle cx="9" cy="10" r=".7" fill="currentColor"/><circle cx="15" cy="10" r=".7" fill="currentColor"/>',
  body: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M7 10l5-2 5 2M9 21l3-6 3 6"/>',
  outfit: '<path d="M8.6 4 4 6.6l2 4 2-1V20h8V9.6l2 1 2-4L15.4 4c-.5 1.6-1.8 2.5-3.4 2.5S9.1 5.6 8.6 4Z"/>',
  gear: '<path d="M6.5 4h11l3 5-8.5 11L3.5 9z"/><path d="M3.5 9h17M9.5 4 8 9l4 11 4-11-1.5-5"/>',
  pose: '<circle cx="14.5" cy="4.6" r="2"/><path d="M11 21l2.2-6-3.2-3 1.8-4.4 4 1.8 3 3.4M11.8 7.6 7.5 9.6 6.4 13"/>',
  camera: '<path d="M3.5 8H7l1.6-2.4h6.8L17 8h3.5V19h-17z"/><circle cx="12" cy="13.2" r="3.6"/>',
  place: '<path d="M3 19.5 9 9.5l4 6 2.2-3 5.8 7z"/><circle cx="17" cy="6.5" r="1.7"/>',
  light: '<circle cx="12" cy="12" r="3.9"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/>',
  fx: '<path d="M10 3.5 11.9 9 17.5 11 11.9 13 10 18.5 8.1 13 2.5 11 8.1 9zM18.2 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  sprite: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  gemini: '<path d="M12 3c.6 5.2 3.8 8.4 9 9-5.2.6-8.4 3.8-9 9-.6-5.2-3.8-8.4-9-9 5.2-.6 8.4-3.8 9-9z"/>',
  other: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
};
const menuIcon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MENU_ICONS[id] || MENU_ICONS.other}</svg>`;

// n: [id, назва, опис, параметри, (розділ: підпис над цією підгрупою й наступними, доки не з'явиться інший)]
const MENU_CATS = [
  { id: 'person', name: 'Персонаж', color: '#c9a766', desc: 'Хто зображений: стать, вік, раса, шкіра, статура, особливі ознаки.', n: [
    ['sexage', 'Стать і вік', 'Стать і віковий діапазон персонажа. Від статі залежать інші варіанти.', ['gender', 'age']],
    ['race', 'Раса й тип', 'Раса або тип істоти та її особливості: роги, крила, хвости, вуха. Для раси з окремим меню особливості підлаштовуються.', ['race', 'raceFeat']],
    ['skin', 'Шкіра, шерсть, тіло', 'Тон і стан шкіри, шерсть, волосся на тілі.', ['skin', 'pl_fur_pattern', 'x_skinstate', 'x_bodyhair', 'n_body']],
    ['build', 'Статура і зріст', 'Зріст, постава, комплекція, м’язи.', ['build', 'x_height']],
    ['marks', 'Особливі ознаки', 'Шрами, татуювання, родимки, аура; вільний опис тіла загалом.', ['permFeat', 'zt_body', 'n_text']],
  ] },
  { id: 'hair', name: 'Волосся', color: '#cf9a6a', desc: 'Довжина, колір, зачіска, чубчик, пасма й прикраси для волосся.', n: [
    ['base', 'Довжина й колір', 'Основа волосся. Колір обирається палітрою або двоколірними варіантами.', ['hairLen', 'hairColor']],
    ['style', 'Зачіска', 'Укладка, хвости, коси, пучки, текстура волосся.', ['hairStyle']],
    ['detail', 'Чубчик, пасма, прикраси', 'Чубчик, окремі пасма, шпильки, стрічки й ефекти волосся; вільний опис.', ['hairDetail', 'zt_hair', 'zt_fringe']],
  ] },
  { id: 'face', name: 'Обличчя', color: '#d596a0', desc: 'Риси обличчя, вираз, емоції та макіяж.', n: [
    ['shape', 'Форма й шкіра обличчя', 'Овал обличчя, шкіра обличчя, загальний вигляд голови.', ['x_faceshape', 'x_complex', 'zt_face', 'zt_head'], 'Риси обличчя'],
    ['brows', 'Лоб і брови', 'Форма й густота брів, лоб.', ['pl_brows', 'zt_brows', 'zt_forehead']],
    ['eyes', 'Очі', 'Колір, форма, зіниці, склера, вії й символи в очах.', ['eyeColor', 'eyeDetail', 'pl_eye_symbols', 'zt_eyes']],
    ['nose', 'Ніс', 'Форма носа та його особливості.', ['pl_nose_shape', 'pl_nose_extra', 'zt_nose']],
    ['cheeks', 'Щоки й вуха', 'Щоки, ямочки, веснянки, вуха.', ['x_cheeks', 'zt_cheeks', 'zt_ears']],
    ['mouth', 'Рот, губи, зуби', 'Губи, зуби, язик та їхні особливості.', ['pl_lips_look', 'pl_lips_extra', 'pl_teeth', 'pl_tongue', 'zt_mouth']],
    ['jaw', 'Підборіддя, щелепа, борода', 'Підборіддя, щелепа, борода й вуса.', ['pl_chin_shape', 'x_chin2', 'x_jaw', 'x_beard', 'zt_chin', 'zt_jaw']],
    ['neck', 'Шия', 'Форма шиї.', ['x_neckshape', 'zt_neck']],
    ['emotion', 'Емоція', 'Яку емоцію передає персонаж.', ['emotion'], 'Вираз і макіяж'],
    ['expr', 'Вираз обличчя й очей', 'Міміка обличчя та вираз очей.', ['expression', 'eyeExpr', 'n_expr']],
    ['makeup', 'Макіяж', 'Макіяж обличчя, очей і губ.', ['makeup']],
  ] },
  { id: 'body', name: 'Тіло', color: '#8dbf95', desc: 'Анатомія за ділянками: торс, таз, руки, ноги. Ту саму ділянку можна вибрати й на манекені.', n: [
    ['torso', 'Торс: груди, живіт, талія', 'Груди, живіт, талія та їхні деталі.', ['breasts', 'x_chestdet', 'x_belly', 'x_bellydet', 'x_waist', 'zt_torso', 'zt_chest', 'zt_belly', 'zt_waist']],
    ['pelvis', 'Таз, стегна, сідниці', 'Форма таза, стегон і сідниць.', ['hips', 'x_pelvis', 'x_glutes', 'zt_pelvis']],
    ['arms', 'Руки й кисті', 'Загальний вигляд рук і ніг, плечі, плече, кисті, нігті, вільний опис кожної ділянки руки.', ['limbs', 'x_shoulder', 'x_upperarm', 'x_handshape', 'nails', 'zt_shoulders', 'zt_arm', 'zt_upperarm', 'zt_elbow', 'zt_forearm', 'zt_wrist', 'zt_hand', 'zt_fingers']],
    ['legs', 'Ноги й стопи', 'Форма ніг, стегно, стопа, вільний опис кожної ділянки ноги.', ['x_legshape', 'x_thigh', 'x_footshape', 'zt_leg', 'zt_thigh', 'zt_knee', 'zt_shin', 'zt_ankle', 'zt_foot', 'zt_toes']],
  ] },
  { id: 'outfit', name: 'Одяг', color: '#88a9d6', desc: 'Комплект і стан одягу, а також одяг по частинах тіла.', n: [
    ['set', 'Комплект і стан', 'Весь костюм чи броня, його стан, відкриті ділянки тіла.', ['outfit', 'outState', 'bareParts', 'n_level', 'n_nude', 'n_undress'], 'Загальне'],
    ['upper', 'Верх', 'Верхній одяг, топи, білизна, спина (крила, ноша).', ['pl_upper_body', 'pl_chest_wear', 'x_torsowings', 'n_lingerie'], 'По частинах тіла'],
    ['lower', 'Низ', 'Штани, спідниці, панчохи, одяг на стегнах.', ['pl_lower_body', 'legwear', 'x_thighdet']],
    ['sleeves', 'Руки: рукави, рукавиці', 'Рукавиці, рукави, плечі, лікті, передпліччя, зап’ястя, пальці.', ['gloves', 'x_shouldress', 'x_upperdeco', 'x_elbow', 'x_forearm', 'x_wrist', 'x_fingers']],
    ['shoes', 'Ноги: взуття', 'Взуття, коліна, гомілки, щиколотки, пальці ніг.', ['footwear', 'x_knee', 'x_shin', 'x_ankle', 'x_toes']],
    ['hat', 'Голова: головні убори', 'Капелюхи, шоломи, корони, прикраси на лобі.', ['headwear', 'x_forehead', 'zt_hat']],
  ] },
  { id: 'gear', name: 'Аксесуари й зброя', color: '#a99bd1', desc: 'Прикраси, аксесуари, зброя та магія в руках.', n: [
    ['acc', 'Прикраси й аксесуари', 'Намисто, сережки, окуляри, пояси, браслети й аксесуари для рук.', ['accessories', 'pl_hand_acc', 'n_acc']],
    ['weapon', 'Зброя й магія', 'Що персонаж тримає: зброя чи магія. Залежить від тематики.', ['weapon']],
  ] },
  { id: 'pose', name: 'Поза й дія', color: '#7fc0b8', desc: 'Положення тіла, рук і ніг, погляд, дія та взаємодія.', n: [
    ['body', 'Загальна поза', 'Поза всього тіла.', ['pose', 'pl_body_pose', 'x_posefull', 'zt_pose', 'n_pose']],
    ['limbs', 'Руки, ноги, голова, погляд', 'Положення рук і ніг, нахил голови, куди дивиться персонаж.', ['armPos', 'legPos', 'pl_hand_pose', 'pl_leg_pose', 'x_head', 'gaze']],
    ['action', 'Дія й взаємодія', 'Що робить персонаж і з чим чи ким взаємодіє.', ['action', 'interaction']],
  ] },
  { id: 'camera', name: 'Камера й кадр', color: '#a3b5c2', desc: 'Ракурс, план, кадрування, об’єктив і перспектива.', n: [
    ['angle', 'Ракурс і кадр', 'Ракурс камери, план, поворот до глядача, місце над головою.', ['cameraAngle', 'pl_framing', 'pl_facing', 'framing', 'gFraming']],
    ['lens', 'Об’єктив і перспектива', 'Тип об’єктива, перспектива; вільний опис кадру.', ['x_lens', 'zt_frame']],
  ] },
  { id: 'place', name: 'Локація й фон', color: '#a8bf87', desc: 'Де відбувається сцена: місце, фон, передній план.', n: [
    ['where', 'Місце і фон', 'Інтер’єр чи екстер’єр, набір тегів фону, розмиття й глибина.', ['io', 'background', 'x_bgmood', 'zt_bg', 'n_set'], 'Загальне'],
    ['ready', 'Готові фони', 'Приміщення, вулиця, фентезі, фантастика, сучасність.', ['pl_bg_indoor', 'pl_bg_outdoor', 'x_bgfant', 'x_bgscifi', 'x_bgreal'], 'Готові варіанти'],
    ['plain', 'Простий фон', 'Однотонний фон, колір, візерунок.', ['pl_bg_plain', 'pl_bg_color', 'pl_bg_pattern']],
    ['fore', 'Передній план', 'Що перед персонажем чи камерою.', ['fgObjects']],
  ] },
  { id: 'light', name: 'Світло й атмосфера', color: '#dab560', desc: 'Час доби, погода, освітлення, тіні, настрій і кольорова гама.', n: [
    ['time', 'Час доби й погода', 'Коли відбувається сцена, яка погода й небо.', ['timeOfDay', 'weather']],
    ['lighting', 'Освітлення й тіні', 'Джерела світла, відблиски, тіні.', ['lighting', 'shadows']],
    ['mood', 'Атмосфера й кольори', 'Настрій сцени та загальна кольорова гама.', ['atmosphere', 'colorScheme']],
  ] },
  { id: 'fx', name: 'Ефекти й деталі', color: '#c99ac4', desc: 'Магічні й візуальні ефекти, матеріали, дрібні деталі, фінальні акценти.', n: [
    ['effects', 'Ефекти й магія', 'Частинки, сяйво, магічні прояви. Залежать від тематики.', ['effects']],
    ['details', 'Матеріали й деталі', 'Матеріали, текстури, дрібні деталі, фінальні акценти.', ['materials', 'details', 'finalAccent']],
  ] },
  { id: 'sprite', name: 'Спрайт-лист', color: '#c2b076', desc: 'Як намалювати лист для скелетної анімації: ракурси, проєкція, частини, розкладка.', n: [
    ['views', 'Ракурси', 'З яких боків показати персонажа.', ['sprViews']],
    ['camera', 'Камера і поза', 'Висота камери, тип проєкції, базова поза.', ['sprElev', 'sprPose']],
    ['parts', 'Частини для розбірки', 'Які частини тіла й одягу намалювати окремо для кожного ракурсу.', ['sprParts']],
    ['sheet', 'Розкладка й фон листа', 'Як розташувати ракурси й частини; фон листа.', ['sprLayout', 'sprBg']],
  ] },
  { id: 'gemini', name: 'Запит до Gemini', color: '#9d9aa6', desc: 'Що саме просимо в Gemini: лише текст промпта, одразу зображення чи обидва.', n: [
    ['task', 'Що просимо', 'Режим відповіді Gemini.', ['gTask']],
  ] },
];

// Усі id, названі в меню (решта параметрів типу потрапляє у запасну категорію «Інше»)
const MENU_DEFINED = new Set(MENU_CATS.flatMap(c => c.n.flatMap(n => n[3])));
// Параметри 18+ (nsfw-data.js) розкладено по звичайних підгрупах; їх видно, лише коли теги 18+ увімкнено в налаштуваннях
const MENU_ADULT = new Set(typeof NSFW_IDS !== 'undefined' ? NSFW_IDS : []);
const isAdultSlot = id => MENU_ADULT.has(id);

// Будує меню типу: [{id, name, icon, color, desc, nodes: [{id, cat, name, desc, sec, slots, texts, all}]}].
// model: sdxl | flux | gemini; o: {adult: показувати параметри 18+ (n_*) у своїх підгрупах}.
// slots — звичайні параметри, texts — вільні поля «Свій опис» (їх показують окремим блоком у підгрупі), all — обидва списки.
function menuBuild(typeId, model, o) {
  o = o || {};
  const t = TYPES[typeId], pixel = t.kind === 'pixel';
  const inType = new Set(t.sections.flatMap(s => s.s));
  const vis = id => { const sl = SLOTS[id]; return !!sl && inType.has(id) && (pixel || !sl.models || sl.models.includes(model)) && (o.adult || !MENU_ADULT.has(id)); };
  const cats = [];
  MENU_CATS.forEach(c => {
    const nodes = [];
    let curSec = '';
    c.n.forEach(([nid, name, desc, ids, sec]) => {
      if (sec) curSec = sec;
      const all = ids.filter(vis);
      if (!all.length) return;
      nodes.push({ id: c.id + '.' + nid, cat: c.id, name, desc, sec: curSec, slots: all.filter(id => !SLOTS[id].text), texts: all.filter(id => SLOTS[id].text), all });
    });
    if (nodes.length) cats.push({ id: c.id, name: c.name, icon: c.id, color: c.color, desc: c.desc, nodes });
  });
  // параметри, яких немає в меню (наприклад, піксель-арт типи): запасна категорія
  const rest = [...inType].filter(id => !MENU_DEFINED.has(id) && vis(id));
  if (rest.length) {
    const name = pixel ? 'Зерно дизайну' : 'Інше';
    cats.push({ id: 'other', name: pixel ? 'Параметри' : 'Інше', icon: 'other', color: '#c9a766', desc: pixel ? 'Параметри, з яких збирається промпт цього типу.' : 'Параметри, яких поки немає в інших групах.',
      nodes: [{ id: 'other.rest', cat: 'other', name, desc: '', sec: '', slots: rest.filter(id => !SLOTS[id].text), texts: rest.filter(id => SLOTS[id].text), all: rest }] });
  }
  return cats;
}
const menuNodes = cats => cats.flatMap(c => c.nodes);
