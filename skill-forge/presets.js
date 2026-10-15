/* Конструктор скілів: готові приклади (архетипи, зібрані з цеглинок) і генератор випадкового скіла.
   Запис: { id, name, desc, tags, element, cast, aim, tree: [[цеглинка, параметри, [вкладені…]], …] }. Назви власні. */
const ForgePresets = (() => {
  const F = typeof ForgeCore !== 'undefined' ? ForgeCore : require('./forge-core.js');
  const C = (time, cooldown, cost, resource = 'mana', charges = 1) => ({ time, cooldown, cost, resource, charges });
  const A = (mode, range) => ({ mode, range });
  const LIST = [
    { id: 'firebolt', name: 'Вогняний шар', desc: 'Класичний снаряд зі вибухом: б’є ціль і опікує сусідів.', tags: ['маг', 'снаряд'], element: 'fire', cast: C(0.6, 4, 18), aim: A('enemy', 18),
      tree: [['projectile', {}, [['explode', { radius: 3 }], ['damage', { amount: 120, element: 'fire' }], ['dot', { amount: 15, duration: 4, element: 'fire' }]]]] },
    { id: 'arc', name: 'Дуга блискавки', desc: 'Розряд перестрибує з ворога на ворога, слабшаючи.', tags: ['маг', 'ланцюг'], element: 'lightning', cast: C(0.5, 5, 25), aim: A('enemy', 14),
      tree: [['single', { range: 14 }, [['chain', { bounces: 4, falloff: 85 }], ['damage', { amount: 90, element: 'lightning' }]]]] },
    { id: 'whirl', name: 'Вир лез', desc: 'Круговий удар по всіх навколо; відкидає ворогів.', tags: ['воїн', 'область'], element: 'phys', cast: C(0.3, 3, 10, 'rage'), aim: A('self', 0),
      tree: [['melee', { radius: 3, angle: 360 }, [['damage', { amount: 180 }], ['knockback', { distance: 3 }]]]] },
    { id: 'icelance', name: 'Крижаний спис', desc: 'Влучний постріл, що пробиває ряд ворогів і сповільнює їх.', tags: ['маг', 'пробиття'], element: 'ice', cast: C(0.7, 4, 20), aim: A('direction', 20),
      tree: [['projectile', { range: 22, speed: 30 }, [['pierce', { count: 4 }], ['damage', { amount: 55, element: 'ice' }], ['slow', { pct: 40, duration: 3 }]]]] },
    { id: 'tide', name: 'Цілюща хвиля', desc: 'Миттєве лікування з подальшим відновленням, ще й для союзників.', tags: ['цілитель'], element: 'holy', cast: C(1, 8, 30), aim: A('self', 0),
      tree: [['burst', { center: 'caster', radius: 6 }, [['heal', { amount: 100, to: 'allies' }], ['hot', { amount: 15, duration: 6, to: 'allies' }], ['cleanse', { count: 1, to: 'allies' }]]]] },
    { id: 'shieldbash', name: 'Удар щитом', desc: 'Близький удар: шкода, оглушення і власний щит.', tags: ['воїн', 'контроль'], element: 'phys', cast: C(0.3, 6, 10, 'rage'), aim: A('enemy', 3),
      tree: [['melee', { radius: 2.5, angle: 90 }, [['damage', { amount: 110 }], ['stun', { duration: 1.5 }], ['shield', { amount: 100, duration: 6, to: 'self' }]]]] },
    { id: 'meteors', name: 'Град комет', desc: 'Багато ударів по області; кожен залишає палаючу землю.', tags: ['маг', 'область', 'ультимейт'], element: 'fire', cast: C(1.5, 15, 50), aim: A('ground', 16),
      tree: [['rain', { radius: 8, count: 14, duration: 4 }, [['damage', { amount: 160, element: 'fire' }], ['stun', { duration: 0.5 }]]]] },
    { id: 'drain', name: 'Дотик занепаду', desc: 'Виснажує ціль і лікує гравця частиною шкоди.', tags: ['чорнокнижник', 'вампіризм'], element: 'shadow', cast: C(0.4, 6, 20), aim: A('enemy', 10),
      tree: [['single', { range: 10 }, [['lifesteal', { pct: 50 }], ['damage', { amount: 110, element: 'shadow' }], ['dot', { amount: 12, duration: 6, element: 'shadow' }]]]] },
    { id: 'charge', name: 'Ривок із ударом', desc: 'Стрімкий ривок крізь ворогів; після нього — удар по площі.', tags: ['воїн', 'рух'], element: 'phys', cast: C(0.2, 5, 10, 'energy'), aim: A('direction', 10),
      tree: [['dash', { distance: 10 }], ['burst', { center: 'caster', radius: 3.5 }, [['damage', { amount: 150 }], ['knockup', { duration: 0.8 }]]]] },
    { id: 'venomtrap', name: 'Отруйна пастка', desc: 'Лежить на землі; коли спрацює, травить і сповільнює тих, що поруч.', tags: ['розвідник', 'пастка'], element: 'poison', cast: C(0.5, 12, 15, 'energy'), aim: A('ground', 8),
      tree: [['trap', { radius: 3, duration: 40 }, [['damage', { amount: 90, element: 'poison' }], ['dot', { amount: 30, duration: 8, element: 'poison' }], ['slow', { pct: 50, duration: 5 }]]]] },
    { id: 'stonewall', name: 'Кам’яний бар’єр', desc: 'Вирастає смуга каменю: ворогів, що торкаються, підкидає й ранить.', tags: ['маг', 'контроль місцевості'], element: 'phys', cast: C(0.8, 5, 20), aim: A('ground', 10),
      tree: [['wall', { length: 10, duration: 8 }, [['damage', { amount: 110 }], ['knockback', { distance: 2 }]]]] },
    { id: 'spirits', name: 'Прикликання духів', desc: 'Двоє духів б’ють ворогів, а коли зникають — вибухають.', tags: ['некромант', 'виклик'], element: 'shadow', cast: C(1, 25, 45), aim: A('ground', 8),
      tree: [['summon', { count: 2, duration: 14 }, [['damage', { amount: 35, element: 'shadow' }], ['on_expire', {}, [['burst', { center: 'caster', radius: 4 }, [['damage', { amount: 90, element: 'shadow' }]]]]]]]] },
    { id: 'shadowstep', name: 'Тіньовий крок', desc: 'Переміщення за спину цілі з невидимістю і посиленим наступним ударом.', tags: ['розбійник', 'рух'], element: 'shadow', cast: C(0.1, 4, 10, 'energy'), aim: A('enemy', 12),
      tree: [['teleport', { distance: 12 }], ['stealth', { duration: 4, breaks: true }], ['buff', { stat: 'atk', pct: 40, duration: 5 }]] },
    { id: 'volley', name: 'Рій стріл', desc: 'Віяло стріл, що самі наводяться; кожна слабша, але разом сильно.', tags: ['лучник', 'розкол'], element: 'phys', cast: C(0.6, 7, 25, 'energy'), aim: A('direction', 20),
      tree: [['projectile', { speed: 38 }, [['fork', { copies: 5, spread: 60, power: 65 }], ['homing', { strength: 70 }], ['critical', { chance: 30, mult: 2 }], ['damage', { amount: 120 }]]]] },
    { id: 'frostnova', name: 'Крижаний вибух', desc: 'Вибух навколо гравця: шкода, заморожування на місці й власний щит.', tags: ['маг', 'контроль'], element: 'ice', cast: C(0.5, 14, 35), aim: A('self', 0),
      tree: [['burst', { center: 'caster', radius: 5.5 }, [['damage', { amount: 130, element: 'ice' }], ['root', { duration: 2 }], ['shield', { amount: 60, to: 'self', duration: 5 }]]]] },
    { id: 'executioner', name: 'Кара', desc: 'Потужний удар по цілі; якщо вона гине — відновлює ресурс і прискорює гравця.', tags: ['воїн', 'добивання'], element: 'phys', cast: C(0.4, 8, 25, 'rage'), aim: A('enemy', 3),
      tree: [['single', { range: 3 }, [['execute', { threshold: 30, bonus: 150 }], ['damage', { amount: 220 }], ['on_kill', { chance: 100 }, [['restore', { resource: 'rage', amount: 30, to: 'self' }], ['buff', { stat: 'move', pct: 30, duration: 4, to: 'self' }]]]]]] },
    { id: 'beamfire', name: 'Промінь світла', desc: 'Утримуваний потік, що пропалює всіх на лінії.', tags: ['маг', 'потік'], element: 'holy', cast: C(0.3, 4, 25), aim: A('direction', 14),
      tree: [['beam', { range: 14, width: 1.2 }, [['channel', { duration: 3, tick: 0.5 }], ['damage', { amount: 120, element: 'holy' }]]]] },
    { id: 'curse', name: 'Прокляття слабкості', desc: 'Аура навколо гравця послаблює ворогів і позначає їх для всіх.', tags: ['чорнокнижник', 'послаблення'], element: 'shadow', cast: C(0.6, 18, 30), aim: A('self', 0),
      tree: [['aura', { radius: 6, duration: 10, tick: 2 }, [['debuff', { stat: 'def', pct: 25, duration: 6 }], ['mark', { pct: 20, duration: 6 }], ['silence', { duration: 1 }]]]] },
  ];

  function build(preset) {
    const s = F.newSkill(preset.name);
    s.desc = preset.desc || ''; s.tags = (preset.tags || []).slice(); s.element = preset.element || 'phys';
    s.cast = Object.assign(s.cast, preset.cast); s.aim = Object.assign(s.aim, preset.aim);
    const put = (items, parentId) => {
      for (const [t, p, kids] of items) {
        const b = F.add(s, t, parentId, p);
        if (!b) throw new Error(`Приклад «${preset.name}»: ${t} — ${F.lastError}`);
        if (kids) put(kids, b.id);
      }
    };
    put(preset.tree, null);
    return s;
  }

  /* ---------- випадковий скіл ---------- */
  const ADJ = { fire: ['Палаючий', 'Жарий', 'Вогненний'], ice: ['Морозний', 'Крижаний', 'Інеїстий'], lightning: ['Громовий', 'Іскристий', 'Грозовий'], poison: ['Їдкий', 'Змієвий', 'Отруйний'], holy: ['Сяйливий', 'Світлий', 'Ясний'], shadow: ['Мрячний', 'Тіньовий', 'Безодній'], arcane: ['Таємний', 'Зоряний', 'Дивний'], phys: ['Нищівний', 'Залізний', 'Лютий'] };
  const NOUN = { single: 'Удар', melee: 'Замах', projectile: 'Спис', beam: 'Промінь', cone: 'Подих', burst: 'Вибух', zone: 'Вир', aura: 'Покров', rain: 'Дощ', trap: 'Капкан', wall: 'Вал', summon: 'Поклик' };
  function random(seed) {
    const rng = F.rngFromSeed(seed), pick = a => a[Math.floor(rng() * a.length)], chance = p => rng() < p;
    const s = F.newSkill();
    s.element = pick(F.ELEMENTS)[0];
    const dels = F.byCat('delivery'), mods = F.byCat('modifier'), effs = F.byCat('effect');
    const dmgEffs = effs.filter(e => ['damage', 'dot'].includes(e.id)), otherEffs = effs.filter(e => !['damage', 'dot'].includes(e.id));
    const randParams = d => {
      const p = {};
      for (const sp of F.paramSpecs(d)) {
        if (sp.type === 'num') { const x = sp.def + (rng() - 0.5) * (sp.max - sp.min) * 0.5; p[sp.k] = F.clampParam(sp, x); }
        else if (sp.type === 'enum') p[sp.k] = sp.k === 'element' ? s.element : sp.k === 'to' ? sp.def : pick(sp.options)[0];
        else p[sp.k] = chance(0.5);
      }
      return p;
    };
    const del = pick(dels);
    const root = F.add(s, del.id, null, randParams(del));
    const okMods = mods.filter(m => !m.only || m.only.includes(del.id));
    const nm = Math.floor(rng() * 3);
    const used = new Set();
    for (let i = 0; i < nm && okMods.length; i++) { const m = pick(okMods); if (!used.has(m.id)) { used.add(m.id); F.add(s, m.id, root.id, randParams(m)); } }
    F.add(s, pick(dmgEffs).id, root.id, randParams(pick(dmgEffs)));
    const extra = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < extra; i++) { const e = pick(otherEffs); F.add(s, e.id, root.id, randParams(e)); }
    if (chance(0.4)) {
      const tr = pick(F.byCat('trigger')), t = F.add(s, tr.id, root.id, randParams(tr));
      const e = pick(effs); F.add(s, e.id, t.id, Object.assign(randParams(e), e.toDef ? { to: e.toDef } : {}));
    }
    s.name = `${pick(ADJ[s.element])} ${NOUN[del.id].toLowerCase()}`; s.name = s.name[0].toUpperCase() + s.name.slice(1);
    s.aim.mode = pick(F.AIM_MODES)[0];
    // ціна й перезарядка за оцінкою, щоб випадковий скіл був більш-менш збалансований
    if (typeof ForgeEval !== 'undefined' || typeof require !== 'undefined') {
      const E = typeof ForgeEval !== 'undefined' ? ForgeEval : require('./forge-eval.js');
      s.cast.cost = 20; s.cast.cooldown = 4;
      const ev = E.evaluate(s);
      s.cast.cooldown = Math.min(120, Math.max(1, ev.suggestCooldown)); 
    }
    return s;
  }
  return { LIST, build, random, byId: id => LIST.find(p => p.id === id) };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ForgePresets;
