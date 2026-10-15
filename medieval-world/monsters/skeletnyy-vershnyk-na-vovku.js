Atlas.registerMonster({
  format: 2,
  id: "skeletnyy-vershnyk-na-vovku",
  name: "Скелетний вершник на вовку",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 316,
  lore: {
    description: "Неживий вершник.",
    behavior: "Зустрічається: нічні рівнини.",
    abilities: ["швидкі наскоки", "спис", "виклик скелетних псів"],
  },
});
