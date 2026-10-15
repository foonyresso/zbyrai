Atlas.registerMonster({
  format: 2,
  id: "tinovyy-myslyvets",
  name: "Тіньовий мисливець",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 314,
  lore: {
    description: "Демон.",
    behavior: "Зустрічається: прокляті руїни.",
    abilities: ["телепортація", "удари зі спини", "невидимість"],
  },
});
