Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-pereviznyk",
  name: "Болотяний перевізник",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 486,
  lore: {
    description: "Чотиринога істота з платформою з коріння на спині.",
    behavior: "Трясовинні переправи.",
    abilities: ["переносить отруйні калюжі та викидає їх під ногами ворогів"],
  },
});
