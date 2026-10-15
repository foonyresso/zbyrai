// Названі природні об’єкти для підписів: моря, гірські хребти, ліси, пустелі, болота, спустошені землі.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function buildFeatures(world, p, namer) {
    const g = world.grid, B = R.Data.B, T = R.Data.titles, F = [];
    const cultAt = c => { const pr = world.province[c]; if (pr >= 0) return world.provinces[pr].culture; return namer.randomCulture(); };
    function scan(test, minSize, make) {
      const comp = R.Grid.components(g, test, true);
      comp.sizes.forEach((sz, k) => {
        if (sz < minSize) return;
        let sx = 0, sy = 0, cells = []; for (let i = 0; i < g.n; i++) if (comp.id[i] === k) { cells.push(i); sx += g.cx[i]; sy += g.cy[i]; }
        sx /= cells.length; sy /= cells.length;
        const mid = cells.reduce((a, b) => (Math.hypot(g.cx[b] - sx, g.cy[b] - sy) < Math.hypot(g.cx[a] - sx, g.cy[a] - sy) ? b : a));
        const f = make(cells, mid, sz); if (f) { f.cell = mid; f.x = g.cx[mid]; f.y = g.cy[mid]; f.size = sz; f.id = F.length; F.push(f); }
      });
    }
    scan(i => world.water[i] === 1, 90, (cells, mid) => {
      let deep = cells[0]; for (const c of cells) if (world.shore[c] > world.shore[deep]) deep = c;
      const ci = namer.randomCulture(), big = cells.length > g.n * 0.2;
      return { type: 'sea', name: R.Rng.pick(R.Rng.stream(p.seed, 'sea' + mid), big ? ['Океан'] : T.sea) + ' ' + namer.place(ci), _deep: deep };
    });
    for (const f of F) if (f.type === 'sea') { f.cell = f._deep; f.x = g.cx[f.cell]; f.y = g.cy[f.cell]; delete f._deep; }
    scan(i => world.bio[i] === B.MOUNTAIN || world.bio[i] === B.PEAKS, 24, (cells, mid) => ({ type: 'range', name: namer.feature(cultAt(mid), T.range) }));
    scan(i => world.bio[i] === B.FOREST || world.bio[i] === B.TAIGA || world.bio[i] === B.ENCHANTED, 60, (cells, mid) => {
      const ench = cells.filter(c => world.bio[c] === B.ENCHANTED).length > cells.length * 0.4;
      return { type: 'forest', enchanted: ench, name: ench ? 'Зачарована пуща ' + namer.place(cultAt(mid)) : namer.feature(cultAt(mid), T.forest) };
    });
    scan(i => world.bio[i] === B.DESERT, 30, (c, mid) => ({ type: 'desert', name: T.desert + ' ' + namer.place(cultAt(mid)) }));
    scan(i => world.bio[i] === B.SWAMP, 25, (c, mid) => ({ type: 'swamp', name: T.swamp + ' ' + namer.place(cultAt(mid)) }));
    scan(i => world.bio[i] === B.WASTELAND, 25, (c, mid) => ({ type: 'wasteland', name: T.wasteland + ' ' + namer.place(cultAt(mid)) }));
    return F;
  }
  R.Features = { buildFeatures };
})();
