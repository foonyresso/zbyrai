Atlas.registerMonster({
  format: 2,
  id: "pidpilnyy-luskar",
  name: "Підпільний Лускар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "steppe"], worlds: "all" },
  order: 887,
  lore: {
    description: "Довгий червоподібний звір із шаруватими глиняними лусками та широкою головою-лопатою.",
    behavior: "Мешкає під кам'янистими степами.",
    abilities: ["риє тунелі просто під ногами, змушуючи блоки провалюватися, а сам з'являється лише на мить, щоб захопити здобич"],
  },
});
