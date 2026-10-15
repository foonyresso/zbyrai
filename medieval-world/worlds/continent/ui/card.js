// Картка вибраного об’єкта: поселення, місце, лігво або регіон.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;

  function roadsOf(w, t, id) { const set = new Set(); for (const r of w.roads) if (r.from.t === t && r.from.id === id) set.add(R.Data.roadClasses[r.cls].name.toLowerCase()); return Array.from(set); }
  App.showCard = function (sel) {
    const c = U.$('card'), w = App.world; c.textContent = '';
    if (!sel) { c.hidden = true; return; }
    const dl = U.el('dl'), kv = (k, v) => { if (v === undefined || v === null || v === '') return; dl.append(U.el('dt', { text: k }), U.el('dd', { text: String(v) })); };
    const reg = i => (i >= 0 ? w.regions[i].name + ' (' + w.provinces[w.regions[i].province].name + ')' : 'відкрите море');
    const kmCoord = o => Math.round(o.x * w.params.kmPerCell) + ' / ' + Math.round(o.y * w.params.kmPerCell) + ' км';
    let title = '', sub = '', hook = '', cell = -1;
    if (sel.t === 's') {
      const s = sel.o; title = s.name; sub = R.Data.ranks[s.rank].name + ' · ' + R.Data.states[s.state].name; cell = s.cell;
      kv('Регіон', reg(s.region)); kv('Населення', s.pop ? s.pop.toLocaleString('uk') : 'ніхто не живе'); kv('Порт', s.port ? 'так' : ''); kv('Товари', (s.goods || []).join(', ')); if (s.ore) kv('Видобуток', s.oreName);
      if (s.occupant) kv('Захопили', s.occupant.name); kv('Дороги', roadsOf(w, 's', s.id).join(', ') || (s.rank === 'capital' || s.rank === 'regional' ? 'вузол великих доріг' : 'немає')); kv('Координати', kmCoord(s)); hook = s.hook;
      if (s.rank === 'regional' || s.rank === 'capital') { const r = w.regions[s.region]; kv('Площа регіону', Math.round(r.cells * w.params.kmPerCell ** 2).toLocaleString('uk') + ' км²'); }
    } else if (sel.t === 'p') {
      const o = sel.o, def = R.Data.poi[o.type]; title = o.name; sub = def.name + ' · ' + (def.cls === 'major' ? 'мала дорога' : 'стежка'); cell = o.cell;
      kv('Регіон', reg(o.region)); kv('Місцевість', R.Data.biomes[w.bio[o.cell]].name); kv('Координати', kmCoord(o)); if (o.size) kv('Площа', Math.round(o.size * w.params.kmPerCell ** 2) + ' км²'); hook = o.hook;
    } else if (sel.t === 'l') {
      const l = sel.o; title = l.monster + (l.alias ? ' / ' + l.alias : ''); sub = R.Data.lairKinds[l.kind] + ' · ' + (l.domain === 'sea' ? 'море' : l.domain === 'forest' ? 'ліс' : 'гори') + ' · ' + R.Data.tierNames[l.tier]; cell = l.cell;
      kv('Регіон', reg(l.region)); kv('Місцевість', R.Data.biomes[w.bio[l.cell]].name); kv('Радіус небезпеки', Math.round(l.radius * w.params.kmPerCell) + ' км'); kv('Стежка', l.domain === 'sea' ? '' : (l.trail ? 'є' : 'немає (дике місце)')); kv('Координати', kmCoord(l)); hook = l.hook;
    } else if (sel.t === 'r') {
      const r = sel.o, c0 = w.settlements[r.center]; title = r.name; sub = 'Регіон · ' + w.provinces[r.province].name; cell = r.anchor;
      kv('Центр', c0.name + ' (' + R.Data.ranks[c0.rank].name.toLowerCase() + ')'); kv('Площа', Math.round(r.cells * w.params.kmPerCell ** 2).toLocaleString('uk') + ' км²');
      const mine = w.settlements.filter(s => s.region === r.id); kv('Поселень', mine.length); kv('Культура', w.provinces[r.province].cultureName);
    }
    c.append(U.el('button', { class: 'x', text: '×', title: 'Закрити картку', onclick: () => { App.scene.sel = null; c.hidden = true; App.scene.dirty = true; } }), U.el('h3', { text: title }), U.el('div', { class: 'sub', text: sub }), dl);
    if (hook) c.append(U.el('div', { class: 'hook', text: hook }));
    if (cell >= 0) c.append(U.el('div', { class: 'acts' }, [
      U.el('button', { text: 'Наблизити', title: 'Підлетіти до об’єкта', onclick: () => { App.scene.focusCell(cell, Math.max(App.scene.view.k, 16)); } }),
      U.el('button', { text: 'Точка A', title: 'Зробити початком подорожі', onclick: () => { App.setPin('A', cell); U.toast('Точка A поставлена'); } }),
      U.el('button', { text: 'Точка B', title: 'Зробити кінцем подорожі', onclick: () => { App.setPin('B', cell); U.toast('Точка B поставлена'); } })]));
    c.hidden = false;
  };
})();
