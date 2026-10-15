Atlas.registerMonster({
  format: 2,
  id: "volodar-ostannoho-vidplyvu",
  name: "Володар останнього відпливу",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "sea"], worlds: "all" },
  order: 450,
  lore: {
    description: "Панцирна істота завбільшки з острів.",
    behavior: "Безмежні припливні рівнини.",
    abilities: ["відтягує воду на величезну відстань, оголюючи дно, а потім повертає цунамі"],
  },
});
