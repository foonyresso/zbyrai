Atlas.registerMonster({
  format: 2,
  id: "korenevyy-hrebenyar",
  name: "Кореневий Гребеняр",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 879,
  lore: {
    description: "Низька істота з дерев'яним панциром, широкою спиною та рядами кореневих зубців.",
    behavior: "Мешкає у старих садах, де коріння підняло кам'яні доріжки.",
    abilities: ["заривається в ґрунт, залишаючи над поверхнею рухомий гребінь, який збиває гравця з ніг"],
  },
});
