Atlas.registerMonster({
  format: 2,
  id: "lavovyy-zhuk-oblohar",
  name: "Лавовий жук-облогар",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 286,
  lore: {
    description: "Гігантська комаха.",
    behavior: "Зустрічається: вулканічні поля.",
    abilities: ["розбризкує лаву", "заривається в землю", "має розпечений панцир"],
  },
});
