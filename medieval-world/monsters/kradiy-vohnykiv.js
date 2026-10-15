Atlas.registerMonster({
  format: 2,
  id: "kradiy-vohnykiv",
  name: "Крадій вогників",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 511,
  lore: {
    description: "Маленький летючий звір із довгими пальцями.",
    behavior: "Підземні лабіринти.",
    abilities: ["викрадає світло факелів і переносить його в темні куточки печер"],
  },
});
