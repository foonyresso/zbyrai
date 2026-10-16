// Модель макета: стан, список людей, розворотів, прив'язка фото за номером, обмін місцями, JSON. Без DOM.
(function (root) {
  var P = typeof require !== 'undefined' ? require('./parse.js') : root.AlbumParse;
  var L = typeof require !== 'undefined' ? require('./layout.js') : root.AlbumLayout;
  var PR = typeof require !== 'undefined' ? require('../data/print-types.js') : root.AlbumPrint;
  var TP = typeof require !== 'undefined' ? require('./templates.js') : root.AlbumTemplates;
  var CV = typeof require !== 'undefined' ? require('../data/cover-variants.js') : root.AlbumCoverVariants;
  var DS = typeof require !== 'undefined' ? require('../data/designs.js') : root.AlbumDesigns;
  var uid = 0;
  function newId() { return 's' + (++uid) + Math.floor(Math.random() * 1e6).toString(36); }

  function newState() {
    return { v: 1, typeId: 'bamboo', fmtId: '23x23', catId: 'grade11', designId: 'classic', inst: { full: '', short: '' }, year: String(new Date().getFullYear()),
      children: '', names: {}, alias: {}, pairs: [], noAlbum: '', teachers: '', kOverride: null, grid: null, pstyle: 'dense', order: [], crops: {}, owner: 0, coverNoPhoto: false, coverVar: 'classic', cvText: {}, coverPhotos: {}, coverIndividual: null, bg: null, round: 0, seen: {}, font: null, ts: {}, tf: {}, pattern: null, tl: null, gp: null, safe: null, coverSafe: null, spine: null, spreads: [] };
  }
  // Подвійні альбоми: рядок блоку «5 + 6» або «Іваненко + Коваль» (чи з повними записами) вказує двох дітей із загального списку.
  // Діти шукаються за номером фото або за ім'ям; якщо не знайдено, додаються в кінець списку. Раніша в списку дитина = перша в парі.
  function norm(x) { return String(x || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function findIn(list, h) {
    for (var i = 0; i < list.length; i++) if (list[i].pair == null && h.nums.some(function (n) { return list[i].nums.indexOf(n) >= 0; })) return i;
    var nm = norm(h.name); if (!nm) return -1;
    for (var k = 0; k < list.length; k++) if (list[k].pair == null && (norm(list[k].name) === nm || norm(list[k].name).split(' ').indexOf(nm) >= 0)) return k;
    return -1;
  }
  // st.pairs: масив блоків; кожен блок — два рядки у форматі списку (одна пара). Старий рядковий формат «a + b» теж читається.
  function pairBlocks(st) {
    if (Array.isArray(st.pairs)) return st.pairs;
    return String(st.pairs || '').split(/\r?\n/).filter(function (l) { return /[+\/]/.test(l); }).map(function (l) { return l.split(/\s*[+\/]\s*/).join('\n'); });
  }
  function applyPairs(st, list) {
    var k = 0;
    pairBlocks(st).forEach(function (block) {
      var hs = P.parseChildren(block).slice(0, 2);
      if (hs.length < 2) return;
      var idx = hs.map(function (h) { var f = findIn(list, h); if (f < 0) { h.kind = 'child'; list.push(h); f = list.length - 1; } return f; });
      if (idx[0] === idx[1]) return;
      idx.sort(function (a, b) { return a - b; }); idx.forEach(function (ix, half) { list[ix].pair = k; list[ix].half = half; }); k++;
    });
  }
  function people(st) {
    var list = P.parseChildren(st.children).map(function (p) { p.kind = 'child'; return p; })
      .concat(P.parseChildren(st.noAlbum).map(function (p) { p.kind = 'noalbum'; return p; }));
    applyPairs(st, list);
    list.forEach(function (p, i) { p.id = i; if (st.names && st.names[i] != null && st.names[i] !== '') p.name = st.names[i]; });
    if (!Array.isArray(st.order) || st.order.length !== list.length) st.order = list.map(function (_, i) { return i; });
    return st.order.map(function (i) { return list[i]; });
  }
  function teachers(st) { return P.parseTeachers(st.teachers); }
  function portraitK(st) { return st.grid && st.grid.cols ? st.grid.cols * st.grid.rows : st.kOverride || L.autoK(people(st).length); }
  function portraitCount(st) { return Math.max(1, Math.ceil(people(st).length / portraitK(st))); }
  function mkSpread(type) { return { id: newId(), type: type, seed: 1 + Math.floor(Math.random() * 9999), slots: type === 'cover' ? [null] : type === 'first' ? [null, null] : [], extra: {}, text: {}, span: {}, teacherPhotos: {}, kidPhotos: {}, style: 'mosaic', template: null, frame: false, bg: null }; }
  function buildSpreads(st) {
    var s = [mkSpread('cover'), mkSpread('first')];
    for (var i = 0; i < portraitCount(st); i++) { s.push(mkSpread('portrait')); s.push(mkSpread('group')); }
    st.spreads = s;
  }
  function spreadEmpty(sp) { return !Object.keys(sp.extra || {}).some(function (k) { return sp.extra[k]; }) && !Object.keys(sp.text || {}).some(function (k) { return sp.text[k]; }); }
  // Додає бракуючі портретні розвороти; зайві порожні з кінця прибирає (з фото не чіпає).
  function resizePortrait(st) {
    var need = portraitCount(st), idx = [];
    st.spreads.forEach(function (s, i) { if (s.type === 'portrait') idx.push(i); });
    while (idx.length > need && spreadEmpty(st.spreads[idx[idx.length - 1]])) st.spreads.splice(idx.pop(), 1);
    var at = idx.length ? idx[idx.length - 1] + 1 : st.spreads.length;
    for (var n = idx.length; n < need; n++) st.spreads.splice(at++, 0, mkSpread('portrait'));
  }
  // Портретне фото: підпис із списку за номером у назві файлу (лише люди зі списку дітей і «без альбому»).
  function personByName(st, name) {
    var runs = P.fileRuns(name), all = people(st);
    if (st.alias && st.alias[name] != null) { for (var a = 0; a < all.length; a++) if (all[a].id === st.alias[name]) return all[a]; }
    for (var i = 0; i < all.length; i++) for (var j = 0; j < runs.length; j++) if (all[i].nums.indexOf(runs[j]) >= 0) return all[i];
    return null;
  }
  function freeCells(st, si) {
    return slotsFor(st, si, new Map()).items.filter(function (x) { return x.ref.t === 'extra' && !x.name && !x.text; }).map(function (x) { return x.ref.j; });
  }
  // Кладе фото у першу вільну комірку: від розвороту from уперед, потім назад; якщо вільних немає, додає новий портретний розворот. Повертає індекс розворота.
  function placePortrait(st, from, name) {
    var idx = [], i;
    st.spreads.forEach(function (s, k) { if (s.type === 'portrait') idx.push(k); });
    var order = idx.filter(function (k) { return k >= from; }).concat(idx.filter(function (k) { return k < from; }));
    for (i = 0; i < order.length; i++) { var f = freeCells(st, order[i]); if (f.length) { st.spreads[order[i]].extra[f[0]] = name; return order[i]; } }
    var at = idx.length ? idx[idx.length - 1] + 1 : st.spreads.length, ns = mkSpread('portrait'); st.spreads.splice(at, 0, ns); ns.extra[0] = name; return at;
  }
  // Порядок розкладання: за порядком у списку, решта за назвою.
  function sortForPortrait(st, names) {
    var ps = people(st);
    function pos(n) { var p = personByName(st, n); return p ? ps.indexOf(p) : 1e9; }
    return names.slice().sort(function (a, b) { return pos(a) - pos(b) || (a < b ? -1 : a > b ? 1 : 0); });
  }
  // Після зміни k: усі портретні фото заново підряд (об'єднання й тексти комірок скидаються).
  function reflowPortrait(st) {
    var names = [], first = -1;
    st.spreads.forEach(function (s, i) {
      if (s.type !== 'portrait') return; if (first < 0) first = i;
      var ks = Object.keys(s.extra).map(Number).sort(function (a, b) { return a - b; });
      ks.forEach(function (j) { if (s.extra[j]) names.push(s.extra[j]); });
      s.extra = {}; s.text = {}; s.span = {};
    });
    names.forEach(function (n) { placePortrait(st, first < 0 ? 0 : first, n); });
    resizePortrait(st);
  }
  function portraitStats(st) {
    var seen = {}, total = people(st).length;
    st.spreads.forEach(function (s) { if (s.type === 'portrait') Object.keys(s.extra).forEach(function (j) { var p = s.extra[j] && personByName(st, s.extra[j]); if (p) seen[p.id] = 1; }); });
    return { placed: Object.keys(seen).length, total: total };
  }
  // ---- групові розкладки за шаблонами ----
  function freeGroup(sp) { var t = TP.byId(sp.template); for (var i = 0; t && i < t.n; i++) if (!sp.slots[i]) return i; return -1; }
  function freeCount(sp) { var t = TP.byId(sp.template), n = 0; for (var i = 0; t && i < t.n; i++) if (!sp.slots[i]) n++; return n; }
  function groupPhotos(sp) { return sp.slots.filter(Boolean); }
  function setStyle(st, si, style) { var sp = st.spreads[si]; sp.slots = groupPhotos(sp); sp.style = style; sp.template = null; }
  // Обрати шаблон: якщо фото більше за вікна, повертає {overflow:true}, нічого не змінюючи.
  function setTemplate(st, si, id) {
    var sp = st.spreads[si], t = TP.byId(id), ph = groupPhotos(sp);
    if (!t) return { ok: false };
    if (ph.length > t.n) return { overflow: true, photos: ph, tpl: t };
    sp.style = 'tpl'; sp.template = id; sp.slots = ph.concat(Array(t.n - ph.length).fill(null)); return { ok: true };
  }
  // Додати фото на груповий розворот: у вільні вікна шаблону або в кінець. Повертає {placed, rest}: rest не вмістилось.
  function addGroupPhotos(st, si, names) {
    var sp = st.spreads[si], fresh = names.filter(function (n) { return sp.slots.indexOf(n) < 0; });
    if (sp.style !== 'tpl') { fresh.forEach(function (n) { sp.slots.push(n); }); return { placed: fresh.length, rest: [] }; }
    var placed = 0, rest = [];
    fresh.forEach(function (n) { var i = freeGroup(sp); if (i < 0) rest.push(n); else { sp.slots[i] = n; placed++; } });
    return { placed: placed, rest: rest };
  }
  function coverVar(st) { return CV.byId(st.coverVar || 'classic'); }
  function areaOf(st, si) { var z = zoneOf(st, si); return { W: z.W, H: z.H, d: DS.DESIGNS[st.designId] || DS.DESIGNS.classic }; }
  // «Пропустити зайві»: у вільні вікна шаблону йдуть фото, найближчі за пропорціями; решта ігнорується. aspectOf(name) -> ширина/висота.
  function fillBest(st, si, names, aspectOf) {
    var sp = st.spreads[si], t = TP.byId(sp.template), a = areaOf(st, si), rs = TP.rects(t, a.W, a.H, sp.frame ? a.d.groupGap : a.d.gap, sp.frame ? a.d.groupMargin : 0);
    var free = rs.filter(function (r) { return !sp.slots[r.i]; }), asp = names.map(aspectOf), res = TP.assign(free, asp), n = 0;
    res.forEach(function (pi, k) { if (pi >= 0) { sp.slots[free[k].i] = names[pi]; n++; } });
    return n;
  }
  // «Підібрати іншу розкладку»: шаблон під усі фото (поточні й нові) за кількістю й пропорціями; якщо вікон ніде не вистачає, авто-мозаїка.
  function fitAll(st, si, extra, aspectOf) {
    var sp = st.spreads[si], all = groupPhotos(sp).concat(extra.filter(function (n) { return sp.slots.indexOf(n) < 0; })), a = areaOf(st, si);
    var t = TP.pick(all.map(aspectOf), a.W, a.H, a.d.gap);
    if (!t) { sp.slots = all; sp.style = 'mosaic'; sp.template = null; return { n: all.length, tpl: null }; }
    var rs = TP.rects(t, a.W, a.H, a.d.gap, 0), res = TP.assign(rs, all.map(aspectOf)); sp.style = 'tpl'; sp.template = t.id; sp.slots = Array(t.n).fill(null);
    res.forEach(function (pi, k) { if (pi >= 0) sp.slots[k] = all[pi]; });
    return { n: all.length, tpl: t };
  }
  // Переносить фото з комірки (ref) розвороту si на розворот to: портретний бере вільну комірку, груповий додає в кінець.
  // Загальне фото першого розвороту (коли немає вчителів): розмір у % від типового, центр лишається на місці
  function generalRect(st, g) {
    var c = st.gp || {}, w = g.w * Math.min(1, Math.max(0.3, (c.w == null ? 100 : c.w) / 100)), h = g.h * Math.min(1, Math.max(0.3, (c.h == null ? 100 : c.h) / 100));
    return { x: g.x + (g.w - w) / 2, y: g.y + (g.h - h) / 2, w: w, h: h };
  }
  // Міняє місцями комірки ja (розворот sa) і jb (розворот sb) разом із текстом у них. false, якщо там об'єднані клітинки.
  function swapAcross(st, sa, ja, sb, jb) {
    var A = st.spreads[sa], B = st.spreads[sb]; if (!A || !B || A.type !== 'portrait' || B.type !== 'portrait') return false;
    if ((A.span && A.span[ja]) || (B.span && B.span[jb])) return false;
    A.text = A.text || {}; B.text = B.text || {};
    var x = A.extra[ja], y = B.extra[jb], tx = A.text[ja], ty = B.text[jb];
    if (y) A.extra[ja] = y; else delete A.extra[ja]; if (x) B.extra[jb] = x; else delete B.extra[jb];
    if (ty) A.text[ja] = ty; else delete A.text[ja]; if (tx) B.text[jb] = tx; else delete B.text[jb];
    return true;
  }
  function movePhoto(st, si, ref, to) {
    var sp = st.spreads[si], name = ref.t === 'extra' ? sp.extra[ref.j] : sp.slots[ref.i], dst = st.spreads[to];
    if (!name || !dst || to === si) return false;
    if (dst.type === 'portrait') {
      var occ = Object.keys(dst.extra).map(Number).filter(function (j) { return dst.extra[j]; }).sort(function (a, b) { return a - b; });
      if (occ.length && ref.t === 'extra') { var back = dst.extra[occ[0]]; dst.extra[occ[0]] = name; sp.extra[ref.j] = back; if (sp.text) delete sp.text[ref.j]; if (dst.text) delete dst.text[occ[0]]; return true; }
      if (!freeCells(st, to).length) return false; dst.extra[freeCells(st, to)[0]] = name;
    }
    else if (dst.type === 'group') { if (dst.style === 'tpl') { var fi = freeGroup(dst); if (fi < 0) return false; dst.slots[fi] = name; } else dst.slots.push(name); } else return false;
    removePhoto(st, si, ref); return true;
  }
  function numMapOf(names) {
    var m = new Map();
    names.slice().sort().forEach(function (n) { P.fileRuns(n).forEach(function (r) { if (!m.has(r)) m.set(r, n); }); });
    return m;
  }
  // Фото людини за номером. Звичайно перший номер (ближній план); far=true для обкладинки й першого розвороту бере другий (дальній), а коли номер один, те саме фото.
  function photoFor(p, numMap, far) {
    var order = far && p.nums.length > 1 ? p.nums.slice(1).concat(p.nums.slice(0, 1)) : p.nums;
    for (var i = 0; i < order.length; i++) if (numMap.has(order[i])) return numMap.get(order[i]);
    return null;
  }
  // Діти, які беруть альбом (у порядку списку): для них окремі обкладинка й перший розворот.
  // Власники альбомів у порядку списку: пара (двоє дітей, один альбом) — один власник з members і спільним підписом «А і Б».
  function albumKids(st) {
    var all = people(st), kids = all.filter(function (p) { return p.kind === 'child'; }).sort(function (a, b) { return a.id - b.id; }), out = [];
    kids.forEach(function (p) {
      if (p.pair == null) { out.push(p); return; }
      if (p.half !== 0) return;
      var m2 = kids.filter(function (q) { return q.pair === p.pair && q.half === 1; })[0];
      out.push(m2 ? Object.assign({}, p, { name: p.name + ' і ' + m2.name, members: [p, m2] }) : p);
    });
    return out;
  }
  function memberOf(ow, ref) { return ow && ow.members ? ow.members[ref.m || 0] : ow; }
  function ownerOf(st) {
    var ps = albumKids(st);
    return ps.filter(function (p) { return p.id === st.owner; })[0] || ps[0] || null;
  }
  function ownerIndex(st) { var o = ownerOf(st), ks = albumKids(st); for (var i = 0; o && i < ks.length; i++) if (ks[i].id === o.id) return i; return -1; }
  function setOwnerIndex(st, i) { var ps = albumKids(st); if (ps[i]) st.owner = ps[i].id; }
  function coverIndividual(st) { var d = DS.DESIGNS[st.designId] || DS.DESIGNS.classic; return st.coverIndividual == null ? !!d.individualCover : !!st.coverIndividual; }
  // Індивідуальний розворот (окремий варіант для кожної дитини): обкладинка (якщо дизайн індивідуальний) і всі розвороти типу 'first'.
  function isIndividual(st, si) { var t = st.spreads[si].type; return t === 'first' || (t === 'cover' && coverIndividual(st)); }
  function makeIndividual(st, si) { var sp = st.spreads[si]; if (si < 1 || sp.type === 'first' || sp.type === 'cover') return false; sp.type = 'first'; sp.slots = [null, null]; sp.extra = {}; sp.text = {}; sp.span = {}; sp.teacherPhotos = {}; sp.kidPhotos = {}; return true; }
  function makeGeneral(st, si) { var sp = st.spreads[si]; if (si < 2 || sp.type !== 'first') return false; sp.type = 'group'; sp.slots = []; sp.kidPhotos = {}; sp.teacherPhotos = {}; return true; }
  var DEF_COVER_SAFE = 15;
  // Зони розвороту: виліт, безпечна межа (для обкладинки окрема, більша), їх сума від краю полотна.
  function zoneOf(st, si) {
    var z = PR.spreadSize(st.fmtId), cover = st.spreads[si] && st.spreads[si].type === 'cover';
    var safe = cover ? (st.coverSafe == null ? DEF_COVER_SAFE : st.coverSafe) : (st.safe == null ? z.safe : st.safe);
    return { W: z.W, H: z.H, bleed: z.bleed, safe: safe, sb: z.bleed + safe, spine: st.spine == null ? z.spine : st.spine, pageW: z.pageW, pageH: z.pageH };
  }
  // Фото без збігу номера (інші назви файлів): іде людям без фото за порядком списку. Повертає скільки призначено.
  function assignUnmatched(st, kind, names, numMap, si) {
    var map = kind === 'cover' ? st.coverPhotos : st.spreads[si].kidPhotos, kids = albumKids(st), n = 0;
    var un = names.filter(function (nm) { return !personByName(st, nm); }).sort();
    var need = []; kids.forEach(function (o) { (o.members || [o]).forEach(function (p) { if (!map[p.id] && !photoFor(p, numMap, kind !== 'cover')) need.push(p); }); });
    un.forEach(function (nm) { var p = need.shift(); if (p) { map[p.id] = nm; n++; } });
    return n;
  }
  function assignTeachers(st, si, names, numMap) {
    var sp = st.spreads[si], tl = teachers(st), n = 0;
    var need = tl.map(function (t, i) { return i; }).filter(function (i) { return !sp.teacherPhotos[i] && !photoFor(tl[i], numMap); });
    names.slice().sort().forEach(function (nm) { var i = need.shift(); if (i != null) { sp.teacherPhotos[i] = nm; n++; } });
    return n;
  }
  var CELL_STYLES = ['plain', 'ornament', 'frame'];
  function presets(st) {
    var y = st.year || '', sh = st.inst.short, fu = st.inst.full, o = [];
    if (sh) o.push({ label: 'Назва закладу (коротка)', t: sh }); if (fu) o.push({ label: 'Назва закладу (повна)', t: fu });
    if (y) o.push({ label: 'Рік', t: y }); o.push({ label: 'Випускний', t: 'ВИПУСКНИЙ' + (y ? '\n' + y : '') });
    o.push({ label: 'Наша група', t: 'НАША ГРУПА' }); o.push({ label: 'Наш клас', t: 'НАШ КЛАС' }); o.push({ label: 'Наш випуск', t: 'НАШ ВИПУСК' + (y ? '\n' + y : '') });
    if (sh && y) o.push({ label: 'Коротка назва + рік', t: sh + '\n' + y });
    return o;
  }
  function personByFile(st, name) {
    var runs = P.fileRuns(name), all = people(st).concat(teachers(st));
    for (var i = 0; i < all.length; i++) for (var j = 0; j < runs.length; j++) if (all[i].nums.indexOf(runs[j]) >= 0) return all[i];
    return null;
  }
  function portraitIndex(st, si) { var n = 0; for (var i = 0; i < si; i++) if (st.spreads[i].type === 'portrait') n++; return n; }

  // Клітинки, які займає об'єднане вікно j (cw вправо, ch вниз); null, якщо об'єднання неможливе (не порожні, вихід за рядок, вже зайняті).
  function spanCells(sp, j, k, cols, nPeopleHere, covered) {
    var s = sp.span && sp.span[j]; if (!s) return null;
    var out = [], r0 = Math.floor(j / cols), c0 = j % cols;
    if (c0 + s.cw > cols) return null;
    for (var r = 0; r < s.ch; r++) for (var c = 0; c < s.cw; c++) {
      var q = (r0 + r) * cols + c0 + c;
      if (q >= k || q < nPeopleHere || (q !== j && ((sp.span && sp.span[q]) || (sp.extra[q]) || (sp.text && sp.text[q]) || covered[q]))) return null;
      out.push(q);
    }
    return { cells: out };
  }
  // Усі вікна розвороту для малювання й взаємодії. items[].ref: {t:'person',pos} | {t:'slot',i} | {t:'extra',j}.
  function slotsFor(st, si, numMap) {
    var sp = st.spreads[si], z = zoneOf(st, si), W = z.W, H = z.H, d = DS.DESIGNS[st.designId] || DS.DESIGNS.classic, items = [], ownerName = '';
    if (sp.type === 'cover') {
      var cvv = coverVar(st), c = L.coverLayout(W, H, z.sb, z, cvv), ow = ownerOf(st);
      ownerName = ow ? ow.name : '';
      if (!st.coverNoPhoto && cvv.photo !== false) halves(c.photo, ow).forEach(function (q) { items.push({ rect: q.rect, ref: q.m == null ? { t: 'cover' } : { t: 'cover', m: q.m }, name: (q.p && st.coverPhotos[q.p.id]) || (q.p ? photoFor(q.p, numMap) : null), caption: '', kind: 'cover' }); });
    } else if (sp.type === 'first') {
      var pc = L.pageCenters(W, z.bleed, z.safe), f = L.firstLayout(W, H, z.sb, pc.left, pc.right), tl = teachers(st);
      if (tl.length) {
        L.teacherSlots(tl.length, W, H, Object.assign({ cx: pc.left }, st.tl || {})).forEach(function (q, i) { items.push({ rect: q.photo, capRect: q.cap, ref: { t: 'teacher', i: i }, name: (sp.teacherPhotos && sp.teacherPhotos[i]) || photoFor(tl[i], numMap), caption: tl[i].name, post: tl[i].post, kind: 'teacher' }); });
      } else items.push({ rect: generalRect(st, f.group), ref: { t: 'slot', i: 0 }, name: sp.slots[0] || null, caption: '', kind: 'group' });
      var ow1 = ownerOf(st);
      halves(f.portrait, ow1).forEach(function (q) { items.push({ rect: q.rect, ref: q.m == null ? { t: 'fright' } : { t: 'fright', m: q.m }, name: (q.p && sp.kidPhotos && sp.kidPhotos[q.p.id]) || (q.p ? photoFor(q.p, numMap, true) : null), caption: '', kind: 'portrait1' }); });
    } else if (sp.type === 'portrait') {
      var k = portraitK(st), rs = L.portraitSlots(k, W, H, d.gap, st.grid, st.pstyle), cols = (st.grid && st.grid.cols) || L.gridFor(k, W, H, 0.8).cols, covered = {};
      rs.forEach(function (r, j) {
        if (covered[j]) return;
        var rect = r, span = spanCells(sp, j, k, cols, 0, covered), name = sp.extra[j] || null, pe = name && !span ? personByName(st, name) : null;
        if (span) { span.cells.forEach(function (q) { covered[q] = true; }); var last = rs[span.cells[span.cells.length - 1]]; rect = { x: r.x, y: r.y, w: last.x + last.w - r.x, h: last.y + last.h - r.y }; }
        items.push({ rect: rect, ref: { t: 'extra', j: j }, name: name, text: (sp.text && sp.text[j]) || null, span: span ? sp.span[j] : null, caption: pe ? pe.name : '', kind: 'cell' });
      });
    } else {
      if (sp.style === 'tpl' && TP.byId(sp.template)) {
        var tpl = TP.byId(sp.template), mg = sp.frame ? d.groupMargin : 0;
        TP.rects(tpl, W, H, sp.frame ? d.groupGap : d.gap, mg).forEach(function (r) { items.push({ rect: r, rot: r.pivot ? 0 : 0, tilt: r.rot, pivot: r.pivot, ref: { t: 'slot', i: r.i }, name: sp.slots[r.i] || null, caption: '', kind: 'group', dark: true }); });
        return { W: W, H: H, items: items, design: d, ownerName: '', z: z };
      }
      var g0 = items.length;
      L.groupSlots(sp.slots.length, W, H, d.groupGap, d.groupMargin, sp.seed, sp.style || 'mosaic').forEach(function (r, i) { var ofs = sp.style === 'scrap' && sp.off && sp.off[r.i != null ? r.i : i]; if (ofs) r = Object.assign({}, r, { x: r.x + ofs.dx, y: r.y + ofs.dy }); items.push({ rect: r, rot: r.rot || 0, ref: { t: 'slot', i: r.i != null ? r.i : i }, name: sp.slots[r.i != null ? r.i : i], caption: '', kind: 'group' }); });
      if (sp.style === 'scrap') {
        var grp = items.splice(g0); grp.forEach(function (q) { q.tape = (sp.tape && sp.tape[q.ref.i]) || ['tl', 'br']; });
        var zs = sp.zs || [], base = grp.filter(function (q) { return zs.indexOf(q.ref.i) < 0; }), top = zs.map(function (k) { return grp.filter(function (q) { return q.ref.i === k; })[0]; }).filter(Boolean);
        base.concat(top).forEach(function (q) { items.push(q); });
      }
    }
    return { W: W, H: H, items: items, design: d, ownerName: ownerName, z: z };
  }
  // Місце портрета власника: одне, а для пари ділиться навпіл (по одному вікну на дитину).
  function halves(r, ow) {
    if (!ow) return [{ rect: r, p: null }];
    if (!ow.members) return [{ rect: r, p: ow }];
    var g = 1.2, w = (r.w - g) / 2;
    return [{ rect: { x: r.x, y: r.y, w: w, h: r.h }, p: ow.members[0], m: 0 }, { rect: { x: r.x + w + g, y: r.y, w: w, h: r.h }, p: ow.members[1], m: 1 }];
  }
  function swapRefs(st, si, a, b) {
    var sp = st.spreads[si];
    if (a.t === 'person' && b.t === 'person') { var o = st.order; var t = o[a.pos]; o[a.pos] = o[b.pos]; o[b.pos] = t; return true; }
    if (a.t === 'slot' && b.t === 'slot') { var t2 = sp.slots[a.i]; sp.slots[a.i] = sp.slots[b.i]; sp.slots[b.i] = t2; return true; }
    if (a.t === 'extra' && b.t === 'extra') {
      sp.text = sp.text || {}; var t3 = sp.extra[a.j]; sp.extra[a.j] = sp.extra[b.j]; sp.extra[b.j] = t3;
      var t4 = sp.text[a.j]; sp.text[a.j] = sp.text[b.j]; sp.text[b.j] = t4; return true;
    }
    return false;
  }
  function setPhoto(st, si, ref, name) {
    var sp = st.spreads[si];
    var ow = ownerOf(st);
    var mo = memberOf(ow, ref);
    if (ref.t === 'cover') { if (mo) st.coverPhotos[mo.id] = name; }
    else if (ref.t === 'fright') { if (mo) sp.kidPhotos[mo.id] = name; }
    else if (ref.t === 'teacher') sp.teacherPhotos[ref.i] = name;
    else if (ref.t === 'slot') sp.slots[ref.i] = name; else if (ref.t === 'extra') {
      var oldp = sp.extra[ref.j] && personByName(st, sp.extra[ref.j]); sp.extra[ref.j] = name; if (sp.text) delete sp.text[ref.j];
      if (oldp && personByName(st, name) !== oldp) { st.alias = st.alias || {}; st.alias[name] = oldp.id; }
    } else return false;
    return true;
  }
  function setText(st, si, j, obj) { var sp = st.spreads[si]; sp.text = sp.text || {}; delete sp.extra[j]; if (obj && obj.t) { var old = sp.text[j]; if (old && old.p && !obj.p) obj.p = old.p; if (old && old.f && !obj.f) obj.f = old.f; sp.text[j] = obj; } else delete sp.text[j]; }
  // Візерунок клітинки j (pat = {id, c, s, img} або null). Текст у клітинці лишається.
  function setPattern(st, si, j, pat) {
    var sp = st.spreads[si]; sp.text = sp.text || {}; var o = sp.text[j];
    if (!pat) { if (o) { delete o.p; if (!o.t) delete sp.text[j]; } return; }
    delete sp.extra[j]; if (!o) o = sp.text[j] = { t: '', s: 'plain' }; o.p = pat;
  }
  function cycleStyle(st, si, j) { var o = st.spreads[si].text && st.spreads[si].text[j]; if (o) o.s = CELL_STYLES[(CELL_STYLES.indexOf(o.s || 'plain') + 1) % CELL_STYLES.length]; return o && o.s; }
  // Об'єднати порожню клітинку j з сусідніми: cw вправо, ch вниз. Повертає false, якщо неможливо.
  function setSpan(st, si, j, cw, ch) {
    var sp = st.spreads[si]; sp.span = sp.span || {}; var old = sp.span[j];
    if (cw * ch <= 1) { delete sp.span[j]; return true; }
    sp.span[j] = { cw: cw, ch: ch };
    var it = slotsFor(st, si, new Map()).items.filter(function (x) { return x.ref.t === 'extra' && x.ref.j === j; })[0];
    if (it && it.span) return true;
    if (old) sp.span[j] = old; else delete sp.span[j]; return false;
  }
  function removePhoto(st, si, ref) {
    var sp = st.spreads[si], ow = ownerOf(st);
    var mo = memberOf(ow, ref);
    if (ref.t === 'cover') { if (mo) delete st.coverPhotos[mo.id]; return true; }
    if (ref.t === 'fright') { if (mo) delete sp.kidPhotos[mo.id]; return true; }
    if (ref.t === 'teacher') { delete sp.teacherPhotos[ref.i]; return true; }
    if (ref.t === 'slot') { if (sp.type === 'group' && sp.style !== 'tpl') sp.slots.splice(ref.i, 1); else sp.slots[ref.i] = null; return true; }
    if (ref.t === 'extra') { delete sp.extra[ref.j]; if (sp.text) delete sp.text[ref.j]; return true; }
    return false;
  }
  function moveSpread(st, i, dir) {
    var j = i + dir;
    if (i < 2 || j < 2 || j >= st.spreads.length) return false;
    var t = st.spreads[i]; st.spreads[i] = st.spreads[j]; st.spreads[j] = t; return true;
  }
  function pad(n, w) { return String(n).padStart(w, '0'); }
  // Усі файли експорту. Індивідуальні розвороти: <номер розвороту>_<номер дитини у списку> (cover_KK, 01_KK, 05_KK…); обкладинка не індивідуальна: cover;
  // спільні розвороти: <номер> (02, 03…). Запис: {name, si, owner (id дитини або null)}.
  function exportPlan(st) {
    var kids = albumKids(st), w = Math.max(2, String(kids.length).length), out = [];
    function expand(si, prefix) { var k = Math.max(1, kids.length); for (var i = 0; i < k; i++) out.push({ name: prefix + '_' + pad(i + 1, w), si: si, owner: kids[i] ? kids[i].id : null }); }
    st.spreads.forEach(function (sp, si) {
      if (sp.type === 'cover') { if (coverIndividual(st)) expand(si, 'cover'); else out.push({ name: 'cover', si: si, owner: null }); }
      else if (sp.type === 'first') expand(si, pad(si, 2));
      else out.push({ name: pad(si, 2), si: si, owner: null });
    });
    return out;
  }
  function exportName(st, i) {
    var sp = st.spreads[i], w = Math.max(2, String(albumKids(st).length).length), idx = ownerIndex(st) + 1 || 1;
    if (sp.type === 'cover') return coverIndividual(st) ? 'cover_' + pad(idx, w) : 'cover';
    if (sp.type === 'first') return pad(i, 2) + '_' + pad(idx, w);
    return pad(i, 2);
  }
  function toJSON(st) { return JSON.stringify(st); }
  function fromJSON(text) {
    var o = JSON.parse(text), b = newState();
    if (!o || o.v !== 1 || !Array.isArray(o.spreads)) throw new Error('Невідомий формат файлу макета');
    Object.keys(b).forEach(function (k) { if (o[k] !== undefined) b[k] = o[k]; });
    return b;
  }
  var api = { newState: newState, people: people, teachers: teachers, portraitK: portraitK, buildSpreads: buildSpreads, resizePortrait: resizePortrait, mkSpread: mkSpread,
    numMapOf: numMapOf, photoFor: photoFor, personByFile: personByFile, slotsFor: slotsFor, swapRefs: swapRefs, setPhoto: setPhoto, removePhoto: removePhoto,
    moveSpread: moveSpread, setStyle: setStyle, setTemplate: setTemplate, addGroupPhotos: addGroupPhotos, fillBest: fillBest, fitAll: fitAll, freeGroup: freeGroup, freeCount: freeCount, groupPhotos: groupPhotos, personByName: personByName, placePortrait: placePortrait, sortForPortrait: sortForPortrait, reflowPortrait: reflowPortrait, portraitStats: portraitStats, movePhoto: movePhoto, swapAcross: swapAcross, freeCells: freeCells, ownerOf: ownerOf, presets: presets, setText: setText, setPattern: setPattern, cycleStyle: cycleStyle, setSpan: setSpan, CELL_STYLES: CELL_STYLES, exportName: exportName, coverIndividual: coverIndividual, coverVar: coverVar, isIndividual: isIndividual, makeIndividual: makeIndividual, makeGeneral: makeGeneral, exportPlan: exportPlan, zoneOf: zoneOf, albumKids: albumKids, ownerIndex: ownerIndex, setOwnerIndex: setOwnerIndex, assignUnmatched: assignUnmatched, assignTeachers: assignTeachers, toJSON: toJSON, fromJSON: fromJSON };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumState = api;
})(typeof self !== 'undefined' ? self : this);
