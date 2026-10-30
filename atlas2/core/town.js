// Атлас 2.0, місто: генератор детального міста з поселення (райони, вулиці, площі, парки, споруди, стіни, порт). Детерміновано від зерна світу й номера поселення; будується за потреби (клік на поселенні).
(function () {
  'use strict';
  const A = globalThis.Atlas2, D = A.CityData, T = D.T, K = D.K, X = A.CityText, TAU = Math.PI * 2;
  const TIER = { hamlet: 0, village: 1, town: 2, regional: 3, capital: 4 };
  const PPB = [9, 6, 6.5, 7, 7], AREAB = [800, 480, 330, 340, 300], MINB = [3, 12, 60, 250, 900], MAXB = [12, 110, 520, 1500, 3000];
  const GATE = { bank: 3, manufact: 3, jewel: 2, brothel: 2, bath: 2, weapon: 2, pharm: 2, school: 2, gmage: 3, theater: 3, arena: 4, library: 3, academy: 4, hospital: 3, prison: 3, court: 3, gthief: 3, shipyard: 2, warehouse: 2, tannery: 2, weaver: 2, brewery: 2, gmerc: 3, galch: 3, gmerch: 2, estate: 3, mtower: 4, cathedral: 4, barracks: 2, manufact2: 3 };
  const PLANS = [[], ['centre', 'outskirts'], ['centre', 'trade', 'craft', 'poor', 'port', 'suburb'], ['centre', 'trade', 'craft', 'rich', 'poor', 'temple', 'castle', 'port', 'suburb'], ['centre', 'trade', 'craft', 'rich', 'poor', 'temple', 'castle', 'port', 'trade', 'rich', 'suburb']];
  // унікальні споруди: [тип, де (вид району чи 'centre'/'gate'), мін. ранг]
  const UNIQ = [['hall', 'centre', 2], ['elder', 'centre', 1], ['temple', 'temple', 3], ['cathedral', 'temple', 4], ['temple', 'centre', 2], ['chapel', 'centre', 1], ['tavern', 'centre', 1], ['smith', 'centre', 1], ['mill', 'centre', 1], ['inn', 'trade', 2], ['gmerch', 'trade', 2], ['bank', 'trade', 3], ['gmerc', 'craft', 3], ['gmage', 'rich', 3], ['mtower', 'rich', 4], ['galch', 'craft', 3], ['gthief', 'poor', 3], ['barracks', 'castle', 2], ['prison', 'castle', 3], ['court', 'castle', 3], ['school', 'temple', 3], ['library', 'rich', 3], ['academy', 'rich', 4], ['theater', 'rich', 3], ['arena', 'poor', 4], ['hospital', 'temple', 3], ['shipyard', 'port', 2], ['stable', 'gate', 2], ['barracks', 'gate', 3], ['tavern', 'port', 2], ['inn', 'gate', 3], ['school', 'centre', 2]];
  const FLOORS = { bastion: [3, 4], wtower: [3, 5], wardtower: [4, 5], ballista: [1, 2], gatehouse: [3, 4], garrison: [2, 3], armory: [2, 2], granary: [2, 3], cistern: [1, 1], drill: [1, 1], hq: [3, 3], mhall: [2, 3], pit: [1, 1], totem: [2, 3], feast: [1, 2], warband: [2, 2], mwatch: [3, 4], house: [1, 2], rich: [2, 3], estate: [2, 3], slum: [1, 1], hall: [3, 3], castle: [4, 4], donjon: [4, 6], palas: [2, 3], kitchen: [1, 2], farmyard: [1, 1], boathouse: [1, 1], cathedral: [5, 5], temple: [2, 3], mtower: [6, 7], windmill: [3, 3], tavern: [2, 3], inn: [2, 3], library: [2, 3], academy: [3, 4], theater: [2, 3], bank: [2, 3], arena: [2, 3], barracks: [2, 3], hospital: [2, 3], prison: [2, 3], court: [2, 3], gmage: [2, 3], gmerch: [2, 3] };
  const NAMED = new Set(['bastion', 'gatehouse', 'hq', 'garrison', 'armory', 'tavern', 'inn', 'temple', 'chapel', 'cathedral', 'academy', 'theater', 'arena', 'hospital', 'castle', 'gmerch', 'gmerc', 'gmage', 'galch', 'gthief', 'bath', 'brothel', 'library']);
  const CRAFT = new Set(['smith', 'bakery', 'shop', 'pharm', 'jewel', 'weapon', 'tannery', 'weaver', 'brewery', 'mill', 'windmill', 'stable', 'bank', 'fishhut', 'farm', 'farmstead', 'hut', 'rich', 'house', 'estate', 'slum', 'elder', 'manufact', 'warehouse', 'shipyard', 'fishdry']);
  const FORT_PLAN = ['centre', 'garrison', 'supply', 'castle', 'temple', 'craft', 'poor']; // фортеця: оборонний пояс (rampart) додається окремо, уздовж стіни
  const UNIQ_FORT = [['hq', 'centre', 1], ['inn', 'centre', 1], ['tavern', 'centre', 1], ['chapel', 'centre', 1], ['cistern', 'centre', 1], ['temple', 'temple', 1], ['hospital', 'temple', 1], ['armory', 'garrison', 1], ['drill', 'garrison', 1], ['barracks', 'garrison', 1], ['garrison', 'garrison', 1], ['stable', 'garrison', 1], ['tavern', 'garrison', 1], ['smith', 'garrison', 1], ['granary', 'supply', 1], ['granary', 'supply', 1], ['mill', 'supply', 1], ['bakery', 'supply', 1], ['prison', 'castle', 1], ['court', 'castle', 1], ['barracks', 'castle', 1], ['cistern', 'supply', 1]];
  const MONU = ['засновнику поселення', 'героям давньої оборони', 'доброму королю', 'невідомому мандрівнику, що врятував місто', 'духові-охоронцю цього краю', 'п’ятьом полеглим захисникам'];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), pick = (r, a) => a[Math.floor(r() * a.length)];
  const rectCorners = (b, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + pad, hh = b.h / 2 + pad; return [[b.x + c * hw - s * hh, b.y + s * hw + c * hh], [b.x - c * hw - s * hh, b.y - s * hw + c * hh], [b.x - c * hw + s * hh, b.y - s * hw - c * hh], [b.x + c * hw + s * hh, b.y + s * hw - c * hh]]; };
  const rectHit = (b, x, y, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y; return Math.abs(dx * c + dy * s) <= b.w / 2 + pad && Math.abs(-dx * s + dy * c) <= b.h / 2 + pad; };
  function overlap(p, q) { // SAT двох повернутих прямокутників
    const ca = rectCorners(p, 0), cb = rectCorners(q, 0);
    for (const r of [p, q]) for (const ang of [r.a, r.a + Math.PI / 2]) { const ax = Math.cos(ang), ay = Math.sin(ang); let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const c of ca) { const d = c[0] * ax + c[1] * ay; if (d < a0) a0 = d; if (d > a1) a1 = d; } for (const c of cb) { const d = c[0] * ax + c[1] * ay; if (d < b0) b0 = d; if (d > b1) b1 = d; } if (a1 < b0 || b1 < a0) return false; }
    return true;
  }
  const caches = new WeakMap(), customs = new WeakMap(); // customs: свої міста (напр. гра «Закладини»): світ → Map(id поселення → місто), замість генерації
  const customOf = (W, s) => { const m = customs.get(W); return m && m.get(s.id); };
  const get = (W, s, extra) => { const cu = customOf(W, s); if (cu) return cu; let m = caches.get(W); if (!m) caches.set(W, m = new Map()); let c = m.get(s.id); if (!c) m.set(s.id, c = build(W, s, extra)); return c; };
  const has = (W, s) => !!customOf(W, s) || !!(caches.get(W) && caches.get(W).has(s.id));
  // орієнтовні розміри міста до побудови: радіус, радіус області, кількість споруд
  const sizeOf = s => { const tier = s.fortress ? 4 : TIER[s.rank], popEff = s.fortress && s.bld ? s.bld : s.pop || s.popBefore || [60, 380, 2000, 8000, 26000][tier], target = clamp(Math.round(popEff / PPB[tier]), MINB[tier], MAXB[tier]), R = Math.sqrt(target * AREAB[tier] / Math.PI) * (tier >= 2 ? 1.12 : 1) * (s.fortress ? 1.2 : 1); return { tier, popEff, target, R, Rmap: R * 1.9 + 120 + (s.fortress ? 800 : 0) }; }; // фортеця більша (стіна відрізає частину круга) і має запас на зсув центру

  function build(W, s, extra) {
    const seed = W.params.seed, r = A.Rng.stream(seed, 'town|' + s.id), si = A.Rng.hashSeed(seed + '|t' + s.id) & 0x7fffffff, names = A.Names.make(seed + '|town|' + s.id), lang = names.lang(), cname = () => { try { return names.region(lang); } catch (e) { return X.mkName(r); } };
    const fate = s.ruined ? 'ruined' : s.fate || null, { tier, popEff, target, R, Rmap } = sizeOf(s), Rmax = R * 1.45;
    const fort = s.fortress && s.wf ? A.TownFort.geom(W, s) : null, mon = fate === 'occupied' && s.occupier !== 'bandits';
    extra = extra || {}; const env = A.TownEnv.make(W, s, R, Rmap, si, { geom: extra.geom, mask: extra.mask && extra.mask(Rmap + 200) }); if (fort) A.TownFort.attach(env, fort, Rmax * 1.45 + 150); const WK = env.waterKind;
    // центр міста лежить на дорозі карти (або в клітині поселення)
    let [x0, y0] = fort ? A.TownFort.centre(fort, R) : env.c0 || [0, 0]; if (WK(x0, y0) !== 0) { let f = false; for (let d = 12; d < 260 && !f; d += 12) for (let k = 0; k < 16 && !f; k++) { const x = Math.cos(k / 16 * TAU) * d, y = Math.sin(k / 16 * TAU) * d; if (WK(x, y) === 0) { x0 = x; y0 = y; f = true; } } }
    const net = A.TownNet.build(env, r, { x0, y0, R, Rmax, tier, runs: env.runs, port: s.port, fort: !!fort, keep: fort ? (x, y) => fort.sd(x, y) < A.TownFort.BELT - 4 : null }), { streets, near, grow, mkSt, shore } = net, d0 = (x, y) => Math.hypot(x - x0, y - y0);
    if (fort) net.blocked = (x, y) => fort.sd(x, y) < A.TownFort.BELT - 4; // стежки й лінії-зʼєднання теж обходять зону оборонної лінії
    const Ufort = fort ? A.TownFort.reach(fort, x0, y0, R * 1.1) : 0; if (fort) A.TownFort.streets(fort, net, { x0, y0, Rmax, WK, U: Ufort, cname, r }); // мурова дорога й вилазні брами
    const tr = extra.trace; if (tr) tr('roads', { streets, env, c0: [x0, y0], R, Rmap }); // знімок для покрокової демонстрації (core/citytrace.js); у звичайній генерації tr порожній
    // ---- бічні вулиці й провулки, що ростуть від основних
    const gap = [55, 46, 60, 88, 95][tier], lenR = [[40, 80], [55, 130], [90, 210], [120, 260], [140, 310]][tier], pb = [0.5, 0.92, 0.9, 0.9, 0.92][tier], queue = streets.map(st => [st, 0]);
    for (let qi = 0; qi < queue.length; qi++) {
      const [st, lvl] = queue[qi]; if (lvl >= 2 || (lvl === 1 && tier < 2)) continue; const g = lvl === 0 ? gap : 46, p = st.pts; let acc = 0, next = g * (0.35 + 0.5 * r()), side = r() < 0.5 ? 1 : -1;
      for (let i = 2; i < p.length; i += 2) {
        const ax = p[i - 2], ay = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - ay), ang = Math.atan2(p[i + 1] - ay, p[i] - ax);
        while (acc + L >= next && L > 0) {
          const t = (next - acc) / L, px = ax + (p[i] - ax) * t, py = ay + (p[i + 1] - ay) * t, d = d0(px, py); let sd = side; if (st.kind === 'embankment') sd = (x0 - px) * -Math.sin(ang) + (y0 - py) * Math.cos(ang) > 0 ? 1 : -1;
          if (d < R * 1.05 && r() < (lvl === 0 ? pb : 0.5) * (1 - 0.55 * Math.min(1, d / R) ** 2)) {
            const a = ang + sd * Math.PI / 2 + (r() - 0.5) * 0.5, sx = px + Math.cos(a) * st.hw, sy = py + Math.sin(a) * st.hw;
            if (near(sx, sy, 30, st.id, -2) > (lvl ? 16 : 24)) { const ch = mkSt(lvl === 0 && tier >= 1 ? 'street' : 'lane', lvl === 0 && tier >= 1 ? 4.2 : 2.5, st.id); grow(ch, sx, sy, a, lvl === 0 ? lenR[0] + r() * (lenR[1] - lenR[0]) : 35 + r() * 60, 0.3, true); if (ch.pts.length < 4) streets.pop(); else queue.push([ch, lvl + 1]); }
          }
          next += g * (0.75 + 0.5 * r()); side = r() < 0.8 ? -side : side;
        }
        acc += L;
      }
    }
    if (tr) tr('side', { streets });
    // ---- кінці вулиць і провулків не обриваються: близькі (до 40 м) дотягуються до найближчої дороги, на околиці стежки доходять до найближчого проспекту; продовження йде плавно, зʼєднання без гострих кутів
    const outposts = [], ancestors = st => { const s = new Set([st.id]); for (let q = st; q.parent >= 0 && !s.has(q.parent); q = streets[q.parent]) s.add(q.parent); return s; };
    function nearestRoad(st, ex, ey, kinds, maxD) {
      const skip = ancestors(st); let bd = maxD, bt = null;
      for (const av of streets) { if (skip.has(av.id) || av.parent === st.id || !kinds.includes(av.kind)) continue; const p = av.pts; for (let i = 2; i < p.length; i += 2) { const dx = p[i] - p[i - 2], dy = p[i + 1] - p[i - 1], t = clamp(((ex - p[i - 2]) * dx + (ey - p[i - 1]) * dy) / (dx * dx + dy * dy || 1e-9), 0, 1), qx = p[i - 2] + dx * t, qy = p[i - 1] + dy * t, d = Math.hypot(qx - ex, qy - ey); if (d < bd) { bd = d; bt = { x: qx, y: qy, ang: Math.atan2(dy, dx), d, hw: av.hw }; } } }
      return bt;
    }
    if (tier >= 1) for (const st of streets.slice()) {
      if ((st.kind !== 'street' && st.kind !== 'lane') || st.joined || st.pts.length < 4) continue; const n = st.pts.length, ex = st.pts[n - 2], ey = st.pts[n - 1], inner = d0(ex, ey) < R * 0.7;
      const bt = nearestRoad(st, ex, ey, inner ? ['avenue', 'ring', 'street', 'lane', 'embankment'] : ['avenue', 'ring', 'street', 'embankment'], inner ? 40 : 5000);
      if (bt && bt.d - bt.hw <= 2) continue; // кінець уже торкається дороги
      const hd = Math.atan2(ey - st.pts[n - 3], ex - st.pts[n - 4]), link = () => { const ch = mkSt('path', st.hw, st.id); ch.look = st.kind; // продовження бере ширину й вигляд дороги, яку продовжує
        net.reach(ch, ex, ey, hd, bt.x, bt.y, Math.min(5000, bt.d * 1.5 + 40), true, bt.ang); if (ch.pts.length < 4) streets.pop(); };
      if (inner) { if (bt) link(); continue; }
      if (bt && bt.d <= 380) { link(); continue; }
      if (r() < 0.3) continue;
      if (outposts.length >= 1 + tier) { if (bt) link(); continue; }
      const L = Math.max(130, R * 1.12 + 190 - d0(ex, ey)) + r() * 90, tx = ex + Math.cos(hd) * L, ty = ey + Math.sin(hd) * L, ch = mkSt('path', st.hw, st.id); ch.look = st.kind; net.reach(ch, ex, ey, hd, tx, ty, L + 30, true);
      if (ch.joined && ch.pts.length >= 4) outposts.push({ x: tx, y: ty, a: hd, ch }); else streets.pop();
    }
    A.TownRoads.clean(streets, net); let nA = streets.length;
    if (tr) tr('paths', { streets });
    // ---- стіна
    const wmat = fort ? null : tier >= 3 ? 'stone' : tier === 2 ? (r() < 0.75 ? 'stone' : 'palisade') : tier === 1 ? (r() < 0.4 + Math.min(0.3, popEff / 2500) ? 'palisade' : null) : (r() < 0.35 ? 'fence' : null), walled = !!wmat, wt = wmat === 'stone' ? [0, 0, 6, 10, 14][tier] : wmat === 'palisade' ? 3 : 1.4, Rw = R * 0.8, wph = r() * TAU, wallR0 = th => Rw * (1 + 0.09 * Math.sin(2 * th + wph) + 0.06 * Math.sin(3 * th + 2 * wph) + 0.035 * Math.sin(5 * th + 3 * wph)), wallR = th => { if (!wallBins) return wallR0(th); const n = wallBins.length, u = (((th / TAU) % 1) + 1) % 1 * n, i = Math.floor(u) % n, t = u - Math.floor(u); return wallBins[i] * (1 - t) + wallBins[(i + 1) % n] * t; }, inWall = (x, y) => d0(x, y) < wallR(Math.atan2(y - y0, x - x0));
    let wallBins = null;
    // стіна йде впритул за найдальшим від центру кільцем вулиць (кільце лежить усередині міста під стіною); де кільце розірване, радіус інтерполюється, а воду стіна обходить сама
    let ringWall = false;
    if (walled) {
      const rings = streets.filter(q => q.kind === 'ring' && q.pts.length >= 4), mean = q => { let t = 0, n = 0; for (let i = 0; i < q.pts.length; i += 2) { t += d0(q.pts[i], q.pts[i + 1]); n++; } return t / n; };
      if (rings.length) {
        const ms = rings.map(mean), top = Math.max(...ms), outer = rings.filter((q, i) => ms[i] > top * 0.85), NB = 120, bins = new Array(NB).fill(0);
        for (const q of outer) { const p = q.pts; for (let i = 2; i < p.length; i += 2) { const L = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]), m = Math.max(1, Math.ceil(L / 6)); for (let j = 0; j <= m; j++) { const x = p[i - 2] + (p[i] - p[i - 2]) * j / m, y = p[i - 1] + (p[i + 1] - p[i - 1]) * j / m, b = Math.floor((((Math.atan2(y - y0, x - x0) / TAU) % 1) + 1) % 1 * NB), v = d0(x, y) + q.hw + wt / 2 + 1; if (v > bins[b]) bins[b] = v; } } }
        const have = bins.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);
        if (have.length >= 3) { // порожні сектори (розрив кільця) заповнюються лінійно між найближчими заповненими
          for (let i = 0; i < NB; i++) if (!bins[i]) { let a = i, b = i, da = 0, db = 0; while (!bins[((a % NB) + NB) % NB]) { a--; da++; } while (!bins[b % NB]) { b++; db++; } const va = bins[((a % NB) + NB) % NB], vb = bins[b % NB]; bins[i] = (va * db + vb * da) / (da + db); }
          wallBins = bins; ringWall = true;
        }
      }
    }
    // ---- райони: опорні точки (вага менша → район більший)
    const plan = fort ? FORT_PLAN : (tier === 1 ? (popEff >= 250 ? PLANS[1] : []) : PLANS[tier]).filter(k => k !== 'port' || (s.port && shore.length)), anchors = [], land = (x, y) => WK(x, y) === 0;
    const ring = (f, jit) => { const o = []; const ph = r() * TAU; for (let k = 0; k < 18; k++) { const a = ph + k / 18 * TAU, rr = R * f * (1 + (r() - 0.5) * jit), x = x0 + Math.cos(a) * rr, y = y0 + Math.sin(a) * rr; if (land(x, y)) o.push([x, y]); } return o; };
    for (const kind of plan) {
      if (kind === 'suburb' || kind === 'outskirts') continue; let p = null, wt = 1;
      if (kind === 'centre') { p = [x0, y0]; wt = 0.9; }
      else if (kind === 'port') { const c = shore.filter(q => q.d < R); p = c.length ? c[Math.floor(r() * c.length)] : null; if (p) p = [p.x, p.y]; wt = 1.3; }
      else if (kind === 'castle') { let b = -1; for (const q of ring(0.55, 0.3)) { const sc = env.elevAt(q[0], q[1]) + r() * 0.1; if (sc > b) { b = sc; p = q; } } wt = 1.9; }
      else { let bs = -1; for (const q of ring(kind === 'poor' ? 0.72 : 0.5, 0.4)) { let m = 1e9; for (const a of anchors) m = Math.min(m, Math.hypot(a.x - q[0], a.y - q[1])); const sc = m + r() * 20; if (sc > bs) { bs = sc; p = q; } } }
      if (p) anchors.push({ kind, x: p[0], y: p[1], wt });
    }
    const rampIdx = fort ? anchors.push({ kind: 'rampart', x: fort.at(fort.u(x0, y0), 44)[0], y: fort.at(fort.u(x0, y0), 44)[1], wt: 1 }) - 1 : -1; // оборонний район: уся смуга вздовж стіни
    const outerKind = plan.includes('suburb') ? 'suburb' : plan.includes('outskirts') ? 'outskirts' : null;
    const districtOf = (x, y) => {
      if (!anchors.length) return -1; if (rampIdx >= 0 && fort.sd(x, y) < A.TownFort.DEEP) return rampIdx; const d = d0(x, y);
      if (outerKind && (walled ? !inWall(x, y) : d > R * (outerKind === 'outskirts' ? 0.62 : 0.84))) return anchors.length;
      let b = 0, bd = 1e9; anchors.forEach((a, k) => { const q = Math.hypot(a.x - x, a.y - y) * a.wt; if (q < bd) { bd = q; b = k; } }); return b;
    };
    const kindOf = id => id < 0 ? null : id >= anchors.length ? outerKind : anchors[id].kind;
    if (tr) tr('districts', { anchors, outerKind, walled, wallR });
    // ---- нерухомі об'єкти: площі, парки, цвинтар
    const F = [], B = [], bgrid = new Map(), BK = 24, props = [], bkeys = b => { const o = []; const rad = Math.hypot(b.w, b.h) / 2; for (let gx = Math.floor((b.x - rad) / BK); gx <= Math.floor((b.x + rad) / BK); gx++) for (let gy = Math.floor((b.y - rad) / BK); gy <= Math.floor((b.y + rad) / BK); gy++) o.push(gx * 100003 + gy); return o; };
    const addB = b => { b.id = B.length; B.push(b); for (const k of bkeys(b)) (bgrid.get(k) || bgrid.set(k, []).get(k)).push(b.id); return b; };
    const blockedBase = (x, y) => { for (const f of F) if ((f.t === 'site' || f.t === 'park' || f.t === 'pond') && Math.hypot(f.x - x, f.y - y) < f.r * (f.t === 'site' ? 0.95 : 0.9) + 2) return true; for (const b of B) if (Math.abs(b.x - x) < 60 && rectHit(b, x, y, 3)) return true; return false; };
    net.blocked = fort ? (x, y) => fort.sd(x, y) < A.TownFort.BELT - 4 || blockedBase(x, y) : blockedBase;
    const circleFree = (x, y, rad, gapm) => { for (const k of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (WK(x + k[0] * rad, y + k[1] * rad) !== 0) return false; for (const f of F) if (Math.hypot(f.x - x, f.y - y) < f.r + rad + (gapm == null ? 6 : gapm)) return false; return true; };
    const streetPtNear = (ax, ay) => { let best = null, bd = 1e9; for (const st of streets) for (let i = 0; i < st.pts.length; i += 2) { const d = Math.hypot(st.pts[i] - ax, st.pts[i + 1] - ay); if (d < bd && d0(st.pts[i], st.pts[i + 1]) < R) { bd = d; best = [st.pts[i], st.pts[i + 1]]; } } return best; };
    const stemFor = kind => pick(r, X.stems(kind || 'centre'));
    const addPlaza = (kind, x, y, rad, nm) => { F.push({ t: 'plaza', x, y, r: rad, kind, name: nm || stemFor(kind) + 'а площа' }); };
    if (tier >= 1) { const pr = [16, 16, 28, 38, 46][tier]; if (circleFree(x0, y0, pr, 0)) { addPlaza('centre', x0, y0, pr, tier === 1 ? 'Майдан' : 'Головна площа'); if (tier >= 2) props.push({ t: 'fountain', x: x0, y: y0, r: 4.5, name: 'Фонтан «' + cname() + '»' }); else props.push({ t: 'well', x: x0, y: y0, r: 1.8, name: 'Громадський колодязь' }); if (tier >= 3) props.push({ t: 'monument', x: x0 + pr * 0.55, y: y0 - pr * 0.3, r: 2.5, name: 'Пам’ятник ' + pick(r, MONU) }); } }
    else props.push({ t: 'well', x: x0, y: y0, r: 1.8, name: 'Колодязь хутора' });
    anchors.forEach(a => { if (tier < 2 || (a.kind !== 'trade' && a.kind !== 'temple' && !(a.kind === 'port' && tier >= 3))) return; const p = streetPtNear(a.x, a.y); if (p && circleFree(p[0], p[1], 22, 4)) { addPlaza(a.kind, p[0], p[1], a.kind === 'trade' ? 26 : 20, a.kind === 'trade' ? 'Ринкова площа' : a.kind === 'port' ? 'Портова площа' : 'Храмова площа'); if (a.kind === 'temple' && tier >= 3) props.push({ t: 'monument', x: p[0], y: p[1], r: 2.5, name: 'Пам’ятник ' + pick(r, MONU) }); } });
    if (tier >= 2) for (let n = [0, 0, 1 + (r() < 0.5), 3 + (r() < 0.5), 5 + (r() < 0.5)][tier] | 0, tries = 0; n > 0 && tries < 80; tries++) { const a = r() * TAU, d = R * (0.15 + 0.7 * r()), x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d, rad = 22 + r() * 24, k = kindOf(districtOf(x, y)); if (k === 'poor' || k === 'craft' || k === 'port' || !circleFree(x, y, rad, 14)) continue; F.push({ t: 'park', x, y, r: rad, kind: k, name: pick(r, ['Парк', 'Сад', 'Гай', 'Скверик']) + ' «' + cname() + '»' }); n--; }
    const sites = [], usedKinds = [];
    let dgn = 0; const placeSite = (o, small, depth, pre) => {
      let u0 = 0; const ca = Math.cos(o.a), sa = Math.sin(o.a), S = pre ? pre.S : 1.9, Wd = (u, v) => { u = (u - u0) * S; v *= S; return [o.x + u * ca - v * sa, o.y + u * sa + v * ca]; };
      for (let tr = 0; tr < (pre ? 1 : 4); tr++) {
        const sp = pre ? pre.spec : A.TownSites.make(r, { tier, small, ban: usedKinds.slice(-2) }); u0 = pre ? 0 : Math.min(...sp.ground.map(g => Math.min(...g.pts.filter((_, i) => i % 2 === 0)))); const cm = Wd(sp.ext * 0.5, 0), en = Wd(sp.ext, 0);
        if (WK(cm[0], cm[1]) !== 0 || WK(en[0], en[1]) !== 0 || (!pre && B.some(b => Math.hypot(b.x - cm[0], b.y - cm[1]) < sp.ext * S * 0.8 + Math.max(b.w, b.h) / 2)) || (!pre && (sp.ground.some(g => { for (let i = 0; i < g.pts.length; i += 2) { const w = Wd(g.pts[i], g.pts[i + 1]); if (WK(w[0], w[1]) !== 0) return true; } return false; }) || streets.some(st => st !== o.ch && st.id !== (o.ch ? o.ch.parent : -9) && (() => { for (let i = 2; i < st.pts.length; i += 2) if (env.segDist(cm[0], cm[1], st.pts[i - 2], st.pts[i - 1], st.pts[i], st.pts[i + 1]) < sp.ext * S * 0.5) return true; return false; })()))) || (!pre && F.some(f => f.t === 'site' && Math.hypot(f.x - cm[0], f.y - cm[1]) < f.r + sp.ext * S * 0.6))) continue;
        usedKinds.push(sp.kind);
        const pts = p => { const q = []; for (let i = 0; i < p.length; i += 2) { const w = Wd(p[i], p[i + 1]); q.push(w[0], w[1]); } return q; };
        const f = { t: 'site', kind: sp.kind, history: sp.history, x: cm[0], y: cm[1], r: sp.ext * S * 0.55, name: sp.name, sub: sp.sub, text: sp.text, rows: sp.rows, state: sp.state, paths: (sp.paths || []).map(q => ({ pts: pts(q.pts), w: q.w })), ground: sp.ground.map(g => ({ pts: pts(g.pts), col: g.col, edge: g.edge })), walls: sp.walls.map(w => ({ pts: pts(w.pts), w: w.w * (pre ? 1 : 1.4), col: w.col })), decos: sp.decos.map(d => { const w = Wd(d.u, d.v); return { t: d.t, x: w[0], y: w[1], r: (d.r || 1) * (pre ? 1 : S * 0.8), a: o.a + (d.rot || 0) }; }) };
        F.push(f); sites.push(f);
        sp.bl.forEach(q => { const w = Wd(q.u, q.v); if (WK(w[0], w[1]) !== 0) return; addB({ type: q.type, x: w[0], y: w[1], w: q.w * (pre ? 1 : S * 0.8), h: q.h * (pre ? 1 : S * 0.8), a: o.a + (q.rot || 0), st: -1, side: 1, far: 999, site: sp.name, pname: q.name, pdesc: q.desc || null, fixcond: q.cond || null, dungeon: q.dungeon || q.type === 'dungeon' ? { id: 'dg-' + s.id + '-' + (++dgn), kind: q.type } : null }); });
        sp.props.forEach(q => { const w = Wd(q.u, q.v); props.push({ t: q.t, x: w[0], y: w[1], r: q.r * (pre ? 1 : S * 0.8), name: q.name }); });
        if (!pre) for (let i = 0, n = 10 + Math.round(sp.ext / 6); i < n; i++) { const w = Wd(sp.ext * (-0.1 + 1.2 * r()), (r() - 0.5) * sp.ext * 1.3); if (WK(w[0], w[1]) === 0 && !B.some(b => Math.hypot(b.x - w[0], b.y - w[1]) < Math.max(b.w, b.h) * 0.8)) f.decos.push({ t: 'tree', x: w[0], y: w[1], r: 3.5 + r() * 3, a: 0 }); }
        if (o.ch) o.ch.to = sp.name;
        if (sp.exit && depth < 1 && tier >= 1 && r() < 0.65) { const ex = Wd(sp.exit[0], sp.exit[1]), hd = o.a + (r() - 0.5) * 1.1, L = 110 + r() * 90, tx = ex[0] + Math.cos(hd) * L, ty = ex[1] + Math.sin(hd) * L, ch = mkSt('path', 3.6, o.ch ? o.ch.id : -1); net.reach(ch, ex[0], ex[1], hd, tx, ty, L + 30, true); if (ch.joined && ch.pts.length >= 4) { if (!placeSite({ x: tx, y: ty, a: hd, ch }, true, depth + 1)) { streets.pop(); } } else streets.pop(); }
        return sp.name;
      } return null;
    };
        const pondPoly = (x, y, rad) => { const p = [], ph = r() * TAU, a2 = 0.12 + r() * 0.15, a3 = r() * 0.12; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k2 = 1 + a2 * Math.sin(2 * a + ph) + a3 * Math.sin(3 * a + 2 * ph); p.push(x + Math.cos(a) * rad * k2 * 1.15, y + Math.sin(a) * rad * k2 * 0.85); } return p; };
    const addPond = (x, y, rad, nm, why) => { F.push({ t: 'pond', x, y, r: rad * 1.25, rad, poly: pondPoly(x, y, rad), name: nm, why }); };
    F.filter(f => f.t === 'park').forEach(f => { if (r() < 0.55) { const rad = f.r * (0.28 + r() * 0.14), a = r() * TAU, x = f.x + Math.cos(a) * f.r * 0.22, y = f.y + Math.sin(a) * f.r * 0.22; addPond(x, y, rad, 'Парковий ставок «' + cname() + '»', 'park'); } else if (tier >= 2) props.push({ t: 'fountain', x: f.x, y: f.y, r: 3.2, name: 'Фонтан «' + cname() + '»' }); });
    if (tier >= 1 && (tier >= 2 || popEff >= 200)) for (let cn = 0, ncem = tier >= 4 ? 2 : 1; cn < ncem; cn++) {
      const nk = clamp((popEff < 60 ? 0 : popEff < 200 ? 1 : popEff < 700 ? 2 : popEff < 2500 ? 3 : 4) - cn, 0, 4), spec = A.TownSites.graveyard(r, nk, { nm: cname(), nm2: cname() }), rad = Math.hypot(spec.hl, spec.hw) + 4;
      for (let tries = 0; tries < 50; tries++) { const a = r() * TAU, d = walled ? wallR(a) + wt / 2 + rad + 12 + r() * 40 : R * (0.8 + 0.4 * r()), x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d;
        if (!circleFree(x, y, rad, 10) || near(x, y, rad + 8, -1, -2) < rad + 4) continue;
        let q = null, qd = 1e9; for (const st of streets) { if (st.kind === 'path') continue; for (let i = 0; i < st.pts.length; i += 2) { const dd = Math.hypot(st.pts[i] - x, st.pts[i + 1] - y); if (dd < qd) { qd = dd; q = [st.pts[i], st.pts[i + 1]]; } } } if (!q || qd > 220) continue;
        const ang = Math.atan2(y - q[1], x - q[0]), ox = x - Math.cos(ang) * spec.hl, oy = y - Math.sin(ang) * spec.hl, nsite = sites.length;
        if (placeSite({ x: ox, y: oy, a: ang }, false, 1, { spec, S: 1 })) { const f = sites[nsite]; f.r = rad; f.x = x; f.y = y; f.paths.push({ pts: A.TownPaths.bend(q[0], q[1], ox, oy), w: 2 }); break; } }
    }
    if (tr) tr('features', { F });
    // ---- замок (обласне місто, столиця): ділянка вирізається з готового плану; мур, комплекс споруд, ворота й дороги до них (core/castle*.js); до фронтажу, щоб вулиці всередині замку зникли
    let keep = null;
    if (tier >= 3) { keep = A.TownKeep.build({ seed, sid: s.id, tier, R, x0, y0, WK, net, streets, nA, F, B, addB, props, walled, wallR, wtCity: wt, fort, anchor: anchors.find(a => a.kind === 'castle'), fate, cname, hilly: ['hills', 'mountain', 'peaks'].includes((A.Danger && A.Danger.groupName(W, s.i)) || 'grass') ? 1 : 0 }); if (keep) { nA = keep.nA; if (fate === 'occupied') for (const id of keep.ids) { const b = B[id]; if (b.type === 'donjon' || b.type === 'palas') { b.keepLair = true; b.inhab = b.type === 'donjon' ? 14 : 9; } } } }
    if (tr && keep) tr('castle', { keep, streets, F });
    // ---- місця під забудову вздовж вулиць (фронтаж)
    streets.forEach(st => { if (st.kind === 'embankment' || st.kind === 'avenue') return; const b = st.br, n = st.pts.length / 2; for (let i = 0; i < n; i++) if (!b[i] && WK(st.pts[i * 2], st.pts[i * 2 + 1]) === 2 && ((i > 0 && b[i - 1]) || (i < n - 1 && b[i + 1]))) b[i] = 1; }); // кінець вулиці у воді поряд із мостом теж частина мосту
    streets.forEach(st => { if (st.kind === 'embankment' || st.kind === 'avenue' || st.kind === 'ring') return; for (let g = 0; g < 4 && st.br.length > 3; g++) { const p = st.pts, n = p.length / 2; if (!st.br[0] && WK(p[0], p[1]) === 2) { p.splice(0, 2); st.br.shift(); } else if (!st.br[n - 1] && WK(p[n * 2 - 2], p[n * 2 - 1]) === 2) { p.length -= 2; st.br.length -= 1; } else break; } }); // кінець вулиці, що потрапив у воду без мосту, відрізаємо
    const lots = []; streets.forEach(st => { if (st.kind === 'path') return; const p = st.pts; for (let i = 2; i < p.length; i += 2) { if (st.br[i / 2]) continue; const L = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]), a = Math.atan2(p[i + 1] - p[i - 1], p[i] - p[i - 2]); for (let t = 0; t < L; t += 9) for (const sd of [1, -1]) { const x = p[i - 2] + Math.cos(a) * t, y = p[i - 1] + Math.sin(a) * t; if (st.kind === 'embankment' && ((x0 - x) * -Math.sin(a) + (y0 - y) * Math.cos(a)) * sd < 0) continue; lots.push({ x, y, a, nx: -Math.sin(a) * sd, ny: Math.cos(a) * sd, hw: st.hw, st: st.id, d: d0(x, y) }); } } });
    // ---- розміщення споруд
    const tierOk = id => (GATE[id] || 0) <= tier;
    const canPlace = (b, big, noSt) => {
      if (d0(b.x, b.y) > R * 1.12 + (b.far || 0)) return false;
      if (keep && !b.keep && A.TownKeep.clash(keep, b)) return false;
      if (walled && !b.far) { const bw = (x, y) => Math.abs(d0(x, y) - wallR(Math.atan2(y - y0, x - x0))) < wt / 2 + 3.5; if (bw(b.x, b.y)) return false; for (const c of rectCorners(b, 0)) if (bw(c[0], c[1])) return false; }
      const cs = rectCorners(b, 0); if (WK(b.x, b.y) !== 0) return false; for (const c of cs) if (WK(c[0], c[1]) !== 0) return false;
      for (const f of F) { if (Math.hypot(f.x - b.x, f.y - b.y) < f.r + Math.hypot(b.w, b.h) / 2 + 1 && (f.t !== 'plaza' || true)) { if (rectHit(b, f.x, f.y, f.r)) return false; } }
      const nx = Math.max(2, Math.ceil(b.w / 9)), ny = Math.max(2, Math.ceil(b.h / 9)), c = Math.cos(b.a), sn = Math.sin(b.a);
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) { const u = (i / nx - 0.5) * b.w, v = (j / ny - 0.5) * b.h; if (!noSt && near(b.x + c * u - sn * v, b.y + sn * u + c * v, 8 + (big ? 6 : 0), -1, -2) < 1) return false; }
      const pp = b.type === 'slum' ? 0.5 : 1.6, pad = { x: b.x, y: b.y, w: b.w + pp, h: b.h + pp, a: b.a }, rad = Math.hypot(b.w, b.h) / 2 + 4;
      for (let gx = Math.floor((b.x - rad) / BK); gx <= Math.floor((b.x + rad) / BK); gx++) for (let gy = Math.floor((b.y - rad) / BK); gy <= Math.floor((b.y + rad) / BK); gy++) { const g = bgrid.get(gx * 100003 + gy); if (g) for (const id of g) { const o = B[id]; if (Math.abs(o.x - b.x) < rad + o.w && Math.abs(o.y - b.y) < rad + o.w && overlap(pad, o)) return false; } }
      return true;
    };
    const mkB = (id, lot, sc) => { const t = T[id], j = () => 0.88 + r() * 0.27, w = t.w * j() * (sc || 1), h = t.h * j() * (sc || 1), off = lot.hw + (lot.d > R * 0.7 ? 4.5 : 2.6) + h / 2; return { type: id, x: lot.x + lot.nx * off, y: lot.y + lot.ny * off, w, h, a: lot.a, st: lot.st, side: lot.nx * -Math.sin(lot.a) + lot.ny * Math.cos(lot.a) > 0 ? 1 : -1 }; };
    const pool = kind => { const base = (K[kind || 'outskirts'] || K.outskirts).pool, o = {}; for (const k in base) if (tierOk(k)) o[k] = base[k]; return o; };
    const wsum = p => Object.values(p).reduce((a, b) => a + b, 0), pickW = p => { let q = r() * wsum(p); for (const k in p) { q -= p[k]; if (q <= 0) return k; } return Object.keys(p)[0]; };
    const placeNear = (id, ax, ay, maxD, inKeep) => {
      const cand = lots.filter(l => Math.hypot(l.x - ax, l.y - ay) < maxD).sort((p, q) => Math.hypot(p.x - ax, p.y - ay) - Math.hypot(q.x - ax, q.y - ay));
      for (let i = 0; i < cand.length && i < 400; i++) { const b = mkB(id, cand[i], 1); if (inKeep) b.keep = true; if (canPlace(b, true)) { b.uniq = true; return addB(b); } } return null;
    };
    const gatePts = streets.filter(st => st.kind === 'avenue').map(st => { const a = st.gate; const rr = walled ? wallR(a) * 0.9 : R * 0.85; return [x0 + Math.cos(a) * rr, y0 + Math.sin(a) * rr]; });
    // фортеця: оборонна лінія вздовж стіни займає місце раніше за решту (бастіони, метальні машини, вежі, надбрамні твердині)
    if (fort) A.TownFort.line(fort, { r, addB, canPlace, T, U: Ufort, uc: fort.u(x0, y0) });
    for (const [id, where, mt] of fort ? UNIQ_FORT : UNIQ) {
      if (mt > tier || (id === 'temple' && where === 'centre' && tier >= 3) || (id === 'tavern' && where === 'port' && !anchors.some(a => a.kind === 'port')) || (id === 'tavern' && where === 'centre' && tier >= 2)) continue;
      let ax = x0, ay = y0, maxD = tier >= 3 ? 120 : 160; if (where === 'gate') { if (!gatePts.length) continue; const g = gatePts[Math.floor(r() * gatePts.length)]; ax = g[0]; ay = g[1]; maxD = 90; } else if (where !== 'centre') { const a = anchors.find(q => q.kind === where); if (!a) continue; ax = a.x; ay = a.y; maxD = 140; }
      if (id === 'hall' && tier >= 2) { const f = F[0]; if (f) { ax = f.x; ay = f.y; } }
      placeNear(id, ax, ay, maxD);
    }
    // ---- кінець вулиці за містом: майданчик (торг, хутір, роздоріжжя) із кількома спорудами
    outposts.forEach(o => { const p = o.ch.pts; for (let i = 0; i < p.length; i += 2) { const f = sites.find(q => Math.hypot(p[i] - q.x, p[i + 1] - q.y) < q.r * 0.95); if (f) { o.ch.pts.length = Math.max(4, i + 2); o.ch.br.length = o.ch.pts.length / 2; o.ch.to = f.name; o.done = true; break; } } if (o.done) return;
      if (placeSite(o, false, 0)) return; if (sites.some(f => Math.hypot(f.x - o.x, f.y - o.y) < f.r * 1.3)) { o.ch.to = o.ch.to || sites[0].name; return; }
      const nm = pick(r, ['Польовий торг', 'Караванний майдан', 'Роздоріжжя з колодязем']); F.push({ t: 'plaza', x: o.x, y: o.y, r: 15, kind: 'outskirts', name: nm }); props.push({ t: 'well', x: o.x, y: o.y, r: 1.8, name: 'Колодязь: ' + nm.toLowerCase() }); o.ch.to = nm; });
    A.TownRoads.late(streets, nA, F.filter(f => f.t === 'site'), net);
    // порт: причали, кораблі, маяк
    const piers = [], ships = [];
    if (shore.length && (s.port || tier <= 1) && tier >= 1 && !fate) {
      const nP = s.port ? clamp(Math.round(shore.length / 6), 2, tier >= 3 ? 14 : 7) : 1 + (r() < 0.5);
      for (let k = 0; k < nP; k++) { const q = shore[Math.floor((k + 0.5) / nP * shore.length)], len = 26 + r() * 30, a = Math.atan2(q.ny, q.nx), x1 = q.x + q.nx * 12, y1 = q.y + q.ny * 12, x2 = q.x + q.nx * (12 + len), y2 = q.y + q.ny * (12 + len); if (WK(x2, y2) !== 2) continue; piers.push({ x1, y1, x2, y2, a }); if (s.port && r() < 0.85) ships.push({ x: x2 - q.nx * len * 0.5 - q.ny * 8 + q.ny * 0, y: y2 - q.ny * len * 0.5 + q.nx * 8, a, len: 12 + r() * 14, w: 4 + r() * 3 }); }
      if (s.port && tier >= 3) { const q = shore[Math.floor(r() * shore.length)]; const b = { type: 'lighthouse', x: q.x + q.nx * 6, y: q.y + q.ny * 6, w: 6, h: 6, a: 0, st: -1, side: 1, uniq: true }; if (WK(b.x, b.y) === 0 && !(keep && A.TownKeep.clash(keep, b, 2))) addB(b); }
    }
    // загальна забудова за фронтажем
    const order = lots.slice().sort((p, q) => (p.d + r() * 22) - (q.d + r() * 22)), cap = Math.round(target * 1.08), pools = {};
    const poolOf = id => pools[id] || (pools[id] = pool(kindOf(id)));
    const pushTypeFor = (x, y, id) => { const kind = kindOf(id), p = poolOf(id); if (tier === 0 || !Object.keys(p).length) return pickW(pool(kind || (tier ? 'outskirts' : 'outskirts'))); return pickW(p); };
    const lastId = {}, RES = new Set(['house', 'rich', 'estate', 'slum', 'farmstead', 'shop', 'bakery', 'weaver', 'smith', 'warehouse']);
    for (const lot of order) {
      if (B.length >= cap) break; if (r() < (tier <= 2 ? 0.1 : 0.05) + 0.3 * Math.min(1, lot.d / R) ** 3) continue;
      const did = districtOf(lot.x, lot.y), lkey = lot.st + '|' + (lot.nx * -Math.sin(lot.a) + lot.ny * Math.cos(lot.a) > 0 ? 1 : -1); let id = lastId[lkey] && RES.has(lastId[lkey]) && r() < 0.62 && tierOk(lastId[lkey]) ? lastId[lkey] : pushTypeFor(lot.x, lot.y, did), b = mkB(id, lot, 1), ok = canPlace(b);
      for (let t = 0; !ok && t < 2; t++) { id = pickW(pool(kindOf(did) === 'port' ? 'port' : 'outskirts')); b = mkB(id, lot, 1); ok = canPlace(b); }
      if (ok) { addB(b); lastId[lkey] = id; }
    }
    // двори між вулицями: менші споруди без прямого виходу на вулицю
    for (let tries = 0, lim = tier <= 1 ? 0 : Math.max(0, cap - B.length) * (tier === 2 ? 3 : 6); tries < lim && B.length < cap; tries++) {
      const a = r() * TAU, d = Math.sqrt(r()) * R * 1.02, x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d; if (WK(x, y) !== 0) continue; const nd = near(x, y, 60, -1, -2); if (nd > 60 || nd < 6) continue; const q = near.q, ang = Math.atan2(q.by - q.ay, q.bx - q.ax);
      const p = Object.assign({}, poolOf(districtOf(x, y))); for (const k of Object.keys(p)) if (T[k].w > 16 || T[k].h > 18) delete p[k]; if (!Object.keys(p).length) continue;
      const id = pickW(p), t = T[id], b = { type: id, x, y, w: t.w * (0.85 + 0.2 * r()), h: t.h * (0.85 + 0.2 * r()), a: ang, st: q.st, side: 1 }; if (canPlace(b)) addB(b);
    }
    // окуповане місто живе своїм ладом: заселені споруди, монстрячі заміни й додатки (зала вождя, яма, клітки, вежі з черепами)
    const lairSet = fate === 'occupied' ? A.TownMon.apply({ B, r, s, tier, x0, y0, R, d0, anchors, placeNear, tryB: b => canPlace(b, false, true) ? addB(b) : null }) : null;
    if (tr) tr('buildings', { B, F, piers, ships });
    // ---- райони: порожні відкидаємо, перенумеровуємо
    const used = new Set(B.map(b => districtOf(b.x, b.y))); const idMap = new Map(); const dst = []; for (let k = 0; k <= anchors.length; k++) { if (!used.has(k) || k < 0) continue; const kind = kindOf(k); if (!kind) continue; idMap.set(k, dst.length); const st = X.DSTAT[kind] || X.DSTAT.outskirts; dst.push({ id: dst.length, kind, name: '', col: K[kind].col, text: K[kind].d, x: k < anchors.length ? anchors[k].x : x0, y: k < anchors.length ? anchors[k].y : y0, pop: 0, nb: 0, cats: {}, types: {}, notable: [], streets: [], wealth: st[0], safety: st[1], vibe: st[2], raw: k }); }
    const distId = (x, y) => { const k = districtOf(x, y); return idMap.has(k) ? idMap.get(k) : -1; };
    dst.forEach(d => { d.name = K[d.kind].n + (tier >= 2 && d.kind !== 'suburb' ? ' «' + cname() + '»' : ''); }); if (mon) A.TownMon.districts(dst);
    // ---- назви вулиць
    const used2 = new Set(), nb = {}; W.settlements.forEach(q => { if (q.id !== s.id && !q.ruined && q.landmass === s.landmass && Math.hypot(q.x - s.x, q.y - s.y) < 60) { (nb.list = nb.list || []).push(q); } });
    const nameSt = (st, kind) => {
      const ST = X.stems(kind || 'centre'), end = { avenue: 'вулиця', street: 'вулиця', ring: 'вулиця', embankment: 'набережна', lane: 'провулок', path: 'стежка' }[st.kind];
      for (let t = 0; t < 12; t++) { const stem = pick(r, ST), nm = end === 'стежка' ? stem + 'а стежка' : end === 'провулок' ? stem + 'ий провулок' : end === 'набережна' ? stem + 'а набережна' : stem + 'а вулиця'; if (!used2.has(nm)) { used2.add(nm); return nm; } }
      const nm = (end === 'провулок' ? 'Другий провулок ' : 'Нова вулиця ') + (used2.size + 1); used2.add(nm); return nm;
    };
    streets.forEach(st => {
      const mi = Math.floor(st.pts.length / 4) * 2, did = distId(st.pts[mi], st.pts[mi + 1]); st.district = did; const kind = did >= 0 ? dst[did].kind : (tier === 0 ? 'outskirts' : 'centre');
      if (st.kind === 'avenue') { let best = null, bd = 1e9; for (const q of nb.list || []) { const a = Math.atan2((q.y - s.y), (q.x - s.x)), df = Math.abs(Math.atan2(Math.sin(a - st.gate), Math.cos(a - st.gate))), d = Math.hypot(q.x - s.x, q.y - s.y); if (df < 0.5 && d < bd) { bd = d; best = q; } } st.name = best && !used2.has('Шлях на ' + best.name) ? 'Шлях на ' + best.name : nameSt(st, 'centre'); used2.add(st.name); }
      else if (st.kind === 'embankment') st.name = 'Набережна «' + cname() + '»'; else if (st.to) st.name = 'Дорога до «' + st.to + '»'; else st.name = nameSt(st, kind);
      st.len = 0; for (let i = 2; i < st.pts.length; i += 2) st.len += Math.hypot(st.pts[i] - st.pts[i - 2], st.pts[i + 1] - st.pts[i - 1]);
    });
    streets.forEach(st => { if (st.fname) st.name = st.fname; });
    F.forEach(f => { f.district = distId(f.x, f.y); });
    // ---- поля, дерева, табори, мури
    const gn = (A.Danger && A.Danger.groupName(W, s.i)) || 'grass', farmy = !['mountain', 'peaks', 'snow', 'desert', 'tundra', 'swamp'].includes(gn);
    const fields = farmy && !fate && !fort ? A.TownFields.make({ r, tier, R, Rmap, x0, y0, streets, WK, near, B, F, d0, rectCorners, overlap, warm: ['grass', 'steppe', 'savanna', 'hills', 'jungle'].includes(gn), inside: (x, y) => walled ? d0(x, y) < wallR(Math.atan2(y - y0, x - x0)) + wt / 2 + 6 : d0(x, y) < R * 0.98 }) : [];
    const trees = [], dens = { forest: 0.0016, taiga: 0.0016, jungle: 0.0018, hills: 0.0004, grass: 0.00012, steppe: 0.00004, savanna: 0.00008, mountain: 0.0002, swamp: 0.0006, peaks: 0.00004 }[gn] || 0.0001, ruinBoost = fate === 'ruined' ? 2.2 : 1;
    for (let tries = 0, nT = Math.min(1400, Math.round(Math.PI * Rmap * Rmap * dens * ruinBoost)); tries < nT * 3 && trees.length < nT; tries++) {
      const a = r() * TAU, d = Math.sqrt(r()) * Rmap, x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d; if (WK(x, y) !== 0 || near(x, y, 20, -1, -2) < 3 || (keep && A.TownKeep.inside(keep, x, y, 2))) continue; let ok = true; const gx = Math.floor(x / BK), gy = Math.floor(y / BK);
      for (let ix = gx - 1; ix <= gx + 1 && ok; ix++) for (let iy = gy - 1; iy <= gy + 1 && ok; iy++) { const g = bgrid.get(ix * 100003 + iy); if (g) for (const id of g) if (rectHit(B[id], x, y, 3)) { ok = false; break; } }
      for (const f of F) if (Math.hypot(f.x - x, f.y - y) < f.r + 2 && f.t !== 'park') ok = false; for (const f of fields) if (A.TownFields.inField(f, x, y)) ok = false; if (ok) trees.push({ x, y, r: 2.5 + r() * 3, c: gn === 'taiga' || gn === 'mountain' || r() < 0.2 ? 1 : 0 });
    }
    // гаї й живоплоти в проміжках між полями: купки дерев навколо кожної групи полів
    for (const cl of fields.clusters || []) for (let k = 0, n = Math.round(cl.r * cl.r / 90), tries = 0; k < n && tries < n * 4; tries++) { tries++; const a = r() * TAU, d = Math.sqrt(r()) * cl.r * 1.35, x = cl.x + Math.cos(a) * d, y = cl.y + Math.sin(a) * d;
      if (WK(x, y) !== 0 || near(x, y, 20, -1, -2) < 4 || (keep && A.TownKeep.inside(keep, x, y, 2)) || fields.some(f => A.TownFields.inField(f, x, y)) || F.some(q => Math.hypot(q.x - x, q.y - y) < q.r + 2) || B.some(b => Math.hypot(b.x - x, b.y - y) < Math.max(b.w, b.h))) continue; trees.push({ x, y, r: 2.5 + r() * 3, c: r() < 0.2 ? 1 : 0 }); k++; }
    for (const f of F) if (f.t === 'park') for (let k = 0, n = Math.round(f.r * f.r / 70); k < n; k++) { const a = r() * TAU, d = Math.sqrt(r()) * f.r * 0.92; trees.push({ x: f.x + Math.cos(a) * d, y: f.y + Math.sin(a) * d, r: 2.5 + r() * 2.5, c: 0 }); }
    // стіна малих поселень щільно охоплює забудову (радіус по секторах із запасом від споруд), а не величезне коло
    if (walled && tier <= 2 && B.length && !ringWall) {
      const NB = 36, info = B.filter(b => !b.far && !b.site).map(b => ({ a: Math.atan2(b.y - y0, b.x - x0), d: d0(b.x, b.y), s: Math.max(b.w, b.h) / 2 })), band = wt / 2 + 5, rr = [];
      for (let i = 0; i < NB; i++) { const ca = (i + 0.5) / NB * TAU, near2 = info.filter(q => Math.abs(Math.atan2(Math.sin(q.a - ca), Math.cos(q.a - ca))) < TAU / NB * 0.5 + q.s / Math.max(q.d, 8));
        let v = R * 0.3; for (const q of near2) if (q.d < R * 1.0) v = Math.max(v, q.d + q.s + band);
        for (let it = 0; it < 8; it++) { let ch = false; for (const q of near2) if (q.d + q.s + band > v && q.d - q.s - band < v) { v = q.d + q.s + band; ch = true; } if (!ch) break; } rr.push(v); }
      const sm = rr.map((v, i) => Math.max(v, (rr[(i + NB - 1) % NB] + v + rr[(i + 1) % NB]) / 3)); wallBins = sm.map((v, i) => Math.max(v, (sm[(i + NB - 1) % NB] + v + sm[(i + 1) % NB]) / 3));
    }
    if (tr) tr('nature', { fields, trees });
    const wall = { on: walled, mat: wmat, w: wt, R: Rw, ph: wph, runs: [], towers: [], gates: [] };
    if (walled) { let run = []; const N = 160; for (let k = 0; k <= N; k++) { const th = k / N * TAU, rr = wallR(th), x = x0 + Math.cos(th) * rr, y = y0 + Math.sin(th) * rr, ok = WK(x, y) === 0 && !(fate && fate !== 'occupied' && env.hash(k >> 2, si & 255, si) < 0.45) && !(fate === 'occupied' && env.hash(k >> 3, si & 255, si) < 0.15); if (ok) run.push(x, y); else { if (run.length >= 4) wall.runs.push(run); run = []; } if (ok && wmat === 'stone' && k % (tier >= 3 ? 8 : 12) === 0) wall.towers.push([x, y]); } if (run.length >= 4) wall.runs.push(run);
      streets.filter(st => st.kind !== 'embankment' && st.kind !== 'ring' && st.pts.length >= 4).forEach(st => { const p = st.pts; let cnt = 0; for (let i = 2; i < p.length && cnt < 2; i += 2) { const da = d0(p[i - 2], p[i - 1]) - wallR(Math.atan2(p[i - 1] - y0, p[i - 2] - x0)), db = d0(p[i], p[i + 1]) - wallR(Math.atan2(p[i + 1] - y0, p[i] - x0)); if ((da < 0) !== (db < 0)) { const t = da / (da - db), x = p[i - 2] + (p[i] - p[i - 2]) * t, y = p[i - 1] + (p[i + 1] - p[i - 1]) * t; if (WK(x, y) !== 0 && !st.br[i / 2]) continue; if (!wall.gates.some(q => Math.hypot(q.x - x, q.y - y) < 18)) wall.gates.push({ x, y, a: Math.atan2(p[i + 1] - p[i - 1], p[i] - p[i - 2]), hw: st.hw, main: st.kind === 'avenue', name: (st.kind === 'avenue' ? 'Брама «' + st.name.replace(/^Шлях на /, 'на ') : 'Хвіртка «' + st.name.replace(/^(вулиця|Вулиця) /, '')) + '»' }); cnt++; } } }); }
    if (fort) Object.assign(wall, A.TownFort.wall(fort, Rmap));
    if (tr) tr('wall', { wall });
    // ---- сади й дерева в кварталах: за будинками, подалі від вулиць
    if (tier >= 1) for (let i = 0, n = Math.round(B.length * 0.45), tries = 0; i < n && tries < n * 6; tries++) { const b = B[Math.floor(r() * B.length)]; if (!b || b.site || b.st < 0 || !['house', 'rich', 'estate', 'farmstead', 'slum'].includes(b.type)) continue;
      const sd = b.side > 0 ? 1 : -1, st = streets[b.st], bx = b.x + Math.cos(b.a + Math.PI / 2 * sd) * (b.h / 2 + 3.5 + r() * 4), by = b.y + Math.sin(b.a + Math.PI / 2 * sd) * (b.h / 2 + 3.5 + r() * 4), sx = bx + (r() - 0.5) * b.w, sy = by + (r() - 0.5) * 4;
      if (WK(sx, sy) !== 0 || near(sx, sy, 12, -1, -2) < 3 || B.some(o => Math.hypot(o.x - sx, o.y - sy) < Math.max(o.w, o.h) * 0.6 + 2) || F.some(f => f.t !== 'park' && Math.hypot(f.x - sx, f.y - sy) < f.r)) continue; trees.push({ x: sx, y: sy, r: 1.8 + r() * 1.6, c: 0 }); i++; }
    // ---- ставки: біля ферм і млинів на околицях, трохи осторонь вулиць і будинків
    if (tier >= 1) { const cand = B.filter(b => ['farm', 'farmstead', 'mill', 'windmill', 'estate', 'rich'].includes(b.type) && !b.site && d0(b.x, b.y) > R * 0.55).sort(() => r() - 0.5); let np = Math.min(cand.length, 1 + Math.round(tier * 0.8));
      for (const b of cand) { if (np <= 0) break; const a = r() * TAU, rad = 7 + r() * 8, d = Math.max(b.w, b.h) / 2 + rad + 6, x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d;
        const ok = WK(x, y) === 0 && WK(x + rad, y) === 0 && WK(x - rad, y) === 0 && !B.some(o => Math.hypot(o.x - x, o.y - y) < rad * 1.3 + Math.max(o.w, o.h) / 2 + 3) && near(x, y, rad + 6, -1, -2) > rad + 4 && !F.some(f => Math.hypot(f.x - x, f.y - y) < f.r + rad + 2);
        if (ok) { addPond(x, y, rad, (b.type === 'mill' || b.type === 'windmill' ? 'Млинова ' : b.type === 'farm' ? 'Господарський ' : 'Садибний ') + 'ставок', b.type); np--; } } }
    // ---- стежки: двори між вулицями, ферми, колодязі, хутори й поля з'єднані з дорогами (core/townpaths.js); дерева на стежках прибираються
    const tp = fate !== 'ruined' && !fort ? A.TownPaths.make({ r: A.Rng.stream(seed, 'trails|' + s.id), tier, R, Rmap, x0, y0, streets, B, F, props, fields, WK, wall, blocked: keep ? (x, y) => A.TownKeep.inside(keep, x, y, 2) : null }) : null;
    if (tp) trees.splice(0, trees.length, ...A.TownPaths.clearTrees(tp, trees));
    // ---- склад споруд: імена, стан, мешканці, описи
    const rampN = {}, camps = [], addrN = {}, base = { hamlet: 1, village: 1, town: 1, regional: 1, capital: 1 };
    let sumPop = 0; B.forEach(b => { const t = T[b.type]; b.pop = fate ? b.inhab || 0 : t.pop[0] + Math.floor(r() * (t.pop[1] - t.pop[0] + 1)); sumPop += b.pop; });
    const scale = !fate && sumPop ? clamp(popEff / sumPop, 0.5, 2) : 1, deity = cname();
    const lair = lairSet || new Set(); if (keep) for (const id of keep.ids) if (B[id].keepLair) lair.add(id); if (fate === 'occupied' && !lairSet) { const inner = B.filter(b => d0(b.x, b.y) < R * 0.35).sort(() => r() - 0.5).slice(0, Math.max(1, Math.round(B.length * 0.06))); inner.forEach(b => lair.add(b.id)); }
    B.forEach(b => {
      const t = T[b.type], did = b.site ? -1 : distId(b.x, b.y), kind = did >= 0 ? dst[did].kind : null; b.district = did; b.pop = Math.round(b.pop * scale);
      const rich = ['estate', 'rich', 'castle', 'cathedral', 'academy', 'hall', 'theater', 'bank'].includes(b.type) || kind === 'rich', poor = b.type === 'slum' || kind === 'poor'; b.wealth = rich ? 'rich' : poor ? 'poor' : 'mid';
      b.cond = b.fixcond ? b.fixcond : fate === 'ruined' ? (r() < 0.88 ? 'ruined' : 'worn') : fate === 'occupied' ? (lair.has(b.id) ? 'lair' : r() < 0.14 ? 'burnt' : r() < 0.4 ? 'damaged' : 'worn') : r() < (poor ? 0.7 : 0.25) ? 'worn' : 'good';
      if (fate === 'occupied' && b.cond !== 'lair') b.pop = 0;
      const fl = FLOORS[b.type] || [1, 2]; b.floors = fl[0] + Math.floor(r() * (fl[1] - fl[0] + 1)); b.area = Math.round(b.w * b.h * b.floors);
      const nm = t.cat === 'Монстри' ? X.monName(r) : X.mkName(r); b.owner = CRAFT.has(b.type) && b.type !== 'well' && !b.kp ? pick(r, r() < 0.2 ? X.GIVENF : X.GIVEN) + ' ' + pick(r, X.FAM) : null;
      b.name = b.type === 'tavern' ? 'Таверна «' + pick(r, X.ADJ) + ' ' + pick(r, X.NOUN) + '»' : b.type === 'inn' ? 'Заїжджий двір «' + pick(r, X.ADJ) + ' ' + pick(r, X.NOUN) + '»' : b.type === 'temple' || b.type === 'cathedral' || b.type === 'chapel' ? t.n + ' ' + deity + 'а'.replace('а', '') + (b.type === 'chapel' ? ' «' + nm + '»' : '') : NAMED.has(b.type) || t.cat === 'Монстри' ? t.n + ' «' + nm + '»' : b.rampart ? t.n + ' №' + (rampN[b.type] = (rampN[b.type] || 0) + 1) : t.n;
      if (b.pname) b.name = b.pname;
      if (b.type === 'temple' || b.type === 'cathedral') b.name = t.n + ' «' + deity + '»';
      const st = streets[b.st]; if (st) { const k = b.st + '|' + b.side; addrN[k] = (addrN[k] || 0) + 1; b.addr = st.name + ', ' + (addrN[k] * 2 - (b.side > 0 ? 1 : 0)); } else b.addr = b.rampart ? 'Оборонна лінія, ' + (b.u < 0 ? '−' : '+') + Math.abs(b.u) + ' м від осі міста' : b.site || (b.kp && keep ? keep.name : 'у межах району');
      const hooks = X.HOOKS[b.cond === 'ruined' ? 'Руїни' : b.cond === 'lair' && t.cat !== 'Монстри' ? 'Окупація' : t.cat] || []; b.hook = hooks.length && (t.cat !== 'Житлова' || r() < 0.2) && r() < 0.8 ? pick(r, hooks) : null; if (b.pdesc) b.hook = b.pdesc;
      const dd = did >= 0 ? dst[did] : null; if (dd) { dd.nb++; dd.pop += b.pop; dd.cats[t.cat] = (dd.cats[t.cat] || 0) + 1; dd.types[b.type] = (dd.types[b.type] || 0) + 1; if (b.uniq || (!['Житлова'].includes(t.cat) && b.w * b.h > 220)) dd.notable.push(b.id); }
    });
    if (fate === 'occupied') { const pls = F.filter(f => f.t === 'plaza').concat([{ x: x0, y: y0, r: 20 }]); for (let k = 0, n = 5 + Math.round(Math.sqrt(B.length) / 2); k < n; k++) { const pl = pick(r, pls), a = r() * TAU, d = pl.r * (0.3 + 0.8 * r()); camps.push({ t: pick(r, s.occupier === 'bandits' ? ['tent', 'tent', 'fire', 'barricade', 'banner'] : ['bones', 'fire', 'nest', 'barricade', 'banner']), x: pl.x + Math.cos(a) * d, y: pl.y + Math.sin(a) * d, a: r() * TAU }); } }
    streets.forEach(st => { if (st.district >= 0) { const d = dst[st.district]; if (st.kind !== 'lane' && d.streets.length < 6) d.streets.push(st.name); } });
    dst.forEach(d => { d.notable = d.notable.sort((p, q) => B[q].w * B[q].h - B[p].w * B[p].h).slice(0, 7); });
    const stats = { buildings: B.length, streets: streets.length, lanes: streets.filter(q => q.kind === 'lane').length, squares: F.filter(f => f.t === 'plaza').length, parks: F.filter(f => f.t === 'park').length, fountains: props.filter(p => p.t === 'fountain').length, monuments: props.filter(p => p.t === 'monument').length, bridges: streets.reduce((a, st) => a + (st.br.some(Boolean) ? 1 : 0), 0), piers: piers.length, ships: ships.length, towers: wall.towers.length, gates: wall.gates.length, defences: B.filter(b => b.rampart).length, lairs: B.filter(b => b.cond === 'lair').length };
    void base;
    return { sid: s.id, name: s.name, rank: s.rank, tier, fate, fort: !!fort, order: mon ? s.order || null : null, occupier: s.occupier || null, port: !!s.port, pop: s.pop, popBefore: s.popBefore, R, Rmap, c0: [x0, y0], walled, wall, keep, streets, rivers: env.rivers, shore, piers, ships, plazas: F.filter(f => f.t === 'plaza'), sites, features: F, props, buildings: B, districts: dst, fields, trails: tp ? tp.trails : [], trailStats: tp ? tp.stats : null, trees, camps, stats, group: gn, env, bgrid, BK, districtOf: (x, y) => distId(x, y), s };
  }

  const setCustom = (W, sid, town) => { let m = customs.get(W); if (!m) customs.set(W, m = new Map()); if (town) m.set(sid, town); else m.delete(sid); };
  A.Town = { get, has, build, TIER, sizeOf, setCustom };
})();
