Atlas.registerMonster({
  format: 2,
  id: "movchaznyy-volodar-porohiv",
  name: "Мовчазний володар порогів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 481,
  lore: {
    description: "Висока безрука істота з десятками дверей на спині.",
    behavior: "Замок нескінченних порогів.",
    abilities: ["відкриває короткочасні проходи, з яких атакують істоти з інших місць"],
  },
});
