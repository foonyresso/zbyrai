Atlas.registerMonster({
  format: 2,
  id: "krab-voyin",
  name: "Краб-воїн",
  kind: "monster",
  nature: "magic",
  variants: ["морський краб-воїн", "краб-кам’янонос"],
  spawn: { biomes: ["deep", "sea", "mountain", "hills"], worlds: "all" },
  order: 417,
  lore: {
    description: "Членистоноге. Об'єднує схожих істот: морський краб-воїн, краб-кам’янонос.",
    behavior: "Зустрічається: пляжі, рифи; скелясті узбережжя.",
    abilities: ["клешні", "міцний панцир", "кидає каміння", "маскується під валуни"],
  },
});
