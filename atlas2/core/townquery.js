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
      if (t.pop[1] > 0) rows.push([['Житлова', 'Добування'].includes(t.cat) ? 'Мешканців' : 'Працює · мешкає', String(o.pop)]);
      return { title: o.cond === 'ruined' ? 'Руїни: ' + o.name.toLowerCase() : o.name, sub: t.n + ' · ' + t.cat + (d ? ' · ' + d.name : ''), color: o.cond === 'lair' ? '#c0452f' : t.col, rows, text: o.cond === 'ruined' ? 'Стіни ще стоять, дах давно провалився. ' + t.d : o.cond === 'lair' ? 'Тут облаштували кубло загарбників. ' + t.d : t.d, hook: o.hook, districtId: o.district >= 0 ? o.district : null, go: 'Про район ›' };
    }
    if (h.kind === 'district') {
      const cats = Object.entries(o.cats).sort((p, q) => q[1] - p[1]), top = Object.entries(o.types).sort((p, q) => q[1] - p[1]).slice(0, 4).map(e => T[e[0]].n + ' ×' + e[1]).join(', ');
      return { title: o.name, sub: K[o.kind].n, color: o.col, rows: [['Споруд', String(o.nb)], ['Мешканців', '≈ ' + o.pop], ['Достаток', o.wealth], ['Безпека', o.safety]],
        text: o.text + ' ' + o.vibe.replace(/^./, q => q.toUpperCase()) + (c.fate === 'ruined' ? '. Нині порожньо: місто покинуте.' : c.fate === 'occupied' ? '. Нині під владою загарбників.' : '.'),
        groups: [{ h: 'За категоріями', rows: cats.map(e => [e[0], String(e[1])]) }], top: ['Найчастіше', top], streets: o.streets.slice(0, 3).join(', '), list: o.notable.slice(0, 4).map(id => ({ id, name: B[id].name })), districtId: o.id };
    }
    if (h.kind === 'street') { const d = o.district >= 0 ? c.districts[o.district] : null, n = B.filter(b => b.st === o.id).length; return { color: '#b9a37a', title: o.name, sub: { avenue: 'Головна дорога', street: 'Вулиця', lane: 'Провулок', path: 'Стежка до дороги', ring: 'Кільцева вулиця', embankment: 'Набережна' }[o.kind], rows: [['Довжина', Math.round(o.len) + ' м'], ['Ширина', Math.round(o.hw * 2) + ' м'], ['Район', d ? d.name : '—'], ['Споруд уздовж', String(n)], ['Мости', o.br.some(Boolean) ? 'є' : '—']], text: o.kind === 'avenue' ? 'Дорога, що веде за міську браму до інших поселень.' : o.kind === 'lane' ? 'Вузький провулок, де двом возам не розминутись.' : '' }; }
    if (h.kind === 'feature') { const nm = { plaza: 'Площа', park: 'Зелена зона', cemetery: 'Цвинтар' }[o.t]; return { color: o.t === 'park' ? '#6fae55' : '#c9bb98', title: o.name, sub: nm, rows: [['Радіус', Math.round(o.r) + ' м'], ['Район', o.district >= 0 ? c.districts[o.district].name : '—']], text: o.t === 'plaza' ? 'Місце зборів, торгу й міських оголошень.' : o.t === 'park' ? 'Алеї, лавки й старі дерева; вдень тут гуляють, ввечері зустрічаються за справами.' : 'Тиха земля з могилами та пам’ятними каменями.' }; }
    if (h.kind === 'prop') return { color: '#6ab0e0', title: o.name, sub: { fountain: 'Фонтан', monument: 'Пам’ятник', well: 'Колодязь' }[o.t], rows: [], text: o.t === 'fountain' ? 'Прикраса площі; діти кидають монетки на щастя.' : o.t === 'monument' ? 'Кам’яна фігура, обвита квітами та стрічками.' : 'Чиста вода для всіх мешканців.' };
    return null;
  }
  Object.assign(A.Town, { hit, describe });
})();
