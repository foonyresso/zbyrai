/* ---- Реєстр світів і біомів «Проекту Атлас» (формат 1) ----
   Світ = один файл worlds/<id>/world.js, біом = один файл biomes/<id>.js. Файли самі себе реєструють
   (Atlas.registerWorld / Atlas.registerBiome); ядро знає лише цей реєстр, а перелік файлів бере з registry.js,
   який генерує `node tools/build-atlas-registry.mjs`. Документація: docs/atlas/world-files.md, docs/atlas/biome-files.md */
(function (root) {
  "use strict";
  const A = { FORMAT: 1, worlds: [], biomes: [], monsters: [], manifest: { worlds: [], biomes: [], monsters: [] } };
  /* Типи монстрів від найслабших до найсильніших. rank — сила; city/village — найменша відстань до краю міста (містечка й більші)
     та села/хутора (у світових одиницях нескінченного світу): чим сильніший тип, тим далі від людей. weakNear — частка слабких,
     що все ж трапляються ближче за village (лише біля сіл і хуторів, рідко). cell/gate — сітка й імовірність появи в нескінченному світі */
  A.monsterKinds = {
    weak: { name: "Слабкі створіння", rank: 1, city: 1200, village: 90, near: 700, weakNear: 0.3, cell: 1100, gate: 0.18 },
    monster: { name: "Звичайні монстри", rank: 2, city: 2200, village: 700, cell: 1400, gate: 0.6 },
    other: { name: "Інші (духи, мандрівні)", rank: 2, city: 1800, village: 600, cell: 2400, gate: 0.35 },
    "mini-boss": { name: "Міні-боси", rank: 3, city: 3500, village: 1400, cell: 3000, gate: 0.6 },
    boss: { name: "Боси", rank: 4, city: 5500, village: 2500, cell: 6500, gate: 0.7 },
    "super-boss": { name: "Супербоси", rank: 5, city: 8000, village: 4000, cell: 11000, gate: 0.7 },
    "world-boss": { name: "Світові боси", rank: 6, city: 10000, village: 5000, cell: 12000, gate: 0.9 },
  };
  A.monsterNatures = { magic: "магічний", threat: "загроза" };
  const need = (o, keys, what) => { for (const k of keys) if (o[k] === undefined) throw new Error(what + ": немає поля «" + k + "»"); };

  A.registerWorld = function (w) {
    need(w, ["format", "id", "name", "runner"], "світ");
    if (w.format !== A.FORMAT) throw new Error("світ " + w.id + ": невідомий формат " + w.format);
    if (A.worlds.some((x) => x.id === w.id)) throw new Error("світ " + w.id + " вже зареєстровано");
    A.worlds.push(Object.assign({ order: 100, extraActions: [], inherit: null, biomes: { allow: "all" } }, w));
    A.worlds.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "uk"));
  };
  A.registerMonster = function (m) {
    need(m, ["format", "id", "name", "kind", "nature", "spawn"], "монстр");
    if (m.format !== A.FORMAT) throw new Error("монстр " + m.id + ": невідомий формат " + m.format);
    if (!A.monsterKinds[m.kind]) throw new Error("монстр " + m.id + ": невідомий тип " + m.kind);
    if (!A.monsterNatures[m.nature]) throw new Error("монстр " + m.id + ": невідома природа " + m.nature);
    if (A.monsters.some((x) => x.id === m.id)) throw new Error("монстр " + m.id + " вже зареєстровано");
    A.monsters.push(Object.assign({ order: 1000 }, m));
    A.monsters.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  };
  A.registerBiome = function (b) {
    need(b, ["format", "id", "name", "color", "tags"], "біом");
    if (b.format !== A.FORMAT) throw new Error("біом " + b.id + ": невідомий формат " + b.format);
    if (A.biomes.some((x) => x.id === b.id)) throw new Error("біом " + b.id + " вже зареєстровано");
    A.biomes.push(b);
  };

  A.worldById = (id) => A.worlds.find((w) => w.id === id) || null;

  /* селектор: "all" | "<id>" | "tag:a" | "tag:a+b" (усі теги одразу) */
  A.matches = function (biome, sel) {
    if (sel === "all") return true;
    if (sel.startsWith("tag:")) return sel.slice(4).split("+").every((t) => biome.tags.includes(t));
    return biome.id === sel;
  };
  /* які біоми дозволені світу й з якою вагою: allow (за замовчуванням "all") мінус deny, вага = добуток збіжних weights */
  A.resolveBiomes = function (world, biomes) {
    const r = world.biomes || { allow: "all" }, allow = [].concat(r.allow === undefined ? "all" : r.allow), deny = [].concat(r.deny || []);
    const wts = r.weights || {}, out = [];
    for (const b of biomes || A.biomes) {
      if (!allow.some((s) => A.matches(b, s)) || deny.some((s) => A.matches(b, s))) continue;
      let w = 1;
      for (const s in wts) if (A.matches(b, s)) w *= wts[s];
      if (w > 0) out.push({ biome: b, weight: w });
    }
    return out;
  };

  /* монстри типу kind, що можуть з'явитись у біомах biomeIds (id) у світі worldId; spawn: { biomes: [id | "tag:…"], worlds: "all" | [id] } */
  A.monstersFor = function (kind, biomeIds, worldId) {
    const bs = (biomeIds || []).map((id) => A.biomes.find((b) => b.id === id)).filter(Boolean);
    return A.monsters.filter((m) => m.kind === kind && (m.spawn.worlds === "all" || m.spawn.worlds.includes(worldId)) &&
      bs.some((b) => [].concat(m.spawn.biomes).some((s) => A.matches(b, s))));
  };

  /* завантажує файли з registry.js по черзі (статичний сайт без сервера), повертає Promise */
  A.load = function () {
    /* async=false: файли вантажаться паралельно, а виконуються по черзі */
    return Promise.all(A.manifest.biomes.concat(A.manifest.monsters, A.manifest.worlds).map((src) => new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = ok;
      s.onerror = () => no(new Error("не завантажено " + src));
      document.head.append(s);
    })));
  };
  if (typeof module !== "undefined" && module.exports) module.exports = A;
  else root.Atlas = A;
})(typeof window !== "undefined" ? window : globalThis);
