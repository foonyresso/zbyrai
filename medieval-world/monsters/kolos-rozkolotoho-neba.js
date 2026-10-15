Atlas.registerMonster({
  format: 2,
  id: "kolos-rozkolotoho-neba",
  name: "Колос розколотого неба",
  kind: "world-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 255,
  lore: {
    description: "Кам'яний титан.",
    behavior: "Зустрічається: гірські плато та місця падіння метеоритів.",
    abilities: ["кидає уламки скель", "відкриває просторові розломи", "викликає метеоритні дощі"],
  },
});
