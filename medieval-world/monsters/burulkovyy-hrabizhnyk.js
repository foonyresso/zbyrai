Atlas.registerMonster({
  format: 2,
  id: "burulkovyy-hrabizhnyk",
  name: "Бурульковий грабіжник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "snow", "wasteland", "hills"], worlds: "all" },
  order: 514,
  lore: {
    description: "Худий крижаний гуманоїд із довгими пальцями-гачками.",
    behavior: "Покинуті зимові селища.",
    abilities: ["краде предмети й кидає їх крізь крижані портали"],
  },
});
