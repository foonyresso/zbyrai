Atlas.registerMonster({
  format: 2,
  id: "triskun-koralovykh-hilok",
  name: "Тріскун Коралових Гілок",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 870,
  lore: {
    description: "Невеликий крабоподібний монстр із рожевих коралових блоків та асиметричних клешень.",
    behavior: "Мешкає в мілководних рифах.",
    abilities: ["ламає підводні корали, щоб створювати гострі бар'єри, і відступає за них під час атаки"],
  },
});
