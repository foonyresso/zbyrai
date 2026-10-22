/* Приклад світу: «Суходіл із морями» — той самий рушій, що й «Материк» (worlds/continent/), з іншими параметрами. Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "pangea",
  name: "Суходіл із морями",
  order: 22,
  runner: "builtin",
  preset: {"worldType": "pangea", "size": "l", "provinces": 7, "warm": 0.2, "wet": -0.25, "ruggedness": 0.3, "theme": "pangea", "cities": "n"},
  description: "Великий суходіл із внутрішніми морями й довгими сухопутними дорогами.",
  biomes: { allow: "all", deny: "tag:exclusive" },
});
