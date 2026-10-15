/* Colonist Foundry: стан і покроковий рушій симуляції колонії (година за годиною, без кінця): погода, хвороби, події, динамічні стосунки.
   Детерміновано: кожна година має власний потік випадковості від (зерно колонії, варіант, номер години), тож стан завжди відтворюється повтором.
   Без DOM: глобал ColonySim (браузер) і module.exports (Node). Потребує ColonistCore, ColonyWorld, ColonyEvents. */
const ColonySim = (() => {
  const C = typeof ColonistCore !== 'undefined' ? ColonistCore : require('./colonist-core.js');
  const W = typeof ColonyWorld !== 'undefined' ? ColonyWorld : require('./colony-world.js');
  const G = typeof ColonyGrammar !== 'undefined' ? ColonyGrammar : require('./colony-grammar.js');
  const EV = (typeof ColonyEvents !== 'undefined' ? ColonyEvents : require('./colony-events.js')).EVENTS;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ACTS_KEEP = 24 * 14, LOG_KEEP = 2400;
  const key = (i, j) => (i < j ? `${i}-${j}` : `${j}-${i}`);

  function create(colony, place, simSeed = 1) {
    const cs = colony.colonists, n = cs.length, R = C.rngFromSeed(`simInit:${colony.seed}:${simSeed}`), pl = W.normPlace(place);
    const ops = cs.map((_, i) => cs.map((_, j) => (i === j ? 0 : C.opinion(colony, i, j))));
    return {
      colony, place: pl, simSeed, n, hour: 0, weather: W.rollWeather(R, pl.biome), ageBonus: cs.map(() => 0),
      needs: cs.map(() => Object.fromEntries(C.NEEDS.map(x => [x.id, .65 + R() * .3]))),
      thoughts: cs.map(() => []), ill: cs.map(() => null), breakdown: cs.map(() => 0),
      ops, base: ops.map(r => r.slice()), rel: colony.relations.map(r => ({ a: r.a, b: r.b, type: r.type, since: 0 })),
      log: [], acts: cs.map(() => []), actsFrom: 0, work: cs.map(() => 0), assign: cs.map(c => C.priorities(c)), load: Array(C.JOBS.length).fill(0),
      stats: { work: Object.fromEntries(C.JOBS.map(j => [j.id, 0])), talks: 0, fights: 0, brawls: 0, bonds: 0, breakdowns: 0, illnesses: 0, events: 0, bondChanges: 0 },
    };
  }

  /* ---------- допоміжне: стосунки ---------- */
  const relOf = (sim, i, j) => (sim.rel.find(r => (r.a === i && r.b === j) || (r.a === j && r.b === i)) || {}).type || null;
  const partnerOf = (sim, i) => { const r = sim.rel.find(r => (r.a === i || r.b === i) && (r.type === 'couple' || r.type === 'spouse')); return r ? (r.a === i ? r.b : r.a) : null; };
  function setRel(sim, i, j, type) {
    sim.rel = sim.rel.filter(r => !((r.a === i && r.b === j) || (r.a === j && r.b === i)));
    if (type) sim.rel.push({ a: Math.min(i, j), b: Math.max(i, j), type, since: sim.hour });
    const cs = sim.colony.colonists, bonus = type ? C.REL_BONUS[type] : 0;
    sim.base[i][j] = C.baseOpinion(cs[i], cs[j]) + bonus; sim.base[j][i] = C.baseOpinion(cs[j], cs[i]) + bonus;
    sim.stats.bondChanges++;
  }

  /* ---------- настрій ---------- */
  function moodParts(sim, i) {
    const c = sim.colony.colonists[i], b = W.BIOMES[sim.place.biome], k = W.KINDS[sim.place.kind], parts = [{ l: 'Звичайний рівень', v: 50 }];
    for (const nd of C.NEEDS) parts.push({ l: nd.name, v: Math.round((sim.needs[i][nd.id] - .5) * 10) });
    const tr = c.traits.reduce((a, t) => a + C.TRAIT_BY[t].mood, 0); if (tr) parts.push({ l: 'Риси характеру', v: tr });
    if (b.mood) parts.push({ l: 'Місцевість: ' + b.name.toLowerCase(), v: b.mood });
    if (k.thought) parts.push({ l: 'Поселення: ' + k.name.toLowerCase(), v: k.thought });
    const wt = W.WEATHER[sim.weather]; if (wt.mood) parts.push({ l: 'Погода: ' + wt.name.toLowerCase(), v: wt.mood });
    if (sim.ill[i]) parts.push({ l: W.ILLNESS[sim.ill[i].id].name, v: W.ILLNESS[sim.ill[i].id].mood });
    for (const t of sim.thoughts[i]) parts.push({ l: t.text, v: t.v });
    return parts.filter(p => p.v !== 0);
  }
  const moodOf = (sim, i) => clamp(Math.round(moodParts(sim, i).reduce((a, p) => a + p.v, 0)), 0, 100);

  /* ---------- одна година ---------- */
  function step(sim) {
    const t = sim.hour, h = t % 24, day = Math.floor(t / 24) + 1, cs = sim.colony.colonists, n = sim.n, pl = sim.place;
    const R = C.rngFromSeed(`sim:${sim.colony.seed}:${sim.simSeed}:${t}`), biome = W.BIOMES[pl.biome], kind = W.KINDS[pl.kind];
    const say = (k, text, who, scope, detail) => sim.log.push({ t, day, h, kind: k, text, who: who || [], scope: scope || 'global', detail: detail || '' });
    const nm = i => cs[i].name, cas = (i, k) => G.inflect(cs[i].name, cs[i].female, k), vb = (i, m, f) => (cs[i].female ? f : m);
    const cur = Array(n).fill('');
    const mood = i => moodOf(sim, i);
    const thought = (i, text, v, hrs) => { const l = sim.thoughts[i], x = l.find(q => q.text === text); if (x) { x.v = v; x.until = t + hrs; } else { l.push({ text, v, until: t + hrs }); if (l.length > 14) l.shift(); } };
    const hurt = (i, id) => { const m = W.ILLNESS[id], cu = sim.ill[i]; if (cu && W.ILLNESS[cu.id].work <= m.work) return; sim.ill[i] = { id, left: m.hrs[0] + Math.round(R() * (m.hrs[1] - m.hrs[0])), since: t }; sim.stats.illnesses++; };
    const ctx = {
      R, n, cs, name: nm, gen: i => cas(i, 'gen'), dat: i => cas(i, 'dat'), acc: i => cas(i, 'acc'), ins: i => cas(i, 'ins'), v: vb, say, thought, hurt, mood, h,
      act: i => cur[i], skill: (i, s) => C.effSkill(cs[i], s), op: (i, j) => sim.ops[i][j],
      needsAll: (id, d) => { for (let i = 0; i < n; i++) sim.needs[i][id] = clamp(sim.needs[i][id] + d, 0, 1); },
      avgNeed: id => sim.needs.reduce((a, q) => a + q[id], 0) / n,
      workers: job => cs.map((_, i) => i).filter(i => cur[i] === 'робота:' + job),
      guards: () => { const g = cs.map((_, i) => i).filter(i => sim.assign[i].guard > 0 && sim.assign[i].guard <= 2 && !(sim.ill[i] && W.ILLNESS[sim.ill[i].id].bed)); return g.length ? g : cs.map((_, i) => i).filter(i => !(sim.ill[i] && W.ILLNESS[sim.ill[i].id].bed)).slice(0, 1); },
      pickN: (m, k) => { const a = Array.from({ length: m }, (_, i) => i).sort(() => R() - .5); return a.slice(0, Math.min(k, m)); },
      illOnes: () => cs.map((_, i) => i).filter(i => sim.ill[i]),
      cure: (i, hrs) => { if (sim.ill[i]) sim.ill[i].left -= hrs; }, cureAll: hrs => { for (let i = 0; i < n; i++) if (sim.ill[i]) sim.ill[i].left -= hrs; },
      birthday: i => { sim.ageBonus[i]++; }, friendOf: i => { const f = sim.rel.filter(r => (r.a === i || r.b === i) && (r.type === 'friend' || r.type === 'couple' || r.type === 'spouse')); return f.length ? (f[0].a === i ? f[0].b : f[0].a) : null; },
    };

    // 0) закінчились «думки»
    for (let i = 0; i < n; i++) sim.thoughts[i] = sim.thoughts[i].filter(q => q.until > t);

    // 1) погода
    if (t === 0 || R() < .08) {
      const w = W.rollWeather(R, pl.biome, sim.weather);
      if (w !== sim.weather) { sim.weather = w; say('info', `Погода: ${W.WEATHER[w].name.toLowerCase()}`, [], 'weather', `Близько ${W.tempOf(pl.biome, w, h)}°. Настрій ${W.WEATHER[w].mood >= 0 ? '+' : ''}${W.WEATHER[w].mood}, робота просто неба ×${W.WEATHER[w].out}, ризик хвороб ×${W.WEATHER[w].ill}`); }
    }
    const wt = W.WEATHER[sim.weather], illMeta = i => (sim.ill[i] ? W.ILLNESS[sim.ill[i].id] : null), illCount = sim.ill.filter(Boolean).length;
    if (h === 8 || h === 18) sim.load.fill(0);

    // 2) що робить кожен
    cs.forEach((c, i) => {
      const nd = sim.needs[i], im = illMeta(i), night = c.traits.includes('night'), early = c.traits.includes('early');
      const from = early ? 21 : night ? 0 : 22, to = early ? 5 : night ? 8 : 6, asleep = from === 0 ? h < to : (h >= from || h < to);
      let act;
      if (sim.breakdown[i] > 0) { act = 'зрив'; sim.breakdown[i]--; }
      else if (im && im.bed) act = nd.food < .25 ? 'їжа' : 'хворіє';
      else if (asleep && nd.rest > .12) act = 'сон';
      else if (nd.food < .3) act = 'їжа';
      else if (nd.rest < .15) act = 'сон';
      else if (h >= 8 && h < 18) {
        const opts = C.JOBS.filter(j => sim.assign[i][j.id] > 0).sort((a, b) => (sim.assign[i][a.id] - (a.id === 'heal' && illCount ? 1.5 : 0)) - (sim.assign[i][b.id] - (b.id === 'heal' && illCount ? 1.5 : 0)) || c.skills[b.skill] - c.skills[a.skill]);
        const cap = Math.max(1, Math.ceil(n / 3)), j = opts.find(x => sim.load[C.JOBS.indexOf(x)] < cap) || opts[0];
        act = j ? 'робота:' + j.id : 'відпочинок'; if (j) sim.load[C.JOBS.indexOf(j)]++;
      } else act = nd.fun < .45 ? 'розвага' : nd.social < .45 ? 'розмова' : (nd.food < .55 ? 'їжа' : 'відпочинок');
      cur[i] = act;
      // наслідки для потреб (риси й місцевість міняють швидкість спаду; тип поселення — приріст розваги й спілкування)
      for (const x of C.NEEDS) { const mult = c.traits.reduce((a, tt) => a * (C.TRAIT_BY[tt].need[x.id] ?? 1), 1) * (biome.need[x.id] ?? 1); let d = -x.decay * mult; if (act.startsWith('робота') && x.id === 'rest') d *= 1.6; nd[x.id] += d; }
      if (act === 'сон') nd.rest += .22; if (act === 'їжа') nd.food += .55; if (act === 'відпочинок') nd.rest += .06; if (act === 'розвага') nd.fun += .35 * kind.fun; if (act === 'зрив') nd.fun += .1; if (act === 'хворіє') nd.rest += .12;
      if (act.startsWith('робота')) {
        const job = C.JOBS.find(x => 'робота:' + x.id === act), q = C.effSkill(c, job.skill) * (.6 + .4 * mood(i) / 100) * (im ? im.work : 1) * (W.OUTDOOR.has(job.id) ? wt.out : 1);
        sim.work[i] += q; sim.stats.work[job.id] += q;
        if (c.passion[job.skill]) thought(i, 'Улюблена справа', c.passion[job.skill] === 2 ? 5 : 3, 3);
        if (job.id === 'heal' && illCount) { /* лікування рахується нижче */ }
      }
    });

    // 3) розмови: вільні шукають співрозмовника; результат змінює думки й стосунки
    const free = cs.map((_, i) => i).filter(i => /^(розмова|розвага|відпочинок)$/.test(cur[i]) && !(h < 6 || h >= 22)), order = free.slice().sort(() => R() - .5), busy = new Set();
    for (const i of order) {
      if (busy.has(i)) continue;
      const cand = order.filter(j => j !== i && !busy.has(j)); if (!cand.length) break;
      const j = cand.reduce((b, k) => (sim.ops[i][k] + R() * 12 > sim.ops[i][b] + R() * 12 ? k : b), cand[0]);
      busy.add(i); busy.add(j); sim.stats.talks++;
      const o = (sim.ops[i][j] + sim.ops[j][i]) / 2, irritation = (50 - Math.min(mood(i), mood(j))) / 4, roll = R() * 100 - 20 + o - irritation;
      for (const k of [i, j]) { sim.needs[k].social = Math.min(1, sim.needs[k].social + .3 * kind.social); cur[k] = 'розмова'; }
      const bump = (d, ti, tj) => { sim.ops[i][j] = clamp(sim.ops[i][j] + d, -100, 100); sim.ops[j][i] = clamp(sim.ops[j][i] + d, -100, 100); if (ti) { thought(i, ti[0].replace('%', cas(j, 'ins')), ti[1], ti[2]); thought(j, ti[0].replace('%', cas(i, 'ins')), ti[1], ti[2]); } };
      if (roll < 12 && o < 10) {
        if (o < -20 && (R() < .3 || irritation > 12)) {
          sim.stats.brawls++; sim.stats.fights++; bump(-15, ['Бійка з %', -10, 30]);
          const hit = (x, y) => { if (R() < .55 - C.effSkill(cs[x], 'fight') / 60) hurt(x, R() < .15 ? 'wound' : 'bruise'); void y; }; hit(i, j); hit(j, i);
          say('bad', `${nm(i)} і ${nm(j)} побились`, [i, j], 'social', `Взаємна думка ${Math.round(o)}, роздратування ${Math.round(irritation)}`);
        } else { sim.stats.fights++; bump(-8, ['Сварка з %', -6, 14]); say('bad', `${nm(i)} ${vb(i, 'посварився', 'посварилась')} з ${cas(j, 'ins')}`, [i, j], 'social', `Взаємна думка ${Math.round(o)}`); }
      } else if (roll > 78) { sim.stats.bonds++; bump(8, ['Щира розмова з %', 4, 12]); say('good', `${nm(i)} і ${nm(j)} щиро поговорили`, [i, j], 'social', `Взаємна думка ${Math.round(o)}`); }
      else bump(2, ['Розмова з %', 1, 5]);
      // заразні хвороби передаються у розмові
      for (const [x, y] of [[i, j], [j, i]]) { const m = illMeta(x); if (m && m.cont && !sim.ill[y] && R() < .12) { sim.ill[y] = { id: sim.ill[x].id, left: m.hrs[0] + Math.round(R() * (m.hrs[1] - m.hrs[0])), since: t }; sim.stats.illnesses++; say('bad', `${nm(y)} ${vb(y, 'заразився', 'заразилась')} від ${cas(x, 'gen')}: ${m.name.toLowerCase()}`, [y, x], 'health'); } }
      evalBond(i, j);
    }

    // стосунки: спроби миру між суперниками, повільне вирівнювання до звичного
    for (const r of sim.rel) if (r.type === 'rival' && R() < .004 && mood(r.a) > 50 && mood(r.b) > 50) {
      sim.ops[r.a][r.b] += 12; sim.ops[r.b][r.a] += 12; say('good', `${nm(r.a)} і ${nm(r.b)} спробували помиритись`, [r.a, r.b], 'social'); thought(r.a, 'Спроба миру', 3, 12); thought(r.b, 'Спроба миру', 3, 12); evalBond(r.a, r.b);
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) sim.ops[i][j] += (sim.base[i][j] - sim.ops[i][j]) * .012;

    function evalBond(i, j) {
      const avg = (sim.ops[i][j] + sim.ops[j][i]) / 2, r = relOf(sim, i, j), adult = cs[i].age + sim.ageBonus[i] >= 20 && cs[j].age + sim.ageBonus[j] >= 20, both = [i, j];
      const to = (type, k, text, det) => { setRel(sim, i, j, type); say(k, text, both, 'social', det || `Взаємна думка ${Math.round(avg)}`); };
      if (r === 'sibling') return;
      if (!r && avg >= 24) to('friend', 'good', `${nm(i)} і ${nm(j)} потоваришували`);
      else if (!r && avg <= -24) to('rival', 'bad', `${nm(i)} і ${nm(j)} стали ворогами`);
      else if (r === 'friend') {
        if (avg < -25) to('rival', 'bad', `${nm(i)} і ${nm(j)} з друзів стали ворогами`);
        else if (avg < 5) to(null, 'bad', `${nm(i)} і ${nm(j)} віддалились один від одного`);
        else if (avg >= 45 && adult && partnerOf(sim, i) == null && partnerOf(sim, j) == null && R() < .3) { to('couple', 'good', `${nm(i)} і ${nm(j)} закохались`); thought(i, 'Кохання', 8, 72); thought(j, 'Кохання', 8, 72); }
      } else if (r === 'couple') {
        if (avg >= 60 && R() < .15) { to('spouse', 'good', `${nm(i)} і ${nm(j)} одружились: усе поселення гуляє`); for (let k = 0; k < n; k++) thought(k, 'Весілля в поселенні', k === i || k === j ? 12 : 3, 24); }
        else if (avg < 30) to(avg < 5 ? null : 'friend', 'bad', `${nm(i)} і ${nm(j)} розійшлись`);
      } else if (r === 'spouse' && avg < -15) to('rival', 'bad', `${nm(i)} і ${nm(j)} розлучились і тепер вороги`);
      else if (r === 'rival' && avg >= 0) { to(null, 'good', `${nm(i)} і ${nm(j)} помирились`); thought(i, 'Помирились', 5, 24); thought(j, 'Помирились', 5, 24); }
    }

    // 4) події
    const inHours = (e) => { if (!e.hours) return true; const [a, b] = e.hours; return (h >= a && h < b) || (b > 24 && h < b - 24); };
    for (const e of EV) {
      if (!inHours(e) || (e.biome && e.biome !== pl.biome)) continue;
      const p = e.p * (biome.ev[e.id] ?? 1) * (e.raid ? kind.raid : 1), before = sim.log.length;
      if (e.scope === 'global') { if ((!e.test || e.test(ctx)) && R() < p) e.run(ctx); }
      else if (e.scope === 'job') {
        for (const i of ctx.workers(e.job)) { if (e.test && !e.test(ctx, i)) continue; if (R() < p * 4) { e.run(ctx, i); if (e.once) break; } }
      } else for (let i = 0; i < n; i++) { if (e.test && !e.test(ctx, i)) continue; if (R() < p) e.run(ctx, i); }
      if (sim.log.length > before) sim.stats.events++;
    }

    // 5) хвороби: нові, перебіг, лікування
    const healers = cs.map((_, i) => i).filter(i => cur[i] === 'робота:heal' && !(illMeta(i) && illMeta(i).bed)), healPower = healers.reduce((a, i) => a + C.effSkill(cs[i], 'heal'), 0);
    for (let i = 0; i < n; i++) {
      const c = cs[i], nd = sim.needs[i];
      if (sim.ill[i]) {
        const ill = sim.ill[i], m = W.ILLNESS[ill.id], care = healers.length && !healers.includes(i) ? Math.min(1, healPower / (illCount * 14)) : 0;
        ill.left -= 1 + care; if (cur[i] === 'сон' || cur[i] === 'хворіє') ill.left -= .3;
        if (ill.left <= 0) { sim.ill[i] = null; say('good', `${nm(i)} ${vb(i, 'одужав', 'одужала')}: ${m.name.toLowerCase()} позаду`, [i], 'health'); }
      } else {
        const frail = c.traits.includes('frail') ? 2.2 : c.traits.includes('tough') ? .5 : 1, tired = nd.food < .3 || nd.rest < .15 ? 2.2 : 1;
        if (R() < .0007 * biome.ill * wt.ill * frail * tired) {
          const opts = [['cold', 2]];
          if (sim.weather === 'cold' || sim.weather === 'snow') opts.push(['cold', 3], ['frost', 1.5]);
          if (sim.weather === 'heat') opts.push(['heat', 3]);
          if (pl.biome === 'jungle' || pl.biome === 'swamp') opts.push(['fever', 3]);
          if (nd.food < .3) opts.push(['poison', 3]); if (nd.rest < .15) opts.push(['exhaust', 4]);
          const tot = opts.reduce((a, o) => a + o[1], 0); let r = R() * tot, id = 'cold'; for (const o of opts) { r -= o[1]; if (r <= 0) { id = o[0]; break; } }
          const m = W.ILLNESS[id]; sim.ill[i] = { id, left: m.hrs[0] + Math.round(R() * (m.hrs[1] - m.hrs[0])), since: t }; sim.stats.illnesses++;
          say('bad', `${nm(i)} ${vb(i, 'захворів', 'захворіла')}: ${m.name.toLowerCase()}`, [i], 'health', `Погода: ${wt.name.toLowerCase()}, місцевість: ${biome.name.toLowerCase()}`);
        }
      }
    }

    // 6) межі потреб, зриви, голод; запис години
    cs.forEach((c, i) => {
      const nd = sim.needs[i]; for (const x of C.NEEDS) nd[x.id] = clamp(nd[x.id], 0, 1);
      const m = mood(i);
      if (m < 22 && sim.breakdown[i] === 0 && R() < .35) { sim.breakdown[i] = 2; sim.stats.breakdowns++; say('bad', `${nm(i)} ${vb(i, 'зірвався', 'зірвалась')}: ${m < 12 ? 'ховається й відмовляється працювати' : 'кидає все й іде гуляти'}`, [i], 'person', `Настрій ${m}`); }
      if (nd.food === 0 && h % 3 === 0) say('bad', `${nm(i)} голодує`, [i], 'person');
      sim.acts[i].push(cur[i]);
    });
    sim.hour++;
    if (sim.acts[0].length > ACTS_KEEP) { for (const a of sim.acts) a.splice(0, 24 * 7); sim.actsFrom += 24 * 7; }
    if (sim.log.length > LOG_KEEP) sim.log.splice(0, sim.log.length - LOG_KEEP * .75);
  }

  const run = (sim, hours) => { for (let k = 0; k < hours; k++) step(sim); return sim; };
  /* Відтворення стану: те саме місце, колонія, варіант і кількість годин завжди дають той самий стан. */
  const replay = (colony, place, simSeed, hours) => run(create(colony, place, simSeed), hours);

  // що робив колоніст у конкретну добу, стисло: [{ from, to, act, events: [...] }]; години без подій зливаються в один блок
  function history(sim, i, day) {
    const t0 = (day - 1) * 24, out = [];
    for (let h = 0; h < 24; h++) {
      const t = t0 + h, idx = t - sim.actsFrom; if (t >= sim.hour) break; if (idx < 0 || !sim.acts[i][idx]) continue;
      const act = sim.acts[i][idx], evs = sim.log.filter(e => e.t === t && e.who.includes(i)), last = out[out.length - 1];
      if (last && last.act === act && !evs.length && !last.events.length) last.to = h + 1; else out.push({ from: h, to: h + 1, act, events: evs });
    }
    return out;
  }
  const snapshot = sim => ({ hour: sim.hour, day: Math.floor(sim.hour / 24) + 1, h: sim.hour % 24, weather: sim.weather, moods: sim.colony.colonists.map((_, i) => moodOf(sim, i)), ill: sim.ill.filter(Boolean).length });

  return { create, step, run, replay, moodOf, moodParts, history, snapshot, relOf, partnerOf };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ColonySim;
