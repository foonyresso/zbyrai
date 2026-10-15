Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-kolos",
  name: "Грибний колос",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 282,
  lore: {
    description: "Грибний велетень.",
    behavior: "Зустрічається: підземні грибні ліси.",
    abilities: ["спори сну", "отруйні хмари", "вибухові гриби"],
  },
});
