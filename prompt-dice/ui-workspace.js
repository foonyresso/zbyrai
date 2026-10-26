// Робоча зона (центр): підгрупа меню з картками параметрів або вибрана ділянка манекена; шапка з діями над групою (кубик, замок, очищення).
// Картки й зміни параметрів: ui-cards.js; дерево меню й пошук: ui-menu.js; манекен: ui-mannequin.js.

/* ---------- дії над групою параметрів (підгрупа меню або категорія) ---------- */
const bulkIds = ids => ids.filter(id => SLOTS[id] && visible(SLOTS[id]));
// «Заповнено»: вибране вручну, а для параметрів манекена ще й випале кубиком чи введене в «Свій опис»
function filledCount(ids) {
  return bulkIds(ids).filter(id => { const s = ss(id); return s.mode !== 'off' && s.value.length && (SLOTS[id].mk || s.mode === 'manual'); }).length;
}
// Замикаються лише параметри під кубиком: вибране вручну й так не змінюється, вимкнене не потрапляє в промпт
const lockableIds = ids => bulkIds(ids).filter(id => !SLOTS[id].text && ss(id).mode === 'random');
function lockState(ids) {
  const l = lockableIds(ids), n = l.filter(id => ss(id).locked).length;
  return !l.length ? 'none' : n === l.length ? 'all' : n ? 'some' : 'off';
}
function toggleLock(ids) {
  const l = lockableIds(ids), unlock = lockState(ids) === 'all';
  l.forEach(id => { ss(id).locked = !unlock; });
  save(); render();
}
function rollIds(ids) {
  bulkIds(ids).forEach(id => { const sl = SLOTS[id], s = ss(id); if (sl.text || (s.locked && s.mode === 'random')) return; s.mode = 'random'; s.locked = false; genSlot(sl); });
  save(); render();
}
function clearIds(ids) {
  bulkIds(ids).forEach(id => { const s = ss(id); s.mode = fallbackMode(SLOTS[id]); s.value = []; s.locked = false; s.rolled = s.mode === 'off'; });
  save(); render();
}
function offIds(ids) {
  bulkIds(ids).forEach(id => { const s = ss(id); s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; });
  save(); render();
}
const LOCK_ICON = { none: '🔓', off: '🔓', some: '🔐', all: '🔒' };
const LOCK_TIP = {
  none: 'Немає що замикати: параметри цієї групи вибрані вручну або вимкнені',
  off: 'Замкнути групу: кубик не змінюватиме значень, що зараз випали (вибране вручну й так не змінюється)',
  some: 'Частину параметрів замкнено. Клік замкне решту',
  all: 'Зняти замки з усієї групи',
};

/* ---------- шапка робочої зони ---------- */
const nodeById = id => menuNodes(MENU).find(n => n.id === id);
const navMode = () => (hasMannequin() && st.ui.nav === 'mk' ? 'mk' : 'menu');
function curNode() { return nodeById(st.wtab) || nodeById(st.ui.last) || menuNodes(MENU)[0]; }
const catOf = node => MENU.find(c => c.id === node.cat);
function actionsHTML(ids, tipRoll, tipClear, tipOff) {
  const ls = lockState(ids);
  return `<button id="gRoll" title="${esc(tipRoll)}">🎲 Випадково</button>
    <button id="gLock" ${ls === 'none' ? 'disabled' : ''} class="${ls === 'all' ? 'on' : ''}" title="${esc(LOCK_TIP[ls])}">${LOCK_ICON[ls]} ${ls === 'all' ? 'Замкнено' : 'Замкнути'}</button>
    <button id="gClear" title="${esc(tipClear)}">↺ Очистити</button>
    <button id="gOff" title="${esc(tipOff)}">∅ Вимкнути</button>`;
}
function bindActions(head, ids, roll, clear, off) {
  head.querySelector('#gRoll').onclick = roll || (() => rollIds(ids));
  head.querySelector('#gLock').onclick = () => toggleLock(ids);
  head.querySelector('#gClear').onclick = clear || (() => clearIds(ids));
  head.querySelector('#gOff').onclick = off || (() => offIds(ids));
}
function renderWorkHead() {
  const head = $('wHead'); if (!head) return;
  if (navMode() === 'mk') return renderZoneHead(head);
  const node = curNode();
  if (!node) { head.innerHTML = ''; return; }
  const cat = catOf(node), n = filledCount(node.all);
  $('workPane').style.setProperty('--cat', cat.color);
  head.innerHTML = `<div class="nh-sym">${menuIcon(cat.icon)}</div>
    <div class="nh-t"><div class="crumbs"><button class="crumb" id="nhCat" title="Показати категорію «${esc(cat.name)}» в меню">${esc(cat.name)}</button><span>›</span><h3>${esc(node.name)}</h3></div>
    <div class="nh-d">${esc(node.desc)}${n ? ` <b class="nh-n" title="Скільки параметрів цієї групи вибрано вручну або заповнено">вибрано: ${n}</b>` : ''}</div></div>
    <div class="zact">${actionsHTML(node.all, 'Перекинути всі параметри цієї групи кубиком (замкнені лишаються)', 'Зняти ручний вибір і замки в групі: параметри знову підуть під кубик', 'Не вказувати параметри цієї групи в промпті')}</div>`;
  bindActions(head, node.all);
  head.querySelector('#nhCat').onclick = () => { st.ui.open[cat.id] = true; save(); renderMenuTree(); scrollMenuTo(node.id); };
}

/* ---------- підгрупа меню ---------- */
function groupBlock(title, ids, openByDefault, key, zone) {
  const d = document.createElement('details'); d.className = 'grp';
  d.open = key in st.closed ? !st.closed[key] : openByDefault;
  d.ontoggle = () => { st.closed[key] = !d.open; save(); };
  const filled = filledCount(ids);
  d.innerHTML = `<summary title="Розгорнути або згорнути: ${esc(title)}">${esc(title)}<small>${ids.length}</small>${filled ? '<i class="dot"></i>' : ''}</summary><div class="cards"></div>`;
  const cards = d.querySelector('.cards');
  ids.forEach(id => cards.appendChild(slotCard(id, zone)));
  return d;
}
function renderNode(box) {
  const node = curNode();
  if (!node) { box.innerHTML = '<div class="empty-zone"><div class="big">🎲</div><b>Немає параметрів</b><p>Для цього типу й моделі в меню нічого немає.</p></div>'; return; }
  const q = mQuery ? qnorm(mQuery) : '', all = !q || nodeNameMatches(node, q);
  const slots = node.slots.filter(id => all || slotMatches(id, q)), texts = node.texts.filter(id => all || slotMatches(id, q));
  if (q) {
    const note = document.createElement('div'); note.className = 'filter-note';
    note.innerHTML = `Показано лише збіги з «<b>${esc(mQuery)}</b>». <button class="small" id="qClear" title="Прибрати пошук і показати всі параметри групи">Скинути пошук</button>`;
    box.appendChild(note); note.querySelector('#qClear').onclick = () => setMenuQuery('');
  }
  if (!slots.length && !texts.length) { box.insertAdjacentHTML('beforeend', '<div class="hint">У цій групі нічого не знайдено за пошуком.</div>'); return; }
  const cards = document.createElement('div'); cards.className = 'cards'; box.appendChild(cards);
  slots.forEach(id => cards.appendChild(slotCard(id, '')));
  if (texts.length) box.appendChild(groupBlock('Свій опис', texts, !!q || filledCount(texts) > 0, 't:' + st.type + ':' + node.id, ''));
}

/* ---------- ділянка манекена ---------- */
function renderZoneHead(head) {
  const z = st.zone;
  $('workPane').style.setProperty('--cat', '#8dbf95');
  if (!z) { head.innerHTML = '<div class="nh-sym">' + menuIcon('body') + '</div><div class="nh-t"><div class="crumbs"><h3>Манекен</h3></div><div class="nh-d">Вибери ділянку на манекені ліворуч: тут з’являться її параметри.</div></div>'; return; }
  const g = mkGroup(z), part = !g ? MK_ZONES.find(q => q.id === z) : null;
  const crumbs = [];
  if (z !== 'body') crumbs.push('body');
  if (part && part.group && part.group !== z) crumbs.push(part.group);
  const ids = zoneSlotIds(z);
  head.innerHTML = `<div class="nh-sym">${menuIcon('body')}</div>
    <div class="nh-t"><div class="crumbs">${crumbs.map(c => `<button class="crumb" data-z="${c}" title="Перейти: ${esc(mkZoneLabel(c))}">${esc(mkZoneLabel(c))}</button><span>›</span>`).join('')}<h3>${esc(mkZoneLabel(z))}</h3></div>
    <div class="nh-d">Параметри вибраної ділянки манекена${filledCount(ids) ? ` <b class="nh-n">вибрано: ${filledCount(ids)}</b>` : ''}</div></div>
    <div class="zact">${actionsHTML(ids, 'Підібрати випадкові значення для всіх параметрів цієї ділянки (і вкласти їх у кубик)', 'Зняти ручний вибір і замки на цій ділянці', 'Нічого не вказувати для цієї ділянки в промпті')}</div>`;
  head.querySelectorAll('.crumb').forEach(b => (b.onclick = () => selectZone(b.dataset.z)));
  bindActions(head, ids, () => rollZone(z), () => clearZone(z), () => offZone(z));
}
// Панель вибраної ділянки: сусідні частини, картки; для групи ще й вкладені частини
function renderZone(box) {
  const z = st.zone;
  if (!z) { box.innerHTML = '<div class="empty-zone"><div class="big">👈</div><b>Вибери ділянку на манекені</b><p>Клікни по нозі, руці, голові, волоссю, очах… Тут з’являться параметри саме цієї частини: готові варіанти і поле для власного опису. Перемикач «Цілі частини» вибирає одразу всю руку, ногу чи торс.</p></div>'; return; }
  const g = mkGroup(z), part = !g ? MK_ZONES.find(q => q.id === z) : null;
  const grp = g || mkGroup(part.group);
  if (grp) {
    const sib = document.createElement('div'); sib.className = 'sibs';
    sib.innerHTML = '<span>' + (g ? 'Частини:' : 'Сусідні частини:') + '</span>';
    grp.parts.forEach(p => {
      const b = document.createElement('button'); b.className = 'sib' + (p === z ? ' on' : '');
      const stt = mkZoneState(p); if (stt) b.classList.add(stt);
      b.textContent = mkZoneLabel(p); b.title = 'Редагувати: ' + mkZoneLabel(p); b.onclick = () => selectZone(p);
      sib.appendChild(b);
    });
    box.appendChild(sib);
  }
  const own = (MK.partSlots[z] || []).filter(id => visible(SLOTS[id]) && slotHasZoneOpts(SLOTS[id], z));
  const cards = document.createElement('div'); cards.className = 'cards'; own.forEach(id => cards.appendChild(slotCard(id, z))); box.appendChild(cards);
  if (g) {
    g.parts.forEach(p => {
      const ids = (MK.partSlots[p] || []).filter(id => visible(SLOTS[id]) && slotHasZoneOpts(SLOTS[id], p));
      if (ids.length && !mkGroup(p)) box.appendChild(groupBlock(mkZoneLabel(p), ids, false, 'z:' + st.type + ':' + p, p));
    });
  } else if (!own.length) box.insertAdjacentHTML('beforeend', '<div class="hint">Для цієї ділянки поки немає параметрів.</div>');
}

/* ---------- вся зона ---------- */
function renderWork() {
  const box = $('wBody'); box.innerHTML = '';
  renderWorkHead();
  if (navMode() === 'mk') renderZone(box); else renderNode(box);
}
function renderWorkspace() {
  rebuildMenu();
  // перший показ меню: відкриваємо категорію вибраної підгрупи (далі відкриті категорії керуються користувачем)
  if (!st.ui.init) { st.ui.init = true; const n = curNode(); if (n) st.ui.open[n.cat] = true; }
  const mk = hasMannequin();
  document.body.classList.toggle('no-mk', !mk);
  document.body.classList.toggle('no-nav', !mk && menuNodes(MENU).length <= 1);
  renderNav();
  if (mk) { mkRenderToolbar(); mkRenderSvg(); }
  renderMenuTree(); renderWork(); renderStat();
}
$('mkView').querySelectorAll('button').forEach(b => (b.onclick = () => mkSetView(b.dataset.v)));
$('mkMode').querySelectorAll('button').forEach(b => (b.onclick = () => { st.whole = b.dataset.m === 'whole'; save(); mkRenderToolbar(); mkRenderSvg(); }));
$('mkClear').onclick = () => { st.zone = ''; save(); render(); };
