/* Механіка «spawner»: хвилі монстрів, що приходять до воріт міста. Без DOM, детермінована від зерна.
   Повертає накази на появу { kind, count, side }; куди їх ставити — справа інструмента. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const WEIGHTS = { goblin: 3, wolf: 3, slime: 2, skeleton: 2, orc: 1.5, bat: 2, spider: 2, ghost: 1.5 };
  const SIDES = ['south', 'south', 'south', 'west', 'east'];
  function create(seed, opts = {}) {
    const R = Mech.Rng ? Mech.Rng.stream(seed, 'spawner') : Math.random;
    const o = Object.assign({ first: 50, gapMin: 70, gapMax: 130, bossMin: 260, bossMax: 400, maxAlive: 14 }, opts);
    return { R, o, waveT: o.first, bossT: o.bossMin + (o.bossMax - o.bossMin) * R(), waves: 0 };
  }
  function weighted(R, w) { let s = 0; for (const k in w) s += w[k]; let r = R() * s; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return Object.keys(w)[0]; }
  // dt — секунди симуляції, info = { day, alive } (скільки монстрів уже живо)
  function tick(st, dt, info) {
    const out = [], R = st.R, o = st.o;
    st.waveT -= dt; st.bossT -= dt;
    if (st.waveT <= 0) {
      st.waveT = o.gapMin + (o.gapMax - o.gapMin) * R();
      if (info.alive < o.maxAlive) {
        st.waves++;
        const side = SIDES[Math.floor(R() * SIDES.length)];
        const n = Math.min(8, 2 + Math.floor((info.day - 1) / 2) + Math.floor(R() * 3));
        for (let i = 0; i < n; i++) out.push({ kind: weighted(R, WEIGHTS), side });
      }
    }
    if (st.bossT <= 0) { st.bossT = o.bossMin + (o.bossMax - o.bossMin) * R(); out.push({ kind: 'boss', side: 'south' }); }
    return out;
  }
  // негайна хвиля (кнопка «Прикликати»)
  function force(st, n = 4) {
    const side = SIDES[Math.floor(st.R() * SIDES.length)], out = [];
    for (let i = 0; i < n; i++) out.push({ kind: weighted(st.R, WEIGHTS), side });
    return out;
  }
  const api = { create, tick, force, WEIGHTS, SIDES };
  Mech.Spawner = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
