// Атлас 2.0: випадковість. Зерно → детермінований потік; у кожної стадії свій потік (зміна однієї не зсуває інші).
(function () {
  'use strict';
  const A = (globalThis.Atlas2 = globalThis.Atlas2 || {});
  function hashSeed(s) {
    s = String(s); let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const stream = (seed, name) => rng(hashSeed(seed + '|' + name));
  const randSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  A.Rng = { hashSeed, rng, stream, randSeed, pick };
})();
