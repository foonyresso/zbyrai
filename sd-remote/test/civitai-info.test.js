// Тести civitai-info: node sd-remote/test/civitai-info.test.js
const assert = require('node:assert'); const C = require('../civitai-info.js'); let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const by = l => Object.fromEntries(l.map(i => [i.key, i.ok]));
test('ліцензія: масив прав', () => {
  const l = by(C.licenseItems({ allowNoCredit: true, allowCommercialUse: ['Image', 'RentCivit'], allowDerivatives: true, allowDifferentLicense: false }));
  assert.deepEqual(l, { credit: true, image: true, civitai: true, rent: false, sell: false, merge: true, relicense: false });
});
test('ліцензія: старий рядок і заборони', () => {
  assert.equal(by(C.licenseItems({ allowCommercialUse: 'Sell' })).sell, true);
  const n = C.licenseItems({ allowNoCredit: false, allowCommercialUse: 'None', allowDerivatives: false });
  assert.equal(n[0].ok, false); assert.match(n[0].text, /Треба вказувати/); assert.equal(by(n).image, false); assert.equal(by(n).merge, false);
  assert.deepEqual(C.licenseItems(null), []);
});
test('pickVersion: за id, за назвою, перша', () => {
  const m = { modelVersions: [{ id: 5, name: 'v2' }, { id: 4, name: 'v1' }] };
  assert.equal(C.pickVersion(m, 4).name, 'v1'); assert.equal(C.pickVersion(m, null, 'v2').id, 5); assert.equal(C.pickVersion(m).id, 5); assert.equal(C.pickVersion({}), null);
});
test('gallery: лише https-картинки, промпт лише якщо є, розміри', () => {
  const g = C.gallery({ images: [{ url: 'https://image.civitai.com/k/u/width=450/a.jpeg', meta: { prompt: ' cat ', steps: 20 } }, { url: 'https://x/v.mp4', type: 'video' }, { url: 'http://bad/x.png' }, { url: 'https://image.civitai.com/k/u/b.png', meta: null }] });
  assert.equal(g.length, 2); assert.equal(g[0].prompt, 'cat'); assert.match(g[0].big, /width=1280/); assert.equal(g[1].prompt, ''); assert.match(g[1].thumb, /width=450\/b\.png/); assert.match(g[0].info, /steps: 20/);
});
test('details і modelIdOf', () => {
  const d = C.details({ type: 'LORA', creator: { username: 'bob' } }, { name: 'v1', baseModel: 'SDXL', publishedAt: '2024-05-01T00:00:00Z', files: [{ type: 'Model', sizeKB: 51200 }], stats: { downloadCount: 7 } });
  const o = Object.fromEntries(d); assert.equal(o['Автор'], 'bob'); assert.equal(o['Розмір файлу'], '50 МБ'); assert.equal(o['Статус'], 'Опубліковано'); assert.equal(o['Завантажень'], '7');
  assert.equal(C.modelIdOf('https://civitai.com/models/123?x=1'), '123'); assert.equal(C.modelIdOf(''), '');
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
