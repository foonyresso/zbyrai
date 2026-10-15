Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-zirok",
  name: "Пожирач зірок",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 252,
  lore: {
    description: "Космічний звір.",
    behavior: "Зустрічається: місця падіння небесних уламків.",
    abilities: ["темніє небо", "поглинає магічне світло", "випускає руйнівні промені"],
  },
});
