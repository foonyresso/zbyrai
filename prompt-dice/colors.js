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
const COLOR_RE = new RegExp('^(' + COLORS.map(c => c[0].replace(/_/g, '[_ ]')).sort((a, b) => b.length - a.length).join('|') + ')[_ ](.+)$', 'i');
// «white_wings» → { c: 'white', base: 'wings' }; null, якщо кольору на початку немає
function uncolor(v) {
  const m = COLOR_RE.exec(v); if (!m) return null;
  const c = COLORS.find(x => x[0] === m[1].toLowerCase().replace(/ /g, '_'));
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
