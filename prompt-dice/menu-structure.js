// Ієрархічне меню Prompt Dice: розділ → група → підгрупа. Працює з наявними вкладками та пошуком параметрів.
(function () {
  const nav = document.getElementById('forgePrimaryNav');
  if (!nav || typeof workTabs !== 'function') return;

  const menu = [
    { title: 'Персонаж', icon: '♙', groups: [
      { title: 'Загальні характеристики', query: 'gender age race skin build breasts hips' },
      { title: 'Голова', children: [
        { title: 'Форма та риси обличчя', query: 'face nose mouth jaw cheeks chin' },
        { title: 'Очі', query: 'eyes eyeColor eyeExpr gaze' },
        { title: 'Брови та вії', query: 'eyebrows eyelashes' },
        { title: 'Волосся та зачіска', query: 'hair hairstyle hairColor' },
        { title: 'Вуха', query: 'ears' },
        { title: 'Шкіра обличчя', query: 'skin freckles wrinkles scars' },
        { title: 'Макіяж і пірсинг', query: 'makeup piercing' },
        { title: 'Зуби та рот', query: 'teeth mouth lips tongue' }
      ]},
      { title: 'Індивідуальні особливості', query: 'raceFeat permFeat tattoos scars freckles horns tail wings' },
      { title: 'Статура та пропорції', query: 'build body proportions height weight breasts hips' }
    ]},
    { title: 'Емоції та міміка', icon: '☺', groups: [
      { title: 'Емоційний стан', query: 'emotion mood' },
      { title: 'Вираз обличчя', query: 'expression face' },
      { title: 'Погляд і міміка', query: 'eyeExpr gaze blink' }
    ]},
    { title: 'Одяг та аксесуари', icon: '♧', groups: [
      { title: 'Стиль і комплект одягу', query: 'outfit clothing style' },
      { title: 'Верхній одяг', query: 'outerwear jacket coat cloak' },
      { title: 'Одяг верхньої частини тіла', query: 'shirt blouse top dress' },
      { title: 'Одяг нижньої частини тіла', query: 'legwear pants trousers skirt shorts' },
      { title: 'Білизна та домашній одяг', query: 'underwear lingerie pajamas' },
      { title: 'Взуття', query: 'footwear shoes boots sandals' },
      { title: 'Головні убори', query: 'headwear hat helmet hood' },
      { title: 'Рукавички та рукави', query: 'gloves sleeves' },
      { title: 'Прикраси й аксесуари', query: 'accessories jewelry earrings necklace belt bag' },
      { title: 'Матеріали, кольори та стан', query: 'fabric material clothing color torn dirty wet' }
    ]},
    { title: 'Поза та рух', icon: '♟', groups: [
      { title: 'Загальна поза', query: 'pose' },
      { title: 'Положення корпусу', query: 'torso body position' },
      { title: 'Положення рук і ніг', query: 'armPos legPos hand foot' },
      { title: 'Жести', query: 'gesture' },
      { title: 'Дія та рух', query: 'action movement' }
    ]},
    { title: 'Взаємодії', icon: '♧', groups: [
      { title: 'Взаємодія з персонажами', query: 'interaction character contact' },
      { title: 'Взаємодія з предметами', query: 'object holding prop' },
      { title: 'Взаємодія з оточенням', query: 'environment interaction' }
    ]},
    { title: 'Камера та композиція', icon: '▣', groups: [
      { title: 'Кадрування та план', query: 'framing shot cameraAngle' },
      { title: 'Ракурс і перспектива', query: 'cameraAngle perspective angle' },
      { title: 'Напрямок погляду', query: 'gaze looking' },
      { title: 'Композиція кадру', query: 'composition layout' },
      { title: 'Об’єктив і глибина різкості', query: 'lens depth of field focus' }
    ]},
    { title: 'Сцена й оточення', icon: '▧', groups: [
      { title: 'Тип локації', query: 'location interior exterior io' },
      { title: 'Фон і об’єкти', query: 'background fgObjects objects' },
      { title: 'Час доби та погода', query: 'timeOfDay weather season' },
      { title: 'Архітектура й природа', query: 'architecture landscape nature' }
    ]},
    { title: 'Світло та ефекти', icon: '✦', groups: [
      { title: 'Освітлення', query: 'lighting light' },
      { title: 'Тіні та відблиски', query: 'shadows highlights reflections' },
      { title: 'Атмосфера та кольорова гама', query: 'atmosphere colorScheme palette' },
      { title: 'Частинки та спецефекти', query: 'effects particles magic smoke fire sparks' },
      { title: 'Матеріали й дрібні деталі', query: 'materials details texture finalAccent' }
    ]},
    { title: 'Стиль і якість', icon: '◈', groups: [
      { title: 'Візуальний стиль', query: 'style medium genre rendering' },
      { title: 'Колір і палітра', query: 'colorScheme colors palette' },
      { title: 'Якість і деталізація', query: 'quality detail resolution' },
      { title: 'Формат зображення', query: 'format aspect ratio resolution' }
    ]}
  ];

  function chooseTab(query) {
    const tabs = workTabs();
    const q = query.toLocaleLowerCase('uk');
    const rules = [
      [/одяг|аксесуар|взут|білизн|куртк|сороч|outfit|clothing|footwear|headwear|gloves|jewelry|fabric|матеріал/, ['одяг','clothes']],
      [/сцен|локац|фон|погод|weather|background|location|interior|exterior|architecture|landscape/, ['фон','сцен','оточен','локац']],
      [/світл|ефект|тін|атмосфер|lighting|shadows|effects|particles|magic/, ['ефект','світл','фон']],
      [/поз|жест|рух|дія|interaction|gesture|movement|armpos|legpos/, ['поз','дія','рух']],
      [/кадр|камера|ракурс|перспектив|композиці|framing|cameraangle|lens/, ['камера','поз','компози']],
      [/емоці|мімік|expression|emotion|gaze|eyeexpr/, ['емоці','персонаж','голов']],
      [/style|стиль|quality|якість|resolution|palette|кольор/, ['стил','персонаж','фон']]
    ];
    let terms = ['персонаж','зовнішність'];
    for (const [re, t] of rules) if (re.test(q)) { terms = t; break; }
    return tabs.find(t => terms.some(n => (t.t + ' ' + (t.sec ? t.sec.e : '')).toLocaleLowerCase('uk').includes(n)))
      || tabs.find(t => t.id !== 'zone') || tabs[0];
  }

  function activate(query, button, parentDetails) {
    const tab = chooseTab(query);
    if (tab) {
      st.wtab = tab.id;
      if (typeof save === 'function') save();
      if (typeof renderTabs === 'function') renderTabs();
      if (typeof renderWork === 'function') renderWork();
    }
    const search = document.getElementById('wSearch');
    if (search) {
      search.value = query;
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    nav.querySelectorAll('.forge-nav-item').forEach(b => b.classList.toggle('active', b === button));
    if (parentDetails) parentDetails.open = true;
  }

  nav.innerHTML = '';
  menu.forEach(section => {
    const details = document.createElement('details');
    details.className = 'forge-nav-group';
    const summary = document.createElement('summary');
    summary.innerHTML = '<span class="forge-group-icon" aria-hidden="true"></span><span class="forge-group-label"></span><span class="forge-chevron" aria-hidden="true">⌄</span>';
    summary.querySelector('.forge-group-icon').textContent = section.icon;
    summary.querySelector('.forge-group-label').textContent = section.title;
    details.appendChild(summary);
    const children = document.createElement('div');
    children.className = 'forge-nav-children';
    section.groups.forEach(group => {
      if (group.children) {
        const nested = document.createElement('details');
        nested.className = 'forge-nav-subgroup';
        const heading = document.createElement('summary');
        heading.textContent = group.title;
        nested.appendChild(heading);
        const inner = document.createElement('div');
        inner.className = 'forge-nav-children';
        group.children.forEach(item => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'forge-nav-item'; b.textContent = item.title;
          b.onclick = () => activate(item.query, b, nested);
          inner.appendChild(b);
        });
        nested.appendChild(inner); children.appendChild(nested);
      } else {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'forge-nav-item'; b.textContent = group.title;
        b.onclick = () => activate(group.query, b, details);
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
    nav.querySelectorAll('.forge-nav-group').forEach(d => { if (q && d.querySelector('.forge-nav-item:not([hidden])')) d.open = true; });
  });
  const quick = document.querySelector('.forge-quick');
  if (quick) quick.hidden = true;
})();