// Що тут: тести логіки вимірювань (відстань, площа, формати, GeoJSON). Запуск: node map-measure/test/measure.test.js
const assert = require('node:assert'), C = require('../measure-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const near = (a, b, tol, m) => assert.ok(Math.abs(a - b) <= tol, (m || '') + ` ${a} ≠ ${b}`);
test('градус довготи на екваторі ≈ 111,2 км', () => near(C.dist({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), 111195, 50));
test('Київ — Львів ≈ 470 км', () => near(C.dist({ lat: 50.45, lng: 30.52 }, { lat: 49.84, lng: 24.03 }) / 1000, 468, 6));
test('квадрат 1 км × 1 км ≈ 1 км²', () => {
  const dLat = 1000 / 111195, dLng = dLat / Math.cos(50 * Math.PI / 180);
  const sq = [{ lat: 50, lng: 30 }, { lat: 50, lng: 30 + dLng }, { lat: 50 + dLat, lng: 30 + dLng }, { lat: 50 + dLat, lng: 30 }];
  near(C.polyArea(sq), 1e6, 6000); near(C.pathLength(sq, true), 4000, 20);
});
test('менше 3 точок: площа 0', () => assert.strictEqual(C.polyArea([{ lat: 1, lng: 1 }]), 0));
test('формати відстані', () => { assert.ok(/^250 м$/.test(C.fmtLen(250))); assert.ok(C.fmtLen(2500).endsWith('км')); assert.ok(C.fmtLen(1609.344, 'mi').startsWith('1 ')); });
test('формати площі', () => { assert.ok(C.fmtArea(500).endsWith('м²')); assert.ok(C.fmtArea(50000).endsWith('га')); assert.ok(C.fmtArea(5e6).endsWith('км²')); assert.ok(C.fmtArea(10000, 'ha').startsWith('1 ')); });
test('GeoJSON туди й назад', () => {
  const s = [{ type: 'line', pts: [{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }] }, { type: 'polygon', pts: [{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 1 }] }];
  const g = C.toGeoJSON(s), back = C.fromGeoJSON(JSON.stringify(g));
  assert.strictEqual(g.features.length, 2); assert.deepStrictEqual(back, s);
});
test('помилки імпорту зрозумілі', () => { assert.throws(() => C.fromGeoJSON('abc'), /JSON/); assert.throws(() => C.fromGeoJSON({ type: 'FeatureCollection', features: [] }), /немає/); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
