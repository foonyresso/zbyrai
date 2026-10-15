Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-dzerkalnoho-neba",
  name: "Пожирач Дзеркального Неба",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 841,
  lore: {
    description: "Величезний плаский хижак із райдужних скляних пластин, що літає черевом догори.",
    behavior: "Кружляє над озерами, де вода віддзеркалює зорі навіть удень.",
    abilities: ["відбиває заклинання у випадкових напрямках і тимчасово копіює силует останнього супротивника, якого поглинув"],
  },
});
