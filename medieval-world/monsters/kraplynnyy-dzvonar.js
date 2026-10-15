Atlas.registerMonster({
  format: 2,
  id: "kraplynnyy-dzvonar",
  name: "Краплинний Дзвонар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 874,
  lore: {
    description: "Прозора істота, що складається з десятків великих водяних крапель, з'єднаних тонкими струменями.",
    behavior: "Мешкає під стелями печер із підземними водоспадами.",
    abilities: ["розбивається на окремі краплі, ухиляючись від ударів, а потім знову збирається з іншого боку"],
  },
});
