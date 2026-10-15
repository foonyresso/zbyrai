// Planet Forge: інтерфейс літаючого континенту (панель, перетягування, масштаб, збереження). Дані: planet-sky.js, малювання: planet-sky-view.js.
(() => {
  'use strict';
  const $ = id => document.getElementById(id), PK = PlanetSky;
  const A = window.PFApp, cv = $('cv'), store = { get(k, d) { try { const v = localStorage.getItem('pf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} } };
  const saved = store.get('sky1', null);
  let params = PK.clampSky(saved && saved.params || PK.defaults(A.state().seed)), on = !!(saved && saved.on), world = PK.generate(params), t = 0, cam = { x: 0, y: 0, zoom: 1 }, drag = null;
  const persist = () => store.set('sky1', { params, on });
  const FMT = A.FMT, btn = $('btnFlyToggle');
  function render() {
    document.body.classList.toggle('view-sky', on); btn.textContent = on ? 'Показати планету' : 'Показати літаючий континент';
    for (const o of PK.KNOBS) { const r = $('f_' + o.k); if (r) { r.value = params[o.k]; $('fo_' + o.k).textContent = o.k === 'pal' ? PK.PALETTES[params.pal] : (FMT[o.f] || FMT.num)(params[o.k]); } }
    $('fSeed').value = params.seed;
  }
  function rebuild() { world = PK.generate(params); persist(); render(); A.draw(); }
  const box = $('flyCtl');
  for (const o of PK.KNOBS) {
    const out = A.el('output', { id: 'fo_' + o.k }), inp = A.el('input', { type: 'range', id: 'f_' + o.k, min: o.min, max: o.max, step: o.f === 'int' ? 1 : .01 });
    inp.addEventListener('input', e => { params[o.k] = +e.target.value; params = PK.clampSky(params); rebuild(); });
    box.append(A.el('div', { class: 'ctl', title: o.tip }, A.el('span', {}, o.l), out, A.el('span'), inp));
  }
  $('fSeed').onchange = e => { params.seed = e.target.value.trim() || params.seed; rebuild(); };
  $('btnFlyNew').onclick = () => { params = PK.randomSky(); rebuild(); };
  btn.onclick = () => (on ? leave() : enter());
  function enter() { A.deactivateOthers(ctrl); on = true; persist(); render(); A.draw(); }
  function leave() { on = false; persist(); render(); A.refresh(); }
  cv.addEventListener('pointerdown', e => { if (!on) return; drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!on || !drag) return; const S = Math.min(cv.clientWidth / 3.6, cv.clientHeight / 1.9) * cam.zoom; cam.x = drag.cx - (e.clientX - drag.x) / S; cam.y = drag.cy - (e.clientY - drag.y) / (S * .9); A.draw(); });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('wheel', e => { if (!on) return; e.preventDefault(); cam.zoom = Math.min(3, Math.max(.5, cam.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12))); A.draw(); }, { passive: false });
  const ctrl = {
    active: () => on, tick: dt => { t += dt; }, deactivate() { if (on) { on = false; persist(); render(); } },
    draw: (ctx, w, h) => PlanetSkyView.draw(ctx, w, h, world, t, cam),
    reroll: () => { params = PK.randomSky(); rebuild(); },
    payload: () => ({ tool: 'planet-forge', sky: params }),
    load: d => { if (!d.sky) return false; params = PK.clampSky(d.sky); on = true; A.deactivateOthers(ctrl); world = PK.generate(params); persist(); render(); A.draw(); return true; },
  };
  A.attach(ctrl); render();
})();
