Atlas.registerMonster({
  format: 2,
  id: "pervisnyy-khaos",
  name: "Первісний хаос",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 256,
  lore: {
    description: "Мінлива магічна істота.",
    behavior: "Зустрічається: центр стародавньої аномалії.",
    abilities: ["змінює форму", "стихію й поведінку арени"],
  },
});
