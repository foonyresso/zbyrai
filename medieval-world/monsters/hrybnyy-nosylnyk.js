Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-nosylnyk",
  name: "Грибний носильник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 545,
  lore: {
    description: "Велика повільна істота з кошиком грибів на спині.",
    behavior: "Підземні грибниці.",
    abilities: ["розкидає навколо вибухові капелюшки"],
  },
});
