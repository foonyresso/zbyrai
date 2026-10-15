Atlas.registerMonster({
  format: 2,
  id: "tumannyy-kopyten",
  name: "Туманний копитень",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 569,
  lore: {
    description: "Стрункий звір, що розпадається на серпанок під час бігу.",
    behavior: "Гірські луки.",
    abilities: ["з’являється з іншого боку стежки й атакує копитами"],
  },
});
