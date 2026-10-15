Atlas.registerMonster({
  format: 2,
  id: "meduzka-lunnoho-pylu",
  name: "Медузка Лунного Пилу",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 920,
  lore: {
    description: "Крихітна літаюча істота з прозорою кубічною шапкою та ниткоподібними щупальцями.",
    behavior: "З'являється вночі над руїнами на високих плато.",
    abilities: ["накопичує місячний пил на щупальцях і випускає короткі спалахи, які тимчасово підсвічують невидимі сліди"],
  },
});
