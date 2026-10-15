Atlas.registerMonster({
  format: 2,
  id: "koroleva-kamyanykh-harpiy",
  name: "Королева кам’яних гарпій",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 295,
  lore: {
    description: "Крилата істота.",
    behavior: "Зустрічається: гірські гнізда.",
    abilities: ["кам’яні пір’я", "повітряні вихори", "крик", "що дезорієнтує"],
  },
});
