// Перевірка єдиних правил інтерфейсу для інструментів: довідка, верхня панель збереження, підказки, єдина тема.
// Запуск: node tools/ui-rules.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const root = path.join(__dirname, '..');
const TOOLS = ['pattern-maker', 'medieval-world', 'prompt-dice', 'idea-mixer', 'colonist-foundry', 'character-roller', 'planet-forge', 'voxel-lab', 'tessera', 'realm-map'];
// інструменти зі старою довідкою details.about: перевіряємо лише кнопку «Інфо» (tool-chrome.js)
const ABOUT_TOOLS = ['balance-curves', 'loot-forge', 'production-planner', 'skill-tree', 'sprite-cleaner'];
let failed = 0;
const test = (name, fn) => { try { fn(); console.log('  ok  ', name); } catch (e) { failed++; console.log('  FAIL', name, '\n      ', e.message); } };
for (const t of TOOLS) {
  const html = fs.readFileSync(path.join(root, t, 'index.html'), 'utf8');
  const header = (html.match(/<header class="top">[\s\S]*?<\/header>/) || [''])[0];
  test(`${t}: згорнута довідка «Що це, для чого, як користуватися»`, () => {
    assert.ok(/<details class="how"(?![^>]*\bopen\b)[^>]*>/.test(html), 'немає <details class="how"> або він розгорнутий');
    for (const w of ['Що це', 'Для чого', 'Як користуватися']) assert.ok(html.includes(w), 'немає розділу «' + w + '»');
  });
  test(`${t}: збереження й обмін у верхній панелі`, () => {
    assert.ok(header.includes('class="top-actions"'), 'у шапці немає блоку top-actions');
    assert.ok(/Зберегти|Копіювати/.test(header), 'у шапці немає кнопок збереження');
    assert.ok(/id="(btnImport|customImport)"/.test(header), 'у шапці немає кнопки «Імпорт»');
  });
  test(`${t}: кожна кнопка шапки має підказку`, () => {
    for (const m of header.matchAll(/<button\b[^>]*>/g)) assert.ok(/\btitle="/.test(m[0]), 'кнопка без title: ' + m[0].slice(0, 80));
  });
  test(`${t}: єдина тема`, () => assert.ok(/href="\.\/theme\.css"|href="theme\.css"/.test(html), 'не підключено theme.css'));
}
for (const t of TOOLS.concat(ABOUT_TOOLS)) {
  test(`${t}: кнопка «Інфо» (tool-chrome.js) після назви`, () => {
    const html = fs.readFileSync(path.join(root, t, 'index.html'), 'utf8');
    assert.ok(html.includes('<script src="./tool-chrome.js">'), 'не підключено tool-chrome.js');
    assert.ok(fs.existsSync(path.join(root, t, 'tool-chrome.js')), 'немає копії tool-chrome.js (node tools/sync-theme.mjs)');
  });
}
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
