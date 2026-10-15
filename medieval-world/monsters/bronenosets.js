Atlas.registerMonster({
  format: 2,
  id: "bronenosets",
  name: "Броненосець",
  kind: "mini-boss",
  nature: "threat",
  variants: ["шипастий броненосець", "хрускітливий броненосець"],
  spawn: { biomes: ["grass", "mountain", "hills"], worlds: "all" },
  order: 386,
  lore: {
    description: "Звір. Об'єднує схожих істот: шипастий броненосець, хрускітливий броненосець.",
    behavior: "Зустрічається: сухі рівнини; Уламкові схили.",
    abilities: ["міцний панцир", "перекочування в нападі", "хрускітливий броненосець: згортається в кулю й котиться з великою швидкістю"],
  },
});
