Atlas.registerMonster({
  format: 2,
  id: "lytsar-proklyatoho-kurhanu",
  name: "Лицар проклятого кургану",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "ashlands"], worlds: "all" },
  order: 299,
  lore: {
    description: "Неживий воїн.",
    behavior: "Зустрічається: кургани, склепи.",
    abilities: ["проклятий меч", "щитова хвиля"],
  },
});
