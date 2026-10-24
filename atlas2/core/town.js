// Атлас 2.0, місто: генератор детального міста з поселення (райони, вулиці, площі, парки, споруди, стіни, порт). Детерміновано від зерна світу й номера поселення; будується за потреби (клік на поселенні).
(function () {
  'use strict';
  const A = globalThis.Atlas2, D = A.CityData, T = D.T, K = D.K, X = A.CityText, TAU = Math.PI * 2;
  const TIER = { hamlet: 0, village: 1, town: 2, regional: 3, capital: 4 };
  const PPB = [9, 6, 6.5, 7, 7], AREAB = [1500, 900, 420, 340, 300], MINB = [3, 12, 60, 250, 900], MAXB = [12, 110, 520, 1500, 3000];
  const GATE = { bank: 3, manufact: 3, jewel: 2, brothel: 2, bath: 2, weapon: 2, pharm: 2, school: 2, gmage: 3, theater: 3, arena: 4, library: 3, academy: 4, hospital: 3, prison: 3, court: 3, gthief: 3, shipyard: 2, warehouse: 2, tannery: 2, weaver: 2, brewery: 2, gmerc: 3, galch: 3, gmerch: 2, estate: 3, mtower: 4, cathedral: 4, barracks: 2, manufact2: 3 };
  const PLANS = [[], ['centre', 'outskirts'], ['centre', 'trade', 'craft', 'poor', 'port', 'suburb'], ['centre', 'trade', 'craft', 'rich', 'poor', 'temple', 'castle', 'port', 'suburb'], ['centre', 'trade', 'craft', 'rich', 'poor', 'temple', 'castle', 'port', 'trade', 'rich', 'suburb']];
  // унікальні споруди: [тип, де (вид району чи 'centre'/'gate'), мін. ранг]
  const UNIQ = [['hall', 'centre', 2], ['elder', 'centre', 1], ['temple', 'temple', 3], ['cathedral', 'temple', 4], ['temple', 'centre', 2], ['chapel', 'centre', 1], ['tavern', 'centre', 1], ['smith', 'centre', 1], ['mill', 'centre', 1], ['inn', 'trade', 2], ['gmerch', 'trade', 2], ['bank', 'trade', 3], ['gmerc', 'craft', 3], ['gmage', 'rich', 3], ['mtower', 'rich', 4], ['galch', 'craft', 3], ['gthief', 'poor', 3], ['barracks', 'castle', 2], ['prison', 'castle', 3], ['court', 'castle', 3], ['school', 'temple', 3], ['library', 'rich', 3], ['academy', 'rich', 4], ['theater', 'rich', 3], ['arena', 'poor', 4], ['hospital', 'temple', 3], ['shipyard', 'port', 2], ['stable', 'gate', 2], ['barracks', 'gate', 3], ['tavern', 'port', 2], ['inn', 'gate', 3], ['school', 'centre', 2]];
  const FLOORS = { house: [1, 2], rich: [2, 3], estate: [2, 3], slum: [1, 1], hall: [3, 3], castle: [4, 4], cathedral: [5, 5], temple: [2, 3], mtower: [6, 7], windmill: [3, 3], tavern: [2, 3], inn: [2, 3], library: [2, 3], academy: [3, 4], theater: [2, 3], bank: [2, 3], arena: [2, 3], barracks: [2, 3], hospital: [2, 3], prison: [2, 3], court: [2, 3], gmage: [2, 3], gmerch: [2, 3] };
  const NAMED = new Set(['tavern', 'inn', 'temple', 'chapel', 'cathedral', 'academy', 'theater', 'arena', 'hospital', 'castle', 'gmerch', 'gmerc', 'gmage', 'galch', 'gthief', 'bath', 'brothel', 'library']);
  const CRAFT = new Set(['smith', 'bakery', 'shop', 'pharm', 'jewel', 'weapon', 'tannery', 'weaver', 'brewery', 'mill', 'windmill', 'stable', 'bank', 'fishhut', 'farm', 'farmstead', 'hut', 'rich', 'house', 'estate', 'slum', 'elder', 'manufact', 'warehouse', 'shipyard', 'fishdry']);
  const MONU = ['засновнику поселення', 'героям давньої оборони', 'доброму королю', 'невідомому мандрівнику, що врятував місто', 'духові-охоронцю цього краю', 'п’ятьом полеглим захисникам'];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), pick = (r, a) => a[Math.floor(r() * a.length)];
  const rectCorners = (b, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + pad, hh = b.h / 2 + pad; return [[b.x + c * hw - s * hh, b.y + s * hw + c * hh], [b.x - c * hw - s * hh, b.y - s * hw + c * hh], [b.x - c * hw + s * hh, b.y - s * hw - c * hh], [b.x + c * hw + s * hh, b.y + s * hw - c * hh]]; };
  const rectHit = (b, x, y, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y; return Math.abs(dx * c + dy * s) <= b.w / 2 + pad && Math.abs(-dx * s + dy * c) <= b.h / 2 + pad; };
  function overlap(p, q) { // SAT двох повернутих прямокутників
    const ca = rectCorners(p, 0), cb = rectCorners(q, 0);
    for (const r of [p, q]) for (const ang of [r.a, r.a + Math.PI / 2]) { const ax = Math.cos(ang), ay = Math.sin(ang); let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const c of ca) { const d = c[0] * ax + c[1] * ay; if (d < a0) a0 = d; if (d > a1) a1 = d; } for (const c of cb) { const d = c[0] * ax + c[1] * ay; if (d < b0) b0 = d; if (d > b1) b1 = d; } if (a1 < b0 || b1 < a0) return false; }
    return true;
  }
  const caches = new WeakMap();
  const get = (W, s) => { let m = caches.get(W); if (!m) caches.set(W, m = new Map()); let c = m.get(s.id); if (!c) m.set(s.id, c = build(W, s)); return c; };

  function build(W, s) {
    const seed = W.params.seed, r = A.Rng.stream(seed, 'town|' + s.id), si = A.Rng.hashSeed(seed + '|t' + s.id) & 0x7fffffff, names = A.Names.make(seed + '|town|' + s.id), lang = names.lang(), cname = () => { try { return names.region(lang); } catch (e) { return X.mkName(r); } };
    const tier = TIER[s.rank], fate = s.ruined ? 'ruined' : s.fate || null, popEff = s.pop || s.popBefore || Math.round(((A.Settlements && 0) || 0) + [60, 380, 2000, 8000, 26000][tier]);
    const target = clamp(Math.round(popEff / PPB[tier]), MINB[tier], MAXB[tier]), R = Math.sqrt(target * AREAB[tier] / Math.PI) * (tier >= 2 ? 1.12 : 1), Rmax = R * 1.45, Rmap = R * 1.9 + 120;
    const env = A.TownEnv.make(W, s, R, Rmap, si), WK = env.waterKind;
    // центр: найближча суха точка до клітини поселення
    let x0 = 0, y0 = 0; if (WK(0, 0) !== 0) { let f = false; for (let d = 12; d < 260 && !f; d += 12) for (let k = 0; k < 16 && !f; k++) { const x = Math.cos(k / 16 * TAU) * d, y = Math.sin(k / 16 * TAU) * d; if (WK(x, y) === 0) { x0 = x; y0 = y; f = true; } } }
    const net = A.TownNet.build(env, r, { x0, y0, R, Rmax, tier, gates: env.gates, port: s.port }), { streets, near, grow, mkSt, shore } = net, d0 = (x, y) => Math.hypot(x - x0, y - y0);
    // ---- бічні вулиці й провулки, що ростуть від основних
    const gap = [60, 60, 80, 88, 95][tier], lenR = [[40, 80], [55, 130], [90, 210], [120, 260], [140, 310]][tier], pb = [0.35, 0.75, 0.85, 0.9, 0.92][tier], queue = streets.map(st => [st, 0]);
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
    // ---- стіна
    const walled = tier >= 2 && (tier >= 3 || r() < 0.7), Rw = R * 0.8, wph = r() * TAU, wallR = th => Rw * (1 + 0.05 * Math.sin(3 * th + wph) + 0.035 * Math.sin(5 * th + 2 * wph)), inWall = (x, y) => d0(x, y) < wallR(Math.atan2(y - y0, x - x0));
    // ---- райони: опорні точки (вага менша → район більший)
    const plan = (tier === 1 ? (popEff >= 250 ? PLANS[1] : []) : PLANS[tier]).filter(k => k !== 'port' || (s.port && shore.length)), anchors = [], land = (x, y) => WK(x, y) === 0;
    const ring = (f, jit) => { const o = []; const ph = r() * TAU; for (let k = 0; k < 18; k++) { const a = ph + k / 18 * TAU, rr = R * f * (1 + (r() - 0.5) * jit), x = x0 + Math.cos(a) * rr, y = y0 + Math.sin(a) * rr; if (land(x, y)) o.push([x, y]); } return o; };
    for (const kind of plan) {
      if (kind === 'suburb' || kind === 'outskirts') continue; let p = null, wt = 1;
      if (kind === 'centre') { p = [x0, y0]; wt = 0.9; }
      else if (kind === 'port') { const c = shore.filter(q => q.d < R); p = c.length ? c[Math.floor(r() * c.length)] : null; if (p) p = [p.x, p.y]; wt = 1.3; }
      else if (kind === 'castle') { let b = -1; for (const q of ring(0.55, 0.3)) { const sc = env.elevAt(q[0], q[1]) + r() * 0.1; if (sc > b) { b = sc; p = q; } } wt = 1.9; }
      else { let bs = -1; for (const q of ring(kind === 'poor' ? 0.72 : 0.5, 0.4)) { let m = 1e9; for (const a of anchors) m = Math.min(m, Math.hypot(a.x - q[0], a.y - q[1])); const sc = m + r() * 20; if (sc > bs) { bs = sc; p = q; } } }
      if (p) anchors.push({ kind, x: p[0], y: p[1], wt });
    }
    const outerKind = plan.includes('suburb') ? 'suburb' : plan.includes('outskirts') ? 'outskirts' : null;
    const districtOf = (x, y) => {
      if (!anchors.length) return -1; const d = d0(x, y);
      if (outerKind && (walled ? !inWall(x, y) : d > R * (outerKind === 'outskirts' ? 0.62 : 0.84))) return anchors.length;
      let b = 0, bd = 1e9; anchors.forEach((a, k) => { const q = Math.hypot(a.x - x, a.y - y) * a.wt; if (q < bd) { bd = q; b = k; } }); return b;
    };
    const kindOf = id => id < 0 ? null : id >= anchors.length ? outerKind : anchors[id].kind;
    // ---- нерухомі об'єкти: площі, парки, цвинтар
    const F = [], B = [], bgrid = new Map(), BK = 24, props = [], bkeys = b => { const o = []; const rad = Math.hypot(b.w, b.h) / 2; for (let gx = Math.floor((b.x - rad) / BK); gx <= Math.floor((b.x + rad) / BK); gx++) for (let gy = Math.floor((b.y - rad) / BK); gy <= Math.floor((b.y + rad) / BK); gy++) o.push(gx * 100003 + gy); return o; };
    const addB = b => { b.id = B.length; B.push(b); for (const k of bkeys(b)) (bgrid.get(k) || bgrid.set(k, []).get(k)).push(b.id); return b; };
    const circleFree = (x, y, rad, gapm) => { for (const k of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (WK(x + k[0] * rad, y + k[1] * rad) !== 0) return false; for (const f of F) if (Math.hypot(f.x - x, f.y - y) < f.r + rad + (gapm == null ? 6 : gapm)) return false; return true; };
    const streetPtNear = (ax, ay) => { let best = null, bd = 1e9; for (const st of streets) for (let i = 0; i < st.pts.length; i += 2) { const d = Math.hypot(st.pts[i] - ax, st.pts[i + 1] - ay); if (d < bd && d0(st.pts[i], st.pts[i + 1]) < R) { bd = d; best = [st.pts[i], st.pts[i + 1]]; } } return best; };
    const stemFor = kind => pick(r, X.stems(kind || 'centre'));
    const addPlaza = (kind, x, y, rad, nm) => { F.push({ t: 'plaza', x, y, r: rad, kind, name: nm || stemFor(kind) + 'а площа' }); };
    if (tier >= 1) { const pr = [16, 16, 28, 38, 46][tier]; if (circleFree(x0, y0, pr, 0)) { addPlaza('centre', x0, y0, pr, tier === 1 ? 'Майдан' : 'Головна площа'); if (tier >= 2) props.push({ t: 'fountain', x: x0, y: y0, r: 4.5, name: 'Фонтан «' + cname() + '»' }); else props.push({ t: 'well', x: x0, y: y0, r: 1.8, name: 'Громадський колодязь' }); if (tier >= 3) props.push({ t: 'monument', x: x0 + pr * 0.55, y: y0 - pr * 0.3, r: 2.5, name: 'Пам’ятник ' + pick(r, MONU) }); } }
    else props.push({ t: 'well', x: x0, y: y0, r: 1.8, name: 'Колодязь хутора' });
    anchors.forEach(a => { if (tier < 2 || (a.kind !== 'trade' && a.kind !== 'temple' && !(a.kind === 'port' && tier >= 3))) return; const p = streetPtNear(a.x, a.y); if (p && circleFree(p[0], p[1], 22, 4)) { addPlaza(a.kind, p[0], p[1], a.kind === 'trade' ? 26 : 20, a.kind === 'trade' ? 'Ринкова площа' : a.kind === 'port' ? 'Портова площа' : 'Храмова площа'); if (a.kind === 'temple' && tier >= 3) props.push({ t: 'monument', x: p[0], y: p[1], r: 2.5, name: 'Пам’ятник ' + pick(r, MONU) }); } });
    if (tier >= 2) for (let n = [0, 0, 1 + (r() < 0.5), 3 + (r() < 0.5), 5 + (r() < 0.5)][tier] | 0, tries = 0; n > 0 && tries < 80; tries++) { const a = r() * TAU, d = R * (0.15 + 0.7 * r()), x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d, rad = 22 + r() * 24, k = kindOf(districtOf(x, y)); if (k === 'poor' || k === 'craft' || k === 'port' || !circleFree(x, y, rad, 14)) continue; F.push({ t: 'park', x, y, r: rad, kind: k, name: pick(r, ['Парк', 'Сад', 'Гай', 'Скверик']) + ' «' + cname() + '»' }); n--; }
    if (tier >= 1 && (tier >= 2 || popEff >= 200)) for (let tries = 0; tries < 40; tries++) { const a = r() * TAU, d = R * (0.8 + 0.4 * r()), x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d, rad = 22 + r() * 14; if (circleFree(x, y, rad, 12) && near(x, y, rad, -1, -2) > rad * 0.6) { F.push({ t: 'cemetery', x, y, r: rad, name: 'Цвинтар «' + cname() + '»' }); break; } }
    // ---- місця під забудову вздовж вулиць (фронтаж)
    const lots = []; streets.forEach(st => { const p = st.pts; for (let i = 2; i < p.length; i += 2) { if (st.br[i / 2]) continue; const L = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]), a = Math.atan2(p[i + 1] - p[i - 1], p[i] - p[i - 2]); for (let t = 0; t < L; t += 9) for (const sd of [1, -1]) { const x = p[i - 2] + Math.cos(a) * t, y = p[i - 1] + Math.sin(a) * t; if (st.kind === 'embankment' && ((x0 - x) * -Math.sin(a) + (y0 - y) * Math.cos(a)) * sd < 0) continue; lots.push({ x, y, a, nx: -Math.sin(a) * sd, ny: Math.cos(a) * sd, hw: st.hw, st: st.id, d: d0(x, y) }); } } });
    // ---- розміщення споруд
    const tierOk = id => (GATE[id] || 0) <= tier;
    const canPlace = (b, big) => {
      if (d0(b.x, b.y) > R * 1.12 + (b.far || 0)) return false;
      const cs = rectCorners(b, 0); if (WK(b.x, b.y) !== 0) return false; for (const c of cs) if (WK(c[0], c[1]) !== 0) return false;
      for (const f of F) { if (Math.hypot(f.x - b.x, f.y - b.y) < f.r + Math.hypot(b.w, b.h) / 2 + 1 && (f.t !== 'plaza' || true)) { if (rectHit(b, f.x, f.y, f.r)) return false; } }
      const nx = Math.max(2, Math.ceil(b.w / 9)), ny = Math.max(2, Math.ceil(b.h / 9)), c = Math.cos(b.a), sn = Math.sin(b.a);
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) { const u = (i / nx - 0.5) * b.w, v = (j / ny - 0.5) * b.h; if (near(b.x + c * u - sn * v, b.y + sn * u + c * v, 8 + (big ? 6 : 0), -1, -2) < 1) return false; }
      const pad = { x: b.x, y: b.y, w: b.w + 1.6, h: b.h + 1.6, a: b.a }, rad = Math.hypot(b.w, b.h) / 2 + 4;
      for (let gx = Math.floor((b.x - rad) / BK); gx <= Math.floor((b.x + rad) / BK); gx++) for (let gy = Math.floor((b.y - rad) / BK); gy <= Math.floor((b.y + rad) / BK); gy++) { const g = bgrid.get(gx * 100003 + gy); if (g) for (const id of g) { const o = B[id]; if (Math.abs(o.x - b.x) < rad + o.w && Math.abs(o.y - b.y) < rad + o.w && overlap(pad, o)) return false; } }
      return true;
    };
    const mkB = (id, lot, sc) => { const t = T[id], j = () => 0.88 + r() * 0.27, w = t.w * j() * (sc || 1), h = t.h * j() * (sc || 1), off = lot.hw + (lot.d > R * 0.7 ? 4.5 : 2.6) + h / 2; return { type: id, x: lot.x + lot.nx * off, y: lot.y + lot.ny * off, w, h, a: lot.a, st: lot.st, side: lot.nx * -Math.sin(lot.a) + lot.ny * Math.cos(lot.a) > 0 ? 1 : -1 }; };
    const pool = kind => { const base = (K[kind || 'outskirts'] || K.outskirts).pool, o = {}; for (const k in base) if (tierOk(k)) o[k] = base[k]; return o; };
    const wsum = p => Object.values(p).reduce((a, b) => a + b, 0), pickW = p => { let q = r() * wsum(p); for (const k in p) { q -= p[k]; if (q <= 0) return k; } return Object.keys(p)[0]; };
    const placeNear = (id, ax, ay, maxD) => {
      const cand = lots.filter(l => Math.hypot(l.x - ax, l.y - ay) < maxD).sort((p, q) => Math.hypot(p.x - ax, p.y - ay) - Math.hypot(q.x - ax, q.y - ay));
      for (let i = 0; i < cand.length && i < 400; i++) { const b = mkB(id, cand[i], 1); if (canPlace(b, true)) { b.uniq = true; return addB(b); } } return null;
    };
    const gatePts = streets.filter(st => st.kind === 'avenue').map(st => { const a = st.gate; const rr = walled ? wallR(a) * 0.9 : R * 0.85; return [x0 + Math.cos(a) * rr, y0 + Math.sin(a) * rr]; });
    // замок
    if (tier >= 3) { const an = anchors.find(a => a.kind === 'castle'); if (an) for (const sz of [78, 62]) { const cand = []; for (let k = 0; k < 40; k++) { const a = r() * TAU, d = Math.sqrt(r()) * 90; cand.push([an.x + Math.cos(a) * d, an.y + Math.sin(a) * d]); } cand.sort((p, q) => Math.hypot(p[0] - an.x, p[1] - an.y) - Math.hypot(q[0] - an.x, q[1] - an.y)); let done = false; for (const p of cand) { const b = { type: 'castle', x: p[0], y: p[1], w: sz, h: sz * (0.85 + 0.2 * r()), a: r() * 0.5 - 0.25, st: -1, side: 1, uniq: true }; if (canPlace(b, true)) { addB(b); done = true; break; } } if (done) break; } }
    for (const [id, where, mt] of UNIQ) {
      if (mt > tier || (id === 'temple' && where === 'centre' && tier >= 3) || (id === 'tavern' && where === 'port' && !anchors.some(a => a.kind === 'port')) || (id === 'tavern' && where === 'centre' && tier >= 2)) continue;
      let ax = x0, ay = y0, maxD = tier >= 3 ? 120 : 160; if (where === 'gate') { if (!gatePts.length) continue; const g = gatePts[Math.floor(r() * gatePts.length)]; ax = g[0]; ay = g[1]; maxD = 90; } else if (where !== 'centre') { const a = anchors.find(q => q.kind === where); if (!a) continue; ax = a.x; ay = a.y; maxD = 140; }
      if (id === 'hall' && tier >= 2) { const f = F[0]; if (f) { ax = f.x; ay = f.y; } }
      placeNear(id, ax, ay, maxD);
    }
    // порт: причали, кораблі, маяк
    const piers = [], ships = [];
    if (shore.length && (s.port || tier <= 1) && tier >= 1 && !fate) {
      const nP = s.port ? clamp(Math.round(shore.length / 6), 2, tier >= 3 ? 14 : 7) : 1 + (r() < 0.5);
      for (let k = 0; k < nP; k++) { const q = shore[Math.floor((k + 0.5) / nP * shore.length)], len = 26 + r() * 30, a = Math.atan2(q.ny, q.nx), x1 = q.x + q.nx * 12, y1 = q.y + q.ny * 12, x2 = q.x + q.nx * (12 + len), y2 = q.y + q.ny * (12 + len); if (WK(x2, y2) !== 2) continue; piers.push({ x1, y1, x2, y2, a }); if (s.port && r() < 0.85) ships.push({ x: x2 - q.nx * len * 0.5 - q.ny * 8 + q.ny * 0, y: y2 - q.ny * len * 0.5 + q.nx * 8, a, len: 12 + r() * 14, w: 4 + r() * 3 }); }
      if (s.port && tier >= 3) { const q = shore[Math.floor(r() * shore.length)]; const b = { type: 'lighthouse', x: q.x + q.nx * 6, y: q.y + q.ny * 6, w: 6, h: 6, a: 0, st: -1, side: 1, uniq: true }; if (WK(b.x, b.y) === 0) addB(b); }
    }
    // загальна забудова за фронтажем
    const order = lots.slice().sort((p, q) => (p.d + r() * 22) - (q.d + r() * 22)), cap = Math.round(target * 1.08), pools = {};
    const poolOf = id => pools[id] || (pools[id] = pool(kindOf(id)));
    const pushTypeFor = (x, y, id) => { const kind = kindOf(id), p = poolOf(id); if (tier === 0 || !Object.keys(p).length) return pickW(pool(kind || (tier ? 'outskirts' : 'outskirts'))); return pickW(p); };
    for (const lot of order) {
      if (B.length >= cap) break; if (r() < 0.07 + 0.35 * Math.min(1, lot.d / R) ** 3) continue;
      const did = districtOf(lot.x, lot.y); let id = pushTypeFor(lot.x, lot.y, did), b = mkB(id, lot, 1), ok = canPlace(b);
      for (let t = 0; !ok && t < 2; t++) { id = pickW(pool(kindOf(did) === 'port' ? 'port' : 'outskirts')); b = mkB(id, lot, 1); ok = canPlace(b); }
      if (ok) addB(b);
    }
    // двори між вулицями: менші споруди без прямого виходу на вулицю
    for (let tries = 0, lim = Math.max(0, cap - B.length) * 6; tries < lim && B.length < cap; tries++) {
      const a = r() * TAU, d = Math.sqrt(r()) * R * 1.02, x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d; if (WK(x, y) !== 0) continue; const nd = near(x, y, 60, -1, -2); if (nd > 60 || nd < 6) continue; const q = near.q, ang = Math.atan2(q.by - q.ay, q.bx - q.ax);
      const p = Object.assign({}, poolOf(districtOf(x, y))); for (const k of Object.keys(p)) if (T[k].w > 16 || T[k].h > 18) delete p[k]; if (!Object.keys(p).length) continue;
      const id = pickW(p), t = T[id], b = { type: id, x, y, w: t.w * (0.85 + 0.2 * r()), h: t.h * (0.85 + 0.2 * r()), a: ang, st: q.st, side: 1 }; if (canPlace(b)) addB(b);
    }
    // ---- райони: порожні відкидаємо, перенумеровуємо
    const used = new Set(B.map(b => districtOf(b.x, b.y))); const idMap = new Map(); const dst = []; for (let k = 0; k <= anchors.length; k++) { if (!used.has(k) || k < 0) continue; const kind = kindOf(k); if (!kind) continue; idMap.set(k, dst.length); const st = X.DSTAT[kind] || X.DSTAT.outskirts; dst.push({ id: dst.length, kind, name: '', col: K[kind].col, text: K[kind].d, x: k < anchors.length ? anchors[k].x : x0, y: k < anchors.length ? anchors[k].y : y0, pop: 0, nb: 0, cats: {}, types: {}, notable: [], streets: [], wealth: st[0], safety: st[1], vibe: st[2], raw: k }); }
    const distId = (x, y) => { const k = districtOf(x, y); return idMap.has(k) ? idMap.get(k) : -1; };
    dst.forEach(d => { d.name = K[d.kind].n + (tier >= 2 && d.kind !== 'suburb' ? ' «' + cname() + '»' : ''); });
    // ---- назви вулиць
    const used2 = new Set(), nb = {}; W.settlements.forEach(q => { if (q.id !== s.id && !q.ruined && q.landmass === s.landmass && Math.hypot(q.x - s.x, q.y - s.y) < 60) { (nb.list = nb.list || []).push(q); } });
    const nameSt = (st, kind) => {
      const ST = X.stems(kind || 'centre'), end = { avenue: 'вулиця', street: 'вулиця', ring: 'вулиця', embankment: 'набережна', lane: 'провулок' }[st.kind];
      for (let t = 0; t < 12; t++) { const stem = pick(r, ST), nm = end === 'провулок' ? stem + 'ий провулок' : end === 'набережна' ? stem + 'а набережна' : stem + 'а вулиця'; if (!used2.has(nm)) { used2.add(nm); return nm; } }
      const nm = (end === 'провулок' ? 'Другий провулок ' : 'Нова вулиця ') + (used2.size + 1); used2.add(nm); return nm;
    };
    streets.forEach(st => {
      const mi = Math.floor(st.pts.length / 4) * 2, did = distId(st.pts[mi], st.pts[mi + 1]); st.district = did; const kind = did >= 0 ? dst[did].kind : (tier === 0 ? 'outskirts' : 'centre');
      if (st.kind === 'avenue') { let best = null, bd = 1e9; for (const q of nb.list || []) { const a = Math.atan2((q.y - s.y), (q.x - s.x)), df = Math.abs(Math.atan2(Math.sin(a - st.gate), Math.cos(a - st.gate))), d = Math.hypot(q.x - s.x, q.y - s.y); if (df < 0.5 && d < bd) { bd = d; best = q; } } st.name = best && !used2.has('Шлях на ' + best.name) ? 'Шлях на ' + best.name : nameSt(st, 'centre'); used2.add(st.name); }
      else if (st.kind === 'embankment') st.name = 'Набережна «' + cname() + '»'; else st.name = nameSt(st, kind);
      st.len = 0; for (let i = 2; i < st.pts.length; i += 2) st.len += Math.hypot(st.pts[i] - st.pts[i - 2], st.pts[i + 1] - st.pts[i - 1]);
    });
    F.forEach(f => { f.district = distId(f.x, f.y); });
    // ---- поля, дерева, табори, мури
    const fields = [], gn = (A.Danger && A.Danger.groupName(W, s.i)) || 'grass', farmy = !['mountain', 'peaks', 'snow', 'desert', 'tundra', 'swamp'].includes(gn);
    if (farmy && !fate) for (let tries = 0, nF = [6, 22, 26, 30, 34][tier]; tries < 300 && fields.length < nF; tries++) {
      const a = r() * TAU, d = R * (0.9 + r() * 0.95), x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d, w = 40 + r() * 40, h = 30 + r() * 30; if (WK(x, y) !== 0 || d > Rmap * 0.92) continue; const nd = near(x, y, 80, -1, -2), q = near.q; const f = { x, y, w, h, a: q && nd < 80 ? Math.atan2(q.by - q.ay, q.bx - q.ax) : r() * Math.PI }; let ok = nd > Math.max(w, h) / 2 * 0.9 || true;
      for (const c of rectCorners(f, 0)) { if (WK(c[0], c[1]) !== 0 || near(c[0], c[1], 10, -1, -2) < 2) ok = false; } if (nd < 8) ok = false; for (const o of fields) if (overlap(f, o)) ok = false; for (const b of B) if (Math.hypot(b.x - x, b.y - y) < 60 && overlap(f, b)) ok = false; if (ok) fields.push(f);
    }
    const trees = [], dens = { forest: 0.0016, taiga: 0.0016, jungle: 0.0018, hills: 0.0004, grass: 0.00012, steppe: 0.00004, savanna: 0.00008, mountain: 0.0002, swamp: 0.0006, peaks: 0.00004 }[gn] || 0.0001, ruinBoost = fate === 'ruined' ? 2.2 : 1;
    for (let tries = 0, nT = Math.min(1400, Math.round(Math.PI * Rmap * Rmap * dens * ruinBoost)); tries < nT * 3 && trees.length < nT; tries++) {
      const a = r() * TAU, d = Math.sqrt(r()) * Rmap, x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d; if (WK(x, y) !== 0 || near(x, y, 20, -1, -2) < 3) continue; let ok = true; const gx = Math.floor(x / BK), gy = Math.floor(y / BK);
      for (let ix = gx - 1; ix <= gx + 1 && ok; ix++) for (let iy = gy - 1; iy <= gy + 1 && ok; iy++) { const g = bgrid.get(ix * 100003 + iy); if (g) for (const id of g) if (rectHit(B[id], x, y, 3)) { ok = false; break; } }
      for (const f of F) if (Math.hypot(f.x - x, f.y - y) < f.r + 2 && f.t !== 'park') ok = false; for (const f of fields) if (rectHit(f, x, y, 2)) ok = false; if (ok) trees.push({ x, y, r: 2.5 + r() * 3, c: gn === 'taiga' || gn === 'mountain' || r() < 0.2 ? 1 : 0 });
    }
    for (const f of F) if (f.t === 'park') for (let k = 0, n = Math.round(f.r * f.r / 70); k < n; k++) { const a = r() * TAU, d = Math.sqrt(r()) * f.r * 0.92; trees.push({ x: f.x + Math.cos(a) * d, y: f.y + Math.sin(a) * d, r: 2.5 + r() * 2.5, c: 0 }); }
    const wall = { on: walled, R: Rw, ph: wph, runs: [], towers: [], gates: [] };
    if (walled) { let run = []; const N = 160; for (let k = 0; k <= N; k++) { const th = k / N * TAU, rr = wallR(th), x = x0 + Math.cos(th) * rr, y = y0 + Math.sin(th) * rr, ok = WK(x, y) === 0 && !(fate && fate !== 'occupied' && env.hash(k >> 2, si & 255, si) < 0.45) && !(fate === 'occupied' && env.hash(k >> 3, si & 255, si) < 0.15); if (ok) run.push(x, y); else { if (run.length >= 4) wall.runs.push(run); run = []; } if (ok && k % 8 === 0) wall.towers.push([x, y]); } if (run.length >= 4) wall.runs.push(run);
      streets.filter(st => st.kind === 'avenue').forEach(st => { const rr = wallR(st.gate), x = x0 + Math.cos(st.gate) * rr, y = y0 + Math.sin(st.gate) * rr; if (WK(x, y) === 0) wall.gates.push({ x, y, a: st.gate, name: 'Брама «' + st.name.replace(/^Шлях на /, 'на ') + '»' }); }); }
    // ---- склад споруд: імена, стан, мешканці, описи
    const camps = [], addrN = {}, base = { hamlet: 1, village: 1, town: 1, regional: 1, capital: 1 };
    let sumPop = 0; B.forEach(b => { const t = T[b.type]; b.pop = fate ? 0 : t.pop[0] + Math.floor(r() * (t.pop[1] - t.pop[0] + 1)); sumPop += b.pop; });
    const scale = !fate && sumPop ? clamp(popEff / sumPop, 0.5, 2) : 1, deity = cname();
    const lair = new Set(); if (fate === 'occupied') { const inner = B.filter(b => d0(b.x, b.y) < R * 0.35).sort(() => r() - 0.5).slice(0, Math.max(1, Math.round(B.length * 0.06))); inner.forEach(b => lair.add(b.id)); }
    B.forEach(b => {
      const t = T[b.type], did = distId(b.x, b.y), kind = did >= 0 ? dst[did].kind : null; b.district = did; b.pop = Math.round(b.pop * scale);
      const rich = ['estate', 'rich', 'castle', 'cathedral', 'academy', 'hall', 'theater', 'bank'].includes(b.type) || kind === 'rich', poor = b.type === 'slum' || kind === 'poor'; b.wealth = rich ? 'rich' : poor ? 'poor' : 'mid';
      b.cond = fate === 'ruined' ? (r() < 0.88 ? 'ruined' : 'worn') : fate === 'occupied' ? (lair.has(b.id) ? 'lair' : r() < 0.14 ? 'burnt' : r() < 0.4 ? 'damaged' : 'worn') : r() < (poor ? 0.7 : 0.25) ? 'worn' : 'good';
      if (fate === 'occupied' && b.cond !== 'lair') b.pop = 0;
      const fl = FLOORS[b.type] || [1, 2]; b.floors = fl[0] + Math.floor(r() * (fl[1] - fl[0] + 1)); b.area = Math.round(b.w * b.h * b.floors);
      const nm = X.mkName(r); b.owner = CRAFT.has(b.type) && b.type !== 'well' ? pick(r, r() < 0.2 ? X.GIVENF : X.GIVEN) + ' ' + pick(r, X.FAM) : null;
      b.name = b.type === 'tavern' ? 'Таверна «' + pick(r, X.ADJ) + ' ' + pick(r, X.NOUN) + '»' : b.type === 'inn' ? 'Заїжджий двір «' + pick(r, X.ADJ) + ' ' + pick(r, X.NOUN) + '»' : b.type === 'temple' || b.type === 'cathedral' || b.type === 'chapel' ? t.n + ' ' + deity + 'а'.replace('а', '') + (b.type === 'chapel' ? ' «' + nm + '»' : '') : NAMED.has(b.type) ? t.n + ' «' + nm + '»' : t.n;
      if (b.type === 'temple' || b.type === 'cathedral') b.name = t.n + ' «' + deity + '»';
      const st = streets[b.st]; if (st) { const k = b.st + '|' + b.side; addrN[k] = (addrN[k] || 0) + 1; b.addr = st.name + ', ' + (addrN[k] * 2 - (b.side > 0 ? 1 : 0)); } else b.addr = 'у межах району';
      const hooks = X.HOOKS[b.cond === 'ruined' ? 'Руїни' : b.cond === 'lair' ? 'Окупація' : t.cat] || []; b.hook = hooks.length && (t.cat !== 'Житлова' || r() < 0.2) && r() < 0.8 ? pick(r, hooks) : null;
      const dd = did >= 0 ? dst[did] : null; if (dd) { dd.nb++; dd.pop += b.pop; dd.cats[t.cat] = (dd.cats[t.cat] || 0) + 1; dd.types[b.type] = (dd.types[b.type] || 0) + 1; if (b.uniq || (!['Житлова'].includes(t.cat) && b.w * b.h > 220)) dd.notable.push(b.id); }
    });
    if (fate === 'occupied') { const pls = F.filter(f => f.t === 'plaza').concat([{ x: x0, y: y0, r: 20 }]); for (let k = 0, n = 5 + Math.round(Math.sqrt(B.length) / 2); k < n; k++) { const pl = pick(r, pls), a = r() * TAU, d = pl.r * (0.3 + 0.8 * r()); camps.push({ t: pick(r, s.occupier === 'bandits' ? ['tent', 'tent', 'fire', 'barricade', 'banner'] : ['bones', 'fire', 'nest', 'barricade', 'banner']), x: pl.x + Math.cos(a) * d, y: pl.y + Math.sin(a) * d, a: r() * TAU }); } }
    streets.forEach(st => { if (st.district >= 0) { const d = dst[st.district]; if (st.kind !== 'lane' && d.streets.length < 6) d.streets.push(st.name); } });
    dst.forEach(d => { d.notable = d.notable.sort((p, q) => B[q].w * B[q].h - B[p].w * B[p].h).slice(0, 7); });
    const stats = { buildings: B.length, streets: streets.length, lanes: streets.filter(q => q.kind === 'lane').length, squares: F.filter(f => f.t === 'plaza').length, parks: F.filter(f => f.t === 'park').length, fountains: props.filter(p => p.t === 'fountain').length, monuments: props.filter(p => p.t === 'monument').length, bridges: streets.reduce((a, st) => a + (st.br.some(Boolean) ? 1 : 0), 0), piers: piers.length, ships: ships.length, towers: wall.towers.length, gates: wall.gates.length };
    void base;
    return { sid: s.id, name: s.name, rank: s.rank, tier, fate, occupier: s.occupier || null, port: !!s.port, pop: s.pop, popBefore: s.popBefore, R, Rmap, c0: [x0, y0], walled, wall, streets, rivers: env.rivers, shore, piers, ships, plazas: F.filter(f => f.t === 'plaza'), features: F, props, buildings: B, districts: dst, fields, trees, camps, stats, group: gn, env, bgrid, BK, districtOf: (x, y) => distId(x, y), s };
  }

  A.Town = { get, build, TIER };
})();
