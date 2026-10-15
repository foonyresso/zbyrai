Atlas.registerMonster({
  format: 2,
  id: "pinnyy-krab",
  name: "Пінний краб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 699,
  lore: {
    description: "Невеликий краб із білою піною між клешнями.",
    behavior: "Прибійні береги.",
    abilities: ["кидає пінні грудки, які на короткий час закривають огляд"],
  },
});
