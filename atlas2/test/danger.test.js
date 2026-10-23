// Тести рівнів, небезпеки й локацій.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const [worldType, seed] of [['continent', 'a'], ['continent', 'zbyrai'], ['islands', 'k']]) {
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
  const live = W.settlements.filter(s => !s.ruined); let seen = 0;
  for (let i = 0; i < N; i += 3) { if (!W.land[i] || W.lake[i]) continue; const x = i % w, y = i / w | 0; let d = 1e9; for (const s of live) d = Math.min(d, Math.hypot(s.x - x, s.y - y)); d *= K;
    if (d > 6) { assert.ok(W.tier[i] >= 1, `${t}: безпечна клітина за ${d} км від поселень`); seen++; } if (d < 0.2) assert.equal(W.tier[i], 0, `${t}: небезпека біля поселення`); }
  // локації
  assert.ok(W.sites.length > 20, `${t}: мало локацій`);
  const names = new Set();
  for (const s of W.sites) {
    assert.ok(W.land[s.i] && !W.lake[s.i], `${t}: локація у воді`); assert.ok(!/\d/.test(s.name), `${t}: цифри в назві`); assert.ok(!names.has(s.name), `${t}: дубль назви ${s.name}`); names.add(s.name);
    assert.equal(s.tier, W.tier[s.i]); const T = A.Danger.TYPE_BY[s.type]; assert.ok(s.tier >= T.t[0] && s.tier <= T.t[1], `${t}: ${s.type} у небезпеці ${s.tier}`);
    if (s.type !== 'waterfall') assert.ok(!W.river[s.i], `${t}: локація на річці`);
    if (T.mon && s.tier >= 1) assert.ok(s.monsters.length > 0, `${t}: ${s.type} без монстрів`); if (!T.mon) assert.equal(s.monsters.length, 0);
    for (const m of s.monsters) { assert.ok(m.name && m.count >= 1 && m.level >= 1); }
    for (const q of W.settlements) assert.ok(Math.hypot(q.x - s.x, q.y - s.y) >= 4, `${t}: локація впритул до поселення`);
  }
  // чим далі від поселень, тим сильніші монстри: середній рівень типу монстра за небезпекою не спадає
  const avg = [0, 0, 0, 0, 0, 0, 0], c2 = [0, 0, 0, 0, 0, 0, 0]; for (const s of W.sites) if (s.monsters.length) { avg[s.tier] += Math.max(...s.monsters.map(m => m.kindIdx)); c2[s.tier]++; }
  let prev = -1; for (let k = 1; k < 7; k++) if (c2[k] >= 5) { const v = avg[k] / c2[k]; assert.ok(v >= prev - 0.05, `${t}: сила монстрів спадає на небезпеці ${k}`); prev = v; }
  // детермінованість
  const W2 = A.generate({ seed, worldType, size: 'small' }); assert.deepEqual(W2.sites.map(s => [s.i, s.type, s.name]), W.sites.map(s => [s.i, s.type, s.name]));
}
console.log('danger.test.js ok');
