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
  let P = C.defaults(), d, fi = 0, view = { x: 0, y: 0, s: 10 }, sel = -1, selObj = null, hoverRoom = -1;
  const ui = Object.assign({ layers: { traps: true, monsters: true, loot: true, labels: true, secrets: false } }, store.get('ui', {}));
  try { const m = /[#&]s=([^&]+)/.exec(location.hash); if (m) P = C.fromJSON(unb64(decodeURIComponent(m[1]))); else { const s = store.get('state', null); if (s) P = C.fromJSON(s); } } catch {}
  $('lkType').checked = !!store.get('lockType', false);
  $('lkType').addEventListener('change', () => store.set('lockType', $('lkType').checked));
  const cv = $('cv'), ctx = cv.getContext('2d');

  /* ---------- меню збоку ---------- */
  const drawer = $('drawer'); let panel = store.get('panel', 'type');
  function showPanel(n) { panel = n; store.set('panel', n || ''); drawer.hidden = !n; document.querySelectorAll('#rail button').forEach(b => b.classList.toggle('on', b.dataset.panel === n)); drawer.querySelectorAll('section').forEach(x => x.classList.toggle('on', x.dataset.panel === n)); $('work').classList.toggle('shift', !!n); resize(); if (d) animateFit(); }
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
    ['link', 'Зв’язки кімнат', 0, 100, '0: кімнати з’єднані лише тунелями. Більше: прямі проходи між кімнатами, зали-проходи й печерні ходи (як у великих іграх, де кімнати переходять одна в одну)'],
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
  const LAYERS = [['tags', 'Особливості', 'Кольорові відтінки й позначки особливостей кімнат: вода, саркофаги, руда тощо (залежать від типу)'], ['traps', 'Пастки', 'Показати пастки червоними хрестиками'], ['monsters', 'Істоти', 'Червоні крапки там, де є істоти (скільки крапок, стільки істот, до п’яти)'], ['loot', 'Здобич', 'Жовті скриньки там, де є здобич'], ['labels', 'Назви', 'Підписи кімнат (видно при наближенні)'], ['secrets', 'Таємні двері', 'Показати приховані двері та таємні кімнати (як бачить майстер гри)']];
  if (ui.layers.tags === undefined) ui.layers.tags = true;
  for (const [k, label, title] of LAYERS) {
    const l = document.createElement('label'); l.className = 'chk'; l.title = title; l.innerHTML = `<input type="checkbox"><span>${label}</span>`; $('layers').appendChild(l);
    const inp = l.querySelector('input'); inp.checked = !!ui.layers[k]; inp.addEventListener('change', () => { ui.layers[k] = inp.checked; store.set('ui', ui); redraw(); });
  }

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
  let lastType = null, lastLayout = '';
  const layoutKey = () => [P.seed, P.type, P.rooms, P.levels, P.style, P.branch, P.loops, P.secrets, P.link].join('|');
  function commit(refit) {
    P = C.normalize(P); store.set('state', C.toJSON(P));
    d = C.generate(P); fi = Math.min(fi, d.floors.length - 1); sel = -1; selObj = null;
    if (lastType !== P.type) { renderTypes(); renderTypeCtls(); lastType = P.type; }
    syncUI(); renderFloors(); renderRoom();
    const key = layoutKey(), changed = key !== lastLayout; lastLayout = key;
    if (refit && !view.init) { fitView(); view.init = true; } else if (refit || changed) animateFit();
    redraw();
  }
  function resize() { const r = cv.getBoundingClientRect(), k = window.devicePixelRatio || 1; if (!r.width) return; cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); redraw(); }
  const dpr = () => window.devicePixelRatio || 1;
  // вільна від меню ділянка полотна: усе підземелля вписується в неї
  function freeBox() { const k = dpr(), cr = cv.getBoundingClientRect(), left = (drawer.hidden ? 84 : drawer.getBoundingClientRect().right - cr.left + 12) * k; return { x: left, y: 56 * k, w: Math.max(120, cv.width - left - 16 * k), h: Math.max(120, cv.height - 56 * k - 108 * k) }; }
  function fitTarget() { return R.fit(d, fi, freeBox()); }
  function fitView() { view = Object.assign(fitTarget(), { init: true }); }
  let anim = 0;
  function animateFit() {
    const to = fitTarget(), from = { x: view.x, y: view.y, s: view.s }, t0 = performance.now(), D = 420; cancelAnimationFrame(anim);
    if (!view.init) { view = Object.assign(to, { init: true }); redraw(); return; }
    const step = now => { const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3); const ls = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e);
      // масштаб міняється плавно в логарифмі; центр мапи рухається лінійно
      const cx0 = from.x + freeBox().w / 2 / from.s, cy0 = from.y + freeBox().h / 2 / from.s, cx1 = to.x + freeBox().w / 2 / to.s, cy1 = to.y + freeBox().h / 2 / to.s, cx = cx0 + (cx1 - cx0) * e, cy = cy0 + (cy1 - cy0) * e;
      view = { s: ls, x: cx - freeBox().w / 2 / ls, y: cy - freeBox().h / 2 / ls, init: true }; if (t === 1) view = Object.assign(to, { init: true }); redraw(); if (t < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  const drawOpt = () => ({ layers: ui.layers, sel, hover: hoverRoom });
  function redraw() {
    if (!d || !cv.width) return; const k = dpr();
    R.draw(ctx, d, fi, view, drawOpt(), cv.width, cv.height);
    const s = d.stats, nm = window.DungeonMonsters ? DungeonMonsters.list.length : 0, L = s.links || {};
    $('meta').textContent = `${d.type ? d.type.name : 'Підземелля'} · поверх ${fi + 1} з ${d.floors.length} · кімнат ${d.floors[fi].rooms.length} із ${s.rooms} · дверей ${Math.round(s.doors)} (таємних ${s.secrets}) · пасток ${s.traps} · істот ${s.monsters} (${s.kinds} видів) · здобич у ${s.loot} · зв’язки: тунелів ${L.tunnel || 0}, прямих ${L.direct || 0}, залів ${L.wide || 0}, печерних ${L.natural || 0} · база монстрів: ${nm || 'не завантажена'} · зерно ${P.seed}`;
  }
  function renderFloors() {
    const box = $('floors'); box.innerHTML = '';
    d.floors.forEach((f, i) => { const b = document.createElement('button'); b.textContent = 'Поверх ' + (i + 1); b.title = i === 0 ? 'Верхній поверх: тут вхід' : 'Поверх ' + (i + 1) + ' (сходи з попереднього)'; b.className = i === fi ? 'on' : ''; b.onclick = () => { fi = i; sel = -1; selObj = null; renderFloors(); renderRoom(); animateFit(); }; box.appendChild(b); });
    box.hidden = d.floors.length < 2;
  }
  const ROLES = { start: 'вхід', boss: 'фінал', down: 'сходи вниз', dead: 'глухий кут', hub: 'перехрестя', room: 'кімната' };
  const KINDS = { weak: 'слабкий', monster: 'звичайний', other: 'дух чи мандрівник', 'mini-boss': 'міні-бос', boss: 'бос', 'super-boss': 'супербос', 'world-boss': 'світовий бос' };
  const tagChips = r => r.tags.map(k => `<span class="tag" title="${C.TAGS[k][1]}">${C.TAGS[k][0]}</span>`).join('');
  const monText = r => r.monsters ? `${r.monsters.count} × ${r.monsters.name}${r.monsters.id ? ` (${KINDS[r.monsters.kind] || r.monsters.kind})` : ''}${r.monsters.boss ? ', володар' : ''}` : 'порожньо';
  const TRAPINFO = { 'плита-натискач': 'Прихована плита: при наступанні спрацьовує механізм.', 'яма з шипами': 'Замаскована яма з шипами на дні.', 'стріли зі стіни': 'Стрілки вилітають зі стіни, коли хтось проходить.', 'отруйний газ': 'Газ заповнює прохід, потрібно швидко вибігти.', 'обвал стелі': 'Стеля обвалюється на того, хто зачепить розтяжку.', 'сигнальний дзвін': 'Дзвін зриває тишу й кличе мешканців підземелля.' };
  const roomHTML = r => `<p><b>${r.name}</b> <span class="tag">${ROLES[r.role]}</span><span class="tag">${C.SHAPE_NAMES[r.shape]}</span>${r.secret ? '<span class="tag">таємна</span>' : ''}</p>${r.tags.length ? `<p>${tagChips(r)}</p>` : ''}<p>Розмір: ${r.w}×${r.h} плиток · виходів: ${r.deg} · кроків від входу: ${r.dist}</p><p>Істоти: ${monText(r)}</p><p>Здобич: ${r.loot ? `${r.loot.what} (${r.loot.tier})` : 'немає'}</p><p>Пастки: ${r.traps.length ? r.traps.map(t => t.kind).join(', ') : 'немає'}</p>`;
  const flr = () => d.floors[fi];
  const roomOf = o => o && o.room >= 0 ? flr().rooms[o.room] : null;
  // короткий опис об'єкта під курсором і докладна картка по кліку
  function brief(o) {
    const r = roomOf(o), nm = r && r.secret && !ui.layers.secrets ? 'Кімната' : r && r.name;
    switch (o.type) {
      case 'monster': return `<b>${r.monsters.name}</b><br>${r.monsters.count} × ${KINDS[r.monsters.kind] || r.monsters.kind}${r.monsters.boss ? ', володар кімнати' : ''}`;
      case 'loot': return `<b>${r.loot.what}</b><br>Здобич (${r.loot.tier}) у кімнаті «${r.name}»`;
      case 'trap': return `<b>Пастка: ${o.trap.kind}</b>`;
      case 'start': return `<b>${r.name}</b><br>Звідси починається підземелля`;
      case 'boss': return `<b>Фінальна зала</b><br>Володар: ${r.monsters ? r.monsters.name : '—'}`;
      case 'down': case 'stairs-down': return '<b>Сходи вниз</b><br>На наступний поверх';
      case 'stairs-up': return '<b>Сходи нагору</b><br>На попередній поверх';
      case 'door': return '<b>Двері</b>'; case 'secret': return '<b>Таємні двері</b><br>Приховані від гравців';
      case 'corr': return '<b>Коридор</b>'; case 'hall': return '<b>Зал-прохід</b><br>Широкий хід між кімнатами';
      default: return `<b>${nm}</b><br>${ROLES[r.role]}${r.tags.length ? ', ' + r.tags.map(k => C.TAGS[k][0].toLowerCase()).join(', ') : ''}`;
    }
  }
  function detail(o) {
    const r = roomOf(o);
    switch (o.type) {
      case 'monster': { const m = r.monsters; return `<p><b>${m.name}</b> <span class="tag">${KINDS[m.kind] || m.kind}</span>${m.boss ? '<span class="tag">володар</span>' : ''}</p><p>Кількість: ${m.count}</p>${m.desc ? `<p>${m.desc}</p>` : ''}<p class="hint">Живе в кімнаті «${r.name}». ${m.id ? 'Запис із бази монстрів світів: ' + m.id : 'Загальний мешканець типу підземелля.'}</p>`; }
      case 'loot': return `<p><b>${r.loot.what}</b> <span class="tag">${r.loot.tier}</span></p><p class="hint">Кімната «${r.name}»${r.secret ? ' (таємна)' : ''}.</p>`;
      case 'trap': return `<p><b>${o.trap.kind}</b></p><p>${TRAPINFO[o.trap.kind] || ''}</p><p class="hint">${r ? 'У кімнаті «' + r.name + '».' : 'У коридорі.'}</p>`;
      case 'door': case 'secret': case 'corr': case 'hall': case 'stairs-up': case 'stairs-down': return `<p>${brief(o)}</p>`;
      default: return roomHTML(r);
    }
  }
  function renderRoom() {
    const card = $('roomCard'); if (!selObj) { card.hidden = true; return; }
    $('roomInfo').innerHTML = detail(selObj); card.hidden = false;
  }
  $('roomX').onclick = () => { sel = -1; selObj = null; renderRoom(); redraw(); };
  function tip(o, x, y) {
    const t = $('tip'); if (!o) { t.hidden = true; return; }
    t.innerHTML = brief(o); const k = dpr(); t.hidden = false; t.style.left = Math.min(x / k + 16, cv.clientWidth - 270) + 'px'; t.style.top = Math.min(y / k + 16, cv.clientHeight - 100) + 'px';
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
    const o = R.hit(d, fi, view, ui.layers, x, y), h = o ? o.room : -1; if (h !== hoverRoom) { hoverRoom = h; redraw(); } tip(o, x, y);
  });
  const end = e => { ptrs.delete(e.pointerId); if (drag && !drag.moved && ptrs.size === 0) { const [x, y] = pos(e), o = R.hit(d, fi, view, ui.layers, x, y); selObj = o; sel = o ? o.room : -1; renderRoom(); redraw(); } if (!ptrs.size) { drag = null; cv.classList.remove('drag'); } };
  cv.addEventListener('pointerleave', () => { hoverRoom = -1; tip(null); redraw(); });
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', e => { const [x, y] = pos(e); zoomAt(x, y, 2); });

  /* ---------- кнопки ---------- */
  const lockedType = () => $('lkType').checked;
  function rand() { P = C.randomize(P, { type: lockedType() }); commit(true); }
  $('btnRandom').onclick = rand;
  $('btnSeed').onclick = () => { P.seed = C.randSeed(); commit(true); };
  $('btnReset').onclick = () => { P = C.defaults(); commit(true); toast('Налаштування скинуто'); };
  $('btnFit').onclick = () => animateFit();
  $('zIn').onclick = () => zoomAt(cv.width / 2, cv.height / 2, 1.4); $('zOut').onclick = () => zoomAt(cv.width / 2, cv.height / 2, 1 / 1.4);
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); rand(); } });
  $('btnCopyJson').onclick = async () => toast(await copyText(C.toJSON(P)) ? 'JSON скопійовано' : 'Не вдалося скопіювати');
  $('btnLink').onclick = async () => { const u = location.href.split('#')[0] + '#s=' + encodeURIComponent(b64(C.toJSON(P))); toast(await copyText(u) ? 'Посилання скопійовано' : 'Не вдалося скопіювати'); };
  $('btnJson').onclick = () => { download(new Blob([C.toJSON(P)], { type: 'application/json' }), 'dungeon-' + P.seed + '.json'); toast('Файл збережено'); };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { P = C.fromJSON(await f.text()); commit(true); toast('Імпортовано'); } catch { toast('Це не схоже на файл підземелля'); } };
  $('btnPng').onclick = () => R.toPNG(d, fi, { palette: 'stone', layers: ui.layers }, 16, b => { download(b, `dungeon-${P.seed}-p${fi + 1}.png`); toast('PNG збережено'); });
  $('btnPrint').onclick = () => {
    const box = $('printArea'); box.innerHTML = ''; let left = d.floors.length; const parts = [];
    d.floors.forEach((f, i) => R.toPNG(d, i, { palette: 'print', layers: Object.assign({}, ui.layers, { secrets: false }) }, 10, b => {
      const h = document.createElement('h3'); h.textContent = `${d.type ? d.type.name : 'Підземелля'}, поверх ${i + 1} (зерно ${P.seed})`; const im = document.createElement('img'); im.src = URL.createObjectURL(b); parts[i] = [h, im];
      if (--left === 0) { parts.forEach(p => box.append(...p)); setTimeout(() => window.print(), 300); }
    }));
  };
  window.addEventListener('resize', resize);

  showPanel(panel); resize(); commit(true);
  if (window.DungeonMonsters) DungeonMonsters.ready.then(() => { commit(false); });
})();
