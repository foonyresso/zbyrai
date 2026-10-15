/* Colonist Foundry: права панель «обраний колоніст»: Анкета (хто це), Стан (настрій, потреби, стосунки), Історія (його доба). Глобал CFDetail. */
const CFDetail = (() => {
  const C = ColonistCore, S = ColonySim, W = ColonyWorld, U = CFUI;
  let X = null, histDay = 0;
  const init = x => { X = x; };
  const resetDay = () => { histDay = 0; };

  function render(host) {
    const { el } = X, colony = X.getColony(), sim = X.getSim(), i = X.st.sel, c = colony.colonists[i], tab = X.st.dtab, locked = !!X.st.locks[i];
    const act = sim.hour > 0 ? sim.acts[i][sim.acts[i].length - 1] : null, m = S.moodOf(sim, i), ill = sim.ill[i];
    const head = el('div', { class: 'dhead' }, CFPortrait.avatar(c),
      el('div', { class: 'dwho' }, el('h2', {}, C.fullName(c)), el('div', { class: 'dsub' }, `${C.profession(c)} · ${c.female ? 'жінка' : 'чоловік'}, ${c.age + sim.ageBonus[i]} р.`),
        el('div', { class: 'dnow', title: 'Що колоніст робить просто зараз' }, act ? `${U.actIcon(act)} ${U.actLabel(act)}` : 'Час ще не пішов')),
      el('div', { class: 'dbtns' },
        el('button', { class: locked ? 'on' : '', title: locked ? 'Замкнено: лишиться після «Нова колонія». Натисніть, щоб розімкнути' : 'Замкнути: цей колоніст лишиться, коли створюватимете нову колонію', onclick: () => X.toggleLock(i) }, locked ? '🔒' : '🔓'),
        el('button', { title: 'Замінити цього колоніста іншим випадковим', onclick: () => X.reroll(i) }, '🎲')));
    const moodBar = el('div', { class: 'moodbar', title: S.moodParts(sim, i).map(p => `${p.l}: ${p.v > 0 && p.l !== 'Звичайний рівень' ? '+' : ''}${p.v}`).join('\n') },
      el('div', { class: 'mb' }, el('i', { style: `width:${m}%;background:${U.moodColor(m)}` })), el('span', {}, `Настрій ${m}: ${U.moodWord(m)}`));
    const seg = el('div', { class: 'seg' }, [['bio', 'Анкета', 'Хто це: риси, минуле, навички, роботи'], ['state', 'Стан', 'Настрій, потреби, хвороби й стосунки'], ['story', 'Історія', 'Що відбувалось з цим колоністом по годинах']].map(([k, l, t]) => el('button', { class: tab === k ? 'on' : '', title: t, onclick: () => { X.st.dtab = k; X.save(); X.refresh(); } }, l)));
    host.replaceChildren(head, moodBar, seg, tab === 'bio' ? bio(c) : tab === 'state' ? state(sim, i) : story(sim, i));
  }

  function bio(c) {
    const { el } = X, pri = C.priorities(c), sorted = C.SKILLS.slice().sort((a, b) => c.skills[b.id] - c.skills[a.id]);
    return el('div', { class: 'dbody' },
      el('div', { class: 'tags' }, c.traits.map(t => el('span', { class: 'tag tr', title: C.TRAIT_BY[t].desc }, C.TRAIT_BY[t].name))),
      el('p', { class: 'story' }, C.backstoryText(c).map(b => el('span', {}, el('b', {}, b.name + '. '), b.text + ' ')), c.quirk ? el('span', {}, el('b', {}, 'Звичка: '), c.quirk + '.') : null),
      el('h3', { class: 'mini' }, 'Навички'),
      el('div', { class: 'skills' }, sorted.map(s => el('div', { class: `sk p${c.passion[s.id]}`, title: c.passion[s.id] === 2 ? 'Горить цією справою: працює краще й радіє' : c.passion[s.id] === 1 ? 'Цікавиться цією справою' : '' }, el('span', { class: 'nm' }, s.name), el('div', { class: 'bar2' }, el('i', { style: `width:${c.skills[s.id] / 20 * 100}%` })), el('b', {}, c.skills[s.id])))),
      el('h3', { class: 'mini' }, 'Роботи'),
      el('div', { class: 'tags' }, C.JOBS.filter(j => pri[j.id] === 1).map(j => el('span', { class: 'tag', title: 'Головна робота' }, '★ ' + j.name)), C.JOBS.filter(j => pri[j.id] === 2).map(j => el('span', { class: 'tag soft', title: 'Охоче виконує' }, j.name)), c.noJobs.map(j => el('span', { class: 'tag off', title: 'Не виконує через передісторію' }, '✕ ' + C.JOBS.find(x => x.id === j).name))));
  }

  function state(sim, i) {
    const { el } = X, cs = X.getColony().colonists, ill = sim.ill[i];
    const needs = C.NEEDS.map(n => el('div', { class: 'need', title: `${n.name}: ${Math.round(sim.needs[i][n.id] * 100)}%` }, el('span', {}, n.name), el('div', { class: 'bar2' }, el('i', { style: `width:${sim.needs[i][n.id] * 100}%` }))));
    const parts = S.moodParts(sim, i).filter(p => p.l !== 'Звичайний рівень');
    const rels = sim.rel.filter(r => r.a === i || r.b === i).map(r => r.a === i ? r.b : r.a), set = new Set(rels);
    const others = cs.map((_, j) => j).filter(j => j !== i && !set.has(j)).sort((a, b) => Math.abs(sim.ops[i][b]) - Math.abs(sim.ops[i][a])).slice(0, 3);
    const row = j => { const t = S.relOf(sim, i, j), o = Math.round(sim.ops[i][j]); return el('li', { onclick: () => X.select(j), title: `Думка ${cs[i].name} про ${cs[j].name}: ${U.signed(o)}. Натисніть, щоб відкрити` }, el('i', { style: `background:${U.RELCOL[t] || '#555'}` }), el('b', {}, cs[j].name), el('span', {}, t ? C.REL[t] : 'знайомі'), el('em', { class: o >= 0 ? 'good' : 'bad' }, U.signed(o))); };
    return el('div', { class: 'dbody' },
      ill ? el('div', { class: 'alert bad', title: 'Хворіє, поки не мине час; лікарі прискорюють одужання' }, `🤒 ${W.ILLNESS[ill.id].name}: ще близько ${Math.max(1, Math.round(ill.left))} год`) : null,
      el('h3', { class: 'mini' }, 'Потреби'), el('div', { class: 'needs' }, needs),
      el('h3', { class: 'mini' }, 'Що впливає на настрій'),
      parts.length ? el('ul', { class: 'thoughts' }, parts.map(p => el('li', {}, el('span', {}, p.l), el('em', { class: p.v >= 0 ? 'good' : 'bad' }, U.signed(p.v))))) : el('p', { class: 'hint' }, 'Нічого особливого.'),
      el('h3', { class: 'mini' }, 'Стосунки'),
      el('ul', { class: 'rels' }, rels.map(row), others.map(row)));
  }

  function story(sim, i) {
    const { el } = X, lastDay = Math.floor(Math.max(0, sim.hour - 1) / 24) + 1, day = histDay || lastDay, first = Math.floor(sim.actsFrom / 24) + 1;
    if (sim.hour === 0) return el('div', { class: 'dbody' }, el('p', { class: 'hint' }, 'Запустіть час (кнопка ▶ угорі): тут з’явиться розклад цього колоніста й усе, що з ним траплялось.'));
    const blocks = S.history(sim, i, day);
    return el('div', { class: 'dbody' },
      el('div', { class: 'nav' }, el('button', { title: 'Попередня доба', disabled: day <= first, onclick: () => { histDay = day - 1; X.refresh(); } }, '◀'), ` доба ${day} `, el('button', { title: 'Наступна доба', disabled: day >= lastDay, onclick: () => { histDay = day + 1; X.refresh(); } }, '▶')),
      el('ul', { class: 'hist' }, blocks.map(b => el('li', {}, el('time', {}, `${U.pad(b.from)}–${U.pad(b.to)}`), el('span', {}, `${U.actIcon(b.act)} ${U.actLabel(b.act)}`), ...b.events.map(e => el('em', { class: e.kind, title: e.detail || e.text }, e.text))))));
  }
  return { init, render, resetDay };
})();
