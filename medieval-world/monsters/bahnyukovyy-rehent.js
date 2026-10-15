Atlas.registerMonster({
  format: 2,
  id: "bahnyukovyy-rehent",
  name: "Багнюковий Регент",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp", "wasteland", "hills", "lake"], worlds: "all" },
  order: 845,
  lore: {
    description: "Регіональний бос із десятків глиняних масок, зібраних у високу фігуру з шістьма ліктями.",
    behavior: "Править у затопленому палаці серед боліт із червоним очеретом.",
    abilities: ["змінює маски, набуваючи різних бойових стилів, а розбиті маски залишають на землі липкі глиняні поля"],
  },
});
