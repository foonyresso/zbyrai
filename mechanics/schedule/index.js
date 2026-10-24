/* Механіка «schedule»: ігровий годинник і вибір заняття за часом доби та потребами. Без DOM.
   Заняття: sleep (спати вдома), work, eat, chat, relax, stroll. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const createClock = (hour = 7, day = 1) => ({ hour, day });
  function advance(clock, dtH) { clock.hour += dtH; while (clock.hour >= 24) { clock.hour -= 24; clock.day++; } return clock; }
  const isNight = h => h >= 22 || h < 6;
  // 'night' | 'morning' | 'day' | 'evening'
  const phase = h => h >= 22 || h < 6 ? 'night' : h < 8 ? 'morning' : h < 17 ? 'day' : 'evening';
  const lunch = h => h >= 12 && h < 13.5;
  // коли прокидатися: до 5:30 сплять (навіть відпочивши), на ранок після повного відпочинку, вдень вистачає короткої дрімоти
  function shouldWake(needs, hour) {
    if (isNight(hour) || hour < 7) return needs.energy >= 0.97 && hour >= 5.5 && hour < 22;
    return needs.energy >= 0.6;
  }
  // вибір заняття; R() = випадкове 0..1
  function choose(needs, hour, R) {
    if (needs.energy < 0.15) return 'sleep';
    if (isNight(hour)) return needs.energy < 0.9 || R() < 0.85 ? 'sleep' : 'stroll';
    if (needs.hunger < 0.3 || (lunch(hour) && needs.hunger < 0.75)) return 'eat';
    const ph = phase(hour);
    if (ph === 'morning') return needs.hunger < 0.7 ? 'eat' : 'work';
    if (ph === 'day') {
      if (needs.social < 0.2 && R() < 0.5) return 'chat';
      if (needs.fun < 0.2 && R() < 0.5) return 'relax';
      return 'work';
    }
    if (hour >= 21 && needs.energy < 0.5) return 'sleep';
    if (needs.social < 0.65) return R() < 0.7 ? 'chat' : 'relax';
    if (needs.fun < 0.65) return R() < 0.7 ? 'relax' : 'stroll';
    return ['chat', 'relax', 'stroll'][Math.floor(R() * 3)];
  }
  // скільки ігрових годин тримати заняття до наступного вибору
  function duration(act, R) {
    const r = { sleep: [3, 8], work: [1.5, 3], eat: [0.5, 0.9], chat: [0.5, 1.2], relax: [0.7, 1.6], stroll: [0.4, 1] }[act] || [1, 2];
    return r[0] + (r[1] - r[0]) * R();
  }
  const fmt = h => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor((h % 1) * 60)).padStart(2, '0');
  const api = { createClock, advance, isNight, phase, shouldWake, choose, duration, fmt };
  Mech.Schedule = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
