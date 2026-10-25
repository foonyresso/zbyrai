// Атлас 2.0: інтерфейс демонстрації «Як генерується карта»: кадри світу (A.generateTrace) і міста (A.CityTrace), кроки вперед-назад, автопуск, повзунок, зум і пересування кадру.
(function () {
  'use strict';
  const A = globalThis.Atlas2, $ = id => document.getElementById(id), TX = A.StepsText;
  const ov = $('stepsView'), cv = $('stepsCv'), cap = $('stepsCap'), slide = $('stSlide'), txt = $('stText');
  let mode = 'world', frames = [], idx = 0, view = { k: 1, tx: 0, ty: 0 }, timer = 0, token = 0, cityTrace = null, builtFor = null;
  const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const RANK = ['capital', 'regional', 'town', 'village', 'hamlet'], RN = { capital: 'столиця', regional: 'центр регіону', town: 'місто', village: 'село', hamlet: 'хутір' };
  const ctrl = on => ['stFirst', 'stPrev', 'stPlay', 'stNext', 'stLast', 'stPng'].forEach(i => { $(i).disabled = !on; }); // кнопки керування активні, коли кадри готові
  function fit() { const r = ov.getBoundingClientRect(); cv.width = Math.round(r.width * devicePixelRatio); cv.height = Math.round(r.height * devicePixelRatio); }
  // кадр по центру вільної частини екрана (праворуч від відкритого меню)
  function fitView() {
    if (!frames.length) return; const dr = $('drawer'), x0 = dr && !dr.hidden ? (dr.getBoundingClientRect().right + 8) * devicePixelRatio : 0, aw = Math.max(200, cv.width - x0);
    if (mode === 'world') { const f = frames[0].cv, k = Math.min(aw / f.width, cv.height / f.height) * 0.96; view = { k, tx: x0 + (aw - f.width * k) / 2, ty: (cv.height - f.height * k) / 2 }; }
    else { const R = cityTrace.snaps.roads.R * 1.55, k = Math.min(aw, cv.height) / (2 * R); view = { k, tx: x0 + aw / 2, ty: cv.height / 2 }; }
  }
  function paint() {
    if (!frames.length) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); return; }
    const fr = frames[idx];
    if (mode === 'world') { const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2b3f5c'; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = true; g.drawImage(fr.cv, view.tx, view.ty, fr.cv.width * view.k, fr.cv.height * view.k); }
    else A.StepsCity.draw(cv, cityTrace, fr.stage, view);
  }
  function show(i) {
    idx = Math.max(0, Math.min(frames.length - 1, i)); slide.value = idx; $('stNum').textContent = `${idx + 1} з ${frames.length}`;
    const fr = frames[idx]; txt.innerHTML = `<h3>${idx + 1}. ${esc(fr.title)}</h3>${esc(fr.text)}`; cap.textContent = `${idx + 1}/${frames.length} · ${fr.title}`; paint();
  }
  function stop() { clearInterval(timer); timer = 0; $('stPlay').textContent = '▶ Пуск'; }
  function play() {
    if (timer) { stop(); return; } if (idx >= frames.length - 1) show(0);
    $('stPlay').textContent = '⏸ Пауза'; timer = setInterval(() => { if (idx >= frames.length - 1) { stop(); return; } show(idx + 1); }, +$('stSpeed').value);
  }
  const busy = m => { txt.textContent = m; };
  // світ: проганяємо конвеєр з тими самими параметрами й зерном; після кожного етапу знімаємо кадр
  async function buildWorld() {
    const my = ++token, W = A.world; if (!W) { busy('Світ ще створюється, спробуйте за мить.'); return; }
    stop(); frames = []; ctrl(false); const S = Math.max(2, Math.min(4, Math.floor(1500 / W.w))); let n = 0;
    await A.generateTrace(W.params, async (st, c, total) => {
      if (my !== token) throw new Error('cancel'); n++; busy(`Знімаю кадри: ${n}/${total}: ${st.label}…`); await new Promise(r => setTimeout(r, 0));
      if (st.id === 'roads') [1, 2, 3, 4].forEach(l => frames.push({ cv: A.StepsWorld.frame('roads', c, S, { roadLevel: l }), title: TX.world['roads' + l][0], text: TX.world['roads' + l][1] }));
      else { const t = TX.world[st.id] || [st.label, '']; frames.push({ cv: A.StepsWorld.frame(st.id, c, S), title: t[0], text: t[1] }); }
    }).catch(e => { if (e.message !== 'cancel') throw e; });
    if (my !== token) return; done();
  }
  async function buildCity() {
    const my = ++token, W = A.world, s = W && W.settlements[+$('stCity').value]; if (!s) { busy('Оберіть поселення.'); return; }
    stop(); frames = []; ctrl(false); busy(`Будую «${s.name}» по етапах…`); await new Promise(r => setTimeout(r, 30));
    if (my !== token) return; cityTrace = A.CityTrace.run(W, s);
    A.StepsCity.STAGES.forEach((id, k) => { if (id !== 'site' && id !== 'final' && !cityTrace.snaps[id]) return; frames.push({ stage: k, title: TX.city[id][0], text: TX.city[id][1] }); });
    // стадії у frames зберігають індекс у STAGES, тож повзунок може пропускати відсутні знімки
    done();
  }
  function done() { slide.max = frames.length - 1; slide.disabled = frames.length < 2; ctrl(true); fit(); fitView(); builtFor = A.world; show(0); }
  function fillCities() {
    const W = A.world, sel = $('stCity'); if (!W) return; const keep = sel.value;
    const list = W.settlements.map((s, i) => ({ s, i })).filter(q => !q.s.ruined).sort((a, b) => RANK.indexOf(a.s.rank) - RANK.indexOf(b.s.rank) || b.s.pop - a.s.pop).slice(0, 80);
    sel.innerHTML = list.map(q => `<option value="${q.i}">${esc(q.s.name)} · ${RN[q.s.rank]}</option>`).join(''); if (keep) sel.value = keep;
  }
  function setMode(m) { mode = m; stop(); $('stTabWorld').classList.toggle('on', m === 'world'); $('stTabCity').classList.toggle('on', m === 'city'); $('stCityWrap').hidden = m !== 'city'; if (m === 'city') fillCities(); frames = []; ctrl(false); slide.disabled = true; $('stNum').textContent = ''; txt.textContent = 'Натисніть «Показати».'; cap.textContent = ''; paint(); }
  $('stTabWorld').onclick = () => setMode('world'); $('stTabCity').onclick = () => setMode('city');
  $('stGo').onclick = () => (mode === 'world' ? buildWorld() : buildCity()).catch(e => busy('Помилка: ' + e.message));
  $('stFirst').onclick = () => { stop(); show(0); }; $('stLast').onclick = () => { stop(); show(frames.length - 1); };
  $('stPrev').onclick = () => { stop(); show(idx - 1); }; $('stNext').onclick = () => { stop(); show(idx + 1); }; $('stPlay').onclick = play;
  slide.oninput = () => { stop(); show(+slide.value); };
  $('stSpeed').onchange = () => { if (timer) { stop(); play(); } };
  $('stPng').onclick = () => { paint(); const a = document.createElement('a'); a.download = `atlas2-${mode}-krok-${idx + 1}.png`; a.href = cv.toDataURL('image/png'); a.click(); };
  // зум і пересування кадру
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * devicePixelRatio, my = (e.clientY - r.top) * devicePixelRatio, q = Math.exp(-e.deltaY * 0.0015), k = Math.max(0.02, Math.min(60, view.k * q)), f = k / view.k; view.tx = mx - (mx - view.tx) * f; view.ty = my - (my - view.ty) * f; view.k = k; paint(); }, { passive: false });
  let drag = null; cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; view.tx = drag.tx + (e.clientX - drag.x) * devicePixelRatio; view.ty = drag.ty + (e.clientY - drag.y) * devicePixelRatio; paint(); });
  cv.addEventListener('pointerup', () => { drag = null; });
  addEventListener('keydown', e => { if (ov.hidden || /INPUT|SELECT|TEXTAREA/.test((e.target.tagName || '')) && e.target.type !== 'range') return; if (e.key === 'ArrowRight') { stop(); show(idx + 1); } else if (e.key === 'ArrowLeft') { stop(); show(idx - 1); } else if (e.key === ' ' && frames.length) { e.preventDefault(); play(); } });
  addEventListener('resize', () => { if (!ov.hidden) { fit(); fitView(); paint(); } });
  // меню: кадр показується, лише поки відкрита вкладка «Як працює»
  const prevOn = window.ZB.onPanel;
  window.ZB.onPanel = p => { if (prevOn) prevOn(p); const on = p === 'steps'; ov.hidden = !on; if (!on) { stop(); return; } fit(); if (builtFor !== A.world) { frames = []; ctrl(false); txt.textContent = 'Натисніть «Показати».'; } else fitView(); paint(); };
  if (window.ZB.panel === 'steps') window.ZB.onPanel('steps');
})();
