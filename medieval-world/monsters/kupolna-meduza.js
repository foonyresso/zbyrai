Atlas.registerMonster({
  format: 2,
  id: "kupolna-meduza",
  name: "Купольна медуза",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 708,
  lore: {
    description: "Маленька медуза з твердим напівпрозорим куполом.",
    behavior: "Теплі морські печери.",
    abilities: ["підстрибує у воді й лишає слабкі електричні розряди"],
  },
});
