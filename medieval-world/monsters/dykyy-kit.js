Atlas.registerMonster({
  format: 2,
  id: "dykyy-kit",
  name: "Дикий кіт",
  kind: "monster",
  nature: "threat",
  variants: ["лісова рись", "плямиста печерна пантера", "сніговий барс"],
  spawn: { biomes: ["forest", "taiga", "jungle", "mountain"], worlds: "all" },
  order: 371,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: лісова рись, плямиста печерна пантера, сніговий барс.",
    behavior: "Зустрічається: густі ліси; джунглі, печери; високогір’я.",
    abilities: ["стрибки", "засідки", "маскування", "швидкі серії атак", "маскування на снігу", "стрибки згори"],
  },
});
