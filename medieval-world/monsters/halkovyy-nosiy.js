Atlas.registerMonster({
  format: 2,
  id: "halkovyy-nosiy",
  name: "Гальковий носій",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 628,
  lore: {
    description: "Черепахоподібна тварина, що збирає камінці на спину.",
    behavior: "Кам’янисті береги річок.",
    abilities: ["скидає їх одним рухом, коли її переслідують"],
  },
});
