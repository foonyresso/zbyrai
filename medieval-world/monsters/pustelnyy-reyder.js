Atlas.registerMonster({
  format: 2,
  id: "pustelnyy-reyder",
  name: "Пустельний рейдер",
  kind: "monster",
  nature: "threat",
  variants: ["пустельний кочівник-рейдер", "пустельний списоносець"],
  spawn: { biomes: ["desert", "mountain", "hills"], worlds: "all" },
  order: 359,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: пустельний кочівник-рейдер, пустельний списоносець.",
    behavior: "Зустрічається: пустелі, караванні шляхи; каньйони.",
    abilities: ["шабля", "піщаний пил", "довгий спис", "засідки з-за каміння"],
  },
});
