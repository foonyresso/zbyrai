Atlas.registerMonster({
  format: 2,
  id: "koval-porozhnoho-neba",
  name: "Коваль порожнього неба",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "volcanic", "ashlands"], worlds: "all" },
  order: 451,
  lore: {
    description: "Шестирукий титан із розпечених мінералів.",
    behavior: "Небесна кузня над хмарами.",
    abilities: ["б’є по повітрю невидимим молотом, створюючи тріщини у просторі"],
  },
});
