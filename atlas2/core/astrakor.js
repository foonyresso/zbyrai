// Атлас 2.0, вимір «Астракор»: один велетенський материк у космосі, що тримається на коренях дерева в центрі. Без океанів: за краєм порожнеча (A.Params.isVoid).
// Тут: форма материка й корені (замість terrain.js), особливі біоми виміру (з лору medieval-world/worlds/astrakor) і їх розкладка після клімату.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY, components } = A.Grid;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const SEA = 0.3; // «рівень» суші: нижче лише космос

  // біоми виміру (колір і назви з biomes/{root-coasts,garden-branches,dead-crown,star-caverns}.js); alias — група ландшафту для монстрів і локацій
  const SPECIAL = [
    { id: 'tree', name: 'Кореневий вузол', color: '#5a3f27', move: 2.2, live: 0.35, alias: 'peaks', desc: 'Гігантське дерево в центрі материка: на його коренях тримається вся земля. Тут сходяться всі корені, а в стовбурі стоїть центральний храм.' },
    { id: 'rootcoast', name: 'Кореневі Узбережжя', color: '#6b543b', move: 2.2, live: 0.3, alias: 'forest', desc: 'Краї материка: земля закінчується обривами, з яких у космічну безодню звисають товсті корені.' },
    { id: 'garden', name: 'Сади Колосальних Гілок', color: '#2f8a4e', move: 1.8, live: 0.95, alias: 'forest', desc: 'Деревні масиви на поверхні коренів, кожна гілка завбільшки з гору. Гігантські папороті, смарагдові крони, світні гриби.' },
    { id: 'deadcrown', name: 'Мертва Крона', color: '#3b393f', move: 2, live: 0.1, alias: 'desert', desc: 'Чорні лісові руїни з обгорілими деревами й покинутими храмами.' },
    { id: 'starcave', name: 'Зоряні Порожнини', color: '#1f8f8a', move: 2.4, live: 0.15, alias: 'mountain', desc: 'Світні кристали на виходах печер усередині материка.' },
  ];
  for (const b of SPECIAL) { A.BIO[b.id] = A.BIOMES.length; A.BIOMES.push(b); }
  // кольори суші в цьому вимірі: насичена зелень («Смарагдова Спина»), темне дерево, бірюзове світіння
  const PALETTE = { snow: '#d8e6e2', mountain: '#7f8a72', tundra: '#6f9a82', taiga: '#1f7a4a', forest: '#0f6b3a', grass: '#2f9a5a', steppe: '#5e9a4a', savanna: '#7a9a45', desert: '#a89a62', swamp: '#2a6a4a', jungle: '#0d7a4a' };
  const RENAME = { grass: 'Смарагдова Спина', forest: 'Смарагдова Спина (ліси)', steppe: 'Смарагдова Спина (луки)', jungle: 'Смарагдова Спина (хащі)', swamp: 'Смарагдова Спина (болота)', lake: 'Смарагдова Спина (озера)' };

  // корені: від центру променями до краю материка, з гілками. Вузли {x, y, wd}; ширина звужується до кінця
  function makeRoots(p) {
    const r = A.Rng.stream(p.seed, 'roots'), { w, h } = p, S = Math.min(w, h), cx = w / 2, cy = h / 2, rr = (a, b) => a + (b - a) * r(), out = [];
    function walk(x0, y0, head, len, wd0, wd1, bend) {
      const step = S * 0.03, n = Math.max(3, Math.round(len / step)), pts = []; let x = x0, y = y0, curv = rr(-1, 1) * bend;
      for (let k = 0; k <= n; k++) {
        const t = k / n; pts.push({ x, y, wd: wd0 + (wd1 - wd0) * t });
        if (r() < 0.15) curv = rr(-1, 1) * bend; head += curv * 0.5 + (r() - 0.5) * bend * 0.3; x += Math.cos(head) * step; y += Math.sin(head) * step;
      }
      return pts;
    }
    const n = 9 + Math.floor(r() * 5), L = Math.min(w, h) * 0.5 * 1.05;
    for (let k = 0; k < n; k++) {
      const a = (k + rr(-0.25, 0.25)) / n * 6.2832, main = walk(cx, cy, a, L * rr(0.9, 1.1), S * rr(0.02, 0.028), S * rr(0.007, 0.012), rr(0.25, 0.6)); out.push(main);
      for (let b = 0, nb = 1 + Math.floor(r() * 3); b < nb; b++) {
        const i = Math.floor(rr(0.25, 0.7) * (main.length - 1)), q = main[i], pa = main[Math.min(main.length - 1, i + 1)], pb = main[Math.max(0, i - 1)], hd = Math.atan2(pa.y - pb.y, pa.x - pb.x) + (r() < 0.5 ? 1 : -1) * rr(0.5, 1.1);
        out.push(walk(q.x, q.y, hd, L * rr(0.22, 0.5), q.wd * 0.65, S * rr(0.005, 0.008), rr(0.3, 0.8)));
      }
    }
    return out;
  }
  // 0 далеко від коренів … 1 на осі кореня (за відстанню до відрізків, поділеною на півширину)
  function rootField(p, roots) {
    const { w, h } = p, D = new Float32Array(w * h).fill(9);
    for (const pts of roots) for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k], R = Math.max(a.wd, b.wd) * 2.2, x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - R)), x1 = Math.min(w - 1, Math.ceil(Math.max(a.x, b.x) + R)), y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - R)), y1 = Math.min(h - 1, Math.ceil(Math.max(a.y, b.y) + R));
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2)), v = Math.hypot(x - a.x - dx * t, y - a.y - dy * t) / (a.wd + (b.wd - a.wd) * t); if (v < D[y * w + x]) D[y * w + x] = v; }
    }
    for (let i = 0; i < D.length; i++) D[i] = 1 - sstep(0.3, 1.5, D[i]);
    return D;
  }

  function terrain(p) {
    const { w, h } = p, N = w * h, S = Math.min(w, h), nz = A.Noise.make(p.seed + '|t'), jr = A.Rng.stream(p.seed, 'micro'), cx = w / 2, cy = h / 2, rx = w * 0.455, ry = h * 0.455;
    const root = rootField(p, makeRoots(p)), hh = new Float32Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, nx = x / w, ny = y / h;
      const wx = nx + 0.1 * (nz.fbm(nx * 2.3 + 7, ny * 2.3 + 3, 3) - 0.5), wy = ny + 0.1 * (nz.fbm(nx * 2.3 + 31, ny * 2.3 + 19, 3) - 0.5);
      // обрис: еліпс, зламаний шумом у двох масштабах (затоки-обриви й виступи); край карти лишається космосом
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry), dd = d + 0.2 * (nz.fbm(nx * 2.4 + 13, ny * 2.4 + 5, 4) - 0.5) + 0.07 * (nz.fbm(nx * 8 + 3, ny * 8 + 9, 3) - 0.5);
      if (dd >= 0.9) { hh[i] = 0.05 + 0.04 * jr(); continue; }
      const m = nz.fbm(wx * 4.2, wy * 4.2, 6), ridge = 1 - Math.abs(2 * nz.fbm(wx * 5 + 200, wy * 5 + 200, 4) - 1);
      let v = SEA + 0.03 + 0.5 * m * m; // без плоских ділянок: на рівнинах вода не збирається в безліч озер
      v += p.rugged * 0.2 * Math.pow(ridge, 3) * sstep(0.45, 0.62, m);
      v += 0.14 * (1 - sstep(0, 0.9, dd)); // купол: суша знижується від центру до обриву, тож вода тече до краю, а не збирається в безліч озер
      v += 0.16 * root[i]; // корені здіймаються пасмами: природні шляхи й межі провінцій
      const dc = Math.hypot(x - cx, y - cy) / S + 0.012 * (nz.fbm(nx * 14 + 5, ny * 14 + 2, 2) - 0.5);
      v += 0.35 * (1 - sstep(0.03, 0.085, dc)); // стовбур: плато в центрі
      hh[i] = v + 0.012 * (jr() - 0.5);
    }
    let land = new Uint8Array(N); for (let i = 0; i < N; i++) land[i] = hh[i] > SEA ? 1 : 0;
    // один материк: найбільший шматок суші, решта відходить у космос
    const lc = components(w, h, i => land[i] === 1); let big = 0; lc.sizes.forEach((s, k) => { if (s > lc.sizes[big]) big = k; });
    for (let i = 0; i < N; i++) if (land[i] && lc.id[i] !== big) { land[i] = 0; hh[i] = 0.06; }
    // космос = порожнеча, пов'язана з краєм; замкнені «озера» порожнечі всередині суші заповнюються сушею
    const wc = components(w, h, i => land[i] === 0), ocean = new Uint8Array(N), edgeIds = new Set();
    for (let x = 0; x < w; x++) { edgeIds.add(wc.id[x]); edgeIds.add(wc.id[(h - 1) * w + x]); }
    for (let y = 0; y < h; y++) { edgeIds.add(wc.id[y * w]); edgeIds.add(wc.id[y * w + w - 1]); }
    for (let i = 0; i < N; i++) if (!land[i] && edgeIds.has(wc.id[i])) ocean[i] = 1;
    for (let i = 0; i < N; i++) if (!land[i] && !ocean[i]) { land[i] = 1; hh[i] = SEA + 0.002; }
    let top = SEA + 0.01; for (let i = 0; i < N; i++) if (hh[i] > top) top = hh[i];
    const elev = new Float32Array(N), mx = top - SEA, mask = new Uint8Array(N);
    for (let i = 0; i < N; i++) { elev[i] = (hh[i] - SEA) / mx; if (land[i] && root[i] > 0.55) mask[i] = 1; }
    return { height: hh, elev, sea: SEA, land, ocean, root: mask };
  }

  // після клімату: особливі біоми виміру поверх базових (смарагдові рівнини й ліси лишаються «Смарагдовою Спиною»)
  function biomes(p, T, H, C) {
    const { w, h } = p, N = w * h, S = Math.min(w, h), cx = w / 2, cy = h / 2, nz = A.Noise.make(p.seed + '|astro'), r = A.Rng.stream(p.seed, 'astrobio'), B = A.BIO, bio = C.bio;
    // відстань до космосу (клітини), для кореневих узбереж
    const dv = new Float32Array(N).fill(1e9), q = [];
    for (let i = 0; i < N; i++) if (T.ocean[i]) { dv[i] = 0; q.push(i); }
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (dv[j] > dv[i] + 1) { dv[j] = dv[i] + 1; q.push(j); } } }
    // Мертва Крона: 1–2 плями на півдорозі до краю; Зоряні Порожнини: кілька дрібних плям на узвишшях
    const dead = [], nd = 1 + (r() < 0.5 ? 1 : 0), spots = [];
    for (let k = 0; k < nd; k++) { const a = r() * 6.2832, dc = S * (0.2 + 0.14 * r()); dead.push({ x: cx + Math.cos(a) * dc, y: cy + Math.sin(a) * dc, rad: S * (0.07 + 0.05 * r()) }); }
    for (let t = 0, want = 8 + Math.floor(S / 40); t < 600 && spots.length < want; t++) {
      const x = 4 + r() * (w - 8), y = 4 + r() * (h - 8), i = Math.round(y) * w + Math.round(x);
      if (!T.land[i] || H.lake[i] || dv[i] < 12 || Math.hypot(x - cx, y - cy) < S * 0.12 || dead.some(d => Math.hypot(x - d.x, y - d.y) < d.rad)) continue;
      spots.push({ x, y, rad: S * (0.012 + 0.018 * r()) });
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!T.land[i] || H.lake[i]) continue;
      const dc = Math.hypot(x - cx, y - cy) / S, n1 = nz.fbm(x / w * 9 + 3, y / h * 9 + 1, 3), n2 = nz.fbm(x / w * 18 + 40, y / h * 18 + 9, 3);
      if (spots.some(s => Math.hypot(x - s.x, y - s.y) / s.rad + (n2 - 0.5) * 0.7 < 1) && T.elev[i] > 0.12) bio[i] = B.starcave;
      if (dead.some(d => Math.hypot(x - d.x, y - d.y) / d.rad + (n1 - 0.5) * 0.9 < 1)) bio[i] = B.deadcrown;
      if (sstep(0.05, 0.09, dc) * (1 - sstep(0.15, 0.24, dc)) > 0.5 + 0.45 * (n1 - 0.5)) bio[i] = B.garden;
      if (dv[i] <= 3 + 5 * n2) bio[i] = B.rootcoast;
      if (dc + 0.012 * (n1 - 0.5) < 0.055) bio[i] = B.tree;
    }
    return bio;
  }

  A.astrakorTerrain = terrain; A.astrakorBiomes = biomes; A.Astrakor = { SPECIAL, PALETTE, RENAME, SEA };
})();
