Atlas.registerMonster({
  format: 2,
  id: "pechernyy-pavuk",
  name: "Печерний павук",
  kind: "monster",
  nature: "threat",
  variants: ["печерний павук", "крихітний печерний павук"],
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 397,
  lore: {
    description: "Павукоподібне. Об'єднує схожих істот: печерний павук, крихітний печерний павук.",
    behavior: "Зустрічається: темні печери; печери.",
    abilities: ["отруйний укус", "павутина", "слабка отрута"],
  },
});
