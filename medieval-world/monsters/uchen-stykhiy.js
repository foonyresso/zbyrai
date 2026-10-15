Atlas.registerMonster({
  format: 2,
  id: "uchen-stykhiy",
  name: "Учень стихій",
  kind: "monster",
  nature: "magic",
  variants: ["вогняний послушник", "крижаний учень"],
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 365,
  lore: {
    description: "Звичайний маг. Об'єднує схожих істот: вогняний послушник, крижаний учень.",
    behavior: "Зустрічається: вулканічні руїни; засніжені табори.",
    abilities: ["вогняні кульки", "підпалювання", "крижані стріли", "сповільнення"],
  },
});
