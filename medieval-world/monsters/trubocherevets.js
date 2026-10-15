Atlas.registerMonster({
  format: 2,
  id: "trubocherevets",
  name: "Трубочеревець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 782,
  lore: {
    description: "Кремезне створіння з бочкоподібним животом, з якого стирчать різні кістяні трубки.",
    behavior: "Ховається у вітрових печерах.",
    abilities: ["втягує дрібні предмети й випускає їх ударними звуковими імпульсами, добираючи висоту тону під тип перешкоди"],
  },
});
