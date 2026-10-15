Atlas.registerMonster({
  format: 2,
  id: "pletilnyk-kolyuchykh-dorih",
  name: "Плетільник колючих доріг",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 489,
  lore: {
    description: "Довга змієподібна істота з колючих лоз.",
    behavior: "Тернові хащі.",
    abilities: ["перекриває стежки живими огорожами й атакує з-під землі"],
  },
});
