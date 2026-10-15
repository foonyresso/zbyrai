// Лігва монстрів: звичайні (рівень 1) у горах і лісах, боси й міні-боси (рівні 2–3) у глушині, морські лігва лише в глибинах.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  const bossDisplay = (b, rnd) => {
    const variant = b.variants ? R.Rng.pick(rnd, b.variants) : null;
    return { name: b.n + (variant ? ' (' + variant + ')' : ''), alias: b.alias || null, variant, tier: b.tier };
  };
  // радіус впливу лігва на «карту небезпеки» (комірки) і вага
  const DANGER_R = { 1: 3, 2: 6, 3: 10 }, DANGER_W = { 1: 1, 2: 3, 3: 6 };

  function placeLairs(world, p, namer, settlements) {
    const g = world.grid, rnd = R.Rng.stream(p.seed, 'lairs'), L = [], B = R.Data.biomes, mon = p.monsters;
    if (mon <= 0) return L;
    const sCells = settlements.map(s => s.cell), sd = R.Grid.distanceField(g, sCells, () => true, true);
    const taken = sCells.slice();
    const far = (c, d) => { for (const t of taken) if (R.Grid.dist(g, c, t) < d) return false; return true; };
    const farLairs = (c, d) => { for (const l of L) if (R.Grid.dist(g, c, l.cell) < (l.tier > 1 ? d : 2)) return false; return true; };
    const add = (o) => { o.id = L.length; o.x = g.cx[o.cell]; o.y = g.cy[o.cell]; o.region = world.region[o.cell] >= 0 ? world.region[o.cell] : -1; o.province = o.region >= 0 ? world.regions[o.region].province : -1; o.radius = DANGER_R[o.tier]; L.push(o); taken.push(o.cell); return o; };
    const groupOfCell = c => B[world.bio[c]].mon || null;
    // 1. звичайні лігва за регіонами
    const cellsOf = world.regions.map(() => []); for (let i = 0; i < g.n; i++) if (world.region[i] >= 0 && groupOfCell(i)) cellsOf[world.region[i]].push(i);
    for (const reg of world.regions) {
      const cells = cellsOf[reg.id]; let need = Math.min(6, Math.round(cells.length / 40 * mon));
      for (let t = 0; need > 0 && t < 80; t++) {
        const c = cells[Math.floor(rnd() * cells.length)]; if (!far(c, 3.2) || sd[c] < 2) continue;
        const dom = groupOfCell(c), kind = rnd() < 0.4 ? 'rest' : 'lair', monster = R.Rng.pick(rnd, R.Data[dom].monsters);
        add({ kind, domain: dom, tier: 1, monster, name: R.Data.lairKinds[kind] + ': ' + monster, cell: c }); need--;
      }
    }
    // 2. боси на суходолі: найвіддаленіші від поселень місця гір і лісів
    const landN = world.landCount, bossTotal = Math.max(2, Math.round(landN / 1100 * mon));
    const pools = { mountain: R.Rng.shuffle(rnd, R.Data.mountain.bosses.slice()), forest: R.Rng.shuffle(rnd, R.Data.forest.bosses.slice()) };
    let remote = [];
    for (const minSd of [5, 4, 3]) { remote = []; for (let i = 0; i < g.n; i++) if (world.region[i] >= 0 && groupOfCell(i) && sd[i] >= minSd) remote.push(i); if (remote.length >= 40) break; }
    remote.sort((a, b) => sd[b] - sd[a] || a - b);
    const top = remote.slice(0, Math.max(30, Math.floor(remote.length * 0.5)));
    for (let k = 0, tries = 0; k < bossTotal && tries < 400; tries++) {
      if (!top.length) break;
      const c = top[Math.floor(rnd() * top.length)]; if (!farLairs(c, 13)) continue;
      const dom = groupOfCell(c); if (!pools[dom].length) pools[dom] = R.Rng.shuffle(rnd, R.Data[dom].bosses.slice());
      const b = bossDisplay(pools[dom].pop(), rnd);
      add({ kind: 'boss', domain: dom, tier: b.tier, monster: b.name, alias: b.alias, variant: b.variant, name: 'Лігво: ' + b.name, cell: c }); k++;
    }
    // 3. море: лігва тільки в глибинах, далеко від берега
    const deepMin = p.seaDeepMin, deep = []; for (let i = 0; i < g.n; i++) if (world.water[i] === 1 && world.shore[i] >= deepMin) deep.push(i);
    if (deep.length) {
      const seaPool = R.Rng.shuffle(rnd, R.Data.sea.bosses.slice());
      let nReg = Math.round(deep.length / 200 * mon), nBoss = Math.max(1, Math.round(deep.length / 800 * mon));
      const byDeep = deep.slice().sort((a, b) => world.shore[b] - world.shore[a] || a - b), core = byDeep.slice(0, Math.max(20, Math.floor(deep.length * 0.4)));
      for (let t = 0; nBoss > 0 && t < 200; t++) {
        const c = core[Math.floor(rnd() * core.length)]; if (!farLairs(c, 16)) continue;
        if (!seaPool.length) seaPool.push(...R.Rng.shuffle(rnd, R.Data.sea.bosses.slice()));
        const b = bossDisplay(seaPool.pop(), rnd);
        add({ kind: 'boss', domain: 'sea', tier: b.tier, monster: b.name, alias: null, name: 'Лігво: ' + b.name, cell: c, deep: true }); nBoss--;
      }
      for (let t = 0; nReg > 0 && t < 400; t++) {
        const c = deep[Math.floor(rnd() * deep.length)]; if (!far(c, 7)) continue;
        const monster = R.Rng.pick(rnd, R.Data.sea.monsters);
        add({ kind: 'lair', domain: 'sea', tier: 1, monster, name: 'Лігво: ' + monster, cell: c, deep: true }); nReg--;
      }
    }
    return L;
  }

  // Карта небезпеки: 0..255 на комірку від лігв і захоплених поселень (зменшується з відстанню)
  function computeDanger(world, lairs, settlements) {
    const g = world.grid, d = new Float32Array(g.n), srcs = lairs.map(l => ({ c: l.cell, r: l.radius, w: DANGER_W[l.tier] }));
    for (const s of settlements) if (s.state === 'occupied') srcs.push({ c: s.cell, r: 3, w: 1.5 });
    for (const s of srcs) {
      const x0 = Math.max(0, Math.floor(g.cx[s.c] - s.r)), x1 = Math.min(g.w - 1, Math.ceil(g.cx[s.c] + s.r)), y0 = Math.max(0, Math.floor(g.cy[s.c] - s.r)), y1 = Math.min(g.h - 1, Math.ceil(g.cy[s.c] + s.r));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * g.w + x, dd = Math.hypot(g.cx[i] - g.cx[s.c], g.cy[i] - g.cy[s.c]); if (dd < s.r) d[i] += s.w * (1 - dd / s.r); }
    }
    const out = new Uint8Array(g.n); for (let i = 0; i < g.n; i++) out[i] = Math.min(255, Math.round(d[i] * 40));
    return out;
  }
  R.Lairs = { placeLairs, computeDanger, DANGER_R, DANGER_W };
})();
