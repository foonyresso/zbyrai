/* ---- нововведення карти королівств у нескінченному світі: лігва монстрів, боси, місця інтересу, стани поселень ----
   Усе рахується за хешем клітинки сітки (як села), тому світ лишається нескінченним і однаковим для того самого зерна.
   Дані (монстри, боси, типи місць) спільні з «Материком»: src/data/realm/. Малювання: src/render/world/realm-layers.js */
const RX_LC = 1400, RX_PC = 1000, RX_BC = 6500;
function rx() {
  return WLD.rx || (WLD.rx = { l: new Map(), b: new Map(), p: new Map() });
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
const rxDomain = (g) => g == "sea" ? "sea" : (g == "peaks" || g == "mountain" || g == "hills") ? "mountain" : g == "forest" ? "forest" : null;
const rxPick = (a, u) => a[Math.min(a.length - 1, Math.floor(u * a.length))];
const rxSpot = (i, j, c, a, b) => [(i + .15 + H2(i, j, WLD.s + a) * .7) * c, (j + .15 + H2(i, j, WLD.s + b) * .7) * c];

/* звичайні лігва й місця відпочинку (рівень 1) */
function rxLair(i, j) {
  const m = rx().l, key = i + "," + j;
  if (m.has(key)) return m.get(key);
  let o = null;
  const s = WLD.s;
  if (H2(i, j, s + 901) < .6) {
    const [x, y] = rxSpot(i, j, RX_LC, 902, 903);
    if (Math.hypot(x, y) > Rm * 1.7 + 300) {
      const dom = rxDomain(rxGroup(x, y));
      if (dom && rxClear(x, y, 150)) {
        const mons = RealmMap.Data[dom].monsters, monster = rxPick(mons, H2(i, j, s + 904)),
          kind = dom != "sea" && H2(i, j, s + 905) < .4 ? "rest" : "lair";
        o = { id: "L" + key, x, y, domain: dom, tier: 1, kind, monster, name: RealmMap.Data.lairKinds[kind] + ": " + monster };
      }
    }
  }
  m.set(key, o);
  return o;
}
/* боси й міні-боси (рівні 2–3): рідкісні, далеко від поселень, у горах, лісах і глибинах моря */
function rxBoss(i, j) {
  const m = rx().b, key = i + "," + j;
  if (m.has(key)) return m.get(key);
  let o = null;
  const s = WLD.s;
  if (H2(i, j, s + 911) < .7) {
    const [x, y] = rxSpot(i, j, RX_BC, 912, 913);
    if (Math.hypot(x, y) > Rm * 1.7 + 1500) {
      const g = rxGroup(x, y), dom = rxDomain(g);
      if (dom && (dom != "sea" || tsamp(x, y, 4).E < -.15) && rxClear(x, y, 900)) {
        const b = rxPick(RealmMap.Data[dom].bosses, H2(i, j, s + 914)),
          variant = b.variants ? rxPick(b.variants, H2(i, j, s + 915)) : null,
          monster = b.n + (variant ? " (" + variant + ")" : "");
        o = { id: "B" + key, x, y, domain: dom, tier: b.tier, kind: "boss", monster, alias: b.alias || null, name: "Лігво: " + monster };
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
  if (H2(i, j, s + 921) < .45) {
    const [x, y] = rxSpot(i, j, RX_PC, 922, 923);
    if (Math.hypot(x, y) > Rm * 1.7 + 300) {
      const g = rxGroup(x, y), P = RealmMap.Data.poi;
      let ids = [];
      if (g == "lake") ids = ["lake"];
      else if (g != "sea" && g != "shore") {
        const tags = [g == "peaks" ? "mountain" : g, "land"];
        ids = Object.keys(P).filter((k) => P[k].on && P[k].on.some((t) => tags.includes(t)));
        if (g == "peaks" || g == "mountain") ids.push("mountain");
      }
      if (ids.length && rxClear(x, y, 120)) {
        const type = rxPick(ids, H2(i, j, s + 924)), def = P[type];
        o = { id: "P" + key, x, y, type, cls: def.cls, name: def.name + " «" + cname(s + "p" + key) + "»" };
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
  if (v.tier >= 3) return "normal";
  if (v.rxs !== undefined) return v.rxs;
  const u = H2(v.i, v.j, WLD.s + 931), r = RX_STATES[v.tier];
  let a = 0, st = "normal";
  ["fallen", "ruined", "abandoned", "occupied"].some((k, n) => (a += r[n]) > u && (st = k));
  return v.rxs = st;
}
/* усі об'єкти шару в прямокутнику світу */
function rxEach(x0, y0, x1, y1, fn) {
  for (let i = Math.floor(x0 / RX_LC); i <= Math.floor(x1 / RX_LC); i++) {
    for (let j = Math.floor(y0 / RX_LC); j <= Math.floor(y1 / RX_LC); j++) { const o = rxLair(i, j); if (o) fn(o); }
  }
  for (let i = Math.floor(x0 / RX_BC); i <= Math.floor(x1 / RX_BC); i++) {
    for (let j = Math.floor(y0 / RX_BC); j <= Math.floor(y1 / RX_BC); j++) { const o = rxBoss(i, j); if (o) fn(o); }
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
  rxEach(x - tol, y - tol, x + tol, y + tol, (o) => {
    if (!rxShown(o)) return;
    const d = Math.hypot(o.x - x, o.y - y);
    if (d < tol && d < bd) { bd = d; best = o; }
  });
  if (!best) return null;
  if (best.type) return { n: best.name, c: "Місце", d: (best.cls == "major" ? "Значне місце: до нього веде мала дорога." : "Дрібне місце: до нього веде стежка.") };
  const T = RealmMap.Data.tierNames[best.tier], dom = { mountain: "гори", forest: "ліс", sea: "глибини моря" }[best.domain];
  return { n: best.name, c: "Монстри", d: T + " · " + dom + (best.alias ? " · також: " + best.alias : "") + "." };
}
