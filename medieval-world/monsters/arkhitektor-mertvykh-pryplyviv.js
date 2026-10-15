Atlas.registerMonster({
  format: 2,
  id: "arkhitektor-mertvykh-pryplyviv",
  name: "Архітектор Мертвих Припливів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 839,
  lore: {
    description: "Багатокутний морський велетень із коралових стовпів, мушель і зеленуватих скляних пластин.",
    behavior: "Перебуває в затопленому місті під час найнижчого припливу.",
    abilities: ["перебудовує берег під час бою, відкриваючи провалля та створюючи тимчасові стіни з води"],
  },
});
