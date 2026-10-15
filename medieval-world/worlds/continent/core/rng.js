// Випадковість: зерно → рядок хешу → детермінований генератор. Без залежностей, легко переноситься на C# (xorshift/mulberry32 на uint).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function hashSeed(s) {
    s = String(s); let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return h >>> 0;
  }
  // mulberry32: повертає функцію, що дає числа [0,1)
  function rng(seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // окремий потік для кожної стадії: зміна однієї стадії не зсуває випадковість решти
  const stream = (seed, name) => rng(hashSeed(seed + '|' + name));
  const randSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const range = (r, a, b) => a + (b - a) * r();
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  // вибір за вагами: items = [[значення, вага], ...]
  function weighted(r, items) {
    let sum = 0; for (const it of items) sum += it[1];
    let x = r() * sum;
    for (const it of items) { x -= it[1]; if (x <= 0) return it[0]; }
    return items[items.length - 1][0];
  }
  function shuffle(r, arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  R.Rng = { hashSeed, rng, stream, randSeed, pick, range, int, weighted, shuffle };
})();
