Atlas.registerMonster({
  format: 2,
  id: "kubichnyy-svitlyachok",
  name: "Кубічний світлячок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 736,
  lore: {
    description: "Дрібна літаюча істота з квадратним світним черевцем.",
    behavior: "Вечірні галявини.",
    abilities: ["збирається у візерунки в повітрі й розлітається, коли до неї наближаються"],
  },
});
