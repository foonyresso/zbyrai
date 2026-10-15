Atlas.registerMonster({
  format: 2,
  id: "mah-lavovykh-bryl",
  name: "Маг лавових брил",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "volcanic", "ashlands"], worlds: "all" },
  order: 309,
  lore: {
    description: "Елементаль.",
    behavior: "Зустрічається: вулканічні ущелини.",
    abilities: ["метає розпечене каміння", "створює лавові калюжі"],
  },
});
