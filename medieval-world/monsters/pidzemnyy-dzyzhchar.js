Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-dzyzhchar",
  name: "Підземний Дзижчар",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 926,
  lore: {
    description: "Маленька комаха з широким квадратним черевцем і прозорими крилами.",
    behavior: "Мешкає у вузьких тунелях під старими містами.",
    abilities: ["вібрує крилами так, що дрібні блоки починають повільно зсуватися, відкриваючи приховані тріщини в стінах"],
  },
});
