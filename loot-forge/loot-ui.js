// Loot Forge: спільний інтерфейс предметів: підказка при наведенні (на дотику: при натисканні)
// і «лялька героя» зі слотами спорядження. Не знає про правила, лише розкладає й малює.
const LootUI = (() => {
  'use strict';
  const doc = typeof document !== 'undefined' ? document : null;

  /* ---------- підказка ---------- */
  let tipEl = null, pinned = null, lastType = 'mouse';
  function ensureTip() {
    if (tipEl || !doc) return tipEl;
    tipEl = doc.createElement('div');
    tipEl.className = 'tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true;
    doc.body.append(tipEl);
    doc.addEventListener('pointerdown', e => { lastType = e.pointerType || 'mouse'; if (pinned && !pinned.contains(e.target)) hide(); });
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    return tipEl;
  }
  function place(x, y) {
    const t = tipEl, pad = 14, w = t.offsetWidth, hgt = t.offsetHeight, vw = innerWidth, vh = innerHeight;
    let left = x + pad, top = y + pad;
    if (left + w > vw - 8) left = Math.max(8, x - w - pad);
    if (top + hgt > vh - 8) top = Math.max(8, vh - hgt - 8);
    t.style.left = left + 'px'; t.style.top = top + 'px';
  }
  function show(node, x, y) { ensureTip(); tipEl.textContent = ''; tipEl.append(node()); tipEl.hidden = false; place(x, y); }
  function hide() { if (tipEl) tipEl.hidden = true; pinned = null; }
  // attach: навішує підказку на елемент; node() повертає DOM-вміст
  function attach(el, node) {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !pinned) show(node, e.clientX, e.clientY); });
    el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && tipEl && !tipEl.hidden && !pinned) place(e.clientX, e.clientY); });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pinned) hide(); });
    el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); if (!pinned) show(node, r.left, r.bottom - 6); });
    el.addEventListener('blur', () => { if (!pinned) hide(); });
    el.addEventListener('click', e => {
      if (lastType === 'mouse') return;
      if (pinned === el) { hide(); return; }
      show(node, e.clientX, e.clientY); pinned = el;
    });
  }

  /* ---------- розкладання предметів по слотах ---------- */
  // cells: [{id, name, group, accepts: [слот предмета...], blockedBy?: id клітинки}]
  // itemSlot(it) → слот предмета; isTwoHand(it) → чи займає ще й другу руку
  function assign(items, cells, itemSlot, isTwoHand) {
    const put = {}, pack = [], blocked = {};
    for (const it of items) {
      const s = itemSlot(it);
      let placed = false;
      for (const c of cells) {
        if (put[c.id] || !c.accepts.includes(s)) continue;
        if (blocked[c.id]) continue;
        if (c.blocks && isTwoHand && isTwoHand(it)) { if (put[c.blocks]) continue; blocked[c.blocks] = it; }
        put[c.id] = it; placed = true; break;
      }
      if (!placed) pack.push(it);
    }
    return { put, pack, blocked };
  }

  /* ---------- відмальовка ---------- */
  function view(o) {
    // o: h, items, cells, groups, itemSlot, isTwoHand, tip(it)→node, mini(it)→{name,sub,color}, detail(it)→node, selected, onSelect
    const { h } = o;
    const A = assign(o.items, o.cells, o.itemSlot, o.isTwoHand);
    const sel = o.selected;
    const cellEl = c => {
      const it = A.put[c.id];
      if (!it) {
        const b = A.blocked[c.id];
        return h('div', { class: 'cell empty' + (b ? ' blocked' : ''), title: b ? 'Зайнято дворучною зброєю' : 'Порожній слот: ' + c.name }, h('i', null, c.name), b ? h('small', null, 'дворучна') : null);
      }
      const m = o.mini(it);
      const el = h('button', { type: 'button', class: 'cell full' + (sel === it ? ' sel' : ''), style: `--c:${m.color}`, 'aria-label': c.name + ': ' + m.name, onclick: () => o.onSelect(it) },
        h('i', null, c.name), h('b', null, m.name), h('small', null, m.sub));
      attach(el, () => o.tip(it));
      return el;
    };
    const groups = o.groups.map(g => h('div', { class: 'dgroup' }, h('h4', null, g.name), h('div', { class: 'dcells' }, o.cells.filter(c => c.group === g.id).map(cellEl))));
    const packEl = A.pack.length ? h('div', { class: 'pack' }, h('h4', null, `Рюкзак (${A.pack.length})`, h('span', { class: 'hint' }, ' не вмістилося в слоти героя')),
      h('div', { class: 'dcells' }, A.pack.map(it => {
        const m = o.mini(it);
        const el = h('button', { type: 'button', class: 'cell full' + (sel === it ? ' sel' : ''), style: `--c:${m.color}`, onclick: () => o.onSelect(it) }, h('i', null, m.slot || ''), h('b', null, m.name), h('small', null, m.sub));
        attach(el, () => o.tip(it));
        return el;
      }))) : null;
    const det = sel && o.items.includes(sel) ? o.detail(sel) : h('div', { class: 'placeholder' }, h('p', null, 'Наведи мишку на предмет у слоті, щоб побачити його бонуси. На телефоні: торкнись предмета.'), h('p', null, 'Клікни по предмету, щоб відкрити його картку з діями: зірки, точіння, гнізда, вставки.'));
    return h('div', { class: 'hero' }, h('div', { class: 'doll' }, groups, packEl), h('div', { class: 'detail' }, det));
  }

  return { attach, hide, assign, view };
})();
if (typeof module !== 'undefined') module.exports = LootUI;
