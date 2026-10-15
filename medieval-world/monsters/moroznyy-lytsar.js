Atlas.registerMonster({
  format: 2,
  id: "moroznyy-lytsar",
  name: "Морозний лицар",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "snow", "wasteland", "hills"], worlds: "all" },
  order: 307,
  lore: {
    description: "Неживий воїн.",
    behavior: "Зустрічається: крижані фортеці.",
    abilities: ["заморожує землю", "атакує крижаним списом"],
  },
});
