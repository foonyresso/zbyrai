Atlas.registerMonster({
  format: 2,
  id: "pechernyy-lev",
  name: "Печерний лев",
  kind: "monster",
  nature: "threat",
  variants: ["печерний лев", "білий печерний лев"],
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 349,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: печерний лев, білий печерний лев.",
    behavior: "Зустрічається: гірські печери; холодні гірські печери.",
    abilities: ["потужні стрибки", "оглушливий рик", "крижаний рик", "стрибки", "кігті"],
  },
});
