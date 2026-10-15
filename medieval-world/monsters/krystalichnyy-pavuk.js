Atlas.registerMonster({
  format: 2,
  id: "krystalichnyy-pavuk",
  name: "Кристалічний павук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 342,
  lore: {
    description: "Елітний павук.",
    behavior: "Зустрічається: геодні печери.",
    abilities: ["кристалічні нитки", "рикошетні уламки"],
  },
});
