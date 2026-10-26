// Тести вимірів: «Астракор» (материк у космосі на коренях дерева) і біоми основного світу.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

// межі параметрів: Астракор має 50–100 провінцій і завжди материк, основний світ 2–50
assert.equal(A.Params.normalize({ dimension: 'astrakor', provinces: 10 }).provinces, 50);
assert.equal(A.Params.normalize({ dimension: 'astrakor', provinces: 500 }).provinces, 100);
assert.equal(A.Params.normalize({ dimension: 'astrakor' }).provinces, 64);
assert.equal(A.Params.normalize({ dimension: 'astrakor', worldType: 'islands' }).worldType, undefined, 'тип світу прибрано');
assert.equal(A.Params.normalize({ provinces: 500 }).provinces, 50);
assert.equal(A.Params.normalize({ dimension: 'nonsense' }).dimension, 'main');
const rt = A.Save.paramsFromJSON(A.Save.paramsToJSON(A.Params.normalize({ dimension: 'astrakor', seed: 'x' })));
assert.equal(rt.dimension, 'astrakor');

const count = a => a.reduce((s, v) => s + (v ? 1 : 0), 0), SPECIAL = ['tree', 'rootcoast', 'garden', 'deadcrown', 'starcave'];
for (const seed of ['zbyrai', '7']) {
  const t = `astrakor/${seed}`, W = A.generate({ seed, dimension: 'astrakor', size: 'small' }), N = W.w * W.h;
  // один материк, край карти порожнеча
  const lc = A.Grid.components(W.w, W.h, i => W.land[i] === 1); assert.equal(lc.sizes.length, 1, `${t}: суходолів ${lc.sizes.length}`);
  for (let x = 0; x < W.w; x++) assert.ok(W.ocean[x] && W.ocean[(W.h - 1) * W.w + x], `${t}: край не космос`);
  for (let y = 0; y < W.h; y++) assert.ok(W.ocean[y * W.w] && W.ocean[y * W.w + W.w - 1], `${t}: край не космос`);
  const land = count(W.land); assert.ok(land > N * 0.4 && land < N * 0.65, `${t}: частка суші ${land / N}`);
  // 50–100 провінцій, кожна клітина суші в провінції
  assert.ok(W.provinces.length >= 50 && W.provinces.length <= 100, `${t}: провінцій ${W.provinces.length}`);
  for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) assert.ok(W.province[i] >= 0, `${t}: клітина без провінції`);
  // без морів, портів на космосі й морських шляхів між ними; води лише озера
  assert.ok((W.waterBodies || []).every(b => b.kind === 'lake'), `${t}: є моря чи океани`);
  assert.ok(W.settlements.every(s => !s.port || s.body >= 0), `${t}: порт на краю в космос`);
  // у космосі ні небезпеки, ні локацій, ні доріг
  for (let i = 0; i < N; i++) if (W.ocean[i]) { assert.equal(W.tier[i], 0, `${t}: небезпека в космосі`); assert.equal(W.group[i], 255); }
  assert.ok(W.sites.every(s => !W.ocean[s.i]), `${t}: локація в космосі`);
  for (const r of W.roads) assert.ok(r.cells.every(c => !W.ocean[c]), `${t}: дорога в космосі`);
  // дерево в центрі, особливі біоми виміру, нульова точка в центрі
  const c = Math.floor(W.h / 2) * W.w + Math.floor(W.w / 2); assert.equal(A.BIOMES[W.bio[c]].id, 'tree', `${t}: у центрі не дерево`);
  const seen = new Set(); for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) seen.add(A.BIOMES[W.bio[i]].id);
  for (const b of ['tree', 'garden', 'rootcoast', 'deadcrown']) assert.ok(seen.has(b), `${t}: немає біома ${b}`);
  assert.ok(count(W.root) > 200, `${t}: корені`);
  // стік: від кожної клітини суші ланцюг дійде до космосу (річка падає з краю материка)
  for (let i = 0; i < N; i += 3) { if (W.ocean[i]) continue; let q = i, n = 0; while (!W.ocean[q]) { q = W.down[q]; assert.ok(q >= 0 && ++n < N, `${t}: стік обірвано`); } }
  // дерево з коренями, що ділять материк; великі дороги крізь корені як тунелі, малі не заходять на корені
  assert.ok(W.tree && W.tree.lobes.length >= 11 && W.tree.R > 0, `${t}: дерево`); assert.ok(W.rootLines.length >= 6, `${t}: коренів ${W.rootLines.length}`);
  assert.ok(W.tunnels.length > 0, `${t}: немає тунелів`);
  for (let i = 0; i < N; i++) if (W.root[i] && W.roadLevel[i] > 2) assert.fail(`${t}: мала дорога на корені`);
  for (let i = 0; i < N; i++) if (W.root[i]) assert.ok(W.suit[i] === 0, `${t}: придатність на корені`);
  // Велика стіна на 70 %: фортеці, дороги крізь стіну лише біля воріт, цивілізація всередині, захоплені землі зовні
  assert.ok(W.fortresses.length >= 10, `${t}: фортець ${W.fortresses.length}`); assert.ok(W.wall.pts.length > 200);
  for (const f of W.fortresses) { assert.ok(Math.abs(W.fr[f.i] - 0.7) < 0.06, `${t}: фортеця поза стіною ${W.fr[f.i]}`); assert.ok(f.level > 0); }
  for (let i = 0; i < N; i++) if (W.wallMask[i] && W.roadLevel[i] && !W.gateMask[i]) assert.fail(`${t}: дорога крізь стіну поза воротами`);
  for (const p of W.provinces) assert.ok(W.fr[W.settlements[p.capital].i] < 0.7, `${t}: столиця за стіною`);
  for (const s of W.settlements) { if (W.fr[s.i] > 0.7 && s.rank !== 'capital' && !s.fortress) assert.ok(s.fate === 'occupied' || s.fate === 'ruined', `${t}: живе поселення за стіною`); }
  // фортеці — повноцінні міста: поселення на стіні, місто лежить з внутрішнього боку й прилягає до стіни, вздовж усієї довжини дотику — споруди оборони
  const fsets = W.settlements.filter(s => s.fortress); assert.equal(fsets.length, W.fortresses.length, `${t}: фортеці не стали поселеннями`);
  for (const f of W.fortresses) { const s = W.settlements[f.sid]; assert.ok(s && s.fortress && s.fid === f.id && !s.fate && s.pop > 5000, `${t}: поселення фортеці`); }
  for (const s of fsets.slice(0, 3)) {
    const c = A.Town.build(W, s), g = A.TownFort.geom(W, s), T = A.CityData.T, M = A.TownFort.M, tt = `${t}/${s.name}`;
    assert.ok(c.fort && c.tier === 4 && c.wall.on && c.wall.mat === 'stone' && c.buildings.length > 500, `${tt}: не велике місто-фортеця`);
    for (const b of c.buildings) { if (b.site) continue; for (const q of [[b.x, b.y], ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sy]) => [b.x + Math.cos(b.a) * b.w / 2 * sx - Math.sin(b.a) * b.h / 2 * sy, b.y + Math.sin(b.a) * b.w / 2 * sx + Math.cos(b.a) * b.h / 2 * sy])]) assert.ok(g.sd(q[0], q[1]) >= M - 0.5, `${tt}: споруда ${b.name} за стіною`); }
    const uc = g.u(c.c0[0], c.c0[1]), U = A.TownFort.reach(g, c.c0[0], c.c0[1], c.R * 1.1), def = c.buildings.filter(b => b.rampart && T[b.type].cat === 'Оборона');
    assert.ok(U > 300 && def.length >= 15, `${tt}: оборонних споруд ${def.length}, довжина дотику ${Math.round(U * 2)} м`);
    for (let u = uc - U + 30; u <= uc + U - 30; u += 20) assert.ok(def.some(b => Math.abs(b.u - u) <= 36), `${tt}: ділянка стіни ${Math.round(u)} м без оборони`);
    assert.ok(def.some(b => b.type === 'bastion') && def.some(b => b.type === 'wtower') && def.some(b => b.type === 'ballista'), `${tt}: немає бастіонів, веж чи метальних машин`);
    assert.ok(c.wall.gates.length >= 2 && c.wall.towers.length > 10, `${tt}: ворота ${c.wall.gates.length}, вежі ${c.wall.towers.length}`);
    assert.ok(c.districts.some(d => d.kind === 'rampart' && d.nb > 30) && c.districts.some(d => d.kind === 'garrison'), `${tt}: немає оборонного поясу чи гарнізонного кварталу`);
    assert.ok(c.buildings.every(b => b.cond === 'good' || b.cond === 'worn'), `${tt}: фортеця в руїнах`);
  }
  // захоплене монстрами місто живе своїм ладом: заселені споруди, монстрячі заміни й додатки, лад орди, райони за ладом
  { const occ = W.settlements.filter(s => s.fate === 'occupied' && s.occupier === 'monsters' && (s.rank === 'town' || s.rank === 'regional')).slice(0, 3); assert.ok(occ.length, `${t}: немає захоплених міст`);
    for (const s of occ) { const c = A.Town.build(W, s), T = A.CityData.T, mon = c.buildings.filter(b => T[b.type].cat === 'Монстри'), tt = `${t}/${s.name}`;
      assert.ok(s.order && s.order.laws.length === 3 && s.order.chief, `${tt}: немає ладу орди`); assert.ok(c.order, `${tt}: лад орди не дійшов до міста`);
      assert.ok(mon.length >= c.buildings.length * 0.2, `${tt}: монстрячих споруд ${mon.length} з ${c.buildings.length}`); assert.ok(mon.some(b => b.type === 'mhall'), `${tt}: немає зали вождя`);
      assert.ok(mon.some(b => b.was), `${tt}: жодну споруду не замінено`); assert.ok(mon.every(b => b.cond === 'lair' && b.pop > 0), `${tt}: монстрячі споруди не заселені`);
      assert.ok(c.districts.every(d => d.safety === 'смертельна для чужих'), `${tt}: райони не за ладом орди`); assert.ok(c.buildings.every(b => b.cond === 'lair' || b.pop === 0), `${tt}: мешканці в порожніх спорудах`); }
  }
  { let lo = 0, hi = 0, n1 = 0, n2 = 0; for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) { if (W.fr[i] < 0.3) { lo += W.tier[i]; n1++; } else if (W.fr[i] > 0.75) { assert.ok(W.tier[i] >= 3, `${t}: за стіною небезпека ${W.tier[i]}`); hi += W.tier[i]; n2++; } } assert.ok(hi / n2 > lo / n1 + 2, `${t}: небезпека не росте від дерева`); }
  const rk = { capital: 0, regional: 1, town: 2, village: 3, hamlet: 4 }, avgPop = (a, b) => { const l = W.settlements.filter(s => W.fr[s.i] >= a && W.fr[s.i] < b && !s.fate && s.pop); return l.reduce((x, s) => x + s.pop, 0) / Math.max(1, l.length); };
  assert.ok(avgPop(0, 0.3) > avgPop(0.4, 0.7), `${t}: міста не дрібнішають від дерева`);
  assert.equal(W.sub.length, N); assert.equal(count(W.sub), 0, `${t}: плями основного світу в Астракорі`);
}

// біоми основного світу: плями з каталогу, жодного з виключних біомів виміру
const D = A.BiomeData; assert.ok(D.list.length > 150, `каталог біомів: ${D.list.length}`);
for (const id of ['root-coasts', 'garden-branches', 'dead-crown', 'star-caverns']) assert.ok(!D.list.some(b => b[0] === id), `виключний біом ${id} у каталозі основного світу`);
const M = A.generate({ seed: 'zbyrai', size: 'small' }), M2 = A.generate({ seed: 'zbyrai', size: 'small' });
assert.ok(M.subUsed.length >= 3, `плям біомів: ${M.subUsed.length}`);
for (let i = 0; i < M.sub.length; i++) if (M.sub[i]) assert.ok(M.land[i] && !M.lake[i], 'пляма поза сушею');
assert.deepEqual(Array.from(M.sub), Array.from(M2.sub), 'плями недетерміновані');
assert.ok(M.settlements.some(s => s.port && s.body === -1), 'в основному світі порти на морі зникли');
assert.ok(M.waterBodies.some(b => b.kind === 'ocean'), 'в основному світі зникли океани');
console.log('dimension.test.js ok; біомів у каталозі', D.list.length, 'плям на малій карті', M.subUsed.length);
