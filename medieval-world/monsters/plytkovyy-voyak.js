Atlas.registerMonster({
  format: 2,
  id: "plytkovyy-voyak",
  name: "Плитковий вояк",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 570,
  lore: {
    description: "Гуманоїд із рухомих кам’яних плит.",
    behavior: "Руїни мостових міст.",
    abilities: ["складає руки в щити та атакує гострими кутами"],
  },
});
