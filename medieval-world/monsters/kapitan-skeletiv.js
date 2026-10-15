Atlas.registerMonster({
  format: 2,
  id: "kapitan-skeletiv",
  name: "Капітан скелетів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 300,
  lore: {
    description: "Нежить.",
    behavior: "Зустрічається: кладовища, руїни.",
    abilities: ["піднімає скелетних воїнів", "атакує шаблею"],
  },
});
