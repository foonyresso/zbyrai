Atlas.registerMonster({
  format: 2,
  id: "zhyvyy-vuzol",
  name: "Живий вузол",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 597,
  lore: {
    description: "Грудка коріння, мотузок і сухих гілок.",
    behavior: "Старі лісові дороги.",
    abilities: ["стрибає на ноги, зав’язується навколо них і сповільнює рух"],
  },
});
