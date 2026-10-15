Atlas.registerMonster({
  format: 2,
  id: "krykhitka-hromovoyi-hlyny",
  name: "Крихітка Громової Глини",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 897,
  lore: {
    description: "Маленька істота з блакитної глини, що має три короткі руки й голову у формі грозової хмари.",
    behavior: "Трапляється біля глиняних кар'єрів після бурі.",
    abilities: ["накопичує статичний заряд від руху по піску та випускає невеликі іскри, які активують металеві предмети"],
  },
});
