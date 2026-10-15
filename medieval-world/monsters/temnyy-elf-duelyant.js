Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf-duelyant",
  name: "Темний ельф-дуелянт",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass", "mountain"], worlds: "all" },
  order: 303,
  lore: {
    description: "Гуманоїд.",
    behavior: "Зустрічається: підземні міста.",
    abilities: ["швидкі комбінації клинків", "тіньове ухилення"],
  },
});
