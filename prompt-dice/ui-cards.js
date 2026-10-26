// Картки параметрів: чипи, замок, кубик, колір, власний текст; зміни стану параметра і ділянки манекена. Показ підгруп і ділянок: ui-workspace.js.
const cardQ = {};            // текст пошуку в картках (щоб не губився при перемальовуванні)
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
// Українська множина: 1 варіант, 2–4 варіанти, 5+ варіантів
const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
// Назва поля «Свій опис» у підгрупі меню: додаємо, до чого воно належить (на ділянці манекена це й так зрозуміло)
const textTitle = (sl, zone) => {
  const w = zone ? '' : MK_PART_UA[sl.part] || (sl.id === 'n_text' ? '18+' : '');
  return w ? sl.label + ' · ' + w : sl.label;
};
function slotCard(id, zone) {
  const sl = SLOTS[id], s = ss(id), scope = mkScope(sl, zone);
  const el = document.createElement('div');
  el.className = 'card' + (s.locked ? ' locked' : '') + (s.mode === 'manual' ? ' manual' : '') + (s.mode === 'off' ? ' off' : '');
  el.dataset.id = id; el.dataset.zone = zone || '';
  const rk = id === 'raceFeat' && !scope ? raceKey() : null;
  if (rk) el.classList.add('race-active');
  const title = rk ? 'Особливості раси: ' + mkLabel(SLOTS.race, rk) : sl.label;
  if (sl.text) {
    el.innerHTML = `<div class="card-h"><b>${esc(textTitle(sl, zone))}</b>${stateBadge(sl, s)}<span class="grow"></span></div>
      <textarea rows="2" spellcheck="false" placeholder="Свій опис англійськими тегами через кому, напр.: tattoo of a dragon, scar" title="Вільний текст для цієї ділянки: потрапляє в промпт як є"></textarea>
      <div class="hint">Тут можна дописати все, чого нема у списках. Теги англійською, через кому.</div>`;
    const ta = el.querySelector('textarea'); ta.value = s.mode === 'manual' ? s.value.join(', ') : '';
    ta.oninput = () => setText(id, ta.value);
    return el;
  }
  const opts = sl.opts(ctx()), n = scope ? opts.filter(o => mkInScope(sl, o, scope)).length : opts.length;
  el.innerHTML = `<div class="card-h"><b>${esc(title)}</b><small>${n ? n.toLocaleString('uk') + ' ' + plural(n, 'варіант', 'варіанти', 'варіантів') : 'генерується'}</small>${stateBadge(sl, s)}<span class="grow"></span>
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
    buildChips(sl, s, box, cardQ[id] || menuChipQuery(id, zone), scope);
    if (search) { search.value = cardQ[id] || ''; search.oninput = () => { cardQ[id] = search.value; buildChips(sl, s, box, search.value || menuChipQuery(id, zone), scope); }; }
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
function refreshStates() { renderOut(); mkRenderSvg(); renderStat(); renderMenuTree(); renderWorkHead(); }
function renderStat() {
  let total = 0;
  typeSlotIds().forEach(id => { const sl = SLOTS[id]; if (!visible(sl) || ss(id).mode === 'off') return; total += logCount(sl); });
  const e = $('stat'); if (e) e.textContent = `Комбінацій для цієї конфігурації: ≈ 10^${Math.round(total)}`;
}

