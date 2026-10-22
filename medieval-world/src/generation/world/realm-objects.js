/* ---- нововведення карти королівств у нескінченному світі: лігва монстрів, боси, місця інтересу, стани поселень ----
   Усе рахується за хешем клітинки сітки (як села), тому світ лишається нескінченним і однаковим для того самого зерна.
   Дані (монстри, боси, типи місць) спільні з «Материком»: src/data/realm/. Малювання: src/render/world/realm-layers.js */
const RX_PC = 1000;
function rx() {
  return WLD.rx || (WLD.rx = { m: new Map(), p: new Map(), d: new Map() });
}
/* поблизу немає поселень: інакше значок ліг на село */
function rxClear(x, y, r) {
  for (const v of vlist(x - r - 200, y - r - 200, x + r + 200, y + r + 200)) {
    if (Math.hypot(v.x - x, v.y - y) < v.rad + r) return false;
  }
  return true;
}
/* група місцевості точки: sea (глибоке море), lake, peaks, mountain, hills, forest, river, plain */
function rxGroup(x, y) {
  const p = tsamp(x, y, 4);
  if (p.E <= 0) return p.lake || !seaBody(x, y) ? "lake" : p.E < -.12 ? "sea" : "shore";
  if (p.rv > .4 || riverBank(x, y) < 30) return "river";
  if (p.E > .62) return "peaks";
  if (p.E > .4) return "mountain";
  if (p.E > .28) return "hills";
  if (p.fo > .45) return "forest";
  return "plain";
}
/* суша поза провінціями: острови в диких океанах (нічийні, переважно монстри, руїни й скарби) */
const rxWild = (x, y) => eland(x, y) > 0 && !regAt(x, y);
const rxDomain = (g) => g == "sea" ? "sea" : (g == "peaks" || g == "mountain" || g == "hills") ? "mountain" : g == "forest" ? "forest" : null;
const rxPick = (a, u) => a[Math.min(a.length - 1, Math.floor(u * a.length))];
const rxSpot = (i, j, c, a, b) => [(i + .15 + H2(i, j, WLD.s + a) * .7) * c, (j + .15 + H2(i, j, WLD.s + b) * .7) * c];

/* ---- монстри: файли monsters/*.js через реєстр Atlas; тип визначає силу, сітку появи й відстань до поселень ---- */
const RX_KIND_SEED = { weak: 951, monster: 961, other: 971, "mini-boss": 981, boss: 991, "super-boss": 1001, "world-boss": 1011 };
/* біоми точки (id із biomes/*.js) за місцевістю: за ними вибираються монстри, яким дозволено тут з'являтись */
function rxBiomesAt(x, y) {
  const p = tsamp(x, y, 4), g = rxGroup(x, y);
  let b;
  if (g == "lake") b = ["lake"];
  else if (g == "sea") b = ["deep"];
  else if (g == "shore") b = ["sea"];
  else if (g == "peaks") b = ["peaks"];
  else if (g == "mountain") b = ["mountain"];
  else if (g == "hills") b = ["hills"];
  else if (g == "forest") b = [p.bk == "snow" ? "taiga" : "forest"];
  else b = [p.bk == "snow" ? "tundra" : p.bk == "desert" ? "desert" : p.bk == "swamp" ? "swamp" : p.mo < .45 ? "steppe" : "grass"];
  const sb = (g != "sea" && g != "lake" && g != "shore") ? sbAt(x, y) : null;
  if (sb && sb.w > .5) b.push(sb.id);
  return { biomes: b, group: g, sub: sb ? sb.id : null };
}
/* чи достатньо далеко від поселень для цього типу: біля міст монстрів немає, сильніші ще далі; слабкі рідко (rare) бувають біля сіл і хуторів */
function rxFar(kind, x, y, rare) {
  const K = Atlas.monsterKinds[kind];
  if (Math.hypot(x, y) - Rm * 1.5 < K.city) return false;
  const Rc = K.city + 260;
  for (let i = Math.floor((x - Rc) / BC); i <= Math.floor((x + Rc) / BC); i++) {
    for (let j = Math.floor((y - Rc) / BC); j <= Math.floor((y + Rc) / BC); j++) {
      const c = bigC(i, j);
      if (c && Math.hypot(c.x - x, c.y - y) - c.rad < K.city) return false;
    }
  }
  const Rv = Math.max(K.village, K.near || 0) + 150;
  for (let i = Math.floor((x - Rv) / VC); i <= Math.floor((x + Rv) / VC); i++) {
    for (let j = Math.floor((y - Rv) / VC); j <= Math.floor((y + Rv) / VC); j++) {
      const v = village(i, j);
      if (!v) continue;
      const e = Math.hypot(v.x - x, v.y - y) - v.rad;
      if (e < K.village) return false;
      if (K.near && e < K.near && !rare) return false;
    }
  }
  return true;
}
function rxMon(kind, i, j) {
  if (!Atlas.monsters.length) return null; /* реєстр ще вантажиться: не кешуємо */
  const m = rx().m, key = kind + ":" + i + "," + j;
  if (m.has(key)) return m.get(key);
  const K = Atlas.monsterKinds[kind], s = WLD.s, ks = RX_KIND_SEED[kind];
  let o = null;
  const gh = H2(i, j, s + ks);
  if (gh < K.gate * 3) {
    const [x, y] = rxSpot(i, j, K.cell, ks + 1, ks + 2);
    /* на диких островах монстрів утричі більше */
    if (Math.hypot(x, y) > Rm * 1.7 + 300 && (gh < K.gate || rxWild(x, y))) {
      const info = rxBiomesAt(x, y), list = Atlas.monstersFor(kind, info.biomes, "infinite");
      if (list.length && (info.group != "sea" || kind == "weak" || kind == "monster" || kind == "other" || tsamp(x, y, 4).E < -.15) &&
        rxFar(kind, x, y, H2(i, j, s + ks + 9) < (K.weakNear || 0))) {
        const mon = rxPick(list, H2(i, j, s + ks + 3)), variant = mon.variants ? rxPick(mon.variants, H2(i, j, s + ks + 4)) : null,
          monster = mon.name + (variant ? " (" + variant + ")" : ""), rest = kind == "monster" && H2(i, j, s + ks + 5) < .4;
        o = {
          id: kind + i + "," + j, x, y, mk: kind, tier: K.rank >= 5 ? 3 : K.rank >= 4 ? 3 : K.rank == 3 ? 2 : 1,
          kind: K.rank >= 4 ? "boss" : rest ? "rest" : "lair", domain: info.group == "sea" || info.group == "shore" ? "sea" : "land",
          monster, alias: mon.alias || null, nature: mon.nature, biome: info.biomes[0], scale: K.rank >= 6 ? 1.5 : K.rank == 5 ? 1.25 : 1,
          name: (rest ? RealmMap.Data.lairKinds.rest : "Лігво") + ": " + monster,
        };
      }
    }
  }
  m.set(key, o);
  return o;
}
/* місця інтересу: озера, гори, руїни, пам'ятники, храми, вежі, водоспади, галявини, табори... за типом місцевості */
function rxPoi(i, j) {
  const m = rx().p, key = i + "," + j;
  if (m.has(key)) return m.get(key);
  let o = null;
  const s = WLD.s;
  const ph = H2(i, j, s + 921);
  if (ph < .7) {
    const [x, y] = rxSpot(i, j, RX_PC, 922, 923);
    const wl = rxWild(x, y);
    if (Math.hypot(x, y) > Rm * 1.7 + 300 && (ph < .45 || wl)) {
      const g = rxGroup(x, y), P = RealmMap.Data.poi;
      let ids = [];
      if (g == "lake") ids = ["lake"];
      else if (wl && g != "sea" && g != "shore") {
        /* дикий острів: руїни й скарби, зрідка мала оселя */
        ids = ["ruins", "ruins", "ruins", "treasure", "treasure", "treasure", "monument", "small_monument", "shrine"];
        if (H2(i, j, s + 926) < .12) ids = ["wild_hamlet"];
      } else if (g != "sea" && g != "shore") {
        const tags = [g == "peaks" ? "mountain" : g, "land"];
        ids = Object.keys(P).filter((k) => P[k].on && P[k].on.some((t) => tags.includes(t)));
        if (g == "peaks" || g == "mountain") ids.push("mountain");
        /* табори бандитів частіші за інші дрібні місця на рівнині, в лісі й на пагорбах */
        if (["plain", "forest", "hills"].includes(g)) ids.push("bandit_camp");
      }
      if (ids.length && rxClear(x, y, 120)) {
        const type = rxPick(ids, H2(i, j, s + 924)), def = P[type];
        o = { id: "P" + key, i, j, x, y, type, cls: def.cls, name: def.name + " «" + cname(s + "p" + key) + "»" };
      }
    }
  }
  m.set(key, o);
  return o;
}
/* стани не головних поселень (хутори, села, великі села); містечка й більші завжди живі */
const RX_STATES = [
  /* [занепале, зруйноване, покинуте, захоплене] — частки за рангом */
  [.04, .10, .12, .08], [.05, .08, .10, .07], [.08, .05, .04, .05],
];
const RX_STATE_NAMES = { fallen: "занепале", ruined: "зруйноване", abandoned: "покинуте", occupied: "захоплене монстрами" };
function rxState(v) {
  if (v.home || (v.tier >= 3 && !SETL.ruin)) return "normal";
  if (v.rxs !== undefined) return v.rxs;
  /* вимір-руїна: частка поселень будь-якого рангу зруйнована або покинута */
  if (SETL.ruin && H2(v.i, v.j, WLD.s + 937) < SETL.ruin) return v.rxs = H2(v.i, v.j, WLD.s + 938) < .6 ? "ruined" : "abandoned";
  if (v.tier >= 3) return v.rxs = "normal";
  const u = H2(v.i, v.j, WLD.s + 931), r = RX_STATES[v.tier];
  let a = 0, st = "normal";
  ["fallen", "ruined", "abandoned", "occupied"].some((k, n) => (a += r[n]) > u && (st = k));
  return v.rxs = st;
}
/* усі об'єкти шару в прямокутнику світу */
function rxEach(x0, y0, x1, y1, fn) {
  for (const kind in Atlas.monsterKinds) {
    if (!rxKindShown(kind)) continue;
    const c = Atlas.monsterKinds[kind].cell;
    for (let i = Math.floor(x0 / c); i <= Math.floor(x1 / c); i++) {
      for (let j = Math.floor(y0 / c); j <= Math.floor(y1 / c); j++) { const o = rxMon(kind, i, j); if (o) fn(o); }
    }
  }
  for (let i = Math.floor(x0 / RX_PC); i <= Math.floor(x1 / RX_PC); i++) {
    for (let j = Math.floor(y0 / RX_PC); j <= Math.floor(y1 / RX_PC); j++) { const o = rxPoi(i, j); if (o) fn(o); }
  }
}
/* підказка при наведенні на лігво чи місце (інакше null) */
function realmInfo(x, y) {
  if (!WLD || !WON) return null;
  const tol = 14 / S;
  let best = null, bd = 1e9;
  if (dgShown()) {
    dgnEach(x - tol, y - tol, x + tol, y + tol, (o) => {
      const d = Math.hypot(o.x - x, o.y - y);
      if (d < tol && d < bd) { bd = d; best = o; }
    });
    if (best) return dgnInfo(best);
  }
  rxEach(x - tol, y - tol, x + tol, y + tol, (o) => {
    if (!rxShown(o)) return;
    const d = Math.hypot(o.x - x, o.y - y);
    if (d < tol && d < bd) { bd = d; best = o; }
  });
  if (!best) return null;
  if (best.type) {
    const r = best.type == "small_mine" ? mineRes(best) : null, wl = rxWild(best.x, best.y),
      L = wl ? oceanLv(best.x, best.y)[0] : lvlAt(best.x, best.y)[0],
      T2 = {
        bandit_camp: "Табір бандитів: небезпечні розбійники ≈ " + L + " ур. Живуть на рівнині, в лісі й на пагорбах; до табору веде стежка.",
        treasure: "Прихований скарб: зазвичай його стереже щось із місцевих монстрів (≈ " + L + " ур.).",
        wild_hamlet: "Мала оселя на дикому острові: рідкісне безпечне місце серед монстрів (≈ " + L + " ур.). Не належить жодній провінції.",
      };
    return { n: best.name, c: wl ? "Дикий острів" : "Місце", d: (T2[best.type] || (best.cls == "major" ? "Значне місце: до нього веде мала дорога." : "Дрібне місце: до нього веде стежка.") + (wl ? " Нічия земля в дикому океані: монстри ≈ " + L + " ур." : "")) + (r ? " Ресурс: " + r.name + ", жила " + MINE_RICH[r.rich] + "." : "") };
  }
  const K = Atlas.monsterKinds[best.mk], biome = Atlas.biomes.find((b) => b.id == best.biome);
  return {
    n: best.name, c: K.name,
    d: Atlas.monsterNatures[best.nature] + " · живе: " + (biome ? biome.name.toLowerCase() : best.biome) + (best.alias ? " · також: " + best.alias : "") +
      ". Рівень ≈ " + (rxWild(best.x, best.y) ? oceanLv(best.x, best.y)[0] : lvlAt(best.x, best.y)[0]) + (rxWild(best.x, best.y) ? " (дикий острів)" : "") + ". Чим сильніший тип, тим далі від поселень.",
  };
}
