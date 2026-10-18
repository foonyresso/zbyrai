// Манекен: малювання SVG (тіло / обличчя), вибір ділянки кліком, підсвітка стану ділянок.
// Стан вибору живе в st.zone / st.view / st.whole (див. app.js). Подання вкладок і карток: ui-workspace.js.
const MK_NS = 'http://www.w3.org/2000/svg';
const mkEl = (tag, attrs, parent) => { const e = document.createElementNS(MK_NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };
const mkZoneLabel = id => (mkGroup(id) ? mkGroup(id).label : (MK_ZONES.find(z => z.id === id) || {}).label || id);
// Стан ділянки для підсвітки: 'user' = щось вибрано вручну чи введено текст, 'has' = є значення (випадкові теж), '' = порожньо
function mkZoneState(id) {
  let state = '';
  mkMembers(id).forEach(m => (MK.partSlots[m] || []).forEach(sid => {
    const sl = SLOTS[sid], s = st.slots[sid];
    if (!sl || !s || !visible(sl) || s.mode === 'off' || !s.value.length) return;
    const scope = mkScope(sl, m);
    if (scope && !s.value.some(v => mkInScope(sl, v, scope))) return;
    if (s.mode === 'manual' || s.locked) state = 'user';
    else if (!state) state = 'has';
  }));
  return state;
}
// Малює поточний вид
function mkRenderSvg() {
  const host = $('mkSvg'); if (!host) return;
  host.innerHTML = '';
  const svg = mkEl('svg', { viewBox: MK_VIEWS[st.view].box, class: 'mk-svg', role: 'img', 'aria-label': 'Манекен: клікай по ділянках тіла' }, host);
  const view = st.view;
  const zones = MK_ZONES.filter(z => z.view === view).sort((a, b) => a.sort - b.sort);
  const sel = new Set(mkMembers(st.zone));
  zones.forEach(z => {
    const g = mkEl('g', { class: 'mk-zone', 'data-z': z.id, tabindex: 0, role: 'button', 'aria-label': z.label }, svg);
    mkEl('title', {}, g).textContent = z.label + (z.jump ? ' (відкрити великим планом)' : '') + (st.whole && z.group !== z.id ? ' → ' + mkZoneLabel(z.group) : '');
    const paths = z.d.map(d => mkEl('path', { d }, g));
    if (z.mirror) z.d.forEach(d => paths.push(mkEl('path', { d, transform: 'translate(300 0) scale(-1 1)' }, g)));
    const stt = mkZoneState(z.id);
    g.classList.toggle('has', stt === 'has'); g.classList.toggle('user', stt === 'user');
    g.classList.toggle('sel', sel.has(z.id) && (z.id === st.zone || !!mkGroup(st.zone)));
    g.onclick = () => mkPick(z);
    g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); mkPick(z); } };
    g.onmouseenter = () => mkHover(z.label + (st.whole ? ' · клік вибере: ' + mkZoneLabel(z.group) : ''));
    g.onmouseleave = () => mkHover('');
  });
  if (view === 'head') mkFaceDecor(svg);
  mkHover('');
}
// Дрібні неклікабельні деталі обличчя, щоб воно читалось як обличчя
function mkFaceDecor(svg) {
  const g = mkEl('g', { class: 'mk-decor', 'pointer-events': 'none' }, svg);
  [127, 173].forEach(x => { mkEl('circle', { cx: x, cy: 154, r: 5 }, g); });
  mkEl('path', { d: 'M136 222Q150 228 164 222' }, g);
}
function mkHover(t) { const c = $('mkCaption'); if (c) c.textContent = t || (st.zone ? 'Вибрано: ' + mkZoneLabel(st.zone) : 'Наведи на частину тіла, щоб побачити її назву'); }
function mkPick(z) {
  if (z.jump && !st.whole) { st.view = z.jump; selectZone('face'); return; }
  if (st.whole && z.group && z.group !== z.id) { selectZone(z.group); return; }
  selectZone(z.id);
}
function mkSetView(v) { st.view = v; if (v === 'head' && !mkInView(st.zone, v)) st.zone = 'face'; if (v === 'body' && !mkInView(st.zone, v)) st.zone = 'body'; save(); render(); }
function mkInView(id, v) { return !!mkGroup(id) || MK_ZONES.some(z => z.id === id && z.view === v); }
function selectZone(id) {
  st.zone = id; st.wtab = 'zone';
  // нова ділянка не обов'язково є у виді: перемикаємо вид, якщо треба
  if (!mkGroup(id) && !MK_ZONES.some(z => z.id === id && z.view === st.view)) st.view = (MK_ZONES.find(z => z.id === id) || { view: st.view }).view;
  save(); render(); $('wBody').scrollTop = 0;
}
function mkRenderToolbar() {
  const v = $('mkView'), m = $('mkMode'); if (!v) return;
  v.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view));
  m.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.m === 'whole') === st.whole));
}
