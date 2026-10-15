Atlas.registerMonster({
  format: 2,
  id: "lich-imperator",
  name: "Ліч-імператор",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 258,
  lore: {
    description: "Верховний некромант.",
    behavior: "Зустрічається: похований імператорський некрополь.",
    abilities: ["воскресіння мерців", "прокляття", "магічні щити"],
  },
});
