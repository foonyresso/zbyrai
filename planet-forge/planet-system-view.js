/* Planet Forge: малювання зоряної системи на canvas 2D: зоря (за типом), орбіти, планети-мініатюри, зона життя, підписи, пошук планети під курсором. */
const PlanetSystemView = (() => {
  const PC = PlanetCore, PS = PlanetSystem, K = .42;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  /* ---------- мініатюри планет: кеш за параметрами ---------- */
  const thumbs = new Map();
  function thumb(params, S) {
    const key = JSON.stringify(params) + S; let c = thumbs.get(key); if (c) return c;
    if (thumbs.size > 60) thumbs.clear();
    const tex = PC.generateTexture(params, 96, 48), cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d'), im = g.createImageData(S, S), d = im.data, R = S / 2, atmo = PC.atmoColor(params), flat = PC.KINDS[params.kind].flat;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const nx = (x + .5 - R) / R, ny = -(y + .5 - R) / R, r2 = nx * nx + ny * ny, o = (y * S + x) * 4; if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2), lon = Math.atan2(nz, nx) * 1 + .6, lat = Math.asin(clamp(ny, -1, 1)), u = ((lon / (2 * Math.PI)) % 1 + 1) % 1, v = .5 - lat / Math.PI, tx = Math.min(95, Math.floor(u * 96)), ty = Math.min(47, Math.floor(v * 48)), ti = (ty * 96 + tx) * 3;
      const lit = clamp(nx * -.55 + ny * .25 + nz * .8, 0, 1), sh = .12 + .88 * lit, rim = Math.pow(1 - nz, 2.4) * .6 * (flat ? .4 : 1);
      d[o] = tex.rgb[ti] * sh + atmo[0] * rim; d[o + 1] = tex.rgb[ti + 1] * sh + atmo[1] * rim; d[o + 2] = tex.rgb[ti + 2] * sh + atmo[2] * rim; d[o + 3] = 255;
    }
    g.putImageData(im, 0, 0); thumbs.set(key, cv); return cv;
  }
  /* ---------- зорі ---------- */
  function glow(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function disc(ctx, x, y, r, col) { const g = ctx.createRadialGradient(x - r * .25, y - r * .25, r * .1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(.35, rgba(col, 1)); g.addColorStop(1, rgba(col.map(v => v * .75), 1)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function drawStar(ctx, id, cx, cy, r, t) {
    const S = PS.STARS[id], col = S.col;
    if (id === 'blackhole') {
      glow(ctx, cx, cy, r * 4, col, .18);
      ctx.save(); ctx.translate(cx, cy);
      for (let k = 0; k < 14; k++) { const rr = r * (1.5 + k * .16); ctx.strokeStyle = rgba(col.map(v => Math.min(255, v * (1.1 - k * .04))), .5 - k * .03); ctx.lineWidth = r * .1; ctx.beginPath(); ctx.ellipse(0, 0, rr * 1.6, rr * .34, 0, 0, 6.2832); ctx.stroke(); }
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill(); ctx.strokeStyle = rgba(col, .7); ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = rgba(col, .8); ctx.lineWidth = r * .16; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * .36, 0, Math.PI, 6.2832); ctx.stroke(); ctx.restore(); return;
    }
    if (id === 'binary') { const a = t * .5, o = r * 1.5; disc(ctx, cx + Math.cos(a) * o, cy + Math.sin(a) * o * .4, r * .85, [255, 214, 150]); glow(ctx, cx, cy, r * 3.2, col, .25); disc(ctx, cx - Math.cos(a) * o, cy - Math.sin(a) * o * .4, r * .6, [255, 170, 120]); return; }
    glow(ctx, cx, cy, r * (id === 'redgiant' ? 3 : 4), col, id === 'white' || id === 'pulsar' ? .5 : .35);
    if (id === 'pulsar') { ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 1.3); const g = ctx.createLinearGradient(-r * 14, 0, r * 14, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, .55)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(-r * 14, -r * .4, r * 28, r * .8); ctx.restore(); }
    disc(ctx, cx, cy, r, col);
  }
  /* Намалювати систему. Повертає список планет з екранними координатами для вибору мишею */
  function draw(ctx, w, h, sys, o) {
    const mode = o.mode, zoom = mode === 'real' ? o.zoom : 1, cx = w / 2, cy = h / 2, base = Math.min(w * .46, h * .46 / K) * zoom, t = o.t, star = PS.STARS[sys.star], z = PS.hz(star), out = [];
    const sr = mode === 'real' ? 5 + 5 * star.size : 12 + 20 * star.size;
    if (mode === 'real') { // зона життя (де вода рідка): зелена смуга між двома орбітами
      const au1 = PS.orbitFrac(sys, sys.planets.length - 1, 'real') / sys.planets[sys.planets.length - 1].au, r1 = z.in * au1 * base, r2 = z.out * au1 * base;
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, r2, r2 * K, 0, 0, 6.2832); ctx.ellipse(cx, cy, r1, r1 * K, 0, 0, 6.2832, true); ctx.fillStyle = 'rgba(110,220,140,.10)'; ctx.fill('evenodd'); ctx.restore();
    }
    sys.planets.forEach((p, i) => { const rx = PS.orbitFrac(sys, i, mode) * base; ctx.strokeStyle = i === o.cur ? 'rgba(159,216,245,.55)' : 'rgba(180,200,230,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * K, 0, 0, 6.2832); ctx.stroke(); });
    drawStar(ctx, sys.star, cx, cy, sr, t);
    const list = sys.planets.map((p, i) => { const rx = PS.orbitFrac(sys, i, mode) * base, a = p.phase + t * PS.speedOf(sys, i, mode), kd = PC.KINDS[p.params.kind], giant = kd.flat; return { i, p, x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * rx * K, r: mode === 'real' ? (giant ? 7 : 4) : (giant ? 20 : 10 + (p.au * 7 % 5)), depth: Math.sin(a) }; });
    list.sort((a, b) => a.depth - b.depth);
    for (const e of list) {
      const S2 = Math.max(8, Math.round(e.r * 2 * (o.dpr || 1))), tc = thumb(e.p.params, S2), inZone = e.p.au >= z.in && e.p.au <= z.out;
      if (inZone) glow(ctx, e.x, e.y, e.r * 2.2, [110, 230, 150], .22);
      ctx.drawImage(tc, e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
      if (e.i === o.cur || e.i === o.hover) { ctx.strokeStyle = e.i === o.cur ? '#9fd8f5' : 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 4, 0, 6.2832); ctx.stroke(); }
      ctx.fillStyle = e.i === o.hover || e.i === o.cur ? '#fff' : 'rgba(210,222,240,.75)'; ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(e.p.params.name + ' · ' + e.p.au + ' а.о.', e.x, e.y + e.r + 15);
      out.push({ i: e.i, x: e.x, y: e.y, r: Math.max(e.r + 6, 14) });
    }
    if (mode === 'real') { const au1 = PS.orbitFrac(sys, sys.planets.length - 1, 'real') / sys.planets[sys.planets.length - 1].au, px = au1 * base; ctx.strokeStyle = 'rgba(210,222,240,.7)'; ctx.fillStyle = 'rgba(210,222,240,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(20, h - 24); ctx.lineTo(20 + px, h - 24); ctx.moveTo(20, h - 29); ctx.lineTo(20, h - 19); ctx.moveTo(20 + px, h - 29); ctx.lineTo(20 + px, h - 19); ctx.stroke(); ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('1 а.о. (відстань Земля–Сонце)', 28 + px, h - 20); }
    return out;
  }
  return { draw };
})();
