Atlas.registerMonster({
  format: 2,
  id: "runnyy-pidbyrach",
  name: "Рунний Підбирач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 902,
  lore: {
    description: "Невеликий гуманоїд із синіх кам'яних плит і довгих пальців, вкритих світними знаками.",
    behavior: "Блукає коридорами рунних підземель.",
    abilities: ["збирає активні руни з підлоги та переносить їх на власне тіло, отримуючи нові атаки залежно від підібраного знака"],
  },
});
