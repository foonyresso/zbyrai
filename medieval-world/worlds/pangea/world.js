/* Приклад світу: «Суходіл із морями» — той самий рушій, що й «Материк» (worlds/continent/), з іншими параметрами. Формат: docs/atlas/world-files.md */
Atlas.registerWorld({
  format: 1,
  id: "pangea",
  name: "Суходіл із морями",
  order: 22,
  runner: "iframe",
  entry: "worlds/continent/index.html?embed=1",
  preset: {"worldType": "pangea", "size": "l", "provinces": 7, "warm": 0.2, "wet": -0.25, "ruggedness": 0.3, "theme": "pangea"},
  description: "Великий суходіл із внутрішніми морями й довгими сухопутними дорогами.",
  biomes: { allow: "all" },
  inherit: "continent",
});
