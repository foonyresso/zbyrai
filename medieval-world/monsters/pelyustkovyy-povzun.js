Atlas.registerMonster({
  format: 2,
  id: "pelyustkovyy-povzun",
  name: "Пелюстковий повзун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "grass", "hills"], worlds: "all" },
  order: 728,
  lore: {
    description: "Маленький рослинний монстр із чотирма пелюстками замість лап.",
    behavior: "Клумби старих замків.",
    abilities: ["складається в квітку, коли до нього наближаються"],
  },
});
