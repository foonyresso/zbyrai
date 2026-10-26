// Атлас 2.0, етап: біоми основного світу. Плями біомів зі старого каталогу (core/biomedata.js, без тегу exclusive) на суші поверх базових:
// W.sub[i] = номер у A.BiomeData.list + 1 (0 нічого), W.subW[i] = наскільки клітина належить плямі (0..255, м'який край). У вимірі «Астракор» плям немає (там свої біоми).
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const CELL = 48; // сторона сітки засіву плям, клітин (≈12 км)
  // базовий біом клітини → клас пулу біомів (CLASSES у biomedata.js)
  const CLASS_OF = { mountain: 'mountain', snow: 'snow', tundra: 'snow', taiga: 'forest', forest: 'forest', jungle: 'forest', swamp: 'swamp', desert: 'desert', savanna: 'desert', steppe: 'grass', grass: 'grass' };

  function subbiomes(W) {
    const { w, h } = W, N = w * h, D = A.BiomeData, sub = new Uint8Array(N), subW = new Uint8Array(N); W.sub = sub; W.subW = subW; W.subUsed = [];
    if (!D || A.Params.isVoid(W.params)) return;
    const pools = {}; D.CLASSES.forEach((c, k) => { pools[c] = []; D.list.forEach((b, n) => { if (b[3] & (1 << k)) pools[c].push(n); }); });
    const r = A.Rng.stream(W.params.seed, 'subbio'), nz = A.Noise.make(W.params.seed + '|sub'), best = new Float32Array(N), used = new Set();
    for (let gy = 0; gy * CELL < h; gy++) for (let gx = 0; gx * CELL < w; gx++) {
      const on = r() < 0.7, cx = (gx + 0.2 + 0.6 * r()) * CELL, cy = (gy + 0.2 + 0.6 * r()) * CELL, rad = CELL * (0.3 + 0.3 * r()), pick = r();
      if (!on || cx >= w || cy >= h) continue;
      const ci = Math.floor(cy) * w + Math.floor(cx); if (!W.land[ci] || W.lake[ci]) continue;
      const pool = pools[CLASS_OF[A.BIOMES[W.bio[ci]].id]]; if (!pool || !pool.length) continue;
      const n = pool[Math.floor(pick * pool.length)], R = Math.ceil(rad * 1.6);
      for (let y = Math.max(0, Math.floor(cy) - R); y <= Math.min(h - 1, Math.floor(cy) + R); y++) for (let x = Math.max(0, Math.floor(cx) - R); x <= Math.min(w - 1, Math.floor(cx) + R); x++) {
        const i = y * w + x; if (!W.land[i] || W.lake[i]) continue;
        const q = Math.hypot(x - cx, y - cy) / rad + (nz.fbm(x / 45, y / 45, 3) - 0.5) * 0.55, v = 1 - sstep(0.5, 1, q);
        if (v > 0.02 && v > best[i]) { best[i] = v; sub[i] = n + 1; subW[i] = Math.round(v * 255); used.add(n); }
      }
    }
    W.subUsed = Array.from(used);
  }
  // біом плями в клітині або null: {id, name, desc}
  function at(W, i) { const k = W.sub && W.sub[i]; if (!k) return null; const b = A.BiomeData.list[k - 1]; return { id: b[0], name: b[1], color: b[2], desc: b[4] }; }

  A.SubBiomes = { at };
  (A.stages = A.stages || []).push(subbiomes);
})();
