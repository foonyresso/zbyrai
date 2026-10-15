/* Конструктор скілів: оцінка сили скіла й текстовий опис. Без DOM.
   Це ОЦІНКА на «манекенах» (n ворогів у колі радіусом spread, сила атаки = 1), а не повна симуляція бою:
   вона потрібна, щоб швидко порівнювати скіли й ловити грубі перекоси. Усе рахується в частках сили атаки (САт). */
const ForgeEval = (() => {
  const F = typeof ForgeCore !== 'undefined' ? ForgeCore : require('./forge-core.js');
  const DEFAULT_CTX = { enemies: 5, allies: 2, spread: 8, targetHp: 6 };
  const ZERO = () => ({ dmg: 0, heal: 0, shield: 0, cc: 0, util: 0, targets: 0, time: 0, kills: 0 });
  function addScaled(R, S, w) {
    for (const k of ['dmg', 'heal', 'shield', 'cc', 'util', 'kills']) R[k] += S[k] * w;
    R.targets = Math.max(R.targets, S.targets); R.time = Math.max(R.time, S.time);
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Застосовує ефект до накопичувача R. count = скільки разів у середньому він спрацює.
  function applyEffect(R, node, env, ctx, fires) {
    const d = F.def(node.t), v = d.val(node.p), p = node.p;
    let count;
    if (p.to === 'self') count = fires;
    else if (p.to === 'allies') count = fires * Math.min(ctx.allies, 3);
    else count = env.targets * env.hits * env.accuracy * (fires / env.fires0);
    const cm = env.crit ? 1 + env.crit.chance * (env.crit.mult - 1) : 1;
    if (v.dmg) {
      const target = p.to === 'hit' ? 1 : 0;
      const dmg = v.dmg * env.mult * cm * count * target;
      R.dmg += dmg;
      if (env.lifesteal) R.heal += dmg * env.lifesteal;
    }
    R.heal += (v.heal || 0) * env.mult * cm * count;
    R.shield += (v.shield || 0) * env.mult * count;
    R.cc += (v.cc || 0) * count;
    R.util += (v.util || 0) * count;
  }

  function evalDelivery(node, ctx, weightBase = 1) {
    const d = F.def(node.t), p = node.p, R = ZERO();
    const env = { targets: d.n(p, ctx), hits: d.hits ? d.hits(p, ctx) : 1, mult: 1, time: d.time(p), accuracy: node.t === 'projectile' ? 0.85 : 1, crit: null, lifesteal: 0, kills: 0, fires0: 1 };
    for (const m of node.c) { const md = F.def(m.t); if (md.cat === 'modifier' && (!md.only || md.only.includes(node.t))) md.mod(env, m.p, ctx); }
    env.targets = clamp(env.targets, 0, ctx.enemies);
    for (const e of node.c) if (F.def(e.t).cat === 'effect') applyEffect(R, e, env, ctx, 1);
    // оцінка вбивств: скільки цілей помре від прямої шкоди
    const perTarget = env.targets ? R.dmg / env.targets : 0;
    env.kills = env.targets * clamp((perTarget / ctx.targetHp) ** 1.5, 0, 1);
    R.kills = env.kills;
    R.targets = env.targets; R.time = env.time;
    for (const t of node.c) {
      const td = F.def(t.t);
      if (td.cat !== 'trigger') continue;
      const f = td.fires(env, t.p, ctx);
      const n = f.n * (f.weight || 1);
      const sub = ZERO();
      for (const c of t.c) {
        const cd = F.def(c.t);
        if (cd.cat === 'effect') {
          // ефект у тригері: n спрацювань, кожне на одну ціль (або на себе / союзників)
          const e2 = { targets: 1, hits: 1, accuracy: 1, mult: env.mult, crit: env.crit, lifesteal: env.lifesteal, fires0: 1 };
          applyEffect(sub, c, e2, ctx, 1);
        } else if (cd.cat === 'delivery') {
          const S = evalDelivery(c, ctx);
          addScaled(sub, S, 1);
          sub.time = Math.max(sub.time, S.time);
        }
      }
      addScaled(R, sub, n);
      R.time = Math.max(R.time, env.time + (f.delay || 0) + sub.time);
    }
    return R;
  }

  function evaluate(skill, ctx) {
    ctx = Object.assign({}, DEFAULT_CTX, ctx || {});
    const R = ZERO();
    for (const b of skill.root) {
      const d = F.def(b.t);
      if (d.cat === 'delivery') addScaled(R, evalDelivery(b, ctx), 1);
      else if (d.cat === 'effect') {
        const e = { targets: 1, hits: 1, accuracy: 1, mult: 1, crit: null, lifesteal: 0, fires0: 1 };
        applyEffect(R, b, e, ctx, 1); R.targets = Math.max(R.targets, 1);
      }
    }
    const c = skill.cast;
    const eq = R.dmg + R.heal + R.shield * 0.8 + R.cc * 0.35 + R.util;
    const resCost = c.resource === 'none' ? 0 : c.cost * (c.resource === 'health' ? 1.2 : 1);
    const cd = c.cooldown / Math.max(1, c.charges);
    const denom = 1 + cd / 6 + resCost / 30 + c.time / 6;
    const eff = eq / denom;
    const round5 = (v, step) => Math.max(0, Math.round(v / step) * step);
    const verdict = eq === 0 ? 'none' : eff < 0.8 ? 'weak' : eff <= 1.3 ? 'fair' : 'strong';
    return {
      damage: R.dmg, heal: R.heal, shield: R.shield, control: R.cc, utility: R.util, targets: R.targets, kills: R.kills,
      duration: Math.max(R.time, c.time), power: eq, efficiency: eff, verdict,
      perSecond: R.dmg / Math.max(0.5, c.cooldown, c.time),
      suggestCooldown: round5(6 * (eq - 1 - resCost / 30 - c.time / 6) * Math.max(1, c.charges), 0.5),
      suggestCost: round5(30 * (eq - 1 - cd / 6 - c.time / 6), 5),
      complexity: F.countNodes(skill),
    };
  }

  /* ---------- текстовий опис ---------- */
  const fmt = v => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)));
  function paramText(spec, v) {
    if (spec.type === 'bool') return `${spec.label.toLowerCase()}: ${v ? 'так' : 'ні'}`;
    if (spec.type === 'enum') return `${spec.label.toLowerCase()}: ${(spec.options.find(o => o[0] === v) || [0, v])[1].toLowerCase()}`;
    return `${spec.label.toLowerCase()} ${fmt(v)}${spec.unit ? (/^[%°×]/.test(spec.unit) ? '' : ' ') + spec.unit : ''}`;
  }
  function brickText(b) {
    const d = F.def(b.t);
    const parts = F.paramSpecs(d).filter(s => !(s.k === 'to' && b.p.to === (d.toDef || 'hit'))).map(s => paramText(s, b.p[s.k]));
    return d.name + (parts.length ? ': ' + parts.join(', ') : '');
  }
  function describe(skill) {
    const c = skill.cast, a = F.AIM_MODES.find(m => m[0] === skill.aim.mode)[1].toLowerCase();
    const res = (F.RESOURCES.find(r => r[0] === c.resource) || [0, ''])[1].toLowerCase();
    const lines = [];
    lines.push(`${skill.name}. Ціль: ${a}${skill.aim.range ? ', дальність ' + fmt(skill.aim.range) + ' м' : ''}. Каст ${fmt(c.time)} с, перезарядка ${fmt(c.cooldown)} с${c.charges > 1 ? ' (зарядів ' + c.charges + ')' : ''}, ${c.resource === 'none' || !c.cost ? 'безкоштовно' : 'ціна ' + fmt(c.cost) + ' (' + res + ')'}.`);
    if (skill.desc) lines.push(skill.desc);
    F.walk(skill.root, (b, parent, depth) => lines.push('  '.repeat(depth - 1) + (depth > 1 ? '↳ ' : '• ') + brickText(b)));
    return lines.join('\n');
  }
  const VERDICT = { none: 'Нічого не робить', weak: 'Слабкий для своєї ціни', fair: 'Збалансований', strong: 'Сильний для своєї ціни' };
  function summary(skill, ev) {
    const bits = [];
    if (ev.damage > 0.05) bits.push(`шкода ≈ ${fmt(+(ev.damage * 100).toFixed(0))}% сили атаки (по ${fmt(+ev.targets.toFixed(1))} цілях)`);
    if (ev.heal > 0.05) bits.push(`лікування ≈ ${fmt(+(ev.heal * 100).toFixed(0))}%`);
    if (ev.shield > 0.05) bits.push(`щит ≈ ${fmt(+(ev.shield * 100).toFixed(0))}%`);
    if (ev.control > 0.05) bits.push(`контроль ≈ ${fmt(+ev.control.toFixed(1))} с сумарно`);
    return bits.length ? bits.join('; ') : 'мало ефекту';
  }
  return { DEFAULT_CTX, evaluate, describe, brickText, summary, VERDICT };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ForgeEval;
