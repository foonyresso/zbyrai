Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-prabatko",
  name: "Крижаний прабатько",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 260,
  lore: {
    description: "Велетень морозу.",
    behavior: "Зустрічається: вічні льодовики.",
    abilities: ["заморожує поверхню", "викликає крижані шипи", "створює хуртовини"],
  },
});
