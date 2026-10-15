Atlas.registerMonster({
  format: 2,
  id: "pechernyy-minotavr",
  name: "Печерний мінотавр",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 311,
  lore: {
    description: "Рогатий гуманоїд.",
    behavior: "Зустрічається: лабіринти.",
    abilities: ["таран", "сокира", "розбивання перешкод"],
  },
});
