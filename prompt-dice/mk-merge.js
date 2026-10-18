// Об'єднання старих параметрів Кубика з категоріями манекена: групи всередині карток, один «дім» для кожного тегу.
// Завантажується після mk-slots.js і mk-spec.js, перед flux-words.js. Специфікація груп і відкидань: mk-spec.js.
//  - старі параметри (їх читають Flux і випадковий кубик) лишаються «домом» своїх тегів і діляться на групи;
//  - група може показуватись на своїй ділянці манекена (zone), а не лише на «Тілі загалом»;
//  - категорії манекена, що збігаються з групою, вливаються в неї (@id); тег, який уже має «дім», видаляється з решти;
//  - жоден тег не губиться: усе, чого немає в старих параметрах, лишається у своїй категорії манекена.
const mkNorm = s => { const n = String(s).toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim(); return (typeof MKM_ALIAS === 'object' && MKM_ALIAS[n]) || n; };
const mkAtom = p => { const a = String(p).split(/,\s*/); return a.length === 1 ? mkNorm(a[0]) : null; };

// Усі значення старого параметра за будь-якої статі й тематики
function mkAllOpts(sl) {
  const out = new Set();
  Object.keys(THEMES).forEach(theme => ['f', 'm'].forEach(g => { try { sl.opts({ g, theme }).forEach(v => out.add(v)); } catch (e) { /* без опцій */ } }));
  return [...out];
}

const MKM = { owner: {}, removed: [] };

// prompt → назва групи (для параметрів із групами)
function mkGroupIndex(sl) {
  if (!sl.groups) return {};
  if (!sl._gidx) { sl._gidx = {}; sl.groups.forEach(([name, items]) => items.forEach(([, p]) => { sl._gidx[p] = name; })); }
  return sl._gidx;
}
// Групи параметра, що показуються на ділянці zone: Set назв або null (показувати все)
function mkScope(sl, zone) {
  if (!sl.groups || !sl.gzone || !zone) return null;
  const members = mkMembers(zone), base = sl.baseParts || sl.parts || (sl.part ? [sl.part] : []);
  const names = sl.groups.map(g => g[0]).filter(name => (sl.gzone[name] ? [sl.gzone[name]] : base).some(z => members.includes(z)));
  return names.length === sl.groups.length ? null : new Set(names);
}
// Значення без кольору: «pink bunny ears» → «bunny ears» (щоб знайти його групу)
function mkBaseOf(sl, v) {
  const idx = mkGroupIndex(sl);
  if (idx[v] !== undefined || typeof parseColored !== 'function') return v;
  const pc = parseColored(v, t => idx[t] !== undefined);
  return pc ? pc.base : v;
}
const mkInScope = (sl, v, scope) => !scope || scope.has(mkGroupIndex(sl)[mkBaseOf(sl, v)]);
// «По одному з групи»: прибирає зайві значення тих самих груп, залишаючи останнє вибране
function mkEnforce(sl, vals) {
  if (!sl.groups || !sl.gsingle || !sl.gsingle.size) return vals;
  const idx = mkGroupIndex(sl), seen = {}, out = [];
  [...vals].reverse().forEach(v => { const g = idx[mkBaseOf(sl, v)]; if (g && sl.gsingle.has(g)) { if (seen[g]) return; seen[g] = 1; } out.unshift(v); });
  return out;
}

// Випадкова вибірка k значень: не більше одного з кожної групи «одне з групи»
function mkSampleGrouped(sl, opts, k) {
  if (!sl.gsingle || !sl.gsingle.size) return sample(opts, k);
  const idx = mkGroupIndex(sl), used = new Set(), out = [];
  for (const v of sample(opts, opts.length)) {
    const g = idx[v];
    if (g && sl.gsingle.has(g)) { if (used.has(g)) continue; used.add(g); }
    out.push(v); if (out.length >= k) break;
  }
  return out;
}
function mkRemoveCat(id) {
  const c = MK.cats[id]; delete MK.cats[id]; delete SLOTS[id];
  const i = MK_ALL.indexOf(c); if (i >= 0) MK_ALL.splice(i, 1);
  Object.values(MK.partSlots).forEach(arr => { const k = arr.indexOf(id); if (k >= 0) arr.splice(k, 1); });
  Object.values(TYPES).forEach(t => t.sections.forEach(sec => { const k = sec.s.indexOf(id); if (k >= 0) sec.s.splice(k, 1); }));
  MKM.removed.push(id);
}
function mkRefreshCat(sl, c) {
  const prompts = [], lab = {};
  c.groups.forEach(g => g[1].forEach(([l, p]) => { prompts.push(p); lab[p] = l; }));
  sl.opts = () => prompts; sl.lab = lab; sl.groups = c.groups;
}

(function mkMerge() {
  const spec = typeof MKM_SPEC === 'object' ? MKM_SPEC : {};
  const owner = MKM.owner, claim = (atom, id) => { if (atom && !owner[atom]) owner[atom] = id; };

  // 1. Теги, чий «дім» в іншому місці, прибираються зі старого параметра
  Object.entries(spec).forEach(([id, s]) => {
    const sl = SLOTS[id]; if (!sl) throw new Error('mk-spec: немає параметра ' + id);
    const drop = new Set(L(s.drop || '').map(mkNorm));
    if (drop.size) { const orig = sl.opts; sl.opts = c => orig(c).filter(v => !drop.has(mkNorm(v))); }
    if (s.label) sl.label = s.label;
    if (s.kind) sl.kind = s.kind;
    if (s.n) sl.n = s.n;
    if (s.p !== undefined) sl.p = s.p;
  });

  // 2. Власники атомарних тегів: старі параметри й теги, названі в групах
  Object.values(SLOTS).filter(sl => !sl.mk && !sl.text).forEach(sl => mkAllOpts(sl).forEach(v => claim(mkAtom(v), sl.id)));
  Object.entries(spec).forEach(([id, s]) => (s.groups || []).forEach(g => L(g[2]).forEach(t => { if (t[0] !== '@') claim(mkAtom(t), id); })));

  // 3. Категорії манекена, що не вливаються нікуди: дублі прибираються; серед своїх дублів виграє конкретніша ділянка
  const toAbsorb = new Set();
  Object.values(spec).forEach(s => (s.groups || []).forEach(g => L(g[2]).forEach(t => { if (t[0] === '@') toAbsorb.add(t.slice(1)); })));
  const GENERIC = new Set(['body', 'face', 'torso', 'hair', 'head']);
  Object.keys(MK.cats).filter(id => !toAbsorb.has(id)).sort((a, b) => GENERIC.has(MK.cats[a].part) - GENERIC.has(MK.cats[b].part)).forEach(id => {
    const c = MK.cats[id];
    let changed = false;
    c.groups = c.groups.map(([name, its]) => [name, its.filter(([, p]) => {
      const a = mkAtom(p);
      if (a && owner[a] && owner[a] !== id) { changed = true; return false; }
      claim(a, id); return true;
    })]).filter(g => g[1].length);
    if (!c.groups.length) mkRemoveCat(id); else if (changed) mkRefreshCat(SLOTS[id], c);
  });

  // 4. Групи: @id вбирає залишок категорії манекена (теги без «дому»)
  Object.entries(spec).forEach(([id, s]) => {
    if (!(s.groups || []).length) return;
    const sl = SLOTS[id], have = new Set(mkAllOpts(sl)), seen = new Set(), groups = [], extra = [];
    sl.gsingle = new Set(); sl.gzone = {}; sl.lab = Object.assign({}, sl.lab);
    (s.groups || []).forEach(([name, mode, tags, zone]) => {
      const items = [];
      const add = (label, p) => { if (seen.has(p)) return; seen.add(p); items.push([label, p]); if (!have.has(p)) extra.push(p); };
      L(tags).forEach(t => {
        if (t[0] !== '@') { add(t, t); return; }
        const mkId = t.slice(1), c = MK.cats[mkId];
        if (!c) throw new Error('mk-spec: немає категорії ' + mkId);
        c.groups.forEach(([, its]) => its.forEach(([label, p]) => {
          const a = mkAtom(p);
          if (a && owner[a]) return;
          const nice = (typeof uaLabel === 'function' && uaLabel(p)) || label;
          claim(a, id); sl.lab[p] = nice; add(nice, p);
        }));
        mkRemoveCat(mkId);
      });
      if (!items.length) return;
      const g = groups.find(x => x[0] === name);
      if (g) g[1].push(...items); else groups.push([name, items]);
      if (mode === 's') sl.gsingle.add(name);
      if (zone) sl.gzone[name] = zone;
    });
    sl.groups = groups;
    if (extra.length) { const orig = sl.opts; sl.opts = c => { const o = orig(c); return [...o, ...extra.filter(p => !o.includes(p))]; }; }
    // ділянки, де показуються групи (базові ділянки параметра лишаються для груп без своєї)
    sl.baseParts = (sl.parts || []).slice();
    const zones = [...new Set(Object.values(sl.gzone))];
    sl.parts = [...new Set([...(sl.parts || []), ...zones])];
    zones.forEach(z => { const arr = MK.partSlots[z]; if (arr && !arr.includes(id)) arr.splice(arr.length - 1, 0, id); });
  });
})();
