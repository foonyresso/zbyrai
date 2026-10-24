// Атлас 2.0, підземелля в інтерфейсі: позначки входів на карті міста (наведення, клік), окремий екран карти підземелля (місто зникає): поверхи, масштаб, інфо-картки, секрети, інший варіант, збереження (JSON, PNG, друк), переходи між підземеллями.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id), DD = A.DungeonData;
  const KCOL = { sewer: '#3f8f9a', crypt: '#8a6ac0', catacomb: '#b0905a', manor: '#b07840', ruin: '#7a8a7a', mine: '#a07030', cave: '#6a7f60', cellar: '#a06848', deep: '#6a4a9a' };
  const esc = t => String(t == null ? '' : t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const SZ = { small: 'невелике', mid: 'середнє', big: 'велике, глибоко' };
  let hov = null, root, cvD, cardM, cardD, cur = null, fi = 0, view = { k: 10, tx: 0, ty: 0 }, rev = false, variant = {}, stack = [], hl = null, cache = new Map(), drag = null;
  // ---- позначки на карті міста
  function list(W, v, cv) {
    const out = [], CS = W.params.kmPerCell * 1000, on = $('lyDungeons'); if (on && !on.checked) return out;
    for (const s of W.settlements) {
      if (!A.Town.has(W, s)) continue; const z = A.Town.sizeOf(s); if (z.R * v.k / CS < 18 || A.TownDraw.morph(s, v.k, CS) < 0.6) continue;
      for (const d of A.DungeonPlace.forTown(W, s)) { const sx = v.tx + (s.x + 0.5) * v.k + d.entry.x * v.k / CS, sy = v.ty + (s.y + 0.5) * v.k + d.entry.y * v.k / CS; if (sx > -20 && sy > -20 && sx < cv.width + 20 && sy < cv.height + 20) out.push({ d, s, sx, sy }); }
    }
    return out;
  }
  function markers(cv, W, v) {
    const ctx = cv.getContext('2d'), q = devicePixelRatio; ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const m of list(W, v, cv)) {
      const r = (m.d === hov ? 11 : 9) * q; ctx.beginPath(); ctx.arc(m.sx, m.sy, r, 0, 6.2832); ctx.fillStyle = KCOL[m.d.kind] || '#555'; ctx.fill(); ctx.lineWidth = 2 * q; ctx.strokeStyle = m.d.size === 'big' ? '#ffd24a' : '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) ctx.fillRect(m.sx - (4 - i * 1.3) * q, m.sy - (3 - i * 2.4) * q, (8 - i * 2.6) * q, 1.6 * q);
    }
  }
  function cardHtml(c) { return `<div class="dh"><i></i><b>${esc(c.title)}</b></div><div class="ds">${esc(c.sub || '')}</div>${c.text ? `<p>${esc(c.text)}</p>` : ''}${c.rows && c.rows.length ? `<dl>${c.rows.map(r => `<dt>${esc(r[0])}</dt><dd>${r[1]}</dd>`).join('')}</dl>` : ''}${c.hint ? `<div class="sep"></div><div class="lb">${esc(c.hint)}</div>` : ''}`; }
  // картка біля курсора (як у ui/town.js): праворуч-нижче, біля краю перекидається; закріплена не рухається
  let mx = 0, my = 0, pinned = false;
  function place(el) {
    if (el.hidden) return; const sr = el.parentNode.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 18; let x = mx - sr.left + gap, y = my - sr.top + gap * 0.7;
    if (x + w > sr.width - 6) x = mx - sr.left - gap - w; if (y + h > sr.height - 6) y = my - sr.top - gap * 0.7 - h; el.style.left = Math.max(4, x) + 'px'; el.style.top = Math.max(4, y) + 'px';
  }
  document.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; for (const el of [cardM, cardD]) if (el && !el.hidden && !(el === cardD && pinned)) place(el); }, true);
  function show(el, c, col) { if (!c) { el.hidden = true; return; } el.style.setProperty('--dc', col || '#8aa'); el.innerHTML = cardHtml(c); el.hidden = false; place(el); }
  function markerCard(m) {
    const d = m.d, K = DD.KINDS[d.kind];
    return { title: d.name, sub: K.n + ' · ' + SZ[d.size], text: K.d, rows: [['Вхід', esc(d.entry.name)], ['Поверхів', d.floors], ['Глибина', d.depth.toFixed(0) + '–' + d.depthEnd.toFixed(0) + ' м'], ['Рівень загрози', d.level], ['Ходи в інші', d.links.length || '—']], hint: 'Клік — відкрити карту підземелля' };
  }
  function hitAt(e) {
    const W = A.world, v = A.getView && A.getView(), cv = $('map'); if (!W || !v) return null; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * devicePixelRatio, y = (e.clientY - r.top) * devicePixelRatio; let best = null, bd = (13 * devicePixelRatio) ** 2;
    for (const m of list(W, v, cv)) { const d = (m.sx - x) ** 2 + (m.sy - y) ** 2; if (d < bd) { bd = d; best = m; } } return best;
  }
  function ensureMapCard() { if (cardM) return; cardM = $('tdet'); if (!cardM) { cardM = document.createElement('aside'); cardM.id = 'tdet'; cardM.className = 'tdet'; cardM.hidden = true; $('stage').appendChild(cardM); } }
  function onMove(e) {
    if (root && !root.hidden) return; ensureMapCard(); if (cardM.classList.contains('pin')) return; const m = hitAt(e), d = m && m.d; if (d === hov) return; hov = d;
    show(cardM, m && markerCard(m), m && KCOL[d.kind]); if (A.redrawOver) A.redrawOver(); requestAnimationFrame(() => { if (hov) $('map').style.cursor = 'pointer'; });
  }
  let down = null;
  function init() {
    const st = $('stage'); st.addEventListener('pointermove', onMove, true); st.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; }, true);
    st.addEventListener('pointerup', e => { const d0 = down; down = null; if (!d0 || (root && !root.hidden) || Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 4) return; const m = hitAt(e); if (m) openDungeon(m.d.id, true); }, true);
    st.addEventListener('pointerleave', () => { if (hov) { hov = null; if (cardM) cardM.hidden = true; if (A.redrawOver) A.redrawOver(); } }, true);
  }
  // ---- екран підземелля
  const get = id => { const key = id + '|' + (variant[id] || 0); let D = cache.get(key); if (!D) { const W = A.world, d = A.DungeonPlace.find(W, id); if (!d) return null; const sp = A.DungeonPlace.specOf(W, W.settlements[d.sid], d); if (variant[id]) sp.seed = sp.seed + '|v' + variant[id]; D = A.Dungeon.generate(sp); D.town = W.settlements[d.sid].name; D.entryName = d.entry.name; cache.set(key, D); } return D; };
  function build() {
    root = document.createElement('div'); root.id = 'dview'; root.className = 'dview'; root.hidden = true;
    root.innerHTML = `<div class="dbar"><button id="dBack" title="Повернутися на карту міста">← До міста</button><b id="dTitle"></b><span class="dsp"></span><button id="dCopy" title="Скопіювати карту підземелля (кімнати, коридори, двері, вміст) як JSON у буфер обміну">Копіювати JSON</button><button id="dJson" title="Завантажити карту підземелля як файл JSON">Завантажити JSON</button><button id="dPng" title="Зберегти поточний поверх як зображення PNG">Завантажити PNG</button><button id="dPrint" title="Надрукувати поточний поверх">Друк</button><span id="dMsg" class="dmsg"></span></div>
<aside class="dtools"><details id="dHelp" open><summary title="Коротка довідка про цей екран">Що це, для чого, як користуватися</summary><p><b>Що це.</b> Карта підземелля під містом, створена випадково від номера (однаковий номер дає ту саму карту).</p><p><b>Для чого.</b> Готове підземелля для гри: кімнати, коридори, двері, монстри, пастки, скарби, сходи й ходи в сусідні підземелля.</p><p><b>Як користуватися.</b> Колесо — масштаб, перетягування — пересування, наведення — картка кімнати чи об’єкта. Сходи й переходи відкриваються кліком.</p></details>
<div class="dsec"><div class="lb">Поверхи</div><div id="dFloors" class="dfl"></div></div>
<div class="dsec"><div class="lb">Редагування</div><label class="chk" title="Показати потайні двері, приховані пастки й таємні кімнати"><input type="checkbox" id="dRev">Показати таємне</label><button id="dReroll" title="Створити інше підземелля того ж виду й розміру (інша випадкова розкладка)">Інший варіант</button></div>
<div class="dsec"><div class="lb">Позначки</div><p class="hint">Червоні кола — монстри (темно-червоне — бос), жовті трикутники — пастки, ромби — скарби, коричневі квадрати — двері, фіолетові — потайні, сині кола — ходи в інші підземелля, сходи — значок зі сходинками.</p></div></aside>
<canvas id="dcv"></canvas><aside id="dcard" class="tdet" hidden></aside>`;
    $('stage').appendChild(root); cvD = $('dcv'); cardD = $('dcard');
    cvD.addEventListener('wheel', e => { e.preventDefault(); const r = cvD.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, k = Math.min(80, Math.max(2, view.k * Math.exp(-e.deltaY * 0.0015))), q = k / view.k; view.tx = mx - (mx - view.tx) * q; view.ty = my - (my - view.ty) * q; view.k = k; paint(); }, { passive: false });
    cvD.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false }; cvD.setPointerCapture(e.pointerId); });
    cvD.addEventListener('pointermove', e => { if (drag) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) drag.moved = true; view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; paint(); } hoverD(e); });
    cvD.addEventListener('pointerup', e => { const d = drag; drag = null; if (d && !d.moved) clickD(e); });
    cvD.addEventListener('pointerleave', () => { hl = null; pinned = false; cardD.classList.remove('pin'); cardD.hidden = true; paint(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && root && !root.hidden) back(); }); addEventListener('resize', () => { if (root && !root.hidden) { size(); fit(); paint(); } });
  }
  const msg = t => { $('dMsg').textContent = t; setTimeout(() => { $('dMsg').textContent = ''; }, 3500); };
  function dl(blob, ext) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (cur.name || 'dungeon').replace(/[^\p{L}\p{N}]+/gu, '_') + '_' + (fi + 1) + '.' + ext; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  function png() { const f = cur.floors[fi], c2 = document.createElement('canvas'), k = 2400 / f.W; c2.width = 2400; c2.height = Math.round(f.H * k); A.DungeonDraw.draw(c2, cur, fi, { k, tx: 0, ty: 0 }, { reveal: rev }); c2.toBlob(b => dl(b, 'png')); }
  function size() { const r = cvD.getBoundingClientRect(); cvD.width = Math.round(r.width * devicePixelRatio); cvD.height = Math.round(r.height * devicePixelRatio); }
  function fit() { const f = cur.floors[fi], k = Math.min(cvD.width / f.W, cvD.height / f.H) * 0.94; view = { k, tx: (cvD.width - f.W * k) / 2, ty: (cvD.height - f.H * k) / 2 }; }
  function paint() { if (cur) A.DungeonDraw.draw(cvD, cur, fi, view, { reveal: rev, hlRoom: hl && hl.kind === 'room' ? hl.o.id : -1 }); }
  function tabs() { $('dFloors').innerHTML = cur.floors.map((f, i) => `<button data-f="${i}" class="${i === fi ? 'on' : ''}" title="Показати поверх ${i + 1}">Поверх ${i + 1}</button>`).join(''); $('dFloors').querySelectorAll('button').forEach(b => { b.onclick = () => { fi = +b.dataset.f; tabs(); fit(); paint(); }; }); }
  function open2(id, keepStack) {
    const D = get(id); if (!D) return; if (!root) build(); if (cur && cur.id !== id && !keepStack) stack.push(cur.id); cur = D; fi = 0; pinned = false; if (cardD) { cardD.classList.remove('pin'); cardD.hidden = true; } root.hidden = false; document.querySelectorAll('.top,.rail,.drawer,.ctbar,.tdet:not(#dcard),.info').forEach(e => e.classList.add('dhide'));
    $('dTitle').textContent = `${D.name} · ${D.kindName} · ${D.town}, глибина ${D.depth.toFixed(0)} м`; $('dBack').textContent = stack.length ? '← Назад' : '← До міста'; $('dBack').title = stack.length ? 'Повернутися до попереднього підземелля' : 'Повернутися на карту міста'; $('dRev').checked = rev; size(); fit(); tabs(); paint(); cardD.hidden = true;
  }
  function openDungeon(id) { stack = []; open2(id, true); }
  function back() { const p = stack.pop(); if (p) { open2(p, true); return; } root.hidden = true; cur = null; document.querySelectorAll('.dhide').forEach(e => e.classList.remove('dhide')); if (A.redraw) A.redraw(); }
  function pt(e) { const r = cvD.getBoundingClientRect(); return [((e.clientX - r.left) * devicePixelRatio - view.tx) / view.k, ((e.clientY - r.top) * devicePixelRatio - view.ty) / view.k]; }
  function cardOf(h) {
    const f = cur.floors[fi], K = DD.KINDS[cur.kind], T = TILE => TILE * 1, m = cur.tile, o = h.o, nm = n => n === 1 ? '' : ' × ' + n;
    if (h.kind === 'room') {
      const inR = a => a.filter(q => q.room === o.id && (rev || !q.hidden)), ms = f.monsters.filter(q => q.room === o.id), lt = inR(f.loot), tr = inR(f.traps), dr = f.doors.filter(q => q.room === o.id && (rev || !q.secret)), R = DD.ROOMS[o.type];
      return { title: R[0] + (o.secret ? ' (таємна)' : ''), sub: `Поверх ${fi + 1} · ${{ rect: 'прямокутна', round: 'округла', long: 'видовжена', cross: 'хрестова' }[o.shape]} · ${(o.w * m).toFixed(0)}×${(o.h * m).toFixed(0)} м`, text: R[1], rows: [['Площа', Math.round(o.area * m * m) + ' м²'], ['Двері', dr.length || '—'], ['Монстри', ms.length ? ms.map(q => esc(q.name) + nm(q.count)).join(', ') : '—'], ['Скарби', lt.length ? lt.map(q => esc(q.name)).join(', ') : '—'], ['Пастки', tr.length ? tr.map(q => esc(q.name)).join(', ') : rev ? '—' : 'не помічено']], col: '#8aa' };
    }
    if (h.kind === 'monster') return { title: o.name + nm(o.count), sub: (o.boss ? 'Бос' : 'Монстр') + ' · рівень ' + o.level, text: o.boss ? 'Господар цих залів; здобич поряд.' : 'Мешканець підземелля; стереже цю частину ходів.', rows: [['Кількість', o.count], ['Рівень', o.level]], col: '#cc3a2a' };
    if (h.kind === 'trap') return { title: o.name, sub: 'Пастка' + (o.hidden ? ' · прихована' : ''), text: o.text, rows: [], col: '#f0c030' };
    if (h.kind === 'loot') return { title: o.name, sub: 'Скарб', text: o.text, rows: [['Цінність', ['дрібна', 'добра', 'велика', 'рідкісна'][o.value] || '—']], col: '#e8c840' };
    if (h.kind === 'door') return { title: o.secret ? 'Потайні двері' : o.locked ? 'Замкнені двері' : 'Двері', sub: 'Двері', text: o.secret ? 'Їх видно лише тому, що ви знаєте, де шукати.' : o.locked ? 'Потрібен ключ або відмичка.' : 'Звичайні двері.', rows: [], col: '#a8743a' };
    if (h.kind === 'stairs') return { title: o.up ? (fi === 0 ? 'Вихід нагору' : 'Сходи нагору') : 'Сходи вниз', sub: 'Сходи', text: fi === 0 && o.up ? 'Підйом до входу в місті (' + cur.entryName + ').' : 'Перехід на поверх ' + (fi + (o.up ? 0 : 2)) + '.', rows: [], hint: fi === 0 && o.up ? '' : 'Клік — перейти на інший поверх', col: '#4a6a80' };
    if (h.kind === 'link') return { title: (o.secret ? DD.LINKS.secret : DD.LINKS.open) + ' ' + o.name, sub: 'З’єднання підземель', text: o.secret ? 'Потайний хід, який знають не всі.' : 'Відкритий хід між підземеллями.', rows: [], hint: 'Клік — відкрити те підземелля', col: '#4a78c0' };
    return { title: 'Коридор', sub: 'Поверх ' + (fi + 1), text: 'Вузький прохід між кімнатами.', rows: [], col: '#8aa' };
  }
  function hoverD(e) { mx = e.clientX; my = e.clientY; if (pinned) return; if (drag && drag.moved) { cardD.hidden = true; return; } const [x, y] = pt(e), h = A.DungeonDraw.at(cur, fi, x, y, rev); const same = (h && hl && h.o === hl.o && h.kind === hl.kind) || (!h && !hl); if (same) return; const prevRoom = hl && hl.kind === 'room', nowRoom = h && h.kind === 'room'; hl = h; cvD.style.cursor = h && (h.kind === 'stairs' || h.kind === 'link') ? 'pointer' : 'grab'; if (!h) cardD.hidden = true; else { const c = cardOf(h); show(cardD, c, c.col); } if (prevRoom || nowRoom) paint(); }
  function clickD(e) {
    const [x, y] = pt(e), h = A.DungeonDraw.at(cur, fi, x, y, rev); if (pinned) { pinned = false; cardD.classList.remove('pin'); hl = null; hoverD(e); return; }
    if (!h) return;
    if (h.kind !== 'stairs' && h.kind !== 'link' && h.kind !== 'corridor') { pinned = true; cardD.classList.add('pin'); return; }
    if (h.kind === 'stairs' && !(fi === 0 && h.o.up)) { fi += h.o.up ? -1 : 1; pinned = false; cardD.hidden = true; tabs(); paint(); return; }
    if (h.kind === 'link') { stack.push(cur.id); open2(h.o.to, true); }
  }
  A.DungeonUI = { hovering: () => !!hov, markers, openById: openDungeon, init, open: id => openDungeon(id) };
  if (document.getElementById('stage')) init();
})();
