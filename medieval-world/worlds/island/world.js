/* Приклад світу: «Один острів» — той самий рушій, що й «Материк» (worlds/continent/), з іншими параметрами. Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "island",
  name: "Один острів",
  order: 21,
  runner: "iframe",
  entry: "worlds/continent/index.html?embed=1",
  preset: {"worldType": "island", "size": "s", "provinces": 3},
  description: "Малий скінченний світ: один острів, три провінції, гори й річки.",
  biomes: { allow: "all" },
  inherit: "continent",
});
