/* Цеглинки «Доставка»: як скіл досягає цілей. Кожна має геометрію для оцінки (n: скільки ворогів зачепить, hits: ударів на ціль, time: тривалість)
   і форму для прев'ю (shape). Додати нову = дописати запис сюди. */
(function (F) {
  const { num, en } = F.P;
  const area = (a, ctx) => Math.max(1, Math.min(ctx.enemies, ctx.enemies * a / (Math.PI * ctx.spread * ctx.spread)));
  const CENTER = en('center', 'Центр', 'target', [['caster', 'Я'], ['target', 'Ціль'], ['cursor', 'Точка прицілу']], 'Навколо кого чи чого діє область');
  F.register([
    { id: 'single', cat: 'delivery', name: 'Миттєвий удар по цілі', icon: '🎯', hint: 'Скіл діє одразу на вибрану ціль, без польоту',
      params: [num('range', 'Дальність', 8, 1, 40, 1, 'Максимальна відстань до цілі', 'м')],
      n: () => 1, time: () => 0, shape: { kind: 'single' } },
    { id: 'melee', cat: 'delivery', name: 'Удар зблизька (дуга)', icon: '⚔️', hint: 'Замах перед гравцем: зачіпає всіх у секторі',
      params: [num('radius', 'Радіус', 2.5, 1, 8, 0.5, 'Довжина замаху', 'м'), num('angle', 'Кут', 120, 20, 360, 10, '360° — коло навколо гравця', '°')],
      n: (p, c) => area(p.angle / 360 * Math.PI * p.radius * p.radius, c), time: () => 0.2, shape: { kind: 'arc' } },
    { id: 'projectile', cat: 'delivery', name: 'Снаряд', icon: '☄️', hint: 'Летить по прямій до першої цілі',
      params: [num('range', 'Дальність', 18, 4, 40, 1, 'Скільки пролетить', 'м'), num('speed', 'Швидкість', 24, 4, 60, 1, 'Метрів за секунду', 'м/с'), num('size', 'Розмір', 0.5, 0.2, 3, 0.1, 'Радіус снаряда', 'м')],
      n: () => 1, time: p => p.range / p.speed * 0.6, line: true, shape: { kind: 'proj' } },
    { id: 'beam', cat: 'delivery', name: 'Промінь', icon: '🔆', hint: 'Миттєва лінія: уражає всіх уздовж променя',
      params: [num('range', 'Довжина', 12, 3, 30, 1, 'Довжина променя', 'м'), num('width', 'Товщина', 1, 0.3, 4, 0.1, 'Ширина смуги ураження', 'м')],
      n: (p, c) => area(p.range * p.width, c), time: () => 0.1, line: true, shape: { kind: 'line' } },
    { id: 'cone', cat: 'delivery', name: 'Конус', icon: '📐', hint: 'Віяло перед гравцем: дихання, хвиля, постріл дробом',
      params: [num('range', 'Дальність', 7, 2, 20, 1, 'Довжина конуса', 'м'), num('angle', 'Кут', 70, 20, 180, 5, 'Ширина конуса', '°')],
      n: (p, c) => area(p.angle / 360 * Math.PI * p.range * p.range, c), time: () => 0.2, shape: { kind: 'cone' } },
    { id: 'burst', cat: 'delivery', name: 'Вибух (коло)', icon: '💥', hint: 'Миттєвий вибух кола навколо вибраного центру',
      params: [CENTER, num('radius', 'Радіус', 5, 1, 15, 0.5, 'Радіус вибуху', 'м'), num('range', 'Дальність', 10, 0, 30, 1, 'Як далеко можна вказати центр (для «Ціль» і «Точка прицілу»)', 'м')],
      n: (p, c) => area(Math.PI * p.radius * p.radius, c), time: () => 0.3, shape: { kind: 'circle' } },
    { id: 'zone', cat: 'delivery', name: 'Зона на землі', icon: '⭕', hint: 'Пляма на землі, що діє періодично, доки існує',
      params: [num('radius', 'Радіус', 4, 1, 15, 0.5, '', 'м'), num('duration', 'Тривалість', 5, 1, 30, 0.5, 'Скільки існує зона', 'с'), num('tick', 'Період', 1, 0.2, 5, 0.1, 'Як часто діє на тих, хто в зоні', 'с'), num('range', 'Дальність', 12, 0, 30, 1, '', 'м')],
      n: (p, c) => area(Math.PI * p.radius * p.radius, c) * 1.1, hits: p => Math.max(1, Math.floor(p.duration / p.tick)) * 0.6, time: p => p.duration, shape: { kind: 'zone' } },
    { id: 'aura', cat: 'delivery', name: 'Аура навколо мене', icon: '🌀', hint: 'Область, що рухається разом з гравцем і діє періодично',
      params: [num('radius', 'Радіус', 5, 1, 15, 0.5, '', 'м'), num('duration', 'Тривалість', 8, 1, 60, 1, '', 'с'), num('tick', 'Період', 1, 0.2, 5, 0.1, '', 'с')],
      n: (p, c) => area(Math.PI * p.radius * p.radius, c), hits: p => Math.max(1, Math.floor(p.duration / p.tick)) * 0.6, time: p => p.duration, shape: { kind: 'aura' } },
    { id: 'rain', cat: 'delivery', name: 'Град ударів', icon: '🌧️', hint: 'Багато ударів у випадкові точки області: метеорити, стріли згори',
      params: [num('radius', 'Радіус', 7, 2, 20, 0.5, 'Область падіння', 'м'), num('count', 'Кількість', 10, 2, 60, 1, 'Скільки ударів', 'шт'), num('duration', 'Тривалість', 3, 0.5, 10, 0.5, 'За який час всі удари', 'с'), num('range', 'Дальність', 14, 0, 30, 1, '', 'м'), num('hitRadius', 'Радіус удару', 1.8, 0.5, 5, 0.1, 'Радіус одного удару', 'м')],
      n: (p, c) => area(Math.PI * p.radius * p.radius, c), hits: (p, c) => Math.max(0.5, p.count * p.hitRadius * p.hitRadius / (p.radius * p.radius) * 0.8), time: p => p.duration, shape: { kind: 'rain' } },
    { id: 'trap', cat: 'delivery', name: 'Пастка', icon: '🪤', hint: 'Лежить на землі й спрацьовує, коли ворог наближається',
      params: [num('radius', 'Радіус спрацювання', 2.5, 1, 8, 0.5, '', 'м'), num('duration', 'Живе', 30, 2, 120, 1, 'Скільки чекає ворога', 'с'), num('arm', 'Підготовка', 1, 0, 5, 0.5, 'Через скільки стає бойовою', 'с'), num('range', 'Дальність', 8, 0, 20, 1, '', 'м')],
      n: (p, c) => area(Math.PI * p.radius * p.radius, c), time: p => p.arm + 3, shape: { kind: 'trap' } },
    { id: 'wall', cat: 'delivery', name: 'Стіна', icon: '🧱', hint: 'Смуга поперек шляху: діє на тих, хто проходить крізь неї',
      params: [num('length', 'Довжина', 8, 2, 20, 1, '', 'м'), num('duration', 'Тривалість', 6, 1, 30, 0.5, '', 'с'), num('tick', 'Період', 1, 0.2, 5, 0.1, '', 'с'), num('range', 'Дальність', 10, 0, 30, 1, '', 'м')],
      n: (p, c) => area(p.length * 1.5, c) * 0.8, hits: p => Math.max(1, Math.floor(p.duration / p.tick)) * 0.3, time: p => p.duration, shape: { kind: 'wall' } },
    { id: 'summon', cat: 'delivery', name: 'Прикликання істот', icon: '👻', hint: 'З’являються помічники, що атакують вказаним у ефектах способом; кожен удар помічника = один «влучання»',
      params: [num('count', 'Кількість', 2, 1, 8, 1, 'Скільки істот', 'шт'), num('duration', 'Тривалість', 15, 3, 120, 1, 'Скільки живуть', 'с'), num('interval', 'Період атаки', 1.5, 0.5, 5, 0.1, 'Як часто б’є кожна істота', 'с')],
      n: (p, c) => Math.min(c.enemies, p.count), hits: (p, c) => p.count * p.duration / p.interval * 0.7 / Math.max(1, Math.min(c.enemies, p.count)), time: p => p.duration, shape: { kind: 'summon' } },
  ]);
})(typeof ForgeCore !== 'undefined' ? ForgeCore : require('../forge-core.js'));
