Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-salamandrovyy-knyaz",
  name: "Вогняний саламандровий князь",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "volcanic", "ashlands"], worlds: "all" },
  order: 301,
  lore: {
    description: "Вогняна істота.",
    behavior: "Зустрічається: вулканічні печери.",
    abilities: ["лавові бризки", "розпечений хвіст"],
  },
});
