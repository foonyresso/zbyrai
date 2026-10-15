Atlas.registerMonster({
  format: 2,
  id: "verkhovnyy-sadivnyk-kamenyu",
  name: "Верховний садівник каменю",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 456,
  lore: {
    description: "Гігантська істота з кришталевих гілок і гранітного коріння.",
    behavior: "Кам’яний ліс стародавніх велетів.",
    abilities: ["за секунди вирощує стіни, шипи та цілі лабіринти"],
  },
});
