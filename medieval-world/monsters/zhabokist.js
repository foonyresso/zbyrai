Atlas.registerMonster({
  format: 2,
  id: "zhabokist",
  name: "Жабокіст",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 523,
  lore: {
    description: "Болотяний амфібій із білими кістяними пластинами.",
    behavior: "Затоплені руїни.",
    abilities: ["плюється густою слиною, що склеює ноги"],
  },
});
