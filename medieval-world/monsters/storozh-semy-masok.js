Atlas.registerMonster({
  format: 2,
  id: "storozh-semy-masok",
  name: "Сторож семи масок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 467,
  lore: {
    description: "Істота, що змінює голову після кожного отриманого удару.",
    behavior: "Храм без облич.",
    abilities: ["кожна маска надає інший бойовий стиль і слабкість"],
  },
});
