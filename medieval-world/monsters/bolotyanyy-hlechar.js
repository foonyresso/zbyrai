Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-hlechar",
  name: "Болотяний Глечар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 895,
  lore: {
    description: "Чотиринога істота з глиняним тулубом і порожнистими боками, схожими на глечики.",
    behavior: "Блукає серед глиняних курганів.",
    abilities: ["накопичує болотний газ і випускає його вузькими струменями, що штовхають гравця назад, не завдаючи значної шкоди"],
  },
});
