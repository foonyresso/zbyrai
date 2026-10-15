Atlas.registerMonster({
  format: 2,
  id: "vitrylnyy-krab",
  name: "Вітрильний Краб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 816,
  lore: {
    description: "Прибережний краб із високим панциром-вітрилом, тонкими боковими лапами й піщаними клешнями.",
    behavior: "Живе на припливних мілинах.",
    abilities: ["ловить боковий вітер і блискавично ковзає вздовж берега, засипаючи ворога піском"],
  },
});
