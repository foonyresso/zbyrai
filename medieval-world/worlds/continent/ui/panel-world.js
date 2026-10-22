// Вкладка «Світ»: параметри генерації. Зміна будь-якого параметра перебудовує карту (з невеликою затримкою).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;

  App.buildWorldPanel = function () {
    const pn = U.$('pnWorld'); pn.textContent = ''; const P = App.params, sync = [];
    const done = () => App.regenLater();
    const s = fn => sync.push(fn.sync);
    pn.append(U.el('h2', { text: 'Основне' }));
    // зерно + випадкове
    const seedIn = U.el('input', { type: 'text', maxlength: 40, spellcheck: 'false', title: 'Зерно: код випадковості. Те саме зерно з тими самими параметрами завжди дає ту саму карту' });
    seedIn.value = P.seed; seedIn.addEventListener('change', () => { P.seed = seedIn.value.trim() || 'zbyrai'; done(); });
    pn.append(U.el('label', { class: 'ctl', title: 'Зерно: код випадковості' }, [U.el('span', { text: 'Зерно' }), U.el('span'), seedIn]));
    pn.append(U.el('div', { class: 'row' }, [
      U.el('button', { text: 'Випадкове зерно', title: 'Підставити нове випадкове зерно й одразу побудувати іншу карту', onclick: () => { P.seed = R.Rng.randSeed(); seedIn.value = P.seed; App.regenNow(); } }),
      U.el('button', { class: 'btn-primary', text: 'Згенерувати', title: 'Перебудувати карту з поточними параметрами', onclick: () => App.regenNow() }),
    ]));
    s(U.select(pn, { label: 'Розмір карти', title: 'Розмір сітки: мала 120×76, середня 168×106, велика 240×150 комірок', opts: Object.entries(R.Params.SIZES).map(([k, v]) => [k, v.name + ' (' + v.w + '×' + v.h + ')']), get: () => P.size, set: v => { P.size = v; P.provinces = R.Params.SIZES[v].provinces; sync.forEach(f => f && f()); }, done }));
    s(U.slider(pn, { label: 'Масштаб: км на комірку', min: 1, max: 10, step: 1, title: 'Скільки кілометрів у одній комірці. Впливає на довжини доріг, дні подорожі й на ширину смуги кораблів біля берега (2–4 км)', get: () => P.kmPerCell, set: v => P.kmPerCell = v, fmt: v => v + ' км', done }));
    pn.append(U.el('h2', { text: 'Політика' }));
    s(U.slider(pn, { label: 'Провінції', min: 1, max: 10, step: 1, title: 'Кількість провінцій (як країн). Кожна має столицю з найбільшим регіоном', get: () => P.provinces, set: v => P.provinces = v, done }));
    s(U.slider(pn, { label: 'Регіонів у провінції', min: 2, max: 9, step: 1, title: 'Середня кількість регіонів (областей) у провінції. Кожен регіон належить до свого міста', get: () => P.regionsPerProvince, set: v => P.regionsPerProvince = v, done }));
    s(U.slider(pn, { label: 'Щільність поселень і місць', min: 0.3, max: 2.2, step: 0.1, title: 'Скільки міст, сіл, шахт і цікавих місць на регіон', get: () => P.density, set: v => P.density = v, fmt: v => '×' + v.toFixed(1), done }));
    s(U.slider(pn, { label: 'Монстри', min: 0, max: 2.5, step: 0.1, title: 'Кількість лігв і босів у горах, лісах і морях. Нуль прибирає всіх', get: () => P.monsters, set: v => P.monsters = v, fmt: v => v === 0 ? 'немає' : '×' + v.toFixed(1), done }));
    pn.append(U.el('h2', { text: 'Природа' }));
    s(U.slider(pn, { label: 'Гірськість', min: 0, max: 1, step: 0.05, title: 'Частка гір і пагорбів на суші', get: () => P.ruggedness, set: v => P.ruggedness = v, fmt: v => Math.round(v * 100) + '%', done }));
    s(U.slider(pn, { label: 'Вологість', min: -0.3, max: 0.3, step: 0.05, title: 'Більше лісів і боліт чи більше степів і пустель', get: () => P.wet, set: v => P.wet = v, fmt: v => (v > 0 ? '+' : '') + v.toFixed(2), done }));
    s(U.slider(pn, { label: 'Тепло', min: -0.3, max: 0.3, step: 0.05, title: 'Холодніший світ із тайгою й тундрою чи спекотніший із пустелями', get: () => P.warm, set: v => P.warm = v, fmt: v => (v > 0 ? '+' : '') + v.toFixed(2), done }));
    s(U.slider(pn, { label: 'Річки', min: 0.3, max: 2.5, step: 0.1, title: 'Скільки річок і озер', get: () => P.riverDensity, set: v => P.riverDensity = v, fmt: v => '×' + v.toFixed(1), done }));
    s(U.slider(pn, { label: 'Фентезійність', min: 0, max: 2, step: 0.1, title: 'Частка зачарованих лісів і спустошених земель', get: () => P.fantasy, set: v => P.fantasy = v, fmt: v => '×' + v.toFixed(1), done }));
    pn.append(U.el('button', { class: 'big', text: 'Скинути параметри', title: 'Повернути всі параметри до значень за замовчуванням (зерно й оформлення виміру лишаються)', onclick: () => { const seed = P.seed; Object.assign(P, R.Params.defaults(), { seed, theme: P.theme }); App.buildWorldPanel(); App.regenNow(); } }));
    pn.append(U.el('p', { class: 'hint', text: 'Карта перебудовується сама після зміни параметра. Зерно й параметри потрапляють у посилання та JSON угорі.' }));
    App.syncWorld = () => { seedIn.value = P.seed; sync.forEach(f => f && f()); };
  };
})();
