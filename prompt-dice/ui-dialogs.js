// Вікна верхньої панелі: пресети (зберегти/завантажити параметри), історія кидків, налаштування (розділи меню, 18+, тексти промпта).
// Користується openModal/closeModal/gallery з app.js; стан меню (st.ui) описано в app.js, дерево меню: ui-menu.js.
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
const dlgHead = title => `<div class="dlg-h"><h3>${esc(title)}</h3><button id="gx" title="Закрити вікно (Esc)">✕ Закрити</button></div>`;
const modalOpen = () => $('overlay').classList.contains('show');

/* ---------- історія ---------- */
function openHistory() {
  openModal(dlgHead('Історія кидків') + '<div id="hbody"></div>', 'narrow');
  $('gx').onclick = closeModal;
  const box = $('hbody');
  if (!st.history.length) { box.innerHTML = '<div class="hint">Поки порожньо. Кинь кубик!</div>'; return; }
  box.innerHTML = '<div class="hint">Клік по запису відновлює ці параметри. Зберігаються останні 80 кидків у цьому браузері.</div>';
  st.history.forEach(h => {
    const el = document.createElement('div'); el.className = 'h-item';
    el.innerHTML = `<div class="meta"><div></div><span>${new Date(h.t).toLocaleString('uk', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div><div class="t"></div>`;
    el.querySelector('.meta div').textContent = typeLabel(h);
    el.querySelector('.t').textContent = h.text || '';
    const cp = document.createElement('button'); cp.className = 'cp'; cp.textContent = '📋'; cp.title = 'Копіювати цей промпт';
    cp.onclick = e => { e.stopPropagation(); copyText(h.text, null); };
    el.querySelector('.meta').insertBefore(cp, el.querySelector('.meta span'));
    el.title = 'Клік — відновити цей кидок';
    el.onclick = () => { restore(h); closeModal(); toast('Відновлено'); };
    box.appendChild(el);
  });
}

/* ---------- пресети ---------- */
function openPresets() {
  openModal(dlgHead('Пресети') + '<div id="pbody"></div>', 'narrow');
  $('gx').onclick = closeModal;
  renderPresets();
}
function renderPresets() {
  const box = $('pbody'); if (!box) return;
  box.innerHTML = `<div class="hint">Збережи поточні параметри (тип, модель, стиль, тему та всі вибрані/заблоковані значення) під своєю назвою і повертайся до них в один клік. Пресети лежать у цьому браузері.</div>
    <div class="pre-save"><input id="pname" title="Назва нового пресета" placeholder="Назва пресета, напр. «Мій SDXL аніме»"><button id="psave" class="btn-copy" title="Зберегти поточні параметри як пресет у цьому браузері">💾 Зберегти</button></div><div id="plist"></div>`;
  const list = $('plist');
  if (!st.presets.length) list.innerHTML = '<div class="hint">Пресетів ще немає.</div>';
  st.presets.forEach((p, i) => {
    const el = document.createElement('div'); el.className = 'h-item';
    el.innerHTML = '<div class="meta"><div></div><span></span></div><div class="t"></div>';
    el.querySelector('.meta div').textContent = p.name;
    const x = document.createElement('button'); x.className = 'cp'; x.textContent = '🗑'; x.title = 'Видалити цей пресет';
    x.onclick = e => { e.stopPropagation(); st.presets.splice(i, 1); store.set('presets', st.presets); renderPresets(); };
    el.querySelector('.meta').insertBefore(x, el.querySelector('.meta span'));
    el.querySelector('.t').textContent = typeLabel(p.snap);
    el.title = 'Клік — завантажити цей пресет';
    el.onclick = () => { restore(p.snap); closeModal(); toast('Пресет завантажено'); };
    list.appendChild(el);
  });
  $('psave').onclick = () => {
    const name = $('pname').value.trim() || 'Пресет ' + (st.presets.length + 1);
    st.presets.unshift({ name, snap: snapshot() });
    store.set('presets', st.presets); renderPresets(); toast('Збережено');
  };
}

/* ---------- налаштування ---------- */
function switchRow(label, hint, checked, onChange, cls) {
  const l = document.createElement('label'); l.className = 'switch-row' + (cls ? ' ' + cls : '');
  l.innerHTML = `<span><b>${esc(label)}</b><small>${esc(hint)}</small></span><input type="checkbox">`;
  const inp = l.querySelector('input'); inp.checked = checked; inp.title = hint;
  inp.onchange = () => onChange(inp.checked);
  return l;
}
function setAdult(on) {
  if (!on && adultFilled() && !confirm('Вимкнути розділ 18+? Усе, що вибрано в ньому, буде очищено.')) return false;
  st.ui.adult = on;
  if (!on) NSFW_IDS.forEach(id => { const s = ss(id); s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; });
  save(); return true;
}
function textFields(box) {
  const t = T();
  const addField = (label, value, onInput, tall) => {
    const l = document.createElement('label'); l.textContent = label;
    const ta = document.createElement('textarea'); ta.value = value; ta.title = label; if (tall) ta.className = 'tall'; ta.spellcheck = false;
    ta.oninput = () => { onInput(ta.value); save(); renderOut(); };
    box.append(l, ta); return ta;
  };
  const addReset = fn => { const b = document.createElement('button'); b.textContent = '↺ Скинути до стандартного'; b.title = 'Повернути стандартний текст'; b.style.marginTop = '8px'; b.onclick = () => { fn(); save(); renderOut(); openSettings(); }; box.appendChild(b); };
  if (t.kind === 'pixel') {
    const key = 'px_' + t.tpl;
    addField('Базовий текст промпта (використовуй {STYLE} і {SEED})', st.custom[key] ?? TEMPLATES[t.tpl].text, v => (st.custom[key] = v), true);
    addReset(() => delete st.custom[key]);
  } else if (st.model === 'sdxl') {
    addField('Префікс якості (на початку кожного промпта SDXL)', st.settings.sdPrefix, v => (st.settings.sdPrefix = v));
    addField('Завжди додавати теги (для цього типу)', st.settings.always[st.type], v => (st.settings.always[st.type] = v));
    addReset(() => { st.settings.sdPrefix = DEFAULTS.sdPrefix; st.settings.always[st.type] = DEFAULTS.always[st.type]; });
    const h = document.createElement('div'); h.className = 'hint'; h.textContent = 'Негативний промпт редагується праворуч, під промптом.'; box.appendChild(h);
  } else if (st.model === 'gemini') {
    const key = 'gem_' + st.type;
    addField('Інструкція для Gemini (плейсхолдери: {TASK} {OUT} {STYLE} {BRIEF})', st.custom[key] ?? GEM_TPL[st.type], v => (st.custom[key] = v), true);
    addReset(() => delete st.custom[key]);
  } else {
    box.innerHTML = '<div class="hint">Для Flux налаштувань немає: промпт збирається живою мовою, по реченню на групу параметрів (волосся, очі, шкіра, одяг, поза, фон). Порожню групу пропущено.</div>';
  }
}
function openSettings() {
  openModal(dlgHead('Налаштування') + '<div class="settings-layout" id="sbody"><div class="s-col" id="sL"></div><div class="s-col" id="sR"></div></div>');
  $('gx').onclick = closeModal;
  const mk = (col, title, hint) => { const s = document.createElement('section'); s.className = 'settings-block'; s.innerHTML = `<h4>${esc(title)}</h4>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`; $(col).appendChild(s); return s; };
  const cats = mk('sL', 'Розділи меню', 'Вимкнений розділ не показується в меню й пошуку. Його параметри лишаються в промпті; щоб прибрати їх із промпта, натисни «∅ Вимкнути» в потрібній групі.');
  MENU_CATS.filter(c => !c.adult && c.id !== 'sprite' && c.id !== 'gemini').forEach(c => cats.appendChild(switchRow(c.name, c.desc, !st.ui.hide[c.id], on => { if (on) delete st.ui.hide[c.id]; else st.ui.hide[c.id] = true; save(); })));
  const view = mk('sR', 'Вигляд меню');
  view.appendChild(switchRow('Компактне меню', 'Менші відступи в меню й картках: більше вміщується на екрані', !!st.ui.dense, on => { st.ui.dense = on; save(); }));
  view.appendChild(switchRow('Відкривати одну категорію за раз', 'Коли відкриваєш категорію, інші згортаються', !!st.ui.one, on => { st.ui.one = on; if (on) st.ui.open = {}; save(); }));
  const adult = mk('sR', 'Дорослий контент', 'Розділ 18+ є лише для типу «Персонаж (арт)» і моделей SDXL та Flux. За замовчуванням вимкнено.');
  const row = switchRow('Показувати розділ 18+', 'Оголеність, білизна, пози й вирази; без тегів статевих актів', !!st.ui.adult, on => { if (!setAdult(on)) { row.querySelector('input').checked = true; } }, 'adult-switch');
  adult.appendChild(row);
  const txt = document.createElement('section'); txt.className = 'settings-block wide set';
  txt.innerHTML = `<h4>${esc('Тексти промпта · ' + (T().short || T().name) + (T().kind === 'multi' ? ' · ' + MODELS[st.model].name : ''))}</h4>`;
  $('dlg').appendChild(txt); textFields(txt);
}
$('btnHistory').onclick = openHistory;
$('btnPresets').onclick = openPresets;
$('btnSettings').onclick = openSettings;
