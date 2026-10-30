// Тести рівнів, небезпеки й локацій.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const [worldType, seed] of [['continent', 'a'], ['continent', 'zbyrai'], ['continent', 'x']]) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), w = W.w, N = w * W.h, K = W.params.kmPerCell;
  // рівень росте з відстанню від центру: у центрі низький, на краю високий, кореляція додатна
  const cx = W.origin.x, cy = W.origin.y; let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, n = 0;
  for (let i = 0; i < N; i += 5) { const d = Math.hypot(i % w - cx, (i / w | 0) - cy), l = W.level[i]; sx += d; sy += l; sxx += d * d; syy += l * l; sxy += d * l; n++; }
  const corr = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)); assert.ok(corr > 0.95, `${t}: кореляція рівня з відстанню ${corr}`);
  assert.ok(W.level[(cy | 0) * w + (cx | 0)] <= 3, `${t}: рівень у центрі`);
  // середні рівні: регіон — середнє по його суші, провінція — середнє по її регіонах
  const sum = W.regions.map(() => 0), cnt = W.regions.map(() => 0);
  for (let i = 0; i < N; i++) { const r = W.region[i]; if (r >= 0 && W.land[i] && !W.lake[i]) { sum[r] += W.level[i]; cnt[r]++; } }
  W.regions.forEach((g, k) => { if (cnt[k]) assert.equal(g.level, Math.round(sum[k] / cnt[k]), `${t}: рівень регіону`); assert.ok(g.levelMin <= g.level && g.level <= g.levelMax); });
  for (const p of W.provinces) assert.equal(p.level, Math.round(p.regions.reduce((a, id) => a + W.regions[id].level, 0) / p.regions.length), `${t}: рівень провінції`);
  // небезпека: біля поселень безпечно, і навпаки — далеко від усіх живих поселень не буває «безпечно»
  const live = W.settlements.filter(s => !s.ruined && !s.fate); let seen = 0;
  for (let i = 0; i < N; i += 3) { if (!W.land[i] || W.lake[i]) continue; const x = i % w, y = i / w | 0; let d = 1e9; for (const s of live) d = Math.min(d, Math.hypot(s.x - x, s.y - y)); d *= K;
    if (d > 6) { assert.ok(W.tier[i] >= 1, `${t}: безпечна клітина за ${d} км від поселень`); seen++; } if (d < 0.2 && !W.settlements.some(q => q.fate && Math.hypot(q.x - x, q.y - y) <= 9)) assert.equal(W.tier[i], 0, `${t}: небезпека біля поселення`); }
  // доля поселень: деякі зруйновані чи окуповані, але не столиці й не центри регіонів; окуповані мають мешканців-монстрів
  const fallen = W.settlements.filter(s => s.fate), nonRuin = W.settlements.filter(s => !s.ruined);
  assert.ok(fallen.length >= nonRuin.length * 0.05 && fallen.length <= nonRuin.length * 0.3, `${t}: частка занепалих ${fallen.length}/${nonRuin.length}`);
  for (const s of fallen) {
    assert.ok(s.rank !== 'capital' && s.rank !== 'regional', `${t}: занепалий ${s.rank}`); assert.equal(s.pop, 0); assert.ok(s.popBefore > 0);
    if (s.fate === 'occupied') { assert.ok(s.monsters.length > 0 && s.level >= 1, `${t}: окуповане без мешканців`); assert.ok(W.tier[s.i] >= 2, `${t}: окуповане в безпечній зоні`); } else assert.equal(s.fate, 'ruined');
  }
  for (const p of W.provinces) assert.equal(p.pop, p.regions.reduce((a, id) => a + W.regions[id].pop, 0), `${t}: населення провінції`);
  // локації
  assert.ok(W.sites.length > 20, `${t}: мало локацій`);
  const names = new Set();
  for (const s of W.sites) {
    const TY = A.Danger.TYPE_BY[s.type], wet = !W.land[s.i] || !!W.lake[s.i]; assert.equal(wet, !!TY.water, `${t}: ${s.type} не в своєму середовищі`); assert.ok(!/\d/.test(s.name), `${t}: цифри в назві`); assert.ok(!names.has(s.name), `${t}: дубль назви ${s.name}`); names.add(s.name);
    assert.equal(s.tier, W.tier[s.i]); const T = A.Danger.TYPE_BY[s.type]; assert.ok(s.tier >= T.t[0] && s.tier <= T.t[1], `${t}: ${s.type} у небезпеці ${s.tier}`);
    if (s.type !== 'waterfall') assert.ok(!W.river[s.i], `${t}: локація на річці`);
    if (T.mon && s.tier >= 1) assert.ok(s.monsters.length > 0, `${t}: ${s.type} без монстрів`); if (!T.mon) assert.equal(s.monsters.length, 0);
    for (const m of s.monsters) { assert.ok(m.name && m.count >= 1 && m.level >= 1); }
    for (const q of W.settlements) assert.ok(Math.hypot(q.x - s.x, q.y - s.y) >= 4, `${t}: локація впритул до поселення`);
  }
  // гарантовані мінімуми сильних мешканців
  const lead = x => x.monsters.length ? Math.max(...x.monsters.map(m => m.kindIdx)) : -1, regOf = x => W.region[x.i], provOf = x => W.regions[W.region[x.i]].prov;
  const rc = W.regions.map(() => 0), bc = W.provinces.map(() => 0); let sup = 0;
  for (const x of W.sites) { const l = lead(x); if (l === 3 && regOf(x) >= 0) rc[regOf(x)]++; if (l >= 4 && regOf(x) >= 0) bc[provOf(x)]++; if (l >= 5) sup++; }
  W.regions.forEach((g, k) => { if (g.area >= 40) assert.ok(rc[k] >= 1, `${t}: регіон ${k} без міні-боса`); });
  W.provinces.forEach((p, k) => assert.ok(bc[k] >= 1, `${t}: провінція ${k} без боса`));
  assert.ok(sup >= Math.max(1, Math.floor(W.provinces.length / 7)), `${t}: супербосів ${sup}`);
  // чим далі від поселень, тим сильніші монстри: середній рівень типу монстра за небезпекою не спадає
  const avg = [0, 0, 0, 0, 0, 0, 0], c2 = [0, 0, 0, 0, 0, 0, 0]; for (const s of W.sites) if (s.monsters.length && W.group[s.i] < 13) { avg[s.tier] += Math.max(...s.monsters.map(m => m.kindIdx)); c2[s.tier]++; }
  let prev = -1; for (let k = 1; k < 7; k++) if (c2[k] >= 5) { const v = avg[k] / c2[k]; assert.ok(v >= prev - (c2[k] < 30 ? 0.4 : 0.05), `${t}: сила монстрів спадає на небезпеці ${k}`); prev = v; }
  // вода: небезпека є, і дальні води страшніші за ближні; монстри, лігва й боси всіх рівнів у кожному океані й морі
  const wet = i => !W.land[i] || !!W.lake[i], wc = [0, 0, 0, 0, 0, 0, 0]; for (let i = 0; i < N; i++) if (wet(i)) wc[W.tier[i]]++;
  assert.ok(wc.slice(2).reduce((a, b) => a + b, 0) > wc.reduce((a, b) => a + b, 0) * 0.5 && wc[6] > 0, `${t}: вода майже безпечна ${wc}`);
  const ws = W.sites.filter(x => wet(x.i)), leadK = x => x.monsters.length ? Math.max(...x.monsters.map(m => m.kindIdx)) : -1;
  assert.ok(ws.length >= 20 && new Set(ws.map(x => x.type)).size >= 6, `${t}: мало водних локацій ${ws.length}`);
  W.waterBodies.forEach((b, id) => { const cs = ws.filter(x => W.waterBody[x.i] === id); if (b.kind === 'ocean') { assert.ok(cs.filter(x => leadK(x) === 4).length >= 2 && cs.filter(x => leadK(x) >= 5).length >= 1 && cs.filter(x => leadK(x) === 3).length >= 3, `${t}: ${b.name} без босів`); } else if (b.kind === 'sea' && b.cells >= 12) { assert.ok(cs.filter(x => leadK(x) >= 4).length >= 1 && cs.filter(x => leadK(x) === 3).length >= 2, `${t}: ${b.name} без босів`); } });
  for (const x of ws) if (x.tier >= 1 && A.Danger.TYPE_BY[x.type].mon) assert.ok(x.monsters.length > 0, `${t}: водна локація без монстрів`);
  // руїни завжди з босом (суша, острови, вода)
  for (const x of W.sites) if (A.Danger.TYPE_BY[x.type].ruin) assert.ok(leadK(x) >= 4, `${t}: руїни ${x.name} без боса`);
  for (const q of W.settlements) if (q.ruined) assert.ok(q.monsters && q.monsters.some(m => m.kindIdx >= 4), `${t}: руїни поселення без боса`);
  // нічиї острови: небезпечні, і на кожному переважає одна сім'я монстрів
  for (const isl of W.islands) {
    for (const i of isl.cells) assert.ok(W.tier[i] >= 2, `${t}: острів без монстрів`);
    const own = W.sites.filter(x => W.island[x.i] === isl.id && x.monsters.length); if (own.length < 3) continue;
    const dom = own.filter(x => x.monsters.some(m => A.Danger.famOf(m.name) === isl.fam)).length; assert.ok(dom >= own.length * 0.6, `${t}: на острові ${isl.famName} лише ${dom}/${own.length}`);
  }
  // детермінованість
  const W2 = A.generate({ seed, worldType, size: 'small' }); assert.deepEqual(W2.sites.map(s => [s.i, s.type, s.name]), W.sites.map(s => [s.i, s.type, s.name]));
}
console.log('danger.test.js ok');
// шар небезпеки за замовчуванням увімкнений
assert.ok(/data-layer="danger"\s+checked/.test(require('node:fs').readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8')), 'шар небезпеки вимкнений за замовчуванням');
console.log('danger layer default ok');
