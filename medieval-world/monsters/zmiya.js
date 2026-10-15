Atlas.registerMonster({
  format: 2,
  id: "zmiya",
  name: "Змія",
  kind: "monster",
  nature: "threat",
  variants: ["гігантська лісова змія", "скельний удав"],
  spawn: { biomes: ["jungle", "forest", "mountain", "hills"], worlds: "all" },
  order: 379,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: гігантська лісова змія, скельний удав.",
    behavior: "Зустрічається: джунглі, хащі; ущелини, скелі.",
    abilities: ["укус", "обвивання", "камуфляж", "стискання"],
  },
});
