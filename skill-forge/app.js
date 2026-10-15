/* Конструктор скілів: інтерфейс. Логіка в forge-core.js / forge-eval.js / presets.js / forge-preview.js, цеглинки в bricks/. */
(() => {
  const F = ForgeCore, E = ForgeEval, P = ForgePresets;
  const $ = id => document.getElementById(id);
  const KEY = 'sf_state';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* без збереження теж працює */ } },
  };
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'text') el.textContent = v; else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  }
  let toastTimer;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------- стан ---------- */
  let skill, sel = null, cat = 'delivery', query = '', loop = false;
  let lastSnap = '', history = [], redo = [];
  try { const s = store.get(); skill = s && s.skill ? F.parse(s.skill) : null; } catch (e) { skill = null; }
  if (!skill) skill = P.build(P.byId('firebolt'));
  lastSnap = JSON.stringify(skill);
  const preview = ForgePreview.create($('cv'));

  function persist() { store.set({ skill: F.serialize(skill) }); }
  function checkpoint() {
    const cur = JSON.stringify(skill);
    if (cur === lastSnap) return;
    history.push(lastSnap); if (history.length > 100) history.shift();
    redo = []; lastSnap = cur; persist(); updateUndo();
  }
  function setSkill(s, keepSel) { skill = s; if (!keepSel || !F.find(skill, sel)) sel = null; checkpoint(); renderAll(); }
  function undo() { if (!history.length) return; redo.push(lastSnap); lastSnap = history.pop(); skill = restore(lastSnap); afterTime(); }
  function redoStep() { if (!redo.length) return; history.push(lastSnap); lastSnap = redo.pop(); skill = restore(lastSnap); afterTime(); }
  // історія зберігає «сирий» скіл (з ідентифікаторами), без нормалізації
  const restore = snap => JSON.parse(snap);
  function afterTime() { if (!F.find(skill, sel)) sel = null; persist(); updateUndo(); renderAll(); }
  function updateUndo() { $('btnUndo').disabled = !history.length; $('btnRedo').disabled = !redo.length; }

  /* ---------- палітра ---------- */
  function targetFor(cat_) {
    // вибрана цеглинка або найближчий предок, що приймає категорію; інакше корінь
    let id = sel;
    if (!id) { // нічого не вибрано: беремо останню доставку в корені, якщо вона приймає цю категорію
      const dl = skill.root.filter(b => F.def(b.t).cat === 'delivery').pop();
      if (dl && F.accepts('delivery', cat_)) return { id: dl.id };
    }
    while (id) {
      const f = F.find(skill, id); if (!f) break;
      if (F.accepts(F.def(f.brick.t).cat, cat_)) return { id };
      id = f.parent ? f.parent.id : null;
    }
    return F.accepts(null, cat_) ? { id: null } : null;
  }
  function addBrick(t) {
    const d = F.def(t), tg = targetFor(d.cat);
    if (!tg) { toast(`«${d.name}» додається всередину: спершу обери доставку чи тригер`); return; }
    const b = F.add(skill, t, tg.id);
    if (!b) { toast(F.lastError); return; }
    sel = b.id; checkpoint(); renderAll();
  }
  function renderPalette() {
    const tabs = $('catTabs'); tabs.replaceChildren(...Object.entries(F.CATS).map(([k, c]) =>
      h('button', { class: k === cat && !query ? 'on' : '', role: 'tab', title: c.hint, onclick: () => { cat = k; query = ''; $('brickSearch').value = ''; renderPalette(); } }, c.name)));
    $('catHint').textContent = query ? 'Результати пошуку по всіх видах.' : F.CATS[cat].hint + (cat === 'delivery' ? '' : ' Додається у вибрану цеглинку.');
    const q = query.trim().toLowerCase();
    const list = F.all().filter(d => q ? (d.name + ' ' + d.hint).toLowerCase().includes(q) : d.cat === cat);
    $('brickList').replaceChildren(...list.map(d => {
      const ok = !!targetFor(d.cat);
      return h('button', { class: ok ? '' : 'off', title: d.hint + (d.only ? ` (діє лише з: ${d.only.map(i => F.def(i).name).join(', ')})` : '') + (ok ? '' : ' — спершу обери доставку чи тригер, куди це вкласти'), onclick: () => addBrick(d.id) },
        h('span', { class: 'ic' }, d.icon), h('span', {}, d.name));
    }));
  }

  /* ---------- форма скіла ---------- */
  function field(label, hint, input) { return h('label', { title: hint }, label, input); }
  function numInput(obj, k, min, max, step, onch) {
    return h('input', { type: 'number', min, max, step, value: obj[k], oninput: e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) { obj[k] = Math.min(max, Math.max(min, v)); onch(); } }, onchange: e => { e.target.value = obj[k]; checkpoint(); } });
  }
  function selectInput(obj, k, options, onch, after) {
    const s = h('select', { onchange: e => { obj[k] = e.target.value; onch(); checkpoint(); if (after) after(); } }, options.map(o => h('option', { value: o[0], ...(o[0] === obj[k] ? { selected: true } : {}) }, o[1])));
    return s;
  }
  function renderMeta() {
    const live = () => { refreshSide(); persist(); };
    const c = skill.cast;
    $('meta').replaceChildren(
      field('Назва', 'Назва скіла', h('input', { type: 'text', value: skill.name, maxlength: 80, oninput: e => { skill.name = e.target.value || 'Без назви'; live(); }, onchange: checkpoint })),
      field('Опис', 'Короткий опис для гравця; з’являється в описі й експорті', h('textarea', { maxlength: 600, oninput: e => { skill.desc = e.target.value; live(); }, onchange: checkpoint }, skill.desc)),
      h('div', { class: 'grid3' },
        field('Стихія', 'Головна стихія скіла: колір прев’ю й підказка для ефектів (стихію шкоди задаєш у самих ефектах)', selectInput(skill, 'element', F.ELEMENTS, live)),
        field('Ціль', 'Кого або що вибирає гравець, щоб застосувати скіл', selectInput(skill.aim, 'mode', F.AIM_MODES, live)),
        field('Дальність, м', 'Максимальна відстань до вибраної цілі чи точки', numInput(skill.aim, 'range', 0, 60, 1, live))),
      h('div', { class: 'grid3' },
        field('Каст, с', 'Скільки часу триває підготовка перед дією', numInput(c, 'time', 0, 10, 0.1, live)),
        field('Перезарядка, с', 'Через скільки секунд скіл можна застосувати знову', numInput(c, 'cooldown', 0, 600, 0.5, live)),
        field('Заряди', 'Скільки разів поспіль можна застосувати до початку перезарядки', numInput(c, 'charges', 1, 10, 1, live))),
      h('div', { class: 'grid3' },
        field('Ресурс', 'Чим гравець платить за скіл', selectInput(c, 'resource', F.RESOURCES, live)),
        field('Ціна', 'Скільки ресурсу коштує одне застосування', numInput(c, 'cost', 0, 10000, 1, live)),
        field('Мітки', 'Слова через кому для пошуку й сортування у грі (наприклад: маг, вогонь)', h('input', { type: 'text', value: skill.tags.join(', '), oninput: e => { skill.tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 12); live(); }, onchange: checkpoint }))));
  }

  /* ---------- дерево цеглинок ---------- */
  function paramInput(b, spec) {
    const upd = () => { refreshSide(); persist(); };
    const set = v => { F.setParam(skill, b.id, spec.k, v); };
    if (spec.type === 'enum') return h('label', { title: spec.hint }, spec.label, h('select', { onchange: e => { set(e.target.value); checkpoint(); renderAll(); } }, spec.options.map(o => h('option', { value: o[0], ...(o[0] === b.p[spec.k] ? { selected: true } : {}) }, o[1]))));
    if (spec.type === 'bool') return h('label', { class: 'chk', title: spec.hint }, h('input', { type: 'checkbox', ...(b.p[spec.k] ? { checked: true } : {}), onchange: e => { set(e.target.checked); checkpoint(); refreshSide(); } }), spec.label);
    const num = h('input', { type: 'number', min: spec.min, max: spec.max, step: spec.step, value: b.p[spec.k] });
    const rng = h('input', { type: 'range', min: spec.min, max: spec.max, step: spec.step, value: b.p[spec.k] });
    rng.addEventListener('input', () => { set(parseFloat(rng.value)); num.value = b.p[spec.k]; upd(); });
    num.addEventListener('input', () => { const v = parseFloat(num.value); if (Number.isFinite(v)) { set(v); rng.value = b.p[spec.k]; upd(); } });
    for (const el of [rng, num]) el.addEventListener('change', () => { num.value = b.p[spec.k]; rng.value = b.p[spec.k]; checkpoint(); });
    return h('label', { title: spec.hint }, `${spec.label}${spec.unit ? ', ' + spec.unit : ''}`, h('div', { class: 'rng' }, rng, num));
  }
  function renderBrick(b, parent) {
    const d = F.def(b.t), list = parent ? parent.c : skill.root, i = list.indexOf(b);
    const btn = (txt, title, fn, dis) => h('button', { title, ...(dis ? { disabled: true } : {}), onclick: e => { e.stopPropagation(); fn(); } }, txt);
    const el = h('div', { class: 'brick' + (b.id === sel ? ' sel' : ''), 'data-cat': d.cat },
      h('div', { class: 'bh', title: d.hint + ' Клік вибирає цеглинку: нові цеглинки додаються в неї.', onclick: () => { sel = sel === b.id ? null : b.id; renderAll(); } },
        h('span', { class: 'ic' }, d.icon), h('span', { class: 'nm' }, d.name), h('span', { class: 'cat' }, F.CATS[d.cat].name),
        h('span', { class: 'tools' },
          btn('↑', 'Підняти вище', () => { F.move(skill, b.id, -1); checkpoint(); renderAll(); }, i === 0),
          btn('↓', 'Опустити нижче', () => { F.move(skill, b.id, 1); checkpoint(); renderAll(); }, i === list.length - 1),
          btn('⧉', 'Дублювати цеглинку разом із вкладеними', () => { const c = F.duplicate(skill, b.id); if (!c) toast('Забагато цеглинок'); else sel = c.id; checkpoint(); renderAll(); }),
          btn('✕', 'Видалити цеглинку разом із вкладеними', () => { F.remove(skill, b.id); if (!F.find(skill, sel)) sel = null; checkpoint(); renderAll(); }))),
      F.paramSpecs(d).length ? h('div', { class: 'params' }, F.paramSpecs(d).map(s => paramInput(b, s))) : null,
      b.c.length ? h('div', { class: 'kids' }, b.c.map(x => renderBrick(x, b))) : null);
    return el;
  }
  function renderTree() {
    $('tree').replaceChildren(...(skill.root.length ? skill.root.map(b => renderBrick(b, null)) : [h('p', { class: 'emptyhint' }, 'Скіл порожній. Обери приклад справа або додай першу цеглинку зліва (почни з «Доставки»).')]));
  }

  /* ---------- права колонка ---------- */
  function refreshSide() {
    const ev = E.evaluate(skill), pc = v => Math.round(v * 100) + '%';
    const kv = (a, b, tip) => h('div', { class: 'kv', title: tip }, h('span', {}, a), h('b', {}, b));
    const issues = F.validate(skill);
    $('stats').replaceChildren(...[
      kv('Шкода за застосування', pc(ev.damage), 'У відсотках від сили атаки, на п’яти ворогах у колі'),
      kv('Шкода на секунду (по перезарядці)', pc(ev.perSecond), 'Шкода, поділена на перезарядку (не менше 0.5 с)'),
      kv('Лікування', pc(ev.heal), 'Сумарне лікування, у % сили атаки'),
      kv('Щит', pc(ev.shield), 'Сумарний щит, у % сили атаки'),
      kv('Контроль', ev.control.toFixed(1) + ' с', 'Зважена сума секунд контролю по всіх цілях'),
      kv('Уражає цілей', ev.targets.toFixed(1), 'Середня кількість ворогів із п’яти'),
      kv('Тривалість дії', ev.duration.toFixed(1) + ' с', 'Від початку касту до кінця останнього ефекту'),
      kv('Сила скіла', ev.power.toFixed(2) + ' САт', 'Сума всього корисного в одиницях «звичайний удар»'),
      kv('Цеглинок', String(ev.complexity), 'Складність скіла'),
      h('div', { class: 'verdict ' + ev.verdict, title: 'Порівняння сили з ціною: ресурс, перезарядка й каст' }, `${E.VERDICT[ev.verdict]} (ефективність ${ev.efficiency.toFixed(2)}; норма 0.8–1.3). Підсумок: ${E.summary(skill, ev)}.`),
      h('div', { class: 'sugg' }, 'Підібрати для балансу:',
        h('button', { title: `Поставити перезарядку ${ev.suggestCooldown} с (за поточної ціни)`, onclick: () => { skill.cast.cooldown = Math.min(600, ev.suggestCooldown); checkpoint(); renderAll(); } }, `перезарядка ${ev.suggestCooldown} с`),
        h('button', { title: `Поставити ціну ${ev.suggestCost} (за поточної перезарядки)`, onclick: () => { skill.cast.cost = Math.min(10000, ev.suggestCost); if (skill.cast.resource === 'none') skill.cast.resource = 'mana'; checkpoint(); renderAll(); } }, `ціна ${ev.suggestCost}`)),
      issues.length ? h('div', { class: 'warns' }, issues.map(i => h('div', { class: 'warn ' + i.level }, i.msg))) : null].filter(Boolean));
    $('descText').textContent = E.describe(skill);
    preview.set(skill);
  }
  function renderPresets() {
    $('presets').replaceChildren(...P.LIST.map(p => h('button', { title: p.desc, onclick: () => { sel = null; setSkill(P.build(p)); toast('Завантажено приклад: ' + p.name); } }, p.name)));
  }
  function renderAll() { renderPalette(); renderMeta(); renderTree(); refreshSide(); updateUndo(); }

  /* ---------- збереження й обмін ---------- */
  function copy(text, msg) {
    const done = () => toast(msg);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallback());
    else fallback();
    function fallback() { const t = h('textarea', { style: 'position:fixed;left:-999px' }, text); document.body.append(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Не вдалося скопіювати'); } t.remove(); }
  }
  const slug = s => (s || 'skill').toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/g, '-').replace(/^-|-$/g, '') || 'skill';
  const json = () => JSON.stringify(F.serialize(skill), null, 2);
  $('btnCopyJson').addEventListener('click', () => copy(json(), 'JSON скопійовано'));
  $('btnCopyText').addEventListener('click', () => copy(E.describe(skill), 'Опис скопійовано'));
  $('btnPrint').addEventListener('click', () => window.print());
  $('btnCopyTree').addEventListener('click', () => {
    const node = { id: slug(skill.name), name: skill.name, desc: skill.desc || E.summary(skill, E.evaluate(skill)), kind: 'notable', role: 'active', max: 1, cost: 1, need: 0, stats: {}, skill: F.serialize(skill) };
    copy(JSON.stringify(node, null, 2), 'Вузол для дерева скілів скопійовано');
  });
  $('btnSave').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([json()], { type: 'application/json' }));
    const a = h('a', { href: url, download: slug(skill.name) + '.skill.json' }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const dlg = $('dlgImport');
  $('btnImport').addEventListener('click', () => { $('importErr').textContent = ''; $('importText').value = ''; dlg.showModal(); });
  $('importFile').addEventListener('click', () => $('importFileInput').click());
  $('importFileInput').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { $('importText').value = t; }); e.target.value = ''; });
  $('importGo').addEventListener('click', () => {
    try {
      let o = JSON.parse($('importText').value);
      if (o && o.role === 'active' && o.skill) o = o.skill; // вузол, скопійований кнопкою «Для дерева скілів»
      setSkill(F.parse(o)); dlg.close(); toast('Скіл імпортовано');
    } catch (e) { $('importErr').textContent = e.message; }
  });

  /* ---------- решта керування ---------- */
  $('brickSearch').addEventListener('input', e => { query = e.target.value; renderPalette(); });
  $('btnUndo').addEventListener('click', undo);
  $('btnRedo').addEventListener('click', redoStep);
  $('btnClear').addEventListener('click', () => { skill.root = []; sel = null; checkpoint(); renderAll(); });
  $('btnRandom').addEventListener('click', () => { sel = null; setSkill(P.random(Math.random().toString(36).slice(2))); toast('Випадковий скіл: ' + skill.name); });
  $('btnPlay').addEventListener('click', () => { preview.stop(); loop ? preview.play(skill) : preview.once(skill); });
  $('btnLoop').addEventListener('click', e => { loop = !loop; e.currentTarget.classList.toggle('on', loop); if (loop) preview.play(skill); else preview.stop(); });
  document.addEventListener('keydown', e => {
    const k = window.zbKey ? window.zbKey(e) : e.key.toLowerCase(), typing = /^(input|textarea|select)$/i.test((e.target.tagName || ''));
    if ((e.ctrlKey || e.metaKey) && k === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redoStep() : undo(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'y' && !typing) { e.preventDefault(); redoStep(); }
    else if (e.code === 'Space' && !typing && !/^(button|a)$/i.test(e.target.tagName)) { e.preventDefault(); $('btnPlay').click(); }
  });
  window.addEventListener('resize', () => preview.resize());

  renderPresets(); renderAll(); preview.resize(); preview.set(skill);
})();
