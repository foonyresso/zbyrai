// Симулятор підземель: малювання поверху на canvas (з прокруткою й зумом) та експорт PNG. Без стану інтерфейсу.
(function (root, factory) { root.DungeonRender = factory(root.DungeonCore); })(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';
  const T = C.T;
  const PAL = {
    stone: { bg: '#0b0b0f', floor: ['#4a4640', '#514c45', '#45413b'], corr: '#3a3631', wall: '#0a0a0d', door: '#a9794b', secret: '#e0b34a', grid: 'rgba(0,0,0,.28)' },
    print: { bg: '#ffffff', floor: ['#d9d9d9', '#dedede', '#d3d3d3'], corr: '#c4c4c4', wall: '#111111', door: '#8a5a2b', secret: '#c28a00', grid: 'rgba(0,0,0,.12)' },
  };
  const ROLE_COL = { start: '#6fe29a', boss: '#ff6b61', down: '#8fb7ff', dead: '#f0c84f' };
  const TAGCOL = { flooded: '#3b8be0', rubble: '#9a9a9a', tombs: '#d8d0b4', webs: '#f0f0f0', ore: '#e0a64a', altar: '#c58bff', cells: '#8794a2', lab: '#5fe0b0', library: '#c9915a', nests: '#b98a4e', roots: '#5da34a', cache: '#f0d060', crystals: '#6fe3ff', blood: '#b3202a' };
  const hx = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0); };
  const cache = new WeakMap();

  function bitmap(f, th) { // 1 піксель = 1 плитка, для дрібного масштабу
    const k = cache.get(f) || {}; if (k[th.bg]) return k[th.bg];
    const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h; const x = cv.getContext('2d'), im = x.createImageData(f.w, f.h);
    const col = s => { const n = parseInt(s.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const pal = { [T.ROCK]: null, [T.CORR]: col(th.corr), [T.DOOR]: col(th.door), [T.SECRET]: null, [T.DOWN]: [143, 183, 255], [T.UP]: [143, 183, 255] };
    for (let i = 0; i < f.tiles.length; i++) { const t = f.tiles[i], c = t === T.FLOOR ? col(th.floor[hx(i % f.w, (i / f.w) | 0) % 3]) : pal[t]; if (!c) continue; im.data[i * 4] = c[0]; im.data[i * 4 + 1] = c[1]; im.data[i * 4 + 2] = c[2]; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); k[th.bg] = cv; cache.set(f, k); return cv;
  }
  const solid = (f, x, y) => x < 0 || y < 0 || x >= f.w || y >= f.h || f.tiles[y * f.w + x] === T.ROCK || f.tiles[y * f.w + x] === T.SECRET;

  // view = {x, y, s}: зсув у плитках і розмір плитки в пікселях. opt = {theme, layers:{traps,monsters,loot,labels,secrets}, hover, sel}
  function draw(ctx, d, fi, view, opt, W, H) {
    const f = d.floors[fi], th = PAL[opt.palette] || PAL.stone, s = view.s, L = opt.layers;
    if (opt.fill) { ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H); } else ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    if (s < 5) { ctx.drawImage(bitmap(f, th), -view.x * s, -view.y * s, f.w * s, f.h * s); }
    else {
      const x0 = Math.max(0, Math.floor(view.x)), y0 = Math.max(0, Math.floor(view.y)), x1 = Math.min(f.w, Math.ceil(view.x + W / s)), y1 = Math.min(f.h, Math.ceil(view.y + H / s));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const t = f.tiles[y * f.w + x]; if (t === T.ROCK) continue;
        const px = (x - view.x) * s, py = (y - view.y) * s;
        ctx.fillStyle = t === T.FLOOR ? th.floor[hx(x, y) % 3] : (t === T.SECRET && L.secrets ? th.secret : t === T.DOOR ? th.door : th.corr);
        if (t === T.SECRET && !L.secrets) continue;
        ctx.fillRect(px, py, s + .5, s + .5);
        if (s >= 9 && t !== T.DOOR && t !== T.SECRET) { ctx.fillStyle = th.grid; ctx.fillRect(px, py, s, 1); ctx.fillRect(px, py, 1, s); }
        // стіни: темна кромка з боку каменю
        ctx.fillStyle = th.wall; const w = Math.max(1, s * .14);
        if (t !== T.SECRET || L.secrets) { if (solid(f, x, y - 1)) ctx.fillRect(px, py, s, w); if (solid(f, x, y + 1)) ctx.fillRect(px, py + s - w, s, w); if (solid(f, x - 1, y)) ctx.fillRect(px, py, w, s); if (solid(f, x + 1, y)) ctx.fillRect(px + s - w, py, w, s); }
        if (t === T.DOWN || t === T.UP) { ctx.fillStyle = '#e8f0ff'; for (let i = 0; i < 4; i++) ctx.fillRect(px + s * .15, py + s * (.15 + i * .2), s * (t === T.DOWN ? .7 - i * .12 : .3 + i * .12), Math.max(1, s * .1)); }
      }
    }
    const sx = x => (x - view.x) * s, sy = y => (y - view.y) * s, R = Math.max(2, s * .32);
    // позначки кімнат (вхід, фінал, сходи, схованки)
    for (const r of f.rooms) {
      const col = ROLE_COL[r.role] || (r.loot ? ROLE_COL.dead : null), cx = sx(r.mx + .5), cy = sy(r.my + .5);
      if (cx < -40 || cy < -40 || cx > W + 40 || cy > H + 40) continue;
      if (L.tags && r.tags && r.tags.length) {
        ctx.globalAlpha = .2; ctx.fillStyle = TAGCOL[r.tags[0]]; ctx.beginPath();
        if (r.shape === 'round' || r.shape === 'blob') ctx.ellipse(sx(r.x + r.w / 2), sy(r.y + r.h / 2), r.w * s / 2, r.h * s / 2, 0, 0, 7); else ctx.rect(sx(r.x), sy(r.y), r.w * s, r.h * s);
        ctx.fill(); ctx.globalAlpha = .85;
        if (s >= 6) r.tags.forEach((tg, ti) => { ctx.fillStyle = TAGCOL[tg]; for (let i = 0; i < 4; i++) { const h = hx(r.id * 31 + ti * 7 + i, r.x + i), gx = r.x + 1 + (h % Math.max(1, r.w - 2)), gy = r.y + 1 + ((h >>> 8) % Math.max(1, r.h - 2)); ctx.fillRect(sx(gx) + s * .2, sy(gy) + s * .2, s * .3, s * .3); } });
        ctx.globalAlpha = 1;
      }
      if (opt.sel === r.id || opt.hover === r.id) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(sx(r.x), sy(r.y), r.w * s, r.h * s); }
      if (r.role === 'start' || r.role === 'boss' || r.role === 'down') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, s * .5), 0, 7); ctx.fill(); }
      if (L.loot && r.loot) { ctx.fillStyle = ROLE_COL.dead; ctx.fillRect(cx - R + (r.role === 'boss' ? s : 0), cy - R + s * .8, R * 2, R * 1.4); }
      if (L.monsters && r.monsters && r.role !== 'start') { ctx.fillStyle = r.monsters.boss ? '#ff3b30' : '#e86a5f'; for (let i = 0; i < Math.min(r.monsters.count, 5); i++) { ctx.beginPath(); ctx.arc(cx - s * .9 + i * s * .5, cy - s * .8, R * .8, 0, 7); ctx.fill(); } }
      if (r.secret && L.secrets) { ctx.strokeStyle = th.secret; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(sx(r.x) - 2, sy(r.y) - 2, r.w * s + 4, r.h * s + 4); ctx.setLineDash([]); }
    }
    if (L.traps) { ctx.strokeStyle = '#ff5a4f'; ctx.lineWidth = Math.max(1.2, s * .12); for (const t of f.traps) { const x = sx(t.x), y = sy(t.y); if (x < -s || y < -s || x > W || y > H) continue; ctx.beginPath(); ctx.moveTo(x + s * .2, y + s * .2); ctx.lineTo(x + s * .8, y + s * .8); ctx.moveTo(x + s * .8, y + s * .2); ctx.lineTo(x + s * .2, y + s * .8); ctx.stroke(); } }
    if (L.labels && s >= 7) { ctx.font = `600 ${Math.min(14, Math.max(10, s * .9))}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3; for (const r of f.rooms) { const x = sx(r.mx + .5), y = sy(r.y) - 3; if (x < 0 || y < 0 || x > W || y > H) continue; const nm = r.secret && !L.secrets ? 'Кімната' : r.name; ctx.strokeText(nm, x, y); ctx.fillText(nm, x, y); } }
  }

  function bbox(d, fi) { const f = d.floors[fi]; let x0 = f.w, y0 = f.h, x1 = 0, y1 = 0; for (const r of f.rooms) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); } return { x0: x0 - 2, y0: y0 - 3, x1: x1 + 2, y1: y1 + 2 }; }
  // вписати все підземелля поверху в прямокутник екрана {x, y, w, h} (у пікселях полотна)
  function fit(d, fi, box) { const b = bbox(d, fi), bw = b.x1 - b.x0, bh = b.y1 - b.y0, s = Math.max(1, Math.min(30, box.w / bw, box.h / bh)); return { s, x: (b.x0 + b.x1) / 2 - (box.x + box.w / 2) / s, y: (b.y0 + b.y1) / 2 - (box.y + box.h / 2) / s }; }
  function pickRoom(d, fi, view, px, py) { const f = d.floors[fi], x = Math.floor(view.x + px / view.s), y = Math.floor(view.y + py / view.s); if (x < 0 || y < 0 || x >= f.w || y >= f.h) return -1; return f.rid[y * f.w + x]; }
  // що під курсором: істота, здобич, вхід/фінал, пастка, двері, сходи, підлога кімнати, коридор. Геометрія збігається з draw()
  function hit(d, fi, view, L, px, py) {
    const f = d.floors[fi], s = view.s, R = Math.max(2, s * .32), sx = x => (x - view.x) * s, sy = y => (y - view.y) * s;
    for (const r of f.rooms) {
      const cx = sx(r.mx + .5), cy = sy(r.my + .5);
      if (L.monsters && r.monsters && r.role !== 'start') for (let i = 0; i < Math.min(r.monsters.count, 5); i++) if (Math.hypot(px - (cx - s * .9 + i * s * .5), py - (cy - s * .8)) <= R * 1.3) return { type: 'monster', room: r.id };
      if (L.loot && r.loot && Math.abs(px - (cx + (r.role === 'boss' ? s : 0))) <= R * 1.1 && py >= cy - R + s * .8 - 2 && py <= cy + R * .4 + s * .8 + 2) return { type: 'loot', room: r.id };
      if (['start', 'boss', 'down'].includes(r.role) && Math.hypot(px - cx, py - cy) <= Math.max(3, s * .5)) return { type: r.role, room: r.id };
    }
    const x = Math.floor(view.x + px / s), y = Math.floor(view.y + py / s); if (x < 0 || y < 0 || x >= f.w || y >= f.h) return null;
    if (L.traps) { const tr = f.traps.find(t => t.x === x && t.y === y); if (tr) return { type: 'trap', room: tr.room, trap: tr }; }
    const t = f.tiles[y * f.w + x];
    if (t === T.SECRET) return L.secrets ? { type: 'secret', room: -1 } : null;
    if (t === T.DOOR) return { type: 'door', room: -1 };
    if (t === T.DOWN || t === T.UP) return { type: t === T.DOWN ? 'stairs-down' : 'stairs-up', room: f.rid[y * f.w + x] };
    if (t === T.CORR) return { type: 'corr', room: -1 };
    const r = f.rid[y * f.w + x]; if (r >= 0) return { type: 'room', room: r };
    return t === T.FLOOR ? { type: 'hall', room: -1 } : null;
  }
  function toPNG(d, fi, opt, scale, cb) { const f = d.floors[fi], b = bbox(d, fi), cv = document.createElement('canvas'); scale = Math.max(2, Math.min(scale, Math.floor(8000 / Math.max(b.x1 - b.x0, b.y1 - b.y0)))); cv.width = (b.x1 - b.x0) * scale; cv.height = (b.y1 - b.y0) * scale; draw(cv.getContext('2d'), d, fi, { x: b.x0, y: b.y0, s: scale }, Object.assign({ fill: true }, opt), cv.width, cv.height); cv.toBlob(cb, 'image/png'); }
  return { PAL, TAGCOL, draw, fit, bbox, pickRoom, hit, toPNG, ROLE_COL };
});
