Atlas.registerMonster({
  format: 2,
  id: "sapfirovyy-klishch",
  name: "Сапфіровий кліщ",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 526,
  lore: {
    description: "Великий паразит із твердим синім панциром.",
    behavior: "Кристалічні гнізда.",
    abilities: ["присмоктується до магічних істот і переймає їхню стихію"],
  },
});
