Atlas.registerMonster({
  format: 2,
  id: "nichnyy-kresalnyk",
  name: "Нічний Кресальник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "forest"], worlds: "all" },
  order: 801,
  lore: {
    description: "Лисоподібний звір із залізним зубом і крем’яними наростами на щоках.",
    behavior: "Виходить на полювання в сутінках вулканічних чагарників.",
    abilities: ["треться ними об землю, створюючи короткі віяла іскор, що займають сухе листя та відтинають переслідувачам шлях"],
  },
});
