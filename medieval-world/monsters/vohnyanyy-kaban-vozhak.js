Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-kaban-vozhak",
  name: "Вогняний кабан-вожак",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "ashlands"], worlds: "all" },
  order: 320,
  lore: {
    description: "Магічний звір.",
    behavior: "Зустрічається: попелясті ліси.",
    abilities: ["полум’яний таран", "розпечені ікла"],
  },
});
