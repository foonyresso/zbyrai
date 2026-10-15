Atlas.registerMonster({
  format: 2,
  id: "dribnokaminets",
  name: "Дрібнокамінець",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 830,
  lore: {
    description: "Маленька багатогранна істота з тонкими кришталевими ніжками та двома блискучими очима.",
    behavior: "Ховається на гірських стежках і мостах.",
    abilities: ["при небезпеці притискається до дороги, вдаючи звичайний камінь, а потім стрибає під ноги мандрівника"],
  },
});
