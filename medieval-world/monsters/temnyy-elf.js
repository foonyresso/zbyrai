Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf",
  name: "Темний ельф",
  kind: "monster",
  nature: "magic",
  variants: ["темний ельф-мечник", "темний ельф-жрець"],
  spawn: { biomes: ["wasteland", "hills", "grass", "mountain"], worlds: "all" },
  order: 353,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: темний ельф-мечник, темний ельф-жрець.",
    behavior: "Зустрічається: підземні міста; підземні храми.",
    abilities: ["швидкі удари клинком", "темні прокляття", "лікування союзників"],
  },
});
