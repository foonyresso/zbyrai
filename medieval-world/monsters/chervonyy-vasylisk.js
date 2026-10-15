Atlas.registerMonster({
  format: 2,
  id: "chervonyy-vasylisk",
  name: "Червоний василіск",
  kind: "boss",
  nature: "threat",
  variants: ["червоний василіск", "королівський василіск"],
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 291,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: червоний василіск, королівський василіск.",
    behavior: "Зустрічається: кам’янисті пустелі; скелясті печери.",
    abilities: ["скам’янювальний погляд", "отруйні кігті", "маскування під скелі", "коротке скам’яніння", "отруйний укус"],
  },
});
