Atlas.registerMonster({
  format: 2,
  id: "prymarnyy-olen-volodar",
  name: "Примарний олень-володар",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["enchanted", "forest", "taiga"], worlds: "all" },
  order: 287,
  lore: {
    description: "Дух-звір.",
    behavior: "Зустрічається: зачаровані гаї.",
    abilities: ["телепортація", "примарні роги", "виклик туману"],
  },
});
