Atlas.registerMonster({
  format: 2,
  id: "osa",
  name: "Оса",
  kind: "monster",
  nature: "magic",
  variants: ["гігантська оса", "оса-кам’янотворець"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 394,
  lore: {
    description: "Комаха. Об'єднує схожих істот: гігантська оса, оса-кам’янотворець.",
    behavior: "Зустрічається: ліси, скельні гнізда; гірські печери.",
    abilities: ["отруйне жало", "швидкі повітряні атаки", "обліплює цілі кам’янистими наростами"],
  },
});
