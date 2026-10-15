Atlas.registerMonster({
  format: 2,
  id: "strybuchyy-pavuk",
  name: "Стрибучий павук",
  kind: "monster",
  nature: "threat",
  variants: ["стрибучий павук", "голчастий павук-стрибун"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 399,
  lore: {
    description: "Павукоподібне. Об'єднує схожих істот: стрибучий павук, голчастий павук-стрибун.",
    behavior: "Зустрічається: скелі, дерева; Сухі кам’яні стіни.",
    abilities: ["швидкі стрибки", "атаки згори", "голчастий павук-стрибун: під час стрибка розкидає їх навколо"],
  },
});
