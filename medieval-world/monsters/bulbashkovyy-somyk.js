Atlas.registerMonster({
  format: 2,
  id: "bulbashkovyy-somyk",
  name: "Бульбашковий сомик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 682,
  lore: {
    description: "Кругла риба з прозорими мішками навколо голови.",
    behavior: "Теплі печерні водойми.",
    abilities: ["випускає бульбашки, які відштовхують ворогів"],
  },
});
