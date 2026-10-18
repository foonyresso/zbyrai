// Параметри (слоти), типи промптів, моделі, шаблони Gemini, стандартні налаштування.
/* =====================================================================
   СЛОТИ (параметри)
   ===================================================================== */
const SLOTS = {};
function def(id, label, en, o) {
  SLOTS[id] = Object.assign({ id, label, en, kind: 'single', n: [1, 1], p: 1, opts: () => [] }, o);
}
const byG = (f, m) => c => (c.g === 'm' ? m : f);
const th = k => c => THEMES[c.theme][k];
const wpick = arr => { const t = arr.reduce((a, x) => a + x[1], 0); let r = Math.random() * t; for (const [v, w] of arr) { if ((r -= w) < 0) return v; } return arr[0][0]; };

/* ---- Персонаж ---- */
def('gender', 'Стать', 'Gender', { opts: () => ['1girl', '1boy'], gen: () => [Math.random() < 0.72 ? '1girl' : '1boy'], sd: v => v + ', solo', nl: v => (v === '1boy' ? 'male, one man' : 'female, one woman') });
def('age', 'Вік (дорослі)', 'Age', { opts: byG(G.age_f, G.age_m) });
def('race', 'Раса / тип', 'Race', { opts: byG(G.race_f, G.race_m) });
def('raceFeat', 'Расові особливості', 'Racial features', { kind: 'multi', n: [1, 2], p: 0.6, opts: () => G.raceFeat });
def('skin', 'Шкіра', 'Skin', { opts: byG(G.skin_f, G.skin_m) });
def('hairLen', 'Волосся: довжина', 'Hair length', { opts: () => G.hairLen });
def('hairColor', 'Волосся: колір', 'Hair color', { opts: () => G.hairColor });
def('hairStyle', 'Зачіска', 'Hairstyle', { opts: () => G.hairStyle });
def('hairDetail', 'Волосся: деталі', 'Hair details', { kind: 'multi', n: [1, 2], p: 0.8, opts: () => G.hairDetail });
def('eyeColor', 'Очі: колір', 'Eye color', { opts: () => G.eyeColor });
def('eyeDetail', 'Очі: деталі / зіниці', 'Eye details', { kind: 'multi', n: [1, 2], p: 0.85, opts: () => G.eyeDetail });
def('emotion', 'Емоція', 'Emotion', { opts: () => G.emotion });
def('expression', 'Вираз обличчя', 'Facial expression', { opts: () => G.expression });
def('eyeExpr', 'Вираз очей', 'Eye expression', { opts: () => G.eyeExpr });
def('makeup', 'Макіяж', 'Makeup', { kind: 'multi', n: [1, 3], p: c => (c.g === 'm' ? 0.25 : 0.75), opts: byG(G.makeup_f, G.makeup_m) });
def('nails', 'Нігті', 'Nails', { p: c => (c.g === 'm' ? 0.3 : 0.6), opts: byG(G.nails_f, G.nails_m) });
def('breasts', 'Груди / торс', 'Chest', { opts: () => G.breastsF_all, gen: c => (c.g === 'm' ? [] : [wpick(G.breastsF)]) });
def('hips', 'Стегна / сідниці', 'Hips', { opts: byG(G.hips_f, G.hips_m) });
def('limbs', 'Руки та ноги', 'Arms and legs', { opts: byG(G.limbs_f, G.limbs_m) });
def('build', 'Комплекція', 'Body build', { kind: 'multi', n: [2, 3], opts: byG(G.build_f, G.build_m) });
def('permFeat', 'Шрами, татуювання, аура', 'Permanent features', { kind: 'multi', n: [1, 2], p: 0.5, opts: () => G.permFeat });

/* ---- Одяг / зброя ---- */
def('weapon', 'Зброя / магія', 'Weapon or magic', { p: 0.85, opts: th('weapon') });
def('outfit', 'Одяг / броня (комплект)', 'Outfit', { opts: c => (c.g === 'm' ? THEMES[c.theme].outM : THEMES[c.theme].outF) });
def('outState', 'Стан одягу', 'Clothing condition', { p: 0.4, opts: () => G.outState });
def('legwear', 'Панчохи / штани', 'Legwear', { p: c => (c.g === 'm' ? 0.5 : 0.75), opts: byG(G.legwear_f, G.legwear_m) });
def('footwear', 'Взуття', 'Footwear', { p: 0.9, opts: () => G.footwear });
def('bareParts', 'Відкриті ділянки тіла', 'Exposed body areas', { kind: 'multi', n: [1, 3], p: c => (c.g === 'm' ? 0.4 : 0.9), opts: byG(G.bareParts_f, G.bareParts_m) });
def('gloves', 'Рукавиці / рукави', 'Gloves and sleeves', { p: 0.6, opts: () => G.gloves });
def('headwear', 'Головний убір', 'Headwear', { p: 0.5, opts: () => G.headwear });
def('accessories', 'Аксесуари / прикраси', 'Accessories', { kind: 'multi', n: [1, 3], p: 0.9, opts: () => G.accessories });

/* ---- Поза / камера ---- */
def('gFormat', 'Формат кадру', 'Image format', { models: ['flux', 'gemini'], opts: () => NLP.gFormat });
def('gFraming', 'Кадрування (місце над головою)', 'Framing', { models: ['flux', 'gemini'], opts: () => NLP.gFraming });
def('cameraAngle', 'Ракурс камери', 'Camera angle', { opts: () => G.cameraAngle });
def('framing', 'Кадр', 'Shot', { models: ['sdxl'], opts: () => G.framing });
def('gaze', 'Напрямок погляду', 'Gaze direction', { opts: () => G.gaze });
def('pose', 'Поза', 'Pose', { opts: () => G.pose });
def('armPos', 'Положення рук', 'Arm position', { p: 0.85, opts: () => G.armPos });
def('legPos', 'Положення ніг', 'Leg position', { p: 0.7, opts: () => G.legPos });
def('action', 'Дія / рух', 'Action', { p: 0.8, opts: () => G.action });
def('interaction', 'Взаємодія', 'Interaction', { p: 0.6, opts: () => G.interaction });

/* ---- Фон / світло ---- */
def('io', 'Інтер’єр / екстер’єр', 'Indoors or outdoors', { opts: () => G.io });
def('background', 'Фон (5–8 тегів)', 'Background', { kind: 'multi', n: [5, 8], opts: c => [...THEMES[c.theme].bg, ...G.bgGeneric] });
def('fgObjects', 'Передній план', 'Foreground', { models: ['flux', 'gemini'], p: 0.8, opts: () => NLP.fgObjects });
def('effects', 'Ефекти / магія', 'Effects', { kind: 'multi', n: [1, 3], opts: th('fx') });
def('timeOfDay', 'Час доби', 'Time of day', { opts: () => G.timeOfDay });
def('weather', 'Погода / небо', 'Weather and sky', { p: 0.6, opts: () => G.weather });
def('lighting', 'Освітлення (4–7 тегів)', 'Lighting', { kind: 'multi', n: [4, 7], opts: () => G.lighting });
def('shadows', 'Тіні / відблиски', 'Shadows and highlights', { models: ['flux', 'gemini'], p: 0.8, opts: () => NLP.shadows });
def('atmosphere', 'Атмосфера', 'Atmosphere', { models: ['flux', 'gemini'], opts: () => NLP.atmosphere });
def('colorScheme', 'Кольорова гама', 'Color scheme', { models: ['flux', 'gemini'], opts: () => NLP.colorScheme });
def('materials', 'Матеріали / текстури', 'Materials and textures', { models: ['flux', 'gemini'], kind: 'multi', n: [1, 2], opts: () => NLP.materials });
def('details', 'Дрібні деталі', 'Fine details', { models: ['flux', 'gemini'], kind: 'multi', n: [1, 3], opts: () => NLP.details });
def('finalAccent', 'Фінальні акценти', 'Final accents', { models: ['flux', 'gemini'], p: 0.8, opts: () => NLP.finalAccent });

/* ---- Gemini: що просимо ---- */
const GEM_TASKS = {
  'Написати текст промпта': { task: 'Write ONE highly detailed, ready-to-use image-generation prompt for the subject described in the BRIEF below.', out: 'Output only the finished prompt, with no headings or commentary.' },
  'Одразу згенерувати зображення': { task: 'Generate the image described by the BRIEF below.', out: 'Output only the image.' },
  'Спочатку промпт, потім зображення': { task: 'First write ONE highly detailed image-generation prompt for the subject described in the BRIEF below, then generate the image from that prompt.', out: 'Show the prompt first, then the image.' },
};
def('gTask', 'Що просимо в Gemini', 'Task', { models: ['gemini'], opts: () => Object.keys(GEM_TASKS), gen: () => [Object.keys(GEM_TASKS)[0]] });

/* ---- Спрайт-лист ---- */
const SPR_VIEW_SD = { 'front view': 'front_view', 'back view': 'from_behind', 'side view (right profile)': 'from_side, facing_right', 'side view (left profile)': 'from_side, facing_left', 'three-quarter front view': 'three-quarter_view', 'three-quarter back view': 'from_behind, three-quarter_view' };
def('sprViews', 'Ракурси', 'Views to draw', {
  kind: 'multi', opts: () => SPR.views,
  gen: () => ['front view', 'back view', 'side view (right profile)', ...sample(['three-quarter front view', 'three-quarter back view', 'side view (left profile)'], rnd(3))],
  sd: v => SPR_VIEW_SD[v] || hum(v),
});
def('sprElev', 'Висота камери / тип проєкції', 'Camera elevation', { opts: () => SPR.elev.map(x => x[0]), sd: v => (SPR.elev.find(x => x[0] === v) || [0, v])[1] });
def('sprPose', 'Базова поза', 'Base pose', { opts: () => SPR.pose, sd: v => (/T-pose/.test(v) ? 't-pose' : /A-pose/.test(v) ? 'a-pose?'.replace('?', '') : 'standing') });
def('sprParts', 'Частини для розбірки (на кожен ракурс)', 'Separated parts to draw for each view', {
  kind: 'multi', opts: () => SPR.parts,
  gen: () => [...SPR.partsCore, ...sample(SPR.partsExtra, 2 + rnd(3))],
  sdAll: vals => ['separated_body_parts?'.replace('?', ''), 'reference_sheet', ...vals.map(v => v.replace(/[^a-z]+/gi, '_').replace(/^_|_$/g, '').toLowerCase())],
});
def('sprLayout', 'Розкладка листа', 'Sheet layout', { opts: () => SPR.layout, sd: () => '' });
def('sprFormat', 'Формат аркуша', 'Sheet format', { models: ['flux', 'gemini'], opts: () => ['16:9 wide landscape', '3:2 landscape', '4:3 landscape', '1:1 square'] });
def('sprBg', 'Фон листа', 'Sheet background', { opts: () => SPR.bg, sd: v => (/green/.test(v) ? 'green_background' : /magenta/.test(v) ? 'pink_background' : /grey/.test(v) ? 'grey_background' : 'white_background') });

/* ---- Піксель-арт ігрові типи ---- */
const PXL = [
  ['body', 'План тіла', 'Body plan', 'bodyBase'], ['bodyTwist', 'Особливість тіла', 'Body twist', 'bodyTwist', 0.7],
  ['material', 'Матеріал / поверхня', 'Material', 'material'], ['motif', 'Тема / походження', 'Theme', 'motif'],
  ['detail', 'Особлива деталь', 'Signature detail', 'detail'], ['attack', 'Атака / механіка', 'Signature attack', 'attack'],
  ['mood', 'Характер', 'Personality', 'mood'],
  ['vfxEffect', 'Тип ефекту', 'Effect', 'vfxEffect'], ['vfxEnergy', 'Стихія / енергія', 'Element', 'vfxEnergy'],
  ['vfxMotion', 'Рух / форма', 'Motion', 'vfxMotion'], ['vfxExtra', 'Нюанс', 'Extra detail', 'vfxExtra'],
  ['uiFrame', 'Конструкція рамок', 'Frame construction', 'uiFrame'], ['uiOrnament', 'Орнамент', 'Ornament', 'uiOrnament'],
  ['iconSubject', 'Що зображає', 'Icon meaning', 'iconSubject'], ['iconTreat', 'Подача', 'Treatment', 'iconTreat'],
  ['lootMod', 'Властивість предмета', 'Item quality', 'lootMod'], ['lootBase', 'Предмет', 'Item', 'lootBase'],
];
PXL.forEach(([id, label, en, pool, p]) => def('px_' + id, label, en, { opts: () => POOL[pool], p: p || 1 }));
def('px_palette', 'Палітра', 'Palette', {
  kind: 'multi', n: [3, 3], opts: () => POOL.color,
  gen: () => { const c = sample(POOL.color, 3); return [pick(POOL.palPattern).replace('{a}', c[0]).replace('{b}', c[1]).replace('{c}', c[2])]; },
  fmt: v => (v.length === 3 ? `dominant ${v[0]}, secondary ${v[1]}, small ${v[2]} accents` : v.join(', ')),
  uaFmt: v => (typeof uaPalette === 'function' ? uaPalette(v) : null),
});
const PX = ids => ids.map(i => 'px_' + i);

/* =====================================================================
   ТИПИ (що створюємо)
   ===================================================================== */
const S1 = ['gender', 'age', 'race', 'raceFeat', 'skin', 'hairLen', 'hairColor', 'hairStyle', 'hairDetail', 'eyeColor', 'eyeDetail', 'emotion', 'expression', 'eyeExpr', 'makeup', 'nails', 'breasts', 'hips', 'limbs', 'build', 'permFeat'];
const S2 = ['weapon', 'outfit', 'outState', 'legwear', 'footwear', 'bareParts', 'gloves', 'headwear', 'accessories'];
const GEMSEC = { t: '⚙ Запит до Gemini', e: '', s: ['gTask'], models: ['gemini'], meta: true };
const themeLine = () => [['Theme / genre', THEMES[curTheme()].nl]];

const TYPES = {
  char: {
    kind: 'multi', icon: '👩', name: 'Персонаж (арт)', desc: 'Ілюстрація персонажа: повний опис зовнішності, одягу, пози, фону',
    sections: [
      { t: '1 · Персонаж', e: 'Character', s: S1, nlPre: themeLine },
      { t: '2 · Одяг, зброя, аксесуари', e: 'Outfit, weapon and accessories', s: S2 },
      { t: '3 · Поза, ракурс, дія', e: 'Pose, camera and framing', s: ['gFormat', 'gFraming', 'cameraAngle', 'framing', 'gaze', 'pose', 'armPos', 'legPos', 'action', 'interaction'] },
      { t: '4 · Фон, ефекти, світло', e: 'Setting, effects and lighting', s: ['io', 'background', 'fgObjects', 'effects', 'timeOfDay', 'weather', 'lighting', 'shadows'] },
      { t: '5 · Атмосфера і деталі (Flux / Gemini)', e: 'Mood and finishing details', s: ['atmosphere', 'colorScheme', 'materials', 'details', 'finalAccent'] },
      GEMSEC,
    ],
    sdGroups: [{ sec: 0 }, { sec: 1 }, { sec: 2, pre: () => splitTags(st.settings.always.char) }, { sec: 3, pre: () => [THEMES[curTheme()].tag] }],
    fluxPre: 'A highly detailed illustration of a single character.',
  },
  sprite: {
    kind: 'multi', icon: '🧩', name: 'Спрайт-лист: ракурси + частини', desc: 'Персонаж з усіх боків і розібраний на частини (голова, тулуб, руки, ноги, зброя, одяг) для скелетної анімації',
    sections: [
      { t: '1 · Персонаж', e: 'Character', s: S1, nlPre: themeLine },
      { t: '2 · Одяг, зброя, аксесуари', e: 'Outfit, weapon and accessories', s: S2 },
      { t: '3 · Спрайт: ракурси, камера, частини', e: 'Sprite sheet specification', s: ['sprViews', 'sprElev', 'sprPose', 'sprParts', 'sprLayout', 'sprBg', 'sprFormat'] },
      GEMSEC,
    ],
    sdGroups: [{ sec: 0 }, { sec: 1, pre: () => [THEMES[curTheme()].tag] }, { sec: 2, pre: () => splitTags(st.settings.always.sprite) }],
    fluxPre: 'A professional game character sprite sheet for 2D animation: the same character shown in every requested view with identical proportions, colors and scale, and each view accompanied by its disassembled body parts as separate cut-out pieces, on a plain flat background.',
  },
  scene: {
    kind: 'multi', icon: '🏞️', name: 'Локація / фон (без персонажа)', desc: 'Пейзаж, інтер’єр чи природа: тема, світло, погода, ефекти',
    sections: [
      { t: '1 · Локація', e: 'Location', s: ['io', 'background', 'fgObjects'], nlPre: themeLine },
      { t: '2 · Камера і світло', e: 'Camera and lighting', s: ['gFormat', 'cameraAngle', 'timeOfDay', 'weather', 'lighting', 'shadows'] },
      { t: '3 · Ефекти і настрій', e: 'Effects and mood', s: ['effects', 'atmosphere', 'colorScheme', 'materials', 'details', 'finalAccent'] },
      GEMSEC,
    ],
    sdGroups: [{ sec: 0, pre: () => [THEMES[curTheme()].tag, ...splitTags(st.settings.always.scene)] }, { sec: 1 }, { sec: 2 }],
    fluxPre: 'A highly detailed environment illustration with no people in it.',
  },
};
const PXL_TYPES = {
  boss: { icon: '👹', name: 'Бос', slots: ['body', 'material', 'motif', 'detail', 'attack', 'mood', 'palette'], desc: 'Великий бос для 2D гри' },
  bossParts: { icon: '🦴', name: 'Бос по частинах', slots: ['body', 'material', 'motif', 'detail', 'attack', 'palette'], desc: 'Розібраний на частини для скелетної анімації' },
  monster: { icon: '🐛', name: 'Звичайний монстр', slots: ['body', 'material', 'motif', 'detail', 'mood', 'palette'], desc: 'Рядовий ворог' },
  vfx: { icon: '✨', name: 'Спецефект', slots: ['vfxEffect', 'vfxEnergy', 'vfxMotion', 'vfxExtra', 'palette'], desc: 'Кадри анімації ефекту' },
  ui: { icon: '🪟', name: 'UI-кіт', slots: ['uiFrame', 'motif', 'material', 'uiOrnament', 'palette'], desc: 'Рамки, кнопки, смуги, слоти' },
  icon: { icon: '🔷', name: 'Іконка 32x32', slots: ['iconSubject', 'iconTreat', 'motif', 'material', 'palette'], desc: 'Іконка вміння чи стану' },
  loot: { icon: '⚔️', name: 'Предмет / лут 32x32', slots: ['lootMod', 'lootBase', 'material', 'motif', 'detail', 'palette'], desc: 'Предмет інвентарю' },
};
for (const [k, v] of Object.entries(PXL_TYPES)) {
  TYPES['px_' + k] = { kind: 'pixel', tpl: k, icon: v.icon, name: v.name + ' (піксель-арт)', short: v.name, desc: v.desc, sections: [{ t: 'Seed traits', e: 'Seed traits', s: PX(v.slots) }] };
}
const MODELS = {
  sdxl: { icon: '🏷️', name: 'Stable Diffusion XL', desc: 'Теги Danbooru, 4 групи в рядках + негативний промпт' },
  flux: { icon: '🌀', name: 'Flux', desc: 'Жива мова: по реченню на групу параметрів, без тегів і без негативного промпта' },
  gemini: { icon: '💎', name: 'Gemini', desc: 'Інструкція для Gemini: написати промпт або одразу намалювати' },
};

/* =====================================================================
   ШАБЛОНИ ДЛЯ GEMINI
   ===================================================================== */
const GEM_TPL = {
  char: `{TASK}

Write in natural language (complete sentences), not Danbooru tags or keyword lists.

RULES
- Structure the description in exactly five consecutive blocks, with no headings: (1) character appearance, (2) accessories and personal items, (3) clothing, (4) pose, viewpoint, framing and composition, (5) background, environment, effects and lighting.
- Every trait in the BRIEF is mandatory. Where the BRIEF is silent, invent fresh, specific, original details that fit the character; avoid clichés and default archetypes.
- Describe real visible features precisely instead of vague phrases such as "epic", "beautiful background" or "cinematic lighting".
- If the legs or arms are visible, the figure is tall and slender with thin arms and thin legs. Keep any unusual body proportions from the BRIEF.
- Describe the pose limb by limb (torso, shoulders, hips, head, gaze direction separately, arms, hands, legs, feet), the orientation of the body, and which parts are visible because of it.
- Framing: the head must never touch or approach the top edge. Use a wide shot with a huge empty background above the character and extreme negative space at the top; state exactly where the head and the lower body sit relative to the frame edges and how much empty space surrounds the character.
- The background must never be a plain color or a simple gradient: invent a complete, detailed setting with foreground, middle ground and background layers, and a lighting scheme designed for this specific character.
- Ignore any text, watermarks or logos. Do not mention these rules or your process. {OUT}

STYLE: {STYLE}

BRIEF
{BRIEF}`,
  sprite: `{TASK}

The result is a game-ready character design / sprite sheet for 2D animation.

RULES
- Draw the SAME character in every requested view with identical proportions, colors, costume details and scale. All views share one camera elevation and must be clean and strict (no extra perspective beyond what the requested camera elevation implies).
- For every view, also draw that view's separated body parts as independent pieces on the same sheet: each piece drawn whole, including areas normally hidden by overlap (for example the torso under the arm, the upper arm under shoulder armor, the leg under a skirt), with clean silhouettes and obvious joint ends so it can be cut out and rebuilt in a skeletal 2D animation rig. Head, torso, arms, hands, legs and feet are always separate; the weapon, hanging cloth, cape and other loose items are separate pieces too. If the BRIEF has no separated parts line, draw only the assembled views.
- Keep every part at the same scale and lighting direction as the assembled figure, with clear spacing and no overlap between pieces. No text, labels or UI.
- Use the plain flat background specified in the BRIEF (this overrides any scenic background); no ground shadows.
- If legs or arms are visible, the figure is tall and slender with thin arms and thin legs unless the BRIEF says otherwise.
- Ignore any text, watermarks or logos. Do not mention these rules. {OUT}

STYLE: {STYLE}

BRIEF
{BRIEF}`,
  scene: `{TASK}

Write in natural language (complete sentences), not tags. The picture contains NO characters or people.

RULES
- Every trait in the BRIEF is mandatory. Where the BRIEF is silent, invent fresh, specific, original details; avoid clichés.
- Describe real visible features and their spatial arrangement (left, right, near, far, above, below) instead of vague phrases such as "epic" or "beautiful scenery".
- Layer the scene into foreground, middle ground and background; describe the light direction, shadows, highlights, colors and any effects precisely.
- Leave a large calm area of sky or open space in the upper part of the frame.
- Ignore any text, watermarks or logos. Do not mention these rules. {OUT}

STYLE: {STYLE}

BRIEF
{BRIEF}`,
};

const SD_NEG_BASE = 'lowres, worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digits, extra limbs, cropped, jpeg artifacts, signature, watermark, username, artist name, text, blurry, ui, user_interface, health_bar';
const DEFAULTS = {
  sdPrefix: 'masterpiece, best quality, amazing quality, very aesthetic, absurdres, newest',
  always: {
    char: 'feet_out_of_frame, negative_space, copy_space',
    sprite: 'character_sheet, turnaround, multiple_views, full_body, standing, simple_background',
    scene: 'scenery, no_humans, wide_shot',
  },
  neg: {
    char: SD_NEG_BASE + ', lying, on_back, on_stomach, simple_background, plain_background, white_background, gradient_background',
    sprite: SD_NEG_BASE + ', lying, on_back, on_stomach, scenery, detailed_background, inconsistent_design, multiple_characters? '.replace('? ', ''),
    scene: SD_NEG_BASE + ', 1girl, 1boy, solo, person, multiple_girls, multiple_boys, simple_background',
  },
};

