Atlas.registerMonster({
  format: 2,
  id: "maskovanyy-duelyant",
  name: "Маскований дуелянт",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 367,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: руїни арен.",
    abilities: ["парирування", "швидкий випад"],
  },
});
