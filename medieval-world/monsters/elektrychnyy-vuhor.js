Atlas.registerMonster({
  format: 2,
  id: "elektrychnyy-vuhor",
  name: "Електричний вугор",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 414,
  lore: {
    description: "Магічна риба.",
    behavior: "Зустрічається: підземні водойми, теплі річки.",
    abilities: ["електричні розряди", "оглушення"],
  },
});
