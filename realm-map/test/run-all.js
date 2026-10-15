// Запускає всі тести «Карти королівств»: node realm-map/test/run-all.js
const { spawnSync } = require('node:child_process'), path = require('node:path'), fs = require('node:fs');
let bad = 0;
for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort()) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit' }); if (r.status) bad++;
}
process.exit(bad ? 1 : 0);
