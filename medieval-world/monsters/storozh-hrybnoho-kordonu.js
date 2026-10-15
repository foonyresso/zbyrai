Atlas.registerMonster({
  format: 2,
  id: "storozh-hrybnoho-kordonu",
  name: "Сторож грибного кордону",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 496,
  lore: {
    description: "Кремезний монстр із грибними щитами на спині.",
    behavior: "Грибні прикордонні ліси.",
    abilities: ["випускає хмари спор, які створюють примарні копії місцевості"],
  },
});
