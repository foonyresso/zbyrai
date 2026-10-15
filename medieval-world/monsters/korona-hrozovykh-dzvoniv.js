Atlas.registerMonster({
  format: 2,
  id: "korona-hrozovykh-dzvoniv",
  name: "Корона Грозових Дзвонів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 836,
  lore: {
    description: "Колосальний літаючий звір без голови, тіло якого утворюють дев'ять бронзових дзвонів, з'єднаних блискавичними ланцюгами.",
    behavior: "Мешкає над гірськими плато під час вічних гроз.",
    abilities: ["кожен удар створює хвилю, що руйнує споруди й змінює напрямок вітру"],
  },
});
