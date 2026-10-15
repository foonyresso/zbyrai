Atlas.registerMonster({
  format: 2,
  id: "krykhtokryl",
  name: "Крихтокрил",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 900,
  lore: {
    description: "Маленька комаха з крильми з тонких кам'яних пластин і круглим тулубом із пісковику.",
    behavior: "Гніздиться в обвалених вежах.",
    abilities: ["облітає старі стіни, відколюючи крихти, а потім скидає їх на гравця з висоти"],
  },
});
