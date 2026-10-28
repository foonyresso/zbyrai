// Атлас 2.0, замок: види замків (на пагорбі, прибережний, міська цитадель, чотирикутний із двома дворами, при мурі міста) і вибір виду за ділянкою:
// скільки межі припадає на воду, мур міста й дороги, чи горбиста місцевість, ранг міста, наскільки форма цільна. Кожен вид має свій мур (вежі, ворота), двори й програму споруд.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, clamp = G.clamp;
  // програма споруд: o {A, nm, tier, hasWater}, u {U(a,b) — випадкове з розміром, sz, rowD — спільна глибина рядів}; усі розміри в метрах до масштабу; чим більша ділянка (k = A / 6000), тим більше й різноманітніше.
  // Донжон найбільший і вирівняний за віссю брами; решта споруд (row) стають рядами вздовж мурів з однаковою глибиною, посередині лишається вільний двір; дрібноти немає (цистерни — колодязі-пропи).
  function common(o, u, opt) {
    opt = opt || {}; const k = o.A / 6000, U = u.U, L = [], nm = o.nm, pw = opt.palasWard || 'inner', D = u.rowD, row = (s, d) => Object.assign({ row: 1, h: D * (d || 1) }, s);
    L.push({ type: 'donjon', first: 1, ward: 'inner', w: U(24, 29), h: U(24, 29), axis: 1, pole: opt.polo != null ? opt.polo : 1.1, rear: opt.rear != null ? opt.rear : 0.35, uniq: 1, round: !!opt.round, name: 'Донжон «' + nm + '»', desc: 'Головна вежа замку: товсті стіни, схованка зі скарбами й останній притулок захисників.' });
    L.push({ type: 'palas', first: 1, ward: pw, w: U(27, 32), h: U(13, 15), nearT: ['donjon', 31], wall: 0.8, uniq: 1, name: 'Палац замку «' + nm + '»', desc: 'Покої правителя й велика зала, де вирішують справи, судять і бенкетують.' });
    L.push({ type: 'chapel', first: 1, ward: pw, w: U(10, 12), h: U(16, 19), nearT: ['palas', 22], wall: 0.8, name: 'Замкова каплиця', desc: 'Тут молиться двір і гарнізон; під плитами — родові поховання.' });
    L.push(row({ type: 'barracks', ward: 'outer', n: clamp(Math.round(k), 1, 5), w: U(28, 36), wall: 2.2, uniq: 1, must: 1, name: 'Гарнізонні казарми', desc: 'Тут живе й тренується гарнізон замку.' }));
    L.push(row({ type: 'stable', ward: 'outer', n: k > 3.6 ? 2 : 1, w: U(18, 21), gate: 1.2, wall: 1.5, name: 'Замкова стайня', desc: 'Бойові коні й гінці правителя.' }));
    if (k > 1.2) L.push(row({ type: 'smith', ward: 'outer', n: 1, w: U(13, 15), gate: 0.8, wall: 1, name: 'Замкова кузня', desc: 'Кують підкови, цвяхи й лагодять зброю гарнізону.' }, 0.95));
    if (k > 1.1) L.push(row({ type: 'armory', ward: 'outer', n: 1, w: U(18, 22), wall: 1.5, name: 'Арсенал замку', desc: 'Запас зброї, болтів і обладунків на випадок облоги.' }));
    L.push(row({ type: 'granary', ward: 'outer', n: 1 + (k > 2.4 ? 1 : 0) + (k > 4.2 ? 1 : 0), w: U(17, 21), h: D * 1.06, rear: 0.5, wall: 1.5, name: 'Замкова комора', desc: 'Зерно, солонина й бочки — запас, щоб витримати облогу.' }));
    L.push(row({ type: 'kitchen', ward: 'outer', n: 1, w: U(14, 17), nearT: ['palas', 26], wall: 0.5, name: 'Замкова кухня', desc: 'Печі, коптильня й пекарня для двору та гарнізону.' }));
    if (k > 1.3) L.push(row({ type: 'prison', ward: 'outer', n: 1, w: U(15, 18), nearT: ['donjon', 36], wall: 1.2, rear: 0.4, name: 'Темниця замку', desc: 'Камери для бранців і боржників; найважчих тримають під донжоном.' }, 0.95));
    if (k > 1.5) L.push(row({ type: 'farmyard', ward: 'outer', n: 1 + (k > 3 ? 1 : 0), w: U(17, 21), h: D * 1.15, rear: 1.3, wall: 1.5, name: 'Господарський двір замку', desc: 'Загони, курник і сіновал: замок має годуватися й під облогою.' }));
    if (k > 1.8) L.push({ type: 'drill', ward: 'outer', n: 1, w: U(30, 38), h: U(20, 26), ctr: 1.1, rot: [0, 1], mode: 'free', uniq: 1, name: 'Плац замку', desc: 'Тут гарнізон шикується на ранкову перевірку й вправляється з мечем.' });
    if (k > 1.8) L.push({ type: 'cistern', prop: 1, ward: 'outer', n: 1 + (k > 3.6 ? 1 : 0), r: 3.3, name: 'Цистерна замку', desc: 'Запас води на випадок облоги.' });
    if (k > 2.3) L.push(row({ type: 'hospital', ward: 'outer', n: 1, w: U(17, 20), nearT: ['chapel', 32], wall: 0.8, name: 'Лазарет замку', desc: 'Тут лікують поранених воїнів і челядь.' }));
    if (k > 2.2) L.push(row({ type: 'warehouse', ward: 'outer', n: 1 + (k > 4.2 ? 1 : 0), w: U(16, 20), h: D * 1.06, rear: 0.4, wall: 1.4, name: 'Склад замку', desc: 'Ящики, бочки й мішки: усе, чим живе гарнізон.' }));
    if (k > 2.8) L.push(row({ type: 'inn', ward: 'outer', n: 1, w: U(18, 22), h: D * 1.1, gate: 1.1, wall: 1, name: 'Гостьовий двір замку', desc: 'Тут ночують посланці й почесні гості правителя.' }));
    if (k > 3.4 && o.tier >= 4) L.push(row({ type: 'library', ward: pw, n: 1, w: U(15, 18), nearT: ['palas', 28], wall: 0.8, name: 'Скрипторій замку', desc: 'Писарі ведуть літописи й копіюють накази правителя.' }));
    return L;
  }
  const TYPES = {
    hill: { id: 'hill', n: 'Замок на пагорбі', d: 'Невеликий замок на насипному горбі: кругла вежа-донжон на моті, нижній двір під муром і єдина брама, до якої веде крута дорога.', ward: 'motte', mat: 'stone', w: [4.2, 5], mound: 1, slope: 1,
      tower: { corner: 'round', mid: 'round', r: [6.4, 8], ang: 0.3, step: 48 }, gates: {}, prog: (o, u) => common(o, u, { round: true, palasWard: 'outer' }).map(s => { if (s.type !== 'donjon') return s; const d = Math.min(u.U(22, 26), (o.motteR || 99) * 1.15); return Object.assign(s, { w: d, h: d, pole: 1, rear: 0 }); }) },
    water: { id: 'water', n: 'Прибережний замок', d: 'Замок, одним боком вставлений у берег: мур над самою водою, водяна брама й причал для барж, а з боку міста — звичайні ворота.', ward: 'two', innerFrac: [0.3, 0.4], mat: 'stone', w: [4.4, 5.2],
      tower: { corner: 'round', mid: 'square', r: [7, 8.6], ang: 0.3, step: 44 }, gates: { water: 1 },
      prog: (o, u) => common(o, u).concat(o.hasWater ? [{ type: 'boathouse', ward: 'outer', n: 1 + (o.A > 9000 ? 1 : 0), w: u.U(16, 20), h: u.U(7.5, 9), water: 1, wall: 2, name: 'Елінг замку', desc: 'Критий причал: тут тримають човни й баржі замку.' }, { type: 'warehouse', ward: 'outer', n: 1, w: u.U(14, 18), h: u.U(10, 12), water: 1, wall: 1, name: 'Склад замку', desc: 'Вантажі з води йдуть просто сюди.' }] : []) },
    citadel: { id: 'citadel', n: 'Міська цитадель', d: 'Суворий укріплений квартал із бастіонами: плац посередині, казарми вздовж мурів, арсенал, цистерни й дві брами навпроти одна одної.', ward: 'one', mat: 'stone', w: [5, 6],
      tower: { corner: 'bastion', mid: 'square', r: [7, 8.4], ang: 0.3, step: 52 }, gates: { rear: 1 },
      prog: (o, u) => { const k = o.A / 6000, L = common(o, u, { polo: 0.9, rear: 0.4 }).filter(s => s.type !== 'farmyard' && s.type !== 'chapel' && s.type !== 'cistern' && s.type !== 'drill'); const b = L.find(s => s.type === 'barracks'); if (b) b.n = clamp(b.n + 1, 2, 5); L.push({ type: 'hq', first: 0, ward: 'outer', n: 1, w: u.U(24, 28), h: u.U(15, 18), nearT: ['donjon', 36], wall: 0.8, uniq: 1, name: 'Штаб цитаделі', desc: 'Тут командир вирішує, де посилити мур і кого куди поставити.' }); if (k > 1) L.push({ type: 'drill', ward: 'outer', n: 1, w: u.U(30, 38), h: u.U(20, 26), ctr: 1.2, rot: [0, 1], mode: 'free', uniq: 1, name: 'Плац цитаделі', desc: 'Тут шикуються й навчаються гарнізони.' }); L.push({ type: 'cistern', prop: 1, ward: 'outer', n: 1 + (k > 2.4 ? 1 : 0), r: 3.3, name: 'Цистерна цитаделі', desc: 'Запас води на випадок облоги.' }); return L; } },
    enclosure: { id: 'enclosure', n: 'Замок із двома дворами', d: 'Класичний замок: зовнішній двір із казармами й господарством, внутрішній за окремим муром, де донжон, палац і каплиця; вежі по кутах.', ward: 'two', innerFrac: [0.32, 0.44], mat: 'stone', w: [4.6, 5.6],
      tower: { corner: 'round', mid: 'square', r: [8, 10], ang: 0.3, step: 50 }, gates: {}, prog: (o, u) => common(o, u, { polo: 1, rear: 0 }) },
    wall: { id: 'wall', n: 'Замок при мурі', d: 'Замок, що вростає в міський мур: одна його сторона — стіна міста, вежі виступають назовні, а вилазна брама веде в поле.', ward: 'two', innerFrac: [0.3, 0.4], mat: 'stone', w: [4.6, 5.6],
      tower: { corner: 'square', mid: 'square', r: [7.4, 9], ang: 0.3, step: 44 }, gates: { sally: 1 }, prog: (o, u) => common(o, u, { polo: 0.8, rear: 0.5 }) },
  };
  // бажаний вид наперед (до пошуку ділянки): c {hilly, tier, fort, walled, waterAvail}; від нього залежить, яку ділянку шукаємо
  function want(c, r) {
    const W = { water: c.waterAvail ? 0.5 : 0, wall: c.walled && !c.fort ? 0.28 : 0, hill: c.hilly ? 0.55 : 0.14, citadel: c.fort ? 0.9 : c.tier >= 4 ? 0.3 : 0.14, enclosure: 0.5 };
    const ks = Object.keys(W), sum = ks.reduce((s, k) => s + W[k], 0); let u = r() * sum; for (const k of ks) { u -= W[k]; if (u <= 0) return k; } return 'enclosure';
  }
  // перевага ділянки для бажаного виду (додається до оцінки): вода чи мур з боку, інакше — уникати їх, щоб вид не змінився
  function bias(w) {
    return m => w === 'water' ? 2.8 * Math.min(1, m.water / 0.2) - (m.water > 0.55 ? 1 : 0) - 0.8 * m.wall : w === 'wall' ? 2.6 * Math.min(1, m.wall / 0.18) - 0.8 * m.water : (w === 'citadel' ? 0.8 * m.conv : 0) - 1.2 * Math.max(0, m.water - 0.08) - 1.2 * Math.max(0, m.wall - 0.1);
  }
  // вибір виду за метриками ділянки m (water, wall — частки межі; open — частка відкритої межі; conv) і контекстом c {hilly, tier, fort, A}; r — потік; w — бажаний вид
  function choose(m, c, r, w) {
    if (w === 'water' && m.water >= 0.1) return TYPES.water; if (w === 'wall' && m.wall >= 0.1) return TYPES.wall;
    const W = { hill: 0.35 + 3 * (c.hilly || 0) + 1.4 * m.open, water: m.water >= 0.12 ? 2.6 + 8 * m.water : 0, citadel: 0.8 + (c.tier >= 4 ? 1.1 : 0) + (c.fort ? 4 : 0) + 1.3 * m.conv, enclosure: 1.3 + 1.2 * m.conv + (c.A >= 7000 ? 0.6 : 0), wall: m.wall >= 0.14 ? 2.2 + 6 * m.wall : 0 };
    if (w && W[w] != null && W[w] > 0) W[w] *= 3; if (c.A < 4200) W.citadel *= 0.5; if (m.water >= 0.3) { W.hill *= 0.3; W.citadel *= 0.4; }
    const ks = Object.keys(W), sum = ks.reduce((s, k) => s + W[k], 0); let u = r() * sum; for (const k of ks) { u -= W[k]; if (u <= 0) return TYPES[k]; } return TYPES.enclosure;
  }
  A.KeepTypes = { TYPES, want, bias, choose, common };
})();
