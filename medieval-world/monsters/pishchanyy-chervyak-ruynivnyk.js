Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-chervyak-ruynivnyk",
  name: "Піщаний черв’як-руйнівник",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 296,
  lore: {
    description: "Підземний хижак.",
    behavior: "Зустрічається: великі пустелі.",
    abilities: ["засмоктує пісок", "створює провалля", "атакує з-під землі"],
  },
});
