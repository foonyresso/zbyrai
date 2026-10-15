Atlas.registerMonster({
  format: 2,
  id: "vovk-iz-porozhnimy-rebramy",
  name: "Вовк із порожніми ребрами",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 506,
  lore: {
    description: "Довгоногий хижак, крізь тіло якого видно зоряне небо.",
    behavior: "Сутінкові перевали.",
    abilities: ["телепортується між клаптями нічної темряви"],
  },
});
