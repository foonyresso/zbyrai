// Єдина підказка при наведенні для всіх вимірів: заголовок, тип і групи рядків «назва: значення» (Місце, Природа, Населення, Монстри). Підписів на карті немає.
// Вимір лише додає свої дані через тему (render/themes.js): biomeNames { id: назва }, biomeNotes { id: опис }, tipExtra(об'єкт, світ) → [{ name, rows }].
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  const BIOME_FEATURE = { mountain: 'range', peaks: 'range', hills: 'range', forest: 'forest', taiga: 'forest', enchanted: 'forest', desert: 'desert', swamp: 'swamp', wasteland: 'wasteland', deep: 'sea', sea: 'sea' };
  const DOMAIN = { sea: 'море', forest: 'ліс', mountain: 'гори' };
  const MAX_NEAR = 3, NEAR_KM = 40;

  const theme = () => R.Palette.theme;
  const biomeName = b => (theme().biomeNames || {})[b.id] || b.name;
  const accent = () => theme().accent || theme().roads.major;
  const km = (w, cells) => Math.round(cells * w.params.kmPerCell);
  const num = n => n.toLocaleString('uk');

  function regionLine(w, i) { return i >= 0 ? w.regions[i].name + ' (' + w.provinces[w.regions[i].province].name + ')' : 'відкрите море'; }
  function placeRows(w, o, cell) {
    const rows = [['Регіон', regionLine(w, o.region !== undefined ? o.region : w.region[cell])], ['Координати', km(w, o.x) + ' / ' + km(w, o.y) + ' км']];
    return rows;
  }
  function natureRows(w, cell) {
    const b = R.Data.biomes[w.bio[cell]], rows = [['Місцевість', biomeName(b)]], note = (theme().biomeNotes || {})[b.id];
    if (note) rows.push(['Особливість', note]);
    const ft = BIOME_FEATURE[b.id], g = w.grid;
    if (ft) for (const f of w.features) if (f.type === ft && Math.hypot(g.cx[cell] - f.x, g.cy[cell] - f.y) < Math.sqrt(f.size) * 0.7) { rows.push([ft === 'sea' ? 'Акваторія' : 'Назва краю', f.name]); break; }
    return rows;
  }
  function roadsOf(w, t, id) { const set = new Set(); for (const r of w.roads) if (r.from.t === t && r.from.id === id) set.add(R.Data.roadClasses[r.cls].name.toLowerCase()); return Array.from(set); }
  function monstersNear(w, o) {
    const out = [];
    for (const l of w.lairs) { if (l === o) continue; const d = Math.hypot(l.x - o.x, l.y - o.y) * w.params.kmPerCell; if (d <= NEAR_KM) out.push([d, l]); }
    out.sort((a, b) => a[0] - b[0]);
    return out.slice(0, MAX_NEAR).map(([d, l]) => [l.monster + (l.alias ? ' / ' + l.alias : ''), R.Data.tierNames[l.tier] + ' · ' + Math.round(d) + ' км']);
  }

  // Збирає опис { title, kind, groups, hook } для влучання сцени (h) або клітинки (cell)
  function describe(h, cell) {
    const w = App.world, groups = [], add = (name, rows) => { rows = rows.filter(r => r[1] !== undefined && r[1] !== null && r[1] !== ''); if (rows.length) groups.push({ name, rows }); };
    let title, kind, hook = '', o = null;
    if (h && h.t === 's') {
      o = h.o; title = o.name; kind = R.Data.ranks[o.rank].name + (o.state !== 'normal' ? ' · ' + R.Data.states[o.state].name : ''); hook = o.hook;
      add('Місце', placeRows(w, o, o.cell).concat([['Порт', o.port ? 'так' : ''], ['Дороги', roadsOf(w, 's', o.id).join(', ') || (o.rank === 'capital' || o.rank === 'regional' ? 'вузол великих доріг' : 'немає')]]));
      add('Природа', natureRows(w, o.cell).slice(0, 2));
      add('Населення', [['Мешканців', o.pop ? num(o.pop) : 'ніхто не живе'], ['Раси', o.races ? o.races.slice(0, 5).map(q => q.name + ' ' + Math.round(q.share * 100) + '%').join(', ') + (o.races.length > 5 ? ' та ще ' + (o.races.length - 5) : '') : ''], ['Товари', (o.goods || []).join(', ')], ['Видобуток', o.ore ? o.oreName : ''], ['Захопили', o.occupant ? o.occupant.name : '']]);
      add('Монстри', monstersNear(w, o));
    } else if (h && h.t === 'p') {
      o = h.o; const def = R.Data.poi[o.type]; title = o.name; kind = def.name + ' · ' + (def.cls === 'major' ? 'мала дорога' : 'стежка'); hook = o.hook;
      add('Місце', placeRows(w, o, o.cell).concat([['Площа', o.size ? num(Math.round(o.size * w.params.kmPerCell ** 2)) + ' км²' : '']]));
      add('Природа', natureRows(w, o.cell));
      add('Монстри', monstersNear(w, o));
    } else if (h && h.t === 'l') {
      o = h.o; title = o.monster + (o.alias ? ' / ' + o.alias : ''); kind = R.Data.lairKinds[o.kind] + ' · ' + R.Data.tierNames[o.tier]; hook = o.hook;
      add('Місце', placeRows(w, o, o.cell).concat([['Стежка', o.domain === 'sea' ? '' : (o.trail ? 'є' : 'немає (дике місце)')]]));
      add('Природа', [['Середовище', DOMAIN[o.domain]]].concat(natureRows(w, o.cell)));
      add('Монстри', [['Радіус небезпеки', km(w, o.radius) + ' км'], ['Рівень', R.Data.tierNames[o.tier]]]);
    } else if (cell >= 0) {
      const b = R.Data.biomes[w.bio[cell]], land = w.water[cell] === 0; title = biomeName(b); kind = land ? 'Місцевість' : 'Води';
      if (land) {
        const rl = w.roadLevel[cell], road = rl ? Object.values(R.Data.roadClasses).find(r => r.level === rl).name.toLowerCase() : '';
        add('Місце', [['Провінція', w.provinces[w.province[cell]].name], ['Регіон', w.regions[w.region[cell]].name], ['Дорога', road]]);
      }
      add('Природа', natureRows(w, cell).slice(1));
    } else return null;
    const extra = theme().tipExtra; if (extra) for (const g of extra(o, w, cell) || []) add(g.name, g.rows);
    return { title, kind, groups, hook };
  }

  // Малює підказку в елемент #tip
  function render(d) {
    const tip = U.$('tip'); tip.textContent = ''; tip.style.setProperty('--tip-accent', accent());
    tip.append(U.el('div', { class: 'tt-title', text: d.title }), U.el('div', { class: 'tt-kind', text: d.kind }));
    for (const g of d.groups) {
      const dl = U.el('dl'); for (const [k, v] of g.rows) dl.append(U.el('dt', { text: k }), U.el('dd', { text: String(v) }));
      tip.append(U.el('div', { class: 'tt-group' }, [U.el('div', { class: 'tt-gname', text: g.name }), dl]));
    }
    if (d.hook) tip.append(U.el('div', { class: 'tt-hook', text: d.hook }));
  }
  function show(d, x, y) {
    const tip = U.$('tip'), W = App.scene.W, H = App.scene.H; render(d); tip.hidden = false;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = Math.max(4, x + 16 + tw > W ? x - tw - 12 : x + 16) + 'px'; tip.style.top = Math.max(4, Math.min(y + 16, H - th - 4)) + 'px';
  }
  U.Tooltip = { describe, show, hide: () => { U.$('tip').hidden = true; } };
})();
