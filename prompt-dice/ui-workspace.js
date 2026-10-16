// Робоча зона: вкладки, картки параметрів (чипи, замок, кубик, власний текст), панель вибраної ділянки манекена.
const cardQ = {};            // текст пошуку в картках (щоб не губився при перемальовуванні)
let wQuery = '';             // пошук параметрів у вкладці
const fallbackMode = sl => (sl.manual ? 'off' : 'random');
const slotParts = sl => sl.parts || (sl.part ? [sl.part] : []);
const hasMannequin = () => st.type === 'char' || st.type === 'sprite';

/* ---------- зміни стану параметра ---------- */
function pickValue(id, o) {
  const sl = SLOTS[id], s = ss(id), multi = sl.kind === 'multi';
  const cur = s.mode === 'manual' ? s.value : [];
  let next;
  if (multi) next = cur.includes(o) ? cur.filter(x => x !== o) : [...cur, o];
  else next = cur.includes(o) ? [] : [o];
  s.rolled = true;
  if (next.length) { s.mode = 'manual'; s.value = next; }
  else { s.mode = fallbackMode(sl); s.value = []; s.rolled = s.mode === 'off'; }
  afterChange(id); refreshCard(id);
}
function setText(id, text) {
  const s = ss(id), t = text.trim();
  s.mode = t ? 'manual' : 'off'; s.value = t ? [t] : []; s.rolled = true;
  afterChange(id); refreshStates();
}
function rollSlot(id) { const s = ss(id); s.mode = 'random'; s.locked = false; genSlot(SLOTS[id]); afterChange(id); refreshCard(id); }
function offSlot(id) { const s = ss(id); s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; afterChange(id); refreshCard(id); }
function lockSlot(id) {
  const s = ss(id);
  if (s.mode === 'manual') { s.mode = 'random'; s.locked = true; } else s.locked = !s.locked;
  save(); refreshCard(id);
}
function zoneSlotIds(zone) { return mkMembers(zone).flatMap(m => MK.partSlots[m] || []).filter((v, i, a) => a.indexOf(v) === i).filter(id => visible(SLOTS[id])); }
function rollZone(zone) {
  zoneSlotIds(zone).forEach(id => { if (SLOTS[id].text) return; const s = ss(id); s.mode = 'random'; s.locked = false; genSlot(SLOTS[id]); });
  save(); render();
}
function clearZone(zone) {
  zoneSlotIds(zone).forEach(id => { const s = ss(id), sl = SLOTS[id]; s.mode = fallbackMode(sl); s.value = []; s.locked = false; s.rolled = s.mode === 'off'; });
  save(); render();
}
function offZone(zone) { zoneSlotIds(zone).forEach(id => { const s = ss(id); s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; }); save(); render(); }

/* ---------- картка параметра ---------- */
function stateBadge(sl, s) {
  if (s.mode === 'off') return '<span class="bd off">не вказується</span>';
  if (s.mode === 'manual') return '<span class="bd man">вибір</span>';
  if (sl.manual) return '<span class="bd rnd">кубик</span>';
  return s.locked ? '<span class="bd lck">замок</span>' : '<span class="bd rnd">кубик</span>';
}
function cardValueText(sl, s) {
  if (s.mode === 'off') return '';
  if (!s.value.length) return '— цього разу нічого —';
  return sl.text ? s.value.join(', ') : (sl.fmt ? sl.fmt(s.value) : s.value.map(x => mkLabel(sl, x)).join(', '));
}
function buildChips(sl, s, box, q) {
  box.innerHTML = '';
  const sel = new Set(s.mode === 'manual' ? s.value : []);
  const ql = q.toLowerCase();
  const mk = (o, parent) => {
    const t = mkLabel(sl, o);
    if (ql && !t.toLowerCase().includes(ql) && !o.toLowerCase().includes(ql)) return false;
    const b = document.createElement('button');
    b.className = 'chip' + (sel.has(o) ? ' on' : '');
    b.textContent = t; b.title = sl.lab && sl.lab[o] ? o : (sl.kind === 'multi' ? 'Клік — додати чи прибрати' : 'Клік — вибрати, ще раз — скасувати');
    b.onclick = () => pickValue(sl.id, o);
    parent.appendChild(b); return true;
  };
  if (sl.groups) {
    sl.groups.forEach(([name, items]) => {
      const wrap = document.createElement('div'); wrap.className = 'cgroup';
      const h = document.createElement('div'); h.className = 'cg-h'; h.textContent = name; wrap.appendChild(h);
      const row = document.createElement('div'); row.className = 'crow'; wrap.appendChild(row);
      let any = false; items.forEach(([, p]) => { if (mk(p, row)) any = true; });
      if (any) box.appendChild(wrap);
    });
  } else {
    const row = document.createElement('div'); row.className = 'crow'; box.appendChild(row);
    sl.opts(ctx()).forEach(o => mk(o, row));
  }
  if (!box.children.length) box.innerHTML = '<div class="hint">Нічого не знайдено.</div>';
}
function slotCard(id) {
  const sl = SLOTS[id], s = ss(id);
  const el = document.createElement('div');
  el.className = 'card' + (s.locked ? ' locked' : '') + (s.mode === 'manual' ? ' manual' : '') + (s.mode === 'off' ? ' off' : '');
  el.dataset.id = id;
  if (sl.text) {
    el.innerHTML = `<div class="card-h"><b>${esc(sl.label)}</b>${stateBadge(sl, s)}<span class="grow"></span></div>
      <textarea rows="2" spellcheck="false" placeholder="Свій опис англійськими тегами через кому, напр.: tattoo of a dragon, scar" title="Вільний текст для цієї ділянки: потрапляє в промпт як є"></textarea>
      <div class="hint">Тут можна дописати все, чого нема у списках. Теги англійською, через кому.</div>`;
    const ta = el.querySelector('textarea'); ta.value = s.mode === 'manual' ? s.value.join(', ') : '';
    ta.oninput = () => setText(id, ta.value);
    return el;
  }
  const opts = sl.opts(ctx()), n = opts.length;
  el.innerHTML = `<div class="card-h"><b>${esc(sl.label)}</b><small>${n ? n.toLocaleString('uk') + ' варіантів' : 'генерується'}</small>${stateBadge(sl, s)}<span class="grow"></span>
      <button class="ib lk" title="${s.locked ? 'Зняти замок' : 'Замкнути: кубик не змінюватиме це значення'}">${s.locked ? '🔒' : '🔓'}</button>
      <button class="ib rl" title="Перекинути тільки цей параметр">🎲</button>
      <button class="ib of" title="Не вказувати цей параметр у промпті">∅</button></div>
    <div class="card-v${s.mode === 'off' || !s.value.length ? ' empty' : ''}"></div>
    ${n > 14 ? '<input class="csearch" placeholder="Пошук у списку…" autocomplete="off" title="Відфільтрувати варіанти за словом">' : ''}
    ${n ? '<div class="chips"></div>' : ''}`;
  el.querySelector('.card-v').textContent = cardValueText(sl, s);
  el.querySelector('.lk').onclick = () => lockSlot(id);
  el.querySelector('.rl').onclick = () => rollSlot(id);
  el.querySelector('.of').onclick = () => offSlot(id);
  const search = el.querySelector('.csearch');
  if (n) {
    const box = el.querySelector('.chips');
    buildChips(sl, s, box, cardQ[id] || '');
    if (search) { search.value = cardQ[id] || ''; search.oninput = () => { cardQ[id] = search.value; buildChips(sl, s, box, search.value); }; }
  }
  return el;
}
function refreshCard(id) {
  if (id === 'gender') { renderWork(); refreshStates(); return; }
  document.querySelectorAll('.card[data-id="' + id + '"]').forEach(old => {
    const chipsScroll = old.querySelector('.chips') ? old.querySelector('.chips').scrollTop : 0;
    const neu = slotCard(id); old.replaceWith(neu);
    if (neu.querySelector('.chips')) neu.querySelector('.chips').scrollTop = chipsScroll;
  });
  refreshStates();
}
function refreshStates() { renderOut(); mkRenderSvg(); renderStat(); renderTabs(); }
function renderStat() {
  let total = 0;
  typeSlotIds().forEach(id => { const sl = SLOTS[id]; if (!visible(sl) || ss(id).mode === 'off') return; total += logCount(sl); });
  const e = $('stat'); if (e) e.textContent = `Комбінацій для цієї конфігурації: ≈ 10^${Math.round(total)}`;
}

/* ---------- вкладки ---------- */
function workTabs() {
  const t = T(), tabs = [];
  if (hasMannequin()) tabs.push({ id: 'zone', t: '🧍 Ділянка тіла', tip: 'Параметри ділянки, яку вибрано на манекені' });
  t.sections.forEach((sec, i) => {
    if (sec.meta || (sec.models && !isPixel() && !sec.models.includes(st.model))) return;
    if (!sec.s.some(id => visible(SLOTS[id]))) return;
    tabs.push({ id: 's' + i, t: sec.t.replace(/^\d+\s*·\s*/, ''), sec, tip: sec.e });
  });
  return tabs;
}
function renderTabs() {
  const tabs = workTabs(), box = $('wTabs');
  if (!tabs.find(x => x.id === st.wtab)) st.wtab = tabs[0].id;
  box.innerHTML = '';
  tabs.forEach(x => {
    const b = document.createElement('button'); b.className = 'wtab' + (x.id === st.wtab ? ' on' : '');
    b.textContent = x.t; b.title = x.tip || '';
    const filled = x.sec ? x.sec.s.filter(id => visible(SLOTS[id]) && SLOTS[id].mk && ss(id).mode !== 'off' && ss(id).value.length).length : (st.zone ? (mkZoneState(st.zone) === 'user' ? 1 : 0) : 0);
    if (filled) { const d = document.createElement('i'); d.className = 'dot'; b.appendChild(d); }
    b.onclick = () => { st.wtab = x.id; save(); renderWork(); renderTabs(); };
    box.appendChild(b);
  });
}

/* ---------- вміст вкладок ---------- */
function groupBlock(title, ids, openByDefault, key) {
  const d = document.createElement('details'); d.className = 'grp';
  d.open = key in st.closed ? !st.closed[key] : openByDefault;
  d.ontoggle = () => { st.closed[key] = !d.open; save(); };
  const filled = ids.filter(id => { const s = ss(id); return s.mode !== 'off' && s.value.length && (SLOTS[id].mk || s.mode === 'manual'); }).length;
  d.innerHTML = `<summary>${esc(title)}<small>${ids.length}</small>${filled ? '<i class="dot"></i>' : ''}</summary><div class="cards"></div>`;
  const cards = d.querySelector('.cards');
  ids.forEach(id => cards.appendChild(slotCard(id)));
  return d;
}
function matchQ(id) { if (!wQuery) return true; const sl = SLOTS[id], q = wQuery.toLowerCase(); return sl.label.toLowerCase().includes(q) || (MK_PART_UA[slotParts(sl)[0]] || '').toLowerCase().includes(q); }
function renderSection(sec, box) {
  const ids = sec.s.filter(id => visible(SLOTS[id]) && matchQ(id));
  if (!ids.length) { box.innerHTML = '<div class="hint">Нічого не знайдено за цим пошуком.</div>'; return; }
  const base = ids.filter(id => !SLOTS[id].mk && !slotParts(SLOTS[id]).length), byPart = {};
  const old = ids.filter(id => !SLOTS[id].mk && slotParts(SLOTS[id]).length);
  const key = p => 'g:' + st.type + ':' + p;
  const first = [...base, ...old];
  if (first.length) box.appendChild(groupBlock('Основні параметри', first, true, key('main')));
  ids.filter(id => SLOTS[id].mk).forEach(id => { const p = SLOTS[id].part; (byPart[p] = byPart[p] || []).push(id); });
  MK.order.filter(p => byPart[p]).forEach(p => box.appendChild(groupBlock(MK_PART_UA[p] || p, byPart[p], !!wQuery || !first.length && p === MK.order.find(q => byPart[q]), key(p))));
}
// Панель вибраної ділянки: хлібні крихти, дії, картки; для групи ще й вкладені частини
function renderZone(box) {
  const z = st.zone;
  if (!z) { box.innerHTML = '<div class="empty-zone"><div class="big">👈</div><b>Вибери ділянку на манекені</b><p>Клікни по нозі, руці, голові, волоссю, очах… Тут з’являться параметри саме цієї частини: готові варіанти і поле для власного опису. Перемикач «Цілі частини» вибирає одразу всю руку, ногу чи торс.</p></div>'; return; }
  const g = mkGroup(z), part = !g ? MK_ZONES.find(q => q.id === z) : null;
  const head = document.createElement('div'); head.className = 'zhead';
  const crumbs = [];
  if (z !== 'body') crumbs.push('body');
  if (part && part.group && part.group !== z) crumbs.push(part.group);
  if (g && z !== 'body' && g.id !== 'body') { /* група: крихта тільки «Тіло» */ }
  head.innerHTML = `<div class="crumbs">${crumbs.map(c => `<button class="crumb" data-z="${c}" title="Перейти: ${esc(mkZoneLabel(c))}">${esc(mkZoneLabel(c))}</button><span>›</span>`).join('')}<h3>${esc(mkZoneLabel(z))}</h3></div>
    <div class="zact"><button id="zRoll" title="Підібрати випадкові значення для всіх параметрів цієї ділянки (і вкласти їх у кубик)">🎲 Випадково</button>
    <button id="zClear" title="Зняти ручний вибір і замки на цій ділянці">↺ Очистити</button>
    <button id="zOff" title="Нічого не вказувати для цієї ділянки в промпті">∅ Вимкнути</button></div>`;
  box.appendChild(head);
  head.querySelectorAll('.crumb').forEach(b => (b.onclick = () => selectZone(b.dataset.z)));
  head.querySelector('#zRoll').onclick = () => rollZone(z);
  head.querySelector('#zClear').onclick = () => clearZone(z);
  head.querySelector('#zOff').onclick = () => offZone(z);
  // сусідні частини групи (швидкий перехід)
  const grp = g || mkGroup(part.group);
  if (grp) {
    const sib = document.createElement('div'); sib.className = 'sibs';
    sib.innerHTML = '<span>' + (g ? 'Частини:' : 'Сусідні частини:') + '</span>';
    (g ? g.parts : grp.parts).forEach(p => {
      const b = document.createElement('button'); b.className = 'sib' + (p === z ? ' on' : '');
      const stt = mkZoneState(p); if (stt) b.classList.add(stt);
      b.textContent = mkZoneLabel(p); b.title = 'Редагувати: ' + mkZoneLabel(p); b.onclick = () => selectZone(p);
      sib.appendChild(b);
    });
    box.appendChild(sib);
  }
  const own = (MK.partSlots[z] || []).filter(id => visible(SLOTS[id]) && matchQ(id));
  if (g) {
    const cards = document.createElement('div'); cards.className = 'cards'; own.forEach(id => cards.appendChild(slotCard(id))); box.appendChild(cards);
    g.parts.forEach(p => {
      const ids = (MK.partSlots[p] || []).filter(id => visible(SLOTS[id]) && matchQ(id));
      if (ids.length && !mkGroup(p)) box.appendChild(groupBlock(mkZoneLabel(p), ids, false, 'z:' + st.type + ':' + p));
    });
  } else {
    const cards = document.createElement('div'); cards.className = 'cards'; own.forEach(id => cards.appendChild(slotCard(id))); box.appendChild(cards);
    if (!own.length) box.insertAdjacentHTML('beforeend', '<div class="hint">Для цієї ділянки поки немає параметрів.</div>');
  }
}
function renderWork() {
  const box = $('wBody'); box.innerHTML = '';
  const tabs = workTabs(), tab = tabs.find(x => x.id === st.wtab) || tabs[0];
  $('wSearchBox').hidden = tab.id === 'zone' && !st.zone;
  if (tab.id === 'zone') renderZone(box); else renderSection(tab.sec, box);
}
function renderWorkspace() {
  document.body.classList.toggle('no-mk', !hasMannequin());
  if (hasMannequin()) { mkRenderToolbar(); mkRenderSvg(); }
  renderTabs(); renderWork(); renderStat();
}
$('wSearch').oninput = () => { wQuery = $('wSearch').value.trim(); renderWork(); };
$('mkView').querySelectorAll('button').forEach(b => (b.onclick = () => mkSetView(b.dataset.v)));
$('mkMode').querySelectorAll('button').forEach(b => (b.onclick = () => { st.whole = b.dataset.m === 'whole'; save(); mkRenderToolbar(); mkRenderSvg(); }));
$('mkClear').onclick = () => { st.zone = ''; save(); render(); };
