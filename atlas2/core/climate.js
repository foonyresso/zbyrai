// Атлас 2.0, етап 3: клімат і біоми (чисті, без фентезі). Температура від широти й висоти, вологість від дощу й близькості води.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  // id → {name, color (для карти), move (множник вартості шляху), live (придатність для життя 0..1)}
  const BIOMES = [
    { id: 'ocean', name: 'Море', color: '#6f9fcf', move: 99, live: 0 },
    { id: 'lake', name: 'Озеро', color: '#79aedd', move: 99, live: 0 },
    { id: 'snow', name: 'Льодовики', color: '#eef2f4', move: 4, live: 0.02 },
    { id: 'mountain', name: 'Гори', color: '#a7a08f', move: 4, live: 0.1 },
    { id: 'tundra', name: 'Тундра', color: '#c9d1c4', move: 1.5, live: 0.2 },
    { id: 'taiga', name: 'Тайга', color: '#6f9a82', move: 1.6, live: 0.45 },
    { id: 'forest', name: 'Ліс', color: '#7fb07a', move: 1.5, live: 0.7 },
    { id: 'grass', name: 'Рівнина', color: '#b9d48a', move: 1, live: 1 },
    { id: 'steppe', name: 'Степ', color: '#d6d28c', move: 1, live: 0.8 },
    { id: 'savanna', name: 'Савана', color: '#d8c47a', move: 1.1, live: 0.5 },
    { id: 'desert', name: 'Пустеля', color: '#e3cf9c', move: 1.5, live: 0.12 },
    { id: 'swamp', name: 'Болото', color: '#8fa877', move: 2.6, live: 0.25 },
    { id: 'jungle', name: 'Джунглі', color: '#5f9d63', move: 2.2, live: 0.3 },
  ];
  const IDX = {}; BIOMES.forEach((b, i) => IDX[b.id] = i);

  function climate(p, T, H) {
    const { w, h } = p, N = w * h, nz = A.Noise.make(p.seed + '|clim');
    // відстань до води (BFS, клітини), для вологості
    const dist = new Float32Array(N).fill(1e9), q = [];
    for (let i = 0; i < N; i++) if (!T.land[i] || H.lake[i] || H.river[i]) { dist[i] = 0; q.push(i); }
    for (let k = 0; k < q.length; k++) {
      const i = q[k], x = i % w, y = (i / w) | 0;
      for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (dist[j] > dist[i] + 1) { dist[j] = dist[i] + 1; q.push(j); } }
    }
    const temp = new Float32Array(N), moist = new Float32Array(N), bio = new Uint8Array(N), warm = (p.warm == null ? 0 : p.warm);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, lat = Math.abs(y / h - 0.42) * 2;
      const t = 0.92 - 0.62 * Math.min(1, lat) + 0.18 * (nz.fbm(x / w * 3 + 4, y / h * 3 + 8, 3) - 0.5) + warm;
      temp[i] = Math.min(1, Math.max(0, t - 0.5 * Math.max(0, T.elev[i])));
      moist[i] = Math.min(1, Math.max(0, H.rain[i] * 0.85 + 0.35 * Math.exp(-dist[i] / 7) - 0.12));
      if (T.ocean[i]) { bio[i] = IDX.ocean; continue; }
      if (H.lake[i]) { bio[i] = IDX.lake; continue; }
      const e = T.elev[i], t0 = temp[i], m = moist[i];
      let b;
      if (e > 0.6 && t0 < 0.18 || e > 0.88) b = 'snow';
      else if (e > 0.58) b = 'mountain';
      else if (t0 < 0.22) b = 'tundra';
      else if (t0 < 0.38) b = m > 0.42 ? 'taiga' : 'tundra';
      else if (t0 < 0.7) b = m > 0.62 && e < 0.12 ? 'swamp' : m > 0.5 ? 'forest' : m > 0.32 ? 'grass' : 'steppe';
      else b = m > 0.7 ? 'jungle' : m > 0.5 ? 'savanna' : m > 0.3 ? 'steppe' : 'desert';
      bio[i] = IDX[b];
    }
    return { temp, moist, bio, waterDist: dist };
  }
  A.BIOMES = BIOMES; A.BIO = IDX; A.climate = climate;
})();
