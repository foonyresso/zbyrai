Atlas.registerMonster({
  format: 2,
  id: "malyy-slyzen",
  name: "Малий слизень",
  kind: "weak",
  nature: "threat",
  variants: ["малий зелений слизень", "синій слизень", "малий грибний слизень"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 434,
  lore: {
    description: "Слизень. Об'єднує схожих істот: малий зелений слизень, синій слизень, малий грибний слизень.",
    behavior: "Зустрічається: луки, ліси; береги водойм; грибні галявини.",
    abilities: ["слабкий удар", "стрибки", "залишає слизький слід", "розкидає спори"],
  },
});
