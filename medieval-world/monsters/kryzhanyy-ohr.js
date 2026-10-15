Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-ohr",
  name: "Крижаний огр",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 335,
  lore: {
    description: "Елітний велетень.",
    behavior: "Зустрічається: льодовикові печери.",
    abilities: ["кидання льоду", "заморожувальні удари"],
  },
});
