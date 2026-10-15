Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-vusach",
  name: "Кам'яний Вусач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 876,
  lore: {
    description: "Печерний звір із широким пласким черепом і двома довгими вусами з білого кварцу.",
    behavior: "Живе в темних тунелях під гірськими монастирями.",
    abilities: ["вловлює вібрації через вуса й атакує лише тоді, коли гравець рухається, зате не реагує на нерухомі цілі"],
  },
});
