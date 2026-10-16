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
      children: '', noAlbum: '', teachers: '', kOverride: null, order: [], crops: {}, spreads: [] };
  }
  function people(st) {
    var list = P.parseChildren(st.children).map(function (p) { p.kind = 'child'; return p; })
      .concat(P.parseChildren(st.noAlbum).map(function (p) { p.kind = 'noalbum'; return p; }));
    if (!Array.isArray(st.order) || st.order.length !== list.length) st.order = list.map(function (_, i) { return i; });
    return st.order.map(function (i) { return list[i]; });
  }
  function teachers(st) { return P.parseTeachers(st.teachers); }
  function portraitK(st) { return st.kOverride || L.autoK(people(st).length); }
  function portraitCount(st) { return Math.max(1, Math.ceil(people(st).length / portraitK(st))); }
  function mkSpread(type) { return { id: newId(), type: type, seed: 1 + Math.floor(Math.random() * 9999), slots: type === 'cover' ? [null] : type === 'first' ? [null, null] : [], extra: {} }; }
  function buildSpreads(st) {
    var s = [mkSpread('cover'), mkSpread('first')];
    for (var i = 0; i < portraitCount(st); i++) { s.push(mkSpread('portrait')); s.push(mkSpread('group')); }
    st.spreads = s;
  }
  // Підганяє кількість портретних розворотів під список і k: зайві з кінця прибирає, бракуючі додає після останнього.
  function resizePortrait(st) {
    var need = portraitCount(st), idx = [];
    st.spreads.forEach(function (s, i) { if (s.type === 'portrait') idx.push(i); });
    while (idx.length > need) st.spreads.splice(idx.pop(), 1);
    var at = idx.length ? idx[idx.length - 1] + 1 : st.spreads.length;
    for (var n = idx.length; n < need; n++) st.spreads.splice(at++, 0, mkSpread('portrait'));
  }
  function numMapOf(names) {
    var m = new Map();
    names.slice().sort().forEach(function (n) { P.fileRuns(n).forEach(function (r) { if (!m.has(r)) m.set(r, n); }); });
    return m;
  }
  function photoFor(p, numMap) {
    for (var i = 0; i < p.nums.length; i++) if (numMap.has(p.nums[i])) return numMap.get(p.nums[i]);
    return null;
  }
  function personByFile(st, name) {
    var runs = P.fileRuns(name), all = people(st).concat(teachers(st));
    for (var i = 0; i < all.length; i++) for (var j = 0; j < runs.length; j++) if (all[i].nums.indexOf(runs[j]) >= 0) return all[i];
    return null;
  }
  function portraitIndex(st, si) { var n = 0; for (var i = 0; i < si; i++) if (st.spreads[i].type === 'portrait') n++; return n; }

  // Усі вікна розвороту для малювання й взаємодії. items[].ref: {t:'person',pos} | {t:'slot',i} | {t:'extra',j}.
  function slotsFor(st, si, numMap) {
    var sp = st.spreads[si], z = PR.spreadSize(st.fmtId), W = z.W, H = z.H, d = DS.DESIGNS[st.designId] || DS.DESIGNS.classic, items = [];
    if (sp.type === 'cover') {
      var c = L.coverLayout(W, H), nm = sp.slots[0] ? personByFile(st, sp.slots[0]) : null;
      items.push({ rect: c.photo, ref: { t: 'slot', i: 0 }, name: sp.slots[0] || null, caption: nm ? nm.name : '', kind: 'cover' });
    } else if (sp.type === 'first') {
      var f = L.firstLayout(W, H), tl = teachers(st);
      if (tl.length) {
        L.teacherSlots(tl.length, W, H).forEach(function (q, i) { items.push({ rect: q.photo, capRect: q.cap, ref: { t: 'teacher', i: i }, name: photoFor(tl[i], numMap), caption: tl[i].name, post: tl[i].post, kind: 'teacher' }); });
      } else items.push({ rect: f.group, ref: { t: 'slot', i: 0 }, name: sp.slots[0] || null, caption: '', kind: 'group' });
      items.push({ rect: f.portrait, ref: { t: 'slot', i: 1 }, name: sp.slots[1] || null, caption: '', kind: 'portrait1' });
    } else if (sp.type === 'portrait') {
      var k = portraitK(st), rs = L.portraitSlots(k, W, H, d.gap), ps = people(st), base = portraitIndex(st, si) * k;
      rs.forEach(function (r, j) {
        var p = ps[base + j];
        if (p) items.push({ rect: r, ref: { t: 'person', pos: base + j }, name: photoFor(p, numMap), caption: p.name, num: p.nums[0], kind: 'person' });
        else items.push({ rect: r, ref: { t: 'extra', j: j }, name: sp.extra[j] || null, caption: '', kind: 'blank' });
      });
    } else {
      L.groupSlots(sp.slots.length, W, H, d.groupGap, d.groupMargin, sp.seed).forEach(function (r, i) { items.push({ rect: r, ref: { t: 'slot', i: i }, name: sp.slots[i], caption: '', kind: 'group' }); });
    }
    return { W: W, H: H, items: items, design: d };
  }
  function swapRefs(st, si, a, b) {
    var sp = st.spreads[si];
    if (a.t === 'person' && b.t === 'person') { var o = st.order; var t = o[a.pos]; o[a.pos] = o[b.pos]; o[b.pos] = t; return true; }
    if (a.t === 'slot' && b.t === 'slot') { var t2 = sp.slots[a.i]; sp.slots[a.i] = sp.slots[b.i]; sp.slots[b.i] = t2; return true; }
    if (a.t === 'extra' && b.t === 'extra') { var t3 = sp.extra[a.j]; sp.extra[a.j] = sp.extra[b.j]; sp.extra[b.j] = t3; return true; }
    return false;
  }
  function setPhoto(st, si, ref, name) {
    var sp = st.spreads[si];
    if (ref.t === 'slot') sp.slots[ref.i] = name; else if (ref.t === 'extra') sp.extra[ref.j] = name; else return false;
    return true;
  }
  function removePhoto(st, si, ref) {
    var sp = st.spreads[si];
    if (ref.t === 'slot') { if (sp.type === 'group') sp.slots.splice(ref.i, 1); else sp.slots[ref.i] = null; return true; }
    if (ref.t === 'extra') { delete sp.extra[ref.j]; return true; }
    return false;
  }
  function moveSpread(st, i, dir) {
    var j = i + dir;
    if (i < 2 || j < 2 || j >= st.spreads.length) return false;
    var t = st.spreads[i]; st.spreads[i] = st.spreads[j]; st.spreads[j] = t; return true;
  }
  function exportName(st, i) {
    var sp = st.spreads[i];
    if (sp.type === 'cover') return 'cover_01';
    if (sp.type === 'first') return '01_01';
    return String(i).padStart(2, '0');
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
    moveSpread: moveSpread, exportName: exportName, toJSON: toJSON, fromJSON: fromJSON };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumState = api;
})(typeof self !== 'undefined' ? self : this);
