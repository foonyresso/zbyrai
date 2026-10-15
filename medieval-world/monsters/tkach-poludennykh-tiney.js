Atlas.registerMonster({
  format: 2,
  id: "tkach-poludennykh-tiney",
  name: "Ткач Полуденних Тіней",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland"], worlds: "all" },
  order: 840,
  lore: {
    description: "Довготелеса істота з дев'ятьма ногами й довгими чорними стрічками замість обличчя.",
    behavior: "Полює серед білих обелісків сонячної пустки.",
    abilities: ["розтягує тіні гравців у пастки, які затримують рух, а потім міняється з ними місцями"],
  },
});
