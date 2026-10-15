/* Приклад світу: «Архіпелаг» — той самий рушій, що й «Материк» (worlds/continent/), з іншими параметрами. Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "archipelago",
  name: "Архіпелаг",
  order: 20,
  runner: "iframe",
  entry: "worlds/continent/index.html?embed=1",
  preset: {"worldType": "archipelago", "provinces": 4, "size": "l"},
  description: "Скінченний світ із багатьма островами: морські шляхи між портами важливіші за дороги.",
  biomes: { allow: "all" },
  inherit: "continent",
});
