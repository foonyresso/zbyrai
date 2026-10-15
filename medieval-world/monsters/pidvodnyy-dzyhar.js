Atlas.registerMonster({
  format: 2,
  id: "pidvodnyy-dzyhar",
  name: "Підводний дзигар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 688,
  lore: {
    description: "Риба зі спіральним хвостом.",
    behavior: "Швидкі течії.",
    abilities: ["крутиться у воді й створює невеликі вирви, що затягують предмети"],
  },
});
