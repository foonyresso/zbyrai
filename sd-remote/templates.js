// Шаблони: набір налаштувань і промпта, який можна застосувати одним кліком; свої шаблони користувач зберігає сам (localStorage).
// Чиста логіка без DOM: capture/sanitize/summary + вбудовані шаблони. Інтерфейс: tpl-ui.js. Тести: test/templates.test.js
(function (root) {
  var FIELDS = ['prompt', 'neg', 'ratio', 'orient', 'long', 'steps', 'upscale', 'adOn', 'adPrompt', 'adNeg', 'loras'];
  var RATIOS = ['1:1', '2:3', '3:4', '4:5', '5:7', '9:16', '9:21'];
  var num = function (v, lo, hi, step) { v = Number(v); if (!isFinite(v)) return null; v = Math.min(hi, Math.max(lo, v)); return step ? Math.round(v / step) * step : v; };

  // Поточні налаштування → дані шаблону
  function capture(S) { var o = {}; FIELDS.forEach(function (k) { if (S[k] !== undefined) o[k] = JSON.parse(JSON.stringify(S[k])); }); return o; }

  // Безпечні дані з довільного шаблону (з localStorage чи вбудованого): лише відомі поля, значення в межах
  function sanitize(d) {
    d = d || {}; var o = {}, v;
    if (typeof d.prompt === 'string') o.prompt = d.prompt.slice(0, 2000);
    if (typeof d.neg === 'string') o.neg = d.neg.slice(0, 2000);
    if (RATIOS.indexOf(d.ratio) >= 0) o.ratio = d.ratio;
    if (d.orient === 'v' || d.orient === 'h') o.orient = d.orient;
    if ((v = num(d.long, 640, 1536, 64)) != null) o.long = v;
    if ((v = num(d.steps, 2, 12, 1)) != null) o.steps = v;
    if ((v = num(d.upscale, 1, 2, 0.05)) != null) o.upscale = Math.round(v * 100) / 100;
    if (typeof d.adOn === 'boolean') o.adOn = d.adOn;
    if (typeof d.adPrompt === 'string') o.adPrompt = d.adPrompt.slice(0, 1000);
    if (typeof d.adNeg === 'string') o.adNeg = d.adNeg.slice(0, 1000);
    if (Array.isArray(d.loras)) o.loras = d.loras.filter(function (l) { return l && typeof l.name === 'string' && l.name; }).slice(0, 30).map(function (l) { return { name: l.name.slice(0, 200), w: num(l.w, -5, 5) || 0 }; });
    return o;
  }
  function summary(d) {
    var p = [];
    if (d.ratio) p.push(d.ratio + (d.orient === 'h' ? ' гориз.' : '')); if (d.long) p.push(d.long + ' px'); if (d.steps) p.push(d.steps + ' кр.');
    if (d.upscale > 1) p.push('апскейл ' + d.upscale + '×'); if (d.adOn) p.push('ADetailer'); if (d.loras) p.push('LoRA: ' + d.loras.length);
    return p.join(' · ');
  }
  var BUILTIN = [
    { id: 'b-portrait', name: 'Портрет', note: 'Верхня частина, вертикально', data: { ratio: '9:16', orient: 'v', long: 1344, upscale: 1.65, adOn: true, prompt: 'masterpiece, 1girl, solo, upper body, looking at viewer, soft lighting' } },
    { id: 'b-fullbody', name: 'Повний зріст', note: 'Персонаж у повний ріст', data: { ratio: '2:3', orient: 'v', long: 1344, upscale: 1.65, adOn: true, prompt: 'masterpiece, 1girl, solo, full body, standing, simple background' } },
    { id: 'b-scenery', name: 'Пейзаж', note: 'Широкий кадр без людей', data: { ratio: '9:16', orient: 'h', long: 1344, upscale: 1.5, adOn: false, prompt: 'masterpiece, scenery, no humans, wide shot, detailed background, dramatic sky' } },
    { id: 'b-cover', name: 'Обкладинка книги', note: 'Пропорції 3:4', data: { ratio: '3:4', orient: 'v', long: 1344, upscale: 1.5, adOn: false, prompt: 'masterpiece, book cover, illustration, centered composition, dramatic lighting' } },
    { id: 'b-avatar', name: 'Аватар', note: 'Квадрат, обличчя крупно', data: { ratio: '1:1', orient: 'v', long: 1024, upscale: 1.5, adOn: true, prompt: 'masterpiece, portrait, close-up, face focus, looking at viewer' } },
  ];
  var api = { FIELDS: FIELDS, capture: capture, sanitize: sanitize, summary: summary, BUILTIN: BUILTIN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDTemplates = api;
})(typeof window !== 'undefined' ? window : globalThis);
