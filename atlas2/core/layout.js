// Атлас 2.0: розкладка материків безкінечного світу. Що тут: материки різного розміру й форми (довільний контур, без рамок-тайлів) укладаються щільно: для кожного пробується кілька форм, місце шукається біля вже покладених і найтісніше охоплює їх, порожнини заповнюються. Лише розміри, контури й місця (дешево); решту створює core/blocks.js після кліку. Детерміновано від зерна: n-й материк залежить від зерна й попередніх. Опис: docs/atlas2/layout.md
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const G = 12, SZ = 1024, C = SZ / 2, STEP = 6, VARIANTS = 5, CAP = 160, HALO = 2, COVER = 7, PAD = 0.15; // G клітин в одиниці занятості; сітка SZ×SZ одиниць (±6144 клітин) з центром у C; HALO: ширина околу для дотику; COVER: радіус покриття вікна (одиниць)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // відбиток території (грубий контур + запас R) у одиницях занятості: рядки зі смугами [x0,x1) та окіл-кільце для оцінки дотику
  function footprintUnits(fp) {
    const { cw, ch, own } = fp, fw = Math.ceil(cw / 2), fh = Math.ceil(ch / 2), m = new Uint8Array(fw * fh);
    for (let uy = 0; uy < fh; uy++) for (let ux = 0; ux < fw; ux++) { let on = 0; for (let k = 0; k < 4; k++) { const x = ux * 2 + (k & 1), y = uy * 2 + (k >> 1); if (x < cw && y < ch && own[y * cw + x]) on = 1; } m[uy * fw + ux] = on; }
    const T = HALO, hm = new Uint8Array(fw * fh); // окіл: усе в межах T одиниць від відбитка (по квадрату), крім самого відбитка
    for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (m[y * fw + x]) for (let dy = -T; dy <= T; dy++) for (let dx = -T; dx <= T; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < fw && yy < fh) hm[yy * fw + xx] = 1; }
    // облямівка за межами сітки відбитка не потрібна: запас R вже всередині own
    const runs = (mask, pred) => { const rows = []; for (let y = 0; y < fh; y++) { const r = []; let s = -1; for (let x = 0; x <= fw; x++) { const on = x < fw && pred(y * fw + x); if (on && s < 0) s = x; else if (!on && s >= 0) { r.push(s, x); s = -1; } } if (r.length) rows.push({ y, r }); } return rows; };
    const core = runs(m, i => m[i] === 1), halo = runs(hm, i => hm[i] === 1 && m[i] === 0);
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, haloN = 0; for (const o of core) { y0 = Math.min(y0, o.y); y1 = Math.max(y1, o.y); x0 = Math.min(x0, o.r[0]); x1 = Math.max(x1, o.r[o.r.length - 1]); }
    for (const o of halo) for (let k = 0; k < o.r.length; k += 2) haloN += o.r[k + 1] - o.r[k];
    return { core, halo, haloN, x0, x1, y0, y1, fw, fh };
  }

  function create(base) {
    const hw = base.w, hh = base.h, seed = base.seed, hx = hw / 2, hy = hh / 2, occ = new Uint16Array(SZ * SZ), pre = new Uint16Array(SZ * (SZ + 1)), descs = [], byId = new Map();
    let ox0 = 1e9, ox1 = -1e9, oy0 = 1e9, oy1 = -1e9, full = false, prevBig = false, prevArch = false; // межі занятого (одиниці світу, не зсунуті)
    const cnt = (Y, x0, x1) => pre[Y * (SZ + 1) + x1] - pre[Y * (SZ + 1) + x0];
    const home = { id: '0', n: 0, home: true, ox: 0, oy: 0, w: hw, h: hh, seed, p: { R: 18 }, R: 18, outline: null, nb: new Set() };

    function paramsFor(d) {
      if (d.home) return A.Params.normalize(Object.assign({}, base, { R: d.R, pad: PAD, wseed: seed, ox: 0, oy: 0, hx, hy }));
      return A.Params.normalize(Object.assign({}, base, d.p, { seed: d.seed, wseed: seed, ox: d.ox || 0, oy: d.oy || 0, hx, hy, cw: d.w, ch: d.h, R: d.R, pad: PAD, bx: 0, by: 0 }));
    }
    // n-й материк: розмір (різний, після великого частіше малий), параметри; положення й форма вибираються при укладанні
    function describe(n) {
      const r = A.Rng.stream(seed, 'cont|' + n), rr = (a, b) => a + (b - a) * r(); let u = r(); if (prevBig) u = 0.5 + 0.5 * u;
      if (!prevArch && r() < 0.38) { prevArch = true; return describeArch(n, r, rr); } prevArch = false;
      const big = u < 0.14, s = big ? rr(1.0, 1.4) : u < 0.42 ? rr(0.65, 0.95) : rr(0.28, 0.55), asp = rr(0.72, 1.38); prevBig = big;
      const w = clamp(Math.round(hw * s * asp / 4) * 4, 128, 1400), h = clamp(Math.round(hh * s / asp / 4) * 4, 100, 1000), lf = rr(0.24, 0.42), rel = (w * h * lf) / (hw * hh * 0.3);
      const p = {
        provinces: clamp(Math.round(base.provinces * Math.pow(rel, 0.85) * rr(0.8, 1.3)), 2, 50), regionsPerProvince: clamp(Math.round(base.regionsPerProvince * rr(0.7, 1.3)), 2, 24),
        density: clamp(base.density * rr(0.75, 1.3), 0.3, 2.2), rugged: clamp(base.rugged * rr(0.5, 1.5), 0, 2), riverDensity: clamp(base.riverDensity * rr(0.7, 1.4), 0.1, 2.5),
        landFrac: lf, lakeDepth: base.lakeDepth, lakeFlow: base.lakeFlow
      };
      return { id: String(n), n, home: false, w, h, p, R: Math.round(rr(9, 16)), seed: seed + '|c' + n, outline: null, nb: new Set(), ox: 0, oy: 0 };
    }
    // архіпелаг: багато островів різного розміру на спільній ділянці океану; відбиток = острови з малим запасом
    function describeArch(n, r, rr) {
      const s = rr(0.4, 0.95), asp = rr(0.7, 1.4), w = clamp(Math.round(hw * s * asp / 4) * 4, 128, 900), h = clamp(Math.round(hh * s / asp / 4) * 4, 100, 700), lf = rr(0.15, 0.2);
      const p = { provinces: clamp(Math.round(base.provinces * 0.3 * rr(0.7, 1.3)), 2, 10), regionsPerProvince: clamp(Math.round(base.regionsPerProvince * rr(0.5, 0.9)), 2, 24), density: clamp(base.density * rr(0.75, 1.3), 0.3, 2.2), rugged: clamp(base.rugged * rr(0.3, 1.0), 0, 2), riverDensity: clamp(base.riverDensity * rr(0.5, 1.0), 0.1, 2.5), landFrac: lf, lakeDepth: base.lakeDepth, lakeFlow: base.lakeFlow, arch: true };
      return { id: String(n), n, home: false, w, h, p, R: Math.round(rr(6, 10)), seed: seed + '|c' + n, outline: null, nb: new Set(), ox: 0, oy: 0 };
    }
    // кандидатні положення відбитка (початок коробки в одиницях bx, by): перебір з кроком, потім уточнення; повертає найкраще {bx, by, score}
    function search(F, r) {
      const cx = (ox0 + ox1) / 2, cy = (oy0 + oy1) / 2, ext = Math.max(30, Math.max(ox1 - ox0, oy1 - oy0) / 2), fwid = F.x1 - F.x0, fhei = F.y1 - F.y0, T = HALO + 1;
      const X0 = ox0 - F.x1 - T, X1 = ox1 - F.x0 + T, Y0 = oy0 - F.y1 - T, Y1 = oy1 - F.y0 + T;
      const evalAt = (bx, by) => {
        if (bx + F.x0 + C < 1 || bx + F.x1 + C >= SZ - 1 || by + F.y0 + C < 1 || by + F.y1 + C >= SZ - 1) return null;
        for (const o of F.core) { const Y = by + o.y + C; for (let k = 0; k < o.r.length; k += 2) if (cnt(Y, bx + o.r[k] + C, bx + o.r[k + 1] + C)) return null; }
        let c = 0; for (const o of F.halo) { const Y = by + o.y + C; if (Y < 0 || Y >= SZ) continue; for (let k = 0; k < o.r.length; k += 2) c += cnt(Y, Math.max(0, bx + o.r[k] + C), Math.min(SZ, bx + o.r[k + 1] + C)); }
        if (!c) return -1e6 + 0; // не торкається нікого
        const d = Math.hypot(bx + (F.x0 + F.x1) / 2 - cx, by + (F.y0 + F.y1) / 2 - cy) / ext;
        return 100 * (c / F.haloN) - 42 * d + 5 * r();
      };
      let top = []; const push = (bx, by, sc) => { top.push({ bx, by, score: sc }); top.sort((a, b) => b.score - a.score); if (top.length > 3) top.pop(); };
      for (let by = Y0; by <= Y1; by += 3) for (let bx = X0; bx <= X1; bx += 3) { const sc = evalAt(bx, by); if (sc != null) push(bx, by, sc); }
      let best = null; for (const t of top) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const sc = evalAt(t.bx + dx, t.by + dy); if (sc != null && (!best || sc > best.score)) best = { bx: t.bx + dx, by: t.by + dy, score: sc }; }
      return best;
    }
    function write(d, F, bx, by) {
      for (const o of F.halo) { const Y = by + o.y + C; for (let k = 0; k < o.r.length; k += 2) for (let x = bx + o.r[k] + C; x < bx + o.r[k + 1] + C; x++) { const id = occ[Y * SZ + x]; if (id) { const q = descs[id - 1]; if (q !== d) { d.nb.add(q.id); q.nb.add(d.id); } } } }
      for (const o of F.core) { const Y = by + o.y + C; for (let k = 0; k < o.r.length; k += 2) for (let x = bx + o.r[k] + C; x < bx + o.r[k + 1] + C; x++) occ[Y * SZ + x] = d.n + 1; let s = 0; for (let x = 0; x < SZ; x++) { pre[Y * (SZ + 1) + x] = s; if (occ[Y * SZ + x]) s++; } pre[Y * (SZ + 1) + SZ] = s; }
      ox0 = Math.min(ox0, bx + F.x0); ox1 = Math.max(ox1, bx + F.x1); oy0 = Math.min(oy0, by + F.y0); oy1 = Math.max(oy1, by + F.y1);
    }
    function place(d) {
      const r = A.Rng.stream(seed, 'pack|' + d.n); let best = null;
      for (let v = 0; v < (d.home ? 1 : VARIANTS); v++) {
        const sd = v ? d.seed + '|v' + v : d.seed, fp = A.terrainFootprint(paramsFor(Object.assign({}, d, { seed: sd })), STEP); if (!fp.land.some(q => q)) continue; const F = footprintUnits(fp);
        if (d.home) { best = { fp, F, sd, bx: 0, by: 0, score: 0 }; break; }
        const c = search(F, r); if (c && (!best || c.score > best.score)) best = { fp, F, sd, bx: c.bx, by: c.by, score: c.score };
      }
      if (!best) return false;
      d.seed = best.sd; d.outline = best.fp; d.ox = best.bx * G; d.oy = best.by * G; descs.push(d); byId.set(d.id, d); write(d, best.F, best.bx, best.by); return true;
    }
    place(home);
    // чи є в прямокутнику вікна (клітини світу) місце, далеке від усіх материків (тоді кладемо наступний)
    function uncovered(x0, y0, x1, y1) {
      for (let uy = Math.floor(y0 / G); uy <= Math.floor(y1 / G); uy += 10) for (let ux = Math.floor(x0 / G); ux <= Math.floor(x1 / G); ux += 10) {
        const X = ux + C, Y = uy + C; if (X - COVER < 1 || X + COVER >= SZ - 1 || Y - COVER < 1 || Y + COVER >= SZ - 1) continue; let hit = false;
        for (let y = Y - COVER; y <= Y + COVER && !hit; y++) if (cnt(y, X - COVER, X + COVER + 1)) hit = true; if (!hit) return true;
      }
      return false;
    }
    const self = {
      kind: 'pack', home, byId, paramsOf: paramsFor, get: id => byId.get(id) || null,
      count: () => descs.length,
      // кладе наступні материки, поки вікно [x0,y0,x1,y1] (клітини світу) не покрите; не довше за budget мс; повертає {placed, more}
      grow(x0, y0, x1, y1, budget) {
        const t0 = Date.now(); let placed = 0;
        while (!full && descs.length < CAP && uncovered(x0, y0, x1, y1)) {
          if (!place(describe(descs.length))) { full = true; break; } placed++; if (Date.now() - t0 > budget) break;
        }
        return { placed, more: !full && descs.length < CAP && uncovered(x0, y0, x1, y1) };
      },
      // материки, чиї коробки перетинають прямокутник вікна (клітини світу)
      descsIn: (x0, y0, x1, y1) => descs.filter(d => d.ox < x1 && d.ox + d.w > x0 && d.oy < y1 && d.oy + d.h > y0),
      // материк, чия територія містить точку світу
      at(gx, gy) { const X = Math.floor(gx / G) + C, Y = Math.floor(gy / G) + C; if (X < 0 || Y < 0 || X >= SZ || Y >= SZ) return null; const id = occ[Y * SZ + X]; return id ? descs[id - 1] : null; },
      adjacent: (a, b) => a !== b && (a.nb.has(b.id) || b.nb.has(a.id)),
      near: d => Array.from(d.nb).map(id => byId.get(id)).filter(Boolean),
      // чи лежить точка (клітини світу) в закритій хмарою частині материка (грубий контур з відступом)
      inCloud(d, gx, gy) {
        const o = d.outline; if (!o) return true; const cx = Math.round((gx - d.ox) / o.step), cy = Math.round((gy - d.oy) / o.step);
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < o.cw && y < o.ch && o.land[y * o.cw + x]) return true; }
        return false;
      },
      label: d => d.home ? 'домашній' : '№ ' + d.n
    };
    return self;
  }
  A.Layout = { create };
})();
