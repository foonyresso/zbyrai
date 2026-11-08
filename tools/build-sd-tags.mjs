// Збирає sd-remote/tags-data.js (дерево груп і тегів для «Гнучкого» режиму Віддаленого SD) із даних Кубика промптів.
// Беруться всі групи/підгрупи/теги меню Кубика (теги в стилі Danbooru, назви українською), без 18+, без вільного тексту.
// Запуск: node tools/build-sd-tags.mjs
import vm from 'node:vm';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'prompt-dice') + '/';
const UI = new Set(['zb-ui.js', 'app.js', 'ui-mannequin.js', 'ui-cards.js', 'ui-workspace.js', 'ui-menu.js', 'ui-dialogs.js']);
const html = fs.readFileSync(dir + 'index.html', 'utf8');
const srcs = [...html.matchAll(/<script src="\.\/([^"]+)"/g)].map((m) => m[1]).filter((f) => !UI.has(f));
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === 'style' ? {} : stub()), apply: () => stub(), set: () => true });
const ctx = { console, document: stub(), localStorage: { getItem: () => null, setItem() {} }, navigator: { language: 'uk' } };
ctx.window = ctx;
vm.createContext(ctx);
let code = srcs.map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n;\n');
code += '\n;globalThis.__o={MENU_CATS,SLOTS,THEMES,uaLabel,NSFW_IDS:typeof NSFW_IDS!=="undefined"?NSFW_IDS:[]};';
vm.runInContext(code, ctx, { timeout: 10000 });
const { MENU_CATS, SLOTS, THEMES, uaLabel, NSFW_IDS } = ctx.__o;
const adult = new Set(NSFW_IDS);
const SKIP_CATS = new Set(['sprite', 'gemini']);

function allOpts(sl) {
  const out = new Set();
  for (const theme of Object.keys(THEMES)) for (const g of ['f', 'm']) { try { sl.opts({ g, theme }).forEach((v) => out.add(v)); } catch (e) { /* без опцій */ } }
  return [...out];
}
const label = (tag) => { try { return uaLabel(tag) || tag; } catch (e) { return tag; } };
const item = (x) => (Array.isArray(x) ? [String(x[0]), String(x[1])] : [label(x), String(x)]);

// Групи, де можна вказати колір (на сайті з'являється палітра; колір вбудовується в обраний тег)
const COLOR_PARAMS = new Set(['hairColor', 'hairDetail', 'eyeColor', 'eyeDetail', 'makeup', 'nails', 'outfit', 'pl_upper_body', 'pl_chest_wear', 'pl_lower_body', 'legwear',
  'gloves', 'footwear', 'headwear', 'accessories', 'pl_hand_acc', 'weapon', 'background', 'pl_bg_color', 'pl_bg_plain', 'fgObjects', 'effects']);
// Базові теги, до яких додається колір, коли в групі лише «різнокольорові» варіанти: колір + hair = «red hair»
const BASES = { hairColor: 'hair', eyeColor: 'eyes', pl_bg_color: 'background' };
const LABELS = { breasts: 'Розмір грудей' };

function paramOf(id) {
  const sl = SLOTS[id];
  if (!sl || sl.text || adult.has(id)) return null;
  let groups;
  if (sl.groups) {
    const have = new Set(allOpts(sl));
    groups = sl.groups.map(([name, items]) => [name, items.map(item).filter((x) => !have.size || have.has(x[1]) || true)]).filter((g) => g[1].length);
  } else {
    const o = allOpts(sl);
    groups = o.length ? [['', o.map(item)]] : [];
  }
  groups = groups.map(([n, its]) => [n, its.filter((x) => x[1] && !/[<>{}]/.test(x[1]))]).filter((g) => g[1].length);
  if (!groups.length) return null;
  if (BASES[id]) groups.unshift(['Звичайний (колір бери на палітрі)', [[BASES[id], BASES[id]]]]);
  const out = { id, label: LABELS[id] || sl.label || id, multi: sl.kind === 'multi', groups };
  if (COLOR_PARAMS.has(id)) out.color = 1;
  return out;
}

const cats = [];
for (const c of MENU_CATS) {
  if (SKIP_CATS.has(c.id)) continue;
  const subs = [];
  for (const [sid, name, desc, slotIds] of c.n) {
    const params = slotIds.map(paramOf).filter(Boolean);
    if (params.length) subs.push({ id: c.id + '.' + sid, name, params });
  }
  if (subs.length) cats.push({ id: c.id, name: c.name, subs });
}
const n = cats.reduce((a, c) => a + c.subs.reduce((b, s) => b + s.params.reduce((d, p) => d + p.groups.reduce((e, g) => e + g[1].length, 0), 0), 0), 0);
const out = '// Згенеровано: node tools/build-sd-tags.mjs (джерело: prompt-dice/). Не правити вручну.\nwindow.SD_TAGS = ' + JSON.stringify(cats) + ';\n';
fs.writeFileSync(join(root, 'sd-remote', 'tags-data.js'), out);
console.log(`Категорій: ${cats.length}, підгруп: ${cats.reduce((a, c) => a + c.subs.length, 0)}, тегів: ${n}, розмір: ${(out.length / 1024).toFixed(0)} КБ`);
