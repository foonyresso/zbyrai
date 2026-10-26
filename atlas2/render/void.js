// Атлас 2.0: космос за краєм материка (вимір «Астракор»): зорі на екрані, корені, що звисають у безодню, шар плям біомів основного світу.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const hash = (a, b) => (Math.imul(a * 374761393 ^ b * 668265263, 2246822519) >>> 0) / 4294967296;
  let tile = null;
  // плитка зір 512×512: зорі лишаються однакового розміру при будь-якому масштабі карти
  function stars() {
    if (tile) return tile;
    const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
    for (let n = 0; n < 420; n++) {
      const x = Math.floor(hash(n, 1) * S), y = Math.floor(hash(n, 2) * S), b = hash(n, 3), big = b > 0.93;
      g.fillStyle = `rgba(${200 + Math.floor(55 * hash(n, 4))},${220 + Math.floor(35 * hash(n, 5))},255,${0.25 + 0.7 * b})`; g.fillRect(x, y, big ? 2 : 1, big ? 2 : 1);
      if (big) { g.fillStyle = 'rgba(180,230,255,.18)'; g.fillRect(x - 1, y, 4, 1); g.fillRect(x, y - 1, 1, 4); }
    }
    return tile = cv;
  }
  // тло: чорний космос із зорями; зсув зір лише ледь слідує за картою (глибина)
  function backdrop(ctx, cv, view) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, cv.width, cv.height);
    const pat = ctx.createPattern(stars(), 'repeat'), dpr = devicePixelRatio || 1; ctx.save(); ctx.translate(view.tx * 0.15, view.ty * 0.15); ctx.scale(dpr, dpr); ctx.fillStyle = pat;
    ctx.fillRect(-view.tx * 0.15 / dpr, -view.ty * 0.15 / dpr, cv.width / dpr, cv.height / dpr); ctx.restore();
  }
  // корені, що звисають з обриву в безодню: від вершин контуру суші назовні, у клітинах карти; повертає Path2D-и за товщиною й кінчики
  function roots(W, loops) {
    const { w, h } = W, out = { thick: new Path2D(), mid: new Path2D(), thin: new Path2D(), tips: [] }, vo = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx < 0 || cy < 0 || cx >= w || cy >= h || !!W.ocean[cy * w + cx]; };
    for (const p of loops) {
      const n = p.length / 2; if (n < 8) continue; let acc = 0;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n; acc += Math.hypot(p[j * 2] - p[i * 2], p[j * 2 + 1] - p[i * 2 + 1]); if (acc < 5) continue;
        const hs = hash(Math.round(p[i * 2] * 7), Math.round(p[i * 2 + 1] * 7)); acc = 0; if (hs > 0.7) continue;
        const a = (i + n - 2) % n, b = (i + 2) % n, tx = p[b * 2] - p[a * 2], ty = p[b * 2 + 1] - p[a * 2 + 1], tl = Math.hypot(tx, ty) || 1;
        let nx = -ty / tl, ny = tx / tl; if (!vo(p[i * 2] + nx * 1.5, p[i * 2 + 1] + ny * 1.5)) { nx = -nx; ny = -ny; if (!vo(p[i * 2] + nx * 1.5, p[i * 2 + 1] + ny * 1.5)) continue; }
        const len = 5 + 17 * hs / 0.7 * hash(i, 9), wob = (hash(i, 11) - 0.5) * 1.4, ph = hash(i, 13) * 6.28, pth = hs < 0.15 ? out.thick : hs < 0.4 ? out.mid : out.thin;
        let x = p[i * 2], y = p[i * 2 + 1]; pth.moveTo(x, y);
        for (let s = 1; s <= 6; s++) { const t = s / 6, ang = Math.atan2(ny, nx) + wob * Math.sin(ph + t * 3.2); x += Math.cos(ang) * len / 6; y += Math.sin(ang) * len / 6; pth.lineTo(x, y); }
        if (hs < 0.3) out.tips.push(x, y);
      }
    }
    return out;
  }
  function drawRoots(ctx, R, px) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(47,224,198,.22)'; ctx.lineWidth = 3.2 * px; ctx.stroke(R.thick);
    ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = Math.max(2.4 * px, 1.1); ctx.stroke(R.thick);
    ctx.lineWidth = Math.max(1.8 * px, 0.7); ctx.stroke(R.mid); ctx.strokeStyle = '#3a2818'; ctx.lineWidth = Math.max(1.2 * px, 0.4); ctx.stroke(R.thin);
    ctx.fillStyle = 'rgba(47,224,198,.85)'; for (let i = 0; i < R.tips.length; i += 2) { ctx.beginPath(); ctx.arc(R.tips[i], R.tips[i + 1], Math.max(0.28, 1.4 * px), 0, 6.2832); ctx.fill(); }
  }
  // шар плям біомів основного світу: по пікселю на клітину, масштабується згладжено
  function subLayer(W, toCanvas) {
    if (!W.sub || !W.subUsed || !W.subUsed.length) return null;
    const d = new ImageData(W.w, W.h), cols = {}, L = A.BiomeData.list;
    for (const n of W.subUsed) { const c = L[n][2]; cols[n + 1] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
    for (let i = 0; i < W.sub.length; i++) { const k = W.sub[i]; if (!k) continue; const c = cols[k]; d.data[i * 4] = c[0]; d.data[i * 4 + 1] = c[1]; d.data[i * 4 + 2] = c[2]; d.data[i * 4 + 3] = Math.round(W.subW[i] * 0.6); }
    return toCanvas(d);
  }
  A.Void = { backdrop, roots, drawRoots, subLayer };
})();
