Atlas.registerMonster({
  format: 2,
  id: "tytan-zaliznoho-pantsyra",
  name: "Титан залізного панцира",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 271,
  lore: {
    description: "Броньований голем.",
    behavior: "Зустрічається: покинуті гірничі комплекси.",
    abilities: ["магнітні удари", "металеві уламки", "майже невразлива броня"],
  },
});
