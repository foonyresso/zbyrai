// Стан, збирання промптів, інтерфейс.
/* =====================================================================
   СТАН
   ===================================================================== */
const store = {
  get(k, d) { try { const v = localStorage.getItem('pd2_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('pd2_' + k, JSON.stringify(v)); } catch {} },
};
const saved = store.get('state', {});
const st = {
  type: TYPES[saved.type] ? saved.type : 'char',
  model: MODELS[saved.model] ? saved.model : 'sdxl',
  styleSel: Object.assign({ pix: 1, art: 1 }, saved.styleSel),
  styleRolled: saved.styleRolled || {},
  theme: saved.theme && (saved.theme === 'random' || THEMES[saved.theme]) ? saved.theme : 'random',
  themeRolled: THEMES[saved.themeRolled] ? saved.themeRolled : null,
  slots: saved.slots || {},
  settings: {
    sdPrefix: saved.settings?.sdPrefix ?? DEFAULTS.sdPrefix,
    always: Object.assign({}, DEFAULTS.always, saved.settings?.always),
    neg: Object.assign({}, DEFAULTS.neg, saved.settings?.neg),
  },
  custom: saved.custom || {},
  closed: saved.closed || {},
  history: store.get('history', []),
  presets: store.get('presets', []),
  zone: typeof saved.zone === 'string' ? saved.zone : '',
  view: saved.view === 'head' ? 'head' : 'body',
  whole: !!saved.whole,
  wtab: typeof saved.wtab === 'string' ? saved.wtab : '',   // id вибраної підгрупи меню; старі значення ('zone', 's0'…) ігноруються
  // стан меню: nav — що ліворуч ('menu' | 'mk'), open — відкриті категорії, last — остання підгрупа, adult — показувати теги 18+, init — перший показ меню
  ui: { nav: saved.ui && saved.ui.nav ? saved.ui.nav : saved.wtab === 'zone' ? 'mk' : 'menu', open: (saved.ui && saved.ui.open) || {}, last: (saved.ui && saved.ui.last) || '', adult: !!(saved.ui && saved.ui.adult), init: !!(saved.ui && saved.ui.init) },
};
function save() {
  const { type, model, styleSel, styleRolled, theme, themeRolled, slots, settings, custom, closed, zone, view, whole, wtab, ui } = st;
  store.set('state', { type, model, styleSel, styleRolled, theme, themeRolled, slots, settings, custom, closed, zone, view, whole, wtab, ui });
}
const splitTags = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
const T = () => TYPES[st.type];
const isPixel = () => T().kind === 'pixel';
const familyKey = () => (isPixel() ? 'pix' : 'art');
const styleList = () => (isPixel() ? PIX_STYLES : ART_STYLES);
const curTheme = () => {
  if (st.theme !== 'random') return st.theme;
  if (!st.themeRolled) st.themeRolled = pick(Object.keys(THEMES));
  return st.themeRolled;
};
const ctx = () => ({ g: st.slots.gender && st.slots.gender.value[0] === '1boy' ? 'm' : 'f', theme: curTheme() });
// Параметри манекена (manual) за замовчуванням вимкнені: з'являються в промпті, лише коли їх вибрали чи кинули кубиком на ділянці
function ss(id) { return st.slots[id] || (st.slots[id] = SLOTS[id] && SLOTS[id].manual ? { mode: 'off', locked: false, value: [], rolled: true } : { mode: 'random', locked: false, value: [], rolled: false }); }
function currentStyle() {
  const list = styleList(), f = familyKey();
  let i = st.styleSel[f];
  if (i === 0) { if (!st.styleRolled[f]) st.styleRolled[f] = 1 + rnd(list.length - 1); i = st.styleRolled[f]; }
  return list[i] || list[1];
}
const visible = sl => isPixel() || !sl.models || sl.models.includes(st.model);
function typeSlotIds() { return T().sections.flatMap(s => s.s); }

function recentSet(id) {
  const r = new Set();
  st.history.slice(0, 25).forEach(h => (h.slots[id]?.value || []).forEach(v => r.add(v)));
  return r;
}
function genSlot(sl) {
  const c = ctx(), s = ss(sl.id);
  s.rolled = true;
  if (sl.gen) { s.value = randomColors(sl, sl.gen(c), Math.random); return; }
  const o = sl.opts(c);
  const p = typeof sl.p === 'function' ? sl.p(c) : sl.p;
  if (!o.length || Math.random() > p) { s.value = []; return; }
  if (sl.kind === 'multi') { s.value = randomColors(sl, mkSampleGrouped(sl, o, sl.n[0] + rnd(sl.n[1] - sl.n[0] + 1)), Math.random); return; }
  const recent = recentSet(sl.id);
  let v;
  for (let i = 0; i < 8; i++) { v = pick(o); if (!recent.has(v)) break; }
  s.value = randomColors(sl, [v], Math.random);
}
function ensureRolled() {
  typeSlotIds().forEach(id => { const s = ss(id); if (s.mode === 'random' && !s.rolled) genSlot(SLOTS[id]); });
}
function roll() {
  if (st.theme === 'random') st.themeRolled = pick(Object.keys(THEMES));
  const f = familyKey();
  if (st.styleSel[f] === 0) st.styleRolled[f] = 1 + rnd(styleList().length - 1);
  typeSlotIds().forEach(id => {
    const s = ss(id);
    if (s.mode !== 'random') return;
    if (s.locked && s.rolled) return;
    genSlot(SLOTS[id]);
  });
  render();
  addHistory();
  const b = $('roll'); b.classList.remove('rolling'); void b.offsetWidth; b.classList.add('rolling');
}
// Після зміни статі/теми перегенеровуємо залежні слоти (не заблоковані, не ручні)
function regenDependent() {
  typeSlotIds().forEach(id => {
    const s = ss(id), sl = SLOTS[id];
    if (s.mode !== 'random' || s.locked) return;
    if (id !== 'gender') genSlot(sl);
  });
}

/* =====================================================================
   ПОБУДОВА ПРОМПТІВ
   ===================================================================== */
const sdTags = sl => {
  const s = ss(sl.id);
  if (s.mode === 'off' || !s.value.length) return [];
  if (sl.sdAll) return sl.sdAll(s.value);
  return s.value.flatMap(v => splitTags(sl.sd ? sl.sd(v) : v));
};
const nlText = (sl, v) => (sl.fmt ? sl.fmt(v) : v.map(x => (sl.nl ? sl.nl(x) : hum(x))).join(', '));

function buildSD(t) {
  const lines = [];
  t.sdGroups.forEach(g => {
    const tags = g.pre ? g.pre() : [];
    t.sections[g.sec].s.forEach(id => { const sl = SLOTS[id]; if (!sl.models || sl.models.includes('sdxl')) tags.push(...sdTags(sl)); });
    const uniq = [...new Set(tags)];
    if (uniq.length) lines.push(uniq.join(', '));
  });
  return lines.join(',  \n');
}
function briefSections(t) {
  const out = [];
  t.sections.forEach(sec => {
    if (sec.meta) return;
    const lines = sec.nlPre ? sec.nlPre() : [];
    sec.s.forEach(id => {
      const sl = SLOTS[id];
      if (!visible(sl)) return;
      const s = ss(id);
      if (s.mode === 'off' || !s.value.length) return;
      lines.push([sl.en, nlText(sl, s.value)]);
    });
    if (lines.length) out.push({ e: sec.e, lines });
  });
  return out;
}
function buildFlux(t) {
  const parts = [];
  // жива мова: по реченню на групу параметрів (flux-grammar.js); немає тегів, то шматок пропускається
  const get = id => { const sl = SLOTS[id]; if (!sl || !visible(sl)) return []; const s = ss(id); return s.mode === 'off' ? [] : s.value; };
  parts.push(...FluxLang.paragraphs(st.type, get, THEMES[curTheme()].nl));
  const extra = mkFluxParagraph(typeSlotIds(), get);
  if (extra) parts.push(extra);
  const adult = nsfwFluxParagraph(get);
  if (adult) parts.push(adult);
  return parts.join('\n\n');
}
function buildGemini(t) {
  const tpl = st.custom['gem_' + st.type] ?? GEM_TPL[st.type];
  const task = GEM_TASKS[ss('gTask').value[0]] || Object.values(GEM_TASKS)[0];
  const brief = briefSections(t).map(sec => sec.e.toUpperCase() + '\n' + sec.lines.map(([k, v]) => `- ${k}: ${v}`).join('\n')).join('\n\n');
  return tpl.replace('{TASK}', () => task.task).replace('{OUT}', () => task.out).replace('{STYLE}', () => currentStyle().nl || 'free choice, but keep it coherent').replace('{BRIEF}', () => brief);
}
function buildPixel(t) {
  const tpl = st.custom['px_' + t.tpl] ?? TEMPLATES[t.tpl].text;
  const seed = 'Seed traits (mandatory, build the design around these):\n' + t.sections[0].s.map(id => {
    const sl = SLOTS[id], s = ss(id);
    if (s.mode === 'off' || !s.value.length) return null;
    return `- ${sl.en}: ${sl.fmt ? sl.fmt(s.value) : s.value.join(', ')}`;
  }).filter(Boolean).join('\n');
  return tpl.replace('{STYLE}', () => currentStyle().text).replace('{SEED}', () => seed);
}
function buildPrompt() {
  const t = T();
  if (t.kind === 'pixel') return buildPixel(t);
  return st.model === 'sdxl' ? buildSD(t) : st.model === 'flux' ? buildFlux(t) : buildGemini(t);
}

/* =====================================================================
   ІНТЕРФЕЙС
   ===================================================================== */
let toastTimer;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1400); }
async function copyText(text, el) {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = el || $('out'); ta.select(); document.execCommand('copy'); }
  toast('Скопійовано!');
}

/* ---- модальне вікно ---- */
function openModal(html, cls) { $('dlg').className = 'dlg' + (cls ? ' ' + cls : ''); $('dlg').innerHTML = html; $('overlay').classList.add('show'); }
function closeModal() { $('overlay').classList.remove('show'); $('dlg').innerHTML = ''; render(); }
$('overlay').addEventListener('mousedown', e => { if (e.target === $('overlay')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('overlay').classList.contains('show')) closeModal(); });

function gallery(title, groups, curKey, onPick, eyebrow, intro) {
  openModal(`<div class="dlg-h"><div class="dlg-t">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h3>${esc(title)}</h3>${intro ? `<p class="dlg-i">${esc(intro)}</p>` : ''}</div><button id="gx" title="Закрити вікно (Esc)">✕ Закрити</button></div><div id="gbody"></div>`);
  const body = $('gbody');
  groups.forEach(g => {
    if (g.h) { const h = document.createElement('h4'); h.textContent = g.h; body.appendChild(h); }
    const grid = document.createElement('div'); grid.className = 'grid';
    g.items.forEach(it => {
      const b = document.createElement('button');
      b.className = 'tile' + (it.rand ? ' rand' : '') + (it.key === curKey ? ' on' : '');
      b.style.setProperty('--h', hue(String(it.key)));
      b.title = it.name + (it.desc ? ': ' + it.desc : '');
      b.innerHTML = `<span class="big">${esc(it.icon)}</span><span class="nm">${esc(it.name)}</span><span class="ds">${esc(it.desc || '')}</span>`;
      b.onclick = () => { onPick(it.key); closeModal(); };
      grid.appendChild(b);
    });
    body.appendChild(grid);
  });
  $('gx').onclick = closeModal;
}

$('tabType').onclick = () => {
  const mk = keys => keys.map(k => ({ key: k, icon: TYPES[k].icon, name: TYPES[k].name, desc: TYPES[k].desc }));
  gallery('Що створюємо?', [
    { h: 'Персонажі й локації', items: mk(['char', 'sprite', 'scene']) },
    { h: 'Піксель-арт для 2D-гри', items: mk(Object.keys(TYPES).filter(k => TYPES[k].kind === 'pixel')) },
  ], st.type, k => { st.type = k; ensureRolled(); save(); }, 'Тип промпта', 'Що саме генерувати: персонаж, спрайт-лист, локацію чи піксель-арт для 2D-гри. Від типу залежать параметри й меню.');
};
$('tabModel').onclick = () => {
  gallery('Для якої моделі промпт?', [{ items: Object.entries(MODELS).map(([k, m]) => ({ key: k, icon: m.icon, name: m.name, desc: m.desc })) }], st.model, k => { st.model = k; save(); }, 'Модель', 'Від моделі залежить вигляд промпта: теги для SDXL, жива мова для Flux, інструкція для Gemini.');
};
$('tabStyle').onclick = () => {
  const list = styleList(), f = familyKey();
  gallery('Стиль', [{ items: list.map((s, i) => ({ key: i, icon: s.icon, name: s.name, desc: i === 0 ? 'новий стиль при кожному кидку' : '', rand: i === 0 })) }],
    st.styleSel[f], i => { st.styleSel[f] = i; st.styleRolled[f] = null; save(); }, 'Стиль', 'Візуальний стиль зображення. «Випадковий» змінюється при кожному кидку. Для SDXL і Flux стиль у промпт не додається.');
};
$('tabTheme').onclick = () => {
  const items = [{ key: 'random', icon: '🎲', name: 'Випадкова', desc: 'нова тематика при кожному кидку', rand: true },
    ...Object.entries(THEMES).map(([k, v]) => ({ key: k, icon: v.icon, name: v.name, desc: v.nl }))];
  gallery('Тематика (впливає на одяг, зброю, фон, ефекти)', [{ items }], st.theme, k => {
    st.theme = k; st.themeRolled = null; curTheme(); regenDependent(); save();
  }, 'Тематика', 'Жанр світу: від нього залежать одяг, зброя, фон і ефекти. «Випадкова» обирається наново при кожному кидку.');
};

function afterChange(id) { if (id === 'gender') { regenDependent(); renderWork(); } save(); }

/* ---- ліва панель ---- */
function logCount(sl) {
  const n = sl.opts(ctx()).length;
  if (sl.gen && !n) return 0;
  if (n < 2) return 0;
  if (sl.kind === 'multi') { const k = Math.round((sl.n[0] + sl.n[1]) / 2); let r = 0; for (let i = 1; i <= k; i++) r += Math.log10(Math.max(1, (n - i + 1) / i)); return r; }
  return Math.log10(n);
}
/* ---- права панель ---- */
function renderOut() {
  const t = T();
  $('out').value = buildPrompt();
  const sd = !isPixel() && st.model === 'sdxl';
  $('negbox').hidden = !sd;
  if (sd) $('neg').value = st.settings.neg[st.type] || '';
  const note = $('note');
  note.hidden = !(st.type === 'sprite' && st.model === 'sdxl');
}
function addHistory() {
  const snap = snapshot();
  snap.text = $('out').value;
  snap.t = Date.now();
  st.history.unshift(snap);
  st.history = st.history.slice(0, 80);
  store.set('history', st.history);
}
function updateHeader() {
  const t = T(), sty = currentStyle(), pix = isPixel();
  const set = (id, icon, name) => { const b = $(id); b.querySelector('.ic').textContent = icon; b.querySelector('b').textContent = name; };
  set('tabType', t.icon, t.short || t.name);
  set('tabModel', MODELS[st.model].icon, MODELS[st.model].name);
  set('tabStyle', sty.icon, st.styleSel[familyKey()] === 0 ? '🎲 ' + sty.name : sty.name);
  const th = st.theme === 'random' ? { icon: '🎲', name: 'Випадкова: ' + THEMES[curTheme()].name } : THEMES[st.theme];
  set('tabTheme', th.icon, th.name);
  $('tabModel').disabled = pix;
  $('tabTheme').disabled = pix;
}
function render() {
  ensureRolled();
  updateHeader();
  renderWorkspace();
  renderOut();
  save();
}

$('roll').onclick = roll;
$('copy').onclick = () => copyText($('out').value, $('out'));
$('copyNeg').onclick = () => copyText($('neg').value, $('neg'));
$('neg').oninput = () => { st.settings.neg[st.type] = $('neg').value; save(); };
$('unlockAll').onclick = () => {
  typeSlotIds().forEach(id => { const s = ss(id), m = SLOTS[id].manual; s.locked = false; s.mode = m ? 'off' : 'random'; s.rolled = !!m; if (m) s.value = []; });
  render();
};
/* ---- клавіші ---- */
document.addEventListener('keydown', e => {
  if ($('overlay').classList.contains('show')) return;
  const tag = document.activeElement.tagName;
  if (e.code === 'Space' && !['TEXTAREA', 'INPUT', 'SELECT', 'BUTTON'].includes(tag) && !document.activeElement.classList.contains('val')) { e.preventDefault(); roll(); }
  if (e.code === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('copy').click(); }
});

render();

