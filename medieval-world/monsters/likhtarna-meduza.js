Atlas.registerMonster({
  format: 2,
  id: "likhtarna-meduza",
  name: "Ліхтарна медуза",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 528,
  lore: {
    description: "Повітряна істота з напівпрозорим куполом.",
    behavior: "Печери з природними шахтами.",
    abilities: ["приваблює світлом, а потім б’є паралізувальними нитками"],
  },
});
