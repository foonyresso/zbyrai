Atlas.registerMonster({
  format: 2,
  id: "zhornovyy-kaban",
  name: "Жорновий кабан",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 488,
  lore: {
    description: "Дикий звір із кам’яними колесами замість плечей.",
    behavior: "Гірські каменярні.",
    abilities: ["розганяється по схилах і дробить усе на своєму шляху"],
  },
});
