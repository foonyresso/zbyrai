// Манекен: з даних ділянок (mk-data-*.js) створює параметри-слоти, прив'язує їх (і старі слоти) до ділянок
// і додає в типи промптів. Завантажується після types.js і перед app.js.
const MK = { cats: {}, partSlots: {}, order: [] };

// Старі параметри Кубика, які редагуються на відповідних ділянках манекена
const MK_OLD = {
  body: ['gender', 'age', 'race', 'raceFeat', 'skin', 'build', 'permFeat'],
  hair: ['hairLen', 'hairColor', 'hairStyle', 'hairDetail'],
  eyes: ['eyeColor', 'eyeDetail', 'eyeExpr'],
  face: ['emotion', 'expression', 'makeup'],
  hat: ['headwear'],
  chest: ['breasts'],
  pelvis: ['hips'],
  arm: ['limbs'],
  leg: ['limbs', 'legwear'],
  hand: ['nails', 'gloves', 'weapon'],
  foot: ['footwear'],
  torso: ['outfit', 'outState', 'bareParts'],
};
// Порядок ділянок у промпті: зверху вниз, потім поза, кадр, фон
MK.order = ['body', 'head', 'hair', 'fringe', 'forehead', 'brows', 'eyes', 'nose', 'cheeks', 'ears', 'mouth', 'chin', 'jaw', 'face', 'hat', 'neck', 'shoulders', 'arm', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand', 'fingers',
  'torso', 'chest', 'belly', 'waist', 'pelvis', 'leg', 'thigh', 'knee', 'shin', 'ankle', 'foot', 'toes', 'pose', 'frame', 'bg'];

// Скорочений запис категорії → повний
function mkParseRow(r) {
  const [id, part, label, mode, body, out] = r;
  const groups = body.split(' || ').map(g => {
    const [name, items] = g.split(':: ');
    return [name, items.split('; ').map(it => { const i = it.indexOf('='); return [it.slice(0, i).trim(), it.slice(i + 1).trim()]; })];
  });
  return { id, part, label, mode, hint: '', groups, out: out === 'out' };
}
const MK_ALL = [...MKD_BODY, ...MKD_HEAD, ...MKD_SCENE, ...MKD_EXTRA.map(mkParseRow)];
// вихід (одяг) для категорій із плагіна: прикраси й одяг
const MK_OUT_IDS = new Set(['pl_chest_wear', 'pl_legwear', 'pl_hand_acc', 'pl_lower_body', 'pl_waist_acc', 'pl_upper_body', 'pl_back_acc', 'pl_ear_acc', 'pl_neck_acc', 'pl_hair_acc', 'pl_eyewear']);

MK_ALL.forEach(c => {
  const prompts = [], lab = {};
  c.groups.forEach(g => g[1].forEach(([l, p]) => { prompts.push(p); lab[p] = l; }));
  c.out = c.out || MK_OUT_IDS.has(c.id);
  MK.cats[c.id] = c;
  def(c.id, c.label, MK_PART_EN[c.part] + ' details', {
    kind: c.mode === 'multi' ? 'multi' : 'single', n: [1, 2], p: 0.6, manual: true, mk: true, part: c.part, out: c.out,
    opts: () => prompts, lab, groups: c.groups, hint: c.hint, nl: v => v,
  });
});
// Власний текст ділянки: вільний опис англійськими тегами (слот у ручному режимі)
['body', 'head', 'hair', 'fringe', 'forehead', 'brows', 'eyes', 'nose', 'cheeks', 'ears', 'mouth', 'chin', 'jaw', 'face', 'hat', 'neck', 'shoulders', 'arm', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand', 'fingers',
  'torso', 'chest', 'belly', 'waist', 'pelvis', 'leg', 'thigh', 'knee', 'shin', 'ankle', 'foot', 'toes', 'pose', 'frame', 'bg'].forEach(part => {
  def('zt_' + part, 'Свій опис', MK_PART_EN[part] + ' (custom)', { kind: 'text', manual: true, mk: true, part, opts: () => [], nl: v => v, text: true });
});
// Старі слоти отримують ділянку (для групування у вкладках і на манекені)
Object.entries(MK_OLD).forEach(([part, ids]) => ids.forEach(id => { if (SLOTS[id]) { SLOTS[id].parts = (SLOTS[id].parts || []).concat(part); } }));

// Реєстр: ділянка → слоти (старі, нові, свій текст)
MK.order.forEach(p => { MK.partSlots[p] = []; });
Object.entries(MK_OLD).forEach(([part, ids]) => ids.forEach(id => MK.partSlots[part].push(id)));
MK_ALL.forEach(c => MK.partSlots[c.part].push(c.id));
MK.order.forEach(p => MK.partSlots[p].push('zt_' + p));
const mkNewIds = filter => MK.order.flatMap(p => MK.partSlots[p].filter(id => SLOTS[id].mk && filter(SLOTS[id])));

// Підключення до типів: у який розділ типу потрапляє кожен новий слот
const isScenePart = s => s.part === 'pose' || s.part === 'frame' || s.part === 'bg';
(function mkAttach() {
  const char = TYPES.char.sections, spr = TYPES.sprite.sections, scn = TYPES.scene.sections;
  const body = mkNewIds(s => !isScenePart(s) && !s.out), outf = mkNewIds(s => !isScenePart(s) && s.out);
  [char, spr].forEach(secs => { secs[0].s.push(...body.filter(id => !secs[0].s.includes(id))); secs[1].s.push(...outf.filter(id => !secs[1].s.includes(id))); });
  char[2].s.push(...mkNewIds(s => s.part === 'pose' || s.part === 'frame'));
  char[3].s.push(...mkNewIds(s => s.part === 'bg'));
  scn[0].s.push(...mkNewIds(s => s.part === 'bg'));
  scn[1].s.push(...mkNewIds(s => s.part === 'frame'));
})();

// Дрібні помічники для інтерфейсу й промптів
// Підпис варіанта: свій (категорії манекена й групи) → словник ua-*.js → колір + тег → сирий тег
function mkLabel(sl, v) {
  const direct = (sl.lab && sl.lab[v]) || (typeof uaLabel === 'function' && uaLabel(v));
  if (direct) return direct;
  const cs = typeof COLOR_SLOT_FMT === 'object' && COLOR_SLOT_FMT[sl.id];
  if (cs) { const c = COLORS.find(x => cs.fmt(x[0]) === v); if (c) return cs.label(c[0]); }
  const known = t => !!((sl.lab && sl.lab[t]) || (typeof uaLabel === 'function' && uaLabel(t)));
  const pc = typeof parseColored === 'function' && parseColored(v, known);
  if (pc) { const n = pc.cs.map(c => colorUa(c).toLowerCase()); return mkLabel(sl, pc.base) + ', ' + (n.length > 1 ? 'кольори: ' + n.join(' і ') : 'колір: ' + n[0]); }
  return hum(v);
}
// Flux/Gemini: абзац «додаткові деталі за ділянками» для нових слотів; get(id) → значення
function mkFluxParagraph(slotIds, get) {
  const byPart = {};
  slotIds.forEach(id => {
    const sl = SLOTS[id]; if (!sl || !sl.mk) return;
    const vals = (get(id) || []).flatMap(v => String(v).split(',').map(x => x.trim())).map(hum).filter(Boolean);
    if (vals.length) (byPart[sl.part] = byPart[sl.part] || []).push(...vals);
  });
  const parts = MK.order.filter(p => byPart[p]).map(p => `${MK_PART_EN[p]}: ${[...new Set(byPart[p])].join(', ')}.`);
  return parts.length ? 'Additional details by body part. ' + parts.join(' ') : '';
}
