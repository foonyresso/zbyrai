// Океани основного світу: між материками велетенські простори води з нічийними островами, старт на суходолі. Запуск: node tools/world-oceans.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), vm = require('node:vm');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const src = fs.readFileSync(path.join(__dirname, '..', 'medieval-world/src/generation/world/terrain.js'), 'utf8');
const hs = (t) => { let h = 2166136261; for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
let seed = '', kind = 'cont';
const ctx = vm.createContext({ PI2: Math.PI * 2, PI: Math.PI, hs, $: (id) => ({ value: id == '#wtype' ? kind : id == '#wseed' ? seed : '' }), SE: false });
vm.runInContext(src.replace(/\b(const|let) /g, 'var '), ctx);
const world = (s, k = 'cont') => { seed = s; kind = k; vm.runInContext('wsetup()', ctx); return ctx.WLD; };
const land = (W, x, y) => ctx.cont(x, y, W.s, W.ox, W.oy, W.w) - W.lv > 0;

/* ґратка 1 км на 240×240 км навколо старту: площі суходолів і відстань води до найближчого великого суходолу */
function scan(W, R = 120000, st = 1000) {
  const n = 2 * R / st, g = new Uint8Array(n * n), comp = new Int32Array(n * n), size = [0];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g[j * n + i] = land(W, -R + i * st, -R + j * st) ? 1 : 0;
  for (let k = 0; k < n * n; k++) {
    if (!g[k] || comp[k]) continue;
    const id = size.length; let q = [k], c = 0; comp[k] = id;
    while (q.length) { const p = q.pop(), x = p % n, y = (p / n) | 0; c++; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const m = Y * n + X; if (g[m] && !comp[m]) { comp[m] = id; q.push(m); } } }
    size.push(c);
  }
  const big = size.map((c) => c >= 300), dist = new Int32Array(n * n).fill(-1); let q = [];
  for (let k = 0; k < n * n; k++) if (g[k] && big[comp[k]]) { dist[k] = 0; q.push(k); }
  for (let h = 0; h < q.length; h++) { const p = q[h], x = p % n, y = (p / n) | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const m = Y * n + X; if (dist[m] < 0) { dist[m] = dist[p] + 1; q.push(m); } } }
  const wd = []; for (let k = 0; k < n * n; k++) if (!g[k] && dist[k] >= 0) wd.push(dist[k]);
  wd.sort((a, b) => a - b);
  return { n, g, comp, size, wd, mid: comp[(n / 2) * n + n / 2], p90: wd[Math.floor(wd.length * .9)], max: wd[wd.length - 1] };
}
const cache = {}, sc = (s) => cache[s] || (cache[s] = scan(world(s)));
const seeds = Array.from({ length: 8 }, (_, i) => 's' + i);
test('між материками велетенські океани: 90% води далі за 18 км від великого суходолу, найглибша точка далі за 35 км (простори води помірні)', () => {
  for (const s of seeds) { const r = sc(s); assert.ok(r.p90 >= 18 && r.max >= 35, s + ': p90=' + r.p90 + ' км, max=' + r.max + ' км'); }
});
test('в океанах є нічийні острови: і малі, і великі', () => {
  for (const s of seeds) {
    const r = sc(s), small = r.size.filter((c) => c >= 1 && c < 30).length, large = r.size.filter((c) => c >= 30 && c < 300).length;
    assert.ok(small >= 20 && large >= 3, s + ': малих ' + small + ', великих ' + large);
  }
});
test('старт на суходолі площею від 100 км² (не на крихітному острівці)', () => {
  for (const s of seeds) { const W = world(s), e = (x, y) => ctx.cont(x, y, W.s, W.ox, W.oy, W.w) + .25 - W.lv; assert.ok(e(0, 0) > 0, s + ': старт у воді'); const r = sc(s); assert.ok(r.size[r.mid] >= 100, s + ': площа ' + r.size[r.mid]); }
});
test('суходіл без океанів не змінився: «Суходіл» лишається єдиним материком', () => {
  const r = scan(world('a1', 'land')); assert.ok(r.size[r.mid] >= 5000, 'площа ' + r.size[r.mid]);
});
if (failed) { console.log('\nПровалено: ' + failed); process.exit(1); } else console.log('\nУсі перевірки пройдено');
