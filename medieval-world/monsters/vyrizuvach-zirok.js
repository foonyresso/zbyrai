Atlas.registerMonster({
  format: 2,
  id: "vyrizuvach-zirok",
  name: "Вирізувач Зірок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 754,
  lore: {
    description: "Величезна небесна істота з крильми-ножицями, плащем із темно-синього полотна й довгими пальцями-голками.",
    behavior: "Мешкає на вершині Покинутої обсерваторії.",
    abilities: ["відтинає від сузір’їв світні фрагменти, які падають на арену як розпечені зоряні уламки"],
  },
});
