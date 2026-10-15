Atlas.registerMonster({
  format: 2,
  id: "matka-pidvodnykh-shpyliv",
  name: "Матка Підводних Шпилів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 739,
  lore: {
    description: "Багатотіла володарка рифів, складена з десятків зрощених коралових колон і величезного перлинного ядра.",
    behavior: "Ховається в западинах Рифового Собору.",
    abilities: ["вирощує просто під противником гострі шпилі та перегороджує морське дно кораловими стінами"],
  },
});
