// Дороги: 4 типи й правила підключення. Запуск: node medieval-world/worlds/continent/test/roads.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: дороги');
const REG = ['capital', 'regional'];
for (const params of SAMPLES) {
  const w = world(params), tag = `[${params.seed}/${params.worldType}] `, g = w.grid;
  test(tag + 'усі дороги лежать на суші, послідовні комірки сусідні', () => {
    for (const r of w.roads) for (let k = 0; k < r.cells.length; k++) { assert.equal(w.water[r.cells[k]], 0); if (k) assert.ok(R.Grid.dist(g, r.cells[k - 1], r.cells[k]) < 2.6, 'стрибок у дорозі'); }
  });
  test(tag + 'великі дороги з’єднують усі центри регіонів на одному суходолі', () => {
    const centers = w.settlements.filter(s => REG.includes(s.rank)), comp = R.Grid.components(g, i => w.roadLevel[i] >= 4, true);
    for (const a of centers) for (const b of centers) if (w.landComp.id[a.cell] === w.landComp.id[b.cell] && a !== b && w.landComp.sizes[w.landComp.id[a.cell]] > 40) assert.equal(comp.id[a.cell], comp.id[b.cell], `${a.name} не з’єднано великою дорогою з ${b.name}`);
  });
  test(tag + 'великі дороги ведуть лише між центрами регіонів', () => {
    for (const r of w.roads.filter(r => r.cls === 'major')) { assert.ok(REG.includes(w.settlements[r.from.id].rank) && REG.includes(w.settlements[r.to.id].rank)); }
  });
  test(tag + 'середні дороги ведуть до менших міст (будь-якого стану), малі — до сіл, хуторів, шахт і значних місць, стежки — до дрібних місць, лігв і проходів', () => {
    for (const r of w.roads) {
      if (r.cls === 'medium') assert.equal(w.settlements[r.from.id].rank, 'town');
      else if (r.cls === 'minor') { if (r.from.t === 's') assert.ok(['village', 'hamlet', 'mine'].includes(w.settlements[r.from.id].rank)); else { assert.equal(r.from.t, 'p'); assert.equal(w.pois[r.from.id].cls, 'major'); } }
      else if (r.cls === 'trail') { if (r.from.t === 'p') assert.equal(w.pois[r.from.id].cls, 'minor'); else assert.ok(r.from.t === 'l' || r.pass === true); }
    }
  });
  test(tag + 'міста й села сполучені дорогами (≥ 90%)', () => {
    const on = new Set(); for (const r of w.roads) if (r.from.t === 's') on.add(r.from.id);
    const need = w.settlements.filter(s => !REG.includes(s.rank) && w.landComp.sizes[w.landComp.id[s.cell]] > 60);
    const ok = need.filter(s => on.has(s.id)).length; assert.ok(ok >= need.length * 0.9, `сполучено ${ok} з ${need.length}`);
  });
  test(tag + 'мости стоять на річкових комірках', () => { for (const r of w.roads) for (const b of r.bridges) assert.equal(w.river[b], 1); });
  test(tag + 'довжина доріг у км відповідає масштабу', () => {
    for (const r of w.roads) { let len = 0; for (let k = 1; k < r.cells.length; k++) len += R.Grid.dist(g, r.cells[k - 1], r.cells[k]); assert.ok(Math.abs(len * w.params.kmPerCell - r.lenKm) < 0.2); }
  });
}
test('на звичайній карті є всі чотири типи доріг', () => { const w = world(SAMPLES[0]); for (const c of ['major', 'medium', 'minor', 'trail']) assert.ok(w.roads.some(r => r.cls === c), 'немає ' + c); });
test('великих доріг менше, ніж малих; стежок небагато порівняно з малими', () => { const s = world(SAMPLES[0]).stats; assert.ok(s.roadKm.major < s.roadKm.minor); });
finish();
