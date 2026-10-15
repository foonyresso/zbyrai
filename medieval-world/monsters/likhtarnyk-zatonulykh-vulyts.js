Atlas.registerMonster({
  format: 2,
  id: "likhtarnyk-zatonulykh-vulyts",
  name: "Ліхтарник затонулих вулиць",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 483,
  lore: {
    description: "Рибоподібна істота з ліхтарем у грудях.",
    behavior: "Затоплене місто.",
    abilities: ["світло приманює гравця в засідки під водою"],
  },
});
