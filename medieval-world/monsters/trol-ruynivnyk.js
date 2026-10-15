Atlas.registerMonster({
  format: 2,
  id: "trol-ruynivnyk",
  name: "Троль-руйнівник",
  kind: "mini-boss",
  nature: "threat",
  variants: ["печерний троль-руйнівник", "броньований троль"],
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 298,
  lore: {
    description: "Троль. Об'єднує схожих істот: печерний троль-руйнівник, броньований троль.",
    behavior: "Зустрічається: великі печери; гірські проходи.",
    abilities: ["важкі удари", "регенерація", "кам’яна броня", "удари кулаками"],
  },
});
