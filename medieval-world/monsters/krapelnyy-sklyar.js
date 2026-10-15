Atlas.registerMonster({
  format: 2,
  id: "krapelnyy-sklyar",
  name: "Крапельний Скляр",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 914,
  lore: {
    description: "Крихітна істота з прозорого скла, що має квадратне черевце й тонкі пальці.",
    behavior: "Мешкає в оранжереях з розбитими дахами.",
    abilities: ["збирає краплі води на поверхнях і перетворює їх на маленькі скляні кульки, якими жбурляється в гравця"],
  },
});
