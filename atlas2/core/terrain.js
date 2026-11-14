// Атлас 2.0, етап 1: ландшафт. Висота, рівень моря, суша/океан/озеро-западини. Край карти завжди океан.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { components } = A.Grid;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // материк із «стрічок»: головна звивиста стрічка й гілки (й підгілки), різної довжини, товщини й напрямку; навколо ще дрібні острови
  function makeRibbons(p) {
    const r = A.Rng.stream(p.seed, 'shape'), { w, h } = p, S = Math.min(w, h), L = Math.max(w, h), rr = (a, b) => a + (b - a) * r(), out = [];
    const pad = p.pad != null ? p.pad : 0.07, clampPt = (x, y) => [Math.min(w * (1 - pad), Math.max(w * pad, x)), Math.min(h * (1 - pad), Math.max(h * pad, y))]; // pad: відступ від краю коробки (0,07 для звичайного материка, менший для тайлів)
    function walk(x0, y0, head, len, wd0, wd1, bend) { // пряма з повільним викривленням і випадковими розворотами; вузли = {x,y,wd}
      const step = S * 0.05, n = Math.max(4, Math.round(len / step)), pts = []; let x = x0, y = y0, curv = rr(-1, 1) * bend; const ph = rr(0, 6.28), fq = rr(1.2, 3.2);
      for (let k = 0; k <= n; k++) {
        const t = k / n, bulge = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin(ph + t * fq * 6.28)); pts.push({ x, y, wd: (wd0 + (wd1 - wd0) * t) * S * bulge });
        if (r() < 0.12) curv = rr(-1, 1) * bend; head += curv * 0.5 + (r() - 0.5) * bend * 0.4; x += Math.cos(head) * step; y += Math.sin(head) * step;
        const m = pad + 0.01, cx = w / 2 - x, cy = h / 2 - y; if (x < w * m || x > w * (1 - m) || y < h * m || y > h * (1 - m)) head += 0.5 * Math.sin(Math.atan2(cy, cx) - head); // у межах карти
        [x, y] = clampPt(x, y);
      }
      return { pts, head };
    }
    const cs = p.cspread, c0 = cs ? 0.5 - cs : 0.4, c1 = cs ? 0.5 + cs : 0.6, cx = w * rr(c0, c1), cy = h * rr(c0, c1), a0 = rr(0, 6.28), len0 = rr(0.55, 0.85) * L, bend0 = rr(0.35, 0.8);
    const fw = walk(cx, cy, a0, len0 / 2, rr(0.055, 0.09), rr(0.03, 0.055), bend0), bw = walk(cx, cy, a0 + Math.PI, len0 / 2, rr(0.055, 0.09), rr(0.03, 0.055), bend0);
    out.push(fw.pts, bw.pts);
    const branch = (depth, count) => {
      const parents = out.slice();
      for (let k = 0; k < count; k++) {
        const par = parents[Math.floor(r() * parents.length)], i = 1 + Math.floor(r() * Math.max(1, par.length - 2)), q = par[i], pa = par[Math.min(par.length - 1, i + 1)], pb = par[Math.max(0, i - 1)];
        const hd = Math.atan2(pa.y - pb.y, pa.x - pb.x) + (r() < 0.5 ? 1 : -1) * rr(0.5, 1.7), len = rr(0.1, depth ? 0.22 : 0.4) * L;
        out.push(walk(q.x, q.y, hd, len, Math.min(0.06, q.wd / S * rr(0.55, 0.9)), rr(0.015, 0.035), rr(0.4, 1.0)).pts);
      }
    };
    branch(0, 4 + Math.floor(r() * 5)); branch(1, 3 + Math.floor(r() * 5));
    return out;
  }
  // поле відстані до стрічок, поділеної на їхню півширину (0 = вісь, 1 = край); окремий прохід по ділянках сегментів. step > 1: грубе поле (клітина = step клітин карти) для контурів закритих материків
  function ribbonField(p, step) {
    step = step || 1; const { w, h } = p, cw = Math.ceil(w / step), ch = Math.ceil(h / step), D = new Float32Array(cw * ch).fill(9), rib = makeRibbons(p);
    for (const pts of rib) for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k], R = Math.max(a.wd, b.wd) * 2.1, x0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - R) / step)), x1 = Math.min(cw - 1, Math.ceil((Math.max(a.x, b.x) + R) / step)), y0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - R) / step)), y1 = Math.min(ch - 1, Math.ceil((Math.max(a.y, b.y) + R) / step));
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const x = cx * step, y = cy * step, t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2)), v = Math.hypot(x - a.x - dx * t, y - a.y - dy * t) / (a.wd + (b.wd - a.wd) * t); if (v < D[cy * cw + cx]) D[cy * cw + cx] = v; }
    }
    return D;
  }
  // маска «власної» території материка (тайли з p.rects у координатах коробки), по клітинах із кроком step; null, якщо материк займає всю коробку
  function ownMask(p, step) {
    if (!p.rects) return null; const cw = Math.ceil(p.w / step), ch = Math.ceil(p.h / step), m = new Uint8Array(cw * ch);
    for (const [x0, y0, x1, y1] of p.rects) for (let cy = Math.ceil(y0 / step); cy * step < y1 && cy < ch; cy++) for (let cx = Math.ceil(x0 / step); cx * step < x1 && cx < cw; cx++) m[cy * cw + cx] = 1;
    return m;
  }
  // відстань (клітини карти) від клітини власної території до її межі (поза маскою й за краєм коробки)
  function edgeDist(own, cw, ch, step) {
    const d = new Float32Array(cw * ch); for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) d[y * cw + x] = !own[y * cw + x] ? 0 : (x === 0 || y === 0 || x === cw - 1 || y === ch - 1) ? 1 : 1e9;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const i = y * cw + x; let v = d[i]; if (x) v = Math.min(v, d[i - 1] + 1); if (y) { v = Math.min(v, d[i - cw] + 1); if (x) v = Math.min(v, d[i - cw - 1] + 1.41); if (x < cw - 1) v = Math.min(v, d[i - cw + 1] + 1.41); } d[i] = v; }
    for (let y = ch - 1; y >= 0; y--) for (let x = cw - 1; x >= 0; x--) { const i = y * cw + x; let v = d[i]; if (x < cw - 1) v = Math.min(v, d[i + 1] + 1); if (y < ch - 1) { v = Math.min(v, d[i + cw] + 1); if (x < cw - 1) v = Math.min(v, d[i + cw + 1] + 1.41); if (x) v = Math.min(v, d[i + cw - 1] + 1.41); } d[i] = v; }
    for (let i = 0; i < d.length; i++) d[i] *= step; return d;
  }
  // базова висота (до рівня моря й островів) на сітці з кроком step; для step = 1 це точно той самий ландшафт, що в terrain
  function baseField(p, step, own) {
    const { w, h } = p, cw = Math.ceil(w / step), ch = Math.ceil(h / step), hh = new Float32Array(cw * ch), nz = A.Noise.make(p.seed + '|t'), D = ribbonField(p, step), jr = A.Rng.stream(p.seed, 'micro'), pad = p.pad != null ? p.pad : 0.07;
    const ed = own ? edgeDist(own, cw, ch, step) : null;
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      const x = cx * step, y = cy * step, nx = x / w, ny = y / h;
      const wx = nx + 0.14 * (nz.fbm(nx * 2.3 + 7, ny * 2.3 + 3, 3) - 0.5), wy = ny + 0.14 * (nz.fbm(nx * 2.3 + 31, ny * 2.3 + 19, 3) - 0.5);
      const base = nz.fbm(wx * 4.2, wy * 4.2, 6);
      let v;
      {
        // материк зі «стрічок»: сильне викривлення в кількох масштабах дає півострови, затоки, фіорди й неправильний берег
        const sx = Math.min(w - 1, Math.max(0, Math.round((wx + 0.05 * (nz.fbm(nx * 7 + 61, ny * 7 + 11, 3) - 0.5) + 0.02 * (nz.fbm(nx * 21 + 5, ny * 21 + 77, 2) - 0.5)) * w))), sy = Math.min(h - 1, Math.max(0, Math.round((wy + 0.05 * (nz.fbm(nx * 7 + 12, ny * 7 + 80, 3) - 0.5) + 0.02 * (nz.fbm(nx * 21 + 66, ny * 21 + 9, 2) - 0.5)) * h)));
        let dd = D[Math.min(ch - 1, Math.round(sy / step)) * cw + Math.min(cw - 1, Math.round(sx / step))]; dd += 0.5 * (nz.fbm(nx * 3.1 + 90, ny * 3.1 + 40, 5) - 0.5) + 0.32 * (nz.fbm(nx * 11 + 17, ny * 11 + 53, 3) - 0.5);
        v = 0.65 * (1 - sstep(0.5, 1.15, dd)) + 0.5 * (base - 0.5) * (0.4 + 0.6 * (1 - sstep(0.3, 1.2, dd))) + 0.05;
      }
      const ridge = 1 - Math.abs(2 * nz.fbm(wx * 5 + 200, wy * 5 + 200, 4) - 1);
      v += p.rugged * 0.22 * Math.pow(ridge, 3) * sstep(0.4, 0.7, v);
      const edge = ed ? ed[cy * cw + cx] : Math.min(nx, 1 - nx, ny, 1 - ny) * Math.min(w, h);
      if (step === 1) v += 0.012 * (jr() - 0.5); // мікрорельєф: річки не біжать рівними діагоналями
      if (ed) { // власна територія (тайл): суша плавно спадає й закінчується на відстані від межі, сама межа хвиляста від шуму, тож обрізаного берега по прямій немає
        const m0 = 12, e2 = edge + (nz.fbm(nx * 6 + 3, ny * 6 + 9, 3) - 0.5) * 24 + (nz.fbm(nx * 17 + 40, ny * 17 + 7, 2) - 0.5) * 10;
        hh[cy * cw + cx] = v * sstep(m0, m0 + Math.max(24, 0.05 * Math.min(w, h)), e2); continue;
      }
      hh[cy * cw + cx] = v * sstep(2, Math.min(w, h) * pad, edge);
    }
    return hh;
  }
  // грубий контур материка (дешево): суша на сітці з кроком step у координатах коробки; той самий ландшафт, що буде згенеровано повністю, без островів і дрібниць
  function outline(p, step) {
    step = step || 6; const cw = Math.ceil(p.w / step), ch = Math.ceil(p.h / step), own = ownMask(p, step), hh = baseField(p, step, own), vals = [];
    for (let i = 0; i < hh.length; i++) if (!own || own[i]) vals.push(hh[i]); vals.sort((a, b) => a - b);
    const sea = vals[Math.floor((1 - p.landFrac) * (vals.length - 1))], land = new Uint8Array(cw * ch); for (let i = 0; i < hh.length; i++) land[i] = hh[i] > sea && (!own || own[i]) ? 1 : 0;
    return { step, cw, ch, land, own, sea };
  }
  function terrain(p) {
    if (A.Params.isVoid(p)) return A.astrakorTerrain(p); // вимір «Астракор»: материк у космосі (core/astrakor.js)
    const { w, h } = p, N = w * h, nz = A.Noise.make(p.seed + '|t'), own = ownMask(p, 1), hh = baseField(p, 1, own);
    // рівень моря: квантиль під потрібну частку суші
    let sorted; if (own) { const v = []; for (let i = 0; i < N; i++) if (own[i]) v.push(hh[i]); sorted = Float32Array.from(v).sort(); } else sorted = Float32Array.from(hh).sort(); // з власною територією (тайл) частка суші рахується в її межах
    const sea = sorted[Math.floor((1 - p.landFrac) * (sorted.length - 1))];
    if (own) for (let i = 0; i < N; i++) if (!own[i]) hh[i] = Math.min(hh[i], sea - 0.02);
    // нічиї острови навколо материка: чим більший материк, тим їх більше; різного розміру, витягнуті, з рваним берегом
    {
      let cl = 0; const d0 = new Float32Array(N); for (let i = 0; i < N; i++) if (hh[i] > sea) cl++; else d0[i] = 1e9;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let v = d0[i]; if (x) v = Math.min(v, d0[i - 1] + 1); if (y) { v = Math.min(v, d0[i - w] + 1); if (x) v = Math.min(v, d0[i - w - 1] + 1.41); if (x < w - 1) v = Math.min(v, d0[i - w + 1] + 1.41); } d0[i] = v; }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let v = d0[i]; if (x < w - 1) v = Math.min(v, d0[i + 1] + 1); if (y < h - 1) { v = Math.min(v, d0[i + w] + 1); if (x < w - 1) v = Math.min(v, d0[i + w + 1] + 1.41); if (x) v = Math.min(v, d0[i + w - 1] + 1.41); } d0[i] = v; }
      const ir = A.Rng.stream(p.seed, 'islands'), want = Math.max(5, Math.min(70, Math.round(Math.sqrt(cl) / 15 * (0.8 + 0.4 * ir())))); let made = 0;
      for (let tries = 0; tries < want * 40 && made < want; tries++) {
        const cx = 8 + ir() * (w - 16), cy = 8 + ir() * (h - 16), ci = Math.round(cy) * w + Math.round(cx); if (d0[ci] < 10 || d0[ci] > 220) continue;
        const rad = Math.exp(Math.log(6) + ir() * Math.log(34 / 6)), el = 1 + ir() * 1.4, rx = rad * el, ry = rad / Math.sqrt(el), ang = ir() * 3.1416, ca = Math.cos(ang), sa = Math.sin(ang), R = Math.ceil(Math.max(rx, ry) * 1.6);
        let ok = true; for (let dy = -R; dy <= R && ok; dy += 3) for (let dx = -R; dx <= R; dx += 3) { const x = Math.round(cx) + dx, y = Math.round(cy) + dy; if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2 || hh[y * w + x] > sea || (own && !own[y * w + x])) { ok = false; break; } }
        if (!ok) continue; made++; const o = made * 13.7;
        for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
          const x = Math.round(cx) + dx, y = Math.round(cy) + dy, u = (dx * ca + dy * sa) / rx, q = (-dx * sa + dy * ca) / ry, f = 1 - Math.hypot(u, q) + 0.7 * (nz.fbm(x * 0.07 + o, y * 0.07 + o * 0.6, 3) - 0.5) + 0.25 * (nz.fbm(x * 0.2 + o, y * 0.2 - o, 2) - 0.5);
          if (f > 0) { const i = y * w + x, v = sea + 0.004 + 0.3 * Math.min(1, f) * (0.6 + 0.8 * nz.fbm(x * 0.05 + o, y * 0.05, 3)); if (v > hh[i]) hh[i] = v; }
        }
      }
    }
    let land = new Uint8Array(N); for (let i = 0; i < N; i++) land[i] = hh[i] > sea ? 1 : 0;
    // дрібні клаптики суші прибираємо
    const cc = components(w, h, i => land[i] === 1), minIsl = 40;
    for (let i = 0; i < N; i++) if (land[i] && cc.sizes[cc.id[i]] < minIsl) { land[i] = 0; hh[i] = sea - 0.002; }
    // океан = вода, пов'язана з краєм; решта води нижче рівня моря = озера-западини
    const wc = components(w, h, i => land[i] === 0), ocean = new Uint8Array(N), edgeIds = new Set();
    for (let x = 0; x < w; x++) { edgeIds.add(wc.id[x]); edgeIds.add(wc.id[(h - 1) * w + x]); }
    for (let y = 0; y < h; y++) { edgeIds.add(wc.id[y * w]); edgeIds.add(wc.id[y * w + w - 1]); }
    for (let i = 0; i < N; i++) if (!land[i] && edgeIds.has(wc.id[i])) ocean[i] = 1;
    for (let i = 0; i < N; i++) if (!land[i] && !ocean[i]) { land[i] = 1; hh[i] = sea + 0.002; } // внутрішня вода нижче моря не береться: озера утворюються лише в западинах за правилами стоку
    // висота над морем 0..1 (для суші), під морем <0
    let top = sea + 0.01; for (let i = 0; i < N; i++) if (hh[i] > top) top = hh[i];
    const elev = new Float32Array(N), mx = top - sea;
    for (let i = 0; i < N; i++) elev[i] = (hh[i] - sea) / mx;
    let ext = null; if (own) { ext = new Uint8Array(N); for (let i = 0; i < N; i++) ext[i] = own[i] ? 0 : 1; } // ext: клітини за власною територією (чужі тайли й смуга моря між материками): це вода, але не цього материка
    return { height: hh, elev, sea, land, ocean, ext };
  }
  function i2(x, y, w) { return y * w + x; }
  A.terrain = terrain; A.terrainOutline = outline;
})();
