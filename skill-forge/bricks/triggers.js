/* Цеглинки «Тригер»: умова, після якої запускаються вкладені цеглинки (ефекти чи нові доставки).
   fires(env, p, ctx) повертає, скільки разів і з якою кількістю цілей спрацює тригер (оцінка). */
(function (F) {
  const { num } = F.P;
  F.register([
    { id: 'on_hit', cat: 'trigger', name: 'При влучанні', icon: '🎯', hint: 'Щоразу, коли скіл уразив ціль (із шансом)',
      params: [num('chance', 'Шанс', 100, 5, 100, 5, '', '%')], fires: (e, p) => ({ n: e.targets * e.hits * (e.accuracy || 1) * p.chance / 100 }) },
    { id: 'on_kill', cat: 'trigger', name: 'При вбивстві', icon: '💀', hint: 'Коли скіл добив ціль',
      params: [num('chance', 'Шанс', 100, 5, 100, 5, '', '%')], fires: (e, p) => ({ n: e.kills * p.chance / 100 }) },
    { id: 'on_crit', cat: 'trigger', name: 'При критичному ударі', icon: '✴️', hint: 'Коли удар вийшов критичним (потрібен модифікатор «Критичний удар»)',
      params: [num('chance', 'Шанс', 100, 5, 100, 5, '', '%')], fires: (e, p) => ({ n: e.targets * e.hits * (e.crit ? e.crit.chance : 0) * p.chance / 100 }) },
    { id: 'on_expire', cat: 'trigger', name: 'Коли закінчиться', icon: '🏁', hint: 'Один раз у кінці дії скіла (вибух зони, завершення пастки)',
      params: [], fires: () => ({ n: 1, once: true }) },
    { id: 'after_delay', cat: 'trigger', name: 'Через час', icon: '⏱️', hint: 'Один раз через вказаний час після влучання',
      params: [num('seconds', 'Час', 2, 0.2, 10, 0.2, '', 'с')], fires: (e, p) => ({ n: 1, once: true, delay: p.seconds }) },
    { id: 'on_low_hp', cat: 'trigger', name: 'Якщо моє здоров’я мале', icon: '❤️‍🩹', hint: 'Спрацьовує, лише коли здоров’я гравця нижче порога',
      params: [num('threshold', 'Здоров’я нижче', 30, 10, 60, 5, '', '%')], fires: (e, p) => ({ n: 1, once: true, weight: p.threshold / 100 }) },
  ]);
})(typeof ForgeCore !== 'undefined' ? ForgeCore : require('../forge-core.js'));
