Atlas.registerMonster({
  format: 2,
  id: "plyamystyy-strybun",
  name: "Плямистий стрибун",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 509,
  lore: {
    description: "Хижак із пружними задніми лапами й світними плямами.",
    behavior: "Грибні луки.",
    abilities: ["стрибає через укриття та залишає вибухові сліди"],
  },
});
