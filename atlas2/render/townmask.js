// Атлас 2.0, місто: растрова маска води навколо поселення, намальована тими самими контурами, що й карта (берег, озера, річки), щоб місто збігалося з картою до метра.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const PAL = [[0, 255, 0], [91, 148, 207], [0, 0, 255]]; // суша, річка, море чи озеро
  function make(W, s, E) {
    const c = A.draw.prep(W), CS = W.params.kmPerCell * 1000, PX = Math.max(3, E * 2 / 700), n = Math.ceil(E * 2 / PX), cv = document.createElement('canvas'); cv.width = cv.height = n;
    const g = cv.getContext('2d', { willReadFrequently: true }), cx = s.x + 0.5, cy = s.y + 0.5, sc = CS / PX, path = loops => { g.beginPath(); for (const p of loops) { g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); } };
    g.fillStyle = '#0000ff'; g.fillRect(0, 0, n, n); g.setTransform(sc, 0, 0, sc, (E - cx * CS) / PX, (E - cy * CS) / PX);
    path(c.land); g.fillStyle = '#00ff00'; g.fill(); g.save(); path(c.land); g.clip(); A.draw.drawRivers(g, W, c, 0); g.restore();
    path(c.lakes); g.fillStyle = '#0000ff'; g.fill('evenodd');
    const d = g.getImageData(0, 0, n, n).data, cls = new Uint8Array(n * n);
    for (let i = 0; i < n * n; i++) { const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2]; let bi = 0, bd = 1e9; for (let k = 0; k < 3; k++) { const q = (r - PAL[k][0]) ** 2 + (gg - PAL[k][1]) ** 2 + (b - PAL[k][2]) ** 2; if (q < bd) { bd = q; bi = k; } } cls[i] = bi === 0 ? 0 : bi === 1 ? 1 : 2; }
    return { n, E, PX, cls };
  }
  A.TownMask = { make };
})();
