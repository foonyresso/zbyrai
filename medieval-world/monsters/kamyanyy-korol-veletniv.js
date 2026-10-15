Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-korol-veletniv",
  name: "Кам’яний король велетнів",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 263,
  lore: {
    description: "Гірський велетень.",
    behavior: "Зустрічається: гірські цитаделі.",
    abilities: ["обвали", "удари землею", "кидання валунів"],
  },
});
