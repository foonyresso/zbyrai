// Тести civitai-info: node sd-remote/test/civitai-info.test.js
const assert = require('node:assert'); const C = require('../civitai-info.js'); let failed = 0;
const pend = []; const test = (n, f) => { try { const r = f(); if (r && r.then) pend.push(r.then(() => console.log('  ok  ', n), e => { failed++; console.log('  FAIL', n, '\n      ', e.message); })); else console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
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
test('кожен пункт ліцензії має пояснення (обидва стани)', () => {
  [{ allowNoCredit: true, allowCommercialUse: ['Image', 'RentCivit', 'Rent', 'Sell'], allowDerivatives: true, allowDifferentLicense: true }, { allowNoCredit: false, allowCommercialUse: 'None', allowDerivatives: false, allowDifferentLicense: false }].forEach(m => {
    const l = C.licenseItems(m); assert.equal(l.length, 7); l.forEach(i => assert.ok(i.hint && i.hint.length > 60, i.key));
  });
  assert.notEqual(C.licenseItems({ allowNoCredit: true })[0].hint, C.licenseItems({ allowNoCredit: false })[0].hint);
});
test('cleanPrompt: прибирає LoRA-теги й зайві коми', () => {
  assert.equal(C.cleanPrompt('masterpiece, <lora:abc_1:0.6>, 1girl, <lora:x:1>,solo'), 'masterpiece, 1girl, solo');
  assert.equal(C.cleanPrompt('<lora:a:1>, <lyco:b:0.5> 1girl,  smile'), '1girl, smile'); assert.equal(C.cleanPrompt('She has red hair. <lora:q:1>'), 'She has red hair.'); assert.equal(C.cleanPrompt(null), '');
  assert.equal(C.metaOf({ prompt: 'a, <lora:z:1>, b' }).prompt, 'a, b');
});
test('search: через транспорт, нормалізація елементів і курсор', async () => {
  let got = null; C.setTransport((kind, q) => { got = [kind, q]; return Promise.resolve({ items: [{ id: 5, thumb: 't', big: 'b', w: 832, h: 1216, user: 'u', hasPrompt: true, stats: { likeCount: 3 } }], next: 'c2' }); });
  const r = await C.search('pink hair', 'c1', { sort: 'Newest', period: 'Week' });
  assert.deepEqual(got, ['search', { q: 'pink hair', sort: 'Newest', period: 'Week', cursor: 'c1' }]); assert.equal(r.next, 'c2'); assert.equal(r.items[0].id, 5); assert.equal(r.items[0].hasPrompt, true); assert.equal(r.items[0].prompt, '');
  C.setTransport(null);
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
test('id з назви файлу й позначка hasPositivePrompt', () => {
  const g = C.gallery({ images: [{ url: 'https://image.civitai.com/k/u/original=true/147533994.jpeg', hasPositivePrompt: true }, { url: 'https://image.civitai.com/k/u/x.jpeg', hasPositivePrompt: false }, { url: 'https://image.civitai.com/k/u/y.jpeg' }] });
  assert.equal(g[0].id, 147533994); assert.equal(g[0].hasPrompt, true); assert.equal(g[1].hasPrompt, false); assert.equal(g[2].hasPrompt, undefined);
});
test('sized: original=true замінюється на width', () => {
  assert.equal(C.sized('https://image.civitai.com/k/u/original=true/1.jpeg', 450), 'https://image.civitai.com/k/u/width=450/1.jpeg'); assert.equal(C.sized('https://image.civitai.com/k/u/width=100/1.jpeg', 1280), 'https://image.civitai.com/k/u/width=1280/1.jpeg');
});
test('snapRatio: найближча пропорція', () => {
  assert.equal(C.snapRatio(1024, 1024), 1); assert.equal(C.snapRatio(832, 1216), 2 / 3); assert.equal(C.snapRatio(1344, 768), 16 / 9); assert.equal(C.snapRatio(768, 1344), 9 / 16); assert.equal(C.snapRatio(0, 0), 2 / 3);
});
Promise.all(pend).then(() => { console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0); });
