// Idea Mixer: інтерфейс. Дані й правила вибору живуть у mixer-core.js.
(function () {
  'use strict';
  const M = MixerCore;
  const $ = id => document.getElementById(id);

  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return e;
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem('im_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('im_' + k, JSON.stringify(v)); } catch {} },
  };
  let toastTimer;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2000); }

  /* ---------- стан ---------- */
  let custom = store.get('custom', {});
  if (!custom || typeof custom !== 'object') custom = {};
  let pools = M.mergePools(custom);
  let favs = (store.get('fav', []) || []).map(M.sanitizeIdea).filter(Boolean).slice(0, 40);
  let locks = store.get('locks', {}) || {};
  let idea = M.sanitizeIdea(store.get('idea', null));
  let flipping = null; // які слоти щойно змінилися (для анімації)
  const rng = M.rngFromSeed(M.randomSeed() + Date.now());
  const saveIdea = () => { store.set('idea', idea); store.set('locks', locks); };

  function mix() {
    const before = idea;
    idea = M.rollAll(rng, pools, idea, locks);
    flipping = new Set(M.SLOTS.filter(s => !before || before.picks[s.id] !== idea.picks[s.id]).map(s => s.id));
    saveIdea(); render();
  }
  function reroll(slotId) {
    idea = M.rollSlot(rng, pools, idea, slotId);
    flipping = new Set([slotId]); saveIdea(); render();
  }
  function toggleLock(id) { locks[id] = !locks[id]; if (!locks[id]) delete locks[id]; saveIdea(); render(); }

  /* ---------- відображення ---------- */
  function render() {
    flipping = flipping || new Set();
    $('title').textContent = idea.title;
    const box = $('slots'); box.textContent = '';
    M.SLOTS.forEach((s, i) => {
      const p = idea.picks[s.id];
      const src = h('div', { class: 'src' }, p.from.length ? p.from.map(g => h('span', { class: 'tag' }, g)) : p.custom ? h('span', { class: 'tag mine' }, 'власна механіка') : null);
      box.append(h('article', { class: 'slot' + (locks[s.id] ? ' locked' : ''), 'data-n': String(i + 1).padStart(2, '0') },
        h('div', { class: 'slot-h' }, h('h3', null, s.name), h('small', null, s.hint)),
        h('p', { class: 'slot-t' + (flipping.has(s.id) ? ' flip' : '') }, p.t),
        src,
        h('div', { class: 'slot-f' },
          h('button', { class: locks[s.id] ? 'on' : '', 'aria-pressed': !!locks[s.id], title: locks[s.id] ? 'Слот замкнено: переживе змішування' : 'Замкнути слот', onclick: () => toggleLock(s.id) }, locks[s.id] ? '🔒 Замкнено' : '🔓 Замкнути'),
          h('button', { title: 'Перекинути лише цей слот', onclick: () => reroll(s.id) }, '🎲 Перекинути')),
      ));
    });
    flipping = null;
    $('pitch').textContent = M.pitch(idea);
    renderFavs(); renderCustom();
  }

  function renderFavs() {
    const box = $('favs'); box.textContent = '';
    $('favN').textContent = favs.length ? `(${favs.length})` : '';
    if (!favs.length) { box.append(h('p', { class: 'empty' }, 'Тисни «★ У вибране», щоб зберегти вдалу ідею. Вибране лишається в цьому браузері.')); return; }
    favs.forEach((f, i) => box.append(h('div', { class: 'li' },
      h('div', { class: 'tx' }, h('b', null, f.title), h('small', null, `${f.picks.core.t.slice(0, 60)}${f.picks.core.t.length > 60 ? '…' : ''}`)),
      h('button', { title: 'Показати цю ідею', onclick: () => { idea = f; saveIdea(); flipping = new Set(M.SLOTS.map(s => s.id)); render(); toast('Ідею відновлено'); } }, 'Відкрити'),
      h('button', { class: 'x', 'aria-label': 'Прибрати з вибраного', onclick: () => { favs.splice(i, 1); store.set('fav', favs); renderFavs(); } }, '✕'),
    )));
  }

  function renderCustom() {
    const box = $('customList'); box.textContent = '';
    for (const s of M.SLOTS) (custom[s.id] || []).forEach((t, i) => box.append(h('div', { class: 'li' },
      h('div', { class: 'tx' }, h('b', null, t), h('small', null, s.name)),
      h('button', { class: 'x', 'aria-label': 'Видалити власну механіку', onclick: () => { custom[s.id].splice(i, 1); if (!custom[s.id].length) delete custom[s.id]; store.set('custom', custom); pools = M.mergePools(custom); renderCustom(); } }, '✕'))));
  }

  /* ---------- події ---------- */
  M.SLOTS.forEach(s => $('customSlot').append(h('option', { value: s.id }, s.name)));
  $('customAdd').addEventListener('click', () => {
    const t = $('customText').value.trim();
    if (!t) { toast('Напиши текст механіки'); return; }
    const slot = $('customSlot').value;
    custom[slot] = (custom[slot] || []).concat(t.slice(0, 140));
    store.set('custom', custom); pools = M.mergePools(custom);
    $('customText').value = ''; renderCustom(); toast('Додано до «' + M.SLOTS.find(s => s.id === slot).name + '»');
  });
  $('customExport').addEventListener('click', () => {
    if (!Object.keys(custom).length) { toast('Немає власних механік'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(M.exportCustom(custom), null, 2)], { type: 'application/json' }));
    a.download = 'idea-mixer-custom.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('customImport').addEventListener('click', () => $('customFile').click());
  $('customFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    let data; try { data = JSON.parse(await f.text()); } catch { toast('Це не JSON'); return; }
    const r = M.importCustom(data, custom);
    if (r.error) { toast(r.error); return; }
    custom = r.custom; store.set('custom', custom); pools = M.mergePools(custom); renderCustom();
    toast('Додано: ' + r.added + (r.skipped ? ', пропущено: ' + r.skipped : ''));
  });
  $('customText').addEventListener('keydown', e => { if (e.key === 'Enter') $('customAdd').click(); });
  $('btnMd').addEventListener('click', () => {
    const l = document.createElement('a');
    l.href = URL.createObjectURL(new Blob([M.pitch(idea)], { type: 'text/markdown;charset=utf-8' }));
    l.download = 'idea-pitch.md'; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 1000); toast('Пітч збережено');
  });
  $('btnMix').addEventListener('click', mix);
  $('btnFav').addEventListener('click', () => {
    if (favs.some(f => M.pitch(f) === M.pitch(idea))) { toast('Ця ідея вже у вибраному'); return; }
    favs.unshift(JSON.parse(JSON.stringify(idea))); favs = favs.slice(0, 40); store.set('fav', favs); renderFavs(); toast('Додано у вибране');
  });
  $('btnCopy').addEventListener('click', async () => {
    const text = M.pitch(idea);
    try { await navigator.clipboard.writeText(text); toast('Пітч скопійовано'); return; } catch {}
    const ta = h('textarea', { style: 'position:fixed;left:-9999px' }); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast('Пітч скопійовано'); } catch { toast('Не вдалося скопіювати'); }
    ta.remove();
  });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) return;
    e.preventDefault(); mix();
  });

  if (!idea) { idea = M.rollAll(rng, pools, null); saveIdea(); flipping = new Set(M.SLOTS.map(s => s.id)); }
  render();
})();
