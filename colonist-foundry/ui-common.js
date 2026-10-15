/* Colonist Foundry: спільні дрібниці інтерфейсу: піктограми, підписи, час, кольори. Глобал CFUI. */
const CFUI = (() => {
  const C = ColonistCore;
  const ACT = { сон: ['💤', 'Спить'], їжа: ['🍲', 'Їсть'], відпочинок: ['🛋️', 'Відпочиває'], розвага: ['🎭', 'Розважається'], розмова: ['💬', 'Розмовляє'], зрив: ['⚠️', 'Зрив'], хворіє: ['🤒', 'Хворіє'], робота: ['⚒️', 'Працює'] };
  const WEATHER_ICON = { clear: '☀️', cloud: '☁️', rain: '🌧️', fog: '🌫️', storm: '⛈️', heat: '🔥', cold: '🥶', snow: '❄️' };
  const KIND_ICON = { village: '🏘️', city: '🏙️', outpost: '🏕️' };
  const BIOME_ICON = { temperate: '🌳', desert: '🏜️', jungle: '🌴', tundra: '🧊', mountain: '⛰️', swamp: '🪵' };
  const RELCOL = { couple: '#f7b6d2', spouse: '#f39ac0', friend: '#8fd6a0', sibling: '#8fb7ee', rival: '#f08a8a' };
  const pad = n => String(n).padStart(2, '0');
  const actKey = a => (a || '').split(':')[0];
  const actIcon = a => (ACT[actKey(a)] || ['·'])[0];
  const actLabel = a => (a.startsWith('робота:') ? 'Працює: ' + C.JOBS.find(j => j.id === a.slice(7)).name.toLowerCase() : (ACT[a] || ['', a])[1]);
  const clock = t => `доба ${Math.floor(t / 24) + 1}, ${pad(t % 24)}:00`;
  const moodColor = m => (m >= 60 ? '#7fd49a' : m >= 35 ? '#e6c45c' : '#ee7b7b');
  const moodWord = m => (m >= 75 ? 'у чудовому настрої' : m >= 55 ? 'у доброму настрої' : m >= 35 ? 'у звичайному настрої' : m >= 22 ? 'пригнічений' : 'на межі зриву');
  const signed = v => (v > 0 ? '+' + v : String(v));
  return { ACT, WEATHER_ICON, KIND_ICON, BIOME_ICON, RELCOL, pad, actKey, actIcon, actLabel, clock, moodColor, moodWord, signed };
})();
