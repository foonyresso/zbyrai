Atlas.registerMonster({
  format: 2,
  id: "velykyy-rohatyy-demon",
  name: "Великий рогатий демон",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 280,
  lore: {
    description: "Демон.",
    behavior: "Зустрічається: зруйновані фортеці.",
    abilities: ["наскоки", "вогняні роги", "ударні хвилі"],
  },
});
