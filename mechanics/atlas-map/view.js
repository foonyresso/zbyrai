/* Механіка «atlas-map»: камера карти Атласу на canvas: масштаб колесом, пересування, плавний наліт, малювання через A.draw.
   Той самий прийом, що в Атласі: під час руху кадр лише зсувається CSS-ом, справжнє перемальовування після паузи. Без стану гри. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const KMIN = 0.5, KMAX = 700;
  // opt: { stage, cv (карта), ov (верхній шар), layers, getW(), onOver(), onClick(fx,fy,ev), onMove(fx,fy,ev) }
  function create(opt) {
    const A = root.Atlas2, cv = opt.cv, ov = opt.ov; let lim = null, view = { k: 4, tx: 0, ty: 0 }, shown = { k: 4, tx: 0, ty: 0 }, raf = 0, settle = 0, drag = null, anim = 0;
    const dpr = () => root.devicePixelRatio || 1;
    function fit() { const r = opt.stage.getBoundingClientRect(); cv.width = ov.width = Math.max(2, Math.round(r.width * dpr())); cv.height = ov.height = Math.max(2, Math.round(r.height * dpr())); }
    function reset() { const W = opt.getW(); if (!W) return; const k = Math.min(cv.width / W.w, cv.height / W.h) * 0.96; view.k = k; view.tx = (cv.width - W.w * k) / 2; view.ty = (cv.height - W.h * k) / 2; }
    function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const W = opt.getW(); if (!W) return; A.draw.draw(cv, W, view, { layers: opt.layers }); shown = Object.assign({}, view); cv.style.transform = ''; if (opt.onOver) opt.onOver(); }); }
    // межі сцени: lim = { kmin, kmax, cx, cy, rad } (центр і радіус у клітинах карти) або null
    function clampView() {
      if (!lim) { view.k = Math.min(KMAX, Math.max(KMIN, view.k)); return; } view.k = Math.min(lim.kmax, Math.max(lim.kmin, view.k));
      if (lim.rad != null) { let cx = (cv.width / 2 - view.tx) / view.k, cy = (cv.height / 2 - view.ty) / view.k; const d = Math.hypot(cx - lim.cx, cy - lim.cy); if (d > lim.rad) { cx = lim.cx + (cx - lim.cx) * lim.rad / d; cy = lim.cy + (cy - lim.cy) * lim.rad / d; view.tx = cv.width / 2 - cx * view.k; view.ty = cv.height / 2 - cy * view.k; } }
    }
    function moving() {
      clampView();
      const s = view.k / shown.k, q = 1 / dpr(); cv.style.transform = `translate(${(view.tx - shown.tx * s) * q}px, ${(view.ty - shown.ty * s) * q}px) scale(${s})`;
      clearTimeout(settle); settle = setTimeout(redraw, 140); if (opt.onOver) opt.onOver();
    }
    const fromEv = e => { const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * dpr(), my = (e.clientY - r.top) * dpr(); return [(mx - view.tx) / view.k, (my - view.ty) / view.k, mx, my]; };
    function zoomAt(mx, my, f) { const k = Math.min(lim ? lim.kmax : KMAX, Math.max(lim ? lim.kmin : KMIN, view.k * f)), s = k / view.k; view.tx = mx - (mx - view.tx) * s; view.ty = my - (my - view.ty) * s; view.k = k; moving(); }
    cv.addEventListener('wheel', e => { e.preventDefault(); const [, , mx, my] = fromEv(e); zoomAt(mx, my, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    cv.addEventListener('pointerdown', e => { if (e.button === 2) return; drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true; if (drag.moved) { view.tx = drag.tx + dx * dpr(); view.ty = drag.ty + dy * dpr(); cv.style.cursor = 'grabbing'; moving(); return; } }
      if (opt.onMove) { const [fx, fy] = fromEv(e); opt.onMove(fx, fy, e); }
    });
    cv.addEventListener('pointerup', e => { const d = drag; drag = null; cv.style.cursor = ''; if (d && !d.moved && opt.onClick) { const [fx, fy] = fromEv(e); opt.onClick(fx, fy, e); } });
    // плавний наліт камери: центр (x,y) у клітинах, масштаб k
    function focus(x, y, k, ms) {
      cancelAnimationFrame(anim); const a = { k: view.k, cx: (cv.width / 2 - view.tx) / view.k, cy: (cv.height / 2 - view.ty) / view.k }, t0 = performance.now(), dur = ms == null ? 900 : ms;
      const step = now => { const t = Math.min(1, (now - t0) / dur), e = t * t * (3 - 2 * t), lk = Math.exp(Math.log(a.k) + (Math.log(k) - Math.log(a.k)) * e), cx = a.cx + (x - a.cx) * e, cy = a.cy + (y - a.cy) * e; view.k = lk; view.tx = cv.width / 2 - cx * lk; view.ty = cv.height / 2 - cy * lk; moving(); if (t < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    }
    // миттєвий перехід (зміна сцени): центр (x,y) у клітинах, масштаб k
    function jump(x, y, k) { cancelAnimationFrame(anim); view.k = k; view.tx = cv.width / 2 - x * k; view.ty = cv.height / 2 - y * k; clampView(); redraw(); }
    root.addEventListener('resize', () => { fit(); redraw(); });
    return { get view() { return view; }, setLimits: l => { lim = l; clampView(); }, jump, get limits() { return lim; }, fit, reset, redraw, focus, zoomAt, toScreen: (x, y) => [view.tx + x * view.k, view.ty + y * view.k], KMIN, KMAX };
  }
  Mech.AtlasView = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.AtlasView;
})(globalThis);
