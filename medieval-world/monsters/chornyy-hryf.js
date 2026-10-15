Atlas.registerMonster({
  format: 2,
  id: "chornyy-hryf",
  name: "Чорний гриф",
  kind: "monster",
  nature: "threat",
  variants: ["чорний гриф", "чорний гриф"],
  spawn: { biomes: ["grass", "desert", "wasteland", "ashlands"], worlds: "all" },
  order: 337,
  lore: {
    description: "Елітний падальник. Об'єднує схожих істот: чорний гриф, чорний гриф.",
    behavior: "Зустрічається: пустки, поля битв.",
    abilities: ["пікірування", "кігті", "розкидання отруйного пилу", "короткі повітряні атаки"],
  },
});
