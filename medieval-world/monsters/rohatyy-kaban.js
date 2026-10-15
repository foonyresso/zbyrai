Atlas.registerMonster({
  format: 2,
  id: "rohatyy-kaban",
  name: "Рогатий кабан",
  kind: "monster",
  nature: "magic",
  variants: ["рогатий кабан", "червоноглазий лісовий кабан"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 350,
  lore: {
    description: "Магічний звір. Об'єднує схожих істот: рогатий кабан, червоноглазий лісовий кабан.",
    behavior: "Зустрічається: гірські ліси; густі ліси.",
    abilities: ["посилений таран", "кам’яні роги", "серії таранів", "розкопування землі"],
  },
});
