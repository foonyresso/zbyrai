// Тести замків. Спершу вузли окремо на штучних даних (геометрія, розтин вулиць, мур і ворота, розкладка споруд, пошук ділянки на сітці вулиць), далі цілі замки в містах трьох світів:
// ділянка з вулиць, мур і вежі, споруди (немає перетинів, чужі споруди й вулиці не заходять усередину), дороги до воріт, руїни й окупація, детермінованість, опис.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js'), G = A.KeepGeo, KR = A.KeepRoads, KW = A.KeepWall, KL = A.KeepLayout, KT = A.KeepTypes;
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; }, near = (a, b, e, m) => ok(Math.abs(a - b) <= e, `${m}: ${a} ≠ ${b} (±${e})`);
const hexagon = (r, cx, cy) => G.orient(Array.from({ length: 6 }, (_, i) => [cx + Math.cos(i * Math.PI / 3) * r, cy + Math.sin(i * Math.PI / 3) * r]));

// ---- геометрія
{
  const sq = [[0, 0], [10, 0], [10, 10], [0, 10]];
  near(G.area(sq), 100, 1e-9, 'площа квадрата'); near(G.area(sq.slice().reverse()), -100, 1e-9, 'площа проти обходу'); ok(G.area(G.orient(sq.slice().reverse())) > 0, 'orient дає додатну площу');
  ok(G.simple(sq) && !G.simple([[0, 0], [10, 10], [10, 0], [0, 10]]), 'простота: квадрат так, «краватка» ні');
  ok(G.inside(sq, 5, 5) && !G.inside(sq, 15, 5), 'inside'); near(G.sdist(sq, 5, 5), 5, 1e-9, 'sdist усередині'); near(G.sdist(sq, 15, 5), -5, 1e-9, 'sdist зовні'); near(G.edgeDist(sq, 5, 1), 1, 1e-9, 'edgeDist');
  near(G.area(G.clipHalf(sq, 1, 0, 4)), 60, 1e-9, 'clipHalf лишає частину nx·x ≥ c');
  const e = G.edge(sq, 0); near(e.nx, 0, 1e-9, 'нормаль сторони назовні (x)'); near(e.ny, -1, 1e-9, 'нормаль сторони назовні (y)'); near(e.len, 10, 1e-9, 'довжина сторони');
  ok(G.segHit(0, 0, 10, 10, 0, 10, 10, 0) && !G.segHit(0, 0, 10, 0, 0, 5, 10, 5), 'segHit: перетин і паралель');
  const r1 = { x: 0, y: 0, w: 10, h: 10, a: 0 }; ok(G.rectsHit(r1, { x: 9, y: 0, w: 10, h: 10, a: 0 }, 0) && !G.rectsHit(r1, { x: 11, y: 0, w: 10, h: 10, a: 0 }, 0) && G.rectsHit(r1, { x: 11, y: 0, w: 10, h: 10, a: 0 }, 2), 'rectsHit з відступом');
  ok(G.rectIn([[-20, -20], [20, -20], [20, 20], [-20, 20]], r1, 5) && !G.rectIn([[-20, -20], [20, -20], [20, 20], [-20, 20]], r1, 16), 'rectIn із запасом');
  const hx = hexagon(50, 0, 0); ok(G.simple(hx) && Math.abs(G.area(hx) - 2.598 * 2500) < 1, 'шестикутник'); ok(G.simplify(G.tidy(hx.concat(hx.map(p => [p[0] + 0.01, p[1] + 0.01])), 3, 0.1), 1).length >= 3, 'tidy/simplify не ламають');
  const mr = G.minRect([[0, 0], [30, 0], [30, 10], [0, 10]]); near(mr.w, 30, 1e-6, 'minRect довжина'); near(mr.h, 10, 1e-6, 'minRect ширина');
}

// ---- розтин вулиць (castleroads)
{
  const st = { pts: [-50, 0, 0, 0, 50, 0], br: [0, 0, 0] }, parts = KR.cutStreet(st, (x, y) => Math.hypot(x, y) < 10);
  ok(parts.length === 2, 'вулиця крізь коло розпадається на дві частини'); near(parts[0].pts[parts[0].pts.length - 2], -10, 1e-3, 'кінець першої частини на колі'); near(parts[1].pts[0], 10, 1e-3, 'початок другої частини на колі'); ok(parts[0].ce && parts[1].cs, 'позначено кінці розрізу');
  ok(KR.cutStreet({ pts: [20, 0, 40, 0], br: [0, 0] }, (x, y) => Math.hypot(x, y) < 10).length === 1, 'вулиця поза колом лишається цілою');
  const ch = KR.chaikin([0, 0, 10, 0, 10, 10], 2); ok(ch[0] === 0 && ch[1] === 0 && ch[ch.length - 2] === 10 && ch[ch.length - 1] === 10 && ch.length > 6, 'chaikin: кінці лишаються, точок більшає');
  // мур, що злегка налізає на кільцеву дорогу, відсувається від неї
  const ring = { id: 0, kind: 'ring', hw: 3, pts: [-30, -1, 90, -1], br: [0, 0] }, P0 = [[0, 0], [60, 0], [60, 60], [0, 60]], Q = KR.fit(P0, { streets: [ring], hard: new Set(['ring']), w: 4.5, WK: () => 0 });
  ok(G.simple(Q) && G.area(Q) > 0.6 * G.area(P0) && G.area(Q) < G.area(P0), 'fit лишає простий багатокутник, трохи меншого'); for (const p of Q) ok(p[1] + 1 >= 3 + 2.25 - 0.01, 'fit: вершина відсунута від дороги');
}

// ---- мур, ворота, вежі (castlewall) на шестикутнику без доріг і води
{
  const P = hexagon(52, 0, 0), wc = { WK: () => 0, near: Object.assign(() => 99, {}), streets: [], c0: [0, 0], walled: false, w: 4.5 }, r = A.Rng.stream('castle-test', 'wall'), S = KW.sides(P, wc);
  ok(S.length === 6 && S.every(s => s.water === 0 && s.city === 0 && !s.road), 'сторони без води, мурів і доріг');
  const gts = KW.gates(P, S, wc, { rear: 1, hw: 3.2 }, r), main = gts.filter(g => g.main), rear = gts.find(g => g.kind === 'rear');
  ok(main.length === 1 && rear, 'одна головна й одна задня брама'); for (const g of gts) ok(G.edgeDist(P, g.x, g.y) < 1e-6, 'брама на мурі');
  ok(Math.abs(Math.atan2(Math.sin(main[0].a - rear.a), Math.cos(main[0].a - rear.a))) > 2, 'задня брама з протилежного боку');
  const tw = KW.towers(P, S, gts, KT.TYPES.enclosure.tower, 50, r); ok(tw.length >= 6, 'вежі по кутах'); for (const t of tw) { ok(G.edgeDist(P, t.x, t.y) < 1e-6, 'вежа на мурі'); ok(['round', 'square', 'bastion'].includes(t.k) && t.r > 3, 'вид і розмір вежі'); if (!t.gate) for (const g of gts) ok(Math.hypot(t.x - g.x, t.y - g.y) > g.hw + 8, 'вежа не заходить на браму'); }
  for (const g of gts) { const fl = tw.filter(t => t.gate && Math.hypot(t.x - g.x, t.y - g.y) < 25); if (g.main || g.kind === 'rear') { ok(fl.length === 2, 'дві вежі обабіч брами ' + g.kind); for (const t of fl) ok(Math.hypot(t.x - g.x, t.y - g.y) > g.hw + t.r * 0.9 && t.r > 5, 'вежа брами не перекриває проїзд'); near(Math.hypot(fl[0].x - g.x, fl[0].y - g.y), Math.hypot(fl[1].x - g.x, fl[1].y - g.y), 0.01, 'вежі брами симетричні'); } else ok(fl.length === 0, 'вежі лише біля головної й задньої брам'); }
  for (let i = 0; i < tw.length; i++) for (let j = i + 1; j < tw.length; j++) ok(Math.hypot(tw[i].x - tw[j].x, tw[i].y - tw[j].y) >= (tw[i].r + tw[j].r) * 0.85 - 1e-6, 'вежі не налізають одна на одну');
  const runs = KW.runs(P, S); ok(runs.length === 1 && runs[0].length === 14, 'суцільний мур — одна замкнена ламана');
}

// ---- розкладка споруд (castlelayout): усі види на шестикутниках різного розміру
let axN = 0, axOk = 0;
for (const ty of Object.values(KT.TYPES)) for (const [rad, seed] of [[48, 1], [56, 2], [64, 3]]) {
  const P = hexagon(rad, 0, 0), area = G.area(P), r = A.Rng.stream('castle-test', ty.id + seed), wc = { WK: () => 0, near: Object.assign(() => 99, {}), streets: [], c0: [0, 0], walled: false, w: 4.5 }, S = KW.sides(P, wc), gts = KW.gates(P, S, wc, { rear: !!ty.gates.rear, hw: 3.2 }, r);
  const towers = KW.towers(P, S, gts, ty.tower, ty.tower.step, r), L = KL.make({ P, ty, r, w: 4.5, gates: gts, towers, A: area, nm: 'Тест', sc: Math.max(0.75, Math.min(1.3, Math.sqrt(area / 6500))), cx: 0, cy: 0, waterPt: null, hasWater: false, tier: 3 }), t = `${ty.id}/${rad}`;
  const types = new Set(L.bl.map(b => b.type)); ok(L.bl.length >= 5 && types.size >= 5, t + ': мало споруд'); for (const need of ['donjon', 'palas', 'barracks']) ok(types.has(need), t + ': немає ' + need); if (ty.id !== 'citadel') ok(types.has('chapel'), t + ': немає каплиці');
  for (const b of L.bl) { ok(b.kp && b.pname, t + ': споруда замку без прапора чи назви'); ok(G.rectIn(P, b, 4.5 / 2), t + ': споруда вилізла за мур ' + b.type); }
  for (let i = 0; i < L.bl.length; i++) for (let j = i + 1; j < L.bl.length; j++) ok(!G.rectsHit(L.bl[i], L.bl[j], 0), t + `: перетин ${L.bl[i].type}/${L.bl[j].type}`);
  { const dj = L.bl.find(b => b.type === 'donjon'), ar = b => b.round ? Math.PI * b.w * b.w / 4 : b.w * b.h, oth = L.bl.filter(b => b !== dj && b.type !== 'drill' && b.type !== 'farmyard'), mx = Math.max(...oth.map(ar));
    ok(ar(dj) >= mx * 1.3, t + ': донжон не найбільший ' + (ar(dj) / mx).toFixed(2)); if (!dj.round) { const main = gts.find(g => g.main); axN++; if (Math.abs(Math.sin(2 * (dj.a - main.a))) < 0.06) axOk++; }
    for (const b of L.bl) if (!['donjon', 'palas', 'chapel', 'barracks', 'drill', 'farmyard', 'hq'].includes(b.type)) ok(b.w * b.h >= 84, t + ': дрібна споруда ' + b.type + ' ' + Math.round(b.w * b.h));
    const rows = L.bl.filter(b => ['barracks', 'stable', 'smith', 'armory', 'granary', 'kitchen', 'prison', 'warehouse', 'inn', 'hospital'].includes(b.type)), polys = L.wards.filter(w => w.kind !== 'motte').map(w => w.poly); let al = 0;
    for (const b of rows) { let bd = 1e18, ang = 0; for (const pl of polys) for (let i = 0; i < pl.length; i++) { const e = G.edge(pl, i), d = G.segDist(b.x, b.y, e.ax, e.ay, e.bx, e.by); if (d < bd) { bd = d; ang = Math.atan2(e.dy, e.dx); } } if (Math.abs(Math.sin(b.a - ang)) < 0.12) al++; }
    ok(!rows.length || al / rows.length >= 0.7, t + ': споруди не вирівняні вздовж муру ' + al + '/' + rows.length); }
  for (const w of L.wards) ok(G.simple(w.poly) && G.area(w.poly) > 0, t + ': двір неправильний'); ok(L.paths.length >= 1 && L.paths[0].pts.length >= 6, t + ': немає дороги від воріт');
  if (ty.id === 'hill') { const m = L.inner && L.inner.circle, dj = L.bl.find(b => b.type === 'donjon'); ok(m && dj && Math.hypot(dj.x - m.x, dj.y - m.y) < m.r && dj.round, t + ': донжон не на моті'); } else if (ty.ward === 'two' && area > 4200) ok(L.inner && L.wards.length === 2, t + ': немає внутрішнього двору');
}

ok(axOk / axN >= 0.7, `донжон вирівняний за віссю брами лише у ${axOk} з ${axN}`);

// ---- пошук ділянки на сітці вулиць (castleplot): межа лягає на дороги, проспект не поглинається, вода не заходить усередину
{
  const grid = (step, half, kind, hw) => { const out = []; let id = 0; for (let v = -half; v <= half; v += step) { out.push({ id: id++, kind, hw, pts: [v, -half, v, half], br: [0, 0] }); out.push({ id: id++, kind, hw, pts: [-half, v, half, v], br: [0, 0] }); } return out; };
  for (const [step, A0, water] of [[80, 9000, false], [70, 8000, false], [90, 12000, false], [80, 9000, true]]) {
    const streets = grid(step, 240, 'street', 3.5).concat([{ id: 900, kind: 'avenue', hw: 5, pts: [-240, 40, 240, 40], br: [0, 0] }]), WK = water ? (x => x > 90 ? 2 : 0) : () => 0, t = `сітка ${step} м, ціль ${A0}${water ? ', вода' : ''}`;
    const pl = A.KeepPlot.find({ x0: 0, y0: 0, R: 230, WK: (x, y) => WK(x, y), streets, F: [], B: [], walled: false, fort: null, fortDeep: 0, anchor: null, gap: 5.5, bias: null }, A0, A.Rng.stream('castle-test', 'plot' + step)); ok(pl, t + ': ділянку не знайдено');
    const P = pl.poly; ok(G.simple(P) && G.area(P) > 0, t + ': неправильний багатокутник'); ok(pl.area > A0 * 0.7 && pl.area < A0 * 1.45, t + ': площа ' + Math.round(pl.area));
    for (const p of P) ok(WK(p[0], p[1]) === 0, t + ': вершина у воді');
    for (let x = -240; x <= 240; x += 4) ok(!G.inside(P, x, 40), t + ': проспект опинився всередині');
    let tot = 0, hug = 0; for (let i = 0; i < P.length; i++) { const e = G.edge(P, i), N = Math.max(1, Math.round(e.len / 4)); for (let j = 0; j < N; j++) { const u = (j + 0.5) / N, x = e.ax + e.dx * u, y = e.ay + e.dy * u; tot++; let m = 1e9; for (const st of streets) m = Math.min(m, G.segDist(x, y, st.pts[0], st.pts[1], st.pts[2], st.pts[3]) - st.hw); if (m < 9) hug++; } }
    ok(hug / tot > 0.4, t + ': межа мало йде вздовж доріг ' + (hug / tot).toFixed(2));
  }
}

// ---- замки в містах
const SEEDS = ['a', 'zbyrai', '7'], PER = 10, AFTER = (c, id) => c.buildings.filter(b => b.kp && b.type === id);
let nTown = 0, nKeep = 0, rowN = 0, rowAl = 0; const drawn = [], nbs = [], dom = [], types = {}, mk = (s, fate) => Object.assign({}, s, { fate, ruined: fate === 'ruined', occupier: 'monsters' });
for (const seed of SEEDS) {
  const W = A.generate({ seed, worldType: 'continent', size: 'small' }); let cnt = 0, det = 0, fates = 0;
  for (const s of W.settlements) {
    if (s.rank !== 'regional' && s.rank !== 'capital') continue; if (cnt++ >= PER) break;
    const c = A.Town.build(W, s), k = c.keep, t = `${seed}/${s.name}`; nTown++; if (!k) continue; nKeep++; if (drawn.length < 8) drawn.push(c); types[k.type] = (types[k.type] || 0) + 1; const P = k.poly, kb = c.buildings.filter(b => b.kp), W0 = c.env.waterKind;
    // багатокутник: простий, додатний, у місті, на суходолі
    ok(G.simple(P) && G.area(P) > 0 && k.area > 2500 && k.area < 50000, t + ': форма замку'); ok(Math.hypot(k.x - c.c0[0], k.y - c.c0[1]) + k.r < c.R * 1.1, t + ': замок за межами міста'); for (const p of P) ok(W0(p[0], p[1]) === 0, t + ': вершина муру у воді');
    ok(['hill', 'water', 'citadel', 'enclosure', 'wall'].includes(k.type) && k.name && k.desc && k.tn, t + ': вид замку');
    // мур іде вздовж вулиць (чи берега): більшість периметра поряд із дорогою або водою
    let tot = 0, hug = 0; for (let i = 0; i < P.length; i++) { const e = G.edge(P, i), N = Math.max(1, Math.round(e.len / 4)); for (let j = 0; j < N; j++) { const u = (j + 0.5) / N, x = e.ax + e.dx * u, y = e.ay + e.dy * u; tot++; let m = 1e9; for (const st of c.streets) for (let q = 2; q < st.pts.length; q += 2) m = Math.min(m, G.segDist(x, y, st.pts[q - 2], st.pts[q - 1], st.pts[q], st.pts[q + 1]) - st.hw); if (m < k.w / 2 + 9 || W0(x + e.nx * 5, y + e.ny * 5) !== 0 || W0(x - e.nx * 5, y - e.ny * 5) !== 0) hug++; } }
    ok(hug / tot > 0.4, t + ': мур не йде вздовж доріг ' + (hug / tot).toFixed(2));
    // споруди: комплекс, без перетинів; чужі споруди поза замком, замкові всередині; вулиць усередині немає
    const ty = new Set(kb.map(b => b.type)); ok(kb.length >= 4 && ty.size >= 4 && kb.length === k.ids.length, t + ': комплекс замку ' + kb.length + '/' + ty.size); nbs.push(kb.length); for (const need of ['donjon', 'palas', 'barracks']) ok(ty.has(need), t + ': немає ' + need); if (k.type !== 'citadel') ok(ty.has('chapel'), t + ': немає каплиці');
    for (const b of kb) ok(G.inside(P, b.x, b.y) && b.name && b.owner !== undefined, t + ': споруда замку поза муром чи без назви ' + b.type);
    for (let i = 0; i < kb.length; i++) for (let j = i + 1; j < kb.length; j++) ok(!G.rectsHit(kb[i], kb[j], 0), t + `: перетин ${kb[i].type}/${kb[j].type}`);
    { const dj = AFTER(c, 'donjon')[0], ar = b => b.round ? Math.PI * b.w * b.w / 4 : b.w * b.h, mx = Math.max(...kb.filter(b => b !== dj && b.type !== 'drill' && b.type !== 'farmyard').map(ar)); ok(dj && ar(dj) >= mx * 1.25 && ar(dj) >= 170, t + ': донжон не помітно більший за решту ' + (ar(dj) / mx).toFixed(2)); dom.push(ar(dj) / mx);
      for (const b of kb) if (!['donjon', 'palas', 'chapel', 'barracks', 'drill', 'farmyard', 'hq'].includes(b.type)) ok(b.w * b.h >= 84, t + ': дрібна споруда ' + b.type + ' ' + Math.round(b.w * b.h));
      const wp = k.wards.filter(w => w.kind !== 'motte').map(w => { const q = []; for (let i = 0; i + 3 < w.poly.length; i += 2) q.push([w.poly[i], w.poly[i + 1]]); return q; });
      for (const b of kb) { if (!['barracks', 'stable', 'smith', 'armory', 'granary', 'kitchen', 'prison', 'warehouse', 'inn', 'hospital'].includes(b.type)) continue; let bd = 1e18, ang = 0; for (const pl of wp) for (let i = 0; i < pl.length; i++) { const e = G.edge(pl, i), d = G.segDist(b.x, b.y, e.ax, e.ay, e.bx, e.by); if (d < bd) { bd = d; ang = Math.atan2(e.dy, e.dx); } } rowN++; if (Math.abs(Math.sin(b.a - ang)) < 0.12) rowAl++; } }
    for (const b of c.buildings) if (!b.kp) { ok(!G.inside(P, b.x, b.y) && !G.rectCorners(b, 0).some(q => G.inside(P, q[0], q[1])), t + ': чужа споруда ' + b.type + ' у замку'); ok(!A.TownKeep.clash(k, b, 0), t + ': чужа споруда налягає на мур'); }
    for (const st of c.streets) for (let q = 0; q < st.pts.length; q += 2) ok(!(G.inside(P, st.pts[q], st.pts[q + 1]) && G.edgeDist(P, st.pts[q], st.pts[q + 1]) > 3), t + ': вулиця ' + st.kind + ' у замку');
    // мур: ворота й вежі на ньому; головна брама одна й виходить на вулицю чи площу; внутрішній мур усередині
    const mains = k.gates.filter(g => g.main); ok(mains.length === 1 && k.gates.length >= 1 && k.towers.length >= 3, t + ': брами й вежі'); for (const g of k.gates) ok(G.edgeDist(P, g.x, g.y) < 0.5, t + ': брама не на мурі');
    for (const q of k.towers) ok(G.edgeDist(P, q.x, q.y) < 0.5 && q.r > 3, t + ': вежа не на мурі');
    // брама: парні вежі обабіч головної (якщо мур не руїна), зона перед нею (apron) вільна від чужих споруд
    ok(k.aprons.length === k.gates.length, t + ': немає зон перед брамами'); for (const b of c.buildings) if (!b.kp) for (const q of k.aprons) ok(!G.rectsHit(b, q, 0), t + ': чужа споруда на підході до брами ' + b.type);
    { const g = mains[0], ox = g.x + Math.cos(g.a) * (k.w / 2 + 0.6), oy = g.y + Math.sin(g.a) * (k.w / 2 + 0.6); let m = 1e9; for (const st of c.streets) for (let q = 2; q < st.pts.length; q += 2) m = Math.min(m, G.segDist(ox, oy, st.pts[q - 2], st.pts[q - 1], st.pts[q], st.pts[q + 1]) - st.hw);
      ok(m < 3 || c.features.some(f => f.t === 'plaza' && Math.hypot(f.x - ox, f.y - oy) < f.r + 3), t + ': головна брама без дороги, ' + m.toFixed(1) + ' м'); }
    for (const w of k.wards) { ok(w.poly.length >= 8 && w.poly.length % 2 === 0, t + ': двір'); for (let q = 0; q < w.poly.length; q += 2) ok(G.inside(P, w.poly[q], w.poly[q + 1]) || G.edgeDist(P, w.poly[q], w.poly[q + 1]) < 0.5, t + ': двір за муром'); }
    // особливості видів
    if (k.type === 'hill') { const dj = AFTER(c, 'donjon')[0]; ok(k.inner && k.inner.circle && dj && dj.round && Math.hypot(dj.x - k.inner.circle.x, dj.y - k.inner.circle.y) < k.inner.circle.r, t + ': донжон пагорба не на моті'); }
    if (k.type === 'water') ok(k.gates.some(g => g.kind === 'water'), t + ': немає водяної брами'); if (k.type === 'wall') ok(k.gates.some(g => g.kind === 'sally'), t + ': немає вилазної брами'); if (k.type === 'citadel') ok(k.gates.some(g => g.kind === 'rear'), t + ': немає задньої брами');
    // опис і клацання по замку; точка у дворі, вільна від споруд, дає «замок»
    let hit = null; const bb = G.bbox(P); for (let x = bb[0]; x < bb[2] && !hit; x += 4) for (let y = bb[1]; y < bb[3] && !hit; y += 4) { const h = A.Town.hit(c, x, y); if (h && h.kind === 'castle' && h.o === k) hit = h; }
    ok(hit && A.Town.describe(c, hit).title === k.name, t + ': клацання по двору замку'); { const b = kb[0], h = A.Town.hit(c, b.x, b.y); ok(h && h.kind === 'building' && A.Town.describe(c, h).title, t + ': опис споруди замку'); }
    // детермінованість: повторна збірка того самого міста дає той самий замок (кілька міст на світ)
    if (det++ < 2) { const c2 = A.Town.build(W, s); ok(JSON.stringify(c2.keep) === JSON.stringify(k) && c2.streets.length === c.streets.length && c2.buildings.length === c.buildings.length, t + ': недетерміновано'); }
    // руїни й окупація (кілька міст на світ): той самий замок, але мур у проломах, вежі зменшились, донжон у кублі
    if (fates++ < 2 && seed === 'zbyrai') {
      const len = q => q.runs.reduce((sum, ru) => { for (let i = 2; i < ru.length; i += 2) sum += Math.hypot(ru[i] - ru[i - 2], ru[i + 1] - ru[i - 1]); return sum; }, 0);
      const cr = A.Town.build(W, mk(s, 'ruined')), kr = cr.keep; drawn.push(cr); ok(kr && kr.fate === 'ruined' && kr.type === k.type && Math.abs(kr.area - k.area) < 1, t + ': руїни змінили замок'); ok(len(kr) < len(k) && kr.runs.length > 1 && kr.towers.length < k.towers.length, t + ': мур руїн без проломів'); ok(cr.buildings.filter(b => b.kp).every(b => b.cond === 'ruined' || b.cond === 'worn'), t + ': споруди руїн цілі');
      const co = A.Town.build(W, mk(s, 'occupied')), ko = co.keep; ok(ko && ko.fate === 'occupied' && ko.type === k.type, t + ': окупація змінила замок'); const dj = AFTER(co, 'donjon')[0]; ok(dj && dj.cond === 'lair', t + ': донжон окупованого замку не в кублі');
      ok(A.Town.describe(co, { kind: 'castle', o: ko }).sub.includes('захоплений') && A.Town.describe(cr, { kind: 'castle', o: kr }).sub.includes('руїни'), t + ': опис долі замку');
    }
  }
}
// ---- малювання замку (render/townkeep.js, townkeepb.js) на «полотні»-пустушці: без винятків, споруди живих замків малює окремий малювальник, руїни лишає загальному коду
{
  require('../render/townkeep.js'); require('../render/townkeepb.js'); const calls = {}, g = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 60 }) : k in t ? t[k] : () => { calls[k] = (calls[k] || 0) + 1; }, set: (t, k, v) => { t[k] = v; return true; } });
  for (const c of drawn) for (const k of [0.25, 0.6, 1.5, 4]) { const x = { g, k, lod: () => 1, setA: v => { g.globalAlpha = v; }, vis: () => true, TAU: Math.PI * 2, halo: () => { calls.halo = (calls.halo || 0) + 1; } };
    A.TownKeepDraw.ground(x, c); A.TownKeepDraw.walls(x, c); A.TownKeepDraw.label(x, c); for (const b of c.buildings) if (b.kp) ok(A.TownKeepBuild.draw(x, b, c) === (b.cond !== 'ruined' && b.cond !== 'burnt' && b.cond !== 'lair'), 'малювання споруди замку ' + b.type + '/' + b.cond); }
  ok(calls.fill > 1000 && calls.stroke > 1000 && calls.arc > 200 && calls.fillRect > 100 && calls.setLineDash > 100, 'малювання замку нічого не малює: ' + JSON.stringify(calls));
}
nbs.sort((a, b) => a - b); ok(nbs[Math.floor(nbs.length / 2)] >= 7, 'медіана споруд у замку ' + nbs[Math.floor(nbs.length / 2)]);
ok(rowAl / rowN >= 0.9, `ряди споруд вздовж муру: ${rowAl} з ${rowN}`); dom.sort((a, b) => a - b); ok(dom[Math.floor(dom.length / 2)] >= 1.4, 'медіана переваги донжона ' + dom[Math.floor(dom.length / 2)].toFixed(2));
ok(nKeep >= nTown * 0.85, `замок є лише у ${nKeep} з ${nTown} міст`); ok(Object.keys(types).length >= 3, 'мало різних видів замків: ' + JSON.stringify(types));
console.log(`castle: ${n} перевірок, ${nKeep}/${nTown} міст із замком, види ${JSON.stringify(types)}`);
