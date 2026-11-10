// Тести логіки відео редактора. Запуск: node video-editor/test/ve.test.js
const assert = require('node:assert');
const C = require('../ve-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-6, (m || '') + ` ${a} != ${b}`);
const base = () => [C.newSeg(0, 10)];

test('розрізання ділить частину на дві без зсуву', () => {
  const s = C.splitAt(base(), 4);
  assert.strictEqual(s.length, 2); near(s[0].e, 4); near(s[1].s, 4); near(C.total(s), 10);
});
test('розрізання біля краю нічого не робить', () => {
  assert.strictEqual(C.splitAt(base(), 0.01).length, 1);
  assert.strictEqual(C.splitAt(base(), 9.99).length, 1);
});
test('видалення діапазону зсуває наступні частини', () => {
  const s = C.removeRange(base(), 2, 5);
  assert.strictEqual(s.length, 2); near(C.total(s), 7); near(s[1].s, 5);
});
test('обрізка країв: початок і кінець', () => {
  let s = C.removeRange(base(), 0, 3); s = C.removeRange(s, 4, C.total(s));
  assert.strictEqual(s.length, 1); near(s[0].s, 3); near(s[0].e, 7);
});
test('залишити лише діапазон', () => {
  const s = C.keepRange(base(), 2, 6); near(C.total(s), 4); near(s[0].s, 2);
});
test('швидкість діапазону: час таймлайна стискається', () => {
  const s = C.patchRange(base(), 0, 4, { speed: 2 });
  near(C.total(s), 2 + 6); near(s[0].speed, 2); near(s[1].speed, 1);
});
test('швидкість і гучність обмежені', () => {
  const s = C.patchRange(base(), 0, 10, { speed: 100, vol: 9 });
  near(s[0].speed, C.SPEED_MAX); near(s[0].vol, C.VOL_MAX);
});
test('locate і srcToOut узгоджені після вирізання й швидкості', () => {
  let s = C.removeRange(base(), 2, 4); s = C.patchRange(s, 0, 2, { speed: 2 }); // [0..2] x2 = 1с, [4..10] = 6с
  const L = C.locate(s, 1.5); assert.strictEqual(L.i, 1); near(L.src, 4.5);
  near(C.srcToOut(s, 4.5), 1.5); assert.strictEqual(C.srcToOut(s, 3), null);
});
test('commonValue: однакове чи різне', () => {
  const s = C.patchRange(base(), 0, 4, { vol: 0.5 });
  near(C.commonValue(s, 0, 4, 'vol'), 0.5); assert.strictEqual(C.commonValue(s, 0, 10, 'vol'), null);
});
test('fitCrop 16:9 з 4:3 кадру: по ширині', () => {
  const c = C.fitCrop(1600, 1200, 16 / 9); near(c.w, 1600); near(c.h, 900); near(c.y, 150);
});
test('fitCrop 9:16 з 16:9 кадру: по висоті, по центру', () => {
  const c = C.fitCrop(1920, 1080, 9 / 16); near(c.h, 1080); near(c.w, 607.5); near(c.x, (1920 - 607.5) / 2);
});
test('рамка завжди в межах кадру', () => {
  for (const h of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) for (const a of [0, 1, 16 / 9, 9 / 16]) for (const p of [[-50, -50], [5000, 5000], [300, 200], [800, 100]]) {
    const c = C.resizeCrop({ x: 400, y: 300, w: 400, h: 300 }, h, p[0], p[1], a, 1000, 700);
    assert.ok(c.x >= -1e-6 && c.y >= -1e-6 && c.x + c.w <= 1000 + 1e-6 && c.y + c.h <= 700 + 1e-6 && c.w > 0 && c.h > 0, `${h} a=${a} p=${p}: ${JSON.stringify(c)}`);
    if (a > 0) near(c.w / c.h, a, `пропорція ${h}`);
  }
});
test('moveCrop не виходить за кадр', () => {
  const c = C.moveCrop({ x: 10, y: 10, w: 100, h: 100 }, -50, 9999, 400, 300);
  near(c.x, 0); near(c.y, 200);
});
test('cropPx дає парні числа', () => {
  const c = C.cropPx({ x: 3.7, y: 5.2, w: 101.9, h: 57.3 }, 1920, 1080);
  assert.ok(c.x % 2 === 0 && c.y % 2 === 0 && c.w % 2 === 0 && c.h % 2 === 0);
});
test('outSize: висота за пресетом, ширина за пропорцією, без збільшення', () => {
  assert.deepStrictEqual(C.outSize(1920, 1080, { mode: 'h', value: 720 }), { w: 1280, h: 720 });
  assert.deepStrictEqual(C.outSize(640, 360, { mode: 'h', value: 1080 }), { w: 640, h: 360 });
  assert.deepStrictEqual(C.outSize(1000, 1000, { mode: 'w', value: 333 }), { w: 334, h: 334 });
});
test('atempo: ланцюжок для крайніх швидкостей', () => {
  assert.deepStrictEqual(C.atempoChain(1), []);
  assert.deepStrictEqual(C.atempoChain(4), ['atempo=2.0', 'atempo=2.000']);
  assert.deepStrictEqual(C.atempoChain(0.25), ['atempo=0.5', 'atempo=0.500']);
  assert.deepStrictEqual(C.atempoChain(0.75), ['atempo=0.750']);
});
const opts = (o) => Object.assign({ segs: base(), master: 1, mute: false, crop: null, srcW: 1920, srcH: 1080, hasVideo: true, hasAudio: true, fmt: 'mp4', quality: 1, size: { mode: 'orig', value: 0 }, fps: 12, kbps: 192, input: '/in/in.mp4' }, o);
test('mp4: фільтр, кодеки, вихід', () => {
  const r = C.buildExport(opts({ segs: C.patchRange(C.removeRange(base(), 2, 4), 0, 2, { speed: 2, vol: 0.5 }), master: 1.5, size: { mode: 'h', value: 720 } }));
  const fc = r.args[r.args.indexOf('-filter_complex') + 1];
  assert.ok(fc.includes('[0:v:0]trim=start=0.000:end=2.000,setpts=(PTS-STARTPTS)/2.000[v0]'));
  assert.ok(fc.includes('atempo=2.000') && fc.includes('volume=0.500') && fc.includes('concat=n=2:v=1:a=1[vc][ac]'));
  assert.ok(fc.includes('scale=1280:720') && fc.includes('format=yuv420p') && fc.includes('[ac]volume=1.500[ao]'));
  assert.ok(r.args.includes('libx264') && r.args.includes('aac') && r.outFile === 'out.mp4'); near(r.outDur, 1 + 6);
});
test('кроп потрапляє у фільтр', () => {
  const r = C.buildExport(opts({ crop: { x: 100, y: 0, w: 607, h: 1080 } }));
  assert.ok(r.vf.startsWith('crop=606:1080:100:0'));
});
test('gif: без звуку, палітра, ширина 480', () => {
  const r = C.buildExport(opts({ fmt: 'gif', size: { mode: 'w', value: 480 } }));
  assert.ok(!r.args.includes('[ao]') && r.vf.includes('scale=480:270') && r.vf.includes('palettegen') && r.vf.includes('fps=12')); assert.strictEqual(r.outFile, 'out.gif');
});
test('mp3: лише звук', () => {
  const r = C.buildExport(opts({ fmt: 'mp3', kbps: 320 }));
  assert.ok(!r.args.includes('[vo]') && r.args.includes('libmp3lame') && r.args.includes('320k') && r.size === null);
});
test('відео без звуку: немає аудіо-ланцюжка; MP3 дає помилку', () => {
  const r = C.buildExport(opts({ hasAudio: false })); assert.ok(!r.args.join(' ').includes('atrim'));
  assert.throws(() => C.buildExport(opts({ hasAudio: false, fmt: 'mp3' })), /немає звуку/);
});
test('вимкнений звук прибирає аудіо з mp4', () => {
  assert.ok(!C.buildExport(opts({ mute: true })).args.join(' ').includes('atrim'));
});
test('аудіофайл у mp4 не експортується', () => {
  assert.throws(() => C.buildExport(opts({ hasVideo: false })), /немає відео/);
});
test('порожній список частин: помилка', () => {
  assert.throws(() => C.buildExport(opts({ segs: [] })), /Немає що експортувати/);
});
test('parseProbe: тривалість, розмір, звук, поворот', () => {
  const log = 'Duration: 00:01:02.50, start: 0.0\n  Stream #0:0: Video: h264, yuv420p, 1920x1080, 30 fps\n    displaymatrix: rotation of -90.00 degrees\n  Stream #0:1: Audio: aac, 44100 Hz';
  const p = C.parseProbe(log); near(p.duration, 62.5); assert.deepStrictEqual([p.w, p.h, p.hasVideo, p.hasAudio], [1080, 1920, true, true]);
  assert.strictEqual(C.parseProbe('Stream #0:0: Audio: mp3').hasVideo, false);
});
test('parseProgressTime і fmtTime', () => {
  near(C.parseProgressTime('frame=  50 fps=25 time=00:00:03.20 bitrate'), 3.2); assert.strictEqual(C.parseProgressTime('no'), null);
  assert.strictEqual(C.fmtTime(75.3), '1:15'); assert.strictEqual(C.fmtTime(3725, true), '1:02:05.0');
});
test('імена файлів', () => { assert.strictEqual(C.outName('Моє відео.MOV', 'mp4'), 'Моє відео-edit.mp4'); assert.strictEqual(C.baseName('a/b:c.mp4'), 'a_b_c'); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі тести пройдено');
process.exit(failed ? 1 : 0);
