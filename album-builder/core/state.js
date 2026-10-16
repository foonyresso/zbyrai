// Модель макета: стан, список людей, розворотів, прив'язка фото за номером, обмін місцями, JSON. Без DOM.
(function (root) {
  var P = typeof require !== 'undefined' ? require('./parse.js') : root.AlbumParse;
  var L = typeof require !== 'undefined' ? require('./layout.js') : root.AlbumLayout;
  var PR = typeof require !== 'undefined' ? require('../data/print-types.js') : root.AlbumPrint;
  var DS = typeof require !== 'undefined' ? require('../data/designs.js') : root.AlbumDesigns;
  var uid = 0;
  function newId() { return 's' + (++uid) + Math.floor(Math.random() * 1e6).toString(36); }

  function newState() {
    return { v: 1, typeId: 'bamboo', fmtId: '23x23', catId: 'grade11', designId: 'classic', inst: { full: '', short: '' }, year: String(new Date().getFullYear()),
      children: '', noAlbum: '', teachers: '', kOverride: null, order: [], crops: {}, owner: 0, coverNoPhoto: false, coverPhotos: {}, coverIndividual: null, safe: null, coverSafe: null, spine: null, spreads: [] };
  }
  function people(st) {
    var list = P.parseChildren(st.children).map(function (p) { p.kind = 'child'; return p; })
      .concat(P.parseChildren(st.noAlbum).map(function (p) { p.kind = 'noalbum'; return p; }));
    list.forEach(function (p, i) { p.id = i; });
    if (!Array.isArray(st.order) || st.order.length !== list.length) st.order = list.map(function (_, i) { return i; });
    return st.order.map(function (i) { return list[i]; });
  }
  function teachers(st) { return P.parseTeachers(st.teachers); }
  function portraitK(st) { return st.kOverride || L.autoK(people(st).length); }
  function portraitCount(st) { return Math.max(1, Math.ceil(people(st).length / portraitK(st))); }
  function mkSpread(type) { return { id: newId(), type: type, seed: 1 + Math.floor(Math.random() * 9999), slots: type === 'cover' ? [null] : type === 'first' ? [null, null] : [], extra: {}, text: {}, span: {}, teacherPhotos: {}, kidPhotos: {}, style: 'mosaic' }; }
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
  // Переносить фото з комірки (ref) розвороту si на розворот to: портретний бере вільну комірку, груповий додає в кінець.
  function movePhoto(st, si, ref, to) {
    var sp = st.spreads[si], name = ref.t === 'extra' ? sp.extra[ref.j] : sp.slots[ref.i], dst = st.spreads[to];
    if (!name || !dst || to === si) return false;
    if (dst.type === 'portrait') { if (!freeCells(st, to).length) return false; dst.extra[freeCells(st, to)[0]] = name; }
    else if (dst.type === 'group') dst.slots.push(name); else return false;
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
  function albumKids(st) { return people(st).filter(function (p) { return p.kind === 'child'; }).sort(function (a, b) { return a.id - b.id; }); }
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
    var need = kids.filter(function (p) { return !map[p.id] && !photoFor(p, numMap, true); });
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
      var c = L.coverLayout(W, H, z.sb, z), ow = ownerOf(st);
      ownerName = ow ? ow.name : '';
      if (!st.coverNoPhoto) items.push({ rect: c.photo, ref: { t: 'cover' }, name: (ow && st.coverPhotos[ow.id]) || (ow ? photoFor(ow, numMap, true) : null), caption: '', kind: 'cover' });
    } else if (sp.type === 'first') {
      var f = L.firstLayout(W, H, z.sb), tl = teachers(st);
      if (tl.length) {
        L.teacherSlots(tl.length, W, H).forEach(function (q, i) { items.push({ rect: q.photo, capRect: q.cap, ref: { t: 'teacher', i: i }, name: (sp.teacherPhotos && sp.teacherPhotos[i]) || photoFor(tl[i], numMap), caption: tl[i].name, post: tl[i].post, kind: 'teacher' }); });
      } else items.push({ rect: f.group, ref: { t: 'slot', i: 0 }, name: sp.slots[0] || null, caption: '', kind: 'group' });
      var ow1 = ownerOf(st);
      items.push({ rect: f.portrait, ref: { t: 'fright' }, name: (ow1 && sp.kidPhotos && sp.kidPhotos[ow1.id]) || (ow1 ? photoFor(ow1, numMap, true) : null), caption: '', kind: 'portrait1' });
    } else if (sp.type === 'portrait') {
      var k = portraitK(st), rs = L.portraitSlots(k, W, H, d.gap), cols = L.gridFor(k, W, H, 0.8).cols, covered = {};
      rs.forEach(function (r, j) {
        if (covered[j]) return;
        var rect = r, span = spanCells(sp, j, k, cols, 0, covered), name = sp.extra[j] || null, pe = name && !span ? personByName(st, name) : null;
        if (span) { span.cells.forEach(function (q) { covered[q] = true; }); var last = rs[span.cells[span.cells.length - 1]]; rect = { x: r.x, y: r.y, w: last.x + last.w - r.x, h: last.y + last.h - r.y }; }
        items.push({ rect: rect, ref: { t: 'extra', j: j }, name: name, text: (sp.text && sp.text[j]) || null, span: span ? sp.span[j] : null, caption: pe ? pe.name : '', kind: 'cell' });
      });
    } else {
      L.groupSlots(sp.slots.length, W, H, d.groupGap, d.groupMargin, sp.seed, sp.style || 'mosaic').forEach(function (r, i) { items.push({ rect: r, rot: r.rot || 0, ref: { t: 'slot', i: r.i != null ? r.i : i }, name: sp.slots[r.i != null ? r.i : i], caption: '', kind: 'group' }); });
    }
    return { W: W, H: H, items: items, design: d, ownerName: ownerName, z: z };
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
    if (ref.t === 'cover') { if (ow) st.coverPhotos[ow.id] = name; }
    else if (ref.t === 'fright') { if (ow) sp.kidPhotos[ow.id] = name; }
    else if (ref.t === 'teacher') sp.teacherPhotos[ref.i] = name;
    else if (ref.t === 'slot') sp.slots[ref.i] = name; else if (ref.t === 'extra') { sp.extra[ref.j] = name; if (sp.text) delete sp.text[ref.j]; } else return false;
    return true;
  }
  function setText(st, si, j, obj) { var sp = st.spreads[si]; sp.text = sp.text || {}; delete sp.extra[j]; if (obj && obj.t) sp.text[j] = obj; else delete sp.text[j]; }
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
    if (ref.t === 'cover') { if (ow) delete st.coverPhotos[ow.id]; return true; }
    if (ref.t === 'fright') { if (ow) delete sp.kidPhotos[ow.id]; return true; }
    if (ref.t === 'teacher') { delete sp.teacherPhotos[ref.i]; return true; }
    if (ref.t === 'slot') { if (sp.type === 'group') sp.slots.splice(ref.i, 1); else sp.slots[ref.i] = null; return true; }
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
    moveSpread: moveSpread, personByName: personByName, placePortrait: placePortrait, sortForPortrait: sortForPortrait, reflowPortrait: reflowPortrait, portraitStats: portraitStats, movePhoto: movePhoto, freeCells: freeCells, ownerOf: ownerOf, presets: presets, setText: setText, cycleStyle: cycleStyle, setSpan: setSpan, CELL_STYLES: CELL_STYLES, exportName: exportName, coverIndividual: coverIndividual, isIndividual: isIndividual, makeIndividual: makeIndividual, makeGeneral: makeGeneral, exportPlan: exportPlan, zoneOf: zoneOf, albumKids: albumKids, ownerIndex: ownerIndex, setOwnerIndex: setOwnerIndex, assignUnmatched: assignUnmatched, assignTeachers: assignTeachers, toJSON: toJSON, fromJSON: fromJSON };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumState = api;
})(typeof self !== 'undefined' ? self : this);
