// Атлас 2.0, місто на карті: міста будуються за потреби й проявляються з наближенням (замість іконки); наведення й клік на споруді, вулиці, районі; вікно подробиць; збереження (PNG, JSON). Велике інфо-вікно поселення не змінюється.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id), T = A.CityData.T;
  let card, bar, pinned = null, active = null, hl = { sid: -1, hover: null, sel: null, hoverDistrict: null }, queue = [], timer = 0, lastShown = null, W0 = null;
  const esc = t => String(t == null ? '' : t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  // картка біля курсора: праворуч-нижче, а біля краю екрана перекидається на інший бік
  let mx = 0, my = 0;
  function place() {
    if (!card || card.hidden) return; card.classList.toggle('pin', !!pinned); const st = $('stage'), sr = st.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight, gap = 18;
    let x = mx - sr.left + gap, y = my - sr.top + gap * 0.7; if (x + w > sr.width - 6) x = mx - sr.left - gap - w; if (y + h > sr.height - 6) y = my - sr.top - gap * 0.7 - h;
    card.style.left = Math.max(4, x) + 'px'; card.style.top = Math.max(4, y) + 'px'; card.style.bottom = 'auto';
  }
  document.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (card && !card.hidden && !pinned) place(); }, true);
  function ensure() {
    if (card) return; const st = $('stage');
    card = document.createElement('aside'); card.id = 'tdet'; card.className = 'tdet'; card.hidden = true; st.appendChild(card);
    bar = document.createElement('div'); bar.id = 'ctbar'; bar.className = 'ctbar'; bar.hidden = true;
    bar.innerHTML = '<b id="ctTitle" title="Місто, яке зараз у центрі екрана"></b><button id="ctPng" title="Зберегти план міста як зображення PNG">Завантажити PNG</button><button id="ctCopy" title="Скопіювати опис міста (райони, вулиці, споруди) як JSON у буфер обміну">Копіювати JSON</button><button id="ctJson" title="Завантажити опис міста файлом JSON">Завантажити JSON</button><span id="ctMsg" class="muted"></span>';
    st.appendChild(bar); $('ctPng').onclick = png; $('ctCopy').onclick = copyJson; $('ctJson').onclick = saveJson;
  }
  // ---- черга побудови: одне місто за раз, щоб карта не підвисала
  function schedule(W, s, geom) { if (queue.some(q => q[1].id === s.id)) return; queue.push([W, s, geom]); if (!timer) timer = setTimeout(pump, 25); }
  function pump() {
    timer = 0; const q = queue.shift(); if (!q) return; const [W, s, geom] = q;
    if (W === A.world && !A.Town.has(W, s)) { A.Town.get(W, s, { geom, mask: E => A.TownMask.make(W, s, E) }); if (A.redraw) A.redraw(); }
    if (queue.length) timer = setTimeout(pump, 25);
  }
  function draw(cv, W, view, L, geom) {
    ensure(); W0 = W; const CS = W.params.kmPerCell * 1000, list = []; let best = null, bd = 1e18;
    for (const s of W.settlements) {
      const z = A.Town.sizeOf(s), sx = view.tx + (s.x + 0.5) * view.k, sy = view.ty + (s.y + 0.5) * view.k, r = z.R * view.k / CS;
      if (r < 18 || sx + r * 1.6 < 0 || sy + r * 1.6 < 0 || sx - r * 1.6 > cv.width || sy - r * 1.6 > cv.height) continue;
      if (A.Town.has(W, s)) { list.push([s, A.Town.get(W, s)]); const d = (sx - cv.width / 2) ** 2 + (sy - cv.height / 2) ** 2; if (A.TownDraw.morph(s, view.k, CS) >= 0.6 && d < bd) { bd = d; best = s; } }
      else schedule(W, s, geom);
    }
    A.TownDraw.onMap(cv, W, view, L, list); setActive(best);
  }
  function setActive(s) { if (s === active) return; active = s; bar.hidden = !s; if (s) $('ctTitle').textContent = s.name; }
  const cityOf = s => A.Town.get(W0, s);
  // ---- пошук під курсором (координати клітин)
  function at(W, view, fx, fy) {
    const CS = W.params.kmPerCell * 1000; let out = null, bd = 1e18;
    for (const s of W.settlements) { if (!A.Town.has(W, s) || A.TownDraw.morph(s, view.k, CS) < 0.5) continue; const c = A.Town.get(W, s), lx = (fx - s.x - 0.5) * CS, ly = (fy - s.y - 0.5) * CS, d = Math.hypot(lx - c.c0[0], ly - c.c0[1]); if (d < c.R * 1.2 && d < bd) { bd = d; out = { s, c, h: A.Town.hit(c, lx, ly) }; } }
    return out;
  }
  function setHl(ct) { const h = ct && ct.h, c = ct && ct.c; hl.sid = c ? c.sid : -1; hl.hover = h && h.kind === 'building' ? h.o : null; hl.hoverDistrict = h && h.kind === 'district' ? h.o.id : h && h.kind === 'building' && h.o.district >= 0 ? h.o.district : null; }
  function render(ct, pinnedNow) {
    const d = ct && A.Town.describe(ct.c, ct.h); if (!d) { card.hidden = true; return; }
    const kv = r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`;
    card.style.setProperty('--dc', d.color || '#8aa');
    card.innerHTML = `<div class="dh"><i></i><b>${esc(d.title)}</b></div><div class="ds">${esc(d.sub || '')}</div>${d.text ? `<p>${esc(d.text)}</p>` : ''}${d.rows.length ? `<dl>${d.rows.map(kv).join('')}</dl>` : ''}${(d.groups || []).map(g => `<div class="sep"></div><div class="lb">${esc(g.h)}</div><dl>${g.rows.map(kv).join('')}</dl>`).join('')}${d.top ? `<div class="sep"></div><div class="lb">${esc(d.top[0])}</div><div>${esc(d.top[1])}</div>` : ''}${d.streets ? `<div class="sep"></div><div class="lb">Вулиці</div><div>${esc(d.streets)}</div>` : ''}${d.hook ? `<div class="sep"></div><div class="lb">Чутка</div><div>${esc(d.hook)}</div>` : ''}${d.list && d.list.length ? `<div class="sep"></div><div class="lb">Визначні місця</div><div class="chips">${d.list.map(q => `<button data-b="${q.id}" title="Закріпити споруду">${esc(q.name)}</button>`).join('')}</div>` : ''}${d.districtId != null && ct.h.kind === 'building' ? `<div class="chips"><button data-d="${d.districtId}" title="Показати подробиці району">${esc(d.go)}</button></div>` : ''}${pinnedNow ? '<div class="lb pinl">Закріплено · клік по порожньому знімає</div>' : ''}`;
    card.hidden = false; place();
    card.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { const dd = ct.c.districts[+b.dataset.d]; pinned = { s: ct.s, c: ct.c, h: { kind: 'district', o: dd } }; hl.hoverDistrict = dd.id; hl.sel = null; render(pinned, true); if (A.redrawOver) A.redrawOver(); }; });
    card.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => { const bb = ct.c.buildings[+b.dataset.b]; pinned = { s: ct.s, c: ct.c, h: { kind: 'building', o: bb } }; hl.sel = bb; render(pinned, true); if (A.redrawOver) A.redrawOver(); }; });
  }
  function landmarkCard(lm) {
    const W = A.world, s = W.settlements[lm.from], K = A.LANDMARK_KINDS[lm.kind], gn = A.Danger && A.Danger.groupName(W, lm.i);
    card.style.setProperty('--dc', A.LANDMARK_COL[lm.kind]);
    card.innerHTML = `<div class="dh"><i></i><b>${esc(lm.name)}</b></div><div class="ds">${esc(K.n)}</div><p>${esc(K.d)}</p><dl><dt>Біля міста</dt><dd>${esc(s.name)}</dd><dt>Відстань</dt><dd>${String(lm.km).replace('.', ',')} км</dd>${gn ? `<dt>Ландшафт</dt><dd>${esc(A.Danger.GROUP_UA[gn] || gn)}</dd>` : ''}</dl>`; card.hidden = false; place();
  }
  function hover(ct, lm) { ensure(); if (pinned) return; if (A.DungeonUI && A.DungeonUI.hovering()) return; setHl(ct); if (!ct && lm) { landmarkCard(lm); return; } render(ct, false); if (!ct || !ct.h) card.hidden = true; }
  function click(ct) { ensure(); if (!ct || !ct.h || (pinned && pinned.h.o === ct.h.o)) { pinned = null; hl.sel = null; setHl(ct); render(ct, false); if (!ct || !ct.h) card.hidden = true; return; } pinned = ct; hl.sel = ct.h.kind === 'building' ? ct.h.o : null; setHl(ct); render(ct, true); }
  function drawOver(cv, W, view) { drawOver0(cv, W, view); if (A.DungeonUI) A.DungeonUI.markers(cv, W, view); } // входи в підземелля малює ui/dungeon.js
  function drawOver0(cv, W, view) {
    if (hl.sid < 0 || !A.Town.has(W, W.settlements[hl.sid])) return; const s = W.settlements[hl.sid], CS = W.params.kmPerCell * 1000, t = A.TownDraw.morph(s, view.k, CS); if (t < 0.3) return;
    A.TownDraw.overlay(cv, A.Town.get(W, s), { k: view.k / CS, tx: view.tx + (s.x + 0.5) * view.k, ty: view.ty + (s.y + 0.5) * view.k }, { hover: hl.hover, sel: hl.sel, hoverDistrict: hl.hoverDistrict, alpha: t });
  }
  // ---- збереження
  function cityJson(s, c) {
    const r1 = v => Math.round(v * 10) / 10;
    return { format: 'atlas2-city', version: 1, seed: W0.params.seed, settlement: { id: s.id, name: s.name, rank: s.rank, pop: s.pop, port: !!s.port, fate: s.fate || (s.ruined ? 'ruined' : null) }, radius: Math.round(c.R), walled: c.walled, stats: c.stats,
      districts: c.districts.map(d => ({ id: d.id, kind: d.kind, name: d.name, buildings: d.nb, pop: d.pop, wealth: d.wealth, safety: d.safety })),
      streets: c.streets.map(q => ({ name: q.name, kind: q.kind, district: q.district, len: Math.round(q.len), points: q.pts.map(r1) })),
      squares: c.features.map(f => ({ kind: f.t, name: f.name, x: r1(f.x), y: r1(f.y), r: r1(f.r) })),
      buildings: c.buildings.map(b => ({ type: b.type, name: b.name, district: b.district, addr: b.addr, x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h), angle: Math.round(b.a * 100) / 100, floors: b.floors, pop: b.pop, owner: b.owner, condition: b.cond })) };
  }
  const fname = (s, ext) => (s.name || 'city').replace(/[^\p{L}\p{N}]+/g, '_') + '.' + ext;
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  function msg(t) { const m = $('ctMsg'); m.textContent = t; setTimeout(() => { m.textContent = ''; }, 3500); }
  function png() { if (!active) return; const c = cityOf(active), c2 = document.createElement('canvas'); c2.width = c2.height = 2400; const k = 2400 / (c.R * 2.9); A.TownDraw.draw(c2, c, { k, tx: 1200 - c.c0[0] * k, ty: 1200 - c.c0[1] * k }, { districts: true, names: true, labels: false }); const s = active; c2.toBlob(b => download(b, fname(s, 'png'))); }
  async function copyJson() { if (!active) return; try { await navigator.clipboard.writeText(JSON.stringify(cityJson(active, cityOf(active)))); msg('Скопійовано.'); } catch (e) { msg('Не вдалося скопіювати: завантажте файл.'); } }
  function saveJson() { if (!active) return; download(new Blob([JSON.stringify(cityJson(active, cityOf(active)))], { type: 'application/json' }), fname(active, 'json')); }
  // клік на значку поселення: наблизити до міста
  function focus(s) { const z = A.Town.sizeOf(s), CS = A.world.params.kmPerCell * 1000, k = Math.min(innerWidth, innerHeight) * devicePixelRatio * 0.4 / (z.R / CS); if (A.focusCell) A.focusCell(s.x + 0.5, s.y + 0.5, Math.max(k, 60)); }
  function reset() { pinned = null; hl = { sid: -1, hover: null, sel: null, hoverDistrict: null }; queue = []; if (card) card.hidden = true; }
  A.TownMap = { draw, at, hover, click, drawOver, focus, reset, fade: (s, k) => { const W = A.world; return W && A.Town.has(W, s) ? 1 - A.TownDraw.morph(s, k, W.params.kmPerCell * 1000) : 1; }, isPinned: () => !!pinned };
})();
