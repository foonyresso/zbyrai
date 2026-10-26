// Атлас 2.0, місто: пошук об'єкта під курсором і тексти для вікна подробиць (споруда, вулиця, район, площа).
(function () {
  'use strict';
  const A = globalThis.Atlas2, T = A.CityData.T, K = A.CityData.K, X = A.CityText;
  const rectHit = (b, x, y, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y; return Math.abs(dx * c + dy * s) <= b.w / 2 + pad && Math.abs(-dx * s + dy * c) <= b.h / 2 + pad; };
  // ---- пошук і описи для інтерфейсу
  function hit(c, x, y) {
    for (const p of c.props) if (Math.hypot(p.x - x, p.y - y) < p.r + 1) return { kind: 'prop', o: p };
    const g = c.bgrid.get(Math.floor(x / c.BK) * 100003 + Math.floor(y / c.BK)); if (g) for (const id of g) if (rectHit(c.buildings[id], x, y, 0.6)) return { kind: 'building', o: c.buildings[id] };
    for (const b of c.buildings) if (Math.abs(b.x - x) < b.w && Math.abs(b.y - y) < b.w && rectHit(b, x, y, 0.6)) return { kind: 'building', o: b };
    for (const f of c.features) if (Math.hypot(f.x - x, f.y - y) < f.r) return { kind: 'feature', o: f };
    let bs = null, bd = 1e9; for (const st of c.streets) for (let i = 2; i < st.pts.length; i += 2) { const d = c.env.segDist(x, y, st.pts[i - 2], st.pts[i - 1], st.pts[i], st.pts[i + 1]) - st.hw; if (d < bd) { bd = d; bs = st; } }
    if (bs && bd < 1.5) return { kind: 'street', o: bs };
    const d = c.districtOf(x, y); if (d >= 0 && Math.hypot(x - c.c0[0], y - c.c0[1]) < c.R * 1.3) return { kind: 'district', o: c.districts[d] };
    return null;
  }
  function describe(c, h) {
    if (!h) return null; const o = h.o, B = c.buildings, rows = [];
    if (h.kind === 'building') {
      const t = T[o.type], d = o.district >= 0 ? c.districts[o.district] : null;
      rows.push(['Адреса', o.addr], ['Стан', X.COND[o.cond]], ['Достаток', X.WEALTH[o.wealth]], ['Поверхів · площа', o.floors + ' · ' + o.area + ' м²']);
      if (o.owner) rows.push([['house', 'rich', 'estate', 'slum', 'hut'].includes(o.type) ? 'Господар' : 'Власник', o.owner]);
      if (t.pop[1] > 0) rows.push([t.cat === 'Монстри' ? 'Мешкає (монстрів)' : ['Житлова', 'Добування'].includes(t.cat) ? 'Мешканців' : t.cat === 'Оборона' ? 'Гарнізон' : 'Працює · мешкає', String(o.pop)]);
      if (o.rampart) rows.push(['Ділянка стіни', (o.u < 0 ? '−' : '+') + Math.abs(o.u) + ' м від осі міста']); if (o.was) rows.push(['Раніше', o.was]);
      const sf = o.site && c.sites.find(f => f.name === o.site); if (sf) rows.unshift(['Місце', sf.sub]);
      if (o.dungeon) rows.push(['Вхід у підземелля', o.dungeon.id]);
      return { title: o.cond === 'ruined' ? 'Руїни: ' + o.name.toLowerCase() : o.name, sub: t.n + ' · ' + t.cat + (d ? ' · ' + d.name : ''), color: o.cond === 'lair' && t.cat !== 'Монстри' ? '#c0452f' : t.col, rows, text: o.cond === 'ruined' ? 'Стіни ще стоять, дах давно провалився. ' + t.d : o.cond === 'lair' && t.cat !== 'Монстри' ? 'Тут облаштували кубло загарбників. ' + t.d : (o.was ? 'Раніше тут була споруда «' + o.was.toLowerCase() + '», тепер її переробили на свій лад. ' : '') + t.d, hook: o.hook || (sf && sf.history) || null, districtId: o.district >= 0 ? o.district : null, go: 'Про район ›' };
    }
    if (h.kind === 'district') {
      const cats = Object.entries(o.cats).sort((p, q) => q[1] - p[1]), top = Object.entries(o.types).sort((p, q) => q[1] - p[1]).slice(0, 4).map(e => T[e[0]].n + ' ×' + e[1]).join(', ');
      return { title: o.name, sub: K[o.kind].n, color: o.col, rows: [['Споруд', String(o.nb)], ['Мешканців', '≈ ' + o.pop], ['Достаток', o.wealth], ['Безпека', o.safety]],
        text: o.text + ' ' + o.vibe.replace(/^./, q => q.toUpperCase()) + (c.fate === 'ruined' ? '. Нині порожньо: місто покинуте.' : c.fate === 'occupied' ? '. Нині під владою загарбників.' : '.'),
        groups: [{ h: 'За категоріями', rows: cats.map(e => [e[0], String(e[1])]) }], top: ['Найчастіше', top], streets: o.streets.slice(0, 3).join(', '), list: o.notable.slice(0, 4).map(id => ({ id, name: B[id].name })), districtId: o.id };
    }
    if (h.kind === 'street') { const d = o.district >= 0 ? c.districts[o.district] : null, n = B.filter(b => b.st === o.id).length; return { color: '#b9a37a', title: o.name, sub: { avenue: 'Головна дорога', street: 'Вулиця', lane: 'Провулок', path: 'Дорога за місто', ring: 'Кільцева вулиця', embankment: 'Набережна' }[o.kind], rows: [['Довжина', Math.round(o.len) + ' м'], ['Ширина', Math.round(o.hw * 2) + ' м'], ['Район', d ? d.name : '—'], ['Споруд уздовж', String(n)], ['Мости', o.br.some(Boolean) ? 'є' : '—']], text: o.kind === 'avenue' ? 'Дорога, що веде за міську браму до інших поселень.' : o.kind === 'lane' ? 'Вузький провулок, де двом возам не розминутись.' : '' }; }
    if (h.kind === 'feature' && o.t === 'site') return { color: '#b08a5a', title: o.name, sub: o.sub, rows: [['Радіус', Math.round(o.r) + ' м'], ['Споруд', String(c.buildings.filter(b => b.site === o.name).length)]].concat(o.rows || []), text: o.text, list: c.buildings.filter(b => b.site === o.name).slice(0, 6).map(b => ({ id: b.id, name: b.name })) };
    if (h.kind === 'feature' && o.t === 'pond') return { color: '#5b9cc0', title: o.name, sub: 'Ставок', rows: [['Радіус', Math.round(o.rad) + ' м'], ['Глибина', '1–3 м']], text: { park: 'Тихий ставок у парку: качки, лілеї й лавки на березі.', farm: 'Ставок для поливу, худоби й риби поруч із фермою.', farmstead: 'Невеликий ставок, який живить садибу й город.', mill: 'Млиновий ставок дає воду для колеса.', windmill: 'Ставок поруч із вітряком: поять худобу й ловлять карасів.' }[o.why] || 'Невеликий ставок поруч із садибою.' };
    if (h.kind === 'feature') { const nm = { plaza: 'Площа', park: 'Зелена зона', cemetery: 'Цвинтар' }[o.t]; return { color: o.t === 'park' ? '#6fae55' : '#c9bb98', title: o.name, sub: nm, rows: [['Радіус', Math.round(o.r) + ' м'], ['Район', o.district >= 0 ? c.districts[o.district].name : '—']], text: o.t === 'plaza' ? 'Місце зборів, торгу й міських оголошень.' : o.t === 'park' ? 'Алеї, лавки й старі дерева; вдень тут гуляють, ввечері зустрічаються за справами.' : 'Тиха земля з могилами та пам’ятними каменями.' }; }
    if (h.kind === 'prop') return { color: '#6ab0e0', title: o.name, sub: { fountain: 'Фонтан', monument: 'Пам’ятник', well: 'Колодязь' }[o.t], rows: [], text: o.t === 'fountain' ? 'Прикраса площі; діти кидають монетки на щастя.' : o.t === 'monument' ? 'Кам’яна фігура, обвита квітами та стрічками.' : 'Чиста вода для всіх мешканців.' };
    return null;
  }
  Object.assign(A.Town, { hit, describe });
})();
