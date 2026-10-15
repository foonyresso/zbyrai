// Збирає dungeon-sim/dungeon-types.js з типів підземель Атласу (medieval-world/dungeons/*.js).
// Запуск: node tools/build-dungeon-types.mjs   (після зміни типів підземель)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'medieval-world', 'dungeons');
const types = [];
for (const f of readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
  const Atlas = { registerDungeon: d => types.push(d) };
  vm.runInNewContext(readFileSync(join(dir, f), 'utf8'), { Atlas });
}
types.sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id));
const rows = types.map(d => ({
  id: d.id, name: d.name, anchor: d.anchor && d.anchor.type, rooms: d.size.rooms, levels: d.size.levels,
  length: d.size.length, area: d.size.area, danger: d.danger, inhabitants: d.inhabitants || [],
  desc: (d.lore && d.lore.description) || '',
}));
const out = `/* Автоматично: node tools/build-dungeon-types.mjs з medieval-world/dungeons/*.js. Не правити вручну. */\n` +
  `(function (g) { g.DungeonTypes = ${JSON.stringify(rows, null, 1)}; if (typeof module !== 'undefined') module.exports = g.DungeonTypes; })(typeof globalThis !== 'undefined' ? globalThis : this);\n`;
writeFileSync(join(root, 'dungeon-sim', 'dungeon-types.js'), out);
console.log(`Типів підземель: ${rows.length}`);
