Atlas.registerMonster({
  format: 2,
  id: "pastukh-popelyastykh-ovets",
  name: "Пастух попелястих овець",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "hills"], worlds: "all" },
  order: 491,
  lore: {
    description: "Темний гуманоїд із посохом, оточений клубами попелу.",
    behavior: "Попелясті луки вулканічного краю.",
    abilities: ["його стадо вибухає хмарами жаркого пилу"],
  },
});
