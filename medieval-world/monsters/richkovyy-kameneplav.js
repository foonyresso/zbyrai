Atlas.registerMonster({
  format: 2,
  id: "richkovyy-kameneplav",
  name: "Річковий каменеплав",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 707,
  lore: {
    description: "Витягнута риба з плоскими плавниками.",
    behavior: "Порожисті річки.",
    abilities: ["втискається між галькою й пересуває каміння, змінюючи течію"],
  },
});
