// Planet Forge: інтерфейс зоряної системи: старт із системи, вибір планети кліком, рандом окремо для системи, зорі й планет, збереження. Малює planet-system-view.js, дані дає planet-system.js, стан планети лежить в app.js (PFApp).
(() => {
  'use strict';
  const $ = id => document.getElementById(id), PS = PlanetSystem, PSV = PlanetSystemView;
  window.PFSystemInit = () => {
    const A = window.PFApp, cv = $('cv'), store = { get(k, d) { try { const v = localStorage.getItem('pf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} } };
    const saved = store.get('sys1', null), newSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
    let sys = saved && PS.clampSystem(saved.sys), cur = sys ? Math.min(saved.cur | 0, sys.planets.length - 1) : -1, on = saved ? saved.on !== false : true, t = 0, hits = [], hover = -1;
    const persist = () => store.set('sys1', { sys, cur, on });
    const syncBack = () => { if (sys && cur >= 0) sys.planets[cur].params = Object.assign(A.strip(), { name: A.state().name || sys.planets[cur].params.name }); };
    const place = () => { const slot = Math.min(2, sys.planets.length - 1); sys.planets[slot].params = A.strip(); cur = slot; }; // поточну планету ставимо на третю орбіту
    const make = (seed, star, count, keepCur) => { sys = PS.generate(seed, { star, count }); if (keepCur) place(); else cur = -1; };
    function ensure() { if (!sys) make(A.state().seed, undefined, undefined, true); }
    function render() {
      document.body.classList.toggle('view-system', on);
      document.querySelectorAll('#starTypes button').forEach(b => b.classList.toggle('on', sys && b.dataset.star === sys.star));
      if (sys) { $('rCount').value = sys.planets.length; $('oCount').textContent = sys.planets.length; }
      $('crumb').textContent = on ? (sys ? 'Система «' + sys.name.replace(' (зоря)', '') + '» · ' + PS.STARS[sys.star].name : '') : (sys ? sys.name.replace(' (зоря)', '') + ' › ' : '') + (A.state().name || '');
      $('btnRndSel').disabled = cur < 0;
      const L = $('sysList'); L.replaceChildren();
      if (sys) sys.planets.forEach((p, i) => { const inf = PS.info(sys, i), b = document.createElement('button'); b.type = 'button'; b.className = 'sysrow' + (i === cur ? ' on' : ''); b.title = 'Відкрити планету «' + p.params.name + '»'; const n = document.createElement('b'); n.textContent = p.params.name; const k = document.createElement('span'); k.textContent = PlanetCore.KINDS[p.params.kind].name + ' · ' + p.au + ' а.о. · ' + (inf.temp > 0 ? '+' : '') + inf.temp + ' °C' + (inf.inZone ? ' · зона життя' : ''); b.append(n, k); b.onclick = () => openPlanet(i); L.append(b); });
    }
    const redraw = () => { persist(); render(); A.draw(); A.refreshInfo(); A.markMode(); };
    function openPlanet(i) { syncBack(); cur = i; on = false; A.deactivateOthers(ctrl); A.openPlanet(sys.planets[i].params); redraw(); A.setPanel('pPlanet'); }
    const show = () => { ensure(); syncBack(); on = true; redraw(); A.setPanel('pSys'); };
    const openSelectedOrRandom = () => { ensure(); openPlanet(cur >= 0 ? cur : Math.floor(Math.random() * sys.planets.length)); };
    $('btnRndSel').onclick = () => { if (cur < 0) return; A.rerollPlanet({ keepKind: true }); syncBack(); redraw(); };
    for (const id of PS.STAR_ORDER) { const b = document.createElement('button'); b.type = 'button'; b.dataset.star = id; b.textContent = PS.STARS[id].name; b.title = PS.STARS[id].tip + (PS.STARS[id].real ? '' : ' (вигадана)'); b.onclick = () => { ensure(); syncBack(); sys = Object.assign({}, sys, { star: id }); redraw(); }; $('starTypes').append(b); }
    $('rCount').oninput = e => { ensure(); syncBack(); make(sys.seed, sys.star, +e.target.value, cur >= 0 && A.state()); redraw(); };
    /* рандом на трьох рівнях: уся система, лише зоря, лише планети (рандом однієї планети: кнопки планети) */
    const rndSystem = () => { ensure(); syncBack(); make(newSeed(), undefined, undefined, false); redraw(); };
    const rndStar = () => { ensure(); syncBack(); sys = PS.randomStar(sys); redraw(); };
    const rndPlanets = () => { ensure(); syncBack(); make(newSeed(), sys.star, sys.planets.length, false); redraw(); };
    $('btnRndSys').onclick = rndSystem; $('btnRndStar').onclick = rndStar; $('btnRndPlanets').onclick = rndPlanets;
    /* мишею: наведення й клік по планеті */
    const pick = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = -1, bd = 1e9; for (const h of hits) { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r && d < bd) { bd = d; best = h.i; } } return best; };
    cv.addEventListener('pointermove', e => { if (!on) return; const h = pick(e); if (h !== hover) { hover = h; cv.style.cursor = h >= 0 ? 'pointer' : ''; } });
    cv.addEventListener('click', e => { if (!on) return; const i = pick(e); if (i >= 0) openPlanet(i); });
    const ctrl = {
      active: () => on && !!sys, tick: dt => { t += dt; },
      draw: (ctx, w, h, dpr) => { syncBack(); hits = PSV.draw(ctx, w, h, sys, { t, cur, hover, dpr }); },
      reroll: rndSystem, isSystem: true, show, openSelectedOrRandom,
      info: () => { const star = PS.STARS[sys.star], z = PS.hz(star), inZ = sys.planets.filter((_, i) => PS.info(sys, i).inZone).length, E = A.el, f = n => String(Math.round(n * 100) / 100);
        return E('div', { class: 'inf' }, E('div', { class: 'inf-head' }, E('b', {}, sys.name.replace(' (зоря)', '')), E('span', {}, star.name)), E('p', { class: 'inf-blurb' }, star.tip + (star.real ? '' : ' (вигадана)') + '.'),
          E('div', { class: 'inf-chips' }, [['Світність', '×' + f(star.lum)], ['Зона життя', f(z.in) + '–' + f(z.out) + ' а.о.'], ['Планет', sys.planets.length], ['У зоні життя', inZ]].map(([l, v]) => E('div', {}, E('b', {}, v), E('span', {}, l)))),
          E('div', { class: 'inf-res' }, 'Планети: ' + sys.planets.map(p => p.params.name).join(', '))); },
      payload: () => { syncBack(); return { tool: 'planet-forge', system: sys }; },
      load: d => { const c = d.system && PS.clampSystem(d.system); if (!c) return false; A.deactivateOthers(ctrl); sys = c; cur = -1; on = true; redraw(); return true; },
      deactivate() { if (on) { on = false; persist(); render(); } },
    };
    A.attach(ctrl);
    if (on) ensure();
    render(); A.draw(); A.refreshInfo(); A.setPanel(on ? 'pSys' : 'pPlanet');
  };
  window.PFSystemInit();
})();
