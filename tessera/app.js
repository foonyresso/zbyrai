// Tessera: інтерфейс. Побудова сцени, малювання й експорт лежать у tessera-core.js (TesseraCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const T = TesseraCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ts_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ts_' + k, JSON.stringify(v)); } catch {} },
  };
  const toast = (m, ms = 1900) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
  }
  const b64 = s => btoa(unescape(encodeURIComponent(s))), unb64 = s => decodeURIComponent(escape(atob(s)));

  /* ---------- стан ---------- */
  let st = T.defaults('hex'), saved = null;
  try { const m = /[#&]s=([^&]+)/.exec(location.hash); if (m) saved = T.fromJSON(unb64(decodeURIComponent(m[1]))); } catch {}
  if (!saved) { const s = store.get('state', null); if (s) { try { saved = T.fromJSON(s); } catch {} } }
  if (saved) st = saved;
  let lastPal = { bg: st.bg, colors: st.colors.slice(), ncol: st.ncol, lineColor: st.lineColor, mode: st.mode, cmode: st.cmode, stroke: st.stroke, gap: st.gap };
  const PAT = T.PAT, def = () => PAT[st.pattern];
  const lk = store.get('locks', {}); $('lkPattern').checked = !!lk.pattern; $('lkColors').checked = !!lk.colors;
  const locks = () => ({ pattern: $('lkPattern').checked, colors: $('lkColors').checked });
  for (const id of ['lkPattern', 'lkColors']) $(id).addEventListener('change', () => store.set('locks', locks()));

  /* ---------- побудова елементів керування ---------- */
  const ctls = [];
  function slider(parent, o) {
    const w = document.createElement('label'); w.className = 'ctl'; w.title = o.title;
    const sp = document.createElement('span'), out = document.createElement('output'), inp = document.createElement('input');
    inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step;
    w.append(sp, out, inp); parent.appendChild(w);
    const c = { w, sp, inp, out, o, sync() { const v = o.get(); inp.value = v; out.textContent = (o.fmt ? o.fmt(v) : v); if (o.label) sp.textContent = typeof o.label === 'function' ? o.label() : o.label; if (o.range) { const r = o.range(); inp.min = r.min; inp.max = r.max; inp.step = r.step; inp.value = v; } if (o.show) w.hidden = !o.show(); } };
    inp.addEventListener('input', () => { o.set(+inp.value); change(c); });
    ctls.push(c); return c;
  }
  function select(parent, o) {
    const w = document.createElement('label'); w.className = 'ctl'; w.title = o.title;
    const sp = document.createElement('span'), sel = document.createElement('select'); sp.textContent = o.label;
    for (const [v, t] of o.opts) { const op = document.createElement('option'); op.value = v; op.textContent = t; sel.appendChild(op); }
    w.append(sp, document.createElement('span'), sel); parent.appendChild(w);
    const c = { w, sync() { sel.value = o.get(); if (o.show) w.hidden = !o.show(); } };
    sel.addEventListener('change', () => { o.set(sel.value); change(c); });
    ctls.push(c); return c;
  }
  const shapeCtl = $('shapeCtl');
  slider(shapeCtl, { label: 'Розмір', min: 4, max: 300, step: 1, title: 'Розмір однієї фігури (крок сітки) у пікселях', get: () => st.size, set: v => st.size = v, fmt: v => v + ' px' });
  slider(shapeCtl, { label: () => def().inset ? 'Зазор між фігурами' : 'Відстань між елементами', min: 0, max: 80, step: 1, title: 'Відстань між сусідніми фігурами: у мозаїках фігури зменшуються і між ними з’являється зазор, у лініях і символах зростає крок', get: () => st.gap, set: v => st.gap = v, fmt: v => v + ' px' });
  slider(shapeCtl, { label: () => def().line ? 'Товщина лінії' : 'Товщина контуру', min: .5, max: 20, step: .5, title: 'Товщина ліній і контурів. Для суцільної заливки без контуру не діє', get: () => st.stroke, set: v => st.stroke = v, fmt: v => v + ' px' });
  slider(shapeCtl, { label: 'Поворот', min: 0, max: 359, step: 1, title: 'Поворот усього візерунка навколо центру. Горизонтальні лінії стануть косими', get: () => st.rot, set: v => st.rot = v, fmt: v => v + '°' });
  slider(shapeCtl, { label: () => (def().k || {}).label || '', min: 0, max: 100, step: 1, title: 'Особлива ручка обраної фігури: пропорції, кількість сторін, гострота променів тощо', get: () => st.k, set: v => st.k = v, show: () => !!def().k, range: () => def().k || { min: 0, max: 100, step: 1 }, fmt: v => v });
  slider(shapeCtl, { label: 'Поворот фігур', min: -180, max: 180, step: 1, title: 'Повертає кожну фігуру навколо власного центру, а не полотно: усі однаково вліво чи вправо. Разом із «Хаосом» дає нові форми', get: () => st.turn, set: v => st.turn = v, fmt: v => v + '°' });
  slider(shapeCtl, { label: 'Хаос', min: 0, max: 100, step: 1, title: 'Випадковий поворот і розмір кожної фігури: від рівного візерунка до розсипу', get: () => Math.round(st.chaos * 100), set: v => st.chaos = v / 100, fmt: v => v + '%' });
  select(shapeCtl, { label: 'Заливка', title: 'Заповнена фігура, лише контур чи заливка з окремим кольором контуру', opts: [['fill', 'Заливка'], ['outline', 'Контур'], ['both', 'Заливка й контур']], get: () => st.mode, set: v => st.mode = v });
  { const w = document.createElement('label'); w.className = 'ctl'; w.title = 'Зерно: код випадковості. Те саме зерно з тими самими налаштуваннями дає той самий візерунок';
    w.innerHTML = '<span>Зерно</span><span></span><input type="text" id="tSeed" maxlength="24" spellcheck="false">'; shapeCtl.appendChild(w);
    const inp = w.querySelector('input'); inp.addEventListener('input', () => { st.seed = inp.value || 'zbyrai'; change(null); });
    ctls.push({ w, sync() { if (document.activeElement !== inp) inp.value = st.seed; } }); }

  const colorCtl = $('colorCtl');
  select(colorCtl, { label: 'Чергування кольорів', title: 'Як кольори чергуються між фігурами: по рядках, стовпцях, шахівницею, по діагоналі, навмання чи кільцями від центру', opts: [['single', 'Один колір'], ['checker', 'Шахівниця'], ['rows', 'По рядках'], ['cols', 'По стовпцях'], ['diag', 'По діагоналі'], ['random', 'Випадково'], ['rings', 'Кільцями від центру'], ['seq', 'По черзі']], get: () => st.cmode, set: v => st.cmode = v });
  slider(colorCtl, { label: 'Кількість кольорів', min: 1, max: 6, step: 1, title: 'Скільки кольорів із палітри чергується у візерунку', get: () => st.ncol, set: v => st.ncol = v, fmt: v => v });

  const canvasCtl = $('canvasCtl');
  { const w = document.createElement('div'); w.className = 'ctl pair'; w.innerHTML = '<span>Розмір полотна, px</span><input type="number" id="nW" min="64" max="8192" step="10" title="Ширина картинки в пікселях (для PNG і SVG)"><input type="number" id="nH" min="64" max="8192" step="10" title="Висота картинки в пікселях (для PNG і SVG)">'; canvasCtl.appendChild(w);
    for (const [id, k] of [['nW', 'W'], ['nH', 'H']]) w.querySelector('#' + id).addEventListener('input', e => { const v = +e.target.value; if (v >= 64) { st[k] = v; change(null); } });
    w.querySelector('#nW').addEventListener('change', syncAll); w.querySelector('#nH').addEventListener('change', syncAll);
    ctls.push({ w, sync() { for (const [id, k] of [['nW', 'W'], ['nH', 'H']]) { const i = w.querySelector('#' + id); if (document.activeElement !== i) i.value = st[k]; } } }); }
  select(canvasCtl, { label: 'Готові розміри', title: 'Швидко обрати типовий розмір полотна: екран, соцмережі, шпалери, 4K', opts: [['', 'Свій розмір'], ['1600x1000', '1600×1000'], ['1920x1080', '1920×1080 (екран)'], ['1080x1080', '1080×1080 (квадрат)'], ['1080x1920', '1080×1920 (сторіз)'], ['2048x2048', '2048×2048'], ['3840x2160', '3840×2160 (4K)'], ['4096x4096', '4096×4096']], get: () => { const k = st.W + 'x' + st.H; return ['1600x1000', '1920x1080', '1080x1080', '1080x1920', '2048x2048', '3840x2160', '4096x4096'].includes(k) ? k : ''; }, set: v => { if (v) { const [w, h] = v.split('x').map(Number); st.W = w; st.H = h; } } });

  /* ---------- фігури (з мініатюрами) ---------- */
  const patBox = $('patterns'), thumbs = {};
  for (const [g, gname] of T.GROUPS) {
    const h = document.createElement('h5'); h.textContent = gname; patBox.appendChild(h);
    const grid = document.createElement('div'); grid.className = 'pgrid'; patBox.appendChild(grid);
    for (const p of T.PATTERNS.filter(x => x.group === g)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pbtn'; b.title = p.name + ': ' + p.desc;
      const cv = document.createElement('canvas'); cv.width = 144; cv.height = 96; const sp = document.createElement('span'); sp.textContent = p.name;
      b.append(cv, sp); grid.appendChild(b); thumbs[p.id] = { b, cv };
      b.addEventListener('click', () => { pickPattern(p.id); });
    }
  }
  let thumbTimer = 0;
  function drawThumbs() {
    for (const p of T.PATTERNS) {
      const t = thumbs[p.id], q = T.defaults(p.id); Object.assign(q, p.preset || { bg: st.bg, colors: st.colors, ncol: Math.max(2, st.ncol), cmode: st.cmode === 'single' ? 'checker' : st.cmode, mode: p.line ? 'outline' : st.mode, lineColor: st.lineColor, stroke: 1.5 });
      q.pattern = p.id; q.W = 96; q.H = 64; q.size = Math.max(7, Math.round(p.size * .3)); q.gap = p.preset ? 0 : Math.min(2, st.gap); q.seed = 'th'; q.stroke = p.preset ? 1 : 1.2;
      T.draw(t.cv.getContext('2d'), T.buildScene(q), 1.5);
    }
  }
  const scheduleThumbs = () => { clearTimeout(thumbTimer); thumbTimer = setTimeout(drawThumbs, 120); };

  function applyPreset(p) {
    if (p.preset) { if (!def().preset) lastPal = { bg: st.bg, colors: st.colors.slice(), ncol: st.ncol, lineColor: st.lineColor, mode: st.mode, cmode: st.cmode, stroke: st.stroke, gap: st.gap }; Object.assign(st, p.preset, { colors: p.preset.colors.slice() }); }
    else if (def().preset) Object.assign(st, lastPal, { colors: lastPal.colors.slice() });
  }
  function pickPattern(id) {
    const p = PAT[id]; applyPreset(p);
    st.pattern = id; st.size = p.size; st.k = p.k ? p.k.def : 50; st = T.clampParams(st);
    syncAll(); toast(p.name + (p.preset ? ': застосовано стиль зошита' : ''));
  }

  /* ---------- кольори ---------- */
  const palBox = $('palettes');
  for (const pal of T.PALETTES) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.title = 'Палітра «' + pal.name + '»';
    b.innerHTML = '<i>' + [pal.bg, ...pal.colors.slice(0, 4)].map(c => '<b style="background:' + c + '"></b>').join('') + '</i>' + pal.name;
    b.addEventListener('click', () => { st.bg = pal.bg; st.colors = pal.colors.slice(); st.lineColor = pal.bg; if (st.ncol < 2 && !def().line) st.ncol = 3; change(null, true); }); palBox.appendChild(b);
  }
  const colBox = $('colors'), colIn = [];
  function colorInput(label, title, get, set) {
    const l = document.createElement('label'); l.title = title; const sp = document.createElement('span'); sp.textContent = label; const i = document.createElement('input'); i.type = 'color';
    l.append(sp, i); colBox.appendChild(l); i.addEventListener('input', () => { set(i.value); change(null); });
    const o = { l, sync() { i.value = get(); } }; colIn.push(o); return o;
  }
  const bgIn = colorInput('Тло', 'Колір тла картинки', () => st.bg, v => st.bg = v);
  const lineIn = colorInput('Контур', 'Колір контуру у режимі «Заливка й контур»', () => st.lineColor, v => st.lineColor = v);
  const fills = [0, 1, 2, 3, 4, 5].map(n => colorInput('Колір ' + (n + 1), 'Колір ' + (n + 1) + ' із палітри: використовується, якщо кількість кольорів не менша за ' + (n + 1), () => st.colors[n], v => { st.colors[n] = v; }));
  $('btnPalRand').addEventListener('click', () => { const p = T.randomPalette(Math.random); st.bg = p.bg; st.colors = p.colors; st.lineColor = p.bg; if (st.ncol < 2) st.ncol = 3; change(null, true); });

  /* меню-іконки, довідка «i»: спільний кіт zb-ui.js */

  /* ---------- відображення ---------- */
  const cv = $('cv'), view = $('view'), meta = $('meta'); let raf = 0;
  function render() {
    raf = 0; const sc = T.buildScene(st), dpr = Math.min(2, window.devicePixelRatio || 1);
    const aw = Math.max(80, view.clientWidth - 24), ah = Math.max(80, view.clientHeight - 24), fit = Math.min(aw / sc.W, ah / sc.H);
    cv.style.width = Math.round(sc.W * fit) + 'px'; cv.style.height = Math.round(sc.H * fit) + 'px';
    cv.width = Math.max(1, Math.round(sc.W * fit * dpr)); cv.height = Math.max(1, Math.round(sc.H * fit * dpr));
    T.draw(cv.getContext('2d'), sc, fit * dpr);
    meta.textContent = `${sc.W}×${sc.H} px · фігур: ${sc.count.toLocaleString('uk-UA')}${sc.clamped ? ' · розмір збільшено до ' + Math.round(sc.size) + ' px, щоб не зависнути' : ''}${sc.truncated ? ' · показано не все' : ''}`;
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  function syncAll() {
    st = T.clampParams(st); for (const c of ctls) c.sync(); for (const c of colIn) c.sync();
    fills.forEach((f, n) => f.l.classList.toggle('off', n >= st.ncol)); lineIn.l.classList.toggle('off', st.mode !== 'both');
    for (const p of T.PATTERNS) thumbs[p.id].b.classList.toggle('on', p.id === st.pattern);
    $('patName').textContent = def().name;
    store.set('state', T.toJSON(st)); schedule(); scheduleThumbs();
  }
  function change(c, full) {
    // зміна одного повзунка не перебудовує решту, лише залежні підписи
    st = T.clampParams(Object.assign({}, st, { colors: st.colors })); if (full || !c) { for (const x of ctls) x.sync(); for (const x of colIn) x.sync(); } else for (const x of ctls) if (x !== c) x.sync();
    fills.forEach((f, n) => f.l.classList.toggle('off', n >= st.ncol)); lineIn.l.classList.toggle('off', st.mode !== 'both');
    store.set('state', T.toJSON(st)); schedule(); scheduleThumbs();
  }
  new ResizeObserver(schedule).observe(view); window.addEventListener('resize', schedule);

  /* ---------- випадковість ---------- */
  function randomAll() { st = T.randomize(st, locks()); syncAll(); }
  $('btnRandom').addEventListener('click', randomAll);
  $('btnRandColors').addEventListener('click', () => { const p = T.randomPalette(Math.random); st.bg = p.bg; st.colors = p.colors; st.lineColor = p.bg; st.ncol = Math.max(2, st.ncol); syncAll(); });
  $('btnRandSeed').addEventListener('click', () => { st.seed = T.randSeed(); syncAll(); });
  $('btnReset').addEventListener('click', () => { const p = def(), keepWH = { W: st.W, H: st.H }; st = Object.assign(T.defaults(p.id), keepWH); if (p.preset) Object.assign(st, p.preset, { colors: p.preset.colors.slice() }); syncAll(); toast('Налаштування фігури скинуто'); });
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !/^(INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY)$/.test(e.target.tagName) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); randomAll(); } });

  /* ---------- збереження й обмін ---------- */
  const fname = ext => `tessera-${st.pattern}-${st.W}x${st.H}.${ext}`;
  $('btnPng').addEventListener('click', () => {
    const sc = T.buildScene(st), c = document.createElement('canvas'); c.width = sc.W; c.height = sc.H;
    try { T.draw(c.getContext('2d'), sc, 1); c.toBlob(b => { if (!b) return toast('Не вдалося створити PNG: спробуй менший розмір'); download(b, fname('png')); toast('PNG збережено'); }, 'image/png'); } catch { toast('Не вдалося створити PNG: спробуй менший розмір'); }
  });
  $('btnSvg').addEventListener('click', () => { download(new Blob([T.toSVG(T.buildScene(st))], { type: 'image/svg+xml' }), fname('svg')); toast('SVG збережено'); });
  window.addEventListener('paste', e => { if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; const t = e.clipboardData && e.clipboardData.getData('text'); if (t && t.trim().startsWith('{')) { try { st = T.fromJSON(t); syncAll(); toast('Налаштування вставлено з буфера'); } catch {} } });

  syncAll();
})();
