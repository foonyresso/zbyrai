Atlas.registerMonster({
  format: 2,
  id: "pyavka",
  name: "П'явка",
  kind: "monster",
  nature: "threat",
  variants: ["болотяна п’явка", "малий болотяний п’явун"],
  spawn: { biomes: ["lake", "swamp"], worlds: "all" },
  order: 429,
  lore: {
    description: "Паразит. Об'єднує схожих істот: болотяна п’явка, малий болотяний п’явун.",
    behavior: "Зустрічається: трясовини, каламутні ставки; болота.",
    abilities: ["присмоктується й висмоктує життєву силу", "присмоктується", "повільно виснажує"],
  },
});
