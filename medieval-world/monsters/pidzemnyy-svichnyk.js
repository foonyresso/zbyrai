Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-svichnyk",
  name: "Підземний свічник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 516,
  lore: {
    description: "Істота з панциром, схожим на металеву люстру.",
    behavior: "Катакомби старих палаців.",
    abilities: ["розкидає гарячі краплі воску, які застигають у пастки"],
  },
});
