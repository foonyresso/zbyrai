// Карта королівств: точка входу інтерфейсу. Ядро генерації (core/) нічого не знає про DOM; тут лише зв’язок: параметри → світ → сцена.
(function () {
  'use strict';
  const R = globalThis.RealmMap, U = R.UI, App = U.App, $ = U.$;

  App.params = App.paramsFromHash() || R.Params.normalize(U.store.get('params', {}));
  App.world = null; App.pick = null;
  const cv = $('cv'); App.scene = new R.Scene(cv);
  Object.assign(App.scene.layers, U.store.get('layers', {}));

  /* ---------- генерація ---------- */
  let timer = 0;
  App.regenLater = function () { clearTimeout(timer); timer = setTimeout(App.regenNow, 350); };
  App.regenNow = function () {
    clearTimeout(timer); $('busy').hidden = false;
    setTimeout(() => {
      try {
        Object.assign(App.params, R.Params.normalize(App.params)); const t0 = performance.now();
        App.world = R.generate(App.params); App.scene.setWorld(App.world);
        App.buildTravelPanel(); App.buildGuidePanel(); App.syncWorld && App.syncWorld(); App.showCard(null);
        U.store.set('params', App.params); App.updateHash();
        $('hud').textContent = App.world.provinces.length + ' пров. · ' + App.world.regions.length + ' рег. · ' + App.world.settlements.length + ' поселень · ' + Math.round(performance.now() - t0) + ' мс';
      } catch (e) { console.error(e); U.toast('Помилка генерації: ' + e.message, 4000); }
      $('busy').hidden = true;
    }, 20);
  };
  App.focusObject = function (hit) {
    App.scene.sel = hit; App.scene.focusCell(hit.o.cell, Math.max(App.scene.view.k, 16)); App.showCard(hit); App.scene.dirty = true;
  };

  /* ---------- вкладки ---------- */
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.pn').forEach(p => p.classList.toggle('on', p.dataset.pn === b.dataset.tab));
  }));

  /* ---------- камера: перетягування, колесо, пальці ---------- */
  const ptrs = new Map(); let drag = null, moved = 0, pinch = 0;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.offsetX, e.offsetY]); drag = [e.offsetX, e.offsetY]; moved = 0; cv.classList.add('drag'); if (ptrs.size === 2) pinch = 0; });
  cv.addEventListener('pointermove', e => {
    const old = ptrs.get(e.pointerId);
    if (old) {
      ptrs.set(e.pointerId, [e.offsetX, e.offsetY]);
      if (ptrs.size === 2) { const [a, b] = Array.from(ptrs.values()), d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) App.scene.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinch); pinch = d; moved = 99; }
      else if (drag) { const dx = e.offsetX - drag[0], dy = e.offsetY - drag[1]; moved += Math.abs(dx) + Math.abs(dy); App.scene.pan(dx, dy); drag = [e.offsetX, e.offsetY]; }
    } else hover(e);
  });
  const up = e => { ptrs.delete(e.pointerId); cv.classList.remove('drag'); if (!ptrs.size) { if (moved < 5 && drag) click(e); drag = null; } pinch = 0; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); drag = null; cv.classList.remove('drag'); });
  cv.addEventListener('wheel', e => { e.preventDefault(); App.scene.zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  cv.addEventListener('pointerleave', () => { $('tip').hidden = true; });
  $('btnFit').addEventListener('click', () => App.scene.fit());
  $('btnZoomIn').addEventListener('click', () => App.scene.zoomAt(App.scene.W / 2, App.scene.H / 2, 1.5));
  $('btnZoomOut').addEventListener('click', () => App.scene.zoomAt(App.scene.W / 2, App.scene.H / 2, 1 / 1.5));
  cv.addEventListener('dblclick', e => App.scene.zoomAt(e.offsetX, e.offsetY, 2));

  function describeCell(c) {
    const w = App.world; if (c < 0) return '';
    const b = R.Data.biomes[w.bio[c]].name; if (w.water[c] !== 0) return b;
    return w.provinces[w.province[c]].name + ' · ' + w.regions[w.region[c]].name + ' · ' + b + (w.roadLevel[c] ? ' · ' + Object.values(R.Data.roadClasses).find(r => r.level === w.roadLevel[c]).name.toLowerCase() : '');
  }
  function hover(e) {
    if (!App.world) return; const h = App.scene.hitAt(e.offsetX, e.offsetY), tip = $('tip');
    if (h) {
      const o = h.o; let t = '';
      if (h.t === 's') t = o.name + ' · ' + R.Data.ranks[o.rank].name.toLowerCase() + (o.state !== 'normal' ? ' · ' + R.Data.states[o.state].name.toLowerCase() : '');
      else if (h.t === 'p') t = o.name + ' · ' + R.Data.poi[o.type].name.toLowerCase(); else t = o.name + ' · ' + R.Data.tierNames[o.tier];
      tip.textContent = t; tip.style.left = Math.min(e.offsetX + 14, App.scene.W - 270) + 'px'; tip.style.top = (e.offsetY + 14) + 'px'; tip.hidden = false; cv.style.cursor = 'pointer';
    } else { tip.hidden = true; cv.style.cursor = ''; }
    const c = App.scene.screenToCell(e.offsetX, e.offsetY); $('hud').textContent = describeCell(c);
  }
  function click(e) {
    if (!App.world) return; const sc = App.scene, c = sc.screenToCell(e.offsetX, e.offsetY);
    if (App.pick && c >= 0 && App.world.water[c] === 0) { const key = App.pick; App.setPin(key, c); U.toast('Точка ' + key + ' поставлена'); return; }
    const h = sc.hitAt(e.offsetX, e.offsetY);
    if (h) { const sel = { t: h.t, o: h.o }; sc.sel = sel; App.showCard(sel); }
    else if (c >= 0 && App.world.region[c] >= 0) { const sel = { t: 'r', o: App.world.regions[App.world.region[c]] }; sc.sel = null; App.showCard(sel); }
    else { sc.sel = null; App.showCard(null); }
    sc.dirty = true;
  }

  /* ---------- цикл малювання ---------- */
  function resize() { App.scene.resize(); if (App.scene.world && !App.fitted) { App.scene.fit(); App.fitted = true; } }
  new ResizeObserver(() => { const hadW = App.scene.W; App.scene.resize(); if (!hadW && App.scene.world) App.scene.fit(); }).observe(cv);
  let last = 0;
  (function loop(t) {
    const sc = App.scene;
    if (sc.world && sc.W) {
      const pulse = sc.layers.lairs && sc.world.lairs.some(l => l.tier === 3) && t - last > 120;
      if (sc.dirty || pulse) { sc.draw(); last = t; }
    }
    requestAnimationFrame(loop);
  })(0);

  /* ---------- запуск ---------- */
  App.buildWorldPanel(); App.buildLayersPanel(); App.bindIO(); resize(); App.regenNow();
})();
