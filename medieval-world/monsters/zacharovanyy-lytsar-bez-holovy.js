Atlas.registerMonster({
  format: 2,
  id: "zacharovanyy-lytsar-bez-holovy",
  name: "Зачарований лицар без голови",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 325,
  lore: {
    description: "Проклятий воїн.",
    behavior: "Зустрічається: старі дороги, руїни фортець.",
    abilities: ["удари довгим мечем", "темний туман", "кінний наскок"],
  },
});
