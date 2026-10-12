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
  rtab: 'out',
};
function save() {
  const { type, model, styleSel, styleRolled, theme, themeRolled, slots, settings, custom, closed } = st;
  store.set('state', { type, model, styleSel, styleRolled, theme, themeRolled, slots, settings, custom, closed });
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
function ss(id) { return st.slots[id] || (st.slots[id] = { mode: 'random', locked: false, value: [], rolled: false }); }
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
  if (sl.gen) { s.value = sl.gen(c); return; }
  const o = sl.opts(c);
  const p = typeof sl.p === 'function' ? sl.p(c) : sl.p;
  if (!o.length || Math.random() > p) { s.value = []; return; }
  if (sl.kind === 'multi') { s.value = sample(o, sl.n[0] + rnd(sl.n[1] - sl.n[0] + 1)); return; }
  const recent = recentSet(sl.id);
  let v;
  for (let i = 0; i < 8; i++) { v = pick(o); if (!recent.has(v)) break; }
  s.value = [v];
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
  const pref = [st.settings.sdPrefix, currentStyle().sd].filter(Boolean).join(', ');
  if (pref) lines.push(pref);
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
  const sty = currentStyle().nl;
  const parts = [t.fluxPre + (sty ? ' Style: ' + sty + '.' : '')];
  briefSections(t).forEach(sec => parts.push(sec.e + ': ' + sec.lines.map(([k, v]) => `${k.toLowerCase()} — ${v}`).join('; ') + '.'));
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
function openModal(html) { $('dlg').innerHTML = html; $('overlay').classList.add('show'); }
function closeModal() { $('overlay').classList.remove('show'); $('dlg').innerHTML = ''; render(); }
$('overlay').addEventListener('mousedown', e => { if (e.target === $('overlay')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('overlay').classList.contains('show')) closeModal(); });

function gallery(title, groups, curKey, onPick) {
  openModal(`<div class="dlg-h"><h3>${esc(title)}</h3><button id="gx">✕ Закрити</button></div><div id="gbody"></div>`);
  const body = $('gbody');
  groups.forEach(g => {
    if (g.h) { const h = document.createElement('h4'); h.textContent = g.h; body.appendChild(h); }
    const grid = document.createElement('div'); grid.className = 'grid';
    g.items.forEach(it => {
      const b = document.createElement('button');
      b.className = 'tile' + (it.rand ? ' rand' : '') + (it.key === curKey ? ' on' : '');
      b.style.setProperty('--h', hue(String(it.key)));
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
  ], st.type, k => { st.type = k; ensureRolled(); save(); });
};
$('tabModel').onclick = () => {
  gallery('Для якої моделі промпт?', [{ items: Object.entries(MODELS).map(([k, m]) => ({ key: k, icon: m.icon, name: m.name, desc: m.desc })) }], st.model, k => { st.model = k; save(); });
};
$('tabStyle').onclick = () => {
  const list = styleList(), f = familyKey();
  gallery('Стиль', [{ items: list.map((s, i) => ({ key: i, icon: s.icon, name: s.name, desc: i === 0 ? 'новий стиль при кожному кидку' : '', rand: i === 0 })) }],
    st.styleSel[f], i => { st.styleSel[f] = i; st.styleRolled[f] = null; save(); });
};
$('tabTheme').onclick = () => {
  const items = [{ key: 'random', icon: '🎲', name: 'Випадкова', desc: 'нова тематика при кожному кидку', rand: true },
    ...Object.entries(THEMES).map(([k, v]) => ({ key: k, icon: v.icon, name: v.name, desc: v.nl }))];
  gallery('Тематика (впливає на одяг, зброю, фон, ефекти)', [{ items }], st.theme, k => {
    st.theme = k; st.themeRolled = null; curTheme(); regenDependent(); save();
  });
};

/* ---- вибір значень параметра ---- */
function openPicker(id) {
  const sl = SLOTS[id], s = ss(id), opts = sl.opts(ctx());
  const multi = sl.kind === 'multi';
  openModal(`<div class="dlg-h"><h3>${esc(sl.label)} <small style="color:var(--muted);font-weight:400">· ${opts.length} варіантів</small></h3><button id="gx">✕ Закрити</button></div>
    <div class="picker-top"><input id="psearch" placeholder="Пошук…" autocomplete="off">
      <button id="prand">🎲 Випадково</button><button id="poff">∅ Не вказувати</button>${multi ? '<button id="pclear">Очистити вибір</button><button id="pdone" class="btn-copy">Готово</button>' : ''}</div>
    <div class="chips" id="chips"></div>`);
  const sel = new Set(s.mode === 'manual' ? s.value : []);
  const chips = $('chips');
  const draw = () => {
    const q = $('psearch').value.trim().toLowerCase();
    chips.innerHTML = '';
    opts.filter(o => !q || o.toLowerCase().includes(q)).forEach(o => {
      const b = document.createElement('button');
      b.className = 'chip' + (sel.has(o) ? ' on' : '');
      b.textContent = hum(o);
      b.title = o;
      b.onclick = () => {
        if (!multi) { s.mode = 'manual'; s.value = [o]; s.rolled = true; afterChange(id); closeModal(); return; }
        sel.has(o) ? sel.delete(o) : sel.add(o);
        s.mode = sel.size ? 'manual' : 'random'; s.value = [...sel]; s.rolled = true;
        draw();
      };
      chips.appendChild(b);
    });
  };
  draw();
  $('psearch').oninput = draw;
  $('psearch').focus();
  $('gx').onclick = () => { afterChange(id); closeModal(); };
  $('prand').onclick = () => { s.mode = 'random'; s.locked = false; genSlot(sl); afterChange(id); closeModal(); };
  $('poff').onclick = () => { s.mode = 'off'; s.value = []; afterChange(id); closeModal(); };
  if (multi) {
    $('pclear').onclick = () => { sel.clear(); s.mode = 'random'; s.value = []; s.rolled = false; draw(); };
    $('pdone').onclick = () => { if (s.mode === 'random') genSlot(sl); afterChange(id); closeModal(); };
  }
}
function afterChange(id) { if (id === 'gender') regenDependent(); save(); }

/* ---- ліва панель ---- */
function logCount(sl) {
  const n = sl.opts(ctx()).length;
  if (sl.gen && !n) return 0;
  if (n < 2) return 0;
  if (sl.kind === 'multi') { const k = Math.round((sl.n[0] + sl.n[1]) / 2); let r = 0; for (let i = 1; i <= k; i++) r += Math.log10(Math.max(1, (n - i + 1) / i)); return r; }
  return Math.log10(n);
}
function renderParams() {
  const t = T(), box = $('params'); box.innerHTML = '';
  let total = 0;
  t.sections.forEach((sec, si) => {
    if (sec.models && !isPixel() && !sec.models.includes(st.model)) return;
    const ids = sec.s.filter(id => visible(SLOTS[id]));
    if (!ids.length) return;
    const d = document.createElement('details');
    d.className = 'sec';
    const key = st.type + ':' + si;
    d.open = !st.closed[key];
    d.innerHTML = `<summary>${esc(sec.t)}</summary><div class="rows"></div>`;
    d.ontoggle = () => { st.closed[key] = !d.open; save(); };
    const rows = d.querySelector('.rows');
    ids.forEach(id => {
      const sl = SLOTS[id], s = ss(id);
      const n = sl.opts(ctx()).length;
      if (s.mode !== 'off') total += logCount(sl);
      const row = document.createElement('div');
      row.className = 'row' + (s.locked ? ' locked' : '') + (s.mode === 'manual' ? ' manual' : '');
      let valHtml, empty = false;
      if (s.mode === 'off') { valHtml = '<span class="tag off">не вказується</span>'; empty = true; }
      else if (!s.value.length) { valHtml = '— (цього разу нічого) —'; empty = true; }
      else valHtml = (s.mode === 'manual' ? '<span class="tag">вибір</span>' : '') + esc(sl.fmt ? sl.fmt(s.value) : s.value.map(x => (sl.nl ? sl.nl(x) : hum(x))).join(', '));
      row.innerHTML = `<button class="lock" title="${s.locked ? 'Розблокувати' : 'Заблокувати (не перекидати)'}">${s.locked ? '🔒' : '🔓'}</button>
        <div class="lbl">${esc(sl.label)}<small>${n ? n.toLocaleString('uk') + ' варіантів' : 'генерується'}</small></div>
        <div class="val${empty ? ' empty' : ''}" tabindex="0" title="Клік — вибрати вручну">${valHtml}</div>
        <button class="one" title="Перекинути тільки цей">🎲</button>`;
      row.querySelector('.lock').onclick = () => { if (s.mode === 'manual') { s.mode = 'random'; s.locked = true; } else s.locked = !s.locked; save(); render(); };
      const v = row.querySelector('.val');
      v.onclick = () => openPicker(id);
      v.onkeydown = e => { if (e.key === 'Enter') openPicker(id); };
      row.querySelector('.one').onclick = () => { s.mode = 'random'; genSlot(sl); afterChange(id); render(); };
      rows.appendChild(row);
    });
    box.appendChild(d);
  });
  $('stat').textContent = `Комбінацій для цієї конфігурації: ≈ 10^${Math.round(total)}`;
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
  if (st.rtab === 'hist') renderHistory();
}
function snapshot() {
  return JSON.parse(JSON.stringify({ type: st.type, model: st.model, styleSel: st.styleSel, styleRolled: st.styleRolled, theme: st.theme, themeRolled: st.themeRolled, slots: st.slots }));
}
function restore(snap) {
  st.type = TYPES[snap.type] ? snap.type : st.type;
  st.model = snap.model || st.model;
  st.styleSel = snap.styleSel; st.styleRolled = snap.styleRolled || {};
  st.theme = snap.theme; st.themeRolled = snap.themeRolled;
  st.slots = JSON.parse(JSON.stringify(snap.slots));
  save(); render();
}
function typeLabel(h) { const t = TYPES[h.type]; return t ? `${t.icon} ${t.short || t.name}${t.kind === 'multi' ? ' · ' + (MODELS[h.model]?.name || '') : ''}` : h.type; }
function renderHistory() {
  const box = $('r-hist'); box.innerHTML = '';
  if (!st.history.length) { box.innerHTML = '<div class="hint">Поки порожньо. Кинь кубик!</div>'; return; }
  st.history.forEach(h => {
    const el = document.createElement('div'); el.className = 'h-item';
    el.innerHTML = `<div class="meta"><div></div><span>${new Date(h.t).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}</span></div><div class="t"></div>`;
    el.querySelector('.meta div').textContent = typeLabel(h);
    el.querySelector('.t').textContent = h.text || '';
    const cp = document.createElement('button'); cp.className = 'cp'; cp.textContent = '📋'; cp.title = 'Копіювати цей промпт';
    cp.onclick = e => { e.stopPropagation(); copyText(h.text, null); };
    el.querySelector('.meta').insertBefore(cp, el.querySelector('.meta span'));
    el.title = 'Клік — відновити цей кидок';
    el.onclick = () => { restore(h); toast('Відновлено'); };
    box.appendChild(el);
  });
}
function renderPresets() {
  const box = $('r-pre');
  box.innerHTML = `<div class="hint">Збережи поточні параметри (тип, модель, стиль, тему та всі вибрані/заблоковані значення) під своєю назвою і повертайся до них в один клік.</div>
    <div style="display:flex;gap:8px;margin-bottom:12px"><input id="pname" placeholder="Назва пресета, напр. «Мій SDXL аніме»" style="flex:1"><button id="psave" class="btn-copy">💾 Зберегти</button></div><div id="plist"></div>`;
  const list = $('plist');
  if (!st.presets.length) list.innerHTML = '<div class="hint">Пресетів ще немає.</div>';
  st.presets.forEach((p, i) => {
    const el = document.createElement('div'); el.className = 'h-item';
    el.innerHTML = '<div class="meta"><div></div><span></span></div><div class="t"></div>';
    el.querySelector('.meta div').textContent = p.name;
    const x = document.createElement('button'); x.className = 'cp'; x.textContent = '🗑'; x.title = 'Видалити';
    x.onclick = e => { e.stopPropagation(); st.presets.splice(i, 1); store.set('presets', st.presets); renderPresets(); };
    el.querySelector('.meta').insertBefore(x, el.querySelector('.meta span'));
    el.querySelector('.t').textContent = typeLabel(p.snap);
    el.onclick = () => { restore(p.snap); toast('Пресет завантажено'); };
    list.appendChild(el);
  });
  $('psave').onclick = () => {
    const name = $('pname').value.trim() || 'Пресет ' + (st.presets.length + 1);
    st.presets.unshift({ name, snap: snapshot() });
    store.set('presets', st.presets); renderPresets(); toast('Збережено');
  };
}
function renderSettings() {
  const t = T(), box = $('r-set'); box.innerHTML = '';
  const addField = (label, value, onInput, tall) => {
    const l = document.createElement('label'); l.textContent = label;
    const ta = document.createElement('textarea'); ta.value = value; if (tall) ta.className = 'tall'; ta.spellcheck = false;
    ta.oninput = () => { onInput(ta.value); save(); renderOut(); };
    box.append(l, ta); return ta;
  };
  const addReset = fn => { const b = document.createElement('button'); b.textContent = '↺ Скинути до стандартного'; b.style.marginTop = '8px'; b.onclick = () => { fn(); save(); renderSettings(); renderOut(); }; box.appendChild(b); };
  if (t.kind === 'pixel') {
    const key = 'px_' + t.tpl;
    addField('Базовий текст промпта (використовуй {STYLE} і {SEED})', st.custom[key] ?? TEMPLATES[t.tpl].text, v => (st.custom[key] = v), true);
    addReset(() => delete st.custom[key]);
  } else if (st.model === 'sdxl') {
    addField('Префікс якості (на початку кожного промпта SDXL)', st.settings.sdPrefix, v => (st.settings.sdPrefix = v));
    addField('Завжди додавати теги (для цього типу)', st.settings.always[st.type], v => (st.settings.always[st.type] = v));
    addReset(() => { st.settings.sdPrefix = DEFAULTS.sdPrefix; st.settings.always[st.type] = DEFAULTS.always[st.type]; });
    const h = document.createElement('div'); h.className = 'hint'; h.textContent = 'Негативний промпт редагується на вкладці «Промпт».'; box.appendChild(h);
  } else if (st.model === 'gemini') {
    const key = 'gem_' + st.type;
    addField('Інструкція для Gemini (плейсхолдери: {TASK} {OUT} {STYLE} {BRIEF})', st.custom[key] ?? GEM_TPL[st.type], v => (st.custom[key] = v), true);
    addReset(() => delete st.custom[key]);
  } else {
    box.innerHTML = '<div class="hint">Для Flux налаштувань немає: промпт збирається як описова проза зі вступного речення типу, стилю та параметрів.</div>';
  }
}
function setRtab(name) {
  st.rtab = name;
  document.querySelectorAll('.rtab').forEach(b => b.classList.toggle('on', b.dataset.r === name));
  ['out', 'hist', 'pre', 'set'].forEach(n => ($('r-' + n).hidden = n !== name));
  if (name === 'hist') renderHistory();
  if (name === 'pre') renderPresets();
  if (name === 'set') renderSettings();
}
document.querySelectorAll('.rtab').forEach(b => (b.onclick = () => setRtab(b.dataset.r)));

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
  renderParams();
  renderOut();
  if (st.rtab === 'set') renderSettings();
  save();
}

$('roll').onclick = roll;
$('copy').onclick = () => copyText($('out').value, $('out'));
$('copyNeg').onclick = () => copyText($('neg').value, $('neg'));
$('neg').oninput = () => { st.settings.neg[st.type] = $('neg').value; save(); };
$('unlockAll').onclick = () => {
  typeSlotIds().forEach(id => { const s = ss(id); s.locked = false; s.mode = 'random'; s.rolled = false; });
  render();
};
document.addEventListener('keydown', e => {
  if ($('overlay').classList.contains('show')) return;
  const tag = document.activeElement.tagName;
  if (e.code === 'Space' && !['TEXTAREA', 'INPUT', 'SELECT', 'BUTTON'].includes(tag) && !document.activeElement.classList.contains('val')) { e.preventDefault(); roll(); }
  if (e.code === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('copy').click(); }
});

render();

