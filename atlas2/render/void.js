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
  // великі корені зверху карти: товсті смуги вздовж W.rootLines ([x, y, піввширина] у клітинах), перекривають землю, дороги й річки; ідуть за край і звисають у безодню
  function drawBigRoots(ctx, W, px) {
    if (!W.rootLines) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pass = (col, f, extra) => { ctx.strokeStyle = col; for (const L of W.rootLines) for (let k = 1; k < L.length; k++) { const a = L[k - 1], b = L[k]; ctx.lineWidth = Math.max((a[2] + b[2]) * f + (extra || 0) * px, 0.4); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } };
    pass('rgba(47,224,198,.16)', 1.0 * 1.25, 3); pass('#1f140b', 1.0 * 1.06); pass('#3b2916', 1.0 * 0.92); pass('#5a3f27', 0.5); pass('rgba(150,110,60,.45)', 0.16);
    ctx.restore();
  }
  // входи в тунелі: великі дороги йдуть крізь корінь під землею, на карті видно лише портали
  function drawTunnels(ctx, W, px) {
    if (!W.tunnels || !W.tunnels.length) return; const r = Math.max(0.8, 4.5 * px); ctx.save();
    for (const t of W.tunnels) { const x = t.x + 0.5 + Math.cos(t.a) * 0.35, y = t.y + 0.5 + Math.sin(t.a) * 0.35; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = '#0c0805'; ctx.fill(); ctx.strokeStyle = t.level === 1 ? '#e6c36a' : '#b9b3a6'; ctx.lineWidth = Math.max(0.25, 1.4 * px); ctx.stroke(); }
    ctx.restore();
  }
  // дерево в центрі зверху: тінь, крона з часток (з зерна), світні плоди, кільця стовбура; при сильному наближенні крона стає прозорою, щоб було видно землю
  function drawTree(ctx, W, px, k) {
    const t = W.tree; if (!t) return; const R = t.R, a = k < 6 ? 1 : Math.max(0.28, 1 - (k - 6) / 22), lerp = (p, q, u) => Math.round(p + (q - p) * u);
    ctx.save(); ctx.translate(t.x + 0.5, t.y + 0.5); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.12, 0, 6.2832); ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fill();
    const lobe = (o, sc, light) => { const x = Math.cos(o.a) * o.d * sc, y = Math.sin(o.a) * o.d * sc, rr = o.r * (light ? 0.78 : 1), g = ctx.createRadialGradient(x - rr * 0.25, y - rr * 0.3, rr * 0.1, x, y, rr);
      const c0 = light ? [lerp(54, 90, o.t), lerp(170, 205, o.t), lerp(90, 120, o.t)] : [lerp(18, 30, o.t), lerp(110, 140, o.t), lerp(60, 80, o.t)], c1 = light ? [20, 120, 66] : [8, 70, 40];
      g.addColorStop(0, `rgb(${c0})`); g.addColorStop(1, `rgb(${c1})`); ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(4,40,22,.55)'; ctx.lineWidth = Math.max(0.2, 1 * px); ctx.stroke(); };
    ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, 6.2832); ctx.fillStyle = '#0b4a2a'; ctx.fill();
    for (const o of t.lobes) lobe(o, 1, false); for (const o of t.lobes) lobe(o, 0.62, true);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, 6.2832); ctx.fillStyle = '#2a1d12'; ctx.fill();
    for (let j = 0; j < t.rings; j++) { ctx.beginPath(); ctx.arc(0, 0, R * (0.04 + 0.034 * j), 0, 6.2832); ctx.strokeStyle = j % 2 ? '#6b4a2b' : '#c89a5a'; ctx.lineWidth = Math.max(0.15, 0.9 * px); ctx.stroke(); }
    for (const f of t.fruits) { ctx.beginPath(); ctx.arc(f[0], f[1], Math.max(0.3, 1.6 * px), 0, 6.2832); ctx.fillStyle = f[2] < 0.5 ? 'rgba(47,224,198,.9)' : 'rgba(214,180,90,.95)'; ctx.fill(); }
    ctx.restore();
  }
  // Велика стіна по контуру 70 % радіуса й гігантські фортеці в її ланках
  function drawWall(ctx, W, px, k) {
    if (!W.wall) return; const p = W.wall.pts; ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    const path = () => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); };
    path(); ctx.strokeStyle = '#17151a'; ctx.lineWidth = Math.max(1.8, 5.2 * px); ctx.stroke();
    path(); ctx.strokeStyle = '#a79f90'; ctx.lineWidth = Math.max(1.1, 3.2 * px); ctx.stroke();
    if (k >= 2.5) { path(); ctx.setLineDash([2.4 * px, 2.4 * px]); ctx.strokeStyle = '#5b564d'; ctx.lineWidth = Math.max(1.1, 3.2 * px); ctx.stroke(); ctx.setLineDash([]); }
    const s = Math.max(2.4, 10 * px);
    for (const f of W.fortresses || []) {
      const x = f.x + 0.5, y = f.y + 0.5, sg = f.sid != null && A.TownMap ? A.TownMap.fade(W.settlements[f.sid], k) : 1; if (sg < 0.02) continue; ctx.globalAlpha = sg; ctx.beginPath(); ctx.arc(x, y, s * 0.95, 0, 6.2832); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();
      ctx.fillStyle = '#9c9588'; ctx.strokeStyle = '#1d1a17'; ctx.lineWidth = Math.max(0.3, 1.3 * px); ctx.fillRect(x - s / 2, y - s / 2, s, s); ctx.strokeRect(x - s / 2, y - s / 2, s, s);
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { ctx.beginPath(); ctx.arc(x + dx * s / 2, y + dy * s / 2, s * 0.26, 0, 6.2832); ctx.fillStyle = '#7d776b'; ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = '#3a3630'; ctx.fillRect(x - s * 0.2, y - s * 0.2, s * 0.4, s * 0.4); ctx.fillStyle = '#c0302f'; ctx.fillRect(x - s * 0.07, y - s * 0.07, s * 0.14, s * 0.14);
    }
    ctx.restore();
  }
  A.Void = { backdrop, roots, drawRoots, subLayer, drawBigRoots, drawTunnels, drawTree, drawWall };
})();
