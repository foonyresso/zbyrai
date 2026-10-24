// Атлас 2.0, місто: вікно детального міста поверх карти. Масштаб/пересування, наведення й клік на споруді, вулиці, районі; вікно подробиць; збереження (PNG, JSON). Велике інформаційне вікно поселення не змінюється.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id), T = A.CityData.T;
  let root, cv, det, cur = null, view = { k: 1, tx: 0, ty: 0 }, opt = { districts: true, names: true, labels: true, hover: null, sel: null, hoverDistrict: null }, pinned = null, raf = 0, drag = null, W = null, s = null, open = false;
  const esc = t => String(t == null ? '' : t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function ensure() {
    if (root) return; root = document.createElement('div'); root.id = 'town'; root.hidden = true;
    root.innerHTML = `<canvas id="tcv"></canvas>
<div class="tbar" id="tbar">
  <button id="tBack" title="Повернутися до карти світу">← До карти</button>
  <b id="tTitle" class="ttl" title="Назва поселення"></b>
  <span class="tgrp" title="Збереження й обмін">
    <button id="tPng" title="Зберегти план міста як зображення PNG">Завантажити PNG</button>
    <button id="tCopy" title="Скопіювати опис міста (райони, вулиці, споруди) як JSON у буфер обміну">Копіювати JSON</button>
    <button id="tJson" title="Завантажити опис міста файлом JSON">Завантажити JSON</button>
  </span>
  <span class="tgrp" title="Що показувати на плані">
    <label class="chk" title="Кольорове розбиття на райони й їхні назви"><input type="checkbox" id="tDist" checked>Райони</label>
    <label class="chk" title="Назви вулиць, площ, парків і воріт"><input type="checkbox" id="tNames" checked>Назви</label>
    <label class="chk" title="Підписи споруд при великому масштабі"><input type="checkbox" id="tLab" checked>Споруди</label>
  </span>
  <span class="tgrp"><button id="tIn" title="Наблизити">+</button><button id="tOut" title="Віддалити">−</button><button id="tFit" title="Показати все місто">Усе місто</button><button id="tHelp" title="Що це за вікно і як ним користуватися">Довідка</button></span>
</div>
<aside class="tdet" id="tdet" hidden></aside>
<div class="thint" id="thint">Наведи на споруду, вулицю чи район. Клік закріплює вікно подробиць.</div>
<dialog id="tHelpD" class="help"><form method="dialog"><button class="close" title="Закрити довідку" aria-label="Закрити">×</button></form><h2>Місто</h2><h3>Що це</h3><p>Детальний план поселення: райони, головні вулиці, провулки, площі, парки, фонтани, пам’ятники, стіни, брами, порт і кожна споруда. Вигляд залежить від розміру, місцевості, берега, річки, руйнувань і окупації.</p><h3>Для чого</h3><p>Для кампаній і ігор: знати, де таверна, ратуша, гільдії, кузні чи халупи бідноти, і мати зачіпки для пригод.</p><h3>Як користуватися</h3><ol><li>Колесо миші змінює масштаб, перетягування рухає план.</li><li>Наведення показує подробиці споруди, вулиці, площі чи району; клік закріплює їх.</li><li>У вікні подробиць кнопки переходять до району та його визначних місць.</li><li>Зверху: збереження PNG та JSON і перемикачі шарів. Те саме поселення завжди виглядає однаково.</li></ol></dialog>`;
    $('stage').appendChild(root); cv = $('tcv'); det = $('tdet');
    $('tBack').onclick = close; $('tPng').onclick = png; $('tCopy').onclick = copyJson; $('tJson').onclick = saveJson; $('tIn').onclick = () => zoomBy(1.4); $('tOut').onclick = () => zoomBy(1 / 1.4); $('tFit').onclick = () => { fit(); redraw(); }; $('tHelp').onclick = () => $('tHelpD').showModal();
    $('tHelpD').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    for (const [id, k] of [['tDist', 'districts'], ['tNames', 'names'], ['tLab', 'labels']]) $(id).onchange = e => { opt[k] = e.target.checked; redraw(); };
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt((e.clientX - r.left) * devicePixelRatio, (e.clientY - r.top) * devicePixelRatio, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (drag) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 3) drag.moved = true; if (drag.moved) { view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; redraw(); return; } } hover(e); });
    cv.addEventListener('pointerup', e => { const d = drag; drag = null; if (d && !d.moved) { const h = at(e); if (h && (!pinned || pinned.o !== h.o)) { pinned = h; } else pinned = null; opt.sel = pinned && pinned.kind === 'building' ? pinned.o : null; show(pinned || h); redraw(); } });
    cv.addEventListener('pointerleave', () => { if (!drag) { opt.hover = null; opt.hoverDistrict = null; if (!pinned) det.hidden = true; redraw(); } });
    addEventListener('keydown', e => { if (open && e.key === 'Escape' && !$('tHelpD').open) close(); });
    addEventListener('resize', () => { if (open) { size(); redraw(); } });
  }
  const size = () => { const r = root.getBoundingClientRect(); cv.width = Math.round(r.width * devicePixelRatio); cv.height = Math.round(r.height * devicePixelRatio); };
  function fit() { const k = Math.min(cv.width, cv.height - 100 * devicePixelRatio) / (cur.R * 2.9); view = { k, tx: cv.width / 2 - cur.c0[0] * k, ty: cv.height / 2 + 40 * devicePixelRatio - cur.c0[1] * k }; }
  const clampK = k => Math.min(6, Math.max(Math.min(cv.width, cv.height) / (cur.Rmap * 2.2), k));
  function zoomAt(mx, my, f) { const k = clampK(view.k * f), q = k / view.k; view.tx = mx - (mx - view.tx) * q; view.ty = my - (my - view.ty) * q; view.k = k; redraw(); }
  const zoomBy = f => zoomAt(cv.width / 2, cv.height / 2, f);
  function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (open && cur) A.TownDraw.draw(cv, cur, view, opt); }); }
  const at = e => { const r = cv.getBoundingClientRect(), x = ((e.clientX - r.left) * devicePixelRatio - view.tx) / view.k, y = ((e.clientY - r.top) * devicePixelRatio - view.ty) / view.k; return A.Town.hit(cur, x, y); };
  function hover(e) { const h = at(e); opt.hover = h && h.kind === 'building' ? h.o : null; opt.hoverDistrict = h && h.kind === 'district' ? h.o.id : h && h.kind === 'building' && h.o.district >= 0 ? h.o.district : null; if (!pinned) show(h); redraw(); }
  function show(h) {
    const d = A.Town.describe(cur, h); if (!d) { if (!pinned) det.hidden = true; return; }
    const kv = r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`, pin = pinned && h === pinned, col = d.color || '#8aa';
    det.style.setProperty('--dc', col);
    det.innerHTML = `<div class="dh"><i></i><b>${esc(d.title)}</b></div><div class="ds">${esc(d.sub || '')}</div>${d.text ? `<p>${esc(d.text)}</p>` : ''}${d.rows.length ? `<dl>${d.rows.map(kv).join('')}</dl>` : ''}${(d.groups || []).map(g => `<div class="sep"></div><div class="lb">${esc(g.h)}</div><dl>${g.rows.map(kv).join('')}</dl>`).join('')}${d.top ? `<div class="sep"></div><div class="lb">${esc(d.top[0])}</div><div>${esc(d.top[1])}</div>` : ''}${d.streets ? `<div class="sep"></div><div class="lb">Вулиці</div><div>${esc(d.streets)}</div>` : ''}${d.hook ? `<div class="sep"></div><div class="lb">Чутка</div><div>${esc(d.hook)}</div>` : ''}${d.list && d.list.length ? `<div class="sep"></div><div class="lb">Визначні місця</div><div class="chips">${d.list.map(q => `<button data-b="${q.id}" title="Показати споруду на плані">${esc(q.name)}</button>`).join('')}</div>` : ''}${d.districtId != null && h.kind === 'building' ? `<div class="chips"><button data-d="${d.districtId}" title="Показати подробиці району">${esc(d.go)}</button></div>` : ''}${pin ? '<div class="lb pinl">Закріплено · клік по порожньому знімає</div>' : ''}`;
    det.hidden = false; det.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { const dd = cur.districts[+b.dataset.d]; pinned = { kind: 'district', o: dd }; opt.sel = null; show(pinned); redraw(); }; });
    det.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => { const bb = cur.buildings[+b.dataset.b]; pinned = { kind: 'building', o: bb }; opt.sel = bb; view.k = Math.max(view.k, 2.2); view.tx = cv.width / 2 - bb.x * view.k; view.ty = cv.height / 2 - bb.y * view.k; show(pinned); redraw(); }; });
  }
  function cityJson() {
    const r1 = v => Math.round(v * 10) / 10, c = cur;
    return { format: 'atlas2-city', version: 1, seed: W.params.seed, settlement: { id: s.id, name: s.name, rank: s.rank, pop: s.pop, port: !!s.port, fate: s.fate || (s.ruined ? 'ruined' : null) }, radius: Math.round(c.R), walled: c.walled, stats: c.stats,
      districts: c.districts.map(d => ({ id: d.id, kind: d.kind, name: d.name, buildings: d.nb, pop: d.pop, wealth: d.wealth, safety: d.safety })),
      streets: c.streets.map(q => ({ name: q.name, kind: q.kind, district: q.district, len: Math.round(q.len), points: q.pts.map(r1) })),
      squares: c.features.map(f => ({ kind: f.t, name: f.name, x: r1(f.x), y: r1(f.y), r: r1(f.r) })),
      buildings: c.buildings.map(b => ({ type: b.type, name: b.name, district: b.district, addr: b.addr, x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h), angle: Math.round(b.a * 100) / 100, floors: b.floors, pop: b.pop, owner: b.owner, condition: b.cond })) };
  }
  const fname = ext => (s.name || 'city').replace(/[^\p{L}\p{N}]+/g, '_') + '.' + ext;
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  function png() { const c2 = document.createElement('canvas'); c2.width = c2.height = 2400; const k = 2400 / (cur.R * 2.9); A.TownDraw.draw(c2, cur, { k, tx: 1200 - cur.c0[0] * k, ty: 1200 - cur.c0[1] * k }, { districts: opt.districts, names: opt.names, labels: false }); c2.toBlob(b => download(b, fname('png'))); }
  async function copyJson() { const t = JSON.stringify(cityJson()); try { await navigator.clipboard.writeText(t); hint('Опис міста скопійовано в буфер обміну.'); } catch (e) { hint('Не вдалося скопіювати: дозвольте доступ до буфера або завантажте файл.'); } }
  function saveJson() { download(new Blob([JSON.stringify(cityJson())], { type: 'application/json' }), fname('json')); }
  function hint(t) { const h = $('thint'); h.textContent = t; h.style.opacity = 1; setTimeout(() => { h.style.opacity = ''; }, 3500); }
  function openCity(world, st) {
    ensure(); W = world; s = st; open = true; pinned = null; opt.sel = opt.hover = opt.hoverDistrict = null; document.body.classList.add('town-open'); if (A.showSettlementInfo) A.showSettlementInfo(st); root.hidden = false; det.hidden = true;
    $('tTitle').textContent = st.name + ' · ' + ({ capital: 'столиця', regional: 'центр регіону', town: 'місто', village: 'село', hamlet: 'хутір' }[st.rank]); size();
    const load = $('load'), tx = $('loadTxt'); load.hidden = false; tx.textContent = 'Будую місто…'; $('loadBar').style.width = '60%';
    setTimeout(() => { try { cur = A.Town.get(W, s); fit(); A.TownDraw.draw(cv, cur, view, opt); } finally { load.hidden = true; } }, 30);
  }
  function close() { open = false; if (root) root.hidden = true; document.body.classList.remove('town-open'); }
  A.TownView = { open: openCity, close, isOpen: () => open };
})();
