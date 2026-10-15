Atlas.registerMonster({
  format: 2,
  id: "drimnyy-dzobyk",
  name: "Дрімний Дзьобик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 827,
  lore: {
    description: "Маленький круглий птах із пухнастим кубічним пір’ям і коротким м’яким дзьобом.",
    behavior: "Спить під капелюшками грибів у сутінкових садах.",
    abilities: ["у разі переляку видає заспокійливу трель, від якої втомлені істоти починають позіхати й на мить втрачають пильність"],
  },
});
