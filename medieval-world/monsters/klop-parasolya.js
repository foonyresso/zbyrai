Atlas.registerMonster({
  format: 2,
  id: "klop-parasolya",
  name: "Клоп-Парасоля",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 811,
  lore: {
    description: "Пласка комаха з шістьма шарнірними ногами та панциром, що складається в круглу парасолю.",
    behavior: "Ховається на великих соняшникових полях.",
    abilities: ["під час небезпеки перевертає панцир і відбиває сонячне світло в очі нападнику"],
  },
});
