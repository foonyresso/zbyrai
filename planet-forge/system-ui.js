// Planet Forge: інтерфейс зоряної системи (панель, вибір планети мишею, збереження). Малює planet-system-view.js, дані дає planet-system.js, стан планети лежить в app.js (PFApp).
(() => {
  'use strict';
  const $ = id => document.getElementById(id), PS = PlanetSystem, PSV = PlanetSystemView;
  window.PFSystemInit = () => {
    const A = window.PFApp, cv = $('cv'), store = { get(k, d) { try { const v = localStorage.getItem('pf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('pf_' + k, JSON.stringify(v)); } catch {} } };
    const saved = store.get('sys1', null);
    let sys = saved && PS.clampSystem(saved.sys), cur = sys ? Math.min(saved.cur | 0, sys.planets.length - 1) : -1, scale = saved && saved.scale === 'real' ? 'real' : 'compact', zoom = 1, on = !!(sys && saved.on), t = 0, hits = [], hover = -1;
    const persist = () => store.set('sys1', { sys, cur, scale, on });
    const syncBack = () => { if (sys && cur >= 0) sys.planets[cur].params = Object.assign(A.strip(), { name: A.state().name || sys.planets[cur].params.name }); };
    const place = () => { // поточну планету ставимо в систему на третю орбіту (або ближчу)
      const slot = Math.min(2, sys.planets.length - 1); sys.planets[slot].params = A.strip(); cur = slot;
    };
    const make = (seed, star, count, keepCur) => { sys = PS.generate(seed, { star, count }); if (keepCur) place(); else cur = -1; };
    const btnT = $('btnSysToggle');
    function render() {
      btnT.textContent = on ? 'Показати планету' : 'Показати систему';
      $('btnNew').title = on ? 'Нова система: нова зоря й планети (зоря зберігається, якщо вона вже обрана)' : $('btnNew').title; // підказки в режимі системи
      document.querySelectorAll('#starTypes button').forEach(b => b.classList.toggle('on', sys && b.dataset.star === sys.star));
      document.querySelectorAll('#sysScale button').forEach(b => b.classList.toggle('on', b.dataset.scale === scale));
      if (sys) { $('rCount').value = sys.planets.length; $('oCount').textContent = sys.planets.length; }
      $('btnToSys').hidden = on; document.querySelectorAll('.vp-bar > :not(#btnToSys)').forEach(e => e.style.display = on ? 'none' : '');
      const L = $('sysList'); L.replaceChildren();
      if (sys) sys.planets.forEach((p, i) => { const inf = PS.info(sys, i), b = document.createElement('button'); b.type = 'button'; b.className = 'sysrow' + (i === cur ? ' on' : ''); b.title = 'Відкрити планету «' + p.params.name + '»'; b.innerHTML = ''; const n = document.createElement('b'); n.textContent = p.params.name; const k = document.createElement('span'); k.textContent = PlanetCore.KINDS[p.params.kind].name + ' · ' + p.au + ' а.о. · ' + (inf.temp > 0 ? '+' : '') + inf.temp + ' °C' + (inf.inZone ? ' · зона життя' : ''); b.append(n, k); b.onclick = () => openPlanet(i); L.append(b); });
    }
    function ensure() { if (!sys) { make(A.state().seed, null, 0, true); } }
    function enter() { ensure(); if (cur >= 0) syncBack(); on = true; persist(); render(); A.draw(); }
    function openPlanet(i) { syncBack(); cur = i; on = false; zoom = 1; A.openPlanet(sys.planets[i].params); persist(); render(); }
    function leave() { syncBack(); on = false; persist(); render(); A.refresh(); }
    btnT.onclick = () => (on ? leave() : enter()); $('btnToSys').onclick = enter;
    for (const id of PS.STAR_ORDER) { const b = document.createElement('button'); b.type = 'button'; b.dataset.star = id; b.textContent = PS.STARS[id].name; b.title = PS.STARS[id].tip + (PS.STARS[id].real ? '' : ' (вигадана)'); b.onclick = () => { ensure(); syncBack(); make(sys.seed, id, sys.planets.length, true); persist(); render(); A.draw(); }; $('starTypes').append(b); }
    $('rCount').oninput = e => { ensure(); syncBack(); make(sys.seed, sys.star, +e.target.value, true); persist(); render(); A.draw(); };
    document.querySelectorAll('#sysScale button').forEach(b => b.onclick = () => { scale = b.dataset.scale; zoom = 1; persist(); render(); A.draw(); });
    const fresh = full => { ensure(); const seed = Math.random().toString(36).slice(2, 8).padEnd(6, '0'); syncBack(); make(seed, full ? undefined : sys.star, undefined, false); cur = -1; persist(); render(); A.draw(); };
    $('btnSysNew').onclick = () => fresh(true);
    /* мишею: наведення й клік по планеті, колесо змінює масштаб у вигляді «справжніх відстаней» */
    const pick = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = -1, bd = 1e9; for (const h of hits) { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r && d < bd) { bd = d; best = h.i; } } return best; };
    cv.addEventListener('pointermove', e => { if (!on) return; const h = pick(e); if (h !== hover) { hover = h; cv.style.cursor = h >= 0 ? 'pointer' : ''; } });
    cv.addEventListener('click', e => { if (!on) return; const i = pick(e); if (i >= 0) openPlanet(i); });
    cv.addEventListener('wheel', e => { if (!on || scale !== 'real') return; e.preventDefault(); zoom = Math.min(12, Math.max(.4, zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); A.draw(); }, { passive: false });
    A.attach({
      active: () => on && !!sys, tick: dt => { t += dt; },
      draw: (ctx, w, h, dpr) => { hits = PSV.draw(ctx, w, h, sys, { mode: scale, zoom, t, cur, hover, dpr }); },
      reroll: opts => fresh(!opts.keepKind),
      payload: () => { syncBack(); return { tool: 'planet-forge', system: sys }; },
      load: s => { const c = PS.clampSystem(s); if (!c) return false; sys = c; cur = -1; on = true; persist(); render(); A.draw(); return true; },
    });
    render(); if (on) A.draw();
  };
  window.PFSystemInit();
})();
