// Атлас 2.0, етап 8: рівні, небезпека й локації.
// • Рівень росте з відстанню від нульових координат (центр карти): 1 рівень ≈ 2,5 км, ±10 % плавного шуму. Рівень регіону = середній по його суші, провінції = середній по її регіонах.
// • Небезпека залежить від відстані до живих поселень (більші поселення відсувають монстрів далі): безпечно → слабкі → звичайні → міні-боси → боси → супербоси → світові боси.
// • Локації (лігва, нори, табори бандитів, руїни, печери, шахти, джерела тощо) стоять за типом, ландшафтом і небезпекою; монстрів беремо з бестіарію (core/bestiary.js).
(function () {
  'use strict';
  const A = globalThis.Atlas2, B = A.Bestiary, { DX, DY } = A.Grid;
  const KM_PER_LEVEL = 2.5;
  const TIERS = ['Безпечно', 'Слабкі створіння', 'Звичайні монстри', 'Міні-боси', 'Боси', 'Супербоси', 'Світові боси'];
  const KIND_UA = ['слабкий', 'звичайний', 'інший', 'міні-бос', 'бос', 'супербос', 'світовий бос'];
  const KT = [-1, 0, 1, 3, 4, 5, 6]; // небезпека → тип монстра в бестіарії (індекс у B.KINDS)
  const KIND_BONUS = [-2, 0, 0, 3, 6, 10, 15];
  const REACH = { capital: 1.5, regional: 1.25, town: 1, village: 0.6, hamlet: 0.4 }; // у скільки разів поселення відсуває небезпеку
  const THR = [0.35, 1, 2, 3.5, 5.5, 8]; // ефективні км до поселення, з яких починається рівень небезпеки 1..6
  const GI = {}; B.GROUPS.forEach((g, i) => GI[g] = i);
  const GROUP_UA = { peaks: 'Вершини', mountain: 'Гори', hills: 'Пагорби', grass: 'Рівнина', steppe: 'Степ', savanna: 'Савана', forest: 'Ліс', taiga: 'Тайга', jungle: 'Джунглі', swamp: 'Болото', desert: 'Пустеля', tundra: 'Тундра', snow: 'Сніги' };
  const CATS = { m: 'Монстри', b: 'Бандити', r: 'Руїни й давнина', n: 'Природа', e: 'Господарство', k: 'Святе місце' };

  // Типи локацій: id, назва, категорія, [мін. небезпека, макс.], вага, групи (null — будь-які), монстри (0 ніколи, 1 від небезпеки 1), обмеження типу монстра (cap), особливість
  const ANY = null, FOR = ['forest', 'taiga', 'jungle'], HIL = ['hills', 'mountain', 'peaks'], OPEN = ['grass', 'steppe', 'savanna'];
  const TYPES = [
    { id: 'spring', name: 'Джерело', cat: 'n', t: [0, 2], w: 3, g: ANY, mon: 0 },
    { id: 'shrine', name: 'Придорожня каплиця', cat: 'k', t: [0, 1], w: 3, g: ANY, mon: 0 },
    { id: 'sawmill', name: 'Покинута лісопильня', cat: 'e', t: [0, 2], w: 2, g: FOR, mon: 1, cap: 1 },
    { id: 'quarry', name: 'Закинутий кар’єр', cat: 'e', t: [0, 3], w: 2, g: ['hills', 'mountain'], mon: 1, cap: 1 },
    { id: 'mine', name: 'Закинута шахта', cat: 'e', t: [1, 4], w: 2, g: HIL, mon: 1 },
    { id: 'farm', name: 'Покинута садиба', cat: 'r', t: [0, 2], w: 2, g: OPEN.concat(['forest']), mon: 1, cap: 1 },
    { id: 'cave', name: 'Печера', cat: 'n', t: [1, 4], w: 3, g: HIL.concat(['forest', 'taiga']), mon: 1 },
    { id: 'den', name: 'Нора', cat: 'm', t: [1, 2], w: 4, g: ANY, mon: 1, cap: 1, pack: [4, 9] },
    { id: 'nest', name: 'Гніздо', cat: 'm', t: [1, 3], w: 3, g: ['forest', 'jungle', 'swamp', 'hills', 'mountain', 'peaks', 'grass', 'taiga'], mon: 1, cap: 1, pack: [3, 7] },
    { id: 'lair', name: 'Лігво', cat: 'm', t: [2, 6], w: 5, g: ANY, mon: 1 },
    { id: 'banditcamp', name: 'Табір бандитів', cat: 'b', t: [1, 3], w: 4, g: ['grass', 'forest', 'hills', 'taiga', 'steppe', 'savanna'], mon: 1, bandits: true },
    { id: 'banditfort', name: 'Розбійницька фортеця', cat: 'b', t: [3, 5], w: 2, g: ['grass', 'forest', 'hills', 'taiga', 'steppe'], mon: 1, bandits: true, big: true },
    { id: 'ruins', name: 'Старі руїни', cat: 'r', t: [1, 5], w: 4, g: ANY, mon: 1 },
    { id: 'tomb', name: 'Давній склеп', cat: 'r', t: [2, 5], w: 2, g: ANY, mon: 1 },
    { id: 'barrow', name: 'Курган', cat: 'r', t: [1, 3], w: 2, g: ['grass', 'steppe', 'hills', 'tundra'], mon: 1 },
    { id: 'tower', name: 'Покинута вежа', cat: 'r', t: [0, 3], w: 2, g: ['hills', 'grass', 'forest'], mon: 1, cap: 1 },
    { id: 'temple', name: 'Забутий храм', cat: 'r', t: [3, 5], w: 2, g: ANY, mon: 1 },
    { id: 'mage', name: 'Вежа мага', cat: 'r', t: [2, 5], w: 1.5, g: ['hills', 'grass', 'forest', 'taiga'], mon: 1, magic: true },
    { id: 'monument', name: 'Давній пам’ятник', cat: 'r', t: [0, 4], w: 2, g: ANY, mon: 1, cap: 1 },
    { id: 'peak', name: 'Вершина', cat: 'n', t: [1, 6], w: 2, g: ['peaks'], mon: 1 },
    { id: 'waterfall', name: 'Водоспад', cat: 'n', t: [0, 3], w: 1.5, g: ANY, mon: 0, river: true },
    { id: 'grove', name: 'Священний гай', cat: 'k', t: [0, 3], w: 1, g: ['forest', 'taiga'], mon: 0 },
    { id: 'battle', name: 'Старе поле битви', cat: 'r', t: [2, 4], w: 1, g: ['grass', 'steppe', 'savanna'], mon: 1 },
    { id: 'oasis', name: 'Оаза', cat: 'n', t: [0, 3], w: 2, g: ['desert'], mon: 0 },
    { id: 'fort', name: 'Покинутий форт', cat: 'r', t: [1, 4], w: 1.5, g: ['hills', 'grass', 'steppe', 'forest'], mon: 1 },
    { id: 'citadel', name: 'Забута цитадель', cat: 'r', t: [5, 6], w: 3, g: ANY, mon: 1 },
    { id: 'domain', name: 'Володіння світового боса', cat: 'm', t: [6, 6], w: 4, g: ANY, mon: 1 }
  ];
  const TYPE_BY = {}; TYPES.forEach(t => TYPE_BY[t.id] = t);
  const BANDIT = /бандит|розбійн|грабіж|злодій|контрабанд|ватаг|отаман/i;

  // відстань (хамфер 1 / 1.41), у клітинах, від джерел
  function distField(w, h, srcs) {
    const d = new Float32Array(w * h).fill(1e9); for (const c of srcs) d[c] = 0;
    const F = [[-1, -1, 1.414], [0, -1, 1], [1, -1, 1.414], [-1, 0, 1]], Bk = [[1, 1, 1.414], [0, 1, 1], [-1, 1, 1.414], [1, 0, 1]];
    const pass = (L, y0, y1, dy, x0, x1, dx) => { for (let y = y0; y !== y1; y += dy) for (let x = x0; x !== x1; x += dx) { const i = y * w + x; let v = d[i]; for (const [ox, oy, c] of L) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const q = d[ny * w + nx] + c; if (q < v) v = q; } d[i] = v; } };
    pass(F, 0, h, 1, 0, w, 1); pass(Bk, h - 1, -1, -1, w - 1, -1, -1);
    return d;
  }
  const heightM = (W, i) => W.land[i] && !W.lake[i] ? Math.round(Math.max(0, W.elev[i] - W.sea) / Math.max(1e-6, W.top - W.sea) * 4800 / 10) * 10 : null;
  // пул монстрів за типом і групою (з запасними варіантами, щоб пул не був порожнім)
  const pools = new Map();
  function pool(kind, group) {
    const key = kind + '|' + group; let p = pools.get(key); if (p) return p;
    const L = B.list, bit = 1 << group;
    p = []; for (let i = 0; i < L.length; i++) if (L[i][1] === kind && (L[i][3] & bit)) p.push(i);
    if (!p.length) for (let i = 0; i < L.length; i++) if (L[i][1] === kind) p.push(i);
    pools.set(key, p); return p;
  }
  const mon = (idx, count, W, i) => { const e = B.list[idx]; return { name: e[0], kind: KIND_UA[e[1]], kindIdx: e[1], magic: !!e[2], count, level: Math.max(1, W.level[i] + KIND_BONUS[e[1]]), desc: e[4] }; };

  // ---- етап 1: рівні, групи ландшафту, небезпека, щільність монстрів ----
  function danger(W) {
    const { w, h } = W, N = w * h, km = W.params.kmPerCell, nz = A.Noise.make(W.params.seed + '|danger');
    W.origin = { x: w / 2, y: h / 2 }; // нульові координати — центр карти
    let top = 0; for (let i = 0; i < N; i++) if (W.land[i] && W.elev[i] > top) top = W.elev[i]; W.top = top || 1;
    // рівень клітини
    const level = new Uint16Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot(x + 0.5 - W.origin.x, y + 0.5 - W.origin.y) * km, mult = 1 + (nz.fbm(x * 0.03 + 5, y * 0.03 + 5, 2) - 0.5) * 0.9; level[y * w + x] = Math.max(1, Math.round(1 + d / KM_PER_LEVEL * mult)); }
    W.level = level;
    // групи ландшафту: біом + висота (пагорби, вершини)
    const el = []; for (let i = 0; i < N; i += 7) if (W.land[i] && !W.lake[i]) el.push(W.elev[i]); el.sort((a, b) => a - b);
    const hillT = el[Math.floor(el.length * 0.72)] || 1, peakT = el[Math.floor(el.length * 0.985)] || 1;
    const group = new Uint8Array(N).fill(255);
    for (let i = 0; i < N; i++) {
      if (!W.land[i] || W.lake[i]) continue; const b = A.BIOMES[W.bio[i]].id; let g = b;
      if (b === 'mountain') g = W.elev[i] > peakT ? 'peaks' : 'mountain';
      else if (b === 'snow') g = W.elev[i] > peakT ? 'peaks' : 'snow';
      else if ((b === 'grass' || b === 'forest' || b === 'steppe' || b === 'savanna' || b === 'taiga') && W.elev[i] > hillT) g = 'hills';
      group[i] = GI[g] != null ? GI[g] : GI.grass;
    }
    W.group = group;
    // доля поселень: частина сіл і міст (не столиці й не центри регіонів) зруйнована або окупована монстрів/бандитами; чим далі від центру, тим частіше
    const fr = A.Rng.stream(W.params.seed, 'fates'), dmax = Math.hypot(w, h) / 2, PF = { town: 0.1, village: 0.16, hamlet: 0.2 };
    for (const s of W.settlements) {
      if (s.ruined || !PF[s.rank]) continue;
      if (fr() >= PF[s.rank] * (0.6 + 1.2 * Math.min(1, Math.hypot(s.x - W.origin.x, s.y - W.origin.y) / dmax))) continue;
      s.fate = fr() < 0.4 ? 'ruined' : 'occupied'; if (s.fate === 'occupied') s.occupier = fr() < 0.3 ? 'bandits' : 'monsters';
      s.popBefore = s.pop; if (s.region >= 0) { W.regions[s.region].pop -= s.pop; W.provinces[W.regions[s.region].prov].pop -= s.pop; } s.pop = 0;
    }
    // небезпека за відстанню до живих поселень
    const eff = new Float32Array(N).fill(1e9);
    for (const rank of Object.keys(REACH)) {
      const srcs = []; for (const s of W.settlements) if (!s.ruined && !s.fate && s.rank === rank) srcs.push(s.i);
      if (!srcs.length) continue; const d = distField(w, h, srcs), k = km / REACH[rank];
      for (let i = 0; i < N; i++) { const v = d[i] * k; if (v < eff[i]) eff[i] = v; }
    }
    const tier = new Uint8Array(N), dens = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!W.land[i] || W.lake[i]) continue;
      const e = eff[i] * Math.min(1.35, Math.max(0.7, 1 + (nz.fbm(x * 0.035 + 40, y * 0.035 + 7, 3) - 0.5) * 3));
      let t = 0; while (t < THR.length && e >= THR[t]) t++; tier[i] = t;
      dens[i] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + (nz.fbm(x * 0.02 + 90, y * 0.02 + 3, 3) - 0.5) * 4.5)));
    }
    // навколо окупованих і зруйнованих поселень небезпека не нижча за мінімум: у серці окупації найвища
    const FR = { town: 8, village: 5, hamlet: 4 }, FB = { town: 4, village: 3, hamlet: 3 };
    for (const s of W.settlements) {
      if (!s.fate) continue; const R = FR[s.rank];
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x, d = Math.hypot(dx, dy); if (d > R || !W.land[i] || W.lake[i]) continue;
        const f = s.fate === 'occupied' ? FB[s.rank] - (d > R / 2 ? 1 : 0) : (d <= R / 2 ? 2 : 1); if (tier[i] < f) tier[i] = f;
      }
    }
    W.tier = tier; W.dens = dens;
    // середні рівні регіонів і провінцій
    const sum = W.regions.map(() => 0), cnt = W.regions.map(() => 0), mn = W.regions.map(() => 1e9), mx = W.regions.map(() => 0);
    for (let i = 0; i < N; i++) { const r = W.region[i]; if (r < 0 || !W.land[i] || W.lake[i]) continue; sum[r] += level[i]; cnt[r]++; if (level[i] < mn[r]) mn[r] = level[i]; if (level[i] > mx[r]) mx[r] = level[i]; }
    W.regions.forEach((g, k) => { g.level = cnt[k] ? Math.round(sum[k] / cnt[k]) : level[g.centerCell]; g.levelMin = cnt[k] ? mn[k] : g.level; g.levelMax = cnt[k] ? mx[k] : g.level; });
    W.provinces.forEach(p => { const rs = p.regions.map(id => W.regions[id]); p.level = Math.round(rs.reduce((a, g) => a + g.level, 0) / Math.max(1, rs.length)); p.levelMin = Math.min(...rs.map(g => g.levelMin)); p.levelMax = Math.max(...rs.map(g => g.levelMax)); });
    for (const s of W.settlements) s.level = level[s.i];
  }

  // ---- етап 2: локації ----
  function sites(W) {
    const { w, h } = W, N = w * h, km = W.params.kmPerCell, r = A.Rng.stream(W.params.seed, 'sites'), names = A.Names.make(W.params.seed + '|sites');
    const landCells = []; for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) landCells.push(i);
    const riverCells = []; for (let i = 0; i < N; i++) if (W.river[i] && W.acc[i] > (W.riverThr || 20) * 2.5) riverCells.push(i);
    const bk = (x, y) => ((y / 16) | 0) * 1000 + ((x / 16) | 0), buckets = new Map(), out = [], SP = [7, 9, 11, 18, 32, 60, 110];
    const near = (x, y, d, list) => { for (let by = Math.floor((y - d) / 16); by <= Math.floor((y + d) / 16); by++) for (let bx = Math.floor((x - d) / 16); bx <= Math.floor((x + d) / 16); bx++) for (const s of buckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    const sBuckets = new Map(); for (const s of W.settlements) { const k = bk(s.x, s.y); (sBuckets.get(k) || sBuckets.set(k, []).get(k)).push(s); }
    const nearS = (x, y, d) => { for (let by = Math.floor((y - d) / 16); by <= Math.floor((y + d) / 16); by++) for (let bx = Math.floor((x - d) / 16); bx <= Math.floor((x + d) / 16); bx++) for (const s of sBuckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    const pickIdx = p => p[Math.floor(r() * p.length)];
    const bandits = idx => B.list.map((e, k) => BANDIT.test(e[0]) && e[1] === idx ? k : -1).filter(k => k >= 0);
    const banditPool = [0, 1, 3, 4].map(bandits);
    function crew(type, tier, g, i) {
      if (!type.mon || tier < 1) return [];
      let k = KT[tier]; if (tier >= 2 && r() < 0.3) k = KT[tier - 1]; if (type.cap != null && k > type.cap) k = type.cap;
      const lead = [], lk = [0, 1, 3, 4].indexOf(k) >= 0 ? k : 1;
      if (type.bandits) {
        const bp = banditPool[[0, 1, 3, 4].indexOf(Math.min(lk, 4))] || [];
        const main = bp.length ? pickIdx(bp) : pickIdx(pool(1, g)), cnt = type.big ? 8 + Math.floor(r() * 13) : 3 + Math.floor(r() * 6);
        lead.push(mon(main, cnt, W, i));
        if (type.big || tier >= 3) { const bossK = pickIdx(banditPool[3].length ? banditPool[3] : pool(3, g)); lead.unshift(mon(bossK, 1, W, i)); }
        return lead;
      }
      const lp = pool(k, g); if (!lp.length) return [];
      const lcount = k <= 1 ? (type.pack ? type.pack[0] + Math.floor(r() * (type.pack[1] - type.pack[0] + 1)) : k === 0 ? 3 + Math.floor(r() * 5) : 2 + Math.floor(r() * 4)) : 1;
      lead.push(mon(pickIdx(lp), lcount, W, i));
      if (k >= 3) { const ek = k === 3 ? 1 : k - 1, ep = pool(ek, g); if (ep.length) lead.push(mon(pickIdx(ep), ek <= 1 ? 2 + Math.floor(r() * 4) : 1 + Math.floor(r() * 2), W, i)); if (k >= 5) { const ep2 = pool(1, g); if (ep2.length) lead.push(mon(pickIdx(ep2), 3 + Math.floor(r() * 4), W, i)); } }
      return lead;
    }
    // окуповані поселення: мешканці-монстри (або бандити); сила за небезпекою навколо
    for (const q of W.settlements) {
      if (q.fate !== 'occupied') continue; const tier = Math.max(3, W.tier[q.i]), g = W.group[q.i];
      q.monsters = crew({ mon: 1, bandits: q.occupier === 'bandits', big: q.rank === 'town', pack: [5, 10] }, tier, g, q.i); const lead = q.monsters[0];
      q.level = lead ? Math.max(1, W.level[q.i] + KIND_BONUS[lead.kindIdx]) : W.level[q.i];
    }
    const target = Math.round(landCells.length / 130);
    for (let t = 0; t < target * 14 && out.length < target; t++) {
      const wantRiver = r() < 0.04 && riverCells.length, i = wantRiver ? riverCells[Math.floor(r() * riverCells.length)] : landCells[Math.floor(r() * landCells.length)];
      const x = i % w, y = (i / w) | 0, tier = W.tier[i], g = W.group[i]; if (g === 255 || W.river[i] && !wantRiver) continue;
      if (tier >= 1 && r() > 0.45 + 0.55 * W.dens[i] / 255) continue; // щільніші й порожніші частини світу
      if (tier === 0 && r() > 0.25) continue;
      const gname = B.GROUPS[g], opts = TYPES.filter(T => tier >= T.t[0] && tier <= T.t[1] && (!T.g || T.g.indexOf(gname) >= 0) && !!T.river === wantRiver);
      if (!opts.length) continue; let tw = opts.reduce((a, T) => a + T.w, 0), pick = r() * tw, type = opts[0]; for (const T of opts) { pick -= T.w; if (pick <= 0) { type = T; break; } }
      if (nearS(x, y, 4) || near(x, y, SP[tier])) continue;
      const monsters = crew(type, tier, g, i), lead = monsters[0];
      const site = { id: out.length, type: type.id, typeName: type.name, cat: type.cat, name: type.name + ' ' + names.town(names.lang()), i, x, y, tier, group: gname, level: lead ? Math.max(1, W.level[i] + KIND_BONUS[lead.kindIdx]) : W.level[i], monsters };
      out.push(site); const k = bk(x, y); (buckets.get(k) || buckets.set(k, []).get(k)).push(site);
    }
    W.sites = out;
  }

  // що зазвичай водиться на клітині (для підказки): тип за небезпекою, 2 види за хешем ділянки 8×8, щоб не мінялося щокліку
  function encounter(W, i) {
    const tier = W.tier[i], g = W.group[i]; if (!tier || g === 255) return { tier: 0, label: TIERS[0], species: [] };
    const x = i % W.w, y = (i / W.w) | 0, hs = A.Rng.hashSeed(W.params.seed), p = pool(KT[tier], g), sp = [];
    if (p.length) { const hh = Math.imul((x >> 3) * 73856093 ^ (y >> 3) * 19349663 ^ hs, 2654435761) >>> 0; for (let k = 0; k < Math.min(2, p.length); k++) sp.push(B.list[p[(hh + k * 7919) % p.length]]); }
    return { tier, label: TIERS[tier], species: sp.map(e => ({ name: e[0], kind: KIND_UA[e[1]], magic: !!e[2], desc: e[4], level: Math.max(1, W.level[i] + KIND_BONUS[e[1]]) })) };
  }
  A.Danger = { TIERS, KIND_UA, CATS, GROUP_UA, TYPES, TYPE_BY, KM_PER_LEVEL, heightM, encounter, groupName: (W, i) => W.group[i] === 255 ? null : B.GROUPS[W.group[i]] };
  (A.stages = A.stages || []).push(danger, sites);
})();
