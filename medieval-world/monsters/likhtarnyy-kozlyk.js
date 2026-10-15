Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-kozlyk",
  name: "Ліхтарний Козлик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "peaks"], worlds: "all" },
  order: 805,
  lore: {
    description: "Невеликий гірський звір із прозорими кристалічними рогами та шерстю кольору попелу.",
    behavior: "Мешкає в Місячнокам’яних нагір’ях.",
    abilities: ["освітлює темні проходи, доки його не налякати, а тоді цілеспрямовано таранить джерело світла й ховається за камінням"],
  },
});
