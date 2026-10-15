Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-usikh-vidlun",
  name: "Пожирач усіх відлунь",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 455,
  lore: {
    description: "Безликий велетень із дзеркальними ребрами.",
    behavior: "Долина, у якій не чути голосів.",
    abilities: ["краде звуки здібностей і відтворює їх у посиленій, викривленій формі"],
  },
});
