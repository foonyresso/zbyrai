Atlas.registerMonster({
  format: 2,
  id: "voron-dzerkalnyk",
  name: "Ворон-Дзеркальник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 791,
  lore: {
    description: "Чорний ворон із дзеркальною грудною пластиною та квадратними очима.",
    behavior: "Гніздиться в руїнах скляних оранжерей.",
    abilities: ["накопичує сонячне світло в дзеркалі й випускає його тонким горизонтальним променем, після чого ховає голову під крило"],
  },
});
