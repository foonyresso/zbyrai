Atlas.registerMonster({
  format: 2,
  id: "kraplynnyy-khovach",
  name: "Краплинний ховач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 585,
  lore: {
    description: "Напівпрозорий водяний звір, що ховається в калюжах.",
    behavior: "Дощові низини.",
    abilities: ["стрибає в обличчя та тимчасово погіршує видимість"],
  },
});
