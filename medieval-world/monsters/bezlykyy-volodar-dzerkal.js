Atlas.registerMonster({
  format: 2,
  id: "bezlykyy-volodar-dzerkal",
  name: "Безликий володар дзеркал",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["crystal", "wasteland", "hills"], worlds: "all" },
  order: 269,
  lore: {
    description: "Магічна істота.",
    behavior: "Зустрічається: дзеркальний палац.",
    abilities: ["створює копії супротивників", "відбиває закляття", "викривлює простір"],
  },
});
