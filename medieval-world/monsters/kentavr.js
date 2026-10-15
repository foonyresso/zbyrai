Atlas.registerMonster({
  format: 2,
  id: "kentavr",
  name: "Кентавр",
  kind: "monster",
  nature: "threat",
  variants: ["отруйний кентавр-рейдер", "кентавр-лучник"],
  spawn: { biomes: ["steppe"], worlds: "all" },
  order: 339,
  lore: {
    description: "Елітний вершник. Об'єднує схожих істот: отруйний кентавр-рейдер, кентавр-лучник.",
    behavior: "Зустрічається: степи.",
    abilities: ["спис", "отруйні стріли", "швидкі наскоки", "стріли на бігу", "швидке відступлення"],
  },
});
