/* Закладини: застосунок. Стан, цикл часу, події, збереження, перемикання режимів. Логіка гри в zk-game.js і mechanics/. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), Zk = Zak.Game, Sv = Zak.Save, R = Zak.Render, P = Zak.Panels, B = Mech.Building, S = Mech.Settlers, T = Mech.Trade;
  const DAY_MS = 1800;
  let G = Sv.loadLocal() || Zk.newGame(), mode = 'town', speed = 1, acc = 0, last = performance.now(), dirty = true, ui = { tool: 'select', sel: null, hover: null };
  const cv = $('cv'), ctx = cv.getContext('2d');

  const toast = t => { const e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2200); };
  const save = () => Sv.saveLocal(G);
  const side = () => { const keep = { cargo: {}, esc: $('escort') && $('escort').checked }; document.querySelectorAll('[data-cargo]').forEach(i => keep.cargo[i.dataset.cargo] = i.value); const sc = $('side').scrollTop;
    $('side').innerHTML = mode === 'town' ? P.townSide(G, ui) : P.worldSide(G, ui); $('side').scrollTop = sc;
    document.querySelectorAll('[data-cargo]').forEach(i => { if (keep.cargo[i.dataset.cargo]) i.value = keep.cargo[i.dataset.cargo]; }); if ($('escort')) $('escort').checked = !!keep.esc; cargoInfo(); };
  function cargoInfo() {
    const el = $('cargoInfo'); if (!el || !ui.sel || ui.sel.kind !== 'settlement') return;
    const m = G.s.markets[ui.sel.id], cargo = {}; let tot = 0, gold = 0;
    document.querySelectorAll('[data-cargo]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) { cargo[i.dataset.cargo] = v; tot += v; gold += T.quote(m, i.dataset.cargo, v); } });
    el.textContent = tot ? `Вантаж ${tot}/${Zk.CARGO_MAX}. Орієнтовна виручка ≈ ${gold} золота (ціна падає з кожною проданою одиницею).` : `Вкажіть кількість товару (до ${Zk.CARGO_MAX} одиниць). Дорога коштує ${T.CARAVAN_COST} золота.`;
    const path = Mech.WorldLite.routePath(G.world, G.world.start, ui.sel.id); if (path && $('riskVal')) $('riskVal').textContent = Math.round(T.riskOf(G.world, path, $('escort').checked) * 100) + '%';
  }
  function render(frac) {
    cv.style.maxWidth = mode === 'town' ? '720px' : 'none';
    if (mode === 'town') R.drawTown(ctx, G, ui); else R.drawWorld(ctx, G, ui, frac);
    cv.style.cursor = mode === 'town' && ui.tool.startsWith('build') ? 'copy' : ui.tool === 'demolish' && mode === 'town' ? 'not-allowed' : 'pointer';
  }
  function full() {
    $('day').textContent = 'Доба ' + G.s.day; $('resBar').innerHTML = P.resBar(G); side();
    $('log').innerHTML = G.s.log.slice(0, 40).map(l => `<li class="${l.kind}"><em>д.${l.day}</em>${P.esc(l.text)}</li>`).join('');
    $('seed').value = G.s.seed; ['spPause', 'sp1', 'sp2', 'sp4'].forEach(i => $(i).classList.toggle('on', i === ({ 0: 'spPause', 1: 'sp1', 2: 'sp2', 4: 'sp4' })[speed]));
    $('tabTown').classList.toggle('on', mode === 'town'); $('tabWorld').classList.toggle('on', mode === 'world'); dirty = true;
  }
  function setMode(m) { mode = m; ui.sel = null; if (m === 'world') ui.tool = 'select'; full(); }
  function setSpeed(s) { speed = s; full(); }
  function newWorld(seed) { G = Zk.newGame(seed); ui = { tool: 'select', sel: null, hover: null }; save(); full(); }

  // клік по полю
  cv.addEventListener('click', ev => {
    if (mode === 'town') {
      const c = R.cellAt(cv, ev, R.TS, [B.N, B.N]); if (!c) return; const [x, y] = c, t = G.s.town;
      if (ui.tool.startsWith('build:')) { const r = Zk.build(G, ui.tool.slice(6), x, y); if (!r.ok) toast(r.reason); else save(); full(); return; }
      const arr = G.s.settlers.arrivals.findIndex((_, i) => y === B.C + 1 && x === B.C - 1 + i);
      if (arr >= 0 && ui.tool !== 'demolish') { ui.sel = { kind: 'arrival', id: G.s.settlers.arrivals[arr].id }; full(); return; }
      const id = t.occ[y * B.N + x];
      if (ui.tool === 'demolish') { if (id > 0) { const r = Zk.demolish(G, id); if (!r.ok) toast(r.reason); else { ui.sel = null; save(); } full(); } return; }
      ui.sel = id > 0 ? { kind: 'building', id } : null; full();
    } else {
      const c = R.cellAt(cv, ev, R.WS, [G.world.w, G.world.h]); if (!c) return; let best = null, bd = 2.2;
      for (const s of G.world.S) { const d = Math.hypot(s.x - c[0], s.y - c[1]); if (d < bd) { bd = d; best = { kind: 'settlement', id: s.id }; } }
      for (const l of G.world.lairs) { const d = Math.hypot(l.x - c[0], l.y - c[1]); if (d < bd) { bd = d; best = { kind: 'lair', id: l.id }; } }
      ui.sel = best; full();
    }
  });
  cv.addEventListener('mousemove', ev => {
    if (mode === 'town') {
      const c = R.cellAt(cv, ev, R.TS, [B.N, B.N]); ui.hover = c; let info = '';
      if (c) { const t = G.s.town, b = t.occ[c[1] * B.N + c[0]] > 0 ? B.byId(t, t.occ[c[1] * B.N + c[0]]) : null, names = ['Море', 'Узбережжя', 'Рівнина', 'Ліс', 'Пагорби', 'Гори', 'Болото']; info = b ? B.TYPES[b.type].name : (t.roads[c[1] * B.N + c[0]] ? 'Дорога' : names[t.terrain[c[1] * B.N + c[0]]]);
        if (ui.tool.startsWith('build:')) { const r = B.canPlace(t, ui.tool.slice(6), c[0], c[1]); info += r.ok ? ' · можна збудувати (дорога +' + r.path.length + ', разом ' + Object.entries(B.costOf(ui.tool.slice(6), r.path.length)).map(([k, v]) => v + ' ' + (k === 'gold' ? 'золота' : Mech.TradeData.RES[k].name.toLowerCase())).join(', ') + ')' : ' · ' + r.reason; } }
      $('hoverInfo').textContent = info; dirty = true;
    } else {
      const c = R.cellAt(cv, ev, R.WS, [G.world.w, G.world.h]); if (!c) return; const names = ['Море', 'Узбережжя', 'Рівнина', 'Ліс', 'Пагорби', 'Гори', 'Болото'];
      const s = G.world.S.find(q => Math.hypot(q.x - c[0], q.y - c[1]) < 1.6), l = G.world.lairs.find(q => Math.hypot(q.x - c[0], q.y - c[1]) < 1.6);
      $('hoverInfo').textContent = s ? s.name : l ? l.name + ' (небезпека ' + l.danger + ')' : names[G.world.biome[c[1] * G.world.w + c[0]]];
    }
  });
  cv.addEventListener('mouseleave', () => { ui.hover = null; dirty = true; });
  cv.addEventListener('contextmenu', ev => { ev.preventDefault(); ui.tool = 'select'; full(); });

  // кнопки бічної панелі
  $('side').addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el) return; ev.preventDefault();
    const [a, p1, p2] = el.dataset.act.split(':');
    if (a === 'tool') { ui.tool = p1 === 'build' ? 'build:' + p2 : p1; full(); }
    else if (a === 'pick') { ui.sel = { kind: p1 === 'a' ? 'arrival' : 'resident', id: +p2 }; full(); }
    else if (a === 'settle') { const r = Zk.settle(G, +p1, +$('houseSel').value); if (!r.ok) toast(r.reason); else { ui.sel = { kind: 'resident', id: +p1 }; save(); } full(); }
    else if (a === 'reject') { S.reject(G.s.settlers, +p1); ui.sel = null; full(); }
    else if (a === 'demolish') { const r = Zk.demolish(G, +p1); if (!r.ok) toast(r.reason); else { ui.sel = null; save(); } full(); }
    else if (a === 'send') {
      const cargo = {}; document.querySelectorAll('[data-cargo]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) cargo[i.dataset.cargo] = v; });
      const r = Zk.sendCaravan(G, +p1, cargo, $('escort').checked); if (!r.ok) toast(r.reason); else { toast('Караван вирушив'); save(); } full();
    }
  });
  $('side').addEventListener('input', ev => { if (ev.target.dataset.cargo !== undefined || ev.target.id === 'escort') cargoInfo(); });
  $('side').addEventListener('change', ev => {
    if (ev.target.id === 'jobSel') { const c = S.find(G.s.settlers, +ev.target.dataset.id), v = ev.target.value; c.job = v === 'auto' ? 'auto' : v === 'none' ? null : +v; c.work = null; S.assignJobs(G.s.settlers, G.s.town, Zk.need(G)); save(); full(); }
    if (ev.target.id === 'escort') cargoInfo();
  });

  // шапка й панель керування
  $('tabTown').onclick = () => setMode('town'); $('tabWorld').onclick = () => setMode('world');
  $('spPause').onclick = () => setSpeed(0); $('sp1').onclick = () => setSpeed(1); $('sp2').onclick = () => setSpeed(2); $('sp4').onclick = () => setSpeed(4);
  $('btnGen').onclick = () => { if (G.s.day > 3 && !confirm('Створити новий світ? Поточне збереження в браузері буде замінено. Збережіть його у файл, якщо воно потрібне.')) return; newWorld($('seed').value.trim() === G.s.seed ? '' : $('seed').value.trim()); };
  $('btnJson').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Sv.toJSON(G))], { type: 'application/json' })); a.download = 'zakladyny.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  $('btnCopyJson').onclick = () => { const t = JSON.stringify(Sv.toJSON(G)); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('JSON скопійовано'), () => toast('Не вдалося скопіювати: збережіть файлом')); };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { G = Sv.fromJSON(JSON.parse(t)); ui = { tool: 'select', sel: null, hover: null }; save(); full(); toast('Гру завантажено'); } catch (err) { toast('Помилка імпорту: ' + err.message); } }); e.target.value = ''; };
  document.addEventListener('keydown', e => {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k = window.zbKey ? window.zbKey(e) : e.code;
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'town' ? 'world' : 'town'); }
    else if (e.code === 'Space') { e.preventDefault(); setSpeed(speed ? 0 : 1); }
    else if (e.code === 'Escape') { ui.tool = 'select'; ui.sel = null; full(); }
  });
  window.addEventListener('pagehide', save); document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  // цикл: доба = DAY_MS / швидкість
  function frame(now) {
    const dt = Math.min(500, now - last); last = now;
    if (speed) { acc += dt * speed; while (acc >= DAY_MS) { acc -= DAY_MS; Zk.stepDay(G); if (G.s.day % 3 === 0) save(); full(); } if (mode === 'world') dirty = true; }
    if (dirty) { dirty = false; render(speed ? acc / DAY_MS : 0); }
    requestAnimationFrame(frame);
  }
  window.ZakDebug = { get G() { return G; }, full, setMode, setSpeed, step: n => { for (let i = 0; i < n; i++) Zk.stepDay(G); full(); } };
  full(); speed = 0; full(); requestAnimationFrame(frame);
})();
