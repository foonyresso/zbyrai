Atlas.registerMonster({
  format: 2,
  id: "korenevyy-chervyak",
  name: "Кореневий черв’як",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 405,
  lore: {
    description: "Підземна істота.",
    behavior: "Зустрічається: ліси, поля.",
    abilities: ["розриває ґрунт", "підкидає землю"],
  },
});
