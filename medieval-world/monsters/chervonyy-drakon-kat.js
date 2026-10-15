Atlas.registerMonster({
  format: 2,
  id: "chervonyy-drakon-kat",
  name: "Червоний дракон-кат",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 262,
  lore: {
    description: "Броньований дракон.",
    behavior: "Зустрічається: фортеця драконячого культу.",
    abilities: ["вогняні заряди", "хвостові удари", "бронебійне дихання"],
  },
});
