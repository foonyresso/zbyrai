// Межі провінцій по воді: суцільні, без розривів між плитками, кожен обрив лежить на лінії дикого океану. Запуск: node tools/world-borders.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), vm = require('node:vm');
if (!process.env.BORDERS) { console.log('Пропущено (повільний, ~5 хв): BORDERS=1 node tools/world-borders.test.js'); process.exit(0); }
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const src = (d, f) => fs.readFileSync(path.join(__dirname, '..', 'medieval-world/src', d, 'world', f), 'utf8').replace(/\b(const|let) /g, 'var ');
const hs = (t) => { let h = 2166136261; for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
let seed = '';
const cv = () => ({ width: 0, height: 0, getContext: () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} }) });
const ctx = vm.createContext({ PI2: Math.PI * 2, PI: Math.PI, Math, hs, SE: false, tier: 0, Rm: 100, RV: null, BIOK: 'grass', BTG: { grass: [.5, .5] }, rfarD: () => 1, RB: [26,36,50,70,110,150,200], BC: 3000, cname: () => "Нм", S: 1, document: { createElement: cv }, $: (id) => ({ value: id == '#wtype' ? 'cont' : id == '#wseed' || id == '#seed' ? seed : '' }), provCol: () => [100, 100, 100] });
const L0=(m)=>require('fs').writeSync(2,m+'\n');
try {
  for (const f of ['terrain.js', 'rivers.js', 'settlements.js', 'regions.js']) { L0(f); vm.runInContext(src('generation', f), ctx); }
  vm.runInContext(src('render', 'regions.js').split('let BCK')[0], ctx);
} catch (e) { console.log('Не вдалося завантажити модулі:', e.message); process.exit(1); }
const key = (x, y) => Math.round(x) + ',' + Math.round(y);
function scan(s, R = 3) {
  seed = s; vm.runInContext('wsetup()', ctx); vm.runInContext('hh()', ctx);
  const deg = new Map(), wild = [];
  for (let tj = -R; tj < R; tj++) for (let ti = -R; ti < R; ti++) {
    const t = vm.runInContext(`bTile(${ti},${tj})`, ctx);
    for (const q of t.seg[2]) for (const [x, y] of [[q[0], q[1]], [q[2], q[3]]]) deg.set(key(x, y), (deg.get(key(x, y)) || 0) + 1);
    for (const q of t.wild) wild.push(q);
  }
  const wk = new Set(); for (const q of wild) { wk.add(key(q[0], q[1])); wk.add(key(q[2], q[3])); }
  return { ends: [...deg].filter(([, d]) => d == 1).map(([k]) => k), wk, n: deg.size };
}
for (const s of ['s0', 's1', 's2']) test('зерно ' + s + ': кожен обрив межі по воді лежить на межі територіальних вод', () => {
  const r = scan(s), bad = r.ends.filter((k) => !r.wk.has(k));
  assert.ok(r.n > 0, 'меж по воді нема');
  assert.equal(bad.length, 0, 'розривів: ' + bad.length + ' (' + bad.slice(0, 3).join(' ') + ')');
});
if (failed) { console.log('\nПровалено: ' + failed); process.exit(1); } else console.log('\nУсі перевірки пройдено');
