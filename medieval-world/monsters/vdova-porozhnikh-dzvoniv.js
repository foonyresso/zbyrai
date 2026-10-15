Atlas.registerMonster({
  format: 2,
  id: "vdova-porozhnikh-dzvoniv",
  name: "Вдова порожніх дзвонів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 470,
  lore: {
    description: "Висока павукоподібна постать із металевими дзвонами замість черевця.",
    behavior: "Покинута дзвіниця в ущелині.",
    abilities: ["звукові хвилі відкидають, оглушують і руйнують магічні бар’єри"],
  },
});
