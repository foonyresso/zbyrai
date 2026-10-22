/* Приклад світу: «Архіпелаг» — той самий рушій, що й «Материк» (worlds/continent/), з іншими параметрами. Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "archipelago",
  name: "Архіпелаг",
  order: 20,
  runner: "builtin",
  preset: {"worldType": "archipelago", "size": "l", "provinces": 4, "warm": 0.15, "wet": 0.1, "ruggedness": 0.35, "riverDensity": 0.8, "theme": "archipelago", "cities": "r"},
  description: "Скінченний світ із багатьма островами: морські шляхи між портами важливіші за дороги.",
  biomes: { allow: "all", deny: "tag:exclusive" },
});
