// Атлас 2.0, підземелля: малювання карти поверху (підлога, стіни, двері, сходи, монстри, пастки, скарби, переходи) і пошук об'єкта під курсором. Масштаб view.k — пікселів на клітину.
(function () {
  'use strict';
  const A = globalThis.Atlas2, DD = A.DungeonData;
  const TINT = { entrance: '#cfd8a8', boss: '#d9a0a0', treasury: '#e6d38a', shrine: '#b9a8dd', lair: '#c9a58c', library: '#c3b48e', cistern: '#8fb4c8', secret: '#b8b8c8', stairs: '#a8c8d0', guard: '#c8b0a0' };
  const mix = (hex, t, k) => { const a = parseInt(hex.slice(1), 16), b = parseInt(t.slice(1), 16), c = i => Math.round(((a >> i) & 255) * (1 - k) + ((b >> i) & 255) * k); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  function draw(cv, D, fi, view, o) {
    o = o || {}; const f = D.floors[fi], K = DD.KINDS[D.kind], ctx = cv.getContext('2d'), k = view.k, W = f.W, H = f.H, rev = !!o.reveal;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = K.col[1]; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, view.tx, view.ty); const px = 1 / k;
    // стіни: тонкий світлий контур навколо підлоги
    ctx.fillStyle = mix(K.col[1], '#ffffff', 0.08); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f.g[y * W + x] && (rev || !f.hid[y * W + x])) ctx.fillRect(x - 0.18, y - 0.18, 1.36, 1.36);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = f.g[y * W + x]; if (!v || (!rev && f.hid[y * W + x])) continue; const rid = f.rid[y * W + x], q = rid >= 0 ? f.rooms[rid] : null;
      let col = q && TINT[q.type] ? mix(K.col[0], TINT[q.type], 0.5) : K.col[0]; if (v === 2) col = K.water && (x + y) % 2 === 0 ? mix(K.col[0], K.col[2], 0.45) : mix(K.col[0], '#000000', 0.12);
      if (q && K.water && q.type === 'cistern') col = mix(K.col[2], '#1a3040', 0.35);
      ctx.fillStyle = col; ctx.fillRect(x, y, 1.02, 1.02);
    }
    if (k > 9) { ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = px; ctx.beginPath(); for (let y = 0; y <= H; y++) { ctx.moveTo(0, y); ctx.lineTo(W, y); } for (let x = 0; x <= W; x++) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } ctx.stroke(); }
    if (o.hlRoom != null && o.hlRoom >= 0) { ctx.fillStyle = 'rgba(255,255,255,.28)'; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f.rid[y * W + x] === o.hlRoom) ctx.fillRect(x, y, 1, 1); }
    // двері
    for (const d of f.doors) { if (d.secret && !rev) continue; ctx.fillStyle = d.secret ? '#8a5ac0' : d.locked ? '#7a3a1a' : '#a8743a'; ctx.fillRect(d.x + 0.1, d.y + 0.1, 0.8, 0.8); if (k > 7) { ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = px; ctx.strokeRect(d.x + 0.1, d.y + 0.1, 0.8, 0.8); } }
    const vis = q => rev || !f.hid[q.y * W + q.x];
    const dot = (x, y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r, 0, 6.2832); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke || '#1a1a1a'; ctx.lineWidth = px * 1.4; ctx.stroke(); };
    for (const t of f.traps) { if ((t.hidden && !rev) || !vis(t)) continue; ctx.beginPath(); ctx.moveTo(t.x + 0.5, t.y + 0.05); ctx.lineTo(t.x + 0.95, t.y + 0.9); ctx.lineTo(t.x + 0.05, t.y + 0.9); ctx.closePath(); ctx.fillStyle = t.hidden ? '#e0a020' : '#f0c030'; ctx.fill(); ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = px * 1.3; ctx.stroke(); }
    for (const l of f.loot) { if (!vis(l)) continue; ctx.beginPath(); ctx.moveTo(l.x + 0.5, l.y + 0.05); ctx.lineTo(l.x + 0.95, l.y + 0.5); ctx.lineTo(l.x + 0.5, l.y + 0.95); ctx.lineTo(l.x + 0.05, l.y + 0.5); ctx.closePath(); ctx.fillStyle = '#e8c840'; ctx.fill(); ctx.strokeStyle = '#4a3a00'; ctx.lineWidth = px * 1.3; ctx.stroke(); }
    for (const m of f.monsters) if (vis(m)) dot(m.x, m.y, m.boss ? 0.62 : 0.45, m.boss ? '#a01818' : '#cc3a2a');
    // сходи й переходи
    const stair = (s, up) => { ctx.fillStyle = '#2a3a48'; ctx.fillRect(s.x - 0.6, s.y - 0.6, 1.2, 1.2); ctx.fillStyle = '#e8f0f4'; for (let i = 0; i < 4; i++) { const w = up ? 0.2 + i * 0.2 : 0.8 - i * 0.2; ctx.fillRect(s.x + 0.5 - w / 2, s.y - 0.3 + i * 0.22, w, 0.14); } };
    if (f.up) stair(f.up, true); if (f.down) stair(f.down, false);
    for (const L of D.links) if (L.floor === fi && (!L.secret || rev)) { ctx.beginPath(); ctx.arc(L.x + 0.5, L.y + 0.5, 0.7, 0, 6.2832); ctx.fillStyle = L.secret ? '#7a4ab0' : '#4a78c0'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = px * 1.4; ctx.stroke(); }
    // підписи кімнат при великому масштабі
    if (k > 11) { ctx.font = `${0.7}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(0,0,0,.55)'; for (const q of f.rooms) { if (q.secret && !rev) continue; ctx.fillText(DD.ROOMS[q.type][0], q.cx + 0.5, q.y - 0.3 + (q.shape === 'round' ? 0.6 : 0)); } }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // що під курсором (координати клітин): об'єкт > кімната > коридор
  function at(D, fi, x, y, rev) {
    const f = D.floors[fi], tx = Math.floor(x), ty = Math.floor(y), vis = q => rev || !f.hid[q.y * f.W + q.x], near = (o, r) => Math.abs(o.x + 0.5 - x) <= r && Math.abs(o.y + 0.5 - y) <= r;
    for (const L of D.links) if (L.floor === fi && (!L.secret || rev) && near(L, 0.8)) return { kind: 'link', o: L };
    for (const m of f.monsters) if (vis(m) && near(m, 0.7)) return { kind: 'monster', o: m };
    for (const t of f.traps) if ((!t.hidden || rev) && vis(t) && near(t, 0.6)) return { kind: 'trap', o: t };
    for (const l of f.loot) if (vis(l) && near(l, 0.6)) return { kind: 'loot', o: l };
    for (const s of [f.up && { ...f.up, up: true }, f.down && { ...f.down, up: false }]) if (s && near(s, 0.9)) return { kind: 'stairs', o: s };
    for (const d of f.doors) if ((!d.secret || rev) && near(d, 0.6)) return { kind: 'door', o: d };
    if (tx < 0 || ty < 0 || tx >= f.W || ty >= f.H) return null; const v = f.g[ty * f.W + tx]; if (!v || (!rev && f.hid[ty * f.W + tx])) return null; const rid = f.rid[ty * f.W + tx];
    if (rid >= 0) { const q = f.rooms[rid]; if (q.secret && !rev) return null; return { kind: 'room', o: q }; } return { kind: 'corridor', o: null };
  }
  A.DungeonDraw = { draw, at };
})();
