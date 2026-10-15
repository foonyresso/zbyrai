Atlas.registerMonster({
  format: 2,
  id: "voskovyy-pilihrym",
  name: "Восковий Пілігрим",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 881,
  lore: {
    description: "Тонка істота з багатошарового воску, із запаленим ґнотом у голові та довгими руками.",
    behavior: "Блукає в покинутих каплицях.",
    abilities: ["відкушує шматки власного тіла, створюючи тимчасові воскові фігурки, що блокують проходи, а після дощу швидко тане"],
  },
});
