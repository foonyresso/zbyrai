/* Colonist Foundry: каталог подій. Три види: global (на всіх), job (з тим, хто саме працює на цій роботі), person (з однією людиною).
   p — ймовірність за годину (для job і person — на людину). Події діють лише через ctx з colony-sim.js. Без DOM; глобал ColonyEvents і module.exports. */
const ColonyEvents = (() => {
  const E = [];
  const ev = (id, scope, p, run, o = {}) => E.push(Object.assign({ id, scope, p, run }, o));
  // напад (на колонію): сила відбиття залежить від варти; програш = поранення і страх
  function raid(c, text) {
    const guards = c.guards(), power = guards.reduce((a, i) => a + c.skill(i, 'fight') + c.skill(i, 'shoot') * .5, 0) + c.R() * 10, threat = 8 + c.R() * 14 + c.n * .6;
    const who = guards;
    if (power >= threat) { c.say('good', `${text}: варта відбила напад`, who, 'global', `Сила варти ${Math.round(power)} проти ${Math.round(threat)}`); guards.forEach(i => c.thought(i, 'Відбив напад', 5, 24)); }
    else {
      const hit = c.pickN(c.n, 1 + (c.R() < .4 ? 1 : 0)); hit.forEach(i => c.hurt(i, c.R() < .5 ? 'wound' : 'bruise'));
      c.say('bad', `${text}: напад вдався, постраждали ${hit.map(c.name).join(' і ')}`, hit, 'global', `Сила варти ${Math.round(power)} проти ${Math.round(threat)}`);
      for (let i = 0; i < c.n; i++) c.thought(i, 'Страх після нападу', -5, 18);
    }
  }

  /* ---- загальні ---- */
  ev('feast', 'global', .0035, c => { c.say('good', 'Колонія влаштувала свято: всі трохи розслабились', null, 'global', 'Настрій усіх +6 на добу'); for (let i = 0; i < c.n; i++) c.thought(i, 'Свято', 6, 24); c.needsAll('fun', .25); }, { hours: [17, 22] });
  ev('nightAlert', 'global', .0035, c => raid(c, 'Нічна тривога'), { hours: [22, 29], raid: true });
  ev('shortage', 'global', .02, c => { c.say('bad', 'Харчів лишилось обмаль: люди стривожені', null, 'global', 'Середня ситість нижча за 35%'); for (let i = 0; i < c.n; i++) c.thought(i, 'Нестача їжі', -4, 12); }, { test: c => c.avgNeed('food') < .35 });
  ev('star', 'global', .0007, c => { c.say('good', 'Вночі впала яскрава зірка, усі дивились на небо', null, 'global'); for (let i = 0; i < c.n; i++) c.thought(i, 'Бачив падіння зірки', 3, 20); c.workers('research').forEach(i => c.thought(i, 'Зірка: нові ідеї', 5, 24)); }, { hours: [21, 27] });
  ev('sandstorm', 'global', .003, c => { c.say('bad', 'Піщана буря засипала двір', null, 'global'); for (let i = 0; i < c.n; i++) c.thought(i, 'Піщана буря', -3, 8); }, { biome: 'desert' });
  ev('blizzard', 'global', .003, c => { c.say('bad', 'Завірюха: всі сидять по хатах', null, 'global'); for (let i = 0; i < c.n; i++) c.thought(i, 'Завірюха', -3, 10); }, { biome: 'tundra' });
  ev('drought', 'global', .0025, c => { c.say('bad', 'Бракує води, поля в’януть', null, 'global'); c.workers('farm').forEach(i => c.thought(i, 'В’януче поле', -4, 18)); }, { hours: [9, 17] });
  ev('beast', 'global', .0022, c => raid(c, 'Хижак підійшов до табору'), { raid: true });

  /* ---- за професією ---- */
  ev('collapse', 'job', .004, (c, i) => {
    const lvl = c.skill(i, 'mine'), bad = c.R() > lvl / 30 + .25;
    c.say('bad', `У копальні стався обвал: ${c.name(i)} ${bad ? c.v(i, 'постраждав', 'постраждала') : c.v(i, 'ледь вцілів', 'ледь вціліла')}`, [i], 'job', `Навичка видобутку ${lvl}`);
    if (bad) c.hurt(i, c.R() < .4 ? 'wound' : 'bruise'); c.workers('mine').forEach(k => c.thought(k, 'Обвал у копальні', -6, 20));
  }, { job: 'mine' });
  ev('ore', 'job', .004, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'знайшов', 'знайшла')} багату жилу`, [i], 'job'); c.thought(i, 'Знайшов жилу', 7, 18); }, { job: 'mine' });
  ev('huntWound', 'job', .004, (c, i) => { c.say('bad', `${c.name(i)} ${c.v(i, 'поранений', 'поранена')} звіром на полюванні`, [i], 'job'); c.hurt(i, 'wound'); }, { job: 'hunt' });
  ev('huntCatch', 'job', .005, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'приніс', 'принесла')} добру здобич`, [i], 'job'); c.thought(i, 'Вдале полювання', 5, 14); c.needsAll('food', .04); }, { job: 'hunt' });
  ev('cut', 'job', .006, (c, i) => { c.say('bad', `${c.name(i)} ${c.v(i, 'порізав', 'порізала')} палець на кухні`, [i], 'job', 'Настрій −4'); c.thought(i, 'Порізаний палець', -4, 8); }, { job: 'cook' });
  ev('feastCook', 'job', .004, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'приготував', 'приготувала')} чудову вечерю`, [i], 'job'); for (let k = 0; k < c.n; k++) c.thought(k, 'Смачна вечеря', 3, 10); c.thought(i, 'Горджусь своєю стравою', 4, 14); }, { job: 'cook' });
  ev('banditRaid', 'job', .003, c => raid(c, 'Напад бандитів'), { job: 'guard', raid: true, once: true });
  ev('pests', 'job', .004, (c, i) => { c.say('bad', `Шкідники точать посіви, ${c.name(i)} ${c.v(i, 'засмучений', 'засмучена')}`, [i], 'job'); c.thought(i, 'Шкідники на полі', -4, 16); }, { job: 'farm' });
  ev('harvest', 'job', .005, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'зібрав', 'зібрала')} добрий урожай`, [i], 'job'); c.thought(i, 'Добрий урожай', 5, 16); c.needsAll('food', .03); }, { job: 'farm' });
  ev('burn', 'job', .004, (c, i) => { c.say('bad', `У майстерні ${c.name(i)} ${c.v(i, 'обпікся', 'обпеклась')}`, [i], 'job'); c.hurt(i, 'bruise'); }, { job: 'craft' });
  ev('masterpiece', 'job', .003, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'створив', 'створила')} справжній шедевр`, [i], 'job'); c.thought(i, 'Шедевр', 8, 24); }, { job: 'craft' });
  ev('needle', 'job', .004, (c, i) => { c.say('bad', `${c.name(i)} ${c.v(i, 'вколов', 'вколола')} голкою палець`, [i], 'job'); c.thought(i, 'Вколотий палець', -2, 6); }, { job: 'tailor' });
  ev('saved', 'job', .008, (c, i) => { const ill = c.illOnes(); if (!ill.length) return; const p = ill[Math.floor(c.R() * ill.length)]; c.say('good', `${c.name(i)} ${c.v(i, 'допоміг', 'допомогла')} ${c.dat(p)}: стан покращився`, [i, p], 'health'); c.cure(p, 6); c.thought(i, 'Допоміг хворому', 5, 18); c.thought(p, 'Хтось подбав про мене', 4, 18); }, { job: 'heal', test: c => c.illOnes().length > 0 });
  ev('blast', 'job', .003, (c, i) => { c.say('bad', `Дослід ${c.name(i)} закінчився вибухом`, [i], 'job'); c.hurt(i, 'bruise'); c.thought(i, 'Невдалий дослід', -6, 18); }, { job: 'research' });
  ev('insight', 'job', .004, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'зробив', 'зробила')} відкриття`, [i], 'job'); c.thought(i, 'Осяяння', 8, 24); }, { job: 'research' });
  ev('fall', 'job', .003, (c, i) => { c.say('bad', `${c.name(i)} ${c.v(i, 'впав', 'впала')} з риштувань`, [i], 'job'); c.hurt(i, c.R() < .3 ? 'wound' : 'bruise'); }, { job: 'build' });
  ev('tower', 'job', .003, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'закінчив', 'закінчила')} гарну споруду`, [i], 'job'); c.thought(i, 'Гарна споруда', 5, 20); }, { job: 'build' });
  ev('treeFall', 'job', .003, (c, i) => { c.say('bad', `Дерево впало не туди, ${c.name(i)} ${c.v(i, 'ледь відскочив', 'ледь відскочила')}`, [i], 'job'); c.thought(i, 'Ледь не придавило', -4, 10); if (c.R() < .35) c.hurt(i, 'bruise'); }, { job: 'lumber' });
  ev('fineBrew', 'job', .003, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'зварив', 'зварила')} вдалий напій: усі підняли кухлі`, [i], 'job'); for (let k = 0; k < c.n; k++) c.thought(k, 'Добрий напій', 2, 12); }, { job: 'brew' });
  ev('deal', 'job', .004, (c, i) => { const good = c.R() < .6; c.say(good ? 'good' : 'bad', `${c.name(i)} ${good ? c.v(i, 'уклав', 'уклала') + ' вигідну угоду' : c.v(i, 'піддався', 'піддалась') + ' на хитрий обман'}`, [i], 'job'); c.thought(i, good ? 'Вигідна угода' : 'Обдурили', good ? 5 : -5, 16); }, { job: 'trade' });
  ev('pupils', 'job', .004, (c, i) => { c.say('good', `${c.name(i)}: діти слухають і запитують, на душі тепліше`, [i], 'job'); c.thought(i, 'Вдячні учні', 4, 14); }, { job: 'teach' });
  ev('tracks', 'job', .004, (c, i) => { const bad = c.R() < .4; c.say(bad ? 'bad' : 'good', `${c.name(i)} ${bad ? c.v(i, 'заблукав', 'заблукала') + ' у тумані й повернувся пізно' : c.v(i, 'знайшов', 'знайшла') + ' свіжі сліди та попередив варту'}`, [i], 'job'); c.thought(i, bad ? 'Заблукав' : 'Помітив небезпеку', bad ? -4 : 4, 14); }, { job: 'scout' });
  ev('rareHerb', 'job', .004, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'знайшов', 'знайшла')} рідкісну траву`, [i], 'job'); c.thought(i, 'Рідкісна трава', 5, 16); c.cureAll(2); }, { job: 'herb' });

  /* ---- особисті ---- */
  ev('badSleep', 'person', .012, (c, i) => { c.say('bad', `${c.name(i)} погано спить`, [i], 'person', 'Настрій −3'); c.thought(i, 'Поганий сон', -3, 16); }, { test: (c, i) => c.act(i) === 'сон' });
  ev('nightmare', 'person', .004, (c, i) => { c.say('bad', `${c.name(i)} прокинувся від кошмару`.replace('прокинувся', c.v(i, 'прокинувся', 'прокинулась')), [i], 'person'); c.thought(i, 'Кошмар', -5, 14); }, { test: (c, i) => c.act(i) === 'сон' });
  ev('letter', 'person', .0015, (c, i) => { const g = c.R() < .6; c.say(g ? 'good' : 'bad', `${c.name(i)} ${g ? c.v(i, 'згадав', 'згадала') + ' приємне з минулого' : c.v(i, 'засумував', 'засумувала') + ' за домівкою'}`, [i], 'person'); c.thought(i, g ? 'Тепла згадка' : 'Сум за домом', g ? 4 : -4, 20); });
  ev('trinket', 'person', .0015, (c, i) => { c.say('good', `${c.name(i)} ${c.v(i, 'знайшов', 'знайшла')} гарну дрібничку`, [i], 'person'); c.thought(i, 'Гарна знахідка', 3, 18); });
  ev('birthday', 'person', .0012, (c, i) => { c.say('good', `У ${c.gen(i)} день народження`, [i], 'person', 'Колоніст стає на рік старшим'); c.birthday(i); for (let k = 0; k < c.n; k++) if (k !== i && c.op(i, k) > 0) c.thought(k, 'Привітав іменинника', 2, 12); c.thought(i, 'День народження', 6, 24); }, { hours: [8, 22] });
  ev('cheered', 'person', .003, (c, i) => { const f = c.friendOf(i); if (f == null) return; c.say('good', `${c.name(f)} ${c.v(f, 'підбадьорив', 'підбадьорила')} ${c.acc(i)} теплим словом`, [f, i], 'social'); c.thought(i, 'Друг підтримав', 4, 14); }, { test: (c, i) => c.mood(i) < 40 });
  return { EVENTS: E };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ColonyEvents;
