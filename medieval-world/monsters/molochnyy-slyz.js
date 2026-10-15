Atlas.registerMonster({
  format: 2,
  id: "molochnyy-slyz",
  name: "Молочний слиз",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 572,
  lore: {
    description: "Біла напівпрозора істота, що ділиться на маленькі краплі після удару.",
    behavior: "Підземні джерела.",
    abilities: ["знову зливається, якщо краплі не розігнати"],
  },
});
