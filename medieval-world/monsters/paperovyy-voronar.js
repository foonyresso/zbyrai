Atlas.registerMonster({
  format: 2,
  id: "paperovyy-voronar",
  name: "Паперовий Воронар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "lake", "grass"], worlds: "all" },
  order: 882,
  lore: {
    description: "Довгокрила істота, складена з пожовклих сторінок і чорнильних пластин.",
    behavior: "Гніздиться в архівах затоплених замків.",
    abilities: ["розгортає крила в пласкі листи, ковзає крізь вузькі щілини та залишає паперові порізи при зіткненні"],
  },
});
