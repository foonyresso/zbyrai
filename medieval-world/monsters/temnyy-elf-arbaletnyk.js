Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf-arbaletnyk",
  name: "Темний ельф-арбалетник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 332,
  lore: {
    description: "Елітний стрілець.",
    behavior: "Зустрічається: підземні поселення.",
    abilities: ["отруйні болти", "маскування"],
  },
});
