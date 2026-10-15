// Бінарна купа для алгоритму Дейкстри: пари (ключ, значення) на двох масивах.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  class MinHeap {
    constructor() { this.k = []; this.v = []; }
    get size() { return this.k.length; }
    push(key, val) {
      const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val);
      while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; }
      k[i] = key; v[i] = val;
    }
    // повертає значення з найменшим ключем; ключ доступний у this.lastKey
    pop() {
      const k = this.k, v = this.v, n = k.length; if (!n) return -1;
      const topV = v[0]; this.lastKey = k[0];
      const key = k.pop(), val = v.pop();
      if (n > 1) {
        let i = 0; const m = n - 1;
        for (;;) { let c = 2 * i + 1; if (c >= m) break; if (c + 1 < m && k[c + 1] < k[c]) c++; if (k[c] >= key) break; k[i] = k[c]; v[i] = v[c]; i = c; }
        k[i] = key; v[i] = val;
      }
      return topV;
    }
  }
  R.MinHeap = MinHeap;
})();
