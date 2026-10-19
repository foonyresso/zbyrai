// Робоча зона: вкладки, картки параметрів (чипи, замок, кубик, власний текст), панель вибраної ділянки манекена.
const cardQ = {};            // текст пошуку в картках (щоб не губився при перемальовуванні)
let wQuery = '';             // пошук параметрів у вкладці
const fallbackMode = sl => (sl.manual ? 'off' : 'random');
const slotParts = sl => sl.parts || (sl.part ? [sl.part] : []);
const hasMannequin = () => st.type === 'char' || st.type === 'sprite';

/* ---------- зміни стану параметра ---------- */
// Значення, що відповідає варіанту o: сам o або o з кольором(-ами) («pink_bunny_ears» для «bunny ears»)
function valueOf(sl, vals, o) {
  const opts = new Set(sl.opts(ctx()));
  return vals.find(v => v === o || (!opts.has(v) && (parseColored(v, t => t === o) || {}).base === o));
}
function pickValue(id, o) {
  const sl = SLOTS[id], s = ss(id), multi = sl.kind === 'multi';
  const cur = s.mode === 'manual' ? s.value : [];
  const had = valueOf(sl, cur, o);
  let next;
  if (multi) next = had !== undefined ? cur.filter(x => x !== had) : mkEnforce(sl, [...cur, o]);
  else next = had !== undefined ? [] : [o];
  s.rolled = true;
  if (next.length) { s.mode = 'manual'; s.value = next; }
  else { s.mode = fallbackMode(sl); s.value = []; s.rolled = s.mode === 'off'; }
  afterChange(id); refreshCard(id);
}
// Колір вибирається в підгрупі, під її тегами: для кожного вибраного тегу, що може мати колір (одного чи двох)
function colorTargets(sl, s) {
  if (s.mode !== 'manual' || !s.value.length) return [];
  const opts = new Set(sl.opts(ctx()));
  return s.value.flatMap(v => {
    if (opts.has(v)) { const sp = colorSpec(sl, v); return sp ? [{ v, base: v, cs: [], sp }] : []; }
    const pc = parseColored(v, t => opts.has(t) && !!colorSpec(sl, t));
    return pc ? [{ v, base: pc.base, cs: pc.cs, sp: colorSpec(sl, pc.base) }] : [];
  });
}
function setTagColors(id, t, cs) {
  const sl = SLOTS[id], s = ss(id), nv = composeColor(t.base, cs, t.sp.kind, !sl.mk);
  s.value = s.value.map(x => (x === t.v ? nv : x)); s.rolled = true;
  afterChange(id); refreshCard(id);
}
// Параметр, де колір і є значенням (волосся, очі, нігті, шкіра): палітра в окремій підгрупі «Будь-який колір»
function setColorSlot(id, c) {
  const s = ss(id); s.mode = 'manual'; s.value = [COLOR_SLOT_FMT[id].fmt(c)]; s.rolled = true;
  afterChange(id); refreshCard(id);
}
function swatchRow(title, active, onPick, onClear) {
  const row = document.createElement('div'); row.className = 'colorrow';
  if (title) { const h = document.createElement('span'); h.className = 'cr-t'; h.textContent = title; row.appendChild(h); }
  COLORS.forEach(([en, ua, hex]) => {
    const b = document.createElement('button'); b.className = 'sw' + (active === en ? ' on' : ''); b.style.background = hex; b.title = ua; b.setAttribute('aria-label', ua);
    b.onclick = () => onPick(en); row.appendChild(b);
  });
  const lab = document.createElement('label'); lab.className = 'sw custom'; lab.title = 'Свій колір: підбирається найближча назва кольору';
  const inp = document.createElement('input'); inp.type = 'color'; inp.value = (COLORS.find(c => c[0] === active) || COLORS[0])[2];
  inp.onchange = () => onPick(nearestColor(inp.value)); lab.appendChild(inp); row.appendChild(lab);
  if (onClear) { const x = document.createElement('button'); x.className = 'sw clear'; x.textContent = '✕'; x.title = 'Без кольору'; x.onclick = onClear; row.appendChild(x); }
  return row;
}
// Палітри для вибраних тегів підгрупи (items — теги цієї підгрупи); два кольори — дві палітри
function colorRowsFor(sl, targets, items, into) {
  targets.filter(t => items.includes(t.base)).forEach(t => {
    for (let i = 0; i < t.sp.n; i++) {
      const title = t.sp.n > 1 ? `Колір ${i + 1}` : '';   // назву тегу не повторюємо: він виділений вище
      into.appendChild(swatchRow(title, t.cs[i], c => { const cs = t.cs.slice(); cs[i] = c; setTagColors(sl.id, t, cs); }, i === 0 && t.cs.length ? () => setTagColors(sl.id, t, []) : null));
    }
  });
}
function setText(id, text) {
  const s = ss(id), t = text.trim();
  s.mode = t ? 'manual' : 'off'; s.value = t ? [t] : []; s.rolled = true;
  afterChange(id); refreshStates();
}
function rollSlot(id, zone) { scopedUpdate(id, zone, (s, sl) => { s.mode = 'random'; s.locked = false; genSlot(sl); }); afterChange(id); refreshCard(id); }
function offSlot(id, zone) { scopedUpdate(id, zone, s => { s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; }); afterChange(id); refreshCard(id); }
function lockSlot(id) {
  const s = ss(id);
  if (s.mode === 'manual') { s.mode = 'random'; s.locked = true; } else s.locked = !s.locked;
  save(); refreshCard(id);
}
// Параметри ділянки; для параметрів із групами — лише ті, де на цій ділянці є що вибрати
function zoneSlotIds(zone) {
  return mkMembers(zone).flatMap(m => MK.partSlots[m] || []).filter((v, i, a) => a.indexOf(v) === i).filter(id => visible(SLOTS[id]) && slotHasZoneOpts(SLOTS[id], zone));
}
function slotHasZoneOpts(sl, zone) {
  if (!sl.groups || sl.mk) return true;
  const scope = mkScope(sl, zone);
  return sl.opts(ctx()).some(o => mkInScope(sl, o, scope));
}
// Змінює лише ту частину значення параметра, що належить до ділянки (решту групи лишає)
function scopedUpdate(id, zone, fn) {
  const sl = SLOTS[id], s = ss(id), scope = mkScope(sl, zone);
  const prev = s.mode === 'off' ? [] : s.value.slice(), prevMode = s.mode;
  fn(s, sl);
  if (!scope) return;
  s.value = mkEnforce(sl, [...prev.filter(v => !mkInScope(sl, v, scope)), ...s.value.filter(v => mkInScope(sl, v, scope))]);
  if (s.value.length && s.mode === 'off') s.mode = prevMode === 'off' ? 'manual' : prevMode;
  if (!s.value.length && s.mode !== 'off') { s.mode = fallbackMode(sl); s.rolled = s.mode === 'off'; }
}
function rollZone(zone) {
  zoneSlotIds(zone).forEach(id => { if (SLOTS[id].text) return; scopedUpdate(id, zone, (s, sl) => { s.mode = 'random'; s.locked = false; genSlot(sl); }); });
  save(); render();
}
function clearZone(zone) {
  zoneSlotIds(zone).forEach(id => scopedUpdate(id, zone, (s, sl) => { s.mode = fallbackMode(sl); s.value = []; s.locked = false; s.rolled = s.mode === 'off'; }));
  save(); render();
}
function offZone(zone) { zoneSlotIds(zone).forEach(id => scopedUpdate(id, zone, s => { s.mode = 'off'; s.value = []; s.locked = false; s.rolled = true; })); save(); render(); }

/* ---------- картка параметра ---------- */
function stateBadge(sl, s) {
  if (s.mode === 'off') return '<span class="bd off">не вказується</span>';
  if (s.mode === 'manual') return '<span class="bd man">вибір</span>';
  if (sl.manual) return '<span class="bd rnd">кубик</span>';
  return s.locked ? '<span class="bd lck">замок</span>' : '<span class="bd rnd">кубик</span>';
}
function cardValueText(sl, s, scope) {
  if (s.mode === 'off') return '';
  const vals = scope ? s.value.filter(v => mkInScope(sl, v, scope)) : s.value;
  if (!vals.length) return scope && s.value.length ? '— тут нічого —' : '— цього разу нічого —';
  return sl.text ? vals.join(', ') : (sl.uaFmt && sl.uaFmt(vals)) || (sl.fmt ? sl.fmt(vals) : vals.map(x => mkLabel(sl, x)).join(', '));
}
// Раса з окремим меню особливостей (race-data.js); null, якщо расу не вибрано чи меню немає
function raceKey() {
  const r = st.slots.race;
  const v = r && r.mode !== 'off' && r.value ? r.value[0] : null;
  return v && RACE_MENU[v] ? v : null;
}
const univOpen = {};
function buildChips(sl, s, box, q, scope) {
  box.innerHTML = '';
  const sel = new Set(s.mode === 'manual' ? s.value : []);
  const ql = q.toLowerCase();
  const optSet = new Set(sl.opts(ctx()));
  const colored = new Set([...sel].filter(v => !optSet.has(v)).map(v => (parseColored(v, t => optSet.has(t)) || {}).base).filter(Boolean));
  const avail = sl.groups ? optSet : null;
  const mk = (o, parent) => {
    const t = mkLabel(sl, o);
    if (ql && !t.toLowerCase().includes(ql) && !o.toLowerCase().includes(ql)) return false;
    const b = document.createElement('button');
    b.className = 'chip' + (sel.has(o) || colored.has(o) ? ' on' : '');
    b.textContent = t; b.title = o + (sl.kind === 'multi' ? ' · клік — додати чи прибрати' : ' · клік — вибрати, ще раз — скасувати');
    b.onclick = () => pickValue(sl.id, o);
    parent.appendChild(b); return true;
  };
  const addGroup = (name, items, into, cls, single) => {
    const wrap = document.createElement('div'); wrap.className = 'cgroup' + (cls ? ' ' + cls : '');
    const h = document.createElement('div'); h.className = 'cg-h'; h.textContent = name;
    if (single && items.length > 1) { const hint = document.createElement('i'); hint.textContent = 'одне з групи'; h.appendChild(hint); }
    wrap.appendChild(h);
    const row = document.createElement('div'); row.className = 'crow'; wrap.appendChild(row);
    let any = false; items.forEach(p => { if (mk(p, row)) any = true; });
    colorRowsFor(sl, targets, items, wrap);
    if (any) into.appendChild(wrap);
  };
  const targets = colorTargets(sl, s);
  const rk = sl.id === 'raceFeat' && !scope ? raceKey() : null;
  const shown = new Set();
  if (rk) {
    RACE_MENU[rk].forEach(([name, tags]) => { const items = tags.split('|').filter(t => optSet.has(t)); items.forEach(t => shown.add(t)); addGroup(name, items, box, 'race'); });
  } else if (sl.id === 'raceFeat' && !scope) {
    const hint = document.createElement('div'); hint.className = 'hint race-hint'; hint.textContent = 'Вибери расу вище: тут з’являться її особливості (крила, роги, вушка, хвости…). Нижче — універсальні, для будь-якої раси.'; box.appendChild(hint);
  }
  if (sl.groups) {
    const target = rk ? document.createElement('details') : box;
    if (rk) {
      target.className = 'univ'; target.open = !!univOpen[sl.id] || !!ql;
      target.ontoggle = () => { univOpen[sl.id] = target.open; };
      target.innerHTML = '<summary>Універсальні особливості (будь-яка раса)</summary>';
    }
    sl.groups.forEach(([name, items]) => {
      if (scope && !scope.has(name)) return;
      addGroup(name, items.map(x => x[1]).filter(p => avail.has(p) && !shown.has(p)), target, '', sl.gsingle && sl.gsingle.has(name));
    });
    if (rk && target.children.length > 1) box.appendChild(target);
  } else {
    const row = document.createElement('div'); row.className = 'crow'; box.appendChild(row);
    const all = sl.opts(ctx()); all.forEach(o => mk(o, row));
    colorRowsFor(sl, targets, all, box);
  }
  const cs = COLOR_SLOT_FMT[sl.id];
  if (cs && !scope && !ql) {
    const wrap = document.createElement('div'); wrap.className = 'cgroup';
    const h = document.createElement('div'); h.className = 'cg-h'; h.textContent = 'Будь-який колір (палітра)'; wrap.appendChild(h);
    const cur = s.mode === 'manual' ? s.value[0] : '';
    wrap.appendChild(swatchRow('', (COLORS.find(c => cs.fmt(c[0]) === cur) || [])[0], c => setColorSlot(sl.id, c)));
    box.appendChild(wrap);
  }
  if (!box.querySelector('.chip')) box.innerHTML = '<div class="hint">Нічого не знайдено.</div>';
}
function slotCard(id, zone) {
  const sl = SLOTS[id], s = ss(id), scope = mkScope(sl, zone);
  const el = document.createElement('div');
  el.className = 'card' + (s.locked ? ' locked' : '') + (s.mode === 'manual' ? ' manual' : '') + (s.mode === 'off' ? ' off' : '');
  el.dataset.id = id; el.dataset.zone = zone || '';
  const rk = id === 'raceFeat' && !scope ? raceKey() : null;
  if (rk) el.classList.add('race-active');
  const title = rk ? 'Особливості раси: ' + mkLabel(SLOTS.race, rk) : sl.label;
  if (sl.text) {
    el.innerHTML = `<div class="card-h"><b>${esc(sl.label)}</b>${stateBadge(sl, s)}<span class="grow"></span></div>
      <textarea rows="2" spellcheck="false" placeholder="Свій опис англійськими тегами через кому, напр.: tattoo of a dragon, scar" title="Вільний текст для цієї ділянки: потрапляє в промпт як є"></textarea>
      <div class="hint">Тут можна дописати все, чого нема у списках. Теги англійською, через кому.</div>`;
    const ta = el.querySelector('textarea'); ta.value = s.mode === 'manual' ? s.value.join(', ') : '';
    ta.oninput = () => setText(id, ta.value);
    return el;
  }
  const opts = sl.opts(ctx()), n = scope ? opts.filter(o => mkInScope(sl, o, scope)).length : opts.length;
  el.innerHTML = `<div class="card-h"><b>${esc(title)}</b><small>${n ? n.toLocaleString('uk') + ' варіантів' : 'генерується'}</small>${stateBadge(sl, s)}<span class="grow"></span>
      <button class="ib lk" title="${s.locked ? 'Зняти замок' : 'Замкнути: кубик не змінюватиме це значення'}">${s.locked ? '🔒' : '🔓'}</button>
      <button class="ib rl" title="Перекинути тільки цей параметр">🎲</button>
      <button class="ib of" title="Не вказувати цей параметр у промпті">∅</button></div>
    <div class="card-v${s.mode === 'off' || !s.value.length ? ' empty' : ''}"></div>
    ${n > 14 ? '<input class="csearch" placeholder="Пошук у списку…" autocomplete="off" title="Відфільтрувати варіанти за словом">' : ''}
    ${n ? '<div class="chips"></div>' : ''}`;
  el.querySelector('.card-v').textContent = cardValueText(sl, s, scope);
  el.querySelector('.lk').onclick = () => lockSlot(id);
  el.querySelector('.rl').onclick = () => rollSlot(id, zone);
  el.querySelector('.of').onclick = () => offSlot(id, zone);
  const search = el.querySelector('.csearch');
  if (n) {
    const box = el.querySelector('.chips');
    buildChips(sl, s, box, cardQ[id] || '', scope);
    if (search) { search.value = cardQ[id] || ''; search.oninput = () => { cardQ[id] = search.value; buildChips(sl, s, box, search.value, scope); }; }
  }
  return el;
}
function refreshCard(id) {
  if (id === 'gender') { renderWork(); refreshStates(); return; }
  document.querySelectorAll('.card[data-id="' + id + '"]').forEach(old => {
    const chipsScroll = old.querySelector('.chips') ? old.querySelector('.chips').scrollTop : 0;
    const neu = slotCard(id, old.dataset.zone); old.replaceWith(neu);
    if (neu.querySelector('.chips')) neu.querySelector('.chips').scrollTop = chipsScroll;
  });
  if (id === 'race' && SLOTS.raceFeat) refreshCard('raceFeat'); // меню особливостей залежить від раси
  else refreshStates();
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
function renderPrimaryNav(tabs) {
  const nav = document.getElementById('forgePrimaryNav');
  if (!nav) return;
  const labels = {
    zone: ['Ділянка тіла','♙'],
  };
  const icons = [
    ['персонаж','♙'],['ділянка','♙'],['одяг','♧'],['збро','⚔'],['поз','✧'],
    ['ракурс','◉'],['дія','➤'],['фон','▧'],['ефект','✦'],['світл','☼'],
    ['сцен','▧'],['стил','✺'],['інш','◇']
  ];
  nav.innerHTML = '';
  tabs.forEach((x,i) => {
    const label = x.t.replace(/^🧍\s*/, '').trim();
    const low = label.toLowerCase();
    const found = icons.find(([needle]) => low.includes(needle));
    const icon = (labels[x.id] && labels[x.id][1]) || (found && found[1]) || '✧';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'forge-nav-item primary-section' + (x.id === st.wtab ? ' active' : '');
    b.dataset.primaryTab = x.id;
    b.innerHTML = '<span>' + icon + '</span>' + esc(label) + '<small>›</small>';
    b.title = x.tip || label;
    b.onclick = () => {
      st.wtab = x.id;
      wQuery = '';
      const search = document.getElementById('wSearch');
      if (search) search.value = '';
      save();
      renderTabs();
      renderWork();
    };
    nav.appendChild(b);
  });
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
  renderPrimaryNav(tabs);
}

/* ---------- вміст вкладок ---------- */
function groupBlock(title, ids, openByDefault, key, zone) {
  const d = document.createElement('details'); d.className = 'grp';
  d.open = key in st.closed ? !st.closed[key] : openByDefault;
  d.ontoggle = () => { st.closed[key] = !d.open; save(); };
  const filled = ids.filter(id => { const s = ss(id); return s.mode !== 'off' && s.value.length && (SLOTS[id].mk || s.mode === 'manual'); }).length;
  d.innerHTML = `<summary>${esc(title)}<small>${ids.length}</small>${filled ? '<i class="dot"></i>' : ''}</summary><div class="cards"></div>`;
  const cards = d.querySelector('.cards');
  ids.forEach(id => cards.appendChild(slotCard(id, zone)));
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
  const own = (MK.partSlots[z] || []).filter(id => visible(SLOTS[id]) && matchQ(id) && slotHasZoneOpts(SLOTS[id], z));
  if (g) {
    const cards = document.createElement('div'); cards.className = 'cards'; own.forEach(id => cards.appendChild(slotCard(id, z))); box.appendChild(cards);
    g.parts.forEach(p => {
      const ids = (MK.partSlots[p] || []).filter(id => visible(SLOTS[id]) && matchQ(id) && slotHasZoneOpts(SLOTS[id], p));
      if (ids.length && !mkGroup(p)) box.appendChild(groupBlock(mkZoneLabel(p), ids, false, 'z:' + st.type + ':' + p, p));
    });
  } else {
    const cards = document.createElement('div'); cards.className = 'cards'; own.forEach(id => cards.appendChild(slotCard(id, z))); box.appendChild(cards);
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
