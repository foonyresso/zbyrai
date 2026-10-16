// Тести логіки конвертера. Запуск: node image-converter/test/convert.test.js
const assert = require('node:assert');
const C = require('../convert-core.js');
const Z = require('../zip-core.js');
let failed = 0;
const test = (n, f) => { try { const p = f(); if (p && p.then) return p.then(() => console.log('  ok  ', n), (e) => { failed++; console.log('  FAIL', n, '\n      ', e.message); }); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };

(async () => {
  await test('кадр: ширше за рамку, повний по висоті, зсув крайній', () => {
    const c = C.cropRect(2000, 1000, 1, 1, 0, 0.5);
    assert.strictEqual(c.sw, 1000); assert.strictEqual(c.sh, 1000); assert.strictEqual(c.sx, 0);
    assert.strictEqual(C.cropRect(2000, 1000, 1, 1, 1, 0.5).sx, 1000);
  });
  await test('кадр: вужче за рамку, повний по ширині, наближення стискає', () => {
    const c = C.cropRect(1000, 2000, 1, 2, 0.5, 0.5);
    assert.strictEqual(c.sw, 500); assert.strictEqual(c.sh, 500);
  });
  await test('кадр завжди в межах фото', () => {
    for (const r of [0.5, 1, 1.78, 2.3]) for (const z of [1, 2.5, 5]) for (const f of [0, 0.5, 1]) {
      const c = C.cropRect(1600, 900, r, z, f, f);
      assert.ok(c.sx >= -1e-9 && c.sy >= -1e-9 && c.sx + c.sw <= 1600 + 1e-6 && c.sy + c.sh <= 900 + 1e-6);
      assert.ok(Math.abs(c.sw / c.sh - r) < 1e-6);
    }
  });
  await test('розмір: фіксована пропорція, друга сторона за пропорцією', () => {
    const s = Object.assign({}, C.DEFAULTS, { ratio: '16:9', w: 1920, noUp: false });
    assert.deepStrictEqual(C.outSize(s, 16 / 9, 4000, 3000), { w: 1920, h: 1080 });
    assert.strictEqual(C.heightFor(1920, 16 / 9), 1080); assert.strictEqual(C.widthFor(1080, 16 / 9), 1920);
  });
  await test('розмір: без збільшення малих', () => {
    const s = Object.assign({}, C.DEFAULTS, { ratio: '1:1', w: 1000, noUp: true });
    assert.deepStrictEqual(C.outSize(s, 1, 500, 500), { w: 500, h: 500 });
    s.noUp = false; assert.deepStrictEqual(C.outSize(s, 1, 500, 500), { w: 1000, h: 1000 });
  });
  await test('розмір: оригінал з довгою стороною', () => {
    const s = Object.assign({}, C.DEFAULTS, { ratio: 'orig', maxSide: 1000 });
    assert.deepStrictEqual(C.outSize(s, 2, 4000, 2000), { w: 1000, h: 500 });
    assert.deepStrictEqual(C.outSize(s, 2, 800, 400), { w: 800, h: 400 });
    s.maxSide = 0; assert.deepStrictEqual(C.outSize(s, 2, 4000, 2000), { w: 4000, h: 2000 });
  });
  await test('імена: суфікс, розширення, повтори', () => {
    const u = {};
    assert.strictEqual(C.outName('a.PNG', '-web', 'webp', u), 'a-web.webp');
    assert.strictEqual(C.outName('a.jpg', '-web', 'webp', u), 'a-web (2).webp');
    assert.strictEqual(C.outName('b', '', 'jpg', u), 'b.jpg');
  });
  await test('вага й економія', () => {
    assert.strictEqual(C.fmtBytes(1536), '1.5 КБ'); assert.strictEqual(C.saving(1000, 250), 75);
  });
  await test('ZIP читається стандартним unzip', async () => {
    const fs = require('node:fs'), cp = require('node:child_process'), os = require('node:os'), path = require('node:path');
    const zip = await Z.makeZip([{ name: 'один.txt', blob: new Blob(['привіт']) }, { name: 'two.bin', blob: new Blob([new Uint8Array([1, 2, 3, 250])]) }]);
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'zip')), f = path.join(d, 't.zip');
    fs.writeFileSync(f, Buffer.from(await zip.arrayBuffer()));
    const out = cp.spawnSync('python3', ['-I', '-c', 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(sorted(z.namelist()), z.read("один.txt").decode())', f]);
    assert.strictEqual(out.status, 0, String(out.stderr));
    assert.ok(String(out.stdout).includes('привіт'));
  });
  await test('поділ на архіви за лімітом', () => {
    const e = [1, 2, 3, 4].map((i) => ({ name: 'x' + i, blob: { size: 40 } }));
    assert.strictEqual(Z.splitEntries(e, 100).length, 2);
  });
  console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
  process.exit(failed ? 1 : 0);
})();
