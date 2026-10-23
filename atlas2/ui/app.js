// Атлас 2.0: інтерфейс. Параметри → генерація → малювання; масштаб/пересування; збереження й обмін зверху; підказка регіону при наведенні.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id);
  const cv = $('map'), ov = $('over'), stage = $('stage'), info = $('info'), IDS = ['seed', 'worldType', 'size', 'provinces', 'regionsPerProvince', 'density', 'rugged', 'riverDensity'];
  let W = null, view = { k: 4, tx: 0, ty: 0 }, shown = { k: 4, tx: 0, ty: 0 }, settle = 0, layers = {}, hover = null, timer = 0, raf = 0;
  document.querySelectorAll('[data-layer]').forEach(e => { layers[e.dataset.layer] = e.checked; });

  const readParams = () => { const p = {}; for (const id of IDS) { const e = $(id); p[id] = e.type === 'number' || e.type === 'range' ? +e.value : e.value; } return p; };
  const writeParams = p => { for (const id of IDS) if (p[id] != null) $(id).value = p[id]; };
  function fit() { const r = stage.getBoundingClientRect(); cv.width = Math.round(r.width * devicePixelRatio); cv.height = Math.round(r.height * devicePixelRatio); ov.width = cv.width; ov.height = cv.height; }
  function resetView() { const k = Math.min(cv.width / W.w, cv.height / W.h) * 0.96; view = { k, tx: (cv.width - W.w * k) / 2, ty: (cv.height - W.h * k) / 2 }; }
  // повне перемальовування; під час руху лише дешево зсуваємо/масштабуємо вже намальований кадр (CSS), а справжній кадр малюємо, коли рух стих
  function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!W) return; A.draw.draw(cv, W, view, { layers }); shown = { ...view }; cv.style.transform = ''; A.draw.drawHover(ov, W, view, hover); hoverKey = ''; if (last) hoverAt(last); }); }
  function moving() {
    const s = view.k / shown.k, q = 1 / devicePixelRatio; cv.style.transform = `translate(${(view.tx - shown.tx * s) * q}px, ${(view.ty - shown.ty * s) * q}px) scale(${s})`;
    A.draw.drawHover(ov, W, view, null); clearTimeout(settle); settle = setTimeout(redraw, 140);
  }
  function build() {
    const p = readParams(); W = A.generate(p); writeParams(W.params); fit(); resetView(); redraw();
    const s = W.settlements ? W.settlements.length : 0, land = W.land.reduce((a, v) => a + v, 0);
    $('stats').textContent = `Суша ${(land * W.params.kmPerCell ** 2).toLocaleString('uk')} км²; провінцій ${W.provinces.length}, регіонів ${W.regions.length}, річок ${W.rivers.length}, озер ${W.lakes.length}${s ? ', поселень ' + s : ''}.`;
    try { history.replaceState(null, '', '#p=' + btoa(unescape(encodeURIComponent(JSON.stringify(A.Save.paramsToJSON(W.params)))))); } catch (e) { /* не критично */ }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(build, 250); };
  IDS.forEach(id => $(id).addEventListener(id === 'seed' ? 'change' : 'input', later));
  $('btnRandom').onclick = () => { $('seed').value = A.Rng.randSeed(); build(); };
  document.querySelectorAll('[data-layer]').forEach(e => e.addEventListener('change', () => { layers[e.dataset.layer] = e.checked; redraw(); }));

  // масштаб і пересування
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, f = Math.exp(-e.deltaY * 0.0015), k = Math.min(60, Math.max(1, view.k * f)), q = k / view.k; view.tx = mx - (mx - view.tx) * q; view.ty = my - (my - view.ty) * q; view.k = k; moving(); }, { passive: false });
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', () => { drag = null; });
  let last = null;
  cv.addEventListener('pointermove', e => {
    last = e;
    if (drag) { view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; moving(); return; }
    hoverAt(e);
  });
  // наведення: найближче поселення (до 10 px) або регіон під курсором; підсвітка регіону й картка
  function hoverAt(e) {
    if (!W || !e) return; const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, fx = (mx - view.tx) / view.k, fy = (my - view.ty) / view.k, x = Math.floor(fx), y = Math.floor(fy);
    const reg = x >= 0 && y >= 0 && x < W.w && y < W.h ? W.region[y * W.w + x] : -1;
    let near = null, bd = (10 * devicePixelRatio / view.k) ** 2; for (const s of W.settlements || []) { const d = (s.x + 0.5 - fx) ** 2 + (s.y + 0.5 - fy) ** 2; if (d < bd) { bd = d; near = s; } }
    const id = near ? near.region : reg >= 0 ? reg : null, key = id + '|' + (near ? near.id : '');
    if (key !== hoverKey) { hoverKey = key; hover = id; A.draw.drawHover(ov, W, view, hover); showInfo(id, near); }
  }
  let hoverKey = '';
  function showInfo(id, s) {
    if (id == null) { info.hidden = true; return; }
    const g = W.regions[id], p = W.provinces[g.prov], km = (g.area || 0) * W.params.kmPerCell ** 2;
    const RN = { capital: 'Столиця провінції', regional: 'Центр регіону', town: 'Місто', village: 'Село', hamlet: 'Хутір' };
    const city = s ? `<h4>${s.name}</h4><dl><dt>Тип</dt><dd>${RN[s.rank]}${s.port ? ', порт' : ''}</dd><dt>Населення</dt><dd>${s.pop.toLocaleString('uk')}</dd><dt>Біля річки</dt><dd>${s.river ? 'так' : 'ні'}</dd></dl><hr>` : '';
    info.innerHTML = city + `<h4>${p.name || 'Провінція ' + (p.id + 1)}<br>${g.name || 'Регіон ' + (g.id + 1)}</h4><dl><dt>Головне місто</dt><dd>${g.centerName || '—'}</dd><dt>Населення</dt><dd>${g.pop ? g.pop.toLocaleString('uk') : '—'}</dd><dt>Місцевість</dt><dd>${g.terrain || '—'}</dd><dt>Площа</dt><dd>${km.toLocaleString('uk')} км²</dd></dl>`;
    info.hidden = false;
  }

  $('btnHelp').onclick = () => $('help').showModal();
  $('help').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
  addEventListener('resize', () => { if (W) { fit(); resetView(); redraw(); } });

  const m = /#p=(.+)$/.exec(location.hash);
  $('seed').value = A.Rng.randSeed();
  if (m) { try { writeParams(A.Save.paramsFromJSON(JSON.parse(decodeURIComponent(escape(atob(m[1])))))); } catch (e) { /* ігноруємо зіпсоване посилання */ } }
  build();
})();
