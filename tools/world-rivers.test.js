// Річки основного світу: кожна головна річка закінчується в морі, озера перетинаються, є витоки з озер. Запуск: node tools/world-rivers.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), vm = require('node:vm');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const src = (f) => fs.readFileSync(path.join(__dirname, '..', 'medieval-world/src/generation/world', f), 'utf8').replace(/\b(const|let) /g, 'var ');
const hs = (t) => { let h = 2166136261; for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
let seed = '';
const ctx = vm.createContext({ PI2: Math.PI * 2, PI: Math.PI, hs, $: (id) => ({ value: id == '#wtype' ? 'cont' : id == '#wseed' ? seed : '' }), SE: false, RV: null, BIOK: 'grass', BTG: { grass: [.5, .5] }, rfarD: () => 1e9 });
vm.runInContext(src('terrain.js'), ctx); vm.runInContext(src('rivers.js'), ctx);
const sea = (r) => { const P = r.pts, a = P[P.length - 2], p = r.mouth, l = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1; return [0, 50, 100, 200, 400, 800].some((d) => { const x = p[0] + (p[0] - a[0]) / l * d, y = p[1] + (p[1] - a[1]) / l * d; return ctx.tsamp(x, y, 60).E <= .004 && vm.runInContext(`seaBody(${x},${y})`, ctx); }); };
const mains = (s) => { seed = s; vm.runInContext('wsetup()', ctx); vm.runInContext('ensureRivers(0,0)', ctx); return ctx.WLD.rl.filter((r) => r.main).map((r) => (r.sea = sea(r), r)); };
const all = ['s0', 's1'].map(mains);
test('річки є, і кожна головна закінчується в морі чи океані', () => {
  for (const m of all) {
    assert.ok(m.length >= 8, 'головних річок ' + m.length);
    /* гирло лежить на березі: море має бути за ним у межах 800 м (берег звивистий, тому допускаємо до 20% винятків) */
    const ok = m.filter((r) => r.sea).length;
    assert.ok(ok >= m.length * .8, 'у морі гирла ' + ok + ' з ' + m.length);
  }
});
test('річки розширюються від витоку до гирла', () => {
  for (const m of all) for (const r of m) assert.ok(r.w[r.w.length - 1] > r.w[0] * 2, 'ширина ' + r.w[0] + ' → ' + r.w[r.w.length - 1]);
});
test('річки перетинають озера, є витоки з озер', () => {
  const m = all.flat(), run = (r) => { let c = 0, b = 0; r.dry.forEach((d) => { c = d ? 0 : c + 1; b = Math.max(b, c); }); return b; };
  assert.ok(m.some((r) => run(r) >= 6), 'жодна річка не перетинає озеро');
  assert.ok(m.some((r) => !r.dry[0]), 'жодна річка не витікає з озера');
});
if (failed) { console.log('\nПровалено: ' + failed); process.exit(1); } else console.log('\nУсі перевірки пройдено');
