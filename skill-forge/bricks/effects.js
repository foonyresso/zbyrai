/* Цеглинки «Ефект»: що стається з ціллю. val(p) повертає оцінку за одне застосування в частках сили атаки (САт = 1):
   dmg шкода, heal лікування, shield щит, cc секунди контролю (зважені), util корисність (рух, посилення). toDef = кому за замовчуванням. */
(function (F) {
  const { num, en, bool } = F.P;
  const EL = en('element', 'Стихія', 'phys', F.ELEMENTS, 'Тип шкоди: від нього залежать стійкості цілей у грі');
  const STATS = [['atk', 'Сила атаки'], ['def', 'Захист'], ['move', 'Швидкість бігу'], ['aspd', 'Швидкість атаки'], ['crit', 'Крит. шанс'], ['regen', 'Відновлення']];
  const RES = [['mana', 'Мана'], ['energy', 'Енергія'], ['rage', 'Лють']];
  const cc = (w, extra) => p => ({ cc: p.duration * w, util: extra ? extra(p) : 0 });
  F.register([
    // --- шкода і лікування ---
    { id: 'damage', cat: 'effect', name: 'Шкода', icon: '💢', hint: 'Миттєва шкода у відсотках від сили атаки',
      params: [num('amount', 'Сила', 120, 10, 1000, 10, '100% = звичайний удар', '%'), EL], val: p => ({ dmg: p.amount / 100 }) },
    { id: 'dot', cat: 'effect', name: 'Шкода з часом', icon: '☠️', hint: 'Отрута, горіння, кровотеча: шкода кожен період',
      params: [num('amount', 'За тик', 25, 5, 300, 5, 'Шкода за один період, % сили атаки', '%'), num('interval', 'Період', 1, 0.5, 3, 0.5, '', 'с'), num('duration', 'Тривалість', 6, 1, 20, 1, '', 'с'), EL],
      val: p => ({ dmg: p.amount / 100 * p.duration / p.interval }) },
    { id: 'heal', cat: 'effect', name: 'Лікування', icon: '💚', toDef: 'self', hint: 'Миттєво відновлює здоров’я',
      params: [num('amount', 'Сила', 150, 10, 1000, 10, '% сили атаки', '%')], val: p => ({ heal: p.amount / 100 }) },
    { id: 'hot', cat: 'effect', name: 'Лікування з часом', icon: '🌿', toDef: 'self', hint: 'Відновлює здоров’я кожен період',
      params: [num('amount', 'За тик', 30, 5, 300, 5, '', '%'), num('interval', 'Період', 1, 0.5, 3, 0.5, '', 'с'), num('duration', 'Тривалість', 8, 1, 20, 1, '', 'с')],
      val: p => ({ heal: p.amount / 100 * p.duration / p.interval }) },
    { id: 'shield', cat: 'effect', name: 'Щит', icon: '🛡️', toDef: 'self', hint: 'Поглинає шкоду, доки не вичерпається або не закінчиться час',
      params: [num('amount', 'Міцність', 150, 10, 1000, 10, '', '%'), num('duration', 'Тривалість', 8, 1, 30, 1, '', 'с')], val: p => ({ shield: p.amount / 100 }) },
    { id: 'reflect', cat: 'effect', name: 'Відбиття шкоди', icon: '🪞', toDef: 'self', hint: 'Частина отриманої шкоди повертається нападникам',
      params: [num('pct', 'Частка', 30, 10, 100, 5, '', '%'), num('duration', 'Тривалість', 5, 1, 20, 1, '', 'с')], val: p => ({ util: p.pct / 100 * p.duration * 0.15 }) },
    { id: 'invulnerable', cat: 'effect', name: 'Невразливість', icon: '✨', toDef: 'self', hint: 'Короткий час не отримуєш шкоди',
      params: [num('duration', 'Тривалість', 1.5, 0.5, 5, 0.5, '', 'с')], val: p => ({ util: p.duration * 0.9 }) },
    // --- контроль ---
    { id: 'stun', cat: 'effect', name: 'Приголомшення', icon: '💫', hint: 'Ціль не може діяти',
      params: [num('duration', 'Тривалість', 1.5, 0.2, 6, 0.1, '', 'с')], val: cc(1) },
    { id: 'slow', cat: 'effect', name: 'Уповільнення', icon: '🐌', hint: 'Зменшує швидкість бігу цілі',
      params: [num('pct', 'Сповільнення', 40, 10, 90, 5, '', '%'), num('duration', 'Тривалість', 3, 0.5, 15, 0.5, '', 'с')], val: p => ({ cc: p.duration * p.pct / 100 * 0.6 }) },
    { id: 'root', cat: 'effect', name: 'Заморожування на місці', icon: '🧊', hint: 'Ціль не рухається, але може атакувати',
      params: [num('duration', 'Тривалість', 2, 0.5, 8, 0.5, '', 'с')], val: cc(0.6) },
    { id: 'silence', cat: 'effect', name: 'Мовчання', icon: '🤐', hint: 'Ціль не може використовувати скіли',
      params: [num('duration', 'Тривалість', 3, 0.5, 8, 0.5, '', 'с')], val: cc(0.5) },
    { id: 'fear', cat: 'effect', name: 'Страх', icon: '😱', hint: 'Ціль тікає від гравця',
      params: [num('duration', 'Тривалість', 2, 0.5, 6, 0.5, '', 'с')], val: cc(0.8) },
    { id: 'knockup', cat: 'effect', name: 'Підкидання', icon: '⤴️', hint: 'Підкидає ціль: вона беззахисна в польоті',
      params: [num('duration', 'У повітрі', 1, 0.5, 3, 0.5, '', 'с')], val: cc(0.9) },
    { id: 'taunt', cat: 'effect', name: 'Провокація', icon: '📢', hint: 'Змушує ворогів атакувати гравця',
      params: [num('duration', 'Тривалість', 3, 0.5, 8, 0.5, '', 'с')], val: cc(0.4) },
    // --- рух ---
    { id: 'knockback', cat: 'effect', name: 'Відкидання', icon: '↔️', hint: 'Відкидає ціль від гравця',
      params: [num('distance', 'Відстань', 5, 1, 15, 1, '', 'м')], val: p => ({ util: p.distance * 0.04 }) },
    { id: 'pull', cat: 'effect', name: 'Притягування', icon: '🪝', hint: 'Притягує ціль до гравця',
      params: [num('distance', 'Відстань', 8, 1, 20, 1, '', 'м')], val: p => ({ util: p.distance * 0.04 }) },
    { id: 'dash', cat: 'effect', name: 'Ривок', icon: '💨', toDef: 'self', hint: 'Гравець швидко пробігає вказану відстань, ворогів не обминаючи',
      params: [num('distance', 'Відстань', 8, 2, 20, 1, '', 'м'), bool('through', 'Крізь ворогів', true, 'Якщо вимкнено, ривок зупиняється об першого ворога')], val: p => ({ util: p.distance * 0.04 }) },
    { id: 'teleport', cat: 'effect', name: 'Миттєве переміщення', icon: '🌌', toDef: 'self', hint: 'Гравець з’являється в новій точці без проміжного шляху',
      params: [num('distance', 'Відстань', 10, 2, 25, 1, '', 'м')], val: p => ({ util: p.distance * 0.06 }) },
    { id: 'stealth', cat: 'effect', name: 'Невидимість', icon: '🫥', toDef: 'self', hint: 'Ворог не бачить гравця; атака може зняти ефект',
      params: [num('duration', 'Тривалість', 5, 1, 15, 1, '', 'с'), bool('breaks', 'Зникає від атаки', true)], val: p => ({ util: p.duration * 0.2 }) },
    // --- посилення, послаблення, ресурси ---
    { id: 'buff', cat: 'effect', name: 'Посилення', icon: '⬆️', toDef: 'self', hint: 'Збільшує характеристику на час',
      params: [en('stat', 'Характеристика', 'atk', STATS), num('pct', 'Бонус', 20, 5, 100, 5, '', '%'), num('duration', 'Тривалість', 10, 2, 60, 1, '', 'с')], val: p => ({ util: p.pct / 100 * p.duration * 0.12 }) },
    { id: 'debuff', cat: 'effect', name: 'Послаблення', icon: '⬇️', hint: 'Зменшує характеристику цілі на час',
      params: [en('stat', 'Характеристика', 'def', STATS), num('pct', 'Штраф', 20, 5, 80, 5, '', '%'), num('duration', 'Тривалість', 8, 2, 40, 1, '', 'с')], val: p => ({ util: p.pct / 100 * p.duration * 0.1 }) },
    { id: 'mark', cat: 'effect', name: 'Мітка вразливості', icon: '🎯', hint: 'Позначена ціль отримує більше шкоди від усіх',
      params: [num('pct', 'Додаткова шкода', 20, 5, 100, 5, '', '%'), num('duration', 'Тривалість', 8, 2, 30, 1, '', 'с')], val: p => ({ util: p.pct / 100 * p.duration * 0.2 }) },
    { id: 'dispel', cat: 'effect', name: 'Зняти ефекти з ворога', icon: '🧹', hint: 'Прибирає корисні ефекти з цілі',
      params: [num('count', 'Скільки', 1, 1, 5, 1, '', 'шт')], val: p => ({ util: p.count * 0.15 }) },
    { id: 'cleanse', cat: 'effect', name: 'Очищення', icon: '💧', toDef: 'self', hint: 'Прибирає шкідливі ефекти (контроль, отруту)',
      params: [num('count', 'Скільки', 2, 1, 5, 1, '', 'шт')], val: p => ({ util: p.count * 0.2 }) },
    { id: 'restore', cat: 'effect', name: 'Відновити ресурс', icon: '🔷', toDef: 'self', hint: 'Повертає ресурс (ману, енергію, лють)',
      params: [en('resource', 'Ресурс', 'mana', RES), num('amount', 'Скільки', 15, 1, 100, 1, '', 'од')], val: p => ({ util: p.amount * 0.012 }) },
    { id: 'drain', cat: 'effect', name: 'Висмоктати ресурс', icon: '🔻', hint: 'Забирає ресурс у цілі',
      params: [en('resource', 'Ресурс', 'mana', RES), num('amount', 'Скільки', 15, 1, 100, 1, '', 'од')], val: p => ({ util: p.amount * 0.01 }) },
  ]);
})(typeof ForgeCore !== 'undefined' ? ForgeCore : require('../forge-core.js'));
