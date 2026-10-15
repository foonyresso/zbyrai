// Вкладка «Подорож»: шлях між двома точками з урахуванням доріг, рельєфу й небезпеки.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  const CLS = { major: 'великі дороги', medium: 'середні дороги', minor: 'малі дороги', trail: 'стежки', offroad: 'без дороги' };

  App.buildTravelPanel = function () {
    const pn = U.$('pnTravel'); pn.textContent = ''; const w = App.world; if (!w) return;
    const list = w.settlements.filter(s => s.state !== 'ruined').slice().sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    const mk = (id, title) => { const sel = U.el('select', { id, title }); sel.append(U.el('option', { value: '', text: '— не вибрано —' })); for (const s of list) sel.append(U.el('option', { value: s.id, text: s.name + ' · ' + R.Data.ranks[s.rank].name.toLowerCase() })); return sel; };
    const selA = mk('selA', 'Початок подорожі: поселення'), selB = mk('selB', 'Кінець подорожі: поселення');
    const avoid = U.el('input', { type: 'range', min: 0, max: 1, step: 0.1, value: 0.5, title: 'Наскільки сильно обходити лігва й небезпечні місця: 0 — найкоротший шлях, 1 — максимально безпечний' });
    const res = U.el('div', { class: 'res', text: 'Обери дві точки: у списках, кнопками «A/B на карті» або в картці об’єкта.' });
    pn.append(U.el('h2', { text: 'Маршрут' }),
      U.el('label', { class: 'ctl', title: 'Початок подорожі' }, [U.el('span', { text: 'Точка A' }), U.el('span'), selA]),
      U.el('label', { class: 'ctl', title: 'Кінець подорожі' }, [U.el('span', { text: 'Точка B' }), U.el('span'), selB]),
      U.el('div', { class: 'row' }, [
        U.el('button', { text: 'A на карті', title: 'Клікни по карті, щоб поставити точку A', onclick: () => { App.pick = 'A'; U.toast('Клікни по карті: точка A'); } }),
        U.el('button', { text: 'B на карті', title: 'Клікни по карті, щоб поставити точку B', onclick: () => { App.pick = 'B'; U.toast('Клікни по карті: точка B'); } })]),
      U.el('label', { class: 'ctl', title: avoid.title }, [U.el('span', { text: 'Обхід небезпеки' }), U.el('span'), avoid]),
      U.el('button', { class: 'btn-primary big', text: 'Прокласти шлях', title: 'Знайти найшвидший шлях по дорогах і місцевості між A та B', onclick: go }),
      U.el('button', { class: 'big', text: 'Очистити', title: 'Прибрати шлях і точки з карти', onclick: () => { App.scene.route = null; App.scene.pins = {}; selA.value = selB.value = ''; res.textContent = 'Шлях прибрано.'; App.scene.dirty = true; } }),
      res,
      U.el('p', { class: 'hint', text: 'Швидкість пішки: великі дороги 34, середні 28, малі 22, стежки 14 км/добу; поза дорогою від 3 до 24 км/добу залежно від місцевості. Броди без мосту вдвічі повільніші.' }));
    selA.addEventListener('change', () => { if (selA.value) App.setPin('A', w.settlements[+selA.value].cell); });
    selB.addEventListener('change', () => { if (selB.value) App.setPin('B', w.settlements[+selB.value].cell); });
    function go() {
      const a = App.scene.pins.A, b = App.scene.pins.B; if (a === undefined || b === undefined) { res.textContent = 'Постав обидві точки.'; return; }
      const r = R.Planner.planRoute(w, a, b, { avoidDanger: +avoid.value });
      if (!r) { res.textContent = 'Шляху суходолом немає: точки на різних островах. Спробуй морський шлях між портами.'; App.scene.route = null; App.scene.dirty = true; return; }
      App.scene.route = r; App.scene.dirty = true;
      const parts = Object.entries(r.byClass).filter(([, v]) => v > 0).map(([k, v]) => CLS[k] + ' ' + Math.round(v) + ' км').join(', ');
      res.textContent = '';
      const line = (b, t) => res.append(U.el('div', {}, [U.el('b', { text: b }), document.createTextNode(' ' + t)]));
      line('Відстань:', r.lenKm + ' км'); line('Час пішки:', r.days + ' діб'); line('Складається з:', parts);
      line('Небезпека:', r.rating + ' (макс. ' + r.maxDanger + ')');
      if (r.lairs.length) line('Поруч лігва:', r.lairs.map(i => w.lairs[i].name.replace(/^[^:]+: /, '')).slice(0, 8).join(', '));
      if (r.towns.length) line('Повз:', r.towns.slice(0, 10).map(i => w.settlements[i].name).join(', '));
    }
    App.syncTravel = () => { selA.value = selB.value = ''; };
  };
  App.setPin = function (key, cell) {
    App.scene.pins[key] = cell; App.pick = null; App.scene.dirty = true;
    const sel = U.$(key === 'A' ? 'selA' : 'selB'); if (sel) { const s = App.world.settlements.find(s => s.cell === cell); sel.value = s ? s.id : ''; }
  };
})();
