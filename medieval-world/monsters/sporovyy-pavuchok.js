Atlas.registerMonster({
  format: 2,
  id: "sporovyy-pavuchok",
  name: "Споровий павучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 404,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: підземні грибниці.",
    abilities: ["отруйні спори", "липкі нитки"],
  },
});
