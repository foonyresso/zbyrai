Atlas.registerMonster({
  format: 2,
  id: "pavuk-reshitnyk",
  name: "Павук-решітник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 669,
  lore: {
    description: "Павук із широкими лапами, розташованими як прути решітки.",
    behavior: "Кам’яні вежі.",
    abilities: ["притискає ціль до стіни й перекриває втечу"],
  },
});
