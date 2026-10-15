/* ---- Реєстр світів і біомів «Проекту Атлас» (формат 1) ----
   Світ = один файл worlds/<id>/world.js, біом = один файл biomes/<id>.js. Файли самі себе реєструють
   (Atlas.registerWorld / Atlas.registerBiome); ядро знає лише цей реєстр, а перелік файлів бере з registry.js,
   який генерує `node tools/build-atlas-registry.mjs`. Документація: docs/atlas/world-files.md, docs/atlas/biome-files.md */
(function (root) {
  "use strict";
  const A = { FORMAT: 1, worlds: [], biomes: [], manifest: { worlds: [], biomes: [] } };
  const need = (o, keys, what) => { for (const k of keys) if (o[k] === undefined) throw new Error(what + ": немає поля «" + k + "»"); };

  A.registerWorld = function (w) {
    need(w, ["format", "id", "name", "runner"], "світ");
    if (w.format !== A.FORMAT) throw new Error("світ " + w.id + ": невідомий формат " + w.format);
    if (A.worlds.some((x) => x.id === w.id)) throw new Error("світ " + w.id + " вже зареєстровано");
    A.worlds.push(Object.assign({ order: 100, extraActions: [], inherit: null, biomes: { allow: "all" } }, w));
    A.worlds.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "uk"));
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

  /* завантажує файли з registry.js по черзі (статичний сайт без сервера), повертає Promise */
  A.load = function () {
    /* async=false: файли вантажаться паралельно, а виконуються по черзі */
    return Promise.all(A.manifest.biomes.concat(A.manifest.worlds).map((src) => new Promise((ok, no) => {
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
