Atlas.registerMonster({
  format: 2,
  id: "pustelna-hiyena",
  name: "Пустельна гієна",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 375,
  lore: {
    description: "Звір-хижак.",
    behavior: "Зустрічається: пустелі, каньйони.",
    abilities: ["атаки зграєю", "добивання ослаблених цілей"],
  },
});
