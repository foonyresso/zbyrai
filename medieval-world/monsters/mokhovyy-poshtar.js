Atlas.registerMonster({
  format: 2,
  id: "mokhovyy-poshtar",
  name: "Моховий Поштар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 886,
  lore: {
    description: "Кумедна двонога істота з великою головою, вкритою мохом, і сумкою з листя на спині.",
    behavior: "Мешкає на стежках між лісовими поселеннями.",
    abilities: ["краде дрібні предмети й переносить їх у випадкові схованки, а при переслідуванні кидає насіння, з якого миттєво виростають перешкоди"],
  },
});
