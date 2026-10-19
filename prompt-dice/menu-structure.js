// Ієрархічне меню конструктора: меню → групи параметрів. Конкретні теги лишаються в картках робочої панелі.
(function () {
  const nav = document.getElementById('forgePrimaryNav');
  if (!nav || typeof workTabs !== 'function') return;

  const menu = [
    { title: 'Персонаж', icon: '♙', groups: [
      { title: 'Загальні характеристики', query: 'gender age race skin build breasts hips limbs permFeat' },
      { title: 'Голова', children: [
        { title: 'Форма та риси обличчя', query: 'облич ніс рот' },
        { title: 'Очі', query: 'очі eye' },
        { title: 'Брови та вії', query: 'брови вії' },
        { title: 'Волосся та зачіска', query: 'волос зачіск' },
        { title: 'Шкіра обличчя', query: 'шкір skin' },
        { title: 'Макіяж і прикраси обличчя', query: 'макіяж пірсинг прикрас' }
      ]},
      { title: 'Індивідуальні особливості', query: 'raceFeat permFeat деталі' }
    ]},
    { title: 'Емоції та міміка', icon: '☺', groups: [
      { title: 'Емоційний стан', query: 'emotion емоц' },
      { title: 'Вираз обличчя', query: 'expression вираз' },
      { title: 'Погляд і міміка', query: 'eyeExpr gaze погляд' }
    ]},
    { title: 'Одяг та аксесуари', icon: '♧', groups: [
      { title: 'Стиль і комплект одягу', query: 'outfit одяг броня' },
      { title: 'Верхній одяг', query: 'верхній куртк пальт' },
      { title: 'Одяг верхньої частини тіла', query: 'сороч футбол топ' },
      { title: 'Одяг нижньої частини тіла', query: 'legwear штани спідниц' },
      { title: 'Білизна та домашній одяг', query: 'білизна піжам' },
      { title: 'Взуття', query: 'footwear взут' },
      { title: 'Головні убори', query: 'headwear головний убір' },
      { title: 'Рукавички та рукави', query: 'gloves рукавиц рукав' },
      { title: 'Прикраси й аксесуари', query: 'accessories аксесуар прикрас' },
      { title: 'Матеріали, кольори та стан', query: 'матеріал колір стан одягу' }
    ]},
    { title: 'Поза та рух', icon: '♟', groups: [
      { title: 'Загальна поза', query: 'pose поза' },
      { title: 'Положення корпусу', query: 'корпус' },
      { title: 'Положення рук і ніг', query: 'armPos legPos положення рук ніг' },
      { title: 'Жести', query: 'жест' },
      { title: 'Дія та рух', query: 'action дія рух' }
    ]},
    { title: 'Взаємодії', icon: '♧', groups: [
      { title: 'Взаємодія з персонажами', query: 'interaction персонаж контакт' },
      { title: 'Взаємодія з предметами', query: 'предмет утримування' },
      { title: 'Взаємодія з оточенням', query: 'оточення середовище' }
    ]},
    { title: 'Камера та композиція', icon: '▣', groups: [
      { title: 'Кадрування', query: 'framing кадр кадрування' },
      { title: 'Ракурс і перспектива', query: 'cameraAngle ракурс перспектива' },
      { title: 'Напрямок погляду', query: 'gaze погляд' },
      { title: 'Композиція кадру', query: 'композиція' }
    ]},
    { title: 'Сцена й оточення', icon: '▧', groups: [
      { title: 'Тип локації', query: 'io локація інтер’єр екстер’єр' },
      { title: 'Фон і об’єкти', query: 'background fgObjects фон' },
      { title: 'Час доби та погода', query: 'timeOfDay weather погода' }
    ]},
    { title: 'Світло та ефекти', icon: '✦', groups: [
      { title: 'Освітлення', query: 'lighting освітлення' },
      { title: 'Тіні та відблиски', query: 'shadows тіні' },
      { title: 'Атмосфера та кольорова гама', query: 'atmosphere colorScheme атмосфера колір' },
      { title: 'Ефекти', query: 'effects ефекти магія' },
      { title: 'Матеріали й деталі', query: 'materials details finalAccent деталі' }
    ]},
    { title: 'Стиль і якість', icon: '◈', groups: [
      { title: 'Візуальний стиль', query: 'стиль style' },
      { title: 'Технічні параметри', query: 'якість параметри' }
    ]}
  ];

  const tabs = workTabs();
  const getTab = (needles) => {
    const ns = needles.toLowerCase().split(/\\s+/).filter(Boolean);
    return tabs.find(t => ns.some(n => (t.t + ' ' + t.e).toLowerCase().includes(n))) || tabs[0];
  };
  window.matchQ = function (id) {\n    if (!wQuery) return true;\n    const sl = SLOTS[id];\n    const q = wQuery.toLowerCase().split(/\\s+/).filter(Boolean);\n    const label = (sl.label + ' ' + id + ' ' + (MK_PART_UA[slotParts(sl)[0]] || '')).toLowerCase();\n    return q.some(term => label.includes(term));\n  };\n\n  function activate(query, parent) {
    const q = query || '';
    const lower = q.toLowerCase();
    let tab;
    if (/одяг|аксесуар|взут|білизна|куртк|сороч|outfit|legwear|footwear|gloves|headwear/.test(lower)) tab = getTab('одяг');
    else if (/фон|локац|weather|background|lighting|ефект|атмосфер|час доби|освітлен/.test(lower)) tab = getTab('фон');
    else if (/pose|поз|жест|рух|interaction|дія|корпус|положення/.test(lower)) tab = getTab('поза');
    else if (/framing|camera|кадр|ракурс|перспектив|композиці|погляд/.test(lower)) tab = getTab('поза');
    else tab = getTab('персонаж');
    if (tab) {
      st.wtab = tab.id;
      if (typeof save === 'function') save();
      if (typeof renderTabs === 'function') renderTabs();
      if (typeof renderWork === 'function') renderWork();
    }
    const search = document.getElementById('wSearch');
    if (search) {
      const firstUseful = q.split(/\\s+/).find(x => x.length > 3 && !/gender|age|race|skin|build|emotion|expression|outfit|pose|interaction|framing|cameraAngle|background|lighting|effects|details|materials|gaze|armPos|legPos|permFeat|raceFeat|eyeExpr|fgObjects|timeOfDay|colorScheme/.test(x));
      search.value = firstUseful || '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    nav.querySelectorAll('.forge-nav-item').forEach(b => b.classList.toggle('active', b.dataset.query === q));
    if (parent) {
      const d = parent.closest('details');
      if (d) d.open = true;
    }
  }
  nav.innerHTML = '';
  menu.forEach(section => {
    const details = document.createElement('details');
    details.className = 'forge-nav-group';
    const summary = document.createElement('summary');
    summary.innerHTML = '<span class="forge-group-icon" aria-hidden="true">' + section.icon + '</span><span class="forge-group-label"></span><span class="forge-chevron" aria-hidden="true">⌄</span>';
    summary.querySelector('.forge-group-label').textContent = section.title;
    details.appendChild(summary);
    const children = document.createElement('div');
    children.className = 'forge-nav-children';
    section.groups.forEach(group => {
      if (group.children) {
        const nested = document.createElement('details');
        nested.className = 'forge-nav-subgroup';
        const h = document.createElement('summary');
        h.textContent = group.title;
        nested.appendChild(h);
        const inner = document.createElement('div');
        inner.className = 'forge-nav-children';
        group.children.forEach(item => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'forge-nav-item'; b.dataset.query = item.query;
          b.innerHTML = '<span class="forge-item-label"></span>';
          b.querySelector('.forge-item-label').textContent = item.title;
          b.onclick = () => activate(item.query, b);
          inner.appendChild(b);
        });
        nested.appendChild(inner); children.appendChild(nested);
      } else {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'forge-nav-item'; b.dataset.query = group.query;
        b.innerHTML = '<span class="forge-item-label"></span>';
        b.querySelector('.forge-item-label').textContent = group.title;
        b.onclick = () => activate(group.query, b);
        children.appendChild(b);
      }
    });
    details.appendChild(children);
    details.addEventListener('toggle', () => {
      if (details.open) nav.querySelectorAll(':scope > .forge-nav-group[open]').forEach(other => { if (other !== details) other.open = false; });
    });
    nav.appendChild(details);
  });
  const search = document.getElementById('forgeNavSearch');
  if (search) search.addEventListener('input', () => {
    const q = search.value.trim().toLocaleLowerCase('uk');
    nav.querySelectorAll('.forge-nav-item').forEach(b => { b.hidden = !!q && !b.textContent.toLocaleLowerCase('uk').includes(q); });
    nav.querySelectorAll('.forge-nav-group').forEach(d => {
      if (q && d.querySelector('.forge-nav-item:not([hidden])')) d.open = true;
    });
  });
  const quick = document.querySelector('.forge-quick');
  if (quick) quick.hidden = true;
  // The workspace is already initialized by app.js; replace only its navigation.
})();