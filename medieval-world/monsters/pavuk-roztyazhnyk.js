Atlas.registerMonster({
  format: 2,
  id: "pavuk-roztyazhnyk",
  name: "Павук-розтяжник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 551,
  lore: {
    description: "Восьминогий хижак із довгими нитками-пастками.",
    behavior: "Лісові проходи.",
    abilities: ["натягує їх між деревами, а потім стягує здобич"],
  },
});
