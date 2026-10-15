/* Planet Forge: малювання літаючого континенту на canvas 2D: небо, хмари, плити з озерами, лісами, горами, річки з водоспадами, мости, бриз плит. */
const PlanetSkyView = (() => {
  const SQ = .42, GRASS = [[88, 168, 84], [196, 146, 68], [214, 232, 240], [150, 116, 214]], TREE = [[46, 112, 62], [150, 86, 40], [150, 190, 214], [96, 70, 170]], HAZE = [150, 190, 232];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)), rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`, dark = (c, f) => c.map(v => Math.round(v * f));
  function cloud(ctx, x, y, w, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(x, y); ctx.scale(1, .32); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, w, 0, 6.2832); ctx.fill(); ctx.restore(); }
  function island(ctx, o, f, S, sx, sy, t, p, pal) {
    const haze = (1 - o.z) * .5, top = mix(GRASS[pal], HAZE, haze), rock = mix([128, 100, 78], HAZE, haze), depthU = o.depth / o.r;
    ctx.save(); ctx.translate(sx, sy); ctx.scale(S, S);
    const outline = o.poly.map(([x, y]) => [x, y * SQ]);
    // скеля знизу: передня половина контуру, далі рвані грані до вістря
    const front = outline.filter(([x, y], i) => o.poly[i][1] >= -.05), tip = o.tip, d = depthU;
    ctx.beginPath(); ctx.moveTo(front[0][0], front[0][1]); for (const [x, y] of front) ctx.lineTo(x, y);
    const L = front[front.length - 1], rr = o.rock; ctx.lineTo(L[0] * .8, L[1] + d * (.28 + rr[0] * .15)); ctx.lineTo(L[0] * .45, L[1] + d * (.6 + rr[1] * .12)); ctx.lineTo(tip, d); ctx.lineTo(-L[0] * .4, L[1] + d * (.55 + rr[2] * .15)); ctx.lineTo(-L[0] * .82, L[1] + d * (.25 + rr[3] * .15)); ctx.closePath();
    const rg = ctx.createLinearGradient(0, 0, 0, d); rg.addColorStop(0, rgb(rock)); rg.addColorStop(1, rgb(dark(rock, .45))); ctx.fillStyle = rg; ctx.fill();
    // водоспади по скелі
    for (const rv of o.rivers) {
      const ex = Math.cos(rv.a) * .96, ey = Math.sin(rv.a) * .96 * SQ; if (ey < -.05) continue;
      const len = d * (.55 + rv.len * .35) * (1 - Math.abs(ex) * .25);
      ctx.save(); ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = `rgba(${200 - k * 20},${232 - k * 10},255,${.75 - k * .15})`; ctx.lineWidth = .07 - k * .015; ctx.setLineDash([.12, .07 + k * .02]); ctx.lineDashOffset = -t * (.5 + k * .12); ctx.beginPath(); ctx.moveTo(ex + (k - 1) * .03, ey); ctx.lineTo(ex + (k - 1) * .03 + ex * .06, ey + len); ctx.stroke(); }
      ctx.setLineDash([]); cloud(ctx, ex + ex * .06, ey + len, .26 + p.mist * .2, .5); ctx.restore();
    }
    // верх плити
    ctx.beginPath(); outline.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    const tg = ctx.createLinearGradient(0, -SQ, 0, SQ); tg.addColorStop(0, rgb(mix(top, [255, 255, 235], .22))); tg.addColorStop(1, rgb(dark(top, .82))); ctx.fillStyle = tg; ctx.fill(); ctx.lineWidth = .035; ctx.strokeStyle = rgb(mix(top, [255, 255, 255], .3), .7); ctx.stroke();
    ctx.save(); ctx.clip();
    for (const l of o.lakes) { ctx.fillStyle = rgb(mix([70, 140, 210], HAZE, haze), .95); ctx.beginPath(); ctx.ellipse(l.x, l.y * SQ, l.r, l.r * SQ * 1.1, 0, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .012; ctx.stroke(); }
    for (const rv of o.rivers) { ctx.strokeStyle = rgb(mix([96, 168, 230], HAZE, haze)); ctx.lineWidth = .035; ctx.lineCap = 'round'; ctx.beginPath(); rv.pts.forEach(([x, y], i) => i ? ctx.quadraticCurveTo(x, y * SQ, x, y * SQ) : ctx.moveTo(x, y * SQ)); ctx.stroke(); }
    ctx.restore();
    const things = [...o.trees.map(a => ({ y: a.y, tree: a })), ...o.peaks.map(a => ({ y: a.y, peak: a }))].sort((a, b) => a.y - b.y);
    for (const it of things) {
      if (it.tree) { const a = it.tree, c = mix(TREE[pal], HAZE, haze); ctx.fillStyle = rgb(dark(c, .8 + a.t * .35)); ctx.beginPath(); ctx.ellipse(a.x, a.y * SQ, .035 * a.s, .06 * a.s, 0, 0, 6.2832); ctx.fill(); }
      else { const a = it.peak, bx = a.x, by = a.y * SQ, hw = a.h * .38, hh = a.h * .55, g = mix([140, 134, 130], HAZE, haze); ctx.fillStyle = rgb(dark(g, .75)); ctx.beginPath(); ctx.moveTo(bx - hw, by); ctx.lineTo(bx, by - hh); ctx.lineTo(bx + hw * .15, by); ctx.fill(); ctx.fillStyle = rgb(g); ctx.beginPath(); ctx.moveTo(bx + hw * .15, by); ctx.lineTo(bx, by - hh); ctx.lineTo(bx + hw, by); ctx.fill(); ctx.fillStyle = 'rgba(250,252,255,.95)'; ctx.beginPath(); ctx.moveTo(bx - hw * .32, by - hh * .68); ctx.lineTo(bx, by - hh); ctx.lineTo(bx + hw * .32, by - hh * .68); ctx.lineTo(bx + hw * .08, by - hh * .6); ctx.closePath(); ctx.fill(); }
    }
    ctx.restore();
  }
  /* cam { x, y, zoom }; повертає нічого. Плити сортуються за глибиною, хмари передні й задні */
  function draw(ctx, w, h, world, t, cam) {
    const p = world.params, pal = p.pal, S0 = Math.min(w / 3.6, h / 1.9) * cam.zoom;
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#16356e'); sky.addColorStop(.55, '#5f98d6'); sky.addColorStop(1, '#d6e8f6'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const pos = o => { const f = .55 + .45 * o.z; return { f, S: S0 * f, x: w / 2 + (o.x - cam.x * f) * S0 * f, y: h / 2 + (o.y - cam.y * f) * S0 * f * .9 + Math.sin(t * .7 + o.phase) * 3 * f }; };
    const clouds = z => { for (const c of world.clouds) if ((c.z >= .5) === z) { const f = .55 + .45 * c.z, x = ((((c.x + t * c.v * 3 + 2.4) % 4.8) + 4.8) % 4.8 - 2.4 - cam.x * f) * S0 * f + w / 2, y = (c.y - cam.y * f) * S0 * f * .9 + h / 2; cloud(ctx, x, y, c.w * S0 * f * 1.6, c.a * (z ? .7 : 1)); } };
    clouds(false);
    const list = world.islands.map(o => Object.assign({ o }, pos(o))).sort((a, b) => a.o.z - b.o.z);
    for (const e of list.filter(e => e.o.z < .5)) island(ctx, e.o, e.f, e.o.r * e.S, e.x, e.y, t, p, pal);
    // мости: між краями плит, що дивляться одна на одну; провисають мотузкою
    for (const [i, j] of world.bridges) {
      const A = list.find(e => e.o === world.islands[i]), B = list.find(e => e.o === world.islands[j]), ang = Math.atan2(B.y - A.y, B.x - A.x);
      const a = [A.x + Math.cos(ang) * A.o.r * A.S * .95, A.y + Math.sin(ang) * A.o.r * A.S * .95 * SQ + 2], b = [B.x - Math.cos(ang) * B.o.r * B.S * .95, B.y - Math.sin(ang) * B.o.r * B.S * .95 * SQ + 2], sag = Math.hypot(b[0] - a[0], b[1] - a[1]) * .12, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
      ctx.strokeStyle = 'rgba(90,60,34,.95)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my + sag * .9, b[0], b[1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(150,108,66,.9)'; ctx.lineWidth = 1; for (let k = 0; k <= 16; k++) { const u = k / 16, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * (my + sag * .9) + u * u * b[1]; ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 2); ctx.stroke(); }
    }
    for (const e of list.filter(e => e.o.z >= .5)) island(ctx, e.o, e.f, e.o.r * e.S, e.x, e.y, t, p, pal);
    clouds(true);
  }
  return { draw };
})();
