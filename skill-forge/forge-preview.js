/* Конструктор скілів: прев'ю. Вид зверху: гравець ліворуч, п'ять манекенів праворуч (1 клітинка = 1 м).
   buildTimeline(skill) чиста (без DOM) і повертає події для анімації; create(canvas) малює їх. */
const ForgePreview = (() => {
  const F = typeof ForgeCore !== 'undefined' ? ForgeCore : require('./forge-core.js');
  const CASTER = { x: 0, y: 0 };
  const CURSOR = { x: 10, y: 0 };
  const DUMMIES = [[10, 0], [12.5, 2.5], [8, -3], [14, -2.5], [11, 5]].map(([x, y], i) => ({ id: i, x, y }));
  const COLORS = { phys: '#d9d4c7', fire: '#f08a5d', ice: '#8fd3f0', lightning: '#f1e27a', poison: '#8fd36f', holy: '#f5e6a8', shadow: '#a98be0', arcane: '#c88bd9' };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-9; let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2; t = Math.max(0, Math.min(1, t)); return { d: Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy), t }; };
  const nearest = (from, list) => list.slice().sort((a, b) => dist(from, a) - dist(from, b))[0];
  const mods = b => b.c.filter(x => F.def(x.t).cat === 'modifier' && (!F.def(x.t).only || F.def(x.t).only.includes(b.t)));
  const getMod = (b, id) => { const m = mods(b).find(x => x.t === id); return m ? m.p : null; };

  /* Подія: { kind, t0, t1, from, to, r, w, angle, arc, hits:[{id, t}], ... }. Час у секундах, стиснутий до 4 с для довгих. */
  function buildTimeline(skill) {
    const events = [];
    // області навколо гравця й ближній бій показуємо з манекенами впритул, решту — на відстані
    const closeKind = b => { const d = F.def(b.t); return d.shape.kind === 'arc' || d.shape.kind === 'aura' || (d.shape.kind === 'circle' && b.p.center === 'caster') || (d.shape.kind === 'cone' && b.p.range <= 8); };
    const shift = skill.root.some(b => F.def(b.t).cat === 'delivery' && closeKind(b)) ? -7 : 0;
    const D = DUMMIES.map(e => ({ id: e.id, x: e.x + shift, y: e.y })), cur = { x: CURSOR.x + shift, y: CURSOR.y };
    const sq = s => Math.min(s, 3);
    function extras(node, ev, hitAt) {
      const chain = getMod(node, 'chain'), explode = getMod(node, 'explode');
      if (explode && ev.hits.length) { const h0 = D[ev.hits[0].id]; ev.ring = { at: { x: h0.x, y: h0.y }, r: explode.radius, t: ev.hits[0].t }; for (const e of D) if (dist(e, h0) <= explode.radius && !ev.hits.some(h => h.id === e.id)) hitAt(e, ev.hits[0].t + 0.1); }
      if (chain && ev.hits.length) { let cur = D[ev.hits[0].id], t = ev.hits[0].t; const seen = new Set([cur.id]); ev.links = []; for (let i = 0; i < chain.bounces; i++) { const nx = D.filter(e => !seen.has(e.id) && dist(e, cur) <= chain.range + 3).sort((a, b) => dist(a, cur) - dist(b, cur))[0]; if (!nx) break; t += 0.15; ev.links.push({ a: { x: cur.x, y: cur.y }, b: { x: nx.x, y: nx.y }, t }); if (!ev.hits.some(h => h.id === nx.id)) hitAt(nx, t); seen.add(nx.id); cur = nx; } ev.t1 = Math.max(ev.t1, t + 0.1); }
    }
    function deliver(node, origin, t0, depth) {
      if (depth > 4 || events.length > 200) return t0;
      const d = F.def(node.t), p = node.p, aimAt = nearest(origin, D) || cur;
      const base = angTo(origin, aimAt);
      const ev = { kind: d.shape.kind, t0, t1: t0 + 0.3, from: { x: origin.x, y: origin.y }, angle: base, hits: [], brick: node.id };
      const hitAt = (e, t) => ev.hits.push({ id: e.id, t });
      switch (ev.kind) {
        case 'single': { ev.to = { x: aimAt.x, y: aimAt.y }; ev.t1 = t0 + 0.25; hitAt(aimAt, t0 + 0.2); extras(node, ev, hitAt); break; }
        case 'arc': { ev.r = p.radius; ev.arc = p.angle * Math.PI / 180; ev.t1 = t0 + 0.3; for (const e of D) { const a = Math.abs(Math.atan2(Math.sin(angTo(origin, e) - base), Math.cos(angTo(origin, e) - base))); if (dist(origin, e) <= p.radius + 0.9 && (p.angle >= 360 || a <= ev.arc / 2)) hitAt(e, t0 + 0.15); } break; }
        case 'cone': { ev.r = p.range; ev.arc = p.angle * Math.PI / 180; ev.t1 = t0 + 0.4; for (const e of D) { const a = Math.abs(Math.atan2(Math.sin(angTo(origin, e) - base), Math.cos(angTo(origin, e) - base))); if (dist(origin, e) <= p.range && a <= ev.arc / 2) hitAt(e, t0 + 0.2); } break; }
        case 'line': { ev.to = { x: origin.x + Math.cos(base) * p.range, y: origin.y + Math.sin(base) * p.range }; ev.w = p.width; ev.t1 = t0 + 0.35; for (const e of D) { const s = segDist(e, origin, ev.to); if (s.d <= p.width / 2 + 0.9) hitAt(e, t0 + 0.1 + s.t * 0.15); } break; }
        case 'proj': {
          const fork = getMod(node, 'fork'), pierce = getMod(node, 'pierce');
          const n = fork ? Math.min(fork.copies, 9) : 1;
          ev.copies = [];
          for (let i = 0; i < n; i++) {
            const a = base + (n > 1 ? (i / (n - 1) - 0.5) * fork.spread * Math.PI / 180 : 0);
            const to = { x: origin.x + Math.cos(a) * p.range, y: origin.y + Math.sin(a) * p.range };
            const cand = D.map(e => ({ e, s: segDist(e, origin, to) })).filter(o => o.s.d <= p.size + 1).sort((x, y) => x.s.t - y.s.t);
            const take = cand.slice(0, pierce ? 1 + pierce.count : 1);
            const stop = take.length && !pierce ? take[0].s.t : 1;
            const dur = p.range * stop / p.speed;
            ev.copies.push({ from: { x: origin.x, y: origin.y }, to: { x: origin.x + (to.x - origin.x) * stop, y: origin.y + (to.y - origin.y) * stop }, t1: t0 + dur });
            for (const o of take) if (!ev.hits.some(h => h.id === o.e.id)) hitAt(o.e, t0 + o.s.t * p.range / p.speed);
            if (!take.length && i === 0 && !fork) ev.copies[0].to = to;
          }
          ev.t1 = Math.max(...ev.copies.map(c => c.t1), t0 + 0.2);
          extras(node, ev, hitAt);
          break;
        }
        case 'circle': {
          const c = p.center === 'caster' ? origin : p.center === 'cursor' ? cur : { x: aimAt.x, y: aimAt.y };
          ev.at = { x: c.x, y: c.y }; ev.r = p.radius; ev.t1 = t0 + 0.4; for (const e of D) if (dist(e, c) <= p.radius) hitAt(e, t0 + 0.2); break;
        }
        case 'zone': case 'trap': case 'wall': case 'aura': {
          const dur = sq(ev.kind === 'trap' ? (p.arm || 0) + 1.2 : p.duration);
          ev.at = ev.kind === 'aura' ? { x: origin.x, y: origin.y } : { x: cur.x, y: cur.y };
          ev.r = p.radius || 0; ev.len = p.length || 0; ev.t1 = t0 + dur + 0.2;
          for (const e of D) {
            const inside = ev.kind === 'wall' ? Math.abs(e.x - ev.at.x) < 1.2 && Math.abs(e.y - ev.at.y) < ev.len / 2 + 1 : dist(e, ev.at) <= ev.r + 0.5;
            if (inside) hitAt(e, t0 + dur * 0.5);
          }
          if (ev.kind === 'wall') for (const e of D) if (Math.abs(e.x - ev.at.x) < 2.5) { if (!ev.hits.some(h => h.id === e.id)) hitAt(e, t0 + dur * 0.4); }
          break;
        }
        case 'rain': {
          const rng = F.rngFromSeed('rain' + node.id); ev.at = { x: cur.x, y: cur.y }; ev.r = p.radius; ev.drops = [];
          const dur = sq(p.duration), n = Math.min(p.count, 30);
          for (let i = 0; i < n; i++) { const a = rng() * 6.283, rr = Math.sqrt(rng()) * p.radius; const dr = { x: cur.x + Math.cos(a) * rr, y: cur.y + Math.sin(a) * rr, t: t0 + i / n * dur, r: p.hitRadius }; ev.drops.push(dr); for (const e of D) if (dist(e, dr) <= p.hitRadius + 0.4 && !ev.hits.some(h => h.id === e.id)) hitAt(e, dr.t + 0.15); }
          ev.t1 = t0 + dur + 0.4; break;
        }
        case 'summon': {
          ev.at = { x: origin.x + 1.5, y: origin.y + 1.5 }; ev.count = Math.min(p.count, 8); ev.t1 = t0 + sq(p.duration);
          for (const e of D.slice(0, Math.min(D.length, p.count + 1))) hitAt(e, t0 + 0.8);
          break;
        }
      }
      events.push(ev);
      let end = ev.t1;
      // тригери: нові доставки з точки першого влучання
      for (const tr of node.c) {
        if (F.def(tr.t).cat !== 'trigger') continue;
        const at = ev.hits.length ? { x: D[ev.hits[0].id].x, y: D[ev.hits[0].id].y } : (ev.at || ev.to || origin);
        const tt = tr.t === 'on_expire' ? ev.t1 : tr.t === 'after_delay' ? ev.t1 + tr.p.seconds * 0.5 : ev.hits.length ? ev.hits[0].t + 0.1 : ev.t1;
        for (const ch of tr.c) if (F.def(ch.t).cat === 'delivery') end = Math.max(end, deliver(ch, tr.t === 'on_expire' && ev.at ? ev.at : at, tt, depth + 1));
      }
      return end;
    }
    let end = 0;
    for (const b of skill.root) if (F.def(b.t).cat === 'delivery') end = Math.max(end, deliver(b, CASTER, 0.2, 1));
    return { events, end: end + 0.6, dummies: D, cursor: cur, caster: CASTER, element: skill.element };
  }

  /* ---------- малювання ---------- */
  function create(canvas) {
    const ctx = canvas.getContext('2d');
    let tl = buildTimeline(F.newSkill()), t = 0, playing = false, raf = 0, last = 0, dpr = 1, W = 0, H = 0;
    const view = { x0: -3, x1: 22, y0: -9, y1: 9 };
    function resize() {
      dpr = window.devicePixelRatio || 1; const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); draw();
    }
    const sc = () => Math.min(W / (view.x1 - view.x0), H / (view.y1 - view.y0));
    const X = x => (x - view.x0) * sc() + (W - sc() * (view.x1 - view.x0)) / 2;
    const Y = y => (y - view.y0) * sc() + (H - sc() * (view.y1 - view.y0)) / 2;
    const R = r => r * sc();
    const col = () => COLORS[tl.element] || '#fff';
    function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
    function draw() {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
      for (let x = Math.ceil(view.x0); x <= view.x1; x += 2) { ctx.beginPath(); ctx.moveTo(X(x), 0); ctx.lineTo(X(x), H); ctx.stroke(); }
      for (let y = Math.ceil(view.y0); y <= view.y1; y += 2) { ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(W, Y(y)); ctx.stroke(); }
      const c = col();
      // манекени
      const flash = {};
      for (const ev of tl.events) for (const h of ev.hits) if (t >= h.t && t < h.t + 0.45) flash[h.id] = Math.max(flash[h.id] || 0, 1 - (t - h.t) / 0.45);
      for (const e of tl.dummies) {
        const f = flash[e.id] || 0, sh = f ? (Math.sin(t * 60) * 2.5 * f) : 0;
        ctx.fillStyle = f ? rgba(c, 0.35 + 0.65 * f) : '#3a3a46'; ctx.strokeStyle = f ? c : '#6f6b63'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(X(e.x) + sh, Y(e.y), R(0.7), 0, 7); ctx.fill(); ctx.stroke();
      }
      // гравець
      ctx.fillStyle = '#e8d29e'; ctx.beginPath(); ctx.arc(X(0), Y(0), R(0.8), 0, 7); ctx.fill();
      ctx.strokeStyle = '#8c7240'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1.6), Y(0)); ctx.stroke();
      // події
      for (const ev of tl.events) {
        if (t < ev.t0) continue;
        const life = Math.max(0.0001, ev.t1 - ev.t0), k = Math.min(1, (t - ev.t0) / life), fade = t > ev.t1 ? Math.max(0, 1 - (t - ev.t1) / 0.4) : 1;
        if (fade <= 0) continue;
        ctx.fillStyle = rgba(c, 0.22 * fade); ctx.strokeStyle = rgba(c, 0.9 * fade); ctx.lineWidth = 2;
        switch (ev.kind) {
          case 'single': ctx.beginPath(); ctx.moveTo(X(ev.from.x), Y(ev.from.y)); ctx.lineTo(X(ev.from.x + (ev.to.x - ev.from.x) * Math.min(1, k * 2)), Y(ev.from.y + (ev.to.y - ev.from.y) * Math.min(1, k * 2))); ctx.stroke(); break;
          case 'arc': case 'cone': ctx.beginPath(); ctx.moveTo(X(ev.from.x), Y(ev.from.y)); ctx.arc(X(ev.from.x), Y(ev.from.y), R(ev.r * Math.min(1, k * 1.6)), ev.angle - ev.arc / 2, ev.angle + ev.arc / 2); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
          case 'line': ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, R(ev.w)); ctx.strokeStyle = rgba(c, 0.5 * fade); ctx.beginPath(); ctx.moveTo(X(ev.from.x), Y(ev.from.y)); ctx.lineTo(X(ev.from.x + (ev.to.x - ev.from.x) * Math.min(1, k * 3)), Y(ev.from.y + (ev.to.y - ev.from.y) * Math.min(1, k * 3))); ctx.stroke(); ctx.lineCap = 'butt'; break;
          case 'proj': for (const cp of ev.copies) { const kk = Math.min(1, Math.max(0, (t - ev.t0) / Math.max(0.0001, cp.t1 - ev.t0))); const px = cp.from.x + (cp.to.x - cp.from.x) * kk, py = cp.from.y + (cp.to.y - cp.from.y) * kk; ctx.fillStyle = rgba(c, fade); ctx.beginPath(); ctx.arc(X(px), Y(py), R(0.45), 0, 7); ctx.fill(); ctx.strokeStyle = rgba(c, 0.3 * fade); ctx.beginPath(); ctx.moveTo(X(cp.from.x), Y(cp.from.y)); ctx.lineTo(X(px), Y(py)); ctx.stroke(); }
            break;
          case 'circle': ctx.beginPath(); ctx.arc(X(ev.at.x), Y(ev.at.y), R(ev.r * Math.min(1, k * 1.8)), 0, 7); ctx.fill(); ctx.stroke(); break;
          case 'zone': case 'aura': ctx.beginPath(); ctx.arc(X(ev.at.x), Y(ev.at.y), R(ev.r), 0, 7); ctx.fill(); ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]); break;
          case 'trap': ctx.beginPath(); ctx.arc(X(ev.at.x), Y(ev.at.y), R(ev.r), 0, 7); ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); if (k > 0.55) { ctx.fill(); } break;
          case 'wall': ctx.lineWidth = Math.max(4, R(0.9)); ctx.strokeStyle = rgba(c, 0.6 * fade); ctx.beginPath(); ctx.moveTo(X(ev.at.x), Y(ev.at.y - ev.len / 2)); ctx.lineTo(X(ev.at.x), Y(ev.at.y + ev.len / 2)); ctx.stroke(); break;
          case 'rain': ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.arc(X(ev.at.x), Y(ev.at.y), R(ev.r), 0, 7); ctx.stroke(); ctx.setLineDash([]);
            for (const d of ev.drops) if (t >= d.t) { const kk = Math.min(1, (t - d.t) / 0.4); ctx.fillStyle = rgba(c, (1 - kk) * 0.5); ctx.strokeStyle = rgba(c, 1 - kk); ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), R(d.r * (0.4 + 0.6 * kk)), 0, 7); ctx.fill(); ctx.stroke(); } break;
          case 'summon': for (let i = 0; i < ev.count; i++) { const a = t * 2 + i * 6.283 / ev.count; ctx.fillStyle = rgba(c, 0.85 * fade); ctx.beginPath(); ctx.arc(X(ev.at.x + Math.cos(a) * 1.2), Y(ev.at.y + Math.sin(a) * 1.2), R(0.4), 0, 7); ctx.fill(); } break;
        }
        if (ev.ring && t >= ev.ring.t) { const kk = Math.min(1, (t - ev.ring.t) / 0.4); ctx.strokeStyle = rgba(c, (1 - kk) * 0.9); ctx.fillStyle = rgba(c, (1 - kk) * 0.25); ctx.beginPath(); ctx.arc(X(ev.ring.at.x), Y(ev.ring.at.y), R(ev.ring.r * kk), 0, 7); ctx.fill(); ctx.stroke(); }
        for (const l of ev.links || []) if (t >= l.t) { ctx.strokeStyle = rgba(c, Math.max(0, 1 - (t - l.t) / 0.5)); ctx.beginPath(); ctx.moveTo(X(l.a.x), Y(l.a.y)); ctx.lineTo(X(l.b.x), Y(l.b.y)); ctx.stroke(); }
      }
    }
    function frame(ts) {
      if (!playing) return;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts; t += dt;
      if (t > tl.end + 0.8) { t = 0; }
      draw(); raf = requestAnimationFrame(frame);
    }
    return {
      resize,
      set(skill) { tl = buildTimeline(skill); draw(); },
      play(skill) { if (skill) tl = buildTimeline(skill); t = 0; if (!playing) { playing = true; last = performance.now(); raf = requestAnimationFrame(frame); } },
      stop() { playing = false; cancelAnimationFrame(raf); },
      once(skill) { tl = buildTimeline(skill); t = 0; this.stop(); playing = true; last = performance.now(); const self = this; const f = ts => { if (!playing) return; const dt = Math.min(0.05, (ts - last) / 1000); last = ts; t += dt; draw(); if (t > tl.end) { playing = false; t = tl.end; draw(); return; } raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); },
      get playing() { return playing; },
    };
  }
  return { buildTimeline, create, DUMMIES };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ForgePreview;
