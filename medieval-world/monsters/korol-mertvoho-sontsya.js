Atlas.registerMonster({
  format: 2,
  id: "korol-mertvoho-sontsya",
  name: "Король мертвого сонця",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 245,
  lore: {
    description: "Неживий велетень.",
    behavior: "Зустрічається: чорна пустеля, стародавня столиця мертвих.",
    abilities: ["темрява", "випалювання землі", "виклик скелетних армій"],
  },
});
