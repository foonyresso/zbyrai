// Тести вкладки «Посилання»: node sd-remote/test/links.test.js
const assert = require('node:assert'); const L = require('../links.js');
let failed = 0; const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('cleanUrl: лише http(s), небезпечні схеми відкидаються', () => {
  assert.equal(L.cleanUrl('https://civitai.com'), 'https://civitai.com/'); assert.equal(L.cleanUrl(' http://a.b/x?y=1 '), 'http://a.b/x?y=1');
  ['javascript:alert(1)', 'data:text/html,hi', 'ftp://x.y', 'просто текст', '', null].forEach(u => assert.equal(L.cleanUrl(u), '', String(u)));
});
test('стандартні посилання: валідні адреси, унікальні, є Vheer, всі мають групу й опис', () => {
  const urls = L.DEFAULTS.map(l => l.url); assert.equal(new Set(urls).size, urls.length);
  L.DEFAULTS.forEach(l => { assert.ok(L.cleanUrl(l.url), l.url); assert.ok(l.g && l.title && l.note, l.title); });
  assert.ok(urls.includes('https://vheer.com/app/image-to-prompt'));
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
