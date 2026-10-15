Atlas.registerMonster({
  format: 2,
  id: "snihovyy-rozbiynyk",
  name: "Сніговий розбійник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["tundra"], worlds: "all" },
  order: 360,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: тундра.",
    abilities: ["короткий лук", "снігові засідки"],
  },
});
