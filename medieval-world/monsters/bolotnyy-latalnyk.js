Atlas.registerMonster({
  format: 2,
  id: "bolotnyy-latalnyk",
  name: "Болотний Латальник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 890,
  lore: {
    description: "Плаский земноводний монстр із темно-зеленою шкірою та чотирма ногами, розташованими по кутах тіла.",
    behavior: "Живе в болотах із чорними лататтями.",
    abilities: ["розтягує між ногами перетинки, утворюючи липку сітку над калюжами, а потім підтягує здобич до пащі"],
  },
});
