/* Wave & Balance Curves: обчислення без DOM (браузер: глобал BalanceCore; Node: module.exports).
   Крива = { type, a, b, p } (параметри залежать від типу), x = рівень чи номер хвилі (зазвичай від 1). */
const BalanceCore = (() => {
  const TYPES = {
    linear: { name: 'Лінійна', f: '= a + b·(x−1)', fn: (c, x) => c.a + c.b * (x - 1), params: { a: 'старт (a)', b: 'приріст за крок (b)' } },
    power: { name: 'Степенева', f: '= a·x^p', fn: (c, x) => c.a * Math.pow(x, c.p), params: { a: 'множник (a)', p: 'степінь (p)' } },
    exp: { name: 'Експоненційна', f: '= a·g^(x−1)', fn: (c, x) => c.a * Math.pow(c.b, x - 1), params: { a: 'старт (a)', b: 'ріст за крок (g)' } },
    logistic: { name: 'S-крива', f: '= a/(1+e^(−k(x−x0)))', fn: (c, x) => c.a / (1 + Math.exp(-c.b * (x - c.p))), params: { a: 'стеля (a)', b: 'крутизна (k)', p: 'середина (x0)' } },
    log: { name: 'Логарифмічна', f: '= a·ln(1+b·x)', fn: (c, x) => c.a * Math.log(1 + c.b * x), params: { a: 'множник (a)', b: 'швидкість (b)' } },
    steps: { name: 'Сходинки', f: '= a + b·⌊(x−1)/p⌋', fn: (c, x) => c.a + c.b * Math.floor((x - 1) / (c.p > 0 ? c.p : 1)), params: { a: 'старт (a)', b: 'приріст за сходинку (b)', p: 'довжина сходинки в рівнях (p)' } },
    quad: { name: 'Квадратична', f: '= a + b·x + p·x²', fn: (c, x) => c.a + c.b * x + c.p * x * x, params: { a: 'старт (a)', b: 'лінійна частина (b)', p: 'квадратична частина (p)' } },
    sqrt: { name: 'Корінь', f: '= a·√x + b', fn: (c, x) => c.a * Math.sqrt(x) + c.b, params: { a: 'множник (a)', b: 'зсув (b)' } },
  };
  const evalCurve = (c, x) => { const t = TYPES[c.type]; const v = t ? t.fn(c, x) : NaN; return Number.isFinite(v) ? v : NaN; };
  const series = (c, from, to) => { const out = []; for (let x = from; x <= to; x++) out.push({ x, y: evalCurve(c, x) }); return out; };
  const cumulative = s => { let t = 0; return s.map(p => ({ x: p.x, y: (t += p.y) })); };

  /* Підібрати параметри кривої під дві цільові точки: «на рівні x1 хочу y1, на x2 хочу y2».
     Працює для linear, power, exp; повертає нову криву або null, якщо точки недопустимі. */
  function fitTwo(type, x1, y1, x2, y2) {
    if (x1 === x2) return null;
    if (type === 'linear') { const b = (y2 - y1) / (x2 - x1); return { type, a: y1 - b * (x1 - 1), b, p: 0 }; }
    if (y1 <= 0 || y2 <= 0) return null;
    if (type === 'exp') { const g = Math.pow(y2 / y1, 1 / (x2 - x1)); return { type, a: y1 / Math.pow(g, x1 - 1), b: g, p: 0 }; }
    if (type === 'power') { if (x1 <= 0 || x2 <= 0) return null; const p = Math.log(y2 / y1) / Math.log(x2 / x1); return { type, a: y1 / Math.pow(x1, p), b: 0, p }; }
    return null;
  }

  /* Співвідношення двох серій (скільки «HP ворога» припадає на «шкоду гравця» тощо) і точки, де воно перетинає межу. */
  function ratio(sa, sb) { return sa.map((p, i) => ({ x: p.x, y: sb[i].y === 0 ? NaN : p.y / sb[i].y })); }
  function crossings(s, level) {
    const out = [];
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1], b = s[i];
      if (!Number.isFinite(a.y) || !Number.isFinite(b.y)) continue;
      if ((a.y - level) * (b.y - level) < 0) out.push(a.x + (level - a.y) / (b.y - a.y) * (b.x - a.x));
      else if (b.y === level && a.y !== level) out.push(b.x);
    }
    return out;
  }
  // за скільки кроків значення подвоюється (для експоненти — стала; для інших — на цьому відрізку)
  function doublingStep(s) {
    for (let i = 1; i < s.length; i++) if (s[i].y >= s[0].y * 2 && s[0].y > 0) return s[i].x - s[0].x;
    return null;
  }
  const growthPerStep = s => s.slice(1).map((p, i) => ({ x: p.x, y: s[i].y === 0 ? NaN : p.y / s[i].y - 1 }));

  /* ---------- хвилі ---------- */
  // Детермінований генератор (mulberry32), щоб одна й та сама конфігурація давала ті самі хвилі
  const rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  /* Бюджетна модель: кожна хвиля має «бюджет складності» з кривої; його витрачають на ворогів за вартістю.
     types: [{ name, cost, hp, minWave, weight }]; boss кожні bossEvery хвиль (×bossMul бюджету одним ворогом найдорожчого типу).
     Повертає [{ wave, budget, spent, enemies:[{name,count}], total, hp, boss }] */
  function buildWaves(o) {
    const R = rng(o.seed ?? 1), out = [];
    for (let w = o.from || 1; w <= o.to; w++) {
      const budget = Math.max(0, evalCurve(o.budget, w)), pool = o.types.filter(t => w >= (t.minWave || 1) && t.cost > 0);
      const enemies = new Map(); let left = budget, hp = 0, boss = false;
      if (o.bossEvery > 0 && w % o.bossEvery === 0 && pool.length) {
        const b = pool.reduce((m, t) => (t.cost > m.cost ? t : m), pool[0]); boss = true;
        const n = Math.max(1, Math.round(budget * (o.bossShare ?? .4) / b.cost)); enemies.set(b.name + ' (бос)', { n, t: b, boss: true }); left -= n * b.cost;
      }
      let guard = 5000;
      while (left > 0 && guard-- > 0) {
        const aff = pool.filter(t => t.cost <= left); if (!aff.length) break;
        const tw = aff.reduce((s, t) => s + (t.weight ?? 1), 0); let r = R() * tw, pick = aff[aff.length - 1];
        for (const t of aff) { r -= t.weight ?? 1; if (r <= 0) { pick = t; break; } }
        const e = enemies.get(pick.name) || { n: 0, t: pick }; e.n++; enemies.set(pick.name, e); left -= pick.cost;
      }
      const list = [...enemies.entries()].map(([name, e]) => { const mult = e.boss ? (o.bossHpMul ?? 1) : 1; hp += e.n * e.t.hp * mult; return { name, count: e.n }; });
      const total = list.reduce((s, e) => s + e.count, 0);
      out.push({ wave: w, budget, spent: budget - left, enemies: list, total, hp, boss });
    }
    return out;
  }

  const fmt = v => (!Number.isFinite(v) ? '—' : Math.abs(v) >= 1e6 ? v.toExponential(2) : Math.abs(v) >= 100 ? String(Math.round(v)) : String(Math.round(v * 100) / 100));
  function toCsv(cols, from, to) {
    const head = ['x', ...cols.map(c => JSON.stringify(c.name))].join(',');
    const rows = []; for (let x = from; x <= to; x++) rows.push([x, ...cols.map(c => { const v = evalCurve(c, x); return Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : ''; })].join(','));
    return [head, ...rows].join('\n');
  }
  // готова формула для коду
  function toCode(c, lang = 'js') {
    const n = v => Number((+v || 0).toPrecision(6));
    const f = { linear: `${n(c.a)} + ${n(c.b)} * (x - 1)`, power: `${n(c.a)} * Math.pow(x, ${n(c.p)})`, exp: `${n(c.a)} * Math.pow(${n(c.b)}, x - 1)`,
      logistic: `${n(c.a)} / (1 + Math.exp(-${n(c.b)} * (x - ${n(c.p)})))`, log: `${n(c.a)} * Math.log(1 + ${n(c.b)} * x)`,
      steps: `${n(c.a)} + ${n(c.b)} * Math.floor((x - 1) / ${n(c.p > 0 ? c.p : 1)})`, quad: `${n(c.a)} + ${n(c.b)} * x + ${n(c.p)} * x * x`, sqrt: `${n(c.a)} * Math.sqrt(x) + ${n(c.b)}` }[c.type];
    const name = (c.name || 'curve').replace(/[^\w]/g, '_').replace(/^(\d)/, '_$1') || 'curve';
    if (lang === 'py') return `def ${name}(x):\n    return ${f.replace(/Math\.pow\(([^,]+), ([^)]+)\)/g, '($1) ** ($2)').replace(/Math\.exp/g, 'math.exp').replace(/Math\.log/g, 'math.log').replace(/Math\.sqrt/g, 'math.sqrt').replace(/Math\.floor/g, 'math.floor')}`;
    if (lang === 'cs') return `static double ${name}(double x) => ${f.replace(/Math\.pow/g, 'Math.Pow').replace(/Math\.exp/g, 'Math.Exp').replace(/Math\.log/g, 'Math.Log').replace(/Math\.sqrt/g, 'Math.Sqrt').replace(/Math\.floor/g, 'Math.Floor')};`;
    return `const ${name} = x => ${f};`;
  }

  return { TYPES, evalCurve, series, cumulative, fitTwo, ratio, crossings, doublingStep, growthPerStep, rng, buildWaves, fmt, toCsv, toCode };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = BalanceCore;
