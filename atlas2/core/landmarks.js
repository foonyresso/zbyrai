// Атлас 2.0: місця за містами: старі споруди, великі пам'ятники, краєвиди й технологічні пристрої на відстані 1–5 км від великих міст; до кожного веде стежка, що підключається до дорожньої мережі.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const KINDS = {
    ruin: { n: 'Старі споруди', names: ['Стара вежа', 'Занедбаний форт', 'Давня обсерваторія', 'Рештки храму', 'Покинутий маєток'], d: 'Давня споруда, яку час і вітри не пощадили; місцеві кажуть, що в підвалах ще лежать речі колишніх господарів.', lvl: 4 },
    monument: { n: 'Великий пам’ятник', names: ['Колос', 'Обеліск', 'Кам’яний вартовий', 'Арка Переможців', 'Статуя Засновника'], d: 'Величезна кам’яна постать або стела; до неї приходять у свята, а мандрівники залишають тут дрібні дари.', lvl: 3 },
    vista: { n: 'Краєвид', names: ['Оглядовий пагорб', 'Скеляста тераса', 'Водоспад', 'Небесний уступ', 'Тиха долина'], d: 'Місце, звідки відкривається чудовий вид на околиці; тут люблять відпочивати подорожні й закохані.', lvl: 4 },
    tech: { n: 'Майстерня й пристрої', names: ['Паровий млин', 'Дослідна майстерня', 'Вежа зв’язку чародіїв', 'Алхімічна дистилерія', 'Механічна пасіка'], d: 'Дивовижні механізми й пристрої майстрів: пара, шестерні й трохи чарів; відвідувачів пускають неохоче.', lvl: 3 },
  };
  const ORDER = ['ruin', 'monument', 'vista', 'tech'], PER = { capital: [3, 4], regional: [2, 3], town: [1, 2] }, KM = { capital: [2, 5], regional: [1.5, 4], town: [1, 3] };
  function landmarks(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'landmarks'), noise = A.Noise.make(W.params.seed + '|lmroads'), CS = W.params.kmPerCell, list = [], taken = W.settlements.map(s => [s.x, s.y]);
    const level = W.roadLevel, dist = new Float32Array(N), prev = new Int32Array(N), heap = new A.Heap(), big = (W.riverThr || 20) * 5, cellOf = new Int32Array(N).fill(-1);
    for (const s of W.settlements) cellOf[s.i] = s.id;
    const cost = (j, i, diag) => { if (W.ocean[j] || W.lake[j] || (W.root && W.root[j]) || (W.wallMask && W.wallMask[j] && !W.gateMask[j])) return Infinity; let c = A.BIOMES[W.bio[j]].move + Math.abs(W.elev[j] - W.elev[i]) * 40; if (W.river[j]) c += W.acc[j] > big ? 14 : 3; c *= 1 + 0.9 * noise.fbm((j % w) * 0.09, ((j / w) | 0) * 0.09, 3); if (level[j]) c *= 0.12; return c * (diag ? 1.41 : 1); };
    function route(src, isTarget) {
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[src] = 0; heap.push(0, src);
      while (heap.size) { const i = heap.pop(), d0 = dist[i]; if (d0 > 0 && isTarget(i)) { const p = []; for (let c = i; c >= 0; c = prev[c]) p.push(c); return p.reverse(); } const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx, c = cost(j, i, d >= 4); if (c === Infinity) continue; const nd = d0 + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); } } }
      return null;
    }
    // шлях від місця до мережі (p[0] — місце, останній — клітина з дорогою): нові відрізки додаються до W.roads
    function commit(p, lvl) { let k = 0; while (k < p.length) { if (level[p[k]]) { k++; continue; } let e = k; while (e + 1 < p.length && !level[p[e + 1]]) e++; const cells = p.slice(Math.max(0, k - 1), Math.min(p.length, e + 2)); for (let q = k; q <= e; q++) { level[p[q]] = lvl; if (W.river[p[q]]) W.bridges.push(p[q]); } W.roads.push({ level: lvl, cells }); k = e + 1; } }
    const mkName = A.CityText ? () => A.CityText.mkName(r) : () => '';
    for (const s of W.settlements) {
      if (s.ruined || s.fate || s.fortress || s.region < 0 || !PER[s.rank]) continue; const [a, b] = PER[s.rank], n = a + Math.floor(r() * (b - a + 1)); let kinds = ORDER.slice().sort(() => r() - 0.5);
      for (let q = 0; q < n; q++) {
        const kind = kinds[q % 4], [d0, d1] = KM[s.rank], cands = [];
        for (let t = 0; t < 70 && cands.length < 10; t++) {
          const ang = r() * 6.2832, d = (d0 + (d1 - d0) * r()) * (kind === 'vista' ? 1.15 : 1) / CS, x = Math.round(s.x + Math.cos(ang) * d), y = Math.round(s.y + Math.sin(ang) * d); if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) continue;
          const i = y * w + x; if (!W.land[i] || W.lake[i] || W.river[i] || (W.root && W.root[i]) || (W.wallMask && W.wallMask[i]) || W.landmass[i] !== s.landmass || taken.some(p => Math.hypot(p[0] - x, p[1] - y) < 4)) continue;
          cands.push(i);
        }
        if (!cands.length) continue; let i = cands[0];
        if (kind === 'vista') i = cands.slice().sort((p, q2) => W.elev[q2] - W.elev[p])[0];
        else if (kind === 'tech') { const wet = j => { const x = j % w, y = (j / w) | 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && W.river[ny * w + nx]) return true; } return false; }; i = cands.find(wet) || cands[0]; }
        const K = KINDS[kind], x = i % w, y = (i / w) | 0, id = list.length;
        const p = route(i, j => level[j] > 0 || cellOf[j] >= 0); if (!p) continue; commit(p, K.lvl);
        taken.push([x, y]); list.push({ id, kind, name: K.names[Math.floor(r() * K.names.length)] + (mkName() ? ' «' + mkName() + '»' : ''), x, y, i, from: s.id, km: Math.round(Math.hypot(x - s.x, y - s.y) * CS * 10) / 10 });
      }
    }
    W.landmarks = list;
  }
  A.LANDMARK_KINDS = KINDS;
  (A.stages = A.stages || []).push(landmarks);
})();
