/* Character Roller: ядро. Генерація листка персонажа за правилами SRD 5.1 (D&D 5e).
   Без DOM: працює і в браузері (глобал CharCore), і в Node (module.exports), тож його можна тестувати.
   Усе детерміноване: однакові параметри й seed дають того самого персонажа. */
const CharCore = (() => {
  if (typeof module !== 'undefined' && module.exports && typeof globalThis.SRD === 'undefined') {
    require('./srd-spells.js'); require('./srd-data.js'); require('./srd-classes.js');
  }
  const SRD = globalThis.SRD;
  const AB = SRD.ABILITIES.map(a => a.id);
  const AB_NAME = Object.fromEntries(SRD.ABILITIES.map(a => [a.id, a.name]));
  const SKILL = Object.fromEntries(SRD.SKILLS.map(s => [s.id, s]));
  const WEAPON = Object.fromEntries(SRD.WEAPONS.map(w => [w.id, w]));
  const ARMOR = Object.fromEntries(SRD.ARMOR.map(a => [a.id, a]));
  const SPELLS = SRD.spells;
  const FORMAT = 'zbyrai.character-roller';

  /* ---------- детермінований генератор ---------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());
  const randomSeed = () => Math.random().toString(36).slice(2, 8);

  function makeR(seed) {
    const rng = rngFromSeed(seed);
    const R = {
      rng,
      int: (a, b) => a + Math.floor(rng() * (b - a + 1)),
      pick: arr => arr[Math.floor(rng() * arr.length)],
      chance: p => rng() < p,
      shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      weighted(arr, wfn) {
        const ws = arr.map(wfn); const tot = ws.reduce((s, x) => s + x, 0);
        if (!(tot > 0)) return R.pick(arr);
        let t = rng() * tot;
        for (let i = 0; i < arr.length; i++) { t -= ws[i]; if (t < 0) return arr[i]; }
        return arr[arr.length - 1];
      },
      pickN(arr, n) { return R.shuffle(arr).slice(0, Math.max(0, n)); },
      weightedN(arr, wfn, n) {
        const pool = arr.slice(); const out = [];
        while (out.length < n && pool.length) { const x = R.weighted(pool, wfn); out.push(x); pool.splice(pool.indexOf(x), 1); }
        return out;
      },
    };
    return R;
  }

  const modOf = s => Math.floor((s - 10) / 2);
  const profOf = L => 2 + Math.floor((L - 1) / 4);
  const sign = n => (n >= 0 ? '+' : '') + n;
  const ftToM = ft => Math.round(ft * 0.3 * 10) / 10;
  const fmtSpeed = ft => `${ft} фт (${String(ftToM(ft)).replace('.', ',')} м)`;
  const uniq = a => [...new Set(a)];

  const METHODS = [['4d6', '4d6, відкинути найменший'], ['standard', 'Стандартний набір (15 14 13 12 10 8)'], ['pointbuy', 'Point buy (27 очок)'], ['3d6', '3d6 по порядку (класика)']];
  const POINT_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

  /* ---------- параметри ---------- */
  function sanitize(o = {}) {
    const has = (list, id) => list.some(x => x.id === id);
    const P = {
      race: 'any', subrace: 'any', cls: 'any', subclass: 'any', level: 'any', levelMin: 1, levelMax: 20, background: 'any', alignment: 'any',
      method: '4d6', assign: 'smart', hp: 'average', smartGear: true, abilities: {}, skills: [], trait: null, ideal: null, bond: null, flaw: null, name: '',
    };
    if (has(SRD.RACES, o.race)) P.race = o.race;
    const race = SRD.RACES.find(r => r.id === P.race);
    if (race && o.subrace && race.subraces.some(s => s.id === o.subrace)) P.subrace = o.subrace;
    if (o.cls && has(SRD.CLASSES, o.cls)) P.cls = o.cls;
    if (o.subclass && o.subclass !== 'any') {
      const owner = SRD.CLASSES.find(c => c.subclass.id === o.subclass);
      if (owner) { P.subclass = o.subclass; if (P.cls === 'any') P.cls = owner.id; else if (P.cls !== owner.id) P.subclass = 'any'; }
    }
    const lv = Number(o.level);
    if (Number.isInteger(lv) && lv >= 1 && lv <= 20) P.level = lv;
    let lo = Math.round(Number(o.levelMin)), hi = Math.round(Number(o.levelMax));
    lo = Number.isFinite(lo) ? Math.min(20, Math.max(1, lo)) : 1; hi = Number.isFinite(hi) ? Math.min(20, Math.max(1, hi)) : 20;
    P.levelMin = Math.min(lo, hi); P.levelMax = Math.max(lo, hi);
    if (has(SRD.BACKGROUNDS, o.background)) P.background = o.background;
    if (has(SRD.ALIGNMENTS, o.alignment)) P.alignment = o.alignment;
    if (o.method === 'any' || METHODS.some(m => m[0] === o.method)) P.method = o.method;
    if (o.assign === 'random' || o.assign === 'smart' || o.assign === 'any') P.assign = o.assign;
    if (o.hp === 'roll' || o.hp === 'average') P.hp = o.hp;
    P.smartGear = o.smartGear !== false;
    if (o.abilities) for (const a of AB) { const v = Number(o.abilities[a]); if (o.abilities[a] !== '' && o.abilities[a] != null && Number.isInteger(v) && v >= 3 && v <= 20) P.abilities[a] = v; }
    if (Array.isArray(o.skills)) P.skills = o.skills.filter(s => SKILL[s]);
    for (const k of ['trait', 'ideal', 'bond', 'flaw']) { const v = Number(o[k]); if (o[k] != null && o[k] !== '' && Number.isInteger(v) && v >= 0) P[k] = v; }
    P.name = String(o.name || '').slice(0, 60);
    return P;
  }

  /* ---------- характеристики ---------- */
  function roll4d6(R) { const d = [R.int(1, 6), R.int(1, 6), R.int(1, 6), R.int(1, 6)].sort((a, b) => a - b); return { dice: d, total: d[1] + d[2] + d[3] }; }

  function pointBuy(free, weightOf, R) {
    const v = {}; for (const a of free) v[a] = 8;
    let pts = 27;
    for (;;) {
      const opts = free.filter(a => v[a] < 15 && POINT_COST[v[a] + 1] - POINT_COST[v[a]] <= pts);
      if (!opts.length) break;
      const a = R.weighted(opts, weightOf);
      pts -= POINT_COST[v[a] + 1] - POINT_COST[v[a]]; v[a]++;
    }
    return v;
  }

  function rollBase(P, method, assign, cls, R) {
    const fixed = P.abilities; const free = AB.filter(a => fixed[a] == null);
    const base = Object.assign({}, fixed); const info = { method, assign, rolls: [] };
    let order = cls.altPrimary && R.chance(0.4) ? cls.altPrimary.slice() : cls.primary.slice();
    if (assign === 'smart') for (let i = 1; i < order.length - 1; i++) if (R.chance(0.2)) { [order[i], order[i + 1]] = [order[i + 1], order[i]]; i++; }
    const rank = a => order.indexOf(a);
    if (method === 'pointbuy') {
      const w = assign === 'smart' ? a => 6 - rank(a) + 0.5 : () => 1;
      Object.assign(base, pointBuy(free, w, R));
      info.rolls = free.map(a => base[a]);
      return { base, info };
    }
    let pool;
    if (method === 'standard') pool = [15, 14, 13, 12, 10, 8];
    else if (method === '3d6') {
      pool = AB.map(() => { const d = [R.int(1, 6), R.int(1, 6), R.int(1, 6)]; return d[0] + d[1] + d[2]; });
      info.rolls = pool.slice();
      // класика: по порядку характеристик, без вибору
      const rest = AB.filter(a => fixed[a] == null);
      for (const a of rest) base[a] = pool[AB.indexOf(a)];
      info.assign = 'order';
      return { base, info };
    } else { pool = AB.map(() => roll4d6(R)); info.rolls = pool.map(x => x.dice.slice().reverse()); pool = pool.map(x => x.total); }
    pool = R.shuffle(pool).slice(0, free.length).sort((a, b) => b - a);
    if (assign === 'smart') { const sorted = free.slice().sort((a, b) => rank(a) - rank(b)); sorted.forEach((a, i) => { base[a] = pool[i]; }); }
    else { const sh = R.shuffle(pool); free.forEach((a, i) => { base[a] = sh[i]; }); }
    return { base, info };
  }

  /* ---------- допоміжне для зброї й броні ---------- */
  function attackAbility(w, sc, cls) {
    const str = modOf(sc.str), dex = modOf(sc.dex);
    if (cls && cls.id === 'monk' && isMonkWeapon(w)) return str >= dex ? 'str' : 'dex';
    if (w.ranged) return 'dex';
    if (w.finesse) return str >= dex ? 'str' : 'dex';
    return 'str';
  }
  const isMonkWeapon = w => w.id === 'shortsword' || (w.cat === 'simple' && !w.ranged && !w.two && !w.heavy);
  function weaponProf(set, w) { return set.has(w.cat) || set.has(w.id); }
  function armorAc(a, sc) {
    const dex = modOf(sc.dex);
    if (a.dexCap === null) return a.ac + dex;
    if (a.dexCap === 0) return a.ac;
    return a.ac + Math.min(dex, a.dexCap);
  }
  function weaponFit(w, sc, set, prof, cls) {
    const m = modOf(sc[attackAbility(w, sc, cls)]);
    const avg = w.dice.includes('d') ? Number(w.dice.split('d')[0]) * (Number(w.dice.split('d')[1]) + 1) / 2 : 1;
    return m + (weaponProf(set, w) ? prof : 0) + avg / 4;
  }

  /* ---------- спорядження ---------- */
  function parseToken(t) {
    let qty = 1; let m = /^(\d+)\*(.+)$/.exec(t); if (m) { qty = Number(m[1]); t = m[2]; }
    if (t === 'shield') return { kind: 'shield', qty };
    if (t === '?instrument') return { kind: 'instrument', qty };
    const i = t.indexOf(':'); return { kind: t.slice(0, i), id: t.slice(i + 1), qty };
  }

  function buildEquipment(ctx) {
    const { cls, R, sc, profSet, armorSet, prof, P, smart } = ctx;
    const noMetal = !!cls.noMetal;
    const weaponOk = w => weaponProf(profSet, w);
    function candidates(spec, noTwo) {
      let list = SRD.WEAPONS.filter(w => (spec.startsWith('martial') ? w.cat === 'martial' : w.cat === 'simple') && weaponOk(w));
      if (spec.endsWith('melee')) list = list.filter(w => !w.ranged);
      if (list.length > 1) list = list.filter(w => w.id !== 'lance');
      if (noTwo) list = list.filter(w => !w.two && !w.ranged);
      return list;
    }
    function tokenFit(tk, noTwo) {
      if (tk.kind === 'w') return weaponFit(WEAPON[tk.id], sc, profSet, prof, cls);
      if (tk.kind === '?w') { const c = candidates(tk.id, noTwo); return c.length ? Math.max(...c.map(w => weaponFit(w, sc, profSet, prof, cls))) : 0; }
      if (tk.kind === 'a') { const a = ARMOR[tk.id]; return armorSet.has(a.type) ? (armorAc(a, sc) - 10) * 0.6 : -5; }
      if (tk.kind === 'shield') return armorSet.has('shield') ? 1.2 : -2;
      return 0;
    }
    function optionValid(opt) {
      return opt.every(t => { const tk = parseToken(t);
        if (tk.kind === 'w') return weaponOk(WEAPON[tk.id]);
        if (tk.kind === 'a') return armorSet.has(ARMOR[tk.id].type) && !(noMetal && !['leather', 'padded', 'hide'].includes(tk.id));
        if (tk.kind === '?w') return candidates(tk.id, false).length > 0;
        return true; });
    }
    const chosen = []; const picks = [];
    for (const t of cls.equip.fixed) chosen.push({ tokens: [t], fixed: true });
    cls.equip.choices.forEach((opts, idx) => {
      let valid = opts.filter(optionValid); if (!valid.length) valid = [opts[0]];
      let opt;
      if (valid.length === 1) opt = valid[0];
      else if (smart) opt = R.weighted(valid, o => Math.exp(0.7 * o.reduce((s, t) => s + tokenFit(parseToken(t), o.includes('shield')), 0) / Math.max(1, o.filter(t => /^(\?w|w|a|shield)/.test(t)).length) * 1.0));
      else opt = R.pick(valid);
      chosen.push({ tokens: opt, fixed: false, idx });
      picks.push(idx);
    });
    const items = [];
    const add = (name, qty, extra) => { const e = items.find(i => i.name === name && i.kind === (extra && extra.kind)); if (e) e.qty += qty; else items.push(Object.assign({ name, qty }, extra || {})); };
    for (const grp of chosen) {
      const withShield = grp.tokens.includes('shield');
      for (const t of grp.tokens) {
        const tk = parseToken(t);
        if (tk.kind === 'w') add(WEAPON[tk.id].name, tk.qty, { kind: 'weapon', id: tk.id });
        else if (tk.kind === '?w') {
          const c = candidates(tk.id, withShield);
          const w = c.length ? (smart ? R.weighted(c, x => Math.exp(0.8 * weaponFit(x, sc, profSet, prof, cls))) : R.pick(c)) : WEAPON.club;
          add(w.name, tk.qty, { kind: 'weapon', id: w.id });
        } else if (tk.kind === 'a') add(ARMOR[tk.id].name, 1, { kind: 'armor', id: tk.id });
        else if (tk.kind === 'shield') add('Щит', 1, { kind: 'shield' });
        else if (tk.kind === 'pack') add(SRD.PACK_NAMES[tk.id], 1, { kind: 'pack', contents: SRD.PACKS[tk.id] });
        else if (tk.kind === 'g') {
          if (tk.id === 'wooden-shield') add('Дерев’яний щит', 1, { kind: 'shield', wooden: true });
          else if (tk.id === 'arrows' || tk.id === 'bolts') add(SRD.GEAR_NAMES[tk.id], 1);
          else add(SRD.GEAR_NAMES[tk.id] || tk.id, tk.qty);
        } else if (tk.kind === 'instrument') add(R.pick(SRD.INSTRUMENTS), 1);
      }
    }
    return { items, picks };
  }

  /* ---------- закляття ---------- */
  const spellsOf = (clsId, lvl) => SPELLS.list.filter(s => s.lvl === lvl && s.classes.includes(clsId));
  const brief = s => ({ id: s.id, name: s.name, en: s.en, lvl: s.lvl, school: s.school });

  function slotsFor(caster, L) {
    if (caster.type === 'full') return { slots: SRD.FULL_SLOTS[L - 1].slice(), max: SRD.FULL_SLOTS[L - 1].length };
    if (caster.type === 'half') { const s = SRD.HALF_SLOTS[L - 1].slice(); return { slots: s, max: s.length }; }
    const [n, lv] = SRD.PACT_SLOTS[L - 1]; return { slots: null, pact: { count: n, level: lv }, max: lv };
  }

  /* ---------- головна функція ---------- */
  function generate(rawOpts, seedIn) {
    const seed = String(seedIn == null || seedIn === '' ? randomSeed() : seedIn);
    const P = sanitize(rawOpts);
    const R = makeR(seed);
    const log = { hp: [], asi: [], notes: [] };

    // раса, клас, рівень, передісторія
    const race = P.race === 'any' ? R.pick(SRD.RACES) : SRD.RACES.find(r => r.id === P.race);
    const sub = race.subraces.length ? (P.subrace !== 'any' && race.subraces.find(s => s.id === P.subrace)) || R.pick(race.subraces) : null;
    const cls = P.cls === 'any' ? R.pick(SRD.CLASSES) : SRD.CLASS_BY_ID[P.cls];
    const L = P.level !== 'any' ? P.level : R.int(P.levelMin, P.levelMax);
    const bg = P.background === 'any' ? R.pick(SRD.BACKGROUNDS) : SRD.BACKGROUNDS.find(b => b.id === P.background);
    const scl = cls.subclass; const hasSub = L >= scl.lvl;
    const prof = profOf(L);
    const method = P.method === 'any' ? R.pick(METHODS)[0] : P.method;
    const assign = P.assign === 'any' ? R.pick(['smart', 'random']) : P.assign;

    // характеристики
    const { base, info } = rollBase(P, method, assign, cls, R);
    const ab = {}; for (const a of AB) ab[a] = { base: base[a], racial: 0, asi: 0 };
    const addRacial = (o) => { for (const [a, v] of Object.entries(o || {})) ab[a].racial += v; };
    addRacial(race.asi); if (sub) addRacial(sub.asi);
    const racialNotes = [];
    if (race.freeAsi) {
      const cand = AB.filter(a => !race.freeAsi.not.includes(a));
      const chosen = assign === 'smart' ? cls.primary.filter(a => cand.includes(a)).slice(0, 2) : R.pickN(cand, race.freeAsi.count);
      for (const a of chosen) { ab[a].racial += race.freeAsi.value; racialNotes.push(`+${race.freeAsi.value} ${AB_NAME[a]}`); }
    }
    const score = a => Math.min(20, ab[a].base + ab[a].racial + ab[a].asi);
    const scoresNow = () => Object.fromEntries(AB.map(a => [a, score(a)]));

    // покращення характеристик та риси
    const asiLevels = [4, 8, 12, 16, 19].concat(cls.asiExtra || []).sort((x, y) => x - y).filter(l => l <= L);
    const feats = [];
    for (const lvl of asiLevels) {
      const grapplerOk = !feats.includes('grappler') && score('str') >= 13;
      const featChance = assign === 'smart' ? 0.1 : 0.2;
      if (grapplerOk && R.chance(featChance)) { feats.push('grappler'); log.asi.push({ lvl, text: 'Риса: Борець (Grappler)' }); continue; }
      const room = a => 20 - (ab[a].base + ab[a].racial + ab[a].asi);
      let plan = [];
      if (assign === 'smart') {
        const pr = cls.primary.filter(a => room(a) > 0).slice(0, 3);
        if (pr.length) {
          const first = pr[0]; const odd = (ab[first].base + ab[first].racial + ab[first].asi) % 2 === 1;
          if (room(first) >= 2 && !odd) plan = [[first, 2]];
          else { const second = pr.find(a => a !== first) || first; plan = first === second ? [[first, 1]] : [[first, 1], [second, 1]]; }
        }
      } else {
        const open = AB.filter(a => room(a) > 0);
        if (open.length) {
          if (R.chance(0.5)) { const a = R.pick(open); plan = [[a, Math.min(2, room(a))]]; }
          else { const two = R.pickN(open, 2); plan = two.map(a => [a, 1]); }
        }
      }
      if (!plan.length) { log.asi.push({ lvl, text: 'Усі характеристики на максимумі' }); continue; }
      for (const [a, v] of plan) ab[a].asi += v;
      log.asi.push({ lvl, text: plan.map(([a, v]) => `${AB_NAME[a]} +${v}`).join(', ') });
    }
    const sc = scoresNow();
    const mod = Object.fromEntries(AB.map(a => [a, modOf(sc[a])]));

    // володіння
    const armorSet = new Set(cls.armor.concat(scl.armorBonus && hasSub ? scl.armorBonus : [], sub && sub.armor ? sub.armor : []));
    const profSet = new Set(cls.weapons.concat(race.weapons || [], sub && sub.weapons ? sub.weapons : []));
    const tools = cls.tools.slice();
    if (race.toolChoice) tools.push(R.pick(race.toolChoice));
    if (sub && sub.tools) tools.push(...sub.tools);
    if (cls.toolPick && cls.toolPick.instrument) tools.push(...R.pickN(SRD.INSTRUMENTS, cls.toolPick.instrument).map(t => t + ' (інструмент)'));
    if (cls.toolPick && cls.toolPick.artisanOrInstrument) tools.push(R.pick(SRD.ARTISAN_TOOLS.concat(SRD.INSTRUMENTS)));

    // навички
    const skillSrc = {}; const own = id => skillSrc[id] != null;
    const grant = (id, src) => { if (!own(id)) { skillSrc[id] = src; return true; } return false; };
    for (const s of race.skills || []) grant(s, race.name);
    const wantW = id => 1 + Math.max(0, mod[SKILL[id].ab]) + (P.skills.includes(id) ? 1e6 : 0);
    const takeSkills = (list, n, src) => { const pool = list.filter(s => !own(s)); for (const s of R.weightedN(pool, wantW, n)) grant(s, src); };
    for (const s of bg.skills) { if (!grant(s, bg.name)) takeSkills(SRD.SKILLS.map(x => x.id), 1, bg.name + ' (заміна)'); }
    const allSkillIds = SRD.SKILLS.map(s => s.id);
    takeSkills(cls.skillList === 'any' ? allSkillIds : cls.skillList, cls.skillCount, cls.name);
    if (race.skillChoice) takeSkills(allSkillIds, race.skillChoice, race.name);
    if (cls.id === 'bard' && hasSub && L >= 3) takeSkills(allSkillIds, 3, scl.name);
    if (cls.id === 'warlock' && false) { /* зарезервовано */ }

    // мови
    const langs = race.langs.slice();
    let extra = (race.extraLangs || 0) + (sub && sub.extraLangs ? sub.extraLangs : 0) + bg.langs;
    const langPool = () => SRD.LANGUAGES.standard.concat(SRD.LANGUAGES.standard, SRD.LANGUAGES.standard, SRD.LANGUAGES.exotic).filter(l => !langs.includes(l));
    while (extra-- > 0) { const p = uniq(langPool()); if (!p.length) break; langs.push(R.weighted(p, l => SRD.LANGUAGES.standard.includes(l) ? 3 : 1)); }
    if (cls.id === 'druid') langs.push('Друїдична (таємна)');
    if (cls.id === 'rogue') langs.push('Злодійський жаргон (таємна)');

    // вибір драконячого походження та інші вибори
    const choices = {};
    if (race.ancestry) choices.dragonborn = R.pick(SRD.DRAGON_ANCESTRY);
    const chosenOf = {}; // id вибору -> текст
    const feats2 = []; // окремі записи рис вибору
    const needs = {}; // скільки разів id зустрічається
    const featureList = [];
    for (const f of cls.features) if (f[0] <= L) featureList.push({ lvl: f[0], name: f[1], d: f[2], id: f[3], n: f[4], src: 'class' });
    if (hasSub) for (const f of scl.features) if (f[0] <= L) featureList.push({ lvl: f[0], name: f[1], d: f[2], id: f[3], n: f[4], src: 'subclass' });

    // ---- вибори, що залежать лише від рівня й характеристик ----
    const sheetChoices = [];
    const expertiseTargets = () => allSkillIds.filter(s => own(s) && !expertise.has(s));
    const expertise = new Set();
    const pickExpertise = n => { const pool = expertiseTargets(); const stealthy = ['stealth', 'perception', 'sleight', 'acrobatics', 'deception', 'persuasion', 'insight', 'investigation'];
      const out = R.weightedN(pool, s => 1 + Math.max(0, mod[SKILL[s].ab]) + (cls.id === 'rogue' && stealthy.includes(s) ? 2 : 0), n); out.forEach(s => expertise.add(s)); return out; };
    let metaLeft = [...SRD.METAMAGIC]; const metamagic = [];
    const secrets = []; const enemies = []; const terrains = [];
    let landType = null; let dragon = null; let pact = null;
    let secretsToPick = 0;
    for (const f of featureList.filter(x => x.id)) {
      if (f.id === 'expertise') { const out = pickExpertise(f.n); f.res = out.map(s => SKILL[s].name).join(', '); }
      else if (f.id === 'metamagic') { const out = R.pickN(metaLeft, f.n); metaLeft = metaLeft.filter(m => !out.includes(m)); out.forEach(m => metamagic.push(m)); f.res = out.map(m => m[0]).join(', '); }
      else if (f.id === 'secrets') { secretsToPick += f.n; }
      else if (f.id === 'enemy') { /* пізніше */ }
      else if (f.id === 'landtype') { landType = R.pick(SRD.LAND_TYPES); f.res = landType; }
      else if (f.id === 'dragon') { dragon = race.ancestry && R.chance(0.7) ? choices.dragonborn : R.pick(SRD.DRAGON_ANCESTRY); f.res = `${dragon.name} дракон (${dragon.dmg})`; }
      else if (f.id === 'pact') { pact = R.pick([['blade', 'Клинок: створюєш магічну зброю угоди'], ['chain', 'Ланцюг: особливий фамільяр («Пошук фамільяра»)'], ['tome', 'Книга: Книга тіней і три додаткові трюки']]); f.res = pact[1]; }
      else if (f.id === 'hunterprey') f.res = R.pick(['Вбивця колосів', 'Мисливець на велетнів', 'Руйнівник орд']);
      else if (f.id === 'deftactics') f.res = R.pick(['Втеча від орди', 'Захист від багатьох атак', 'Сталева воля']);
      else if (f.id === 'multiattack') f.res = R.pick(['Залп', 'Вихор атак']);
      else if (f.id === 'superiordef') f.res = R.pick(['Ухиляння', 'Опір натиску хвиль', 'Незвичайне ухиляння']);
      else if (f.id === 'loreskills') { f.res = ''; }
    }
    if (cls.id === 'ranger') {
      const nEnemy = L >= 14 ? 3 : L >= 6 ? 2 : 1; const nTerr = L >= 10 ? 3 : L >= 6 ? 2 : 1;
      enemies.push(...R.pickN(SRD.ENEMY_TYPES, nEnemy)); terrains.push(...R.pickN(SRD.LAND_TYPES, nTerr));
    }

    // ---- спорядження ----
    const equipRes = buildEquipment({ cls, R, sc, profSet, armorSet, prof, P, smart: P.smartGear });
    const items = equipRes.items;
    for (const g of bg.gear) items.push({ name: g, qty: 1 });
    const gold = bg.gold;

    // ---- бойовий стиль ----
    const weaponsOwned = items.filter(i => i.kind === 'weapon').map(i => WEAPON[i.id]);
    const hasShield = items.some(i => i.kind === 'shield');
    const styles = []; const styleFeat = featureList.filter(f => f.id === 'fstyle' || f.id === 'fstyle2');
    for (const f of styleFeat) {
      const pool = SRD.FIGHTING_STYLES.filter(s => s.classes.includes(cls.id) && !styles.includes(s.id));
      const best = weaponsOwned.slice().sort((a, b) => weaponFit(b, sc, profSet, prof, cls) - weaponFit(a, sc, profSet, prof, cls))[0];
      const wt = s => {
        if (!P.smartGear) return 1;
        const w = best; const armored = items.some(i => i.kind === 'armor');
        switch (s.id) {
          case 'archery': return w && w.ranged ? 6 : 0.5;
          case 'dueling': return w && !w.ranged && !w.two ? 3 : 0.3;
          case 'gwf': return w && !w.ranged && (w.two || w.versatile) ? 4 : 0.3;
          case 'defense': return armored ? 2.5 : 0.5;
          case 'protection': return hasShield ? 2 : 0.2;
          case 'twf': return weaponsOwned.filter(x => x.light && !x.ranged).length >= 2 ? 3 : 0.3;
          default: return 1;
        }
      };
      const st = R.weighted(pool, wt); styles.push(st.id); f.res = `${st.name}: ${st.desc}`;
    }
    const hasStyle = id => styles.includes(id);

    // ---- КБ ----
    const armorItems = items.filter(i => i.kind === 'armor').map(i => ARMOR[i.id]).filter(a => armorSet.has(a.type) && !(a.str && sc.str < a.str));
    const shieldItem = items.find(i => i.kind === 'shield' && armorSet.has('shield'));
    const sh = shieldItem ? 2 : 0;
    const acOptions = [];
    for (const a of armorItems) acOptions.push({ ac: armorAc(a, sc) + sh + (hasStyle('defense') ? 1 : 0), note: a.name + (sh ? ' + щит' : '') + (hasStyle('defense') ? ' (Захист +1)' : ''), armor: a });
    if (cls.id === 'barbarian') acOptions.push({ ac: 10 + mod.dex + mod.con + sh, note: 'Захист без обладунку' + (sh ? ' + щит' : '') });
    if (cls.id === 'monk') acOptions.push({ ac: 10 + mod.dex + mod.wis, note: 'Захист без обладунку (монах)' });
    if (cls.id === 'sorcerer' && hasSub) acOptions.push({ ac: 13 + mod.dex + sh, note: 'Драконяча стійкість' + (sh ? ' + щит' : '') });
    acOptions.push({ ac: 10 + mod.dex + sh, note: 'Без обладунку' + (sh ? ' (щит)' : '') });
    acOptions.sort((a, b) => b.ac - a.ac);
    const acPick = acOptions[0];
    const wornArmor = acPick.armor || null;

    // ---- швидкість ----
    let speed = race.speed;
    const speedNotes = [];
    if (cls.id === 'barbarian' && L >= 5 && !(wornArmor && wornArmor.type === 'heavy')) { speed += 10; speedNotes.push('Швидке пересування +3 м'); }
    if (cls.id === 'monk' && L >= 2 && !wornArmor && !shieldItem) { const b = L < 6 ? 10 : L < 10 ? 15 : L < 14 ? 20 : L < 18 ? 25 : 30; speed += b; speedNotes.push(`Безоружне пересування +${ftToM(b)} м`); }

    // ---- HP ----
    const hd = cls.hd; const hpPer = []; let hp = 0;
    const hpBonusPer = (sub && sub.hpPerLevel ? sub.hpPerLevel : 0) + (cls.id === 'sorcerer' && hasSub ? 1 : 0);
    for (let i = 1; i <= L; i++) {
      let die;
      if (i === 1) die = hd; else if (P.hp === 'roll') die = R.int(1, hd); else die = hd / 2 + 1;
      const v = Math.max(1, die + mod.con) + hpBonusPer;
      hpPer.push({ lvl: i, die, total: v }); hp += v;
    }
    log.hp = hpPer;

    // ---- закляття ----
    const spellcasting = buildSpellcasting({ cls, L, hasSub, sub, race, mod, prof, R, ab, sc, landType, pact, featureList, secretsToPick, P });

    // ---- прохання чаклуна ----
    const invocations = [];
    if (cls.id === 'warlock' && L >= 2) {
      const cnt = L >= 18 ? 8 : L >= 15 ? 7 : L >= 12 ? 6 : L >= 9 ? 5 : L >= 7 ? 4 : L >= 5 ? 3 : 2;
      const eb = spellcasting && spellcasting.cantrips.some(c => c.id === 'eldritch-blast');
      const pactId = pact ? pact[0] : null;
      const pool = SRD.INVOCATIONS.filter(i => i[2] <= L && (!i[3] || (pactId === i[3])) && (!i[4] || eb));
      for (const i of R.pickN(pool, cnt)) invocations.push({ name: i[0], desc: i[1] });
      if (invocations.some(i => i.name.startsWith('Чарівливий вплив'))) { grant('deception', 'Прохання'); grant('persuasion', 'Прохання'); }
    }

    // ---- навички: підсумок ----
    const jack = cls.id === 'bard' && L >= 2;
    const athlete = cls.id === 'fighter' && hasSub && L >= 7;
    const skills = SRD.SKILLS.map(s => {
      const p = own(s.id) ? (expertise.has(s.id) ? 2 : 1) : 0;
      let bonus = mod[s.ab] + p * prof; let half = 0;
      if (!p) { if (jack) half = Math.floor(prof / 2); if (athlete && ['str', 'dex', 'con'].includes(s.ab)) half = Math.max(half, Math.ceil(prof / 2)); bonus += half; }
      return { id: s.id, name: s.name, ab: s.ab, prof: p, bonus, half: half || undefined, src: skillSrc[s.id] };
    });
    const skillBonus = id => skills.find(s => s.id === id).bonus;

    // ---- рятівні кидки ----
    const saveProf = new Set(cls.saves);
    if (cls.id === 'monk' && L >= 14) AB.forEach(a => saveProf.add(a));
    if (cls.id === 'rogue' && L >= 15) saveProf.add('wis');
    const saves = AB.map(a => ({ ab: a, prof: saveProf.has(a), bonus: mod[a] + (saveProf.has(a) ? prof : 0) }));

    // ---- атаки ----
    const attacks = [];
    const martialDie = cls.id === 'monk' ? (L < 5 ? 4 : L < 11 ? 6 : L < 17 ? 8 : 10) : 0;
    for (const it of items.filter(i => i.kind === 'weapon')) {
      const w = WEAPON[it.id]; const a = attackAbility(w, sc, cls); const m = mod[a];
      const pr = weaponProf(profSet, w);
      let bonus = m + (pr ? prof : 0) + (hasStyle('archery') && w.ranged ? 2 : 0);
      let dice = w.dice;
      if (cls.id === 'monk' && isMonkWeapon(w) && martialDie > (Number(w.dice.split('d')[1]) || 0)) dice = '1d' + martialDie;
      let dmg = m;
      const notes = [];
      if (hasStyle('dueling') && !w.ranged && !w.two) { dmg += 2; notes.push('Дуель +2'); }
      if (hasStyle('archery') && w.ranged) notes.push('Стрільба +2');
      if (w.finesse) notes.push('витончена'); if (w.light) notes.push('легка'); if (w.heavy) notes.push('важка');
      if (w.versatile) notes.push('універсальна'); if (w.two) notes.push('дворучна'); if (w.reach) notes.push('досяжність'); if (w.thrown) notes.push('метальна');
      if (w.loading) notes.push('перезарядка');
      if (w.note) notes.push(w.note);
      if (!pr) notes.push('без володіння');
      attacks.push({ name: w.name, bonus, damage: `${dice}${dmg ? sign(dmg) : ''} ${w.dtype}`, notes: notes.join(', '), ranged: w.ranged });
    }
    {
      const a = cls.id === 'monk' ? (mod.str >= mod.dex ? 'str' : 'dex') : 'str';
      const m = mod[a]; const d = cls.id === 'monk' ? `1d${martialDie}${m ? sign(m) : ''}` : `${1 + m}`;
      attacks.push({ name: 'Безоружний удар', bonus: m + prof, damage: `${d} дробляча`, notes: cls.id === 'monk' ? 'Бойові мистецтва' : '' });
    }

    // ---- риси характеру ----
    const traits = P.trait != null && bg.traits[P.trait] ? [bg.traits[P.trait]] : [];
    for (const t of R.shuffle(bg.traits.filter(x => !traits.includes(x)))) { if (traits.length >= 2) break; traits.push(t); }
    const ideal = P.ideal != null && bg.ideals[P.ideal] ? bg.ideals[P.ideal] : R.pick(bg.ideals);
    const bond = P.bond != null && bg.bonds[P.bond] ? bg.bonds[P.bond] : R.pick(bg.bonds);
    const flaw = P.flaw != null && bg.flaws[P.flaw] ? bg.flaws[P.flaw] : R.pick(bg.flaws);
    let alignment;
    if (P.alignment !== 'any') alignment = SRD.ALIGNMENTS.find(a => a.id === P.alignment);
    else {
      let pool = SRD.ALIGNMENTS;
      if (cls.id === 'paladin') pool = pool.filter(a => ['LG', 'NG', 'LN'].includes(a.id));
      const by = f => { const p = pool.filter(f); if (p.length) pool = p; };
      if (ideal.ax === 'L') by(a => a.id[0] === 'L'); else if (ideal.ax === 'C') by(a => a.id[0] === 'C'); else if (ideal.ax === 'G') by(a => a.id.endsWith('G'));
      alignment = R.pick(pool);
    }

    // ---- риси й особливості ----
    const ctx = { L, mod, prof };
    const out = [];
    const raceName = sub ? `${race.name}: ${sub.name}` : race.name;
    for (const [n, d] of race.traits) out.push({ lvl: 1, name: n, desc: d, src: 'race' });
    if (sub) for (const [n, d] of sub.traits) out.push({ lvl: 1, name: n, desc: d, src: 'race' });
    if (race.ancestry) {
      const d = choices.dragonborn; const dice = L >= 16 ? 5 : L >= 11 ? 4 : L >= 6 ? 3 : 2;
      out.push({ lvl: 1, name: 'Драконяче походження', desc: `${d.name} дракон: ${d.dmg}.`, src: 'race' });
      out.push({ lvl: 1, name: 'Подих', desc: `Дією: ${dice}d6 ${d.dmg}, ${d.shape}, рятівний кидок ${AB_NAME[d.save]} (КС ${8 + mod.con + prof}); половина шкоди при успіху; раз на короткий/довгий відпочинок.`, src: 'race' });
      out.push({ lvl: 1, name: 'Опір шкоді', desc: `Опір шкоді типу «${d.dmg}».`, src: 'race' });
    }
    out.push({ lvl: 1, name: bg.feature[0], desc: bg.feature[1], src: 'bg' });
    for (const f of featureList) {
      let d = typeof f.d === 'function' ? f.d(ctx) : f.d;
      if (f.res) d += ' → ' + f.res;
      out.push({ lvl: f.lvl, name: f.name, desc: d, src: f.src });
    }
    if (cls.id === 'ranger') {
      const k = out.findIndex(x => x.name === 'Улюблений ворог'); if (k >= 0) out[k].desc += ' → ' + enemies.join('; ');
      const t = out.findIndex(x => x.name === 'Природний дослідник'); if (t >= 0) out[t].desc += ' → ' + terrains.join('; ');
    }
    if (cls.id === 'sorcerer' && metamagic.length) { /* показано у відповідній рисі */ }
    for (const g of feats) { const ft = SRD.FEATS.find(x => x.id === g); out.push({ lvl: 0, name: ft.name, desc: ft.desc, src: 'feat' }); }
    out.sort((a, b) => a.lvl - b.lvl);

    // ---- підсумок ----
    const passive = id => 10 + skillBonus(id);
    const char = {
      format: FORMAT, version: 1, seed, params: P,
      name: P.name || '',
      race: { id: race.id, name: race.name, subId: sub ? sub.id : null, sub: sub ? sub.name : null, full: raceName, size: race.size, dragon: choices.dragonborn ? choices.dragonborn.name : null },
      cls: { id: cls.id, name: cls.name, hd }, level: L,
      subclass: hasSub ? { id: scl.id, name: scl.name, kind: scl.kind } : null,
      subclassPlanned: { id: scl.id, name: scl.name, kind: scl.kind, lvl: scl.lvl },
      background: { id: bg.id, name: bg.name },
      alignment: { id: alignment.id, name: alignment.name },
      xp: SRD.XP[L - 1],
      method: { id: method, assign: info.assign, rolls: info.rolls },
      abilities: Object.fromEntries(AB.map(a => [a, { base: ab[a].base, racial: ab[a].racial, asi: ab[a].asi, score: sc[a], mod: mod[a], capped: ab[a].base + ab[a].racial + ab[a].asi > 20 }])),
      racialNotes,
      proficiency: prof,
      saves, skills,
      hp: { max: hp, dice: `${L}d${hd}`, perLevel: hpPer, method: P.hp },
      ac: { value: acPick.ac, note: acPick.note, stealthDisadvantage: !!(wornArmor && wornArmor.stealth) },
      initiative: mod.dex,
      speed: { ft: speed, text: fmtSpeed(speed), notes: speedNotes },
      passive: { perception: passive('perception'), insight: passive('insight'), investigation: passive('investigation') },
      carry: { capacity: sc.str * 15, lift: sc.str * 30 },
      languages: langs,
      profs: { armor: [...armorSet].map(a => ({ light: 'Легкі обладунки', medium: 'Середні обладунки', heavy: 'Важкі обладунки', shield: 'Щити' }[a])), weapons: weaponProfText(profSet), tools: uniq(tools) },
      features: out,
      feats: feats.map(g => SRD.FEATS.find(x => x.id === g).name),
      fightingStyles: styles.map(id => SRD.FIGHTING_STYLES.find(s => s.id === id).name),
      invocations, metamagic: metamagic.map(m => ({ name: m[0], desc: m[1] })),
      pact: pact ? pact[1] : null,
      equipment: items, attacks, gold,
      spellcasting,
      personality: { traits, ideal: ideal.t, bond, flaw },
      log,
    };
    return char;
  }

  function weaponProfText(set) {
    const out = [];
    if (set.has('simple')) out.push('Проста зброя');
    if (set.has('martial')) out.push('Бойова зброя');
    for (const x of set) if (x !== 'simple' && x !== 'martial' && WEAPON[x]) out.push(WEAPON[x].name);
    return out;
  }

  function buildSpellcasting(c) {
    const { cls, L, hasSub, sub, race, mod, prof, R, landType, pact, featureList, secretsToPick } = c;
    const caster = cls.caster;
    const innate = [];
    for (const i of race.innate || []) if (L >= i.from) innate.push({ spell: brief(SPELLS.byId[i.spell]), perDay: i.perDay || null, slotLevel: i.slotLevel || null, ability: 'cha' });
    const raceCantrip = sub && sub.wizardCantrip ? R.pick(spellsOf('wizard', 0)) : null;
    const nothing = !caster || (caster.type === 'half' && L < 2);
    if (nothing && !innate.length && !raceCantrip) return null;

    const res = { class: null, ability: null, dc: null, attack: null, slots: [], pact: null, cantrips: [], known: [], prepared: [], book: [], always: [], arcanum: [], secrets: [], innate, raceCantrip: raceCantrip ? brief(raceCantrip) : null, notes: [], mode: caster ? caster.mode : null };
    if (nothing) {
      if (caster && caster.type === 'half') res.notes.push('Класове чаклунство починається з 2 рівня.');
      if (raceCantrip) { res.ability = 'int'; res.dc = 8 + prof + mod.int; res.attack = prof + mod.int; res.notes.push('Трюк високого ельфа використовує Інтелект.'); }
      else if (innate.length) { res.ability = 'cha'; res.dc = 8 + prof + mod.cha; res.attack = prof + mod.cha; }
      return res;
    }
    const abl = caster.ab; res.class = cls.name; res.ability = abl; res.dc = 8 + prof + mod[abl]; res.attack = prof + mod[abl];
    const sl = slotsFor(caster, L); const max = sl.max;
    res.slots = sl.slots || []; res.pact = sl.pact || null; res.maxSpellLevel = max;
    const taken = new Set(); if (raceCantrip) taken.add(raceCantrip.id);
    const take = (s, bucket) => { taken.add(s.id); bucket.push(brief(s)); };
    const lvlBias = s => 1 + s.lvl;

    // списки, що розширюють доступні закляття
    let extraPool = [];
    if (cls.id === 'warlock') for (const [lv, ids] of Object.entries(SRD.DOMAIN_SPELLS.fiend)) if (hasSub && Number(lv) <= max) extraPool.push(...ids.map(i => SPELLS.byId[i]));

    // трюки
    let nCant = caster.cantrips[L - 1];
    if (cls.id === 'druid' && hasSub) nCant += 1;
    const candC = spellsOf(cls.id, 0);
    const cants = [];
    if (cls.id === 'warlock' && nCant > 0 && R.chance(0.85)) { const eb = SPELLS.byId['eldritch-blast']; take(eb, cants); }
    for (const s of R.pickN(candC.filter(s => !taken.has(s.id)), nCant - cants.length)) take(s, cants);
    if (cls.id === 'warlock' && pact && pact[0] === 'tome') {
      const all = SPELLS.list.filter(s => s.lvl === 0 && !taken.has(s.id));
      for (const s of R.pickN(all, 3)) { take(s, cants); cants[cants.length - 1].src = 'Книга тіней'; }
    }
    res.cantrips = cants;

    // домен / клятва / коло / покровитель: завжди підготовлені
    const domainKey = hasSub ? (cls.id === 'druid' ? (landType ? 'land-' + ['arctic', 'coast', 'desert', 'forest', 'grassland', 'mountain', 'swamp'][SRD.LAND_TYPES.indexOf(landType)] : null) : cls.subclass.domain) : null;
    if (domainKey && cls.id !== 'warlock') {
      const table = SRD.DOMAIN_SPELLS[domainKey] || {};
      for (const [lv, ids] of Object.entries(table)) if (Number(lv) <= L) for (const i of ids) { if (!taken.has(i)) { take(SPELLS.byId[i], res.always); } }
    }

    const pool = lv => spellsOf(cls.id, lv).concat(extraPool.filter(s => s.lvl === lv)).filter(s => !taken.has(s.id));
    const allLevels = [];
    for (let lv = 1; lv <= max; lv++) allLevels.push(...pool(lv));

    if (caster.mode === 'known') {
      const n = caster.known[L - 1];
      const picked = R.weightedN(allLevels, lvlBias, n);
      picked.forEach(s => take(s, res.known));
    } else if (caster.mode === 'prepared') {
      const n = Math.max(1, cls.id === 'paladin' ? mod[abl] + Math.floor(L / 2) : mod[abl] + L);
      res.preparedCount = n;
      const picked = R.weightedN(allLevels, lvlBias, n);
      picked.forEach(s => take(s, res.prepared));
    } else if (caster.mode === 'book') {
      const nBook = 6 + 2 * (L - 1); const n = Math.max(1, mod[abl] + L);
      const picked = R.weightedN(allLevels, lvlBias, nBook);
      picked.forEach(s => take(s, res.book));
      res.preparedCount = n;
      const prep = R.weightedN(res.book, lvlBias, n);
      const ids = new Set(prep.map(s => s.id));
      res.book = res.book.map(s => Object.assign(s, { prepared: ids.has(s.id) }));
      res.prepared = prep;
    }
    res.knownCount = caster.known ? caster.known[L - 1] : null;

    // Містичний аркан
    if (cls.id === 'warlock') for (const f of featureList) if (f.id === 'arcanum') {
      const cand = spellsOf('warlock', f.n).filter(s => !taken.has(s.id));
      if (cand.length) { const s = R.pick(cand); take(s, res.arcanum); res.arcanum[res.arcanum.length - 1].lvl = f.n; }
    }
    // Магічні таємниці барда
    if (cls.id === 'bard' && secretsToPick > 0) {
      const any = SPELLS.list.filter(s => s.lvl >= 1 && s.lvl <= max && !taken.has(s.id));
      for (const s of R.weightedN(any, lvlBias, secretsToPick)) take(s, res.secrets);
    }
    // фамільяр угоди
    if (cls.id === 'warlock' && pact && pact[0] === 'chain' && !taken.has('find-familiar')) take(SPELLS.byId['find-familiar'], res.always), res.always[res.always.length - 1].src = 'Дар угоди: Ланцюг';

    if (caster.mode === 'prepared' && cls.id !== 'wizard') res.notes.push(`Підготовлених заклять: ${res.preparedCount} (змінюються після довгого відпочинку). Закляття домену/клятви/кола завжди підготовлені.`);
    if (caster.mode === 'book') res.notes.push(`У книзі ${res.book.length} заклять; підготовлено ${res.preparedCount}.`);
    if (cls.id === 'warlock') res.notes.push('Комірки угоди відновлюються після короткого відпочинку.');
    return res;
  }

  /* ---------- експорт, перевірка ---------- */
  function exportJSON(char) { return JSON.stringify(char, null, 2); }

  function validate(ch) {
    const bad = [];
    const L = ch.level;
    if (!(L >= 1 && L <= 20)) bad.push('рівень поза 1-20');
    if (ch.proficiency !== profOf(L)) bad.push('бонус майстерності');
    for (const a of AB) {
      const x = ch.abilities[a];
      if (x.score < 1 || x.score > 20) bad.push('характеристика ' + a);
      if (x.mod !== modOf(x.score)) bad.push('модифікатор ' + a);
    }
    if (ch.hp.max < L) bad.push('HP менше рівня');
    if (ch.ac.value < 5 || ch.ac.value > 30) bad.push('КБ');
    const cls = SRD.CLASS_BY_ID[ch.cls.id];
    const profSkills = ch.skills.filter(s => s.prof > 0).length;
    if (profSkills < cls.skillCount + 2) bad.push('замало навичок');
    const sc = ch.spellcasting;
    if (sc && cls.caster && sc.class) {
      const cap = cls.caster.type === 'pact' ? SRD.PACT_SLOTS[L - 1][1] : sc.slots.length;
      for (const s of [].concat(sc.known, sc.prepared, sc.book)) if (s.lvl > cap) bad.push('закляття вище доступного рівня: ' + s.name);
      if (sc.cantrips.length < cls.caster.cantrips[L - 1]) bad.push('мало трюків');
    }
    return bad;
  }

  function batch(opts, n, seed) {
    const out = []; for (let i = 0; i < n; i++) out.push(generate(opts, `${seed}-${i}`)); return out;
  }

  return { FORMAT, METHODS, SRD, modOf, profOf, sanitize, generate, validate, exportJSON, batch, rngFromSeed, randomSeed, fmtSpeed, sign, AB, AB_NAME, spellsOf };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CharCore;
