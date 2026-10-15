// Вкладка «Довідник»: дерево провінцій → регіонів → міст, бестіарій гір, лісів і морів, умовні позначки та підсумок.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  const TIER = { 1: '', 2: ' (міні-бос)', 3: ' (бос)' };

  App.buildGuidePanel = function () {
    const pn = U.$('pnGuide'); pn.textContent = ''; const w = App.world; if (!w) return;
    const km2 = c => Math.round(c * w.params.kmPerCell * w.params.kmPerCell).toLocaleString('uk');
    const st = w.stats;
    pn.append(U.el('h2', { text: 'Підсумок' }));
    const sum = U.el('div', { class: 'res' });
    const add = (b, t) => sum.append(U.el('div', {}, [U.el('b', { text: b }), document.createTextNode(' ' + t)]));
    add('Суша:', km2(st.land) + ' км² · провінцій ' + st.provinces + ' · регіонів ' + st.regions);
    add('Поселення:', Object.entries(st.settlements).map(([k, v]) => R.Data.ranks[k].name.toLowerCase() + ' ' + v).join(', '));
    add('Стани:', Object.entries(st.states).map(([k, v]) => R.Data.states[k].name.toLowerCase() + ' ' + v).join(', '));
    add('Дороги (км):', Object.entries(st.roadKm).map(([k, v]) => R.Data.roadClasses[k].name.toLowerCase() + ' ' + Math.round(v)).join(', '));
    add('Морські шляхи:', st.seaRoutes + ' · портів ' + st.ports + ' · мостів ' + st.bridges);
    add('Лігва:', 'звичайних ' + st.lairs.tier1 + ', міні-босів ' + st.lairs.tier2 + ', босів ' + st.lairs.tier3 + ' (з них у морі ' + st.lairs.sea + ')');
    pn.append(sum);

    pn.append(U.el('h2', { text: 'Провінції та регіони' }));
    const tree = U.el('div', { class: 'tree' });
    const link = (s, txt) => U.el('a', { text: txt || s.name, title: 'Показати на карті: ' + s.name, onclick: () => App.focusObject({ t: 's', o: s }) });
    for (const pv of w.provinces) {
      const d = U.el('details'), sm = U.el('summary', { text: pv.name + (pv.peopleName ? ' (' + pv.peopleName + ')' : '') + ' · ' + pv.regions.length + ' рег. · ' + km2(pv.cells) + ' км²', title: 'Провінція: ' + pv.cultureName + ' культура' + (pv.peopleName ? ', народ: ' + pv.peopleName : '') });
      sm.style.color = R.Palette.provinceSolid(pv.hue).replace('38%', '70%'); d.append(sm);
      const ul = U.el('ul');
      for (const rid of pv.regions) {
        const r = w.regions[rid], c = w.settlements[r.center], towns = w.settlements.filter(s => s.region === rid && s.rank === 'town');
        const li = U.el('li', {}, [document.createTextNode((c.rank === 'capital' ? '★ ' : '') + 'регіон · '), link(c), document.createTextNode(' · ' + km2(r.cells) + ' км²' + (towns.length ? ' · містечка: ' : ''))]);
        towns.forEach((t, i) => { if (i) li.append(', '); li.append(link(t)); });
        ul.append(li);
      }
      d.append(ul); tree.append(d);
    }
    pn.append(tree);

    pn.append(U.el('h2', { text: 'Бестіарій' }));
    const best = U.el('div', { class: 'bestiary' });
    for (const dom of [R.Data.mountain, R.Data.forest, R.Data.sea]) {
      const d = U.el('details'); d.append(U.el('summary', { text: dom.name + ' · ' + dom.monsters.length + ' видів, ' + dom.bosses.length + ' босів', title: 'Монстри й боси: ' + dom.name.toLowerCase() }));
      d.append(U.el('p', { text: 'Лігва: ' + dom.monsters.join(', ') + '.' }));
      const p = U.el('p'); p.append('Боси: ');
      dom.bosses.forEach((b, i) => { p.append(U.el('span', { class: 'tier' + b.tier, text: b.n + (b.variants ? ' (' + b.variants.join(' / ') + ')' : '') + (b.alias ? ' / ' + b.alias : '') + TIER[b.tier] })); if (i < dom.bosses.length - 1) p.append(', '); });
      d.append(p); best.append(d);
    }
    pn.append(best);

    pn.append(U.el('h2', { text: 'Позначки' }));
    const lg = U.el('div', { class: 'legend' });
    const row = (draw, txt) => { const c = document.createElement('canvas'); c.width = 52; c.height = 36; const x = c.getContext('2d'); draw(x); lg.append(c, U.el('span', { text: txt })); };
    const line = (col, wd, dash) => x => { x.strokeStyle = col; x.lineWidth = wd * 1.6; x.setLineDash(dash || []); x.beginPath(); x.moveTo(2, 18); x.lineTo(50, 18); x.stroke(); };
    row(line('#e2c27f', 5), 'Велика дорога: між центрами регіонів'); row(line('#d1a967', 3.5), 'Середня: до менших міст'); row(line('#6b4a2a', 2), 'Мала: до сіл, шахт, значних місць'); row(line('#6b4a2a', 1.6, [4, 5]), 'Стежка: дрібні місця, лігва'); row(line('#6fb7e8', 2, [8, 6]), 'Морський шлях між портами');
    row(x => R.IconsSettlements.drawSettlement(x, { rank: 'capital', state: 'normal' }, 26, 30, 1.1), 'Столиця провінції'); row(x => R.IconsSettlements.drawSettlement(x, { rank: 'regional', state: 'normal' }, 26, 30, 1.2), 'Центр регіону'); row(x => R.IconsSettlements.drawSettlement(x, { rank: 'town', state: 'normal', port: true }, 22, 26, 1.3), 'Містечко (якір: порт)');
    row(x => R.IconsSettlements.drawSettlement(x, { rank: 'village', state: 'ruined' }, 26, 26, 1.5), 'Зруйноване / покинуте (сіре)'); row(x => R.IconsSettlements.drawSettlement(x, { rank: 'village', state: 'occupied' }, 22, 28, 1.5), 'Захоплене монстрами (череп)');
    row(x => R.IconsPlaces.drawLair(x, { tier: 1, kind: 'lair', domain: 'mountain' }, 26, 18, 1.5, 0), 'Лігво'); row(x => R.IconsPlaces.drawLair(x, { tier: 2, kind: 'boss', domain: 'forest' }, 26, 18, 1.4, 0), 'Міні-бос'); row(x => R.IconsPlaces.drawLair(x, { tier: 3, kind: 'boss', domain: 'sea' }, 26, 18, 1.3, 0), 'Бос (море — синій)');
    pn.append(lg);
  };
})();
