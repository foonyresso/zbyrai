Atlas.registerMonster({
  format: 2,
  id: "malyy-vodyanyy-dukh",
  name: "Малий водяний дух",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 442,
  lore: {
    description: "Дух.",
    behavior: "Зустрічається: струмки, джерела.",
    abilities: ["створює бризки", "штовхає гравця"],
  },
});
