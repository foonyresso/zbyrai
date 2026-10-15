Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-nasinnyeyid",
  name: "Колючий насіннєїд",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 660,
  lore: {
    description: "Маленький жук, що носить насіння на спині.",
    behavior: "Квітчасті поля.",
    abilities: ["стріляє ним у ворога, а на місці влучання виростають короткі колючки"],
  },
});
