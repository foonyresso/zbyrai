// Узгодженість стилів для vheer.com: правила в vheer-hide.css, userstyle для Stylus і userscript. node sd-remote/test/vheer-css.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const d = path.join(__dirname, '..', 'userscript');
const hide = fs.readFileSync(path.join(d, 'vheer-hide.css'), 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '').trim().split('\n').map(l => l.trim()).filter(Boolean);
const ustyle = fs.readFileSync(path.join(d, 'vheer-i2p.user.css'), 'utf8'), uscript = fs.readFileSync(path.join(d, 'vheer-i2p.user.js'), 'utf8');
let failed = 0; const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('userstyle для Stylus містить усі правила vheer-hide.css', () => { hide.forEach(l => assert.ok(ustyle.includes(l), 'немає рядка: ' + l)); });
test('userstyle має заголовок Stylus і обмежений сторінкою Image to Prompt', () => { assert.ok(/==UserStyle==/.test(ustyle) && ustyle.includes('@-moz-document url-prefix("https://vheer.com/app/image-to-prompt")')); });
test('ті самі ключові селектори є в userscript', () => { ['sidebar-gap', 'sidebar-container', 'data-sonner-toaster', 'header'].forEach(k => assert.ok(uscript.includes(k), k)); });
test('userscript працює лише в нашій рамці й передає промпт лише на наш origin', () => { assert.ok(uscript.includes("window.name !== 'zbyrai-i2p'") && uscript.includes("TARGET = 'https://zbyrai.pages.dev'")); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
