Atlas.registerMonster({
  format: 2,
  id: "kapelyushnyk-pereverten",
  name: "Капелюшник-перевертень",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 519,
  lore: {
    description: "Грибна істота з великим капелюхом, що нагадує камінь.",
    behavior: "Мохові скелі.",
    abilities: ["маскується серед валунів і викидає липкі спори"],
  },
});
