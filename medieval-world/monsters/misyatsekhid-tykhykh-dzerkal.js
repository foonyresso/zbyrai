Atlas.registerMonster({
  format: 2,
  id: "misyatsekhid-tykhykh-dzerkal",
  name: "Місяцехід Тихих Дзеркал",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland", "grass"], worlds: "all" },
  order: 849,
  lore: {
    description: "Довгонога істота з білих кам'яних дисків замість суглобів і гладкої дзеркальної голови.",
    behavior: "Блукає руїнами обсерваторії на безповітряному магічному плато.",
    abilities: ["створює копії арени, які змінюють розташування справжніх платформ, змушуючи гравця орієнтуватися за рухом місяця"],
  },
});
