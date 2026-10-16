/* Власні формули кривих: безпечний розбір і обчислення тексту формули без eval (браузер: глобал Formula; Node: module.exports).
   Змінні: x (рівень, крок, хвиля), a, b, p (параметри кривої), pi, e, c1…c20 (значення інших кривих у цій самій точці x).
   Операції: + − * / % ^ (степінь), порівняння < > <= >= == !=, логіка && || !, умова  умова ? тоді : інакше.
   Функції: min, max, abs, floor, ceil, round, sqrt, exp, ln (log — те саме), log2, log10, pow, sin, cos, tan, sign,
   clamp(v,від,до), mix(a,b,t), step(межа,x), if(умова,тоді,інакше), mod(a,b). Порівняння дають 1 (так) або 0 (ні). */
const Formula = (() => {
  const MAX_LEN = 400, MAX_DEPTH = 40;
  // арність: [мін, макс]
  const FUNCS = {
    min: [1, 12], max: [1, 12], abs: [1, 1], floor: [1, 1], ceil: [1, 1], round: [1, 1], sqrt: [1, 1], exp: [1, 1], ln: [1, 1], log: [1, 1], log2: [1, 1], log10: [1, 1],
    pow: [2, 2], sin: [1, 1], cos: [1, 1], tan: [1, 1], sign: [1, 1], clamp: [3, 3], mix: [3, 3], step: [2, 2], if: [3, 3], mod: [2, 2],
  };
  const CONSTS = { pi: Math.PI, e: Math.E };
  const BOOL_OPS = new Set(['<', '>', '<=', '>=', '==', '!=', '&&', '||']);

  class FormulaError extends Error {}

  function tokenize(src) {
    const t = []; let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }
      let m;
      if ((m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i)))) { t.push({ k: 'num', v: parseFloat(m[0]), pos: i }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_][A-Za-z_0-9]*/.exec(src.slice(i)))) { t.push({ k: 'id', v: m[0].toLowerCase(), pos: i }); i += m[0].length; continue; }
      if ((m = /^(<=|>=|==|!=|&&|\|\||[-+*/%^()<>,!?:])/.exec(src.slice(i)))) { t.push({ k: 'op', v: m[0], pos: i }); i += m[0].length; continue; }
      throw new FormulaError(`Незрозумілий символ «${ch}» на позиції ${i + 1}`);
    }
    return t;
  }

  function parse(src) {
    if (typeof src !== 'string' || !src.trim()) throw new FormulaError('Формула порожня');
    if (src.length > MAX_LEN) throw new FormulaError(`Формула задовга (до ${MAX_LEN} символів)`);
    const tk = tokenize(src); let i = 0, depth = 0;
    const peek = () => tk[i], isOp = v => tk[i] && tk[i].k === 'op' && tk[i].v === v;
    const eat = v => { if (!isOp(v)) throw new FormulaError(`Очікувалось «${v}»${tk[i] ? ` на позиції ${tk[i].pos + 1}` : ' наприкінці формули'}`); i++; };
    const guard = () => { if (++depth > MAX_DEPTH) throw new FormulaError('Забагато вкладених дужок'); };
    function ternary() {
      guard(); const c = or();
      if (isOp('?')) { i++; const a = ternary(); eat(':'); const b = ternary(); depth--; return { n: 'cond', c, t: a, e: b }; }
      depth--; return c;
    }
    const bin = (next, ops) => () => { let l = next(); while (peek() && peek().k === 'op' && ops.includes(peek().v)) { const op = tk[i++].v; l = { n: 'bin', op, l, r: next() }; } return l; };
    function unary() {
      if (isOp('-') || isOp('+') || isOp('!')) { const op = tk[i++].v; guard(); const e = unary(); depth--; return { n: 'un', op, e }; }
      return power();
    }
    function power() {
      const base = primary();
      if (isOp('^')) { i++; guard(); const ex = unary(); depth--; return { n: 'bin', op: '^', l: base, r: ex }; } // правоасоціативний, 2^-1 дозволено
      return base;
    }
    function primary() {
      const t = peek(); if (!t) throw new FormulaError('Формула обірвана: бракує значення');
      if (t.k === 'num') { i++; return { n: 'num', v: t.v }; }
      if (t.k === 'id') {
        i++;
        if (isOp('(')) {
          i++; const f = t.v, spec = FUNCS[f]; if (!spec) throw new FormulaError(`Невідома функція «${f}»`);
          const args = [];
          if (!isOp(')')) { for (;;) { guard(); args.push(ternary()); depth--; if (isOp(',')) { i++; continue; } break; } }
          eat(')');
          if (args.length < spec[0] || args.length > spec[1]) throw new FormulaError(`Функція ${f} приймає ${spec[0] === spec[1] ? spec[0] : spec[0] + '–' + spec[1]} аргумент(ів), а тут ${args.length}`);
          return { n: 'call', f, args };
        }
        if (['x', 'a', 'b', 'p'].includes(t.v)) return { n: 'var', name: t.v };
        if (t.v in CONSTS) return { n: 'num', v: CONSTS[t.v], sym: t.v };
        const m = /^c(\d{1,2})$/.exec(t.v); if (m && +m[1] >= 1 && +m[1] <= 20) return { n: 'ref', i: +m[1] };
        throw new FormulaError(`Невідома змінна «${t.v}». Доступні: x, a, b, p, pi, e, c1…c20`);
      }
      if (isOp('(')) { i++; guard(); const e = ternary(); depth--; eat(')'); return e; }
      throw new FormulaError(`Несподіваний «${t.v}» на позиції ${t.pos + 1}`);
    }
    const mul = bin(unary, ['*', '/', '%']), add = bin(mul, ['+', '-']), rel = bin(add, ['<', '>', '<=', '>=']), eq = bin(rel, ['==', '!=']), and = bin(eq, ['&&']), or = bin(and, ['||']);
    const ast = ternary();
    if (i < tk.length) throw new FormulaError(`Зайвий «${tk[i].v}» на позиції ${tk[i].pos + 1}`);
    return ast;
  }

  const B = v => (v ? 1 : 0);
  function compile(n) {
    switch (n.n) {
      case 'num': { const v = n.v; return () => v; }
      case 'var': { const k = n.name; return env => env[k]; }
      case 'ref': { const k = n.i; return env => env.ref(k); }
      case 'un': { const f = compile(n.e); return n.op === '-' ? env => -f(env) : n.op === '+' ? env => f(env) : env => B(f(env) === 0); }
      case 'cond': { const c = compile(n.c), t = compile(n.t), e = compile(n.e); return env => (c(env) !== 0 ? t(env) : e(env)); }
      case 'bin': {
        const l = compile(n.l), r = compile(n.r);
        switch (n.op) {
          case '+': return env => l(env) + r(env); case '-': return env => l(env) - r(env);
          case '*': return env => l(env) * r(env); case '/': return env => l(env) / r(env);
          case '%': return env => l(env) % r(env); case '^': return env => Math.pow(l(env), r(env));
          case '<': return env => B(l(env) < r(env)); case '>': return env => B(l(env) > r(env));
          case '<=': return env => B(l(env) <= r(env)); case '>=': return env => B(l(env) >= r(env));
          case '==': return env => B(l(env) === r(env)); case '!=': return env => B(l(env) !== r(env));
          case '&&': return env => B(l(env) !== 0 && r(env) !== 0); default: return env => B(l(env) !== 0 || r(env) !== 0);
        }
      }
      default: { // call
        const a = n.args.map(compile), f = n.f;
        switch (f) {
          case 'min': return env => Math.min(...a.map(g => g(env))); case 'max': return env => Math.max(...a.map(g => g(env)));
          case 'abs': return env => Math.abs(a[0](env)); case 'floor': return env => Math.floor(a[0](env)); case 'ceil': return env => Math.ceil(a[0](env));
          case 'round': return env => Math.round(a[0](env)); case 'sqrt': return env => Math.sqrt(a[0](env)); case 'exp': return env => Math.exp(a[0](env));
          case 'ln': case 'log': return env => Math.log(a[0](env)); case 'log2': return env => Math.log2(a[0](env)); case 'log10': return env => Math.log10(a[0](env));
          case 'pow': return env => Math.pow(a[0](env), a[1](env)); case 'sin': return env => Math.sin(a[0](env)); case 'cos': return env => Math.cos(a[0](env)); case 'tan': return env => Math.tan(a[0](env));
          case 'sign': return env => Math.sign(a[0](env));
          case 'clamp': return env => Math.min(a[2](env), Math.max(a[1](env), a[0](env)));
          case 'mix': return env => { const p = a[0](env), q = a[1](env); return p + (q - p) * a[2](env); };
          case 'step': return env => B(a[1](env) >= a[0](env));
          case 'if': return env => (a[0](env) !== 0 ? a[1](env) : a[2](env));
          default: return env => { const p = a[0](env), q = a[1](env); return ((p % q) + q) % q; }; // mod: додатний залишок
        }
      }
    }
  }

  const cache = new Map();
  /* Розбирає формулу; повертає { fn, ast } або { error }. */
  function build(src) {
    const key = String(src);
    if (cache.has(key)) return cache.get(key);
    let res;
    try { const ast = parse(key); res = { ast, fn: compile(ast) }; } catch (e) { if (!(e instanceof FormulaError)) throw e; res = { error: e.message }; }
    if (cache.size > 300) cache.clear();
    cache.set(key, res); return res;
  }
  const check = src => { const r = build(src); return r.error ? r.error : null; };
  /* Значення формули при x і параметрах; ref(i) — значення i-ї кривої (1…20) у цій точці. NaN при помилці. */
  function evaluate(src, x, a, b, p, ref) {
    const r = build(src); if (r.error) return NaN;
    const v = r.fn({ x, a, b, p, ref: ref || (() => NaN) });
    return Number.isFinite(v) ? v : NaN;
  }

  /* ---------- код для гри: js, py, cs ---------- */
  const isBool = n => (n.n === 'bin' && BOOL_OPS.has(n.op)) || (n.n === 'un' && n.op === '!') || (n.n === 'call' && n.f === 'step');
  function emit(n, lang, par, want = 'num') {
    const num = v => { const s = String(Number(v.toPrecision ? Number(v.toPrecision(12)) : v)); return lang === 'cs' && /^-?\d+$/.test(s) ? s + '.0' : s; };
    const E = (m, w) => emit(m, lang, par, w);
    if (want === 'bool' && !isBool(n)) return `(${E(n, 'num')} != 0)`;
    if (want === 'num' && isBool(n)) { const c = E(n, 'bool'); return lang === 'py' ? `(1.0 if ${c} else 0.0)` : `(${c} ? 1.0 : 0.0)`; }
    const M = { js: 'Math.', py: 'math.', cs: 'Math.' }[lang];
    const C = f => ({ js: f, py: f, cs: f[0].toUpperCase() + f.slice(1) })[lang];
    switch (n.n) {
      case 'num': return n.sym ? (lang === 'py' ? 'math.' + n.sym : 'Math.' + (n.sym === 'pi' ? 'PI' : 'E')) : num(n.v);
      case 'var': return n.name === 'x' ? 'x' : num(par[n.name]);
      case 'ref': return `c${n.i}(x)`;
      case 'un': return n.op === '-' ? `(-${E(n.e, 'num')})` : n.op === '+' ? E(n.e, 'num') : (lang === 'py' ? `(not ${E(n.e, 'bool')})` : `(!${E(n.e, 'bool')})`);
      case 'cond': { const c = E(n.c, 'bool'), t = E(n.t, 'num'), e = E(n.e, 'num'); return lang === 'py' ? `(${t} if ${c} else ${e})` : `(${c} ? ${t} : ${e})`; }
      case 'bin': {
        if (n.op === '^') return lang === 'py' ? `(${E(n.l, 'num')} ** ${E(n.r, 'num')})` : `${M}${C('pow')}(${E(n.l, 'num')}, ${E(n.r, 'num')})`;
        if (n.op === '&&' || n.op === '||') { const o = lang === 'py' ? (n.op === '&&' ? 'and' : 'or') : n.op; return `(${E(n.l, 'bool')} ${o} ${E(n.r, 'bool')})`; }
        return `(${E(n.l, 'num')} ${n.op} ${E(n.r, 'num')})`;
      }
      default: {
        const A = n.args.map(a => E(a, 'num')), f = n.f;
        const fold = (name, args) => (lang === 'cs' ? args.reduce((s, v) => `Math.${name}(${s}, ${v})`) : lang === 'js' ? `Math.${name.toLowerCase()}(${args.join(', ')})` : `${name.toLowerCase()}(${args.join(', ')})`);
        switch (f) {
          case 'min': return fold('Min', A); case 'max': return fold('Max', A);
          case 'abs': return lang === 'py' ? `abs(${A[0]})` : `${M}${C('abs')}(${A[0]})`;
          case 'floor': case 'ceil': case 'sqrt': case 'exp': case 'sin': case 'cos': case 'tan': return `${M}${C(f)}(${A[0]})`;
          case 'round': return lang === 'py' ? `math.floor(${A[0]} + 0.5)` : lang === 'cs' ? `Math.Floor(${A[0]} + 0.5)` : `Math.round(${A[0]})`;
          case 'ln': case 'log': return `${M}${C('log')}(${A[0]})`;
          case 'log2': case 'log10': return `${M}${C(f)}(${A[0]})`;
          case 'pow': return lang === 'py' ? `(${A[0]} ** ${A[1]})` : `${M}${C('pow')}(${A[0]}, ${A[1]})`;
          case 'sign': return lang === 'py' ? `((${A[0]} > 0) - (${A[0]} < 0))` : `${M}${C('sign')}(${A[0]})`;
          case 'clamp': return lang === 'py' ? `max(${A[1]}, min(${A[2]}, ${A[0]}))` : `${M}${C('min')}(${A[2]}, ${M}${C('max')}(${A[1]}, ${A[0]}))`;
          case 'mix': return `(${A[0]} + (${A[1]} - ${A[0]}) * ${A[2]})`;
          case 'step': { const c = `(${A[1]} >= ${A[0]})`; return lang === 'py' ? `(1.0 if ${c} else 0.0)` : `(${c} ? 1.0 : 0.0)`; }
          case 'if': { const c = E(n.args[0], 'bool'); return lang === 'py' ? `(${A[1]} if ${c} else ${A[2]})` : `(${c} ? ${A[1]} : ${A[2]})`; }
          default: return lang === 'py' ? `(${A[0]} % ${A[1]})` : lang === 'cs' ? `(((${A[0]} % ${A[1]}) + ${A[1]}) % ${A[1]})` : `(((${A[0]} % ${A[1]}) + ${A[1]}) % ${A[1]})`;
        }
      }
    }
  }
  /* Вираз для коду мовою lang ('js' | 'py' | 'cs') з уже підставленими a, b, p; null, якщо формула хибна. */
  function toCode(src, lang, par) { const r = build(src); return r.error ? null : emit(r.ast, lang, par || {}, 'num'); }

  return { build, check, evaluate, toCode, FUNCS, FormulaError };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Formula;
