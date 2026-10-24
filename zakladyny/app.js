/* Закладини: застосунок. Рушій карти Атласу 2.0 (mechanics/atlas-map) + ігрові механіки. Стан, час, події, збереження, меню. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), M = Mech, Zk = Zak.Game, Sv = Zak.Save, P = Zak.Panels, O = Zak.Overlay, B = M.Building, S = M.Settlers, T = M.Trade, AW = M.AtlasWorld;
  const DAY_MS = 1800, VER = '1', stage = $('stage'), cv = $('map'), ov = $('over');
  const layers = {}; document.querySelectorAll('[data-layer]').forEach(e => { layers[e.dataset.layer] = e.checked; });
  let G = null, view = null, speed = 0, acc = 0, last = performance.now(), ui = { tool: 'select', sel: null, hover: null, hoverTile: null, tradeTo: null, hint: '' }, panel = '', busy = false, shownLog = 0, boot = true;
  try { panel = localStorage.getItem('zk.panel') || ''; } catch (e) { panel = ''; }

  const toast = t => { const e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2400); };
  const save = () => { if (G) Sv.saveLocal(G); };

  // ---------- світ: генерація Атласу з прогресом, потім гра
  const load = $('load'), loadBar = $('loadBar'), loadTxt = $('loadTxt');
  const progress = (f, label) => { load.hidden = false; loadBar.style.width = Math.round(f * 100) + '%'; loadTxt.textContent = `${label}… ${Math.round(f * 100)} %`; };
  async function makeWorld(params) { const W = await Atlas2.generateAsync(params, (f, l) => { progress(f * 0.9, l); }); progress(0.95, 'Готую карту'); await new Promise(r => setTimeout(r, 0)); return M.AtlasWorld.wrap(W); }
  async function startGame(params, saved) {
    if (busy) return; busy = true; speed = 0;
    try {
      const world = await makeWorld(params);
      G = saved ? Sv.restore(saved, world) : Zk.newGame(world, params);
      const A = Atlas2; A.world = world.W; if (A.TownMap) A.TownMap.reset(); ui = { tool: 'select', sel: null, hover: null, hoverTile: null, tradeTo: null, hint: '' }; shownLog = G.s.log.length;
      syncTown(); view.fit(); view.reset(); view.redraw(); refresh(); if (!saved) save();
      const h = O.geo(G); setTimeout(() => view.focus(h.cx, h.cy, 420, 1800), 400);
    } catch (e) { console.error(e); toast('Не вдалося створити світ: ' + e.message); } finally { busy = false; load.hidden = true; }
  }

  // місто гравця → формат міста Атласу (малюється тим самим рендером, що й інші міста)
  function syncTown() {
    const A = Atlas2, w = G.world, s = w.S[w.start], t = G.s.town;
    const bs = t.buildings.map(b => ({ id: b.id, type: b.type, x: b.x, y: b.y, name: B.TYPES[b.type].name + (b.type === 'hall' ? '' : ' №' + b.id) }));
    bs.unshift({ id: 0, type: 'plaza', x: B.C - 1, y: B.C - 1, name: 'Площа Закладин' });
    A.Town.setCustom(w.W, s.id, M.AtlasTown.build(w.W, s, { tile: B.TILE, n: B.N, c: B.C, roads: t.roads, core: B.isCoreRoad, buildings: bs, plaza: { x: B.C, y: B.C } }));
  }

  // ---------- відображення
  function drawOver(frac) { if (!G || !view) return; Atlas2.draw.drawHover(ov, G.world.W, view.view, null, null); O.draw(ov, G, ui, view.view, frac == null ? (speed ? acc / DAY_MS : 0) : frac); }
  const keep = () => { const k = {}; document.querySelectorAll('#drawer [data-sell],#drawer [data-buy]').forEach(i => { k[(i.dataset.sell ? 's:' : 'b:') + (i.dataset.sell || i.dataset.buy)] = i.value; }); k.esc = $('escort') && $('escort').checked; k.seed = $('seed') && $('seed').value; return k; };
  const restore = k => { document.querySelectorAll('#drawer [data-sell],#drawer [data-buy]').forEach(i => { const v = k[(i.dataset.sell ? 's:' : 'b:') + (i.dataset.sell || i.dataset.buy)]; if (v) i.value = v; }); if ($('escort')) $('escort').checked = !!k.esc; if ($('seed') && k.seed != null) $('seed').value = k.seed; cargoInfo(); };
  function refreshPanels(force) {
    if (!G) return; const ae = document.activeElement; if (!force && ae && ae.closest && ae.closest('#drawer') && /SELECT|INPUT/.test(ae.tagName)) return;
    const k = keep(); $('pPeople').innerHTML = P.people(G, ui); $('pTrade').innerHTML = P.trade(G, ui); $('pWorld').innerHTML = P.world(G); $('log').innerHTML = P.logHtml(G); restore(k); if (!k.seed) $('seed').value = '';
  }
  function refresh(force) {
    if (!G) return; $('hud').innerHTML = P.hud(G, speed); $('build').innerHTML = P.bar(G, ui); const sc = P.selcard(G, ui); $('selcard').hidden = !sc; $('selcard').innerHTML = sc;
    refreshPanels(force); const n = G.s.settlers.arrivals.length; document.querySelectorAll('#rail .bdg').forEach(e => e.remove()); if (n) { const b = document.querySelector('#rail [data-panel="people"]'); b.insertAdjacentHTML('beforeend', `<span class="bdg" title="Прибульців біля воріт">${n}</span>`); }
    for (const l of G.s.log.slice(0, Math.max(0, G.s.log.length - shownLog) || 0).reverse()) { const d = document.createElement('div'); d.className = l.kind; d.textContent = l.text; $('feed').appendChild(d); setTimeout(() => d.remove(), 9000); } shownLog = G.s.log.length; while ($('feed').children.length > 5) $('feed').firstChild.remove();
    drawOver();
  }
  function cargoInfo() {
    const el = $('cargoInfo'); if (!el || ui.tradeTo == null) return; const m = G.s.markets[ui.tradeTo]; if (!m) return; let sell = 0, gold = 0, buy = 0, cost = 0;
    document.querySelectorAll('#drawer [data-sell]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) { sell += v; gold += T.quote(m, i.dataset.sell, v); } });
    document.querySelectorAll('#drawer [data-buy]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) { buy += v; cost += Math.round(T.price(m, i.dataset.buy) * v); } });
    el.textContent = sell || buy ? `Продаж ${sell}/${Zk.CARGO_MAX}: ≈${gold} золота. Купівля ${buy}: ≈${cost} золота (з виручки). Дорога коштує ${T.CARAVAN_COST}.` : `Вкажіть, що продати й купити (до ${Zk.CARGO_MAX} одиниць). Дорога коштує ${T.CARAVAN_COST} золота.`;
    const path = G.world.routePath(G.world.start, ui.tradeTo); if (path && $('riskVal')) $('riskVal').textContent = Math.round(T.riskOf(G.world, path, $('escort').checked) * 100) + '%';
  }
  // меню й довідка «i»: спільний кіт zb-ui.js
  const showPanel = n => ZB.showPanel(n);
  ZB.onPanel = n => { panel = n; try { localStorage.setItem('zk.seen', '1'); } catch (e) { /* не критично */ } if (n && G) refreshPanels(true); };
  document.querySelectorAll('[data-layer]').forEach(e => e.addEventListener('change', () => { layers[e.dataset.layer] = e.checked; view.redraw(); }));
  const setHint = t => { if (ui.hint !== t) { ui.hint = t; const e = $('barHint'); if (e) e.textContent = t || 'Оберіть будівлю й клікніть на карті біля доріг свого поселення'; } };

  // ---------- дії
  function tileAt(fx, fy) { const [tx, ty] = O.cellToTile(G, fx, fy); return tx >= 0 && ty >= 0 && tx < B.N && ty < B.N ? [tx, ty] : null; }
  function nearest(fx, fy, px) { // поселення Атласу в межах px пікселів
    const W = G.world.W, r = (px * (devicePixelRatio || 1)) / view.view.k; let best = null, bd = r * r; for (const s of W.settlements) { if (s.ruined) continue; const d = (s.x + .5 - fx) ** 2 + (s.y + .5 - fy) ** 2; if (d < bd) { bd = d; best = s; } } return best;
  }
  function nearestSite(fx, fy, px) { const W = G.world.W, r = (px * (devicePixelRatio || 1)) / view.view.k; let best = null, bd = r * r; for (const s of W.sites || []) { const d = (s.x + .5 - fx) ** 2 + (s.y + .5 - fy) ** 2; if (d < bd) { bd = d; best = s; } } return best; }
  function onMove(fx, fy) {
    if (!G) return; const A = Atlas2, W = G.world.W; let ct = null;
    if (A.TownMap) { ct = A.TownMap.at(W, view.view, fx, fy); if (ct && ct.s.id === G.world.start) ct = null; A.TownMap.hover(ct, null); }
    ui.hoverTile = O.townVisible(view.view) ? tileAt(fx, fy) : null;
    if (ui.hoverTile && ui.tool.startsWith('build:')) { const r = B.canPlace(G.s.town, ui.tool.slice(6), ui.hoverTile[0], ui.hoverTile[1]); setHint(r.ok ? 'Можна збудувати: ' + Object.entries(B.costOf(ui.tool.slice(6), r.path.length)).map(([k, v]) => v + ' ' + (k === 'gold' ? 'золота' : M.TradeData.RES[k].name.toLowerCase())).join(', ') + (r.path.length ? ' (нова дорога ' + r.path.length + ' кл.)' : '') : r.reason); }
    else if (ui.tool.startsWith('build:') && !O.townVisible(view.view)) setHint('Наблизьтесь до свого поселення колесом миші, щоб будувати'); else if (ui.tool === 'select' || ui.tool === 'demolish') setHint('');
    // підказка про поселення чи лігво під курсором (без міста Атласу)
    const info = $('info'); let html = '';
    if (!ct) { const s = nearest(fx, fy, 12), site = !s && layers.sites !== false ? nearestSite(fx, fy, 10) : null; const D = A.Danger;
      if (s) html = `<div class="blk"><div class="hd"><span class="lb">${P.RANK[s.rank] || 'Поселення'}</span><h4>${P.esc(s.name)}</h4></div>${s.id === G.world.start ? '<p>Ваше поселення</p>' : G.s.markets[s.id] ? '<p>Торговий партнер: клікніть, щоб торгувати</p>' : '<p class="muted">Далеко: торгових шляхів поки нема</p>'}</div>`;
      else if (site) html = `<div class="blk"><div class="hd"><span class="lb">${D.CATS[site.cat] || 'Місце'}</span><h4>${P.esc(site.name)}</h4></div><p class="muted">Рівень ${site.level}, ${P.esc(D.TIERS[site.tier] || '')}</p>${(site.monsters || []).slice(0, 2).map(m => `<div class="mon"><b>${P.esc(m.name)}</b>${m.count > 1 ? ' × ' + m.count : ''}<small>рівень ${m.level}</small></div>`).join('')}</div>`; }
    info.hidden = !html; info.innerHTML = html; cv.style.cursor = ct || html ? 'pointer' : ''; drawOver();
  }
  function onClick(fx, fy) {
    if (!G) return; const A = Atlas2, W = G.world.W, tool = ui.tool, s = G.s, tile = O.townVisible(view.view) ? tileAt(fx, fy) : null;
    if (tool.startsWith('build:')) {
      if (!tile) { toast('Наблизьтесь до свого поселення колесом миші'); const h = O.geo(G); view.focus(h.cx, h.cy, 420, 900); return; }
      const r = Zk.build(G, tool.slice(6), tile[0], tile[1]); if (!r.ok) toast(r.reason); else { syncTown(); save(); view.redraw(); } refresh(); return;
    }
    if (tool === 'demolish') { if (tile) { const id = s.town.occ[tile[1] * B.N + tile[0]]; if (id > 0) { const r = Zk.demolish(G, id); if (!r.ok) toast(r.reason); else { ui.sel = null; syncTown(); save(); view.redraw(); } refresh(); } } return; }
    const ct = A.TownMap ? A.TownMap.at(W, view.view, fx, fy) : null;
    if (tile) { // клік у власному місті
      const ai = s.settlers.arrivals.findIndex((_, i) => tile[1] === B.C + 1 && tile[0] === B.C - 1 + i);
      if (ai >= 0) { ui.sel = { kind: 'arrival', id: s.settlers.arrivals[ai].id }; showPanel('people'); refresh(true); return; }
      const id = s.town.occ[tile[1] * B.N + tile[0]]; if (id > 0) { ui.sel = { kind: 'building', id }; refresh(true); return; }
    }
    if (ct && ct.s.id !== G.world.start && A.TownMap) { A.TownMap.click(ct); return; }
    const st = nearest(fx, fy, 14);
    if (st) { ui.sel = { kind: 'settlement', id: st.id }; if (G.s.markets[st.id]) { ui.tradeTo = st.id; } else if (st.id === G.world.start && view.view.k < 120) { view.focus(st.x + .5, st.y + .5, 420, 900); } refresh(true); return; }
    const site = layers.sites !== false ? nearestSite(fx, fy, 12) : null; if (site) { const li = G.world.lairs.findIndex(l => l.siteId === site.id); if (li >= 0) { ui.sel = { kind: 'lair', id: li }; refresh(true); return; } }
    ui.sel = null; refresh(true);
  }

  // кнопки: делегування
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el || !G) return; ev.preventDefault(); const [a, p1, p2] = el.dataset.act.split(':');
    if (a === 'tool') { ui.tool = p1 === 'build' ? 'build:' + p2 : p1; ui.hint = ''; if (p1 === 'build' && !O.townVisible(view.view)) { const h = O.geo(G); view.focus(h.cx, h.cy, 420, 900); } refresh(); }
    else if (a === 'speed') { speed = +p1; refresh(); }
    else if (a === 'desel') { ui.sel = null; refresh(true); }
    else if (a === 'pick') { ui.sel = { kind: p1 === 'a' ? 'arrival' : 'resident', id: +p2 }; if (panel !== 'people') showPanel('people'); refresh(true); }
    else if (a === 'settle') { const r = Zk.settle(G, +p1, +$('houseSel').value); if (!r.ok) toast(r.reason); else { ui.sel = { kind: 'resident', id: +p1 }; save(); } refresh(true); }
    else if (a === 'reject') { S.reject(G.s.settlers, +p1); ui.sel = null; refresh(true); }
    else if (a === 'demolish') { const r = Zk.demolish(G, +p1); if (!r.ok) toast(r.reason); else { ui.sel = null; syncTown(); save(); view.redraw(); } refresh(true); }
    else if (a === 'trade') { ui.tradeTo = +p1; showPanel('trade'); refresh(true); }
    else if (a === 'focus') { const s = G.world.S[+p1]; view.focus(s.x + .5, s.y + .5, +p1 === G.world.start ? 420 : 90, 1200); }
    else if (a === 'send') {
      const sell = {}, buy = {}; document.querySelectorAll('#drawer [data-sell]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) sell[i.dataset.sell] = v; }); document.querySelectorAll('#drawer [data-buy]').forEach(i => { const v = Math.max(0, Math.min(+i.max, Math.floor(+i.value || 0))); if (v) buy[i.dataset.buy] = v; });
      const r = Zk.sendCaravan(G, +p1, sell, $('escort').checked, buy); if (!r.ok) toast(r.reason); else { toast('Караван вирушив'); save(); } refresh(true);
    }
    else if (a === 'gen') { const seed = $('seed').value.trim(); if (G.s.day > 3 && !confirm('Створити новий світ? Поточне збереження в браузері буде замінено. Збережіть його у файл, якщо воно потрібне.')) return; startGame(Zk.worldParams(seed)); }
  });
  document.addEventListener('change', ev => {
    const t = ev.target; if (!G) return;
    if (t.id === 'jobSel') { const c = S.find(G.s.settlers, +t.dataset.id), v = t.value; c.job = v === 'auto' ? 'auto' : v === 'none' ? null : +v; c.work = null; S.assignJobs(G.s.settlers, G.s.town, Zk.need(G)); save(); refresh(true); }
    if (t.id === 'tradeSel') { ui.tradeTo = t.value === '' ? null : +t.value; refresh(true); }
    if (t.id === 'escort') cargoInfo();
  });
  document.addEventListener('input', ev => { if (ev.target.dataset && (ev.target.dataset.sell !== undefined || ev.target.dataset.buy !== undefined)) cargoInfo(); });
  document.addEventListener('keydown', e => {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); speed = speed ? 0 : 1; refresh(); } else if (e.code === 'Escape') { ui.tool = 'select'; ui.sel = null; refresh(true); }
  });
  cv.addEventListener('contextmenu', e => { e.preventDefault(); ui.tool = 'select'; refresh(); });

  // ---------- збереження й обмін
  addEventListener('pagehide', save); document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  // ---------- цикл часу: доба = DAY_MS / швидкість; між добами каравани плавно їдуть
  function frame(now) {
    const dt = Math.min(500, now - last); last = now;
    if (G && !busy) {
      if (speed) { acc += dt * speed; let ticked = false; while (acc >= DAY_MS) { acc -= DAY_MS; Zk.stepDay(G); ticked = true; if (G.s.day % 3 === 0) save(); } if (ticked) { refresh(); } else if (G.s.caravans.length || view.view.k < 70) drawOver(); }
      else if (view.view.k < 70) drawOver();
    }
    requestAnimationFrame(frame);
  }

  // ---------- старт: підключаємо рушій Атласу, відновлюємо збереження або створюємо нову гру
  async function init() {
    progress(0.02, 'Підключаю карту');
    try { await M.AtlasFiles.load('../atlas2/', VER); } catch (e) { toast(e.message); return; }
    const A = Atlas2; view = M.AtlasView.create({ stage, cv, ov, layers, getW: () => G && G.world.W, onOver: () => drawOver(), onClick, onMove });
    A.redraw = () => view.redraw(); A.redrawOver = () => drawOver(); A.getView = () => view.view; A.focusCell = (x, y, k) => view.focus(x, y, k, 900);
    ZB.showPanel(ZB.panel); view.fit(); requestAnimationFrame(frame);
    let saved = null; try { saved = Sv.readLocal(); } catch (e) { saved = null; }
    startGame(saved ? saved.params : Zk.worldParams(''), saved);
  }
  window.ZakDebug = { get G() { return G; }, get view() { return view; }, step: n => { for (let i = 0; i < n; i++) Zk.stepDay(G); syncTown(); refresh(true); }, refresh, syncTown, onClick, onMove, setSpeed: v => { speed = v; refresh(); }, ui: () => ui };
  init();
})();
