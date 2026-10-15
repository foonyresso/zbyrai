Atlas.registerMonster({
  format: 2,
  id: "pavuk-lovets-veletniv",
  name: "Павук-ловець велетнів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 304,
  lore: {
    description: "Павук.",
    behavior: "Зустрічається: глибокі лісові печери.",
    abilities: ["липка павутина", "отруйні пастки"],
  },
});
