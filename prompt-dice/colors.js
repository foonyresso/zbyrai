// Кольори для тегів: набір готових квадратиків, вибір довільного кольору (приводиться до найближчої назви) і складання тегу з кольором.
// У промпті колір іде англійським словом перед тегом («white_angel_wings»), у вибірі — українською.
const COLORS = [
  ['black', 'Чорний', '#151515'], ['white', 'Білий', '#f4f4f4'], ['grey', 'Сірий', '#8a8a8a'], ['silver', 'Срібний', '#c3c7cc'],
  ['gold', 'Золотий', '#d9ae2f'], ['brown', 'Коричневий', '#7a4a2b'], ['beige', 'Бежевий', '#dcc7a2'], ['orange', 'Помаранчевий', '#f28a1b'],
  ['yellow', 'Жовтий', '#f6d835'], ['lime', 'Салатовий', '#a4d63b'], ['green', 'Зелений', '#2f9e44'], ['teal', 'Бірюзовий', '#12988c'],
  ['light_blue', 'Блакитний', '#5bc0eb'], ['blue', 'Синій', '#2860d8'], ['dark_blue', 'Темно-синій', '#16256b'], ['purple', 'Фіолетовий', '#7a3fb8'],
  ['lavender', 'Лавандовий', '#b7a2e0'], ['pink', 'Рожевий', '#f58fb5'], ['hot_pink', 'Яскраво-рожевий', '#e6218b'], ['red', 'Червоний', '#d62828'],
  ['dark_red', 'Темно-червоний', '#7a1212'],
];
const colorUa = en => (COLORS.find(c => c[0] === en) || [0, en])[1];
// Колір + тег: «white_wings» (стиль старих параметрів, з підкресленнями), «white wings» (стиль категорій манекена)
function colorize(tag, c, underscore) { const sep = tag.includes('_') || underscore ? '_' : ' '; return c.replace(/_/g, sep) + sep + tag; }
const CN = COLORS.map(c => c[0].replace(/_/g, '[_ ]')).sort((a, b) => b.length - a.length).join('|');   // назви кольорів для регулярок
const COLOR_RE = new RegExp('^(' + CN + ')[_ ](.+)$', 'i');
const colorKey = w => w.toLowerCase().replace(/ /g, '_');
// «white_wings» → { c: 'white', base: 'wings' }; null, якщо кольору на початку немає
function uncolor(v) {
  const m = COLOR_RE.exec(v); if (!m) return null;
  const c = COLORS.find(x => x[0] === colorKey(m[1]));
  return c ? { c: c[0], base: m[2] } : null;
}
// Довільний колір (#rrggbb) → найближча назва з набору
function nearestColor(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  let best = COLORS[0], bd = 1e9;
  COLORS.forEach(c => { const m = parseInt(c[2].slice(1), 16), d = (r - (m >> 16)) ** 2 + (g - ((m >> 8) & 255)) ** 2 + (b - (m & 255)) ** 2; if (d < bd) { bd = d; best = c; } });
  return best[0];
}
// Що можна фарбувати: іменники, до яких додається колір
const COLORABLE_RE = /(wing|horn|tail|ears?\b|halo|fur\b|scales|feathers|ribbon|\bbow\b|bowtie|hairband|hairclip|scrunchie|dress|skirt|shirt|\btop\b|\bbra\b|bikini|swimsuit|gloves|mittens|boots|shoes|sneakers|heels|sandals|socks|stockings|thighhighs|pantyhose|tights|leggings|legwear|\bhat\b|beret|crown|tiara|circlet|cape|cloak|scarf|jacket|coat|hoodie|sweater|cardigan|blazer|vest|armor|kimono|panties|thong|shorts|pants|jeans|belt|choker|necklace|collar|bracelet|bangles|earrings|glasses|sunglasses|mask|lipstick|eyeshadow|eyeliner|bodysuit|leotard|uniform|\brobe\b|gown|apron|necktie|\btie\b|sash|bandana|headband|veil|corset|helmet|tabard|capelet|jumpsuit|camisole|blouse|qipao|\bleaf|petals|vines|fins|antenna|tentacles|halo|wreath|scarf|nails|nail polish|headphones|\bring\b|rings|backpack|strap|garter|cuffs|wristband|armlet|anklet|bell)/i;
const COLOR_SLOTS = new Set(['raceFeat', 'hairDetail', 'headwear', 'accessories', 'gloves', 'footwear', 'legwear', 'makeup', 'nails']);
// Параметри, де колір обирається самим значенням (колір волосся, очей, нігтів, шкіри)
const COLOR_SLOT_FMT = {
  hairColor: { fmt: c => `${c}_hair`, name: 'Колір волосся', label: c => `Волосся: ${colorUa(c).toLowerCase()}` },
  eyeColor: { fmt: c => `${c}_eyes`, name: 'Колір очей', label: c => `Очі: ${colorUa(c).toLowerCase()}` },
  nails: { fmt: c => `nail_polish, ${c}_nails`, name: 'Колір нігтів', label: c => `Нігті: ${colorUa(c).toLowerCase()}` },
  skin: { fmt: c => `colored_skin, ${c}_skin`, name: 'Незвичний колір шкіри', label: c => `Шкіра: ${colorUa(c).toLowerCase()}` },
};

// Теги, що мають два кольори: різнокольорове волосся й очі, смугастий і градієнтний одяг
const HAIR2 = new Set(['multicolored_hair', 'two-tone_hair', 'gradient_hair', 'streaked_hair', 'colored_inner_hair', 'colored_tips', 'split-color_hair']);
const EYES2 = new Set(['heterochromia', 'multicolored_eyes', 'gradient_eyes']);
const PAIR_RE = /(striped|gradient|two-tone|multicolored|mismatched|checkered|plaid|split-color)/i;
// Що можна фарбувати в параметрі: { n: 1 | 2, kind } або null (тег без кольору)
function colorSpec(sl, tag) {
  if (!sl || sl.text || tag.includes(',') && !HAIR2.has(tag)) return null;
  const own = COLOR_SLOT_FMT[sl.id];                       // волосся, очі, нігті, шкіра: лише двоколірні теги
  if (HAIR2.has(tag) && sl.id === 'hairColor') return { n: 2, kind: 'hair' };
  if (EYES2.has(tag) && sl.id === 'eyeColor') return { n: 2, kind: 'eyes' };
  if (own) return null;
  if (!(COLOR_SLOTS.has(sl.id) || (sl.mk && !['pose', 'frame', 'bg'].includes(sl.part)))) return null;
  if (uncolor(tag) || !COLORABLE_RE.test(tag)) return null;
  return { n: PAIR_RE.test(tag) ? 2 : 1, kind: PAIR_RE.test(tag) ? 'pair' : 'one' };
}
// Тег із кольорами cs (1–2 назви). Порожній cs — сам тег
function composeColor(tag, cs, kind, underscore) {
  const c = (cs || []).filter(Boolean);
  if (!c.length) return tag;
  if (kind === 'hair' || kind === 'eyes') { const w = kind; return [tag, ...c.map(x => `${x}_${w}`)].join(', '); }
  if (kind === 'pair' && c.length === 2) { const sep = tag.includes('_') || underscore ? '_' : ' '; return `${c[0]}${sep}and${sep}${c[1]}${sep}${tag}`.replace(/_/g, sep); }
  return colorize(tag, c[0], underscore);
}
// Обернено: значення → { base, cs } , якщо base проходить перевірку isBase(tag)
function parseColored(v, isBase) {
  let m;
  if ((m = new RegExp(`^(.+), (${CN})_(hair|eyes), (${CN})_\\3$`, 'i').exec(v)) && isBase(m[1])) return { base: m[1], cs: [colorKey(m[2]), colorKey(m[4])] };
  if ((m = new RegExp(`^(.+), (${CN})_(hair|eyes)$`, 'i').exec(v)) && isBase(m[1])) return { base: m[1], cs: [colorKey(m[2])] };
  if ((m = new RegExp(`^(${CN})[_ ]and[_ ](${CN})[_ ](.+)$`, 'i').exec(v)) && isBase(m[3])) return { base: m[3], cs: [colorKey(m[1]), colorKey(m[2])] };
  const u = uncolor(v);
  if (u && isBase(u.base)) return { base: u.base, cs: [u.c] };
  return null;
}
// Випадковий вибір кольорів із готової палітри для тегів, що можуть мати колір
function randomColors(sl, vals, rnd) {
  const pickC = () => COLORS[Math.floor(rnd() * COLORS.length)][0];
  return vals.map(v => {
    const sp = colorSpec(sl, v); if (!sp) return v;
    const c1 = pickC(); let c2 = pickC(); while (sp.n === 2 && c2 === c1) c2 = pickC();
    return composeColor(v, sp.n === 2 ? [c1, c2] : [c1], sp.kind, !sl.mk);
  });
}
