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
  function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!W) return; A.draw.draw(cv, W, view, { layers }); shown = { ...view }; cv.style.transform = ''; A.draw.drawHover(ov, W, view, hover); }); }
  function moving() {
    const s = view.k / shown.k, q = 1 / devicePixelRatio; cv.style.transform = `translate(${(view.tx - shown.tx * s) * q}px, ${(view.ty - shown.ty * s) * q}px) scale(${s})`;
    ov.getContext('2d').clearRect(0, 0, ov.width, ov.height); clearTimeout(settle); settle = setTimeout(redraw, 140);
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
  cv.addEventListener('pointermove', e => {
    if (drag) { view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; moving(); return; }
    const r = cv.getBoundingClientRect(), x = Math.floor(((e.clientX - r.left) * devicePixelRatio - view.tx) / view.k), y = Math.floor(((e.clientY - r.top) * devicePixelRatio - view.ty) / view.k);
    const reg = W && x >= 0 && y >= 0 && x < W.w && y < W.h ? W.region[y * W.w + x] : -1;
    const nv = reg >= 0 ? reg : null; if (nv !== hover) { hover = nv; A.draw.drawHover(ov, W, view, hover); showInfo(nv); }
  });
  cv.addEventListener('pointerleave', () => { hover = null; showInfo(null); A.draw.drawHover(ov, W, view, null); });
  function showInfo(id) {
    if (id == null) { info.hidden = true; return; }
    const g = W.regions[id], p = W.provinces[g.prov], km = (g.area || 0) * W.params.kmPerCell ** 2;
    info.innerHTML = `<h4>${p.name || 'Провінція ' + (p.id + 1)}<br>${g.name || 'Регіон ' + (g.id + 1)}</h4><dl><dt>Головне місто</dt><dd>${g.centerName || '—'}</dd><dt>Населення</dt><dd>${g.pop ? g.pop.toLocaleString('uk') : '—'}</dd><dt>Місцевість</dt><dd>${g.terrain || '—'}</dd><dt>Площа</dt><dd>${km.toLocaleString('uk')} км²</dd></dl>`;
    info.hidden = false;
  }

  // збереження й обмін
  const file = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const pj = () => JSON.stringify(A.Save.paramsToJSON(W.params), null, 2);
  $('btnCopy').onclick = () => navigator.clipboard.writeText(pj());
  $('btnLink').onclick = () => navigator.clipboard.writeText(location.href);
  $('btnJson').onclick = () => file('atlas2.json', pj(), 'application/json');
  $('btnWorld').onclick = () => file('atlas2-world.json', JSON.stringify(A.Save.exportWorld(W)), 'application/json');
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { writeParams(A.Save.paramsFromJSON(JSON.parse(await f.text()))); build(); } catch (err) { alert(err.message); } e.target.value = ''; };
  $('btnPng').onclick = () => { const o = document.createElement('canvas'); o.width = W.w * 8; o.height = W.h * 8; A.draw.draw(o, W, { k: 8, tx: 0, ty: 0 }, { layers }); o.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'atlas2.png'; a.click(); }); };
  $('btnPrint').onclick = () => print();
  addEventListener('resize', () => { if (W) { fit(); resetView(); redraw(); } });

  const m = /#p=(.+)$/.exec(location.hash);
  $('seed').value = A.Rng.randSeed();
  if (m) { try { writeParams(A.Save.paramsFromJSON(JSON.parse(decodeURIComponent(escape(atob(m[1])))))); } catch (e) { /* ігноруємо зіпсоване посилання */ } }
  build();
})();
