Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-skat",
  name: "Колючий скат",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 415,
  lore: {
    description: "Морська істота.",
    behavior: "Зустрічається: морське дно.",
    abilities: ["удар шипастим хвостом", "короткі електричні розряди"],
  },
});
