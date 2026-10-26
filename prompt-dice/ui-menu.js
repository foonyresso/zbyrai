// Ліва зона: перемикач «Меню / Манекен», дерево меню (категорії → підгрупи), пошук по параметрах і варіантах, замки груп.
// Дані меню: menu-tree.js (menuBuild); стан у st.ui (nav, open, last, adult, hide, dense, one); центральна зона: ui-workspace.js.
let MENU = [];       // поточне меню для типу й моделі
let mQuery = '';     // пошуковий запит
const menuAdult = () => !!st.ui.adult && st.type === 'char';
function rebuildMenu() { MENU = menuBuild(st.type, st.model, { adult: menuAdult() || adultFilled(), hide: st.ui.hide }); }
// 18+ вимкнено в налаштуваннях, але вибір там ще є: категорію показуємо, щоб вибір не лишався невидимим
const adultFilled = () => typeof NSFW_IDS !== 'undefined' && st.type === 'char' && NSFW_IDS.some(id => { const s = st.slots[id]; return s && s.mode !== 'off' && s.value.length; });

/* ---------- пошук ---------- */
const qnorm = s => String(s || '').toLowerCase().replace(/[’'ʼ`]/g, '').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
const searchCache = { key: '', slot: {} };
function slotHay(id) {
  const c = ctx(), key = [st.type, st.model, c.g, c.theme].join('|');
  if (searchCache.key !== key) { searchCache.key = key; searchCache.slot = {}; }
  if (searchCache.slot[id] !== undefined) return searchCache.slot[id];
  const sl = SLOTS[id], parts = [sl.label, sl.en, MK_PART_UA[sl.part] || ''];
  if (!sl.text) {
    try {
      const opts = sl.opts(c);
      opts.forEach(v => { parts.push(v, mkLabel(sl, v)); });
      if (COLOR_SLOT_FMT[id] || opts.some(o => colorSpec(sl, o))) COLORS.forEach(k => parts.push(k[0], k[1]));   // параметр має палітру кольорів
    } catch (e) { /* без варіантів */ }
    (sl.groups || []).forEach(g => parts.push(g[0]));
  }
  return (searchCache.slot[id] = qnorm(parts.join('\n')));
}
const slotLabelMatches = (id, q) => qnorm(SLOTS[id].label + ' ' + (MK_PART_UA[SLOTS[id].part] || '')).includes(q);
const slotMatches = (id, q) => slotHay(id).includes(q);
const nodeNameMatches = (node, q) => qnorm(node.name + ' ' + node.desc + ' ' + (MENU.find(c => c.id === node.cat) || {}).name).includes(q);
const nodeMatches = (node, q) => nodeNameMatches(node, q) || node.all.some(id => slotMatches(id, q));
// Пошуковий запит для чипів картки: якщо назва параметра збіглась із запитом, чипи показуємо всі
function menuChipQuery(id, zone) {
  if (zone || !mQuery || navMode() !== 'menu') return '';
  const q = qnorm(mQuery);
  return slotLabelMatches(id, q) ? '' : mQuery;
}
function setMenuQuery(v) {
  mQuery = v.trim();
  const inp = $('mSearch'); if (inp && inp.value.trim() !== mQuery) inp.value = v;
  $('mSearchX').hidden = !mQuery;
  const q = qnorm(mQuery), cur = curNode();
  // відкритої підгрупи немає серед знайдених: відкриваємо першу знайдену
  if (q.length > 1 && navMode() === 'menu' && !(cur && nodeMatches(cur, q))) { const hit = menuNodes(MENU).find(n => nodeMatches(n, q)); if (hit) st.wtab = hit.id; }
  renderMenuTree(); renderWork();
}

/* ---------- перемикач «Меню / Манекен» ---------- */
function renderNav() {
  const mk = hasMannequin(), nav = navMode();
  $('navMode').querySelectorAll('button').forEach(b => {
    b.classList.toggle('on', b.dataset.n === nav);
    if (b.dataset.n === 'mk') { b.disabled = !mk; b.title = mk ? 'Манекен людини: клік по частині тіла відкриває її параметри' : 'Манекен є лише для типів «Персонаж (арт)» і «Спрайт-лист»'; }
  });
  $('navMenu').hidden = nav !== 'menu'; $('navMk').hidden = nav !== 'mk';
}
function setNav(n) {
  if (n === 'mk' && !hasMannequin()) return;
  st.ui.nav = n; save(); render();
}

/* ---------- дерево ---------- */
const node$ = id => document.querySelector('.mnode[data-id="' + id + '"]');
function scrollMenuTo(id) { const el = node$(id); if (el) el.scrollIntoView({ block: 'nearest' }); }
function selectNode(id) {
  const n = nodeById(id); if (!n) return;
  st.wtab = id; st.ui.last = id; st.ui.nav = 'menu';
  if (st.ui.one) st.ui.open = {};
  st.ui.open[n.cat] = true;
  save(); render(); $('wBody').scrollTop = 0; scrollMenuTo(id); showWork();
}
// на вузькому екрані панелі йдуть одна під одною: після вибору підгрупи чи ділянки показуємо параметри
function showWork() { if (window.innerWidth <= 760) $('workPane').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function toggleCat(id) {
  const was = !!st.ui.open[id];
  if (st.ui.one) st.ui.open = {};
  st.ui.open[id] = !was;
  save(); renderMenuTree();
}
const badge = (n, total) => `<span class="ct${n ? ' on' : ''}" title="${n ? 'Вибрано вручну або заповнено: ' + n : 'Підгруп чи параметрів: ' + total}">${n || total}</span>`;
function lockBtn(ids, what) {
  const ls = lockState(ids), b = document.createElement('button');
  b.type = 'button'; b.className = 'lock-mini' + (ls === 'all' ? ' on' : ls === 'some' ? ' part' : ''); b.disabled = ls === 'none';
  b.textContent = LOCK_ICON[ls]; b.title = ls === 'none' ? LOCK_TIP.none : (ls === 'all' ? 'Зняти замки: ' : 'Замкнути: ') + what;
  b.onclick = e => { e.stopPropagation(); toggleLock(ids); };
  return b;
}
function renderMenuTree() {
  const host = $('mTree'); if (!host) return;
  const scroll = host.scrollTop, q = qnorm(mQuery), cur = curNode(), curId = cur && navMode() === 'menu' ? cur.id : '';
  host.innerHTML = '';
  let cats = 0, nodes = 0;
  MENU.forEach(cat => {
    const list = q ? cat.nodes.filter(n => nodeMatches(n, q)) : cat.nodes;
    if (!list.length) return;
    cats++; nodes += list.length;
    const ids = cat.nodes.flatMap(n => n.all), open = q ? true : !!st.ui.open[cat.id];
    const wrap = document.createElement('div'); wrap.className = 'mcat' + (open ? ' open' : '') + (list.some(n => n.id === curId) ? ' has-sel' : '');
    wrap.style.setProperty('--cat', cat.color); wrap.dataset.cat = cat.id;
    const t = document.createElement('div'); t.className = 'mcat-t';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'mcat-b'; b.setAttribute('aria-expanded', open);
    b.title = (open ? 'Згорнути: ' : 'Розгорнути: ') + cat.name + '. ' + cat.desc;
    b.innerHTML = `<span class="sym">${menuIcon(cat.icon)}</span><span class="nm">${esc(cat.name)}</span>${badge(filledCount(ids), list.length)}<span class="car" aria-hidden="true">›</span>`;
    b.onclick = () => { if (!q) toggleCat(cat.id); };
    t.append(b, lockBtn(ids, 'усю категорію «' + cat.name + '»'));
    const kids = document.createElement('div'); kids.className = 'mkids';
    let last = '';
    list.forEach(n => {
      if (n.sec && n.sec !== last) { const s = document.createElement('div'); s.className = 'msec'; s.textContent = n.sec; kids.appendChild(s); last = n.sec; }
      const row = document.createElement('div'); row.className = 'mnode' + (n.id === curId ? ' sel' : ''); row.dataset.id = n.id;
      const nb = document.createElement('button'); nb.type = 'button'; nb.className = 'mnode-b'; nb.title = n.desc;
      nb.innerHTML = `<span class="nm">${esc(n.name)}</span>${badge(filledCount(n.all), n.all.length)}`;
      nb.onclick = () => selectNode(n.id);
      row.append(nb, lockBtn(n.all, 'групу «' + n.name + '»'));
      kids.appendChild(row);
    });
    wrap.append(t, kids); host.appendChild(wrap);
  });
  if (!cats) host.innerHTML = '<div class="hint m-empty">Нічого не знайдено. Спробуй інше слово: назву параметра, ділянки чи варіанта.</div>';
  host.scrollTop = scroll;
  $('mCount').textContent = q ? `Знайдено: ${nodes} підгруп у ${cats} категоріях` : `${MENU.length} категорій · ${menuNodes(MENU).length} підгруп`;
}

/* ---------- обробники ---------- */
let searchTimer;
$('mSearch').oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => setMenuQuery($('mSearch').value), 140); };
$('mSearch').onkeydown = e => {
  if (e.key === 'Escape') { e.preventDefault(); $('mSearch').value = ''; setMenuQuery(''); }
  if (e.key === 'Enter') { const first = document.querySelector('#mTree .mnode-b'); if (first) first.click(); }
};
$('mSearchX').onclick = () => { $('mSearch').value = ''; setMenuQuery(''); $('mSearch').focus(); };
$('mExpand').onclick = () => { MENU.forEach(c => (st.ui.open[c.id] = true)); save(); renderMenuTree(); };
$('mCollapse').onclick = () => { st.ui.open = {}; save(); renderMenuTree(); };
$('navMode').querySelectorAll('button').forEach(b => (b.onclick = () => setNav(b.dataset.n)));
