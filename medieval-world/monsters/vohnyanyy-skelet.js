Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-skelet",
  name: "Вогняний скелет",
  kind: "monster",
  nature: "magic",
  variants: ["вогняний скелет", "скелет-піроман"],
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 336,
  lore: {
    description: "Елітна нежить. Об'єднує схожих істот: вогняний скелет, скелет-піроман.",
    behavior: "Зустрічається: вулканічні склепи.",
    abilities: ["палаючі удари", "самозаймання після смерті", "кидає вогняні сфери"],
  },
});
