// Українські назви тегів. Промпт лишається англійською, у вибірі людина бачить українську.
// Ключ: тег англійською, нижній регістр, без «_» (пробіли); рядок «тег=Назва». Дані: ua-body.js, ua-outfit.js, ua-scene.js, ua-pixel.js.
// Складений тег із комами («colored_skin, blue_skin») шукається цілим, а потім по частинах.
// Мова інтерфейсу: зараз усе українською. Коли додаватимуться інші мови, цей словник стане «uk» у таблиці перекладів
// (мова береться з navigator.language), а підписи для інших мов лягатимуть поруч у тому самому форматі.
const UA = {};
function uaAdd(text) { text.split('\n').forEach(l => { const i = l.indexOf('='); if (i > 0) UA[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); }
const uaKey = s => String(s).toLowerCase().replace(/_\([^)]*\)/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
// Назва тегу українською; null, якщо бодай одна частина без перекладу
function uaLabel(v) {
  const whole = UA[uaKey(v)];
  if (whole) return whole;
  const parts = String(v).split(/,\s*/).map(p => UA[uaKey(p)]);
  if (!parts.length || parts.some(x => !x)) return null;
  const t = parts.map((p, i) => (i ? p.charAt(0).toLowerCase() + p.slice(1) : p)).join(', ');
  return t;
}

// Палітра піксель-арту: значення в картці показується українською (у промпті лишається англійська фраза)
const UA_PALETTE = [
  [/^dominant (.+), secondary (.+), small (.+) accents$/, 'домінує: {a}; другорядний: {b}; акценти: {c}'],
  [/^mostly (.+) with (.+) shadows and (.+) highlights$/, 'здебільшого {a}; тіні: {b}; відблиски: {c}'],
  [/^near-monochrome (.+) ramp with a single (.+) accent$/, 'майже монохромна гама: {a}; один акцент: {c}'],
  [/^(.+?) and (.+) split complementary, (.+) for glowing parts$/, '{a} і {b} (розділена додаткова схема); {c} для світних частин'],
  [/^cold (.+) body, warm (.+) details$/, 'холодне тіло: {a}; теплі деталі: {c}'],
  [/^desaturated (.+?) and (.+), one saturated (.+) focal point$/, 'приглушені {a} і {b}; один насичений акцент: {c}'],
  [/^(.+) base, (.+) midtones, (.+) rim light$/, 'основа: {a}; півтони: {b}; контурне світло: {c}'],
  [/^high contrast (.+) against (.+), tiny (.+) sparks$/, 'високий контраст: {a} проти {b}; крихітні іскри: {c}'],
  [/^pastel (.+?) and (.+), outlined in deep (.+)$/, 'пастельні {a} і {b}; контур: глибокий {c}'],
  [/^earthy (.+) with (.+) wear marks and (.+) glow$/, 'землисті {a}; сліди зносу: {b}; сяйво: {c}'],
  [/^(.+) gradient into (.+), (.+) eyes and runes$/, 'градієнт від {a} до {b}; очі й руни: {c}'],
];
function uaPalette(vals) {
  const text = vals.length === 3 ? `dominant ${vals[0]}, secondary ${vals[1]}, small ${vals[2]} accents` : vals.join(', ');
  const col = c => { const u = uaLabel(c); return u ? u.charAt(0).toLowerCase() + u.slice(1) : c; };
  for (const [re, out] of UA_PALETTE) {
    const m = re.exec(text);
    if (m) { const g = (re.source.match(/\(\.\+\??\)/g) || []).length === 3 ? [m[1], m[2], m[3]] : [m[1], '', m[2]]; return out.replace('{a}', col(g[0])).replace('{b}', col(g[1])).replace('{c}', col(g[2])); }
  }
  return null;
}
