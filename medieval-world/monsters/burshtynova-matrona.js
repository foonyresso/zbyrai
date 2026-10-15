Atlas.registerMonster({
  format: 2,
  id: "burshtynova-matrona",
  name: "Бурштинова Матрона",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 760,
  lore: {
    description: "Масивна істота з бурштиновим черевцем, хиткими членистими ногами та вкрапленими в тіло силуетами давніх тварин.",
    behavior: "Гніздиться в Смоляних заростях.",
    abilities: ["створює прозорі бурштинові перегородки, а розбиті перегородки випускають короткочасні примарні образи колишніх мешканців"],
  },
});
