Atlas.registerMonster({
  format: 2,
  id: "teplokrad",
  name: "Теплокрад",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 825,
  lore: {
    description: "Невелика довгохвоста пухнаста істота з носом із темного каменю та тонкими лапами.",
    behavior: "З’являється біля покинутих таборів на морозних луках.",
    abilities: ["висмоктує тепло з багать і залишає навколо них кільце інею, а потім ховається у холодній землі"],
  },
});
