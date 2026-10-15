Atlas.registerMonster({
  format: 2,
  id: "meduza",
  name: "Медуза",
  kind: "monster",
  nature: "threat",
  variants: ["медуза-паралізатор", "мініатюрна медуза"],
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 416,
  lore: {
    description: "Морська істота. Об'єднує схожих істот: медуза-паралізатор, мініатюрна медуза.",
    behavior: "Зустрічається: теплі моря, підводні печери; мілководдя.",
    abilities: ["паралізувальні щупальця", "отруйна хмара", "слабке жалення щупальцями"],
  },
});
