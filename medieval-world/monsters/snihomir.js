Atlas.registerMonster({
  format: 2,
  id: "snihomir",
  name: "Снігомір",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["peaks", "tundra"], worlds: "all" },
  order: 795,
  lore: {
    description: "Довгоноге хутряне створіння з білими вусиками-вимірювачами й коротким квадратним хвостом.",
    behavior: "Мешкає на морозних вересовищах.",
    abilities: ["визначає глибину снігу, ховається в заметах і вискакує під ногами того, хто ступає на нестійкий наст"],
  },
});
