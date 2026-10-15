Atlas.registerMonster({
  format: 2,
  id: "hakokryl",
  name: "Гакокрил",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 766,
  lore: {
    description: "Хижий птах із вузьким тілом, залізним дзьобом, гачкуватими задніми лапами й перетинчастими крилами.",
    behavior: "Гніздиться у вежах на урвищах.",
    abilities: ["вихоплює щити та підвішує їх на виступах скель, позбавляючи ворога захисту"],
  },
});
