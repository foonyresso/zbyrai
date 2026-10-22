// Генерує worlds/continent/render/themes-worlds.js: власну тему оформлення для кожного виміру з lore.visual.palette (спільний рушій). Запуск: node tools/build-world-themes.mjs
import fs from 'fs';
const root = new URL('../medieval-world/', import.meta.url).pathname;
globalThis.Atlas = { registerWorld(w) { globalThis.W.push(w); } }; globalThis.W = [];
for (const d of fs.readdirSync(root + 'worlds')) { const f = `${root}worlds/${d}/world.js`; if (fs.existsSync(f)) (0, eval)(fs.readFileSync(f, 'utf8')); }
const own = new Set(['continent', 'archipelago', 'island', 'pangea', 'astrakor', 'ostanky', 'krovostep', 'vershynnytsia', 'neborid', 'midnokryl']);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function hsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l]; }
const hd = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const best = (cols, f) => cols.reduce((m, c) => (f(c) > f(m) ? c : m), cols[0]);
function make(w) {
  const cols = w.lore.visual.palette.map((p) => rgb(p.hex)), H = cols.map(hsl);
  const hs = (c) => H[cols.indexOf(c)];
  const dark = best(cols, (c) => -hs(c)[2]), light = best(cols, (c) => hs(c)[2]);
  const blue = best(cols, (c) => { const [h, s, l] = hs(c); return (hd(h, 205) < 55 ? 1 : 0) * 2 + s * (1 - Math.abs(l - .5)) - hd(h, 205) / 360; });
  const green = best(cols, (c) => { const [h, s, l] = hs(c); return (hd(h, 110) < 60 ? 1 : 0) * 2 + s * (1 - Math.abs(l - .5)) - hd(h, 110) / 360; });
  const warm = best(cols, (c) => { const [h, s, l] = hs(c); return (hd(h, 35) < 40 ? 1 : 0) + s * (1 - Math.abs(l - .6)); });
  const seaBase = hd(hs(blue)[0], 205) < 55 ? blue : mix(dark, [70, 130, 170], .45);
  const shallow = mix(seaBase, [235, 245, 248], .55), deep = mix(seaBase, dark, .5);
  const sea = Array.from({ length: 7 }, (_, i) => hex(mix(shallow, deep, i / 6)));
  const [gh, gs, gl] = hs(green);
  const tint = { h: Math.round(Math.max(-40, Math.min(40, gh - 105))), s: +(Math.max(.4, Math.min(1.3, gs * 1.4 + .15))).toFixed(2), l: +(Math.max(-.1, Math.min(.1, (gl - .45) * .5))).toFixed(2), mix: [hex(mix(green, warm, .25)), .22] };
  return {
    name: w.name, sea, lake: sea[2], glow: `rgba(${rgb(hex(light)).map(Math.round).join(',')},.55)`, coast: `rgba(${dark.map(Math.round).join(',')},.9)`, bg: hex(mix(dark, [0, 0, 0], .55)),
    tint, alpha: .22, river: sea[4], border: hex(mix(dark, [0, 0, 0], .3)), roads: { major: hex(mix(light, warm, .5)), medium: hex(mix(warm, light, .2)), minor: hex(mix(warm, dark, .55)), casing: hex(mix(dark, [0, 0, 0], .5)) },
    route: hex(mix(light, [255, 255, 255], .5)), tree: hex(mix(green, dark, .25)), rock: [hex(mix(dark, light, .55)), hex(mix(dark, light, .3))],
  };
}
const out = {};
for (const w of W) if (!own.has(w.id) && w.lore && w.lore.visual && w.lore.visual.palette && w.lore.visual.palette.length >= 4) out[w.id] = make(w);
const body = Object.entries(out).map(([id, t]) => `    ${id}: Object.assign({}, base, ${JSON.stringify(t).replace(/"([a-z]+)":/g, '$1:')}),`).join('\n');
fs.writeFileSync(root + 'worlds/continent/render/themes-worlds.js', `// Що тут: теми оформлення вимірів, згенеровані з lore.visual.palette (tools/build-world-themes.mjs; руками не правити, власну тему краще додати в themes.js)
(function () {
  'use strict';
  const R = globalThis.RealmMap, base = { tint: { h: 0, s: 1, l: 0, mix: ['#000000', 0] }, alpha: 0.30 };
  Object.assign(R.Themes, {
${body}
  });
})();
`);
console.log(Object.keys(out).length + ' тем');
