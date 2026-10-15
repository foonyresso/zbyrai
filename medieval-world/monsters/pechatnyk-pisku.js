Atlas.registerMonster({
  format: 2,
  id: "pechatnyk-pisku",
  name: "Печатник піску",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 534,
  lore: {
    description: "Пласка ящірка з візерунками, схожими на воскові печатки.",
    behavior: "Піщані руїни.",
    abilities: ["залишає під землею магічні мітки, що вибухають при наступанні"],
  },
});
