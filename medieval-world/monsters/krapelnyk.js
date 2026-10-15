Atlas.registerMonster({
  format: 2,
  id: "krapelnyk",
  name: "Крапельник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 822,
  lore: {
    description: "Водяна істота з глиняним ядром, навколо якого зависають три десятки окремих крапель.",
    behavior: "Мешкає у затоплених акведуках.",
    abilities: ["підстрибує до стелі, розсипає краплі зверху й відновлює тіло в дощі"],
  },
});
