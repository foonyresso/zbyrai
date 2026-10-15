Atlas.registerMonster({
  format: 2,
  id: "perlynnyy-khovach",
  name: "Перлинний ховач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 711,
  lore: {
    description: "Молюск, що носить блискучі перлини між стулками.",
    behavior: "Перлинні мілини.",
    abilities: ["закривається при наближенні, а потім випускає перлинні кульки як снаряди"],
  },
});
