Atlas.registerMonster({
  format: 2,
  id: "horikhovyy-pyshchak",
  name: "Горіховий пищак",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 729,
  lore: {
    description: "Дрібний звір, що ховає горіхи в щоках.",
    behavior: "Ліщинові гаї.",
    abilities: ["плюється дрібними шкаралупками, якщо його потривожити"],
  },
});
