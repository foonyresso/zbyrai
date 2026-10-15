Atlas.registerMonster({
  format: 2,
  id: "morska-holka",
  name: "Морська голка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 550,
  lore: {
    description: "Довга риба з надзвичайно гострим кістяним носом.",
    behavior: "Холодні прибережні течії.",
    abilities: ["стрімко пробиває воду й атакує з-під поверхні"],
  },
});
