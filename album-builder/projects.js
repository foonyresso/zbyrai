// Проєкти макетника: кеш у IndexedDB (багато робіт), файл проєкту project.json (у ZIP або окремо), читання ZIP. Без залежностей.
(function (root) {
  var FORMAT = 'zbyrai-album-project', DB = 'albumBuilder', STORE = 'projects';

  // ---------- Файл проєкту ----------
  function pack(stateJson) { return JSON.stringify({ format: FORMAT, v: 1, savedAt: new Date().toISOString(), state: JSON.parse(stateJson) }); }
  // Приймає обгортку проєкту або «голий» стан макета; повертає JSON-рядок стану для AlbumState.fromJSON
  function unpack(text) {
    var o = JSON.parse(text);
    if (o && o.format === FORMAT && o.state) return JSON.stringify(o.state);
    if (o && o.v === 1 && Array.isArray(o.spreads)) return JSON.stringify(o);
    throw new Error('Це не файл проєкту макетника');
  }
  function nameOf(st) {
    var n = (st.inst && (st.inst.short || st.inst.full) || '').trim();
    return (n ? n + (st.year ? ' ' + st.year : '') : 'Без назви' + (st.year ? ' ' + st.year : ''));
  }

  // Ім'я файлу з назви закладу (скорочена, інакше повна) без недопустимих символів
  function fileBase(st) {
    var n = (st.inst && (st.inst.short || st.inst.full) || '').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').replace(/^[\s.]+|[\s.]+$/g, '').slice(0, 100).trim();
    return n || 'album';
  }

  // ---------- Читання ZIP (stored і deflate) ----------
  function u16(b, o) { return b[o] | b[o + 1] << 8; }
  function u32(b, o) { return (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0; }
  async function inflate(data) {
    var ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(data); w.close();
    return new Uint8Array(await new Response(ds.readable).arrayBuffer());
  }
  // Повертає [{name, data:Uint8Array}] для потрібних записів (filter(name) → bool)
  async function unzip(buf, filter) {
    var b = new Uint8Array(buf), e = -1, out = [], dec = new TextDecoder();
    for (var i = b.length - 22; i >= Math.max(0, b.length - 65558); i--) if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 5 && b[i + 3] === 6) { e = i; break; }
    if (e < 0) throw new Error('Не схоже на ZIP-архів');
    var n = u16(b, e + 10), p = u32(b, e + 16);
    for (var k = 0; k < n; k++) {
      if (u32(b, p) !== 0x02014b50) break;
      var method = u16(b, p + 10), csize = u32(b, p + 20), nl = u16(b, p + 28), xl = u16(b, p + 30), cl = u16(b, p + 32), lo = u32(b, p + 42);
      var name = dec.decode(b.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
      if (filter && !filter(name)) continue;
      var ds = lo + 30 + u16(b, lo + 26) + u16(b, lo + 28), raw = b.subarray(ds, ds + csize);
      out.push({ name: name, data: method === 0 ? raw : method === 8 ? await inflate(raw) : null });
    }
    return out;
  }
  // ZIP або JSON → JSON-рядок стану
  async function readProjectFile(file) {
    var buf = await file.arrayBuffer(), u = new Uint8Array(buf);
    if (u[0] === 0x50 && u[1] === 0x4b) {
      var r = await unzip(buf, function (n) { return /(^|\/)project\.json$/i.test(n); });
      if (!r.length || !r[0].data) throw new Error('В архіві нема project.json (збережений до появи проєктів?)');
      return unpack(new TextDecoder().decode(r[0].data));
    }
    return unpack(new TextDecoder().decode(u));
  }

  // ---------- Кеш проєктів (IndexedDB) ----------
  var dbp = null;
  function open() {
    if (!dbp) dbp = new Promise(function (res, rej) {
      if (!root.indexedDB) return rej(new Error('IndexedDB недоступний'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return open().then(function (db) { return new Promise(function (res, rej) {
      var t = db.transaction(STORE, mode), rq = fn(t.objectStore(STORE));
      t.oncomplete = function () { res(rq && rq.result); }; t.onerror = t.onabort = function () { rej(t.error); };
    }); });
  }
  function list() { return tx('readonly', function (s) { return s.getAll(); }).then(function (a) { return a.sort(function (x, y) { return y.updated - x.updated; }); }); }
  function get(id) { return tx('readonly', function (s) { return s.get(id); }); }
  function put(rec) { return tx('readwrite', function (s) { return s.put(rec); }); }
  function del(id) { return tx('readwrite', function (s) { return s.delete(id); }); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  var api = { FORMAT: FORMAT, pack: pack, unpack: unpack, nameOf: nameOf, fileBase: fileBase, unzip: unzip, readProjectFile: readProjectFile, list: list, get: get, put: put, del: del, uid: uid };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumProjects = api;
})(typeof self !== 'undefined' ? self : this);
