/* Colonist Foundry: карта поселення. Колоністи ходять між власним домом, їдальнею, баром, лікарнею й місцями роботи.
   Нічого не вигадує: бере ті самі дії (sim.acts), що й «Розклад», тож карта лише показує вже відтворену симуляцію. Глобал CFMap. */
const CFMap = (() => {
  const U = CFUI, NS = 'http://www.w3.org/2000/svg', W = 900, H = 560, ROAD = 280;
  let X = null, M = null;
  const init = x => { X = x; };
  const svg = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };

  const GROUND = { temperate: ['#1d3524', ['🌳', '🌲', '🌼']], desert: ['#4a3d22', ['🌵', '🪨', '🌵']], jungle: ['#17382b', ['🌴', '🌿', '🌴']], tundra: ['#30404f', ['❄️', '🌲', '🪨']], mountain: ['#38383f', ['⛰️', '🪨', '🌲']], swamp: ['#26322a', ['🪵', '🌾', '🌿']] };
  const TOP = [['canteen', '🍲', 'Їдальня', '#3a3040'], ['bar', '🍻', 'Бар', '#40302f'], ['clinic', '🏥', 'Лікарня', '#2f3a40'], ['shop', '🔨', 'Майстерня', '#3a3630'], ['school', '📚', 'Школа', '#303a46']];
  const BOT = [['field', '🌾', 'Поле', '#3c5a2a'], ['forest', '🌲', 'Ліс', '#244a2c'], ['mine', '⛏️', 'Копальня', '#3a3a44'], ['site', '🏗️', 'Будмайданчик', '#4a4030'], ['post', '🛡️', 'Застава', '#33384a']];
  // яка робота де відбувається
  const JOB_LOC = { build: 'site', farm: 'field', mine: 'mine', craft: 'shop', cook: 'canteen', heal: 'clinic', guard: 'post', research: 'school', hunt: 'forest', lumber: 'forest', tailor: 'shop', brew: 'bar', trade: 'plaza', teach: 'school', scout: 'post', herb: 'forest' };

  /* ---------- де колоніст зараз ---------- */
  function where(sim, i) {
    const idx = sim.hour - 1 - sim.actsFrom, a = idx >= 0 ? sim.acts[i][idx] : null, t = sim.hour - 1, h = ((t % 24) + 24) % 24;
    if (!a) return 'home';
    const k = U.actKey(a);
    if (k === 'робота') return JOB_LOC[a.slice(7)] || 'plaza';
    if (k === 'їжа') return 'canteen';
    if (k === 'розвага') return 'bar';
    if (k === 'розмова') return 'plaza';
    if (k === 'хворіє') return 'clinic';
    if (k === 'зрив') return 'street';
    if (k === 'відпочинок' && h >= 17 && h < 22 && (i + Math.floor(t / 24)) % 3 === 0) return 'street'; // вечірня прогулянка
    return 'home';
  }

  /* ---------- побудова карти ---------- */
  function make(colony, sim, key) {
    const cs = colony.colonists, n = cs.length, pl = sim.place, [ground, decor] = GROUND[pl.biome] || GROUND.temperate, locs = {}, rects = [];
    const bw = 140, gap = 30, x0 = (W - (5 * bw + 4 * gap)) / 2, gaps = [x0 - gap / 2];
    TOP.forEach(([id, ic, name, col], k) => { const x = x0 + k * (bw + gap); locs[id] = { id, ic, name, col, kind: 'top', x, y: 100, w: bw, h: 90, cx: x + bw / 2 }; gaps.push(x + bw + gap / 2); });
    BOT.forEach(([id, ic, name, col], k) => { const x = x0 + k * (bw + gap); locs[id] = { id, ic, name, col, kind: 'bottom', x, y: 350, w: bw, h: 100, cx: x + bw / 2 }; });
    locs.plaza = { id: 'plaza', kind: 'road', cx: W / 2, name: 'Площа' };
    locs.street = { id: 'street', kind: 'road', name: 'Вулиця' };
    const topN = Math.ceil(n / 2), rows = [[0, topN, 'home-top', 24], [topN, n, 'home-bot', 492]];
    for (const [a, b, kind, y] of rows) {
      const cnt = b - a, step = Math.min(66, (W - 60) / Math.max(1, cnt)), sx = (W - (cnt - 1) * step) / 2;
      for (let i = a; i < b; i++) { const cx = sx + (i - a) * step; locs['home' + i] = { id: 'home' + i, kind, x: cx - 29, y, w: 58, h: 44, cx, bed: { x: cx + 2, y: y + 27 } }; }
    }
    const R = ColonistCore.rngFromSeed('map:' + key), root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Карта поселення', style: 'width:100%;height:auto;display:block;border-radius:10px;background:' + ground });
    // (1) місцевість: прикраси там, де вільно
    const busy = Object.values(locs).filter(l => l.w).map(l => [l.x - 10, l.y - 10, l.x + l.w + 10, l.y + l.h + 10]);
    const dec = svg('g', { 'font-size': 17, opacity: .7, 'text-anchor': 'middle' });
    for (let k = 0, put = 0; k < 120 && put < 42; k++) {
      const x = R() * W, y = R() * H; if (Math.abs(y - ROAD) < 30 || y < 20 || y > H - 12 || busy.some(r => x > r[0] && x < r[2] && y > r[1] && y < r[3])) continue;
      dec.append(svg('text', { x, y }, decor[Math.floor(R() * decor.length)])); put++;
    }
    root.append(dec);
    // (2) дорога
    root.append(svg('rect', { x: 0, y: ROAD - 18, width: W, height: 36, fill: pl.kind === 'city' ? '#5c5968' : '#4a4755' }), svg('line', { x1: 0, y1: ROAD, x2: W, y2: ROAD, stroke: '#7a768a', 'stroke-width': 1.5, 'stroke-dasharray': '10 10' }));
    root.append(svg('circle', { cx: W / 2, cy: ROAD, r: 36, fill: '#3a3844', stroke: '#8a86a0', 'stroke-width': 1.5 }), svg('text', { x: W / 2, y: ROAD - 42, 'text-anchor': 'middle', 'font-size': 10, fill: '#c9c5d3' }, (pl.kind === 'city' ? '⛲ ' : '') + 'Площа'));
    // (3) будівлі та дома (без дахів: видно все, що всередині)
    for (const l of Object.values(locs)) {
      if (!l.col) continue;
      root.append(svg('rect', { x: l.x, y: l.y, width: l.w, height: l.h, rx: 6, fill: l.col, stroke: '#6b6780', 'stroke-width': 1.5 }), svg('text', { x: l.x + 8, y: l.y + 17, 'font-size': 12, fill: '#d8d4e2' }, `${l.ic} ${l.name}`));
    }
    cs.forEach((c, i) => {
      const l = locs['home' + i];
      root.append(svg('rect', { x: l.x, y: l.y, width: l.w, height: l.h, rx: 4, fill: '#2a2735', stroke: '#6b6780', 'stroke-width': 1.5 }),
        svg('rect', { x: l.cx - 12, y: l.y + 18, width: 26, height: 18, rx: 3, fill: '#4a5aa8' }), svg('rect', { x: l.cx - 12, y: l.y + 18, width: 8, height: 18, rx: 3, fill: '#d8d4e2' }),
        svg('text', { x: l.cx, y: l.y + 12, 'text-anchor': 'middle', 'font-size': 9, fill: '#a09cab' }, c.name.length > 9 ? c.name.slice(0, 8) + '…' : c.name));
    });
    if (pl.kind === 'outpost') root.append(svg('rect', { x: 5, y: 5, width: W - 10, height: H - 10, fill: 'none', stroke: '#8b6b3e', 'stroke-width': 3, 'stroke-dasharray': '7 4' }));
    // (4) ніч, потім люди
    const night = svg('rect', { x: 0, y: 0, width: W, height: H, fill: '#050818', opacity: 0, 'pointer-events': 'none' }); root.append(night);
    const walkers = cs.map((c, i) => {
      const g = svg('g', { style: 'cursor:pointer' }), ev = svg('circle', { r: 14, fill: 'none', stroke: '#ff9f5a', 'stroke-width': 2, 'stroke-dasharray': '3 3', visibility: 'hidden' }), sel = svg('circle', { r: 15, fill: 'none', stroke: '#ffd479', 'stroke-width': 2.5, visibility: 'hidden' }),
        dot = svg('circle', { r: 9, fill: '#1c1a22', 'stroke-width': 2.5 }), ic = svg('text', { y: -14, 'text-anchor': 'middle', 'font-size': 11 }), nm = svg('text', { y: 23, 'text-anchor': 'middle', 'font-size': 9, fill: '#e6e2ee', stroke: '#101014', 'stroke-width': 2.5, 'paint-order': 'stroke' }, c.name), tt = svg('title');
      g.append(ev, sel, dot, svg('text', { y: 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#f0eee9' }, c.name[0]), ic, nm, tt); g.onclick = () => X.select(i); root.append(g);
      return { g, ev, sel, dot, ic, nm, tt, x: 0, y: 0, route: [], loc: null };
    });
    return { key, root, locs, gaps, night, walkers, hour: 0, raf: 0, t: 0 };
  }

  /* ---------- маршрути: з будівлі на дорогу, вздовж дороги, у потрібну будівлю ---------- */
  const nearest = (arr, x) => arr.reduce((b, g) => (Math.abs(g - x) < Math.abs(b - x) ? g : b), arr[0]);
  function out(L, slot) { // точки від місця всередині до дороги
    if (L.kind === 'top') return [{ x: L.cx, y: L.y + L.h + 4 }, { x: L.cx, y: ROAD }];
    if (L.kind === 'bottom') return [{ x: L.cx, y: L.y - 4 }, { x: L.cx, y: ROAD }];
    if (L.kind === 'home-top') { const g = nearest(M.gaps, L.cx); return [{ x: L.cx, y: L.y + L.h + 6 }, { x: L.cx, y: 84 }, { x: g, y: 84 }, { x: g, y: ROAD }]; }
    if (L.kind === 'home-bot') { const g = nearest(M.gaps, L.cx); return [{ x: L.cx, y: L.y - 6 }, { x: L.cx, y: 476 }, { x: g, y: 476 }, { x: g, y: ROAD }]; }
    return [{ x: slot.x, y: ROAD }];
  }
  function slotOf(L, i, k, m) {
    if (L.bed) return L.bed;
    if (L.id === 'street') return { x: 60 + (i * 131) % 780, y: ROAD + ((i % 3) - 1) * 11 };
    const s = m > 10 ? 10 : 13, a = k * 2.4, r = s * Math.sqrt(k), cy = L.kind === 'road' ? ROAD : L.y + L.h / 2 + 8;
    let x = L.cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    if (L.kind === 'top' || L.kind === 'bottom') { x = Math.min(L.x + L.w - 10, Math.max(L.x + 10, x)); y = Math.min(L.y + L.h - 10, Math.max(L.y + 26, y)); }
    return { x, y };
  }

  /* ---------- оновлення за станом симуляції ---------- */
  function update(colony, sim) {
    const cs = colony.colonists, n = cs.length, pl = sim.place, key = [colony.seed, n, pl.biome, pl.kind, cs.map(c => c.name).join('|')].join('~');
    const fresh = !M || M.key !== key; if (fresh) M = make(colony, sim, key);
    const snap = fresh || sim.hour < M.hour || sim.hour - M.hour > 30, groups = {}, at = cs.map((_, i) => { const w = where(sim, i), id = w === 'home' ? 'home' + i : w; (groups[id] = groups[id] || []).push(i); return id; });
    const recent = new Set(); for (let k = sim.log.length - 1; k >= 0 && sim.log[k].t >= sim.hour - 2; k--) sim.log[k].who.forEach(q => recent.add(q));
    cs.forEach((c, i) => {
      const id = at[i], L = M.locs[id], g = groups[id], tgt = slotOf(L, i, g.indexOf(i), g.length), w = M.walkers[i], prev = w.loc;
      if (snap || prev == null) { w.x = tgt.x; w.y = tgt.y; w.route = []; }
      else if (prev !== id) {
        const back = out(L, tgt).reverse();
        w.route = w.route.length ? [...back, tgt] : [...out(M.locs[prev], { x: w.x, y: w.y }), ...back, tgt]; // посеред дороги просто довертаємо на новий шлях
      } else if (w.route.length) w.route[w.route.length - 1] = tgt;
      else if (Math.hypot(tgt.x - w.x, tgt.y - w.y) > 1) w.route = [tgt];
      w.loc = id;
      const a = sim.hour > 0 ? sim.acts[i][sim.hour - 1 - sim.actsFrom] : null, m = ColonySim.moodOf(sim, i), ill = sim.ill[i];
      w.dot.setAttribute('stroke', U.moodColor(m)); w.ic.textContent = a ? U.actIcon(a) : '💤'; w.nm.setAttribute('visibility', g.length <= 5 || i === X.st.sel ? 'visible' : 'hidden');
      w.sel.setAttribute('visibility', i === X.st.sel ? 'visible' : 'hidden'); w.ev.setAttribute('visibility', recent.has(i) ? 'visible' : 'hidden');
      w.tt.textContent = `${c.name}: ${a ? U.actLabel(a) : 'ще не рушив час'}${ill ? ', ' + ColonyWorld.ILLNESS[ill.id].name.toLowerCase() : ''}\nНастрій ${m}`;
      place(w);
    });
    const h = sim.hour % 24; M.night.setAttribute('opacity', h >= 22 || h < 5 ? .45 : h < 7 ? .25 : h >= 20 ? .22 : h >= 18 ? .08 : 0);
    M.hour = sim.hour; if (!M.raf) M.raf = requestAnimationFrame(frame);
  }
  const place = w => w.g.setAttribute('transform', `translate(${w.x.toFixed(1)},${w.y.toFixed(1)})`);
  function frame(now) {
    if (!M || !M.root.isConnected) { if (M) M.raf = 0; return; }
    const dt = Math.min(.1, (now - (M.t || now)) / 1000), sp = 460 * Math.max(1, ((X.st && X.st.speed) || 12) / 12); M.t = now;
    for (const w of M.walkers) {
      if (!w.route.length) continue;
      let step = sp * dt;
      while (step > 0 && w.route.length) {
        const p = w.route[0], dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy);
        if (d <= step) { w.x = p.x; w.y = p.y; step -= d; w.route.shift(); } else { w.x += dx / d * step; w.y += dy / d * step; step = 0; }
      }
      place(w);
    }
    M.raf = requestAnimationFrame(frame);
  }

  function pane() {
    const { el } = X, sim = X.getSim(), colony = X.getColony(); update(colony, sim);
    const feed = sim.log.slice(-6).reverse(), cs = colony.colonists;
    return el('div', { class: 'pane' },
      el('p', { class: 'hint' }, 'Показано, де кожен був останню годину: дії ті самі, що в «Розкладі». Клік по точці відкриває колоніста. Золоте коло: обраний, оранжеве: щойно була подія. Щоб стежити спокійно, оберіть швидкість «1 год/с».'),
      el('div', { class: 'mapwrap' }, M.root),
      feed.length ? el('ul', { class: 'log mapfeed' }, feed.map(e => el('li', { class: e.kind, title: e.detail || e.text, onclick: () => { if (e.who.length) X.select(e.who[0]); } }, el('time', {}, `${e.day}д ${U.pad(e.h)}:00`), el('span', {}, e.text)))) : null);
  }
  return { init, pane };
})();
