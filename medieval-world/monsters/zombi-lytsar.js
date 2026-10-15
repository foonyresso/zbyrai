Atlas.registerMonster({
  format: 2,
  id: "zombi-lytsar",
  name: "Зомбі-лицар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 333,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: покинуті фортеці.",
    abilities: ["важка броня", "щит", "заражені удари"],
  },
});
