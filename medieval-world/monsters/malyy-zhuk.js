Atlas.registerMonster({
  format: 2,
  id: "malyy-zhuk",
  name: "Малий жук",
  kind: "weak",
  nature: "threat",
  variants: ["малий вогняний жук", "малий крижаний жук"],
  spawn: { biomes: ["mountain", "hills", "snow"], worlds: "all" },
  order: 439,
  lore: {
    description: "Комаха. Об'єднує схожих істот: малий вогняний жук, малий крижаний жук.",
    behavior: "Зустрічається: теплі печери; засніжені ділянки.",
    abilities: ["слабкий опік при контакті", "короткочасно сповільнює холодом"],
  },
});
