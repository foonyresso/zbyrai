// Симулятор підземель: інтерфейс. Генерація в dungeon-core.js, малювання в dungeon-render.js.
(() => {
  'use strict';
  const $ = id => document.getElementById(id), C = DungeonCore, R = DungeonRender;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dg_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('dg_' + k, JSON.stringify(v)); } catch {} },
  };
  const toast = (m, ms = 1900) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
  }
  const b64 = s => btoa(unescape(encodeURIComponent(s))), unb64 = s => decodeURIComponent(escape(atob(s)));

  /* ---------- стан ---------- */
  let P = C.defaults(), d, fi = 0, view = { x: 0, y: 0, s: 10 }, sel = -1, hover = -1;
  const ui = Object.assign({ theme: 'stone', layers: { traps: true, monsters: true, loot: true, labels: true, secrets: false } }, store.get('ui', {}));
  try { const m = /[#&]s=([^&]+)/.exec(location.hash); if (m) P = C.fromJSON(unb64(decodeURIComponent(m[1]))); else { const s = store.get('state', null); if (s) P = C.fromJSON(s); } } catch {}
  $('lkType').checked = !!store.get('lockType', false);
  $('lkType').addEventListener('change', () => store.set('lockType', $('lkType').checked));
  const cv = $('cv'), ctx = cv.getContext('2d');

  /* ---------- меню збоку ---------- */
  const drawer = $('drawer'); let panel = store.get('panel', 'type');
  function showPanel(n) { panel = n; store.set('panel', n || ''); drawer.hidden = !n; document.querySelectorAll('#rail button').forEach(b => b.classList.toggle('on', b.dataset.panel === n)); drawer.querySelectorAll('section').forEach(x => x.classList.toggle('on', x.dataset.panel === n)); resize(); }
  document.querySelectorAll('#rail button').forEach(b => b.onclick = () => showPanel(panel === b.dataset.panel ? '' : b.dataset.panel));
  $('drawerX').onclick = () => showPanel('');

  const sliderEl = (parent, label, min, max, title, get, set) => {
    const w = document.createElement('label'); w.className = 'ctl'; w.title = title;
    w.innerHTML = `<span>${label}</span><output></output><input type="range" min="${min}" max="${max}" step="1">`; parent.appendChild(w);
    const out = w.querySelector('output'), inp = w.querySelector('input');
    inp.addEventListener('input', () => { set(+inp.value); out.textContent = inp.value; commit(false); });
    return () => { inp.value = get(); out.textContent = get(); };
  };
  const syncers = [];
  const defs = [
    ['rooms', 'Кімнат (усього)', 3, 300, 'Скільки кімнат у підземеллі в сумі по всіх поверхах. Від 3 до 300'],
    ['levels', 'Поверхів', 1, 6, 'Скільки поверхів: між ними ведуть сходи вниз у найдальшій кімнаті'],
    ['danger', 'Небезпека', 1, 5, 'Які істоти (сильніші при високій небезпеці), скільки пасток і яка здобич: від 1 слабкої до 5 найсильнішої'],
    ['branch', 'Розгалуження', 0, 100, '0: довгі звивисті ходи без відгалужень (як лабіринт). 100: багато бічних відгалужень і глухих кутів'],
    ['loops', 'Петлі', 0, 100, 'Скільки додатково з’єднано сусідні кімнати, щоб можна було обійти колом. 0: жодних кіл'],
    ['secrets', 'Таємниці', 0, 100, 'Імовірність таємних дверей на глухих кутах і петлях. Видно, якщо ввімкнути «Таємні двері» у меню «Вигляд»'],
    ['traps', 'Пастки', 0, 100, 'Скільки пасток у коридорах і кімнатах'],
    ['mon', 'Щільність істот', 0, 100, 'У якій частці кімнат є істоти. Самі істоти беруться з бази монстрів світів'],
    ['loot', 'Здобич', 0, 100, 'Скільки схованок і скринь зі здобиччю: найбільше в глухих кутах'],
  ];
  for (const [k, label, min, max, title] of defs) syncers.push(sliderEl($('ctls'), label, min, max, title, () => P[k], v => { P[k] = v; }));
  { const w = document.createElement('label'); w.className = 'ctl'; w.title = 'Вигляд кімнат: прямокутні зали чи овальні печери';
    w.innerHTML = '<span>Стиль</span><span></span><select id="selStyle">' + Object.entries(C.STYLES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('') + '</select>'; $('ctls').appendChild(w);
    w.querySelector('select').addEventListener('change', e => { P.style = e.target.value; commit(false); }); }
  { const w = document.createElement('label'); w.className = 'ctl'; w.title = 'Зерно: код випадковості. Те саме зерно з тими самими налаштуваннями дає те саме підземелля';
    w.innerHTML = '<span>Зерно</span><span></span><input type="text" id="inSeed" maxlength="24" spellcheck="false">'; $('ctls').appendChild(w);
    w.querySelector('input').addEventListener('change', e => { P.seed = e.target.value.trim() || C.randSeed(); commit(false); }); }
  { const w = document.createElement('label'); w.className = 'ctl'; w.title = 'Колірна схема карти';
    w.innerHTML = '<span>Тема карти</span><span></span><select id="selTheme">' + Object.entries(R.THEMES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('') + '</select>'; $('viewCtl').appendChild(w);
    w.querySelector('select').addEventListener('change', e => { ui.theme = e.target.value; store.set('ui', ui); redraw(); }); }
  const LAYERS = [['tags', 'Особливості', 'Кольорові відтінки й позначки особливостей кімнат: вода, саркофаги, руда тощо (залежать від типу)'], ['traps', 'Пастки', 'Показати пастки червоними хрестиками'], ['monsters', 'Істоти', 'Червоні крапки там, де є істоти (скільки крапок, стільки істот, до п’яти)'], ['loot', 'Здобич', 'Жовті скриньки там, де є здобич'], ['labels', 'Назви', 'Підписи кімнат (видно при наближенні)'], ['secrets', 'Таємні двері', 'Показати приховані двері та таємні кімнати (як бачить майстер гри)']];
  if (ui.layers.tags === undefined) ui.layers.tags = true;
  for (const [k, label, title] of LAYERS) {
    const l = document.createElement('label'); l.className = 'chk'; l.title = title; l.innerHTML = `<input type="checkbox"><span>${label}</span>`; $('layers').appendChild(l);
    const inp = l.querySelector('input'); inp.checked = !!ui.layers[k]; inp.addEventListener('change', () => { ui.layers[k] = inp.checked; store.set('ui', ui); redraw(); });
  }
  $('selTheme').value = ui.theme;
  $('legend').innerHTML = [['#6fe29a', 'Вхід'], ['#ff6b61', 'Фінал'], ['#8fb7ff', 'Сходи вниз'], ['#f0c84f', 'Здобич'], ['#e86a5f', 'Істоти'], ['#ff5a4f', 'Пастка'], ['#a9794b', 'Двері']].map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join('') +
    Object.entries(C.TAGS).map(([k, v]) => `<span title="${v[1]}"><i style="background:${R.TAGCOL[k]}"></i>${v[0]}</span>`).join('');

  /* ---------- типи: список і власні налаштування типу ---------- */
  const ANCH = { city: 'під містами', settlement: 'у селах', poi: 'у місцях інтересу' };
  function renderTypes() {
    const q = $('typeFind').value.trim().toLowerCase(), box = $('types'); box.innerHTML = '';
    const items = [{ id: '', name: 'Вільне (без типу)', sub: 'загальні мешканці, будь-який розмір' }].concat(C.types.map(t => ({ id: t.id, name: t.name, sub: `${t.rooms[0]}–${t.rooms[1]} кімнат, ${t.levels[0]}–${t.levels[1]} пов., небезпека ${t.danger}` })));
    for (const t of items) { if (q && !t.name.toLowerCase().includes(q)) continue; const b = document.createElement('button'); b.className = t.id === P.type ? 'on' : ''; b.title = 'Обрати тип «' + t.name + '»: розмір, небезпека, стиль і особливості підлаштуються'; b.innerHTML = `<span>${t.name}</span><small>${t.sub}</small>`; b.onclick = () => { P = t.id ? C.applyType(P, t.id) : Object.assign(P, { type: '', opts: C.tagDefaults('') }); commit(true); }; box.appendChild(b); }
  }
  $('typeFind').addEventListener('input', renderTypes);
  let tagSync = [];
  function renderTypeCtls() {
    const ty = C.typeById(P.type), box = $('typeCtls'); box.innerHTML = ''; tagSync = [];
    $('typeSetH').textContent = 'Налаштування типу: ' + (ty ? ty.name : 'Вільне');
    $('typeHint').textContent = ty ? `${ty.desc} Мешканці: ${ty.inhabitants.join(', ')}. На карті світу: ${ANCH[ty.anchor] || ty.anchor}.` : 'Без типу: особливості загальні. Обери тип зі списку, щоб отримати його власні налаштування.';
    for (const k of Object.keys(P.opts)) tagSync.push(sliderEl(box, C.TAGS[k][0], 0, 100, C.TAGS[k][1] + '. 0: жодної, 100: у кожній кімнаті', () => P.opts[k], v => { P.opts[k] = v; }));
  }

  /* ---------- генерація й малювання ---------- */
  function syncUI() {
    syncers.forEach(f => f()); tagSync.forEach(f => f()); $('selStyle').value = P.style; $('inSeed').value = P.seed;
  }
  let lastType = null;
  function commit(refit) {
    P = C.normalize(P); store.set('state', C.toJSON(P));
    d = C.generate(P); fi = Math.min(fi, d.floors.length - 1); sel = -1;
    if (lastType !== P.type) { renderTypes(); renderTypeCtls(); lastType = P.type; }
    syncUI(); renderFloors(); renderStats(); renderRoom();
    if (refit) fitView(); redraw();
  }
  function resize() { const r = cv.getBoundingClientRect(), k = window.devicePixelRatio || 1; if (!r.width) return; cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); redraw(); }
  const dpr = () => window.devicePixelRatio || 1;
  function fitView() { const k = dpr(), pad = drawer.hidden ? 80 * k : 440 * k; const v = R.fit(d, fi, Math.max(100, cv.width - pad), cv.height - 120 * k); view = { s: v.s, x: v.x - (pad - 80 * k) / v.s, y: v.y - 40 * k / v.s }; }
  function redraw() {
    if (!d || !cv.width) return; const k = dpr();
    R.draw(ctx, d, fi, view, { theme: ui.theme, layers: ui.layers, sel, hover }, cv.width, cv.height);
    $('meta').textContent = `Поверх ${fi + 1} з ${d.floors.length} · ${d.floors[fi].rooms.length} кімнат · ${Math.round(view.s / k * 10) / 10} px/плитку · зерно ${P.seed}`;
  }
  function renderFloors() {
    const box = $('floors'); box.innerHTML = '';
    d.floors.forEach((f, i) => { const b = document.createElement('button'); b.textContent = 'Поверх ' + (i + 1); b.title = i === 0 ? 'Верхній поверх: тут вхід' : 'Поверх ' + (i + 1) + ' (сходи з попереднього)'; b.className = i === fi ? 'on' : ''; b.onclick = () => { fi = i; sel = -1; renderFloors(); renderRoom(); fitView(); redraw(); }; box.appendChild(b); });
    box.hidden = d.floors.length < 2;
  }
  function renderStats() {
    const s = d.stats, nm = window.DungeonMonsters ? DungeonMonsters.list.length : 0;
    $('stats').innerHTML = `<p><b>${d.type ? d.type.name : 'Підземелля'}</b>, небезпека ${P.danger}/5</p><p>Кімнат: <b>${s.rooms}</b> · поверхів: <b>${s.floors}</b></p><p>Дверей: <b>${s.doors}</b> (таємних ${s.secrets}) · коридорних плиток: ${s.corridors}</p><p>Пасток: <b>${s.traps}</b> · істот: <b>${s.monsters}</b> (${s.kinds} видів) · схованок зі здобиччю: <b>${s.loot}</b></p><p class="hint">Монстри читаються з бази світів: ${nm ? nm + ' файлів з medieval-world/monsters' : 'база не завантажилась, використано загальних мешканців типу'}.</p>`;
  }
  const ROLES = { start: 'вхід', boss: 'фінал', down: 'сходи вниз', dead: 'глухий кут', hub: 'перехрестя', room: 'кімната' };
  const KINDS = { weak: 'слабкий', monster: 'звичайний', other: 'дух чи мандрівник', 'mini-boss': 'міні-бос', boss: 'бос', 'super-boss': 'супербос', 'world-boss': 'світовий бос' };
  const tagChips = r => r.tags.map(k => `<span class="tag" title="${C.TAGS[k][1]}">${C.TAGS[k][0]}</span>`).join('');
  const monText = r => r.monsters ? `${r.monsters.count} × ${r.monsters.name}${r.monsters.id ? ` (${KINDS[r.monsters.kind] || r.monsters.kind})` : ''}${r.monsters.boss ? ', володар' : ''}` : 'порожньо';
  function roomHTML(r) {
    return `<p><b>${r.name}</b> <span class="tag">${ROLES[r.role]}</span>${r.secret ? '<span class="tag">таємна</span>' : ''}</p>${r.tags.length ? `<p>${tagChips(r)}</p>` : ''}<p>Розмір: ${r.w}×${r.h} плиток · виходів: ${r.deg} · кроків від входу: ${r.dist}</p><p>Істоти: ${monText(r)}</p>${r.monsters && r.monsters.desc ? `<p class="hint">${r.monsters.desc}</p>` : ''}<p>Здобич: ${r.loot ? `${r.loot.what} (${r.loot.tier})` : 'немає'}</p><p>Пастки: ${r.traps.length ? r.traps.map(t => t.kind).join(', ') : 'немає'}</p>`;
  }
  function renderRoom() {
    const r = d.floors[fi].rooms[sel], card = $('roomCard');
    if (!r) { card.hidden = true; return; }
    $('roomInfo').innerHTML = roomHTML(r); card.hidden = false;
  }
  $('roomX').onclick = () => { sel = -1; renderRoom(); redraw(); };
  function tip(h, x, y) {
    const t = $('tip'); if (h < 0) { t.hidden = true; return; }
    const r = d.floors[fi].rooms[h]; t.innerHTML = `<b>${r.secret && !ui.layers.secrets ? 'Кімната' : r.name}</b><br>Істоти: ${monText(r)}<br>Здобич: ${r.loot ? r.loot.what : 'немає'}${r.tags.length ? '<br>' + tagChips(r) : ''}`;
    const k = dpr(); t.hidden = false; t.style.left = Math.min(x / k + 16, cv.clientWidth - 270) + 'px'; t.style.top = Math.min(y / k + 16, cv.clientHeight - 120) + 'px';
  }

  /* ---------- миша й дотики ---------- */
  let drag = null; const ptrs = new Map();
  const pos = e => { const r = cv.getBoundingClientRect(), k = cv.width / r.width; return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
  function zoomAt(px, py, f) { const ns = Math.max(0.6, Math.min(60, view.s * f)); view.x += px / view.s - px / ns; view.y += py / view.s - py / ns; view.s = ns; redraw(); }
  cv.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = pos(e); zoomAt(x, y, e.deltaY < 0 ? 1.18 : 1 / 1.18); }, { passive: false });
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); ptrs.set(e.pointerId, [x, y]); drag = { x, y, vx: view.x, vy: view.y, moved: false, dist: ptrs.size === 2 ? Math.hypot(...[...ptrs.values()].reduce((a, p, i, arr) => i ? [a[0] - p[0], a[1] - p[1]] : [p[0], p[1]], [])) : 0, s: view.s }; cv.classList.add('drag'); });
  cv.addEventListener('pointermove', e => {
    const [x, y] = pos(e);
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [x, y]);
    if (drag && ptrs.size === 2) { const [a, b] = [...ptrs.values()], dd = Math.hypot(a[0] - b[0], a[1] - b[1]); if (drag.dist) { const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, ns = Math.max(.6, Math.min(60, drag.s * dd / drag.dist)); view.x += cx / view.s - cx / ns; view.y += cy / view.s - cy / ns; view.s = ns; drag.moved = true; redraw(); } return; }
    if (drag) { const dx = x - drag.x, dy = y - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; if (drag.moved) { view.x = drag.vx - dx / view.s; view.y = drag.vy - dy / view.s; redraw(); } return; }
    const h = R.pickRoom(d, fi, view, x, y); if (h !== hover) { hover = h; redraw(); } tip(h, x, y);
  });
  const end = e => { ptrs.delete(e.pointerId); if (drag && !drag.moved && ptrs.size === 0) { const [x, y] = pos(e), r = R.pickRoom(d, fi, view, x, y); sel = r; renderRoom(); redraw(); } if (!ptrs.size) { drag = null; cv.classList.remove('drag'); } };
  cv.addEventListener('pointerleave', () => { hover = -1; tip(-1); redraw(); });
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', e => { const [x, y] = pos(e); zoomAt(x, y, 2); });

  /* ---------- кнопки ---------- */
  const lockedType = () => $('lkType').checked;
  function rand() { P = C.randomize(P, { type: lockedType() }); commit(true); }
  $('btnRandom').onclick = rand;
  $('btnSeed').onclick = () => { P.seed = C.randSeed(); commit(true); };
  $('btnReset').onclick = () => { P = C.defaults(); commit(true); toast('Налаштування скинуто'); };
  $('btnFit').onclick = () => { fitView(); redraw(); };
  $('zIn').onclick = () => zoomAt(cv.width / 2, cv.height / 2, 1.4); $('zOut').onclick = () => zoomAt(cv.width / 2, cv.height / 2, 1 / 1.4);
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); rand(); } });
  $('btnCopyJson').onclick = async () => toast(await copyText(C.toJSON(P)) ? 'JSON скопійовано' : 'Не вдалося скопіювати');
  $('btnLink').onclick = async () => { const u = location.href.split('#')[0] + '#s=' + encodeURIComponent(b64(C.toJSON(P))); toast(await copyText(u) ? 'Посилання скопійовано' : 'Не вдалося скопіювати'); };
  $('btnJson').onclick = () => { download(new Blob([C.toJSON(P)], { type: 'application/json' }), 'dungeon-' + P.seed + '.json'); toast('Файл збережено'); };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { P = C.fromJSON(await f.text()); commit(true); toast('Імпортовано'); } catch { toast('Це не схоже на файл підземелля'); } };
  $('btnPng').onclick = () => R.toPNG(d, fi, { theme: ui.theme, layers: ui.layers }, 16, b => { download(b, `dungeon-${P.seed}-p${fi + 1}.png`); toast('PNG збережено'); });
  $('btnPrint').onclick = () => {
    const box = $('printArea'); box.innerHTML = ''; let left = d.floors.length; const parts = [];
    d.floors.forEach((f, i) => R.toPNG(d, i, { theme: 'blueprint', layers: Object.assign({}, ui.layers, { secrets: false }) }, 10, b => {
      const h = document.createElement('h3'); h.textContent = `${d.type ? d.type.name : 'Підземелля'}, поверх ${i + 1} (зерно ${P.seed})`; const im = document.createElement('img'); im.src = URL.createObjectURL(b); parts[i] = [h, im];
      if (--left === 0) { parts.forEach(p => box.append(...p)); setTimeout(() => window.print(), 300); }
    }));
  };
  window.addEventListener('resize', resize);

  showPanel(panel); resize(); commit(true);
  if (window.DungeonMonsters) DungeonMonsters.ready.then(() => { commit(false); });
})();
