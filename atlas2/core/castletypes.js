// Атлас 2.0, замок: види замків (на пагорбі, прибережний, міська цитадель, чотирикутний із двома дворами, при мурі міста) і вибір виду за ділянкою:
// скільки межі припадає на воду, мур міста й дороги, чи горбиста місцевість, ранг міста, наскільки форма цільна. Кожен вид має свій мур (вежі, ворота), двори й програму споруд.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, clamp = G.clamp;
  // програма споруд: o {A, nm, tier, hasWater}, u {U(a,b) — випадкове з розміром, sz}; усі розміри в метрах до масштабу; чим більша ділянка (k = A / 6000), тим більше й різноманітніше
  function common(o, u, opt) {
    opt = opt || {}; const k = o.A / 6000, U = u.U, L = [], nm = o.nm, pw = opt.palasWard || 'inner';
    L.push({ type: 'donjon', first: 1, ward: 'inner', w: U(17, 21), h: U(17, 21), pole: opt.polo != null ? opt.polo : 0.5, rear: opt.rear != null ? opt.rear : 0.8, uniq: 1, round: !!opt.round, name: 'Донжон «' + nm + '»', desc: 'Головна вежа замку: товсті стіни, схованка зі скарбами й останній притулок захисників.' });
    L.push({ type: 'palas', first: 1, ward: pw, w: U(23, 28), h: U(11.5, 13.5), nearT: ['donjon', 21], wall: 0.6, uniq: 1, name: 'Палац замку «' + nm + '»', desc: 'Покої правителя й велика зала, де вирішують справи, судять і бенкетують.' });
    L.push({ type: 'chapel', first: 1, ward: pw, w: U(8, 9.5), h: U(12, 15), nearT: ['palas', 19], wall: 0.8, name: 'Замкова каплиця', desc: 'Тут молиться двір і гарнізон; під плитами — родові поховання.' });
    L.push({ type: 'barracks', ward: 'outer', n: clamp(Math.round(k * 1.05), 1, 6), w: U(22, 28), h: U(10, 12), wall: 2, uniq: 1, must: 1, name: 'Гарнізонні казарми', desc: 'Тут живе й тренується гарнізон замку.' });
    L.push({ type: 'stable', ward: 'outer', n: k > 2.4 ? 2 : 1, w: U(14, 17), h: U(9, 11), gate: 1.2, wall: 1.2, name: 'Замкова стайня', desc: 'Бойові коні й гінці правителя.' });
    L.push({ type: 'smith', ward: 'outer', n: k > 3 ? 2 : 1, w: U(9, 11), h: U(8, 10), gate: 0.8, wall: 1, name: 'Замкова кузня', desc: 'Кують підкови, цвяхи й лагодять зброю гарнізону.' });
    if (k > 0.9) L.push({ type: 'armory', ward: 'outer', n: k > 3.2 ? 2 : 1, w: U(16, 20), h: U(9, 11), wall: 1.5, name: 'Арсенал замку', desc: 'Запас зброї, болтів і обладунків на випадок облоги.' });
    L.push({ type: 'granary', ward: 'outer', n: 1 + (k > 2.2 ? 1 : 0) + (k > 4 ? 1 : 0), w: U(14, 18), h: U(10, 12), wall: 1.5, rear: 0.5, name: 'Замкова комора', desc: 'Зерно, солонина й бочки — запас, щоб витримати облогу.' });
    L.push({ type: 'kitchen', ward: 'outer', n: 1, w: U(11, 13), h: U(10, 11), nearT: ['palas', 24], wall: 0.5, name: 'Замкова кухня', desc: 'Печі, коптильня й пекарня для двору та гарнізону.' });
    if (k > 1.1) L.push({ type: 'prison', ward: 'outer', n: 1, w: U(14, 17), h: U(9, 11), nearT: ['donjon', 34], wall: 1.2, rear: 0.4, name: 'Темниця замку', desc: 'Камери для бранців і боржників; найважчих тримають під донжоном.' });
    if (k > 1.3) L.push({ type: 'farmyard', ward: 'outer', n: 1 + (k > 2.6 ? 1 : 0) + (k > 4.5 ? 1 : 0), w: U(14, 17), h: U(11, 13), rear: 1.3, wall: 1.5, name: 'Господарський двір замку', desc: 'Загони, курник і сіновал: замок має годуватися й під облогою.' });
    if (k > 1.5) L.push({ type: 'bakery', ward: 'outer', n: 1, w: U(9, 11), h: U(8, 10), nearT: ['kitchen', 22], wall: 0.8, name: 'Пекарня замку', desc: 'Свіжий хліб для двору й гарнізону щоранку.' });
    if (k > 1.6) L.push({ type: 'drill', ward: 'outer', n: 1, w: U(26, 34), h: U(18, 24), ctr: 1.1, rot: [0, 1], uniq: 1, name: 'Плац замку', desc: 'Тут гарнізон шикується на ранкову перевірку й вправляється з мечем.' });
    if (k > 1.8) L.push({ type: 'cistern', ward: 'outer', n: 1, w: U(9, 11), h: U(9, 11), ctr: 1, name: 'Цистерна замку', desc: 'Запас води на випадок облоги.' });
    if (k > 2) L.push({ type: 'hospital', ward: 'outer', n: 1, w: U(15, 19), h: U(10, 12), nearT: ['chapel', 30], wall: 0.8, name: 'Лазарет замку', desc: 'Тут лікують поранених воїнів і челядь.' });
    if (k > 2) L.push({ type: 'warehouse', ward: 'outer', n: 1 + (k > 4 ? 1 : 0), w: U(14, 18), h: U(10, 12), wall: 1.4, rear: 0.4, name: 'Склад замку', desc: 'Ящики, бочки й мішки: усе, чим живе гарнізон.' });
    if (k > 2.4) L.push({ type: 'brewery', ward: 'outer', n: 1, w: U(12, 14), h: U(10, 12), nearT: ['kitchen', 26], wall: 1, name: 'Пивоварня замку', desc: 'Ель для гарнізону, щоб не нудьгував на варті.' });
    if (k > 2.6) L.push({ type: 'inn', ward: 'outer', n: 1, w: U(16, 20), h: U(11, 13), gate: 1.1, wall: 1, name: 'Гостьовий двір замку', desc: 'Тут ночують посланці й почесні гості правителя.' });
    if (k > 3.4 && o.tier >= 4) L.push({ type: 'library', ward: pw, n: 1, w: U(14, 17), h: U(10, 12), nearT: ['palas', 26], wall: 0.8, name: 'Скрипторій замку', desc: 'Писарі ведуть літописи й копіюють накази правителя.' });
    return L;
  }
  const TYPES = {
    hill: { id: 'hill', n: 'Замок на пагорбі', d: 'Невеликий замок на насипному горбі: кругла вежа-донжон на моті, нижній двір під муром і єдина брама, до якої веде крута дорога.', ward: 'motte', mat: 'stone', w: [3.6, 4.4], mound: 1, slope: 1,
      tower: { corner: 'round', mid: 'round', r: [5.2, 6.8], ang: 0.3, step: 48 }, gates: {}, prog: (o, u) => common(o, u, { round: true, palasWard: 'outer' }).map(s => s.type === 'donjon' ? Object.assign(s, { w: u.U(15, 18), h: u.U(15, 18), pole: 1, rear: 0 }) : s) },
    water: { id: 'water', n: 'Прибережний замок', d: 'Замок, одним боком вставлений у берег: мур над самою водою, водяна брама й причал для барж, а з боку міста — звичайні ворота.', ward: 'two', innerFrac: [0.3, 0.4], mat: 'stone', w: [3.8, 4.6],
      tower: { corner: 'round', mid: 'square', r: [5.4, 6.8], ang: 0.3, step: 44 }, gates: { water: 1 },
      prog: (o, u) => common(o, u).concat(o.hasWater ? [{ type: 'boathouse', ward: 'outer', n: 1 + (o.A > 9000 ? 1 : 0), w: u.U(16, 20), h: u.U(7.5, 9), water: 1, wall: 2, name: 'Елінг замку', desc: 'Критий причал: тут тримають човни й баржі замку.' }, { type: 'warehouse', ward: 'outer', n: 1, w: u.U(14, 18), h: u.U(10, 12), water: 1, wall: 1, name: 'Склад замку', desc: 'Вантажі з води йдуть просто сюди.' }] : []) },
    citadel: { id: 'citadel', n: 'Міська цитадель', d: 'Суворий укріплений квартал із бастіонами: плац посередині, казарми вздовж мурів, арсенал, цистерни й дві брами навпроти одна одної.', ward: 'one', mat: 'stone', w: [4.4, 5.4],
      tower: { corner: 'bastion', mid: 'square', r: [5.6, 7], ang: 0.3, step: 52 }, gates: { rear: 1 },
      prog: (o, u) => { const k = o.A / 6000, L = common(o, u, { polo: 0.3, rear: 1 }).filter(s => s.type !== 'farmyard' && s.type !== 'chapel'); const b = L.find(s => s.type === 'barracks'); if (b) b.n = clamp(b.n + 1, 2, 5); L.push({ type: 'hq', first: 0, ward: 'outer', n: 1, w: u.U(22, 26), h: u.U(18, 21), nearT: ['donjon', 28], uniq: 1, name: 'Штаб цитаделі', desc: 'Тут командир вирішує, де посилити мур і кого куди поставити.' }); if (k > 1) L.push({ type: 'drill', ward: 'outer', n: 1, w: u.U(28, 36), h: u.U(20, 26), ctr: 1.2, rot: [0, 1], uniq: 1, name: 'Плац цитаделі', desc: 'Тут шикуються й навчаються гарнізони.' }); L.push({ type: 'cistern', ward: 'outer', n: 1 + (k > 2.4 ? 1 : 0), w: u.U(9, 11), h: u.U(9, 11), ctr: 0.5, name: 'Цистерна цитаделі', desc: 'Запас води на випадок облоги.' }); return L; } },
    enclosure: { id: 'enclosure', n: 'Замок із двома дворами', d: 'Класичний замок: зовнішній двір із казармами й господарством, внутрішній за окремим муром, де донжон, палац і каплиця; вежі по кутах.', ward: 'two', innerFrac: [0.32, 0.44], mat: 'stone', w: [4, 5],
      tower: { corner: 'round', mid: 'square', r: [6.4, 8.2], ang: 0.3, step: 50 }, gates: {}, prog: (o, u) => common(o, u, { polo: 1, rear: 0 }) },
    wall: { id: 'wall', n: 'Замок при мурі', d: 'Замок, що вростає в міський мур: одна його сторона — стіна міста, вежі виступають назовні, а вилазна брама веде в поле.', ward: 'two', innerFrac: [0.3, 0.4], mat: 'stone', w: [4, 5],
      tower: { corner: 'square', mid: 'square', r: [6, 7.4], ang: 0.3, step: 44 }, gates: { sally: 1 }, prog: (o, u) => common(o, u, { polo: 0.8, rear: 0.5 }) },
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
