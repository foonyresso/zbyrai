// Спільний стан інтерфейсу й дрібні помічники: DOM-будівники, сповіщення, збереження в localStorage.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const $ = id => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('rm_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rm_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  function toast(m, ms) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms || 2000); }
  function el(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    for (const c of kids || []) e.append(c);
    return e;
  }
  // Повзунок із підписом і значенням; о.get() / о.set(v); о.title — підказка
  function slider(parent, o) {
    const out = el('output'), inp = el('input', { type: 'range', min: o.min, max: o.max, step: o.step, title: o.title });
    const w = el('label', { class: 'ctl', title: o.title }, [el('span', { text: o.label }), out, inp]);
    const sync = () => { inp.value = o.get(); out.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; };
    inp.addEventListener('input', () => { o.set(+inp.value); out.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; });
    inp.addEventListener('change', () => o.done && o.done());
    parent.append(w); sync(); return { sync };
  }
  function select(parent, o) {
    const sel = el('select', { title: o.title }); for (const [v, t] of o.opts) sel.append(el('option', { value: v, text: t }));
    const w = el('label', { class: 'ctl', title: o.title }, [el('span', { text: o.label }), el('span'), sel]);
    sel.addEventListener('change', () => { o.set(sel.value); o.done && o.done(); });
    parent.append(w); const sync = () => { sel.value = o.get(); }; sync(); return { sync, sel };
  }
  function check(parent, o) {
    const cb = el('input', { type: 'checkbox' }); cb.checked = !!o.get();
    const sw = o.swatch ? el('i', { style: 'border-color:' + o.swatch + (o.dash ? '' : ''), class: o.dash || '' }) : null;
    const w = el('label', { class: 'chk', title: o.title }, sw ? [cb, sw, el('span', { text: o.label })] : [cb, el('span', { text: o.label })]);
    cb.addEventListener('change', () => o.set(cb.checked)); parent.append(w); return { sync() { cb.checked = !!o.get(); } };
  }
  R.UI = { $, store, toast, el, slider, select, check, App: {} };
})();
