// Спільне для тестів «Карти королівств»: міні-раннер і кеш згенерованих світів.
const R = require('../core/index.js');
const assert = require('node:assert/strict');
let failed = 0;
function test(name, fn) { try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const cache = new Map();
function world(params) { const k = JSON.stringify(params); if (!cache.has(k)) cache.set(k, R.generate(params)); return cache.get(k); }
// набір різних світів: перевіряємо інваріанти не на одному зерні
const SAMPLES = [
  { seed: 'alpha', size: 'm', worldType: 'continent' },
  { seed: 'beta', size: 'm', worldType: 'pangea' },
  { seed: 'gamma', size: 's', worldType: 'island' },
  { seed: 'delta', size: 'm', worldType: 'archipelago' },
  { seed: 'omega', size: 'l', worldType: 'continent' },
];
const finish = () => { console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0); };
module.exports = { R, assert, test, world, SAMPLES, finish };
