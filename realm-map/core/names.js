// Генератор назв за «культурою»: склади з банків (data/name-banks.js). Імена унікальні в межах світу.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function makeNamer(seed) {
    const rnd = R.Rng.stream(seed, 'names'), used = new Set(), C = R.Data.cultures;
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    function base(cult, endings) {
      let a = R.Rng.pick(rnd, cult.a); const m = rnd() < 0.3 ? R.Rng.pick(rnd, cult.mid) : '', b = R.Rng.pick(rnd, endings || cult.b);
      let s = a + m + b;
      s = s.replace(/([аеєиіїоуюя])([аеєиіїоуюя])/g, (x, p, q) => (p === q ? p : x)).replace(/(.)\1\1+/g, '$1$1');
      return cap(s.toLowerCase());
    }
    function unique(make) { for (let k = 0; k < 40; k++) { const s = make(); if (!used.has(s)) { used.add(s); return s; } } const s = make() + ' ' + (used.size + 1); used.add(s); return s; }
    return {
      cultures: C,
      randomCulture: () => Math.floor(rnd() * C.length),
      place: ci => unique(() => base(C[ci])),
      land: ci => unique(() => base(C[ci], C[ci].land)),
      province(ci) { const t = R.Rng.pick(rnd, R.Data.titles.province); return t + ' ' + this.land(ci); },
      lakeName: ci => 'Озеро ' + unique(() => base(C[ci])),
      peak: ci => R.Rng.pick(rnd, R.Data.titles.peak) + ' ' + unique(() => base(C[ci])),
      feature: (ci, titles) => R.Rng.pick(rnd, titles) + ' ' + unique(() => base(C[ci])),
      raw: unique,
    };
  }
  R.Names = { makeNamer };
})();
