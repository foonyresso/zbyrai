Atlas.registerMonster({
  format: 2,
  id: "kotushka-pavuk",
  name: "Котушка-павук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 648,
  lore: {
    description: "Павук із круглим тілом, схожим на клубок ниток.",
    behavior: "Дерев’яні руїни.",
    abilities: ["згортається й котиться до здобичі, обмотуючи її липкою павутиною"],
  },
});
