// Planet Forge: літаючий континент як вигляд планети в космосі (тип planet-kinds-sky.js, shape 'slab'): камера, масштаб, порівняння із Землею. Дані: planet-sky.js, малювання: planet-sky-view.js.
(() => {
  'use strict';
  const A = window.PFApp, cv = document.getElementById('cv'), PK = PlanetSky;
  let world = null, key = '', t = 0, cam = { x: 0, y: 0, zoom: 1 }, drag = null;
  const isSlab = () => A.state().kind && PlanetCore.KINDS[A.state().kind].shape === 'slab';
  function build() { const p = PK.fromPlanet(A.state()), k = JSON.stringify(p); if (k !== key) { key = k; world = PK.generate(p); } return world; }
  cv.addEventListener('pointerdown', e => { if (!ctrl.active()) return; drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!ctrl.active() || !drag) return; const S = Math.min(cv.clientWidth / 3.6, cv.clientHeight / 1.9) * cam.zoom; cam.x = drag.cx - (e.clientX - drag.x) / S; cam.y = drag.cy - (e.clientY - drag.y) / (S * .9); A.draw(); });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('wheel', e => { if (!ctrl.active()) return; e.preventDefault(); cam.zoom = Math.min(3, Math.max(.5, cam.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12))); A.draw(); }, { passive: false });
  const ctrl = {
    active: () => isSlab(), tick: dt => { t += dt; },
    draw: (ctx, w, h) => { const st = A.state(); PlanetSkyView.draw(ctx, w, h, build(), t, cam, { space: true, shield: st.atmo, glow: st.glow, lights: st.lights, tiers: st.tiers, compare: PK.widthKm(st.span) }); },
  };
  A.attach(ctrl);
})();
