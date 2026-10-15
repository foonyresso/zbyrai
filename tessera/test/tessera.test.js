// Тести Tessera. Запуск: node tessera/test/tessera.test.js
const assert = require('node:assert/strict');
const T = require('../tessera-core.js');
let failed = 0;
function test(name, fn) { try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const base = id => Object.assign(T.defaults(id), { W: 400, H: 300, gap: 0, size: 40, chaos: 0, rot: 0 });
const polys = sc => sc.shapes.filter(s => s.t === 'p');
// скільки фігур накриває точку (у системі координат візерунка, до повороту)
function cover(sc, x, y) { let n = 0; for (const s of sc.shapes) { if (s.t === 'p' ? T.pointInPoly(x, y, s.pts) : s.t === 'o' ? Math.hypot(x - s.x, y - s.y) < s.r : false) n++; } return n; }
function samples(sc, N, margin) { const r = T.rng('pts'), o = []; for (let i = 0; i < N; i++) o.push([(r() - .5) * (sc.W - 2 * margin), (r() - .5) * (sc.H - 2 * margin)]); return o; }

console.log('Tessera');

test('усі візерунки будують фігури зі скінченними координатами', () => {
  for (const d of T.PATTERNS) {
    const p = base(d.id); if (d.k) p.k = d.k.def; const sc = T.buildScene(p);
    assert.ok(sc.count > 0, d.id + ': порожньо');
    for (const s of sc.shapes) { const v = s.t === 'o' ? [s.x, s.y, s.r] : s.pts; for (const x of v) assert.ok(Number.isFinite(x), d.id + ': NaN'); assert.ok(s.ci >= 0 && s.ci < sc.ncol, d.id + ': індекс кольору'); }
  }
});

test('мозаїки лягають без щілин і перекриттів: кожна точка накрита рівно однією фігурою', () => {
  for (const id of ['hex', 'tri', 'square', 'rect', 'rhomb', 'brick', 'weave', 'herring', 'cairo', 'octsq', 'trihex', 'cubes']) {
    for (const rot of [0, 23]) {
      const sc = T.buildScene(Object.assign(base(id), { rot })), cs = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
      for (const [x, y] of samples(sc, 250, 30)) { const fx = x * cs + y * sn, fy = -x * sn + y * cs; assert.equal(cover(sc, fx, fy), 1, `${id} rot=${rot} точка ${x.toFixed(1)},${y.toFixed(1)}`); }
    }
  }
});

test('щільні n-кутники не перекриваються, щільність висока, а n=3/4/6 — справжні мозаїки', () => {
  const dens = {};
  for (const n of [5, 7, 8, 9, 10, 12]) {
    const sc = T.buildScene(Object.assign(base('ngon'), { k: n })); let hit = 0, N = 1500;
    for (const [x, y] of samples(sc, N, 30)) { const c = cover(sc, x, y); assert.ok(c <= 1, `n=${n}: перекриття`); hit += c; }
    dens[n] = hit / N;
  }
  assert.ok(dens[5] > .8, 'п’ятикутники ' + dens[5]); assert.ok(dens[7] > .75, 'семикутники ' + dens[7]); assert.ok(dens[8] > .8, 'вісімкутники ' + dens[8]);
  for (const n of [3, 4, 6]) { const sc = T.buildScene(Object.assign(base('ngon'), { k: n })); for (const [x, y] of samples(sc, 150, 30)) assert.equal(cover(sc, x, y), 1, 'n=' + n); }
});

test('відстань між фігурами зменшує покриття, а на повний зазор фігури не зникають', () => {
  const cov = g => { const sc = T.buildScene(Object.assign(base('hex'), { gap: g })); let h = 0; for (const [x, y] of samples(sc, 800, 30)) h += cover(sc, x, y); return h / 800; };
  const a = cov(0), b = cov(6), c = cov(14); assert.ok(a > .99 && b < a && c < b, [a, b, c].join(' '));
  assert.ok(T.buildScene(Object.assign(base('hex'), { gap: 120 })).shapes.every(s => s.pts.every(Number.isFinite)));
});

test('поворот: кути полотна лишаються заповненими', () => {
  for (const rot of [15, 45, 77]) { const sc = T.buildScene(Object.assign(base('hex'), { rot })), c = Math.cos(-rot * Math.PI / 180), s = Math.sin(-rot * Math.PI / 180); for (const [x, y] of [[-195, -145], [195, -145], [195, 145], [-195, 145]]) assert.ok(cover(sc, x * c - y * s, x * s + y * c) >= 1, 'rot=' + rot); }
});

test('детермінованість: те саме зерно дає ту саму сцену, інше — іншу (рандомні кольори й хаос)', () => {
  const p = Object.assign(base('star5'), { cmode: 'random', chaos: .4, ncol: 5 }), a = T.buildScene(p), b = T.buildScene(p), c = T.buildScene(Object.assign({}, p, { seed: 'other' }));
  assert.deepEqual(a.shapes, b.shapes); assert.notDeepEqual(a.shapes.map(s => s.ci), c.shapes.map(s => s.ci));
});

test('режими чергування кольорів використовують лише ncol кольорів і всі вони трапляються', () => {
  for (const cmode of T.CMODES) { const sc = T.buildScene(Object.assign(base('square'), { cmode, ncol: 3 })), seen = new Set(sc.shapes.map(s => s.ci)); assert.ok([...seen].every(i => i < 3), cmode); if (cmode !== 'single') assert.ok(seen.size >= 2, cmode + ' ' + seen.size); }
  assert.equal(new Set(T.buildScene(Object.assign(base('square'), { cmode: 'single', ncol: 1 })).shapes.map(s => s.ci)).size, 1);
});

test('зошит: біле тло, світло-сині лінії; лінійка має червоне поле; крапки — суцільні кружечки', () => {
  const nb = T.buildScene(Object.assign(T.defaults('notebook'), T.PAT.notebook.preset, { pattern: 'notebook', W: 300, H: 200, size: 20 }));
  assert.equal(nb.bg, '#ffffff'); assert.ok(nb.shapes.every(s => s.t === 'l')); assert.ok(nb.count >= 25);
  const ru = T.buildScene(Object.assign(T.defaults('ruled'), T.PAT.ruled.preset, { pattern: 'ruled', W: 300, H: 200 })); assert.ok(ru.shapes.some(s => s.ci === 1));
  const dt = T.buildScene(Object.assign(base('dots'), { size: 20 })); assert.ok(dt.shapes.every(s => s.t === 'o' && s.solid));
});

test('мінімальний розмір обмежує кількість фігур', () => {
  const sc = T.buildScene(Object.assign(base('hex'), { W: 8000, H: 6000, size: 4 })); assert.ok(sc.clamped && sc.count < 300000, String(sc.count));
});

test('SVG: коректна структура, стільки елементів, скільки фігур; ескейпу немає потреби (лише #hex)', () => {
  for (const mode of T.MODES) {
    const sc = T.buildScene(Object.assign(base('hex'), { mode, rot: 15 })), svg = T.toSVG(sc);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && svg.includes('viewBox="0 0 400 300"') && svg.includes('rotate(15)'));
    assert.equal((svg.match(/<path /g) || []).length, sc.count);
  }
  const sc = T.buildScene(Object.assign(base('seigaiha'), { mode: 'both' })), svg = T.toSVG(sc); assert.equal((svg.match(/<circle /g) || []).length, sc.count);
});

test('малювання на canvas викликає fill/stroke і не падає (імітація контексту)', () => {
  const calls = {}; const ctx = new Proxy({}, { get: (t, k) => (...a) => { calls[k] = (calls[k] || 0) + 1; }, set: () => true });
  for (const mode of T.MODES) T.draw(ctx, T.buildScene(Object.assign(base('flower'), { mode })), 2);
  assert.ok(calls.fill > 0 && calls.stroke > 0 && calls.arc > 0);
});

test('JSON: круговий обмін зберігає параметри, чужі й зіпсовані дані відсікаються', () => {
  const p = T.clampParams(Object.assign(base('seigaiha'), { k: 4, rot: 33, colors: ['#112233', '#abcdef', '#000000', '#ffffff', '#123456', '#654321'], bg: '#eeeeee' }));
  assert.deepEqual(T.fromJSON(JSON.stringify(T.toJSON(p))), p); assert.deepEqual(T.fromJSON(JSON.stringify(p)), p);
  assert.throws(() => T.fromJSON('{"pattern":"nope"}')); assert.throws(() => T.fromJSON('null'));
  const bad = T.clampParams({ pattern: 'hex', size: 'x', W: 1e9, colors: ['red', 5], bg: 'url(x)', mode: 'zzz' });
  assert.ok(bad.W <= 8192 && bad.W * bad.H <= 50e6 && /^#[0-9a-f]{6}$/i.test(bad.bg) && bad.colors.length === 6 && T.MODES.includes(bad.mode) && Number.isFinite(bad.size));
});

test('випадкова палітра: валідні кольори, достатній контраст із тлом; «Зарандомити» поважає замки', () => {
  const lum = h => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const r = T.rng('pal'); for (let i = 0; i < 60; i++) { const p = T.randomPalette(r); assert.ok(/^#[0-9a-f]{6}$/.test(p.bg) && p.colors.length === 6 && p.colors.every(c => /^#[0-9a-f]{6}$/.test(c))); assert.ok(p.colors.filter(c => Math.abs(lum(c) - lum(p.bg)) > .12).length >= 4, 'контраст ' + i); }
  const cur = base('hex'); const out = T.randomize(cur, { pattern: true, colors: true }, T.rng(7));
  assert.equal(out.pattern, 'hex'); assert.deepEqual(out.colors, cur.colors); assert.equal(out.bg, cur.bg);
  const seen = new Set(); for (let i = 0; i < 80; i++) { const o = T.randomize(cur, {}, T.rng(i)); seen.add(o.pattern); T.buildScene(o); } assert.ok(seen.size > 15, 'різноманітність ' + seen.size);
});

test('кожна група має візерунки, id унікальні, описи й назви українською непорожні', () => {
  const ids = new Set(T.PATTERNS.map(p => p.id)); assert.equal(ids.size, T.PATTERNS.length); assert.ok(T.PATTERNS.length >= 35);
  for (const [g] of T.GROUPS) assert.ok(T.PATTERNS.some(p => p.group === g), g);
  for (const p of T.PATTERNS) assert.ok(p.name && p.desc && p.size, p.id);
});

test('поворот фігур не рухає сітку; «послідовно» не залежить від кількості в ряду', () => {
  const a = T.buildScene(Object.assign(base('star5'), { turn: 0 })), b = T.buildScene(Object.assign(base('star5'), { turn: 30 }));
  assert.equal(a.count, b.count); assert.notDeepEqual(a.shapes[3].pts, b.shapes[3].pts);
  const cx = s => s.pts.filter((_, i) => i % 2 === 0).reduce((x, y) => x + y, 0) / (s.pts.length / 2);
  assert.ok(Math.abs(cx(a.shapes[3]) - cx(b.shapes[3])) < 1, 'центр фігури лишається');
  for (const size of [40, 47]) { const sc = T.buildScene(Object.assign(base('square'), { cmode: 'seq', ncol: 3, size })); for (const s of sc.shapes) assert.equal(s.ci, (((s.gi + s.gj * 2) % 3) + 3) % 3); }
});

console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
