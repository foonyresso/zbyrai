/* Механіка «needs»: потреби мешканців (сили, ситість, спілкування, дозвілля). Без DOM.
   Значення 0..1, де 1 = повністю задоволено. Швидкості задано на ігрову годину й залежать від заняття. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const KEYS = ['energy', 'hunger', 'social', 'fun'];
  // зміна за ігрову годину за заняттям; відсутній ключ = базова швидкість
  const BASE = { energy: -0.045, hunger: -0.1, social: -0.07, fun: -0.06 };
  const BY_ACT = {
    sleep: { energy: 0.14, hunger: -0.03, social: -0.02, fun: -0.02 },
    work: { energy: -0.055, fun: -0.08 },
    eat: { hunger: 1.4, energy: 0.02 },
    chat: { social: 0.7, fun: 0.15 },
    relax: { fun: 0.55, energy: 0.03 },
    stroll: { fun: 0.12, social: -0.03 },
    defend: { energy: -0.12, fun: -0.12 },
  };
  const clamp = v => Math.max(0, Math.min(1, v));
  const create = R => ({ energy: 0.7 + 0.3 * R(), hunger: 0.5 + 0.5 * R(), social: 0.4 + 0.6 * R(), fun: 0.4 + 0.6 * R() });
  function tick(n, act, dtH) {
    const r = BY_ACT[act] || {};
    for (const k of KEYS) n[k] = clamp(n[k] + (r[k] !== undefined ? r[k] : BASE[k]) * dtH);
    return n;
  }
  // найгостріша потреба: { key, value }
  function worst(n) { let b = null; for (const k of KEYS) if (!b || n[k] < b.value) b = { key: k, value: n[k] }; return b; }
  const api = { KEYS, create, tick, worst, clamp, RATES: BY_ACT };
  Mech.Needs = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
