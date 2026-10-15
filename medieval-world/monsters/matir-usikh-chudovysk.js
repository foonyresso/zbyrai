Atlas.registerMonster({
  format: 2,
  id: "matir-usikh-chudovysk",
  name: "Матір усіх чудовиськ",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 246,
  lore: {
    description: "Прадавня істота.",
    behavior: "Зустрічається: заражені підземні гнізда.",
    abilities: ["породжує мутованих монстрів", "отруює землю", "відновлює здоров’я за рахунок потомства"],
  },
});
