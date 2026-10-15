Atlas.registerMonster({
  format: 2,
  id: "zhyvyy-nul",
  name: "Живий нуль",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 452,
  lore: {
    description: "Геометрична істота у формі порожнього куба.",
    behavior: "Мертва зона магії.",
    abilities: ["стирає магічні ефекти, руйнує зачаровані предмети й тимчасово вимикає здібності"],
  },
});
